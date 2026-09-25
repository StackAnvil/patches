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

export const workdir = (id: string, mode = "full") => join(root, ".worktrees", mode === "full" ? id : `${id}-${mode}`);
const sessionPath = (id: string) => join(root, ".stackanvil", `${id}.json`);
const syncedRef = (mode: string) => `refs/stackanvil/last-synced-${mode}`;

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
    const dir = yield* cloneIfMissing(id, target, mode);
    yield* resetToBase(dir, target, mode);
    const patches = mode === "pr"
      ? series.features.slice(0, 1).map(({ file }) => join(root, "patches", id, "features", file))
      : patchPaths(id, series);
    if (mode === "pr" && patches.length !== 1) {
      return yield* Effect.fail(new Error(`No north-star feature patch for ${id}`));
    }
    for (const patch of patches) {
      yield* git([
        "-c", "user.name=StackAnvil Patch Bot",
        "-c", "user.email=patches@stackanvil.invalid",
        "am", "--3way", "--committer-date-is-author-date", patch,
      ], dir);
    }
    yield* git(["update-ref", syncedRef(mode), "HEAD"], dir);
    return dir;
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
      yield* Effect.promise(() => writeFile(path, `${patch}\n`));
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
