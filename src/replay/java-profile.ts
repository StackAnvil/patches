import { constants } from "node:fs";
import { chmod, cp, lstat, readFile, readdir, readlink, realpath, symlink, writeFile } from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";

const sharedDirectories = new Set(["assets", "libraries"]);

function inside(directory: string, path: string): boolean {
  const name = relative(directory, path);
  return name !== ".." && !name.startsWith("../") && !isAbsolute(name);
}

async function validateTree(directory: string, path = directory): Promise<void> {
  const state = await lstat(path);
  if (state.isSymbolicLink()) {
    const link = await readlink(path);
    if (isAbsolute(link) || !inside(directory, resolve(path, "..", link)) || !inside(directory, await realpath(path))) {
      throw new Error("Prism source contains an external symlink.");
    }
  } else if (state.isDirectory()) {
    for (const entry of await readdir(path)) await validateTree(directory, join(path, entry));
  } else if (!state.isFile()) {
    throw new Error("Prism source contains an unsupported filesystem entry.");
  }
}

export async function validateReplayProfile(source: string): Promise<void> {
  if (await realpath(source) !== source) throw new Error("Replay profile source cannot be a symlink.");
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
  const sourceJava = join(source, "java");
  if (!configured.startsWith(sourceJava + "/") || !inside(sourceJava, await realpath(configured))) {
    throw new Error("Replay Java executable must come from the copied Prism runtime.");
  }
  const privateJava = join(target, "java");
  const path = join(privateJava, relative(sourceJava, configured));
  if (!inside(privateJava, await realpath(path))) throw new Error("Copied Java executable escaped its private runtime.");
  return path;
}

export async function rebindReplayJavaConfig(path: string, source: string, target: string): Promise<void> {
  const cfg = await readFile(path, "utf8");
  const configured = /^JavaPath=(.+)$/m.exec(cfg)?.[1];
  if (!configured) return;
  const java = await privateReplayJavaPath(source, target, configured);
  await writeFile(path, cfg.replace(/^JavaPath=.+$/m, `JavaPath=${java}`), { mode: 0o600 });
}

/** Only immutable assets/libraries are shared, with mandatory read-only sandbox mounts. */
export async function prepareReplayPrismData(source: string, target: string): Promise<string[]> {
  if (await realpath(source) !== source || await realpath(target) !== target || inside(source, target) || inside(target, source)) {
    throw new Error("Replay Prism data must use separate real directories.");
  }
  const entries = (await readdir(source, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name)).filter(entry =>
    entry.name !== "logs" && entry.name !== "instances" && entry.name !== "stackanvil-desktop" && !entry.name.startsWith("stackanvil-lighting-"));
  for (const entry of entries) {
    if (entry.isSymbolicLink() || (!entry.isDirectory() && !entry.isFile())) throw new Error("Unsupported Prism root entry.");
    if (entry.isDirectory()) await validateTree(join(source, entry.name));
    try {
      await lstat(join(target, entry.name));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
      throw error;
    }
    throw new Error("Replay Prism destination already contains source data.");
  }
  const readOnly: string[] = [];
  for (const entry of entries) {
    const from = join(source, entry.name);
    const to = join(target, entry.name);
    if (entry.isDirectory() && sharedDirectories.has(entry.name)) {
      await symlink(from, to, "dir");
      readOnly.push(from);
    } else {
      await cp(from, to, { recursive: true, force: false, errorOnExist: true, verbatimSymlinks: true, mode: constants.COPYFILE_FICLONE });
      if (entry.isFile()) await chmod(to, 0o600);
    }
  }
  return readOnly;
}
