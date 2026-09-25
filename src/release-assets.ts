import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, readdir, rm } from "node:fs/promises";
import { basename, join } from "node:path";
import { root, targetIds } from "./model.ts";

interface ArtifactManifest {
  target: string;
  artifacts: { file: string; sha256: string }[];
}

export async function prepareReleaseAssets(artifactsDir: string, outputDir: string, projects: readonly string[]): Promise<string[]> {
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  const names = new Set<string>();

  for (const project of projects) {
    const projectDir = join(artifactsDir, project);
    const manifest = JSON.parse(await readFile(join(projectDir, "manifest.json"), "utf8")) as ArtifactManifest;
    if (manifest.target !== project || manifest.artifacts.length !== 1) {
      throw new Error(`Expected one ${project} release JAR in its build manifest`);
    }
    const artifact = manifest.artifacts[0]!;
    if (basename(artifact.file) !== artifact.file || !artifact.file.endsWith("-StackAnvil.jar")) {
      throw new Error(`Invalid ${project} release JAR name: ${artifact.file}`);
    }
    const bytes = await readFile(join(projectDir, artifact.file));
    const digest = createHash("sha256").update(bytes).digest("hex");
    if (digest !== artifact.sha256) throw new Error(`Build checksum failed for ${project}`);
    if (names.has(artifact.file)) throw new Error(`Duplicate release asset: ${artifact.file}`);
    names.add(artifact.file);
    await copyFile(join(projectDir, artifact.file), join(outputDir, artifact.file));
  }

  const prismDir = join(artifactsDir, "prism");
  const zips = (await readdir(prismDir)).filter((file) => /^StackAnvil-.+-Prism-Launcher_Config\.zip$/.test(file));
  if (zips.length !== 1) throw new Error(`Expected one Prism Launcher config ZIP, found ${zips.length}`);
  const zip = zips[0]!;
  if (names.has(zip)) throw new Error(`Duplicate release asset: ${zip}`);
  names.add(zip);
  await copyFile(join(prismDir, zip), join(outputDir, zip));
  return [...names];
}

if (import.meta.main) {
  prepareReleaseAssets(join(root, "artifacts"), join(root, "release"), await targetIds())
    .then((files) => console.log(files.join("\n")))
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}
