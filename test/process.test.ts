import { expect, test } from "bun:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Effect, Fiber, Schedule } from "effect";
import { command } from "../src/process.ts";

test("command failures remain recoverable and preserve the subprocess cause", async () => {
  const exitCode = 29;
  const detail = crypto.randomUUID();
  const error = await Effect.runPromise(command(process.execPath, [
    "-e", "process.stderr.write(process.argv[1]); process.exit(Number(process.argv[2]));", detail, String(exitCode),
  ], import.meta.dir).pipe(Effect.flip));

  expect(error).toBeInstanceOf(Error);
  expect(error.message).toContain(detail);
  expect(error.cause).toBeInstanceOf(Error);
  expect((error.cause as { code: number }).code).toBe(exitCode);
});

test("interrupting a command stops its subprocess", async () => {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-command-"));
  const ready = join(directory, "pid");
  const retry = { schedule: Schedule.spaced("10 millis"), times: 200 };
  let pid: number | undefined;

  try {
    await Effect.runPromise(Effect.scoped(Effect.gen(function* () {
      const fiber = yield* Effect.forkScoped(command(process.execPath, [
        "-e",
        "require('node:fs').writeFileSync(process.argv[1], String(process.pid)); setInterval(() => {}, 1000);",
        ready,
      ], directory));
      pid = yield* Effect.tryPromise(async () => {
        const value = Number(await readFile(ready, "utf8"));
        if (!Number.isSafeInteger(value) || value <= 0) throw new Error("Subprocess PID is not ready");
        return value;
      }).pipe(Effect.retry(retry));

      yield* Fiber.interrupt(fiber);
      yield* Effect.try(() => {
        try {
          process.kill(pid!, 0);
        } catch (cause) {
          if ((cause as NodeJS.ErrnoException).code === "ESRCH") return;
          throw cause;
        }
        throw new Error(`Subprocess ${pid} is still running`);
      }).pipe(Effect.retry(retry));
    })));

    expect(pid).toBeGreaterThan(0);
    expect(() => process.kill(pid!, 0)).toThrow();
  } finally {
    if (pid) {
      try {
        process.kill(pid, "SIGKILL");
      } catch (cause) {
        if ((cause as NodeJS.ErrnoException).code !== "ESRCH") throw cause;
      }
    }
    await rm(directory, { recursive: true, force: true });
  }
});
