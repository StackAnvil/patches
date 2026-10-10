import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, mkdir, open, rm, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { promisify } from "node:util";
import { Effect } from "effect";
import { journalMagic, maxJournalBytes, summarizeJournal } from "./journal.ts";
import { directChild, realDirectory } from "./private-path.ts";

const execute = promisify(execFile);
const protocol = 2193;
const maxFormBytes = 1024 * 1024;
const maxPackBytes = 64 * 1024 * 1024;
const packName = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})_([0-9]+(?:\.[0-9]+)*)\.mcpack$/i;
const sha = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");

interface Entry {
  direction: number;
  nanos: bigint;
  payload: Buffer;
}
export interface FormFixtureRequest {
  id: number;
  json: string;
}
export interface PackReplacement {
  from: string;
  to: string;
  bytes: number;
  decrypted: true;
}
interface InputFile {
  source: string;
  sha256: string;
  bytes: number;
}
interface FixtureFile {
  name: string;
  bytes: Buffer;
}
export interface FormFixturePlan {
  source: string;
  sourceSha256: string;
  output: string;
  bootstrapSeconds: number;
  intervalSeconds: number;
  forms: { id: number; source: string; sha256: string }[];
  packs: { from: string; source: string; sha256: string; decrypted: true; uiFiles?: number }[];
}

function uint(value: number): Buffer {
  if (!Number.isInteger(value) || value < 0 || value > 0xffffffff) {
    throw new Error("Invalid unsigned integer.");
  }
  const result: number[] = [];
  do {
    result.push((value & 127) | (value > 127 ? 128 : 0));
    value >>>= 7;
  } while (value);
  return Buffer.from(result);
}
function text(value: string): Buffer {
  const bytes = Buffer.from(value);
  return Buffer.concat([uint(bytes.length), bytes]);
}
class Reader {
  offset = 0;
  constructor(readonly bytes: Buffer) {}

  take(length: number): Buffer {
    if (!Number.isInteger(length) || length < 0 || this.offset + length > this.bytes.length) {
      throw new Error("Truncated fixture packet.");
    }
    const result = this.bytes.subarray(this.offset, this.offset + length);
    this.offset += length;
    return result;
  }
  uint(): number {
    let value = 0;
    for (let i = 0; i < 5; i++) {
      const part = this.take(1)[0]!;
      if (i === 4 && part > 15) throw new Error("Unbounded fixture integer.");
      value += (part & 127) * 2 ** (7 * i);
      if (!(part & 128)) return value;
    }
    throw new Error("Unbounded fixture integer.");
  }
  text(): string {
    return this.take(this.uint()).toString("utf8");
  }
  done(): void {
    if (this.offset !== this.bytes.length) throw new Error("Unexpected fixture packet fields.");
  }
}
function uuid(bytes: Buffer): string {
  const hex = bytes.readBigUInt64LE().toString(16).padStart(16, "0")
    + bytes.readBigUInt64LE(8).toString(16).padStart(16, "0");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
function uuidBytes(value: string): Buffer {
  const hex = value.replaceAll("-", "");
  const bytes = Buffer.alloc(16);
  bytes.writeBigUInt64LE(BigInt(`0x${hex.slice(0, 16)}`));
  bytes.writeBigUInt64LE(BigInt(`0x${hex.slice(16)}`), 8);
  return bytes;
}
function identity(name: string): { id: string; version: string } {
  const match = packName.exec(name);
  if (!match) throw new Error("Invalid fixture pack identity.");
  return { id: match[1]!.toLowerCase(), version: match[2]! };
}

/** Protocol 2193 ResourcePackPackets/UuidType fields; no digest field exists in packet 6. */
function rewritePacks(payload: Buffer, replacements: Map<string, PackReplacement>, found: Set<string>): Buffer {
  const input = new Reader(payload);
  const id = input.uint();
  if (id !== 6 && id !== 7) return payload;
  const output: Buffer[] = [uint(id), input.take(id === 6 ? 20 : 1)];
  if (id === 6) output.push(text(input.text()));
  const count = input.uint();
  if (count > 1024) throw new Error("Unbounded fixture packs.");
  output.push(uint(count));
  const targetIds = new Set<string>();
  for (let i = 0; i < count; i++) {
    const oldId = id === 6 ? uuid(input.take(16)) : input.text();
    const version = input.text();
    const name = `${oldId}_${version}.mcpack`;
    const replacement = replacements.get(name);
    if (replacement) found.add(`${id}:${name}`);
    const current = replacement ? identity(replacement.to) : { id: oldId, version };
    const targetName = `${current.id}_${current.version}`;
    if (targetIds.has(targetName)) throw new Error("Colliding advertised fixture packs.");
    targetIds.add(targetName);
    output.push(id === 6 ? uuidBytes(current.id) : text(current.id), text(current.version));
    if (id === 6) {
      const size = input.take(8);
      const key = input.take(input.uint());
      const subpack = input.text();
      const contentId = input.text();
      const flags = input.take(3);
      const cdn = input.text();
      if (replacement) {
        // Explicitly supplied decrypted exports use their actual archive length.
        // ReplayServer later supplies the owned loopback CDN; no original key is exposed.
        const actualSize = Buffer.alloc(8);
        actualSize.writeBigUInt64LE(BigInt(replacement.bytes));
        output.push(actualSize, uint(0), text(""), text(""), flags, text(""));
      } else {
        output.push(size, uint(key.length), key, text(subpack), text(contentId), flags, text(cdn));
      }
    } else {
      output.push(text(input.text()));
    }
  }
  if (id === 7) output.push(input.take(input.bytes.length - input.offset));
  input.done();
  return Buffer.concat(output);
}

/** Controlled synthetic mixed provenance: recorded bootstrap plus captured forms and accepted pack exports. */
export function buildFormFixtureJournal(bytes: Buffer, forms: FormFixtureRequest[], packs: PackReplacement[], bootstrapSeconds: number, intervalSeconds: number): Buffer {
  const original = summarizeJournal(bytes);
  if (original.protocol !== protocol || !original.reachedStartGame || !original.reachedSpawn) {
    throw new Error("Fixture requires a playable protocol-2193 bootstrap.");
  }
  if (!Number.isInteger(bootstrapSeconds) || bootstrapSeconds < 10 || bootstrapSeconds > 120
      || !Number.isInteger(intervalSeconds) || intervalSeconds < 10 || intervalSeconds > 60
      || forms.length < 1 || forms.length > 16 || packs.length > 64) {
    throw new Error("Invalid fixture timeline bounds.");
  }
  const replacements = new Map<string, PackReplacement>();
  for (const pack of packs) {
    const from = identity(pack.from);
    const to = identity(pack.to);
    if (from.version !== to.version || replacements.has(pack.from)
        || pack.decrypted !== true || !Number.isInteger(pack.bytes) || pack.bytes < 1 || pack.bytes > maxPackBytes) {
      throw new Error("Invalid decrypted fixture pack replacement.");
    }
    replacements.set(pack.from, pack);
  }
  const found = new Set<string>();
  const entries: Entry[] = [];
  const cutoff = BigInt(bootstrapSeconds) * 1_000_000_000n;
  let offset = 8;
  while (offset < bytes.length) {
    const direction = bytes[offset]!;
    const nanos = bytes.readBigInt64BE(offset + 1);
    const length = bytes.readInt32BE(offset + 9);
    offset += 13;
    const payload = bytes.subarray(offset, offset + length);
    offset += length;
    if (nanos > cutoff) continue;
    const id = new Reader(payload).uint();
    if (id === 100 || id === 101) throw new Error("Bootstrap already contains a form exchange.");
    entries.push({ direction, nanos, payload: direction ? rewritePacks(payload, replacements, found) : payload });
  }
  for (const name of replacements.keys()) {
    if (!found.has(`6:${name}`) || !found.has(`7:${name}`)) {
      throw new Error("Replacement is not present in both recorded pack lists.");
    }
  }
  const ids = new Set<number>();
  forms.forEach((form, index) => {
    if (ids.has(form.id)) throw new Error("Duplicate fixture form ID.");
    ids.add(form.id);
    const data = Buffer.from(form.json);
    if (data.length > maxFormBytes) throw new Error("Captured form exceeds its size bound.");
    const value = JSON.parse(form.json);
    if (!value || !["form", "custom_form", "modal"].includes(value.type)) throw new Error("Unsupported captured form.");
    entries.push({
      direction: 1,
      nanos: cutoff + BigInt(5 + index * intervalSeconds) * 1_000_000_000n,
      payload: Buffer.concat([uint(100), uint(form.id), text(form.json)]),
    });
  });
  const header = Buffer.alloc(8);
  header.writeUInt32BE(journalMagic);
  header.writeUInt32BE(protocol, 4);
  const output = Buffer.concat([header, ...entries.flatMap(entry => {
    const fields = Buffer.alloc(13);
    fields[0] = entry.direction;
    fields.writeBigInt64BE(entry.nanos, 1);
    fields.writeInt32BE(entry.payload.length, 9);
    return [fields, entry.payload];
  })]);
  const summary = summarizeJournal(output);
  if (!summary.reachedStartGame || !summary.reachedSpawn || summary.ids[100] !== forms.length) {
    throw new Error("Truncated bootstrap or missing forms.");
  }
  return output;
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid fixture plan object.");
  return value as Record<string, unknown>;
}
function path(value: unknown): string {
  if (typeof value !== "string" || value.length > 4096 || resolve(value) !== value) throw new Error("Fixture input paths must be absolute.");
  return value;
}
function digest(value: unknown): string {
  if (typeof value !== "string" || !/^[0-9a-f]{64}$/.test(value)) throw new Error("Invalid fixture input digest.");
  return value;
}
function validatePlan(value: unknown): FormFixturePlan {
  const plan = object(value);
  if (!Array.isArray(plan.forms) || plan.forms.length < 1 || plan.forms.length > 16
      || !Array.isArray(plan.packs) || plan.packs.length > 64) throw new Error("Invalid fixture input counts.");
  if (!Number.isInteger(plan.bootstrapSeconds) || Number(plan.bootstrapSeconds) < 10 || Number(plan.bootstrapSeconds) > 120
      || !Number.isInteger(plan.intervalSeconds) || Number(plan.intervalSeconds) < 10 || Number(plan.intervalSeconds) > 60) {
    throw new Error("Invalid fixture timeline bounds.");
  }
  return {
    source: path(plan.source), sourceSha256: digest(plan.sourceSha256), output: path(plan.output),
    bootstrapSeconds: Number(plan.bootstrapSeconds), intervalSeconds: Number(plan.intervalSeconds),
    forms: plan.forms.map(value => {
      const form = object(value);
      if (!Number.isInteger(form.id) || Number(form.id) < 0 || Number(form.id) > 0xffffffff) throw new Error("Invalid fixture form ID.");
      return { id: Number(form.id), source: path(form.source), sha256: digest(form.sha256) };
    }),
    packs: plan.packs.map(value => {
      const pack = object(value);
      if (typeof pack.from !== "string") throw new Error("Invalid source pack identity.");
      identity(pack.from);
      if (pack.decrypted !== true) throw new Error("Fixture replacements require explicit decrypted-export provenance.");
      if (pack.uiFiles !== undefined && (!Number.isInteger(pack.uiFiles) || Number(pack.uiFiles) < 0 || Number(pack.uiFiles) > 8192)) {
        throw new Error("Invalid fixture UI file count.");
      }
      return { from: pack.from, source: path(pack.source), sha256: digest(pack.sha256), decrypted: true,
        ...(pack.uiFiles === undefined ? {} : { uiFiles: Number(pack.uiFiles) }) };
    }),
  };
}
async function boundedFile(source: string, limit: number): Promise<Buffer> {
  const file = await open(source, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const state = await file.stat();
    if (!state.isFile() || state.size > limit) {
      throw new Error("Fixture input is not a bounded regular file.");
    }
    const data = Buffer.alloc(state.size);
    let offset = 0;
    while (offset < data.length) {
      const { bytesRead } = await file.read(data, offset, data.length - offset, offset);
      if (!bytesRead) throw new Error("Fixture input changed while reading.");
      offset += bytesRead;
    }
    const after = await file.stat();
    if (after.size !== state.size || after.mtimeMs !== state.mtimeMs || after.ctimeMs !== state.ctimeMs) {
      throw new Error("Fixture input changed while reading.");
    }
    return data;
  } finally {
    await file.close();
  }
}
async function freshOutput(output: string, privateRoot: string): Promise<string> {
  privateRoot = await realDirectory(privateRoot);
  if (basename(output).startsWith(".")) {
    throw new Error("Fixture output must be a fresh direct child of the owned private replay directory.");
  }
  output = await directChild(privateRoot, output);
  try {
    await lstat(output);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return output;
    throw error;
  }
  throw new Error("Fixture output already exists.");
}

/** Exclusive creation and scoped rollback: existing outputs are never modified or removed. */
export async function writePrivateFixture(output: string, privateRoot: string, files: FixtureFile[], verifyInputs: () => Promise<void>): Promise<void> {
  const names = new Set<string>();
  for (const file of files) {
    if (!/^(?:packets\.sbr|fixture\.json|packs\/[0-9a-f-]+_[0-9.]+\.mcpack)$/i.test(file.name) || names.has(file.name)) {
      throw new Error("Invalid or duplicate fixture output name.");
    }
    names.add(file.name);
  }
  output = await freshOutput(output, privateRoot);
  await mkdir(output, { mode: 0o700 });
  const owner = await lstat(output);
  try {
    await mkdir(join(output, "packs"), { mode: 0o700 });
    for (const file of files.filter(file => file.name !== "fixture.json")) {
      await writeFile(join(output, file.name), file.bytes, { flag: "wx", mode: 0o600 });
    }
    await verifyInputs();
    const metadata = files.find(file => file.name === "fixture.json");
    if (metadata) await writeFile(join(output, metadata.name), metadata.bytes, { flag: "wx", mode: 0o600 });
  } catch (error) {
    const current = await lstat(output);
    if (current.isSymbolicLink() || current.dev !== owner.dev || current.ino !== owner.ino) {
      throw new Error("Fixture creation failed and output ownership changed; rollback refused.", { cause: error });
    }
    await rm(output, { recursive: true });
    throw error;
  }
}

export const prepareFormFixture = (planPath: string, privateRoot: string, reviewedPreview?: string) => Effect.tryPromise({
  try: async () => {
    const planBytes = await boundedFile(planPath, 65536);
    const plan = validatePlan(JSON.parse(planBytes.toString("utf8")));
    const base = resolve(privateRoot);
    plan.output = await freshOutput(plan.output, base);
    const inputs: InputFile[] = [{ source: planPath, sha256: sha(planBytes), bytes: planBytes.length }];
    const checked = async (source: string, limit: number, expected?: string) => {
      const data = await boundedFile(source, limit);
      const hash = sha(data);
      if (expected !== undefined && hash !== expected) throw new Error("Fixture input checksum changed.");
      inputs.push({ source, sha256: hash, bytes: data.length });
      return data;
    };
    const bootstrap = await checked(join(plan.source, "packets.sbr"), maxJournalBytes, plan.sourceSha256);
    const forms = await Promise.all(plan.forms.map(async form => ({
      id: form.id, json: (await checked(form.source, maxFormBytes, form.sha256)).toString("utf8"),
    })));
    const overrides = new Map(plan.packs.map(pack => [pack.from, pack]));
    if (overrides.size !== plan.packs.length) throw new Error("Duplicate fixture pack replacement.");
    const copied: (FixtureFile & { source: string; uiFiles: number })[] = [];
    const files = [...new Bun.Glob("*.mcpack").scanSync(join(plan.source, "packs"))].sort();
    if (files.length > 64) throw new Error("Unbounded fixture packs.");
    for (const name of files) {
      identity(name);
      const replacement = overrides.get(name);
      const source = replacement?.source ?? join(plan.source, "packs", name);
      const bytes = await checked(source, maxPackBytes, replacement?.sha256);
      const targetName = replacement ? basename(source) : name;
      const expected = identity(targetName);
      const { stdout: manifest } = await execute("unzip", ["-p", source, "manifest.json"], { maxBuffer: 65536 });
      const header = object(object(JSON.parse(manifest)).header);
      const version = Array.isArray(header.version) ? header.version.join(".") : header.version;
      if (typeof header.uuid !== "string" || header.uuid.toLowerCase() !== expected.id || version !== expected.version) {
        throw new Error("Fixture archive identity differs from its advertised pack.");
      }
      const { stdout: listing } = await execute("unzip", ["-Z1", source], { maxBuffer: 1024 * 1024 });
      const archivePaths = listing.trimEnd().split("\n");
      if (archivePaths.length > 8192 || archivePaths.some(name => name.startsWith("/") || name.split("/").includes(".."))) {
        throw new Error("Unsafe fixture archive paths.");
      }
      const uiFiles = archivePaths.filter(name => name.startsWith("ui/") && name.endsWith(".json")).length;
      if (replacement?.uiFiles !== undefined && replacement.uiFiles !== uiFiles) throw new Error("Fixture UI definition count changed.");
      copied.push({ name: targetName, bytes, source, uiFiles });
    }
    if (plan.packs.some(pack => !files.includes(pack.from)) || new Set(copied.map(pack => pack.name)).size !== copied.length) {
      throw new Error("Missing or colliding fixture pack.");
    }
    const replacements = plan.packs.map(pack => ({
      from: pack.from, to: basename(pack.source), bytes: copied.find(copy => copy.source === pack.source)!.bytes.length, decrypted: true as const,
    }));
    const journal = buildFormFixtureJournal(bootstrap, forms, replacements, plan.bootstrapSeconds, plan.intervalSeconds);
    inputs.sort((a, b) => a.source.localeCompare(b.source));
    const fixtureFiles = [{ name: "packets.sbr", bytes: journal }, ...copied.map(pack => ({ name: `packs/${pack.name}`, bytes: pack.bytes }))];
    const preview = {
      kind: "controlled-synthetic-mixed-provenance-form-fixture", protocol, output: plan.output,
      sourceSha256: sha(bootstrap), journalSha256: sha(journal), forms: plan.forms,
      packs: copied.map(pack => ({ name: pack.name, source: pack.source, sha256: sha(pack.bytes), bytes: pack.bytes.length, uiFiles: pack.uiFiles })),
      inputs, summary: summarizeJournal(journal),
      changes: ["recorded bootstrap cutoff", "declared decrypted pack identity/size replacements", "captured form requests added"],
      actions: [
        { createDirectory: plan.output, mode: "0700" },
        { createDirectory: join(plan.output, "packs"), mode: "0700" },
        ...fixtureFiles.map(file => ({ create: join(plan.output, file.name), sha256: sha(file.bytes), bytes: file.bytes.length, mode: "0600" })),
        { create: join(plan.output, "fixture.json"), content: "this reviewed preview and its checksum", mode: "0600", publishAfterInputVerification: true },
      ],
      liveHostConnections: false, packDelivery: "ReplayServer-owned loopback HTTP only; original CDN and keys not used",
    };
    const previewSha256 = sha(Buffer.from(JSON.stringify(preview)));
    if (reviewedPreview !== undefined) {
      if (reviewedPreview !== previewSha256) throw new Error("Reviewed fixture preview changed.");
      const metadata = Buffer.from(JSON.stringify({ ...preview, previewSha256 }, null, 2));
      await writePrivateFixture(plan.output, base, [...fixtureFiles, { name: "fixture.json", bytes: metadata }], async () => {
        for (const input of inputs) {
          const actual = await boundedFile(input.source, input.bytes);
          if (actual.length !== input.bytes || sha(actual) !== input.sha256) throw new Error("Fixture input changed during creation.");
        }
      });
    }
    return { ...preview, previewSha256 };
  },
  catch: cause => cause instanceof Error ? cause : new Error(String(cause)),
});
