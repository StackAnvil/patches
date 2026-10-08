import { inflateRawSync } from "node:zlib";

/** Reads selected entries from ordinary ZIP/JAR archives, including entries with data descriptors. */
export function zipEntries(bytes: Buffer): Map<string, () => Buffer> {
  let end = bytes.length - 22;
  const minimum = Math.max(0, end - 0xffff);
  for (; end >= minimum; end--) {
    if (bytes.readUInt32LE(end) === 0x06054b50 && end + 22 + bytes.readUInt16LE(end + 20) === bytes.length) break;
  }
  if (end < minimum || bytes.readUInt16LE(end + 4) !== 0 || bytes.readUInt16LE(end + 6) !== 0) {
    throw new Error("Unsupported ZIP directory");
  }
  const count = bytes.readUInt16LE(end + 10);
  let offset = bytes.readUInt32LE(end + 16);
  const directoryEnd = offset + bytes.readUInt32LE(end + 12);
  if (count === 0xffff || count !== bytes.readUInt16LE(end + 8) || directoryEnd !== end) {
    throw new Error("Invalid ZIP directory bounds");
  }
  const entries = new Map<string, () => Buffer>();
  for (let index = 0; index < count; index++) {
    if (offset + 46 > directoryEnd || bytes.readUInt32LE(offset) !== 0x02014b50) throw new Error("Invalid ZIP entry");
    const flags = bytes.readUInt16LE(offset + 8), method = bytes.readUInt16LE(offset + 10);
    const compressed = bytes.readUInt32LE(offset + 20), expanded = bytes.readUInt32LE(offset + 24);
    const nameLength = bytes.readUInt16LE(offset + 28);
    const next = offset + 46 + nameLength + bytes.readUInt16LE(offset + 30) + bytes.readUInt16LE(offset + 32);
    const local = bytes.readUInt32LE(offset + 42);
    if (next > directoryEnd || flags & 1 || bytes.readUInt16LE(offset + 34) !== 0 || local + 30 > bytes.readUInt32LE(end + 16)
        || bytes.readUInt32LE(local) !== 0x04034b50 || ![0, 8].includes(method)) throw new Error("Unsupported ZIP entry");
    const name = new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(offset + 46, offset + 46 + nameLength));
    const start = local + 30 + bytes.readUInt16LE(local + 26) + bytes.readUInt16LE(local + 28);
    if (entries.has(name) || start + compressed > bytes.readUInt32LE(end + 16)) throw new Error("Invalid ZIP entry bounds");
    entries.set(name, () => {
      if (expanded > 64 * 1024 * 1024) throw new Error("ZIP entry exceeds the size limit");
      const payload = bytes.subarray(start, start + compressed);
      const result = method === 0 ? payload : inflateRawSync(payload, { maxOutputLength: Math.max(1, expanded) });
      if (result.length !== expanded) throw new Error("ZIP entry size mismatch");
      return result;
    });
    offset = next;
  }
  if (offset !== directoryEnd) throw new Error("Invalid ZIP directory length");
  return entries;
}
