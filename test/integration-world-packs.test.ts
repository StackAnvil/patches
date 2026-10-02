import { expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installEntityProbe } from "../src/integration/entity-probe.ts";
import { installResourceProbe } from "../src/integration/resource-probe.ts";
import { registerWorldPack } from "../src/integration/world-packs.ts";

for (const entityFirst of [true, false]) {
  test(`combined probes retain world declarations when ${entityFirst ? "entity" : "resource"} installs first`, async () => {
    const home = await mkdtemp(join(tmpdir(), "stackanvil-world-probes-"));
    try {
      const world = join(home, "worlds", "integration-world");
      await mkdir(world, { recursive: true });
      const unrelated = { pack_id: crypto.randomUUID(), version: [3, 2, 1], extra: { retained: true } };
      const behaviorFile = join(world, "world_behavior_packs.json");
      const resourceFile = join(world, "world_resource_packs.json");
      await writeFile(behaviorFile, JSON.stringify([unrelated]));
      await writeFile(resourceFile, JSON.stringify([unrelated]));
      const worldData = new Uint8Array([5, 7, 11, 13]);
      await writeFile(join(world, "level.dat"), worldData);
      const installEntity = () => installEntityProbe(home, "integration-world");
      const installResource = () => installResourceProbe(home, "integration-world", "a", "test-run");
      for (const install of entityFirst ? [installEntity, installResource] : [installResource, installEntity]) await install();
      const declaration = async (kind: string, name: string) => {
        const manifest = JSON.parse(await readFile(join(home, kind, name, "manifest.json"), "utf8"));
        return { pack_id: manifest.header.uuid, version: manifest.header.version };
      };
      const entity = await declaration("behavior_packs", "stackanvil-entity-probe");
      const resource = await declaration("behavior_packs", "stackanvil-resource-probe");
      const expected = [unrelated, ...(entityFirst ? [entity, resource] : [resource, entity])];
      expect(JSON.parse(await readFile(behaviorFile, "utf8"))).toEqual(expected);
      await installEntity();
      await installResourceProbe(home, "integration-world", "b", "test-run");
      expect(JSON.parse(await readFile(behaviorFile, "utf8"))).toEqual(expected);
      expect(JSON.parse(await readFile(resourceFile, "utf8"))).toEqual([
        unrelated, await declaration("resource_packs", "stackanvil-resource-probe"),
      ]);
      expect(new Uint8Array(await readFile(join(world, "level.dat")))).toEqual(worldData);
    } finally {
      await rm(home, { recursive: true, force: true });
    }
  });
}

test("pack replacement updates the first declaration and removes duplicate IDs", async () => {
  const home = await mkdtemp(join(tmpdir(), "stackanvil-world-packs-"));
  try {
    const path = join(home, "world_behavior_packs.json");
    const id = crypto.randomUUID();
    const before = { pack_id: crypto.randomUUID(), version: [1, 0, 0] };
    const after = { pack_id: crypto.randomUUID(), version: [2, 0, 0] };
    await writeFile(path, JSON.stringify([
      before, { pack_id: id, version: [0, 1, 0], retained: 42 },
      { pack_id: id, version: [0, 2, 0] }, after,
    ]));
    await registerWorldPack(path, { pack_id: id, version: [1, 2, 3] });
    expect(JSON.parse(await readFile(path, "utf8"))).toEqual([
      before, { pack_id: id, version: [1, 2, 3], retained: 42 }, after,
    ]);
  } finally {
    await rm(home, { recursive: true, force: true });
  }
});
