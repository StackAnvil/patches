import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { root } from "../model.ts";

const source = join(root, "test-packs", "resource-probe");
const packSource = join(source, "resource_pack");
const texturePath = "assets/viabedrock/textures/item/item_textures/items/resource_probe.png";

interface PackManifest {
  header: { uuid: string; version: number[] };
}

export async function installResourceProbe(serverHome: string, worldName: string, variant: "a" | "b", run: string): Promise<void> {
  const manifest = JSON.parse(await readFile(join(packSource, "manifest.json"), "utf8")) as PackManifest;
  if (!manifest.header.uuid || manifest.header.version.length !== 3) throw new Error("Resource probe pack has an invalid manifest.");
  if (variant === "b") manifest.header.version[2]++;

  const pack = join(serverHome, "resource_packs", "stackanvil-resource-probe");
  await mkdir(join(pack, "textures", "items"), { recursive: true });
  await writeFile(join(pack, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  await cp(join(packSource, "textures", "item_texture.json"), join(pack, "textures", "item_texture.json"));
  await cp(join(source, "variants", `probe-${variant}.png`), join(pack, "textures", "items", "resource_probe.png"));
  await writeFile(join(pack, "stackanvil-probe.txt"), `${run}\n`);

  const world = join(serverHome, "worlds", worldName);
  await mkdir(world, { recursive: true });
  await writeFile(join(world, "world_resource_packs.json"), `${JSON.stringify([
    { pack_id: manifest.header.uuid, version: manifest.header.version },
  ], null, 2)}\n`);
}

export function convertedPackCount(log: string): number {
  return log.match(/Converted resource packs in \d+ms/g)?.length ?? 0;
}

export async function convertedTextureMatches(proxyHome: string, variant: "a" | "b"): Promise<boolean> {
  const directory = join(proxyHome, "viabedrock", "server_packs", "converted");
  const expected = await readFile(join(source, "variants", `probe-${variant}.png`));
  for (const file of await readdir(directory)) {
    if (!file.endsWith(".zip")) continue;
    const process = Bun.spawn(["unzip", "-p", join(directory, file), texturePath], { stdout: "pipe", stderr: "pipe" });
    const actual = Buffer.from(await new Response(process.stdout).arrayBuffer());
    if (await process.exited === 0 && actual.equals(expected)) return true;
  }
  return false;
}
