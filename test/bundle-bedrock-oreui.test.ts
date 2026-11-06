import { afterEach, expect, test } from "bun:test";
import { mkdtemp, mkdir, readFile, rm, symlink, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { planBedrockOreUi } from "../scripts/bundle-bedrock-oreui.ts";
import { applyBedrockUi } from "../scripts/bundle-bedrock-ui.ts";
import { assetZip } from "../scripts/bundle-bedrock-assets.ts";
import { builtinUiManifest } from "../src/bedrock-ui.ts";
import { builtinOreUiResource, verifyBuiltinOreUi, verifyBuiltinOreUiContents, verifyEmbeddedBuiltinOreUi } from "../src/bedrock-oreui.ts";
import { zipEntries } from "../src/zip.ts";

const temporary: string[] = [];
afterEach(async () => { for (const path of temporary.splice(0)) await rm(path, { recursive: true, force: true }); });

function archive(name: string, text: string): Buffer {
  const payload = Buffer.from(text), bytes = Buffer.alloc(272 + payload.length);
  bytes.writeBigUInt64LE(0x267052a0b125277dn);
  bytes.writeUInt32LE(1, 8);
  bytes.writeUInt32LE(1, 12);
  bytes[16] = Buffer.byteLength(name);
  bytes.write(name, 17);
  bytes.writeUInt32LE(payload.length, 268);
  bytes.set(payload, 272);
  return bytes;
}

async function fixture() {
  const game = await mkdtemp(join(tmpdir(), "stackanvil-oreui-")); temporary.push(game);
  const hbui = join(game, "data/gui/dist/hbui"), oreui = join(game, "data/resource_packs/oreui");
  await mkdir(join(game, "data/resource_packs/vanilla_1.26.60"), { recursive: true });
  await writeFile(join(game, "data/resource_packs/vanilla_1.26.60/manifest.json"), '{"header":{"version":[1,26,60]}}');
  await mkdir(join(hbui, "fonts"), { recursive: true });
  await mkdir(join(hbui, "assets"));
  await writeFile(join(hbui, "assets/animation-ab.gif"), Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64"));
  await mkdir(join(oreui, "__brarchive"), { recursive: true });
  await mkdir(join(oreui, "texts"));
  const font = Buffer.from([0x4f, 0x54, 0x54, 0x4f, 0, 0, 0, 0, 0, 0, 0, 0]);
  await writeFile(join(hbui, "fonts/Ten-ab.otf"), font);
  await writeFile(join(hbui, "gameplay-ab.css"), '@font-face{font-family:Minecraft Ten v2;src:url(ui://hbui/fonts/Ten-ab.otf)}@font-face{coh-font-sdf:off;font-family:Minecraft Seven Pixel Perfect;font-weight:700;font-style:italic;src:url(ui://hbui/fonts/Ten-ab.otf)}');
  await writeFile(join(oreui, "__brarchive/texts.brarchive"), archive("en_US.lang", "gameplay.DeathScreen.title=Archived title\n"));
  await writeFile(join(oreui, "texts/en_US.lang"), "gameplay.DeathScreen.title=Loose title\n");
  await writeFile(join(oreui, "texts/ja_JP.lang"), "gameplay.DeathScreen.title=死亡しました\n");
  return { game, hbui, oreui, font, output: join(game, "output/builtin_oreui.zip") };
}

test("acquires exact OreUI bytes, font variants and language precedence deterministically", async () => {
  const { game, font, output } = await fixture();
  const plan = await planBedrockOreUi(game, "1.26.60.5", output);
  expect(plan.bytes).toEqual((await planBedrockOreUi(game, "1.26.60.5", output)).bytes);
  expect(await Bun.file(output).exists()).toBeFalse();
  const entries = zipEntries(plan.bytes), descriptor = JSON.parse(entries.get("oreui.json")!().toString());
  expect(descriptor.fonts).toEqual([
    { family: "Minecraft Ten v2", file: "hbui/fonts/Ten-ab.otf", weight: 400, style: "normal", sdf: "default" },
    { family: "Minecraft Seven Pixel Perfect", file: "hbui/fonts/Ten-ab.otf", weight: 700, style: "italic", sdf: "off" },
  ]);
  expect(entries.get("hbui/fonts/Ten-ab.otf")!()).toEqual(font);
  expect(descriptor.images).toEqual(["hbui/assets/animation-ab.gif"]);
  expect(entries.get("hbui/assets/animation-ab.gif")!()).toEqual(await readFile(join(game, "data/gui/dist/hbui/assets/animation-ab.gif")));
  expect(entries.get("texts/en_US.lang")!().toString()).toBe("gameplay.DeathScreen.title=Loose title\n");
  expect(entries.get("texts/ja_JP.lang")!().toString()).toBe("gameplay.DeathScreen.title=死亡しました\n");
  await applyBedrockUi(plan);
  expect(await verifyBuiltinOreUi(output, "1.26.60.5")).toBe(output);
  await expect(applyBedrockUi(plan)).rejects.toThrow("already exists");
  await expect(verifyBuiltinOreUi(output, "1.26.60.6")).rejects.toThrow("identity mismatch");
});

test("uses the original archive and refuses a missing face, ambiguous stylesheet, or linked font", async () => {
  const { game, hbui, oreui, font, output } = await fixture();
  await unlink(join(oreui, "texts/en_US.lang"));
  await writeFile(join(oreui, "__brarchive/texts.brarchive.bol-orig"), archive("en_US.lang", "Original text"));
  const plan = await planBedrockOreUi(game, "1.26.60.5", output);
  expect(zipEntries(plan.bytes).get("texts/en_US.lang")!().toString()).toBe("Original text");
  await unlink(join(hbui, "fonts/Ten-ab.otf"));
  await expect(planBedrockOreUi(game, "1.26.60.5", output)).rejects.toThrow("font registration");
  await writeFile(join(game, "external.otf"), font);
  await symlink(join(game, "external.otf"), join(hbui, "fonts/Ten-ab.otf"));
  await expect(planBedrockOreUi(game, "1.26.60.5", output)).rejects.toThrow("source file");
  await unlink(join(hbui, "fonts/Ten-ab.otf")); await writeFile(join(hbui, "fonts/Ten-ab.otf"), font);
  await writeFile(join(hbui, "gameplay-cd.css"), "duplicate");
  await expect(planBedrockOreUi(game, "1.26.60.5", output)).rejects.toThrow("one active");
});

test("rejects incomplete or mismatched resources even with a valid outer checksum", async () => {
  const { game, output } = await fixture();
  const plan = await planBedrockOreUi(game, "1.26.60.5", output);
  const original = new Map([...zipEntries(plan.bytes)].map(([name, read]) => [name, read()]));
  for (const missing of ["hbui/fonts/Ten-ab.otf", "hbui/gameplay-ab.css", "texts/en_US.lang", "NOTICE.txt", "hbui/assets/animation-ab.gif"]) {
    const entries = new Map(original); entries.delete(missing);
    expect(() => verifyBuiltinOreUiContents(assetZip(entries), "1.26.60.5")).toThrow();
  }
  const entries = new Map(original), descriptor = JSON.parse(entries.get("oreui.json")!.toString());
  descriptor.fonts[0].sdf = "off"; entries.set("oreui.json", Buffer.from(JSON.stringify(descriptor)));
  const corrupted = assetZip(entries);
  await mkdir(join(game, "output"));
  await writeFile(output, corrupted); await writeFile(`${output}.manifest.json`, JSON.stringify(builtinUiManifest("1.26.60.5", corrupted)));
  await expect(verifyBuiltinOreUi(output, "1.26.60.5")).rejects.toThrow("do not match");
  descriptor.fonts[0].sdf = "default"; descriptor.languages = ["en_US"];
  entries.set("oreui.json", Buffer.from(JSON.stringify(descriptor)));
  expect(() => verifyBuiltinOreUiContents(assetZip(entries), "1.26.60.5")).toThrow("languages do not match");
});

test("verifies the exact OreUI bundle in the addon distributable", async () => {
  const { game, output } = await fixture();
  const plan = await planBedrockOreUi(game, "1.26.60.5", output); await applyBedrockUi(plan);
  const artifact = join(game, "addon.jar"), manifest = await readFile(`${output}.manifest.json`);
  await writeFile(artifact, assetZip(new Map<string, Uint8Array>([[builtinOreUiResource, plan.bytes], [`${builtinOreUiResource}.manifest.json`, manifest]])));
  await verifyEmbeddedBuiltinOreUi(artifact, output, "1.26.60.5");
  await writeFile(artifact, assetZip(new Map([[builtinOreUiResource, plan.bytes]])));
  await expect(verifyEmbeddedBuiltinOreUi(artifact, output, "1.26.60.5")).rejects.toThrow("did not embed");
  await writeFile(artifact, assetZip(new Map([[builtinOreUiResource, Buffer.from("different")]])));
  await expect(verifyEmbeddedBuiltinOreUi(artifact, output, "1.26.60.5")).rejects.toThrow("did not embed");
  expect((await readFile(output)).equals(plan.bytes)).toBeTrue();
});


test("rejects unregistered images and invalid GIF dimensions inside a checksummed bundle", async () => {
  const { game, output } = await fixture();
  const plan = await planBedrockOreUi(game, "1.26.60.5", output);
  const entries = new Map([...zipEntries(plan.bytes)].map(([name, read]) => [name, read()]));
  const descriptor = JSON.parse(entries.get("oreui.json")!.toString());
  descriptor.images = []; entries.set("oreui.json", Buffer.from(JSON.stringify(descriptor)));
  expect(() => verifyBuiltinOreUiContents(assetZip(entries), "1.26.60.5")).toThrow("images do not match");
  descriptor.images = ["hbui/assets/animation-ab.gif"]; entries.set("oreui.json", Buffer.from(JSON.stringify(descriptor)));
  const image = Buffer.from(entries.get("hbui/assets/animation-ab.gif")!); image.writeUInt16LE(2049, 6);
  entries.set("hbui/assets/animation-ab.gif", image);
  expect(() => verifyBuiltinOreUiContents(assetZip(entries), "1.26.60.5")).toThrow("Invalid bundled OreUI image");
});
