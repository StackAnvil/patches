import { afterEach, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { assetZip } from "../scripts/bundle-bedrock-assets.ts";
import {
  hostOreUiShaperPlatform,
  oreUiShaperArguments,
  oreUiShaperPlatforms,
  oreUiShaperResource,
  verifyOreUiShaper,
  verifyOreUiShaperBinary,
  verifyEmbeddedOreUiShaper,
  type OreUiShaperPlatform,
} from "../src/oreui-shaper.ts";

const temporary: string[] = [];
afterEach(async () => {
  await Promise.all(
    temporary
      .splice(0)
      .map((path) => rm(path, { recursive: true, force: true })),
  );
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
    for (const wrong of oreUiShaperPlatforms.filter(
      (candidate) => candidate !== target,
    ))
      expect(() => verifyOreUiShaperBinary(bytes, wrong)).toThrow(
        "does not match",
      );
  }
  const invalidPe = header("windows-x64");
  invalidPe.writeUInt32LE(0xffffffff, 60);
  expect(() => verifyOreUiShaperBinary(invalidPe, "windows-x64")).toThrow(
    "does not match",
  );
});

async function installation(
  target: OreUiShaperPlatform = "linux-x64",
  existing?: string,
) {
  const directory =
    existing ?? (await mkdtemp(join(tmpdir(), "stackanvil-oreui-shaper-")));
  if (!existing) temporary.push(directory);
  const resource = join(directory, oreUiShaperResource, target);
  await mkdir(resource, { recursive: true });
  const sourceDirectory = join(import.meta.dir, "..", "native", "oreui-shaper");
  const source = JSON.parse(
    await readFile(join(sourceDirectory, "source.json"), "utf8"),
  );
  const hash = (bytes: Buffer) =>
    createHash("sha256").update(bytes).digest("hex");
  const bytes = header(target);
  const [platform, architecture] = target.split("-");
  const manifest = {
    format: 1,
    engine: "HarfBuzz",
    version: source.version,
    target: "Bedrock 1.26.60.5 OreUI",
    platform,
    architecture,
    sourceSha256: source.sha256,
    patchSha256: hash(
      await readFile(join(sourceDirectory, "compatibility.patch")),
    ),
    library:
      platform === "windows"
        ? "stackanvil_oreui_harfbuzz.dll"
        : platform === "macos"
          ? "libstackanvil_oreui_harfbuzz.dylib"
          : "libstackanvil_oreui_harfbuzz.so",
    sha256: hash(bytes),
  };
  const manifestPath = join(resource, "manifest.json");
  const libraryPath = join(resource, manifest.library);
  await writeFile(manifestPath, JSON.stringify(manifest));
  await writeFile(libraryPath, bytes);
  await writeFile(
    join(resource, "COPYING"),
    await readFile(join(sourceDirectory, "COPYING")),
  );
  return { directory, resource, manifest, manifestPath, libraryPath, hash };
}

test("installed engine rejects stale policy, modified bytes, and a mislabeled binary", async () => {
  const fixture = await installation();
  await verifyOreUiShaper(fixture.directory, "linux-x64");
  await writeFile(
    fixture.manifestPath,
    JSON.stringify({ ...fixture.manifest, patchSha256: "0".repeat(64) }),
  );
  await expect(
    verifyOreUiShaper(fixture.directory, "linux-x64"),
  ).rejects.toThrow("identity");
  await writeFile(fixture.manifestPath, JSON.stringify(fixture.manifest));
  const wrong = header("linux-arm64");
  await writeFile(fixture.libraryPath, wrong);
  await expect(
    verifyOreUiShaper(fixture.directory, "linux-x64"),
  ).rejects.toThrow("checksum");
  await writeFile(
    fixture.manifestPath,
    JSON.stringify({ ...fixture.manifest, sha256: fixture.hash(wrong) }),
  );
  await expect(
    verifyOreUiShaper(fixture.directory, "linux-x64"),
  ).rejects.toThrow("does not match");
});

test("installed engine rejects a missing license or a manifest-supplied path", async () => {
  const fixture = await installation();
  await writeFile(join(fixture.resource, "COPYING"), "");
  await expect(
    verifyOreUiShaper(fixture.directory, "linux-x64"),
  ).rejects.toThrow("license");
  await writeFile(
    fixture.manifestPath,
    JSON.stringify({ ...fixture.manifest, library: "../../outside.so" }),
  );
  await expect(
    verifyOreUiShaper(fixture.directory, "linux-x64"),
  ).rejects.toThrow("identity");
});

const all = { all: true };

test("release packaging requires all engines and preserves their exact resources", async () => {
  const first = await installation();
  expect(await oreUiShaperArguments("viabedrock", first.directory, undefined, all)).toEqual([]);
  await expect(
    oreUiShaperArguments("viafabricplus-bedrock", first.directory, undefined, all),
  ).rejects.toThrow();
  const installations = [first];
  for (const target of oreUiShaperPlatforms.slice(1))
    installations.push(await installation(target, first.directory));
  expect(
    await oreUiShaperArguments("viafabricplus-bedrock", first.directory, undefined, all),
  ).toEqual([`-PbedrockOreUiShaper=${first.directory}`]);
  const files = new Map<string, Uint8Array>();
  for (const [index, target] of oreUiShaperPlatforms.entries()) {
    const fixture = installations[index]!;
    for (const name of ["manifest.json", "COPYING", fixture.manifest.library])
      files.set(
        `${oreUiShaperResource}/${target}/${name}`,
        await readFile(join(fixture.resource, name)),
      );
  }
  const artifact = join(first.directory, "addon.jar");
  await writeFile(artifact, assetZip(files));
  await verifyEmbeddedOreUiShaper(artifact, first.directory, undefined, all);
  const selected = `${oreUiShaperResource}/windows-arm64/stackanvil_oreui_harfbuzz.dll`;
  const original = files.get(selected)!;
  files.delete(selected);
  await writeFile(artifact, assetZip(files));
  await expect(
    verifyEmbeddedOreUiShaper(artifact, first.directory, undefined, all),
  ).rejects.toThrow(selected);
  files.set(selected, Buffer.from("stale build"));
  await writeFile(artifact, assetZip(files));
  await expect(
    verifyEmbeddedOreUiShaper(artifact, first.directory, undefined, all),
  ).rejects.toThrow(selected);
  files.set(selected, original);
  files.set(`${oreUiShaperResource}/extra.dll`, Buffer.from("untracked"));
  await writeFile(artifact, assetZip(files));
  await expect(
    verifyEmbeddedOreUiShaper(artifact, first.directory, undefined, all),
  ).rejects.toThrow("Unexpected");
});

test("release packaging names every missing engine instead of a raw file error", async () => {
  const absent = join(tmpdir(), `stackanvil-oreui-shaper-absent-${process.pid}`);
  const missingAll = oreUiShaperArguments("viafabricplus-bedrock", absent, undefined, all);
  await expect(missingAll).rejects.toThrow(
    `OreUI shaper resources are missing for ${oreUiShaperPlatforms.join(", ")} in ${absent}.`,
  );
  await expect(missingAll).rejects.toThrow("native/oreui-shaper/README.md");
  const host = await installation("linux-x64");
  await expect(
    oreUiShaperArguments("viafabricplus-bedrock", host.directory, undefined, all),
  ).rejects.toThrow(
    `missing for ${oreUiShaperPlatforms.filter((target) => target !== "linux-x64").join(", ")} in`,
  );
});

test("a local add-on embeds only the installed engines and needs the host's", async () => {
  // Pin the local mode, because CI sets STACKANVIL_REQUIRE_ALL_OREUI_SHAPERS for its own builds.
  const local = { all: false, host: "macos-arm64" as const };
  const fixture = await installation("linux-x64");
  await expect(
    oreUiShaperArguments("viafabricplus-bedrock", fixture.directory, undefined, local),
  ).rejects.toThrow("missing for macos-arm64");
  await expect(
    oreUiShaperArguments("viafabricplus-bedrock", fixture.directory, undefined, local),
  ).rejects.toThrow("bun run shaper build");
  const host = await installation("macos-arm64", fixture.directory);
  expect(
    await oreUiShaperArguments("viafabricplus-bedrock", fixture.directory, undefined, local),
  ).toEqual([`-PbedrockOreUiShaper=${fixture.directory}`]);
  const files = new Map<string, Uint8Array>();
  for (const installed of [fixture, host])
    for (const name of ["manifest.json", "COPYING", installed.manifest.library])
      files.set(
        `${installed.resource.slice(fixture.directory.length + 1)}/${name}`,
        await readFile(join(installed.resource, name)),
      );
  const artifact = join(fixture.directory, "addon.jar");
  await writeFile(artifact, assetZip(files));
  await verifyEmbeddedOreUiShaper(artifact, fixture.directory, undefined, local);
  // An engine installed after the JAR was built must still be embedded.
  await installation("windows-x64", fixture.directory);
  await expect(
    verifyEmbeddedOreUiShaper(artifact, fixture.directory, undefined, local),
  ).rejects.toThrow("windows-x64");
});

test("the host platform selects the matching engine library", () => {
  expect(hostOreUiShaperPlatform("win32", "arm64")).toBe("windows-arm64");
  expect(hostOreUiShaperPlatform("darwin", "x64")).toBe("macos-x64");
  expect(hostOreUiShaperPlatform("linux", "ia32")).toBeUndefined();
  expect(hostOreUiShaperPlatform("freebsd", "x64")).toBeUndefined();
});
