import { constants } from "node:fs";
import { chmod, cp, lstat, readFile, readdir, readlink, realpath, rm, statfs, writeFile } from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";
import { requirePrivateCopySpace } from "../copy-space.ts";

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

/** Register only a newly created private game; call its release after owned processes stop. */
export async function prepareReplayInstanceCleanup(prism: string, game: string): Promise<() => Promise<void>> {
  const parts = relative(prism, game).split("/");
  if (parts.length !== 3 || parts[0] !== "instances" || parts[1] === ".." || parts[2] !== "minecraft") {
    throw new Error("Replay game must belong to the private Prism directory.");
  }
  const paths = [prism, join(prism, "instances"), join(prism, "instances", parts[1]!), game];
  const owners = await Promise.all(paths.map(async path => {
    const identity = await lstat(path);
    if (!identity.isDirectory() || identity.isSymbolicLink() || await realpath(path) !== path) {
      throw new Error("Replay game must use real private directories.");
    }
    return { path, identity };
  }));
  return async () => {
    for (const { path, identity } of owners) {
      const current = await lstat(path);
      if (!current.isDirectory() || current.isSymbolicLink() || current.dev !== identity.dev || current.ino !== identity.ino || await realpath(path) !== path) {
        throw new Error("Replay game directory changed; cache cleanup refused.");
      }
    }
    await rm(join(game, "mods"), { recursive: true, force: true });
    const downloads = join(game, "downloads");
    let entries: string[] = [];
    try {
      const state = await lstat(downloads);
      if (!state.isDirectory() || state.isSymbolicLink()) throw new Error("Replay download cache is not a real directory.");
      entries = await readdir(downloads);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    for (const entry of entries) {
      if (entry !== "log.json") await rm(join(downloads, entry), { recursive: true, force: true });
    }
    for (const relativeCache of ["config/viafabricplus/viabedrock/server_packs", "config/viabedrock/server_packs"]) {
      let cache = game;
      let present = true;
      for (const part of relativeCache.split("/")) {
        cache = join(cache, part);
        try {
          const state = await lstat(cache);
          if (!state.isDirectory() || state.isSymbolicLink() || await realpath(cache) !== cache) {
            throw new Error("Replay server pack cache must use real private directories.");
          }
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
          present = false;
          break;
        }
      }
      if (present) await rm(cache, { recursive: true, force: true });
    }
  };
}

/** Prism may rewrite cached files, so every launcher directory has a private writable copy. */
export async function prepareReplayPrismData(source: string, target: string): Promise<() => Promise<void>> {
  if (await realpath(source) !== source || await realpath(target) !== target || inside(source, target) || inside(target, source)) {
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
  requirePrivateCopySpace(requiredBytes, filesystem.bavail * filesystem.bsize);
  const identity = await lstat(target);
  // Call only after the owned launcher and game have stopped. Retain configuration,
  // instance logs and evidence; dependencies can be copied again for another run.
  const release = async () => {
    const current = await lstat(target);
    if (current.isSymbolicLink() || current.dev !== identity.dev || current.ino !== identity.ino || await realpath(target) !== target) {
      throw new Error("Replay Prism directory changed; dependency cleanup refused.");
    }
    for (const name of ["assets", "libraries", "java", "cache"]) {
      if (entries.some(entry => entry.name === name)) await rm(join(target, name), { recursive: true, force: true });
    }
  };
  try {
    for (const entry of entries) {
      const from = join(source, entry.name);
      const to = join(target, entry.name);
      await cp(from, to, { recursive: true, force: false, errorOnExist: true, verbatimSymlinks: true, mode: constants.COPYFILE_FICLONE });
      if (entry.isFile()) await chmod(to, 0o600);
    }
  } catch (error) {
    await release();
    throw error;
  }
  return release;
}
