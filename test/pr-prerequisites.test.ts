import { expect, test } from "bun:test";
import { assertPrReady, type UpstreamablePatch } from "../src/model.ts";

const patch: UpstreamablePatch = { file: "feature.patch", title: "feat: add feature" };

test("only patches with unresolved upstream prerequisites are blocked", () => {
  expect(() => assertPrReady(patch)).not.toThrow();
  expect(() => assertPrReady({ ...patch, prerequisites: [] })).not.toThrow();
  expect(() =>
    assertPrReady({
      ...patch,
      prerequisites: [
        { project: "viabedrock", patch: "api.patch", reason: "Publish the shared API first." },
      ],
    }),
  ).toThrow();
});
