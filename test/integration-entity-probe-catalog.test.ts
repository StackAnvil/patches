import { expect, test } from "bun:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generateCatalog } from "../src/integration/entity-probe-catalog.ts";

test("generate a deterministic catalog from Bedrock entity JSON5", async () => {
  const home = await mkdtemp(join(tmpdir(), "stackanvil-catalog-"));
  try {
    await writeFile(join(home, "zombie.json"), `{
      // Bedrock sample definitions permit comments and trailing commas.
      'minecraft:entity': {
        description: {
          identifier: 'minecraft:zombie',
          properties: {
            'minecraft:variant': { type: 'enum', client_sync: true, values: ['normal', 'husk'] },
            'minecraft:private': { type: 'bool', client_sync: false },
            'minecraft:age': { type: 'int', client_sync: true, range: [0, 10], default: 0 },
          },
        },
        events: { 'minecraft:transform': {}, 'minecraft:spawn': {} },
      },
    }`);
    await writeFile(join(home, "empty.json"), "{'minecraft:entity': {description: {}}}");
    const output = join(home, "catalog.js");
    const catalog = await generateCatalog(home, "v1.26.40.05", output);
    expect(catalog).toEqual([{
      type: "minecraft:zombie",
      summonable: true,
      events: ["minecraft:spawn", "minecraft:transform"],
      properties: [
        { id: "minecraft:age", type: "int", values: [0, 10] },
        { id: "minecraft:variant", type: "enum", values: ["normal", "husk"] },
      ],
    }]);
    expect((await readFile(output)).byteLength).toBeGreaterThan(0);
  } finally {
    await rm(home, { recursive: true, force: true });
  }
});
