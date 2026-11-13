import { execFile, type ExecFileOptionsWithStringEncoding } from "node:child_process";
import { promisify } from "node:util";
import { Data, Effect } from "effect";

export class LabError extends Data.TaggedError("LabError")<{
  readonly operation: string;
  readonly message: string;
  readonly cause?: unknown;
}> {}

export function labError(operation: string, cause: unknown) {
  return cause instanceof LabError
    ? cause
    : new LabError({
        operation,
        message: cause instanceof Error ? cause.message : String(cause),
        cause,
      });
}

/** Promise adapters belong at filesystem and existing SDK boundaries. */
export function labIO<A>(operation: string, work: (signal: AbortSignal) => PromiseLike<A>) {
  return Effect.tryPromise({
    try: (signal) => Promise.resolve(work(signal)),
    catch: (cause) => labError(operation, cause),
  });
}

export function labValue<A>(operation: string, work: () => A) {
  return Effect.try({ try: work, catch: (cause) => labError(operation, cause) });
}

/** SIGINT/SIGTERM interrupt the root fiber and wait for scoped cleanup. */
export async function runLabCommand<A, E>(program: Effect.Effect<A, E>) {
  const controller = new AbortController();
  const interrupt = () => controller.abort();
  process.once("SIGINT", interrupt);
  process.once("SIGTERM", interrupt);
  try {
    return await Effect.runPromise(program, { signal: controller.signal });
  } finally {
    process.off("SIGINT", interrupt);
    process.off("SIGTERM", interrupt);
  }
}

/** One deadline owns headers, body consumption, abort, and late-response disposal. */
export function labRequestBytes(url: string, maximumBytes = 512 * 1024 * 1024) {
  return Effect.scoped(
    Effect.gen(function* () {
      const owner = yield* Effect.acquireRelease(
        Effect.sync(() => ({
          controller: new AbortController(),
          reader: undefined as ReadableStreamDefaultReader<Uint8Array> | undefined,
          response: undefined as Response | undefined,
        })),
        (owner) =>
          Effect.promise(async () => {
            owner.controller.abort();
            if (owner.reader) {
              await owner.reader.cancel().catch(() => {});
              owner.reader.releaseLock();
            } else await owner.response?.body?.cancel().catch(() => {});
          }),
      );
      const response = yield* labIO("request headers", async () => {
        const response = await fetch(url, { signal: owner.controller.signal });
        if (owner.controller.signal.aborted) {
          await response.body?.cancel().catch(() => {});
          owner.controller.signal.throwIfAborted();
        }
        owner.response = response;
        return response;
      });
      if (!response.ok)
        return yield* new LabError({
          operation: "download",
          message: `Download failed: ${response.status} ${url}`,
        });
      owner.reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      if (owner.reader) {
        const reader = owner.reader;
        while (true) {
          const chunk = yield* labIO("read response", () => reader.read());
          if (chunk.done) break;
          size += chunk.value.byteLength;
          if (size > maximumBytes)
            return yield* new LabError({
              operation: "download",
              message: "Download exceeds the size limit.",
            });
          chunks.push(chunk.value);
        }
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.byteLength;
      }
      return bytes;
    }),
  ).pipe(
    Effect.timeoutOrElse({
      duration: 120_000,
      orElse: () =>
        Effect.fail(new LabError({ operation: "download", message: "Download timed out." })),
    }),
  );
}

export function labRequestJson(url: string) {
  return labRequestBytes(url, 2 * 1024 * 1024).pipe(
    Effect.flatMap((bytes) =>
      labValue("decode response", () => JSON.parse(new TextDecoder().decode(bytes)) as unknown),
    ),
  );
}

const executeFile = promisify(execFile);
export function labExecute(
  program: string,
  args: string[],
  options: Omit<ExecFileOptionsWithStringEncoding, "encoding" | "signal"> = {},
) {
  return labIO("execute command", (signal) =>
    executeFile(program, args, { ...options, encoding: "utf8", signal }),
  );
}
