import { expect, test } from "bun:test";
import { spawn } from "node:child_process";
import { managedAlive } from "../src/lab/cli.ts";

test("a saved lab service from before the current boot does not claim a reused process group", async () => {
  const group = spawn("sleep", ["60"], { detached: true, stdio: "ignore" });
  try {
    await new Promise((settle) => group.on("spawn", settle));
    const bootedAt = Date.parse("2026-11-23T08:00:00Z");
    const entry = { pid: group.pid!, command: "java" };
    expect(managedAlive({ ...entry, startedAt: "2026-11-22T21:00:00.000Z" }, bootedAt)).toBe(false);
    expect(managedAlive({ ...entry, startedAt: "2026-11-23T09:00:00.000Z" }, bootedAt)).toBe(true);
  } finally {
    group.kill();
  }
});
