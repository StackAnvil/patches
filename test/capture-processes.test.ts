import { expect, test } from "bun:test";
import { ownedProcessAlive, stopCaptureSession } from "../src/capture/processes.ts";
import type { ProcessEntry } from "../src/replay/owned-processes.ts";
import { expectRejection } from "./helpers/expect-rejection.ts";

test("capture stop still stops the proxy when a video cannot finalize", async () => {
  const stopped: string[] = [];
  const error = await expectRejection(
    stopCaptureSession(
      [
        async () => {
          throw new Error("Video did not finalize.");
        },
        async () => {
          stopped.push("java video");
        },
      ],
      async () => {
        stopped.push("proxy");
      },
    ),
  );
  expect(error).toEqual(new Error("Video did not finalize."));
  expect(stopped).toEqual(["java video", "proxy"]);
});

test("a saved PID is signalled only while its kernel start time matches", () => {
  const processes = new Map<number, ProcessEntry>([
    [42, { pid: 42, parent: 1, startTicks: "900" }],
  ]);
  const read = (pid: number) => processes.get(pid);
  expect(ownedProcessAlive(42, "900", read)).toBe(true);
  // After a reboot or a long session, another process can reuse the saved PID.
  expect(ownedProcessAlive(42, "100", read)).toBe(false);
  expect(ownedProcessAlive(7, "900", read)).toBe(false);
  // Sessions saved before start times were recorded cannot prove ownership.
  expect(ownedProcessAlive(42, undefined, read)).toBe(false);
});
