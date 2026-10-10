import { execFile } from "node:child_process";
import { readFile, readdir, realpath } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

async function canonical(path: string): Promise<string> {
  path = resolve(path);
  try { return await realpath(path); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    // Cached runtimes and prefixes may not exist yet; their existing ancestors still have aliases.
    const parent = dirname(path);
    if (parent === path) throw error;
    return join(await canonical(parent), basename(path));
  }
}

/** Inspect exact environment entries, never command-line text or logged environment data. */
export async function requireEnvironmentPathIdle(variable: "WINEPREFIX" | "BOL_HOME", path: string): Promise<void> {
  const target = await canonical(path);
  if (process.platform === "darwin") {
    const helper = fileURLToPath(new URL("../../scripts/replay-process-environment.py", import.meta.url));
    await new Promise<void>((accept, reject) => {
      execFile("python3", [helper, variable, target, String(process.pid)], { timeout: 15000, maxBuffer: 1024 }, error => {
        if (!error) accept();
        else reject(new Error(error.code === 10 ? "The native profile or prefix is in use." : "Cannot inspect native process ownership on macOS.", { cause: error }));
      });
    });
    return;
  }
  if (process.platform !== "linux") throw new Error("Native process ownership inspection is unavailable on this platform.");
  for (const name of await readdir("/proc")) {
    if (!/^\d+$/.test(name) || Number(name) === process.pid) continue;
    let environment: Buffer;
    try { environment = await readFile(`/proc/${name}/environ`); }
    catch (error) {
      if (["ENOENT", "ESRCH", "EACCES", "EPERM"].includes((error as NodeJS.ErrnoException).code ?? "")) continue;
      throw error;
    }
    for (const entry of environment.toString().split("\0")) {
      if (entry.startsWith(`${variable}=`) && await canonical(entry.slice(variable.length + 1)) === target) {
        throw new Error("The native profile or prefix is in use.");
      }
    }
  }
}
