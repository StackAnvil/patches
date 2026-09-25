import { spawn, execFile } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, openSync, closeSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { root } from "../model.ts";

const execute = promisify(execFile);
const privateRoot = join(root, ".stackanvil", "lab");
const stateFile = join(privateRoot, "display.json");
const authFile = join(privateRoot, "display.auth");
const display = process.env.STACKANVIL_LAB_DISPLAY ?? ":99";
const xvfb = process.env.STACKANVIL_XVFB_BINARY ?? Bun.which("Xvfb")
  ?? join(root, ".stackanvil", "tools", "xvfb-root", "usr", "bin", "Xvfb");

interface DisplayState { pid: number; display: string; authFile: string; audioPid?: number; audioModuleId?: number }

function alive(pid: number): boolean {
  try { process.kill(pid, 0); return true; } catch { return false; }
}

function socketPath(): string {
  const number = /^:(\d+)$/.exec(display)?.[1];
  if (!number) throw new Error("STACKANVIL_LAB_DISPLAY must be an X display such as :99.");
  return `/tmp/.X11-unix/X${number}`;
}

export async function activeDisplay(): Promise<DisplayState | undefined> {
  if (!existsSync(stateFile)) return undefined;
  const state = JSON.parse(await readFile(stateFile, "utf8")) as DisplayState;
  return state.display === display && alive(state.pid) && existsSync(socketPath()) ? state : undefined;
}

export async function ensureDisplay(): Promise<DisplayState> {
  const current = await activeDisplay();
  if (current) {
    if (!current.audioPid || !alive(current.audioPid)) {
      await startAudio(current);
      await writeFile(stateFile, `${JSON.stringify(current, null, 2)}\n`, { mode: 0o600 });
    }
    return current;
  }
  if (process.env.STACKANVIL_USE_DESKTOP === "1") {
    throw new Error("The desktop mode does not use a virtual display.");
  }
  if (!existsSync(xvfb)) {
    throw new Error("Xvfb is missing. Install xorg-x11-server-Xvfb or set STACKANVIL_XVFB_BINARY. No game was launched on your desktop.");
  }
  if (existsSync(socketPath())) throw new Error(`Display ${display} already exists outside this lab. Choose another STACKANVIL_LAB_DISPLAY.`);
  await mkdir(privateRoot, { recursive: true, mode: 0o700 });
  await writeFile(authFile, "", { mode: 0o600 });
  await execute("xauth", ["-f", authFile, "add", display, ".", randomBytes(16).toString("hex")]);
  const log = openSync(join(privateRoot, "display.log"), "a", 0o600);
  const child = spawn(xvfb, [display, "-screen", "0", "1280x720x24", "-nolisten", "tcp", "-auth", authFile], {
    cwd: root, detached: true, stdio: ["ignore", log, log],
  });
  closeSync(log);
  child.unref();
  if (!child.pid) throw new Error("Could not start Xvfb.");
  for (let attempt = 0; attempt < 60 && alive(child.pid) && !existsSync(socketPath()); attempt++) await Bun.sleep(100);
  if (!alive(child.pid) || !existsSync(socketPath())) throw new Error("Xvfb stopped during startup. Read .stackanvil/lab/display.log.");
  const state = { pid: child.pid, display, authFile };
  await startAudio(state);
  await writeFile(stateFile, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
  return state;
}

async function startAudio(state: DisplayState): Promise<void> {
  if (!Bun.which("pactl")) throw new Error("pactl is required to keep lab games silent.");
  const { stdout } = await execute("pactl", ["list", "sinks", "short"]);
  if (!stdout.split("\n").some((line) => line.split("\t")[1] === "stackanvil_silent")) {
    const loaded = await execute("pactl", ["load-module", "module-null-sink", "sink_name=stackanvil_silent",
      "sink_properties=device.description=StackAnvil-Silent"]);
    state.audioModuleId = Number(loaded.stdout.trim());
  }
  const log = openSync(join(privateRoot, "audio.log"), "a", 0o600);
  const guard = spawn(process.execPath, [join(root, "src", "lab", "audio-guard.ts"), state.display], {
    cwd: root, detached: true, stdio: ["ignore", log, log],
  });
  closeSync(log);
  guard.unref();
  if (!guard.pid) throw new Error("Could not start lab audio guard.");
  state.audioPid = guard.pid;
}

export async function displayEnv(start = false): Promise<NodeJS.ProcessEnv | undefined> {
  if (process.env.STACKANVIL_USE_DESKTOP === "1") return undefined;
  const state = start ? await ensureDisplay() : await activeDisplay();
  if (!state) return undefined;
  return { ...process.env, DISPLAY: state.display, XAUTHORITY: state.authFile,
    WAYLAND_DISPLAY: "", STACKANVIL_UI_ISOLATED: "1", PULSE_SINK: "stackanvil_silent" };
}

export async function stopDisplay(): Promise<void> {
  const state = await activeDisplay();
  if (!state) { console.log("Virtual display is stopped."); await rm(stateFile, { force: true }); return; }
  process.kill(state.pid, "SIGINT");
  for (let attempt = 0; attempt < 50 && existsSync(socketPath()); attempt++) await Bun.sleep(100);
  if (existsSync(socketPath())) throw new Error(`Xvfb ${state.pid} did not stop.`);
  if (state.audioPid && alive(state.audioPid)) process.kill(state.audioPid, "SIGINT");
  if (state.audioModuleId) await execute("pactl", ["unload-module", String(state.audioModuleId)]);
  await rm(stateFile, { force: true });
  console.log(`Stopped virtual display ${state.display}.`);
}
