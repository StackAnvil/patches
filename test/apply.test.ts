import { afterAll, expect, test } from "bun:test";
import { cp, mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const projectRoot = join(import.meta.dir, "..");
const fixtures: string[] = [];
afterAll(async () => Promise.all(fixtures.map((fixture) => rm(fixture, { recursive: true, force: true }))));

async function run(program: string, args: string[], cwd: string, shouldFail = false): Promise<string> {
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
  await symlink(join(projectRoot, "node_modules"), join(project, "node_modules"));
  await writeFile(join(project, "targets.json"), JSON.stringify({
    fixture: { upstream: "unused/fixture", fork: "unused/fixture", baseBranch: "main", baseSha, java: "17", buildTask: "build" },
  }));
  await writeFile(join(project, "patches", "fixture", "series.json"), JSON.stringify({
    setup: ["0001-first.patch"], upstreamable: [{ file: "0001-second.patch", title: "feat(test): second" }],
    deferred: [{ file: "0001-third.patch", reason: "Another contributor owns the upstream change." }],
  }));
  await writeFile(join(author, "note.txt"), "first\n");
  await git(["add", "note.txt"], author);
  await git(["commit", "-m", "chore(test): first"], author);
  const firstPatch = join(project, "patches", "fixture", "setup", "0001-first.patch");
  const originalFirstPatch = await git(["format-patch", "--stdout", "-1"], author);
  await writeFile(firstPatch, originalFirstPatch);
  await git(["reset", "--hard", baseSha], author);
  await writeFile(join(author, "note.txt"), "second\n");
  await git(["add", "note.txt"], author);
  await git(["commit", "-m", "feat(test): second", "-m", "Explain why the second patch changes this file."], author);
  const secondPatch = join(project, "patches", "fixture", "upstreamable", "0001-second.patch");
  const conflictingPatch = await git(["format-patch", "--stdout", "-1"], author);
  await writeFile(secondPatch, conflictingPatch);
  await writeFile(join(author, "deferred.txt"), "third\n");
  await git(["add", "deferred.txt"], author);
  await git(["commit", "-m", "fix(test): add deferred change", "-m", "Another contributor owns this upstream change."], author);
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
  expect(await git(["show", "-s", "--format=%ce", "HEAD"], prCheckout)).toBe("test@example.invalid");
  expect(await readFile(join(prCheckout, "note.txt"), "utf8")).toBe("second\n");
  await expect(readFile(join(prCheckout, "deferred.txt"), "utf8")).rejects.toThrow();
  await run("bun", [cli, "stack", "sync", "fixture"], project, true);
  expect((await readFile(join(project, ".stackanvil", "fixture-full-apply.json"), "utf8")).length).toBeGreaterThan(0);
  await writeFile(join(checkout, "note.txt"), "resolved\n");
  await git(["add", "note.txt"], checkout);
  await run("bun", [cli, "stack", "continue", "fixture"], project);
  expect(await git(["rev-list", "--count", `${baseSha}..HEAD`], checkout)).toBe("3");
  expect(await git(["show", "-s", "--format=%ce", "HEAD"], checkout)).toBe("test@example.invalid");
  expect(await readFile(join(checkout, "note.txt"), "utf8")).toBe("resolved\n");
  expect(await readFile(join(checkout, "deferred.txt"), "utf8")).toBe("third\n");
  await expect(readFile(join(project, ".stackanvil", "fixture-full-apply.json"), "utf8")).rejects.toThrow();

  const seriesFile = join(project, "patches", "fixture", "series.json");
  const seriesBeforeAdd = await readFile(seriesFile, "utf8");
  await run("bun", [cli, "stack", "add", "fixture", "upstreamable"], project, true);
  expect(await readFile(seriesFile, "utf8")).toBe(seriesBeforeAdd);

  await run("bun", [cli, "stack", "rebuild", "fixture"], project);
  const rebuilt = await readFile(firstPatch, "utf8");
  expect(rebuilt).toBe(originalFirstPatch);
  await run("bun", [cli, "stack", "rebuild", "fixture"], project);
  expect(await readFile(firstPatch, "utf8")).toBe(rebuilt);

  await writeFile(secondPatch, conflictingPatch);
  await run("bun", [cli, "stack", "sync", "fixture"], project, true);
  await run("bun", [cli, "stack", "abort", "fixture"], project);
  expect(await git(["status", "--porcelain"], checkout)).toBe("");
  await expect(readFile(join(project, ".stackanvil", "fixture-full-apply.json"), "utf8")).rejects.toThrow();
});
