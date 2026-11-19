import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { Schema } from "effect";
import { parseJson } from "./guards.ts";
import { root } from "./model.ts";
import { verifyPinnedManifest, type ViaFabricPlusPin } from "./viafabricplus.ts";
import { execFileAsync as execute } from "./process.ts";

const fabricLoader = "0.19.5";

const ArtifactManifestSchema = Schema.Struct({
  baseSha: Schema.optionalKey(Schema.String),
  jenkinsBuild: Schema.optionalKey(Schema.Finite),
  apiSha256: Schema.optionalKey(Schema.String),
  artifacts: Schema.mutable(
    Schema.Array(Schema.Struct({ file: Schema.String, sha256: Schema.String })),
  ),
});
const FabricModSchema = Schema.Struct({
  id: Schema.String,
  depends: Schema.Struct({ minecraft: Schema.String }),
  jars: Schema.optionalKey(Schema.Array(Schema.Struct({ file: Schema.String }))),
});
type FabricMod = typeof FabricModSchema.Type;

export async function artifact(
  project: string,
  artifactsDir = join(root, "dist"),
  pin?: ViaFabricPlusPin,
): Promise<string> {
  const dir = join(artifactsDir, project);
  const manifest = parseJson(
    ArtifactManifestSchema,
    await readFile(join(dir, "manifest.json"), "utf8"),
  );
  const [entry] = manifest.artifacts;
  if (!entry || manifest.artifacts.length !== 1)
    throw new Error(`Expected one ${project} release JAR`);
  if (project === "viafabricplus") await verifyPinnedManifest(manifest, pin);
  if (basename(entry.file) !== entry.file || !entry.file.endsWith(".jar"))
    throw new Error(`Invalid ${project} release JAR name`);
  const file = join(dir, entry.file);
  const digest = createHash("sha256")
    .update(Buffer.from(await Bun.file(file).arrayBuffer()))
    .digest("hex");
  if (digest !== entry.sha256) throw new Error(`Build checksum failed for ${project}`);
  return file;
}

async function mod(file: string): Promise<FabricMod> {
  const { stdout } = await execute("unzip", ["-p", file, "fabric.mod.json"], {
    maxBuffer: 1024 * 1024,
  });
  return parseJson(FabricModSchema, stdout);
}

export async function clientArtifacts(artifactsDir = join(root, "dist"), pin?: ViaFabricPlusPin) {
  const baseJar = await artifact("viafabricplus", artifactsDir, pin);
  const addonJar = await artifact("viafabricplus-bedrock", artifactsDir);
  const [base, addon] = await Promise.all([mod(baseJar), mod(addonJar)]);
  if (base.id !== "viafabricplus" || addon.id !== "viafabricplus-bedrock")
    throw new Error("The two Fabric mod IDs do not match the expected stack");
  if (base.depends.minecraft !== addon.depends.minecraft)
    throw new Error("ViaFabricPlus and its Bedrock add-on target different Minecraft versions");
  for (const [name, modules] of [
    ["ViaBedrock", ["viabedrock"]],
    ["cubeconverter", ["cubeconverter", "vv-json"]],
  ] as const) {
    if (
      !addon.jars?.some(
        ({ file }) =>
          modules.some((module) => basename(file).toLowerCase().startsWith(`${module}-`)) &&
          file.endsWith("-StackAnvil.jar"),
      )
    ) {
      throw new Error(`The add-on does not embed the StackAnvil ${name} JAR`);
    }
  }
  const version = base.depends.minecraft;
  if (!/^[A-Za-z0-9][A-Za-z0-9.+_-]*$/u.test(version))
    throw new Error("The client must target one exact Minecraft version");
  return { baseJar, addonJar, version, loader: fabricLoader };
}
