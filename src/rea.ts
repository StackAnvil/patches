import { execFile } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { constants, createReadStream } from "node:fs";
import {
  chmod,
  copyFile,
  mkdir,
  readFile,
  realpath,
  rename,
  stat,
  writeFile,
} from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import { parseArgs, promisify } from "node:util";
import { Data, Effect } from "effect";
import { runLabCommand } from "./lab/effect-runtime.ts";
import { root } from "./model.ts";
import { command } from "./process.ts";

const execute = promisify(execFile);
const reader = join(root, "native", "rea-controls", "pe.py");
const privateRoot = join(root, ".stackanvil", "rea");
const controlsRoot = join(root, ".stackanvil", "tools", "rea-controls-venv");
const controlsPython = join(
  controlsRoot,
  process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
);
const reaVersion = "6.7.0";
const shaPattern = /^[a-f0-9]{64}$/i;

interface Target {
  schemaVersion: 1;
  artifact: { path: string; sha256: string; name: string; version: string; protocol?: number };
}

interface Slice {
  sourceSha256: string;
  procedureAddress: string;
  endExclusive: string;
  derivedPath: string;
  derivedSha256: string;
  scope: string;
}

class ReaError extends Data.TaggedError("ReaError")<{
  readonly message: string;
  readonly cause: unknown;
}> {}

function error(cause: unknown): ReaError {
  return cause instanceof ReaError
    ? cause
    : new ReaError({ message: cause instanceof Error ? cause.message : String(cause), cause });
}

function independentName(path: string): void {
  if (/pistondecompiler/i.test(path)) throw new Error("PistonDecompiler paths are not permitted");
}

export async function independentPath(path: string): Promise<string> {
  independentName(path);
  const actual = await realpath(path);
  independentName(actual);
  return actual;
}

export async function artifactSha256(path: string): Promise<string> {
  const digest = createHash("sha256");
  for await (const chunk of createReadStream(path)) digest.update(chunk);
  return digest.digest("hex");
}

async function privateJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600, flag: "wx" });
}

export const importReaArtifact = Effect.fn("importReaArtifact")(function* (options: {
  source: string;
  sha256: string;
  version: string;
  protocol?: number;
  directory?: string;
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
      const directory = resolve(options.directory ?? privateRoot);
      independentName(directory);
      await mkdir(directory, { recursive: true, mode: 0o700 });
      await independentPath(directory);
      const store = join(directory, "artifacts", sha256);
      await mkdir(store, { recursive: true, mode: 0o700 });
      await independentPath(store);
      const path = join(store, "artifact");
      try {
        await copyFile(source, path, constants.COPYFILE_EXCL);
        await chmod(path, 0o400);
      } catch (cause) {
        if ((cause as NodeJS.ErrnoException).code !== "EEXIST") throw cause;
      }
      const artifact = await independentPath(path);
      if ((await artifactSha256(artifact)) !== sha256)
        throw new Error(
          "Stored artifact SHA-256 differs from the pin; the current target was not changed",
        );
      const target: Target = {
        schemaVersion: 1,
        artifact: {
          path: artifact,
          sha256,
          name: basename(source),
          version: options.version,
          protocol: options.protocol,
        },
      };
      const temporary = join(directory, `current-${randomUUID()}.json`);
      await privateJson(temporary, target);
      await rename(temporary, join(directory, "current.json"));
      return target;
    },
    catch: error,
  });
});

async function targetFrom(path = join(privateRoot, "current.json")): Promise<Target> {
  const manifest = await independentPath(path);
  const target = JSON.parse(await readFile(manifest, "utf8")) as Target;
  if (
    target.schemaVersion !== 1 ||
    typeof target.artifact?.path !== "string" ||
    !shaPattern.test(target.artifact.sha256)
  )
    throw new Error("Invalid REA target manifest. Import a checksum-pinned artifact first");
  const artifact = await independentPath(target.artifact.path);
  if ((await artifactSha256(artifact)) !== target.artifact.sha256.toLowerCase())
    throw new Error("The current artifact no longer matches its SHA-256 pin");
  return target;
}

function environment(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env, PYTHONNOUSERSITE: "1" };
  delete env.PYTHONPATH;
  delete env.PYTHONHOME;
  delete env.VIRTUAL_ENV;
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
  const manifest = resolve(targetPath ?? join(privateRoot, "current.json"));
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
  return JSON.parse(receipt) as unknown;
});

export function validateReaEvidence(value: unknown, slice: Slice): { id: string; profile: string } {
  const evidence = value as {
    evidence_id?: unknown;
    subject?: { digest?: { sha256?: unknown } };
    analysis_profile?: { digest?: unknown };
    operation?: unknown;
    predicate_type?: unknown;
    normalized_result?: { procedure?: { address?: unknown } };
  } | null;
  if (
    !evidence ||
    typeof evidence.evidence_id !== "string" ||
    typeof evidence.analysis_profile?.digest !== "string" ||
    evidence.subject?.digest?.sha256 !== slice.derivedSha256 ||
    evidence.operation !== "analyze_function" ||
    evidence.predicate_type !== "rea.analysis" ||
    evidence.normalized_result?.procedure?.address !== slice.procedureAddress
  )
    throw new Error("REA Evidence does not bind to the extracted bytes");
  return { id: evidence.evidence_id, profile: evidence.analysis_profile.digest };
}

async function invokeRea(args: string[], run: string, signal: AbortSignal): Promise<unknown> {
  const cli = process.env.REA_CLI;
  const executable = Bun.which(cli ?? "bunx", { PATH: process.env.PATH });
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
    const failure = cause as Error & { stdout?: string; stderr?: string };
    await writeFile(join(run, "evidence.json"), failure.stdout ?? "", { mode: 0o600 });
    await writeFile(join(run, "rea.stderr"), failure.stderr ?? failure.message, { mode: 0o600 });
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

export const analyzeReaFunction = Effect.fn("analyzeReaFunction")(function* (options: {
  address: string;
  end?: string;
  target?: string;
  directory?: string;
}) {
  const target = yield* Effect.tryPromise({ try: () => targetFrom(options.target), catch: error });
  const directory = resolve(options.directory ?? join(privateRoot, "analyses"));
  independentName(directory);
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
  const slice = JSON.parse(yield* readReaPe(args, options.target)) as Slice;
  // Bind this run to the target read before extraction, even if selection changes concurrently.
  if (slice.sourceSha256 !== target.artifact.sha256)
    return yield* error("The selected REA target changed during extraction");
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
  if (process.env.GHIDRA_INSTALL_DIR)
    yield* Effect.tryPromise({
      try: () => independentPath(process.env.GHIDRA_INSTALL_DIR!),
      catch: error,
    });
  yield* Effect.tryPromise({
    try: async (signal) => {
      const evidence = await invokeRea(reaArgs, run, signal);
      let identity: { id: string; profile: string };
      try {
        identity = validateReaEvidence(evidence, slice);
      } catch (cause) {
        throw new Error(`Invalid REA Evidence. Preserved its output in ${run}`, { cause });
      }
      await privateJson(join(run, "result.json"), {
        ...identity,
        slice,
        evidence: join(run, "evidence.json"),
      });
    },
    catch: error,
  });
  return { directory: run, result: join(run, "result.json") };
});

export function validateReaCapture(value: unknown): { id: string; exitCode: number | null } {
  const capture = value as {
    evidence_id?: unknown;
    operation?: unknown;
    predicate_type?: unknown;
    normalized_result?: { exit?: { code?: unknown }; cleanup?: { owned_process_group?: unknown } };
  } | null;
  const code = capture?.normalized_result?.exit?.code;
  if (
    !capture ||
    typeof capture.evidence_id !== "string" ||
    capture.operation !== "capture_process_scenario" ||
    capture.predicate_type !== "rea.process-capture" ||
    capture.normalized_result?.cleanup?.owned_process_group !== "verified" ||
    !(code === null || (typeof code === "number" && Number.isSafeInteger(code) && code >= 0))
  )
    throw new Error("REA did not return a complete process capture with verified owned cleanup");
  return { id: capture.evidence_id, exitCode: code };
}

export const captureReaControl = Effect.fn("captureReaControl")(function* (options: {
  script: string;
  args?: string[];
  target?: string;
  timeoutMs?: number;
}) {
  return yield* Effect.tryPromise({
    try: async (signal) => {
      const script = await independentPath(resolve(options.script));
      const path = relative(root, script);
      if (path.startsWith("..") || path.startsWith("/"))
        throw new Error("Keep comparison scripts inside this repository");
      const timeout = options.timeoutMs ?? 60000;
      if (!Number.isSafeInteger(timeout) || timeout < 1 || timeout > 60000)
        throw new Error("Control timeouts must be 1 to 60000 ms");
      const target = await targetFrom(options.target);
      const directory = join(privateRoot, "controls");
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
          output_bytes: 65536,
          processes: 16,
          files: 40,
          file_bytes: 1048576,
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
      let identity: { id: string; exitCode: number | null };
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

  bun run rea import --artifact PATH --sha256 HEX --version VERSION [--protocol N]
  bun run rea inspect
  bun run rea function --va HEX
  bun run rea extract --va HEX --output PATH [--end HEX]
  bun run rea read --va HEX [--length N]
  bun run rea imports [--va HEX]
  bun run rea refs --va HEX [--limit N]
  bun run rea analyze --va HEX [--end HEX]
  bun run rea control --script PATH [--argument VALUE] [--timeout-ms N]
  bun run rea setup-controls

Commands use .stackanvil/rea/current.json. Pass --target PATH for another manifest.
Addresses are linked hexadecimal VAs. A manual --end makes no function-boundary claim.
Analysis runs REA with Ghidra. Set GHIDRA_INSTALL_DIR for an existing Ghidra install.
Set REA_CLI to an existing REA executable, or use the pinned rea-agents@${reaVersion} fallback.
Each analysis saves complete Evidence, source hashes and stderr in a fresh private directory.
control runs a repository Python fixture through REA process capture, with a 60 s maximum.
Reference scans report byte-pattern candidates. Check instruction alignment through REA.
RIP candidates report the end of the displacement, not a validated instruction start.
setup-controls installs pinned packages in an independent private Python environment.
It does not configure REA, install Ghidra or launch a game.
`;

export async function reaMain(args: string[]): Promise<void> {
  const [action, ...rest] = args;
  if (!action || action === "--help" || action === "help") {
    console.log(help);
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
    },
  });
  if (positionals.length)
    throw new Error("Unexpected positional arguments. Use bun run rea --help");
  if (values.va && !/^(0x)?[a-f0-9]+$/i.test(values.va)) throw new Error("Supply a hexadecimal VA");
  if (values.end && !/^(0x)?[a-f0-9]+$/i.test(values.end))
    throw new Error("Supply a hexadecimal end address");
  if (action === "import") {
    if (!values.artifact || !values.sha256 || !values.version)
      throw new Error("import requires --artifact, --sha256 and --version");
    console.log(
      JSON.stringify(
        await runLabCommand(
          importReaArtifact({
            source: values.artifact,
            sha256: values.sha256,
            version: values.version,
            protocol: values.protocol === undefined ? undefined : Number(values.protocol),
          }),
        ),
        null,
        2,
      ),
    );
  } else if (action === "setup-controls") {
    console.log(JSON.stringify(await runLabCommand(setupReaControls()), null, 2));
  } else if (action === "analyze") {
    if (!values.va) throw new Error("analyze requires --va");
    console.log(
      JSON.stringify(
        await runLabCommand(
          analyzeReaFunction({ address: values.va, end: values.end, target: values.target }),
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
    console.log(JSON.stringify(report, null, 2));
    if (report.exitCode !== 0) process.exitCode = 1;
  } else if (["inspect", "function", "extract", "read", "imports", "refs"].includes(action)) {
    const peArgs = [action];
    for (const name of ["va", "end", "length", "limit", "output"] as const) {
      if (values[name] !== undefined) peArgs.push(`--${name}`, values[name]);
    }
    console.log(await runLabCommand(readReaPe(peArgs, values.target)));
  } else throw new Error(`Unknown REA command: ${action}`);
}

if (import.meta.main)
  reaMain(process.argv.slice(2)).catch((cause: unknown) => {
    console.error(error(cause).message);
    process.exitCode = 1;
  });
