import { createCaptureWaylandBuilder } from "../capture/native.ts";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, openSync, closeSync, readFileSync } from "node:fs";
import { chmod, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { root } from "../model.ts";
import { nativeWaylandEnvironment, waylandTool, waylandToolEnvironment } from "./wayland.ts";
import { Schema } from "effect";
import { errorCode, parseJson } from "../guards.ts";
import { print } from "../output.ts";
import { execFileAsync as execute } from "../process.ts";

const privateRoot = join(root, ".stackanvil", "lab");
const stateFile = join(privateRoot, "display.json");
const swayConfig = join(privateRoot, "sway.conf");
const audioGuard = join(root, "src", "lab", "audio-guard.ts");
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

const DisplayStateSchema = Schema.Struct({
  backend: Schema.Literal("wayland"),
  pid: Schema.Finite,
  display: Schema.String,
  runtime: Schema.String,
  socket: Schema.String,
  inputPid: Schema.optionalKey(Schema.Finite),
  audioPid: Schema.optionalKey(Schema.Finite),
  audioModuleId: Schema.optionalKey(Schema.Finite),
});
// Older labs saved other display backends. Only their process ID still matters.
const SavedDisplaySchema = Schema.Union([
  DisplayStateSchema,
  Schema.Struct({ backend: Schema.String, pid: Schema.Finite }),
]);
const OutputsSchema = Schema.Array(Schema.Struct({ name: Schema.String, active: Schema.Boolean }));
/**
 * Each worktree runs its own lab, so each lab owns a separate sink. A shared sink would disappear
 * for every other live lab when one lab stops and unloads it.
 */
export const silentSink = `stackanvil_silent_${identity}`;
export const silentModuleArgs = [
  `sink_name=${silentSink}`,
  "sink_properties=device.description=StackAnvil-Silent",
];
type Pactl = (args: string[]) => Promise<string>;
const pactl: Pactl = async (args) => (await execute("pactl", args)).stdout;

function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/**
 * display.json outlives reboots, and the kernel then reuses its PIDs. Treat a saved PID as a lab
 * process only while its arguments still contain the lab's private paths.
 */
function owned(pid: number, markers: readonly string[]): boolean {
  let args: string[];
  try {
    args = readFileSync(`/proc/${pid}/cmdline`, "utf8").split("\0");
  } catch (error) {
    if (errorCode(error) === "ENOENT" || errorCode(error) === "ESRCH") return false;
    throw error;
  }
  return markers.every((marker) => args.includes(marker));
}
const swayMarkers = ["--config", swayConfig];
const audioMarkers = [audioGuard, identity];
function inputMarkers(state: DisplayState): string[] {
  return ["serve", join(state.runtime, "input.sock")];
}

async function stopProcess(
  pid: number,
  name: string,
  markers: readonly string[],
  guard?: (pid: number) => void,
): Promise<void> {
  if (!owned(pid, markers)) return;
  guard?.(pid);
  try {
    process.kill(pid, "SIGINT");
  } catch (error) {
    if (errorCode(error) !== "ESRCH") throw error;
  }
  for (let attempt = 0; attempt < 50 && owned(pid, markers); attempt++) await Bun.sleep(100);
  if (owned(pid, markers))
    throw new Error(`${name} ${pid} did not stop. Its resources were retained.`);
}

async function savedDisplay(): Promise<DisplayState | undefined> {
  if (!existsSync(stateFile)) return undefined;
  const state = parseJson(SavedDisplaySchema, await readFile(stateFile, "utf8"));
  if (!Schema.is(DisplayStateSchema)(state)) {
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
  if (!owned(state.pid, swayMarkers)) {
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
    if (!current.inputPid || !owned(current.inputPid, inputMarkers(current))) {
      await startInput(current);
      await writeFile(stateFile, `${JSON.stringify(current, null, 2)}\n`, { mode: 0o600 });
    }
    if (!current.audioPid || !owned(current.audioPid, audioMarkers)) {
      await startAudio(current);
      await writeFile(stateFile, `${JSON.stringify(current, null, 2)}\n`, { mode: 0o600 });
    }
    return current;
  }
  if (process.env["STACKANVIL_USE_DESKTOP"] === "1")
    throw new Error("Desktop mode does not use a private display.");
  if (!sway || !swaymsg)
    throw new Error(
      "Install sway and swaymsg for the private Wayland lab. No game was launched on your desktop.",
    );
  if (!Bun.which("pactl")) throw new Error("pactl is required to keep lab games silent.");
  const runtimeRoot = process.env["XDG_RUNTIME_DIR"];
  if (!runtimeRoot)
    throw new Error("Set XDG_RUNTIME_DIR to your session's private runtime directory.");
  await mkdir(privateRoot, { recursive: true, mode: 0o700 });
  const lock = join(privateRoot, "display-start.lock");
  await acquireStartLock(lock);
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
    await writeFile(
      swayConfig,
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
    const child = spawn(sway, ["--unsupported-gpu", ...swayMarkers], {
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
        WLR_RENDERER: process.env["STACKANVIL_WAYLAND_RENDERER"] ?? "gles2",
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
        (entry) => entry.isSocket() && /^wayland-\d+$/u.test(entry.name),
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
    const outputs = parseJson(
      OutputsSchema,
      (
        await execute(swaymsg, ["-s", socket, "-r", "-t", "get_outputs"], {
          env: waylandToolEnvironment(process.env),
        })
      ).stdout,
    );
    if (!outputs.some((output) => output.name === "HEADLESS-1" && output.active))
      throw new Error("The private Wayland output did not become ready.");
    await startInput(state);
    await startAudio(state);
    await writeFile(stateFile, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
    return state;
  } catch (error) {
    try {
      if (state?.inputPid)
        await stopProcess(state.inputPid, "Wayland input service", inputMarkers(state));
      if (state?.audioPid) await stopProcess(state.audioPid, "Lab audio guard", audioMarkers);
      if (state) await stopProcess(state.pid, "Sway", swayMarkers);
      if (state?.audioModuleId) await unloadSilentModule(state.audioModuleId);
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

async function createLock(path: string): Promise<boolean> {
  try {
    await writeFile(path, `${process.pid}\n`, { flag: "wx", mode: 0o600 });
    return true;
  } catch (error) {
    if (errorCode(error) === "EEXIST") return false;
    throw error;
  }
}

// Earlier versions used an ownerless directory lock. An empty file is still being written.
async function lockOwner(path: string): Promise<string> {
  return readFile(path, "utf8").catch((error: unknown) => {
    if (errorCode(error) === "EISDIR" || errorCode(error) === "ENOENT") return "0";
    throw error;
  });
}

/**
 * A startup can end without its finally block, for example after a second Ctrl+C, SIGHUP, or
 * SIGKILL during the first input service build. Record the owner so a later start can replace a
 * lock whose process no longer exists.
 *
 * Two starts can find the same stale lock. Removing a lock is not atomic with checking its owner,
 * so the slower start could remove the lock the faster start had just created. A second lock
 * therefore admits one replacement at a time, and the owner is checked again inside it.
 */
export async function acquireStartLock(
  lock: string,
  isAlive: (pid: number) => boolean | Promise<boolean> = alive,
): Promise<void> {
  const busy = new Error("Another lab display startup is in progress.");
  if (await createLock(lock)) return;
  const owner = await lockOwner(lock);
  const pid = Number(owner);
  if (owner === "" || (Number.isInteger(pid) && pid > 0 && (await isAlive(pid)))) throw busy;
  const replacement = `${lock}.replace`;
  if (!(await createLock(replacement))) {
    const replacer = Number(await lockOwner(replacement));
    if (replacer > 0 && !(await isAlive(replacer)))
      throw new Error(
        `A lab display startup stopped while it replaced a stale lock. Remove ${replacement} if no lab display is starting.`,
      );
    throw busy;
  }
  try {
    if ((await lockOwner(lock)) === owner) await rm(lock, { recursive: true, force: true });
  } finally {
    await rm(replacement, { force: true });
  }
  if (!(await createLock(lock))) throw busy;
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

/** Loads this lab's silent sink unless it already exists, and returns the new module ID. */
export async function ensureSilentSink(run: Pactl = pactl): Promise<number | undefined> {
  const sinks = await run(["list", "sinks", "short"]);
  if (sinks.split("\n").some((line) => line.split("\t")[1] === silentSink)) return undefined;
  return Number((await run(["load-module", "module-null-sink", ...silentModuleArgs])).trim());
}

async function startAudio(state: DisplayState): Promise<void> {
  const moduleId = await ensureSilentSink();
  if (moduleId !== undefined) state.audioModuleId = moduleId;
  const log = openSync(join(privateRoot, "audio.log"), "a", 0o600);
  // The guard's ownership markers stay unchanged, so stop still recognizes guards started before
  // the sink name was passed.
  const guard = spawn(process.execPath, [...audioMarkers, silentSink], {
    cwd: root,
    detached: true,
    stdio: ["ignore", log, log],
  });
  closeSync(log);
  guard.unref();
  if (!guard.pid) throw new Error("Could not start lab audio guard.");
  state.audioPid = guard.pid;
}

/**
 * Module IDs restart with the sound server. After a restart or reboot, the saved ID can be missing
 * or belong to another module, so unload it only while it is still the lab's silent sink.
 */
export async function unloadSilentModule(id: number, run: Pactl = pactl): Promise<void> {
  const loaded = (await run(["list", "modules", "short"])).split("\n").some((line) => {
    const [module, name, args] = line.split("\t");
    return (
      module === String(id) && name === "module-null-sink" && args === silentModuleArgs.join(" ")
    );
  });
  if (loaded) await run(["unload-module", String(id)]);
}

/** Stops the saved display's services and silent sink that still belong to this lab. */
export async function releaseDisplay(
  state: DisplayState,
  guard?: DisplayGuard,
  run: Pactl = pactl,
): Promise<void> {
  if (state.inputPid)
    await stopProcess(state.inputPid, "Wayland input service", inputMarkers(state), guard?.process);
  await stopProcess(state.pid, "Sway", swayMarkers, guard?.process);
  if (state.audioPid)
    await stopProcess(state.audioPid, "Lab audio guard", audioMarkers, guard?.process);
  if (state.audioModuleId) {
    await guard?.audioModule(state.audioModuleId);
    await unloadSilentModule(state.audioModuleId, run);
  }
}

export async function displayEnv(start = false): Promise<NodeJS.ProcessEnv | undefined> {
  if (process.env["STACKANVIL_USE_DESKTOP"] === "1") return undefined;
  const state = start ? await ensureDisplay() : await activeDisplay();
  if (!state) return undefined;
  return nativeWaylandEnvironment({
    ...process.env,
    WAYLAND_DISPLAY: state.display,
    SWAYSOCK: state.socket,
    STACKANVIL_INPUT_SOCKET: join(state.runtime, "input.sock"),
    STACKANVIL_UI_ISOLATED: "1",
    PULSE_SINK: silentSink,
    PULSE_PROP: `${process.env["PULSE_PROP"] ?? ""} stackanvil.lab=${identity}`.trim(),
    PIPEWIRE_PROPS: `${process.env["PIPEWIRE_PROPS"] ?? ""} stackanvil.lab=${identity}`.trim(),
  });
}

interface DisplayGuard {
  process: (pid: number) => void;
  audioModule: (id: number) => Promise<void>;
}

export async function stopDisplay(guard?: DisplayGuard): Promise<void> {
  const state = await savedDisplay();
  if (!state) {
    print("Private Wayland display is stopped.");
    return;
  }
  await releaseDisplay(state, guard);
  await rm(state.runtime, { recursive: true, force: true });
  await rm(stateFile, { force: true });
  print(`Stopped private Wayland display ${state.display}.`);
}
