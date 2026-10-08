import { describe, expect, test } from "bun:test";
import { journalMagic, summarizeJournal } from "../src/replay/journal.ts";

function journal(entries: { direction: number; nanos: bigint; payload: number[] }[]): Buffer {
  const header = Buffer.alloc(8);
  header.writeUInt32BE(journalMagic); header.writeUInt32BE(2193, 4);
  return Buffer.concat([header, ...entries.map((entry) => {
    const fields = Buffer.alloc(13);
    fields[0] = entry.direction;
    fields.writeBigInt64BE(entry.nanos, 1);
    fields.writeInt32BE(entry.payload.length, 9);
    return Buffer.concat([fields, Buffer.from(entry.payload)]);
  })]);
}

function packetHeader(id: number, subclients: number): number[] {
  let value = id | (subclients << 10);
  const bytes: number[] = [];
  do {
    const part = value & 127;
    value >>>= 7;
    bytes.push(part | (value ? 128 : 0));
  } while (value);
  return bytes;
}

describe("private Bedrock packet journals", () => {
  test("decodes every subclient pair without allowing authentication packets or reserved bits", () => {
    for (let subclients = 0; subclients < 16; subclients++) {
      const summary = summarizeJournal(journal([
        { direction: 1, nanos: 0n, payload: [...packetHeader(11, subclients), 0] },
        { direction: 0, nanos: 1n, payload: packetHeader(1023, subclients) },
      ]));
      expect(summary.reachedStartGame).toBe(true);
      expect(summary.serverboundIds).toEqual({ 1023: 1 });
      for (const [direction, id] of [[0, 1], [0, 4], [0, 94], [0, 193], [1, 3], [1, 143]]) {
        expect(() => summarizeJournal(journal([{ direction: direction!, nanos: 0n, payload: packetHeader(id!, subclients) }]))).toThrow();
      }
    }
    for (const payload of [[128, 128, 1], [139, 128, 128, 128, 16], [255, 255, 255, 255, 127]]) {
      expect(() => summarizeJournal(journal([{ direction: 1, nanos: 0n, payload }]))).toThrow();
    }
  });
  test("distinguishes login, world initialization, and playable spawn without payload output", () => {
    const bytes = journal([
      { direction: 1, nanos: 0n, payload: [2, 0, 0, 0, 0] },
      { direction: 1, nanos: 1n, payload: [11, 91, 13] },
      { direction: 0, nanos: 2n, payload: [8, 4, 0] },
      { direction: 1, nanos: 2_000_000_000n, payload: [2, 0, 0, 0, 3] },
      { direction: 1, nanos: 2_000_000_001n, payload: [172, 2, 99] },
    ]);
    const summary = summarizeJournal(bytes);
    expect(summary).toMatchObject({ protocol: 2193, clientbound: 4, serverbound: 1, elapsedSeconds: 2.000000001, ids: { 2: 2, 11: 1, 300: 1 }, reachedStartGame: true, reachedSpawn: true });
    expect(summarizeJournal(journal([{ direction: 1, nanos: 0n, payload: [2, 0, 0, 0, 0] }])).reachedSpawn).toBe(false);
  });
  test("compares scene payloads independently of handshake timing and local pack URLs", () => {
    const original = summarizeJournal(journal([{ direction: 1, nanos: 0n, payload: [6, 99] }, { direction: 1, nanos: 5n, payload: [11, 1, 2] }]));
    const replay = summarizeJournal(journal([{ direction: 1, nanos: 1n, payload: [6, 1, 2] }, { direction: 1, nanos: 9n, payload: [11, 1, 2] }]));
    expect(replay.sceneSha256).toBe(original.sceneSha256);
    const missing = summarizeJournal(journal([{ direction: 1, nanos: 0n, payload: [11, 1] }]));
    expect(missing.sceneSha256).not.toBe(original.sceneSha256);
  });
  test("keeps native gameplay acknowledgments separate from server scene packets", () => {
    const summary = summarizeJournal(journal([
      { direction: 1, nanos: 0n, payload: [113] },
      { direction: 1, nanos: 1n, payload: [144, 1] },
      { direction: 0, nanos: 2n, payload: [113] },
      { direction: 0, nanos: 3n, payload: [144, 1] },
      { direction: 0, nanos: 4n, payload: [144, 1] },
    ]));
    expect(summary.ids).toEqual({ 113: 1, 144: 1 });
    expect(summary.serverboundIds).toEqual({ 113: 1, 144: 2 });
    const serverOnly = summarizeJournal(journal([{ direction: 1, nanos: 0n, payload: [113] }]));
    expect(serverOnly.serverboundIds).toEqual({});
  });
  test("rejects every partial entry instead of silently accepting a broken scene", () => {
    const bytes = journal([{ direction: 1, nanos: 0n, payload: [11, 1, 2, 3] }]);
    for (let length = 9; length < bytes.length; length++) expect(() => summarizeJournal(bytes.subarray(0, length))).toThrow();
  });
  test("rejects session secrets, invalid direction, and backwards timestamps", () => {
    for (const [direction, payload] of [[0, [1]], [0, [4]], [0, [94]], [0, [193, 1]], [1, [3]], [1, [143, 1]], [2, [11]]] as const) {
      expect(() => summarizeJournal(journal([{ direction, nanos: 0n, payload: [...payload] }]))).toThrow();
    }
    expect(() => summarizeJournal(journal([{ direction: 1, nanos: 3n, payload: [11] }, { direction: 0, nanos: 2n, payload: [8] }]))).toThrow();
  });
  test("rejects oversized lengths and unterminated packet IDs before parsing payloads", () => {
    const bytes = journal([{ direction: 1, nanos: 0n, payload: [11] }]);
    bytes.writeInt32BE(33 * 1024 * 1024, 17);
    expect(() => summarizeJournal(bytes)).toThrow();
    expect(() => summarizeJournal(journal([{ direction: 1, nanos: 0n, payload: [128, 128, 128, 128, 128] }]))).toThrow();
  });
});
