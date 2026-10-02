import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";

export interface WorldPackDeclaration {
  pack_id: string;
  version: number[];
}

/** Replace a pack at its existing position, leaving other world declarations intact. */
export async function registerWorldPack(path: string, pack: WorldPackDeclaration): Promise<void> {
  const declarations = existsSync(path) ? JSON.parse(await readFile(path, "utf8")) : [];
  if (!Array.isArray(declarations)) throw new Error(`World pack declarations must be an array: ${path}`);
  let replaced = false;
  const updated = declarations.flatMap((declaration: WorldPackDeclaration) => {
    if (declaration.pack_id !== pack.pack_id) return [declaration];
    if (replaced) return [];
    replaced = true;
    return [{ ...declaration, ...pack }];
  });
  if (!replaced) updated.push(pack);
  await writeFile(path, `${JSON.stringify(updated, null, 2)}\n`, { mode: 0o600 });
}
