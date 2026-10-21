import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { Effect } from "effect";
import { bundleModpack } from "./modpack.ts";
import { root, targetIds } from "./model.ts";
import { verifyPinnedManifest, type ViaFabricPlusPin } from "./viafabricplus.ts";
import {
  buildArtifactEvidence,
  requireReleaseEvidence,
  validationMarkdown,
  type ValidationReport,
} from "./validation.ts";
import { git } from "./process.ts";

interface ArtifactManifest {
  target: string;
  baseSha?: string;
  jenkinsBuild?: number;
  apiSha256?: string;
  artifacts: { file: string; sha256: string }[];
}

export async function prepareReleaseAssets(
  artifactsDir: string,
  outputDir: string,
  projects: readonly string[],
  viaFabricPlusPin?: ViaFabricPlusPin,
): Promise<string[]> {
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  const names = new Set<string>();

  for (const project of [...projects, "viafabricplus"]) {
    const projectDir = join(artifactsDir, project);
    const manifest = JSON.parse(
      await readFile(join(projectDir, "manifest.json"), "utf8"),
    ) as ArtifactManifest;
    if (manifest.target !== project || manifest.artifacts.length !== 1) {
      throw new Error(`Expected one ${project} release JAR in its build manifest`);
    }
    if (project === "viafabricplus") await verifyPinnedManifest(manifest, viaFabricPlusPin);
    const artifact = manifest.artifacts[0]!;
    if (
      basename(artifact.file) !== artifact.file ||
      (project === "viafabricplus"
        ? !/^ViaFabricPlus-[^/]+\.jar$/.test(artifact.file)
        : !artifact.file.endsWith("-StackAnvil.jar"))
    ) {
      throw new Error(`Invalid ${project} release JAR name: ${artifact.file}`);
    }
    const bytes = await readFile(join(projectDir, artifact.file));
    const digest = createHash("sha256").update(bytes).digest("hex");
    if (digest !== artifact.sha256) throw new Error(`Build checksum failed for ${project}`);
    if (names.has(artifact.file)) throw new Error(`Duplicate release asset: ${artifact.file}`);
    names.add(artifact.file);
    await copyFile(join(projectDir, artifact.file), join(outputDir, artifact.file));
    if (project === "viafabricplus-bedrock" || project === "viafabricplus") {
      const manifestName = `${project}-manifest.json`;
      names.add(manifestName);
      await copyFile(join(projectDir, "manifest.json"), join(outputDir, manifestName));
    }
  }

  // Rebuild from this release's verified JARs, never copy a stale local pack.
  names.add(
    basename(await Effect.runPromise(bundleModpack(artifactsDir, outputDir, viaFabricPlusPin))),
  );
  return [...names];
}

export async function prepareValidatedRelease(
  artifactsDir: string,
  outputDir: string,
  revision: string,
  projects: readonly string[],
  pin?: ViaFabricPlusPin,
): Promise<string[]> {
  const report = JSON.parse(
    await readFile(join(artifactsDir, "validation", "release.json"), "utf8"),
  ) as ValidationReport;
  requireReleaseEvidence(
    report,
    revision,
    await buildArtifactEvidence(artifactsDir, { projects, pin }),
  );
  const files = await prepareReleaseAssets(artifactsDir, outputDir, projects, pin);
  await writeFile(join(outputDir, "validation.json"), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(join(outputDir, "validation.md"), validationMarkdown(report));
  return [...files, "validation.json", "validation.md"];
}

if (import.meta.main) {
  prepareValidatedRelease(
    join(root, "artifacts"),
    join(root, "release"),
    await Effect.runPromise(git(["rev-parse", "HEAD"], root)),
    await targetIds(),
  )
    .then((files) => console.log(files.join("\n")))
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}
