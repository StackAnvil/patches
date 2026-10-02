import { stat, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

export const journalMagic = 0x53425231;
export const maxJournalBytes = 512 * 1024 * 1024;
export interface PacketSummary { protocol: number; clientbound: number; serverbound: number; elapsedSeconds: number; ids: Record<number, number>; serverboundIds: Record<number, number>; reachedStartGame: boolean; reachedSpawn: boolean; sceneSha256: string }

/** Read packet boundaries without exposing player, chat, skin, or token payloads. */
export function summarizeJournal(bytes: Buffer): PacketSummary {
  if (bytes.length < 8 || bytes.length > maxJournalBytes || bytes.readUInt32BE(0) !== journalMagic) throw new Error("Invalid packet journal header.");
  const result: PacketSummary = { protocol: bytes.readUInt32BE(4), clientbound: 0, serverbound: 0, elapsedSeconds: 0, ids: {}, serverboundIds: {}, reachedStartGame: false, reachedSpawn: false, sceneSha256: "" };
  const scene = createHash("sha256");
  let offset = 8;
  let previous = -1n;
  let count = 0;
  while (offset < bytes.length) {
    if (offset + 13 > bytes.length) throw new Error("Truncated packet journal entry.");
    const direction = bytes[offset]!;
    const nanos = bytes.readBigInt64BE(offset + 1);
    const length = bytes.readInt32BE(offset + 9);
    offset += 13;
    if (direction > 1 || nanos < previous || length < 1 || length > 32 * 1024 * 1024 || offset + length > bytes.length || ++count > 250_000) throw new Error("Invalid packet journal entry.");
    let id = 0;
    let width = 0;
    for (; width < Math.min(5, length); width++) {
      const part = bytes[offset + width]!;
      id |= (part & 127) << (width * 7);
      if (!(part & 128)) break;
    }
    if (width >= Math.min(5, length) || id < 0 || id >= 1024) throw new Error("Invalid Bedrock packet ID.");
    if (direction === 1 ? [3, 143].includes(id) : [1, 4, 94, 193].includes(id)) throw new Error("Authentication packet in journal.");
    if (direction === 1) {
      result.clientbound++;
      result.ids[id] = (result.ids[id] ?? 0) + 1;
      result.reachedStartGame ||= id === 11;
      result.reachedSpawn ||= id === 2 && length === width + 5 && bytes.readInt32BE(offset + width + 1) === 3;
      if (![2, 5, 6, 7, 82, 83, 85, 115].includes(id)) {
        scene.update(bytes.subarray(offset - 4, offset));
        scene.update(bytes.subarray(offset, offset + length));
      }
    } else {
      result.serverbound++;
      result.serverboundIds[id] = (result.serverboundIds[id] ?? 0) + 1;
    }
    previous = nanos;
    result.elapsedSeconds = Number(nanos) / 1e9;
    offset += length;
  }
  result.sceneSha256 = scene.digest("hex");
  return result;
}

export async function inspectJournal(file: string): Promise<PacketSummary> {
  if ((await stat(file)).size > maxJournalBytes) throw new Error("Packet journal exceeded its size limit.");
  return summarizeJournal(await readFile(file));
}
