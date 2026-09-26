import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { Effect } from "effect";
import JSON5 from "json5";
import { root } from "../model.ts";

const catalogPath = join(root, "test-packs", "entity-probe", "behavior_pack", "scripts", "catalog.js");

interface PropertyDefinition {
  client_sync?: boolean;
  type?: string;
  values?: unknown[];
  range?: unknown[];
  default?: unknown;
}

interface EntityDefinition {
  "minecraft:entity"?: {
    description?: {
      identifier?: string;
      is_summonable?: boolean;
      properties?: Record<string, PropertyDefinition>;
    };
    events?: Record<string, unknown>;
  };
}

interface CatalogProperty { id: string; type: string | null; values: unknown[] }
export interface CatalogEntry {
  type: string;
  summonable: boolean;
  events: string[];
  properties: CatalogProperty[];
}

function values(definition: PropertyDefinition): unknown[] {
  switch (definition.type) {
    case "enum": return definition.values ?? [];
    case "bool": return [false, true];
    case "int":
    case "float": {
      const range = definition.range ?? [];
      return [...new Set([range[0], definition.default, range.at(-1)].filter((value) => value != null))];
    }
    default: return [];
  }
}

export function catalogEntry(source: EntityDefinition): CatalogEntry | undefined {
  const entity = source["minecraft:entity"];
  const description = entity?.description;
  if (!entity || !description?.identifier) return undefined;
  const properties = Object.entries(description.properties ?? {}).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .filter(([, definition]) => definition.client_sync)
    .map(([id, definition]) => ({ id, type: definition.type ?? null, values: values(definition) }));
  return {
    type: description.identifier,
    summonable: description.is_summonable ?? true,
    events: Object.keys(entity.events ?? {}).sort(),
    properties,
  };
}

export async function generateCatalog(entities: string, version: string, output = catalogPath): Promise<CatalogEntry[]> {
  if (!/^v\d+\.\d+\.\d+\.\d+$/.test(version)) throw new Error("Supply a Bedrock samples tag such as v1.26.40.05.");
  const files = (await readdir(entities)).filter((file) => file.endsWith(".json")).sort();
  if (!files.length) throw new Error(`No entity JSON files found in ${entities}.`);
  const catalog: CatalogEntry[] = [];
  for (const file of files) {
    const source = JSON5.parse(await readFile(join(entities, file), "utf8")) as EntityDefinition;
    const entry = catalogEntry(source);
    if (entry) catalog.push(entry);
  }
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `// Generated from Mojang bedrock-samples ${version}. Do not edit.\nexport const catalog = ${JSON.stringify(catalog)};\n`);
  return catalog;
}

if (import.meta.main) {
  const [entities, version] = Bun.argv.slice(2);
  Effect.runPromise(Effect.tryPromise({
    try: async () => {
      if (!entities || !version) throw new Error("Use: bun run integration:entity-probe:generate <entities-dir> <samples-tag>.");
      const catalog = await generateCatalog(resolve(entities), version);
      console.log(`${catalog.length} types, ${catalog.reduce((total, entry) => total + entry.events.length, 0)} events, `
        + `${catalog.reduce((total, entry) => total + entry.properties.length, 0)} synced properties`);
    },
    catch: (cause) => cause instanceof Error ? cause : new Error(String(cause)),
  })).catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
}
