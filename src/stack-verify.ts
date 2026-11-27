import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { join, relative } from "node:path";
import { Effect } from "effect";
import { getSeries, getTargets, root, type Target } from "./model.ts";
import { command } from "./process.ts";

// Git exports these to hooks. They would point scratch commands at the repository being pushed.
const repositoryVariables = new Set([
  "GIT_DIR",
  "GIT_WORK_TREE",
  "GIT_INDEX_FILE",
  "GIT_OBJECT_DIRECTORY",
  "GIT_ALTERNATE_OBJECT_DIRECTORIES",
  "GIT_COMMON_DIR",
  "GIT_PREFIX",
]);

const scratchConfig = [
  "user.name=StackAnvil verify",
  "user.email=verify@stackanvil.invalid",
  "commit.gpgSign=false",
  "core.hooksPath=/dev/null",
];

function scratchEnvironment(): NodeJS.ProcessEnv {
  return Object.fromEntries(
    Object.entries(process.env).filter(([name]) => !repositoryVariables.has(name)),
  );
}

const runGit = (args: string[], cwd: string) =>
  Effect.runPromise(command("git", args, cwd, scratchEnvironment()));

/** Returns the projects whose committed stack a change to these repository paths can break. */
export function affectedProjects(files: readonly string[], ids: readonly string[]): string[] {
  // A new pinned base changes what every patch applies to.
  if (files.includes("targets.json")) return [...ids];
  const changed = new Set(
    files
      .flatMap((file) => /^patches\/([^/]+)(?:\/|$)/u.exec(file)?.[1] ?? [])
      .filter((id) => ids.includes(id)),
  );
  return ids.filter((id) => changed.has(id));
}

async function hasCommit(directory: string, sha: string): Promise<boolean> {
  try {
    await runGit(["cat-file", "-e", `${sha}^{commit}`], directory);
    return true;
  } catch {
    return false;
  }
}

/**
 * Applies a project's series to its pinned base in a disposable clone.
 * Resolves with the first patch that does not apply, relative to the repository, or undefined.
 */
export async function replayStack(
  id: string,
  target: Target,
  repository: string,
  scratch: string,
  upstream = `https://github.com/${target.upstream}.git`,
): Promise<string | undefined> {
  const series = await getSeries(id, repository);
  const directory = await mkdtemp(join(scratch, `${id}-`));
  try {
    const editing = join(root, ".worktrees", id);
    const config = scratchConfig.flatMap((setting) => ["--config", setting]);
    // Borrow the editing checkout's objects when it has the base, so the check needs no network.
    if (existsSync(join(editing, ".git")) && (await hasCommit(editing, target.baseSha)))
      await runGit(
        ["clone", "-q", "--shared", "--no-checkout", ...config, editing, directory],
        scratch,
      );
    else
      await runGit(
        [
          "clone",
          "-q",
          "--no-checkout",
          "--single-branch",
          "--branch",
          target.baseBranch,
          ...config,
          upstream,
          directory,
        ],
        scratch,
      );
    await runGit(["checkout", "-q", "--detach", target.baseSha], directory);
    const patches = [
      ...series.setup.map((file) => join("setup", file)),
      ...series.upstreamable.map(({ file }) => join("upstreamable", file)),
      ...series.deferred.map(({ file }) => join("deferred", file)),
    ].map((file) => join(repository, "patches", id, file));
    for (const patch of patches) {
      try {
        await runGit(["am", "-q", "--3way", "--committer-date-is-author-date", patch], directory);
      } catch {
        return relative(repository, patch);
      }
    }
    return undefined;
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

/**
 * Replays the stacks that the given paths affect, as committed at `revision`.
 * Resolves with one message per stack that does not apply.
 */
export async function verifyStacks(files: readonly string[], revision = "HEAD"): Promise<string[]> {
  const scratchRoot = join(root, ".stackanvil");
  await mkdir(scratchRoot, { recursive: true });
  const scratch = await mkdtemp(join(scratchRoot, "verify-"));
  try {
    // Patch files merge as plain text, so check the committed snapshot, not the working tree.
    const snapshot = join(scratch, "snapshot");
    await mkdir(snapshot);
    const archive = join(scratch, "snapshot.tar");
    await runGit(
      ["archive", "--format=tar", "-o", archive, revision, "targets.json", "patches"],
      root,
    );
    await Effect.runPromise(command("tar", ["-xf", archive, "-C", snapshot], scratch));
    const targets = await getTargets(snapshot);
    const failures: string[] = [];
    for (const id of affectedProjects(files, Object.keys(targets))) {
      const target = targets[id];
      if (!target) continue;
      const failed = await replayStack(id, target, snapshot, scratch);
      if (failed)
        failures.push(
          `${id} stops at ${failed}. Run bun run stack sync ${id}, resolve the conflict, then stack continue and stack rebuild.`,
        );
    }
    return failures;
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
}
