import { encodeJson, encodeIndentedJson } from "./guards.ts";
import { createHash } from "node:crypto";
import { copyFile, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { Effect, Schema } from "effect";
import { clientArtifacts } from "./client-artifacts.ts";
import { root } from "./model.ts";
import type { ViaFabricPlusPin } from "./viafabricplus.ts";
import { execFileAsync as execute } from "./process.ts";

// Client overrides keep the verified Jenkins and StackAnvil JARs in the pack.
// Importing does not require a modpack project or URLs for unpublished builds.
/** The client modpack could not be bundled. */
// oxlint-disable-next-line unicorn/throw-new-error -- Schema.TaggedError is a class factory.
export class ModpackError extends Schema.TaggedError<
  ModpackError,
  { readonly brand: unique symbol }
>()("ModpackError", {
  message: Schema.String,
  cause: Schema.Unknown,
}) {}

export const bundleModpack = Effect.fn("bundleModpack")(function* (
  artifactsPath: string = join(root, "dist"),
  outputPath: string = join(root, "dist", "modpack"),
  pin?: ViaFabricPlusPin,
) {
  return yield* Effect.tryPromise({
    try: async () => {
      const artifactsDir = resolve(artifactsPath);
      const outputDir = resolve(outputPath);
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
          content.push({
            file,
            sha256: createHash("sha256")
              .update(await readFile(join(mods, file)))
              .digest("hex"),
          });
        }
        const versionId = createHash("sha256")
          .update(encodeJson({ version, loader, content }))
          .digest("hex");
        await writeFile(
          join(staging, "modrinth.index.json"),
          `${encodeIndentedJson({
            formatVersion: 1,
            game: "minecraft",
            versionId,
            name: "StackAnvil Bedrock client",
            summary: "ViaFabricPlus and the StackAnvil Bedrock add-on for Minecraft Java Edition.",
            files: [],
            dependencies: { minecraft: version, "fabric-loader": loader },
          })}\n`,
        );
        const archive = join(staging, "pack.mrpack");
        await execute("zip", ["-q", "-r", archive, "modrinth.index.json", "client-overrides"], {
          cwd: staging,
        });
        await execute("unzip", ["-tq", archive]);
        const output = join(outputDir, `StackAnvil-${version}.mrpack`);
        await rename(archive, output);
        return output;
      } finally {
        await rm(staging, { recursive: true, force: true });
      }
    },
    catch: (cause) =>
      new ModpackError({
        message: cause instanceof Error ? cause.message : String(cause),
        cause,
      }),
  });
});
