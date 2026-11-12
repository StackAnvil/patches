import { afterEach, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { assetZip } from "../scripts/bundle-bedrock-assets.ts";
import {
  builtinImageBundle,
  builtinImagesResource,
  preparedUiImagesResource,
  verifyPreparedUiImages,
  verifyEmbeddedBuiltinImages,
} from "../src/bedrock-images.ts";
import { zipEntries } from "../src/zip.ts";

function preparedImages(source: Buffer, tga?: Buffer, png?: Buffer) {
  const index = Buffer.alloc(44 + (tga ? 68 : 0));
  index.writeUInt32BE(0x5549504e, 0);
  index.writeUInt32BE(1, 4);
  createHash("sha256").update(source).digest().copy(index, 8);
  index.writeInt32BE(tga ? 1 : 0, 40);
  const files = new Map<string, Uint8Array>([["0-index", index]]);
  if (tga && png) {
    const key = createHash("sha256").update(tga).digest();
    key.copy(index, 44);
    createHash("sha256").update(png).digest().copy(index, 76);
    index.writeInt32BE(png.length, 108);
    files.set(`${key.toString("hex")}.png`, png);
  }
  return assetZip(files);
}

const temporary: string[] = [];
afterEach(async () => {
  for (const path of temporary.splice(0)) await rm(path, { recursive: true, force: true });
});

test("retains native bytes, path casing and numeric image overlay order without actor resources", () => {
  const files = new Map<string, Uint8Array>([
    ["library/vanilla_1.16.100/textures/items/Test.tga", new Uint8Array([30, 40])],
    ["library/vanilla_base/textures/items/Test.png", new Uint8Array([10, 20])],
    ["library/vanilla/textures/item_texture.json", Buffer.from('{"texture_data":{}}')],
    ["library/vanilla_1.16/textures/items/Test.png", new Uint8Array([20, 30])],
    ["library/vanilla/entity/player.entity.json", Buffer.from("{}")],
  ]);
  const entries = zipEntries(builtinImageBundle(files, "1.26.51.1"));
  const manifest = JSON.parse(entries.get("manifest.json")!().toString("utf8"));
  expect(manifest.packs).toEqual(["vanilla", "vanilla_base", "vanilla_1.16", "vanilla_1.16.100"]);
  expect(entries.size).toBe(5);
  for (const file of manifest.files) {
    const original = Buffer.from(files.get(file.path)!);
    expect(entries.get(file.path)!()).toEqual(original);
    expect(file.sha256).toBe(createHash("sha256").update(original).digest("hex"));
  }
  expect(builtinImageBundle(files, "1.26.51.1")).toEqual(
    builtinImageBundle(new Map([...files].reverse()), "1.26.51.1"),
  );
});

test("rejects empty, unsafe and ambiguous native image layers", () => {
  for (const files of [
    new Map(),
    new Map([["library/vanilla/textures/../secret.png", Buffer.from([1])]]),
    new Map([
      ["library/vanilla_1.16/textures/test.png", Buffer.from([1])],
      ["library/vanilla_1.16.0/textures/test.png", Buffer.from([2])],
    ]),
  ]) {
    expect(() => builtinImageBundle(files, "1.26.51.1")).toThrow();
  }
});

test("verifies exact packaged image bytes in core, proxy and nested client distributions", async () => {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-images-"));
  temporary.push(directory);
  const bundle = join(directory, "images.zip"),
    artifact = join(directory, "artifact.jar");
  const images = builtinImageBundle(
    new Map([["library/vanilla/textures/items/test.png", Buffer.from([1, 2, 3])]]),
    "1.26.51.1",
  );
  await writeFile(bundle, images);
  for (const project of ["viabedrock", "viaproxy", "viafabricplus-bedrock"]) {
    const core = assetZip(
      new Map([
        [builtinImagesResource, images],
        [preparedUiImagesResource, preparedImages(images)],
      ]),
    );
    await writeFile(
      artifact,
      project === "viafabricplus-bedrock"
        ? assetZip(new Map([["META-INF/jars/ViaBedrock-test.jar", core]]))
        : core,
    );
    await verifyEmbeddedBuiltinImages(artifact, project, bundle);
    const missingCatalog = assetZip(new Map([[builtinImagesResource, images]]));
    await writeFile(
      artifact,
      project === "viafabricplus-bedrock"
        ? assetZip(new Map([["META-INF/jars/ViaBedrock-test.jar", missingCatalog]]))
        : missingCatalog,
    );
    await expect(verifyEmbeddedBuiltinImages(artifact, project, bundle)).rejects.toThrow(
      "prepared",
    );
    await writeFile(
      artifact,
      project === "viafabricplus-bedrock"
        ? assetZip(new Map([["META-INF/jars/ViaBedrock-test.jar", core]]))
        : core,
    );
    await writeFile(bundle, Buffer.from("changed"));
    await expect(verifyEmbeddedBuiltinImages(artifact, project, bundle)).rejects.toThrow();
    await writeFile(bundle, images);
  }
});

test("rejects prepared images whose source, payload or dimensions differ from the native bundle", () => {
  const tga = Buffer.alloc(22);
  tga[2] = 2;
  tga[12] = 1;
  tga[14] = 1;
  tga[16] = 32;
  tga[17] = 0x20;
  const source = builtinImageBundle(
    new Map([["library/vanilla/textures/test.tga", tga]]),
    "1.26.51.1",
  );
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLttAAAAABJRU5ErkJggg==",
    "base64",
  );
  expect(() => verifyPreparedUiImages(preparedImages(source, tga, png), source)).not.toThrow();
  expect(() =>
    verifyPreparedUiImages(preparedImages(source, tga, png), Buffer.from("other")),
  ).toThrow();
  const changed = Buffer.from(png);
  changed.writeUInt32BE(2, 16);
  expect(() => verifyPreparedUiImages(preparedImages(source, tga, changed), source)).toThrow();
  const catalog = zipEntries(preparedImages(source, tga, png));
  const files = new Map([...catalog].map(([name, read]) => [name, read()]));
  const image = [...files.keys()].find((name) => name.endsWith(".png"))!;
  const damaged = Buffer.from(png);
  damaged[damaged.length - 1] = damaged[damaged.length - 1]! ^ 1;
  files.set(image, damaged);
  expect(() => verifyPreparedUiImages(assetZip(files), source)).toThrow();
  files.delete(image);
  expect(() => verifyPreparedUiImages(assetZip(files), source)).toThrow();
});
