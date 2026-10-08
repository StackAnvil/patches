import { afterEach, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { assetZip } from "../scripts/bundle-bedrock-assets.ts";
import { builtinAssetsResource, verifyBuiltinAssets, verifyEmbeddedBuiltinAssets } from "../src/bedrock-assets.ts";

const directories: string[] = [];
afterEach(async () => {
  await Promise.all(directories.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

async function fixture(mutate: (files: Map<string, Buffer>) => void = () => {}) {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-actors-"));
  directories.push(directory);
  const files = new Map(["entity/player.entity.json", "models/mobs.json", "animations/player.animation.json",
    "animation_controllers/player.animation_controllers.json", "render_controllers/player.render_controllers.json",
    "materials/entity.material", "attachables/shield.json"].map((path) => [`library/vanilla/${path}`, Buffer.from("{}")]));
  mutate(files);
  const bytes = assetZip(files);
  await writeFile(join(directory, "builtin-01.zip"), bytes);
  await writeFile(join(directory, "manifest.json"), JSON.stringify({ format: 1, version: "1.26.51.1", protocolVersion: "1.26.51",
    files: files.size, expandedBytes: [...files.values()].reduce((sum, file) => sum + file.length, 0),
    archives: [{ name: "builtin-01.zip", files: files.size, expandedBytes: [...files.values()].reduce((sum, file) => sum + file.length, 0),
      sha256: createHash("sha256").update(bytes).digest("hex") }] }));
  return directory;
}

describe("bundled actor dependencies", () => {
  test("verifies exact archives in the distributable and rejects omitted archives", async () => {
    const directory = await fixture();
    const resources = await verifyBuiltinAssets(directory, "1.26.51.1");
    const artifact = join(directory, "addon.jar");
    await writeFile(artifact, assetZip(new Map([...resources].map(([name, bytes]) => [`${builtinAssetsResource}/${name}`, bytes]))));
    await verifyEmbeddedBuiltinAssets(artifact, directory, "1.26.51.1");
    await writeFile(artifact, assetZip(new Map([[`${builtinAssetsResource}/manifest.json`, await readFile(join(directory, "manifest.json"))]])));
    await expect(verifyEmbeddedBuiltinAssets(artifact, directory, "1.26.51.1")).rejects.toThrow();
  });

  test("rejects damaged archives and incomplete actor dependencies", async () => {
    const directory = await fixture();
    await writeFile(join(directory, "builtin-01.zip"), Buffer.from("damaged"));
    await expect(verifyBuiltinAssets(directory, "1.26.51.1")).rejects.toThrow();
    for (const path of ["materials/entity.material", "attachables/shield.json"]) {
      const incomplete = await fixture((files) => files.delete(`library/vanilla/${path}`));
      await expect(verifyBuiltinAssets(incomplete, "1.26.51.1")).rejects.toThrow();
    }
    const empty = await fixture((files) => files.set("library/vanilla/models/placeholder.json", Buffer.alloc(0)));
    await expect(verifyBuiltinAssets(empty, "1.26.51.1")).rejects.toThrow();
  });
});
