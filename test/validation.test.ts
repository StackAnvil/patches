import { expect, test } from "bun:test";
import { requireReleaseEvidence, runValidationSteps, validationSteps, type ValidationReport } from "../src/validation.ts";

function report(): ValidationReport {
  return {
    schema: 1, runId: "fixture", revision: "revision", dirty: false, profile: "release",
    startedAt: new Date().toISOString(), status: "running",
    environment: { platform: "fixture", arch: "fixture", bun: Bun.version },
    steps: validationSteps("release"), artifacts: [], limitations: [],
  };
}

test("records failed commands and leaves subsequent checks unrun", async () => {
  const evidence = report();
  const snapshots: ValidationReport[] = [];
  let calls = 0;
  await runValidationSteps(evidence, async () => ++calls === 2 ? 7 : 0,
    async () => { snapshots.push(structuredClone(evidence)); });
  expect(calls).toBe(2);
  expect(evidence.status).toBe("failed");
  expect(evidence.steps.map((step) => step.status)).toEqual([
    "passed", "failed", ...Array(evidence.steps.length - 2).fill("not-run"),
  ]);
  expect(evidence.steps[1]!.exitCode).toBe(7);
  expect(snapshots.some((snapshot) => snapshot.steps[1]!.status === "running")).toBe(true);
});

test("does not start a check before its running state can be saved", async () => {
  const evidence = report();
  let commands = 0, writes = 0;
  await expect(runValidationSteps(evidence, async () => { commands++; return 0; },
    async () => { if (++writes === 2) throw new Error(); })).rejects.toThrow();
  expect(commands).toBe(0);
  expect(evidence.status).toBe("running");
});

test("release publication requires every declared check and the exact source and artifact set", async () => {
  const evidence = report();
  await runValidationSteps(evidence, async () => 0, async () => {});
  expect(evidence.status).toBe("running");
  expect(evidence.finishedAt).toBeUndefined();
  evidence.status = "passed";
  evidence.finishedAt = new Date().toISOString();
  evidence.artifacts = [{ file: "fixture/build.jar", sha256: "digest" }, { file: "fixture/manifest.json", sha256: "manifest" }];
  const accept = (candidate: ValidationReport) => requireReleaseEvidence(candidate, evidence.revision, evidence.artifacts);
  expect(() => accept(evidence)).not.toThrow();
  for (const mutate of [
    (candidate: ValidationReport) => { candidate.revision = "stale"; },
    (candidate: ValidationReport) => { candidate.dirty = true; },
    (candidate: ValidationReport) => { candidate.status = "running"; },
    (candidate: ValidationReport) => { candidate.steps.pop(); },
    (candidate: ValidationReport) => { candidate.steps[0]!.status = "not-run"; },
    (candidate: ValidationReport) => { candidate.steps[0]!.args = ["--help"]; },
    (candidate: ValidationReport) => { candidate.artifacts[0]!.sha256 = "changed"; },
    (candidate: ValidationReport) => { candidate.artifacts.pop(); },
    (candidate: ValidationReport) => { candidate.artifacts.push(candidate.artifacts[0]!); },
  ]) {
    const candidate = structuredClone(evidence);
    mutate(candidate);
    expect(() => accept(candidate)).toThrow();
  }
});

test("lifecycle plans stay bounded and preserve the integration suite's private resource probe", () => {
  for (const cycles of [0, -1, 1.5, 11, NaN, Infinity])
    expect(() => validationSteps("lifecycle", cycles)).toThrow();
  const steps = validationSteps("lifecycle", 3);
  expect(new Set(steps.map((step) => step.id)).size).toBe(3);
  expect(steps.every((step) => step.args.includes("--resource-pack-probe") && step.args.includes("--reuse-build"))).toBe(true);
});
