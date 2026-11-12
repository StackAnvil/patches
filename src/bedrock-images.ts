import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { assetZip } from "../scripts/bundle-bedrock-assets.ts";
import { verifyBuiltinAssets } from "./bedrock-assets.ts";
import { zipEntries } from "./zip.ts";

export const builtinImagesResource = "assets/viabedrock/builtin_images.zip";
export const preparedUiImagesResource = "assets/viabedrock/builtin_ui_images.zip";

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
  const nativeImages = await readFile(bundle);
  if (!entries.get(builtinImagesResource)?.().equals(nativeImages))
    throw new Error(`${project} did not embed the verified native image bundle`);
  const prepared = entries.get(preparedUiImagesResource)?.();
  if (!prepared) throw new Error(`${project} did not embed prepared native UI images`);
  verifyPreparedUiImages(prepared, nativeImages);
}

/** Bind generated PNGs to the verified native bundle and reject incomplete or damaged packaging. */
export function verifyPreparedUiImages(catalog: Buffer, source: Buffer) {
  const entries = zipEntries(catalog);
  const index = entries.get("0-index")?.();
  const hash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest();
  if (
    !index ||
    index.length < 44 ||
    catalog.readUInt32LE(0) !== 0x04034b50 ||
    catalog.readUInt16LE(26) !== 7 ||
    catalog.subarray(30, 37).toString("utf8") !== "0-index" ||
    index.readUInt32BE(0) !== 0x5549504e ||
    index.readUInt32BE(4) !== 1 ||
    !index.subarray(8, 40).equals(hash(source))
  )
    throw new Error("Prepared UI image source or format does not match");
  const count = index.readInt32BE(40);
  if (count < 0 || count > 32768 || index.length !== 44 + count * 68 || entries.size !== count + 1)
    throw new Error("Invalid prepared UI image index");
  const sources = new Map<string, Buffer>();
  for (const [path, read] of zipEntries(source))
    if (path.endsWith(".tga")) {
      const bytes = read();
      sources.set(hash(bytes).toString("hex"), bytes);
    }
  const seen = new Set<string>();
  let total = 0;
  for (let i = 0; i < count; i++) {
    const offset = 44 + i * 68;
    const key = index.subarray(offset, offset + 32).toString("hex");
    const original = sources.get(key),
      png = entries.get(`${key}.png`)?.();
    const length = index.readInt32BE(offset + 64);
    total += length;
    if (
      seen.has(key) ||
      !original ||
      original.length < 18 ||
      original.length > 16 * 1024 * 1024 ||
      !png ||
      length < 33 ||
      length > 16 * 1024 * 1024 ||
      total > 64 * 1024 * 1024 ||
      png.length !== length ||
      !hash(png).equals(index.subarray(offset + 32, offset + 64)) ||
      !png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
      png.readUInt32BE(8) !== 13 ||
      png.readUInt32BE(12) !== 0x49484452 ||
      png.readUInt32BE(16) === 0 ||
      png.readUInt32BE(20) === 0 ||
      png.readUInt32BE(16) > 16384 ||
      png.readUInt32BE(20) > 16384 ||
      png.readUInt32BE(16) * png.readUInt32BE(20) > 16 * 1024 * 1024 ||
      png.readUInt32BE(16) !== original.readUInt16LE(12) ||
      png.readUInt32BE(20) !== original.readUInt16LE(14)
    )
      throw new Error("Prepared UI image does not match its source or checksum");
    seen.add(key);
  }
}
