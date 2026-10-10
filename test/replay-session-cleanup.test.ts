import { expect, test } from "bun:test";
import { cleanupReplaySession, type ReplaySessionCleanup } from "../src/replay/session-cleanup.ts";

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
