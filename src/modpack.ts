import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFile, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { promisify } from "node:util";
import { Effect } from "effect";
import { clientArtifacts } from "./client-artifacts.ts";
import { root } from "./model.ts";
import type { ViaFabricPlusPin } from "./viafabricplus.ts";

const execute = promisify(execFile);

// Client overrides keep the verified Jenkins and StackAnvil JARs in the pack.
// Importing does not require a modpack project or URLs for unpublished builds.
export const bundleModpack = Effect.fn("bundleModpack")(function* (
  artifactsDir = join(root, "dist"), outputDir = join(root, "dist", "modpack"), pin?: ViaFabricPlusPin,
) {
  return yield* Effect.tryPromise({
    try: async () => {
      artifactsDir = resolve(artifactsDir);
      outputDir = resolve(outputDir);
      const { baseJar, addonJar, version, loader } = await clientArtifacts(artifactsDir, pin);
      await mkdir(outputDir, { recursive: true });
      const staging = await mkdtemp(join(outputDir, ".modpack-"));
      try {
        const mods = join(staging, "client-overrides", "mods");
        await mkdir(mods, { recursive: true });
        const content = [];
        for (const jar of [baseJar, addonJar]) {
          const file = basename(jar);
          await copyFile(jar, join(mods, file));
          content.push({ file, sha256: createHash("sha256").update(await readFile(join(mods, file))).digest("hex") });
        }
        const versionId = createHash("sha256").update(JSON.stringify({ version, loader, content })).digest("hex");
        await writeFile(join(staging, "modrinth.index.json"), `${JSON.stringify({
          formatVersion: 1,
          game: "minecraft",
          versionId,
          name: "StackAnvil Bedrock client",
          summary: "ViaFabricPlus and the StackAnvil Bedrock add-on for Minecraft Java Edition.",
          files: [],
          dependencies: { minecraft: version, "fabric-loader": loader },
        }, null, 2)}\n`);
        const archive = join(staging, "pack.mrpack");
        await execute("zip", ["-q", "-r", archive, "modrinth.index.json", "client-overrides"], { cwd: staging });
        await execute("unzip", ["-tq", archive]);
        const output = join(outputDir, `StackAnvil-${version}.mrpack`);
        await rename(archive, output);
        return output;
      } finally {
        await rm(staging, { recursive: true, force: true });
      }
    },
    catch: (cause) => cause instanceof Error ? cause : new Error(String(cause)),
  });
});
