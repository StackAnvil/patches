import { afterEach, expect, test } from "bun:test";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { planBedrockUi, applyBedrockUi } from "../scripts/bundle-bedrock-ui.ts";
import { inflateRawSync } from "node:zlib";
import { verifyBuiltinUi } from "../src/bedrock-ui.ts";

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
    await writeFile(join(root, "ui.brarchive"), archive({ "ui_common.json": '{"namespace":"common"}', "server_form.json": '{"namespace":"server_form"}', "empty.json": "" }));
    await writeFile(join(root, "textures", "ui.brarchive"), archive({ "button.png": new Uint8Array([1, 2, 3]), "button.json": '{"nineslice_size":2}' }));
  }
  return { directory, packs, output: join(directory, "output", "builtin_ui.zip") };
}

test("previews deterministic native bytes, keeps sidecars and validates the published version and digest", async () => {
  const { directory, output } = await fixture();
  const first = await planBedrockUi(directory, "1.26.51.1", output);
  const second = await planBedrockUi(directory, "1.26.51.1", output);
  expect(first.bytes).toEqual(second.bytes);
  expect(await Bun.file(output).exists()).toBeFalse();
  expect(first.preview.files).toBe(5);
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
