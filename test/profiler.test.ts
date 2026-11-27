import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { expect, test } from "bun:test";
import { readProfilerLock, withKeyBindings } from "../src/integration/profiler.ts";
import { root } from "../src/model.ts";

test("rebinds profiler keys once and keeps unrelated options", () => {
  const options = [
    "soundCategory_master:0.0",
    "key_key.taskmanager.open:key.keyboard.e",
    "key_key.inventory:key.keyboard.e",
    "",
  ].join("\n");
  const updated = withKeyBindings(options, {
    "key.taskmanager.open": "key.keyboard.f8",
    "key.taskmanager.session": "key.keyboard.f9",
  });
  expect(updated.split("\n").filter((line) => line.startsWith("key_key.taskmanager.open:"))).toEqual([
    "key_key.taskmanager.open:key.keyboard.f8",
  ]);
  expect(updated).toContain("key_key.taskmanager.session:key.keyboard.f9\n");
  expect(updated).toContain("key_key.inventory:key.keyboard.e\n");
  expect(updated).toContain("soundCategory_master:0.0\n");
  expect(withKeyBindings("", { "key.taskmanager.hud_toggle": "key.keyboard.f10" })).toBe(
    "key_key.taskmanager.hud_toggle:key.keyboard.f10\n",
  );
});

test("profiler Fabric API is the same file as the pinned modpack's, so profiles never load two copies", async () => {
  const lock = await readProfilerLock();
  const fabricApi = lock.mods.filter((mod) => mod.path.startsWith("mods/fabric-api-"));
  expect(fabricApi).toHaveLength(1);
  const index = JSON.parse(
    execFileSync("unzip", ["-p", join(root, "integration/modpacks/fabulously-optimized.mrpack"), "modrinth.index.json"], {
      encoding: "utf8",
    }),
  ) as { files: { path: string; hashes: { sha512: string } }[] };
  const packed = index.files.filter((file) => file.path.startsWith("mods/fabric-api-"));
  expect(packed.map((file) => [file.path, file.hashes.sha512])).toEqual(
    fabricApi.map((mod) => [mod.path, mod.hashes.sha512]),
  );
});
