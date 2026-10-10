import { afterEach, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, realpath, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { directChild, realDirectory } from "../src/replay/private-path.ts";
import { requireEnvironmentPathIdle } from "../src/replay/process-environment.ts";
import { writePrivateFixture } from "../src/replay/form-fixture.ts";

const roots: string[] = [];
afterEach(async () => { for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true }); });

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "stackanvil paths $() "));
  roots.push(root);
  const directory = join(root, "directory"), alias = join(root, "ancestor-alias");
  await mkdir(join(directory, "owned"), { recursive: true });
  await symlink(directory, alias);
  return { root, directory, alias, owned: join(alias, "owned"), actual: await realpath(join(directory, "owned")) };
}

test("canonicalizes ancestor aliases but refuses an aliased owned root and unrelated outputs", async () => {
  const input = await fixture();
  expect(await realDirectory(input.owned)).toBe(input.actual);
  expect(await directChild(input.actual, join(input.owned, "child"))).toBe(join(input.actual, "child"));
  await expect(realDirectory(input.alias)).rejects.toThrow();
  await expect(directChild(input.actual, join(input.directory, "child"))).rejects.toThrow();
  await expect(directChild(input.actual, join(input.owned, "child"), "different")).rejects.toThrow();
});

test("writes a direct fixture under a canonical root and still refuses root and output symlinks", async () => {
  const input = await fixture(), files = [{ name: "fixture.json", bytes: Buffer.from("private") }];
  await writePrivateFixture(join(input.owned, "fixture"), input.actual, files, async () => {});
  expect(await readFile(join(input.actual, "fixture", "fixture.json"), "utf8")).toBe("private");
  await expect(writePrivateFixture(join(input.alias, "fixture"), input.alias, files, async () => {})).rejects.toThrow();
  await symlink(join(input.actual, "fixture"), join(input.owned, "linked"));
  await expect(writePrivateFixture(join(input.owned, "linked"), input.actual, files, async () => {})).rejects.toThrow();
  expect(await readFile(join(input.actual, "fixture", "fixture.json"), "utf8")).toBe("private");
});

test.skipIf(!["linux", "darwin"].includes(process.platform))("matches complete live environment paths across aliases without matching arguments or neighboring paths", async () => {
  const input = await fixture();
  for (const variable of ["BOL_HOME", "WINEPREFIX"] as const) {
    for (const [environment, target, busy] of [[input.owned, input.actual, true], [`${input.owned}-neighbor`, input.actual, false],
      [join(input.owned, "not-created"), join(input.actual, "not-created"), true]] as const) {
      const child = Bun.spawn([process.execPath, "-e", 'console.log("ready"); setInterval(() => {}, 1000)', "", `${variable}=${input.actual}`], {
        env: { ...process.env, [variable]: environment, [`OTHER_${variable}`]: input.actual }, stdout: "pipe", stderr: "ignore",
      });
      try {
        const reader = child.stdout.getReader(); await reader.read(); reader.releaseLock();
        if (busy) await expect(requireEnvironmentPathIdle(variable, target)).rejects.toThrow("in use");
        else await requireEnvironmentPathIdle(variable, target);
      } finally { child.kill(); await child.exited; }
    }
  }
});

test.skipIf(process.platform !== "darwin")("refuses unavailable Darwin inspection without publishing process data", async () => {
  const input = await fixture();
  const module = new URL("../src/replay/process-environment.ts", import.meta.url).href;
  const code = `import { requireEnvironmentPathIdle } from ${JSON.stringify(module)};
    try { await requireEnvironmentPathIdle("WINEPREFIX", ${JSON.stringify(input.actual)}); process.exit(1); }
    catch (error) { if (error.message !== "Cannot inspect native process ownership on macOS.") process.exit(2); }`;
  const child = Bun.spawn([process.execPath, "-e", code], { env: { ...process.env, PATH: input.actual }, stdout: "pipe", stderr: "pipe" });
  expect(await child.exited).toBe(0);
  expect(await new Response(child.stdout).text()).toBe("");
  expect(await new Response(child.stderr).text()).toBe("");
});

test.skipIf(process.platform !== "darwin")("retries Darwin stack-copy races while preserving bounded failures for unreadable live processes", async () => {
  const script = fileURLToPath(new URL("./replay-process-environment.test.py", import.meta.url));
  const child = Bun.spawn(["python3", script], { stdout: "pipe", stderr: "pipe" });
  const output = await new Response(child.stderr).text();
  expect(await child.exited).toBe(0);
  expect(output).toContain("Ran 6 tests");
  expect(await new Response(child.stdout).text()).toBe("");
});

test.skipIf(process.platform !== "darwin")("keeps inspecting exact ownership while unrelated processes repeatedly exit", async () => {
  const input = await fixture();
  const code = 'console.log("ready"); while (true) { const child = Bun.spawn([process.execPath, "-e", ""], {stdout:"ignore",stderr:"ignore"}); await child.exited; }';
  const churn = Bun.spawn([process.execPath, "-e", code], { stdout: "pipe", stderr: "ignore" });
  try {
    const reader = churn.stdout.getReader(); await reader.read(); reader.releaseLock();
    for (let iteration = 0; iteration < 30; iteration++) {
      await requireEnvironmentPathIdle("WINEPREFIX", input.actual);
    }
  } finally { churn.kill(); await churn.exited; }
}, 15000);
