import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { root } from "../model.ts";

const packSource = join(root, "test-packs", "entity-probe", "behavior_pack");
const packName = "stackanvil-entity-probe";
const prefix = "[ViaBedrock Entity Probe]";

interface PackManifest {
  header: { uuid: string; version: number[] };
}

export async function installEntityProbe(serverHome: string, worldName: string): Promise<void> {
  const manifest = JSON.parse(await readFile(join(packSource, "manifest.json"), "utf8")) as PackManifest;
  if (!manifest.header.uuid || manifest.header.version.length !== 3) {
    throw new Error("Entity probe pack has an invalid manifest.");
  }
  await mkdir(join(serverHome, "behavior_packs"), { recursive: true });
  await cp(packSource, join(serverHome, "behavior_packs", packName), { recursive: true });
  const world = join(serverHome, "worlds", worldName);
  await mkdir(world, { recursive: true });
  await writeFile(join(world, "world_behavior_packs.json"), JSON.stringify([
    { pack_id: manifest.header.uuid, version: manifest.header.version },
  ], null, 2) + "\n");
}

export interface ProbeResult {
  attempted: number;
  passed: number;
  failed: number;
}

export function probeResult(log: string, group: "status" | "metadata"): ProbeResult | undefined {
  const summary = log.split("\n").find((line) => line.includes(`${prefix} ${group} sweep complete:`));
  const match = summary && /(\d+) attempted, (\d+) passed, (\d+) failed\./.exec(summary);
  if (!match) return undefined;
  return { attempted: Number(match[1]), passed: Number(match[2]), failed: Number(match[3]) };
}

export async function waitForProbe(group: "status" | "metadata", log: () => Promise<string>, alive: () => boolean,
  timeoutMs = 60_000, pollMs = 500): Promise<ProbeResult> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const output = await log();
    const result = probeResult(output, group);
    if (result) {
      if (result.failed || !result.attempted || result.passed !== result.attempted) {
        throw new Error(`${group} entity probe failed: ${result.passed}/${result.attempted} passed. Read the Bedrock server log.`);
      }
      return result;
    }
    if (!alive()) throw new Error(`A game process stopped during the ${group} entity probe.`);
    await Bun.sleep(pollMs);
  }
  throw new Error(`${group} entity probe did not finish in ${timeoutMs / 1000}s. Check pack loading and the Bedrock server log.`);
}
