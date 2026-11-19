import { appendFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { Clock, Effect, Schema } from "effect";
import { parseJson, required, encodeJson, encodeIndentedJson } from "./guards.ts";
import {
  assertPrReady,
  getSeries,
  getTarget,
  patchPaths,
  root,
  type Series,
  type Target,
} from "./model.ts";
import { parsePatchMessage } from "./patch-message.ts";
import { projectPrPatch } from "./pr-patch.ts";
import { command, git } from "./process.ts";

/** A patch stack operation failed. */
// oxlint-disable-next-line unicorn/throw-new-error -- Schema.TaggedError is a class factory.
export class StackError extends Schema.TaggedError<StackError, { readonly brand: unique symbol }>()(
  "StackError",
  {
    message: Schema.String,
    cause: Schema.optionalKey(Schema.Unknown),
  },
) {}

function stackError(cause: unknown): StackError {
  return new StackError({ message: cause instanceof Error ? cause.message : String(cause), cause });
}

const EditSessionSchema = Schema.Struct({
  patchIndex: Schema.Finite,
  remaining: Schema.mutable(Schema.Array(Schema.String)),
  applied: Schema.Finite,
  backupRef: Schema.String,
});
interface EditSession {
  patchIndex: number;
  remaining: string[];
  applied: number;
  backupRef: string;
}

const ApplySessionSchema = Schema.Struct({
  baseSha: Schema.String,
  patches: Schema.mutable(Schema.Array(Schema.String)),
  nextIndex: Schema.Finite,
  prPatch: Schema.optionalKey(Schema.String),
});
interface ApplySession {
  baseSha: string;
  patches: string[];
  nextIndex: number;
  prPatch?: string | undefined;
}

export const workdir = (id: string, mode = "full") =>
  join(root, ".worktrees", mode === "full" ? id : `${id}-${mode}`);
const sessionPath = (id: string) => join(root, ".stackanvil", `${id}.json`);
const applySessionPath = (id: string, mode: string) =>
  join(root, ".stackanvil", `${id}-${mode}-apply.json`);
const syncedRef = (mode: string) => `refs/stackanvil/last-synced-${mode}`;

export function prMode(patchFile?: string): string {
  if (!patchFile) return "pr";
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.patch$/u.test(patchFile)) {
    throw new Error(`Invalid patch filename: ${patchFile}`);
  }
  return `pr-${patchFile.slice(0, -".patch".length)}`;
}

function seriesPaths(id: string, series: Series, mode: "full" | "pr", patchFile?: string) {
  return mode === "pr"
    ? (patchFile
        ? series.upstreamable.filter(({ file }) => file === patchFile)
        : series.upstreamable.slice(0, 1)
      ).map(({ file }) => join(root, "patches", id, "upstreamable", file))
    : patchPaths(id, series);
}

const applyPatch = Effect.fn("applyPatch")(function* (args: string[], dir: string, patch: string) {
  const committer = yield* git(["var", "GIT_COMMITTER_IDENT"], dir).pipe(
    Effect.orElseSucceed(() => ""),
  );
  if (committer) return yield* git(args, dir);

  const text = yield* Effect.promise(() => readFile(patch, "utf8"));
  const author = text.match(/^From: (.+) <([^<>]+)>$/mu);
  if (!author) return yield* new StackError({ message: `Patch has no author identity: ${patch}` });
  return yield* command("git", args, dir, {
    ...process.env,
    GIT_COMMITTER_NAME: author[1],
    GIT_COMMITTER_EMAIL: author[2],
  });
});

const applyRemaining = Effect.fn("applyRemaining")(function* (
  id: string,
  dir: string,
  path: string,
  mode: "full" | "pr",
  modeKey: string,
  session: ApplySession,
  patchFile?: string,
) {
  const recoveryCommand = `bun run stack continue ${id}${mode === "pr" ? " --pr" : ""}${patchFile ? ` --patch ${patchFile}` : ""}`;
  for (const [index, file] of session.patches.entries()) {
    if (index < session.nextIndex) continue;
    const patch = session.prPatch ?? file;
    yield* applyPatch(["am", "--3way", "--committer-date-is-author-date", patch], dir, patch).pipe(
      Effect.mapError(
        (cause) =>
          new StackError({
            message: `${cause.message}\nPatch apply stopped at ${patch}. Resolve the conflict in ${dir}, stage the result, then run ${recoveryCommand}.`,
            cause,
          }),
      ),
    );
    session.nextIndex = index + 1;
    yield* Effect.promise(() => writeFile(path, encodeIndentedJson(session)));
  }
  yield* git(["update-ref", syncedRef(modeKey), "HEAD"], dir);
  yield* Effect.promise(() => rm(path));
  return dir;
});

const cloneIfMissing = Effect.fn("cloneIfMissing")(function* (
  id: string,
  target: Target,
  mode: string,
) {
  const dir = workdir(id, mode);
  if (!existsSync(join(dir, ".git"))) {
    yield* Effect.promise(() => mkdir(join(root, ".worktrees"), { recursive: true }));
    yield* git(["clone", `https://github.com/${target.upstream}.git`, dir], root);
  }
  // Generated checkouts are separate repositories, so the root .gitignore does not apply here.
  const exclude = join(dir, ".git", "info", "exclude");
  const rules = yield* Effect.promise(() => readFile(exclude, "utf8"));
  if (!rules.split(/\r?\n/u).includes("/logs/")) {
    yield* Effect.promise(() => appendFile(exclude, `${rules.endsWith("\n") ? "" : "\n"}/logs/\n`));
  }
  return dir;
});

const ensureClean = Effect.fn("ensureClean")(function* (dir: string) {
  const state = yield* git(["status", "--porcelain"], dir);
  if (state)
    return yield* new StackError({
      message: `Working tree is dirty at ${dir}. Commit or discard changes first.\n${state}`,
    });
});

const resetToBase = Effect.fn("resetToBase")(function* (dir: string, target: Target, mode: string) {
  yield* ensureClean(dir);
  const saved = yield* git(["rev-parse", "--verify", "--quiet", syncedRef(mode)], dir).pipe(
    Effect.orElseSucceed(() => ""),
  );
  const head = yield* git(["rev-parse", "HEAD"], dir);
  if (saved && saved !== head) {
    return yield* new StackError({
      message: `Unexported commits exist at ${dir}. Use stack rebuild or save them before sync.`,
    });
  }
  yield* git(["fetch", "origin", target.baseBranch], dir);
  yield* git(["cat-file", "-e", `${target.baseSha}^{commit}`], dir);
  yield* git(["checkout", "--detach", "--force", target.baseSha], dir);
});

export const sync = Effect.fn("sync")(function* (
  id: string,
  mode: "full" | "pr" = "full",
  patchFile?: string,
) {
  const target = yield* Effect.promise(() => getTarget(id));
  const series = yield* Effect.promise(() => getSeries(id));
  const modeKey = mode === "pr" ? prMode(patchFile) : mode;
  if (mode === "full" && existsSync(sessionPath(id))) {
    return yield* new StackError({
      message: `Edit session active for ${id}; run stack rebuild first.`,
    });
  }
  const path = applySessionPath(id, modeKey);
  if (existsSync(path)) {
    return yield* new StackError({
      message: `Patch apply is unfinished for ${id}. Resolve the conflict and run bun run stack continue ${id}${mode === "pr" ? " --pr" : ""}${patchFile ? ` --patch ${patchFile}` : ""}.`,
    });
  }
  const patches = seriesPaths(id, series, mode, patchFile);
  const [prSource] = patches;
  if (mode === "pr" && (prSource === undefined || patches.length !== 1)) {
    return yield* new StackError({
      message: `No upstreamable patch ${patchFile ?? "at the front of the series"} for ${id}`,
    });
  }
  if (mode === "pr") {
    const selected = patchFile
      ? series.upstreamable.find(({ file }) => file === patchFile)
      : series.upstreamable[0];
    if (!selected) {
      return yield* new StackError({
        message: `No upstreamable patch ${patchFile ?? "at the front of the series"} for ${id}`,
      });
    }
    yield* Effect.try({
      try: () => {
        assertPrReady(selected);
      },
      catch: (cause) => stackError(cause),
    });
  }
  const projected =
    mode === "pr" && prSource !== undefined
      ? yield* Effect.tryPromise({
          try: () => readFile(prSource, "utf8").then((patch) => projectPrPatch(patch, id)),
          catch: stackError,
        })
      : undefined;
  const dir = yield* cloneIfMissing(id, target, modeKey);
  yield* resetToBase(dir, target, modeKey);
  if (patches.length === 0) {
    yield* git(["update-ref", syncedRef(modeKey), "HEAD"], dir);
    return dir;
  }
  yield* Effect.promise(() => mkdir(join(root, ".stackanvil"), { recursive: true }));
  let prPatch: string | undefined;
  if (projected) {
    const file = join(root, ".stackanvil", `${id}-${modeKey}.patch`);
    yield* Effect.promise(() => writeFile(file, projected.patch));
    prPatch = file;
  }
  const session: ApplySession = { baseSha: target.baseSha, patches, nextIndex: 0, prPatch };
  yield* Effect.promise(() => writeFile(path, encodeIndentedJson(session)));
  return yield* applyRemaining(id, dir, path, mode, modeKey, session, patchFile);
});

export const continueApply = Effect.fn("continueApply")(function* (
  id: string,
  mode: "full" | "pr" = "full",
  patchFile?: string,
) {
  const modeKey = mode === "pr" ? prMode(patchFile) : mode;
  const path = applySessionPath(id, modeKey);
  if (!existsSync(path))
    return yield* new StackError({ message: `No unfinished ${mode} patch apply for ${id}.` });
  const target = yield* Effect.promise(() => getTarget(id));
  const series = yield* Effect.promise(() => getSeries(id));
  const sessionText = yield* Effect.promise(() => readFile(path, "utf8"));
  const session: ApplySession = parseJson(ApplySessionSchema, sessionText);
  const patches = seriesPaths(id, series, mode, patchFile);
  if (session.baseSha !== target.baseSha || encodeJson(session.patches) !== encodeJson(patches)) {
    return yield* new StackError({
      message:
        "The base or patch series changed during conflict resolution. Restore them before continuing.",
    });
  }
  const dir = workdir(id, modeKey);
  if (mode === "pr" && !session.prPatch) {
    return yield* new StackError({
      message: "This PR apply predates test exclusion. Abort the apply, then run pr check again.",
    });
  }
  if (!existsSync(join(dir, ".git", "rebase-apply"))) {
    return yield* new StackError({
      message: `Git has no active am operation in ${dir}. Inspect it before removing ${path}.`,
    });
  }
  const commits = yield* commitIds(dir, target.baseSha);
  if (commits.length !== session.nextIndex) {
    return yield* new StackError({
      message: `Expected ${session.nextIndex} applied patches, found ${commits.length}. Inspect ${dir} before continuing.`,
    });
  }
  if (mode === "pr") yield* assertPrProductionChanges(dir, target.baseSha, true, id);
  const patch = session.prPatch ?? session.patches[session.nextIndex];
  if (patch === undefined) {
    return yield* new StackError({
      message: `No patch remains after ${session.nextIndex} applied patches. Inspect ${dir} before continuing.`,
    });
  }
  yield* applyPatch(["am", "--continue"], dir, patch);
  session.nextIndex++;
  yield* Effect.promise(() => writeFile(path, encodeIndentedJson(session)));
  return yield* applyRemaining(id, dir, path, mode, modeKey, session, patchFile);
});

export const assertPrProductionChanges = Effect.fn("assertPrProductionChanges")(function* (
  dir: string,
  baseSha: string,
  staged: boolean = false,
  project?: string,
) {
  const diff = yield* git(
    ["diff", "--binary", ...(staged ? ["--cached", baseSha] : [baseSha, "HEAD"])],
    dir,
  );
  const projected = yield* Effect.try({
    try: () => projectPrPatch(diff, project),
    catch: (cause) => stackError(cause),
  });
  if (projected.omittedTests)
    return yield* new StackError({
      message:
        "PR changes include local tests or test configuration. Remove them from the PR checkout before continuing.",
    });
});

export const abortApply = Effect.fn("abortApply")(function* (
  id: string,
  mode: "full" | "pr" = "full",
  patchFile?: string,
) {
  const modeKey = mode === "pr" ? prMode(patchFile) : mode;
  const path = applySessionPath(id, modeKey);
  if (!existsSync(path))
    return yield* new StackError({ message: `No unfinished ${mode} patch apply for ${id}.` });
  const dir = workdir(id, modeKey);
  if (!existsSync(join(dir, ".git", "rebase-apply"))) {
    return yield* new StackError({
      message: `Git has no active am operation in ${dir}. Inspect it before removing ${path}.`,
    });
  }
  yield* git(["am", "--abort"], dir);
  yield* git(["update-ref", syncedRef(modeKey), "HEAD"], dir);
  yield* Effect.promise(() => rm(path));
  return `Aborted the patch apply in ${dir}. Run bun run ${mode === "pr" ? "pr check" : "stack sync"} ${id}${patchFile ? ` --patch ${patchFile}` : ""} to start again.`;
});

const commitIds = Effect.fn("commitIds")(function* (dir: string, baseSha: string) {
  const output = yield* git(["rev-list", "--reverse", `${baseSha}..HEAD`], dir);
  return output ? output.split("\n") : [];
});

function exportCommit(dir: string, commit: string) {
  // Binary patches need their terminating blank line when there is no signature footer.
  return command(
    "git",
    [
      "format-patch",
      "--binary",
      "--full-index",
      "--zero-commit",
      "--no-signature",
      "--no-stat",
      "--stdout",
      "-1",
      commit,
    ],
    dir,
    process.env,
    false,
  );
}

export const edit = Effect.fn("edit")(function* (id: string, file: string) {
  const target = yield* Effect.promise(() => getTarget(id));
  const series = yield* Effect.promise(() => getSeries(id));
  const paths = patchPaths(id, series);
  const patchIndex = paths.findIndex((path) => path.endsWith(`/${file}`));
  if (patchIndex < 0)
    return yield* new StackError({ message: `Patch ${file} is not in ${id}/series.json` });
  const dir = yield* sync(id);
  const commits = yield* commitIds(dir, target.baseSha);
  const commit = commits[patchIndex];
  if (commit === undefined || commits.length !== paths.length)
    return yield* new StackError({ message: "Patch/commit count mismatch" });
  const backupRef = `refs/stackanvil/backup/${yield* Clock.currentTimeMillis}`;
  yield* git(["update-ref", backupRef, "HEAD"], dir);
  yield* Effect.promise(() => mkdir(join(root, ".stackanvil"), { recursive: true }));
  yield* Effect.promise(() =>
    writeFile(
      sessionPath(id),
      encodeIndentedJson({
        patchIndex,
        remaining: commits.slice(patchIndex + 1),
        applied: 0,
        backupRef,
      } satisfies EditSession),
    ),
  );
  yield* git(["reset", "--hard", commit], dir);
  return dir;
});

function writeSession(id: string, session: EditSession) {
  return Effect.promise(() => writeFile(sessionPath(id), encodeIndentedJson(session)));
}

export const rebuild = Effect.fn("rebuild")(function* (id: string) {
  const target = yield* Effect.promise(() => getTarget(id));
  const series = yield* Effect.promise(() => getSeries(id));
  const dir = workdir(id);
  let session: EditSession | undefined;
  if (existsSync(sessionPath(id))) {
    const sessionText = yield* Effect.promise(() => readFile(sessionPath(id), "utf8"));
    session = parseJson(EditSessionSchema, sessionText);
    if (existsSync(join(dir, ".git", "CHERRY_PICK_HEAD"))) {
      yield* git(["cherry-pick", "--continue"], dir);
      session.applied++;
      yield* writeSession(id, session);
    } else if (session.applied === 0) {
      const unstaged = yield* git(["diff", "--name-only"], dir);
      if (unstaged)
        return yield* new StackError({ message: "Stage your edits before rebuilding the patch." });
      const staged = yield* git(["diff", "--cached", "--name-only"], dir);
      if (staged) yield* git(["commit", "--amend", "--no-edit"], dir);
    }
    for (const commit of session.remaining.slice(session.applied)) {
      yield* git(["cherry-pick", commit], dir);
      session.applied++;
      yield* writeSession(id, session);
    }
  }
  yield* ensureClean(dir);
  const commits = yield* commitIds(dir, target.baseSha);
  const paths = patchPaths(id, series);
  if (commits.length !== paths.length) {
    return yield* new StackError({
      message: `Expected ${paths.length} commits, found ${commits.length}. No patch files changed.`,
    });
  }
  let titleChanged = false;
  for (const [index, path] of paths.entries()) {
    const patch = yield* exportCommit(dir, required(commits[index], `The commit for ${path}`));
    const upstreamable = series.upstreamable[index - series.setup.length];
    if (upstreamable && index < series.setup.length + series.upstreamable.length) {
      const message = parsePatchMessage(patch);
      if (!message.description)
        return yield* new StackError({
          message: `${upstreamable.file} needs a commit body describing the change`,
        });
      if (upstreamable.title !== message.title) {
        upstreamable.title = message.title;
        titleChanged = true;
      }
    }
    const previous = yield* Effect.promise(() => readFile(path, "utf8"));
    const rebuilt = patch;
    if (previous !== rebuilt) {
      yield* Effect.promise(() => writeFile(path, rebuilt));
    }
  }
  if (titleChanged)
    yield* Effect.promise(() =>
      writeFile(join(root, "patches", id, "series.json"), `${encodeIndentedJson(series)}\n`),
    );
  yield* git(["update-ref", syncedRef("full"), "HEAD"], dir);
  if (session) yield* Effect.promise(() => rm(sessionPath(id)));
  return paths.length;
});

export const addPatch = Effect.fn("addPatch")(function* (
  id: string,
  group: "upstreamable" | "deferred",
  expectedTitle?: string,
  reason?: string,
) {
  if (group === "deferred" && !reason?.trim()) {
    return yield* new StackError({
      message: "A deferred patch needs a reason. Pass --reason <text>.",
    });
  }
  const target = yield* Effect.promise(() => getTarget(id));
  const series = yield* Effect.promise(() => getSeries(id));
  if (group === "upstreamable" && series.deferred.length > 0) {
    return yield* new StackError({
      message: `Cannot append an upstreamable patch after deferred patches in ${id}. Insert its commit before the deferred commits, then export the reordered series.`,
    });
  }
  const dir = workdir(id);
  yield* ensureClean(dir);
  const commits = yield* commitIds(dir, target.baseSha);
  const previous = patchPaths(id, series).length;
  if (commits.length !== previous + 1) {
    return yield* new StackError({
      message: `Commit one new change after the current stack before adding a patch. Expected ${previous + 1} commits, found ${commits.length}.`,
    });
  }
  const patch = yield* exportCommit(dir, required(commits.at(-1), "The new commit"));
  const { title, description } = parsePatchMessage(patch);
  if (expectedTitle && expectedTitle !== title)
    return yield* new StackError({
      message: `Supplied title differs from commit subject: ${title}`,
    });
  if (!description)
    return yield* new StackError({
      message: "Add a commit body describing the patch before adding it",
    });
  const slug = title
    .toLowerCase()
    .replace(/^[a-z]+(?:\([^)]*\))?:\s*/u, "")
    .replaceAll(/[^a-z0-9]+/gu, "-")
    .replaceAll(/^-|-$/gu, "")
    .slice(0, 60);
  if (!slug) return yield* new StackError({ message: "Patch title needs words for a filename" });
  const number = String(
    (group === "upstreamable" ? series.upstreamable.length : series.deferred.length) + 1,
  ).padStart(4, "0");
  const file = `${number}-${slug}.patch`;
  if (group === "upstreamable") series.upstreamable.push({ file, title });
  else series.deferred.push({ file, reason: required(reason, "The deferred patch reason").trim() });
  const path = join(root, "patches", id, group, file);
  yield* Effect.promise(() => writeFile(path, patch));
  yield* Effect.promise(() =>
    writeFile(join(root, "patches", id, "series.json"), `${encodeIndentedJson(series)}\n`),
  );
  yield* rebuild(id);
  return path;
});
