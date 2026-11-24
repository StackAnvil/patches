import { Schema } from "effect";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseJson } from "./guards.ts";
import { root } from "./model.ts";

/** The libdatachannel-java artifacts ViaProxy and the Bedrock add-on bundle. */
export const libDataChannelArtifacts = [
  "libdatachannel-java",
  "libdatachannel-java-arch-detect",
] as const;

const ArtifactChecksumsSchema = Schema.Struct({
  jarSha256: Schema.String,
  pomSha256: Schema.String,
});

const LibDataChannelPinSchema = Schema.Struct({
  repository: Schema.String,
  tag: Schema.String,
  commit: Schema.String,
  version: Schema.String,
  artifacts: Schema.Struct({
    "libdatachannel-java": ArtifactChecksumsSchema,
    "libdatachannel-java-arch-detect": ArtifactChecksumsSchema,
  }),
});
export type LibDataChannelPin = typeof LibDataChannelPinSchema.Type;

export async function readLibDataChannelPin(): Promise<LibDataChannelPin> {
  return parseJson(
    LibDataChannelPinSchema,
    await readFile(join(root, "libdatachannel.json"), "utf8"),
  );
}

async function download(fetcher: typeof fetch, url: string, sha256: string): Promise<Buffer> {
  const response = await fetcher(url);
  if (!response.ok) throw new Error(`Could not download ${url}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (digest !== sha256)
    throw new Error(`Checksum mismatch for ${url}: expected ${sha256}, got ${digest}`);
  return bytes;
}

/**
 * Downloads the pinned release assets of the StackAnvil libdatachannel-java fork, verifies their
 * checksums and coordinates, and installs them into {@code repository} as dev.opencollab artifacts.
 * The fork publishes immutable releases, so a tag's assets cannot change after the pin is taken.
 */
export async function installLibDataChannel(
  repository: string,
  pin: LibDataChannelPin,
  fetcher: typeof fetch = fetch,
): Promise<void> {
  const base = `https://github.com/${pin.repository}/releases/download/${pin.tag}`;
  const files = await Promise.all(
    libDataChannelArtifacts.map(async (artifact) => {
      const stem = `${artifact}-${pin.version}`;
      const checksums = pin.artifacts[artifact];
      const [jar, pom] = await Promise.all([
        download(fetcher, `${base}/${stem}.jar`, checksums.jarSha256),
        download(fetcher, `${base}/${stem}.pom`, checksums.pomSha256),
      ]);
      const pomText = pom.toString("utf8");
      for (const [tag, value] of [
        ["groupId", "dev.opencollab"],
        ["artifactId", artifact],
        ["version", pin.version],
      ]) {
        if (!pomText.includes(`<${tag}>${value}</${tag}>`))
          throw new Error(`${artifact} POM has an unexpected ${tag}`);
      }
      return { artifact, stem, jar, pom };
    }),
  );
  for (const { artifact, stem, jar, pom } of files) {
    const directory = join(repository, "dev", "opencollab", artifact, pin.version);
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, `${stem}.jar`), jar);
    await writeFile(join(directory, `${stem}.pom`), pom);
  }
}
