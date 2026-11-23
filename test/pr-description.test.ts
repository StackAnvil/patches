import { expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Effect } from "effect";
import { parsePatchMessage } from "../src/patch-message.ts";
import { command } from "../src/process.ts";
import { missingPrParticipants, prHead, renderPrBody } from "../src/pr.ts";

test.each(["legacy", "lean"])(
  "%s format-patch message keeps a wrapped subject and multi-paragraph description",
  (format) => {
    const patch = [
      "From abc Mon Sep 17 00:00:00 2001",
      "From: Contributor <contributor@example.invalid>",
      "Subject: [PATCH] feat(test): explain a long change that wraps",
      " across two lines",
      "",
      "First paragraph.",
      "",
      "Second paragraph.",
      ...(format === "legacy" ? ["---", " file | 1 +"] : []),
      "",
      "diff --git a/file b/file",
    ].join("\n");

    expect(parsePatchMessage(patch)).toEqual({
      title: "feat(test): explain a long change that wraps across two lines",
      description: "First paragraph.\n\nSecond paragraph.",
    });
  },
);

test("a non-ASCII commit subject keeps its text instead of Git's MIME encoding", async () => {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-subject-"));
  const git = (args: string[], trimOutput = true) =>
    Effect.runPromise(
      command(
        "git",
        args,
        directory,
        { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null" },
        trimOutput,
      ),
    );
  try {
    await git(["init", "-b", "main"]);
    await git(["config", "user.name", "PR Test"]);
    await git(["config", "user.email", "test@example.invalid"]);
    await writeFile(join(directory, "note.txt"), "change\n");
    await git(["add", "note.txt"]);
    const title = "fix(ui): show “Realms” names with the × button in a long wrapped subject";
    await git(["commit", "-m", title, "-m", "Keep the café label."]);
    const patch = await git(
      ["format-patch", "--zero-commit", "--no-signature", "--no-stat", "--stdout", "-1"],
      false,
    );
    expect(patch).toContain("Subject: [PATCH] =?UTF-8?q?");
    expect(parsePatchMessage(patch)).toEqual({ title, description: "Keep the café label." });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("a PR needs both the patch description and extra body", () => {
  expect(() => renderPrBody("viabedrock", "", "## Testing\n\nRun tests")).toThrow(/commit body/);
  expect(() => renderPrBody("viabedrock", "Reason for change", "  ")).toThrow(/PR extra body/);
  const body = renderPrBody("viabedrock", "Reason for change", "Extra review context");
  expect(body).toContain("Reason for change");
  expect(body).toContain("Extra review context");
});

test("CubeConverter PR descriptions identify included regressions and excluded setup", () => {
  const body = renderPrBody("cubeconverter", "Publish both Gson backends", "Both suites pass");
  expect(body).toContain("includes the complete CubeConverter feature and its regression tests");
  expect(body).toContain("StackAnvil setup remains excluded");
  expect(body).not.toContain("excluded from this PR");
});

test("standalone PRs use a patch-specific branch and body", () => {
  const file = "0006-encode-26-3-game-modes-correctly.patch";
  expect(prHead(file)).toBe("stackanvil/0006-encode-26-3-game-modes-correctly");
  const body = renderPrBody(
    "viabedrock",
    "Correct respawn fields",
    "## Evidence\n\nPacket schema",
    {},
    file,
  );
  expect(body).toContain(`/viabedrock/upstreamable/${file}`);
  expect(body).toContain("applied alone to the pinned upstream base");
  expect(() => prHead("../outside.patch")).toThrow(/Invalid patch filename/);
});

test("PR participants do not receive duplicate review requests", () => {
  const missing = missingPrParticipants(
    ["RaphiMC", "Exterminate5573", "Reviewer", "NewReviewer", "Author"],
    {
      author: { login: "Author" },
      assignees: [{ login: "raphimc" }],
      isDraft: false,
      reviewRequests: [{ __typename: "User", login: "EXTERMINATE5573" }],
      reviews: [{ author: { login: "reviewer" } }],
    },
  );

  expect(missing.assignees).toEqual(["Exterminate5573", "Reviewer", "NewReviewer", "Author"]);
  expect(missing.reviewers).toEqual(["RaphiMC", "NewReviewer"]);
});
