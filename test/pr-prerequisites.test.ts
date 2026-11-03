import { expect, test } from "bun:test";
import { assertPrReady, type UpstreamablePatch } from "../src/model.ts";

const patch: UpstreamablePatch = { file: "feature.patch", title: "feat: add feature" };

test("only patches with unresolved upstream prerequisites are blocked", () => {
  expect(() => assertPrReady(patch)).not.toThrow();
  expect(() => assertPrReady({ ...patch, prerequisites: [] })).not.toThrow();
  const tests = { project: "viabedrock", patch: "test-build.patch", reason: "Supply local JUnit configuration.", testOnly: true };
  expect(() => assertPrReady({ ...patch, prerequisites: [tests] })).not.toThrow();
  expect(() =>
    assertPrReady({
      ...patch,
      prerequisites: [
        tests,
        { project: "viabedrock", patch: "api.patch", reason: "Publish the shared API first." },
      ],
    }),
  ).toThrow();
});
