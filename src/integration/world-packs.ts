import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { Schema } from "effect";

/** The header of a Bedrock pack `manifest.json`. */
export const PackManifestSchema = Schema.Struct({
  header: Schema.Struct({
    uuid: Schema.String,
    version: Schema.mutable(Schema.Array(Schema.Finite)),
  }),
});

export interface WorldPackDeclaration {
  pack_id: string;
  version: number[];
}

const isWorldPackDeclarations = Schema.is(
  Schema.Array(
    Schema.Struct({ pack_id: Schema.String, version: Schema.mutable(Schema.Array(Schema.Finite)) }),
  ),
);

/** Replace a pack at its existing position, leaving other world declarations intact. */
export async function registerWorldPack(path: string, pack: WorldPackDeclaration): Promise<void> {
  const declarations: unknown = existsSync(path) ? JSON.parse(await readFile(path, "utf8")) : [];
  if (!isWorldPackDeclarations(declarations))
    throw new Error(
      `World pack declarations must be an array of pack_id and version entries: ${path}`,
    );
  const updated: WorldPackDeclaration[] = [];
  let replaced = false;
  for (const declaration of declarations) {
    if (declaration.pack_id !== pack.pack_id) updated.push(declaration);
    else if (!replaced) {
      updated.push({ ...declaration, ...pack });
      replaced = true;
    }
  }
  if (!replaced) updated.push(pack);
  await writeFile(path, `${JSON.stringify(updated, null, 2)}\n`, { mode: 0o600 });
}
