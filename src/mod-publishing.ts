import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

const addon = "viafabricplus-bedrock";
const viaFabricPlusModrinthId = "rIC2XJV4";
const viaFabricPlusCurseForgeId = "830604";
const stackAnvilModrinthId = "opL7gK2I";
const stackAnvilCurseForgeId = "1713307";

interface ArtifactManifest {
  target: string;
  coordinates: string;
  artifacts: { file: string; sha256: string }[];
}

interface FabricMetadata {
  id: string;
  version: string;
  environment: string;
  depends: { minecraft: string; java: string; viafabricplus: string };
}

export interface PublishArtifact {
  path: string;
  file: string;
  version: string;
  minecraft: string;
  sha256: string;
}

export function validatePublishArtifact(manifest: ArtifactManifest, metadata: FabricMetadata, bytes: Uint8Array, directory: string): PublishArtifact {
  if (manifest.target !== addon || manifest.artifacts.length !== 1) throw new Error("Expected one VFP Bedrock add-on artifact");
  const artifact = manifest.artifacts[0]!;
  if (basename(artifact.file) !== artifact.file || !/^viafabricplus-bedrock-.+-StackAnvil\.jar$/.test(artifact.file)) {
    throw new Error("Invalid VFP Bedrock add-on JAR name");
  }
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  if (sha256 !== artifact.sha256) throw new Error("VFP Bedrock add-on checksum differs from its build manifest");
  const version = manifest.coordinates?.startsWith("com.viaversion:viafabricplus-bedrock:")
    ? manifest.coordinates.slice("com.viaversion:viafabricplus-bedrock:".length) : undefined;
  if (!version || metadata.id !== addon || metadata.version !== version || artifact.file !== `${addon}-${version}.jar`) {
    throw new Error("VFP Bedrock add-on identity differs from its build manifest");
  }
  if (metadata.environment !== "client" || !/^\d+\.\d+(?:\.\d+)?$/.test(metadata.depends?.minecraft ?? "")
    || metadata.depends.java !== ">=25" || !metadata.depends.viafabricplus) {
    throw new Error("VFP Bedrock add-on compatibility metadata is unexpected");
  }
  return { path: join(directory, artifact.file), file: artifact.file, version, minecraft: metadata.depends.minecraft, sha256 };
}

export async function readPublishArtifact(manifestPath: string): Promise<PublishArtifact> {
  const directory = dirname(manifestPath);
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as ArtifactManifest;
  if (manifest.target !== addon || manifest.artifacts?.length !== 1) throw new Error("Expected one VFP Bedrock add-on artifact");
  const file = manifest.artifacts[0]?.file;
  if (!file || basename(file) !== file) throw new Error("Invalid VFP Bedrock add-on JAR name");
  const path = join(directory, file);
  const bytes = await readFile(path);
  const metadata = JSON.parse(execFileSync("unzip", ["-p", path, "fabric.mod.json"], { encoding: "utf8", maxBuffer: 1024 * 1024 })) as FabricMetadata;
  return validatePublishArtifact(manifest, metadata, bytes, directory);
}

export function publishVersion(artifact: PublishArtifact, tag: string): string {
  if (!/^stack-v[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(tag)) throw new Error("Expected a StackAnvil release tag");
  return `${artifact.version}+${tag}`;
}

export function modrinthMetadata(artifact: PublishArtifact, tag: string, projectId: string, changelog: string) {
  const version = publishVersion(artifact, tag);
  return {
    name: `StackAnvil ${tag} (${artifact.version})`,
    version_number: version,
    changelog,
    dependencies: [{ project_id: viaFabricPlusModrinthId, dependency_type: "required" }],
    game_versions: [artifact.minecraft],
    version_type: "beta",
    loaders: ["fabric"],
    environment: "client_only",
    project_id: projectId,
    file_parts: ["file"],
    primary_file: "file",
  };
}

export function curseForgeMetadata(artifact: PublishArtifact, tag: string, changelog: string) {
  return {
    changelog,
    changelogType: "markdown",
    displayName: `StackAnvil ${tag} (${artifact.version})`,
    gameVersionNames: [artifact.minecraft, "Fabric", "Client"],
    releaseType: "beta",
    relations: { projects: [{ projectID: viaFabricPlusCurseForgeId, type: "requiredDependency" }] },
  };
}

async function upload(url: string, headers: Record<string, string>, metadataField: string, metadata: object, artifact: PublishArtifact): Promise<unknown> {
  const form = new FormData();
  form.append(metadataField, JSON.stringify(metadata));
  form.append("file", Bun.file(artifact.path), artifact.file);
  const response = await fetch(url, { method: "POST", headers, body: form });
  const body = await response.text();
  if (!response.ok) throw new Error(`Upload failed with HTTP ${response.status}: ${body.slice(0, 1000)}`);
  return JSON.parse(body) as unknown;
}

export async function publishModrinth(artifact: PublishArtifact, tag: string, changelog: string, projectId: string, token: string): Promise<unknown> {
  if (!projectId || !token) throw new Error("Set MODRINTH_PROJECT_ID and MODRINTH_TOKEN");
  if (projectId !== stackAnvilModrinthId) throw new Error(`Expected the StackAnvil Modrinth project ID ${stackAnvilModrinthId}`);
  return upload("https://api.modrinth.com/v2/version", {
    Authorization: token,
    "User-Agent": "StackAnvil/1.0 (https://github.com/StackAnvil/patches)",
  }, "data", modrinthMetadata(artifact, tag, projectId, changelog), artifact);
}

export async function publishCurseForge(artifact: PublishArtifact, tag: string, changelog: string, projectId: string, token: string): Promise<unknown> {
  if (!/^\d+$/.test(projectId) || !token) throw new Error("Set CURSEFORGE_PROJECT_ID and CURSEFORGE_TOKEN");
  if (projectId !== stackAnvilCurseForgeId) throw new Error(`Expected the StackAnvil CurseForge project ID ${stackAnvilCurseForgeId}`);
  return upload(`https://minecraft.curseforge.com/api/projects/${projectId}/upload-file`, {
    "X-Api-Token": token,
  }, "metadata", curseForgeMetadata(artifact, tag, changelog), artifact);
}

if (import.meta.main) {
  const [platform, tag, manifestPath, changelogPath] = process.argv.slice(2);
  if (!platform || !tag || !manifestPath || !changelogPath || !["prepare", "modrinth", "curseforge"].includes(platform)) {
    console.error("Usage: bun src/mod-publishing.ts <prepare|modrinth|curseforge> <tag> <manifest.json> <changelog.md>");
    process.exit(2);
  }
  try {
    const artifact = await readPublishArtifact(manifestPath);
    const changelog = await readFile(changelogPath, "utf8");
    if (!changelog.trim()) throw new Error("The mod changelog is empty");
    if (platform === "prepare") {
      const modrinth = modrinthMetadata(artifact, tag, process.env.MODRINTH_PROJECT_ID ?? "<new project ID>", changelog);
      const curseforge = curseForgeMetadata(artifact, tag, changelog);
      console.log(JSON.stringify({ artifact, modrinth: { ...modrinth, changelog: `${changelog.length} characters` },
        curseforge: { ...curseforge, changelog: `${changelog.length} characters` } }, null, 2));
    } else if (platform === "modrinth") {
      console.log(JSON.stringify(await publishModrinth(artifact, tag, changelog, process.env.MODRINTH_PROJECT_ID ?? "", process.env.MODRINTH_TOKEN ?? "")));
    } else {
      console.log(JSON.stringify(await publishCurseForge(artifact, tag, changelog, process.env.CURSEFORGE_PROJECT_ID ?? "", process.env.CURSEFORGE_TOKEN ?? "")));
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
