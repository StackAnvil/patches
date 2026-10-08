import { createHash, randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { root } from "../model.ts";

type NativeBuild = (args: string[], cwd: string, env: NodeJS.ProcessEnv) => Promise<void>;

/** Cargo outputs and build receipts stay outside the source tree. */
export function createCaptureX11Builder(build: NativeBuild, directory = root) {
  const source = join(directory, "native", "capture-x11");
  const tools = join(directory, ".stackanvil", "tools");
  const binary = join(tools, "capture-x11");
  const receipt = `${binary}.sha256`;
  const target = join(tools, "capture-x11-build");
  let preparing: Promise<string> | undefined;

  async function sourceDigest(): Promise<string> {
    async function rustSources(path: string): Promise<string[]> {
      const files = await Promise.all((await readdir(path, { withFileTypes: true })).map(async entry => {
        const selected = join(path, entry.name);
        if (entry.isDirectory()) return rustSources(selected);
        return entry.isFile() && entry.name.endsWith(".rs") ? [selected] : [];
      }));
      return files.flat();
    }
    const files = [join(source, "Cargo.toml"), join(source, "Cargo.lock"), ...await rustSources(join(source, "src"))].sort();
    const contents = await Promise.all(files.map(file => readFile(file)));
    const digest = createHash("sha256");
    for (const [index, file] of files.entries()) {
      digest.update(relative(source, file)).update("\0").update(contents[index]!).update("\0");
    }
    return digest.digest("hex");
  }

  async function prepare(env: NodeJS.ProcessEnv): Promise<string> {
    const digest = await sourceDigest();
    const previous = await readFile(receipt, "utf8").catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
      return undefined;
    });
    if (previous === digest && existsSync(binary)) return binary;
    await mkdir(tools, { recursive: true });
    await build(["build", "--locked", "--release", "--manifest-path", join(source, "Cargo.toml"), "--target-dir", target], directory, env);
    const staging = `${binary}.${randomUUID()}.tmp`;
    const stagingReceipt = `${staging}.sha256`;
    try {
      await copyFile(join(target, "release", "capture-x11"), staging);
      await writeFile(stagingReceipt, digest);
      await rename(staging, binary);
      await rename(stagingReceipt, receipt);
    } finally {
      await Promise.all([rm(staging, { force: true }), rm(stagingReceipt, { force: true })]);
    }
    return binary;
  }

  return (env: NodeJS.ProcessEnv): Promise<string> => preparing ??= prepare(env).finally(() => { preparing = undefined; });
}
