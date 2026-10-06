import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { deflateRawSync } from "node:zlib";
import { Effect } from "effect";

const archiveLimit = 48 * 1024 * 1024;
const fileLimit = 32 * 1024 * 1024;
const totalLimit = 256 * 1024 * 1024;
const libraryDirectories = new Set([
  "models", "animations", "animation_controllers", "render_controllers",
  "entity", "sounds", "particles", "texts", "textures",
]);

function validPath(name: string) {
  return !/[\\:\0]/.test(name) && name.split("/").every((part) => part !== "" && part !== "." && part !== "..");
}

export function readBedrockArchive(data: Uint8Array): Map<string, Buffer> {
  const bytes = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  if (bytes.length < 16 || bytes.readBigUInt64LE(0) !== 0x267052a0b125277dn || bytes.readUInt32LE(12) !== 1) {
    throw new Error("Invalid Bedrock archive header");
  }
  const count = bytes.readUInt32LE(8);
  const content = 16 + count * 256;
  if (count > 4096 || content > bytes.length) throw new Error("Invalid Bedrock archive index");
  const result = new Map<string, Buffer>();
  let expanded = 0;
  for (let index = 0; index < count; index++) {
    const record = 16 + index * 256;
    const length = bytes[record]!;
    if (length === 0 || length > 247) throw new Error("Invalid Bedrock archive name");
    const name = new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(record + 1, record + 1 + length));
    const offset = bytes.readUInt32LE(record + 248);
    const size = bytes.readUInt32LE(record + 252);
    expanded += size;
    if (!validPath(name) || result.has(name) || size > fileLimit || expanded > totalLimit || content + offset + size > bytes.length) {
      throw new Error("Invalid Bedrock archive entry");
    }
    result.set(name, bytes.subarray(content + offset, content + offset + size));
  }
  return result;
}

const crcTable = Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  return crc >>> 0;
});

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/** Stable ZIP entries retain native paths and bytes, with no host timestamps. */
export function assetZip(files: ReadonlyMap<string, Uint8Array>): Buffer {
  const local: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;
  for (const [path, bytes] of [...files].sort(([a], [b]) => a.localeCompare(b, "en"))) {
    if (!validPath(path)) throw new Error("Invalid bundled asset path");
    const name = Buffer.from(path);
    const compressed = deflateRawSync(bytes, { level: 9 });
    const crc = crc32(bytes);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0x800, 6);
    header.writeUInt16LE(8, 8);
    header.writeUInt16LE(33, 12); // 1980-01-01.
    header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(compressed.length, 18);
    header.writeUInt32LE(bytes.length, 22);
    header.writeUInt16LE(name.length, 26);
    const directory = Buffer.alloc(46);
    directory.writeUInt32LE(0x02014b50);
    directory.writeUInt16LE(20, 4);
    header.copy(directory, 6, 4, 30);
    directory.writeUInt32LE(offset, 42);
    local.push(header, name, compressed);
    central.push(directory, name);
    offset += header.length + name.length + compressed.length;
  }
  const directory = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50);
  end.writeUInt16LE(files.size, 8);
  end.writeUInt16LE(files.size, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}

async function* walk(root: string): AsyncGenerator<string> {
  for (const entry of (await readdir(root, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, "en"))) {
    const path = join(root, entry.name);
    if (entry.isSymbolicLink()) throw new Error("Bedrock assets contain a symbolic link");
    if (entry.isDirectory()) yield* walk(path);
    else if (entry.isFile()) yield path;
  }
}

export async function bundleBedrockAssets(game: string, version: string, destination: string) {
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(version)) throw new Error("Expected a four-part Bedrock version");
  const protocolVersion = version.split(".").slice(0, 3).join(".");
  const source = join(game, "data", "resource_packs");
  const latest = JSON.parse(await readFile(join(source, `vanilla_${protocolVersion}`, "manifest.json"), "utf8"));
  if (latest.header.version.join(".") !== protocolVersion) throw new Error("Bedrock resource version mismatch");
  const files = new Map<string, Buffer>();
  const placeholders = new Set<string>();
  let expandedBytes = 0;
  for (const pack of (await readdir(source)).sort()) {
    if (pack !== "persona" && !/^vanilla(?:_base|_\d+\.\d+(?:\.\d+)?)?$/.test(pack)) continue;
    const packRoot = join(source, pack);
    for await (const original of walk(packRoot)) {
      const path = relative(packRoot, original).replaceAll("\\", "/");
      const archived = path.startsWith("__brarchive/") && path.endsWith(".brarchive");
      const logical = archived ? path.slice("__brarchive/".length, -".brarchive".length) : path;
      if (path.endsWith(".bol-orig")) continue;
      if (pack !== "persona" && !(path === "manifest.json" || path === "sounds.json"
        || libraryDirectories.has(logical.split("/")[0]!) && (archived || /\.(json|lang|fsb|ogg|wav|png|jpg|tga)$/.test(path)))) continue;
      const saved = `${original}.bol-orig`;
      const stat = await lstat(saved).catch(() => null);
      if (stat?.isSymbolicLink()) throw new Error("Original Bedrock asset is a symbolic link");
      const bytes = await readFile(stat?.isFile() ? saved : original);
      if (bytes.length > fileLimit) throw new Error(`Bedrock asset exceeds file limit: ${path}`);
      const prefix = pack === "persona" ? "" : `library/${pack}/`;
      const entries = archived ? readBedrockArchive(bytes) : new Map([[path, bytes]]);
      for (const [name, contents] of entries) {
        const key = prefix + (archived ? `${logical}/${name}` : name);
        if (!validPath(key)) throw new Error("Invalid Bedrock asset path");
        // The installed streaming build replaces empty archive slots with loose files.
        if (archived && contents.length === 0) { placeholders.add(key); continue; }
        const previous = files.get(key);
        if (previous && !previous.equals(contents)) throw new Error(`Conflicting Bedrock assets: ${key}`);
        if (!previous) expandedBytes += contents.length;
        if (expandedBytes > totalLimit || files.size >= 32768) throw new Error("Bedrock bundle exceeds limits");
        files.set(key, contents);
      }
    }
  }
  for (const key of placeholders) if (!files.has(key)) files.set(key, Buffer.alloc(0));
  const staging = `${destination}.staging`;
  await rm(staging, { force: true, recursive: true });
  await mkdir(staging, { recursive: true });
  const archives: { name: string; sha256: string; files: number; expandedBytes: number }[] = [];
  let batch = new Map<string, Buffer>();
  let batchBytes = 0;
  async function flush() {
    if (!batch.size) return;
    const name = `builtin-${String(archives.length + 1).padStart(2, "0")}.zip`;
    const bytes = assetZip(batch);
    await writeFile(join(staging, name), bytes);
    archives.push({ name, sha256: createHash("sha256").update(bytes).digest("hex"), files: batch.size, expandedBytes: batchBytes });
    batch = new Map();
    batchBytes = 0;
  }
  for (const [path, bytes] of [...files].sort(([a], [b]) => a.localeCompare(b, "en"))) {
    if (batchBytes + bytes.length > archiveLimit) await flush();
    batch.set(path, bytes);
    batchBytes += bytes.length;
  }
  await flush();
  await writeFile(join(staging, "manifest.json"), `${JSON.stringify({ format: 1, version, protocolVersion, files: files.size, expandedBytes, archives }, null, 2)}\n`);
  await writeFile(join(staging, "NOTICE.txt"), `Minecraft: Bedrock Edition ${version} built-in resource data.\nCopyright Mojang AB and Microsoft.\nExtracted from the installed game package; native file contents are unchanged.\n`);
  await mkdir(dirname(destination), { recursive: true });
  await rm(destination, { force: true, recursive: true });
  await rename(staging, destination);
  return { files: files.size, expandedBytes, archives: archives.length };
}

if (import.meta.main) {
  const [game, version] = process.argv.slice(2);
  if (!game || !version) throw new Error("Usage: bun scripts/bundle-bedrock-assets.ts <game-directory> <version>");
  const destination = join(import.meta.dir, "..", "assets", "bedrock", version, "assets", "viafabricplus-bedrock", "builtin");
  console.log(await Effect.runPromise(Effect.tryPromise(() => bundleBedrockAssets(game, version, destination))));
}
