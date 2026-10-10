import { constants } from "node:fs";
import { chmod, cp, lstat, readFile, readdir, readlink, realpath, statfs, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { realDirectory } from "./private-path.ts";

const reserveBytes = 5 * 1024 ** 3;

function inside(directory: string, path: string): boolean {
  const name = relative(directory, path);
  return name !== ".." && !name.startsWith("../") && !isAbsolute(name);
}

async function validateTree(directory: string, path = directory): Promise<number> {
  const state = await lstat(path);
  if (state.isSymbolicLink()) {
    const link = await readlink(path);
    if (isAbsolute(link) || !inside(directory, resolve(path, "..", link)) || !inside(directory, await realpath(path))) {
      throw new Error("Prism source contains an external symlink.");
    }
  } else if (state.isDirectory()) {
    let bytes = 0;
    for (const entry of await readdir(path)) bytes += await validateTree(directory, join(path, entry));
    return bytes;
  } else if (!state.isFile()) {
    throw new Error("Prism source contains an unsupported filesystem entry.");
  }
  return state.isFile() ? state.size : 0;
}

export async function validateReplayProfile(source: string): Promise<void> {
  source = await realDirectory(source);
  async function validate(path: string): Promise<void> {
    const state = await lstat(path);
    if (state.isSymbolicLink()) throw new Error("Replay profile inputs cannot contain write-through symlinks.");
    if (state.isDirectory()) {
      for (const name of await readdir(path)) await validate(join(path, name));
    } else if (!state.isFile()) throw new Error("Unsupported replay profile input.");
  }
  for (const path of ["instance.cfg", "mmc-pack.json", "minecraft/options.txt", "minecraft/config"]) {
    try {
      await validate(join(source, path));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT" || path === "instance.cfg" || path === "mmc-pack.json") throw error;
    }
  }
}

export async function privateReplayJavaPath(source: string, target: string, configured: string): Promise<string> {
  if (!isAbsolute(configured)) throw new Error("Replay Java executable must use an absolute copied runtime path.");
  const [sourceRoot, targetRoot, configuredParent] = await Promise.all([
    realDirectory(source), realDirectory(target), realpath(dirname(configured)),
  ]);
  const sourceJava = join(sourceRoot, "java");
  const selected = join(configuredParent, basename(configured));
  const sourceExecutable = await realpath(configured);
  if (!inside(sourceJava, selected) || !inside(sourceJava, sourceExecutable) || !(await lstat(sourceExecutable)).isFile()) {
    throw new Error("Replay Java executable must come from the copied Prism runtime.");
  }
  const privateJava = join(targetRoot, "java");
  const path = join(privateJava, relative(sourceJava, selected));
  const copiedExecutable = await realpath(path);
  if (!inside(privateJava, copiedExecutable) || !(await lstat(copiedExecutable)).isFile()) throw new Error("Copied Java executable escaped its private runtime.");
  return path;
}

export async function rebindReplayJavaConfig(path: string, source: string, target: string): Promise<void> {
  const cfg = await readFile(path, "utf8");
  const configured = /^JavaPath=(.+)$/m.exec(cfg)?.[1];
  if (!configured) return;
  const java = await privateReplayJavaPath(source, target, configured);
  await writeFile(path, cfg.replace(/^JavaPath=.+$/m, `JavaPath=${java}`), { mode: 0o600 });
}

export function requireReplayCopySpace(bytes: number, available: number): void {
  if (!Number.isSafeInteger(bytes) || bytes < 0 || !Number.isFinite(available) || available < bytes + reserveBytes) {
    throw new Error("Private Prism copies require their full file size plus 5 GiB of free disk reserve.");
  }
}

/** Prism may rewrite cached files, so every launcher directory has a private writable copy. */
export async function prepareReplayPrismData(source: string, target: string): Promise<void> {
  [source, target] = await Promise.all([realDirectory(source), realDirectory(target)]);
  if (inside(source, target) || inside(target, source)) {
    throw new Error("Replay Prism data must use separate real directories.");
  }
  const entries = (await readdir(source, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name)).filter(entry =>
    entry.name !== "logs" && entry.name !== "instances" && entry.name !== "stackanvil-desktop" && !entry.name.startsWith("stackanvil-lighting-"));
  let requiredBytes = 0;
  for (const entry of entries) {
    if (entry.isSymbolicLink() || (!entry.isDirectory() && !entry.isFile())) throw new Error("Unsupported Prism root entry.");
    requiredBytes += entry.isDirectory() ? await validateTree(join(source, entry.name)) : (await lstat(join(source, entry.name))).size;
    try {
      await lstat(join(target, entry.name));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
      throw error;
    }
    throw new Error("Replay Prism destination already contains source data.");
  }
  const filesystem = await statfs(target);
  requireReplayCopySpace(requiredBytes, filesystem.bavail * filesystem.bsize);
  for (const entry of entries) {
    const from = join(source, entry.name);
    const to = join(target, entry.name);
    await cp(from, to, { recursive: true, force: false, errorOnExist: true, verbatimSymlinks: true, mode: constants.COPYFILE_FICLONE });
    if (entry.isFile()) await chmod(to, 0o600);
  }
}
