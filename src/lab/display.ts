import { createCaptureWaylandBuilder } from "../capture/native.ts";
import { spawn, execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, openSync, closeSync } from "node:fs";
import { chmod, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { root } from "../model.ts";
import { nativeWaylandEnvironment, waylandTool, waylandToolEnvironment } from "./wayland.ts";

const execute = promisify(execFile);
const privateRoot = join(root, ".stackanvil", "lab");
const stateFile = join(privateRoot, "display.json");
const identity = createHash("sha256").update(root).digest("hex").slice(0, 12);
const sway = waylandTool("sway");
const swaymsg = waylandTool("swaymsg");

interface DisplayState {
  backend: "wayland";
  pid: number;
  display: string;
  runtime: string;
  socket: string;
  inputPid?: number;
  audioPid?: number;
  audioModuleId?: number;
}

function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function stopProcess(
  pid: number,
  name: string,
  guard?: (pid: number) => void,
): Promise<void> {
  if (!alive(pid)) return;
  guard?.(pid);
  try {
    process.kill(pid, "SIGINT");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
  }
  for (let attempt = 0; attempt < 50 && alive(pid); attempt++) await Bun.sleep(100);
  if (alive(pid)) throw new Error(`${name} ${pid} did not stop. Its resources were retained.`);
}

async function savedDisplay(): Promise<DisplayState | undefined> {
  if (!existsSync(stateFile)) return undefined;
  const state = JSON.parse(await readFile(stateFile, "utf8")) as DisplayState;
  if (state.backend !== "wayland") {
    if (alive(state.pid))
      throw new Error(
        "A legacy lab display is still running. Stop it before starting the native Wayland lab.",
      );
    return undefined;
  }
  return state;
}

export async function activeDisplay(): Promise<DisplayState | undefined> {
  const state = await savedDisplay();
  if (!state) return undefined;
  if (!alive(state.pid)) {
    throw new Error(
      "The private Wayland compositor stopped unexpectedly. Run bun run lab display stop to clean up its input and audio services.",
    );
  }
  if (!existsSync(state.display) || !existsSync(state.socket))
    throw new Error(
      "The private Wayland display lost its sockets. Run bun run lab display stop before restarting it.",
    );
  return state;
}

export async function ensureDisplay(): Promise<DisplayState> {
  const current = await activeDisplay();
  if (current) {
    if (!current.inputPid || !alive(current.inputPid)) {
      await startInput(current);
      await writeFile(stateFile, `${JSON.stringify(current, null, 2)}\n`, { mode: 0o600 });
    }
    if (!current.audioPid || !alive(current.audioPid)) {
      await startAudio(current);
      await writeFile(stateFile, `${JSON.stringify(current, null, 2)}\n`, { mode: 0o600 });
    }
    return current;
  }
  if (process.env.STACKANVIL_USE_DESKTOP === "1")
    throw new Error("Desktop mode does not use a private display.");
  if (!sway || !swaymsg)
    throw new Error(
      "Install sway and swaymsg for the private Wayland lab. No game was launched on your desktop.",
    );
  if (!Bun.which("pactl")) throw new Error("pactl is required to keep lab games silent.");
  const runtimeRoot = process.env.XDG_RUNTIME_DIR;
  if (!runtimeRoot)
    throw new Error("Set XDG_RUNTIME_DIR to your session's private runtime directory.");
  await mkdir(privateRoot, { recursive: true, mode: 0o700 });
  const lock = join(privateRoot, "display-start.lock");
  await mkdir(lock, { mode: 0o700 }).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "EEXIST") throw new Error("Another lab display startup is in progress.");
    throw error;
  });
  let runtime: string | undefined;
  let state: DisplayState | undefined;
  try {
    // Unix socket paths have a small fixed limit. Keep sockets in the session
    // runtime directory even when the repository is in a deeply nested worktree.
    runtime = await mkdtemp(join(runtimeRoot, `stackanvil-${identity}-`));
    await chmod(runtime, 0o700);
    const socket = join(runtime, "sway.sock");
    if (Buffer.byteLength(socket) >= 104)
      throw new Error("XDG_RUNTIME_DIR is too long for Wayland sockets.");
    const config = join(privateRoot, "sway.conf");
    await writeFile(
      config,
      [
        "xwayland disable",
        "swaybg_command -",
        "swaynag_command -",
        "output HEADLESS-1 mode 1280x720@120Hz",
        "output * scale 1",
        "output * adaptive_sync off",
        "seat seat0 fallback true",
        "seat seat0 hide_cursor 0",
        "input * xkb_layout us",
        "input * pointer_accel 0",
        "input * accel_profile flat",
        "for_window [all] floating enable, border none",
        "focus_follows_mouse no",
        "",
      ].join("\n"),
      { mode: 0o600 },
    );
    const log = openSync(join(privateRoot, "display.log"), "a", 0o600);
    const child = spawn(sway, ["--unsupported-gpu", "--config", config], {
      cwd: root,
      detached: true,
      stdio: ["ignore", log, log],
      env: waylandToolEnvironment({
        ...process.env,
        DISPLAY: "",
        WAYLAND_DISPLAY: "",
        WAYLAND_SOCKET: "",
        XDG_RUNTIME_DIR: runtime,
        SWAYSOCK: socket,
        WLR_BACKENDS: "headless",
        WLR_HEADLESS_OUTPUTS: "1",
        WLR_LIBINPUT_NO_DEVICES: "1",
        WLR_RENDERER: process.env.STACKANVIL_WAYLAND_RENDERER ?? "gles2",
        WLR_RENDERER_ALLOW_SOFTWARE: "1",
      }),
    });
    closeSync(log);
    let spawnError: Error | undefined;
    child.on("error", (error) => {
      spawnError = error;
    });
    child.unref();
    if (!child.pid) throw new Error("Could not start Sway.");
    state = { backend: "wayland", pid: child.pid, display: "", runtime, socket };
    for (let attempt = 0; attempt < 100 && alive(child.pid); attempt++) {
      const waylandSocket = (await readdir(runtime, { withFileTypes: true })).find(
        (entry) => entry.isSocket() && /^wayland-\d+$/.test(entry.name),
      );
      if (existsSync(socket) && waylandSocket) {
        state.display = join(runtime, waylandSocket.name);
        break;
      }
      await Bun.sleep(100);
    }
    if (spawnError) throw spawnError;
    if (!alive(child.pid) || !state.display)
      throw new Error("Sway stopped during startup. Read .stackanvil/lab/display.log.");
    // Socket creation precedes compositor readiness. Query IPC before publishing
    // the display so clients never race the output configuration.
    const outputs = JSON.parse(
      (
        await execute(swaymsg, ["-s", socket, "-r", "-t", "get_outputs"], {
          env: waylandToolEnvironment(process.env),
        })
      ).stdout,
    ) as { name: string; active: boolean }[];
    if (!outputs.some((output) => output.name === "HEADLESS-1" && output.active))
      throw new Error("The private Wayland output did not become ready.");
    await startInput(state);
    await startAudio(state);
    await writeFile(stateFile, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
    return state;
  } catch (error) {
    try {
      if (state?.inputPid) await stopProcess(state.inputPid, "Wayland input service");
      if (state?.audioPid) await stopProcess(state.audioPid, "Lab audio guard");
      if (state) await stopProcess(state.pid, "Sway");
      if (state?.audioModuleId)
        await execute("pactl", ["unload-module", String(state.audioModuleId)]);
    } catch (cleanupError) {
      // Retain a receipt for recovery if a failed startup leaves a process alive.
      if (state) await writeFile(stateFile, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
      throw new AggregateError(
        [error, cleanupError],
        "Wayland startup failed. Its surviving resources were retained for bun run lab display stop.",
        { cause: cleanupError },
      );
    }
    if (runtime) await rm(runtime, { recursive: true, force: true });
    throw error;
  } finally {
    await rm(lock, { recursive: true, force: true });
  }
}

async function startInput(state: DisplayState): Promise<void> {
  const native = await createCaptureWaylandBuilder(async (args, cwd, env) => {
    await execute("cargo", args, { cwd, env });
  })(process.env);
  const socket = join(state.runtime, "input.sock");
  if (existsSync(socket)) await rm(socket);
  const log = openSync(join(privateRoot, "input.log"), "a", 0o600);
  const child = spawn(native, ["serve", socket], {
    cwd: root,
    detached: true,
    stdio: ["ignore", log, log],
    env: waylandToolEnvironment(
      nativeWaylandEnvironment({
        ...process.env,
        WAYLAND_DISPLAY: state.display,
        SWAYSOCK: state.socket,
        STACKANVIL_UI_ISOLATED: "1",
      }),
    ),
  });
  closeSync(log);
  child.on("error", () => {});
  child.unref();
  if (!child.pid) throw new Error("Could not start the Wayland input service.");
  state.inputPid = child.pid;
  for (let attempt = 0; attempt < 100 && alive(child.pid) && !existsSync(socket); attempt++)
    await Bun.sleep(50);
  if (!alive(child.pid) || !existsSync(socket))
    throw new Error("Wayland input service failed. Read .stackanvil/lab/input.log.");
}

async function startAudio(state: DisplayState): Promise<void> {
  const { stdout } = await execute("pactl", ["list", "sinks", "short"]);
  if (!stdout.split("\n").some((line) => line.split("\t")[1] === "stackanvil_silent")) {
    const loaded = await execute("pactl", [
      "load-module",
      "module-null-sink",
      "sink_name=stackanvil_silent",
      "sink_properties=device.description=StackAnvil-Silent",
    ]);
    state.audioModuleId = Number(loaded.stdout.trim());
  }
  const log = openSync(join(privateRoot, "audio.log"), "a", 0o600);
  const guard = spawn(process.execPath, [join(root, "src", "lab", "audio-guard.ts"), identity], {
    cwd: root,
    detached: true,
    stdio: ["ignore", log, log],
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
  return nativeWaylandEnvironment({
    ...process.env,
    WAYLAND_DISPLAY: state.display,
    SWAYSOCK: state.socket,
    STACKANVIL_INPUT_SOCKET: join(state.runtime, "input.sock"),
    STACKANVIL_UI_ISOLATED: "1",
    PULSE_SINK: "stackanvil_silent",
    PULSE_PROP: `${process.env.PULSE_PROP ?? ""} stackanvil.lab=${identity}`.trim(),
    PIPEWIRE_PROPS: `${process.env.PIPEWIRE_PROPS ?? ""} stackanvil.lab=${identity}`.trim(),
  });
}

export async function stopDisplay(guard?: {
  process: (pid: number) => void;
  audioModule: (id: number) => Promise<void>;
}): Promise<void> {
  const state = await savedDisplay();
  if (!state) {
    console.log("Private Wayland display is stopped.");
    return;
  }
  if (state.inputPid) await stopProcess(state.inputPid, "Wayland input service", guard?.process);
  await stopProcess(state.pid, "Sway", guard?.process);
  if (state.audioPid) await stopProcess(state.audioPid, "Lab audio guard", guard?.process);
  if (state.audioModuleId) {
    await guard?.audioModule(state.audioModuleId);
    await execute("pactl", ["unload-module", String(state.audioModuleId)]);
  }
  await rm(state.runtime, { recursive: true, force: true });
  await rm(stateFile, { force: true });
  console.log(`Stopped private Wayland display ${state.display}.`);
}
