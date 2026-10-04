import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const platform = process.env.PLATFORM;
if (!platform || !/^(linux|windows|macos)-(x86_64|aarch64)$/.test(platform)) {
  throw new Error("Set PLATFORM to the helper's operating system and architecture");
}
const extension = platform.startsWith("windows-") ? ".exe" : "";
const nativeTarget = join(root, ".worktrees", "viafabricplus-bedrock", "native", "persona-assets", "target");
const directory = join(process.env.STACKANVIL_NATIVE_ASSETS ?? join(root, "native-assets"), platform);
await mkdir(directory, { recursive: true });
const name = `persona-assets${extension}`;
const target = join(directory, name);
await copyFile(join(nativeTarget, "release", name), target);
const checksum = createHash("sha256").update(await readFile(target)).digest("hex");
await writeFile(`${target}.sha256`, `${checksum}\n`);
