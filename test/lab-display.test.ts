import { expect, test } from "bun:test";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { acquireStartLock, releaseDisplay, unloadSilentModule } from "../src/lab/display.ts";

const silent = "sink_name=stackanvil_silent sink_properties=device.description=StackAnvil-Silent";

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
