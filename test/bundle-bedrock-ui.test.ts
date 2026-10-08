import { afterEach, expect, test } from "bun:test";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { planBedrockUi, applyBedrockUi } from "../scripts/bundle-bedrock-ui.ts";
import { inflateRawSync } from "node:zlib";
import { builtinUiResource, builtinUiManifest, verifyBuiltinUi, verifyBuiltinUiContents, verifyEmbeddedBuiltinUi } from "../src/bedrock-ui.ts";
import { assetZip } from "../scripts/bundle-bedrock-assets.ts";
import { zipEntries } from "../src/zip.ts";
import { builtinAssetArguments } from "../src/build.ts";

const temporary: string[] = [];
afterEach(async () => { for (const directory of temporary.splice(0)) await rm(directory, { recursive: true, force: true }); });

function archive(entries: Record<string, string | Uint8Array>) {
  const files = Object.entries(entries).map(([name, data]) => [name, Buffer.from(data)] as const);
  const bytes = Buffer.alloc(16 + files.length * 256 + files.reduce((total, [, data]) => total + data.length, 0));
  bytes.writeBigUInt64LE(0x267052a0b125277dn);
  bytes.writeUInt32LE(files.length, 8);
  bytes.writeUInt32LE(1, 12);
  let offset = 0;
  for (const [index, [name, data]] of files.entries()) {
    const record = 16 + index * 256;
    bytes[record] = Buffer.byteLength(name);
    bytes.write(name, record + 1);
    bytes.writeUInt32LE(offset, record + 248);
    bytes.writeUInt32LE(data.length, record + 252);
    bytes.set(data, 16 + files.length * 256 + offset);
    offset += data.length;
  }
  return bytes;
}

async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-ui-"));
  temporary.push(directory);
  const packs = join(directory, "data", "resource_packs");
  await mkdir(join(packs, "vanilla_1.26.51"), { recursive: true });
  await writeFile(join(packs, "vanilla_1.26.51", "manifest.json"), JSON.stringify({ header: { version: [1, 26, 51] } }));
  for (const pack of ["vanilla_base", "vanilla"]) {
    const root = join(packs, pack, "__brarchive");
    await mkdir(join(root, "textures"), { recursive: true });
    await writeFile(join(root, "ui.brarchive"), archive(Object.fromEntries([
      "ui_common.json", "server_form.json", "chest_screen.json", "inventory_screen.json", "_global_variables.json", "_ui_defs.json",
    ].map((path) => [path, '{}']))));
    await writeFile(join(root, "textures", "ui.brarchive"), archive({ "button.png": new Uint8Array([1, 2, 3]), "button.json": '{"nineslice_size":2}' }));
    await writeFile(join(root, "font.brarchive"), archive({ "font_metadata.json": '{"version":1,"fonts":[]}' }));
    await mkdir(join(root, "ui"));
    await writeFile(join(root, "ui", "settings_sections.brarchive"), archive({ "settings_common.json": '{}' }));
  }
  return { directory, packs, output: join(directory, "output", "builtin_ui.zip") };
}

test("previews deterministic native bytes, keeps sidecars and validates the published version and digest", async () => {
  const { directory, output } = await fixture();
  const first = await planBedrockUi(directory, "1.26.51.1", output);
  const second = await planBedrockUi(directory, "1.26.51.1", output);
  expect(first.bytes).toEqual(second.bytes);
  expect(await Bun.file(output).exists()).toBeFalse();
  expect(first.preview.files).toBe(11);
  expect(await applyBedrockUi(first)).toEqual(first.preview);
  expect(await verifyBuiltinUi(output, "1.26.51.1")).toBe(output);
  await expect(verifyBuiltinUi(output, "1.26.51.2")).rejects.toThrow();
  await writeFile(output, Buffer.concat([first.bytes, Buffer.from([0])]));
  await expect(verifyBuiltinUi(output, "1.26.51.1")).rejects.toThrow();
});

test("refuses existing outputs without modifying them, and rejects traversal or mismatched native versions", async () => {
  const { directory, packs, output } = await fixture();
  const plan = await planBedrockUi(directory, "1.26.51.1", output);
  await mkdir(join(directory, "output"));
  const original = Buffer.from([9, 8, 7]);
  await writeFile(output, original);
  await expect(applyBedrockUi(plan)).rejects.toThrow();
  expect(await readFile(output)).toEqual(original);
  await writeFile(join(packs, "vanilla", "__brarchive", "ui.brarchive"), archive({ "../server_form.json": '{}' }));
  await expect(planBedrockUi(directory, "1.26.51.1", output)).rejects.toThrow();
  await expect(planBedrockUi(directory, "1.26.52.1", output)).rejects.toThrow();
});


test("acquires font archive metadata and loose faces with native layer precedence", async () => {
  const { directory, packs, output } = await fixture();
  const face = new Uint8Array([0, 1, 0, 0, 5, 6, 7]);
  await writeFile(join(packs, "vanilla", "__brarchive", "font.brarchive"), archive({
    "font_metadata.json": JSON.stringify({ version: 1, fonts: [{ font_name: "Title", font_format: "ttf", font_file: "font/title" }] }),
    "title.ttf": "",
  }));
  await mkdir(join(packs, "vanilla", "font"));
  await writeFile(join(packs, "vanilla", "font", "title.ttf"), face);
  const plan = await planBedrockUi(directory, "1.26.51.1", output);
  const entries = new Map<string, Buffer>();
  let offset = 0;
  while (plan.bytes.readUInt32LE(offset) === 0x04034b50) {
    const compressed = plan.bytes.readUInt32LE(offset + 18);
    const nameLength = plan.bytes.readUInt16LE(offset + 26);
    const extraLength = plan.bytes.readUInt16LE(offset + 28);
    const start = offset + 30 + nameLength + extraLength;
    entries.set(plan.bytes.toString("utf8", offset + 30, offset + 30 + nameLength),
      inflateRawSync(plan.bytes.subarray(start, start + compressed)));
    offset = start + compressed;
  }
  expect(entries.get("font/title.ttf")).toEqual(Buffer.from(face));
  expect(JSON.parse(entries.get("font/font_metadata.json")!.toString()).fonts[0].font_name).toBe("Title");
  const second = await planBedrockUi(directory, "1.26.51.1", output);
  expect(second.bytes).toEqual(plan.bytes);
});

test("rejects incomplete assets even when their checksum and version are valid", async () => {
  const { directory, output } = await fixture();
  const plan = await planBedrockUi(directory, "1.26.51.1", output);
  const complete = new Map([...zipEntries(plan.bytes)].map(([path, read]) => [path, read()]));
  for (const missing of ["ui/chest_screen.json", "ui/ui_common.json", "ui/settings_sections/settings_common.json", "font/font_metadata.json", "textures/ui/button.png"]) {
    const files = new Map(complete);
    files.delete(missing);
    const bytes = assetZip(files);
    await mkdir(join(directory, "output"), { recursive: true });
    await writeFile(output, bytes);
    await writeFile(`${output}.manifest.json`, JSON.stringify(builtinUiManifest("1.26.51.1", bytes)));
    await expect(verifyBuiltinUi(output, "1.26.51.1")).rejects.toThrow();
  }
  complete.set("font/font_metadata.json", Buffer.from(JSON.stringify({ version: 1, fonts: [{ font_format: "ttf", font_file: "font/missing" }] })));
  expect(() => verifyBuiltinUiContents(assetZip(complete))).toThrow();
});

test("requires tracked UI inputs and verifies the actual core, proxy and nested addon resources", async () => {
  const { directory, output } = await fixture();
  await writeFile(join(directory, "bedrock-assets.json"), '{"version":"1.26.51.1"}');
  await expect(builtinAssetArguments("viabedrock", directory)).rejects.toThrow();
  const bundle = join(directory, "assets", "bedrock", "1.26.51.1", builtinUiResource);
  const plan = await planBedrockUi(directory, "1.26.51.1", bundle);
  await applyBedrockUi(plan);
  expect(await builtinAssetArguments("viabedrock", directory)).toEqual([`-PbedrockBuiltinUi=${bundle}`]);
  const core = assetZip(new Map([[builtinUiResource, plan.bytes]]));
  const nested = "META-INF/jars/ViaBedrock-0.0.31-StackAnvil.jar";
  await mkdir(join(directory, "output"), { recursive: true });
  for (const project of ["viabedrock", "viaproxy", "viafabricplus-bedrock"]) {
    await writeFile(output, project === "viafabricplus-bedrock" ? assetZip(new Map([[nested, core]])) : core);
    await verifyEmbeddedBuiltinUi(output, project, bundle, "1.26.51.1");
    const missing = assetZip(new Map());
    await writeFile(output, project === "viafabricplus-bedrock" ? assetZip(new Map([[nested, missing]])) : missing);
    await expect(verifyEmbeddedBuiltinUi(output, project, bundle, "1.26.51.1")).rejects.toThrow();
  }
});

test("keeps JPG and TGA UI images and native bitmap font pages", async () => {
  const { directory, packs, output } = await fixture();
  const root = join(packs, "vanilla", "__brarchive");
  await writeFile(join(root, "textures", "ui.brarchive"), archive({ "card.jpg": new Uint8Array([4, 5]), "button.tga": new Uint8Array([6, 7]) }));
  await writeFile(join(root, "font.brarchive"), archive({ "font_metadata.json": '{"version":1,"fonts":[]}', "glyph_00.png": new Uint8Array([8, 9]) }));
  const entries = zipEntries((await planBedrockUi(directory, "1.26.51.1", output)).bytes);
  expect(entries.get("textures/ui/card.jpg")?.()).toEqual(Buffer.from([4, 5]));
  expect(entries.get("textures/ui/button.tga")?.()).toEqual(Buffer.from([6, 7]));
  expect(entries.get("font/glyph_00.png")?.()).toEqual(Buffer.from([8, 9]));
});

test("reads nested native archives, restores original definitions and applies loose texture overrides", async () => {
  const { directory, packs, output } = await fixture();
  const root = join(packs, "vanilla");
  const archiveRoot = join(root, "__brarchive");
  await writeFile(join(archiveRoot, "ui", "settings_sections.brarchive"), archive({ "settings_common.json": 'null' }));
  await writeFile(join(archiveRoot, "ui", "settings_sections.brarchive.bol-orig"), archive({ "settings_common.json": '{"namespace":"settings_common"}' }));
  await mkdir(join(archiveRoot, "textures", "ui"));
  await writeFile(join(archiveRoot, "textures", "ui", "icons.brarchive"), archive({ "nested.png": new Uint8Array([1]) }));
  await mkdir(join(root, "textures", "ui", "icons"), { recursive: true });
  const pixels = Buffer.from([2, 3]);
  await writeFile(join(root, "textures", "ui", "icons", "nested.png"), pixels);
  const entries = zipEntries((await planBedrockUi(directory, "1.26.51.1", output)).bytes);
  expect(JSON.parse(entries.get("ui/settings_sections/settings_common.json")!().toString()).namespace).toBe("settings_common");
  expect(entries.get("textures/ui/icons/nested.png")?.()).toEqual(pixels);
});
