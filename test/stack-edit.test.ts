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

const env = { ...Bun.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_EDITOR: "true" };

async function run(program: string, args: string[], cwd: string, shouldFail = false) {
  const child = Bun.spawn([program, ...args], { cwd, env, stdout: "pipe", stderr: "pipe" });
  const [output, error, code] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  if ((code === 0) === shouldFail) {
    throw new Error(`${program} ${args.join(" ")} exited ${code}:\n${output}${error}`);
  }
  return `${output}${error}`;
}

async function git(args: string[], cwd: string): Promise<string> {
  return (await run("git", args, cwd)).trim();
}

async function commit(dir: string, file: string, content: string, title: string) {
  await writeFile(join(dir, file), content);
  await git(["add", file], dir);
  await git(["commit", "-m", title, "-m", `Explain why ${title} matters.`], dir);
}

/**
 * Builds a project whose two upstreamable patches both change note.txt. With
 * `conflicting`, the second patch expects the base text, so a sync stops on it.
 */
async function stackFixture(conflicting = false) {
  const fixture = await mkdtemp(join(tmpdir(), "stackanvil-edit-"));
  fixtures.push(fixture);
  const upstream = join(fixture, "upstream");
  const project = join(fixture, "project");
  await mkdir(upstream);
  await git(["init", "-b", "main"], upstream);
  await git(["config", "user.name", "Patch Test"], upstream);
  await git(["config", "user.email", "test@example.invalid"], upstream);
  await commit(upstream, "note.txt", "base\n", "chore(test): create base");
  const baseSha = await git(["rev-parse", "HEAD"], upstream);

  const patches = join(project, "patches", "fixture");
  for (const group of ["setup", "upstreamable", "deferred"]) {
    await mkdir(join(patches, group), { recursive: true });
  }
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
        dependsOn: [],
        upstream: "unused/fixture",
        fork: "unused/fixture",
        prAssignees: [],
        baseBranch: "main",
        baseSha,
        java: "17",
        publication: "unused",
        buildTask: "build",
      },
    }),
  );
  const exportPatch = async (path: string) =>
    writeFile(join(patches, path), await run("git", ["format-patch", "--stdout", "-1"], upstream));
  await commit(upstream, "setup.txt", "setup\n", "chore(test): set up build");
  await exportPatch("setup/0001-setup.patch");
  await commit(upstream, "note.txt", "one\n", "feat(test): first");
  await exportPatch("upstreamable/0001-first.patch");
  if (conflicting) await git(["reset", "--hard", "HEAD~1"], upstream);
  await commit(upstream, "note.txt", "two\n", "feat(test): second");
  await exportPatch("upstreamable/0002-second.patch");
  await git(["reset", "--hard", baseSha], upstream);
  await writeFile(
    join(patches, "series.json"),
    JSON.stringify({
      setup: ["0001-setup.patch"],
      upstreamable: [
        { file: "0001-first.patch", title: "feat(test): first" },
        { file: "0002-second.patch", title: "feat(test): second" },
      ],
      deferred: [],
    }),
  );
  const checkout = join(project, ".worktrees", "fixture");
  await mkdir(join(project, ".worktrees"));
  await git(["clone", upstream, checkout], fixture);
  await git(["config", "user.name", "Patch Test"], checkout);
  await git(["config", "user.email", "test@example.invalid"], checkout);
  const stack = (args: string[], shouldFail = false) =>
    run("bun", [join(project, "src", "cli.ts"), "stack", ...args], project, shouldFail);
  return { baseSha, checkout, patches, project, stack };
}

test("rebuild resumes after a replay conflict was committed by hand", async () => {
  const { baseSha, checkout, patches, project, stack } = await stackFixture();
  await stack(["edit", "fixture", "0001-first.patch"]);
  await writeFile(join(checkout, "note.txt"), "uno\n");
  await git(["add", "note.txt"], checkout);
  // The later patch expects "one", so replaying it stops on a conflict.
  await stack(["rebuild", "fixture"], true);
  await writeFile(join(checkout, "note.txt"), "two\n");
  await git(["add", "note.txt"], checkout);
  await git(["cherry-pick", "--continue"], checkout);

  await stack(["rebuild", "fixture"]);

  expect(await git(["rev-list", "--count", `${baseSha}..HEAD`], checkout)).toBe("3");
  expect(await readFile(join(checkout, "note.txt"), "utf8")).toBe("two\n");
  expect(await readFile(join(patches, "upstreamable", "0001-first.patch"), "utf8")).toContain(
    "\n+uno\n",
  );
  const second = await readFile(join(patches, "upstreamable", "0002-second.patch"), "utf8");
  expect(second).toContain("\n-uno\n+two\n");
  await rejects(readFile(join(project, ".stackanvil", "fixture.json"), "utf8"));
}, 600_000);

test("rebuild drops a later patch that the edited patch already contains", async () => {
  const { baseSha, checkout, patches, stack } = await stackFixture();
  await stack(["edit", "fixture", "0001-first.patch"]);
  await writeFile(join(checkout, "note.txt"), "two\n");
  await git(["add", "note.txt"], checkout);

  expect(await stack(["rebuild", "fixture"], true)).toContain(
    "rebuild dropped them: feat(test): second",
  );
  await rm(join(patches, "upstreamable", "0002-second.patch"));
  await writeFile(
    join(patches, "series.json"),
    JSON.stringify({
      setup: ["0001-setup.patch"],
      upstreamable: [{ file: "0001-first.patch", title: "feat(test): first" }],
      deferred: [],
    }),
  );
  await stack(["rebuild", "fixture"]);

  expect(await git(["rev-list", "--count", `${baseSha}..HEAD`], checkout)).toBe("2");
  expect(await readFile(join(patches, "upstreamable", "0001-first.patch"), "utf8")).toContain(
    "\n-base\n+two\n",
  );
}, 600_000);

test("rebuild keeps an unstaged new file out of the replay until it is staged", async () => {
  const { checkout, patches, stack } = await stackFixture();
  await stack(["edit", "fixture", "0001-first.patch"]);
  const edited = await git(["rev-parse", "HEAD"], checkout);
  await writeFile(join(checkout, "added.txt"), "added\n");

  expect(await stack(["rebuild", "fixture"], true)).toContain("Stage your edits");
  expect(await git(["rev-parse", "HEAD"], checkout)).toBe(edited);
  await git(["add", "added.txt"], checkout);
  await stack(["rebuild", "fixture"]);

  const first = await readFile(join(patches, "upstreamable", "0001-first.patch"), "utf8");
  expect(first).toContain("+++ b/added.txt");
}, 600_000);

test("stack continue and abort recover after git am finished by hand", async () => {
  const { baseSha, checkout, project, stack } = await stackFixture(true);
  const apply = join(project, ".stackanvil", "fixture-full-apply.json");
  await stack(["sync", "fixture"], true);
  await writeFile(join(checkout, "note.txt"), "two\n");
  await git(["add", "note.txt"], checkout);
  await git(["am", "--continue"], checkout);

  await stack(["continue", "fixture"]);
  expect(await git(["rev-list", "--count", `${baseSha}..HEAD`], checkout)).toBe("3");
  await rejects(readFile(apply, "utf8"));

  await stack(["sync", "fixture"], true);
  await git(["am", "--abort"], checkout);

  await stack(["abort", "fixture"]);
  await rejects(readFile(apply, "utf8"));
  expect(await stack(["sync", "fixture"], true)).toContain("Patch apply stopped at");
}, 600_000);

test("rebuild refuses to export an empty commit as a patch", async () => {
  const { checkout, patches, stack } = await stackFixture();
  const setup = join(patches, "setup", "0001-setup.patch");
  const saved = await readFile(setup, "utf8");
  await stack(["edit", "fixture", "0001-setup.patch"]);
  await git(["rm", "setup.txt"], checkout);
  await git(["commit", "--amend", "--allow-empty", "--no-edit"], checkout);

  expect(await stack(["rebuild", "fixture"], true)).toContain("has no file changes");
  expect(await readFile(setup, "utf8")).toBe(saved);
}, 600_000);

/** Lists a copy of the setup patch as a deferred patch, which the base stack already contains. */
async function deferSetupCopy(patches: string) {
  await cp(
    join(patches, "setup", "0001-setup.patch"),
    join(patches, "deferred", "0001-setup.patch"),
  );
  await writeFile(
    join(patches, "series.json"),
    JSON.stringify({
      setup: ["0001-setup.patch"],
      upstreamable: [
        { file: "0001-first.patch", title: "feat(test): first" },
        { file: "0002-second.patch", title: "feat(test): second" },
      ],
      deferred: [{ file: "0001-setup.patch", reason: "Covered by an upstream PR." }],
    }),
  );
}

test("stack sync names a patch whose changes the stack already contains", async () => {
  const { patches, stack } = await stackFixture();
  await deferSetupCopy(patches);

  expect(await stack(["sync", "fixture"], true)).toContain(
    "deferred/0001-setup.patch added no commit",
  );
}, 600_000);

test("stack edit refuses a filename that names patches in two groups", async () => {
  const { patches, stack } = await stackFixture();
  await deferSetupCopy(patches);

  const output = await stack(["edit", "fixture", "0001-setup.patch"], true);
  expect(output).toContain("setup/0001-setup.patch, deferred/0001-setup.patch");
}, 600_000);
