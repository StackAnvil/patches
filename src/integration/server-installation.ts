import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream, type Stats } from "node:fs";
import { lstat, mkdir, readdir, realpath, rm, statfs } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { promisify } from "node:util";
import { requirePrivateCopySpace } from "../copy-space.ts";

const execute = promisify(execFile);
const dependencyEntries = ["bedrock_server", "definitions"];
const installationEntries = [
  "bedrock_server", "behavior_packs", "resource_packs", "definitions", "config", "data",
  "profanity_filter.wlist", "packetlimitconfig.json", "allowlist.json", "permissions.json",
];

interface InstallationCopyIo {
  availableBytes(path: string): Promise<number>;
  copy(source: string, destination: string): Promise<void>;
}

const filesystemIo: InstallationCopyIo = {
  availableBytes: async path => {
    const filesystem = await statfs(path);
    return filesystem.bavail * filesystem.bsize;
  },
  copy: async (source, destination) => {
    await execute("cp", ["-a", "--reflink=auto", source, destination]);
  },
};

async function copyBytes(path: string): Promise<number> {
  const state = await lstat(path);
  if (state.isDirectory()) {
    let bytes = 0;
    for (const entry of await readdir(path)) bytes += await copyBytes(join(path, entry));
    return bytes;
  }
  // Server probes write into these trees after copying. Do not retain links
  // that could route those writes back into the source installation.
  if (!state.isFile() || state.isSymbolicLink()) throw new Error("Bedrock server inputs must use regular files and directories.");
  return state.size;
}

async function treeDigest(path: string): Promise<string> {
  const digest = createHash("sha256");
  async function visit(path: string): Promise<void> {
    const state = await lstat(path);
    if (state.isSymbolicLink()) throw new Error("Server dependency cleanup refuses linked inputs.");
    if (state.isDirectory()) {
      digest.update("directory\0");
      for (const name of (await readdir(path)).sort()) {
        digest.update(JSON.stringify(name));
        await visit(join(path, name));
      }
      digest.update("end-directory\0");
    } else if (state.isFile()) {
      digest.update(`file:${state.size}\0`);
      for await (const chunk of createReadStream(path)) digest.update(chunk);
    } else throw new Error("Server dependency cleanup refuses unsupported inputs.");
  }
  await visit(path);
  return digest.digest("hex");
}

/** Release only unchanged copied dependencies, after every owned server process stops. */
async function prepareDependencyCleanup(destination: string): Promise<() => Promise<void>> {
  const paths = [...dependencyEntries.map(name => join(destination, name))];
  const parents = [dirname(destination), destination];
  for (const name of ["behavior_packs", "resource_packs"]) {
    const directory = join(destination, name);
    try {
      paths.push(...(await readdir(directory)).map(entry => join(directory, entry)));
      parents.push(directory);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  const owners = await Promise.all(parents.map(async path => ({ path, identity: await lstat(path) })));
  const dependencies: Array<{ path: string; identity: Stats; digest: string }> = [];
  for (const path of paths) {
    try {
      dependencies.push({ path, identity: await lstat(path), digest: await treeDigest(path) });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  async function validateOwners(): Promise<void> {
    for (const { path, identity } of owners) {
      const current = await lstat(path);
      if (!current.isDirectory() || current.isSymbolicLink() || current.dev !== identity.dev || current.ino !== identity.ino
        || await realpath(path) !== path) {
        throw new Error("Server dependency directory changed; cleanup refused.");
      }
    }
  }
  return async () => {
    await validateOwners();
    for (const { path, identity, digest } of dependencies) {
      let current;
      try { current = await lstat(path); } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
        throw error;
      }
      if (current.isSymbolicLink() || current.dev !== identity.dev || current.ino !== identity.ino) {
        throw new Error("Server dependency changed ownership; cleanup refused.");
      }
      if (await treeDigest(path) !== digest) continue;
      await validateOwners();
      const checked = await lstat(path);
      if (checked.dev !== identity.dev || checked.ino !== identity.ino) throw new Error("Server dependency changed ownership; cleanup refused.");
      await rm(path, { recursive: true });
    }
  };
}

/** Budget all installation files before creating a fresh, privately writable test server. */
export async function copyBedrockServerInstallation(source: string, destination: string, io: InstallationCopyIo = filesystemIo): Promise<() => Promise<void>> {
  source = resolve(source);
  destination = resolve(destination);
  if (await realpath(source) !== source || await realpath(dirname(destination)) !== dirname(destination)) {
    throw new Error("Bedrock server copies require real source and destination directories.");
  }
  const entries: string[] = [];
  let requiredBytes = 0;
  for (const entry of installationEntries) {
    const path = join(source, entry);
    try {
      await lstat(path);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT" && entry !== "bedrock_server") continue;
      throw error;
    }
    requiredBytes += await copyBytes(path);
    entries.push(path);
  }
  requirePrivateCopySpace(requiredBytes, await io.availableBytes(dirname(destination)));
  // Refuse to merge with an existing run, including after an interrupted copy.
  await mkdir(destination, { mode: 0o700 });
  const identity = await lstat(destination);
  try {
    for (const path of entries) await io.copy(path, destination);
    return await prepareDependencyCleanup(destination);
  } catch (error) {
    try {
      const current = await lstat(destination);
      if (!current.isDirectory() || current.isSymbolicLink() || current.dev !== identity.dev || current.ino !== identity.ino
        || await realpath(destination) !== destination) {
        throw new Error("Bedrock server copy directory changed; failed-copy cleanup refused.");
      }
      await rm(destination, { recursive: true });
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], "Bedrock server copy failed and its files were retained.");
    }
    throw error;
  }
}
