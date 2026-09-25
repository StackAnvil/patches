import { execFile, spawn, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import { createSocket } from "node:dgram";
import { closeSync, existsSync, openSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { Effect } from "effect";
import { activeDisplay, displayEnv, ensureDisplay, stopDisplay } from "../lab/display.ts";
import { root } from "../model.ts";
import { installPrism } from "../prism.ts";
import { waitForJoin, type JoinRoute } from "./join.ts";
import { installModpack } from "./modpack.ts";

const execute = promisify(execFile);
const privateRoot = join(root, ".stackanvil", "integration");
const toolsRoot = join(root, ".stackanvil", "tools");
const plainPrismName = "StackAnvil Integration 26.3";
const modpackPrismName = "Fabulously Optimized StackAnvil Integration 26.3";
const captureCli = join(root, "src", "capture", "cli.ts");
const bdsSource = resolve(process.env.BEDROCK_SERVER_HOME ?? join(homedir(), "bedrock-server"));
const proxyBdsSource = resolve(process.env.STACKANVIL_JAVA_BEDROCK_SERVER_HOME ?? bdsSource);
const viaProxyJar = resolve(process.env.VIAPROXY_JAR ?? join(toolsRoot, "ViaProxy.jar"));
const started: ChildProcess[] = [];

async function textFile(path: string): Promise<string> {
  return existsSync(path) ? readFile(path, "utf8") : "";
}

function alive(pid?: number): boolean {
  if (!pid) return false;
  try { process.kill(pid, 0); return true; } catch { return false; }
}

async function command(program: string, args: string[], env = process.env): Promise<string> {
  const { stdout } = await execute(program, args, { cwd: root, env, maxBuffer: 16 * 1024 * 1024 });
  return stdout.trim();
}

function service(program: string, args: string[], cwd: string, log: string, env = process.env, input = false): ChildProcess {
  const file = openSync(log, "w", 0o600);
  const child = spawn(program, args, { cwd, env, detached: true, stdio: [input ? "pipe" : "ignore", file, file] });
  closeSync(file);
  if (!child.pid) throw new Error(`Could not start ${program}.`);
  child.unref();
  started.push(child);
  return child;
}

async function waitForLog(path: string, pattern: RegExp, child: ChildProcess, timeoutMs = 90_000): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const log = await textFile(path);
    if (pattern.test(log)) return log;
    if (!alive(child.pid)) throw new Error(`Service stopped before startup. Read ${path}.`);
    await Bun.sleep(500);
  }
  throw new Error(`Service did not start within ${timeoutMs / 1000}s. Read ${path}.`);
}

async function tcpPort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Could not reserve a TCP port.");
  const port = address.port;
  await new Promise<void>((resolveClose) => server.close(() => resolveClose()));
  return port;
}

async function udpPort(): Promise<number> {
  const socket = createSocket("udp4");
  await new Promise<void>((resolveBind) => socket.bind(0, "127.0.0.1", resolveBind));
  const address = socket.address();
  const port = address.port;
  await new Promise<void>((resolveClose) => socket.close(() => resolveClose()));
  return port;
}

async function download(url: string, path: string, hash: string, algorithm: "sha1" | "sha512"): Promise<void> {
  if (existsSync(path)) {
    const existing = createHash(algorithm).update(new Uint8Array(await Bun.file(path).arrayBuffer())).digest("hex");
    if (existing === hash) return;
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed: ${response.status} ${url}`);
  const bytes = await response.arrayBuffer();
  if (createHash(algorithm).update(new Uint8Array(bytes)).digest("hex") !== hash) throw new Error(`Download checksum mismatch: ${url}`);
  await mkdir(join(privateRoot, "cache"), { recursive: true, mode: 0o700 });
  await writeFile(path, new Uint8Array(bytes), { mode: 0o600 });
}

async function vanillaServer(): Promise<string> {
  if (process.env.STACKANVIL_JAVA_SERVER_JAR) return resolve(process.env.STACKANVIL_JAVA_SERVER_JAR);
  const manifest = await fetch("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json").then((response) => response.json()) as {
    versions: { id: string; url: string }[];
  };
  const version = manifest.versions.find((entry) => entry.id === "26.3");
  if (!version) throw new Error("Minecraft 26.3 is missing from Mojang's version manifest.");
  const metadata = await fetch(version.url).then((response) => response.json()) as {
    downloads: { server: { url: string; sha1: string } };
  };
  const file = join(privateRoot, "cache", "minecraft-server-26.3.jar");
  await download(metadata.downloads.server.url, file, metadata.downloads.server.sha1, "sha1");
  return file;
}

async function javaServer(dir: string): Promise<{ child: ChildProcess; log: string; port: number }> {
  const port = await tcpPort();
  const jar = await vanillaServer();
  const home = join(dir, "java-server");
  await mkdir(home, { recursive: true, mode: 0o700 });
  await writeFile(join(home, "eula.txt"), "eula=true\n");
  await writeFile(join(home, "server.properties"), `server-port=${port}\nserver-ip=127.0.0.1\nonline-mode=false\nenforce-secure-profile=false\nwhite-list=false\nenforce-whitelist=false\nallow-flight=true\nmax-players=4\nmotd=StackAnvil integration\n`);
  const log = join(dir, "java-server.log");
  const child = service(Bun.which("java") ?? "java", ["-Xmx2G", "-jar", jar, "nogui"], home, log, process.env, true);
  await waitForLog(log, /Done \(/, child, 120_000);
  return { child, log, port };
}

async function bedrockServer(dir: string, source: string, name: string): Promise<{ child: ChildProcess; log: string; port: number; version: string }> {
  if (!existsSync(join(source, "bedrock_server"))) throw new Error(`Bedrock server missing in ${source}. Set BEDROCK_SERVER_HOME or STACKANVIL_JAVA_BEDROCK_SERVER_HOME.`);
  const home = join(dir, name);
  await mkdir(home, { recursive: true, mode: 0o700 });
  for (const entry of ["bedrock_server", "behavior_packs", "resource_packs", "definitions", "config", "data", "profanity_filter.wlist", "packetlimitconfig.json", "allowlist.json", "permissions.json"]) {
    if (existsSync(join(source, entry))) await command("cp", ["-a", "--reflink=auto", join(source, entry), home]);
  }
  const port = await udpPort();
  const properties = await textFile(join(source, "server.properties"));
  const set = (value: string, key: string, replacement: string) => new RegExp(`^${key}=.*$`, "m").test(value)
    ? value.replace(new RegExp(`^${key}=.*$`, "m"), `${key}=${replacement}`) : `${value}\n${key}=${replacement}\n`;
  let changed = properties;
  for (const [key, value] of Object.entries({ "server-name": "StackAnvil Integration", "server-port": String(port),
    "server-portv6": String(port + 1), "level-name": "integration-world", "online-mode": "false", "allow-cheats": "true" })) {
    changed = set(changed, key, value);
  }
  await writeFile(join(home, "server.properties"), changed, { mode: 0o600 });
  const log = join(dir, `${name}.log`);
  const child = service(join(home, "bedrock_server"), [], home, log, { ...process.env, LD_LIBRARY_PATH: home }, true);
  const output = await waitForLog(log, /Server started\./, child);
  const version = /Version:\s*(\d+\.\d+\.\d+)/.exec(output)?.[1];
  if (!version) throw new Error(`Could not read Bedrock server version. Read ${log}.`);
  return { child, log, port, version };
}

async function viaProxy(dir: string, bedrockPort: number, version: string): Promise<{ child: ChildProcess; log: string; port: number }> {
  if (!existsSync(viaProxyJar)) throw new Error(`ViaProxy missing: ${viaProxyJar}. Run bun run dev:setup.`);
  const port = await tcpPort();
  const log = join(dir, "viaproxy.log");
  const home = join(dir, "viaproxy");
  await mkdir(home, { recursive: true, mode: 0o700 });
  const child = service(Bun.which("java") ?? "java", ["-DskipUpdateCheck", "-jar", viaProxyJar, "cli",
    "--bind-address", `127.0.0.1:${port}`, "--target-address", `127.0.0.1:${bedrockPort}`,
    "--target-version", `Bedrock ${version}`, "--auth-method", "NONE", "--log-ips", "false"], home, log);
  await waitForLog(log, /Binding proxy server/, child);
  return { child, log, port };
}

async function preparePrism(modpack: boolean): Promise<{ instance: string; name: string }> {
  const name = modpack ? modpackPrismName : plainPrismName;
  const instance = await installPrism(name);
  if (modpack) {
    const version = await installModpack(instance);
    console.log(`Testing Fabulously Optimized ${version} with StackAnvil.`);
  } else {
    const mods = join(instance, "minecraft", "mods");
    for (const file of await readdir(mods)) {
      if (/^(?:iris|sodium)-.*\.jar$/i.test(file)) await rm(join(mods, file));
    }
  }
  return { instance, name };
}

async function gameProcess(name: string): Promise<number | undefined> {
  const { stdout } = await execute("ps", ["-eo", "pid=,args="], { maxBuffer: 8 * 1024 * 1024 });
  for (const line of stdout.split("\n")) {
    const match = /^\s*(\d+)\s+(.+)$/.exec(line);
    if (match?.[2]?.includes("org.prismlauncher.EntryPoint") && match[2].includes(name)) return Number(match[1]);
  }
  return undefined;
}

async function waitForGameProcess(launcher: ChildProcess, log: string, name: string): Promise<number> {
  for (let attempt = 0; attempt < 120; attempt++) {
    const pid = await gameProcess(name);
    if (pid) return pid;
    if (!alive(launcher.pid)) throw new Error(`Prism exited before Minecraft started. Read ${log}.`);
    await Bun.sleep(500);
  }
  throw new Error(`Minecraft did not start within 60s. Read ${log}.`);
}

async function javaJoin(route: "java-java" | "java-bedrock", modpack: boolean, dir: string,
  target: { port: number; log: string; child: ChildProcess }): Promise<void> {
  const name = modpack ? modpackPrismName : plainPrismName;
  if (await gameProcess(name)) throw new Error(`Prism instance ${name} is already running. Close it before the integration suite changes its mods.`);
  const { instance } = await preparePrism(modpack);
  const serverLogStart = (await textFile(target.log)).length;
  const clientLog = join(instance, "minecraft", "logs", "latest.log");
  await rm(clientLog, { force: true });
  const isolated = await displayEnv(true);
  if (!isolated) throw new Error("Integration tests require the private Xvfb display.");
  const log = join(dir, `${route}-${modpack ? "fabulously-optimized" : "plain"}-launcher.log`);
  const child = service("flatpak", ["run", `--filesystem=${join(root, ".stackanvil", "lab")}:ro`,
    `--env=DISPLAY=${isolated.DISPLAY}`, `--env=XAUTHORITY=${isolated.XAUTHORITY}`,
    "--env=WAYLAND_DISPLAY=", "--env=SDL_VIDEODRIVER=x11", "--env=SDL_VIDEO_FORCE_EGL=1",
    "--env=PULSE_SINK=stackanvil_silent", "org.prismlauncher.PrismLauncher",
    "--launch", name, "--server", `127.0.0.1:${target.port}`], root, log, isolated);
  try {
    const gamePid = await waitForGameProcess(child, log, name);
    if (route === "java-bedrock") {
      await waitForLog(clientLog, /Connecting to 127\.0\.0\.1/, child, 120_000);
      await Bun.sleep(3500);
      await capture(["ui", "click", "0.32", "0.76", "--client", "java"]);
    }
    const player = await waitForJoin({ route, serverLog: async () => (await textFile(target.log)).slice(serverLogStart), clientLog: () => textFile(clientLog),
      clientAlive: () => alive(gamePid), timeoutMs: 150_000, dwellMs: 20_000,
      onJoin: route === "java-java" ? (name) => {
        target.child.stdin?.write(`execute at ${name} run summon minecraft:interaction ~ ~ ~\n`);
      } : undefined });
    console.log(`PASS ${route}${modpack ? "+fabulously-optimized" : ""}: ${player} joined and remained connected for 20s.`);
  } catch (error) {
    throw new Error(`${String(error)} Read ${clientLog} and ${log}.`);
  } finally {
    if (alive(child.pid)) {
      try { process.kill(-child.pid!, "SIGINT"); } catch { /* Already stopped. */ }
    }
    await Bun.sleep(2000);
  }
}

async function capture(args: string[], env = process.env): Promise<string> {
  return command(process.execPath, [captureCli, ...args], env);
}

async function bedrockJoin(dir: string, target: { port: number; log: string }): Promise<void> {
  const serverLogStart = (await textFile(target.log)).length;
  const current = join(root, ".stackanvil", "captures", "current.json");
  if (existsSync(current)) {
    const { id } = JSON.parse(await readFile(current, "utf8")) as { id: string };
    const existing = JSON.parse(await readFile(join(root, ".stackanvil", "captures", id, "session.json"), "utf8")) as { stoppedAt?: string; proxyPid: number };
    if (!existing.stoppedAt && alive(existing.proxyPid)) throw new Error("An HTTPS capture is active. Stop it before the native join test.");
  }
  const label = `stackanvil-it-${Date.now().toString(36)}`;
  const env = { ...process.env, STACKANVIL_PROXY_PORT: String(await tcpPort()) };
  let session: string | undefined;
  try {
    await capture(["start", "native-join"], env);
    session = (JSON.parse(await readFile(current, "utf8")) as { id: string }).id;
    await capture(["launch"]);
    const sessionPath = join(root, ".stackanvil", "captures", session, "session.json");
    const gamePid = (JSON.parse(await readFile(sessionPath, "utf8")) as { gamePid?: number }).gamePid;
    for (let attempt = 0; attempt < 90; attempt++) {
      const listing = await capture(["ui", "list"]);
      if (listing.includes('"title": "Minecraft"')) break;
      if (!alive(gamePid)) throw new Error(`Bedrock client exited. Read ${join(root, ".stackanvil", "captures", session, "game.log")}.`);
      await Bun.sleep(1000);
    }
    await Bun.sleep(20_000);
    await capture(["ui", "screenshot", "native-menu"]);
    await capture(["ui", "key", "Return"]);
    await Bun.sleep(2500);
    await capture(["ui", "screenshot", "native-play-menu"]);
    await capture(["ui", "click", "0.82", "0.11"]);
    await Bun.sleep(2500);
    await capture(["ui", "screenshot", "native-server-list"]);
    await capture(["ui", "click", "0.17", "0.22"]);
    await Bun.sleep(2000);
    await capture(["ui", "screenshot", "native-add-form"]);
    await capture(["ui", "click", "0.25", "0.17"]);
    await capture(["ui", "type", label]);
    await capture(["ui", "click", "0.25", "0.31"]);
    await capture(["ui", "type", "127.0.0.1"]);
    await capture(["ui", "click", "0.25", "0.46"]);
    await capture(["ui", "key", "Control+a"]);
    await capture(["ui", "type", String(target.port)]);
    await capture(["ui", "click", "0.69", "0.57"]);
    await Bun.sleep(4000);
    await capture(["ui", "screenshot", "native-before-trust"]);
    const trustPanelPixel = (await capture(["ui", "pixel", "0.36", "0.28"]))
      .split(/\s+/).map(Number);
    if (trustPanelPixel.length !== 3 || trustPanelPixel.some((value) => !Number.isFinite(value))) {
      throw new Error("Could not read the Bedrock trust dialog state.");
    }
    if (trustPanelPixel.every((value) => value > 150)) {
      await capture(["ui", "click", "0.5", "0.59"]);
    }
    const player = await waitForJoin({ route: "bedrock-bedrock", serverLog: async () => (await textFile(target.log)).slice(serverLogStart),
      clientLog: () => textFile(join(root, ".stackanvil", "captures", session!, "game.log")),
      clientAlive: () => alive(gamePid), timeoutMs: 90_000, dwellMs: 20_000 });
    await capture(["ui", "screenshot", "native-joined"]);
    console.log(`PASS bedrock-bedrock: ${player} joined and remained connected for 20s.`);
  } catch (error) {
    throw new Error(`${String(error)} Private native capture: ${session ? join(root, ".stackanvil", "captures", session) : dir}.`);
  } finally {
    if (session) {
      try { await capture(["game-stop"]); } catch { /* The client may already have exited. */ }
      try { await capture(["stop"]); } catch { /* Preserve the original failure. */ }
    }
    await removeTemporaryServer(label, target.port);
  }
}

async function removeTemporaryServer(name: string, port: number): Promise<void> {
  const users = join(homedir(), ".local", "share", "bedrock-on-linux", "compatdata", "pfx", "drive_c", "users",
    "steamuser", "AppData", "Roaming", "Minecraft Bedrock", "Users");
  if (!existsSync(users)) return;
  for (const user of await readdir(users)) {
    const file = join(users, user, "games", "com.mojang", "minecraftpe", "external_servers.txt");
    if (!existsSync(file)) continue;
    const original = await readFile(file, "utf8");
    const lines = original.split(/(?<=\n)/);
    const retained = lines.filter((line) => !line.includes(`:${name}:127.0.0.1:${port}:`));
    if (retained.length !== lines.length) await writeFile(file, retained.join(""));
  }
}

async function cleanup(): Promise<void> {
  for (const child of started.reverse()) {
    if (alive(child.pid)) {
      try { process.kill(-child.pid!, "SIGINT"); } catch { /* Already stopped. */ }
    }
  }
  await Bun.sleep(1000);
  await stopDisplay();
}

async function main(): Promise<void> {
  const selected = Bun.argv.slice(2);
  const routes: JoinRoute[] = selected.includes("--route") ? [selected[selected.indexOf("--route") + 1] as JoinRoute]
    : ["java-java", "java-bedrock", "bedrock-bedrock"];
  if (routes.some((route) => !["java-java", "java-bedrock", "bedrock-bedrock"].includes(route))) {
    throw new Error("Use --route java-java, java-bedrock, or bedrock-bedrock.");
  }
  if (process.env.STACKANVIL_USE_DESKTOP === "1") throw new Error("Integration tests require a private display and never take desktop focus.");
  if (await activeDisplay()) throw new Error("The StackAnvil private display is already running. Stop the lab or capture session before integration tests.");
  if (!selected.includes("--reuse-build")) await command(process.execPath, [join(root, "src", "cli.ts"), "stack", "build", "viafabricplus-bedrock"]);
  const dir = join(privateRoot, "runs", new Date().toISOString().replace(/[:.]/g, "-"));
  await mkdir(dir, { recursive: true, mode: 0o700 });
  console.log(`Private logs: ${dir}`);
  await ensureDisplay();
  try {
    const java = routes.includes("java-java") ? await javaServer(dir) : undefined;
    const nativeBedrock = routes.includes("bedrock-bedrock") ? await bedrockServer(dir, bdsSource, "bedrock-native-server") : undefined;
    const proxyBedrock = routes.includes("java-bedrock") ? await bedrockServer(dir, proxyBdsSource, "bedrock-proxy-server") : undefined;
    const proxy = proxyBedrock ? await viaProxy(dir, proxyBedrock.port, proxyBedrock.version) : undefined;
    for (const route of routes) {
      if (route === "java-java" && java) {
        if (!selected.includes("--modpack-only")) await javaJoin(route, false, dir, java);
        await javaJoin(route, true, dir, java);
      } else if (route === "java-bedrock" && proxy && proxyBedrock) {
        if (!selected.includes("--modpack-only")) await javaJoin(route, false, dir, { ...proxy, log: proxyBedrock.log });
        await javaJoin(route, true, dir, { ...proxy, log: proxyBedrock.log });
      } else if (route === "bedrock-bedrock" && nativeBedrock) {
        await bedrockJoin(dir, nativeBedrock);
      }
    }
  } finally {
    await cleanup();
  }
}

Effect.runPromise(Effect.tryPromise({ try: main, catch: (cause) => cause instanceof Error ? cause : new Error(String(cause)) }))
  .catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
