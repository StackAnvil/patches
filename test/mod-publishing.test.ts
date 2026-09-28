import { createHash } from "node:crypto";
import { expect, test } from "bun:test";
import { curseForgeMetadata, modrinthMetadata, publishCurseForge, publishModrinth, publishVersion, validatePublishArtifact } from "../src/mod-publishing.ts";

const bytes = Buffer.from("a built add-on");
const version = "1.1.1-StackAnvil";
const manifest = {
  target: "viafabricplus-bedrock",
  coordinates: `com.viaversion:viafabricplus-bedrock:${version}`,
  artifacts: [{ file: `viafabricplus-bedrock-${version}.jar`, sha256: createHash("sha256").update(bytes).digest("hex") }],
};
const metadata = {
  id: "viafabricplus-bedrock",
  version,
  environment: "client",
  depends: { minecraft: "26.3", java: ">=25", viafabricplus: ">=5.0.2" },
};

test("mod publishing validates the actual build before preparing both platforms", () => {
  const artifact = validatePublishArtifact(manifest, metadata, bytes, "/tmp/release");
  expect(artifact.version).toBe(version);
  expect(artifact.minecraft).toBe("26.3");
  expect(publishVersion(artifact, "stack-v1.0.0")).toBe(`${version}+stack-v1.0.0`);

  const modrinth = modrinthMetadata(artifact, "stack-v1.0.0", "StackAnvilProject", "Changes");
  expect(modrinth.game_versions).toEqual([artifact.minecraft]);
  expect(modrinth.dependencies).toEqual([{ project_id: "rIC2XJV4", dependency_type: "required" }]);
  expect(modrinth.file_parts).toEqual(["file"]);
  expect(modrinth.version_type).toBe("beta");
  expect(modrinth.featured).toBe(false);

  const curseForge = curseForgeMetadata(artifact, "stack-v1.0.0", "Changes");
  expect(curseForge.gameVersionNames).toEqual([artifact.minecraft, "Fabric", "Client"]);
  expect(curseForge.relations.projects).toEqual([{ slug: "viafabricplus", projectID: 830604, type: "requiredDependency" }]);
  expect(curseForge.releaseType).toBe("beta");
});

test("mod publishing rejects a changed JAR or mismatched compatibility metadata", () => {
  expect(() => validatePublishArtifact(manifest, metadata, Buffer.from("different"), "/tmp/release")).toThrow(/checksum/);
  expect(() => validatePublishArtifact(manifest, { ...metadata, version: "upstream" }, bytes, "/tmp/release")).toThrow(/identity/);
  expect(() => validatePublishArtifact(manifest, { ...metadata, depends: { ...metadata.depends, minecraft: ">=26.2" } }, bytes, "/tmp/release")).toThrow(/compatibility/);
});

test("mod publishing refuses project IDs outside the StackAnvil listings", async () => {
  const artifact = validatePublishArtifact(manifest, metadata, bytes, "/tmp/release");
  await expect(publishModrinth(artifact, "stack-v1.0.0", "Changes", "rIC2XJV4", "token")).rejects.toThrow(/StackAnvil/);
  await expect(publishCurseForge(artifact, "stack-v1.0.0", "Changes", "1684810", "token")).rejects.toThrow(/StackAnvil/);
});
