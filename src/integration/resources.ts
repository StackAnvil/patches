import { spawn, type ChildProcess } from "node:child_process";
import { closeSync, openSync } from "node:fs";
import { Context, Effect, Layer, Result } from "effect";
import { LabError, labIO, labValue } from "../lab/effect-runtime.ts";

export interface OwnedProcess {
  readonly pid?: number;
}
export interface ProcessControl {
  alive(child: OwnedProcess): boolean;
  interrupt(child: OwnedProcess): void;
}
const processControl: ProcessControl = {
  alive: ({ pid }) => {
    if (!pid) return false;
    try {
      process.kill(-pid, 0);
      return true;
    } catch (cause) {
      if ((cause as NodeJS.ErrnoException).code === "ESRCH") return false;
      throw cause;
    }
  },
  interrupt: ({ pid }) => {
    if (!pid) return;
    try {
      process.kill(-pid, "SIGINT");
    } catch (cause) {
      if ((cause as NodeJS.ErrnoException).code !== "ESRCH") throw cause;
    }
  },
};

/** Never remove server dependencies or the display while any owned process survives. */
export const releaseIntegrationResources = Effect.fn("Integration.releaseResources")(function* (
  children: readonly OwnedProcess[],
  dependencies: ReadonlyArray<() => Promise<void>>,
  stopDisplay: () => Promise<void>,
  control: ProcessControl = processControl,
) {
  yield* labValue("interrupt processes", () => {
    for (const child of children.toReversed()) if (control.alive(child)) control.interrupt(child);
  });
  for (let attempt = 0; attempt < 40; attempt++) {
    if (
      !(yield* labValue("inspect processes", () => children.some((child) => control.alive(child))))
    )
      break;
    yield* Effect.sleep(250);
  }
  if (yield* labValue("inspect processes", () => children.some((child) => control.alive(child))))
    return yield* new LabError({
      operation: "release integration",
      message: "Integration processes remain alive; retain their dependencies and display.",
    });
  const results = yield* Effect.all(
    dependencies.map((release) =>
      labIO("release server dependencies", release).pipe(Effect.result),
    ),
    { concurrency: 4 },
  );
  const display = yield* labIO("stop integration display", stopDisplay).pipe(Effect.result);
  const failures = [...results, display].filter(Result.isFailure).map((result) => result.failure);
  if (failures.length)
    return yield* new LabError({
      operation: "release integration",
      message: "Integration cleanup failed.",
      cause: new AggregateError(failures),
    });
}, Effect.uninterruptible);

function makeRegistry() {
  const children: ChildProcess[] = [];
  const dependencies: Array<() => Promise<void>> = [];
  let ownsDisplay = false;
  return {
    acquireDisplay: (acquire: () => Promise<unknown>) =>
      labIO("start integration display", acquire).pipe(
        Effect.tap(() =>
          Effect.sync(() => {
            ownsDisplay = true;
          }),
        ),
        Effect.uninterruptible,
      ),
    start: (
      program: string,
      args: string[],
      cwd: string,
      log: string,
      env = process.env,
      input = false,
    ) =>
      labValue("start integration process", () => {
        const file = openSync(log, "w", 0o600);
        let child: ChildProcess;
        try {
          child = spawn(program, args, {
            cwd,
            env,
            detached: true,
            stdio: [input ? "pipe" : "ignore", file, file],
          });
        } finally {
          closeSync(file);
        }
        // Attach immediately: spawn can emit an error even if no PID was allocated.
        child.on("error", () => {});
        if (!child.pid) throw new Error(`Could not start ${program}.`);
        children.push(child);
        child.unref();
        return child;
      }),
    retainDependency: (
      acquire: PromiseLike<() => Promise<void>> | (() => PromiseLike<() => Promise<void>>),
    ) =>
      labIO("copy server dependencies", () =>
        typeof acquire === "function" ? acquire() : acquire,
      ).pipe(
        Effect.tap((release) =>
          Effect.sync(() => {
            dependencies.push(release);
          }),
        ),
        Effect.uninterruptible,
      ),
    release: (stopDisplay: () => Promise<void>) =>
      children.length || dependencies.length || ownsDisplay
        ? releaseIntegrationResources(
            children,
            dependencies,
            ownsDisplay ? stopDisplay : async () => {},
          )
        : Effect.void,
  };
}
export class IntegrationResources extends Context.Service<
  IntegrationResources,
  ReturnType<typeof makeRegistry>
>()("Integration/Resources") {}
export function integrationResourcesLayer(stopDisplay: () => Promise<void>) {
  return Layer.effect(
    IntegrationResources,
    Effect.acquireRelease(Effect.sync(makeRegistry), (registry) =>
      registry.release(stopDisplay).pipe(Effect.orDie),
    ),
  );
}
export const startIntegrationProcess = Effect.fn("Integration.startProcess")(function* (
  ...args: Parameters<ReturnType<typeof makeRegistry>["start"]>
) {
  return yield* (yield* IntegrationResources).start(...args);
});
export const retainServerDependencies = Effect.fn("Integration.retainDependencies")(function* (
  acquire: () => PromiseLike<() => Promise<void>>,
) {
  return yield* (yield* IntegrationResources).retainDependency(acquire);
});
