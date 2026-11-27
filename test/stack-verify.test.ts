import { expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Effect } from "effect";
import type { Target } from "../src/model.ts";
import { git } from "../src/process.ts";
import { affectedProjects, replayStack } from "../src/stack-verify.ts";

const runGit = (args: string[], directory: string) => Effect.runPromise(git(args, directory));

test("pushes that change a stack's patches or the pinned bases select the stacks to replay", () => {
  const ids = ["viabedrock", "viafabricplus-bedrock"];
  expect(affectedProjects(["patches/viabedrock/series.json", "docs/x.md"], ids)).toEqual([
    "viabedrock",
  ]);
  expect(affectedProjects(["targets.json"], ids)).toEqual(ids);
  expect(affectedProjects(["docs/x.md", "patches/unknown/a.patch"], ids)).toEqual([]);
});

test("replay reports the first patch that no longer applies, even inside a hook's Git environment", async () => {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-verify-"));
  const hookGitDir = process.env["GIT_DIR"];
  try {
    const upstream = join(directory, "upstream");
    await mkdir(upstream);
    await runGit(["init", "-q", "-b", "main"], upstream);
    await runGit(["config", "user.name", "Verify Test"], upstream);
    await runGit(["config", "user.email", "test@example.invalid"], upstream);
    await runGit(["config", "commit.gpgSign", "false"], upstream);
    const commit = async (content: string) => {
      await writeFile(join(upstream, "note.txt"), content);
      await runGit(["add", "note.txt"], upstream);
      await runGit(
        ["commit", "-q", "-m", "fix(test): update note", "-m", "Exercise replay."],
        upstream,
      );
      return runGit(["rev-parse", "HEAD"], upstream);
    };
    const baseSha = await commit("base\n");
    const patches = join(directory, "patches", "fixture", "upstreamable");
    await mkdir(patches, { recursive: true });
    await commit("first\n");
    await writeFile(
      join(patches, "first.patch"),
      await runGit(["format-patch", "-1", "--stdout"], upstream),
    );
    await commit("second\n");
    await writeFile(
      join(patches, "second.patch"),
      await runGit(["format-patch", "-1", "--stdout"], upstream),
    );
    const series = (files: string[]) =>
      writeFile(
        join(directory, "patches", "fixture", "series.json"),
        JSON.stringify({
          setup: [],
          deferred: [],
          upstreamable: files.map((file) => ({ file, title: "fix(test): update note" })),
        }),
      );
    const target: Target = {
      dependsOn: [],
      upstream: "unused/fixture",
      fork: "unused/fixture",
      prAssignees: [],
      baseBranch: "main",
      baseSha,
      java: "17",
      publication: "Maven",
      buildTask: "build",
    };
    await writeFile(join(directory, "targets.json"), JSON.stringify({ fixture: target }));
    const scratch = join(directory, "scratch");
    await mkdir(scratch);
    // Git exports GIT_DIR to hooks. Scratch commands must not act on that repository.
    process.env["GIT_DIR"] = join(upstream, ".git");

    await series(["first.patch", "second.patch"]);
    expect(await replayStack("fixture", target, directory, scratch, upstream)).toBeUndefined();

    // Without the first patch, the second patch's preimage is missing, as after a textual rebase.
    await series(["second.patch"]);
    expect(await replayStack("fixture", target, directory, scratch, upstream)).toBe(
      join("patches", "fixture", "upstreamable", "second.patch"),
    );
    delete process.env["GIT_DIR"];
    expect(await runGit(["rev-parse", "HEAD"], upstream)).not.toBe(baseSha);
  } finally {
    if (hookGitDir === undefined) delete process.env["GIT_DIR"];
    else process.env["GIT_DIR"] = hookGitDir;
    await rm(directory, { recursive: true, force: true });
  }
}, 60_000);
