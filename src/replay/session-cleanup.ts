import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { OwnedProcesses } from "./owned-processes.ts";

/** Let Minecraft disconnect on its render thread before the JVM enters its exit safepoint. */
export async function requestReplayJavaStop(
  directory: string,
  signalStartup: () => void,
): Promise<void> {
  if (existsSync(join(directory, "client-control-ready"))) {
    await writeFile(join(directory, "stop-client"), "", { mode: 0o600 });
  } else {
    signalStartup();
  }
}

/** Keep Prism draining the game's output until the JVM has finished shutting down. */
export async function stopReplayJavaProcesses(
  processes: OwnedProcesses,
  gamePid?: number,
  waitForExit: (pids: number[]) => Promise<void> = async (pids) => {
    const until = Date.now() + 15_000;
    while (Date.now() < until && pids.some((pid) => processes.alive(pid))) await Bun.sleep(100);
    if (pids.some((pid) => processes.alive(pid)))
      throw new Error("Owned Java processes did not stop normally; forced cleanup refused.");
  },
  requestStop?: () => Promise<void>,
): Promise<void> {
  processes.captureDescendants();
  if (gamePid !== undefined) {
    if (processes.alive(gamePid)) {
      if (requestStop) await requestStop();
      else processes.signal(gamePid, "SIGTERM");
    }
    await waitForExit([gamePid]);
  }
  processes.captureDescendants();
  for (const identity of processes.all().toReversed()) processes.signal(identity.pid, "SIGTERM");
  await waitForExit(processes.all().map((identity) => identity.pid));
}

export interface ReplaySessionCleanup {
  recordOwnership(): Promise<void>;
  stopProcesses(): Promise<void>;
  releaseDependencies(): Promise<void>;
  stopDisplay(): Promise<void>;
}

/** Evidence writes must not prevent teardown; live processes must retain their dependencies. */
export async function cleanupReplaySession(cleanup: ReplaySessionCleanup): Promise<void> {
  const errors: unknown[] = [];
  const attempt = async (action: () => Promise<void>): Promise<boolean> => {
    try {
      await action();
      return true;
    } catch (error) {
      errors.push(error);
      return false;
    }
  };
  await attempt(() => cleanup.recordOwnership());
  if (await attempt(() => cleanup.stopProcesses())) {
    await attempt(() => cleanup.releaseDependencies());
    await attempt(() => cleanup.stopDisplay());
  }
  if (errors.length === 1) throw errors[0];
  if (errors.length > 1) throw new AggregateError(errors, "Replay session cleanup failed.");
}
