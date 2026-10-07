import { expect, test } from "bun:test";
import { requireOwnedSilentModule, OwnedProcesses, type ProcessEntry } from "../src/replay/owned-processes.ts";

function fixture() {
  const processes = new Map<number, ProcessEntry>([
    [10, { pid: 10, parent: 1, startTicks: "100" }],
    [20, { pid: 20, parent: 10, startTicks: "200" }],
    [30, { pid: 30, parent: 20, startTicks: "300" }],
    [40, { pid: 40, parent: 1, startTicks: "400" }],
  ]);
  const signals: { pid: number; signal: NodeJS.Signals }[] = [];
  const owned = new OwnedProcesses({
    read: pid => processes.get(pid),
    ids: () => [...processes.keys()],
    signal: (pid, signal) => { signals.push({ pid, signal }); },
  });
  owned.capture(10);
  return { owned, processes, signals };
}

test("captures actual descendant identities while preserving unrelated and separately owned display processes", () => {
  const { owned, signals } = fixture();
  owned.exclude(30);
  owned.captureDescendants();
  for (const process of owned.all()) owned.signal(process.pid, "SIGTERM");
  expect(signals).toEqual([{ pid: 10, signal: "SIGTERM" }, { pid: 20, signal: "SIGTERM" }]);
  expect(() => owned.signal(40, "SIGTERM")).toThrow();
});

test("ignores exited owners and refuses a reused PID at the immediate signal boundary", () => {
  const { owned, processes, signals } = fixture();
  owned.captureDescendants();
  processes.delete(20);
  owned.signal(20, "SIGTERM");
  processes.set(30, { pid: 30, parent: 1, startTicks: "999" });
  expect(() => owned.signal(30, "SIGTERM")).toThrow();
  expect(() => owned.capture(30)).toThrow();
  expect(signals).toHaveLength(0);
});

test("does not adopt descendants of a reused owner", () => {
  const { owned, processes, signals } = fixture();
  processes.set(10, { pid: 10, parent: 1, startTicks: "new" });
  owned.captureDescendants();
  expect(owned.all()).toEqual([{ pid: 10, startTicks: "100" }]);
  expect(() => owned.signal(10, "SIGTERM")).toThrow();
  expect(signals).toHaveLength(0);
});

test("unloads only the saved null-sink module identity in the actual pactl short protocol", () => {
  const id = 536870918;
  const owned = `${id}\tmodule-null-sink\tsink_name=stackanvil_silent sink_properties=device.description=StackAnvil-Silent\t\n`;
  requireOwnedSilentModule(`7\tmodule-native-protocol-tcp\tport=4713\n${owned}`, id);
  for (const output of [owned.replace(String(id), "8"), owned.replace("module-null-sink", "module-loopback"),
    owned.replace("stackanvil_silent", "stackanvil_desktop_vfp"), owned.replace("StackAnvil-Silent", "Other-Sink"), owned + owned]) {
    expect(() => requireOwnedSilentModule(output, id)).toThrow();
  }
});
