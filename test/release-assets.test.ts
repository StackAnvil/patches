import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "bun:test";
import { prepareReleaseAssets } from "../src/release-assets.ts";
import { root } from "../src/model.ts";
import type { ViaFabricPlusPin } from "../src/viafabricplus.ts";
import { writeClientJar } from "./helpers/client-artifacts.ts";
import { execFileSync } from "node:child_process";

test("release bundles verified client JARs and ignores stale launcher archives and modpacks", async () => {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-release-"));
  try {
    const artifacts = join(directory, "artifacts");
    const output = join(directory, "release");
    const projects = ["cubeconverter", "viabedrock", "viafabricplus-bedrock", "viaproxy"];
    const pin = JSON.parse(await readFile(join(root, "viafabricplus.json"), "utf8")) as ViaFabricPlusPin;
    for (const project of [...projects, "viafabricplus"]) {
      const projectDir = join(artifacts, project);
      await mkdir(projectDir, { recursive: true });
      const file = project === "viafabricplus" ? `ViaFabricPlus-${pin.version}.jar` : `${project}-1-StackAnvil.jar`;
      const bytes = Buffer.from(project);
      const sha256 = project.startsWith("viafabricplus")
        ? await writeClientJar(projectDir, file, project)
        : createHash("sha256").update(bytes).digest("hex");
      if (project === "viafabricplus") pin.sha256 = sha256;
      else if (!project.startsWith("viafabricplus")) await writeFile(join(projectDir, file), bytes);
      await writeFile(join(projectDir, "pom.xml"), "Maven metadata");
      await writeFile(join(projectDir, "manifest.json"), JSON.stringify({
        target: project,
        ...(project === "viafabricplus" ? { baseSha: pin.commit, jenkinsBuild: pin.build, apiSha256: pin.apiSha256 } : {}),
        artifacts: [{ file, sha256 }],
      }));
    }
    await mkdir(join(artifacts, "prism"));
    const prism = "StackAnvil-26.3-Prism-Launcher_Config.zip";
    await writeFile(join(artifacts, "prism", prism), "Prism config");
    await mkdir(join(artifacts, "modpack"));
    const pack = "StackAnvil-26.3.mrpack";
    await writeFile(join(artifacts, "modpack", pack), "Stale pack");

    const released = await prepareReleaseAssets(artifacts, output, projects, pin);
    expect(new Set(released)).toEqual(new Set([
      "viafabricplus-manifest.json", "viafabricplus-bedrock-manifest.json", `ViaFabricPlus-${pin.version}.jar`,
      ...projects.map((project) => `${project}-1-StackAnvil.jar`), pack,
    ]));
    expect(new Set(await readdir(output))).toEqual(new Set(released));
    for (const project of ["viafabricplus", "viafabricplus-bedrock"]) {
      const file = project === "viafabricplus" ? `ViaFabricPlus-${pin.version}.jar` : `${project}-1-StackAnvil.jar`;
      const embedded = execFileSync("unzip", ["-p", join(output, pack), `client-overrides/mods/${file}`]);
      expect(embedded).toEqual(await readFile(join(output, file)));
    }
    await rm(join(artifacts, "prism"), { recursive: true });
    expect(new Set(await prepareReleaseAssets(artifacts, output, projects, pin))).toEqual(new Set(released));
    expect(JSON.parse(await readFile(join(output, "viafabricplus-bedrock-manifest.json"), "utf8"))).toEqual(
      JSON.parse(await readFile(join(artifacts, "viafabricplus-bedrock", "manifest.json"), "utf8")),
    );

    const pinnedManifestFile = join(artifacts, "viafabricplus", "manifest.json");
    const pinnedManifest = JSON.parse(await readFile(pinnedManifestFile, "utf8")) as { jenkinsBuild: number };
    pinnedManifest.jenkinsBuild++;
    await writeFile(pinnedManifestFile, JSON.stringify(pinnedManifest));
    await expect(prepareReleaseAssets(artifacts, output, projects, pin)).rejects.toThrow(/does not match/);
    pinnedManifest.jenkinsBuild--;
    await writeFile(pinnedManifestFile, JSON.stringify(pinnedManifest));

    const manifestFile = join(artifacts, projects[0]!, "manifest.json");
    const manifest = JSON.parse(await readFile(manifestFile, "utf8")) as { artifacts: { sha256: string }[] };
    manifest.artifacts[0]!.sha256 = "invalid";
    await writeFile(manifestFile, JSON.stringify(manifest));
    await expect(prepareReleaseAssets(artifacts, output, projects, pin)).rejects.toThrow(/checksum/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
