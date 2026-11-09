import { expect, test } from "bun:test";
import { createServer, type Socket } from "node:net";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Cause, Effect, Exit, Fiber } from "effect";
import { TestClock } from "effect/testing";
import { clickPointerEffect, withNamedQmpEffect, withQmpEffect } from "../src/lab/qmp.ts";

async function fixture(run: (path: string, commands: string[]) => Promise<void>, reply = true) {
  const directory = await mkdtemp(join(tmpdir(), "qmp-effect-"));
  const path = join(directory, "qmp.sock");
  const sockets = new Set<Socket>();
  const commands: string[] = [];
  const server = createServer((socket) => {
    sockets.add(socket);
    socket.on("error", () => {});
    socket.on("close", () => sockets.delete(socket));
    socket.write(JSON.stringify({ QMP: { version: {} } }) + "\n");
    let buffer = "";
    socket.on("data", (chunk) => {
      buffer += chunk.toString();
      let end: number;
      while ((end = buffer.indexOf("\n")) >= 0) {
        const command = JSON.parse(buffer.slice(0, end));
        buffer = buffer.slice(end + 1);
        commands.push(command.execute);
        if (reply || command.execute === "qmp_capabilities") {
          socket.write(JSON.stringify({ event: "UNRELATED" }) + "\n");
          socket.write(
            JSON.stringify({
              id: command.id,
              return: command.execute === "query-name" ? { name: "owned" } : command.arguments,
            }) + "\n",
          );
        }
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(path, resolve));
  try {
    await run(path, commands);
  } finally {
    for (const socket of sockets) socket.destroy();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await rm(directory, { recursive: true, force: true });
  }
}

test("QMP handshakes and correlates concurrent replies despite interleaved events", () =>
  fixture(async (path, commands) => {
    const values = await Effect.runPromise(
      withNamedQmpEffect(path, "owned", (command) =>
        Effect.all([command("first", { value: 1 }), command("second", { value: 2 })], {
          concurrency: 2,
        }),
      ),
    );
    expect(values).toEqual([{ value: 1 }, { value: 2 }]);
    expect(commands.slice(0, 2)).toEqual(["qmp_capabilities", "query-name"]);
  }));

test("identity mismatch sends no guest action", () =>
  fixture(async (path, commands) => {
    await expect(
      Effect.runPromise(withNamedQmpEffect(path, "other", (command) => command("system_reset"))),
    ).rejects.toThrow("identity does not match");
    expect(commands).not.toContain("system_reset");
  }));

test("a deadline closes pending QMP replies without stopping the guest", () =>
  fixture(async (path, commands) => {
    await expect(
      Effect.runPromise(withQmpEffect(path, (command) => command("query-status"), 50)),
    ).rejects.toThrow("guest was left running");
    expect(commands).toEqual(["qmp_capabilities", "query-status"]);
  }, false));

test("cancelling a held pointer releases its button", async () => {
  const messages: Array<Record<string, unknown> | undefined> = [];
  await Effect.runPromise(
    Effect.gen(function* () {
      const fiber = yield* clickPointerEffect(
        (_execute, args) =>
          Effect.sync(() => {
            messages.push(args);
          }),
        0.5,
        0.5,
        "left",
        2000,
      ).pipe(Effect.forkChild);
      yield* TestClock.adjust(100);
      yield* Fiber.interrupt(fiber);
    }).pipe(Effect.provide(TestClock.layer())),
  );
  expect(messages).toHaveLength(3);
  expect(messages[2]).toEqual({ events: [{ type: "btn", data: { button: "left", down: false } }] });
});

test("unacknowledged press and release commands cannot block cancellation indefinitely", async () => {
  let commands = 0;
  const exit = await Effect.runPromise(
    Effect.gen(function* () {
      const fiber = yield* clickPointerEffect(
        () =>
          Effect.suspend(() => {
            commands++;
            return commands === 1 ? Effect.void : Effect.never;
          }),
        0.5,
        0.5,
        "left",
        2000,
      ).pipe(Effect.forkChild);
      yield* TestClock.adjust(100);
      expect(commands).toBe(2);
      const cancellation = yield* Fiber.interrupt(fiber).pipe(Effect.forkChild);
      yield* Effect.yieldNow;
      expect(commands).toBe(3);
      yield* TestClock.adjust(1000);
      yield* Fiber.join(cancellation);
      return yield* Fiber.await(fiber);
    }).pipe(Effect.provide(TestClock.layer())),
  );
  expect(Exit.isFailure(exit) && Cause.squash(exit.cause)).toMatchObject({
    message: "QMP pointer release timed out. The guest was left running.",
  });
});
