import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { root } from "./model.ts";

const jenkins = "https://ci.viaversion.com/job/ViaFabricPlus";
const maven = "https://repo.viaversion.com/com/viaversion/viafabricplus";
const apiMaven = "https://repo.viaversion.com/com/viaversion/viafabricplus-api";
const repository = join(root, ".stackanvil", "maven");

export interface ViaFabricPlusPin {
  build: number;
  commit: string;
  version: string;
  sha256: string;
  pomSha256: string;
  apiSha256: string;
  apiPomSha256: string;
}

interface JenkinsBuild {
  number: number;
  result: string;
  artifacts: { relativePath: string }[];
  actions: { lastBuiltRevision?: { SHA1: string }; remoteUrls?: string[] }[];
}

interface PinnedManifest {
  baseSha?: string;
  jenkinsBuild?: number;
  apiSha256?: string;
  artifacts: { file: string; sha256: string }[];
}

export async function readViaFabricPlusPin(): Promise<ViaFabricPlusPin> {
  return JSON.parse(await readFile(join(root, "viafabricplus.json"), "utf8")) as ViaFabricPlusPin;
}

export async function verifyPinnedManifest(manifest: PinnedManifest, expected?: ViaFabricPlusPin): Promise<void> {
  const pin = expected ?? await readViaFabricPlusPin();
  const artifact = manifest.artifacts[0];
  if (manifest.baseSha !== pin.commit || manifest.jenkinsBuild !== pin.build
    || manifest.apiSha256 !== pin.apiSha256
    || manifest.artifacts.length !== 1 || artifact?.file !== `ViaFabricPlus-${pin.version}.jar`
    || artifact.sha256 !== pin.sha256) {
    throw new Error("ViaFabricPlus build manifest does not match viafabricplus.json");
  }
}

function verifyBuild(build: JenkinsBuild, pin: ViaFabricPlusPin, artifactPath: string): void {
  if (build.number !== pin.build || build.result !== "SUCCESS") throw new Error(`ViaFabricPlus Jenkins build ${pin.build} is not successful`);
  if (!build.actions.some((action) => action.lastBuiltRevision?.SHA1 === pin.commit
    && action.remoteUrls?.includes("https://github.com/ViaVersion/ViaFabricPlus"))) {
    throw new Error(`ViaFabricPlus Jenkins build ${pin.build} does not match pinned commit ${pin.commit}`);
  }
  if (!build.artifacts.some((artifact) => artifact.relativePath === artifactPath)) {
    throw new Error(`ViaFabricPlus Jenkins build ${pin.build} has no ${artifactPath} artifact`);
  }
}

async function download(url: string, expectedSha: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not download ${url}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (digest !== expectedSha) throw new Error(`Checksum mismatch for ${url}: expected ${expectedSha}, got ${digest}`);
  return bytes;
}

export async function prepareViaFabricPlus(): Promise<{ output: string; pin: ViaFabricPlusPin }> {
  const pin = await readViaFabricPlusPin();
  const jarName = `ViaFabricPlus-${pin.version}.jar`;
  const artifactPath = `build/libs/${jarName}`;
  const metadataResponse = await fetch(`${jenkins}/${pin.build}/api/json`);
  if (!metadataResponse.ok) throw new Error(`Could not read ViaFabricPlus Jenkins build ${pin.build}: HTTP ${metadataResponse.status}`);
  verifyBuild(await metadataResponse.json() as JenkinsBuild, pin, artifactPath);

  const [jar, pom, apiJar, apiPom] = await Promise.all([
    download(`${jenkins}/${pin.build}/artifact/${artifactPath}`, pin.sha256),
    download(`${maven}/${pin.version}/viafabricplus-${pin.version}.pom`, pin.pomSha256),
    download(`${apiMaven}/${pin.version}/viafabricplus-api-${pin.version}.jar`, pin.apiSha256),
    download(`${apiMaven}/${pin.version}/viafabricplus-api-${pin.version}.pom`, pin.apiPomSha256),
  ]);
  const pomText = pom.toString("utf8");
  for (const [tag, value] of [["groupId", "com.viaversion"], ["artifactId", "viafabricplus"], ["version", pin.version]]) {
    if (!pomText.includes(`<${tag}>${value}</${tag}>`)) throw new Error(`ViaFabricPlus POM has an unexpected ${tag}`);
  }
  const apiPomText = apiPom.toString("utf8");
  for (const [tag, value] of [["groupId", "com.viaversion"], ["artifactId", "viafabricplus-api"], ["version", pin.version]]) {
    if (!apiPomText.includes(`<${tag}>${value}</${tag}>`)) throw new Error(`ViaFabricPlus API POM has an unexpected ${tag}`);
  }

  const output = join(root, "dist", "viafabricplus");
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  await writeFile(join(output, jarName), jar);
  await writeFile(join(output, "pom.xml"), pom);
  await writeFile(join(output, "manifest.json"), `${JSON.stringify({
    target: "viafabricplus",
    upstream: "ViaVersion/ViaFabricPlus",
    baseSha: pin.commit,
    jenkinsBuild: pin.build,
    apiSha256: pin.apiSha256,
    coordinates: `com.viaversion:viafabricplus:${pin.version}`,
    artifacts: [{ file: jarName, sha256: pin.sha256 }],
  }, null, 2)}\n`);

  const local = join(repository, "com", "viaversion", "viafabricplus", pin.version);
  await mkdir(local, { recursive: true });
  await copyFile(join(output, jarName), join(local, `viafabricplus-${pin.version}.jar`));
  await copyFile(join(output, "pom.xml"), join(local, `viafabricplus-${pin.version}.pom`));
  const localApi = join(repository, "com", "viaversion", "viafabricplus-api", pin.version);
  await mkdir(localApi, { recursive: true });
  await writeFile(join(localApi, `viafabricplus-api-${pin.version}.jar`), apiJar);
  await writeFile(join(localApi, `viafabricplus-api-${pin.version}.pom`), apiPom);
  return { output, pin };
}
