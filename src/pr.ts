import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Effect } from "effect";
import { getSeries, getTarget, root, type Target } from "./model.ts";
import { parsePatchMessage } from "./patch-message.ts";
import { gh, git } from "./process.ts";
import { sync } from "./stack.ts";

export interface ArtifactReference {
  runId?: string;
  artifactId?: string;
}

interface PrParticipants {
  author: { login: string };
  assignees: { login: string }[];
  isDraft: boolean;
  reviewRequests: { __typename: string; login?: string }[];
  reviews: { author: { login: string } | null }[];
}

export function missingPrParticipants(desired: string[], pr: PrParticipants) {
  const assignees = new Set(pr.assignees.map(({ login }) => login.toLowerCase()));
  const requested = new Set(pr.reviewRequests
    .filter((request) => request.__typename === "User" && request.login)
    .map(({ login }) => login!.toLowerCase()));
  const reviewed = new Set(pr.reviews.flatMap(({ author }) => author ? [author.login.toLowerCase()] : []));
  const author = pr.author.login.toLowerCase();
  return {
    assignees: desired.filter((login) => !assignees.has(login.toLowerCase())),
    reviewers: desired.filter((login) => {
      const normalized = login.toLowerCase();
      return normalized !== author && !requested.has(normalized) && !reviewed.has(normalized);
    }),
  };
}

function northStarPr(target: Target) {
  return Effect.gen(function* () {
    const existing = yield* gh(["api", "-X", "GET", `repos/${target.upstream}/pulls`, "-f", "state=open", "-f", "head=StackAnvil:stackanvil/north-star"], root);
    const prs = (JSON.parse(existing) as { number: number; html_url: string }[])
      .map(({ number, html_url }) => ({ number, url: html_url }));
    if (prs.length > 1) return yield* Effect.fail(new Error(`Multiple open north-star PRs for ${target.upstream}`));
    return prs[0];
  });
}

export function updatePrParticipants(id: string, prUrl?: string) {
  return Effect.gen(function* () {
    const target = yield* Effect.promise(() => getTarget(id));
    const url = prUrl ?? (yield* northStarPr(target))?.url;
    if (!url) return yield* Effect.fail(new Error(`No open north-star PR for ${id}`));
    const desired = [...new Set(target.prAssignees)];
    if (!desired.length) return { url, desired, added: [], requested: [] };

    const repository = JSON.parse(yield* gh(["api", `repos/${target.upstream}`], root)) as {
      permissions?: { admin?: boolean; maintain?: boolean; push?: boolean; triage?: boolean };
    };
    const permissions = repository.permissions;
    const canAssign = Boolean(permissions && [permissions.admin, permissions.maintain, permissions.push, permissions.triage].some(Boolean));
    const canRequestReviews = Boolean(permissions && [permissions.admin, permissions.maintain, permissions.push].some(Boolean));
    const pr = JSON.parse(yield* gh(["pr", "view", url, "--repo", target.upstream, "--json", "author,assignees,isDraft,reviewRequests,reviews"], root)) as PrParticipants;
    const missing = missingPrParticipants(desired, pr);
    const skipped: string[] = [];
    if (missing.assignees.length && canAssign) {
      yield* gh(["pr", "edit", url, "--repo", target.upstream, "--add-assignee", missing.assignees.join(",")], root);
    } else if (missing.assignees.length) {
      skipped.push(`Cannot assign ${missing.assignees.join(", ")} on ${target.upstream}: this GitHub account lacks upstream triage or write access.`);
    }
    if (missing.reviewers.length && pr.isDraft) {
      skipped.push(`Review requests for ${missing.reviewers.join(", ")} will wait until the PR is ready for review.`);
    } else if (missing.reviewers.length && canRequestReviews) {
      yield* gh(["pr", "edit", url, "--repo", target.upstream, "--add-reviewer", missing.reviewers.join(",")], root);
    } else if (missing.reviewers.length) {
      skipped.push(`Cannot request reviews from ${missing.reviewers.join(", ")} on ${target.upstream}: this GitHub account lacks upstream write access.`);
    }
    return {
      url,
      desired,
      added: canAssign ? missing.assignees : [],
      requested: canRequestReviews && !pr.isDraft ? missing.reviewers : [],
      ...(skipped.length ? { skippedReason: skipped.join("\n") } : {}),
    };
  });
}

export function renderPrBody(
  id: string,
  description: string,
  extraBody: string,
  artifact: ArtifactReference = {},
): string {
  if (artifact.artifactId && !artifact.runId) throw new Error("--artifact-id requires --run-id");
  if (!description.trim()) throw new Error(`The first ${id} upstreamable patch needs a commit body describing the change`);
  if (!extraBody.trim()) throw new Error(`The first ${id} upstreamable patch needs a non-empty PR extra body`);
  const lines = [
    `## What this changes`,
    "",
    description.trim(),
    "",
    `This is the first upstreamable change from [StackAnvil's ${id} patch stack](https://github.com/StackAnvil/patches/tree/main/patches/${id}/upstreamable). The PR branch contains this patch alone, based on upstream.`,
    "",
    extraBody.trim(),
  ];
  if (artifact.runId || artifact.artifactId) {
    lines.push("", "## Test artifacts", "");
    if (artifact.runId) lines.push(`- [Build run](https://github.com/StackAnvil/patches/actions/runs/${artifact.runId})`);
    if (artifact.artifactId) lines.push(`- [Download artifacts](https://github.com/StackAnvil/patches/actions/runs/${artifact.runId}/artifacts/${artifact.artifactId})`);
    lines.push("", "These artifacts are for testing this PR patch. They are separate from StackAnvil's fully patched releases.");
  }
  return `${lines.join("\n")}\n`;
}

export function prBody(id: string, artifact: ArtifactReference = {}) {
  return Effect.gen(function* () {
    const series = yield* Effect.promise(() => getSeries(id));
    const upstreamable = series.upstreamable[0];
    if (!upstreamable) return yield* Effect.fail(new Error(`No pending upstreamable patch for ${id}`));
    const upstreamableDir = join(root, "patches", id, "upstreamable");
    const patch = yield* Effect.promise(() => readFile(join(upstreamableDir, upstreamable.file), "utf8"));
    const message = parsePatchMessage(patch);
    const extraBodyFile = join(upstreamableDir, upstreamable.file.replace(/\.patch$/, ".pr.md"));
    const extraBody = yield* Effect.tryPromise({
      try: () => readFile(extraBodyFile, "utf8"),
      catch: () => new Error(`Add a PR extra body at ${extraBodyFile} before creating or updating the PR`),
    });
    return renderPrBody(id, message.description, extraBody, artifact);
  });
}

export function syncPr(id: string, artifact: ArtifactReference = {}) {
  return Effect.gen(function* () {
    const target = yield* Effect.promise(() => getTarget(id));
    const series = yield* Effect.promise(() => getSeries(id));
    const upstreamable = series.upstreamable[0];
    if (!upstreamable) return yield* Effect.fail(new Error(`No pending upstreamable patch for ${id}`));
    const body = yield* prBody(id, artifact);
    const bodyFile = join(root, ".stackanvil", `${id}-pr-body.md`);
    yield* Effect.promise(() => mkdir(join(root, ".stackanvil"), { recursive: true }));
    yield* Effect.promise(() => writeFile(bodyFile, body));
    const dir = yield* sync(id, "pr");
    const count = yield* git(["rev-list", "--count", `${target.baseSha}..HEAD`], dir);
    if (count !== "1") return yield* Effect.fail(new Error(`Expected exactly one PR commit, found ${count}`));
    const remote = `https://github.com/${target.fork}.git`;
    const head = "stackanvil/north-star";
    const remoteHead = yield* git(["ls-remote", remote, `refs/heads/${head}`], dir);
    const expected = remoteHead.split("\t")[0] ?? "";
    yield* git(["push", `--force-with-lease=refs/heads/${head}:${expected}`, remote, `HEAD:refs/heads/${head}`], dir);
    const existing = yield* northStarPr(target);
    if (existing) {
      yield* gh(["pr", "edit", String(existing.number), "--repo", target.upstream, "--title", upstreamable.title, "--body-file", bodyFile], root);
      const assignment = yield* updatePrParticipants(id, existing.url);
      if (assignment.skippedReason) console.warn(assignment.skippedReason);
      return existing.url;
    }
    const url = yield* gh(["pr", "create", "--repo", target.upstream, "--head", `StackAnvil:${head}`, "--base", target.baseBranch, "--title", upstreamable.title, "--body-file", bodyFile, "--draft"], root);
    const assignment = yield* updatePrParticipants(id, url);
    if (assignment.skippedReason) console.warn(assignment.skippedReason);
    return url;
  });
}
