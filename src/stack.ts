import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { Effect } from "effect";
import { getSeries, getTarget, patchPaths, root, type Series, type Target } from "./model.ts";
import { git } from "./process.ts";

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
const applySessionPath = (id: string, mode: "full" | "pr") => join(root, ".stackanvil", `${id}-${mode}-apply.json`);
const syncedRef = (mode: string) => `refs/stackanvil/last-synced-${mode}`;

function stablePatchText(patch: string): string {
  return patch.trimEnd()
    .replace(/^From [0-9a-f]{40} Mon Sep 17 00:00:00 2001$/m, "From <commit> Mon Sep 17 00:00:00 2001")
    .replace(/\n-- \n[^\n]+$/, "\n-- \n<git-version>");
}

function seriesPaths(id: string, series: Series, mode: "full" | "pr") {
  return mode === "pr"
    ? series.features.slice(0, 1).map(({ file }) => join(root, "patches", id, "features", file))
    : patchPaths(id, series);
}

function applyRemaining(id: string, dir: string, path: string, mode: "full" | "pr", session: ApplySession) {
  return Effect.gen(function* () {
    const recoveryCommand = `bun run stack continue ${id}${mode === "pr" ? " --pr" : ""}`;
    for (let index = session.nextIndex; index < session.patches.length; index++) {
      const patch = session.patches[index]!;
      yield* git([
        "-c", "user.name=StackAnvil Patch Bot",
        "-c", "user.email=patches@stackanvil.invalid",
        "am", "--3way", "--committer-date-is-author-date", patch,
      ], dir).pipe(Effect.mapError((cause) => new Error(
        `${cause.message}\nPatch apply stopped at ${patch}. Resolve the conflict in ${dir}, stage the result, then run ${recoveryCommand}.`,
      )));
      session.nextIndex = index + 1;
      yield* Effect.promise(() => writeFile(path, JSON.stringify(session, null, 2)));
    }
    yield* git(["update-ref", syncedRef(mode), "HEAD"], dir);
    yield* Effect.promise(() => rm(path));
    return dir;
  });
}

function cloneIfMissing(id: string, target: Target, mode: string) {
  return Effect.gen(function* () {
    const dir = workdir(id, mode);
    if (!existsSync(join(dir, ".git"))) {
      yield* Effect.promise(() => mkdir(join(root, ".worktrees"), { recursive: true }));
      yield* git(["clone", `https://github.com/${target.upstream}.git`, dir], root);
    }
    return dir;
  });
}

function ensureClean(dir: string) {
  return Effect.gen(function* () {
    const state = yield* git(["status", "--porcelain"], dir);
    if (state) return yield* Effect.fail(new Error(`Working tree is dirty at ${dir}. Commit or discard changes first.\n${state}`));
  });
}

function resetToBase(dir: string, target: Target, mode: string) {
  return Effect.gen(function* () {
    yield* ensureClean(dir);
    const saved = yield* git(["rev-parse", "--verify", "--quiet", syncedRef(mode)], dir)
      .pipe(Effect.catchAll(() => Effect.succeed("")));
    const head = yield* git(["rev-parse", "HEAD"], dir);
    if (saved && saved !== head) {
      return yield* Effect.fail(new Error(`Unexported commits exist at ${dir}. Use stack rebuild or save them before sync.`));
    }
    yield* git(["fetch", "origin", target.baseBranch], dir);
    yield* git(["cat-file", "-e", `${target.baseSha}^{commit}`], dir);
    yield* git(["checkout", "--detach", "--force", target.baseSha], dir);
  });
}

export function sync(id: string, mode: "full" | "pr" = "full") {
  return Effect.gen(function* () {
    const target = yield* Effect.promise(() => getTarget(id));
    const series = yield* Effect.promise(() => getSeries(id));
    if (mode === "full" && existsSync(sessionPath(id))) {
      return yield* Effect.fail(new Error(`Edit session active for ${id}; run stack rebuild first.`));
    }
    const path = applySessionPath(id, mode);
    if (existsSync(path)) {
      return yield* Effect.fail(new Error(`Patch apply is unfinished for ${id}. Resolve the conflict and run bun run stack continue ${id}${mode === "pr" ? " --pr" : ""}.`));
    }
    const dir = yield* cloneIfMissing(id, target, mode);
    yield* resetToBase(dir, target, mode);
    const patches = seriesPaths(id, series, mode);
    if (mode === "pr" && patches.length !== 1) {
      return yield* Effect.fail(new Error(`No north-star feature patch for ${id}`));
    }
    if (patches.length === 0) {
      yield* git(["update-ref", syncedRef(mode), "HEAD"], dir);
      return dir;
    }
    yield* Effect.promise(() => mkdir(join(root, ".stackanvil"), { recursive: true }));
    const session: ApplySession = { baseSha: target.baseSha, patches, nextIndex: 0 };
    yield* Effect.promise(() => writeFile(path, JSON.stringify(session, null, 2)));
    return yield* applyRemaining(id, dir, path, mode, session);
  });
}

export function continueApply(id: string, mode: "full" | "pr" = "full") {
  return Effect.gen(function* () {
    const path = applySessionPath(id, mode);
    if (!existsSync(path)) return yield* Effect.fail(new Error(`No unfinished ${mode} patch apply for ${id}.`));
    const target = yield* Effect.promise(() => getTarget(id));
    const series = yield* Effect.promise(() => getSeries(id));
    const session = JSON.parse(yield* Effect.promise(() => readFile(path, "utf8"))) as ApplySession;
    const patches = seriesPaths(id, series, mode);
    if (session.baseSha !== target.baseSha || JSON.stringify(session.patches) !== JSON.stringify(patches)) {
      return yield* Effect.fail(new Error("The base or patch series changed during conflict resolution. Restore them before continuing."));
    }
    const dir = workdir(id, mode);
    if (!existsSync(join(dir, ".git", "rebase-apply"))) {
      return yield* Effect.fail(new Error(`Git has no active am operation in ${dir}. Inspect it before removing ${path}.`));
    }
    const commits = yield* commitIds(dir, target.baseSha);
    if (commits.length !== session.nextIndex) {
      return yield* Effect.fail(new Error(`Expected ${session.nextIndex} applied patches, found ${commits.length}. Inspect ${dir} before continuing.`));
    }
    yield* git([
      "-c", "user.name=StackAnvil Patch Bot",
      "-c", "user.email=patches@stackanvil.invalid",
      "am", "--continue",
    ], dir);
    session.nextIndex++;
    yield* Effect.promise(() => writeFile(path, JSON.stringify(session, null, 2)));
    return yield* applyRemaining(id, dir, path, mode, session);
  });
}

export function abortApply(id: string, mode: "full" | "pr" = "full") {
  return Effect.gen(function* () {
    const path = applySessionPath(id, mode);
    if (!existsSync(path)) return yield* Effect.fail(new Error(`No unfinished ${mode} patch apply for ${id}.`));
    const dir = workdir(id, mode);
    if (!existsSync(join(dir, ".git", "rebase-apply"))) {
      return yield* Effect.fail(new Error(`Git has no active am operation in ${dir}. Inspect it before removing ${path}.`));
    }
    yield* git(["am", "--abort"], dir);
    yield* git(["update-ref", syncedRef(mode), "HEAD"], dir);
    yield* Effect.promise(() => rm(path));
    return `Aborted the patch apply in ${dir}. Run bun run ${mode === "pr" ? "pr check" : "stack sync"} ${id} to start again.`;
  });
}

function commitIds(dir: string, baseSha: string) {
  return Effect.gen(function* () {
    const output = yield* git(["rev-list", "--reverse", `${baseSha}..HEAD`], dir);
    return output ? output.split("\n") : [];
  });
}

export function edit(id: string, file: string) {
  return Effect.gen(function* () {
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
}

function writeSession(id: string, session: EditSession) {
  return Effect.promise(() => writeFile(sessionPath(id), JSON.stringify(session, null, 2)));
}

export function rebuild(id: string) {
  return Effect.gen(function* () {
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
    for (const [index, path] of paths.entries()) {
      const patch = yield* git(["format-patch", "--binary", "--stdout", "-1", commits[index]!], dir);
      const previous = yield* Effect.promise(() => readFile(path, "utf8"));
      if (stablePatchText(previous) !== stablePatchText(patch)) {
        yield* Effect.promise(() => writeFile(path, `${patch}\n`));
      }
    }
    yield* git(["update-ref", syncedRef("full"), "HEAD"], dir);
    if (session) yield* Effect.promise(() => rm(sessionPath(id)));
    return paths.length;
  });
}

export function addPatch(id: string, group: "features" | "custom", title: string, sourcePr?: string) {
  return Effect.gen(function* () {
    const target = yield* Effect.promise(() => getTarget(id));
    const series = yield* Effect.promise(() => getSeries(id));
    const dir = workdir(id);
    yield* ensureClean(dir);
    const commits = yield* commitIds(dir, target.baseSha);
    const previous = patchPaths(id, series).length;
    if (commits.length !== previous + 1) {
      return yield* Effect.fail(new Error(`Commit one new change after the current stack before adding a patch. Expected ${previous + 1} commits, found ${commits.length}.`));
    }
    const slug = title.toLowerCase().replace(/^[a-z]+(?:\([^)]*\))?:\s*/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
    if (!slug) return yield* Effect.fail(new Error("Patch title needs words for a filename"));
    const number = String((group === "features" ? series.features.length : series.custom.length) + 1).padStart(4, "0");
    const file = `${number}-${slug}.patch`;
    if (group === "features") series.features.push({ file, title, ...(sourcePr ? { sourcePr } : {}) });
    else series.custom.push(file);
    const path = join(root, "patches", id, group, file);
    yield* Effect.promise(() => writeFile(path, ""));
    yield* Effect.promise(() => writeFile(join(root, "patches", id, "series.json"), `${JSON.stringify(series, null, 2)}\n`));
    yield* rebuild(id);
    return path;
  });
}

export async function sourceSeries(id: string): Promise<{ target: Target; series: Series }> {
  return { target: await getTarget(id), series: await getSeries(id) };
}
