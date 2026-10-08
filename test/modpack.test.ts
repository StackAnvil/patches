import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, relative } from "node:path";
import { expect, test } from "bun:test";
import { Effect } from "effect";
import { bundleModpack } from "../src/modpack.ts";
import { root } from "../src/model.ts";
import type { ViaFabricPlusPin } from "../src/viafabricplus.ts";
import { writeClientJar } from "./helpers/client-artifacts.ts";

test("modpack preserves verified client bytes and refuses incompatible or corrupt rebuilds", async () => {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-modpack-"));
  try {
    const pin = JSON.parse(await readFile(join(root, "viafabricplus.json"), "utf8")) as ViaFabricPlusPin;
    const artifacts = join(directory, "artifacts");
    const output = join(directory, "packs");
    async function client(project: string, minecraft = "26.3") {
      const dir = join(artifacts, project);
      await mkdir(dir, { recursive: true });
      const file = project === "viafabricplus" ? `ViaFabricPlus-${pin.version}.jar` : `${project}-1-StackAnvil.jar`;
      const sha256 = await writeClientJar(dir, file, project, minecraft);
      if (project === "viafabricplus") pin.sha256 = sha256;
      await writeFile(join(dir, "manifest.json"), JSON.stringify({
        baseSha: pin.commit, jenkinsBuild: pin.build, apiSha256: pin.apiSha256, artifacts: [{ file, sha256 }],
      }));
      return join(dir, file);
    }
    const base = await client("viafabricplus");
    const addon = await client("viafabricplus-bedrock");
    const pack = await Effect.runPromise(bundleModpack(artifacts, relative(process.cwd(), output), pin));
    const original = await readFile(pack);
    const index = JSON.parse(execFileSync("unzip", ["-p", pack, "modrinth.index.json"], { encoding: "utf8" }));
    expect(index.dependencies.minecraft).toBe("26.3");
    expect(index.dependencies["fabric-loader"]).toBe("0.19.5");
    expect(index.files).toEqual([]);
    const entries = execFileSync("unzip", ["-Z1", pack], { encoding: "utf8" }).trim().split("\n");
    expect(entries.filter((entry) => !entry.endsWith("/"))).toHaveLength(3);
    for (const jar of [base, addon]) {
      const bytes = execFileSync("unzip", ["-p", pack, `client-overrides/mods/${basename(jar)}`]);
      expect(createHash("sha256").update(bytes).digest("hex"))
        .toBe(createHash("sha256").update(await readFile(jar)).digest("hex"));
    }
    await client("viafabricplus-bedrock", "26.4");
    await expect(Effect.runPromise(bundleModpack(artifacts, output, pin))).rejects.toThrow(/different Minecraft/);
    expect(await readFile(pack)).toEqual(original);
    await writeFile(addon, "Corrupted build");
    await expect(Effect.runPromise(bundleModpack(artifacts, output, pin))).rejects.toThrow(/checksum/);
    expect(await readFile(pack)).toEqual(original);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
