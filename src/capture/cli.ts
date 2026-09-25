import { execFile, spawn } from "node:child_process";
import { createConnection } from "node:net";
import { existsSync, openSync, closeSync, statSync } from "node:fs";
import { appendFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { Effect } from "effect";
import { root } from "../model.ts";
import { displayEnv } from "../lab/display.ts";

const execute = promisify(execFile);
const captureRoot = join(root, ".stackanvil", "captures");
const currentPath = join(captureRoot, "current.json");
const caDirectory = join(captureRoot, "ca");
const nativeSource = join(root, "native", "capture-x11.c");
const nativeBinary = join(root, ".stackanvil", "tools", "capture-x11");
const gnomeRemote = join(root, "scripts", "gnome_remote.py");
const mitmdump = Bun.which("mitmdump") ?? join(root, ".stackanvil", "tools", "mitmproxy", "bin", "mitmdump");
const launcher = process.env.BEDROCK_LAUNCHER ?? Bun.which("bedrock-on-linux") ?? join(homedir(), "AppImages", "bedrockonlinux.appimage");
const extractedLauncher = join(root, ".stackanvil", "tools", "bedrock-on-linux");

async function muteBedrockSettings(): Promise<void> {
  const users = join(homedir(), ".local", "share", "bedrock-on-linux", "compatdata", "pfx", "drive_c",
    "users", "steamuser", "AppData", "Roaming", "Minecraft Bedrock", "Users");
  if (!existsSync(users)) return;
  for (const entry of await readdir(users, { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^\d+$/.test(entry.name)) continue;
    const file = join(users, entry.name, "games", "com.mojang", "minecraftpe", "options.txt");
    if (!existsSync(file)) continue;
    const options = await readFile(file, "utf8");
    const muted = /^audio_main:.*$/m.test(options) ? options.replace(/^audio_main:.*$/m, "audio_main:0") : `${options}\naudio_main:0\n`;
    if (muted !== options) await writeFile(file, muted);
  }
}

interface Session {
  id: string;
  name: string;
  startedAt: string;
  proxyPid: number;
  port: number;
  mode: "regular" | "local";
  gamePid?: number;
  videos?: Partial<Record<Client, { pid: number; name: string; file: string; startedAt: string; stoppedAt?: string }>>;
  stoppedAt?: string;
}

interface WindowInfo {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

type Step =
  | { action: "mark"; label: string }
  | { action: "wait"; ms: number }
  | { action: "screenshot"; name: string }
  | { action: "click"; x: number; y: number }
  | { action: "type"; text: string }
  | { action: "key"; key: string }
  | { action: "videoStart"; name: string }
  | { action: "videoStop" };
type Client = "bedrock" | "java";

const capturePath = (id: string) => join(captureRoot, id);
const sessionFile = (id: string) => join(capturePath(id), "session.json");

function checkId(id: string): string {
  if (!/^[a-z0-9][a-z0-9-]{0,90}$/.test(id)) throw new Error("Use lowercase letters, digits, and hyphens for a session name.");
  return id;
}

async function save(session: Session): Promise<void> {
  await writeFile(sessionFile(session.id), `${JSON.stringify(session, null, 2)}\n`, { mode: 0o600 });
}

async function load(id?: string): Promise<Session> {
  const selected = id ?? (JSON.parse(await readFile(currentPath, "utf8")) as { id: string }).id;
  return JSON.parse(await readFile(sessionFile(checkId(selected)), "utf8")) as Session;
}

function alive(pid: number): boolean {
  try { process.kill(pid, 0); return true; } catch { return false; }
}

async function run(program: string, args: string[], cwd = root, env = process.env): Promise<string> {
  const { stdout } = await execute(program, args, { cwd, env, maxBuffer: 16 * 1024 * 1024 });
  return stdout.trimEnd();
}

async function waitForPort(port: number, pid: number): Promise<void> {
  for (let attempt = 0; attempt < 60; attempt++) {
    if (!alive(pid)) throw new Error("mitmdump stopped during startup. Read the private proxy.log in this session.");
    const ready = await new Promise<boolean>((resolveReady) => {
      const socket = createConnection({ host: "127.0.0.1", port });
      socket.once("connect", () => { socket.destroy(); resolveReady(true); });
      socket.once("error", () => resolveReady(false));
      socket.setTimeout(250, () => { socket.destroy(); resolveReady(false); });
    });
    if (ready) return;
    await Bun.sleep(250);
  }
  throw new Error(`mitmdump did not listen on port ${port}. Read the private proxy.log in this session.`);
}

async function start(name: string, mode: "regular" | "local" = "regular"): Promise<void> {
  checkId(name);
  if (!existsSync(mitmdump)) throw new Error("Run bun run dev:setup to install mitmproxy first.");
  if (existsSync(currentPath)) {
    const old = await load();
    if (!old.stoppedAt && alive(old.proxyPid)) throw new Error(`Capture ${old.id} is active. Stop it first.`);
  }
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..*$/, "").toLowerCase();
  const id = checkId(`${stamp}-${name}`);
  const dir = capturePath(id);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  await mkdir(caDirectory, { recursive: true, mode: 0o700 });
  const log = openSync(join(dir, "proxy.log"), "a", 0o600);
  const port = Number(process.env.STACKANVIL_PROXY_PORT ?? 18080);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("STACKANVIL_PROXY_PORT must be an unprivileged TCP port.");
  const args = [
    "--mode", mode === "regular" ? "regular" : `local:Minecraft.Win`,
    "--flow-detail", "0", "--set", `confdir=${caDirectory}`,
    "-s", join(root, "scripts", "capture_addon.py"),
    "-w", join(dir, "flows.mitm"),
  ];
  if (mode === "regular") args.push("--listen-host", "127.0.0.1", "--listen-port", String(port));
  const child = spawn(mitmdump, args, {
    cwd: root,
    detached: true,
    stdio: ["ignore", log, log],
    env: { ...process.env, STACKANVIL_CAPTURE_EVENTS: join(dir, "events.jsonl") },
  });
  closeSync(log);
  child.unref();
  if (!child.pid) throw new Error("Could not start mitmdump.");
  try {
    if (mode === "regular") await waitForPort(port, child.pid);
    else { await Bun.sleep(2000); if (!alive(child.pid)) throw new Error("Local capture stopped. Read proxy.log."); }
  } catch (error) {
    try { process.kill(child.pid, "SIGINT"); } catch { /* The proxy already stopped. */ }
    throw error;
  }
  const session: Session = { id, name, startedAt: new Date().toISOString(), proxyPid: child.pid, port, mode };
  await save(session);
  await writeFile(currentPath, `${JSON.stringify({ id })}\n`, { mode: 0o600 });
  console.log(`Capture ${id} started. Private files: ${dir}`);
  if (mode === "regular") console.log(`Proxy: http://127.0.0.1:${port}`);
}

async function launchGame(): Promise<void> {
  const session = await load();
  if (session.stoppedAt || !alive(session.proxyPid)) throw new Error("Start a capture before launching Bedrock.");
  if (!existsSync(launcher)) throw new Error(`BedrockOnLinux launcher not found: ${launcher}`);
  const isolated = await displayEnv(true);
  if (!isolated && process.env.STACKANVIL_USE_DESKTOP !== "1") throw new Error("A virtual display is required before launching Bedrock.");
  await muteBedrockSettings();
  const proxy = `http://127.0.0.1:${session.port}`;
  const ca = join(caDirectory, "mitmproxy-ca-cert.pem");
  const bundle = join(captureRoot, "ca-bundle.pem");
  if (!existsSync(ca)) throw new Error(`Proxy CA is missing: ${ca}`);
  const systemCa = [
    "/etc/ssl/cert.pem",
    "/etc/ssl/certs/ca-certificates.crt",
    "/etc/pki/tls/cert.pem",
    join(homedir(), ".local", "share", "bedrock-on-linux", "cache", "cacert.pem"),
  ].find(existsSync);
  if (!systemCa) throw new Error("No system CA bundle was found for an isolated proxy trust bundle.");
  await writeFile(bundle, `${await readFile(systemCa, "utf8")}\n${await readFile(ca, "utf8")}`, { mode: 0o600 });
  const appDir = launcher.toLowerCase().endsWith(".appimage") ? await prepareLauncher() : undefined;
  const program = appDir ? join(appDir, "usr", "python", "bin", "python3.12") : launcher;
  const args = appDir ? [join(appDir, "usr", "bin", "bedrock-on-linux"), "play"] : ["play"];
  const log = openSync(join(capturePath(session.id), "game.log"), "a", 0o600);
  const child = spawn(program, args, {
    cwd: root,
    detached: true,
    stdio: ["ignore", log, log],
    env: {
      ...process.env,
      ...isolated,
      ...(session.mode === "regular" ? {
        HTTP_PROXY: proxy, HTTPS_PROXY: proxy, http_proxy: proxy, https_proxy: proxy,
        NO_PROXY: "localhost,127.0.0.1", no_proxy: "localhost,127.0.0.1",
      } : {}),
      SSL_CERT_FILE: bundle, CURL_CA_BUNDLE: bundle, REQUESTS_CA_BUNDLE: bundle,
      ...(appDir ? { APPDIR: appDir, APPIMAGE: launcher } : {}),
    },
  });
  closeSync(log);
  child.unref();
  if (!child.pid) throw new Error("Could not launch BedrockOnLinux.");
  session.gamePid = child.pid;
  await save(session);
  console.log(`BedrockOnLinux launch started for ${session.id}. Read the private game.log if it stops.`);
}

async function prepareLauncher(): Promise<string> {
  if (!existsSync(launcher)) throw new Error(`BedrockOnLinux launcher not found: ${launcher}`);
  if (!launcher.toLowerCase().endsWith(".appimage")) return launcher;
  const signature = `${statSync(launcher).size}:${statSync(launcher).mtimeMs}`;
  const marker = join(extractedLauncher, "source.txt");
  const appDir = join(extractedLauncher, "squashfs-root");
  if (existsSync(marker) && existsSync(join(appDir, "usr", "python", "bin", "python3.12"))
    && (await readFile(marker, "utf8")).trim() === signature) return appDir;
  await rm(extractedLauncher, { recursive: true, force: true });
  await mkdir(extractedLauncher, { recursive: true, mode: 0o700 });
  const log = openSync(join(extractedLauncher, "extract.log"), "a", 0o600);
  const child = spawn(launcher, ["--appimage-extract"], { cwd: extractedLauncher, stdio: ["ignore", log, log] });
  closeSync(log);
  const code = await new Promise<number | null>((resolveCode, reject) => {
    child.once("error", reject);
    child.once("close", resolveCode);
  });
  if (code !== 0 || !existsSync(join(appDir, "usr", "python", "bin", "python3.12"))) {
    throw new Error(`BedrockOnLinux extraction failed. Read ${join(extractedLauncher, "extract.log")}.`);
  }
  await writeFile(marker, `${signature}\n`, { mode: 0o600 });
  return appDir;
}

async function mark(label: string): Promise<void> {
  const session = await load();
  if (session.stoppedAt) throw new Error("This capture is stopped.");
  if (!/^[A-Za-z0-9][A-Za-z0-9 _-]{0,80}$/.test(label)) throw new Error("Use a short marker with letters, digits, spaces, or hyphens.");
  await appendFile(join(capturePath(session.id), "markers.jsonl"), `${JSON.stringify({ time: Date.now() / 1000, label })}\n`, { mode: 0o600 });
  console.log(`Marked: ${label}`);
}

async function stop(): Promise<void> {
  const active = await load();
  for (const client of ["bedrock", "java"] as const) {
    if (active.videos?.[client] && !active.videos[client].stoppedAt) await stopVideo(client);
  }
  const session = await load();
  if (session.stoppedAt) { console.log(`Capture ${session.id} is already stopped.`); return; }
  if (alive(session.proxyPid)) {
    process.kill(session.proxyPid, "SIGINT");
    for (let attempt = 0; attempt < 40 && alive(session.proxyPid); attempt++) await Bun.sleep(250);
  }
  session.stoppedAt = new Date().toISOString();
  await save(session);
  console.log(`Capture ${session.id} stopped.${session.gamePid && alive(session.gamePid) ? " The game remains open." : ""}`);
}

async function startVideo(name: string, client: Client, windowId?: string): Promise<void> {
  checkId(name);
  const session = await load();
  if (session.stoppedAt) throw new Error("Start a capture before recording video.");
  const isolated = await displayEnv();
  if (!isolated) throw new Error("Video recording requires the private display so your desktop is never captured.");
  const previous = session.videos?.[client];
  if (previous && !previous.stoppedAt && alive(previous.pid)) throw new Error(`${client} video is already recording.`);
  const window = await chosenWindow(windowId, client);
  const file = join(capturePath(session.id), `${name}-${client}.mp4`);
  if (existsSync(file)) throw new Error(`Video ${name}-${client}.mp4 already exists. Choose another name.`);
  const log = openSync(join(capturePath(session.id), `${name}-${client}.video.log`), "a", 0o600);
  const child = spawn("ffmpeg", ["-nostdin", "-hide_banner", "-loglevel", "error", "-f", "x11grab",
    "-window_id", String(Number(window.id)), "-video_size", `${window.width}x${window.height}`,
    "-framerate", "15", "-draw_mouse", "1", "-i", isolated.DISPLAY!,
    "-an", "-c:v", "libx264", "-preset", "ultrafast", "-crf", "24", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart", file], {
    cwd: root, detached: true, env: isolated, stdio: ["ignore", log, log],
  });
  closeSync(log);
  child.unref();
  if (!child.pid) throw new Error("Could not start ffmpeg.");
  await Bun.sleep(500);
  if (!alive(child.pid)) throw new Error(`ffmpeg stopped. Read the private ${name}-${client}.video.log.`);
  session.videos ??= {};
  session.videos[client] = { pid: child.pid, name, file, startedAt: new Date().toISOString() };
  await save(session);
  console.log(`Recording ${client}: ${file}`);
}

async function stopVideo(client: Client): Promise<void> {
  const session = await load();
  const video = session.videos?.[client];
  if (!video || video.stoppedAt) { console.log(`No active ${client} video.`); return; }
  if (alive(video.pid)) process.kill(video.pid, "SIGINT");
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      await run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", video.file]);
      video.stoppedAt = new Date().toISOString();
      await save(session);
      console.log(`Video saved: ${video.file}`);
      return;
    } catch { await Bun.sleep(250); }
  }
  throw new Error(`Video did not finalize. Read the private ${video.name}-${client}.video.log.`);
}

async function compareVideo(before: string, after: string, client: Client): Promise<void> {
  checkId(before);
  checkId(after);
  const session = await load();
  const dir = capturePath(session.id);
  const first = join(dir, `${before}-${client}.mp4`);
  const second = join(dir, `${after}-${client}.mp4`);
  if (!existsSync(first) || !existsSync(second)) throw new Error("Both named recordings must exist in the current capture.");
  const output = join(dir, `${before}-vs-${after}-${client}.mp4`);
  await run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", first, "-i", second,
    "-filter_complex", "[0:v]scale=-2:480,setsar=1[left];[1:v]scale=-2:480,setsar=1[right];[left][right]hstack=inputs=2[v]",
    "-map", "[v]", "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "24", "-pix_fmt", "yuv420p", output]);
  console.log(`Before on the left, after on the right: ${output}`);
}

async function stopGame(): Promise<void> {
  const session = await load();
  if (!session.gamePid || !alive(session.gamePid)) { console.log("The captured Bedrock client is stopped."); return; }
  if (!(await displayEnv())) throw new Error("Close a desktop Bedrock client manually. Virtual display input is the default safe stop path.");
  await key("Alt+F4", undefined, "bedrock");
  for (let attempt = 0; attempt < 40 && alive(session.gamePid); attempt++) await Bun.sleep(250);
  if (alive(session.gamePid)) throw new Error("Bedrock did not exit after Alt+F4. Check the private game.log.");
  console.log("Stopped the captured Bedrock client.");
}

async function compileUi(): Promise<void> {
  if (!(await displayEnv())?.DISPLAY && !process.env.DISPLAY) throw new Error("Set DISPLAY to the game's X display.");
  await mkdir(join(root, ".stackanvil", "tools"), { recursive: true });
  if (!existsSync(nativeBinary) || statSync(nativeBinary).mtimeMs < statSync(nativeSource).mtimeMs) {
    await run("cc", ["-O2", "-Wall", "-Wextra", "-o", nativeBinary, nativeSource, "-lX11", "-lXtst"]);
  }
}

async function windows(): Promise<WindowInfo[]> {
  await compileUi();
  return JSON.parse(await run(nativeBinary, ["list"], root, await displayEnv() ?? process.env)) as WindowInfo[];
}

async function chosenWindow(id?: string, client: Client = "bedrock"): Promise<WindowInfo> {
  const available = await windows();
  if (id) {
    const chosen = available.find((window) => window.id === id);
    if (chosen) return chosen;
    throw new Error(`Window ${id} is not visible. Run bun run capture ui list.`);
  }
  const matches = available.filter((window) => client === "bedrock"
    ? /^minecraft(?: for windows| bedrock)?$/i.test(window.title)
    : /^minecraft\*?\s/i.test(window.title));
  if (matches.length === 1) return matches[0]!;
  throw new Error(`Select the ${client} window with --window-id <id>. Run bun run capture ui list.`);
}

async function screenshot(name: string, windowId?: string, client?: Client): Promise<string> {
  checkId(name);
  const session = await load();
  const window = await chosenWindow(windowId, client);
  const imagePath = join(capturePath(session.id), `${name}.png`);
  const ppmPath = join(capturePath(session.id), `${name}.ppm`);
  try {
    await run(nativeBinary, ["screenshot", window.id, ppmPath], root, await displayEnv() ?? process.env);
    await run("ffmpeg", ["-loglevel", "error", "-y", "-i", ppmPath, imagePath]);
  } finally {
    await rm(ppmPath, { force: true });
  }
  console.log(imagePath);
  return imagePath;
}

async function pixel(x: number, y: number, windowId?: string, client?: Client): Promise<string> {
  if (![x, y].every((value) => Number.isFinite(value) && value >= 0 && value <= 1)) {
    throw new Error("Pixel coordinates must be ratios between 0 and 1.");
  }
  const window = await chosenWindow(windowId, client);
  const localX = Math.floor(x * (window.width - 1));
  const localY = Math.floor(y * (window.height - 1));
  return run(nativeBinary, ["pixel", window.id, String(localX), String(localY)], root, await displayEnv() ?? process.env);
}

async function click(x: number, y: number, windowId?: string, client?: Client, allowFocus = false): Promise<void> {
  if (![x, y].every((value) => Number.isFinite(value) && value >= 0 && value <= 1)) {
    throw new Error("Click coordinates must be ratios between 0 and 1.");
  }
  const window = await chosenWindow(windowId, client);
  const localX = Math.floor(x * (window.width - 1));
  const localY = Math.floor(y * (window.height - 1));
  const isolated = await displayEnv();
  if (!isolated && !allowFocus) throw new Error("Input on your desktop would steal focus. Start the virtual display or pass --allow-focus explicitly.");
  const env = isolated ?? process.env;
  await run(nativeBinary, ["focus", window.id], root, env);
  if (!isolated && process.env.XDG_CURRENT_DESKTOP?.toLowerCase().includes("gnome")) {
    await run("python3", [gnomeRemote, nativeBinary, "click", String(window.x + localX), String(window.y + localY)]);
  } else {
    await run(nativeBinary, ["click", window.id, String(localX), String(localY)], root, env);
  }
}

async function key(name: string, windowId?: string, client?: Client, allowFocus = false): Promise<void> {
  if (!/^[A-Za-z0-9_+]{1,32}$/.test(name)) throw new Error("Use a key name such as Escape, Return, Tab, or Control+b.");
  const window = await chosenWindow(windowId, client);
  const isolated = await displayEnv();
  if (!isolated && !allowFocus) throw new Error("Input on your desktop would steal focus. Start the virtual display or pass --allow-focus explicitly.");
  const env = isolated ?? process.env;
  await run(nativeBinary, ["focus", window.id], root, env);
  if (!isolated && process.env.XDG_CURRENT_DESKTOP?.toLowerCase().includes("gnome")) {
    await run("python3", [gnomeRemote, nativeBinary, "key", name]);
  } else {
    await run(nativeBinary, ["key", window.id, name], root, env);
  }
}

async function typeText(value: string, windowId?: string, client?: Client, allowFocus = false): Promise<void> {
  if (!/^[a-z0-9 .-]{1,120}$/.test(value)) throw new Error("Text must contain 1 to 120 lowercase ASCII letters, digits, spaces, periods, or hyphens.");
  const window = await chosenWindow(windowId, client);
  const isolated = await displayEnv();
  if (!isolated && !allowFocus) throw new Error("Input on your desktop would steal focus. Start the virtual display or pass --allow-focus explicitly.");
  await run(nativeBinary, ["type", window.id, value], root, isolated ?? process.env);
}

async function scenario(file: string, windowId?: string, client: Client = "bedrock", allowFocus = false): Promise<void> {
  const path = resolve(root, file);
  const recipe = JSON.parse(await readFile(path, "utf8")) as { name: string; steps: Step[] };
  if (!Array.isArray(recipe.steps)) throw new Error("Scenario needs a steps array.");
  console.log(`Running ${recipe.name}`);
  for (const step of recipe.steps) {
    switch (step.action) {
      case "mark": await mark(step.label); break;
      case "wait":
        if (!Number.isInteger(step.ms) || step.ms < 0 || step.ms > 120_000) throw new Error("Wait must be 0 to 120000 ms.");
        await Bun.sleep(step.ms);
        break;
      case "screenshot": await screenshot(step.name, windowId, client); break;
      case "click": await click(step.x, step.y, windowId, client, allowFocus); break;
      case "key": await key(step.key, windowId, client, allowFocus); break;
      case "type": await typeText(step.text, windowId, client, allowFocus); break;
      case "videoStart": await startVideo(step.name, client, windowId); break;
      case "videoStop": await stopVideo(client); break;
      default: throw new Error("Unknown scenario action.");
    }
  }
}

interface EventSummary {
  time: number;
  host: string;
  method: string;
  path: string;
  status: number;
  request_body: unknown;
  response_body: unknown;
}

async function records<T>(path: string): Promise<T[]> {
  if (!existsSync(path)) return [];
  return (await readFile(path, "utf8")).split("\n").filter(Boolean).map((line) => JSON.parse(line) as T);
}

async function report(id?: string): Promise<string> {
  const session = await load(id);
  const dir = capturePath(session.id);
  const events = await records<EventSummary>(join(dir, "events.jsonl"));
  const markers = await records<{ time: number; label: string }>(join(dir, "markers.jsonl"));
  const groups = new Map<string, { count: number; statuses: Set<number>; request: unknown; response: unknown; marker: string }>();
  for (const event of events) {
    const marker = markers.filter((entry) => entry.time <= event.time).at(-1)?.label ?? "Before first marker";
    const key = `${marker}\t${event.method} ${event.host}${event.path}`;
    const group = groups.get(key) ?? { count: 0, statuses: new Set<number>(), request: event.request_body, response: event.response_body, marker };
    group.count++;
    group.statuses.add(event.status);
    groups.set(key, group);
  }
  const lines = [
    `# Capture: ${session.name}`, "",
    `Session: \`${session.id}\``, `Started: ${session.startedAt}`, `Mode: ${session.mode}`,
    `Redacted HTTP responses: ${events.length}`, "",
  ];
  for (const [key, group] of groups) {
    const endpoint = key.split("\t")[1];
    lines.push(`## ${group.marker}: ${endpoint}`, "", `Count: ${group.count}. Statuses: ${[...group.statuses].join(", ")}.`, "",
      "Request shape:", "```json", JSON.stringify(group.request, null, 2), "```", "",
      "Response shape:", "```json", JSON.stringify(group.response, null, 2), "```", "");
  }
  if (!events.length) lines.push("No HTTPS responses were captured. Check proxy routing and certificate trust before using this report.", "");
  const output = join(dir, "report.md");
  await writeFile(output, `${lines.join("\n")}\n`, { mode: 0o600 });
  console.log(`Redacted report: ${output}`);
  return output;
}

async function compare(firstId: string, secondId: string): Promise<void> {
  const first = await records<EventSummary>(join(capturePath(checkId(firstId)), "events.jsonl"));
  const second = await records<EventSummary>(join(capturePath(checkId(secondId)), "events.jsonl"));
  const endpoints = (events: EventSummary[]) => new Set(events.map(({ method, host, path }) => `${method} ${host}${path}`));
  const before = endpoints(first);
  const after = endpoints(second);
  console.log(`Only in ${firstId}:`);
  for (const endpoint of [...before].filter((value) => !after.has(value)).sort()) console.log(`  ${endpoint}`);
  console.log(`Only in ${secondId}:`);
  for (const endpoint of [...after].filter((value) => !before.has(value)).sort()) console.log(`  ${endpoint}`);
}

async function doctor(): Promise<void> {
  const checks = {
    launcher: existsSync(launcher) ? launcher : "missing",
    mitmdump: existsSync(mitmdump) ? mitmdump : "missing",
    display: process.env.DISPLAY ?? "missing",
    compiler: Bun.which("cc") ?? "missing",
    ffmpeg: Bun.which("ffmpeg") ?? "missing",
    proxyCa: existsSync(join(caDirectory, "mitmproxy-ca-cert.pem")) ? "generated" : "not generated yet",
  };
  console.log(JSON.stringify(checks, null, 2));
  if (process.env.DISPLAY && checks.compiler !== "missing") console.log(`Visible X11 windows: ${(await windows()).length}`);
}

async function status(): Promise<void> {
  const session = await load();
  const events = await records<EventSummary>(join(capturePath(session.id), "events.jsonl"));
  console.log(JSON.stringify({ ...session, proxyAlive: alive(session.proxyPid),
    gameAlive: session.gamePid ? alive(session.gamePid) : false, redactedResponses: events.length }, null, 2));
}

async function main(): Promise<void> {
  const [command, ...args] = Bun.argv.slice(2);
  switch (command) {
    case "doctor": return doctor();
    case "start":
      if (!args[0]) throw new Error("Usage: bun run capture start <name> [--local]");
      return start(args[0], args.includes("--local") ? "local" : "regular");
    case "launch": return launchGame();
    case "game-stop": return stopGame();
    case "prepare-launcher": console.log(await prepareLauncher()); return;
    case "mark": return mark(args.join(" "));
    case "stop": return stop();
    case "status": return status();
    case "report": await report(args[0]); return;
    case "compare":
      if (!args[0] || !args[1]) throw new Error("Usage: bun run capture compare <first-id> <second-id>");
      return compare(args[0], args[1]);
    case "video": {
      const [action, ...input] = args;
      const clientInput = input.indexOf("--client") >= 0 ? input[input.indexOf("--client") + 1] : "bedrock";
      if (clientInput !== "bedrock" && clientInput !== "java") throw new Error("--client must be bedrock or java.");
      const client: Client = clientInput;
      const windowId = input.indexOf("--window-id") >= 0 ? input[input.indexOf("--window-id") + 1] : undefined;
      if (action === "start" && input[0]) return startVideo(input[0], client, windowId);
      if (action === "stop") return stopVideo(client);
      if (action === "compare" && input[0] && input[1]) return compareVideo(input[0], input[1], client);
      throw new Error("Usage: bun run capture video <start name|stop|compare before after> [--client bedrock|java]");
    }
    case "ui": {
      const [action, ...input] = args;
      const windowId = input.indexOf("--window-id") >= 0 ? input[input.indexOf("--window-id") + 1] : undefined;
      const clientInput = input.indexOf("--client") >= 0 ? input[input.indexOf("--client") + 1] : "bedrock";
      if (clientInput !== "bedrock" && clientInput !== "java") throw new Error("--client must be bedrock or java.");
      const client: Client = clientInput;
      const allowFocus = input.includes("--allow-focus");
      switch (action) {
        case "list": console.log(JSON.stringify(await windows(), null, 2)); return;
        case "screenshot": if (!input[0]) throw new Error("Supply a screenshot name."); await screenshot(input[0], windowId, client); return;
        case "pixel": console.log(await pixel(Number(input[0]), Number(input[1]), windowId, client)); return;
        case "click": await click(Number(input[0]), Number(input[1]), windowId, client, allowFocus); return;
        case "key": if (!input[0]) throw new Error("Supply a key name."); await key(input[0], windowId, client, allowFocus); return;
        case "type": if (!input[0]) throw new Error("Supply text."); await typeText(input[0], windowId, client, allowFocus); return;
        case "run": if (!input[0]) throw new Error("Supply a scenario JSON file."); await scenario(input[0], windowId, client, allowFocus); return;
      }
      throw new Error("Usage: bun run capture ui <list|screenshot|pixel|click|key|run>");
    }
    default: throw new Error("Usage: bun run capture <doctor|start|launch|game-stop|mark|stop|status|report|compare|video|ui>");
  }
}

Effect.runPromise(Effect.tryPromise({ try: main, catch: (cause) => cause instanceof Error ? cause : new Error(String(cause)) }))
  .catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
