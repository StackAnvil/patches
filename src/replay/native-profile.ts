import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { chmod, lstat, mkdir, readFile, readdir, realpath, rename, rm, symlink, writeFile } from "node:fs/promises";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";

const execute = promisify(execFile);
const ownerFile = ".stackanvil-source";

export interface NativeProfileOptions {
  source: string;
  privateRoot: string;
  runtime: string;
  assertIdle?: (profile: string) => Promise<void>;
}

export interface NativeProfile {
  source: string;
  runtime: string;
  settings: Record<string, unknown> & { game_dir: string; proton: string; mc_version: string };
}

function inside(parent: string, child: string): boolean {
  const path = relative(parent, child);
  return path !== "" && path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path);
}

async function plainFile(path: string): Promise<void> {
  const metadata = await lstat(path);
  if (!metadata.isFile() || metadata.isSymbolicLink()) throw new Error("The native profile file is not an owned regular file.");
}

async function directory(path: string): Promise<string> {
  const metadata = await lstat(path);
  if (!metadata.isDirectory() || metadata.isSymbolicLink()) throw new Error("The native profile root is not a real directory.");
  return realpath(path);
}

/** Refuse profile changes while an owned launcher is using either installation. */
export async function requireNativeProfileIdle(profile: string): Promise<void> {
  const expected = `BOL_HOME=${profile}`;
  for (const name of await readdir("/proc")) {
    if (!/^\d+$/.test(name) || Number(name) === process.pid) continue;
    let environment: Buffer;
    try { environment = await readFile(`/proc/${name}/environ`); }
    catch (error) {
      if (["ENOENT", "ESRCH", "EACCES", "EPERM"].includes((error as NodeJS.ErrnoException).code ?? "")) continue;
      throw error;
    }
    if (environment.toString().split("\0").includes(expected)) throw new Error("The native profile is in use.");
  }
}

async function atomicSettings(runtime: string, settings: NativeProfile["settings"], validate: () => Promise<void>): Promise<void> {
  const target = join(runtime, "settings.json"), temporary = join(runtime, `.stackanvil-settings-${randomUUID()}`);
  await validate();
  await plainFile(target);
  try {
    await writeFile(temporary, JSON.stringify(settings), { mode: 0o600, flag: "wx" });
    await validate();
    await plainFile(target);
    await rename(temporary, target);
  } finally { await rm(temporary, { force: true }); }
}

async function requireOwnedContent(runtime: string, validate: () => Promise<void>): Promise<void> {
  await validate();
  try {
    if (!(await lstat(join(runtime, "content"))).isSymbolicLink()) throw new Error("The native profile content path is not an owned symbolic link.");
  } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
}

async function ownedContent(runtime: string, game: string, validate: () => Promise<void>): Promise<void> {
  const content = join(runtime, "content"), temporary = join(runtime, `.stackanvil-content-${randomUUID()}`);
  await requireOwnedContent(runtime, validate);
  try {
    await symlink(relative(runtime, game), temporary, "dir");
    await requireOwnedContent(runtime, validate);
    await rename(temporary, content);
  } finally { await rm(temporary, { force: true }); }
}

/** Copy launcher state without allowing its absolute content link to escape the copy. */
export async function prepareNativeProfile(options: NativeProfileOptions): Promise<NativeProfile> {
  const source = await directory(resolve(options.source));
  const privateRoot = await directory(resolve(options.privateRoot));
  const runtime = resolve(options.runtime);
  if (runtime !== join(privateRoot, "native-client") || source === runtime || inside(source, runtime) || inside(runtime, source)) {
    throw new Error("The native profile requires a separate owned installation directory.");
  }
  await plainFile(join(source, "settings.json"));
  const original = JSON.parse(await readFile(join(source, "settings.json"), "utf8")) as Record<string, unknown>;
  if (typeof original.mc_version !== "string" || !/^1\.26\.51(?:\.|$)/.test(original.mc_version)) {
    throw new Error("Native recording requires the official Bedrock 1.26.51 client.");
  }
  const sourcePaths: Record<string, string> = {};
  for (const key of ["game_dir", "proton"] as const) {
    if (typeof original[key] !== "string") throw new Error("The native installation path is missing.");
    const path = await realpath(original[key]);
    if (!inside(source, path) || !(await lstat(path)).isDirectory()) throw new Error("The native installation path escapes its source profile.");
    sourcePaths[key] = path;
  }
  const idle = options.assertIdle ?? requireNativeProfileIdle;
  await idle(source);
  try {
    const existing = await directory(runtime);
    if (existing !== runtime) throw new Error("The native profile root escapes its owned installation.");
    await plainFile(join(runtime, ownerFile));
    if ((await readFile(join(runtime, ownerFile), "utf8")) !== source) throw new Error("The native profile belongs to a different source installation.");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    // An existing partial copy must never be merged with a second preparation.
    await mkdir(runtime, { mode: 0o700 });
    await execute("cp", ["-a", "--reflink=auto", `${source}${sep}.`, runtime]);
    await chmod(runtime, 0o700);
    const marker = join(runtime, ownerFile);
    try { await plainFile(marker); }
    catch (markerError) { if ((markerError as NodeJS.ErrnoException).code !== "ENOENT") throw markerError; }
    await writeFile(marker, source, { mode: 0o600 });
    await chmod(marker, 0o600);
  }
  const validate = async () => {
    if (await directory(runtime) !== runtime) throw new Error("The native profile root escapes its owned installation.");
    await plainFile(join(runtime, ownerFile));
    if ((await readFile(join(runtime, ownerFile), "utf8")) !== source) throw new Error("The native profile belongs to a different source installation.");
  };
  await idle(runtime);
  await validate();
  await plainFile(join(runtime, "settings.json"));
  const settings = JSON.parse(await readFile(join(runtime, "settings.json"), "utf8")) as NativeProfile["settings"];
  settings.mc_version = original.mc_version;
  for (const key of ["game_dir", "proton"] as const) {
    const mapped = join(runtime, relative(source, sourcePaths[key]!));
    const actual = await realpath(mapped);
    if (!inside(runtime, actual) || !(await lstat(actual)).isDirectory()) throw new Error("The copied installation path escapes its private profile.");
    settings[key] = actual;
  }
  const executable = await realpath(join(settings.game_dir, "Minecraft.Windows.exe"));
  if (!inside(runtime, executable) || !(await lstat(executable)).isFile()) throw new Error("The copied native executable escapes its private profile.");
  await idle(runtime);
  await requireOwnedContent(runtime, validate);
  await atomicSettings(runtime, settings, validate);
  await ownedContent(runtime, settings.game_dir, validate);
  if (await realpath(join(runtime, "content", "Minecraft.Windows.exe")) !== executable) {
    throw new Error("The native launcher content does not select its copied executable.");
  }
  return { source, runtime, settings };
}
