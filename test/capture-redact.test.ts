import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";

// The redaction rules live in the mitmproxy add-on, so their tests run under Python.
// Discover from test/ so the stdlib `test` package cannot shadow this directory.
test("capture redaction keeps account data out of HTTP summaries", () => {
  const result = spawnSync(
    "python3",
    ["-m", "unittest", "discover", "-s", "test", "-p", "capture_redact_test.py"],
    {
      encoding: "utf8",
    },
  );
  expect({ status: result.status, output: result.stderr }).toMatchObject({ status: 0 });
});
