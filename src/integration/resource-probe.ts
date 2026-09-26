import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { root } from "../model.ts";

const source = join(root, "test-packs", "resource-probe");
const packSource = join(source, "resource_pack");

interface PackManifest {
  header: { uuid: string; version: number[] };
}

export async function installResourceProbe(serverHome: string, worldName: string, variant: "a" | "b", run: string): Promise<void> {
  const manifest = JSON.parse(await readFile(join(packSource, "manifest.json"), "utf8")) as PackManifest;
  if (!manifest.header.uuid || manifest.header.version.length !== 3) throw new Error("Resource probe pack has an invalid manifest.");

  const pack = join(serverHome, "resource_packs", "stackanvil-resource-probe");
  await mkdir(join(pack, "textures", "items"), { recursive: true });
  await cp(join(packSource, "manifest.json"), join(pack, "manifest.json"));
  await cp(join(source, "variants", `diamond-${variant}.png`), join(pack, "textures", "items", "diamond.png"));
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

export async function resourceColorPixels(image: string, variant: "a" | "b"): Promise<number> {
  const process = Bun.spawn(["ffmpeg", "-loglevel", "error", "-i", image, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
    { stdout: "pipe", stderr: "pipe" });
  const bytes = new Uint8Array(await new Response(process.stdout).arrayBuffer());
  const status = await process.exited;
  if (status !== 0 || bytes.length % 3) throw new Error(`Could not inspect resource probe screenshot ${image}.`);
  let count = 0;
  for (let index = 0; index < bytes.length; index += 3) {
    const red = bytes[index]!;
    const green = bytes[index + 1]!;
    const blue = bytes[index + 2]!;
    if (variant === "a" ? red > 210 && green < 80 && blue > 120 : red < 80 && green > 160 && blue > 210) count++;
  }
  return count;
}
