import { createHash, randomUUID } from "node:crypto";
import { closeSync, openSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { parseArgs } from "node:util";
import { Effect } from "effect";
import { artifact } from "./client-artifacts.ts";
import { root, targetIds } from "./model.ts";
import { git } from "./process.ts";
import type { ViaFabricPlusPin } from "./viafabricplus.ts";

export type ValidationProfile = "offline" | "build" | "release" | "lifecycle";
export interface ValidationStep {
  id: string;
  args: string[];
  status: "not-run" | "running" | "passed" | "failed";
  durationMs?: number;
  exitCode?: number;
}
export interface ArtifactEvidence {
  file: string;
  sha256: string;
}
export interface ValidationReport {
  schema: 1;
  runId: string;
  revision: string;
  dirty: boolean;
  profile: ValidationProfile;
  startedAt: string;
  finishedAt?: string;
  status: "running" | "passed" | "failed";
  environment: { platform: string; arch: string; bun: string };
  steps: ValidationStep[];
  artifacts: ArtifactEvidence[];
  limitations: string[];
  failure?: string;
}

const offlineSteps = [
  { id: "tooling", args: ["run", "check"] },
  { id: "offline-regressions", args: ["test"] },
  { id: "patch-metadata", args: ["src/cli.ts", "stack", "health", "all"] },
];
const buildSteps = [
  { id: "pr-viabedrock", args: ["run", "pr", "check", "viabedrock"] },
  { id: "pr-addon", args: ["run", "pr", "check", "viafabricplus-bedrock"] },
  { id: "java-probe", args: ["run", "test-pack:java:build"] },
  { id: "build", args: ["run", "build", "all"] },
  { id: "replay-selftest", args: ["run", "server-replay", "selftest"] },
  { id: "bundle", args: ["run", "bundle"] },
];

export function validationSteps(profile: ValidationProfile, cycles = 3): ValidationStep[] {
  if (!Number.isInteger(cycles) || cycles < 1 || cycles > 10)
    throw new Error("Lifecycle cycles must be an integer from 1 to 10.");
  const steps =
    profile === "lifecycle"
      ? Array.from({ length: cycles }, (_, index) => ({
          id: `resource-cycle-${index + 1}`,
          args: [
            "run",
            "test:integration",
            "--route",
            "java-bedrock",
            "--plain-only",
            "--reuse-build",
            "--resource-pack-probe",
          ],
        }))
      : profile === "offline"
        ? offlineSteps
        : profile === "build"
          ? buildSteps
          : [...offlineSteps, ...buildSteps];
  return steps.map((step) => ({ ...step, args: [...step.args], status: "not-run" }));
}

/** Persist running and skipped states so a failed or interrupted command cannot appear to pass. */
export async function runValidationSteps(
  report: ValidationReport,
  execute: (step: ValidationStep) => Promise<number>,
  persist: () => Promise<void>,
): Promise<boolean> {
  await persist();
  for (const step of report.steps) {
    step.status = "running";
    await persist();
    const started = performance.now();
    try {
      step.exitCode = await execute(step);
    } catch {
      step.exitCode = 1;
    }
    step.durationMs = Math.round(performance.now() - started);
    step.status = step.exitCode === 0 ? "passed" : "failed";
    await persist();
    if (step.status === "failed") break;
  }
  const passed = report.steps.every((step) => step.status === "passed");
  // Artifact collection and source checks still have to complete before a passing report is final.
  if (!passed) report.status = "failed";
  await persist();
  return passed;
}

export async function buildArtifactEvidence(
  artifactsDirectory: string,
  options: { projects?: readonly string[]; pin?: ViaFabricPlusPin } = {},
): Promise<ArtifactEvidence[]> {
  const entries: ArtifactEvidence[] = [];
  for (const project of [...(options.projects ?? (await targetIds())), "viafabricplus"]) {
    const jar = await artifact(project, artifactsDirectory, options.pin);
    for (const file of [jar, join(artifactsDirectory, project, "manifest.json")]) {
      entries.push({
        file: relative(artifactsDirectory, file).split("\\").join("/"),
        sha256: createHash("sha256")
          .update(await readFile(file))
          .digest("hex"),
      });
    }
  }
  return entries;
}

export function requireReleaseEvidence(
  report: ValidationReport,
  revision: string,
  artifacts: ArtifactEvidence[],
): void {
  if (
    report.schema !== 1 ||
    report.profile !== "release" ||
    report.revision !== revision ||
    report.dirty !== false ||
    report.status !== "passed" ||
    !report.finishedAt ||
    !Array.isArray(report.steps) ||
    !Array.isArray(report.artifacts)
  )
    throw new Error("Release evidence must pass on the exact clean source revision.");
  const required = validationSteps("release");
  if (
    report.steps.length !== required.length ||
    required.some((expected, index) => {
      const step = report.steps[index];
      return (
        !step ||
        step.id !== expected.id ||
        step.status !== "passed" ||
        step.exitCode !== 0 ||
        JSON.stringify(step.args) !== JSON.stringify(expected.args)
      );
    })
  )
    throw new Error("Release evidence has missing, changed, or unsuccessful checks.");
  const hashes = new Map(report.artifacts.map((entry) => [entry.file, entry.sha256]));
  if (
    !artifacts.length ||
    hashes.size !== report.artifacts.length ||
    hashes.size !== artifacts.length ||
    artifacts.some((entry) => hashes.get(entry.file) !== entry.sha256)
  )
    throw new Error("Release evidence does not match the JARs and build manifests.");
}

export function validationMarkdown(report: ValidationReport): string {
  return [
    "# Validation evidence",
    "",
    `Profile: ${report.profile}. Result: ${report.status}.`,
    "",
    `Revision: ${report.revision}. Uncommitted changes: ${report.dirty ? "yes" : "no"}.`,
    "",
    `Started: ${report.startedAt}. Finished: ${report.finishedAt ?? "not finished"}.`,
    "",
    `Environment: ${report.environment.platform}/${report.environment.arch}, Bun ${report.environment.bun}.`,
    "",
    ...(report.failure ? [`Failure: ${report.failure}`, ""] : []),
    "| Check | Result | Duration (ms) | Exit code |",
    "| --- | --- | --- | --- |",
    ...report.steps.map(
      (step) =>
        `| ${step.id} | ${step.status} | ${step.durationMs ?? "n/a"} | ${step.exitCode ?? "n/a"} |`,
    ),
    "",
    "## Coverage limits",
    "",
    ...report.limitations.map((limit) => `- ${limit}`),
    "",
    "## Artifact checksums",
    "",
    report.artifacts.length
      ? "JARs and build manifests are bound to this run. The release modpack is rebuilt from those verified JARs."
      : "No artifact checksums recorded.",
    "",
    ...report.artifacts.map((entry) => `- ${entry.file}: ${entry.sha256}`),
    "",
  ].join("\n");
}

export async function writeReport(path: string, value: unknown, markdown: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  // Readers see either the previous complete JSON file or the new complete file.
  const temporary = `${path}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`);
  await rename(temporary, path);
  await writeFile(`${path.replace(/\.json$/, "")}.md`, markdown);
}

async function validate(profile: ValidationProfile, cycles: number): Promise<ValidationReport> {
  const report: ValidationReport = {
    schema: 1,
    runId: randomUUID(),
    revision: await Effect.runPromise(git(["rev-parse", "HEAD"], root)),
    dirty: Boolean(await Effect.runPromise(git(["status", "--porcelain"], root))),
    profile,
    startedAt: new Date().toISOString(),
    status: "running",
    environment: { platform: process.platform, arch: process.arch, bun: Bun.version },
    steps: validationSteps(profile, cycles),
    artifacts: [],
    limitations:
      profile === "lifecycle"
        ? [
            "Only local Java through ViaProxy is exercised. Direct add-on and native clients do not run.",
            "Each cycle starts fresh processes and checks pack conversion, cache reuse, changed content, and cleanup.",
            "These cycles do not measure memory growth within a persistent client or establish native parity.",
          ]
        : [
            "Account-based game joins and interactive gameplay did not run.",
            "Native visual, movement, inventory, and audio parity are not assessed.",
            "Build and replay self-tests cover only their declared fixtures.",
          ],
  };
  const output = join(root, "dist", "validation", `${profile}.json`);
  const archive = join(root, "dist", "validation", report.runId, `${profile}.json`);
  const logs = join(root, ".stackanvil", "validation", report.runId);
  await mkdir(logs, { recursive: true, mode: 0o700 });
  const persist = async () => {
    const markdown = validationMarkdown(report);
    await writeReport(archive, report, markdown);
    await writeReport(output, report, markdown);
  };
  await persist();
  let failureContext = "Validation did not complete.";
  try {
    if (profile === "release" && report.dirty) {
      failureContext = "Release validation requires a clean source checkout.";
      throw new Error("Release validation requires a clean source checkout.");
    }
    failureContext = "Initial lifecycle artifact verification failed.";
    const before =
      profile === "lifecycle" ? await buildArtifactEvidence(join(root, "dist")) : undefined;
    failureContext = "A validation command or evidence write failed.";
    const checksPassed = await runValidationSteps(
      report,
      async (step) => {
        console.log(`Running ${step.id}`);
        const log = join(logs, `${step.id}.log`);
        const descriptor = openSync(log, "wx", 0o600);
        try {
          const child = Bun.spawn([process.execPath, ...step.args], {
            cwd: root,
            stdin: "ignore",
            stdout: descriptor,
            stderr: descriptor,
          });
          const code = await child.exited;
          // Build/test diagnostics were already public in CI. Account-based lifecycle logs stay private.
          if (profile !== "lifecycle") process.stdout.write(await readFile(log, "utf8"));
          console.log(`${step.id}: ${code === 0 ? "passed" : "failed"}`);
          return code;
        } finally {
          closeSync(descriptor);
        }
      },
      persist,
    );
    if (!checksPassed) report.failure = "A command failed. Subsequent checks did not run.";
    if (checksPassed && profile !== "offline") {
      failureContext = "Final artifact verification failed.";
      report.artifacts = await buildArtifactEvidence(join(root, "dist"));
      if (before && JSON.stringify(before) !== JSON.stringify(report.artifacts)) {
        failureContext = "Build artifacts changed during lifecycle validation.";
        throw new Error("Build artifacts changed during lifecycle validation.");
      }
    }
    failureContext = "Source checkout changed during validation.";
    if (
      report.revision !== (await Effect.runPromise(git(["rev-parse", "HEAD"], root))) ||
      report.dirty !== Boolean(await Effect.runPromise(git(["status", "--porcelain"], root)))
    )
      throw new Error("Source checkout changed during validation.");
    if (checksPassed) report.status = "passed";
  } catch (error) {
    report.status = "failed";
    report.failure = failureContext;
    console.error(error instanceof Error ? error.message : String(error));
  } finally {
    report.finishedAt = new Date().toISOString();
    await persist();
  }
  console.log(`Evidence: ${output}\nPrivate command logs: ${logs}`);
  return report;
}

if (import.meta.main) {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    options: { cycles: { type: "string" }, help: { type: "boolean", short: "h" } },
  });
  if (values.help) {
    console.log(
      "Usage: bun run validate <offline|build|release|lifecycle> [--cycles 1..10]\nLifecycle uses prepared local builds and private game profiles.",
    );
  } else {
    const profile = positionals[0];
    if (
      positionals.length !== 1 ||
      !["offline", "build", "release", "lifecycle"].includes(profile ?? "") ||
      (values.cycles !== undefined && profile !== "lifecycle")
    )
      throw new Error(
        "Choose offline, build, release, or lifecycle. Only lifecycle accepts --cycles.",
      );
    const cycles = values.cycles === undefined ? 3 : Number(values.cycles);
    validationSteps(profile as ValidationProfile, cycles);
    validate(profile as ValidationProfile, cycles)
      .then((report) => {
        if (report.status !== "passed") process.exitCode = 1;
      })
      .catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : String(error));
        process.exitCode = 1;
      });
  }
}
