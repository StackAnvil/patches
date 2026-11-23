import { Effect } from "effect";

/**
 * Turn SIGINT and SIGTERM into an abort, so cancellation reaches the session's finally blocks.
 * Without a handler, Bun exits at once and leaves owned processes and temporary builds behind.
 */
export function trapCancellation(controller: AbortController): () => void {
  const abort = () => {
    controller.abort(new Error("The run was cancelled."));
  };
  process.on("SIGINT", abort);
  process.on("SIGTERM", abort);
  return () => {
    process.off("SIGINT", abort);
    process.off("SIGTERM", abort);
  };
}

/** Wait like Bun.sleep, but end the wait with the abort reason when the run is cancelled. */
export async function pause(milliseconds: number, signal: AbortSignal): Promise<void> {
  await Effect.runPromise(Effect.sleep(milliseconds), { signal }).catch((error: unknown) => {
    signal.throwIfAborted();
    throw error;
  });
}
