import { expect, test } from "bun:test";
import { pause, trapCancellation } from "../src/replay/cancellation.ts";
import { expectRejection } from "./helpers/expect-rejection.ts";

test("Ctrl+C ends a long startup wait at once and the trap is released afterwards", async () => {
  const before = process.listeners("SIGINT");
  const controller = new AbortController();
  const release = trapCancellation(controller);
  const interrupt = process.listeners("SIGINT").find((listener) => !before.includes(listener));
  const started = Date.now();
  const waiting = pause(60_000, controller.signal);
  interrupt?.("SIGINT");
  expect(await expectRejection(waiting)).toEqual(new Error("The run was cancelled."));
  expect(Date.now() - started).toBeLessThan(5000);
  expect(await expectRejection(pause(1, controller.signal))).toEqual(
    new Error("The run was cancelled."),
  );
  release();
  expect(process.listeners("SIGINT")).toEqual(before);
});

test("an uncancelled wait completes normally", async () => {
  await pause(1, new AbortController().signal);
});
