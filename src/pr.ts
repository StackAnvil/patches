import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Effect } from "effect";
import { getSeries, getTarget, root } from "./model.ts";
import { gh, git } from "./process.ts";
import { sync } from "./stack.ts";

export interface ArtifactReference {
  runId?: string;
  artifactId?: string;
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
    const existing = yield* gh(["pr", "list", "--repo", target.upstream, "--head", `StackAnvil:${head}`, "--state", "open", "--json", "number,url"], root);
    const prs = JSON.parse(existing) as { number: number; url: string }[];
    if (prs.length > 1) return yield* Effect.fail(new Error(`Multiple open north-star PRs for ${id}`));
    if (prs[0]) {
      yield* gh(["pr", "edit", String(prs[0].number), "--repo", target.upstream, "--title", feature.title, "--body-file", bodyFile], root);
      return prs[0].url;
    }
    return yield* gh(["pr", "create", "--repo", target.upstream, "--head", `StackAnvil:${head}`, "--base", target.baseBranch, "--title", feature.title, "--body-file", bodyFile, "--draft"], root);
  });
}
