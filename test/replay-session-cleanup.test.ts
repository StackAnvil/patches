import { expect, test } from "bun:test";
import { cleanupReplaySession, stopReplayJavaProcesses, type ReplaySessionCleanup } from "../src/replay/session-cleanup.ts";
import { OwnedProcesses, type ProcessEntry } from "../src/replay/owned-processes.ts";

function launcherFixture() {
  const entries = new Map<number, ProcessEntry>([
    [10, { pid: 10, parent: 1, startTicks: "100" }],
    [20, { pid: 20, parent: 10, startTicks: "200" }],
    [30, { pid: 30, parent: 1, startTicks: "300" }],
  ]);
  const signals: number[] = [];
  const processes = new OwnedProcesses({
    read: pid => entries.get(pid),
    ids: () => [...entries.keys()],
    signal: pid => { signals.push(pid); },
  });
  processes.capture(10);
  return { processes, entries, signals };
}

test("keeps the launcher alive throughout asynchronous game shutdown", async () => {
  const { processes, entries, signals } = launcherFixture();
  const exiting = Promise.withResolvers<void>();
  const stopping = stopReplayJavaProcesses(processes, 20, async pids => {
    if (pids.length === 1) {
      expect(processes.alive(10)).toBe(true);
      await exiting.promise;
    }
    for (const pid of pids) entries.delete(pid);
  });
  expect(signals).toEqual([20]);
  expect(entries.has(10)).toBe(true);
  exiting.resolve();
  await stopping;
  expect(signals).toEqual([20, 10]);
  expect([...entries.keys()]).toEqual([30]);
});

test("preserves the launcher and refuses further teardown when the game cannot stop", async () => {
  const { processes, entries, signals } = launcherFixture();
  const failure = new Error();
  const result = await stopReplayJavaProcesses(processes, 20, async () => { throw failure; }).catch(error => error);
  expect(result).toBe(failure);
  expect(signals).toEqual([20]);
  expect([...entries.keys()]).toEqual([10, 20, 30]);
});

test("stops captured launcher descendants when startup never identified a game", async () => {
  const { processes, entries, signals } = launcherFixture();
  await stopReplayJavaProcesses(processes, undefined, async pids => {
    for (const pid of pids) entries.delete(pid);
  });
  expect(signals).toEqual([20, 10]);
  expect([...entries.keys()]).toEqual([30]);
});

function fixture() {
  const state = { running: true, dependencies: true, display: true };
  const cleanup: ReplaySessionCleanup = {
    recordOwnership: async () => {},
    stopProcesses: async () => { state.running = false; },
    releaseDependencies: async () => {
      expect(state.running).toBe(false);
      state.dependencies = false;
    },
    stopDisplay: async () => {
      expect(state.running).toBe(false);
      state.display = false;
    },
  };
  return { state, cleanup };
}

test("stops processes and releases dependencies when a full disk prevents writing ownership evidence", async () => {
  const { state, cleanup } = fixture();
  const failure = Object.assign(new Error(), { code: "ENOSPC" });
  cleanup.recordOwnership = async () => { throw failure; };
  const result = await cleanupReplaySession(cleanup).catch(error => error);
  expect(result).toBe(failure);
  expect(state).toEqual({ running: false, dependencies: false, display: false });
});

test("retains dependencies and display when owned processes fail to stop", async () => {
  const { state, cleanup } = fixture();
  const failure = new Error();
  cleanup.stopProcesses = async () => { throw failure; };
  const result = await cleanupReplaySession(cleanup).catch(error => error);
  expect(result).toBe(failure);
  expect(state).toEqual({ running: true, dependencies: true, display: true });
});

test("closes the display despite a dependency release failure and preserves both errors", async () => {
  const { state, cleanup } = fixture();
  const reportFailure = new Error(), releaseFailure = new Error();
  cleanup.recordOwnership = async () => { throw reportFailure; };
  cleanup.releaseDependencies = async () => { throw releaseFailure; };
  const result = await cleanupReplaySession(cleanup).catch(error => error);
  expect(result).toBeInstanceOf(AggregateError);
  expect(result.errors).toEqual([reportFailure, releaseFailure]);
  expect(state).toEqual({ running: false, dependencies: true, display: false });
});
