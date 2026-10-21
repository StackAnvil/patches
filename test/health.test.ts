import { expect, test } from "bun:test";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Effect } from "effect";
import { healthFailed, inspectUpstream, patchHealth, prerequisiteCycles, type ProjectHealth } from "../src/health.ts";
import type { Series, Target } from "../src/model.ts";
import { git } from "../src/process.ts";

const runGit = (args: string[], directory: string) => Effect.runPromise(git(args, directory));

test("reports cycles across projects and preserves independent prerequisites", () => {
  const stack = (file: string, project: string, dependency: string): Series => ({
    setup: [], deferred: [], upstreamable: [{ file, title: "feat(test): add fixture",
      prerequisites: [{ project, patch: dependency, reason: "Requires the shared API." }] }],
  });
  expect(prerequisiteCycles({ core: stack("core.patch", "addon", "addon.patch"),
    addon: stack("addon.patch", "core", "core.patch") })).toEqual([
    ["core/core.patch", "addon/addon.patch", "core/core.patch"],
  ]);
  expect(prerequisiteCycles({ core: { setup: [], deferred: [], upstreamable: [] },
    addon: stack("addon.patch", "core", "core.patch") })).toEqual([]);
});

test("offline health rejects a prerequisite file that is not in its project's series", async () => {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-health-metadata-"));
  try {
    const patches = join(directory, "patches", "fixture", "upstreamable");
    await mkdir(patches, { recursive: true });
    await writeFile(join(directory, "targets.json"), JSON.stringify({ fixture: { dependsOn: [], baseSha: "base" } }));
    await writeFile(join(patches, "orphan.patch"), "unlisted prerequisite");
    await writeFile(join(patches, "feature.patch"), "From: Fixture <fixture@example.invalid>\nSubject: feat(test): add fixture\n\nRequires the shared API.\n\n---\n");
    await writeFile(join(directory, "patches", "fixture", "series.json"), JSON.stringify({
      setup: [], deferred: [], upstreamable: [{ file: "feature.patch", title: "feat(test): add fixture",
        prerequisites: [{ project: "fixture", patch: "orphan.patch", reason: "Requires the shared API." }] }],
    }));
    const report = await patchHealth("all", { repository: directory });
    expect(healthFailed(report)).toBe(true);
    expect(report.errors).toHaveLength(1);
    expect(report.projects[0]!.patches[0]).toMatchObject({
      standalone: "not-run", upstreamEquivalent: "not-checked", prContext: false,
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("upstream inspection recognizes equivalent patches and rehearses updates without touching editing checkouts", async () => {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-health-git-"));
  try {
    const upstream = join(directory, "upstream");
    await mkdir(upstream);
    await runGit(["init", "-b", "main"], upstream);
    await runGit(["config", "user.name", "Health Test"], upstream);
    await runGit(["config", "user.email", "test@example.invalid"], upstream);
    const commit = async (content: string) => {
      await writeFile(join(upstream, "note.txt"), content);
      await runGit(["add", "note.txt"], upstream);
      await runGit(["commit", "-m", "fix(test): update fixture", "-m", "Exercise patch health without network access."], upstream);
      return runGit(["rev-parse", "HEAD"], upstream);
    };
    const baseSha = await commit("base\n");
    const patchDir = join(directory, "patches", "fixture", "upstreamable");
    await mkdir(patchDir, { recursive: true });
    const first = await commit("first\n");
    const firstPatch = await runGit(["format-patch", "-1", "--stdout"], upstream);
    await writeFile(join(patchDir, "first.patch"), firstPatch);
    await commit("second\n");
    await writeFile(join(patchDir, "second.patch"), await runGit(["format-patch", "-1", "--stdout"], upstream));
    await runGit(["reset", "--hard", first], upstream);
    const editing = join(directory, ".worktrees", "fixture");
    await mkdir(editing, { recursive: true });
    await writeFile(join(editing, "note.txt"), "unexported work\n");
    const target: Target = { dependsOn: [], upstream: "unused/fixture", fork: "unused/fixture",
      prAssignees: [], baseBranch: "main", baseSha, java: "17", publication: "Maven", buildTask: "build" };
    const makeReport = (): ProjectHealth => ({
      project: "fixture", baseSha, pinnedReplay: "not-run", upstreamReplay: "not-run", errors: [], advisories: [],
      patches: ["first.patch", "second.patch"].map((file) => ({
        file, group: "upstreamable", prerequisites: file === "second.patch" ? ["fixture/first.patch"] : [],
        prContext: true, standalone: "not-run", upstreamStandalone: "not-run", upstreamEquivalent: "not-checked",
      })),
    });
    const report = makeReport();
    await inspectUpstream(report, target, directory, upstream);
    expect(report.errors).toEqual([]);
    expect(report.pinnedReplay).toBe("passed");
    expect(report.upstreamReplay).toBe("passed");
    expect(report.patches.map((patch) => patch.upstreamEquivalent)).toEqual(["present", "absent"]);
    expect(report.patches.map((patch) => patch.standalone)).toEqual(["passed", "not-run"]);

    await runGit(["revert", "--no-commit", first], upstream);
    await runGit(["commit", "-m", "fix(test): revert upstream fixture"], upstream);
    const reverted = makeReport();
    await inspectUpstream(reverted, target, directory, upstream);
    expect(reverted.patches[0]!.upstreamEquivalent).toBe("absent");
    expect(reverted.upstreamReplay).toBe("passed");
    expect(reverted.advisories).toHaveLength(1);
    await runGit(["reset", "--hard", first], upstream);

    await commit("upstream conflict\n");
    const conflict = makeReport();
    await inspectUpstream(conflict, target, directory, upstream);
    expect(conflict.pinnedReplay).toBe("passed");
    expect(conflict.upstreamReplay).toBe("failed");
    expect(conflict.errors).toEqual([]);
    expect(conflict.advisories).toHaveLength(2);
    expect(await readFile(join(editing, "note.txt"), "utf8")).toBe("unexported work\n");
    expect(await readFile(join(patchDir, "first.patch"), "utf8")).toBe(firstPatch);

    await writeFile(join(patchDir, "first.patch"), "invalid patch\n");
    const invalid = makeReport();
    await inspectUpstream(invalid, target, directory, upstream);
    expect(invalid.pinnedReplay).toBe("failed");
    expect(invalid.errors).toHaveLength(1);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}, 30_000);
