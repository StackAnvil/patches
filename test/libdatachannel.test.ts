import { afterEach, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  installLibDataChannel,
  libDataChannelArtifacts,
  type LibDataChannelPin,
} from "../src/libdatachannel.ts";

const temporary: string[] = [];
afterEach(async () => {
  await Promise.all(
    temporary.splice(0).map((path) => rm(path, { recursive: true, force: true })),
  );
});

const version = "0.24.6.0-stackanvil.1";
const base = `https://github.com/StackAnvil/libdatachannel-java/releases/download/v${version}`;

function pom(artifact: string): string {
  return `<project><groupId>dev.opencollab</groupId><artifactId>${artifact}</artifactId><version>${version}</version></project>`;
}

function release(): Map<string, Buffer> {
  const assets = new Map<string, Buffer>();
  for (const artifact of libDataChannelArtifacts) {
    assets.set(`${base}/${artifact}-${version}.jar`, Buffer.from(`${artifact} jar`));
    assets.set(`${base}/${artifact}-${version}.pom`, Buffer.from(pom(artifact)));
  }
  return assets;
}

const sha256 = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");

function pinFor(assets: Map<string, Buffer>): LibDataChannelPin {
  const checksums = (artifact: string) => ({
    jarSha256: sha256(assets.get(`${base}/${artifact}-${version}.jar`) ?? Buffer.alloc(0)),
    pomSha256: sha256(assets.get(`${base}/${artifact}-${version}.pom`) ?? Buffer.alloc(0)),
  });
  return {
    repository: "StackAnvil/libdatachannel-java",
    tag: `v${version}`,
    commit: "0".repeat(40),
    version,
    artifacts: {
      "libdatachannel-java": checksums("libdatachannel-java"),
      "libdatachannel-java-arch-detect": checksums("libdatachannel-java-arch-detect"),
    },
  };
}

function serve(assets: Map<string, Buffer>): typeof fetch {
  return (async (input: string | URL | Request) => {
    const bytes = assets.get(String(input));
    return bytes ? new Response(new Uint8Array(bytes)) : new Response("missing", { status: 404 });
  }) as typeof fetch;
}

test("installs the pinned release as dev.opencollab artifacts in the local repository", async () => {
  const repository = await mkdtemp(join(tmpdir(), "stackanvil-ldc-"));
  temporary.push(repository);
  const assets = release();

  await installLibDataChannel(repository, pinFor(assets), serve(assets));

  const directory = join(repository, "dev", "opencollab", "libdatachannel-java-arch-detect", version);
  expect((await readdir(directory)).sort()).toEqual([
    `libdatachannel-java-arch-detect-${version}.jar`,
    `libdatachannel-java-arch-detect-${version}.pom`,
  ]);
  expect(await readFile(join(directory, `libdatachannel-java-arch-detect-${version}.jar`), "utf8")).toBe(
    "libdatachannel-java-arch-detect jar",
  );
});

test("refuses a release asset whose checksum differs from the pin and installs nothing", async () => {
  const repository = await mkdtemp(join(tmpdir(), "stackanvil-ldc-"));
  temporary.push(repository);
  const assets = release();
  const pin = pinFor(assets);
  assets.set(`${base}/libdatachannel-java-arch-detect-${version}.jar`, Buffer.from("replaced"));

  await expect(installLibDataChannel(repository, pin, serve(assets))).rejects.toThrow("Checksum mismatch");
  expect(await readdir(repository)).toEqual([]);
});
