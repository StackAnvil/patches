import { expect, test } from "bun:test";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  acquireStartLock,
  ensureSilentSink,
  releaseDisplay,
  silentModuleArgs,
  unloadSilentModule,
} from "../src/lab/display.ts";

const silent = silentModuleArgs.join(" ");

function fakePactl(modules: string) {
  const calls: string[][] = [];
  return {
    calls,
    run: async (args: string[]) => {
      calls.push(args);
      if (args[0] === "list") return modules;
      if (!modules.split("\n").some((line) => line.startsWith(`${args[1]}\t`)))
        throw new Error("Failure: No such entity");
      return "";
    },
  };
}

function running(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

test("display stop skips a saved audio module ID that a restarted sound server dropped or reused", async () => {
  const id = 536870916;
  for (const modules of [
    "536870912\tmodule-always-sink\t\t\n",
    `536870912\tmodule-always-sink\t\t\n${id}\tmodule-loopback\tsource=mic\t\n`,
  ]) {
    const pactl = fakePactl(modules);
    await unloadSilentModule(id, pactl.run);
    expect(pactl.calls).toEqual([["list", "modules", "short"]]);
  }
  const pactl = fakePactl(`536870912\tmodule-always-sink\t\t\n${id}\tmodule-null-sink\t${silent}\t\n`);
  await unloadSilentModule(id, pactl.run);
  expect(pactl.calls.at(-1)).toEqual(["unload-module", String(id)]);
});

test("a lab loads its own silent sink and leaves another worktree's sink loaded", async () => {
  const other = "sink_name=stackanvil_silent_ba9876543210 sink_properties=device.description=StackAnvil-Silent";
  const calls: string[][] = [];
  const run = async (args: string[]) => {
    calls.push(args);
    if (args.join(" ") === "list sinks short") return "41\tstackanvil_silent_ba9876543210\tmodule-null-sink.c\ts16le 2ch 44100Hz\tIDLE\n";
    if (args.join(" ") === "list modules short") return `7\tmodule-null-sink\t${other}\t\n`;
    if (args[0] === "load-module") return "8\n";
    throw new Error(`Unexpected pactl ${args.join(" ")}`);
  };
  expect(await ensureSilentSink(run)).toBe(8);
  expect(calls.at(-1)).toEqual(["load-module", "module-null-sink", ...silentModuleArgs]);
  await unloadSilentModule(7, run);
  expect(calls.some((args) => args[0] === "unload-module")).toBe(false);
});

test("display stop leaves unrelated processes that reuse saved display PIDs running", async () => {
  const directory = await mkdtemp(join(tmpdir(), "sa-display-"));
  const sleeper = join(directory, "sleeper.ts");
  await writeFile(sleeper, "await Bun.sleep(60_000);\n");
  const runtime = join(directory, "runtime");
  const unrelated = spawn(process.execPath, [sleeper], { stdio: "ignore" });
  const input = spawn(process.execPath, [sleeper, "serve", join(runtime, "input.sock")], { stdio: "ignore" });
  const inputExit = new Promise((settle) => input.on("exit", settle));
  try {
    await Bun.sleep(500);
    const pactl = fakePactl("");
    await releaseDisplay(
      { backend: "wayland", pid: unrelated.pid!, display: "", runtime, socket: "", inputPid: input.pid!, audioPid: unrelated.pid! },
      undefined,
      pactl.run,
    );
    await inputExit;
    expect(running(unrelated.pid!)).toBe(true);
    expect(input.exitCode ?? input.signalCode).not.toBeNull();
  } finally {
    unrelated.kill();
    input.kill();
    await rm(directory, { recursive: true, force: true });
  }
}, 20_000);

test("display startup replaces a lock left by an interrupted startup but not one held by a live process", async () => {
  const directory = await mkdtemp(join(tmpdir(), "sa-display-lock-"));
  const lock = join(directory, "display-start.lock");
  try {
    const exited = spawn("true");
    await new Promise((settle) => exited.on("exit", settle));
    await writeFile(lock, `${exited.pid}\n`);
    await acquireStartLock(lock);
    expect(await readFile(lock, "utf8")).toBe(`${process.pid}\n`);
    await expect(acquireStartLock(lock)).rejects.toThrow("in progress");
    await rm(lock);
    await mkdir(lock);
    await acquireStartLock(lock);
    expect(await readFile(lock, "utf8")).toBe(`${process.pid}\n`);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("two display starts that find the same stale lock do not both acquire it", async () => {
  const directory = await mkdtemp(join(tmpdir(), "sa-display-lock-"));
  const lock = join(directory, "display-start.lock");
  const stale = 999_999;
  try {
    await writeFile(lock, `${stale}\n`);
    let faster: Promise<void> | undefined;
    // The slower start has seen the stale owner. The faster start replaces it before the slower
    // start continues.
    const slower = acquireStartLock(lock, async (pid) => {
      if (pid !== stale) return true;
      faster ??= acquireStartLock(lock, (owner) => owner !== stale);
      await faster;
      return false;
    });
    await expect(slower).rejects.toThrow("in progress");
    await faster;
    expect(await readFile(lock, "utf8")).toBe(`${process.pid}\n`);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
