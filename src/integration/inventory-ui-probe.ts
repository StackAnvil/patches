import { cp, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { root } from "../model.ts";
import { parseJson } from "../guards.ts";
import { PackManifestSchema, registerWorldPack } from "./world-packs.ts";

export const authoredInventoryCaseIds = [
  "chest-authored-one-empty",
  "chest-authored-one-merge",
] as const;

export function isAuthoredInventoryCase(id: string): boolean {
  return authoredInventoryCaseIds.some((candidate) => candidate === id);
}

export async function installInventoryUiProbe(
  serverHome: string,
  worldName: string,
): Promise<void> {
  const source = join(root, "test-packs", "inventory-ui-probe", "resource_pack");
  const manifest = parseJson(
    PackManifestSchema,
    await readFile(join(source, "manifest.json"), "utf8"),
  );
  const pack = join(serverHome, "resource_packs", "stackanvil-inventory-ui-probe");
  await cp(source, pack, { recursive: true });
  const world = join(serverHome, "worlds", worldName);
  await mkdir(world, { recursive: true });
  await registerWorldPack(join(world, "world_resource_packs.json"), {
    pack_id: manifest.header.uuid,
    version: manifest.header.version,
  });
}
