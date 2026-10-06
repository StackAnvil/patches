import { describe, expect, test } from "bun:test";
import { inflateRawSync } from "node:zlib";
import { assetZip, readBedrockArchive } from "../scripts/bundle-bedrock-assets.ts";

function archive() {
  const bytes = Buffer.alloc(16 + 2 * 256 + 3);
  bytes.writeBigUInt64LE(0x267052a0b125277dn);
  bytes.writeUInt32LE(2, 8);
  bytes.writeUInt32LE(1, 12);
  for (const [index, name] of ["one", "nested/two"].entries()) {
    const record = 16 + index * 256;
    bytes[record] = name.length;
    bytes.write(name, record + 1);
    bytes.writeUInt32LE(3, record + 252);
  }
  bytes.set([1, 2, 3], bytes.length - 3);
  return bytes;
}

describe("native asset extraction", () => {
  test("retains shared archive payloads and checks unsigned bounds", () => {
    const bytes = archive();
    expect([...readBedrockArchive(bytes).values()].map((value) => [...value])).toEqual([[1, 2, 3], [1, 2, 3]]);
    bytes.writeUInt32LE(0xffffffff, 16 + 248);
    expect(() => readBedrockArchive(bytes)).toThrow();
  });

  test("rejects unsupported archives, duplicate names, and traversal", () => {
    const version = archive();
    version.writeUInt32LE(2, 12);
    expect(() => readBedrockArchive(version)).toThrow();
    for (const name of ["one", "../two"]) {
      const bytes = archive();
      bytes[272] = name.length;
      bytes.write(name, 273);
      expect(() => readBedrockArchive(bytes)).toThrow();
    }
  });

  test("writes reproducible ZIP data regardless of map insertion order", () => {
    const first = new Map([["b", Buffer.from([3])], ["a", Buffer.from([1, 2])]]);
    const bytes = assetZip(first);
    expect(bytes).toEqual(assetZip(new Map([...first].reverse())));
    const nameLength = bytes.readUInt16LE(26);
    const start = 30 + nameLength;
    const compressed = bytes.subarray(start, start + bytes.readUInt32LE(18));
    expect([...inflateRawSync(compressed)]).toEqual([1, 2]);
    expect(bytes.readUInt16LE(bytes.length - 14)).toBe(2);
  });
});
