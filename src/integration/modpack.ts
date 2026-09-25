import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { promisify } from "node:util";
import { root } from "../model.ts";

const execute = promisify(execFile);
const project = "fabulously-optimized";
const packDirectory = join(root, "integration", "modpacks");
const packFile = join(packDirectory, `${project}.mrpack`);
const lockFile = join(packDirectory, `${project}.json`);
const cacheDirectory = join(root, ".stackanvil", "integration", "cache", "modpack");
const userAgent = "StackAnvil/integration-tests (https://github.com/StackAnvil/patches)";

interface PackLock {
  project: string;
  versionId: string;
  versionNumber: string;
  minecraft: string;
  fabricLoader: string;
  sha512: string;
  source: string;
}

interface PackFile {
  path: string;
  downloads: string[];
  hashes: { sha512: string };
  env?: { client?: string };
}

interface PackIndex {
  formatVersion: number;
  game: string;
  versionId: string;
  dependencies: Record<string, string>;
  files: PackFile[];
}

interface InstalledPack { sha512: string; files: string[] }

function safePath(path: string): boolean {
  return path.length > 0 && !path.startsWith("/") && !path.includes("\\") && !path.includes("\0")
    && path.split("/").every((part) => part !== "" && part !== "." && part !== "..");
}

function sha512(bytes: Uint8Array): string {
  return createHash("sha512").update(bytes).digest("hex");
}

async function zipEntries(file: string): Promise<string[]> {
  const { stdout } = await execute("unzip", ["-Z1", file], { maxBuffer: 4 * 1024 * 1024 });
  return stdout.trimEnd().split("\n");
}

async function zipEntry(file: string, entry: string): Promise<Uint8Array> {
  const { stdout } = await execute("unzip", ["-p", file, entry], { encoding: "buffer", maxBuffer: 32 * 1024 * 1024 });
  return new Uint8Array(stdout);
}

export function validatePackIndex(value: unknown, lock: Pick<PackLock, "minecraft" | "fabricLoader">): PackIndex {
  if (!value || typeof value !== "object") throw new Error("The modpack index is missing.");
  const index = value as PackIndex;
  if (index.formatVersion !== 1 || index.game !== "minecraft") throw new Error("Unsupported Modrinth modpack format.");
  if (index.dependencies?.minecraft !== lock.minecraft || index.dependencies?.["fabric-loader"] !== lock.fabricLoader) {
    throw new Error(`The modpack must target Minecraft ${lock.minecraft} with Fabric ${lock.fabricLoader}.`);
  }
  if (!Array.isArray(index.files) || !index.files.length) throw new Error("The modpack contains no files.");
  const paths = new Set<string>();
  for (const file of index.files) {
    if (!safePath(file.path) || paths.has(file.path)) throw new Error(`Invalid or repeated modpack path: ${file.path}`);
    paths.add(file.path);
    if (!/^[a-f0-9]{128}$/i.test(file.hashes?.sha512 ?? "")) throw new Error(`Missing SHA-512 for ${file.path}.`);
    if (!Array.isArray(file.downloads) || !file.downloads.some((url) => {
      try { return new URL(url).protocol === "https:"; } catch { return false; }
    })) throw new Error(`No HTTPS download for ${file.path}.`);
  }
  return index;
}

async function verifiedDownload(urls: string[], destination: string, hash: string): Promise<void> {
  if (existsSync(destination) && sha512(new Uint8Array(await readFile(destination))) === hash) return;
  let error: unknown;
  for (const url of urls) {
    try {
      if (new URL(url).protocol !== "https:") continue;
      const response = await fetch(url, { headers: { "User-Agent": userAgent } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (sha512(bytes) !== hash) throw new Error("SHA-512 mismatch");
      await mkdir(dirname(destination), { recursive: true, mode: 0o700 });
      await writeFile(destination, bytes, { mode: 0o600 });
      return;
    } catch (cause) { error = cause; }
  }
  throw new Error(`Could not download ${basename(destination)}: ${String(error)}`);
}

async function readPack(): Promise<{ lock: PackLock; index: PackIndex; entries: string[] }> {
  const lock = JSON.parse(await readFile(lockFile, "utf8")) as PackLock;
  if (lock.project !== project || !/^[a-f0-9]{128}$/i.test(lock.sha512)) throw new Error("Invalid Fabulously Optimized lock file.");
  const bytes = new Uint8Array(await readFile(packFile));
  if (sha512(bytes) !== lock.sha512) throw new Error("Fabulously Optimized .mrpack checksum mismatch.");
  const entries = await zipEntries(packFile);
  if (!entries.includes("modrinth.index.json")) throw new Error("The modpack has no index.");
  for (const entry of entries) {
    const path = entry.endsWith("/") ? entry.slice(0, -1) : entry;
    if (!safePath(path)) throw new Error(`Unsafe modpack archive path: ${entry}`);
  }
  const index = validatePackIndex(JSON.parse(Buffer.from(await zipEntry(packFile, "modrinth.index.json")).toString("utf8")), lock);
  if (index.versionId !== lock.versionNumber) throw new Error("The modpack version does not match its lock file.");
  return { lock, index, entries };
}

export async function inspectPinnedModpack(): Promise<{ files: number; overrides: number }> {
  const { index, entries } = await readPack();
  return { files: index.files.length, overrides: entries.filter((entry) =>
    (entry.startsWith("overrides/") || entry.startsWith("client-overrides/")) && !entry.endsWith("/")).length };
}

async function packOverrides(entries: string[]): Promise<Map<string, Uint8Array>> {
  const overrides = new Map<string, Uint8Array>();
  for (const entry of entries) {
    const prefix = entry.startsWith("client-overrides/") ? "client-overrides/" : "overrides/";
    if (!entry.startsWith(prefix) || entry.endsWith("/")) continue;
    const path = entry.slice(prefix.length);
    if (!safePath(path)) throw new Error(`Unsafe modpack override path: ${entry}`);
    overrides.set(path, await zipEntry(packFile, entry));
  }
  return overrides;
}

async function assertNoPatchedModCollision(file: string, path: string): Promise<void> {
  if (!path.startsWith("mods/") || !path.endsWith(".jar")) return;
  let metadata: { id?: string };
  try {
    metadata = JSON.parse(Buffer.from(await zipEntry(file, "fabric.mod.json")).toString("utf8")) as { id?: string };
  } catch { return; }
  if (metadata.id === "viafabricplus" || metadata.id === "viafabricplus-bedrock") {
    throw new Error(`Fabulously Optimized includes ${metadata.id}. Remove that mod from the pack before overlaying StackAnvil builds.`);
  }
}

export async function installModpack(instance: string): Promise<string> {
  const { lock, index, entries } = await readPack();
  const packMetadata = join(instance, "mmc-pack.json");
  const component = JSON.parse(await readFile(packMetadata, "utf8")) as {
    components: { uid: string; version: string; cachedVersion?: string }[];
  };
  if (component.components.find((part) => part.uid === "net.minecraft")?.version !== lock.minecraft) {
    throw new Error("The StackAnvil Prism instance and Fabulously Optimized use different Minecraft versions.");
  }
  const loader = component.components.find((part) => part.uid === "net.fabricmc.fabric-loader");
  if (!loader) throw new Error("The StackAnvil Prism instance has no Fabric loader.");
  loader.version = lock.fabricLoader;
  loader.cachedVersion = lock.fabricLoader;
  const minecraft = join(instance, "minecraft");
  const marker = join(instance, ".stackanvil-modpack.json");
  const previous = existsSync(marker) ? JSON.parse(await readFile(marker, "utf8")) as InstalledPack : { files: [] };
  const files = index.files.filter((file) => file.env?.client !== "unsupported");
  const overrides = await packOverrides(entries);
  const incoming = new Map<string, string | Uint8Array>();
  await mkdir(cacheDirectory, { recursive: true, mode: 0o700 });
  for (const file of files) {
    const cached = join(cacheDirectory, file.hashes.sha512);
    await verifiedDownload(file.downloads, cached, file.hashes.sha512);
    await assertNoPatchedModCollision(cached, file.path);
    incoming.set(file.path, cached);
  }
  for (const [path, bytes] of overrides) incoming.set(path, bytes);
  const patched = JSON.parse(await readFile(join(instance, ".stackanvil-managed"), "utf8")) as { files: string[] };
  for (const file of patched.files) {
    if (incoming.has(`mods/${file}`)) throw new Error(`The modpack would replace patched StackAnvil mod ${file}.`);
  }
  for (const path of previous.files) {
    if (!safePath(path)) throw new Error(`Unsafe path in installed modpack record: ${path}`);
    await rm(join(minecraft, path), { force: true });
  }
  for (const [path, source] of incoming) {
    const destination = join(minecraft, path);
    await mkdir(dirname(destination), { recursive: true, mode: 0o700 });
    if (typeof source === "string") await copyFile(source, destination);
    else await writeFile(destination, source, { mode: 0o600 });
  }
  const optionsFile = join(minecraft, "options.txt");
  const options = existsSync(optionsFile) ? await readFile(optionsFile, "utf8") : "";
  await writeFile(optionsFile, /^soundCategory_master:.*$/m.test(options)
    ? options.replace(/^soundCategory_master:.*$/m, "soundCategory_master:0.0")
    : `${options}${options.endsWith("\n") || !options ? "" : "\n"}soundCategory_master:0.0\n`);
  await writeFile(packMetadata, `${JSON.stringify(component, null, 2)}\n`);
  await writeFile(marker, `${JSON.stringify({ sha512: lock.sha512, files: [...incoming.keys()] }, null, 2)}\n`);
  return lock.versionNumber;
}

interface ModrinthVersion {
  id: string;
  version_number: string;
  files: { filename: string; url: string; primary: boolean; hashes: { sha512: string } }[];
}

export async function updateModpack(versionNumber?: string): Promise<void> {
  const current = JSON.parse(await readFile(lockFile, "utf8")) as PackLock;
  const params = new URLSearchParams({ game_versions: JSON.stringify([current.minecraft]), loaders: JSON.stringify(["fabric"]), include_changelog: "false" });
  const response = await fetch(`https://api.modrinth.com/v2/project/${project}/version?${params}`, { headers: { "User-Agent": userAgent } });
  if (!response.ok) throw new Error(`Modrinth lookup failed: HTTP ${response.status}`);
  const versions = await response.json() as ModrinthVersion[];
  const version = versionNumber ? versions.find((entry) => entry.version_number === versionNumber) : versions[0];
  const file = version?.files.find((entry) => entry.primary && entry.filename.endsWith(".mrpack"));
  if (!version || !file) throw new Error(`No Fabulously Optimized .mrpack for Minecraft ${current.minecraft}${versionNumber ? ` version ${versionNumber}` : ""}.`);
  const temporary = join(packDirectory, `${project}.mrpack.tmp`);
  await verifiedDownload([file.url], temporary, file.hashes.sha512);
  const raw = JSON.parse(Buffer.from(await zipEntry(temporary, "modrinth.index.json")).toString("utf8")) as PackIndex;
  const fabricLoader = raw.dependencies?.["fabric-loader"];
  if (!fabricLoader) throw new Error("The modpack does not specify a Fabric loader.");
  const index = validatePackIndex(raw, { minecraft: current.minecraft, fabricLoader });
  if (index.versionId !== version.version_number) throw new Error("Modrinth version and modpack index disagree.");
  const entries = await zipEntries(temporary);
  for (const entry of entries) {
    const path = entry.endsWith("/") ? entry.slice(0, -1) : entry;
    if (!safePath(path)) throw new Error(`Unsafe modpack archive path: ${entry}`);
  }
  await copyFile(temporary, packFile);
  await rm(temporary);
  await writeFile(lockFile, `${JSON.stringify({ ...current, versionId: version.id, versionNumber: version.version_number, fabricLoader,
    sha512: file.hashes.sha512, source: file.url }, null, 2)}\n`);
  console.log(`Pinned Fabulously Optimized ${version.version_number} for Minecraft ${current.minecraft}.`);
}

if (import.meta.main) {
  const [action, flag, version] = Bun.argv.slice(2);
  if (action !== "update" || (flag && flag !== "--version") || (flag && !version)) {
    console.error("Use bun run integration:modpack:update [--version VERSION].");
    process.exitCode = 1;
  } else {
    updateModpack(version).catch((error: unknown) => { console.error(error); process.exitCode = 1; });
  }
}
