import { createHash, randomUUID } from "node:crypto";
import { constants, createReadStream, existsSync } from "node:fs";
import {
  chmod,
  copyFile,
  cp,
  link,
  mkdir,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { parseArgs } from "node:util";
import { Effect, Schema } from "effect";
import { runLabCommand } from "./lab/effect-runtime.ts";
import { root } from "./model.ts";
import { command, execFileAsync as execute } from "./process.ts";
import { errorCode, parseJson, stringProperty, decodeJson, optionalEnv } from "./guards.ts";
import { print, printError } from "./output.ts";

const reader = join(root, "native", "rea-controls", "pe.py");
/** Each checkout keeps its own selection, so agents in other worktrees cannot switch it. */
const selectionPath = join(root, ".stackanvil", "rea", "current.json");
const controlsRoot = join(root, ".stackanvil", "tools", "rea-controls-venv");
const controlsPython = join(
  controlsRoot,
  process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
);
const reaVersion = "6.7.0";
const shaPattern = /^[a-f0-9]{64}$/iu;

/**
 * Artifacts and analyses live outside every checkout, so worktrees share one verified copy of each
 * binary and can reuse earlier Evidence. The directory stays private because it holds game binaries.
 */
export function reaHome(): string {
  const configured = process.env["STACKANVIL_REA_HOME"];
  const data = process.env["XDG_DATA_HOME"];
  const home =
    configured ??
    join(data && isAbsolute(data) ? data : join(homedir(), ".local", "share"), "stackanvil", "rea");
  if (!isAbsolute(home)) throw new Error("STACKANVIL_REA_HOME must be an absolute path");
  independentName(home);
  return home;
}

const PinsSchema = Schema.Struct({
  artifacts: Schema.Array(
    Schema.Struct({
      version: Schema.String,
      name: Schema.String,
      sha256: Schema.String,
      protocol: Schema.optionalKey(Schema.Finite),
      source: Schema.String,
    }),
  ),
});
export type ReaPin = (typeof PinsSchema.Type)["artifacts"][number];

export async function readReaPins(path = join(root, "rea-artifacts.json")): Promise<ReaPin[]> {
  const { artifacts } = parseJson(PinsSchema, await readFile(path, "utf8"));
  for (const pin of artifacts)
    if (!shaPattern.test(pin.sha256)) throw new Error(`Invalid SHA-256 pin for ${pin.version}`);
  return [...artifacts];
}

function pinFor(pins: readonly ReaPin[], version: string): ReaPin {
  const pin = pins.find((candidate) => candidate.version === version);
  if (!pin)
    throw new Error(
      `No pinned REA artifact for ${version}. Pinned versions: ${pins.map((entry) => entry.version).join(", ")}`,
    );
  return pin;
}

const TargetSchema = Schema.Struct({
  schemaVersion: Schema.Literal(1),
  artifact: Schema.Struct({
    path: Schema.String,
    sha256: Schema.String,
    name: Schema.String,
    version: Schema.String,
    protocol: Schema.optionalKey(Schema.Finite),
  }),
});
type Target = typeof TargetSchema.Type;
const isTarget = Schema.is(TargetSchema);

const SliceSchema = Schema.Struct({
  sourceSha256: Schema.String,
  machine: Schema.String,
  procedureAddress: Schema.String,
  endExclusive: Schema.String,
  derivedPath: Schema.String,
  derivedSha256: Schema.String,
  scope: Schema.String,
});
type Slice = typeof SliceSchema.Type;

const isReaEvidence = Schema.is(
  Schema.Struct({
    evidence_id: Schema.String,
    subject: Schema.Struct({ digest: Schema.Struct({ sha256: Schema.String }) }),
    analysis_profile: Schema.Struct({ digest: Schema.String }),
    operation: Schema.Literal("analyze_function"),
    predicate_type: Schema.Literal("rea.analysis"),
    normalized_result: Schema.Struct({
      procedure: Schema.Struct({ address: Schema.String }),
    }),
  }),
);

const hasPseudocode = Schema.is(
  Schema.Struct({ normalized_result: Schema.Struct({ pseudocode: Schema.NonEmptyString }) }),
);

const isReaCapture = Schema.is(
  Schema.Struct({
    evidence_id: Schema.String,
    operation: Schema.Literal("capture_process_scenario"),
    predicate_type: Schema.Literal("rea.process-capture"),
    normalized_result: Schema.Struct({
      exit: Schema.Struct({
        code: Schema.NullOr(Schema.Finite),
        signal: Schema.optional(Schema.NullOr(Schema.Finite)),
      }),
      cleanup: Schema.Struct({ owned_process_group: Schema.Literal("verified") }),
    }),
  }),
);

// oxlint-disable-next-line unicorn/throw-new-error -- Schema.TaggedError is a class factory.
class ReaError extends Schema.TaggedError<ReaError, { readonly brand: unique symbol }>()(
  "ReaError",
  {
    message: Schema.String,
    cause: Schema.Unknown,
  },
) {}

function error(cause: unknown): ReaError {
  return cause instanceof ReaError
    ? cause
    : ReaError.make({ message: cause instanceof Error ? cause.message : String(cause), cause });
}

function independentName(path: string): void {
  if (/pistondecompiler/iu.test(path)) throw new Error("PistonDecompiler paths are not permitted");
}

export async function independentPath(path: string): Promise<string> {
  independentName(path);
  const actual = await realpath(path);
  independentName(actual);
  return actual;
}

export async function artifactSha256(path: string): Promise<string> {
  const digest = createHash("sha256");
  for await (const chunk of createReadStream(path)) {
    if (!Buffer.isBuffer(chunk))
      throw new TypeError("File streams without an encoding yield Buffers.");
    digest.update(chunk);
  }
  return digest.digest("hex");
}

async function privateJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600, flag: "wx" });
}

/**
 * Copy into a unique temporary file and hard-link it into place, so concurrent imports from several
 * agents never expose a partial copy. A link fails when the artifact exists, so a finished copy is
 * never replaced while another import resolves or hashes it.
 */
async function storedArtifact(home: string, sha256: string, source?: string): Promise<string> {
  independentName(home);
  await mkdir(home, { recursive: true, mode: 0o700 });
  await chmod(home, 0o700);
  await independentPath(home);
  const directory = join(home, "artifacts", sha256);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await independentPath(directory);
  const path = join(directory, "artifact");
  if (!(await Bun.file(path).exists())) {
    if (source === undefined)
      throw new Error(
        `Artifact ${sha256} is not in ${home}. Import it with bun run rea import first`,
      );
    const temporary = join(directory, `artifact-${randomUUID()}.tmp`);
    try {
      await copyFile(source, temporary, constants.COPYFILE_EXCL);
      await chmod(temporary, 0o400);
      if ((await artifactSha256(temporary)) !== sha256)
        throw new Error("Artifact SHA-256 changed while it was copied");
      await link(temporary, path).catch((cause: unknown) => {
        // Another import finished first. Its copy passed the same checksum before it was linked.
        if (errorCode(cause) !== "EEXIST") throw cause;
      });
    } finally {
      await rm(temporary, { force: true });
    }
  }
  const artifact = await independentPath(path);
  if ((await artifactSha256(artifact)) !== sha256)
    throw new Error(
      "Stored artifact SHA-256 differs from the pin; the current target was not changed",
    );
  return artifact;
}

async function writeSelection(path: string, target: Target): Promise<void> {
  const directory = dirname(path);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await independentPath(directory);
  const temporary = join(directory, `current-${randomUUID()}.json`);
  await privateJson(temporary, target);
  await rename(temporary, path);
}

/**
 * Copy one finished run directory into the shared home. A unique temporary name renamed into place
 * keeps an interrupted copy from looking complete. Reflinks make the copy nearly free on btrfs.
 */
async function adoptRun(source: string, destination: string): Promise<boolean> {
  if (existsSync(destination)) return false;
  await mkdir(dirname(destination), { recursive: true, mode: 0o700 });
  const temporary = `${destination}.${randomUUID()}.tmp`;
  try {
    await cp(source, temporary, {
      recursive: true,
      errorOnExist: true,
      force: false,
      mode: constants.COPYFILE_FICLONE,
    });
    await rename(temporary, destination);
    return true;
  } catch (cause) {
    // Another migration adopted the same run first.
    if (existsSync(destination)) return false;
    throw cause;
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

const ControlTargetSchema = Schema.Struct({
  artifact: Schema.Struct({ sha256: Schema.String }),
});

/**
 * Move a checkout from the per-checkout layout to the shared home. Copies its artifacts, finished
 * analyses and control runs, then points its selection at the shared artifact. It never deletes
 * the old store, so the caller can compare before removing it.
 */
export async function migrateReaCheckout(checkout: string, store = reaHome()) {
  const legacy = join(resolve(checkout), ".stackanvil", "rea");
  independentName(legacy);
  const report = {
    checkout: resolve(checkout),
    artifacts: 0,
    analyses: 0,
    controls: 0,
    selection: false,
  };
  const artifacts = new Map<string, string>();
  for (const sha256 of await readdir(join(legacy, "artifacts")).catch(() => [])) {
    if (!shaPattern.test(sha256)) continue;
    const source = join(legacy, "artifacts", sha256, "artifact");
    if (!existsSync(source)) continue;
    const existed = existsSync(join(store, "artifacts", sha256.toLowerCase(), "artifact"));
    artifacts.set(sha256.toLowerCase(), await storedArtifact(store, sha256.toLowerCase(), source));
    if (!existed) report.artifacts++;
  }
  for (const name of await readdir(join(legacy, "analyses")).catch(() => [])) {
    const run = join(legacy, "analyses", name);
    const text = await readFile(join(run, "result.json"), "utf8").catch(() => undefined);
    if (text === undefined) continue;
    let value: unknown;
    try {
      value = JSON.parse(text);
    } catch {
      continue;
    }
    if (!isStoredResult(value) || !shaPattern.test(value.slice.sourceSha256)) continue;
    const sha256 = value.slice.sourceSha256.toLowerCase();
    if (await adoptRun(run, join(store, "analyses", sha256, name))) report.analyses++;
  }
  for (const name of await readdir(join(legacy, "controls")).catch(() => [])) {
    const run = join(legacy, "controls", name);
    const text = await readFile(join(run, "target.json"), "utf8").catch(() => undefined);
    if (text === undefined || !existsSync(join(run, "result.json"))) continue;
    let value: unknown;
    try {
      value = JSON.parse(text);
    } catch {
      continue;
    }
    if (!Schema.is(ControlTargetSchema)(value) || !shaPattern.test(value.artifact.sha256)) continue;
    const sha256 = value.artifact.sha256.toLowerCase();
    if (await adoptRun(run, join(store, "controls", sha256, name))) report.controls++;
  }
  const selection = join(legacy, "current.json");
  const current: unknown = JSON.parse(await readFile(selection, "utf8").catch(() => "null"));
  if (isTarget(current)) {
    const shared = artifacts.get(current.artifact.sha256.toLowerCase());
    if (shared && current.artifact.path !== shared) {
      await writeSelection(selection, {
        ...current,
        artifact: { ...current.artifact, path: shared },
      });
      report.selection = true;
    }
  }
  return report;
}

/** Select an already imported pinned artifact without its original source path. */
export async function useReaArtifact(options: {
  version: string;
  pins?: readonly ReaPin[];
  store?: string;
  selection?: string;
}): Promise<Target> {
  const pin = pinFor(options.pins ?? (await readReaPins()), options.version);
  const sha256 = pin.sha256.toLowerCase();
  const target: Target = {
    schemaVersion: 1,
    artifact: {
      path: await storedArtifact(resolve(options.store ?? reaHome()), sha256),
      sha256,
      name: pin.name,
      version: pin.version,
      ...(pin.protocol === undefined ? {} : { protocol: pin.protocol }),
    },
  };
  await writeSelection(resolve(options.selection ?? selectionPath), target);
  return target;
}

export const importReaArtifact = Effect.fn("importReaArtifact")(function* (options: {
  source: string;
  sha256: string;
  version: string;
  protocol?: number | undefined;
  /** The shared artifact home. */
  store?: string;
  /** This checkout's selection manifest. */
  selection?: string;
}) {
  return yield* Effect.tryPromise({
    try: async () => {
      if (!shaPattern.test(options.sha256)) throw new Error("Supply a 64-digit SHA-256 pin");
      if (!options.version.trim()) throw new Error("Supply an artifact version");
      if (
        options.protocol !== undefined &&
        (!Number.isSafeInteger(options.protocol) || options.protocol < 0)
      )
        throw new Error("The protocol must be a nonnegative integer");
      const source = await independentPath(resolve(options.source));
      if (!(await stat(source)).isFile()) throw new Error("The artifact must be a regular file");
      const sha256 = options.sha256.toLowerCase();
      if ((await artifactSha256(source)) !== sha256)
        throw new Error("Artifact SHA-256 differs from the pin");
      const store = await storedArtifact(resolve(options.store ?? reaHome()), sha256, source);
      const target: Target = {
        schemaVersion: 1,
        artifact: {
          path: store,
          sha256,
          name: basename(source),
          version: options.version,
          ...(options.protocol === undefined ? {} : { protocol: options.protocol }),
        },
      };
      await writeSelection(resolve(options.selection ?? selectionPath), target);
      return target;
    },
    catch: error,
  });
});

async function targetFrom(path = selectionPath): Promise<Target> {
  const manifest = await independentPath(path);
  const target: unknown = JSON.parse(await readFile(manifest, "utf8"));
  if (!isTarget(target) || !shaPattern.test(target.artifact.sha256))
    throw new Error("Invalid REA target manifest. Import a checksum-pinned artifact first");
  const artifact = await independentPath(target.artifact.path);
  if ((await artifactSha256(artifact)) !== target.artifact.sha256.toLowerCase())
    throw new Error("The current artifact no longer matches its SHA-256 pin");
  return target;
}

function environment(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env, PYTHONNOUSERSITE: "1" };
  delete env["PYTHONPATH"];
  delete env["PYTHONHOME"];
  delete env["VIRTUAL_ENV"];
  return env;
}

async function python(): Promise<string> {
  const selected = (await Bun.file(controlsPython).exists())
    ? controlsPython
    : Bun.which("python3");
  if (!selected) throw new Error("Install Python 3 before using REA comparison controls");
  // Keep the venv entry point: resolving its symlink for execution loses sys.prefix.
  await independentPath(selected);
  return selected;
}

export const readReaPe = Effect.fn("readReaPe")(function* (args: string[], targetPath?: string) {
  const manifest = resolve(targetPath ?? selectionPath);
  yield* Effect.tryPromise({ try: () => targetFrom(manifest), catch: error });
  const executable = yield* Effect.tryPromise({ try: python, catch: error });
  return yield* command(executable, [reader, ...args], root, {
    ...environment(),
    STACKANVIL_REA_TARGET: manifest,
  });
});

export const setupReaControls = Effect.fn("setupReaControls")(function* () {
  const system = Bun.which("python3");
  if (!system) return yield* error("Install Python 3.11 or newer first");
  yield* Effect.tryPromise({ try: () => independentPath(system), catch: error });
  yield* command(system, ["-m", "venv", controlsRoot], root, environment());
  yield* Effect.tryPromise({ try: () => independentPath(controlsPython), catch: error });
  yield* command(
    controlsPython,
    [
      "-m",
      "pip",
      "install",
      "--only-binary=:all:",
      "-r",
      join(root, "native/rea-controls/requirements.txt"),
    ],
    root,
    { ...environment(), PIP_REQUIRE_VIRTUALENV: "true" },
  );
  const receipt = yield* command(
    controlsPython,
    [
      "-c",
      [
        "import sys,json,unicorn,capstone,numpy",
        "print(json.dumps(dict(executable=sys.executable,baseExecutable=sys._base_executable,prefix=sys.prefix,python=sys.version,packages={m.__name__:dict(version=m.__version__,path=m.__file__) for m in [unicorn,capstone,numpy]})))",
      ].join(";"),
    ],
    root,
    environment(),
  );
  independentName(receipt);
  yield* Effect.tryPromise({
    try: () => writeFile(join(controlsRoot, "environment.json"), `${receipt}\n`, { mode: 0o600 }),
    catch: error,
  });
  return decodeJson(receipt);
});

export function validateReaEvidence(value: unknown, slice: Slice): { id: string; profile: string } {
  if (
    !isReaEvidence(value) ||
    value.subject.digest.sha256 !== slice.derivedSha256 ||
    value.normalized_result.procedure.address !== slice.procedureAddress
  )
    throw new Error("REA Evidence does not bind to the extracted bytes");
  return { id: value.evidence_id, profile: value.analysis_profile.digest };
}

async function invokeRea(args: string[], run: string, signal: AbortSignal): Promise<unknown> {
  const cli = process.env["REA_CLI"];
  const path = process.env["PATH"];
  const executable = Bun.which(cli ?? "bunx", path === undefined ? {} : { PATH: path });
  if (!executable) throw new Error("Install Bun or set REA_CLI to a REA executable");
  await independentPath(executable);
  let result: { stdout: string; stderr: string };
  try {
    result = await execute(executable, [...(cli ? [] : [`rea-agents@${reaVersion}`]), ...args], {
      cwd: root,
      env: environment(),
      signal,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (cause) {
    await writeFile(join(run, "evidence.json"), stringProperty(cause, "stdout") ?? "", {
      mode: 0o600,
    });
    await writeFile(
      join(run, "rea.stderr"),
      stringProperty(cause, "stderr") ?? stringProperty(cause, "message") ?? "",
      { mode: 0o600 },
    );
    throw new Error(`REA failed. Preserved its output in ${run}`, { cause });
  }
  await writeFile(join(run, "evidence.json"), result.stdout, { mode: 0o600 });
  await writeFile(join(run, "rea.stderr"), result.stderr, { mode: 0o600 });
  try {
    return JSON.parse(result.stdout) as unknown;
  } catch (cause) {
    throw new Error(`Invalid REA JSON. Preserved its output in ${run}`, { cause });
  }
}

const manualScope = "Caller-supplied raw range";

/** Save the pseudocode beside the result so readers need not dig through the Evidence JSON. */
async function writePseudocode(
  run: string,
  id: string,
  slice: { procedureAddress: string; endExclusive: string; sourceSha256: string; scope: string },
  text: string,
): Promise<string> {
  const path = join(run, "pseudocode.c");
  await writeFile(
    path,
    [
      `/* REA Evidence ${id}`,
      `   ${slice.procedureAddress}-${slice.endExclusive} of ${slice.sourceSha256}`,
      `   ${slice.scope} */`,
      "",
      text,
    ].join("\n"),
    { mode: 0o600, flag: "wx" },
  ).catch((cause: unknown) => {
    // Another agent wrote the same file first.
    if (errorCode(cause) !== "EEXIST") throw cause;
  });
  return path;
}

const StoredResultSchema = Schema.Struct({
  id: Schema.String,
  slice: Schema.Struct({
    sourceSha256: Schema.String,
    procedureAddress: Schema.String,
    endExclusive: Schema.String,
    scope: Schema.String,
  }),
});
const isStoredResult = Schema.is(StoredResultSchema);

export interface StoredReaAnalysis {
  directory: string;
  evidenceId: string;
  procedureAddress: string;
  endExclusive: string;
  /** A caller-supplied range rather than an exception-table function span. */
  manualRange: boolean;
  modified: number;
}

/** Completed analyses in one artifact's directory. Failed runs have no result.json and are skipped. */
export async function storedReaAnalyses(directory: string): Promise<StoredReaAnalysis[]> {
  const runs = await readdir(directory).catch((cause: unknown) => {
    if (errorCode(cause) === "ENOENT") return [];
    throw cause;
  });
  const found: StoredReaAnalysis[] = [];
  for (const name of runs) {
    const result = join(directory, name, "result.json");
    const text = await readFile(result, "utf8").catch(() => undefined);
    if (text === undefined) continue;
    let value: unknown;
    try {
      value = JSON.parse(text);
    } catch {
      continue;
    }
    if (!isStoredResult(value)) continue;
    found.push({
      directory: join(directory, name),
      evidenceId: value.id,
      procedureAddress: value.slice.procedureAddress,
      endExclusive: value.slice.endExclusive,
      manualRange: value.slice.scope.startsWith(manualScope),
      modified: (await stat(result)).mtimeMs,
    });
  }
  return found.toSorted((a, b) => b.modified - a.modified);
}

/** Runs whose analyzed range contains the address, newest first. */
export function analysesCovering(
  runs: readonly StoredReaAnalysis[],
  address: string,
): StoredReaAnalysis[] {
  const va = BigInt(address.startsWith("0x") ? address : `0x${address}`);
  return runs.filter((run) => BigInt(run.procedureAddress) <= va && va < BigInt(run.endExclusive));
}

/** Older runs kept the pseudocode only inside evidence.json. */
async function storedPseudocode(run: StoredReaAnalysis): Promise<string | null> {
  const path = join(run.directory, "pseudocode.c");
  if (await Bun.file(path).exists()) return path;
  const evidence: unknown = JSON.parse(
    await readFile(join(run.directory, "evidence.json"), "utf8").catch(() => "null"),
  );
  if (!hasPseudocode(evidence)) return null;
  const { slice } = parseJson(
    StoredResultSchema,
    await readFile(join(run.directory, "result.json"), "utf8"),
  );
  return writePseudocode(
    run.directory,
    run.evidenceId,
    slice,
    evidence.normalized_result.pseudocode,
  );
}

export async function describeReaAnalysis(run: StoredReaAnalysis) {
  return {
    directory: run.directory,
    evidenceId: run.evidenceId,
    procedureAddress: run.procedureAddress,
    endExclusive: run.endExclusive,
    manualRange: run.manualRange,
    result: join(run.directory, "result.json"),
    evidence: join(run.directory, "evidence.json"),
    pseudocode: await storedPseudocode(run),
  };
}

export const analyzeReaFunction = Effect.fn("analyzeReaFunction")(function* (options: {
  address: string;
  end?: string | undefined;
  target?: string | undefined;
  directory?: string;
  /** Analyze again even when an earlier run covers the same span. */
  fresh?: boolean;
}) {
  const target = yield* Effect.tryPromise({ try: () => targetFrom(options.target), catch: error });
  // Group runs by artifact so other agents can find earlier Evidence for the same binary.
  const directory = resolve(
    options.directory ?? join(reaHome(), "analyses", target.artifact.sha256.toLowerCase()),
  );
  independentName(directory);
  if (!options.fresh) {
    // The artifact is checksum-pinned, so an earlier run over the same span analyzed the same bytes.
    const earlier = yield* Effect.tryPromise({
      try: async () => {
        const covering = analysesCovering(await storedReaAnalyses(directory), options.address);
        const va = BigInt(
          options.address.startsWith("0x") ? options.address : `0x${options.address}`,
        );
        const match =
          options.end === undefined
            ? covering.find((run) => !run.manualRange)
            : covering.find(
                (run) =>
                  run.manualRange &&
                  BigInt(run.procedureAddress) === va &&
                  BigInt(run.endExclusive) ===
                    BigInt(options.end?.startsWith("0x") ? options.end : `0x${options.end}`),
              );
        return match ? describeReaAnalysis(match) : undefined;
      },
      catch: error,
    });
    if (earlier)
      return {
        directory: earlier.directory,
        result: earlier.result,
        pseudocode: earlier.pseudocode,
        reused: true,
      };
  }
  const run = join(directory, randomUUID());
  yield* Effect.tryPromise({
    try: async () => {
      await mkdir(directory, { recursive: true, mode: 0o700 });
      await independentPath(directory);
      await mkdir(run, { mode: 0o700 });
    },
    catch: error,
  });
  const input = join(run, "function.bin");
  const args = ["extract", "--va", options.address, "--output", input];
  if (options.end !== undefined) args.push("--end", options.end);
  const sliceText = yield* readReaPe(args, options.target);
  const slice = parseJson(SliceSchema, sliceText);
  // Bind this run to the target read before extraction, even if selection changes concurrently.
  if (slice.sourceSha256 !== target.artifact.sha256)
    return yield* error("The selected REA target changed during extraction");
  // REA receives a headerless slice, so it cannot detect the CPU itself.
  if (slice.machine !== "0x8664")
    return yield* error(
      `analyze supports AMD64 PE images only. This image's machine is ${slice.machine}`,
    );
  yield* Effect.tryPromise({
    try: () => privateJson(join(run, "source.json"), { target, slice }),
    catch: error,
  });
  const reaArgs = [
    "function",
    input,
    slice.procedureAddress,
    "--target-format",
    "raw-binary",
    "--architecture",
    "x86_64",
    "--entry-point",
    slice.procedureAddress,
    "--provider",
    "ghidra",
    "--format",
    "json",
  ];
  const ghidra = yield* optionalEnv("GHIDRA_INSTALL_DIR");
  if (ghidra)
    yield* Effect.tryPromise({
      try: () => independentPath(ghidra),
      catch: error,
    });
  return yield* Effect.tryPromise({
    try: async (signal) => {
      const evidence = await invokeRea(reaArgs, run, signal);
      let identity: { id: string; profile: string };
      try {
        identity = validateReaEvidence(evidence, slice);
      } catch (cause) {
        throw new Error(`Invalid REA Evidence. Preserved its output in ${run}`, { cause });
      }
      const pseudocode = hasPseudocode(evidence)
        ? await writePseudocode(run, identity.id, slice, evidence.normalized_result.pseudocode)
        : null;
      await privateJson(join(run, "result.json"), {
        ...identity,
        slice,
        evidence: join(run, "evidence.json"),
        pseudocode,
      });
      return { directory: run, result: join(run, "result.json"), pseudocode, reused: false };
    },
    catch: error,
  });
});

export function validateReaCapture(value: unknown): {
  id: string;
  exitCode: number | null;
  signal: number | null;
} {
  const incomplete = "REA did not return a complete process capture with verified owned cleanup";
  if (!isReaCapture(value)) throw new Error(incomplete);
  const { code } = value.normalized_result.exit;
  const signal = value.normalized_result.exit.signal ?? null;
  if (
    !(code === null || (Number.isSafeInteger(code) && code >= 0)) ||
    !(signal === null || (Number.isSafeInteger(signal) && signal >= 0))
  )
    throw new Error(incomplete);
  // REA can report code 0 together with a terminating signal. That is not a normal exit.
  return {
    id: value.evidence_id,
    exitCode: signal !== null && signal !== 0 ? null : code,
    signal,
  };
}

export const captureReaControl = Effect.fn("captureReaControl")(function* (options: {
  script: string;
  args?: string[] | undefined;
  target?: string | undefined;
  timeoutMs?: number | undefined;
}) {
  return yield* Effect.tryPromise({
    try: async (signal) => {
      const script = await independentPath(resolve(options.script));
      const path = relative(root, script);
      if (path.startsWith("..") || path.startsWith("/"))
        throw new Error("Keep comparison scripts inside this repository");
      const timeout = options.timeoutMs ?? 60_000;
      if (!Number.isSafeInteger(timeout) || timeout < 1 || timeout > 60_000)
        throw new Error("Control timeouts must be 1 to 60000 ms");
      const target = await targetFrom(options.target);
      const directory = join(reaHome(), "controls", target.artifact.sha256.toLowerCase());
      await mkdir(directory, { recursive: true, mode: 0o700 });
      await independentPath(directory);
      const run = join(directory, randomUUID());
      await mkdir(run, { mode: 0o700 });
      const snapshot = join(run, "target.json");
      await privateJson(snapshot, target);
      await privateJson(join(run, "source.json"), {
        script,
        scriptSha256: await artifactSha256(script),
        target,
        scope:
          "Selected artifact context, not proof that the script executes that artifact or establishes native parity",
      });
      const scenario = {
        executable: await python(),
        arguments: [script, ...(options.args ?? [])],
        working_directory: root,
        environment: { STACKANVIL_REA_TARGET: snapshot, PYTHONNOUSERSITE: "1" },
        timeout_ms: timeout,
        idle_timeout_ms: timeout,
        finalization_ms: 3000,
        terminal: { columns: 140, rows: 32, scrollback: 600 },
        limits: {
          output_bytes: 65_536,
          processes: 16,
          files: 40,
          file_bytes: 1_048_576,
          filesystem_depth: 1,
        },
        filesystem_observation_paths: [dirname(script)],
      };
      const scenarioPath = join(run, "scenario.json");
      await privateJson(scenarioPath, scenario);
      const evidence = await invokeRea(
        ["capture-process", scenarioPath, "--format", "json"],
        run,
        signal,
      );
      let identity: ReturnType<typeof validateReaCapture>;
      try {
        identity = validateReaCapture(evidence);
      } catch (cause) {
        throw new Error(`Invalid REA capture. Preserved its output in ${run}`, { cause });
      }
      await privateJson(join(run, "result.json"), {
        ...identity,
        evidence: join(run, "evidence.json"),
      });
      return { ...identity, directory: run, result: join(run, "result.json") };
    },
    catch: error,
  });
});

const help = `REA-backed binary research in StackAnvil.

  bun run rea list
  bun run rea import --artifact PATH --version VERSION [--sha256 HEX] [--protocol N]
  bun run rea use --version VERSION
  bun run rea find --va HEX
  bun run rea migrate [--checkout PATH]
  bun run rea inspect
  bun run rea function --va HEX
  bun run rea extract --va HEX --output PATH [--end HEX]
  bun run rea read --va HEX [--length N]
  bun run rea imports [--va HEX]
  bun run rea refs --va HEX [--limit N]
  bun run rea analyze --va HEX [--end HEX] [--fresh]
  bun run rea control --script PATH [--argument VALUE] [--timeout-ms N]
  bun run rea setup-controls

Imported artifacts and analyses are shared by every checkout in STACKANVIL_REA_HOME,
or $XDG_DATA_HOME/stackanvil/rea by default. rea-artifacts.json pins known versions;
import fills in their SHA-256 and protocol, and use selects one already imported.
Each checkout selects its target in .stackanvil/rea/current.json. Pass --target PATH for another manifest.
analyze returns an earlier run of the same span unless you pass --fresh. find lists earlier runs
that contain an address. migrate copies an older checkout's .stackanvil/rea store into the shared
home and selects the shared artifact; it does not delete the old store.
Addresses are linked hexadecimal VAs. A manual --end makes no function-boundary claim.
Analysis runs REA with Ghidra. Set GHIDRA_INSTALL_DIR for an existing Ghidra install.
Set REA_CLI to an existing REA executable, or use the pinned rea-agents@${reaVersion} fallback.
Each analysis saves complete Evidence, source hashes, stderr and pseudocode.c in a fresh private directory.
control runs a repository Python fixture through REA process capture, with a 60 s maximum.
Reference scans report byte-pattern candidates. Check instruction alignment through REA.
RIP candidates report the end of the displacement, not a validated instruction start.
setup-controls installs pinned packages in an independent private Python environment.
It does not configure REA, install Ghidra or launch a game.
`;

export async function reaMain(args: string[]): Promise<void> {
  const [action, ...rest] = args;
  if (!action || action === "--help" || action === "help") {
    print(help);
    return;
  }
  const { values, positionals } = parseArgs({
    args: rest,
    allowPositionals: true,
    options: {
      artifact: { type: "string" },
      sha256: { type: "string" },
      version: { type: "string" },
      protocol: { type: "string" },
      va: { type: "string" },
      end: { type: "string" },
      length: { type: "string" },
      limit: { type: "string" },
      output: { type: "string" },
      target: { type: "string" },
      script: { type: "string" },
      argument: { type: "string", multiple: true },
      "timeout-ms": { type: "string" },
      fresh: { type: "boolean" },
      checkout: { type: "string" },
    },
  });
  if (positionals.length > 0)
    throw new Error("Unexpected positional arguments. Use bun run rea --help");
  if (values.va && !/^(0x)?[a-f0-9]+$/iu.test(values.va))
    throw new Error("Supply a hexadecimal VA");
  if (values.end && !/^(0x)?[a-f0-9]+$/iu.test(values.end))
    throw new Error("Supply a hexadecimal end address");
  if (action === "list") {
    const home = reaHome();
    const pins = await readReaPins();
    print(
      JSON.stringify(
        {
          home,
          artifacts: pins.map((pin) =>
            Object.assign({}, pin, {
              imported: existsSync(join(home, "artifacts", pin.sha256.toLowerCase(), "artifact")),
            }),
          ),
        },
        null,
        2,
      ),
    );
  } else if (action === "import") {
    if (!values.artifact || !values.version)
      throw new Error("import requires --artifact and --version");
    const pin = (await readReaPins()).find((candidate) => candidate.version === values.version);
    const sha256 = values.sha256 ?? pin?.sha256;
    if (!sha256)
      throw new Error(`${values.version} is not pinned in rea-artifacts.json. Supply --sha256`);
    if (pin && pin.sha256.toLowerCase() !== sha256.toLowerCase())
      throw new Error(`--sha256 differs from the rea-artifacts.json pin for ${values.version}`);
    print(
      JSON.stringify(
        await runLabCommand(
          importReaArtifact({
            source: values.artifact,
            sha256,
            version: values.version,
            protocol: values.protocol === undefined ? pin?.protocol : Number(values.protocol),
          }),
        ),
        null,
        2,
      ),
    );
  } else if (action === "find") {
    if (!values.va) throw new Error("find requires --va");
    const { artifact } = await targetFrom(values.target);
    const runs = analysesCovering(
      await storedReaAnalyses(join(reaHome(), "analyses", artifact.sha256.toLowerCase())),
      values.va,
    );
    print(JSON.stringify(await Promise.all(runs.map((run) => describeReaAnalysis(run))), null, 2));
  } else if (action === "migrate") {
    print(JSON.stringify(await migrateReaCheckout(values.checkout ?? root), null, 2));
  } else if (action === "use") {
    if (!values.version) throw new Error("use requires --version");
    print(JSON.stringify(await useReaArtifact({ version: values.version }), null, 2));
  } else if (action === "setup-controls") {
    print(JSON.stringify(await runLabCommand(setupReaControls()), null, 2));
  } else if (action === "analyze") {
    if (!values.va) throw new Error("analyze requires --va");
    print(
      JSON.stringify(
        await runLabCommand(
          analyzeReaFunction({
            address: values.va,
            end: values.end,
            target: values.target,
            fresh: values.fresh ?? false,
          }),
        ),
        null,
        2,
      ),
    );
  } else if (action === "control") {
    if (!values.script) throw new Error("control requires --script");
    const report = await runLabCommand(
      captureReaControl({
        script: values.script,
        args: values.argument,
        target: values.target,
        timeoutMs: values["timeout-ms"] === undefined ? undefined : Number(values["timeout-ms"]),
      }),
    );
    print(JSON.stringify(report, null, 2));
    if (report.exitCode !== 0) process.exitCode = 1;
  } else if (["inspect", "function", "extract", "read", "imports", "refs"].includes(action)) {
    const peArgs = [action];
    for (const name of ["va", "end", "length", "limit", "output"] as const) {
      if (values[name] !== undefined) peArgs.push(`--${name}`, values[name]);
    }
    print(await runLabCommand(readReaPe(peArgs, values.target)));
  } else throw new Error(`Unknown REA command: ${action}`);
}

if (import.meta.main) {
  try {
    await reaMain(process.argv.slice(2));
  } catch (cause: unknown) {
    printError(error(cause).message);
    process.exitCode = 1;
  }
}
