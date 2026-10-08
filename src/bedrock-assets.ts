import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { zipEntries } from "./zip.ts";

export const builtinAssetsResource = "assets/viafabricplus-bedrock/builtin";

/** Verifies all versioned actor archives before they become Gradle inputs. */
export async function verifyBuiltinAssets(directory: string, version: string): Promise<Map<string, Buffer>> {
  const manifestBytes = await readFile(join(directory, "manifest.json"));
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  if (manifest.format !== 1 || manifest.version !== version || manifest.protocolVersion !== version.split(".").slice(0, 3).join(".")
      || !Array.isArray(manifest.archives) || manifest.archives.length === 0 || manifest.archives.length > 16) {
    throw new Error("Invalid bundled Bedrock actor manifest");
  }
  const resources = new Map<string, Buffer>([["manifest.json", manifestBytes]]);
  const paths = new Set<string>();
  let expanded = 0;
  for (const archive of manifest.archives) {
    if (!/^builtin-\d{2}\.zip$/.test(archive.name) || resources.has(archive.name)) throw new Error("Invalid bundled actor archive name");
    const bytes = await readFile(join(directory, archive.name));
    if (createHash("sha256").update(bytes).digest("hex") !== archive.sha256) throw new Error(`Bundled actor archive identity mismatch: ${archive.name}`);
    const entries = zipEntries(bytes);
    let archiveExpanded = 0;
    for (const [path, read] of entries) {
      if (paths.has(path) || /[\\:\0]/.test(path) || path.split("/").some((part) => !part || part === "." || part === "..")) {
        throw new Error("Invalid bundled actor resource path");
      }
      const size = read().length;
      if (size === 0) throw new Error(`Empty bundled actor resource: ${path}`);
      archiveExpanded += size;
      if (expanded + archiveExpanded > 256 * 1024 * 1024 || paths.size >= 32768) throw new Error("Bundled actor resources exceed limits");
      paths.add(path);
    }
    if (entries.size !== archive.files || archiveExpanded !== archive.expandedBytes) throw new Error("Bundled actor archive contents mismatch");
    expanded += archiveExpanded;
    resources.set(archive.name, bytes);
  }
  if (paths.size !== manifest.files || expanded !== manifest.expandedBytes) throw new Error("Bundled actor manifest totals mismatch");
  for (const path of ["entity/player.entity.json", "models/mobs.json", "animations/player.animation.json",
    "animation_controllers/player.animation_controllers.json", "render_controllers/player.render_controllers.json", "materials/entity.material"]) {
    if (!paths.has(`library/vanilla/${path}`)) throw new Error(`Bundled actor resources are missing ${path}`);
  }
  if (![...paths].some((path) => /^library\/vanilla[^/]*\/attachables\/.+\.json$/.test(path))) throw new Error("Bundled native equipment definitions are missing");
  return resources;
}

/** Checks every actor archive in the actual Fabric distributable. */
export async function verifyEmbeddedBuiltinAssets(artifact: string, directory: string, version: string): Promise<void> {
  const resources = await verifyBuiltinAssets(directory, version);
  const embedded = zipEntries(await readFile(artifact));
  for (const [name, bytes] of resources) {
    if (!embedded.get(`${builtinAssetsResource}/${name}`)?.().equals(bytes)) throw new Error(`The Bedrock add-on did not embed ${name}`);
  }
}
