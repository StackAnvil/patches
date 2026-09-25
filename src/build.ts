import { copyFile, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { Effect } from "effect";
import { buildOrder } from "./dependencies.ts";
import { getTarget, getTargets, listArtifacts, root } from "./model.ts";
import { command } from "./process.ts";
import { sync } from "./stack.ts";

interface Coordinates { group: string; artifact: string; version: string }

const localRepo = join(root, ".stackanvil", "maven");
const initScript = join(root, ".stackanvil", "local-dependencies.gradle");

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

async function writeInitScript(built: Map<string, Coordinates>): Promise<void> {
  const substitutions = [
    ["cubeconverter", "com.github.oryxel1:CubeConverter"],
    ["viabedrock", "net.raphimc:ViaBedrock"],
    ["viafabricplus", "com.viaversion:viafabricplus"],
  ].flatMap(([id, original]) => {
    const local = built.get(id!);
    return local ? [`substitute module('${original}') using module('${local.group}:${local.artifact}:${local.version}')`] : [];
  });
  const script = [
    "gradle.beforeProject { project ->",
    `  project.repositories.maven { name = 'StackAnvilLocal'; url = uri(${JSON.stringify(localRepo)}) }`,
    "  project.configurations.configureEach { configuration ->",
    "    configuration.resolutionStrategy.dependencySubstitution {",
    ...substitutions.map((line) => `      ${line}`),
    "    }",
    "  }",
    "}",
    "",
  ].join("\n");
  await mkdir(join(root, ".stackanvil"), { recursive: true });
  await writeFile(initScript, script);
}

async function publishLocal(artifact: string, pom: string, coordinate: Coordinates): Promise<void> {
  const directory = join(localRepo, ...coordinate.group.split("."), coordinate.artifact, coordinate.version);
  await mkdir(directory, { recursive: true });
  const stem = `${coordinate.artifact}-${coordinate.version}`;
  await copyFile(artifact, join(directory, `${stem}.jar`));
  await writeFile(join(directory, `${stem}.pom`), pom);
}

function buildOne(id: string, built: Map<string, Coordinates>) {
  return Effect.gen(function* () {
    const target = yield* Effect.promise(() => getTarget(id));
    const dir = yield* sync(id);
    yield* Effect.promise(() => writeInitScript(built));
    const jdk = yield* Effect.promise(() => javaHome(target.java));
    yield* command("bash", ["./gradlew", "--no-daemon", "--init-script", initScript, "clean", target.buildTask,
      `generatePomFileFor${target.publication}Publication`], dir,
      { ...process.env, JAVA_HOME: jdk, PATH: `${join(jdk, "bin")}:${process.env.PATH ?? ""}` });
    const artifacts = yield* Effect.promise(() => listArtifacts(dir));
    if (artifacts.length !== 1) return yield* Effect.fail(new Error(`Expected one distributable JAR for ${id}, found ${artifacts.length}`));
    const artifact = artifacts[0]!;
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
    let apiArtifact: string | undefined;
    if (id === "viafabricplus") {
      const apiDir = join(dir, "viafabricplus-api");
      const apiPom = yield* Effect.promise(() => Bun.file(join(apiDir, "build", "publications", "maven", "pom-default.xml")).text());
      const apiArtifacts = yield* Effect.promise(() => listArtifacts(apiDir));
      if (apiArtifacts.length !== 1) return yield* Effect.fail(new Error("Expected one ViaFabricPlus API JAR"));
      apiArtifact = apiArtifacts[0]!;
      yield* Effect.promise(() => publishLocal(apiArtifacts[0]!, apiPom, coordinates(apiPom)));
      const apiOutput = join(output, "api");
      yield* Effect.promise(() => mkdir(apiOutput, { recursive: true }));
      yield* Effect.promise(() => copyFile(apiArtifacts[0]!, join(apiOutput, basename(apiArtifacts[0]!))));
      yield* Effect.promise(() => writeFile(join(apiOutput, "pom.xml"), apiPom));
    }
    const bytes = yield* Effect.promise(() => Bun.file(artifact).arrayBuffer());
    const manifest = {
      target: id, upstream: target.upstream, baseSha: target.baseSha,
      coordinates: `${coordinate.group}:${coordinate.artifact}:${coordinate.version}`,
      dependencies: target.dependsOn.map((dependency) => ({ target: dependency, coordinates: built.get(dependency) })),
      artifacts: [{ file: name, sha256: createHash("sha256").update(Buffer.from(bytes)).digest("hex") }],
      auxiliaryArtifacts: apiArtifact ? [{ file: `api/${basename(apiArtifact)}`,
        sha256: createHash("sha256").update(Buffer.from(yield* Effect.promise(() => Bun.file(apiArtifact).arrayBuffer()))).digest("hex") }] : [],
    };
    yield* Effect.promise(() => writeFile(join(output, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`));
    built.set(id, coordinate);
    return output;
  });
}

export function build(id: string) {
  return Effect.gen(function* () {
    const order = buildOrder(yield* Effect.promise(() => getTargets()), id);
    yield* Effect.promise(() => rm(localRepo, { recursive: true, force: true }));
    const built = new Map<string, Coordinates>();
    for (const target of order) {
      console.log(`Building ${target} (${built.size + 1}/${order.length})`);
      yield* buildOne(target, built);
    }
    return order.map((target) => join(root, "dist", target)).join("\n");
  });
}

export function buildPr(id: string) {
  return Effect.gen(function* () {
    const target = yield* Effect.promise(() => getTarget(id));
    const dir = yield* sync(id, "pr");
    yield* command("bash", ["./gradlew", "--no-daemon", "clean", target.buildTask], dir);
    const artifacts = yield* Effect.promise(() => listArtifacts(dir));
    if (!artifacts.length) return yield* Effect.fail(new Error(`No PR JAR artifacts found for ${id}`));
    const output = join(root, "dist", "pr", id);
    yield* Effect.promise(() => rm(output, { recursive: true, force: true }));
    yield* Effect.promise(() => mkdir(output, { recursive: true }));
    for (const artifact of artifacts) yield* Effect.promise(() => copyFile(artifact, join(output, basename(artifact))));
    const commit = yield* command("git", ["rev-parse", "HEAD"], dir);
    yield* Effect.promise(() => writeFile(join(output, "manifest.json"), `${JSON.stringify({ target: id, upstream: target.upstream, baseSha: target.baseSha, featureCommit: commit }, null, 2)}\n`));
    return output;
  });
}
