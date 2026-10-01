import { appendFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { Effect } from "effect";
import { getSeries, getTarget, patchPaths, root, type Series, type Target } from "./model.ts";
import { parsePatchMessage } from "./patch-message.ts";
import { command, git } from "./process.ts";

interface EditSession {
  patchIndex: number;
  remaining: string[];
  applied: number;
  backupRef: string;
}

interface ApplySession {
  baseSha: string;
  patches: string[];
  nextIndex: number;
}

export const workdir = (id: string, mode = "full") => join(root, ".worktrees", mode === "full" ? id : `${id}-${mode}`);
const sessionPath = (id: string) => join(root, ".stackanvil", `${id}.json`);
const applySessionPath = (id: string, mode: string) => join(root, ".stackanvil", `${id}-${mode}-apply.json`);
const syncedRef = (mode: string) => `refs/stackanvil/last-synced-${mode}`;

export function prMode(patchFile?: string): string {
  if (!patchFile) return "pr";
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.patch$/.test(patchFile)) {
    throw new Error(`Invalid patch filename: ${patchFile}`);
  }
  return `pr-${patchFile.slice(0, -".patch".length)}`;
}

function stablePatchText(patch: string): string {
  return patch.trimEnd()
    .replace(/^From [0-9a-f]{40} Mon Sep 17 00:00:00 2001$/m, "From <commit> Mon Sep 17 00:00:00 2001")
    .replace(/\n-- \n[^\n]+$/, "\n-- \n<git-version>");
}

function seriesPaths(id: string, series: Series, mode: "full" | "pr", patchFile?: string) {
  return mode === "pr"
    ? (patchFile ? series.upstreamable.filter(({ file }) => file === patchFile) : series.upstreamable.slice(0, 1))
      .map(({ file }) => join(root, "patches", id, "upstreamable", file))
    : patchPaths(id, series);
}

const applyPatch = Effect.fn("applyPatch")(function* (args: string[], dir: string, patch: string) {
  const committer = yield* git(["var", "GIT_COMMITTER_IDENT"], dir).pipe(Effect.catch(() => Effect.succeed("")));
  if (committer) return yield* git(args, dir);

  const text = yield* Effect.promise(() => readFile(patch, "utf8"));
  const author = text.match(/^From: (.+) <([^<>]+)>$/m);
  if (!author) return yield* Effect.fail(new Error(`Patch has no author identity: ${patch}`));
  return yield* command("git", args, dir, {
    ...process.env,
    GIT_COMMITTER_NAME: author[1],
    GIT_COMMITTER_EMAIL: author[2],
  });
});

const applyRemaining = Effect.fn("applyRemaining")(function* (id: string, dir: string, path: string, mode: "full" | "pr", modeKey: string, session: ApplySession, patchFile?: string) {
  const recoveryCommand = `bun run stack continue ${id}${mode === "pr" ? " --pr" : ""}${patchFile ? ` --patch ${patchFile}` : ""}`;
  for (let index = session.nextIndex; index < session.patches.length; index++) {
    const patch = session.patches[index]!;
    yield* applyPatch(["am", "--3way", "--committer-date-is-author-date", patch], dir, patch).pipe(Effect.mapError((cause) => new Error(
      `${cause.message}\nPatch apply stopped at ${patch}. Resolve the conflict in ${dir}, stage the result, then run ${recoveryCommand}.`,
    )));
    session.nextIndex = index + 1;
    yield* Effect.promise(() => writeFile(path, JSON.stringify(session, null, 2)));
  }
  yield* git(["update-ref", syncedRef(modeKey), "HEAD"], dir);
  yield* Effect.promise(() => rm(path));
  return dir;
});

const cloneIfMissing = Effect.fn("cloneIfMissing")(function* (id: string, target: Target, mode: string) {
  const dir = workdir(id, mode);
  if (!existsSync(join(dir, ".git"))) {
    yield* Effect.promise(() => mkdir(join(root, ".worktrees"), { recursive: true }));
    yield* git(["clone", `https://github.com/${target.upstream}.git`, dir], root);
  }
  // Generated checkouts are separate repositories, so the root .gitignore does not apply here.
  const exclude = join(dir, ".git", "info", "exclude");
  const rules = yield* Effect.promise(() => readFile(exclude, "utf8"));
  if (!rules.split(/\r?\n/).includes("/logs/")) {
    yield* Effect.promise(() => appendFile(exclude, `${rules.endsWith("\n") ? "" : "\n"}/logs/\n`));
  }
  return dir;
});

const ensureClean = Effect.fn("ensureClean")(function* (dir: string) {
  const state = yield* git(["status", "--porcelain"], dir);
  if (state) return yield* Effect.fail(new Error(`Working tree is dirty at ${dir}. Commit or discard changes first.\n${state}`));
});

const resetToBase = Effect.fn("resetToBase")(function* (dir: string, target: Target, mode: string) {
  yield* ensureClean(dir);
  const saved = yield* git(["rev-parse", "--verify", "--quiet", syncedRef(mode)], dir)
    .pipe(Effect.catch(() => Effect.succeed("")));
  const head = yield* git(["rev-parse", "HEAD"], dir);
  if (saved && saved !== head) {
    return yield* Effect.fail(new Error(`Unexported commits exist at ${dir}. Use stack rebuild or save them before sync.`));
  }
  yield* git(["fetch", "origin", target.baseBranch], dir);
  yield* git(["cat-file", "-e", `${target.baseSha}^{commit}`], dir);
  yield* git(["checkout", "--detach", "--force", target.baseSha], dir);
});

export const sync = Effect.fn("sync")(function* (id: string, mode: "full" | "pr" = "full", patchFile?: string) {
  const target = yield* Effect.promise(() => getTarget(id));
  const series = yield* Effect.promise(() => getSeries(id));
  const modeKey = mode === "pr" ? prMode(patchFile) : mode;
  if (mode === "full" && existsSync(sessionPath(id))) {
    return yield* Effect.fail(new Error(`Edit session active for ${id}; run stack rebuild first.`));
  }
  const path = applySessionPath(id, modeKey);
  if (existsSync(path)) {
    return yield* Effect.fail(new Error(`Patch apply is unfinished for ${id}. Resolve the conflict and run bun run stack continue ${id}${mode === "pr" ? " --pr" : ""}${patchFile ? ` --patch ${patchFile}` : ""}.`));
  }
  const patches = seriesPaths(id, series, mode, patchFile);
  if (mode === "pr" && patches.length !== 1) {
    return yield* Effect.fail(new Error(`No upstreamable patch ${patchFile ?? "at the front of the series"} for ${id}`));
  }
  const dir = yield* cloneIfMissing(id, target, modeKey);
  yield* resetToBase(dir, target, modeKey);
  if (patches.length === 0) {
    yield* git(["update-ref", syncedRef(modeKey), "HEAD"], dir);
    return dir;
  }
  yield* Effect.promise(() => mkdir(join(root, ".stackanvil"), { recursive: true }));
  const session: ApplySession = { baseSha: target.baseSha, patches, nextIndex: 0 };
  yield* Effect.promise(() => writeFile(path, JSON.stringify(session, null, 2)));
  return yield* applyRemaining(id, dir, path, mode, modeKey, session, patchFile);
});

export const continueApply = Effect.fn("continueApply")(function* (id: string, mode: "full" | "pr" = "full", patchFile?: string) {
  const modeKey = mode === "pr" ? prMode(patchFile) : mode;
  const path = applySessionPath(id, modeKey);
  if (!existsSync(path)) return yield* Effect.fail(new Error(`No unfinished ${mode} patch apply for ${id}.`));
  const target = yield* Effect.promise(() => getTarget(id));
  const series = yield* Effect.promise(() => getSeries(id));
  const session = JSON.parse(yield* Effect.promise(() => readFile(path, "utf8"))) as ApplySession;
  const patches = seriesPaths(id, series, mode, patchFile);
  if (session.baseSha !== target.baseSha || JSON.stringify(session.patches) !== JSON.stringify(patches)) {
    return yield* Effect.fail(new Error("The base or patch series changed during conflict resolution. Restore them before continuing."));
  }
  const dir = workdir(id, modeKey);
  if (!existsSync(join(dir, ".git", "rebase-apply"))) {
    return yield* Effect.fail(new Error(`Git has no active am operation in ${dir}. Inspect it before removing ${path}.`));
  }
  const commits = yield* commitIds(dir, target.baseSha);
  if (commits.length !== session.nextIndex) {
    return yield* Effect.fail(new Error(`Expected ${session.nextIndex} applied patches, found ${commits.length}. Inspect ${dir} before continuing.`));
  }
  yield* applyPatch(["am", "--continue"], dir, session.patches[session.nextIndex]!);
  session.nextIndex++;
  yield* Effect.promise(() => writeFile(path, JSON.stringify(session, null, 2)));
  return yield* applyRemaining(id, dir, path, mode, modeKey, session, patchFile);
});

export const abortApply = Effect.fn("abortApply")(function* (id: string, mode: "full" | "pr" = "full", patchFile?: string) {
  const modeKey = mode === "pr" ? prMode(patchFile) : mode;
  const path = applySessionPath(id, modeKey);
  if (!existsSync(path)) return yield* Effect.fail(new Error(`No unfinished ${mode} patch apply for ${id}.`));
  const dir = workdir(id, modeKey);
  if (!existsSync(join(dir, ".git", "rebase-apply"))) {
    return yield* Effect.fail(new Error(`Git has no active am operation in ${dir}. Inspect it before removing ${path}.`));
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

export const edit = Effect.fn("edit")(function* (id: string, file: string) {
  const target = yield* Effect.promise(() => getTarget(id));
  const series = yield* Effect.promise(() => getSeries(id));
  const paths = patchPaths(id, series);
  const patchIndex = paths.findIndex((path) => path.endsWith(`/${file}`));
  if (patchIndex < 0) return yield* Effect.fail(new Error(`Patch ${file} is not in ${id}/series.json`));
  const dir = yield* sync(id);
  const commits = yield* commitIds(dir, target.baseSha);
  if (commits.length !== paths.length) return yield* Effect.fail(new Error("Patch/commit count mismatch"));
  const backupRef = `refs/stackanvil/backup/${Date.now()}`;
  yield* git(["update-ref", backupRef, "HEAD"], dir);
  yield* Effect.promise(() => mkdir(join(root, ".stackanvil"), { recursive: true }));
  yield* Effect.promise(() => writeFile(sessionPath(id), JSON.stringify({
    patchIndex, remaining: commits.slice(patchIndex + 1), applied: 0, backupRef,
  } satisfies EditSession, null, 2)));
  yield* git(["reset", "--hard", commits[patchIndex]!], dir);
  return dir;
});

function writeSession(id: string, session: EditSession) {
  return Effect.promise(() => writeFile(sessionPath(id), JSON.stringify(session, null, 2)));
}

export const rebuild = Effect.fn("rebuild")(function* (id: string) {
  const target = yield* Effect.promise(() => getTarget(id));
  const series = yield* Effect.promise(() => getSeries(id));
  const dir = workdir(id);
  let session: EditSession | undefined;
  if (existsSync(sessionPath(id))) {
    session = JSON.parse(yield* Effect.promise(() => readFile(sessionPath(id), "utf8"))) as EditSession;
    if (existsSync(join(dir, ".git", "CHERRY_PICK_HEAD"))) {
      yield* git(["cherry-pick", "--continue"], dir);
      session.applied++;
      yield* writeSession(id, session);
    } else if (session.applied === 0) {
      const unstaged = yield* git(["diff", "--name-only"], dir);
      if (unstaged) return yield* Effect.fail(new Error("Stage your edits before rebuilding the patch."));
      const staged = yield* git(["diff", "--cached", "--name-only"], dir);
      if (staged) yield* git(["commit", "--amend", "--no-edit"], dir);
    }
    for (; session.applied < session.remaining.length; session.applied++) {
      yield* git(["cherry-pick", session.remaining[session.applied]!], dir);
      yield* writeSession(id, { ...session, applied: session.applied + 1 });
    }
  }
  yield* ensureClean(dir);
  const commits = yield* commitIds(dir, target.baseSha);
  const paths = patchPaths(id, series);
  if (commits.length !== paths.length) {
    return yield* Effect.fail(new Error(`Expected ${paths.length} commits, found ${commits.length}. No patch files changed.`));
  }
  let titleChanged = false;
  for (const [index, path] of paths.entries()) {
    const patch = yield* git(["format-patch", "--binary", "--stdout", "-1", commits[index]!], dir);
    const upstreamable = series.upstreamable[index - series.setup.length];
    if (upstreamable && index < series.setup.length + series.upstreamable.length) {
      const message = parsePatchMessage(patch);
      if (!message.description) return yield* Effect.fail(new Error(`${upstreamable.file} needs a commit body describing the change`));
      if (upstreamable.title !== message.title) {
        upstreamable.title = message.title;
        titleChanged = true;
      }
    }
    const previous = yield* Effect.promise(() => readFile(path, "utf8"));
    if (stablePatchText(previous) !== stablePatchText(patch)) {
      yield* Effect.promise(() => writeFile(path, `${patch}\n`));
    }
  }
  if (titleChanged) yield* Effect.promise(() => writeFile(join(root, "patches", id, "series.json"), `${JSON.stringify(series, null, 2)}\n`));
  yield* git(["update-ref", syncedRef("full"), "HEAD"], dir);
  if (session) yield* Effect.promise(() => rm(sessionPath(id)));
  return paths.length;
});

export const addPatch = Effect.fn("addPatch")(function* (id: string, group: "upstreamable" | "deferred", expectedTitle?: string, reason?: string) {
  if (group === "deferred" && !reason?.trim()) {
    return yield* Effect.fail(new Error("A deferred patch needs a reason. Pass --reason <text>."));
  }
  const target = yield* Effect.promise(() => getTarget(id));
  const series = yield* Effect.promise(() => getSeries(id));
  if (group === "upstreamable" && series.deferred.length) {
    return yield* Effect.fail(new Error(`Cannot append an upstreamable patch after deferred patches in ${id}. Insert its commit before the deferred commits, then export the reordered series.`));
  }
  const dir = workdir(id);
  yield* ensureClean(dir);
  const commits = yield* commitIds(dir, target.baseSha);
  const previous = patchPaths(id, series).length;
  if (commits.length !== previous + 1) {
    return yield* Effect.fail(new Error(`Commit one new change after the current stack before adding a patch. Expected ${previous + 1} commits, found ${commits.length}.`));
  }
  const patch = yield* git(["format-patch", "--binary", "--stdout", "-1", commits.at(-1)!], dir);
  const { title, description } = parsePatchMessage(patch);
  if (expectedTitle && expectedTitle !== title) return yield* Effect.fail(new Error(`Supplied title differs from commit subject: ${title}`));
  if (!description) return yield* Effect.fail(new Error("Add a commit body describing the patch before adding it"));
  const slug = title.toLowerCase().replace(/^[a-z]+(?:\([^)]*\))?:\s*/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  if (!slug) return yield* Effect.fail(new Error("Patch title needs words for a filename"));
  const number = String((group === "upstreamable" ? series.upstreamable.length : series.deferred.length) + 1).padStart(4, "0");
  const file = `${number}-${slug}.patch`;
  if (group === "upstreamable") series.upstreamable.push({ file, title });
  else series.deferred.push({ file, reason: reason!.trim() });
  const path = join(root, "patches", id, group, file);
  yield* Effect.promise(() => writeFile(path, `${patch}\n`));
  yield* Effect.promise(() => writeFile(join(root, "patches", id, "series.json"), `${JSON.stringify(series, null, 2)}\n`));
  yield* rebuild(id);
  return path;
});
