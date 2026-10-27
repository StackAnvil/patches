import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { assetZip } from "../scripts/bundle-bedrock-assets.ts";
import { verifyBuiltinAssets } from "./bedrock-assets.ts";
import { zipEntries } from "./zip.ts";

export const builtinImagesResource = "assets/viabedrock/builtin_images.zip";

/** Keep the native image layers and atlases in their original overlay order. */
export function builtinImageBundle(files: ReadonlyMap<string, Uint8Array>, version: string) {
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(version)) throw new Error("Invalid built-in image version");
  const images = new Map<string, Uint8Array>();
  const packs = new Set<string>();
  for (const [path, bytes] of files) {
    const match = /^library\/(vanilla(?:_base|_\d+\.\d+(?:\.\d+)?)?)\/(textures\/.+)$/.exec(path);
    if (!match) continue;
    if (
      !/\.(png|jpg|tga)$/.test(match[2]!) &&
      !["textures/item_texture.json", "textures/terrain_texture.json"].includes(match[2]!)
    )
      continue;
    if (
      path.split("/").some((part) => !part || part === "." || part === "..") ||
      /[\\:\0]/.test(path)
    )
      throw new Error("Invalid native image path");
    if (bytes.length === 0 || bytes.length > 32 * 1024 * 1024)
      throw new Error("Invalid native image size");
    packs.add(match[1]!);
    images.set(path, bytes);
  }
  const tuple = (name: string) =>
    name === "vanilla"
      ? [-2, 0, 0]
      : name === "vanilla_base"
        ? [-1, 0, 0]
        : Array.from({ length: 3 }, (_, index) => Number(name.slice(8).split(".")[index] ?? 0));
  const ordered = [...packs].sort((a, b) => {
    const left = tuple(a),
      right = tuple(b);
    for (let index = 0; index < 3; index++) {
      const difference = (left[index] ?? 0) - (right[index] ?? 0);
      if (difference) return difference;
    }
    return 0;
  });
  for (let index = 1; index < ordered.length; index++) {
    if (
      tuple(ordered[index - 1]!).every(
        (value, part) => value === (tuple(ordered[index]!)[part] ?? 0),
      )
    )
      throw new Error("Ambiguous native image overlay");
  }
  if (
    !images.size ||
    images.size > 32768 ||
    [...images.values()].reduce((sum, bytes) => sum + bytes.length, 0) > 256 * 1024 * 1024
  )
    throw new Error("Invalid native image bundle size");
  const manifest = {
    format: 1,
    version,
    packs: ordered,
    files: [...images]
      .sort(([a], [b]) => a.localeCompare(b, "en"))
      .map(([path, bytes]) => ({ path, sha256: createHash("sha256").update(bytes).digest("hex") })),
  };
  images.set("manifest.json", Buffer.from(JSON.stringify(manifest)));
  return assetZip(images);
}

/** Derive image-only resources from the same verified licensed source used by the add-on. */
export async function prepareBuiltinImages(directory: string, version: string, output: string) {
  const archives = await verifyBuiltinAssets(directory, version);
  const files = new Map<string, Buffer>();
  for (const [name, bytes] of archives)
    if (name.endsWith(".zip")) {
      for (const [path, read] of zipEntries(bytes)) files.set(path, read());
    }
  const bytes = builtinImageBundle(files, version);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, bytes);
  return output;
}

/** Verify the exact core resource in both shaded and nested consumers. */
export async function verifyEmbeddedBuiltinImages(
  artifact: string,
  project: string,
  bundle: string,
) {
  let entries = zipEntries(await readFile(artifact));
  if (project === "viafabricplus-bedrock") {
    const cores = [...entries.keys()].filter((path) =>
      /^META-INF\/jars\/ViaBedrock-[^/]+\.jar$/.test(path),
    );
    if (cores.length !== 1) throw new Error("The Bedrock add-on must embed exactly one core JAR");
    entries = zipEntries(entries.get(cores[0]!)!());
  }
  if (
    !entries
      .get(builtinImagesResource)?.()
      .equals(await readFile(bundle))
  )
    throw new Error(`${project} did not embed the verified native image bundle`);
}
