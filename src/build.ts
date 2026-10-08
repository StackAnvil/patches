import { copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { Effect } from "effect";
import { buildOrder } from "./dependencies.ts";
import { getTarget, getTargets, listArtifacts, root } from "./model.ts";
import { command } from "./process.ts";
import { sync } from "./stack.ts";
import { prepareViaFabricPlus } from "./viafabricplus.ts";
import { verifyBuiltinUi, verifyEmbeddedBuiltinUi, builtinUiResource } from "./bedrock-ui.ts";

interface Coordinates { group: string; artifact: string; version: string }

const localRepo = join(root, ".stackanvil", "maven");

export async function builtinAssetArguments(id: string, repository = root): Promise<string[]> {
  if (id !== "viafabricplus-bedrock" && id !== "viabedrock") return [];
  const { version } = JSON.parse(await readFile(join(repository, "bedrock-assets.json"), "utf8")) as { version: string };
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(version)) throw new Error("Invalid bundled Bedrock asset version");
  const directory = join(repository, "assets", "bedrock", version);
  if (id === "viabedrock") {
    const bundle = join(directory, "assets", "viabedrock", "builtin_ui.zip");
    if (!existsSync(bundle)) throw new Error(`Bundled Bedrock UI is missing for ${version}`);
    const path = await verifyBuiltinUi(bundle, version);
    return [`-PbedrockBuiltinUi=${path}`];
  }
  if (!existsSync(join(directory, "assets", "viafabricplus-bedrock", "builtin", "manifest.json"))) {
    throw new Error(`Bundled Bedrock assets are missing for ${version}`);
  }
  return [`-PbedrockBuiltinAssets=${directory}`];
}

async function javaHome(version: string): Promise<string> {
  const explicit = process.env[`STACKANVIL_JAVA_${version}`] ?? process.env[`JAVA_HOME_${version}_X64`];
  const candidates = [explicit, join("/usr/lib/jvm", `java-${version}-openjdk`)];
  const gradleJdks = join(homedir(), ".gradle", "jdks");
  if (existsSync(gradleJdks)) {
    for (const entry of await readdir(gradleJdks)) {
      if (entry.includes(`-${version}-`)) candidates.push(join(gradleJdks, entry));
    }
  }
  if (version === "25") candidates.push(process.env.JAVA_HOME);
  const selected = candidates.find((path) => path && existsSync(join(path, "bin", "java")));
  if (!selected) throw new Error(`Java ${version} is missing. Set STACKANVIL_JAVA_${version} to a JDK home.`);
  return selected;
}

function pomValue(pom: string, tag: string): string {
  const value = new RegExp(`<${tag}>([^<]+)</${tag}>`).exec(pom)?.[1];
  if (!value) throw new Error(`Generated POM has no ${tag}`);
  return value;
}

function coordinates(pom: string): Coordinates {
  return { group: pomValue(pom, "groupId"), artifact: pomValue(pom, "artifactId"), version: pomValue(pom, "version") };
}

async function publishLocal(artifact: string, pom: string, coordinate: Coordinates): Promise<void> {
  const directory = join(localRepo, ...coordinate.group.split("."), coordinate.artifact, coordinate.version);
  await mkdir(directory, { recursive: true });
  const stem = `${coordinate.artifact}-${coordinate.version}`;
  await copyFile(artifact, join(directory, `${stem}.jar`));
  await writeFile(join(directory, `${stem}.pom`), pom);
}

const buildOne = Effect.fn("buildOne")(function* (id: string, built: Map<string, Coordinates>) {
  const target = yield* Effect.promise(() => getTarget(id));
  const dir = yield* sync(id);
  const jdk = yield* Effect.promise(() => javaHome(target.java));
  const builtinAssets = yield* Effect.promise(() => builtinAssetArguments(id));
  const viaFabricPlusVersion = id === "viafabricplus-bedrock" ? built.get("viafabricplus")?.version : undefined;
  if (id === "viafabricplus-bedrock" && !viaFabricPlusVersion) {
    return yield* Effect.fail(new Error("The Bedrock add-on needs a pinned ViaFabricPlus artifact"));
  }
  yield* command("bash", ["./gradlew", "--no-daemon", "--stacktrace", `-PstackanvilMavenRepo=${localRepo}`,
    ...(viaFabricPlusVersion ? [`-PstackanvilViaFabricPlusVersion=${viaFabricPlusVersion}`] : []), ...builtinAssets, "clean", target.buildTask,
    `generatePomFileFor${target.publication}Publication`], dir,
    { ...process.env, JAVA_HOME: jdk, PATH: `${join(jdk, "bin")}:${process.env.PATH ?? ""}` });
  const artifacts = yield* Effect.promise(() => listArtifacts(dir));
  if (artifacts.length !== 1) return yield* Effect.fail(new Error(`Expected one distributable JAR for ${id}, found ${artifacts.length}`));
  const artifact = artifacts[0]!;
  if (["viabedrock", "viafabricplus-bedrock", "viaproxy"].includes(id)) {
    const { version } = JSON.parse(yield* Effect.promise(() => readFile(join(root, "bedrock-assets.json"), "utf8"))) as { version: string };
    yield* Effect.promise(() => verifyEmbeddedBuiltinUi(artifact, id, join(root, "assets", "bedrock", version, builtinUiResource), version));
  }
  const name = basename(artifact);
  if (!name.endsWith("-StackAnvil.jar")) {
    return yield* Effect.fail(new Error(`Branding patch did not suffix ${name} with -StackAnvil.jar`));
  }
  const publications = yield* Effect.promise(() => readdir(join(dir, "build", "publications"), { withFileTypes: true }));
  const pomCandidates = publications.filter((entry) => entry.isDirectory())
    .map((entry) => join(dir, "build", "publications", entry.name, "pom-default.xml"));
  const pom = yield* Effect.promise(async () => {
    for (const path of pomCandidates) {
      const text = await Bun.file(path).text();
      if (text) return text;
    }
    throw new Error(`No generated Maven POM found for ${id}`);
  });
  const coordinate = coordinates(pom);
  const output = join(root, "dist", id);
  yield* Effect.promise(() => rm(output, { recursive: true, force: true }));
  yield* Effect.promise(() => mkdir(output, { recursive: true }));
  yield* Effect.promise(() => copyFile(artifact, join(output, name)));
  yield* Effect.promise(() => writeFile(join(output, "pom.xml"), pom));
  yield* Effect.promise(() => publishLocal(artifact, pom, coordinate));
  const bytes = yield* Effect.promise(() => Bun.file(artifact).arrayBuffer());
  const manifest = {
    target: id, upstream: target.upstream, baseSha: target.baseSha,
    coordinates: `${coordinate.group}:${coordinate.artifact}:${coordinate.version}`,
    dependencies: [...target.dependsOn, ...(id === "viafabricplus-bedrock" ? ["viafabricplus"] : [])]
      .map((dependency) => ({ target: dependency, coordinates: built.get(dependency) })),
    artifacts: [{ file: name, sha256: createHash("sha256").update(Buffer.from(bytes)).digest("hex") }],
    auxiliaryArtifacts: [],
  };
  yield* Effect.promise(() => writeFile(join(output, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`));
  built.set(id, coordinate);
  return output;
});

export const build = Effect.fn("build")(function* (id: string) {
  const order = id === "viafabricplus" ? [] : buildOrder(yield* Effect.promise(() => getTargets()), id);
  yield* Effect.promise(() => rm(localRepo, { recursive: true, force: true }));
  const built = new Map<string, Coordinates>();
  const includeViaFabricPlus = id === "viafabricplus" || order.includes("viafabricplus-bedrock");
  if (includeViaFabricPlus) {
    console.log("Fetching pinned ViaFabricPlus Jenkins build");
    const { pin } = yield* Effect.promise(() => prepareViaFabricPlus());
    built.set("viafabricplus", { group: "com.viaversion", artifact: "viafabricplus", version: pin.version });
  }
  for (const [index, target] of order.entries()) {
    console.log(`Building ${target} (${index + 1}/${order.length})`);
    yield* buildOne(target, built);
  }
  return [...(includeViaFabricPlus ? ["viafabricplus"] : []), ...order]
    .map((target) => join(root, "dist", target)).join("\n");
});

export const buildPr = Effect.fn("buildPr")(function* (id: string, patchFile?: string) {
  const target = yield* Effect.promise(() => getTarget(id));
  const dir = yield* sync(id, "pr", patchFile);
  const builtinAssets = yield* Effect.promise(() => builtinAssetArguments(id));
  yield* command("bash", ["./gradlew", "--no-daemon", "--stacktrace", ...builtinAssets, "clean", target.buildTask], dir);
  const artifacts = yield* Effect.promise(() => listArtifacts(dir));
  if (!artifacts.length) return yield* Effect.fail(new Error(`No PR JAR artifacts found for ${id}`));
  const output = patchFile
    ? join(root, "dist", "pr", id, patchFile.replace(/\.patch$/, ""))
    : join(root, "dist", "pr", id);
  yield* Effect.promise(() => rm(output, { recursive: true, force: true }));
  yield* Effect.promise(() => mkdir(output, { recursive: true }));
  for (const artifact of artifacts) yield* Effect.promise(() => copyFile(artifact, join(output, basename(artifact))));
  const commit = yield* command("git", ["rev-parse", "HEAD"], dir);
  yield* Effect.promise(() => writeFile(join(output, "manifest.json"), `${JSON.stringify({ target: id, upstream: target.upstream, baseSha: target.baseSha, featureCommit: commit }, null, 2)}\n`));
  return output;
});
