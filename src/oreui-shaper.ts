import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const oreUiShaperResource = "assets/viafabricplus-bedrock/oreui-shaper";
export const oreUiShaperPlatforms = [
  "linux-x64",
  "linux-arm64",
  "windows-x64",
  "windows-arm64",
  "macos-x64",
  "macos-arm64",
] as const;
export type OreUiShaperPlatform = (typeof oreUiShaperPlatforms)[number];

const repository = dirname(dirname(fileURLToPath(import.meta.url)));
const sha256 = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");

/** Check the native file itself so a mislabeled resource cannot select another architecture. */
export function verifyOreUiShaperBinary(bytes: Buffer, target: OreUiShaperPlatform): void {
  const [platform, architecture] = target.split("-");
  const arm = architecture === "arm64";
  let matches = false;
  if (platform === "linux") {
    matches =
      bytes.length >= 64 &&
      bytes.subarray(0, 4).equals(Buffer.from([127, 69, 76, 70])) &&
      bytes[4] === 2 &&
      bytes[5] === 1 &&
      bytes.readUInt16LE(16) === 3 &&
      bytes.readUInt16LE(18) === (arm ? 183 : 62);
  } else if (platform === "windows") {
    if (bytes.length >= 64 && bytes.readUInt16LE(0) === 0x5a4d) {
      const pe = bytes.readUInt32LE(60);
      matches =
        pe >= 64 &&
        pe <= bytes.length - 26 &&
        bytes.readUInt32LE(pe) === 0x4550 &&
        bytes.readUInt16LE(pe + 4) === (arm ? 0xaa64 : 0x8664) &&
        (bytes.readUInt16LE(pe + 22) & 0x2000) !== 0 &&
        bytes.readUInt16LE(pe + 24) === 0x20b;
    }
  } else if (platform === "macos") {
    matches =
      bytes.length >= 32 &&
      bytes.readUInt32LE(0) === 0xfeedfacf &&
      bytes.readUInt32LE(4) === (arm ? 0x100000c : 0x1000007) &&
      bytes.readUInt32LE(12) === 6;
  }
  if (!matches) throw new Error(`OreUI shaper binary does not match ${target}`);
}

/** Validate one CMake installation before it can enter an add-on resource bundle. */
export async function verifyOreUiShaper(
  directory: string,
  target: OreUiShaperPlatform,
  sourceDirectory = join(repository, "native", "oreui-shaper"),
): Promise<void> {
  if (!oreUiShaperPlatforms.includes(target)) throw new Error("Unknown OreUI shaper platform");
  const resource = join(directory, oreUiShaperResource, target);
  const manifestPath = join(resource, "manifest.json");
  if ((await stat(manifestPath)).size > 8192) throw new Error("Oversized OreUI shaper manifest");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const source = JSON.parse(await readFile(join(sourceDirectory, "source.json"), "utf8"));
  const [platform, architecture] = target.split("-");
  const library =
    platform === "windows"
      ? "stackanvil_oreui_harfbuzz.dll"
      : platform === "macos"
        ? "libstackanvil_oreui_harfbuzz.dylib"
        : "libstackanvil_oreui_harfbuzz.so";
  if (
    !manifest ||
    manifest.format !== 1 ||
    manifest.engine !== "HarfBuzz" ||
    manifest.version !== source.version ||
    manifest.target !== "Bedrock 1.26.60.5 OreUI" ||
    manifest.platform !== platform ||
    manifest.architecture !== architecture ||
    manifest.sourceSha256 !== source.sha256 ||
    manifest.patchSha256 !== sha256(await readFile(join(sourceDirectory, "compatibility.patch"))) ||
    manifest.library !== library ||
    !/^[0-9a-f]{64}$/.test(manifest.sha256)
  )
    throw new Error(`Invalid OreUI shaper identity for ${target}`);
  const libraryPath = join(resource, library);
  const size = (await stat(libraryPath)).size;
  if (size === 0 || size > 16 * 1024 * 1024) throw new Error("Invalid OreUI shaper library size");
  const bytes = await readFile(libraryPath);
  if (sha256(bytes) !== manifest.sha256)
    throw new Error(`OreUI shaper checksum mismatch for ${target}`);
  verifyOreUiShaperBinary(bytes, target);
  if (
    !(await readFile(join(resource, "COPYING"))).equals(
      await readFile(join(sourceDirectory, "COPYING")),
    )
  )
    throw new Error(`Missing or changed HarfBuzz license for ${target}`);
}

if (import.meta.main) {
  const [directory, requested] = process.argv.slice(2);
  if (!directory || (requested && !oreUiShaperPlatforms.includes(requested as OreUiShaperPlatform)))
    throw new Error("Usage: bun src/oreui-shaper.ts <installed-resources> [platform-architecture]");
  for (const target of requested ? [requested as OreUiShaperPlatform] : oreUiShaperPlatforms)
    await verifyOreUiShaper(directory, target);
  console.log("OreUI shaper resources verified");
}
