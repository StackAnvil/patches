import { createHash } from "node:crypto";
import { lstat, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { assetZip, readBedrockArchive } from "./bundle-bedrock-assets.ts";
import { applyBedrockUi } from "./bundle-bedrock-ui.ts";
import {
  oreUiFonts,
  oreUiLimit,
  verifyBuiltinOreUiContents,
  type OreUiDescriptor,
} from "../src/bedrock-oreui.ts";

/** Acquire original Gameface resources; do not execute or translate the shipped JavaScript. */
export async function planBedrockOreUi(game: string, version: string, output: string) {
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(version))
    throw new Error("Expected a four-part Bedrock version");
  const protocol = version.split(".").slice(0, 3).join(".");
  const manifest = JSON.parse(
    await readFile(
      join(game, "data", "resource_packs", `vanilla_${protocol}`, "manifest.json"),
      "utf8",
    ),
  );
  if (manifest.header.version.join(".") !== protocol)
    throw new Error("Bedrock resource version mismatch");
  const files = new Map<string, Uint8Array>();
  const sources: { path: string; sha256: string; entries: number }[] = [];
  let expanded = 0;
  async function read(path: string): Promise<Buffer> {
    const info = await lstat(path);
    if (!info.isFile() || info.size > 16 * 1024 * 1024)
      throw new Error("Invalid OreUI source file");
    const bytes = await readFile(path);
    sources.push({ path, sha256: createHash("sha256").update(bytes).digest("hex"), entries: 1 });
    return bytes;
  }
  function add(path: string, bytes: Uint8Array) {
    if (!bytes.length) return;
    expanded += bytes.length - (files.get(path)?.length ?? 0);
    if (bytes.length > 16 * 1024 * 1024 || expanded > oreUiLimit)
      throw new Error("OreUI assets exceed limits");
    files.set(path, bytes);
  }
  const hbui = join(game, "data", "gui", "dist", "hbui");
  const styles = (await readdir(hbui)).filter((name) => /^gameplay-[0-9a-f]+\.css$/.test(name));
  if (styles.length !== 1) throw new Error("Expected one active OreUI gameplay stylesheet");
  const stylesheet = `hbui/${styles[0]!}`;
  const css = await read(join(hbui, styles[0]!));
  add(stylesheet, css);
  const fonts = oreUiFonts(css.toString("utf8"));
  const fontDirectory = join(hbui, "fonts");
  if (!(await lstat(fontDirectory)).isDirectory()) throw new Error("Invalid OreUI font directory");
  for (const name of (await readdir(fontDirectory)).sort()) {
    if (/\.(otf|ttf)$/.test(name)) add(`hbui/fonts/${name}`, await read(join(fontDirectory, name)));
  }
  const textRoot = join(game, "data", "resource_packs", "oreui");
  const archive = join(textRoot, "__brarchive", "texts.brarchive");
  const original = `${archive}.bol-orig`;
  const selected = await lstat(original)
    .then(() => original)
    .catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
      return archive;
    });
  const texts = readBedrockArchive(await read(selected));
  sources.at(-1)!.entries = texts.size;
  for (const [name, bytes] of texts) {
    if (/^[a-z]{2}_[A-Z]{2}\.lang$/.test(name)) add(`texts/${name}`, bytes);
  }
  const textDirectory = join(textRoot, "texts");
  if (!(await lstat(textDirectory)).isDirectory()) throw new Error("Invalid OreUI text directory");
  for (const name of (await readdir(textDirectory)).sort()) {
    if (/^[a-z]{2}_[A-Z]{2}\.lang$/.test(name))
      add(`texts/${name}`, await read(join(textDirectory, name)));
  }
  const descriptor: OreUiDescriptor = {
    format: 1,
    version,
    stylesheet,
    fonts,
    languages: [...files.keys()]
      .filter((name) => name.startsWith("texts/"))
      .map((name) => name.slice(6, -5))
      .sort(),
  };
  add("oreui.json", Buffer.from(`${JSON.stringify(descriptor, null, 2)}\n`));
  add(
    "NOTICE.txt",
    Buffer.from(
      `Minecraft: Bedrock Edition ${version} OreUI resources.\nCopyright Mojang AB and Microsoft.\nNative file contents are unchanged. oreui.json describes the acquired resources.\n`,
    ),
  );
  const bytes = assetZip(files);
  verifyBuiltinOreUiContents(bytes, version);
  return {
    bytes,
    preview: {
      version,
      output,
      manifest: `${output}.manifest.json`,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      size: bytes.length,
      files: files.size,
      sources,
    },
  };
}

if (import.meta.main) {
  const [game, version, output, ...flags] = process.argv.slice(2);
  if (!game || !version || !output || flags.some((flag) => flag !== "--dry-run"))
    throw new Error(
      "Usage: bun scripts/bundle-bedrock-oreui.ts <game-directory> <version> <fresh-output.zip> [--dry-run]",
    );
  const plan = await planBedrockOreUi(game, version, output);
  console.log(JSON.stringify(plan.preview));
  if (!flags.includes("--dry-run")) await applyBedrockUi(plan);
}
