import { mkdtemp, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Effect } from "effect";
import { buildOrder } from "./dependencies.ts";
import {
  getSeries,
  getTargets,
  root,
  type Series,
  type Target,
  type UpstreamablePatch,
} from "./model.ts";
import { git } from "./process.ts";

type Check = "passed" | "failed" | "not-run";

export interface PatchHealth {
  file: string;
  group: "setup" | "upstreamable" | "deferred";
  prerequisites: string[];
  prContext: boolean;
  standalone: Check;
  upstreamStandalone: Check;
  upstreamEquivalent: "present" | "absent" | "not-checked";
}

export interface ProjectHealth {
  project: string;
  baseSha: string;
  upstreamSha?: string;
  pinnedReplay: Check;
  upstreamReplay: Check;
  patches: PatchHealth[];
  errors: string[];
  advisories: string[];
}

export interface HealthReport {
  schema: 1;
  generatedAt: string;
  projects: ProjectHealth[];
  errors: string[];
}

export function prerequisiteCycles(series: Record<string, Series>): string[][] {
  const graph = new Map<string, readonly string[]>(
    Object.entries(series).flatMap(([project, stack]) =>
      stack.upstreamable.map(
        (patch) =>
          [
            `${project}/${patch.file}`,
            (patch.prerequisites ?? []).map(
              (dependency) => `${dependency.project}/${dependency.patch}`,
            ),
          ] as const,
      ),
    ),
  );
  const visited = new Set<string>();
  const path: string[] = [];
  const cycles: string[][] = [];
  function visit(key: string): void {
    const index = path.indexOf(key);
    if (index >= 0) {
      cycles.push([...path.slice(index), key]);
      return;
    }
    if (visited.has(key)) return;
    path.push(key);
    for (const dependency of graph.get(key) ?? []) visit(dependency);
    path.pop();
    visited.add(key);
  }
  for (const key of graph.keys()) visit(key);
  return cycles;
}

async function hasPrContext(path: string): Promise<boolean> {
  try {
    return Boolean((await readFile(path.replace(/\.patch$/, ".pr.md"), "utf8")).trim());
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

const runGit = (args: string[], cwd: string) => Effect.runPromise(git(args, cwd));

async function applies(directory: string, patch: string, reverse = false): Promise<Check> {
  // --check leaves the disposable checkout untouched between independent checks.
  try {
    await runGit(["apply", "--check", ...(reverse ? ["--reverse"] : []), patch], directory);
    return "passed";
  } catch {
    return "failed";
  }
}

async function standaloneApply(directory: string, patch: string, base: string): Promise<Check> {
  try {
    // Match pr check's three-way application, with no setup or preceding patch in the source tree.
    await runGit(["am", "--3way", "--committer-date-is-author-date", patch], directory);
    return "passed";
  } catch {
    return "failed";
  } finally {
    if (existsSync(join(directory, ".git", "rebase-apply")))
      await runGit(["am", "--abort"], directory);
    await runGit(["reset", "--hard", base], directory);
  }
}

export async function inspectUpstream(
  report: ProjectHealth,
  target: Target,
  repository: string,
  upstream = `https://github.com/${target.upstream}.git`,
): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-health-"));
  const patchPath = (patch: PatchHealth) =>
    join(repository, "patches", report.project, patch.group, patch.file);
  const apply = (patch: PatchHealth) =>
    runGit(["am", "--3way", "--committer-date-is-author-date", patchPath(patch)], directory);
  try {
    await runGit(
      [
        "clone",
        "--no-checkout",
        "--single-branch",
        "--branch",
        target.baseBranch,
        upstream,
        directory,
      ],
      repository,
    );
    await runGit(["config", "user.name", "StackAnvil health"], directory);
    await runGit(["config", "user.email", "health@stackanvil.invalid"], directory);
    report.upstreamSha = await runGit(["rev-parse", "HEAD"], directory);
    await runGit(["cat-file", "-e", `${target.baseSha}^{commit}`], directory);
    await runGit(["checkout", "--detach", target.baseSha], directory);
    for (const patch of report.patches) {
      if (patch.group === "upstreamable" && !patch.prerequisites.length)
        patch.standalone = await standaloneApply(directory, patchPath(patch), target.baseSha);
    }
    const commits: string[] = [];
    for (const patch of report.patches) {
      try {
        await apply(patch);
      } catch {
        report.pinnedReplay = "failed";
        report.errors.push(`Pinned stack does not replay at ${patch.group}/${patch.file}.`);
        return;
      }
      commits.push(await runGit(["rev-parse", "HEAD"], directory));
    }
    report.pinnedReplay = "passed";
    const cherry = await runGit(["cherry", report.upstreamSha, "HEAD", target.baseSha], directory);
    const absorbed = new Set(
      cherry
        .split("\n")
        .filter((line) => line.startsWith("- "))
        .map((line) => line.slice(2)),
    );
    await runGit(["checkout", "--detach", report.upstreamSha], directory);
    for (const [index, patch] of report.patches.entries()) {
      // A matching historical commit can have been reverted or rewritten at the inspected tip.
      const matchingCommit = absorbed.has(commits[index]!);
      patch.upstreamEquivalent =
        matchingCommit && (await applies(directory, patchPath(patch), true)) === "passed"
          ? "present"
          : "absent";
      if (matchingCommit && patch.upstreamEquivalent === "absent")
        report.advisories.push(
          `An equivalent commit exists for ${patch.file}, but its change cannot be confirmed at the upstream tip.`,
        );
    }
    for (const patch of report.patches) {
      if (
        patch.group === "upstreamable" &&
        !patch.prerequisites.length &&
        patch.upstreamEquivalent !== "present"
      )
        patch.upstreamStandalone = await standaloneApply(
          directory,
          patchPath(patch),
          report.upstreamSha,
        );
    }
    for (const patch of report.patches) {
      if (patch.upstreamEquivalent === "present") continue;
      try {
        await apply(patch);
      } catch {
        report.upstreamReplay = "failed";
        report.advisories.push(`Upstream replay stops at ${patch.group}/${patch.file}.`);
        return;
      }
    }
    report.upstreamReplay = "passed";
  } catch {
    report.errors.push("Upstream inspection failed. Check upstream access and the pinned base.");
  } finally {
    // Generated editing repositories and saved patch files are never reset or changed.
    await rm(directory, { recursive: true, force: true });
  }
}

export async function patchHealth(
  requested = "all",
  options: { repository?: string; upstream?: boolean } = {},
): Promise<HealthReport> {
  const repository = options.repository ?? root;
  const targets = await getTargets(repository);
  const ids = requested === "all" ? Object.keys(targets) : [requested];
  if (ids.some((id) => !targets[id])) throw new Error(`Unknown target ${requested}`);
  const report: HealthReport = {
    schema: 1,
    generatedAt: new Date().toISOString(),
    projects: [],
    errors: [],
  };
  const stacks: Record<string, Series> = {};
  try {
    buildOrder(targets, "all");
  } catch (error) {
    report.errors.push(error instanceof Error ? error.message : String(error));
  }
  for (const id of Object.keys(targets)) {
    try {
      stacks[id] = await getSeries(id, repository);
    } catch {
      report.errors.push(`Invalid series metadata or patch files for ${id}.`);
    }
  }
  for (const cycle of prerequisiteCycles(stacks))
    report.errors.push(`Patch prerequisite cycle: ${cycle.join(" -> ")}`);
  for (const [id, stack] of Object.entries(stacks)) {
    for (const patch of stack.upstreamable) {
      for (const dependency of patch.prerequisites ?? []) {
        if (
          !stacks[dependency.project]?.upstreamable.some((entry) => entry.file === dependency.patch)
        )
          report.errors.push(
            `Unlisted prerequisite for ${id}/${patch.file}: ${dependency.project}/${dependency.patch}`,
          );
      }
    }
  }
  for (const id of ids) {
    const stack = stacks[id];
    if (!stack) continue;
    const project: ProjectHealth = {
      project: id,
      baseSha: targets[id]!.baseSha,
      pinnedReplay: "not-run",
      upstreamReplay: "not-run",
      patches: [],
      errors: [],
      advisories: [],
    };
    for (const group of ["setup", "upstreamable", "deferred"] as const) {
      const entries: Pick<UpstreamablePatch, "file" | "prerequisites">[] =
        group === "setup" ? stack.setup.map((file) => ({ file })) : stack[group];
      for (const entry of entries) {
        const prerequisites = entry.prerequisites ?? [];
        project.patches.push({
          file: entry.file,
          group,
          prerequisites: prerequisites.map(
            (dependency) => `${dependency.project}/${dependency.patch}`,
          ),
          prContext:
            group === "upstreamable" &&
            (await hasPrContext(join(repository, "patches", id, group, entry.file))),
          standalone: "not-run",
          upstreamStandalone: "not-run",
          upstreamEquivalent: "not-checked",
        });
      }
    }
    if (options.upstream) await inspectUpstream(project, targets[id]!, repository);
    report.projects.push(project);
  }
  return report;
}

export function healthFailed(report: HealthReport): boolean {
  return Boolean(report.errors.length || report.projects.some((project) => project.errors.length));
}

export function healthMarkdown(report: HealthReport): string {
  const lines = [
    "# Patch health",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "Standalone results check patch application only. Compilation and native parity are not assessed.",
    "",
  ];
  for (const error of report.errors) lines.push(`- Error: ${error}`);
  for (const project of report.projects) {
    lines.push(
      `## ${project.project}`,
      "",
      `Pinned base: ${project.baseSha}`,
      "",
      `Inspected upstream: ${project.upstreamSha ?? "not fetched"}`,
      "",
      `Pinned replay: ${project.pinnedReplay}. Upstream replay: ${project.upstreamReplay}.`,
      "",
      "| Patch | Group | Prerequisites | PR context | Pinned standalone | Upstream standalone | Equivalent upstream |",
      "| --- | --- | --- | --- | --- | --- | --- |",
    );
    for (const patch of project.patches)
      lines.push(
        `| ${patch.file} | ${patch.group} | ${patch.prerequisites.join(", ") || "none"} | ${patch.group === "upstreamable" ? (patch.prContext ? "present" : "missing") : "n/a"} | ${patch.standalone} | ${patch.upstreamStandalone} | ${patch.upstreamEquivalent} |`,
      );
    lines.push(
      "",
      ...project.errors.map((error) => `- Error: ${error}`),
      ...project.advisories.map((advisory) => `- Advisory: ${advisory}`),
      "",
    );
  }
  return `${lines.join("\n")}\n`;
}
