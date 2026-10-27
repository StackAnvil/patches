import { afterEach, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { assetZip } from "../scripts/bundle-bedrock-assets.ts";
import {
  builtinImageBundle,
  builtinImagesResource,
  verifyEmbeddedBuiltinImages,
} from "../src/bedrock-images.ts";
import { zipEntries } from "../src/zip.ts";

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
    const core = assetZip(new Map([[builtinImagesResource, images]]));
    await writeFile(
      artifact,
      project === "viafabricplus-bedrock"
        ? assetZip(new Map([["META-INF/jars/ViaBedrock-test.jar", core]]))
        : core,
    );
    await verifyEmbeddedBuiltinImages(artifact, project, bundle);
    await writeFile(bundle, Buffer.from("changed"));
    await expect(verifyEmbeddedBuiltinImages(artifact, project, bundle)).rejects.toThrow();
    await writeFile(bundle, images);
  }
});
