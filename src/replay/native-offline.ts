import { readFile, readlink } from "node:fs/promises";

export interface NativeOfflineState {
  devices: string;
  ipv4Routes: string;
  ipv6Routes: string;
  status: string;
  namespace: string;
}

export interface NativeOfflineProof { namespace: string }

function refuse(reason: string): never {
  throw new Error(`Native replay requires a loopback-only network namespace with all capabilities cleared: ${reason}`);
}

export function verifyNativeOfflineState(state: NativeOfflineState): NativeOfflineProof {
  const devices = state.devices.trim().split(/\r?\n/);
  if (devices.length < 3 || !devices[0]!.includes("|") || !devices[1]!.includes("|")) refuse("network interface metadata is incomplete");
  const interfaces = devices.slice(2).map(row => {
    const match = /^\s*([^:]+):\s*(.*)$/.exec(row);
    if (!match || !/^\d+(?:\s+\d+){15}$/.test(match[2]!)) refuse("network interface metadata is malformed");
    return match[1]!.trim();
  });
  if (interfaces.length !== 1 || interfaces[0] !== "lo") refuse("an external network interface is present");

  const ipv4 = state.ipv4Routes.trim().split(/\r?\n/);
  if (!/^Iface\s+Destination\s+Gateway\s+Flags\s+/.test(ipv4[0] ?? "")) refuse("IPv4 route metadata is incomplete");
  for (const row of ipv4.slice(1)) {
    const fields = row.trim().split(/\s+/);
    if (fields.length !== 11 || ![fields[1], fields[2], fields[7]].every(value => /^[\da-f]{8}$/i.test(value!))) refuse("IPv4 route metadata is malformed");
    const destination = Number.parseInt(fields[1]!, 16);
    const mask = Number.parseInt(fields[7]!, 16);
    if (fields[0] !== "lo" || fields[2] !== "00000000" || (destination & 255) !== 127 || (mask & 255) !== 255) refuse("an external IPv4 route is present");
  }
  for (const row of state.ipv6Routes.trim().split(/\r?\n/).filter(Boolean)) {
    const fields = row.trim().split(/\s+/);
    if (fields.length !== 10 || ![0, 2, 4].every(index => /^[\da-f]{32}$/i.test(fields[index]!))
      || ![1, 3].every(index => /^[\da-f]{2}$/i.test(fields[index]!))
      || ![5, 6, 7, 8].every(index => /^[\da-f]{8}$/i.test(fields[index]!))) refuse("IPv6 route metadata is malformed");
    const destination = BigInt(`0x${fields[0]}`);
    const prefix = Number.parseInt(fields[1]!, 16);
    const loopback = destination === 1n && prefix === 128;
    // Linux includes an unreachable default-route sentinel even in a fresh namespace.
    const unreachable = destination === 0n && prefix === 0 && (Number.parseInt(fields[8]!, 16) & 0x200) !== 0;
    if (fields[9] !== "lo" || BigInt(`0x${fields[4]}`) !== 0n || (!loopback && !unreachable)) refuse("an external IPv6 route is present");
  }
  for (const name of ["CapEff", "CapAmb", "CapBnd", "CapPrm", "CapInh"]) {
    const values = state.status.split(/\r?\n/).filter(line => line.startsWith(`${name}:`));
    if (values.length !== 1 || !new RegExp(`^${name}:\\s+[\\da-f]+$`, "i").test(values[0]!)) refuse(`${name} metadata is incomplete`);
    if (BigInt(`0x${values[0]!.split(/\s+/)[1]}`) !== 0n) refuse(`${name} is not cleared`);
  }
  if (!/^net:\[\d+\]$/.test(state.namespace)) refuse("the process network namespace cannot be identified");
  return { namespace: state.namespace };
}

export async function requireNativeOfflineReplay(): Promise<NativeOfflineProof> {
  if (process.platform !== "linux") refuse("Linux network namespace inspection is unavailable");
  const [devices, ipv4Routes, ipv6Routes, status, namespace] = await Promise.all([
    readFile("/proc/net/dev", "utf8"), readFile("/proc/net/route", "utf8"),
    readFile("/proc/net/ipv6_route", "utf8"), readFile("/proc/self/status", "utf8"), readlink("/proc/self/ns/net"),
  ]);
  return verifyNativeOfflineState({ devices, ipv4Routes, ipv6Routes, status, namespace });
}

/** Check explicitly owned backend and Wine processes before permitting Join. */
export async function requireNativeReplayProcessNamespaces(proof: NativeOfflineProof, pids: readonly number[]): Promise<void> {
  if (!pids.length || pids.some(pid => !Number.isSafeInteger(pid) || pid <= 0)) refuse("owned process IDs are missing or invalid");
  for (const pid of pids) {
    const namespace = await readlink(`/proc/${pid}/ns/net`);
    if (namespace !== proof.namespace) refuse(`owned process ${pid} escaped the replay network namespace`);
  }
}
