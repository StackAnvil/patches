import { createSocket } from "node:dgram";
import { createServer } from "node:net";
import { Effect } from "effect";
import { labError } from "../lab/effect-runtime.ts";

// Reserve an ephemeral loopback port, then close it before launching the service.
export const tcpPortEffect = Effect.scoped(
  Effect.gen(function* () {
    const server = yield* Effect.acquireRelease(
      Effect.sync(() => createServer()),
      (server) =>
        Effect.promise(() => new Promise<void>((resolve) => server.close(() => resolve()))),
    );
    yield* Effect.callback<void, ReturnType<typeof labError>>((resume) => {
      const error = (cause: Error) => resume(Effect.fail(labError("reserve TCP port", cause)));
      server.once("error", error);
      server.listen(0, "127.0.0.1", () => resume(Effect.void));
      return Effect.sync(() => {
        server.off("error", error);
      });
    });
    const address = server.address();
    if (!address || typeof address === "string")
      return yield* labError("reserve TCP port", new Error("Could not reserve a TCP port."));
    return address.port;
  }),
);

export const udpPortEffect = Effect.scoped(
  Effect.gen(function* () {
    const socket = yield* Effect.acquireRelease(
      Effect.sync(() => createSocket("udp4")),
      (socket) =>
        Effect.promise(
          () =>
            new Promise<void>((resolve) => {
              try {
                socket.close(() => resolve());
              } catch {
                resolve();
              }
            }),
        ),
    );
    yield* Effect.callback<void, ReturnType<typeof labError>>((resume) => {
      const error = (cause: Error) => resume(Effect.fail(labError("reserve UDP port", cause)));
      socket.once("error", error);
      socket.bind(0, "127.0.0.1", () => resume(Effect.void));
      return Effect.sync(() => {
        socket.off("error", error);
      });
    });
    return socket.address().port;
  }),
);
