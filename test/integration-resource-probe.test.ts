import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installResourceProbe } from "../src/integration/resource-probe.ts";

test("resource probe changes content while retaining pack identity", async () => {
  const home = await mkdtemp(join(tmpdir(), "stackanvil-resource-probe-"));
  try {
    const texture = join(home, "resource_packs", "stackanvil-resource-probe", "textures", "items", "diamond.png");
    await installResourceProbe(home, "integration-world", "a", "test-run");
    const first = createHash("sha256").update(await readFile(texture)).digest("hex");
    const active = JSON.parse(await readFile(join(home, "worlds", "integration-world", "world_resource_packs.json"), "utf8"));
    const manifest = JSON.parse(await readFile(join(home, "resource_packs", "stackanvil-resource-probe", "manifest.json"), "utf8"));
    expect(active).toEqual([{ pack_id: manifest.header.uuid, version: manifest.header.version }]);

    await installResourceProbe(home, "integration-world", "b", "test-run");
    const second = createHash("sha256").update(await readFile(texture)).digest("hex");
    expect(second).not.toBe(first);
  } finally {
    await rm(home, { recursive: true, force: true });
  }
});
