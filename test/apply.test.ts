import { afterAll, expect, test } from "bun:test";
import { rejects } from "node:assert/strict";
import { cp, mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const projectRoot = join(import.meta.dir, "..");
const fixtures: string[] = [];
afterAll(async () =>
  Promise.all(fixtures.map((fixture) => rm(fixture, { recursive: true, force: true }))),
);

async function run(
  program: string,
  args: string[],
  cwd: string,
  shouldFail = false,
): Promise<string> {
  const process = Bun.spawn([program, ...args], {
    cwd,
    env: { ...Bun.env, GIT_CONFIG_GLOBAL: "/dev/null" },
    stdout: "pipe",
    stderr: "pipe",
  });
  const [output, error, code] = await Promise.all([
    new Response(process.stdout).text(),
    new Response(process.stderr).text(),
    process.exited,
  ]);
  if ((code === 0) === shouldFail) {
    throw new Error(`${program} ${args.join(" ")} exited ${code}:\n${output}${error}`);
  }
  return `${output}${error}`;
}

async function git(args: string[], cwd: string): Promise<string> {
  return (await run("git", args, cwd)).trim();
}

test("an interrupted patch apply can continue or abort without losing the series", async () => {
  const fixture = await mkdtemp(join(tmpdir(), "stackanvil-apply-"));
  fixtures.push(fixture);
  const upstream = join(fixture, "upstream");
  const author = join(fixture, "author");
  const project = join(fixture, "project");
  await mkdir(upstream);
  await git(["init", "-b", "main"], upstream);
  await git(["config", "user.name", "Patch Test"], upstream);
  await git(["config", "user.email", "test@example.invalid"], upstream);
  await writeFile(join(upstream, "note.txt"), "base\n");
  await git(["add", "note.txt"], upstream);
  await git(["commit", "-m", "chore(test): create base"], upstream);
  const baseSha = await git(["rev-parse", "HEAD"], upstream);
  await git(["clone", upstream, author], fixture);
  await git(["config", "user.name", "Patch Test"], author);
  await git(["config", "user.email", "test@example.invalid"], author);
  await mkdir(join(project, "patches", "fixture", "setup"), { recursive: true });
  await mkdir(join(project, "patches", "fixture", "upstreamable"), { recursive: true });
  await mkdir(join(project, "patches", "fixture", "deferred"), { recursive: true });
  await cp(join(projectRoot, "src"), join(project, "src"), { recursive: true });
  await mkdir(join(project, "scripts"));
  await cp(
    join(projectRoot, "scripts", "bundle-bedrock-assets.ts"),
    join(project, "scripts", "bundle-bedrock-assets.ts"),
  );
  await symlink(join(projectRoot, "node_modules"), join(project, "node_modules"));
  await writeFile(
    join(project, "targets.json"),
    JSON.stringify({
      fixture: {
        upstream: "unused/fixture",
        fork: "unused/fixture",
        baseBranch: "main",
        baseSha,
        java: "17",
        buildTask: "build",
      },
    }),
  );
  await writeFile(
    join(project, "patches", "fixture", "series.json"),
    JSON.stringify({
      setup: ["0001-first.patch"],
      upstreamable: [{ file: "0001-second.patch", title: "feat(test): second" }],
      deferred: [
        { file: "0001-third.patch", reason: "Another contributor owns the upstream change." },
      ],
    }),
  );
  await writeFile(join(author, "note.txt"), "first\n");
  await mkdir(join(author, "src", "test"), { recursive: true });
  await writeFile(join(author, "src", "test", "local.txt"), "first regression\n");
  await git(["add", "."], author);
  await git(["commit", "-m", "chore(test): first"], author);
  const firstPatch = join(project, "patches", "fixture", "setup", "0001-first.patch");
  const originalFirstPatch = await git(["format-patch", "--stdout", "-1"], author);
  const firstNoteIndex = `index ${await git(["rev-parse", "HEAD^:note.txt"], author)}..${await git(["rev-parse", "HEAD:note.txt"], author)} 100644`;
  const firstRegressionIndex = `index ${"0".repeat(40)}..${await git(["rev-parse", "HEAD:src/test/local.txt"], author)}`;
  await writeFile(firstPatch, originalFirstPatch);
  await git(["reset", "--hard", baseSha], author);
  await mkdir(join(author, "src", "test"), { recursive: true });
  await writeFile(join(author, "src", "test", "local.txt"), "first regression\n");
  await git(["add", "."], author);
  await git(["commit", "-m", "test: prepare local fixture"], author);
  await writeFile(join(author, "note.txt"), "second\n");
  await mkdir(join(author, "src", "test"), { recursive: true });
  await writeFile(join(author, "src", "test", "local.txt"), "second regression\n");
  await git(["add", "."], author);
  await git(
    ["commit", "-m", "feat(test): second", "-m", "Explain why the second patch changes this file."],
    author,
  );
  const secondPatch = join(project, "patches", "fixture", "upstreamable", "0001-second.patch");
  const conflictingPatch = await git(["format-patch", "--stdout", "-1"], author);
  await writeFile(secondPatch, conflictingPatch);
  await writeFile(join(author, "deferred.txt"), "third\n");
  await git(["add", "deferred.txt"], author);
  await git(
    [
      "commit",
      "-m",
      "fix(test): add deferred change",
      "-m",
      "Another contributor owns this upstream change.",
    ],
    author,
  );
  const deferredPatch = join(project, "patches", "fixture", "deferred", "0001-third.patch");
  await writeFile(deferredPatch, await git(["format-patch", "--stdout", "-1"], author));
  await mkdir(join(project, ".worktrees"));
  const checkout = join(project, ".worktrees", "fixture");
  await git(["clone", upstream, checkout], fixture);
  await git(["config", "user.name", "Patch Test"], checkout);
  await git(["config", "user.email", "test@example.invalid"], checkout);
  const prCheckout = join(project, ".worktrees", "fixture-pr");
  await git(["clone", upstream, prCheckout], fixture);
  await run("git", ["var", "GIT_COMMITTER_IDENT"], prCheckout, true);

  const cli = join(project, "src", "cli.ts");
  await run("bun", [cli, "pr", "check", "fixture"], project);
  expect(await git(["rev-list", "--count", `${baseSha}..HEAD`], prCheckout)).toBe("1");
  expect(await git(["show", "-s", "--format=%ce", "HEAD"], prCheckout)).toBe(
    "test@example.invalid",
  );
  expect(await readFile(join(prCheckout, "note.txt"), "utf8")).toBe("second\n");
  await rejects(readFile(join(prCheckout, "deferred.txt"), "utf8"));
  await rejects(readFile(join(prCheckout, "src", "test", "local.txt"), "utf8"));
  expect(await readFile(secondPatch, "utf8")).toBe(conflictingPatch);
  const selectedCheckout = join(project, ".worktrees", "fixture-pr-0001-second");
  await git(["clone", upstream, selectedCheckout], fixture);
  await run("bun", [cli, "pr", "check", "fixture", "--patch", "0001-second.patch"], project);
  expect(await readFile(join(selectedCheckout, "note.txt"), "utf8")).toBe("second\n");
  await rejects(readFile(join(selectedCheckout, "src", "test", "local.txt"), "utf8"));
  await run("bun", [cli, "stack", "sync", "fixture"], project, true);
  expect(
    (await readFile(join(project, ".stackanvil", "fixture-full-apply.json"), "utf8")).length,
  ).toBeGreaterThan(0);
  await writeFile(join(checkout, "note.txt"), "resolved\n");
  await git(["add", "note.txt"], checkout);
  await run("bun", [cli, "stack", "continue", "fixture"], project);
  expect(await git(["rev-list", "--count", `${baseSha}..HEAD`], checkout)).toBe("3");
  expect(await git(["show", "-s", "--format=%ce", "HEAD"], checkout)).toBe("test@example.invalid");
  expect(await readFile(join(checkout, "note.txt"), "utf8")).toBe("resolved\n");
  expect(await readFile(join(checkout, "deferred.txt"), "utf8")).toBe("third\n");
  expect(await readFile(join(checkout, "src", "test", "local.txt"), "utf8")).toBe(
    "second regression\n",
  );
  await rejects(readFile(join(project, ".stackanvil", "fixture-full-apply.json"), "utf8"));

  const seriesFile = join(project, "patches", "fixture", "series.json");
  const seriesBeforeAdd = await readFile(seriesFile, "utf8");
  await run("bun", [cli, "stack", "add", "fixture", "upstreamable"], project, true);
  expect(await readFile(seriesFile, "utf8")).toBe(seriesBeforeAdd);

  await git(["config", "core.abbrev", "12"], checkout);
  await run("bun", [cli, "stack", "rebuild", "fixture"], project);
  const rebuilt = await readFile(firstPatch, "utf8");
  expect(rebuilt).toContain(firstNoteIndex);
  expect(rebuilt).toContain(firstRegressionIndex);
  expect(rebuilt.replace(/^index .+$/gm, "")).toBe(originalFirstPatch.replace(/^index .+$/gm, ""));
  const changed = await readFile(secondPatch, "utf8");
  expect(changed).not.toBe(conflictingPatch);
  expect(changed).toMatch(/^index [0-9a-f]{40}\.\.[0-9a-f]{40}(?: [0-7]{6})?$/m);
  const corruptDeferred = (await readFile(deferredPatch, "utf8")).replace(
    /^(index [0-9a-f]+\.\.)[0-9a-f]+/m,
    `$1${"f".repeat(40)}`,
  );
  await writeFile(deferredPatch, corruptDeferred);
  await git(["config", "core.abbrev", "20"], checkout);
  await run("bun", [cli, "stack", "rebuild", "fixture"], project);
  expect(await readFile(firstPatch, "utf8")).toBe(rebuilt);
  expect(await readFile(secondPatch, "utf8")).toBe(changed);
  const repaired = await readFile(deferredPatch, "utf8");
  expect(repaired).not.toBe(corruptDeferred);
  expect(repaired).toContain(
    `index ${"0".repeat(40)}..${await git(["rev-parse", "HEAD:deferred.txt"], checkout)}`,
  );

  await writeFile(join(checkout, "added.txt"), "new exported feature\n");
  await git(["add", "added.txt"], checkout);
  await git(
    [
      "commit",
      "-m",
      "fix(test): export full indexes",
      "-m",
      "Keep new patch object references stable as the repository grows.",
    ],
    checkout,
  );
  await git(["config", "core.abbrev", "4"], checkout);
  await run(
    "bun",
    [
      cli,
      "stack",
      "add",
      "fixture",
      "deferred",
      "--reason",
      "Covered by https://example.invalid/pull/1",
    ],
    project,
  );
  const added = await readFile(
    join(project, "patches", "fixture", "deferred", "0002-export-full-indexes.patch"),
    "utf8",
  );
  expect(added).toContain(
    `index ${"0".repeat(40)}..${await git(["rev-parse", "HEAD:added.txt"], checkout)}`,
  );

  // The rebuilt production change now depends on setup and requires a PR conflict resolution.
  await run("bun", [cli, "pr", "check", "fixture"], project, true);
  await writeFile(join(prCheckout, "note.txt"), "resolved\n");
  await mkdir(join(prCheckout, "src", "test"), { recursive: true });
  await writeFile(join(prCheckout, "src", "test", "accidental.txt"), "local test\n");
  await git(["add", "."], prCheckout);
  expect(await run("bun", [cli, "stack", "continue", "fixture", "--pr"], project, true)).toContain(
    "include local tests",
  );
  await git(["rm", "-f", "src/test/accidental.txt"], prCheckout);
  await run("bun", [cli, "stack", "continue", "fixture", "--pr"], project);
  expect(await git(["rev-list", "--count", `${baseSha}..HEAD`], prCheckout)).toBe("1");
  expect(await readFile(join(prCheckout, "note.txt"), "utf8")).toBe("resolved\n");

  await writeFile(secondPatch, conflictingPatch);
  await run("bun", [cli, "stack", "sync", "fixture"], project, true);
  await run("bun", [cli, "stack", "abort", "fixture"], project);
  expect(await git(["status", "--porcelain"], checkout)).toBe("");
  await rejects(readFile(join(project, ".stackanvil", "fixture-full-apply.json"), "utf8"));
});
