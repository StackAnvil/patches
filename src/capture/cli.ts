import { nativeWaylandEnvironment, waylandTool, waylandToolEnvironment } from "../lab/wayland.ts";
import { createCaptureWaylandBuilder } from "./native.ts";
import {
  launchBedrockDirect,
  launcher,
  muteBedrockSettings,
  prepareLauncher,
} from "./bedrock-launcher.ts";
import { spawn } from "node:child_process";
import { createConnection } from "node:net";
import { existsSync, openSync, closeSync } from "node:fs";
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { Schema } from "effect";
import { parseJson } from "../guards.ts";
import { root } from "../model.ts";
import { displayEnv } from "../lab/display.ts";
import { captureUiEnvironment } from "./ui-environment.ts";
import { checkFps, createCaptureUi, type Client } from "./ui.ts";
import { checkMarker, parseScenario } from "./scenario.ts";
import { ownedProcessAlive, processStart, stopCaptureSession } from "./processes.ts";
import { print, printError } from "../output.ts";
import { execFileAsync as execute } from "../process.ts";

const uiEnvironment = captureUiEnvironment(() => displayEnv(), process.env);
const captureRoot = join(root, ".stackanvil", "captures");
const currentPath = join(captureRoot, "current.json");
const caDirectory = join(captureRoot, "ca");
const mitmdump =
  Bun.which("mitmdump") ?? join(root, ".stackanvil", "tools", "mitmproxy", "bin", "mitmdump");
const ui = createCaptureUi({
  captureDirectory: async () => capturePath((await load()).id),
  environment: uiEnvironment,
});
const { windows, chosenWindow, screenshot, click, key, buttonHold, drag, typeText } = ui;

interface Session {
  id: string;
  name: string;
  startedAt: string;
  proxyPid: number;
  proxyStartTicks?: string;
  port: number;
  mode: "regular" | "local";
  gamePid?: number;
  gameStartTicks?: string;
  videos?: Partial<
    Record<
      Client,
      {
        pid: number;
        startTicks?: string;
        name: string;
        file: string;
        startedAt: string;
        fps?: number;
        stoppedAt?: string;
      }
    >
  >;
  stoppedAt?: string;
}

const CurrentSessionSchema = Schema.Struct({ id: Schema.String });
const VideoSchema = Schema.Struct({
  pid: Schema.Finite,
  startTicks: Schema.optionalKey(Schema.String),
  name: Schema.String,
  file: Schema.String,
  startedAt: Schema.String,
  fps: Schema.optionalKey(Schema.Finite),
  stoppedAt: Schema.optionalKey(Schema.String),
});
const SessionSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  startedAt: Schema.String,
  proxyPid: Schema.Finite,
  proxyStartTicks: Schema.optionalKey(Schema.String),
  port: Schema.Finite,
  mode: Schema.Literals(["regular", "local"]),
  gamePid: Schema.optionalKey(Schema.Finite),
  gameStartTicks: Schema.optionalKey(Schema.String),
  videos: Schema.optionalKey(
    Schema.Struct({
      bedrock: Schema.optionalKey(VideoSchema),
      java: Schema.optionalKey(VideoSchema),
    }),
  ),
  stoppedAt: Schema.optionalKey(Schema.String),
});

const capturePath = (id: string) => join(captureRoot, id);
const sessionFile = (id: string) => join(capturePath(id), "session.json");

function checkId(id: string): string {
  if (!/^[a-z0-9][a-z0-9-]{0,90}$/u.test(id))
    throw new Error("Use lowercase letters, digits, and hyphens for a session name.");
  return id;
}

async function save(session: Session): Promise<void> {
  await writeFile(sessionFile(session.id), `${JSON.stringify(session, null, 2)}\n`, {
    mode: 0o600,
  });
}

async function load(id?: string): Promise<Session> {
  const selected = id ?? parseJson(CurrentSessionSchema, await readFile(currentPath, "utf8")).id;
  return parseJson(SessionSchema, await readFile(sessionFile(checkId(selected)), "utf8"));
}

const proxyAlive = (session: Session) =>
  ownedProcessAlive(session.proxyPid, session.proxyStartTicks);
const gameAlive = (session: Session) =>
  session.gamePid !== undefined && ownedProcessAlive(session.gamePid, session.gameStartTicks);

async function run(
  program: string,
  args: string[],
  cwd = root,
  env = process.env,
): Promise<string> {
  const { stdout } = await execute(program, args, { cwd, env, maxBuffer: 16 * 1024 * 1024 });
  return stdout.trimEnd();
}

async function waitForPort(port: number, pid: number, startTicks?: string): Promise<void> {
  for (let attempt = 0; attempt < 60; attempt++) {
    if (!ownedProcessAlive(pid, startTicks))
      throw new Error(
        "mitmdump stopped during startup. Read the private proxy.log in this session.",
      );
    const ready = await new Promise<boolean>((resolveReady) => {
      const socket = createConnection({ host: "127.0.0.1", port });
      socket.once("connect", () => {
        socket.destroy();
        resolveReady(true);
      });
      socket.once("error", () => {
        resolveReady(false);
      });
      socket.setTimeout(250, () => {
        socket.destroy();
        resolveReady(false);
      });
    });
    if (ready) return;
    await Bun.sleep(250);
  }
  throw new Error(
    `mitmdump did not listen on port ${port}. Read the private proxy.log in this session.`,
  );
}

async function start(name: string, mode: "regular" | "local" = "regular"): Promise<void> {
  checkId(name);
  if (!existsSync(mitmdump)) throw new Error("Run bun run dev:setup to install mitmproxy first.");
  if (existsSync(currentPath)) {
    const old = await load();
    if (!old.stoppedAt && proxyAlive(old))
      throw new Error(`Capture ${old.id} is active. Stop it first.`);
  }
  const stamp = new Date()
    .toISOString()
    .replaceAll(/[-:]/gu, "")
    .replace(/\..*$/u, "")
    .toLowerCase();
  const id = checkId(`${stamp}-${name}`);
  const port = Number(process.env["STACKANVIL_PROXY_PORT"] ?? 18_080);
  if (!Number.isInteger(port) || port < 1024 || port > 65_535)
    throw new Error("STACKANVIL_PROXY_PORT must be an unprivileged TCP port.");
  const dir = capturePath(id);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  await mkdir(caDirectory, { recursive: true, mode: 0o700 });
  const log = openSync(join(dir, "proxy.log"), "a", 0o600);
  const args = [
    "--mode",
    mode === "regular" ? "regular" : `local:Minecraft.Win`,
    "--flow-detail",
    "0",
    "--set",
    `confdir=${caDirectory}`,
    "-s",
    join(root, "scripts", "capture_addon.py"),
    "-w",
    join(dir, "flows.mitm"),
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
  const proxyStartTicks = processStart(child.pid);
  try {
    if (mode === "regular") await waitForPort(port, child.pid, proxyStartTicks);
    else {
      await Bun.sleep(2000);
      if (!ownedProcessAlive(child.pid, proxyStartTicks))
        throw new Error("Local capture stopped. Read proxy.log.");
    }
  } catch (error) {
    if (ownedProcessAlive(child.pid, proxyStartTicks)) process.kill(child.pid, "SIGINT");
    throw error;
  }
  const session: Session = {
    id,
    name,
    startedAt: new Date().toISOString(),
    proxyPid: child.pid,
    ...(proxyStartTicks === undefined ? {} : { proxyStartTicks }),
    port,
    mode,
  };
  await save(session);
  await writeFile(currentPath, `${JSON.stringify({ id })}\n`, { mode: 0o600 });
  print(`Capture ${id} started. Private files: ${dir}`);
  if (mode === "regular") print(`Proxy: http://127.0.0.1:${port}`);
}

async function launchGame(): Promise<void> {
  const session = await load();
  if (session.stoppedAt || !proxyAlive(session))
    throw new Error("Start a capture before launching Bedrock.");
  if (!existsSync(launcher)) throw new Error(`BedrockOnLinux launcher not found: ${launcher}`);
  const isolated = await displayEnv(true);
  if (!isolated && process.env["STACKANVIL_USE_DESKTOP"] !== "1")
    throw new Error("A virtual display is required before launching Bedrock.");
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
  ].find((value) => existsSync(value));
  if (!systemCa)
    throw new Error("No system CA bundle was found for an isolated proxy trust bundle.");
  await writeFile(bundle, `${await readFile(systemCa, "utf8")}\n${await readFile(ca, "utf8")}`, {
    mode: 0o600,
  });
  const appDir = launcher.toLowerCase().endsWith(".appimage") ? await prepareLauncher() : undefined;
  const program = appDir ? join(appDir, "usr", "python", "bin", "python3.12") : "python3";
  const args = [
    join(root, "scripts", "bedrock-wayland.py"),
    appDir ? join(appDir, "usr", "bin", "bedrock-on-linux") : launcher,
    "play",
  ];
  const log = openSync(join(capturePath(session.id), "game.log"), "a", 0o600);
  const child = spawn(program, args, {
    cwd: root,
    detached: true,
    stdio: ["ignore", log, log],
    env: {
      ...nativeWaylandEnvironment(isolated ?? process.env),
      ...(session.mode === "regular"
        ? {
            HTTP_PROXY: proxy,
            HTTPS_PROXY: proxy,
            http_proxy: proxy,
            https_proxy: proxy,
            NO_PROXY: "localhost,127.0.0.1",
            no_proxy: "localhost,127.0.0.1",
          }
        : {}),
      SSL_CERT_FILE: bundle,
      CURL_CA_BUNDLE: bundle,
      REQUESTS_CA_BUNDLE: bundle,
      ...(appDir ? { APPDIR: appDir, APPIMAGE: launcher } : {}),
    },
  });
  closeSync(log);
  child.unref();
  if (!child.pid) throw new Error("Could not launch BedrockOnLinux.");
  session.gamePid = child.pid;
  const gameStartTicks = processStart(child.pid);
  if (gameStartTicks === undefined) delete session.gameStartTicks;
  else session.gameStartTicks = gameStartTicks;
  await save(session);
  print(`BedrockOnLinux launch started for ${session.id}. Read the private game.log if it stops.`);
}

async function mark(label: string): Promise<void> {
  const session = await load();
  if (session.stoppedAt) throw new Error("This capture is stopped.");
  checkMarker(label);
  await appendFile(
    join(capturePath(session.id), "markers.jsonl"),
    `${JSON.stringify({ time: Date.now() / 1000, label })}\n`,
    { mode: 0o600 },
  );
  print(`Marked: ${label}`);
}

async function stop(): Promise<void> {
  const active = await load();
  const recording = (["bedrock", "java"] as const).filter(
    (client) => active.videos?.[client] && !active.videos[client].stoppedAt,
  );
  await stopCaptureSession(
    recording.map((client) => () => stopVideo(client)),
    async () => {
      const session = await load();
      if (session.stoppedAt) {
        print(`Capture ${session.id} is already stopped.`);
        return;
      }
      if (proxyAlive(session)) {
        process.kill(session.proxyPid, "SIGINT");
        for (let attempt = 0; attempt < 40 && proxyAlive(session); attempt++) await Bun.sleep(250);
        if (proxyAlive(session))
          throw new Error(
            `mitmdump ${session.proxyPid} did not stop. The capture remains active; run stop again.`,
          );
      }
      session.stoppedAt = new Date().toISOString();
      await save(session);
      print(`Capture ${session.id} stopped.${gameAlive(session) ? " The game remains open." : ""}`);
    },
  );
}

async function startVideo(
  name: string,
  client: Client,
  windowId?: string,
  fps = 15,
): Promise<void> {
  checkId(name);
  checkFps(fps);
  const session = await load();
  if (session.stoppedAt) throw new Error("Start a capture before recording video.");
  const isolated = await displayEnv();
  if (!isolated)
    throw new Error(
      "Video recording requires the private display so your desktop is never captured.",
    );
  const previous = session.videos?.[client];
  if (previous && !previous.stoppedAt && ownedProcessAlive(previous.pid, previous.startTicks))
    throw new Error(`${client} video is already recording.`);
  const window = await chosenWindow(windowId, client);
  const file = join(capturePath(session.id), `${name}-${client}.mp4`);
  if (existsSync(file))
    throw new Error(`Video ${name}-${client}.mp4 already exists. Choose another name.`);
  const startedAt = new Date().toISOString();
  const native = await createCaptureWaylandBuilder(async (args, cwd, env) => {
    await execute("cargo", args, { cwd, env });
  })(isolated);
  const log = openSync(join(capturePath(session.id), `${name}-${client}.video.log`), "a", 0o600);
  const child = spawn(native, ["record", window.id, String(fps), file], {
    cwd: root,
    detached: true,
    env: waylandToolEnvironment(isolated),
    stdio: ["ignore", log, log],
  });
  closeSync(log);
  child.unref();
  if (!child.pid) throw new Error("Could not start the Wayland recorder.");
  const startTicks = processStart(child.pid);
  await Bun.sleep(500);
  if (!ownedProcessAlive(child.pid, startTicks))
    throw new Error(`Wayland recorder stopped. Read the private ${name}-${client}.video.log.`);
  session.videos ??= {};
  session.videos[client] = {
    pid: child.pid,
    ...(startTicks === undefined ? {} : { startTicks }),
    name,
    file,
    startedAt,
    fps,
  };
  await save(session);
  print(`Recording ${client}: ${file}`);
}

async function stopVideo(client: Client): Promise<void> {
  const session = await load();
  const video = session.videos?.[client];
  if (!video || video.stoppedAt) {
    print(`No active ${client} video.`);
    return;
  }
  if (ownedProcessAlive(video.pid, video.startTicks)) process.kill(video.pid, "SIGINT");
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      await run("ffprobe", [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        video.file,
      ]);
      video.stoppedAt = new Date().toISOString();
      await save(session);
      print(`Video saved: ${video.file}`);
      return;
    } catch {
      await Bun.sleep(250);
    }
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
  if (!existsSync(first) || !existsSync(second))
    throw new Error("Both named recordings must exist in the current capture.");
  const output = join(dir, `${before}-vs-${after}-${client}.mp4`);
  await run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    first,
    "-i",
    second,
    "-filter_complex",
    "[0:v]scale=-2:480,setsar=1[left];[1:v]scale=-2:480,setsar=1[right];[left][right]hstack=inputs=2[v]",
    "-map",
    "[v]",
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "24",
    "-pix_fmt",
    "yuv420p",
    output,
  ]);
  print(`Before on the left, after on the right: ${output}`);
}

async function stopGame(): Promise<void> {
  const session = await load();
  if (!gameAlive(session)) {
    print("The captured Bedrock client is stopped.");
    return;
  }
  if (!(await displayEnv()))
    throw new Error(
      "Close a desktop Bedrock client manually. Virtual display input is the default safe stop path.",
    );
  await key("Alt+F4", undefined, "bedrock");
  for (let attempt = 0; attempt < 40 && gameAlive(session); attempt++) await Bun.sleep(250);
  if (gameAlive(session))
    throw new Error("Bedrock did not exit after Alt+F4. Check the private game.log.");
  print("Stopped the captured Bedrock client.");
}

async function scenario(
  file: string,
  windowId?: string,
  client: Client = "bedrock",
  allowFocus = false,
): Promise<void> {
  const recipe = parseScenario(await readFile(resolve(root, file), "utf8"));
  print(`Running ${recipe.name}`);
  for (const step of recipe.steps) {
    switch (step.action) {
      case "mark": {
        await mark(step.label);
        break;
      }
      case "wait": {
        await Bun.sleep(step.ms);
        break;
      }
      case "screenshot": {
        print(await screenshot(step.name, windowId, client));
        break;
      }
      case "click": {
        await click(step.x, step.y, windowId, client, allowFocus, step.button);
        break;
      }
      case "doubleClick": {
        await click(step.x, step.y, windowId, client, allowFocus, step.button, undefined, true);
        break;
      }
      case "mouseHold": {
        await click(step.x, step.y, windowId, client, allowFocus, step.button, step.ms);
        break;
      }
      case "buttonHold": {
        await buttonHold(step.button, step.ms, windowId, client, allowFocus);
        break;
      }
      case "drag": {
        await drag(step.points, step.button, step.ms, windowId, client, allowFocus);
        break;
      }
      case "key": {
        await key(step.key, windowId, client, allowFocus);
        break;
      }
      case "doubleKey": {
        await key(step.key, windowId, client, allowFocus, undefined, true);
        break;
      }
      case "keyHold": {
        await key(step.key, windowId, client, allowFocus, step.ms);
        break;
      }
      case "type": {
        await typeText(step.text, windowId, client, allowFocus);
        break;
      }
      case "videoStart": {
        await startVideo(step.name, client, windowId, step.fps);
        break;
      }
      case "videoStop": {
        await stopVideo(client);
        break;
      }
      default: {
        throw new Error("Unknown scenario action.");
      }
    }
  }
}

const EventSummarySchema = Schema.Struct({
  time: Schema.Finite,
  host: Schema.String,
  method: Schema.String,
  path: Schema.String,
  status: Schema.Finite,
  request_body: Schema.Unknown,
  response_body: Schema.Unknown,
});
type EventSummary = typeof EventSummarySchema.Type;

async function records<S extends Schema.Decoder<unknown>>(
  path: string,
  schema: S,
): Promise<S["Type"][]> {
  if (!existsSync(path)) return [];
  return (await readFile(path, "utf8"))
    .split("\n")
    .filter(Boolean)
    .map((line) => parseJson(schema, line));
}

async function report(id?: string): Promise<string> {
  const session = await load(id);
  const dir = capturePath(session.id);
  const events = await records(join(dir, "events.jsonl"), EventSummarySchema);
  const markers = await records(
    join(dir, "markers.jsonl"),
    Schema.Struct({ time: Schema.Finite, label: Schema.String }),
  );
  const groups = new Map<
    string,
    { count: number; statuses: Set<number>; request: unknown; response: unknown; marker: string }
  >();
  for (const event of events) {
    const marker =
      markers.findLast((entry) => entry.time <= event.time)?.label ?? "Before first marker";
    const groupKey = `${marker}\t${event.method} ${event.host}${event.path}`;
    const group = groups.get(groupKey) ?? {
      count: 0,
      statuses: new Set<number>(),
      request: event.request_body,
      response: event.response_body,
      marker,
    };
    group.count++;
    group.statuses.add(event.status);
    groups.set(groupKey, group);
  }
  const lines = [
    `# Capture: ${session.name}`,
    "",
    `Session: \`${session.id}\``,
    `Started: ${session.startedAt}`,
    `Mode: ${session.mode}`,
    `Redacted HTTP responses: ${events.length}`,
    "",
  ];
  for (const [groupKey, group] of groups) {
    const endpoint = groupKey.split("\t")[1];
    lines.push(
      `## ${group.marker}: ${endpoint}`,
      "",
      `Count: ${group.count}. Statuses: ${[...group.statuses].join(", ")}.`,
      "",
      "Request shape:",
      "```json",
      JSON.stringify(group.request, null, 2),
      "```",
      "",
      "Response shape:",
      "```json",
      JSON.stringify(group.response, null, 2),
      "```",
      "",
    );
  }
  if (events.length === 0)
    lines.push(
      "No HTTPS responses were captured. Check proxy routing and certificate trust before using this report.",
      "",
    );
  const output = join(dir, "report.md");
  await writeFile(output, `${lines.join("\n")}\n`, { mode: 0o600 });
  print(`Redacted report: ${output}`);
  return output;
}

const endpoints = (events: readonly EventSummary[]) =>
  new Set(events.map(({ method, host, path }) => `${method} ${host}${path}`));

async function compare(firstId: string, secondId: string): Promise<void> {
  const first = await records(
    join(capturePath(checkId(firstId)), "events.jsonl"),
    EventSummarySchema,
  );
  const second = await records(
    join(capturePath(checkId(secondId)), "events.jsonl"),
    EventSummarySchema,
  );
  const before = endpoints(first);
  const after = endpoints(second);
  print(`Only in ${firstId}:`);
  for (const endpoint of [...before].filter((value) => !after.has(value)).toSorted())
    print(`  ${endpoint}`);
  print(`Only in ${secondId}:`);
  for (const endpoint of [...after].filter((value) => !before.has(value)).toSorted())
    print(`  ${endpoint}`);
}

async function doctor(): Promise<void> {
  const checks = {
    launcher: existsSync(launcher) ? launcher : "missing",
    mitmdump: existsSync(mitmdump) ? mitmdump : "missing",
    display:
      (await displayEnv())?.["WAYLAND_DISPLAY"] ?? process.env["WAYLAND_DISPLAY"] ?? "missing",
    grim: waylandTool("grim") ?? "missing",
    recorder: waylandTool("wf-recorder") ?? "missing",
    compiler: Bun.which("cargo") ?? "missing",
    ffmpeg: Bun.which("ffmpeg") ?? "missing",
    proxyCa: existsSync(join(caDirectory, "mitmproxy-ca-cert.pem"))
      ? "generated"
      : "not generated yet",
  };
  print(JSON.stringify(checks, null, 2));
  if (checks.display !== "missing" && checks.compiler !== "missing")
    print(`Visible native Wayland windows: ${(await windows()).length}`);
}

async function status(): Promise<void> {
  const session = await load();
  const events = await records(join(capturePath(session.id), "events.jsonl"), EventSummarySchema);
  print(
    JSON.stringify(
      {
        ...session,
        proxyAlive: proxyAlive(session),
        gameAlive: gameAlive(session),
        redactedResponses: events.length,
      },
      null,
      2,
    ),
  );
}

async function main(): Promise<void> {
  const [command, ...args] = Bun.argv.slice(2);
  switch (command) {
    case "doctor": {
      return doctor();
    }
    case "start": {
      if (!args[0]) throw new Error("Usage: bun run capture start <name> [--local]");
      return start(args[0], args.includes("--local") ? "local" : "regular");
    }
    case "launch": {
      if (!args.includes("--direct")) return launchGame();
      const { pid, log } = await launchBedrockDirect();
      print(
        `BedrockOnLinux started without the proxy as process group ${pid}. Its log is ${log}. Stop it with kill -TERM -${pid}.`,
      );
      return;
    }
    case "game-stop": {
      return stopGame();
    }
    case "prepare-launcher": {
      print(await prepareLauncher());
      return;
    }
    case "mark": {
      return mark(args.join(" "));
    }
    case "stop": {
      return stop();
    }
    case "status": {
      return status();
    }
    case "report": {
      await report(args[0]);
      return;
    }
    case "compare": {
      if (!args[0] || !args[1])
        throw new Error("Usage: bun run capture compare <first-id> <second-id>");
      return compare(args[0], args[1]);
    }
    case "video": {
      const [action, ...input] = args;
      const clientInput = input.includes("--client")
        ? input[input.indexOf("--client") + 1]
        : "bedrock";
      if (clientInput !== "bedrock" && clientInput !== "java")
        throw new Error("--client must be bedrock or java.");
      const client: Client = clientInput;
      const windowId = input.includes("--window-id")
        ? input[input.indexOf("--window-id") + 1]
        : undefined;
      if (action === "start" && input[0]) {
        const fpsIndex = input.indexOf("--fps");
        return startVideo(
          input[0],
          client,
          windowId,
          fpsIndex < 0 ? undefined : Number(input[fpsIndex + 1]),
        );
      }
      if (action === "stop") return stopVideo(client);
      if (action === "compare" && input[0] && input[1])
        return compareVideo(input[0], input[1], client);
      throw new Error(
        "Usage: bun run capture video <start name|stop|compare before after> [--client bedrock|java] [--fps 1..120]",
      );
    }
    case "ui": {
      if (args[0] === "run") {
        if (!args[1]) throw new Error("Supply a scenario JSON file.");
        const windowId = args.includes("--window-id")
          ? args[args.indexOf("--window-id") + 1]
          : undefined;
        const client = args.includes("--client") ? args[args.indexOf("--client") + 1] : "bedrock";
        if (client !== "bedrock" && client !== "java")
          throw new Error("--client must be bedrock or java.");
        return scenario(args[1], windowId, client, args.includes("--allow-focus"));
      }
      const result = await ui.command(["ui", ...args]);
      if (result) print(result);
      return;
    }
    default: {
      throw new Error(
        "Usage: bun run capture <doctor|start|launch|game-stop|mark|stop|status|report|compare|video|ui>",
      );
    }
  }
}

try {
  await main();
} catch (error: unknown) {
  printError(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
