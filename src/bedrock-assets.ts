import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Schema } from "effect";
import { writeArchives } from "../scripts/bundle-bedrock-assets.ts";
import { nestedJarLimit, zipEntries } from "./zip.ts";

export const builtinAssetsResource = "assets/viafabricplus-bedrock/builtin";
/** The core image bundle that a shared add-on library reads from its nested ViaBedrock JAR. */
const coreImagesResource = "assets/viabedrock/builtin_images.zip";

const sha256 = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

const isBuiltinAssetsManifest = Schema.is(
  Schema.Struct({
    format: Schema.Literal(1),
    version: Schema.String,
    protocolVersion: Schema.String,
    files: Schema.Finite,
    expandedBytes: Schema.Finite,
    archives: Schema.Array(
      Schema.Struct({
        name: Schema.String,
        sha256: Schema.String,
        files: Schema.Finite,
        expandedBytes: Schema.Finite,
      }),
    ),
    images: Schema.optional(
      Schema.Struct({ sha256: Schema.String, files: Schema.Finite, expandedBytes: Schema.Finite }),
    ),
  }),
);

/**
 * Verifies all versioned actor archives before they become Gradle inputs. A shared library keeps
 * its textures in the core image bundle, which must then complete the manifest totals.
 */
export async function verifyBuiltinAssets(
  directory: string,
  version: string,
  coreImages?: Buffer,
): Promise<Map<string, Buffer>> {
  const manifestBytes = await readFile(join(directory, "manifest.json"));
  const manifest: unknown = JSON.parse(manifestBytes.toString("utf8"));
  if (
    !isBuiltinAssetsManifest(manifest) ||
    manifest.version !== version ||
    manifest.protocolVersion !== version.split(".").slice(0, 3).join(".") ||
    manifest.archives.length === 0 ||
    manifest.archives.length > 16
  ) {
    throw new Error("Invalid bundled Bedrock actor manifest");
  }
  const resources = new Map<string, Buffer>([["manifest.json", manifestBytes]]);
  const paths = new Set<string>();
  let expanded = 0;
  for (const archive of manifest.archives) {
    if (!/^builtin-\d{2}\.zip$/u.test(archive.name) || resources.has(archive.name))
      throw new Error("Invalid bundled actor archive name");
    const bytes = await readFile(join(directory, archive.name));
    if (createHash("sha256").update(bytes).digest("hex") !== archive.sha256)
      throw new Error(`Bundled actor archive identity mismatch: ${archive.name}`);
    const entries = zipEntries(bytes);
    let archiveExpanded = 0;
    for (const [path, read] of entries) {
      if (
        paths.has(path) ||
        /[\\:\0]/u.test(path) ||
        path.split("/").some((part) => !part || part === "." || part === "..")
      ) {
        throw new Error("Invalid bundled actor resource path");
      }
      const size = read().length;
      if (size === 0) throw new Error(`Empty bundled actor resource: ${path}`);
      archiveExpanded += size;
      if (expanded + archiveExpanded > 256 * 1024 * 1024 || paths.size >= 32_768)
        throw new Error("Bundled actor resources exceed limits");
      paths.add(path);
    }
    if (entries.size !== archive.files || archiveExpanded !== archive.expandedBytes)
      throw new Error("Bundled actor archive contents mismatch");
    expanded += archiveExpanded;
    resources.set(archive.name, bytes);
  }
  if (manifest.images) {
    if (!coreImages || sha256(coreImages) !== manifest.images.sha256)
      throw new Error("The shared core image bundle does not match the actor manifest");
    let imageFiles = 0;
    let imageBytes = 0;
    for (const [path, read] of zipEntries(coreImages)) {
      if (path === "manifest.json") continue;
      if (paths.has(path)) throw new Error(`Bundled actor archives repeat a core image: ${path}`);
      imageFiles += 1;
      imageBytes += read().length;
    }
    if (imageFiles !== manifest.images.files || imageBytes !== manifest.images.expandedBytes)
      throw new Error("The shared core image bundle contents mismatch");
    expanded += imageBytes;
    if (paths.size + imageFiles !== manifest.files || expanded !== manifest.expandedBytes)
      throw new Error("Bundled actor manifest totals mismatch");
  } else if (paths.size !== manifest.files || expanded !== manifest.expandedBytes)
    throw new Error("Bundled actor manifest totals mismatch");
  for (const path of [
    "entity/player.entity.json",
    "models/mobs.json",
    "animations/player.animation.json",
    "animation_controllers/player.animation_controllers.json",
    "render_controllers/player.render_controllers.json",
    "materials/entity.material",
  ]) {
    if (!paths.has(`library/vanilla/${path}`))
      throw new Error(`Bundled actor resources are missing ${path}`);
  }
  if (![...paths].some((path) => /^library\/vanilla[^/]*\/attachables\/.+\.json$/u.test(path)))
    throw new Error("Bundled native equipment definitions are missing");
  return resources;
}

/**
 * Checks every actor archive in the actual Fabric distributable. A shared library must find its
 * core images in the nested ViaBedrock JAR, and the add-on must not repeat core resources.
 */
export async function verifyEmbeddedBuiltinAssets(
  artifact: string,
  directory: string,
  version: string,
): Promise<void> {
  const embedded = zipEntries(await readFile(artifact));
  const cores = [...embedded].filter(([path]) =>
    /^META-INF\/jars\/ViaBedrock-[^/]+\.jar$/u.test(path),
  );
  const [core] = cores;
  const coreImages =
    cores.length === 1 && core
      ? zipEntries(core[1](nestedJarLimit)).get(coreImagesResource)?.()
      : undefined;
  const resources = await verifyBuiltinAssets(directory, version, coreImages);
  for (const [name, bytes] of resources) {
    if (!embedded.get(`${builtinAssetsResource}/${name}`)?.().equals(bytes))
      throw new Error(`The Bedrock add-on did not embed ${name}`);
  }
  const repeated = [...embedded.keys()].find((path) => path.startsWith("assets/viabedrock/"));
  if (repeated) throw new Error(`The Bedrock add-on repeats the core resource ${repeated}`);
}

/**
 * Prepares the add-on resource root for a full-stack build. The add-on's nested ViaBedrock JAR
 * already carries the core UI bundle and an image bundle derived from these archives, so this
 * root leaves out the core UI and repacks the archives without those images. The manifest keeps
 * the complete library totals and binds the archives to the exact image bundle.
 */
export async function prepareSharedAddOnAssets(
  source: string,
  version: string,
  coreImagesPath: string,
  output: string,
): Promise<string> {
  const sourceLibrary = join(source, builtinAssetsResource);
  const sourceManifest = await readFile(join(sourceLibrary, "manifest.json"));
  const coreImages = await readFile(coreImagesPath);
  const identity = { source: sha256(sourceManifest), images: sha256(coreImages) };
  const library = join(output, builtinAssetsResource);
  const previous = await readFile(join(library, "manifest.json"), "utf8").catch(() => undefined);
  if (previous) {
    const prepared: unknown = JSON.parse(previous);
    if (
      isPreparedManifest(prepared) &&
      prepared.source === identity.source &&
      prepared.images.sha256 === identity.images &&
      (await verifyBuiltinAssets(library, version, coreImages).then(
        () => true,
        () => false,
      ))
    )
      return output;
  }
  const resources = await verifyBuiltinAssets(sourceLibrary, version);
  const files = new Map<string, Buffer>();
  for (const [name, bytes] of resources)
    if (name.endsWith(".zip"))
      for (const [path, read] of zipEntries(bytes)) files.set(path, read());
  let imageFiles = 0;
  let imageBytes = 0;
  for (const [path, read] of zipEntries(coreImages)) {
    if (path === "manifest.json") continue;
    const bytes = read();
    if (!files.get(path)?.equals(bytes))
      throw new Error(`The core image bundle does not match the add-on resource ${path}`);
    files.delete(path);
    imageFiles += 1;
    imageBytes += bytes.length;
  }
  if (imageFiles === 0) throw new Error("The core image bundle has no images");
  const manifest: unknown = JSON.parse(sourceManifest.toString("utf8"));
  if (!isBuiltinAssetsManifest(manifest)) throw new Error("Invalid bundled Bedrock actor manifest");
  const staging = `${output}.staging`;
  await rm(staging, { recursive: true, force: true });
  const stagedLibrary = join(staging, builtinAssetsResource);
  await mkdir(stagedLibrary, { recursive: true });
  const archives = await writeArchives(files, stagedLibrary);
  const { format, version: assetVersion, protocolVersion } = manifest;
  await writeFile(
    join(stagedLibrary, "manifest.json"),
    `${JSON.stringify(
      {
        format,
        version: assetVersion,
        protocolVersion,
        files: manifest.files,
        expandedBytes: manifest.expandedBytes,
        archives,
        images: { sha256: identity.images, files: imageFiles, expandedBytes: imageBytes },
        source: identity.source,
      },
      null,
      2,
    )}\n`,
  );
  await copyFile(join(sourceLibrary, "NOTICE.txt"), join(stagedLibrary, "NOTICE.txt"));
  // Keep the add-on's other resources, such as the OreUI bundle, beside the repacked library.
  const addOnResources = join(source, "assets", "viafabricplus-bedrock");
  for (const entry of await readdir(addOnResources, { withFileTypes: true })) {
    if (entry.name === "builtin") continue;
    if (!entry.isFile()) throw new Error(`Unexpected add-on resource directory: ${entry.name}`);
    await copyFile(
      join(addOnResources, entry.name),
      join(staging, "assets", "viafabricplus-bedrock", entry.name),
    );
  }
  await verifyBuiltinAssets(stagedLibrary, version, coreImages);
  await rm(output, { recursive: true, force: true });
  await rename(staging, output);
  return output;
}

const isPreparedManifest = Schema.is(
  Schema.Struct({ source: Schema.String, images: Schema.Struct({ sha256: Schema.String }) }),
);
