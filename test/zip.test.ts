import { expect, test } from "bun:test";
import { assetZip } from "../scripts/bundle-bedrock-assets.ts";
import { nestedJarLimit, zipEntries } from "../src/zip.ts";

test("uses directory sizes for descriptor entries and rejects malformed directory bounds", () => {
  const payload = Buffer.from([1, 2, 3, 4]);
  const bytes = assetZip(new Map([["payload", payload]]));
  bytes.writeUInt16LE(0x808, 6);
  bytes.fill(0, 14, 26);
  expect(zipEntries(bytes).get("payload")?.()).toEqual(payload);
  const invalid = Buffer.from(bytes);
  invalid.writeUInt32LE(0xffffffff, invalid.length - 6);
  expect(() => zipEntries(invalid)).toThrow();
  for (const length of [0, 10, bytes.length - 1]) expect(() => zipEntries(bytes.subarray(0, length))).toThrow();
});

test("rejects entry bytes that do not match the central directory CRC", () => {
  const bytes = assetZip(new Map([["payload", Buffer.from("payload")]]));
  const directory = bytes.readUInt32LE(bytes.length - 6);
  bytes.writeUInt32LE(bytes.readUInt32LE(directory + 16) ^ 1, directory + 16);
  expect(() => zipEntries(bytes).get("payload")?.()).toThrow("ZIP entry CRC mismatch: payload");
});

test("reads a nested JAR larger than the ordinary entry limit only when the caller allows it", () => {
  const jar = Buffer.alloc(65 * 1024 * 1024, 7);
  const read = zipEntries(assetZip(new Map([["META-INF/jars/core.jar", jar]]))).get("META-INF/jars/core.jar")!;
  expect(() => read()).toThrow("ZIP entry exceeds the size limit");
  expect(read(nestedJarLimit).equals(jar)).toBe(true);
});
