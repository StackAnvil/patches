import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Data, Effect } from "effect";
import { stringProperty } from "./guards.ts";

/** Runs a program without a shell and resolves with its standard output and error. */
// oxlint-disable-next-line typescript/strict-void-return -- promisify selects execFile's custom promise overload, so the callback form's ChildProcess result is never used.
export const execFileAsync = promisify(execFile);

/** A child process failed. The message includes its captured output. */
export class CommandError extends Data.TaggedError("CommandError")<{
  readonly message: string;
  readonly cause: unknown;
}> {}

export const command = Effect.fn("command")(function* (
  program: string,
  args: string[],
  cwd: string,
  env: NodeJS.ProcessEnv = process.env,
  trimOutput: boolean = true,
) {
  return yield* Effect.tryPromise({
    try: async (signal) => {
      const { stdout, stderr } = await execFileAsync(program, args, {
        cwd,
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
        env: { ...env, GIT_TERMINAL_PROMPT: "0" },
        signal,
      });
      if (stderr.trim()) process.stderr.write(stderr);
      return trimOutput ? stdout.trimEnd() : stdout;
    },
    catch: (cause) => {
      const output = [stringProperty(cause, "stdout"), stringProperty(cause, "stderr")]
        .filter((value) => value?.trim())
        .join("\n");
      const message = cause instanceof Error ? cause.message : String(cause);
      return new CommandError({
        message: `${program} ${args.join(" ")} failed: ${output || message}`,
        cause,
      });
    },
  });
});

export function git(args: string[], cwd: string) {
  return command("git", args, cwd);
}

export function gh(args: string[], cwd: string) {
  return command("gh", args, cwd);
}
