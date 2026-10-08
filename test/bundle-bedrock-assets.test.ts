import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { zipEntries } from "../src/zip.ts";
import { inflateRawSync } from "node:zlib";
import { assetZip, bundleBedrockAssets, readBedrockArchive } from "../scripts/bundle-bedrock-assets.ts";

function archive() {
  const bytes = Buffer.alloc(16 + 2 * 256 + 3);
  bytes.writeBigUInt64LE(0x267052a0b125277dn);
  bytes.writeUInt32LE(2, 8);
  bytes.writeUInt32LE(1, 12);
  for (const [index, name] of ["one", "nested/two"].entries()) {
    const record = 16 + index * 256;
    bytes[record] = name.length;
    bytes.write(name, record + 1);
    bytes.writeUInt32LE(3, record + 252);
  }
  bytes.set([1, 2, 3], bytes.length - 3);
  return bytes;
}

describe("native asset extraction", () => {
  test("retains shared archive payloads and checks unsigned bounds", () => {
    const bytes = archive();
    expect([...readBedrockArchive(bytes).values()].map((value) => [...value])).toEqual([[1, 2, 3], [1, 2, 3]]);
    bytes.writeUInt32LE(0xffffffff, 16 + 248);
    expect(() => readBedrockArchive(bytes)).toThrow();
  });

  test("rejects unsupported archives, duplicate names, and traversal", () => {
    const version = archive();
    version.writeUInt32LE(2, 12);
    expect(() => readBedrockArchive(version)).toThrow();
    for (const name of ["one", "../two"]) {
      const bytes = archive();
      bytes[272] = name.length;
      bytes.write(name, 273);
      expect(() => readBedrockArchive(bytes)).toThrow();
    }
  });

  test("writes reproducible ZIP data regardless of map insertion order", () => {
    const first = new Map([["b", Buffer.from([3])], ["a", Buffer.from([1, 2])]]);
    const bytes = assetZip(first);
    expect(bytes).toEqual(assetZip(new Map([...first].reverse())));
    const nameLength = bytes.readUInt16LE(26);
    const start = 30 + nameLength;
    const compressed = bytes.subarray(start, start + bytes.readUInt32LE(18));
    expect([...inflateRawSync(compressed)]).toEqual([1, 2]);
    expect(bytes.readUInt16LE(bytes.length - 14)).toBe(2);
  });
});

const extracted: string[] = [];
afterEach(async () => {
  await Promise.all(extracted.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

test("extracts actor dependencies with valid material syntax and excludes empty source assets", async () => {
  const game = await mkdtemp(join(tmpdir(), "stackanvil-native-assets-"));
  extracted.push(game);
  const root = join(game, "data", "resource_packs", "vanilla_1.26.51");
  for (const directory of ["materials", "attachables", "textures", "ui", "font"]) await mkdir(join(root, directory), { recursive: true });
  await writeFile(join(root, "manifest.json"), JSON.stringify({ header: { version: [1, 26, 51] } }));
  await writeFile(join(root, "materials", "entity.material"), '{ // native syntax\n "materials":{"child:entity":{"+defines":["ALPHA_TEST",],},},}');
  await writeFile(join(root, "attachables", "shield.json"), "{}");
  await writeFile(join(root, "textures", "empty.png"), Buffer.alloc(0));
  await writeFile(join(root, "textures", "panorama.hdr"), Buffer.from([1]));
  await writeFile(join(root, "ui", "server_form.json"), "{}");
  await writeFile(join(root, "font", "native.ttf"), Buffer.from([2]));
  const output = join(game, "bundle");
  await bundleBedrockAssets(game, "1.26.51.1", output);
  const files = zipEntries(await readFile(join(output, "builtin-01.zip")));
  expect(files.size).toBe(3);
  expect(JSON.parse(files.get("library/vanilla_1.26.51/materials/entity.material")!().toString()))
    .toEqual({ materials: { "child:entity": { "+defines": ["ALPHA_TEST"] } } });
  expect(files.get("library/vanilla_1.26.51/attachables/shield.json")!().length).toBeGreaterThan(0);
});
