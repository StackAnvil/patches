import { expect, test } from "bun:test";
import { assetZip } from "../scripts/bundle-bedrock-assets.ts";
import { zipEntries } from "../src/zip.ts";

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
