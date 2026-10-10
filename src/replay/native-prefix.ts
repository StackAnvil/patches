import { constants } from "node:fs";
import { chmod, cp, lstat, mkdir, readFile, realpath, rename, rm, stat, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { directChild, realDirectory } from "./private-path.ts";
import { requireEnvironmentPathIdle } from "./process-environment.ts";

const ownerFile = ".stackanvil-replay-prefix.json";
const dataPatterns = [
  "drive_c/users/*/AppData/Roaming/Minecraft Bedrock/Users/*/games/com.mojang/minecraftpe",
  "drive_c/users/*/AppData/Local/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/minecraftpe",
];

interface PrefixOwner { schema: 1; source: string; device: string; inode: string; run: string }
export interface NativePrefixOptions {
  privateRoot: string;
  directory: string;
  sourcePrefix: string;
  port: number;
  assertIdle?: (prefix: string) => Promise<void>;
}

function inside(parent: string, child: string): boolean {
  const path = relative(parent, child);
  return path !== "" && path !== ".." && !path.startsWith(`..${sep}`) && !path.startsWith(sep);
}

/** BedrockOnLinux's versioned external_servers.txt format, restricted to loopback. */
export function nativeReplayServerLine(port: number, added: number): string {
  if (!Number.isInteger(port) || port < 1 || port > 65535 || !Number.isSafeInteger(added) || added < 0) {
    throw new Error("Invalid native replay server port or timestamp.");
  }
  return `1:StackAnvil isolated local replay:127.0.0.1:${port}:${added}\n`;
}

async function sourceIdentity(source: string, run: string): Promise<PrefixOwner> {
  const metadata = await stat(source, { bigint: true });
  if (!metadata.isDirectory()) throw new Error("The native replay prefix template is not a directory.");
  return { schema: 1, source, device: String(metadata.dev), inode: String(metadata.ino), run };
}

/** Check the clone marker and filesystem identity before any profile mutation. */
export async function validateNativeReplayPrefix(prefix: string, directory: string, sourcePrefix: string): Promise<void> {
  const [run, source] = await Promise.all([realDirectory(directory), realDirectory(sourcePrefix)]);
  await directChild(run, prefix, "native-prefix");
  if ((await lstat(prefix)).isSymbolicLink()) {
    throw new Error("The native replay prefix is outside its owned run.");
  }
  const actual = await realpath(prefix);
  if (actual !== join(run, "native-prefix")) throw new Error("The native replay prefix escapes its owned run.");
  const metadata = await stat(actual, { bigint: true });
  const expected = await sourceIdentity(source, run);
  if (String(metadata.dev) === expected.device && String(metadata.ino) === expected.inode) {
    throw new Error("The native replay prefix shares the source prefix inode.");
  }
  const marker = join(actual, ownerFile);
  if ((await lstat(marker)).isSymbolicLink()) throw new Error("The native replay prefix marker is a symbolic link.");
  const owner = JSON.parse(await readFile(marker, "utf8")) as PrefixOwner;
  if (owner.schema !== expected.schema || owner.source !== expected.source || owner.device !== expected.device
    || owner.inode !== expected.inode || owner.run !== expected.run) {
    throw new Error("The native replay prefix ownership marker does not match its source and run.");
  }
}

/** Match the launcher's exact NUL-delimited WINEPREFIX entry without logging it. */
export async function requireNativePrefixIdle(prefix: string): Promise<void> {
  await requireEnvironmentPathIdle("WINEPREFIX", prefix);
}

/** Create an exclusive per-run clone and seed it before the launcher can read it. */
export async function prepareNativeReplayPrefix(options: NativePrefixOptions): Promise<string> {
  const payload = nativeReplayServerLine(options.port, Math.floor(Date.now() / 1000));
  const [root, run, source] = await Promise.all([
    realDirectory(options.privateRoot), realDirectory(options.directory), realDirectory(options.sourcePrefix),
  ]);
  if (!inside(root, run) || inside(run, source) || inside(source, run) || run === source) {
    throw new Error("Native replay prefix preparation requires a private run and a separate source template.");
  }
  const idle = options.assertIdle ?? requireNativePrefixIdle;
  await idle(source);
  const prefix = join(run, "native-prefix");
  // mkdir is exclusive: a second preparer must not merge into another clone.
  await mkdir(prefix, { mode: 0o700 });
  await cp(source, prefix, {
    recursive: true, verbatimSymlinks: true, preserveTimestamps: true, mode: constants.COPYFILE_FICLONE,
    filter: path => path !== join(source, ownerFile),
  });
  await chmod(prefix, 0o700);
  await writeFile(join(prefix, ownerFile), JSON.stringify(await sourceIdentity(source, run)), { mode: 0o600, flag: "wx" });
  await validateNativeReplayPrefix(prefix, run, source);
  await idle(prefix);

  const folders = new Set<string>();
  for (const pattern of dataPatterns) {
    for await (const path of new Bun.Glob(pattern).scan({ cwd: prefix, onlyFiles: false })) {
      const folder = join(prefix, path);
      if (!(await stat(folder)).isDirectory()) continue;
      if (!inside(prefix, await realpath(folder))) throw new Error("The native game-data folder escapes its owned prefix.");
      folders.add(folder);
    }
  }
  if (!folders.size) throw new Error("The native prefix has no versioned Minecraft game-data folders.");
  const backup = join(run, "native-server-list-backup");
  await mkdir(backup, { mode: 0o700 });
  let index = 0;
  for (const folder of [...folders].sort()) {
    const target = join(folder, "external_servers.txt");
    let previous: Buffer | undefined;
    try {
      if ((await lstat(target)).isSymbolicLink()) throw new Error("The native server list is a symbolic link.");
      previous = await readFile(target);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    if (previous) await writeFile(join(backup, `${index}.original`), previous, { mode: 0o600, flag: "wx" });
    // Recheck ownership and idle state immediately before the atomic replacement.
    await validateNativeReplayPrefix(prefix, run, source);
    await idle(prefix);
    const temporary = join(folder, ".stackanvil-external-servers.tmp");
    let created = false;
    try {
      await writeFile(temporary, payload, { mode: 0o600, flag: "wx" });
      created = true;
      await rename(temporary, target);
    } finally { if (created) await rm(temporary, { force: true }); }
    index++;
  }
  await writeFile(join(run, "native-server-list-seed.json"), JSON.stringify({
    schema: 1, prefix, rowName: "StackAnvil isolated local replay", host: "127.0.0.1", port: options.port,
    folderCount: index, formatEvidence: "BedrockOnLinux bol/prefix.py:1193-1241",
  }), { mode: 0o600, flag: "wx" });
  return prefix;
}
