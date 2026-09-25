import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "bun:test";
import { prepareReleaseAssets } from "../src/release-assets.ts";

test("release selects verified project JARs and the Prism config", async () => {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-release-"));
  try {
    const artifacts = join(directory, "artifacts");
    const output = join(directory, "release");
    const projects = ["cubeconverter", "viabedrock", "viafabricplus", "viafabricplus-bedrock"];
    for (const project of projects) {
      const projectDir = join(artifacts, project);
      await mkdir(projectDir, { recursive: true });
      const file = `${project}-1-StackAnvil.jar`;
      const bytes = Buffer.from(project);
      await writeFile(join(projectDir, file), bytes);
      await writeFile(join(projectDir, "pom.xml"), "Maven metadata");
      await writeFile(join(projectDir, "manifest.json"), JSON.stringify({
        target: project,
        artifacts: [{ file, sha256: createHash("sha256").update(bytes).digest("hex") }],
      }));
    }
    await mkdir(join(artifacts, "prism"));
    const prism = "StackAnvil-26.3-Prism-Launcher_Config.zip";
    await writeFile(join(artifacts, "prism", prism), "Prism config");

    const released = await prepareReleaseAssets(artifacts, output, projects);
    expect(new Set(released)).toEqual(new Set([prism, ...projects.map((project) => `${project}-1-StackAnvil.jar`)]));
    expect(new Set(await readdir(output))).toEqual(new Set(released));
    expect(await readFile(join(output, prism), "utf8")).toBe("Prism config");

    const manifestFile = join(artifacts, projects[0]!, "manifest.json");
    const manifest = JSON.parse(await readFile(manifestFile, "utf8")) as { artifacts: { sha256: string }[] };
    manifest.artifacts[0]!.sha256 = "invalid";
    await writeFile(manifestFile, JSON.stringify(manifest));
    await expect(prepareReleaseAssets(artifacts, output, projects)).rejects.toThrow(/checksum/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
