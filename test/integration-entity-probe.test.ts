import { expect, test } from "bun:test";
import { mkdtemp, readFile, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installEntityProbe, probeResult, waitForProbe } from "../src/integration/entity-probe.ts";

test("install entity probe into an isolated Bedrock world", async () => {
  const home = await mkdtemp(join(tmpdir(), "stackanvil-entity-probe-"));
  try {
    await installEntityProbe(home, "integration-world");
    const manifest = JSON.parse(await readFile(join(home, "behavior_packs", "stackanvil-entity-probe", "manifest.json"), "utf8"));
    const active = JSON.parse(await readFile(join(home, "worlds", "integration-world", "world_behavior_packs.json"), "utf8"));
    expect(active).toEqual([{ pack_id: manifest.header.uuid, version: manifest.header.version }]);
    const scripts = join(home, "behavior_packs", "stackanvil-entity-probe", "scripts");
    expect(await readdir(scripts)).toEqual(["main.js"]);
    expect((await stat(join(scripts, "main.js"))).size).toBeGreaterThan(0);
  } finally {
    await rm(home, { recursive: true, force: true });
  }
});

test("entity probe summary is scoped to the requested group", async () => {
  const log = "[ViaBedrock Entity Probe] status sweep complete: 7 attempted, 7 passed, 0 failed.\n"
    + "[ViaBedrock Entity Probe] metadata sweep complete: 8 attempted, 7 passed, 1 failed.";
  expect(probeResult(log, "status")).toEqual({ attempted: 7, passed: 7, failed: 0 });
  await expect(waitForProbe("metadata", async () => log, () => true, 10, 1)).rejects.toThrow("7/8 passed");
  await expect(waitForProbe("status", async () => log, () => true, 10, 1)).resolves.toEqual({ attempted: 7, passed: 7, failed: 0 });
});
