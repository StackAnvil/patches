import { expect, test } from "bun:test";
import { inspectPinnedModpack, validatePackIndex } from "../src/integration/modpack.ts";

const target = { minecraft: "26.3", fabricLoader: "0.19.5" };

function index(path = "mods/example.jar") {
  return {
    formatVersion: 1,
    game: "minecraft",
    versionId: "15.0.0-alpha.3",
    dependencies: { minecraft: target.minecraft, "fabric-loader": target.fabricLoader },
    files: [{ path, downloads: ["https://cdn.modrinth.com/example.jar"], hashes: { sha512: "a".repeat(128) } }],
  };
}

test("accepts a version-matched pack with verified client downloads", () => {
  expect(validatePackIndex(index(), target).files).toHaveLength(1);
});

test("rejects incompatible loaders and archive path escapes", () => {
  expect(() => validatePackIndex(index(), { ...target, fabricLoader: "0.19.6" })).toThrow();
  expect(() => validatePackIndex(index("mods/../options.txt"), target)).toThrow();
});

test("rejects missing download hashes", () => {
  const pack = index();
  pack.files[0]!.hashes.sha512 = "";
  expect(() => validatePackIndex(pack, target)).toThrow();
});

test("the pinned modpack archive matches its lock and contains client files", async () => {
  const pack = await inspectPinnedModpack();
  expect(pack.files).toBeGreaterThan(0);
  expect(pack.overrides).toBeGreaterThan(0);
});
