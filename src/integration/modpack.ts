import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { Schema } from "effect";
import { isRecord, parseJson, required } from "../guards.ts";
import { root } from "../model.ts";
import { print, printError } from "../output.ts";
import { execFileAsync as execute } from "../process.ts";

const project = "fabulously-optimized";
const packDirectory = join(root, "integration", "modpacks");
const packFile = join(packDirectory, `${project}.mrpack`);
const lockFile = join(packDirectory, `${project}.json`);
const cacheDirectory = join(root, ".stackanvil", "integration", "cache", "modpack");
const userAgent = "StackAnvil/integration-tests (https://github.com/StackAnvil/patches)";

const PackLockSchema = Schema.Struct({
  project: Schema.String,
  versionId: Schema.String,
  versionNumber: Schema.String,
  minecraft: Schema.String,
  fabricLoader: Schema.String,
  sha512: Schema.String,
  source: Schema.String,
});
type PackLock = typeof PackLockSchema.Type;

export const PackFileSchema = Schema.Struct({
  path: Schema.String,
  downloads: Schema.mutable(Schema.Array(Schema.String)),
  hashes: Schema.Struct({ sha512: Schema.String }),
  env: Schema.optionalKey(Schema.Struct({ client: Schema.optionalKey(Schema.String) })),
});
export interface PackFile {
  path: string;
  downloads: string[];
  hashes: { sha512: string };
  env?: { client?: string };
}

const PackIndexSchema = Schema.Struct({
  formatVersion: Schema.Finite,
  game: Schema.String,
  versionId: Schema.String,
  dependencies: Schema.Record(Schema.String, Schema.String),
  files: Schema.mutable(Schema.Array(PackFileSchema)),
});
interface PackIndex {
  formatVersion: number;
  game: string;
  versionId: string;
  dependencies: Record<string, string>;
  files: PackFile[];
}

const InstalledFilesSchema = Schema.Struct({ files: Schema.Array(Schema.String) });
const MinecraftComponentsSchema = Schema.Struct({
  components: Schema.mutable(
    Schema.Array(
      Schema.Struct({
        uid: Schema.String,
        version: Schema.String,
        cachedVersion: Schema.optionalKey(Schema.String),
      }),
    ),
  ),
});
interface MinecraftComponents {
  components: { uid: string; version: string; cachedVersion?: string }[];
}

function safePath(path: string): boolean {
  return (
    path.length > 0 &&
    !path.startsWith("/") &&
    !path.includes("\\") &&
    !path.includes("\0") &&
    path.split("/").every((part) => part !== "" && part !== "." && part !== "..")
  );
}

function sha512(bytes: Uint8Array): string {
  return createHash("sha512").update(bytes).digest("hex");
}

async function zipEntries(file: string): Promise<string[]> {
  const { stdout } = await execute("unzip", ["-Z1", file], { maxBuffer: 4 * 1024 * 1024 });
  return stdout.trimEnd().split("\n");
}

/** Info-ZIP unzip treats `*`, `?`, and `[` in member names as wildcards. Match one member literally. */
function literalZipMember(entry: string): string {
  return entry.replaceAll(/[[*?]/gu, "[$&]");
}

async function zipEntry(file: string, entry: string): Promise<Uint8Array> {
  const { stdout } = await execute("unzip", ["-p", file, literalZipMember(entry)], {
    encoding: "buffer",
    maxBuffer: 32 * 1024 * 1024,
  });
  return new Uint8Array(stdout);
}

export function validatePackIndex(
  value: unknown,
  lock: Pick<PackLock, "minecraft" | "fabricLoader">,
): PackIndex {
  if (!isRecord(value)) throw new Error("The modpack index is missing.");
  if (value["formatVersion"] !== 1 || value["game"] !== "minecraft")
    throw new Error("Unsupported Modrinth modpack format.");
  const dependencies = isRecord(value["dependencies"]) ? value["dependencies"] : {};
  if (
    dependencies["minecraft"] !== lock.minecraft ||
    dependencies["fabric-loader"] !== lock.fabricLoader
  ) {
    throw new Error(
      `The modpack must target Minecraft ${lock.minecraft} with Fabric ${lock.fabricLoader}.`,
    );
  }
  const files: unknown = value["files"];
  if (!Array.isArray(files) || files.length === 0)
    throw new Error("The modpack contains no files.");
  const entries: readonly unknown[] = files;
  const paths = new Set<string>();
  for (const file of entries) {
    const path = isRecord(file) ? file["path"] : undefined;
    if (typeof path !== "string" || !safePath(path) || paths.has(path))
      throw new Error(`Invalid or repeated modpack path: ${String(path)}`);
    paths.add(path);
    const hash = isRecord(file) && isRecord(file["hashes"]) ? file["hashes"]["sha512"] : undefined;
    if (typeof hash !== "string" || !/^[a-f0-9]{128}$/iu.test(hash))
      throw new Error(`Missing SHA-512 for ${path}.`);
    const downloads: unknown = isRecord(file) ? file["downloads"] : undefined;
    if (
      !Array.isArray(downloads) ||
      !downloads.some((url: unknown) => {
        if (typeof url !== "string") return false;
        try {
          return new URL(url).protocol === "https:";
        } catch {
          return false;
        }
      })
    )
      throw new Error(`No HTTPS download for ${path}.`);
  }
  if (!Schema.is(PackIndexSchema)(value)) throw new Error("The modpack index is malformed.");
  return value;
}

export async function verifiedDownload(
  urls: string[],
  destination: string,
  hash: string,
): Promise<void> {
  if (existsSync(destination) && sha512(new Uint8Array(await readFile(destination))) === hash)
    return;
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
    } catch (cause) {
      error = cause;
    }
  }
  throw new Error(`Could not download ${basename(destination)}: ${String(error)}`);
}

async function readPack(): Promise<{ lock: PackLock; index: PackIndex; entries: string[] }> {
  const lock = parseJson(PackLockSchema, await readFile(lockFile, "utf8"));
  if (lock.project !== project || !/^[a-f0-9]{128}$/iu.test(lock.sha512))
    throw new Error("Invalid Fabulously Optimized lock file.");
  const bytes = new Uint8Array(await readFile(packFile));
  if (sha512(bytes) !== lock.sha512)
    throw new Error("Fabulously Optimized .mrpack checksum mismatch.");
  const entries = await zipEntries(packFile);
  if (!entries.includes("modrinth.index.json")) throw new Error("The modpack has no index.");
  for (const entry of entries) {
    const path = entry.endsWith("/") ? entry.slice(0, -1) : entry;
    if (!safePath(path)) throw new Error(`Unsafe modpack archive path: ${entry}`);
  }
  const index = validatePackIndex(
    JSON.parse(Buffer.from(await zipEntry(packFile, "modrinth.index.json")).toString("utf8")),
    lock,
  );
  if (index.versionId !== lock.versionNumber)
    throw new Error("The modpack version does not match its lock file.");
  return { lock, index, entries };
}

export async function inspectPinnedModpack(): Promise<{ files: number; overrides: number }> {
  const { index, entries } = await readPack();
  return {
    files: index.files.length,
    overrides: entries.filter(
      (entry) =>
        (entry.startsWith("overrides/") || entry.startsWith("client-overrides/")) &&
        !entry.endsWith("/"),
    ).length,
  };
}

export async function packOverrides(
  file: string,
  entries: readonly string[],
): Promise<Map<string, Uint8Array>> {
  const overrides = new Map<string, Uint8Array>();
  // Client overrides take precedence over shared overrides, whatever the archive order.
  for (const prefix of ["overrides/", "client-overrides/"]) {
    for (const entry of entries) {
      if (!entry.startsWith(prefix) || entry.endsWith("/")) continue;
      const path = entry.slice(prefix.length);
      if (!safePath(path)) throw new Error(`Unsafe modpack override path: ${entry}`);
      overrides.set(path, await zipEntry(file, entry));
    }
  }
  return overrides;
}

async function assertNoPatchedModCollision(file: string, path: string): Promise<void> {
  if (!path.startsWith("mods/") || !path.endsWith(".jar")) return;
  let metadata: unknown;
  try {
    metadata = JSON.parse(Buffer.from(await zipEntry(file, "fabric.mod.json")).toString("utf8"));
  } catch {
    return;
  }
  if (!isRecord(metadata)) return;
  if (metadata["id"] === "viafabricplus" || metadata["id"] === "viafabricplus-bedrock") {
    throw new Error(
      `Fabulously Optimized includes ${metadata["id"]}. Remove that mod from the pack before overlaying StackAnvil builds.`,
    );
  }
}

export function replacePackFiles(
  index: PackIndex,
  replacements: Readonly<Record<string, PackFile>>,
): PackIndex {
  for (const path of Object.keys(replacements)) {
    if (!index.files.some((file) => file.path === path))
      throw new Error(`The pinned modpack has no replacement target: ${path}`);
  }
  return validatePackIndex(
    { ...index, files: index.files.map((file) => replacements[file.path] ?? file) },
    {
      minecraft: required(index.dependencies["minecraft"], "The modpack Minecraft dependency"),
      fabricLoader: required(
        index.dependencies["fabric-loader"],
        "The modpack Fabric Loader dependency",
      ),
    },
  );
}

export async function installModpack(
  instance: string,
  replacements: Readonly<Record<string, PackFile>> = {},
): Promise<string> {
  const { lock, index, entries } = await readPack();
  const packMetadata = join(instance, "mmc-pack.json");
  const component: MinecraftComponents = parseJson(
    MinecraftComponentsSchema,
    await readFile(packMetadata, "utf8"),
  );
  if (
    component.components.find((part) => part.uid === "net.minecraft")?.version !== lock.minecraft
  ) {
    throw new Error(
      "The StackAnvil Prism instance and Fabulously Optimized use different Minecraft versions.",
    );
  }
  const loader = component.components.find((part) => part.uid === "net.fabricmc.fabric-loader");
  if (!loader) throw new Error("The StackAnvil Prism instance has no Fabric loader.");
  loader.version = lock.fabricLoader;
  loader.cachedVersion = lock.fabricLoader;
  const minecraft = join(instance, "minecraft");
  const marker = join(instance, ".stackanvil-modpack.json");
  const previous = existsSync(marker)
    ? parseJson(InstalledFilesSchema, await readFile(marker, "utf8"))
    : { files: [] };
  const files = replacePackFiles(index, replacements).files.filter(
    (file) => file.env?.client !== "unsupported",
  );
  const overrides = await packOverrides(packFile, entries);
  const incoming = new Map<string, string | Uint8Array>();
  await mkdir(cacheDirectory, { recursive: true, mode: 0o700 });
  for (const file of files) {
    const cached = join(cacheDirectory, file.hashes.sha512);
    await verifiedDownload(file.downloads, cached, file.hashes.sha512);
    await assertNoPatchedModCollision(cached, file.path);
    incoming.set(file.path, cached);
  }
  for (const [path, bytes] of overrides) incoming.set(path, bytes);
  const patched = parseJson(
    InstalledFilesSchema,
    await readFile(join(instance, ".stackanvil-managed"), "utf8"),
  );
  for (const file of patched.files) {
    if (incoming.has(`mods/${file}`))
      throw new Error(`The modpack would replace patched StackAnvil mod ${file}.`);
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
  await writeFile(
    optionsFile,
    /^soundCategory_master:.*$/mu.test(options)
      ? options.replace(/^soundCategory_master:.*$/mu, "soundCategory_master:0.0")
      : `${options}${options.endsWith("\n") || !options ? "" : "\n"}soundCategory_master:0.0\n`,
  );
  await writeFile(packMetadata, `${JSON.stringify(component, null, 2)}\n`);
  await writeFile(
    marker,
    `${JSON.stringify({ sha512: lock.sha512, files: [...incoming.keys()] }, null, 2)}\n`,
  );
  return lock.versionNumber;
}

const ModrinthVersionsSchema = Schema.Array(
  Schema.Struct({
    id: Schema.String,
    version_number: Schema.String,
    files: Schema.Array(
      Schema.Struct({
        filename: Schema.String,
        url: Schema.String,
        primary: Schema.Boolean,
        hashes: Schema.Struct({ sha512: Schema.String }),
      }),
    ),
  }),
);

export async function updateModpack(versionNumber?: string): Promise<void> {
  const current = parseJson(PackLockSchema, await readFile(lockFile, "utf8"));
  const params = new URLSearchParams({
    game_versions: JSON.stringify([current.minecraft]),
    loaders: JSON.stringify(["fabric"]),
    include_changelog: "false",
  });
  const response = await fetch(`https://api.modrinth.com/v2/project/${project}/version?${params}`, {
    headers: { "User-Agent": userAgent },
  });
  if (!response.ok) throw new Error(`Modrinth lookup failed: HTTP ${response.status}`);
  const versions = parseJson(ModrinthVersionsSchema, await response.text());
  const version = versionNumber
    ? versions.find((entry) => entry.version_number === versionNumber)
    : versions[0];
  const file = version?.files.find((entry) => entry.primary && entry.filename.endsWith(".mrpack"));
  if (!version || !file)
    throw new Error(
      `No Fabulously Optimized .mrpack for Minecraft ${current.minecraft}${versionNumber ? ` version ${versionNumber}` : ""}.`,
    );
  const temporary = join(packDirectory, `${project}.mrpack.tmp`);
  await verifiedDownload([file.url], temporary, file.hashes.sha512);
  const raw: unknown = JSON.parse(
    Buffer.from(await zipEntry(temporary, "modrinth.index.json")).toString("utf8"),
  );
  const fabricLoader =
    isRecord(raw) && isRecord(raw["dependencies"])
      ? raw["dependencies"]["fabric-loader"]
      : undefined;
  if (typeof fabricLoader !== "string" || !fabricLoader)
    throw new Error("The modpack does not specify a Fabric loader.");
  const index = validatePackIndex(raw, { minecraft: current.minecraft, fabricLoader });
  if (index.versionId !== version.version_number)
    throw new Error("Modrinth version and modpack index disagree.");
  const entries = await zipEntries(temporary);
  for (const entry of entries) {
    const path = entry.endsWith("/") ? entry.slice(0, -1) : entry;
    if (!safePath(path)) throw new Error(`Unsafe modpack archive path: ${entry}`);
  }
  await copyFile(temporary, packFile);
  await rm(temporary);
  await writeFile(
    lockFile,
    `${JSON.stringify(
      {
        ...current,
        versionId: version.id,
        versionNumber: version.version_number,
        fabricLoader,
        sha512: file.hashes.sha512,
        source: file.url,
      },
      null,
      2,
    )}\n`,
  );
  print(
    `Pinned Fabulously Optimized ${version.version_number} for Minecraft ${current.minecraft}.`,
  );
}

if (import.meta.main) {
  const [action, flag, version] = Bun.argv.slice(2);
  if (action !== "update" || (flag && flag !== "--version") || (flag && !version)) {
    printError("Use bun run integration:modpack:update [--version VERSION].");
    process.exitCode = 1;
  } else {
    try {
      await updateModpack(version);
    } catch (error: unknown) {
      printError(error);
      process.exitCode = 1;
    }
  }
}
