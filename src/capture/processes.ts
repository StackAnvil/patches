import { readProcess, type ProcessEntry } from "../replay/owned-processes.ts";

type ReadProcess = (pid: number) => ProcessEntry | undefined;

/** The kernel start time that identifies a process the capture just started. */
export function processStart(pid: number, read: ReadProcess = readProcess): string | undefined {
  return read(pid)?.startTicks;
}

/**
 * session.json outlives its processes and reboots, and the kernel then reuses their PIDs. A saved
 * PID still belongs to the capture only while its start time matches. Sessions saved before start
 * times were recorded cannot prove ownership, so their processes are never signalled.
 */
export function ownedProcessAlive(
  pid: number,
  startTicks: string | undefined,
  read: ReadProcess = readProcess,
): boolean {
  return startTicks !== undefined && processStart(pid, read) === startTicks;
}

/** Stop every video, then the proxy. A video that cannot finalize must not leave mitmdump running. */
export async function stopCaptureSession(
  videos: readonly (() => Promise<void>)[],
  proxy: () => Promise<void>,
): Promise<void> {
  const errors: unknown[] = [];
  for (const step of [...videos, proxy]) {
    try {
      await step();
    } catch (error) {
      errors.push(error);
    }
  }
  if (errors.length === 1) throw errors[0];
  if (errors.length > 1)
    throw new Error(
      errors.map((error) => (error instanceof Error ? error.message : String(error))).join(" "),
    );
}
