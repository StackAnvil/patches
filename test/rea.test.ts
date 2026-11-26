import { afterEach, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { chmod, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { Effect } from "effect";
import {
  analyzeReaFunction,
  importReaArtifact,
  describeReaAnalysis,
  migrateReaCheckout,
  storedReaAnalyses,
  useReaArtifact,
  independentPath,
  readReaPe,
  validateReaCapture,
  validateReaEvidence,
} from "../src/rea.ts";
import { required } from "../src/guards.ts";
import { root } from "../src/model.ts";
import { expectRejection } from "./helpers/expect-rejection.ts";

const directories: string[] = [];
afterEach(async () => {
  for (const directory of directories.splice(0))
    await rm(directory, { recursive: true, force: true });
});

function image(): Buffer {
  const b = Buffer.alloc(0x800);
  b.write("MZ");
  b.writeUInt32LE(0x80, 0x3c);
  b.write("PE\0\0", 0x80);
  b.writeUInt16LE(0x8664, 0x84);
  b.writeUInt16LE(2, 0x86);
  b.writeUInt16LE(0xf0, 0x94);
  b.writeUInt16LE(0x20b, 0x98);
  b.writeBigUInt64LE(0x140000000n, 0x98 + 24);
  b.writeUInt32LE(16, 0x98 + 108);
  const section = (
    offset: number,
    name: string,
    rva: number,
    raw: number,
    virtualSize: number,
    rawSize: number,
  ) => {
    b.write(name, offset);
    b.writeUInt32LE(virtualSize, offset + 8);
    b.writeUInt32LE(rva, offset + 12);
    b.writeUInt32LE(rawSize, offset + 16);
    b.writeUInt32LE(raw, offset + 20);
  };
  section(0x188, ".text", 0x1000, 0x200, 0x300, 0x200);
  section(0x1b0, ".rdata", 0x2000, 0x400, 0x400, 0x400);
  b.writeUInt32LE(0x2100, 0x98 + 112 + 3 * 8);
  b.writeUInt32LE(12, 0x98 + 116 + 3 * 8);
  b.writeUInt32LE(0x1000, 0x500);
  b.writeUInt32LE(0x1010, 0x504);
  b.writeUInt32LE(0x2200, 0x508);
  b[0x202] = 0xe8;
  b.writeInt32LE(-7, 0x203);
  b[0x208] = 0xe9;
  b.writeInt32LE(-13, 0x209);
  b.set([0x48, 0x8d, 0x05], 0x210);
  b.writeInt32LE(-23, 0x213);
  b.writeBigUInt64LE(0x140001000n, 0x420);
  b.writeUInt32LE(0x2180, 0x98 + 112 + 8);
  b.writeUInt32LE(40, 0x98 + 116 + 8);
  b.writeUInt32LE(0x21c0, 0x580);
  b.writeUInt32LE(0x21e0, 0x58c);
  b.writeUInt32LE(0x21d0, 0x590);
  b.writeBigUInt64LE(0x21f0n, 0x5c0);
  b.write("api.dll\0", 0x5e0);
  b.write("powf\0", 0x5f2);
  return b;
}

async function fixture(bytes = image()) {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-rea-"));
  directories.push(directory);
  const source = join(directory, "source.exe");
  await writeFile(source, bytes);
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const store = join(directory, "rea");
  const target = await Effect.runPromise(
    importReaArtifact({
      source,
      sha256,
      version: "fixture",
      protocol: 2225,
      store,
      selection: join(directory, "checkout", "current.json"),
    }),
  );
  return {
    directory,
    source,
    sha256,
    bytes,
    store,
    target,
    manifest: join(directory, "checkout", "current.json"),
  };
}

async function pe(manifest: string, ...args: string[]) {
  return JSON.parse(await Effect.runPromise(readReaPe(args, manifest)));
}

test("a wrong artifact pin leaves the selected target unchanged", async () => {
  const f = await fixture();
  const previous = await readFile(f.manifest);
  await expectRejection(
    Effect.runPromise(
      importReaArtifact({
        source: f.source,
        sha256: "0".repeat(64),
        version: "wrong",
        store: f.store,
        selection: f.manifest,
      }),
    ),
    "SHA-256",
  );
  expect(await readFile(f.manifest)).toEqual(previous);
  await writeFile(f.source, Buffer.from("source changed"));
  expect((await readFile(f.target.artifact.path)).toString("hex")).toBe(f.bytes.toString("hex"));
});

test("checkouts share one stored artifact and keep separate selections", async () => {
  const f = await fixture();
  const other = join(f.directory, "other-checkout", "current.json");
  const pins = [
    { version: "fixture", name: "source.exe", sha256: f.sha256, protocol: 2225, source: "fixture" },
  ];
  // The other checkout selects by version alone, after the source file is gone.
  await rm(f.source);
  const selected = await useReaArtifact({
    version: "fixture",
    pins,
    store: f.store,
    selection: other,
  });
  expect(selected.artifact.path).toBe(f.target.artifact.path);
  expect(await readdir(join(f.store, "artifacts", f.sha256))).toEqual(["artifact"]);
  await expectRejection(
    useReaArtifact({ version: "missing", pins, store: f.store, selection: other }),
    "Pinned versions: fixture",
  );
  const unimported = [{ ...pins[0]!, version: "later", sha256: "1".repeat(64) }];
  const before = await readFile(other);
  await expectRejection(
    useReaArtifact({ version: "later", pins: unimported, store: f.store, selection: other }),
    "Import it with bun run rea import first",
  );
  expect(await readFile(other)).toEqual(before);
  expect(JSON.parse(await readFile(f.manifest, "utf8")).artifact.version).toBe("fixture");
});

test("concurrent imports of one artifact store one complete copy", async () => {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-rea-"));
  directories.push(directory);
  const bytes = Buffer.alloc(8 * 1024 * 1024, 7);
  const source = join(directory, "large.exe");
  await writeFile(source, bytes);
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const store = join(directory, "rea");
  const targets = await Promise.all(
    ["a", "b", "c"].map((checkout) =>
      Effect.runPromise(
        importReaArtifact({
          source,
          sha256,
          version: "large",
          store,
          selection: join(directory, checkout, "current.json"),
        }),
      ),
    ),
  );
  expect(new Set(targets.map((target) => target.artifact.path)).size).toBe(1);
  expect(await readdir(join(store, "artifacts", sha256))).toEqual(["artifact"]);
  expect(
    createHash("sha256")
      .update(await readFile(targets[0]!.artifact.path))
      .digest("hex"),
  ).toBe(sha256);
});

test("migration adopts an old checkout's finished runs and selection without deleting them", async () => {
  const f = await fixture();
  // An older checkout kept its own artifact copy, analyses and selection under .stackanvil/rea.
  const checkout = join(f.directory, "old-checkout");
  const legacy = join(checkout, ".stackanvil", "rea");
  await Effect.runPromise(
    importReaArtifact({
      source: f.source,
      sha256: f.sha256,
      version: "fixture",
      store: legacy,
      selection: join(legacy, "current.json"),
    }),
  );
  const finished = join(legacy, "analyses", "finished-run");
  await mkdir(finished, { recursive: true });
  const slice = {
    sourceSha256: f.sha256,
    procedureAddress: "0x140001000",
    endExclusive: "0x140001010",
    scope: "One contiguous AMD64 RUNTIME_FUNCTION span",
  };
  await writeFile(join(finished, "result.json"), JSON.stringify({ id: "ev_old", slice }));
  // Older runs kept their pseudocode only inside the Evidence.
  await writeFile(
    join(finished, "evidence.json"),
    JSON.stringify({ normalized_result: { pseudocode: "void old(void) {}" } }),
  );
  await mkdir(join(legacy, "analyses", "failed-run"), { recursive: true });
  const shared = join(f.directory, "shared");

  const report = await migrateReaCheckout(checkout, shared);
  expect(report).toMatchObject({ artifacts: 1, analyses: 1, controls: 0, selection: true });
  const selection = JSON.parse(await readFile(join(legacy, "current.json"), "utf8"));
  expect(selection.artifact.path).toBe(
    join(await independentPath(shared), "artifacts", f.sha256, "artifact"),
  );
  const runs = await storedReaAnalyses(join(shared, "analyses", f.sha256));
  expect(runs.map((run) => run.evidenceId)).toEqual(["ev_old"]);
  const described = await describeReaAnalysis(runs[0]!);
  expect(
    await readFile(required(described.pseudocode ?? undefined, "pseudocode"), "utf8"),
  ).toEndWith("*/\n\nvoid old(void) {}");
  expect((await readdir(join(legacy, "analyses"))).toSorted()).toEqual([
    "failed-run",
    "finished-run",
  ]);
  expect(await Bun.file(join(legacy, "artifacts", f.sha256, "artifact")).exists()).toBe(true);
  expect(await migrateReaCheckout(checkout, shared)).toMatchObject({
    artifacts: 0,
    analyses: 0,
    selection: false,
  });
});

test("PE extraction keeps exact exception spans and never overwrites an existing slice", async () => {
  const f = await fixture();
  const output = join(f.directory, "slice.bin");
  const result = await pe(f.manifest, "extract", "--va", "140001006", "--output", output);
  expect(result.procedureAddress).toBe("0x140001000");
  expect(result.endExclusive).toBe("0x140001010");
  expect(result.sourceFileOffset).toBe(0x200);
  expect((await readFile(output)).toString("hex")).toBe(
    f.bytes.subarray(0x200, 0x210).toString("hex"),
  );
  await expectRejection(
    pe(f.manifest, "extract", "--va", "140001006", "--output", output),
    "File exists",
  );
  expect((await readFile(output)).toString("hex")).toBe(
    f.bytes.subarray(0x200, 0x210).toString("hex"),
  );
  expect(await pe(f.manifest, "function", "--va", "140001010")).toBeNull();
  await expectRejection(
    pe(f.manifest, "extract", "--va", "140001010", "--output", join(f.directory, "leaf.bin")),
    "explicit end",
  );
  const manual = await pe(
    f.manifest,
    "extract",
    "--va",
    "140001010",
    "--end",
    "140001017",
    "--output",
    join(f.directory, "manual.bin"),
  );
  expect(manual.scope).toContain("no function-boundary claim");
});

test("PE reads reject unbacked tails and reads that spill into the next raw range", async () => {
  const f = await fixture();
  await expectRejection(
    pe(f.manifest, "read", "--va", "1400011ff", "--length", "2"),
    "file-backed",
  );
  await expectRejection(
    pe(f.manifest, "read", "--va", "140001200", "--length", "1"),
    "file-backed",
  );
  expect((await pe(f.manifest, "read", "--va", "1400011ff", "--length", "1")).bytes).toBe("00");
});

test("PE helpers resolve import slots and label reference patterns as tentative", async () => {
  const f = await fixture();
  expect(await pe(f.manifest, "imports", "--va", "1400021d0")).toEqual({
    address: "0x1400021d0",
    dll: "api.dll",
    symbol: "powf",
  });
  const refs = await pe(f.manifest, "refs", "--va", "140001000");
  expect(refs.scope).toContain("not validated instructions");
  expect(refs.candidates).toContainEqual({ kind: "call-rel32", address: "0x140001002" });
  expect(refs.candidates).toContainEqual({ kind: "jump-rel32", address: "0x140001008" });
  expect(refs.candidates).toContainEqual({ kind: "possible-rip-disp32", address: "0x140001017" });
  expect(refs.candidates).toContainEqual({ kind: "absolute-u64", address: "0x140002020" });
});

test("import names longer than 512 bytes resolve to their full symbol", async () => {
  const bytes = Buffer.concat([image(), Buffer.alloc(0x400)]);
  bytes.writeUInt32LE(0x800, 0x1b0 + 8);
  bytes.writeUInt32LE(0x800, 0x1b0 + 16);
  const symbol = `?${"Long".repeat(200)}@@`;
  bytes.writeBigUInt64LE(0x23fen, 0x5c0);
  bytes.write(`${symbol}\0`, 0x800);
  const f = await fixture(bytes);
  expect((await pe(f.manifest, "imports", "--va", "1400021d0")).symbol).toBe(symbol);
});

test("reference scans support an image base above the signed 64-bit range", async () => {
  const bytes = image();
  bytes.writeBigUInt64LE(0xffff800000000000n, 0x98 + 24);
  const f = await fixture(bytes);
  const refs = await pe(f.manifest, "refs", "--va", "ffff800000001000");
  expect(refs.candidates).toContainEqual({ kind: "call-rel32", address: "0xffff800000001002" });
  expect(refs.candidates).toContainEqual({
    kind: "possible-rip-disp32",
    address: "0xffff800000001017",
  });
});

test("a malformed exception directory blocks declared spans but not manual ranges", async () => {
  const bytes = image();
  bytes.writeUInt32LE(13, 0x98 + 116 + 3 * 8);
  const f = await fixture(bytes);
  const output = join(f.directory, "invalid.bin");
  await expectRejection(
    pe(f.manifest, "extract", "--va", "140001000", "--output", output),
    "exception directory length",
  );
  expect(await Bun.file(output).exists()).toBe(false);
  const manual = join(f.directory, "manual.bin");
  const result = await pe(
    f.manifest,
    "extract",
    "--va",
    "140001000",
    "--end",
    "140001010",
    "--output",
    manual,
  );
  expect(result.scope).toContain("no function-boundary claim");
  expect((await readFile(manual)).toString("hex")).toBe(
    f.bytes.subarray(0x200, 0x210).toString("hex"),
  );
});

test("REA Evidence must bind to both the extracted bytes and requested procedure", () => {
  const slice = {
    sourceSha256: "a".repeat(64),
    machine: "0x8664",
    procedureAddress: "0x140001000",
    endExclusive: "0x140001010",
    derivedPath: "/fixture",
    derivedSha256: "b".repeat(64),
    scope: "fixture",
  };
  const evidence = {
    evidence_id: "ev_fixture",
    subject: { digest: { sha256: slice.derivedSha256 } },
    analysis_profile: { digest: "profile" },
    operation: "analyze_function",
    predicate_type: "rea.analysis",
    normalized_result: { procedure: { address: slice.procedureAddress } },
  };
  expect(validateReaEvidence(evidence, slice).id).toBe("ev_fixture");
  expect(() =>
    validateReaEvidence({ ...evidence, subject: { digest: { sha256: "c".repeat(64) } } }, slice),
  ).toThrow("extracted bytes");
  expect(() =>
    validateReaEvidence(
      { ...evidence, normalized_result: { procedure: { address: "0x140002000" } } },
      slice,
    ),
  ).toThrow("extracted bytes");
  expect(() => validateReaEvidence({ code: "cancelled" }, slice)).toThrow();
});

test("failed REA calls preserve provider stdout, stderr and the source manifest", async () => {
  const f = await fixture();
  const provider = join(f.directory, "rea-fixture");
  await writeFile(
    provider,
    "#!/usr/bin/env bun\nprocess.stdout.write('{\"code\":\"cancelled\"}'); process.stderr.write('provider cancelled'); process.exit(23);\n",
  );
  await chmod(provider, 0o700);
  const old = process.env["REA_CLI"];
  process.env["REA_CLI"] = provider;
  const output = join(f.directory, "analyses");
  try {
    await expectRejection(
      Effect.runPromise(
        analyzeReaFunction({ address: "140001000", target: f.manifest, directory: output }),
      ),
      "Preserved",
    );
  } finally {
    if (old === undefined) delete process.env["REA_CLI"];
    else process.env["REA_CLI"] = old;
  }
  const runs = await readdir(output);
  expect(runs).toHaveLength(1);
  const run = join(output, required(runs[0], "The REA run directory"));
  expect(await readFile(join(run, "evidence.json"), "utf8")).toBe('{"code":"cancelled"}');
  expect(await readFile(join(run, "rea.stderr"), "utf8")).toBe("provider cancelled");
  expect(JSON.parse(await readFile(join(run, "source.json"), "utf8")).target.artifact.sha256).toBe(
    f.sha256,
  );
  expect(await Bun.file(join(run, "result.json")).exists()).toBe(false);
});

test("a REA executable on PATH retains a byte-bound result and later requests reuse it", async () => {
  const f = await fixture();
  const provider = join(f.directory, "rea-fixture");
  const evidence = {
    evidence_id: "ev_fixture",
    operation: "analyze_function",
    predicate_type: "rea.analysis",
    subject: {
      digest: { sha256: createHash("sha256").update(f.bytes.subarray(0x200, 0x210)).digest("hex") },
    },
    analysis_profile: { digest: "fixture-profile" },
    normalized_result: {
      procedure: { address: "0x140001000" },
      pseudocode: "void entry(void)\n{\n  return;\n}\n",
    },
  };
  const calls = join(f.directory, "calls");
  await writeFile(
    provider,
    `#!/usr/bin/env bun\nimport { appendFileSync } from "node:fs";\nappendFileSync(${JSON.stringify(calls)}, "call\\n");\nconsole.log(${JSON.stringify(JSON.stringify(evidence))});\n`,
  );
  await chmod(provider, 0o700);
  const oldCli = process.env["REA_CLI"],
    oldPath = process.env["PATH"];
  process.env["REA_CLI"] = basename(provider);
  process.env["PATH"] = `${f.directory}:${oldPath ?? ""}`;
  const output = join(f.directory, "analyses");
  try {
    const first = await Effect.runPromise(
      analyzeReaFunction({ address: "140001000", target: f.manifest, directory: output }),
    );
    const second = await Effect.runPromise(
      analyzeReaFunction({
        address: "140001000",
        target: f.manifest,
        directory: output,
        fresh: true,
      }),
    );
    expect(first.directory).not.toBe(second.directory);
    // An address inside the same function reuses a stored run instead of calling REA again.
    const reused = await Effect.runPromise(
      analyzeReaFunction({ address: "0x140001008", target: f.manifest, directory: output }),
    );
    expect(reused.reused).toBe(true);
    expect([first.directory, second.directory]).toContain(reused.directory);
    expect((await readFile(calls, "utf8")).split("\n").filter(Boolean)).toHaveLength(2);
    // A caller-supplied range makes no function-boundary claim, so it never reuses a function span.
    const manual = await Effect.runPromise(
      analyzeReaFunction({
        address: "140001000",
        end: "140001008",
        target: f.manifest,
        directory: output,
      }).pipe(Effect.result),
    );
    expect(manual._tag === "Success" && manual.success.reused).not.toBe(true);
    const result = JSON.parse(await readFile(first.result, "utf8"));
    expect(result.id).toBe("ev_fixture");
    expect(result.profile).toBe("fixture-profile");
    expect(result.slice.sourceSha256).toBe(f.sha256);
    expect(JSON.parse(await readFile(result.evidence, "utf8"))).toEqual(evidence);
    expect(result.pseudocode).toBe(first.pseudocode);
    const pseudocode = await readFile(
      required(first.pseudocode ?? undefined, "The pseudocode path"),
      "utf8",
    );
    expect(pseudocode).toStartWith("/* REA Evidence ev_fixture\n   0x140001000-0x140001010 of ");
    expect(pseudocode).toEndWith(`*/\n\n${evidence.normalized_result.pseudocode}`);
    expect((await readFile(join(second.directory, "function.bin"))).toString("hex")).toBe(
      f.bytes.subarray(0x200, 0x210).toString("hex"),
    );
  } finally {
    if (oldCli === undefined) delete process.env["REA_CLI"];
    else process.env["REA_CLI"] = oldCli;
    if (oldPath === undefined) delete process.env["PATH"];
    else process.env["PATH"] = oldPath;
  }
});

test("analysis refuses to decompile a non-AMD64 slice as x86_64", async () => {
  const bytes = image();
  bytes.writeUInt16LE(0xaa64, 0x84);
  const f = await fixture(bytes);
  const provider = join(f.directory, "rea-fixture");
  const called = join(f.directory, "called");
  await writeFile(
    provider,
    `#!/usr/bin/env bun\nawait Bun.write(${JSON.stringify(called)}, "");\nconsole.log("{}");\n`,
  );
  await chmod(provider, 0o700);
  const old = process.env["REA_CLI"];
  process.env["REA_CLI"] = provider;
  try {
    await expectRejection(
      Effect.runPromise(
        analyzeReaFunction({
          address: "140001000",
          end: "140001010",
          target: f.manifest,
          directory: join(f.directory, "analyses"),
        }),
      ),
      "AMD64",
    );
  } finally {
    if (old === undefined) delete process.env["REA_CLI"];
    else process.env["REA_CLI"] = old;
  }
  expect(await Bun.file(called).exists()).toBe(false);
});

test("PistonDecompiler paths and aliases are rejected before reading artifact contents", async () => {
  const f = await fixture();
  await expectRejection(
    independentPath(join(f.directory, "PistonDecompiler", "missing.exe")),
    "not permitted",
  );
  const forbidden = join(f.directory, "PistonDecompiler.exe");
  await writeFile(forbidden, f.bytes);
  const alias = join(f.directory, "alias.exe");
  await symlink(forbidden, alias);
  await expectRejection(independentPath(alias), "not permitted");
});

test("process captures retain failed or timed-out exits and require owned cleanup", () => {
  const capture = {
    evidence_id: "ev_capture",
    operation: "capture_process_scenario",
    predicate_type: "rea.process-capture",
    normalized_result: { exit: { code: 7 }, cleanup: { owned_process_group: "verified" } },
  };
  expect(validateReaCapture(capture).exitCode).toBe(7);
  expect(
    validateReaCapture({
      ...capture,
      normalized_result: { ...capture.normalized_result, exit: { code: null } },
    }).exitCode,
  ).toBeNull();
  expect(() =>
    validateReaCapture({
      ...capture,
      normalized_result: { ...capture.normalized_result, cleanup: {} },
    }),
  ).toThrow("owned cleanup");
  expect(() => validateReaCapture({ code: "cancelled" })).toThrow("complete process capture");
});

// This starts the REA CLI twice as separate Bun processes. Each loads Effect and runs a provider.
test("a signaled control fails the CLI and retains the original capture while a normal control succeeds", async () => {
  const f = await fixture();
  await mkdir(join(root, ".stackanvil"), { recursive: true, mode: 0o700 });
  const scripts = await mkdtemp(join(root, ".stackanvil", "rea-signal-test-"));
  directories.push(scripts);
  const script = join(scripts, "control.py");
  await writeFile(script, "print('fixture control')\n");
  const provider = join(f.directory, "rea-fixture");
  for (const signal of [1, 0]) {
    const capture = {
      evidence_id: `ev_capture_signal_${signal}`,
      operation: "capture_process_scenario",
      predicate_type: "rea.process-capture",
      normalized_result: {
        exit: { code: 0, signal, reason: "exited" },
        cleanup: { owned_process_group: "verified" },
      },
    };
    await writeFile(
      provider,
      `#!/usr/bin/env bun\nconsole.log(${JSON.stringify(JSON.stringify(capture))});\n`,
    );
    await chmod(provider, 0o700);
    const child = Bun.spawn(
      [
        process.execPath,
        join(root, "src/rea.ts"),
        "control",
        "--script",
        script,
        "--target",
        f.manifest,
      ],
      {
        cwd: root,
        env: { ...process.env, REA_CLI: provider, STACKANVIL_REA_HOME: f.store },
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    const [code, stdout] = await Promise.all([
      child.exited,
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
    ]);
    const report = JSON.parse(stdout);
    directories.push(report.directory);
    expect(code).toBe(signal ? 1 : 0);
    expect(report.exitCode).toBe(signal ? null : 0);
    expect(report.signal).toBe(signal);
    const result = JSON.parse(await readFile(report.result, "utf8"));
    expect(result.id).toBe(capture.evidence_id);
    expect(result.exitCode).toBe(report.exitCode);
    expect(result.signal).toBe(signal);
    expect(JSON.parse(await readFile(result.evidence, "utf8"))).toEqual(capture);
    const source = JSON.parse(await readFile(join(report.directory, "source.json"), "utf8"));
    expect(source.scriptSha256).toBe(
      createHash("sha256")
        .update(await readFile(script))
        .digest("hex"),
    );
    expect(source.target.artifact.sha256).toBe(f.sha256);
  }
}, 60_000);
