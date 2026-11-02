import { afterEach, expect, test } from "bun:test";
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeReplayArtifactEvidence } from "../src/replay/artifact-evidence.ts";
import { prepareReplayInstanceCleanup } from "../src/replay/java-profile.ts";

const roots: string[] = [];
afterEach(async () => {
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true });
});

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "stackanvil-artifact-evidence-"));
  roots.push(root);
  return root;
}

test("retains the installed mod hash after its source changes and private mods are removed", async () => {
  const root = await fixture();
  const prism = join(root, "prism");
  const game = join(prism, "instances/run/minecraft");
  await mkdir(join(game, "mods"), { recursive: true });
  const release = await prepareReplayInstanceCleanup(prism, game);
  const source = join(root, "built.jar");
  const installed = join(game, "mods/addon.jar");
  await writeFile(source, "abc");
  await cp(source, installed);
  await writeFile(source, "different build");
  const output = join(root, "client-artifacts.json");
  await writeReplayArtifactEvidence(output, [{ role: "client-mod", path: installed }]);
  await release();
  await expect(lstat(installed)).rejects.toThrow();
  expect(JSON.parse(await readFile(output, "utf8"))).toEqual({
    schema: 1,
    artifacts: [{
      role: "client-mod",
      file: "addon.jar",
      bytes: 3,
      sha256: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    }],
  });
  if (process.platform !== "win32") expect((await lstat(output)).mode & 0o777).toBe(0o600);
});

test("does not publish partial artifact evidence when a staged dependency is missing", async () => {
  const root = await fixture();
  const installed = join(root, "proxy.jar");
  const output = join(root, "transport-artifacts.json");
  await writeFile(installed, "hello");
  await expect(writeReplayArtifactEvidence(output, [
    { role: "transport", path: installed },
    { role: "proxy-recorder", path: join(root, "missing.jar") },
  ])).rejects.toThrow();
  await expect(lstat(output)).rejects.toThrow();
});

test("refuses to replace an existing recording's artifact evidence", async () => {
  const root = await fixture();
  const installed = join(root, "proxy.jar");
  const output = join(root, "transport-artifacts.json");
  await writeFile(installed, "hello");
  await writeReplayArtifactEvidence(output, [{ role: "transport", path: installed }]);
  const original = await readFile(output, "utf8");
  await writeFile(installed, "replacement");
  await expect(writeReplayArtifactEvidence(output, [{ role: "transport", path: installed }])).rejects.toThrow();
  expect(await readFile(output, "utf8")).toBe(original);
  expect((await readdir(root)).sort()).toEqual(["proxy.jar", "transport-artifacts.json"]);
});

test("concurrent receipt publication keeps one complete artifact record", async () => {
  const root = await fixture();
  const first = join(root, "first.jar");
  const second = join(root, "second.jar");
  const output = join(root, "transport-artifacts.json");
  await writeFile(first, "first");
  await writeFile(second, "second");
  const results = await Promise.allSettled([
    writeReplayArtifactEvidence(output, [{ role: "transport", path: first }]),
    writeReplayArtifactEvidence(output, [{ role: "transport", path: second }]),
  ]);
  expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
  expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
  const receipt = JSON.parse(await readFile(output, "utf8"));
  const winner = receipt.artifacts[0].file;
  expect(["first.jar", "second.jar"]).toContain(winner);
  const reference = join(root, "reference.json");
  await writeReplayArtifactEvidence(reference, [{ role: "transport", path: join(root, winner) }]);
  expect(await readFile(output, "utf8")).toBe(await readFile(reference, "utf8"));
  expect((await readdir(root)).sort()).toEqual([
    "first.jar", "reference.json", "second.jar", "transport-artifacts.json",
  ]);
});
