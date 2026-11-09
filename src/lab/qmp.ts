import { createConnection } from "node:net";
import { Data, Deferred, Effect } from "effect";

export class QmpError extends Data.TaggedError("QmpError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export type QmpEffectCommand = (
  execute: string,
  args?: Record<string, unknown>,
) => Effect.Effect<unknown, QmpError>;
export type QmpCommand = (execute: string, args?: Record<string, unknown>) => Promise<unknown>;

/** A request scope owns the socket, handshake, pending replies, and deadline. */
export function withQmpEffect<A, E, R>(
  path: string,
  operation: (command: QmpEffectCommand) => Effect.Effect<A, E, R>,
  timeoutMs = 5000,
) {
  return Effect.scoped(
    Effect.gen(function* () {
      const session = yield* Effect.acquireRelease(
        Effect.sync(() => {
          const socket = createConnection(path);
          socket.setEncoding("utf8");
          const greeting = Deferred.makeUnsafe<void, QmpError>();
          const pending = new Map<number, Deferred.Deferred<unknown, QmpError>>();
          let failure: QmpError | undefined;
          let buffer = "";
          let nextId = 0;
          const fail = (error: QmpError) => {
            failure ??= error;
            Deferred.doneUnsafe(greeting, Effect.fail(failure));
            for (const reply of pending.values()) Deferred.doneUnsafe(reply, Effect.fail(failure));
            pending.clear();
            socket.destroy();
          };
          socket.on("error", (cause) =>
            fail(new QmpError({ message: "QMP connection failed.", cause })),
          );
          socket.on("close", () => fail(new QmpError({ message: "QMP disconnected." })));
          socket.on("data", (data) => {
            buffer += data;
            if (buffer.length > 1024 * 1024) {
              fail(new QmpError({ message: "QMP reply exceeds the size limit." }));
              return;
            }
            let newline: number;
            while ((newline = buffer.indexOf("\n")) >= 0) {
              const line = buffer.slice(0, newline).trim();
              buffer = buffer.slice(newline + 1);
              if (!line) continue;
              try {
                const message = JSON.parse(line) as {
                  QMP?: unknown;
                  id?: number;
                  return?: unknown;
                  error?: { desc?: string };
                };
                if (!message || typeof message !== "object")
                  throw new Error("Expected a QMP message");
                if (message.QMP) Deferred.doneUnsafe(greeting, Effect.void);
                if (message.id === undefined) continue;
                const reply = pending.get(message.id);
                if (!reply) continue;
                pending.delete(message.id);
                Deferred.doneUnsafe(
                  reply,
                  message.error
                    ? Effect.fail(
                        new QmpError({
                          message: message.error.desc ?? "QMP rejected the command.",
                        }),
                      )
                    : Effect.succeed(message.return),
                );
              } catch (cause) {
                fail(new QmpError({ message: "Invalid QMP reply.", cause }));
                return;
              }
            }
          });
          const command: QmpEffectCommand = (execute, args) =>
            Effect.gen(function* () {
              if (failure) return yield* failure;
              const id = ++nextId;
              const reply = yield* Deferred.make<unknown, QmpError>();
              return yield* Effect.acquireUseRelease(
                Effect.sync(() => {
                  pending.set(id, reply);
                  return id;
                }),
                () =>
                  Effect.gen(function* () {
                    yield* Effect.try({
                      try: () =>
                        socket.write(`${JSON.stringify({ execute, arguments: args, id })}\n`),
                      catch: (cause) =>
                        new QmpError({ message: "Could not write QMP command.", cause }),
                    });
                    return yield* Deferred.await(reply);
                  }),
                () =>
                  Effect.sync(() => {
                    pending.delete(id);
                  }),
              );
            });
          return {
            greeting,
            command,
            close: () => fail(new QmpError({ message: "QMP scope closed." })),
          };
        }),
        (session) => Effect.sync(session.close),
      );
      yield* Deferred.await(session.greeting);
      yield* session.command("qmp_capabilities");
      return yield* operation(session.command);
    }),
  ).pipe(
    Effect.timeoutOrElse({
      duration: timeoutMs,
      orElse: () =>
        Effect.fail(
          new QmpError({ message: "QMP operation timed out. The guest was left running." }),
        ),
    }),
  );
}

export function withNamedQmpEffect<A, E, R>(
  path: string,
  name: string,
  operation: (command: QmpEffectCommand) => Effect.Effect<A, E, R>,
) {
  return withQmpEffect(path, (command) =>
    Effect.gen(function* () {
      const identity = yield* command("query-name");
      if (
        !identity ||
        typeof identity !== "object" ||
        !("name" in identity) ||
        identity.name !== name
      )
        return yield* new QmpError({
          message: "QMP VM identity does not match this lab profile. No guest action was sent.",
        });
      return yield* operation(command);
    }),
  );
}

function legacyOperation<A>(operation: (command: QmpCommand) => Promise<A>) {
  return (command: QmpEffectCommand) =>
    Effect.tryPromise({
      try: () => operation((execute, args) => Effect.runPromise(command(execute, args))),
      catch: (cause) =>
        cause instanceof QmpError
          ? cause
          : new QmpError({
              message: cause instanceof Error ? cause.message : String(cause),
              cause,
            }),
    });
}

// Promise compatibility for VM commands that have not moved to native workflows.
export function withQmp<A>(
  path: string,
  operation: (command: QmpCommand) => Promise<A>,
  timeoutMs = 5000,
) {
  return Effect.runPromise(withQmpEffect(path, legacyOperation(operation), timeoutMs));
}
export function withNamedQmp<A>(
  path: string,
  name: string,
  operation: (command: QmpCommand) => Promise<A>,
) {
  return Effect.runPromise(withNamedQmpEffect(path, name, legacyOperation(operation)));
}

export function keyEvents(chord: string): Record<string, unknown>[] {
  const keys = chord.split("+");
  if (!keys.length || keys.some((key) => !/^[a-z0-9][a-z0-9_-]*$/.test(key))) {
    throw new Error("Use QEMU key names, such as ret, esc, or ctrl+alt+delete.");
  }
  return keys.map((key) => ({ type: "qcode", data: key }));
}

export function pointerEvents(x: number, y: number, button: string): Record<string, unknown>[] {
  if (![x, y].every((value) => Number.isFinite(value) && value >= 0 && value <= 1)) {
    throw new Error("Pointer coordinates must be fractions from 0 to 1.");
  }
  if (button !== "left" && button !== "right" && button !== "middle")
    throw new Error("Use left, right, or middle.");
  return [
    { type: "abs", data: { axis: "x", value: Math.round(x * 32767) } },
    { type: "abs", data: { axis: "y", value: Math.round(y * 32767) } },
    { type: "btn", data: { button, down: true } },
  ];
}

export const clickPointerEffect = Effect.fn("Qmp.clickPointer")(function* (
  command: QmpEffectCommand,
  x: number,
  y: number,
  button: string,
  holdMs = 100,
) {
  const events = yield* Effect.try({
    try: () => {
      validateHoldMs(holdMs);
      return pointerEvents(x, y, button);
    },
    catch: (cause) =>
      new QmpError({ message: cause instanceof Error ? cause.message : String(cause), cause }),
  });
  yield* command("input-send-event", { events: events.slice(0, 2) });
  yield* Effect.sleep(100);
  // Own the release before submitting the press. Waiting for its reply stays interruptible.
  yield* Effect.acquireUseRelease(
    Effect.void,
    () =>
      command("input-send-event", { events: events.slice(2) }).pipe(
        Effect.andThen(Effect.sleep(holdMs)),
      ),
    () =>
      command("input-send-event", {
        events: [{ type: "btn", data: { button, down: false } }],
      }).pipe(
        Effect.timeoutOrElse({
          duration: 1000,
          orElse: () =>
            Effect.fail(
              new QmpError({
                message: "QMP pointer release timed out. The guest was left running.",
              }),
            ),
        }),
        Effect.orDie,
      ),
  );
});

export function clickPointer(
  command: QmpCommand,
  x: number,
  y: number,
  button: string,
  holdMs = 100,
): Promise<void> {
  return Effect.runPromise(
    clickPointerEffect(
      (execute, args) =>
        Effect.tryPromise({
          try: () => command(execute, args),
          catch: (cause) =>
            new QmpError({
              message: cause instanceof Error ? cause.message : String(cause),
              cause,
            }),
        }),
      x,
      y,
      button,
      holdMs,
    ),
  );
}

export function validateHoldMs(holdMs: number): void {
  if (!Number.isInteger(holdMs) || holdMs < 1 || holdMs > 2000) {
    throw new Error("Input hold time must be an integer from 1 to 2000 milliseconds.");
  }
}
