import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Effect } from "effect";

const execFileAsync = promisify(execFile);

export const command = Effect.fn("command")(function* (program: string, args: string[], cwd: string, env: NodeJS.ProcessEnv = process.env) {
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
      return stdout.trimEnd();
    },
    catch: (cause) => {
      const error = cause as Error & { stdout?: string; stderr?: string };
      return new Error(`${program} ${args.join(" ")} failed: ${error.stderr || error.message}`, { cause });
    },
  });
});

export function git(args: string[], cwd: string) {
  return command("git", args, cwd);
}

export function gh(args: string[], cwd: string) {
  return command("gh", args, cwd);
}
