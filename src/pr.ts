import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Effect, Schema } from "effect";
import { parseJson } from "./guards.ts";
import { getSeries, getTarget, root, type Target, type UpstreamablePatch } from "./model.ts";
import { parsePatchMessage } from "./patch-message.ts";
import { gh, git } from "./process.ts";
import { assertPrProductionChanges, prMode, StackError, sync } from "./stack.ts";
import { printError } from "./output.ts";

export interface ArtifactReference {
  runId?: string | undefined;
  artifactId?: string | undefined;
}

const Login = Schema.Struct({ login: Schema.String });
const PrParticipantsSchema = Schema.Struct({
  author: Login,
  assignees: Schema.Array(Login),
  isDraft: Schema.Boolean,
  reviewRequests: Schema.Array(
    Schema.Struct({ __typename: Schema.String, login: Schema.optionalKey(Schema.String) }),
  ),
  reviews: Schema.Array(Schema.Struct({ author: Schema.NullOr(Login) })),
});
type PrParticipants = typeof PrParticipantsSchema.Type;
const OpenPrsSchema = Schema.Array(
  Schema.Struct({ number: Schema.Finite, html_url: Schema.String }),
);
const RepositorySchema = Schema.Struct({
  permissions: Schema.optionalKey(
    Schema.Struct({
      admin: Schema.optionalKey(Schema.Boolean),
      maintain: Schema.optionalKey(Schema.Boolean),
      push: Schema.optionalKey(Schema.Boolean),
      triage: Schema.optionalKey(Schema.Boolean),
    }),
  ),
});

export function missingPrParticipants(desired: string[], pr: PrParticipants) {
  const assignees = new Set(pr.assignees.map(({ login }) => login.toLowerCase()));
  const requested = new Set(
    pr.reviewRequests.flatMap((request) =>
      request.__typename === "User" && request.login ? [request.login.toLowerCase()] : [],
    ),
  );
  const reviewed = new Set(
    pr.reviews.flatMap(({ author }) => (author ? [author.login.toLowerCase()] : [])),
  );
  const author = pr.author.login.toLowerCase();
  return {
    assignees: desired.filter((login) => !assignees.has(login.toLowerCase())),
    reviewers: desired.filter((login) => {
      const normalized = login.toLowerCase();
      return normalized !== author && !requested.has(normalized) && !reviewed.has(normalized);
    }),
  };
}

export function prHead(patchFile?: string): string {
  return patchFile
    ? `stackanvil/${prMode(patchFile).slice("pr-".length)}`
    : "stackanvil/north-star";
}

function selectedPatch(series: UpstreamablePatch[], patchFile?: string): UpstreamablePatch {
  const selected = patchFile ? series.find(({ file }) => file === patchFile) : series[0];
  if (!selected)
    throw new Error(`No upstreamable patch ${patchFile ?? "at the front of the series"}`);
  return selected;
}

const openPrForHead = Effect.fn("openPrForHead")(function* (target: Target, head: string) {
  const existing = yield* gh(
    [
      "api",
      "-X",
      "GET",
      `repos/${target.upstream}/pulls`,
      "-f",
      "state=open",
      "-f",
      `head=StackAnvil:${head}`,
    ],
    root,
  );
  const prs = parseJson(OpenPrsSchema, existing).map(({ number, html_url }) => ({
    number,
    url: html_url,
  }));
  if (prs.length > 1)
    return yield* StackError.make({
      message: `Multiple open PRs for ${target.upstream} from ${head}`,
    });
  return prs[0];
});

export const updatePrParticipants = Effect.fn("updatePrParticipants")(function* (
  id: string,
  prUrl?: string,
  patchFile?: string,
) {
  const target = yield* Effect.promise(() => getTarget(id));
  const url = prUrl ?? (yield* openPrForHead(target, prHead(patchFile)))?.url;
  if (!url)
    return yield* StackError.make({ message: `No open PR for ${id} from ${prHead(patchFile)}` });
  const desired = [...new Set(target.prAssignees)];
  if (desired.length === 0) return { url, desired, added: [], requested: [] };

  const repositoryText = yield* gh(["api", `repos/${target.upstream}`], root);
  const repository = parseJson(RepositorySchema, repositoryText);
  const permissions = repository.permissions;
  const canAssign = Boolean(
    permissions &&
    [permissions.admin, permissions.maintain, permissions.push, permissions.triage].some(Boolean),
  );
  const canRequestReviews = Boolean(
    permissions && [permissions.admin, permissions.maintain, permissions.push].some(Boolean),
  );
  const prText = yield* gh(
    [
      "pr",
      "view",
      url,
      "--repo",
      target.upstream,
      "--json",
      "author,assignees,isDraft,reviewRequests,reviews",
    ],
    root,
  );
  const pr = parseJson(PrParticipantsSchema, prText);
  const missing = missingPrParticipants(desired, pr);
  const skipped: string[] = [];
  if (missing.assignees.length > 0 && canAssign) {
    yield* gh(
      ["pr", "edit", url, "--repo", target.upstream, "--add-assignee", missing.assignees.join(",")],
      root,
    );
  } else if (missing.assignees.length > 0) {
    skipped.push(
      `Cannot assign ${missing.assignees.join(", ")} on ${target.upstream}: this GitHub account lacks upstream triage or write access.`,
    );
  }
  if (missing.reviewers.length > 0 && pr.isDraft) {
    skipped.push(
      `Review requests for ${missing.reviewers.join(", ")} will wait until the PR is ready for review.`,
    );
  } else if (missing.reviewers.length > 0 && canRequestReviews) {
    yield* gh(
      ["pr", "edit", url, "--repo", target.upstream, "--add-reviewer", missing.reviewers.join(",")],
      root,
    );
  } else if (missing.reviewers.length > 0) {
    skipped.push(
      `Cannot request reviews from ${missing.reviewers.join(", ")} on ${target.upstream}: this GitHub account lacks upstream write access.`,
    );
  }
  return {
    url,
    desired,
    added: canAssign ? missing.assignees : [],
    requested: canRequestReviews && !pr.isDraft ? missing.reviewers : [],
    ...(skipped.length > 0 ? { skippedReason: skipped.join("\n") } : {}),
  };
});

export function renderPrBody(
  id: string,
  description: string,
  extraBody: string,
  artifact: ArtifactReference = {},
  patchFile?: string,
): string {
  if (artifact.artifactId && !artifact.runId) throw new Error("--artifact-id requires --run-id");
  if (!description.trim())
    throw new Error(`The ${id} upstreamable patch needs a commit body describing the change`);
  if (!extraBody.trim())
    throw new Error(`The ${id} upstreamable patch needs a non-empty PR extra body`);
  const provenance = patchFile
    ? `This PR contains [one patch from StackAnvil's ${id} stack](https://github.com/StackAnvil/patches/blob/main/patches/${id}/upstreamable/${patchFile}), applied alone to the pinned upstream base.`
    : `This is the first upstreamable change from [StackAnvil's ${id} patch stack](https://github.com/StackAnvil/patches/tree/main/patches/${id}/upstreamable). The PR branch contains this patch alone, based on upstream.`;
  const lines = [
    `## What this changes`,
    "",
    description.trim(),
    "",
    provenance,
    "",
    id === "cubeconverter"
      ? "This PR includes the complete CubeConverter feature and its regression tests. StackAnvil setup remains excluded."
      : "Test sources, fixtures, and test-only build configuration stay in StackAnvil's local stack and are excluded from this PR.",
    "",
    extraBody.trim(),
  ];
  if (artifact.runId || artifact.artifactId) {
    lines.push("", "## Test artifacts", "");
    if (artifact.runId)
      lines.push(
        `- [Build run](https://github.com/StackAnvil/patches/actions/runs/${artifact.runId})`,
      );
    if (artifact.artifactId)
      lines.push(
        `- [Download artifacts](https://github.com/StackAnvil/patches/actions/runs/${artifact.runId}/artifacts/${artifact.artifactId})`,
      );
    lines.push(
      "",
      "These artifacts are for testing this PR patch. They are separate from StackAnvil's fully patched releases.",
    );
  }
  return `${lines.join("\n")}\n`;
}

export const prBody = Effect.fn("prBody")(function* (
  id: string,
  artifact: ArtifactReference = {},
  patchFile?: string,
) {
  const series = yield* Effect.promise(() => getSeries(id));
  const upstreamable = selectedPatch(series.upstreamable, patchFile);
  const upstreamableDir = join(root, "patches", id, "upstreamable");
  const patch = yield* Effect.promise(() =>
    readFile(join(upstreamableDir, upstreamable.file), "utf8"),
  );
  const message = parsePatchMessage(patch);
  const extraBodyFile = join(upstreamableDir, upstreamable.file.replace(/\.patch$/u, ".pr.md"));
  const extraBody = yield* Effect.tryPromise({
    try: () => readFile(extraBodyFile, "utf8"),
    catch: (cause) =>
      StackError.make({
        message: `Add a PR extra body at ${extraBodyFile} before creating or updating the PR`,
        cause,
      }),
  });
  return renderPrBody(id, message.description, extraBody, artifact, patchFile);
});

export const syncPr = Effect.fn("syncPr")(function* (
  id: string,
  artifact: ArtifactReference = {},
  patchFile?: string,
) {
  const target = yield* Effect.promise(() => getTarget(id));
  const series = yield* Effect.promise(() => getSeries(id));
  const upstreamable = selectedPatch(series.upstreamable, patchFile);
  const body = yield* prBody(id, artifact, patchFile);
  const bodyFile = join(root, ".stackanvil", `${id}-${prMode(patchFile)}-body.md`);
  yield* Effect.promise(() => mkdir(join(root, ".stackanvil"), { recursive: true }));
  yield* Effect.promise(() => writeFile(bodyFile, body));
  const dir = yield* sync(id, "pr", patchFile);
  const count = yield* git(["rev-list", "--count", `${target.baseSha}..HEAD`], dir);
  if (count !== "1")
    return yield* StackError.make({ message: `Expected exactly one PR commit, found ${count}` });
  yield* assertPrProductionChanges(dir, target.baseSha, false, id);
  const remote = `https://github.com/${target.fork}.git`;
  const head = prHead(patchFile);
  const remoteHead = yield* git(["ls-remote", remote, `refs/heads/${head}`], dir);
  const expected = remoteHead.split("\t")[0] ?? "";
  yield* git(
    [
      "push",
      `--force-with-lease=refs/heads/${head}:${expected}`,
      remote,
      `HEAD:refs/heads/${head}`,
    ],
    dir,
  );
  const existing = yield* openPrForHead(target, head);
  if (existing) {
    yield* gh(
      [
        "pr",
        "edit",
        String(existing.number),
        "--repo",
        target.upstream,
        "--title",
        upstreamable.title,
        "--body-file",
        bodyFile,
      ],
      root,
    );
    const assignment = yield* updatePrParticipants(id, existing.url);
    if (assignment.skippedReason) printError(assignment.skippedReason);
    return existing.url;
  }
  const url = yield* gh(
    [
      "pr",
      "create",
      "--repo",
      target.upstream,
      "--head",
      `StackAnvil:${head}`,
      "--base",
      target.baseBranch,
      "--title",
      upstreamable.title,
      "--body-file",
      bodyFile,
      "--draft",
    ],
    root,
  );
  const assignment = yield* updatePrParticipants(id, url);
  if (assignment.skippedReason) printError(assignment.skippedReason);
  return url;
});
