import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Schema } from "effect";
import { root } from "../model.ts";
import { parseJson } from "../guards.ts";
import { PackManifestSchema, registerWorldPack } from "./world-packs.ts";

const source = join(root, "test-packs", "resource-probe");
const packSource = join(source, "resource_pack");
const texturePath = "assets/viabedrock/textures/item/item_textures/items/resource_probe.png";
const blockstatePath = "assets/minecraft/blockstates/note_block.json";

const BlockstateSchema = Schema.Struct({
  variants: Schema.Record(Schema.String, Schema.Struct({ model: Schema.String })),
});
const ModelSchema = Schema.Struct({
  textures: Schema.optionalKey(Schema.Struct({ all: Schema.optionalKey(Schema.String) })),
});

export async function installResourceProbe(
  serverHome: string,
  worldName: string,
  variant: "a" | "b",
  run: string,
): Promise<void> {
  const manifest = parseJson(
    PackManifestSchema,
    await readFile(join(packSource, "manifest.json"), "utf8"),
  );
  const patchVersion = manifest.header.version[2];
  if (!manifest.header.uuid || manifest.header.version.length !== 3 || patchVersion === undefined)
    throw new Error("Resource probe pack has an invalid manifest.");
  if (variant === "b") manifest.header.version[2] = patchVersion + 1;

  const pack = join(serverHome, "resource_packs", "stackanvil-resource-probe");
  await mkdir(join(pack, "textures", "items"), { recursive: true });
  await mkdir(join(pack, "textures", "blocks"), { recursive: true });
  await writeFile(join(pack, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  await cp(
    join(packSource, "textures", "item_texture.json"),
    join(pack, "textures", "item_texture.json"),
  );
  await cp(
    join(packSource, "textures", "terrain_texture.json"),
    join(pack, "textures", "terrain_texture.json"),
  );
  await cp(
    join(source, "variants", `probe-${variant}.png`),
    join(pack, "textures", "items", "resource_probe.png"),
  );
  await cp(
    join(source, "variants", `probe-${variant}.png`),
    join(pack, "textures", "blocks", "resource_probe.png"),
  );
  await writeFile(join(pack, "stackanvil-probe.txt"), `${run}\n`);

  const world = join(serverHome, "worlds", worldName);
  await mkdir(world, { recursive: true });
  await registerWorldPack(join(world, "world_resource_packs.json"), {
    pack_id: manifest.header.uuid,
    version: manifest.header.version,
  });

  const behaviorSource = join(source, "behavior_pack");
  const behaviorManifest = parseJson(
    PackManifestSchema,
    await readFile(join(behaviorSource, "manifest.json"), "utf8"),
  );
  const behavior = join(serverHome, "behavior_packs", "stackanvil-resource-probe");
  await cp(behaviorSource, behavior, { recursive: true });
  await registerWorldPack(join(world, "world_behavior_packs.json"), {
    pack_id: behaviorManifest.header.uuid,
    version: behaviorManifest.header.version,
  });
}

export function convertedPackCount(log: string): number {
  return log.match(/Converted resource packs in \d+ms/gu)?.length ?? 0;
}

export async function convertedTextureMatches(
  proxyHome: string,
  variant: "a" | "b",
): Promise<boolean> {
  const directory = join(proxyHome, "viabedrock", "server_packs", "converted");
  const expected = await readFile(join(source, "variants", `probe-${variant}.png`));
  for (const file of await readdir(directory)) {
    if (!file.endsWith(".zip")) continue;
    const zip = join(directory, file);
    const itemTexture = await zipEntry(zip, texturePath);
    if (!itemTexture?.equals(expected)) continue;

    const blockstateData = await zipEntry(zip, blockstatePath);
    if (!blockstateData) continue;
    const blockstate = parseJson(BlockstateSchema, blockstateData.toString());
    const modelName = Object.values(blockstate.variants)
      .map((entry) => entry.model)
      .find((name) => name.startsWith("viabedrock:block/custom/slot_"));
    if (!modelName) continue;
    const modelPath = `assets/viabedrock/models/${modelName.slice("viabedrock:".length)}.json`;
    const modelData = await zipEntry(zip, modelPath);
    if (!modelData) continue;
    const model = parseJson(ModelSchema, modelData.toString());
    if (model.textures?.all !== modelName) continue;
    const blockTexture = await zipEntry(
      zip,
      `assets/viabedrock/textures/${modelName.slice("viabedrock:".length)}.png`,
    );
    if (blockTexture?.equals(expected)) return true;
  }
  return false;
}

async function zipEntry(zip: string, path: string): Promise<Buffer | undefined> {
  const process = Bun.spawn(["unzip", "-p", zip, path], { stdout: "pipe", stderr: "pipe" });
  const data = Buffer.from(await new Response(process.stdout).arrayBuffer());
  return (await process.exited) === 0 ? data : undefined;
}
