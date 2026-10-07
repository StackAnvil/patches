import { describe, expect, test } from "bun:test";
import { buildFormFixtureJournal, prepareFormFixture, writePrivateFixture } from "../src/replay/form-fixture.ts";
import { mkdtemp, lstat, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { Effect } from "effect";
import { journalMagic, summarizeJournal } from "../src/replay/journal.ts";

const first = "00000000-0000-0000-0000-000000000001";
const second = "00000000-0000-0000-0000-000000000002";

function text(value: string): Buffer {
  const bytes = Buffer.from(value);
  return Buffer.concat([Buffer.from([bytes.length]), bytes]);
}

function journal(spawnAt = 9, encrypted = false): Buffer {
  const header = Buffer.alloc(8);
  header.writeUInt32BE(journalMagic);
  header.writeUInt32BE(2193, 4);
  const uuid = Buffer.alloc(16);
  uuid.writeBigUInt64LE(1n, 8);
  const info = Buffer.concat([
    Buffer.from([6]), Buffer.alloc(20), text(""), Buffer.from([1]), uuid,
    text("1.0.0"), Buffer.alloc(8), text(encrypted ? "private-key" : ""),
    text(encrypted ? "subpack" : ""), text(encrypted ? "content-id" : ""),
    Buffer.from([1, 0, 1]), text(encrypted ? "https://example.invalid/archive" : ""),
  ]);
  const stack = Buffer.concat([
    Buffer.from([7, 0, 1]), text(first), text("1.0.0"), text(""),
    text("1.26.51"), Buffer.alloc(6),
  ]);
  const packets = [
    { seconds: 0, payload: info },
    { seconds: 1, payload: stack },
    { seconds: 8, payload: Buffer.from([11, 42]) },
    { seconds: spawnAt, payload: Buffer.from([2, 0, 0, 0, 3]) },
    { seconds: 40, payload: Buffer.from([19, 42]) },
  ];
  return Buffer.concat([header, ...packets.flatMap(packet => {
    const fields = Buffer.alloc(13);
    fields[0] = 1;
    fields.writeBigInt64BE(BigInt(packet.seconds) * 1_000_000_000n, 1);
    fields.writeUInt32BE(packet.payload.length, 9);
    return [fields, packet.payload];
  })]);
}

function entries(bytes: Buffer) {
  const rows: { nanos: bigint; payload: Buffer }[] = [];
  let offset = 8;
  while (offset < bytes.length) {
    const nanos = bytes.readBigInt64BE(offset + 1);
    const length = bytes.readInt32BE(offset + 9);
    offset += 13;
    rows.push({ nanos, payload: bytes.subarray(offset, offset + length) });
    offset += length;
  }
  return rows;
}

const forms = [
  { id: 0, json: JSON.stringify({ type: "form", elements: [{ type: "label", text: "Heading" }, { type: "button", text: "Choice" }] }) },
  { id: 3, json: JSON.stringify({ type: "custom_form", content: [{ type: "label", text: "Heading" }, { type: "toggle", default: true }] }) },
];

describe("controlled captured-form replay fixtures", () => {
  test("keeps bootstrap bytes and form state/order intact with bounded scheduled requests", () => {
    const source = journal();
    const built = buildFormFixtureJournal(source, forms, [], 30, 15);
    const originalRows = entries(source).filter(entry => entry.nanos <= 30_000_000_000n);
    const rows = entries(built);
    expect(rows.slice(0, originalRows.length)).toEqual(originalRows);
    expect(rows.slice(originalRows.length).map(e => e.nanos)).toEqual([35_000_000_000n, 50_000_000_000n]);
    for (let i = 0; i < forms.length; i++) {
      const packet = rows[originalRows.length + i]!.payload;
      expect(packet[0]).toBe(100);
      expect(packet[1]).toBe(forms[i]!.id);
      expect(JSON.parse(packet.subarray(3).toString())).toEqual(JSON.parse(forms[i]!.json));
    }
    expect(summarizeJournal(built)).toMatchObject({ reachedStartGame: true, reachedSpawn: true, ids: { 100: 2 } });
    expect(summarizeJournal(source).ids[100]).toBeUndefined();
  });
  test("replaces matching UUIDs in info and ordered stack without changing version or world state", () => {
    const source = journal();
    const built = buildFormFixtureJournal(source, forms, [{ from: `${first}_1.0.0.mcpack`, to: `${second}_1.0.0.mcpack`, bytes: 1234, decrypted: true }], 30, 15);
    const rows = entries(built);
    const original = entries(source);
    const uuidOffset = 1 + 20 + 1 + 1;
    expect(rows[0]!.payload.readBigUInt64LE(uuidOffset + 8)).toBe(2n);
    expect(rows[1]!.payload.subarray(4, 40).toString()).toBe(second);
    expect(rows[0]!.payload.readBigUInt64LE(uuidOffset + 16 + 6)).toBe(1234n);
    expect(rows[0]!.payload.subarray(uuidOffset + 16 + 6 + 8)).toEqual(original[0]!.payload.subarray(uuidOffset + 16 + 6 + 8));
    expect(rows[2]).toEqual(original[2]);
    expect(rows[3]).toEqual(original[3]);
    expect(() => buildFormFixtureJournal(source, forms, [{ from: `${first}_1.0.0.mcpack`, to: `${second}_1.0.1.mcpack`, bytes: 1234, decrypted: true }], 30, 15)).toThrow();
    expect(() => buildFormFixtureJournal(source, forms, [{ from: `${second}_1.0.0.mcpack`, to: `${first}_1.0.0.mcpack`, bytes: 1234, decrypted: true }], 30, 15)).toThrow();
  });
  test("rejects incomplete bootstrap, foreign protocol, duplicate form IDs and unsafe timeline", () => {
    expect(() => buildFormFixtureJournal(journal(35), forms, [], 30, 15)).toThrow();
    const wrong = journal();
    wrong.writeUInt32BE(2216, 4);
    expect(() => buildFormFixtureJournal(wrong, forms, [], 30, 15)).toThrow();
    expect(() => buildFormFixtureJournal(journal(), [forms[0]!, forms[0]!], [], 30, 15)).toThrow();
    expect(() => buildFormFixtureJournal(journal(), forms, [], 30, 0)).toThrow();
    expect(() => buildFormFixtureJournal(journal(), [{ id: -1, json: forms[0]!.json }], [], 30, 15)).toThrow();
  });
  test("preserves encrypted metadata unless a declared decrypted export replaces it", () => {
    const source = journal(9, true);
    const unchanged = buildFormFixtureJournal(source, forms, [], 30, 15);
    expect(entries(unchanged)[0]).toEqual(entries(source)[0]);
    const replacement = { from: `${first}_1.0.0.mcpack`, to: `${second}_1.0.0.mcpack`, bytes: 4567, decrypted: true as const };
    const info = entries(buildFormFixtureJournal(source, forms, [replacement], 30, 15))[0]!.payload;
    const sizeOffset = 1 + 20 + 1 + 1 + 16 + 6;
    expect(info.readBigUInt64LE(sizeOffset)).toBe(4567n);
    expect(info.subarray(sizeOffset + 8)).toEqual(Buffer.from([0, 0, 0, 1, 0, 1, 0]));
    expect(() => buildFormFixtureJournal(source, forms, [{ ...replacement, decrypted: false } as unknown as typeof replacement], 30, 15)).toThrow();
  });
  test("rolls back only a newly owned failed fixture and allows a clean retry", async () => {
    const root = await mkdtemp(join(tmpdir(), "stackanvil-form-fixture-"));
    const output = join(root, "fixture");
    const baseline = join(root, "source");
    await writeFile(baseline, "unchanged");
    const files = [{ name: "packets.sbr", bytes: journal() }, { name: "fixture.json", bytes: Buffer.from("{}") }];
    try {
      await expect(writePrivateFixture(output, root, files, async () => {
        await expect(lstat(join(output, "fixture.json"))).rejects.toThrow();
        throw new Error("Input checksum changed");
      })).rejects.toThrow("Input checksum changed");
      await expect(lstat(output)).rejects.toThrow();
      expect(await readFile(baseline, "utf8")).toBe("unchanged");
      await writePrivateFixture(output, root, files, async () => {});
      expect([...await readFile(join(output, "packets.sbr"))]).toEqual([...journal()]);
      expect((await lstat(join(output, "packets.sbr"))).mode & 0o777).toBe(0o600);
      expect((await lstat(output)).mode & 0o777).toBe(0o700);
      await expect(writePrivateFixture(output, root, files, async () => {})).rejects.toThrow();
      expect([...await readFile(join(output, "packets.sbr"))]).toEqual([...journal()]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
  test("rejects symlink outputs, escaping filenames and duplicate files without touching existing data", async () => {
    const root = await mkdtemp(join(tmpdir(), "stackanvil-form-fixture-"));
    const existing = join(root, "existing");
    const output = join(root, "fixture");
    await mkdir(existing);
    await writeFile(join(existing, "keep"), "retained");
    await symlink(existing, output);
    try {
      await expect(writePrivateFixture(output, root, [{ name: "packets.sbr", bytes: journal() }], async () => {})).rejects.toThrow();
      await expect(writePrivateFixture(join(root, "fresh"), root, [{ name: "../escape", bytes: journal() }], async () => {})).rejects.toThrow();
      const repeated = { name: "packets.sbr", bytes: journal() };
      await expect(writePrivateFixture(join(root, "fresh"), root, [repeated, repeated], async () => {})).rejects.toThrow();
      expect(await readFile(join(existing, "keep"), "utf8")).toBe("retained");
      await expect(lstat(join(root, "fresh"))).rejects.toThrow();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
  test("binds creation to a reviewed preview and refuses changed captured input", async () => {
    const root = await mkdtemp(join(tmpdir(), "stackanvil-form-fixture-"));
    const source = join(root, "source");
    const packs = join(source, "packs");
    const output = join(root, "created");
    const formPath = join(root, "form.json");
    const planPath = join(root, "plan.json");
    const checksum = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
    await mkdir(packs, { recursive: true });
    await writeFile(join(source, "packets.sbr"), journal());
    await writeFile(formPath, forms[0]!.json);
    const manifest = { header: { uuid: first, version: [1, 0, 0] } };
    await writeFile(join(root, "manifest.json"), JSON.stringify(manifest));
    const zip = Bun.spawn(["zip", "-q", join(packs, `${first}_1.0.0.mcpack`), "manifest.json"], { cwd: root });
    expect(await zip.exited).toBe(0);
    const plan = {
      source, sourceSha256: checksum(journal()), output, bootstrapSeconds: 30, intervalSeconds: 15,
      forms: [{ id: 0, source: formPath, sha256: checksum(Buffer.from(forms[0]!.json)) }], packs: [],
    };
    await writeFile(planPath, JSON.stringify(plan));
    try {
      const preview = await Effect.runPromise(prepareFormFixture(planPath, root));
      await expect(lstat(output)).rejects.toThrow();
      await expect(Effect.runPromise(prepareFormFixture(planPath, root, "0".repeat(64)))).rejects.toThrow();
      await expect(lstat(output)).rejects.toThrow();
      await writeFile(formPath, forms[1]!.json);
      await expect(Effect.runPromise(prepareFormFixture(planPath, root, preview.previewSha256))).rejects.toThrow();
      await expect(lstat(output)).rejects.toThrow();
      await writeFile(formPath, forms[0]!.json);
      const applied = await Effect.runPromise(prepareFormFixture(planPath, root, preview.previewSha256));
      expect(applied.journalSha256).toBe(preview.journalSha256);
      expect(summarizeJournal(await readFile(join(output, "packets.sbr"))).ids[100]).toBe(1);
      const metadata = JSON.parse(await readFile(join(output, "fixture.json"), "utf8"));
      expect(metadata.previewSha256).toBe(preview.previewSha256);
      expect(metadata.liveHostConnections).toBe(false);
      await writeFile(planPath, JSON.stringify({ ...plan, forms: "not-an-array" }));
      await expect(Effect.runPromise(prepareFormFixture(planPath, root))).rejects.toThrow();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
