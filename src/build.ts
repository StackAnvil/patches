import { copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { createHash } from "node:crypto";
import { constants, existsSync } from "node:fs";
import { homedir } from "node:os";
import { Effect, Schema } from "effect";
import { parseJson, encodeIndentedJson, required } from "./guards.ts";
import { buildOrder } from "./dependencies.ts";
import { getTarget, getTargets, listArtifacts, root, type Target } from "./model.ts";
import { command } from "./process.ts";
import { StackError, sync } from "./stack.ts";
import { prepareViaFabricPlus } from "./viafabricplus.ts";
import { installLibDataChannel, readLibDataChannelPin } from "./libdatachannel.ts";
import { verifyBuiltinUi, verifyEmbeddedBuiltinUi, builtinUiResource } from "./bedrock-ui.ts";
import {
  builtinOreUiResource,
  verifyBuiltinOreUi,
  verifyEmbeddedBuiltinOreUi,
} from "./bedrock-oreui.ts";
import {
  prepareSharedAddOnAssets,
  verifyBuiltinAssets,
  verifyEmbeddedBuiltinAssets,
  builtinAssetsResource,
} from "./bedrock-assets.ts";

import { prepareBuiltinImages, verifyEmbeddedBuiltinImages } from "./bedrock-images.ts";
import {
  oreUiShaperDirectory,
  prepareOreUiShaper,
  verifyEmbeddedOreUiShaper,
} from "./oreui-shaper.ts";
import { print } from "./output.ts";
import { companionProject } from "./client-artifacts.ts";

interface Coordinates {
  group: string;
  artifact: string;
  version: string;
}

const localRepo = join(root, ".stackanvil", "maven");

const BedrockAssetsSchema = Schema.Struct({ version: Schema.String });

const builtinImagesPath = (repository: string, version: string) =>
  join(repository, ".stackanvil", "builtin-images", version, "builtin_images.zip");
const sharedAddOnAssetsPath = (repository: string, version: string) =>
  join(repository, ".stackanvil", "addon-assets", version);

/**
 * Resource arguments for a target build. A full-stack add-on build shares the core UI and images
 * with its nested ViaBedrock JAR. A PR build keeps the self-contained library, because upstream
 * ViaBedrock does not carry those bundles.
 */
export async function builtinAssetArguments(
  id: string,
  repository = root,
  { shareCoreResources = false } = {},
): Promise<string[]> {
  if (id !== "viafabricplus-bedrock" && id !== "viabedrock") return [];
  const { version } = parseJson(
    BedrockAssetsSchema,
    await readFile(join(repository, "bedrock-assets.json"), "utf8"),
  );
  if (!/^\d+\.\d+\.\d+\.\d+$/u.test(version))
    throw new Error("Invalid bundled Bedrock asset version");
  const directory = join(repository, "assets", "bedrock", version);
  if (id === "viabedrock") {
    const bundle = join(directory, "assets", "viabedrock", "builtin_ui.zip");
    if (!existsSync(bundle)) throw new Error(`Bundled Bedrock UI is missing for ${version}`);
    const path = await verifyBuiltinUi(bundle, version);
    const images = await prepareBuiltinImages(
      join(directory, builtinAssetsResource),
      version,
      builtinImagesPath(repository, version),
    );
    return [`-PbedrockBuiltinUi=${path}`, `-PbedrockBuiltinImages=${images}`];
  }
  await verifyBuiltinAssets(join(directory, builtinAssetsResource), version);
  await verifyBuiltinOreUi(join(directory, builtinOreUiResource), version);
  if (!shareCoreResources) return [`-PbedrockBuiltinAssets=${directory}`];
  const images = await prepareBuiltinImages(
    join(directory, builtinAssetsResource),
    version,
    builtinImagesPath(repository, version),
  );
  const shared = await prepareSharedAddOnAssets(
    directory,
    version,
    images,
    sharedAddOnAssetsPath(repository, version),
  );
  return [`-PbedrockBuiltinAssets=${shared}`];
}

/** Read the major version from a JDK home's release file. */
async function jdkVersion(home: string): Promise<string | undefined> {
  if (!existsSync(join(home, "bin", "java"))) return undefined;
  const release = await readFile(join(home, "release"), "utf8").catch(() => "");
  // Java 8 reports 1.8.0_x; later releases start with their major version.
  return /^JAVA_VERSION="(?:1\.)?(\d+)/mu.exec(release)?.[1];
}

async function javaHome(version: string): Promise<string> {
  for (const variable of [`STACKANVIL_JAVA_${version}`, `JAVA_HOME_${version}_X64`]) {
    const path = process.env[variable];
    if (!path) continue;
    const found = await jdkVersion(path);
    if (found !== version)
      throw new Error(
        `${variable} must name a Java ${version} JDK home, but ${path} ${found ? `is Java ${found}` : "is not a JDK home with bin/java and a release file"}.`,
      );
    return path;
  }
  const candidates = [join("/usr/lib/jvm", `java-${version}-openjdk`)];
  const gradleJdks = join(homedir(), ".gradle", "jdks");
  if (existsSync(gradleJdks)) {
    for (const entry of await readdir(gradleJdks)) {
      if (entry.includes(`-${version}-`)) candidates.push(join(gradleJdks, entry));
    }
  }
  const host = process.env["JAVA_HOME"];
  if (host) candidates.push(host);
  for (const candidate of candidates) {
    if ((await jdkVersion(candidate)) === version) return candidate;
  }
  throw new Error(`Java ${version} is missing. Set STACKANVIL_JAVA_${version} to a JDK home.`);
}

export async function buildEnvironment(version: string): Promise<NodeJS.ProcessEnv> {
  const jdk = await javaHome(version);
  return {
    ...process.env,
    JAVA_HOME: jdk,
    PATH: `${join(jdk, "bin")}:${process.env["PATH"] ?? ""}`,
  };
}

interface BuildInputs {
  target: Target;
  environment: NodeJS.ProcessEnv;
  assetArguments: string[];
}

/**
 * Check every JDK and bundled resource before the first Gradle build, so a missing add-on input
 * cannot fail after the earlier targets have built. Report every problem at once.
 */
export async function prepareBuildInputs(
  order: readonly string[],
  targets: Record<string, Target>,
  repository = root,
): Promise<Map<string, BuildInputs>> {
  const inputs = new Map<string, BuildInputs>();
  const problems = new Set<string>();
  const report = (error: unknown) => {
    problems.add(error instanceof Error ? error.message : String(error));
    return undefined;
  };
  // Check targets one at a time because the bundled asset checks read large archives.
  for (const id of order) {
    const target = required(targets[id], `The ${id} target`);
    const environment = await buildEnvironment(target.java).catch(report);
    // Only the add-on's setup patch embeds the shaper, so PR builds do not need it.
    // A local build compiles a missing host engine before the slower asset checks.
    const shaperArguments = await prepareOreUiShaper(
      id,
      oreUiShaperDirectory(repository),
      repository,
    ).catch(report);
    const assetArguments = await builtinAssetArguments(id, repository, {
      shareCoreResources: true,
    }).catch(report);
    if (environment && shaperArguments && assetArguments)
      inputs.set(id, {
        target,
        environment,
        assetArguments: [...assetArguments, ...shaperArguments],
      });
  }
  if (problems.size > 0)
    throw new Error(
      ["Build inputs are not ready:", ...[...problems].map((problem) => `- ${problem}`)].join("\n"),
    );
  return inputs;
}

function pomValue(pom: string, tag: string): string {
  const value = new RegExp(`<${tag}>([^<]+)</${tag}>`, "u").exec(pom)?.[1];
  if (!value) throw new Error(`Generated POM has no ${tag}`);
  return value;
}

function coordinates(pom: string): Coordinates {
  return {
    group: pomValue(pom, "groupId"),
    artifact: pomValue(pom, "artifactId"),
    version: pomValue(pom, "version"),
  };
}

function artifactProjectDirectory(dir: string, project?: string): string {
  if (!project) return dir;
  if (!/^:[a-zA-Z0-9_-]+(?::[a-zA-Z0-9_-]+)*$/u.test(project)) {
    throw new Error(`Invalid Gradle artifact project: ${project}`);
  }
  return join(dir, ...project.slice(1).split(":"));
}

export async function readBuildArtifact(
  dir: string,
  target: Pick<Target, "publication" | "artifactProject">,
) {
  const directory = artifactProjectDirectory(dir, target.artifactProject);
  const artifacts = await listArtifacts(directory);
  const [artifact] = artifacts;
  if (artifact === undefined || artifacts.length !== 1) {
    throw new Error(`Expected one distributable JAR in ${directory}, found ${artifacts.length}`);
  }
  const publication = target.publication.charAt(0).toLowerCase() + target.publication.slice(1);
  const pom = await readFile(
    join(directory, "build", "publications", publication, "pom-default.xml"),
    "utf8",
  );
  return { artifact, pom, coordinate: coordinates(pom) };
}

async function publishLocal(artifact: string, pom: string, coordinate: Coordinates): Promise<void> {
  const directory = join(
    localRepo,
    ...coordinate.group.split("."),
    coordinate.artifact,
    coordinate.version,
  );
  await mkdir(directory, { recursive: true });
  const stem = `${coordinate.artifact}-${coordinate.version}`;
  await copyFile(artifact, join(directory, `${stem}.jar`), constants.COPYFILE_FICLONE);
  await writeFile(join(directory, `${stem}.pom`), pom);
}

const buildOne = Effect.fn("buildOne")(function* (
  id: string,
  { target, environment, assetArguments }: BuildInputs,
  built: Map<string, Coordinates>,
  libDataChannelVersion?: string,
) {
  const dir = yield* sync(id);
  artifactProjectDirectory(dir, target.artifactProject);
  const viaFabricPlusVersion =
    id === "viafabricplus-bedrock" ? built.get("viafabricplus")?.version : undefined;
  if (id === "viafabricplus-bedrock" && !viaFabricPlusVersion) {
    return yield* StackError.make({
      message: "The Bedrock add-on needs a pinned ViaFabricPlus artifact",
    });
  }
  yield* command(
    "bash",
    [
      "./gradlew",
      "--no-daemon",
      "--stacktrace",
      `-PstackanvilMavenRepo=${localRepo}`,
      ...(viaFabricPlusVersion ? [`-PstackanvilViaFabricPlusVersion=${viaFabricPlusVersion}`] : []),
      ...(libDataChannelVersion
        ? [`-PstackanvilLibDataChannelVersion=${libDataChannelVersion}`]
        : []),
      ...assetArguments,
      "clean",
      target.buildTask,
      `${target.artifactProject ?? ""}:generatePomFileFor${target.publication}Publication`,
    ],
    dir,
    environment,
  );
  const { artifact, pom, coordinate } = yield* Effect.promise(() => readBuildArtifact(dir, target));
  if (["viabedrock", "viafabricplus-bedrock", "viaproxy"].includes(id)) {
    const assetsText = yield* Effect.promise(() =>
      readFile(join(root, "bedrock-assets.json"), "utf8"),
    );
    const { version } = parseJson(BedrockAssetsSchema, assetsText);
    yield* Effect.promise(() =>
      verifyEmbeddedBuiltinUi(
        artifact,
        id,
        join(root, "assets", "bedrock", version, builtinUiResource),
        version,
      ),
    );
    yield* Effect.promise(() =>
      verifyEmbeddedBuiltinImages(artifact, id, builtinImagesPath(root, version)),
    );
    if (id === "viafabricplus-bedrock") {
      yield* Effect.promise(() => verifyEmbeddedOreUiShaper(artifact, oreUiShaperDirectory()));
      yield* Effect.promise(() =>
        verifyEmbeddedBuiltinOreUi(
          artifact,
          join(root, "assets", "bedrock", version, builtinOreUiResource),
          version,
        ),
      );
      yield* Effect.promise(() =>
        verifyEmbeddedBuiltinAssets(
          artifact,
          join(sharedAddOnAssetsPath(root, version), builtinAssetsResource),
          version,
        ),
      );
    }
  }
  const name = basename(artifact);
  if (!name.endsWith("-StackAnvil.jar")) {
    return yield* StackError.make({
      message: `Branding patch did not suffix ${name} with -StackAnvil.jar`,
    });
  }
  const output = join(root, "dist", id);
  yield* Effect.promise(() => rm(output, { recursive: true, force: true }));
  yield* Effect.promise(() => mkdir(output, { recursive: true }));
  yield* Effect.promise(() => copyFile(artifact, join(output, name), constants.COPYFILE_FICLONE));
  yield* Effect.promise(() => writeFile(join(output, "pom.xml"), pom));
  yield* Effect.promise(() => publishLocal(artifact, pom, coordinate));
  const bytes = yield* Effect.promise(() => Bun.file(artifact).arrayBuffer());
  const manifest = {
    target: id,
    upstream: target.upstream,
    baseSha: target.baseSha,
    coordinates: `${coordinate.group}:${coordinate.artifact}:${coordinate.version}`,
    dependencies: [
      ...target.dependsOn,
      ...(id === "viafabricplus-bedrock" ? ["viafabricplus"] : []),
    ].map((dependency) => ({ target: dependency, coordinates: built.get(dependency) })),
    artifacts: [
      { file: name, sha256: createHash("sha256").update(Buffer.from(bytes)).digest("hex") },
    ],
    auxiliaryArtifacts: [],
  };
  yield* Effect.promise(() =>
    writeFile(join(output, "manifest.json"), `${encodeIndentedJson(manifest)}\n`),
  );
  built.set(id, coordinate);
  return output;
});

/**
 * Builds the StackAnvil-owned Foundry companion mod after the add-on. It is repository source, not a patch target, and
 * compiles against the ViaFabricPlus and ViaBedrock builds from the same run.
 */
const buildCompanion = Effect.fn("buildCompanion")(function* (built: Map<string, Coordinates>) {
  const viaFabricPlus = built.get("viafabricplus");
  const viaBedrock = built.get("viabedrock");
  if (!viaFabricPlus || !viaBedrock)
    return yield* StackError.make({
      message: "The Foundry companion needs this run's ViaFabricPlus and ViaBedrock artifacts",
    });
  const directory = join(root, "mods", companionProject);
  const environment = yield* Effect.promise(() => buildEnvironment("25"));
  yield* command(
    "bash",
    [
      "./gradlew",
      "--no-daemon",
      "--stacktrace",
      `-PstackanvilMavenRepo=${localRepo}`,
      `-PstackanvilViaFabricPlusVersion=${viaFabricPlus.version}`,
      `-PstackanvilViaBedrockVersion=${viaBedrock.version}`,
      "clean",
      "build",
    ],
    directory,
    environment,
  );
  const libs = join(directory, "build", "libs");
  const jars = (yield* Effect.promise(() => readdir(libs))).filter(
    (file) => file.endsWith(".jar") && !file.endsWith("-sources.jar"),
  );
  const [name] = jars;
  if (name === undefined || jars.length !== 1)
    return yield* StackError.make({
      message: `Expected one Foundry companion JAR in ${libs}, found ${jars.length}`,
    });
  const output = join(root, "dist", companionProject);
  yield* Effect.promise(() => rm(output, { recursive: true, force: true }));
  yield* Effect.promise(() => mkdir(output, { recursive: true }));
  yield* Effect.promise(() =>
    copyFile(join(libs, name), join(output, name), constants.COPYFILE_FICLONE),
  );
  const bytes = yield* Effect.promise(() => Bun.file(join(output, name)).arrayBuffer());
  const manifest = {
    target: companionProject,
    source: `mods/${companionProject}`,
    dependencies: [
      { target: "viafabricplus", coordinates: viaFabricPlus },
      { target: "viabedrock", coordinates: viaBedrock },
    ],
    artifacts: [
      { file: name, sha256: createHash("sha256").update(Buffer.from(bytes)).digest("hex") },
    ],
  };
  yield* Effect.promise(() =>
    writeFile(join(output, "manifest.json"), `${encodeIndentedJson(manifest)}\n`),
  );
  return output;
});

export const build = Effect.fn("build")(function* (id: string) {
  const targets = id === "viafabricplus" ? undefined : yield* Effect.promise(() => getTargets());
  const order = targets === undefined ? [] : buildOrder(targets, id);
  if (order.length > 0) print("Checking JDKs and bundled resources");
  const inputs = yield* Effect.promise(() => prepareBuildInputs(order, targets ?? {}));
  yield* Effect.promise(() => rm(localRepo, { recursive: true, force: true }));
  const built = new Map<string, Coordinates>();
  const includeViaFabricPlus = id === "viafabricplus" || order.includes("viafabricplus-bedrock");
  if (includeViaFabricPlus) {
    print("Fetching pinned ViaFabricPlus Jenkins build");
    const { pin } = yield* Effect.promise(() => prepareViaFabricPlus());
    built.set("viafabricplus", {
      group: "com.viaversion",
      artifact: "viafabricplus",
      version: pin.version,
    });
  }
  // The NetherNet natives come from the pinned release of the StackAnvil libdatachannel-java fork
  let libDataChannelVersion: string | undefined;
  if (order.includes("viaproxy") || order.includes("viafabricplus-bedrock")) {
    print("Fetching pinned libdatachannel-java release");
    const pin = yield* Effect.promise(() => readLibDataChannelPin());
    yield* Effect.promise(() => installLibDataChannel(localRepo, pin));
    libDataChannelVersion = pin.version;
  }
  for (const [index, [target, input]] of [...inputs].entries()) {
    print(`Building ${target} (${index + 1}/${inputs.size})`);
    yield* buildOne(target, input, built, libDataChannelVersion);
  }
  const includeCompanion = order.includes("viafabricplus-bedrock");
  if (includeCompanion) {
    print(`Building ${companionProject}`);
    yield* buildCompanion(built);
  }
  return [
    ...(includeViaFabricPlus ? ["viafabricplus"] : []),
    ...order,
    ...(includeCompanion ? [companionProject] : []),
  ]
    .map((target) => join(root, "dist", target))
    .join("\n");
});

export const buildPr = Effect.fn("buildPr")(function* (id: string, patchFile?: string) {
  const target = yield* Effect.promise(() => getTarget(id));
  const builtinAssets = yield* Effect.promise(() => builtinAssetArguments(id));
  const environment = yield* Effect.promise(() => buildEnvironment(target.java));
  const dir = yield* sync(id, "pr", patchFile);
  yield* command(
    "bash",
    ["./gradlew", "--no-daemon", "--stacktrace", ...builtinAssets, "clean", target.buildTask],
    dir,
    environment,
  );
  const artifacts = yield* Effect.promise(() =>
    listArtifacts(artifactProjectDirectory(dir, target.artifactProject)),
  );
  if (artifacts.length === 0)
    return yield* StackError.make({ message: `No PR JAR artifacts found for ${id}` });
  const output = patchFile
    ? join(root, "dist", "pr", id, patchFile.replace(/\.patch$/u, ""))
    : join(root, "dist", "pr", id);
  yield* Effect.promise(() => rm(output, { recursive: true, force: true }));
  yield* Effect.promise(() => mkdir(output, { recursive: true }));
  for (const artifact of artifacts)
    yield* Effect.promise(() =>
      copyFile(artifact, join(output, basename(artifact)), constants.COPYFILE_FICLONE),
    );
  const commit = yield* command("git", ["rev-parse", "HEAD"], dir);
  yield* Effect.promise(() =>
    writeFile(
      join(output, "manifest.json"),
      `${encodeIndentedJson({ target: id, upstream: target.upstream, baseSha: target.baseSha, featureCommit: commit })}\n`,
    ),
  );
  return output;
});
