import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";

// The redaction rules live in the mitmproxy add-on, so their tests run under Python.
test("capture redaction keeps account data out of HTTP summaries", () => {
  const result = spawnSync("python3", ["-m", "unittest", "test/capture_redact_test.py"], {
    encoding: "utf8",
  });
  expect({ status: result.status, output: result.stderr }).toMatchObject({ status: 0 });
});
