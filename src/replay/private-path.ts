import { lstat, realpath } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

/** Canonicalize ancestor aliases without accepting a symbolic link as the owned root. */
export async function realDirectory(path: string): Promise<string> {
  const directory = resolve(path), state = await lstat(directory);
  if (!state.isDirectory() || state.isSymbolicLink()) throw new Error("The private profile root is not a real directory.");
  return realpath(directory);
}

/** Resolve only the existing parent; the child may not exist and must remain a direct child. */
export async function directChild(root: string, path: string, name = basename(path)): Promise<string> {
  const requested = resolve(path);
  if (basename(requested) !== name || await realpath(dirname(requested)) !== root) {
    throw new Error("The private output is outside its owned directory.");
  }
  return join(root, name);
}
