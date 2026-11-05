import { readFile, stat } from "node:fs/promises";
import { builtinUiManifest } from "./bedrock-ui.ts";
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
}

/** Read the declarations used by the acquired gameplay stylesheet, including Gameface's SDF opt-out. */
export function oreUiFonts(css: string): OreUiFont[] {
  const fonts: OreUiFont[] = [];
  for (const match of css.matchAll(/@font-face\{([^}]+)\}/g)) {
    const properties = new Map(
      match[1]!.split(";").map((property) => {
        const colon = property.indexOf(":");
        return [property.slice(0, colon).trim(), property.slice(colon + 1).trim()];
      }),
    );
    const family = properties.get("font-family"),
      url = /^url\(ui:\/\/hbui\/(fonts\/[^/()]+\.(?:otf|ttf))\)$/.exec(properties.get("src") ?? "");
    if (!family || !url) throw new Error("Unsupported OreUI font-face declaration");
    const sdf = properties.get("coh-font-sdf");
    if (sdf !== undefined && sdf !== "off")
      throw new Error("Unsupported OreUI font SDF declaration");
    fonts.push({
      family,
      file: `hbui/${url[1]!}`,
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
      /[\\:\0]/.test(path) ||
      path.split("/").includes("..") ||
      !/^(?:oreui\.json|NOTICE\.txt|hbui\/gameplay-[0-9a-f]+\.css|hbui\/fonts\/[^/]+\.(?:otf|ttf)|texts\/[a-z]{2}_[A-Z]{2}\.lang)$/.test(
        path,
      )
    )
      throw new Error(`Invalid bundled OreUI path: ${path}`);
    const contents = read();
    expanded += contents.length;
    if (!contents.length || contents.length > 16 * 1024 * 1024 || expanded > oreUiLimit)
      throw new Error("Bundled OreUI exceeds asset limits");
    if (
      /\.(otf|ttf)$/.test(path) &&
      (contents.length < 12 || ![0x4f54544f, 0x00010000].includes(contents.readUInt32BE(0)))
    )
      throw new Error(`Invalid bundled OreUI font: ${path}`);
  }
  const descriptor = JSON.parse(
    entries.get("oreui.json")?.().toString("utf8") ?? "null",
  ) as OreUiDescriptor | null;
  if (
    !descriptor ||
    descriptor.format !== 1 ||
    descriptor.version !== version ||
    !/^hbui\/gameplay-[0-9a-f]+\.css$/.test(descriptor.stylesheet) ||
    !entries.has(descriptor.stylesheet) ||
    !entries.has("NOTICE.txt") ||
    !Array.isArray(descriptor.fonts) ||
    descriptor.fonts.length === 0 ||
    descriptor.fonts.length > 32 ||
    !Array.isArray(descriptor.languages) ||
    !descriptor.languages.includes("en_US") ||
    new Set(descriptor.languages).size !== descriptor.languages.length
  )
    throw new Error("Invalid bundled OreUI descriptor");
  if (
    JSON.stringify(descriptor.fonts) !==
    JSON.stringify(oreUiFonts(entries.get(descriptor.stylesheet)!().toString("utf8")))
  )
    throw new Error("Bundled OreUI font registrations do not match the stylesheet");
  for (const font of descriptor.fonts) {
    if (
      typeof font.family !== "string" ||
      !font.family.length ||
      font.family.length > 128 ||
      !/^hbui\/fonts\/[^/]+\.(otf|ttf)$/.test(font.file) ||
      !entries.has(font.file) ||
      ![400, 700].includes(font.weight) ||
      !["normal", "italic"].includes(font.style) ||
      !["default", "off"].includes(font.sdf)
    )
      throw new Error("Invalid bundled OreUI font registration");
  }
  for (const language of descriptor.languages) {
    if (!/^[a-z]{2}_[A-Z]{2}$/.test(language) || !entries.has(`texts/${language}.lang`))
      throw new Error("Missing bundled OreUI language");
  }
  const languages = [...entries.keys()]
    .filter((path) => path.startsWith("texts/"))
    .map((path) => path.slice(6, -5))
    .sort();
  if (JSON.stringify(descriptor.languages) !== JSON.stringify(languages))
    throw new Error("Bundled OreUI languages do not match the descriptor");
}

export async function verifyBuiltinOreUi(path: string, version: string): Promise<string> {
  if ((await stat(path)).size > oreUiLimit) throw new Error("Bundled OreUI exceeds the size limit");
  const declared = JSON.parse(await readFile(`${path}.manifest.json`, "utf8"));
  const bytes = await readFile(path);
  const actual = builtinUiManifest(version, bytes);
  if (!declared || Object.entries(actual).some(([key, value]) => declared[key] !== value))
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
