import { readFile, stat } from "node:fs/promises";
import { Schema } from "effect";
import { builtinUiManifest } from "./bedrock-ui.ts";
import { isRecord } from "./guards.ts";
import { zipEntries } from "./zip.ts";

export const builtinOreUiResource = "assets/viafabricplus-bedrock/builtin_oreui.zip";
export const oreUiLimit = 64 * 1024 * 1024;

export interface OreUiFont {
  family: string;
  file: string;
  weight: number;
  style: string;
  sdf: "default" | "off";
}

export interface OreUiDescriptor {
  format: number;
  version: string;
  stylesheet: string;
  fonts: OreUiFont[];
  languages: string[];
  images?: string[];
}

const isOreUiDescriptor = Schema.is(
  Schema.Struct({
    format: Schema.Finite,
    version: Schema.String,
    stylesheet: Schema.String,
    fonts: Schema.Array(
      Schema.Struct({
        family: Schema.String,
        file: Schema.String,
        weight: Schema.Finite,
        style: Schema.String,
        sdf: Schema.Literals(["default", "off"]),
      }),
    ),
    languages: Schema.Array(Schema.String),
    images: Schema.optionalKey(Schema.Array(Schema.String)),
  }),
);

/** Read the declarations used by the acquired gameplay stylesheet, including Gameface's SDF opt-out. */
export function oreUiFonts(css: string): OreUiFont[] {
  const fonts: OreUiFont[] = [];
  for (const match of css.matchAll(/@font-face\{([^}]+)\}/gu)) {
    const properties = new Map(
      (match[1] ?? "").split(";").map((property) => {
        const colon = property.indexOf(":");
        return [property.slice(0, colon).trim(), property.slice(colon + 1).trim()];
      }),
    );
    const family = properties.get("font-family"),
      url = /^url\(ui:\/\/hbui\/(fonts\/[^/()]+\.(?:otf|ttf))\)$/u.exec(
        properties.get("src") ?? "",
      );
    if (!family || !url) throw new Error("Unsupported OreUI font-face declaration");
    const sdf = properties.get("coh-font-sdf");
    if (sdf !== undefined && sdf !== "off")
      throw new Error("Unsupported OreUI font SDF declaration");
    fonts.push({
      family,
      file: `hbui/${url[1]}`,
      weight: Number(properties.get("font-weight") ?? 400),
      style: properties.get("font-style") ?? "normal",
      sdf: sdf ?? "default",
    });
  }
  return fonts;
}

/** Keep OreUI faces separate from the classic JSON UI font registrations and display transform. */
export function verifyBuiltinOreUiContents(bytes: Buffer, version: string): void {
  const entries = zipEntries(bytes);
  if (entries.size > 256) throw new Error("Bundled OreUI exceeds the file count limit");
  let expanded = 0;
  for (const [path, read] of entries) {
    if (
      /[\\:\0]/u.test(path) ||
      path.split("/").includes("..") ||
      !/^(?:oreui\.json|NOTICE\.txt|hbui\/gameplay-[0-9a-f]+\.css|hbui\/fonts\/[^/]+\.(?:otf|ttf)|hbui\/assets\/animation-[0-9a-f]+\.gif|texts\/[a-z]{2}_[A-Z]{2}\.lang)$/u.test(
        path,
      )
    )
      throw new Error(`Invalid bundled OreUI path: ${path}`);
    const contents = read();
    expanded += contents.length;
    if (contents.length === 0 || contents.length > 16 * 1024 * 1024 || expanded > oreUiLimit)
      throw new Error("Bundled OreUI exceeds asset limits");
    if (
      /\.(otf|ttf)$/u.test(path) &&
      (contents.length < 12 || ![0x4f_54_54_4f, 0x00_01_00_00].includes(contents.readUInt32BE(0)))
    )
      throw new Error(`Invalid bundled OreUI font: ${path}`);
  }
  const images = [...entries.keys()].filter((path) => path.startsWith("hbui/assets/")).toSorted();
  for (const path of images) {
    const image = entries.get(path)?.();
    if (
      !image ||
      image.length < 13 ||
      !["GIF87a", "GIF89a"].includes(image.subarray(0, 6).toString("ascii")) ||
      image.readUInt16LE(6) === 0 ||
      image.readUInt16LE(8) === 0 ||
      image.readUInt16LE(6) > 2048 ||
      image.readUInt16LE(8) > 2048
    )
      throw new Error("Invalid bundled OreUI image");
  }
  const parsed: unknown = JSON.parse(entries.get("oreui.json")?.().toString("utf8") ?? "null");
  const descriptor = isOreUiDescriptor(parsed) ? parsed : undefined;
  if (
    descriptor?.format !== 1 ||
    descriptor.version !== version ||
    !/^hbui\/gameplay-[0-9a-f]+\.css$/u.test(descriptor.stylesheet) ||
    !entries.has(descriptor.stylesheet) ||
    !entries.has("NOTICE.txt") ||
    descriptor.fonts.length === 0 ||
    descriptor.fonts.length > 32 ||
    !descriptor.languages.includes("en_US") ||
    new Set(descriptor.languages).size !== descriptor.languages.length
  )
    throw new Error("Invalid bundled OreUI descriptor");
  const stylesheet = entries.get(descriptor.stylesheet)?.();
  if (!stylesheet) throw new Error("Bundled OreUI stylesheet is missing");
  if (JSON.stringify(descriptor.fonts) !== JSON.stringify(oreUiFonts(stylesheet.toString("utf8"))))
    throw new Error("Bundled OreUI font registrations do not match the stylesheet");
  if (JSON.stringify(descriptor.images ?? []) !== JSON.stringify(images))
    throw new Error("Bundled OreUI images do not match the descriptor");
  for (const font of descriptor.fonts) {
    if (
      typeof font.family !== "string" ||
      font.family.length === 0 ||
      font.family.length > 128 ||
      !/^hbui\/fonts\/[^/]+\.(otf|ttf)$/u.test(font.file) ||
      !entries.has(font.file) ||
      ![400, 700].includes(font.weight) ||
      !["normal", "italic"].includes(font.style) ||
      !["default", "off"].includes(font.sdf)
    )
      throw new Error("Invalid bundled OreUI font registration");
  }
  for (const language of descriptor.languages) {
    if (!/^[a-z]{2}_[A-Z]{2}$/u.test(language) || !entries.has(`texts/${language}.lang`))
      throw new Error("Missing bundled OreUI language");
  }
  const languages = [...entries.keys()]
    .filter((path) => path.startsWith("texts/"))
    .map((path) => path.slice(6, -5))
    .toSorted();
  if (JSON.stringify(descriptor.languages) !== JSON.stringify(languages))
    throw new Error("Bundled OreUI languages do not match the descriptor");
}

export async function verifyBuiltinOreUi(path: string, version: string): Promise<string> {
  if ((await stat(path)).size > oreUiLimit) throw new Error("Bundled OreUI exceeds the size limit");
  const declared: unknown = JSON.parse(await readFile(`${path}.manifest.json`, "utf8"));
  const bytes = await readFile(path);
  const actual = builtinUiManifest(version, bytes);
  if (!isRecord(declared) || Object.entries(actual).some(([key, value]) => declared[key] !== value))
    throw new Error("Bundled OreUI identity mismatch");
  verifyBuiltinOreUiContents(bytes, version);
  return path;
}

/** The addon is the renderer on both direct and ViaProxy connections. */
export async function verifyEmbeddedBuiltinOreUi(
  artifact: string,
  bundle: string,
  version: string,
): Promise<void> {
  await verifyBuiltinOreUi(bundle, version);
  const embedded = zipEntries(await readFile(artifact));
  for (const suffix of ["", ".manifest.json"]) {
    if (
      !embedded
        .get(`${builtinOreUiResource}${suffix}`)?.()
        .equals(await readFile(`${bundle}${suffix}`))
    )
      throw new Error("The Bedrock add-on did not embed the verified OreUI bundle and manifest");
  }
}
