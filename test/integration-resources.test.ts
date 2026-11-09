import { expect, test } from "bun:test";
import { Effect, Fiber, Result } from "effect";
import { TestClock } from "effect/testing";
import { releaseIntegrationResources } from "../src/integration/resources.ts";
import { tcpPortEffect, udpPortEffect } from "../src/integration/ports.ts";

test("resource cleanup waits for process exit before releasing dependencies and display", async () => {
  const order: string[] = [];
  let running = true;
  await Effect.runPromise(
    Effect.gen(function* () {
      const cleanup = yield* releaseIntegrationResources(
        [{ pid: 1 }],
        [
          async () => {
            expect(running).toBe(false);
            order.push("dependencies");
          },
        ],
        async () => {
          order.push("display");
        },
        {
          alive: () => running,
          interrupt: () => {
            order.push("interrupt");
          },
        },
      ).pipe(Effect.forkChild);
      yield* Effect.yieldNow;
      expect(order).toEqual(["interrupt"]);
      running = false;
      yield* TestClock.adjust(250);
      yield* Fiber.await(cleanup);
    }).pipe(Effect.provide(TestClock.layer())),
  );
  expect(order).toEqual(["interrupt", "dependencies", "display"]);
});

test("a stubborn process retains all dependencies and its display", async () => {
  let released = false;
  const result = await Effect.runPromise(
    Effect.gen(function* () {
      const cleanup = yield* releaseIntegrationResources(
        [{ pid: 1 }],
        [
          async () => {
            released = true;
          },
        ],
        async () => {
          released = true;
        },
        { alive: () => true, interrupt: () => {} },
      ).pipe(Effect.result, Effect.forkChild);
      yield* TestClock.adjust(10_000);
      return yield* Fiber.join(cleanup);
    }).pipe(Effect.provide(TestClock.layer())),
  );
  expect(Result.isFailure(result) && result.failure.message).toContain(
    "retain their dependencies and display",
  );
  expect(released).toBe(false);
});

test("independent cleanup failures still attempt all releases and the display", async () => {
  const calls: string[] = [];
  const result = await Effect.runPromise(
    releaseIntegrationResources(
      [],
      [
        async () => {
          calls.push("first");
          throw new Error("failed");
        },
        async () => {
          calls.push("second");
        },
      ],
      async () => {
        calls.push("display");
      },
    ).pipe(Effect.result),
  );
  expect(Result.isFailure(result)).toBe(true);
  expect(calls).toEqual(["first", "second", "display"]);
});

test("ephemeral TCP and UDP reservations release their sockets", async () => {
  const ports = await Effect.runPromise(
    Effect.all([tcpPortEffect, udpPortEffect], { concurrency: 2 }),
  );
  expect(ports.every((port) => Number.isInteger(port) && port > 0)).toBe(true);
});

test("an unused resource scope never stops an existing display", async () => {
  const { integrationResourcesLayer } = await import("../src/integration/resources.ts");
  let stopped = false;
  await Effect.runPromise(
    Effect.scoped(
      Effect.void.pipe(
        Effect.provide(
          integrationResourcesLayer(async () => {
            stopped = true;
          }),
        ),
      ),
    ),
  );
  expect(stopped).toBe(false);
});

test("interrupted join polling stops reading logs immediately", async () => {
  const { waitForJoinEffect } = await import("../src/integration/join.ts");
  let reads = 0;
  await Effect.runPromise(
    Effect.gen(function* () {
      const fiber = yield* waitForJoinEffect({
        route: "java-java",
        serverLog: async () => {
          reads++;
          return "";
        },
        clientLog: async () => "",
        clientAlive: () => true,
        timeoutMs: 10000,
        dwellMs: 1000,
      }).pipe(Effect.forkChild);
      yield* Effect.yieldNow;
      expect(reads).toBe(1);
      yield* Fiber.interrupt(fiber);
      yield* TestClock.adjust(10000);
      expect(reads).toBe(1);
    }).pipe(Effect.provide(TestClock.layer())),
  );
});
