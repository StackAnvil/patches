import { expect, test } from "bun:test";
import { stopCaptureSession } from "../src/capture/processes.ts";
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
