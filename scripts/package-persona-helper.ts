import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const platform = process.env.PLATFORM;
if (!platform || !/^(linux|windows|macos)-(x86_64|aarch64)$/.test(platform)) {
  throw new Error("Set PLATFORM to the helper's operating system and architecture");
}
const name = "persona-assets" + (process.platform === "win32" ? ".exe" : "");
const source = join(root, ".worktrees", "viafabricplus-bedrock", "native", "persona-assets", "target", "release", name);
const directory = join(process.env.STACKANVIL_NATIVE_ASSETS ?? join(root, "native-assets"), platform);
await mkdir(directory, { recursive: true });
const target = join(directory, name);
await copyFile(source, target);
const checksum = createHash("sha256").update(await readFile(target)).digest("hex");
await writeFile(`${target}.sha256`, `${checksum}\n`);
