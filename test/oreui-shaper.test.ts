import { afterEach, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  oreUiShaperPlatforms,
  oreUiShaperResource,
  verifyOreUiShaper,
  verifyOreUiShaperBinary,
  type OreUiShaperPlatform,
} from "../src/oreui-shaper.ts";

const temporary: string[] = [];
afterEach(async () => {
  await Promise.all(temporary.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

function header(target: OreUiShaperPlatform): Buffer {
  const bytes = Buffer.alloc(128);
  const arm = target.endsWith("arm64");
  if (target.startsWith("linux")) {
    bytes.set([127, 69, 76, 70, 2, 1]);
    bytes.writeUInt16LE(3, 16);
    bytes.writeUInt16LE(arm ? 183 : 62, 18);
  } else if (target.startsWith("windows")) {
    bytes.writeUInt16LE(0x5a4d);
    bytes.writeUInt32LE(64, 60);
    bytes.writeUInt32LE(0x4550, 64);
    bytes.writeUInt16LE(arm ? 0xaa64 : 0x8664, 68);
    bytes.writeUInt16LE(0x2000, 86);
    bytes.writeUInt16LE(0x20b, 88);
  } else {
    bytes.writeUInt32LE(0xfeedfacf);
    bytes.writeUInt32LE(arm ? 0x100000c : 0x1000007, 4);
    bytes.writeUInt32LE(6, 12);
  }
  return bytes;
}

test("native headers reject another platform or architecture before packaging", () => {
  for (const target of oreUiShaperPlatforms) {
    const bytes = header(target);
    expect(() => verifyOreUiShaperBinary(bytes, target)).not.toThrow();
    for (const wrong of oreUiShaperPlatforms.filter((candidate) => candidate !== target))
      expect(() => verifyOreUiShaperBinary(bytes, wrong)).toThrow("does not match");
  }
  const invalidPe = header("windows-x64");
  invalidPe.writeUInt32LE(0xffffffff, 60);
  expect(() => verifyOreUiShaperBinary(invalidPe, "windows-x64")).toThrow("does not match");
});

async function installation() {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-oreui-shaper-"));
  temporary.push(directory);
  const resource = join(directory, oreUiShaperResource, "linux-x64");
  await mkdir(resource, { recursive: true });
  const sourceDirectory = join(import.meta.dir, "..", "native", "oreui-shaper");
  const source = JSON.parse(await readFile(join(sourceDirectory, "source.json"), "utf8"));
  const hash = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
  const bytes = header("linux-x64");
  const manifest = {
    format: 1,
    engine: "HarfBuzz",
    version: source.version,
    target: "Bedrock 1.26.60.5 OreUI",
    platform: "linux",
    architecture: "x64",
    sourceSha256: source.sha256,
    patchSha256: hash(await readFile(join(sourceDirectory, "compatibility.patch"))),
    library: "libstackanvil_oreui_harfbuzz.so",
    sha256: hash(bytes),
  };
  const manifestPath = join(resource, "manifest.json");
  const libraryPath = join(resource, manifest.library);
  await writeFile(manifestPath, JSON.stringify(manifest));
  await writeFile(libraryPath, bytes);
  await writeFile(join(resource, "COPYING"), await readFile(join(sourceDirectory, "COPYING")));
  return { directory, resource, manifest, manifestPath, libraryPath, hash };
}

test("installed engine rejects stale policy, modified bytes, and a mislabeled binary", async () => {
  const fixture = await installation();
  await verifyOreUiShaper(fixture.directory, "linux-x64");
  await writeFile(
    fixture.manifestPath,
    JSON.stringify({ ...fixture.manifest, patchSha256: "0".repeat(64) }),
  );
  await expect(verifyOreUiShaper(fixture.directory, "linux-x64")).rejects.toThrow("identity");
  await writeFile(fixture.manifestPath, JSON.stringify(fixture.manifest));
  const wrong = header("linux-arm64");
  await writeFile(fixture.libraryPath, wrong);
  await expect(verifyOreUiShaper(fixture.directory, "linux-x64")).rejects.toThrow("checksum");
  await writeFile(
    fixture.manifestPath,
    JSON.stringify({ ...fixture.manifest, sha256: fixture.hash(wrong) }),
  );
  await expect(verifyOreUiShaper(fixture.directory, "linux-x64")).rejects.toThrow("does not match");
});

test("installed engine rejects a missing license or a manifest-supplied path", async () => {
  const fixture = await installation();
  await writeFile(join(fixture.resource, "COPYING"), "");
  await expect(verifyOreUiShaper(fixture.directory, "linux-x64")).rejects.toThrow("license");
  await writeFile(
    fixture.manifestPath,
    JSON.stringify({ ...fixture.manifest, library: "../../outside.so" }),
  );
  await expect(verifyOreUiShaper(fixture.directory, "linux-x64")).rejects.toThrow("identity");
});
