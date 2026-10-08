import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { zipEntries } from "./zip.ts";

export const builtinUiResource = "assets/viabedrock/builtin_ui.zip";

export function verifyBuiltinUiContents(bytes: Buffer): void {
  const entries = zipEntries(bytes);
  if (entries.size > 4096) throw new Error("Bundled Bedrock UI exceeds the file count limit");
  let expanded = 0;
  for (const read of entries.values()) {
    expanded += read().length;
    if (expanded > 64 * 1024 * 1024) throw new Error("Bundled Bedrock UI exceeds the expanded size limit");
  }
  for (const path of ["ui/server_form.json", "ui/ui_common.json", "ui/chest_screen.json", "ui/inventory_screen.json", "ui/settings_sections/settings_common.json", "ui/_global_variables.json", "ui/_ui_defs.json"]) {
    const contents = entries.get(path)?.();
    if (!contents?.length) throw new Error(`Bundled Bedrock UI is missing ${path}`);
    const document: unknown = JSON.parse(contents.toString("utf8"));
    if (typeof document !== "object" || document === null || Array.isArray(document)) throw new Error(`Invalid bundled UI definition: ${path}`);
  }
  if (![...entries.keys()].some((path) => /^textures\/ui\/.+\.(png|jpg|tga)$/.test(path))) {
    throw new Error("Bundled Bedrock UI textures are missing");
  }
  const metadata = entries.get("font/font_metadata.json")?.();
  if (!metadata?.length) throw new Error("Bundled Bedrock UI font metadata is missing");
  const fonts: unknown = JSON.parse(metadata.toString("utf8"));
  if (typeof fonts !== "object" || fonts === null || !("fonts" in fonts) || !Array.isArray(fonts.fonts)) {
    throw new Error("Invalid bundled Bedrock UI font metadata");
  }
  for (const font of fonts.fonts) {
    if (font?.font_format !== "ttf") continue;
    if (typeof font.font_file !== "string") throw new Error("Invalid bundled UI font path");
    const path = font.font_file.endsWith(".ttf") ? font.font_file : `${font.font_file}.ttf`;
    if (!entries.get(path)?.().length) throw new Error(`Bundled Bedrock UI is missing ${path}`);
  }
}

export function builtinUiManifest(version: string, bytes: Uint8Array) {
  return { format: 1, version, size: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
}

/** Checks an acquired versioned bundle before Gradle embeds it in the core JAR. */
export async function verifyBuiltinUi(path: string, version: string): Promise<string> {
  const metadata: unknown = JSON.parse(await readFile(`${path}.manifest.json`, "utf8"));
  if (typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) {
    throw new Error("Invalid bundled Bedrock UI manifest");
  }
  const size = (await stat(path)).size;
  if (size > 64 * 1024 * 1024) throw new Error("Bundled Bedrock UI exceeds the size limit");
  const bytes = await readFile(path);
  const actual = builtinUiManifest(version, bytes);
  const declared = metadata as Record<string, unknown>;
  if (actual.size > 64 * 1024 * 1024 || Object.entries(actual).some(([key, value]) => declared[key] !== value)) {
    throw new Error("Bundled Bedrock UI identity mismatch");
  }
  verifyBuiltinUiContents(bytes);
  return path;
}

/** Checks the actual distributable, including the core nested inside the Fabric add-on. */
export async function verifyEmbeddedBuiltinUi(artifact: string, project: string, bundle: string, version: string): Promise<void> {
  await verifyBuiltinUi(bundle, version);
  let entries = zipEntries(await readFile(artifact));
  if (project === "viafabricplus-bedrock") {
    const cores = [...entries.keys()].filter((path) => /^META-INF\/jars\/ViaBedrock-[^/]+\.jar$/.test(path));
    if (cores.length !== 1) throw new Error("The Bedrock add-on must embed exactly one ViaBedrock JAR");
    entries = zipEntries(entries.get(cores[0]!)!());
  }
  const embedded = entries.get(builtinUiResource)?.();
  if (!embedded || !embedded.equals(await readFile(bundle))) {
    throw new Error(`${project} did not embed the verified Bedrock UI bundle`);
  }
}
