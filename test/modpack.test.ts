import { createHash } from "node:crypto";
import { rejects } from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, relative } from "node:path";
import { expect, test } from "bun:test";
import { Effect } from "effect";
import { assetZip } from "../scripts/bundle-bedrock-assets.ts";
import { javaTarget } from "../src/client-artifacts.ts";
import { bundleModpack, modpackTarget } from "../src/modpack.ts";
import { root } from "../src/model.ts";
import type { ViaFabricPlusPin } from "../src/viafabricplus.ts";
import { writeClientJar } from "./helpers/client-artifacts.ts";

// This runs zip and unzip about 16 times, which can exceed the default limit on a loaded machine.
test("modpack preserves verified client bytes and refuses incompatible or corrupt rebuilds", async () => {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-modpack-"));
  try {
    const pin = JSON.parse(
      await readFile(join(root, "viafabricplus.json"), "utf8"),
    ) as ViaFabricPlusPin;
    const artifacts = join(directory, "artifacts");
    const output = join(directory, "packs");
    async function client(project: string, minecraft?: string, converter?: string) {
      const dir = join(artifacts, project);
      await mkdir(dir, { recursive: true });
      const file =
        project === "viafabricplus"
          ? `ViaFabricPlus-${pin.version}.jar`
          : `${project}-1-StackAnvil.jar`;
      const sha256 = await writeClientJar(dir, file, project, minecraft, converter);
      if (project === "viafabricplus") pin.sha256 = sha256;
      await writeFile(
        join(dir, "manifest.json"),
        JSON.stringify({
          baseSha: pin.commit,
          jenkinsBuild: pin.build,
          apiSha256: pin.apiSha256,
          artifacts: [{ file, sha256 }],
        }),
      );
      return join(dir, file);
    }
    const base = await client("viafabricplus");
    const addon = await client("viafabricplus-bedrock");
    const pack = await Effect.runPromise(
      bundleModpack(artifacts, relative(process.cwd(), output), pin),
    );
    const index = JSON.parse(
      execFileSync("unzip", ["-p", pack, "modrinth.index.json"], { encoding: "utf8" }),
    );
    expect(index.dependencies.minecraft).toBe(javaTarget.minecraft);
    expect(index.dependencies["fabric-loader"]).toBe(javaTarget.fabricLoader);
    expect(await modpackTarget(pack)).toMatchObject({
      minecraft: javaTarget.minecraft,
      loader: javaTarget.fabricLoader,
    });
    expect(index.files).toEqual([]);
    const entries = execFileSync("unzip", ["-Z1", pack], { encoding: "utf8" }).trim().split("\n");
    expect(entries.filter((entry) => !entry.endsWith("/"))).toHaveLength(3);
    for (const jar of [base, addon]) {
      const bytes = execFileSync("unzip", ["-p", pack, `client-overrides/mods/${basename(jar)}`]);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(
        createHash("sha256")
          .update(await readFile(jar))
          .digest("hex"),
      );
    }
    await client("viafabricplus-bedrock", undefined, "cubeconverter-1-StackAnvil.jar");
    await Effect.runPromise(bundleModpack(artifacts, output, pin));
    const legacy = await readFile(pack);
    await client("viafabricplus-bedrock", undefined, "vv-json-1.jar");
    await rejects(
      Effect.runPromise(bundleModpack(artifacts, output, pin)),
      /does not embed.*cubeconverter/,
    );
    expect(await readFile(pack)).toEqual(legacy);
    await client("viafabricplus-bedrock", "0.0");
    await rejects(Effect.runPromise(bundleModpack(artifacts, output, pin)), /different Minecraft/);
    expect(await readFile(pack)).toEqual(legacy);
    // Instance names, test servers, and the Fabric Loader pin follow javaTarget, not the JARs.
    await client("viafabricplus", "0.0");
    await rejects(
      Effect.runPromise(bundleModpack(artifacts, output, pin)),
      /target Minecraft 0\.0, but javaTarget/,
    );
    expect(await readFile(pack)).toEqual(legacy);
    await writeFile(addon, "Corrupted build");
    await rejects(Effect.runPromise(bundleModpack(artifacts, output, pin)), /checksum/);
    expect(await readFile(pack)).toEqual(legacy);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}, 60_000);

test("release notes read the game versions from the bundled pack they link", async () => {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-modpack-target-"));
  try {
    const index = Buffer.from(
      JSON.stringify({ dependencies: { minecraft: "26.4", "fabric-loader": "0.20.1" } }),
    );
    const pack = join(directory, "StackAnvil-26.4.mrpack");
    await writeFile(pack, assetZip(new Map([["modrinth.index.json", index]])));
    expect(await modpackTarget(pack)).toEqual({
      file: "StackAnvil-26.4.mrpack",
      minecraft: "26.4",
      loader: "0.20.1",
    });
    const renamed = join(directory, "StackAnvil-26.3.mrpack");
    await writeFile(renamed, await readFile(pack));
    await rejects(modpackTarget(renamed), /does not name its Minecraft 26.4 target/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
