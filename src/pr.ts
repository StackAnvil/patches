import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Effect } from "effect";
import { getSeries, getTarget, root, type Target } from "./model.ts";
import { gh, git } from "./process.ts";
import { sync } from "./stack.ts";

export interface ArtifactReference {
  runId?: string;
  artifactId?: string;
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

export function assignPr(id: string, prUrl?: string) {
  return Effect.gen(function* () {
    const target = yield* Effect.promise(() => getTarget(id));
    const url = prUrl ?? (yield* northStarPr(target))?.url;
    if (!url) return yield* Effect.fail(new Error(`No open north-star PR for ${id}`));
    const desired = [...new Set(target.prAssignees)];
    if (!desired.length) return { url, desired, added: [] };

    const repository = JSON.parse(yield* gh(["api", `repos/${target.upstream}`], root)) as {
      permissions?: { admin?: boolean; maintain?: boolean; push?: boolean; triage?: boolean };
    };
    const permissions = repository.permissions;
    if (!permissions || ![permissions.admin, permissions.maintain, permissions.push, permissions.triage].some(Boolean)) {
      return {
        url,
        desired,
        added: [],
        skippedReason: `Cannot assign ${desired.join(", ")} on ${target.upstream}: this GitHub account lacks upstream triage or write access. Ask an upstream maintainer to assign them.`,
      };
    }

    const pr = JSON.parse(yield* gh(["pr", "view", url, "--repo", target.upstream, "--json", "assignees"], root)) as {
      assignees: { login: string }[];
    };
    const current = new Set(pr.assignees.map(({ login }) => login.toLowerCase()));
    const missing = desired.filter((login) => !current.has(login.toLowerCase()));
    if (missing.length) {
      yield* gh(["pr", "edit", url, "--repo", target.upstream, ...missing.flatMap((login) => ["--add-assignee", login])], root);
    }
    return { url, desired, added: missing };
  });
}

export function renderPrBody(
  id: string,
  feature: { title: string; sourcePr?: string },
  artifact: ArtifactReference = {},
): string {
  if (artifact.artifactId && !artifact.runId) throw new Error("--artifact-id requires --run-id");
  const lines = [
    `## What this changes`,
    "",
    feature.title,
    "",
    `This is the current north-star feature from [StackAnvil's ${id} patch stack](https://github.com/StackAnvil/patches/tree/main/patches/${id}/features). The PR branch contains this feature alone, based on upstream.`,
  ];
  if (feature.sourcePr) lines.push("", `Original proposal: ${feature.sourcePr}`);
  lines.push("", "## Testing", "", "- [ ] Patch applies to current upstream", "- [ ] Project build and relevant tests pass", "- [ ] Manual behavior checked where needed");
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
    const feature = series.features[0];
    if (!feature) return yield* Effect.fail(new Error(`No pending feature for ${id}`));
    return renderPrBody(id, feature, artifact);
  });
}

export function syncPr(id: string, artifact: ArtifactReference = {}) {
  return Effect.gen(function* () {
    const target = yield* Effect.promise(() => getTarget(id));
    const series = yield* Effect.promise(() => getSeries(id));
    const feature = series.features[0];
    if (!feature) return yield* Effect.fail(new Error(`No pending feature for ${id}`));
    const dir = yield* sync(id, "pr");
    const count = yield* git(["rev-list", "--count", `${target.baseSha}..HEAD`], dir);
    if (count !== "1") return yield* Effect.fail(new Error(`Expected exactly one PR commit, found ${count}`));
    const remote = `https://github.com/${target.fork}.git`;
    const head = "stackanvil/north-star";
    const remoteHead = yield* git(["ls-remote", remote, `refs/heads/${head}`], dir);
    const expected = remoteHead.split("\t")[0] ?? "";
    yield* git(["push", `--force-with-lease=refs/heads/${head}:${expected}`, remote, `HEAD:refs/heads/${head}`], dir);
    const body = yield* prBody(id, artifact);
    const bodyFile = join(root, ".stackanvil", `${id}-pr-body.md`);
    yield* Effect.promise(() => mkdir(join(root, ".stackanvil"), { recursive: true }));
    yield* Effect.promise(() => writeFile(bodyFile, body));
    const existing = yield* northStarPr(target);
    if (existing) {
      yield* gh(["pr", "edit", String(existing.number), "--repo", target.upstream, "--title", feature.title, "--body-file", bodyFile], root);
      const assignment = yield* assignPr(id, existing.url);
      if (assignment.skippedReason) console.warn(assignment.skippedReason);
      return existing.url;
    }
    const url = yield* gh(["pr", "create", "--repo", target.upstream, "--head", `StackAnvil:${head}`, "--base", target.baseBranch, "--title", feature.title, "--body-file", bodyFile, "--draft"], root);
    const assignment = yield* assignPr(id, url);
    if (assignment.skippedReason) console.warn(assignment.skippedReason);
    return url;
  });
}
