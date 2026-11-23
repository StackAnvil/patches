import { crc32, inflateRawSync } from "node:zlib";

/** Bounds the memory one ordinary entry may claim, since a forged size header can request gigabytes. */
const entryLimit = 64 * 1024 * 1024;
/** A JAR nested inside a distributable, such as ViaBedrock inside the Fabric add-on, grows with its resources. */
export const nestedJarLimit = 512 * 1024 * 1024;

/**
 * Reads selected entries from ordinary ZIP/JAR archives, including entries with data descriptors.
 * Each reader takes an optional byte limit and verifies the entry's size and CRC-32.
 */
export function zipEntries(bytes: Buffer): Map<string, (limit?: number) => Buffer> {
  let end = bytes.length - 22;
  const minimum = Math.max(0, end - 0xff_ff);
  for (; end >= minimum; end--) {
    if (
      bytes.readUInt32LE(end) === 0x06_05_4b_50 &&
      end + 22 + bytes.readUInt16LE(end + 20) === bytes.length
    )
      break;
  }
  if (end < minimum || bytes.readUInt16LE(end + 4) !== 0 || bytes.readUInt16LE(end + 6) !== 0) {
    throw new Error("Unsupported ZIP directory");
  }
  const count = bytes.readUInt16LE(end + 10);
  let offset = bytes.readUInt32LE(end + 16);
  const directoryEnd = offset + bytes.readUInt32LE(end + 12);
  if (count === 0xff_ff || count !== bytes.readUInt16LE(end + 8) || directoryEnd !== end) {
    throw new Error("Invalid ZIP directory bounds");
  }
  const entries = new Map<string, (limit?: number) => Buffer>();
  for (let index = 0; index < count; index++) {
    if (offset + 46 > directoryEnd || bytes.readUInt32LE(offset) !== 0x02_01_4b_50)
      throw new Error("Invalid ZIP entry");
    const flags = bytes.readUInt16LE(offset + 8),
      method = bytes.readUInt16LE(offset + 10);
    const checksum = bytes.readUInt32LE(offset + 16),
      compressed = bytes.readUInt32LE(offset + 20),
      expanded = bytes.readUInt32LE(offset + 24);
    const nameLength = bytes.readUInt16LE(offset + 28);
    const next =
      offset + 46 + nameLength + bytes.readUInt16LE(offset + 30) + bytes.readUInt16LE(offset + 32);
    const local = bytes.readUInt32LE(offset + 42);
    if (
      next > directoryEnd ||
      flags & 1 ||
      bytes.readUInt16LE(offset + 34) !== 0 ||
      local + 30 > bytes.readUInt32LE(end + 16) ||
      bytes.readUInt32LE(local) !== 0x04_03_4b_50 ||
      ![0, 8].includes(method)
    )
      throw new Error("Unsupported ZIP entry");
    const name = new TextDecoder("utf-8", { fatal: true }).decode(
      bytes.subarray(offset + 46, offset + 46 + nameLength),
    );
    const start = local + 30 + bytes.readUInt16LE(local + 26) + bytes.readUInt16LE(local + 28);
    if (entries.has(name) || start + compressed > bytes.readUInt32LE(end + 16))
      throw new Error("Invalid ZIP entry bounds");
    entries.set(name, (limit = entryLimit) => {
      if (expanded > limit) throw new Error(`ZIP entry exceeds the size limit: ${name}`);
      const payload = bytes.subarray(start, start + compressed);
      const result =
        method === 0
          ? payload
          : inflateRawSync(payload, { maxOutputLength: Math.max(1, expanded) });
      if (result.length !== expanded) throw new Error(`ZIP entry size mismatch: ${name}`);
      if (crc32(result) !== checksum) throw new Error(`ZIP entry CRC mismatch: ${name}`);
      return result;
    });
    offset = next;
  }
  if (offset !== directoryEnd) throw new Error("Invalid ZIP directory length");
  return entries;
}
