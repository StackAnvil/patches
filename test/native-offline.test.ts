import { describe, expect, test } from "bun:test";
import { verifyNativeOfflineState, requireNativeReplayProcessNamespaces, type NativeOfflineState } from "../src/replay/native-offline.ts";

function isolated(): NativeOfflineState {
  return {
    devices: "Inter-| Receive | Transmit\n face |bytes packets errs drop fifo frame compressed multicast|bytes packets errs drop fifo colls carrier compressed\n lo: 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0\n",
    ipv4Routes: "Iface Destination Gateway Flags RefCnt Use Metric Mask MTU Window IRTT\n",
    ipv6Routes: "00000000000000000000000000000001 80 00000000000000000000000000000000 00 00000000000000000000000000000000 00000000 00000000 00000000 80200001 lo\n00000000000000000000000000000000 00 00000000000000000000000000000000 00 00000000000000000000000000000000 ffffffff 00000000 00000000 00200200 lo\n",
    status: ["CapEff", "CapAmb", "CapBnd", "CapPrm", "CapInh"].map(name => `${name}:\t0000000000000000`).join("\n"),
    namespace: "net:[1234]",
  };
}

describe("native replay isolation", () => {
  test("accepts loopback and Linux unreachable IPv6 sentinel", () => {
    expect(verifyNativeOfflineState(isolated()).namespace).toBe("net:[1234]");
    expect(verifyNativeOfflineState({ ...isolated(), ipv6Routes: "" })).toBeDefined();
  });

  test("accepts an explicit IPv4 route limited to loopback", () => {
    const state = isolated();
    state.ipv4Routes += "lo 0000007F 00000000 0001 0 0 0 000000FF 0 0 0\n";
    expect(verifyNativeOfflineState(state)).toBeDefined();
  });

  test("rejects external interfaces even without a default route", () => {
    const state = isolated();
    state.devices += " veth0: 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0\n";
    expect(() => verifyNativeOfflineState(state)).toThrow();
  });

  test("rejects external IPv4 routes even when assigned to loopback", () => {
    for (const route of ["lo 00000000 00000000 0001 0 0 0 00000000 0 0 0", "lo 000200C0 00000000 0001 0 0 0 00FFFFFF 0 0 0"]) {
      expect(() => verifyNativeOfflineState({ ...isolated(), ipv4Routes: isolated().ipv4Routes + route })).toThrow();
    }
  });

  test("rejects routable IPv6 defaults and external destinations", () => {
    for (const route of [
      "00000000000000000000000000000000 00 00000000000000000000000000000000 00 00000000000000000000000000000000 00000000 00000000 00000000 00000001 lo",
      "20010db8000000000000000000000000 20 00000000000000000000000000000000 00 00000000000000000000000000000000 00000000 00000000 00000000 00000001 lo",
    ]) expect(() => verifyNativeOfflineState({ ...isolated(), ipv6Routes: route })).toThrow();
  });

  test("rejects retained capabilities, missing fields, and duplicate fields", () => {
    for (const name of ["CapEff", "CapAmb", "CapBnd", "CapPrm", "CapInh"]) {
      const state = isolated();
      expect(() => verifyNativeOfflineState({ ...state, status: state.status.replace(`${name}:\t0000000000000000`, `${name}:\t0000000000200000`) })).toThrow();
      expect(() => verifyNativeOfflineState({ ...state, status: state.status.split("\n").filter(line => !line.startsWith(name)).join("\n") })).toThrow();
      expect(() => verifyNativeOfflineState({ ...state, status: `${state.status}\n${name}:\t0` })).toThrow();
    }
  });

  test("fails closed on incomplete or malformed proc metadata", () => {
    for (const update of [{ devices: "" }, { devices: isolated().devices.replace("lo:", "lo?") }, { ipv4Routes: "" }, { ipv4Routes: isolated().ipv4Routes + "lo garbage" }, { ipv6Routes: "garbage" }, { namespace: "unknown" }]) {
      expect(() => verifyNativeOfflineState({ ...isolated(), ...update })).toThrow();
    }
  });

  test("requires explicitly owned process IDs", async () => {
    await expect(requireNativeReplayProcessNamespaces({ namespace: "net:[1234]" }, [])).rejects.toThrow();
    await expect(requireNativeReplayProcessNamespaces({ namespace: "net:[1234]" }, [NaN])).rejects.toThrow();
  });

  test.skipIf(process.platform !== "linux")("checks a live process namespace without launching a client", async () => {
    const { readlink } = await import("node:fs/promises");
    const namespace = await readlink("/proc/self/ns/net");
    await requireNativeReplayProcessNamespaces({ namespace }, [process.pid]);
    await expect(requireNativeReplayProcessNamespaces({ namespace: "net:[0]" }, [process.pid])).rejects.toThrow();
  });
});
