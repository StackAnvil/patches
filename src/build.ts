import { copyFile, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { createHash } from "node:crypto";
import { Effect } from "effect";
import { getTarget, listArtifacts, root } from "./model.ts";
import { command } from "./process.ts";
import { sync } from "./stack.ts";

export function build(id: string) {
  return Effect.gen(function* () {
    const target = yield* Effect.promise(() => getTarget(id));
    const dir = yield* sync(id);
    yield* command("bash", ["./gradlew", "--no-daemon", "clean", target.buildTask], dir);
    yield* command("bash", ["./gradlew", "--no-daemon", "publishToMavenLocal"], dir);
    const artifacts = yield* Effect.promise(() => listArtifacts(dir));
    if (!artifacts.length) return yield* Effect.fail(new Error(`No JAR artifacts found for ${id}`));
    const output = join(root, "dist", id);
    yield* Effect.promise(() => rm(output, { recursive: true, force: true }));
    yield* Effect.promise(() => mkdir(output, { recursive: true }));
    const publications = yield* Effect.promise(() => readdir(join(dir, "build", "publications"), { withFileTypes: true }));
    const pom = publications.filter((entry) => entry.isDirectory())
      .map((entry) => join(dir, "build", "publications", entry.name, "pom-default.xml"))
      .find((path) => Bun.file(path).size > 0);
    if (!pom) return yield* Effect.fail(new Error(`No generated Maven POM found for ${id}`));
    yield* Effect.promise(() => copyFile(pom, join(output, "pom.xml")));
    for (const artifact of artifacts) {
      const name = basename(artifact);
      if (!name.endsWith("-StackAnvil.jar")) {
        return yield* Effect.fail(new Error(`Branding patch did not suffix ${name} with -StackAnvil.jar`));
      }
      yield* Effect.promise(() => copyFile(artifact, join(output, name)));
    }
    const files = yield* Effect.promise(() => readdir(output));
    const manifest = yield* Effect.promise(async () => Promise.all(files.filter((file) => file.endsWith(".jar")).map(async (file) => {
      const bytes = await Bun.file(join(output, file)).arrayBuffer();
      return { file, sha256: createHash("sha256").update(Buffer.from(bytes)).digest("hex") };
    })));
    yield* Effect.promise(() => writeFile(join(output, "manifest.json"), `${JSON.stringify({ target: id, upstream: target.upstream, baseSha: target.baseSha, artifacts: manifest }, null, 2)}\n`));
    return output;
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
