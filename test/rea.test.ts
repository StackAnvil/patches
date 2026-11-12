import { afterEach, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { chmod, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { Effect } from "effect";
import { analyzeReaFunction, importReaArtifact, independentPath, readReaPe, validateReaCapture, validateReaEvidence } from "../src/rea.ts";

const directories: string[] = [];
afterEach(async () => {
  for (const directory of directories.splice(0)) await rm(directory, { recursive: true, force: true });
});

function image(): Buffer {
  const b = Buffer.alloc(0x800);
  b.write("MZ"); b.writeUInt32LE(0x80, 0x3c); b.write("PE\0\0", 0x80);
  b.writeUInt16LE(0x8664, 0x84); b.writeUInt16LE(2, 0x86); b.writeUInt16LE(0xf0, 0x94);
  b.writeUInt16LE(0x20b, 0x98); b.writeBigUInt64LE(0x140000000n, 0x98 + 24);
  b.writeUInt32LE(16, 0x98 + 108);
  const section = (offset: number, name: string, rva: number, raw: number, virtualSize: number, rawSize: number) => {
    b.write(name, offset); b.writeUInt32LE(virtualSize, offset + 8); b.writeUInt32LE(rva, offset + 12);
    b.writeUInt32LE(rawSize, offset + 16); b.writeUInt32LE(raw, offset + 20);
  };
  section(0x188, ".text", 0x1000, 0x200, 0x300, 0x200);
  section(0x1b0, ".rdata", 0x2000, 0x400, 0x400, 0x400);
  b.writeUInt32LE(0x2100, 0x98 + 112 + 3 * 8); b.writeUInt32LE(12, 0x98 + 116 + 3 * 8);
  b.writeUInt32LE(0x1000, 0x500); b.writeUInt32LE(0x1010, 0x504); b.writeUInt32LE(0x2200, 0x508);
  b[0x202] = 0xe8; b.writeInt32LE(-7, 0x203);
  b[0x208] = 0xe9; b.writeInt32LE(-13, 0x209);
  b.set([0x48, 0x8d, 0x05], 0x210); b.writeInt32LE(-23, 0x213);
  b.writeBigUInt64LE(0x140001000n, 0x420);
  b.writeUInt32LE(0x2180, 0x98 + 112 + 8); b.writeUInt32LE(40, 0x98 + 116 + 8);
  b.writeUInt32LE(0x21c0, 0x580); b.writeUInt32LE(0x21e0, 0x58c); b.writeUInt32LE(0x21d0, 0x590);
  b.writeBigUInt64LE(0x21f0n, 0x5c0); b.write("api.dll\0", 0x5e0); b.write("powf\0", 0x5f2);
  return b;
}

async function fixture(bytes = image()) {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-rea-")); directories.push(directory);
  const source = join(directory, "source.exe"); await writeFile(source, bytes);
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const store = join(directory, "rea");
  const target = await Effect.runPromise(importReaArtifact({ source, sha256, version: "fixture", protocol: 2225, directory: store }));
  return { directory, source, sha256, bytes, store, target, manifest: join(store, "current.json") };
}

async function pe(manifest: string, ...args: string[]) {
  return JSON.parse(await Effect.runPromise(readReaPe(args, manifest)));
}

test("a wrong artifact pin leaves the selected target unchanged", async () => {
  const f = await fixture(); const previous = await readFile(f.manifest);
  await expect(Effect.runPromise(importReaArtifact({ source: f.source, sha256: "0".repeat(64), version: "wrong", directory: f.store }))).rejects.toThrow("SHA-256");
  expect(await readFile(f.manifest)).toEqual(previous);
  await writeFile(f.source, Buffer.from("source changed"));
  expect((await readFile(f.target.artifact.path)).toString("hex")).toBe(f.bytes.toString("hex"));
});

test("PE extraction keeps exact exception spans and never overwrites an existing slice", async () => {
  const f = await fixture(); const output = join(f.directory, "slice.bin");
  const result = await pe(f.manifest, "extract", "--va", "140001006", "--output", output);
  expect(result.procedureAddress).toBe("0x140001000"); expect(result.endExclusive).toBe("0x140001010");
  expect(result.sourceFileOffset).toBe(0x200); expect((await readFile(output)).toString("hex")).toBe(f.bytes.subarray(0x200, 0x210).toString("hex"));
  await expect(pe(f.manifest, "extract", "--va", "140001006", "--output", output)).rejects.toThrow("File exists");
  expect((await readFile(output)).toString("hex")).toBe(f.bytes.subarray(0x200, 0x210).toString("hex"));
  expect(await pe(f.manifest, "function", "--va", "140001010")).toBeNull();
  await expect(pe(f.manifest, "extract", "--va", "140001010", "--output", join(f.directory, "leaf.bin"))).rejects.toThrow("explicit end");
  const manual = await pe(f.manifest, "extract", "--va", "140001010", "--end", "140001017", "--output", join(f.directory, "manual.bin"));
  expect(manual.scope).toContain("no function-boundary claim");
});

test("PE reads reject unbacked tails and reads that spill into the next raw range", async () => {
  const f = await fixture();
  await expect(pe(f.manifest, "read", "--va", "1400011ff", "--length", "2")).rejects.toThrow("file-backed");
  await expect(pe(f.manifest, "read", "--va", "140001200", "--length", "1")).rejects.toThrow("file-backed");
  expect((await pe(f.manifest, "read", "--va", "1400011ff", "--length", "1")).bytes).toBe("00");
});

test("PE helpers resolve import slots and label reference patterns as tentative", async () => {
  const f = await fixture();
  expect(await pe(f.manifest, "imports", "--va", "1400021d0")).toEqual({ address: "0x1400021d0", dll: "api.dll", symbol: "powf" });
  const refs = await pe(f.manifest, "refs", "--va", "140001000");
  expect(refs.scope).toContain("not validated instructions");
  expect(refs.candidates).toContainEqual({ kind: "call-rel32", address: "0x140001002" });
  expect(refs.candidates).toContainEqual({ kind: "jump-rel32", address: "0x140001008" });
  expect(refs.candidates).toContainEqual({ kind: "possible-rip-disp32", address: "0x140001017" });
  expect(refs.candidates).toContainEqual({ kind: "absolute-u64", address: "0x140002020" });
});

test("malformed PE directories fail before a slice is written", async () => {
  const bytes = image(); bytes.writeUInt32LE(13, 0x98 + 116 + 3 * 8);
  const f = await fixture(bytes); const output = join(f.directory, "invalid.bin");
  await expect(pe(f.manifest, "extract", "--va", "140001000", "--output", output)).rejects.toThrow("exception directory length");
  expect(await Bun.file(output).exists()).toBe(false);
});

test("REA Evidence must bind to both the extracted bytes and requested procedure", () => {
  const slice = { sourceSha256: "a".repeat(64), procedureAddress: "0x140001000", endExclusive: "0x140001010", derivedPath: "/fixture", derivedSha256: "b".repeat(64), scope: "fixture" };
  const evidence = { evidence_id: "ev_fixture", subject: { digest: { sha256: slice.derivedSha256 } }, analysis_profile: { digest: "profile" },
    operation: "analyze_function", predicate_type: "rea.analysis", normalized_result: { procedure: { address: slice.procedureAddress } } };
  expect(validateReaEvidence(evidence, slice).id).toBe("ev_fixture");
  expect(() => validateReaEvidence({ ...evidence, subject: { digest: { sha256: "c".repeat(64) } } }, slice)).toThrow("extracted bytes");
  expect(() => validateReaEvidence({ ...evidence, normalized_result: { procedure: { address: "0x140002000" } } }, slice)).toThrow("extracted bytes");
  expect(() => validateReaEvidence({ code: "cancelled" }, slice)).toThrow();
});

test("failed REA calls preserve provider stdout, stderr and the source manifest", async () => {
  const f = await fixture(); const provider = join(f.directory, "rea-fixture");
  await writeFile(provider, "#!/usr/bin/env bun\nprocess.stdout.write('{\"code\":\"cancelled\"}'); process.stderr.write('provider cancelled'); process.exit(23);\n");
  await chmod(provider, 0o700); const old = process.env.REA_CLI; process.env.REA_CLI = provider;
  const output = join(f.directory, "analyses");
  try {
    await expect(Effect.runPromise(analyzeReaFunction({ address: "140001000", target: f.manifest, directory: output }))).rejects.toThrow("Preserved");
  } finally { if (old === undefined) delete process.env.REA_CLI; else process.env.REA_CLI = old; }
  const runs = await readdir(output); expect(runs).toHaveLength(1); const run = join(output, runs[0]!);
  expect(await readFile(join(run, "evidence.json"), "utf8")).toBe('{"code":"cancelled"}');
  expect(await readFile(join(run, "rea.stderr"), "utf8")).toBe("provider cancelled");
  expect(JSON.parse(await readFile(join(run, "source.json"), "utf8")).target.artifact.sha256).toBe(f.sha256);
  expect(await Bun.file(join(run, "result.json")).exists()).toBe(false);
});

test("a REA executable on PATH retains a byte-bound result without replacing earlier runs", async () => {
  const f = await fixture(); const provider = join(f.directory, "rea-fixture");
  const evidence = { evidence_id: "ev_fixture", operation: "analyze_function", predicate_type: "rea.analysis",
    subject: { digest: { sha256: createHash("sha256").update(f.bytes.subarray(0x200, 0x210)).digest("hex") } },
    analysis_profile: { digest: "fixture-profile" }, normalized_result: { procedure: { address: "0x140001000" } } };
  await writeFile(provider, `#!/usr/bin/env bun\nconsole.log(${JSON.stringify(JSON.stringify(evidence))});\n`);
  await chmod(provider, 0o700);
  const oldCli = process.env.REA_CLI, oldPath = process.env.PATH;
  process.env.REA_CLI = basename(provider); process.env.PATH = `${f.directory}:${oldPath ?? ""}`;
  const output = join(f.directory, "analyses");
  try {
    const first = await Effect.runPromise(analyzeReaFunction({ address: "140001000", target: f.manifest, directory: output }));
    const second = await Effect.runPromise(analyzeReaFunction({ address: "140001000", target: f.manifest, directory: output }));
    expect(first.directory).not.toBe(second.directory);
    const result = JSON.parse(await readFile(first.result, "utf8"));
    expect(result.id).toBe("ev_fixture"); expect(result.profile).toBe("fixture-profile");
    expect(result.slice.sourceSha256).toBe(f.sha256);
    expect(JSON.parse(await readFile(result.evidence, "utf8"))).toEqual(evidence);
    expect((await readFile(join(second.directory, "function.bin"))).toString("hex")).toBe(f.bytes.subarray(0x200, 0x210).toString("hex"));
  } finally {
    if (oldCli === undefined) delete process.env.REA_CLI; else process.env.REA_CLI = oldCli;
    if (oldPath === undefined) delete process.env.PATH; else process.env.PATH = oldPath;
  }
});

test("PistonDecompiler paths and aliases are rejected before reading artifact contents", async () => {
  const f = await fixture();
  await expect(independentPath(join(f.directory, "PistonDecompiler", "missing.exe"))).rejects.toThrow("not permitted");
  const forbidden = join(f.directory, "PistonDecompiler.exe"); await writeFile(forbidden, f.bytes);
  const alias = join(f.directory, "alias.exe"); await symlink(forbidden, alias);
  await expect(independentPath(alias)).rejects.toThrow("not permitted");
});

test("process captures retain failed or timed-out exits and require owned cleanup", () => {
  const capture = { evidence_id: "ev_capture", operation: "capture_process_scenario", predicate_type: "rea.process-capture",
    normalized_result: { exit: { code: 7 }, cleanup: { owned_process_group: "verified" } } };
  expect(validateReaCapture(capture).exitCode).toBe(7);
  expect(validateReaCapture({ ...capture, normalized_result: { ...capture.normalized_result, exit: { code: null } } }).exitCode).toBeNull();
  expect(() => validateReaCapture({ ...capture, normalized_result: { ...capture.normalized_result, cleanup: {} } })).toThrow("owned cleanup");
  expect(() => validateReaCapture({ code: "cancelled" })).toThrow("complete process capture");
});
