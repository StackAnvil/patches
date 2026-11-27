import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { Schema } from "effect";
import { isRecord, parseJson } from "../guards.ts";
import { javaTarget } from "../client-artifacts.ts";
import { root } from "../model.ts";
import { PackFileSchema, verifiedDownload, type PackFile } from "./modpack.ts";

const lockFile = join(root, "integration", "profiler.json");
const cacheDirectory = join(root, ".stackanvil", "integration", "cache", "profiler");

const ProfilerLockSchema = Schema.Struct({
  minecraft: Schema.String,
  mods: Schema.mutable(Schema.Array(PackFileSchema)),
  config: Schema.Record(Schema.String, Schema.Unknown),
  keys: Schema.Record(Schema.String, Schema.String),
});
export interface ProfilerLock {
  minecraft: string;
  mods: PackFile[];
  config: Record<string, unknown>;
  keys: Record<string, string>;
}

export async function readProfilerLock(): Promise<ProfilerLock> {
  const lock: ProfilerLock = parseJson(ProfilerLockSchema, await readFile(lockFile, "utf8"));
  if (lock.minecraft !== javaTarget.minecraft)
    throw new Error(
      `The profiler lock targets Minecraft ${lock.minecraft}, not ${javaTarget.minecraft}.`,
    );
  for (const mod of lock.mods) {
    if (
      !/^mods\/[A-Za-z0-9_.+-]+\.jar$/u.test(mod.path) ||
      !/^[a-f0-9]{128}$/u.test(mod.hashes.sha512)
    )
      throw new Error(`Invalid profiler mod entry: ${mod.path}`);
  }
  for (const [name, key] of Object.entries(lock.keys)) {
    if (!/^key\.[a-z0-9_.]+$/u.test(name) || !/^key\.(?:keyboard|mouse)\.[a-z0-9_.]+$/u.test(key))
      throw new Error(`Invalid profiler key binding: ${name}`);
  }
  return lock;
}

/** Sets each binding once, replacing an earlier value and keeping unrelated options. */
export function withKeyBindings(options: string, keys: Readonly<Record<string, string>>): string {
  let result = options;
  for (const [name, key] of Object.entries(keys)) {
    const option = `key_${name}`;
    const line = new RegExp(`^${option.replaceAll(".", String.raw`\.`)}:.*$`, "mu");
    result = line.test(result)
      ? result.replace(line, `${option}:${key}`)
      : `${result.trimEnd()}${result.trim() ? "\n" : ""}${option}:${key}\n`;
  }
  return result;
}

/**
 * Installs the pinned TaskManager profiler into a Java test client's game directory.
 * Its default keys collide with the inventory (E) and StackAnvil emotes (B), so the lock rebinds them.
 */
export async function installProfiler(game: string): Promise<void> {
  const lock = await readProfilerLock();
  for (const mod of lock.mods) {
    const cached = join(cacheDirectory, mod.hashes.sha512);
    await verifiedDownload(mod.downloads, cached, mod.hashes.sha512);
    const destination = join(game, mod.path);
    await mkdir(dirname(destination), { recursive: true, mode: 0o700 });
    await copyFile(cached, destination);
  }
  const configFile = join(game, "config", "taskmanager.json");
  const parsed: unknown = existsSync(configFile)
    ? JSON.parse(await readFile(configFile, "utf8"))
    : {};
  await mkdir(dirname(configFile), { recursive: true, mode: 0o700 });
  await writeFile(
    configFile,
    `${JSON.stringify({ ...(isRecord(parsed) ? parsed : {}), ...lock.config }, null, 2)}\n`,
    { mode: 0o600 },
  );
  const optionsFile = join(game, "options.txt");
  const options = existsSync(optionsFile) ? await readFile(optionsFile, "utf8") : "";
  await writeFile(optionsFile, withKeyBindings(options, lock.keys), { mode: 0o600 });
}
