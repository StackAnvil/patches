import { expect, test } from "bun:test";
import { parsePatchMessage } from "../src/patch-message.ts";
import { missingPrParticipants, renderPrBody } from "../src/pr.ts";

test("format-patch message keeps a wrapped subject and multi-paragraph description", () => {
  const patch = [
    "From abc Mon Sep 17 00:00:00 2001",
    "From: Contributor <contributor@example.invalid>",
    "Subject: [PATCH] feat(test): explain a long change that wraps",
    " across two lines",
    "",
    "First paragraph.",
    "",
    "Second paragraph.",
    "---",
    " file | 1 +",
    "",
    "diff --git a/file b/file",
  ].join("\n");

  expect(parsePatchMessage(patch)).toEqual({
    title: "feat(test): explain a long change that wraps across two lines",
    description: "First paragraph.\n\nSecond paragraph.",
  });
});

test("a PR needs both the patch description and extra body", () => {
  expect(() => renderPrBody("viabedrock", "", "## Testing\n\nRun tests")).toThrow(/commit body/);
  expect(() => renderPrBody("viabedrock", "Reason for change", "  ")).toThrow(/PR extra body/);
  const body = renderPrBody("viabedrock", "Reason for change", "Extra review context");
  expect(body).toContain("Reason for change");
  expect(body).toContain("Extra review context");
});

test("PR participants do not receive duplicate review requests", () => {
  const missing = missingPrParticipants(["RaphiMC", "Exterminate5573", "Reviewer", "NewReviewer", "Author"], {
    author: { login: "Author" },
    assignees: [{ login: "raphimc" }],
    isDraft: false,
    reviewRequests: [{ __typename: "User", login: "EXTERMINATE5573" }],
    reviews: [{ author: { login: "reviewer" } }],
  });

  expect(missing.assignees).toEqual(["Exterminate5573", "Reviewer", "NewReviewer", "Author"]);
  expect(missing.reviewers).toEqual(["RaphiMC", "NewReviewer"]);
});
