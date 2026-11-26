import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { availableParallelism } from "node:os";
import { dirname, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { Schema } from "effect";
import { zipEntries } from "./zip.ts";
import { isOneOf, parseJson } from "./guards.ts";
import { print } from "./output.ts";

export const oreUiShaperResource = "assets/viafabricplus-bedrock/oreui-shaper";
export const oreUiShaperPlatforms = [
  "linux-x64",
  "linux-arm64",
  "windows-x64",
  "windows-arm64",
  "macos-x64",
  "macos-arm64",
] as const;
export type OreUiShaperPlatform = (typeof oreUiShaperPlatforms)[number];

const repository = dirname(import.meta.dirname);
const sha256 = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");

const ShaperManifestSchema = Schema.Struct({
  format: Schema.Finite,
  engine: Schema.String,
  version: Schema.String,
  target: Schema.String,
  platform: Schema.String,
  architecture: Schema.String,
  sourceSha256: Schema.String,
  patchSha256: Schema.String,
  library: Schema.String,
  sha256: Schema.String,
});
const isShaperManifest = Schema.is(ShaperManifestSchema);
const ShaperSourceSchema = Schema.Struct({ version: Schema.String, sha256: Schema.String });

/** Check the native file itself so a mislabeled resource cannot select another architecture. */
export function verifyOreUiShaperBinary(bytes: Buffer, target: OreUiShaperPlatform): void {
  const [platform, architecture] = target.split("-");
  const arm = architecture === "arm64";
  let matches = false;
  if (platform === "linux") {
    matches =
      bytes.length >= 64 &&
      bytes.subarray(0, 4).equals(Buffer.from([127, 69, 76, 70])) &&
      bytes[4] === 2 &&
      bytes[5] === 1 &&
      bytes.readUInt16LE(16) === 3 &&
      bytes.readUInt16LE(18) === (arm ? 183 : 62);
  } else if (platform === "windows") {
    if (bytes.length >= 64 && bytes.readUInt16LE(0) === 0x5a_4d) {
      const pe = bytes.readUInt32LE(60);
      matches =
        pe >= 64 &&
        pe <= bytes.length - 26 &&
        bytes.readUInt32LE(pe) === 0x45_50 &&
        bytes.readUInt16LE(pe + 4) === (arm ? 0xaa_64 : 0x86_64) &&
        (bytes.readUInt16LE(pe + 22) & 0x20_00) !== 0 &&
        bytes.readUInt16LE(pe + 24) === 0x2_0b;
    }
  } else if (platform === "macos") {
    matches =
      bytes.length >= 32 &&
      bytes.readUInt32LE(0) === 0xfe_ed_fa_cf &&
      bytes.readUInt32LE(4) === (arm ? 0x1_00_00_0c : 0x1_00_00_07) &&
      bytes.readUInt32LE(12) === 6;
  }
  if (!matches) throw new Error(`OreUI shaper binary does not match ${target}`);
}

/** Validate one CMake installation before it can enter an add-on resource bundle. */
export async function verifyOreUiShaper(
  directory: string,
  target: OreUiShaperPlatform,
  sourceDirectory = join(repository, "native", "oreui-shaper"),
): Promise<void> {
  if (!oreUiShaperPlatforms.includes(target)) throw new Error("Unknown OreUI shaper platform");
  const resource = join(directory, oreUiShaperResource, target);
  const manifestPath = join(resource, "manifest.json");
  if ((await stat(manifestPath)).size > 8192) throw new Error("Oversized OreUI shaper manifest");
  const manifest: unknown = JSON.parse(await readFile(manifestPath, "utf8"));
  const source = parseJson(
    ShaperSourceSchema,
    await readFile(join(sourceDirectory, "source.json"), "utf8"),
  );
  const [platform, architecture] = target.split("-");
  const library =
    platform === "windows"
      ? "stackanvil_oreui_harfbuzz.dll"
      : platform === "macos"
        ? "libstackanvil_oreui_harfbuzz.dylib"
        : "libstackanvil_oreui_harfbuzz.so";
  if (
    !isShaperManifest(manifest) ||
    manifest.format !== 1 ||
    manifest.engine !== "HarfBuzz" ||
    manifest.version !== source.version ||
    manifest.target !== "Bedrock 1.26.60.5 OreUI" ||
    manifest.platform !== platform ||
    manifest.architecture !== architecture ||
    manifest.sourceSha256 !== source.sha256 ||
    manifest.patchSha256 !== sha256(await readFile(join(sourceDirectory, "compatibility.patch"))) ||
    manifest.library !== library ||
    !/^[0-9a-f]{64}$/u.test(manifest.sha256)
  )
    throw new Error(`Invalid OreUI shaper identity for ${target}`);
  const libraryPath = join(resource, library);
  const size = (await stat(libraryPath)).size;
  if (size === 0 || size > 16 * 1024 * 1024) throw new Error("Invalid OreUI shaper library size");
  const bytes = await readFile(libraryPath);
  if (sha256(bytes) !== manifest.sha256)
    throw new Error(`OreUI shaper checksum mismatch for ${target}`);
  verifyOreUiShaperBinary(bytes, target);
  if (
    !(await readFile(join(resource, "COPYING"))).equals(
      await readFile(join(sourceDirectory, "COPYING")),
    )
  )
    throw new Error(`Missing or changed HarfBuzz license for ${target}`);
}

/** The shaper platform this process runs on, or `undefined` when the add-on does not support it. */
export function hostOreUiShaperPlatform(
  platform: string = process.platform,
  architecture: string = process.arch,
): OreUiShaperPlatform | undefined {
  const system = { linux: "linux", win32: "windows", darwin: "macos" }[platform];
  const target = `${system}-${architecture}`;
  return isOneOf(oreUiShaperPlatforms, target) ? target : undefined;
}

/** CI and release builds must embed every platform. Local builds may embed only the host's engine. */
export const requireAllOreUiShapers = () =>
  process.env["STACKANVIL_REQUIRE_ALL_OREUI_SHAPERS"] === "1";

export const oreUiShaperDirectory = (repositoryRoot = repository) =>
  process.env["STACKANVIL_OREUI_SHAPER_RESOURCES"] ??
  join(repositoryRoot, ".stackanvil", "tools", "oreui-shaper-resources");

interface ShaperSelection {
  /** Require all six platforms instead of the host platform. */
  all?: boolean;
  host?: OreUiShaperPlatform | undefined;
}

/** Select and verify every installed engine. A local build needs only the host's engine. */
async function selectOreUiShapers(
  directory: string,
  sourceDirectory: string,
  { all = requireAllOreUiShapers(), host = hostOreUiShaperPlatform() }: ShaperSelection,
): Promise<OreUiShaperPlatform[]> {
  const installed = oreUiShaperPlatforms.filter((target) =>
    existsSync(join(directory, oreUiShaperResource, target, "manifest.json")),
  );
  if (all) {
    const missing = oreUiShaperPlatforms.filter((target) => !installed.includes(target));
    if (missing.length > 0)
      throw new Error(
        `OreUI shaper resources are missing for ${missing.join(", ")} in ${resolve(directory)}. ` +
          "Combine the six oreui-shaper-* workflow artifacts there or set STACKANVIL_OREUI_SHAPER_RESOURCES. " +
          "See native/oreui-shaper/README.md.",
      );
  } else if (!host) {
    throw new Error(
      `The OreUI shaper does not support ${process.platform}-${process.arch}. ` +
        "Set STACKANVIL_REQUIRE_ALL_OREUI_SHAPERS=1 and combine the six oreui-shaper-* workflow artifacts.",
    );
  } else if (!installed.includes(host)) {
    throw new Error(
      `OreUI shaper resources are missing for ${host} in ${resolve(directory)}. ` +
        "Run `bun run shaper build`, or set STACKANVIL_OREUI_SHAPER_RESOURCES. See native/oreui-shaper/README.md.",
    );
  }
  await Promise.all(
    installed.map((target) => verifyOreUiShaper(directory, target, sourceDirectory)),
  );
  return installed;
}

/** Gradle embeds every verified engine in the directory. */
export async function oreUiShaperArguments(
  id: string,
  directory: string,
  sourceDirectory = join(repository, "native", "oreui-shaper"),
  selection: ShaperSelection = {},
): Promise<string[]> {
  if (id !== "viafabricplus-bedrock") return [];
  const installed = await selectOreUiShapers(directory, sourceDirectory, selection);
  if (installed.length < oreUiShaperPlatforms.length)
    print(
      `The add-on embeds the OreUI shaper only for ${installed.join(", ")}. ` +
        "It cannot shape OreUI text on other platforms.",
    );
  return [`-PbedrockOreUiShaper=${resolve(directory)}`];
}

/** Catch dropped resources or a stale Gradle output before publishing the JAR. */
export async function verifyEmbeddedOreUiShaper(
  artifact: string,
  directory: string,
  sourceDirectory = join(repository, "native", "oreui-shaper"),
  selection: ShaperSelection = {},
): Promise<void> {
  const installed = await selectOreUiShapers(directory, sourceDirectory, selection);
  const entries = zipEntries(await readFile(artifact));
  const expected = new Set<string>();
  for (const target of installed) {
    const resource = `${oreUiShaperResource}/${target}`;
    const manifest = parseJson(
      ShaperManifestSchema,
      await readFile(join(directory, resource, "manifest.json"), "utf8"),
    );
    for (const file of ["manifest.json", "COPYING", manifest.library]) {
      const name = `${resource}/${file}`;
      expected.add(name);
      const embedded = entries.get(name)?.();
      if (!embedded || !embedded.equals(await readFile(join(directory, name))))
        throw new Error(`Add-on did not embed the verified OreUI shaper resource: ${name}`);
    }
  }
  for (const [name, read] of entries) {
    if (!name.startsWith(`${oreUiShaperResource}/`)) continue;
    if (name.endsWith("/") && read().length === 0) continue;
    if (!expected.has(name)) throw new Error(`Unexpected embedded OreUI shaper resource: ${name}`);
  }
}

async function run(program: string, args: string[], cwd: string): Promise<void> {
  const child = Bun.spawn([program, ...args], {
    cwd,
    stdin: "ignore",
    stdout: "inherit",
    stderr: "inherit",
  });
  const code = await child.exited;
  if (code !== 0) throw new Error(`${program} ${args.join(" ")} exited with code ${code}`);
}

interface ShaperBuild {
  output: string;
  target: OreUiShaperPlatform;
  /** Extra CMake configure arguments, such as a Visual Studio platform. */
  configure?: string[];
  repositoryRoot?: string;
}

/** Configure, compile, test, install, and verify one engine with the workflow's CMake steps. */
export async function buildOreUiShaper({
  output,
  target,
  configure = [],
  repositoryRoot = repository,
}: ShaperBuild): Promise<void> {
  const source = join(repositoryRoot, "native", "oreui-shaper");
  const build = join(repositoryRoot, ".stackanvil", "tools", "oreui-shaper-build");
  if (!Bun.which("cmake") || !Bun.which("ctest"))
    throw new Error(
      "Building the OreUI shaper needs CMake 3.24 or newer, Git, and a C++ compiler. " +
        "Install them, or combine the oreui-shaper-* workflow artifacts. See native/oreui-shaper/README.md.",
    );
  print(`Building the OreUI shaper for ${target}`);
  await run(
    "cmake",
    ["-S", source, "-B", build, "-DCMAKE_BUILD_TYPE=Release", ...configure],
    repositoryRoot,
  );
  await run(
    "cmake",
    [
      "--build",
      build,
      "--config",
      "Release",
      "--target",
      "oreui-shaping-test",
      "--parallel",
      String(availableParallelism()),
    ],
    repositoryRoot,
  );
  await run("ctest", ["--test-dir", build, "-C", "Release", "--output-on-failure"], repositoryRoot);
  await run(
    "cmake",
    [
      "--install",
      build,
      "--config",
      "Release",
      "--prefix",
      resolve(output),
      "--component",
      "OreUiShaper",
    ],
    repositoryRoot,
  );
  await verifyOreUiShaper(output, target, source);
}

/**
 * Build the host engine when a local add-on build lacks it or holds a stale one.
 * CI and release builds use the workflow artifacts and never compile here.
 */
export async function prepareOreUiShaper(
  id: string,
  directory: string,
  repositoryRoot = repository,
): Promise<string[]> {
  const source = join(repositoryRoot, "native", "oreui-shaper");
  const host = hostOreUiShaperPlatform();
  if (id === "viafabricplus-bedrock" && !requireAllOreUiShapers() && host) {
    const problem = await verifyOreUiShaper(directory, host, source).then(
      () => undefined,
      (error: unknown) => (error instanceof Error ? error.message : String(error)),
    );
    if (problem !== undefined) {
      if (existsSync(join(directory, oreUiShaperResource, host)))
        print(`Rebuilding the OreUI shaper: ${problem}`);
      await buildOreUiShaper({ output: directory, target: host, repositoryRoot });
    }
  }
  return oreUiShaperArguments(id, directory, source);
}

const usage = [
  "Usage:",
  "  bun run shaper build [--target <platform-architecture>] [--output <directory>] [-- <cmake configure arguments>]",
  "  bun run shaper verify [<installed-resources>] [<platform-architecture>]",
].join("\n");

if (import.meta.main) {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { target: { type: "string" }, output: { type: "string" } },
  });
  const [action, ...rest] = positionals;
  if (action === "build") {
    const target = values.target ?? hostOreUiShaperPlatform();
    if (!target || !isOneOf(oreUiShaperPlatforms, target))
      throw new Error(`Choose a --target from ${oreUiShaperPlatforms.join(", ")}.\n${usage}`);
    await buildOreUiShaper({
      output: values.output ?? oreUiShaperDirectory(),
      target,
      configure: rest,
    });
    print(`OreUI shaper for ${target} built and verified`);
  } else if (action === "verify" && !values.target && !values.output && rest.length <= 2) {
    const [directory = oreUiShaperDirectory(), requested] = rest;
    if (requested === undefined)
      await selectOreUiShapers(directory, join(repository, "native", "oreui-shaper"), {
        all: true,
      });
    else if (isOneOf(oreUiShaperPlatforms, requested))
      await verifyOreUiShaper(directory, requested);
    else throw new Error(usage);
    print("OreUI shaper resources verified");
  } else {
    throw new Error(usage);
  }
}
