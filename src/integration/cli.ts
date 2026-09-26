import { execFile, spawn, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import { createSocket } from "node:dgram";
import { closeSync, existsSync, openSync } from "node:fs";
import { chmod, mkdir, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { Effect } from "effect";
import { activeDisplay, displayEnv, ensureDisplay, stopDisplay } from "../lab/display.ts";
import { root } from "../model.ts";
import { installPrism } from "../prism.ts";
import { installEntityProbe, waitForProbe } from "./entity-probe.ts";
import { gameplayCaseIds, installProbeGuiScale, runGameplayCases, type GameplayCaseId } from "./gameplay-probe.ts";
import { convertedPackCount, installResourceProbe, resourceColorPixels } from "./resource-probe.ts";
import { waitForJoin, type JoinRoute } from "./join.ts";
import { installModpack } from "./modpack.ts";

const execute = promisify(execFile);
const privateRoot = join(root, ".stackanvil", "integration");
const toolsRoot = join(root, ".stackanvil", "tools");
const plainPrismName = "StackAnvil Integration 26.3";
const modpackPrismName = "Fabulously Optimized StackAnvil Integration 26.3";
const captureCli = join(root, "src", "capture", "cli.ts");
const prismData = join(homedir(), ".var", "app", "org.prismlauncher.PrismLauncher", "data", "PrismLauncher");
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

async function waitForLog(path: string, pattern: RegExp, child: ChildProcess | (() => boolean), timeoutMs = 90_000): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const log = await textFile(path);
    if (pattern.test(log)) return log;
    if (!(typeof child === "function" ? child() : alive(child.pid))) throw new Error(`Service stopped before startup. Read ${path}.`);
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

async function bedrockServer(dir: string, source: string, name: string, entityProbe = false,
  resourceProbe?: { variant: "a" | "b"; run: string }): Promise<{ child: ChildProcess; log: string; port: number; version: string }> {
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
  if (entityProbe) {
    changed = set(changed, "content-log-console-output-enabled", "true");
    changed = set(changed, "content-log-level", "info");
    await installEntityProbe(home, "integration-world");
  }
  if (resourceProbe) {
    changed = set(changed, "texturepack-required", "true");
    await installResourceProbe(home, "integration-world", resourceProbe.variant, resourceProbe.run);
  }
  if (entityProbe || resourceProbe) {
    changed = set(changed, "force-gamemode", "false");
    changed = set(changed, "gamemode", "survival");
  }
  await writeFile(join(home, "server.properties"), changed, { mode: 0o600 });
  const log = join(dir, `${name}.log`);
  const child = service(join(home, "bedrock_server"), [], home, log, { ...process.env, LD_LIBRARY_PATH: home }, true);
  const output = await waitForLog(log, /Server started\./, child);
  if (entityProbe) await waitForLog(log, /\[ViaBedrock Entity Probe\] ready/, child, 30_000);
  const version = /Version:\s*(\d+\.\d+\.\d+)/.exec(output)?.[1];
  if (!version) throw new Error(`Could not read Bedrock server version. Read ${log}.`);
  return { child, log, port, version };
}

async function viaProxy(dir: string, bedrockPort: number, version: string, name = "viaproxy", homeName = name): Promise<{ child: ChildProcess; log: string; port: number }> {
  if (!existsSync(viaProxyJar)) throw new Error(`ViaProxy missing: ${viaProxyJar}. Run bun run dev:setup.`);
  const port = await tcpPort();
  const log = join(dir, `${name}.log`);
  const home = join(dir, homeName);
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

async function isolatedPrismRoot(dir: string, name: string): Promise<string> {
  const isolated = join(dir, `prism-${name}-${Date.now().toString(36)}`);
  await mkdir(isolated, { recursive: true, mode: 0o700 });
  await mkdir(join(isolated, "logs"), { mode: 0o700 });
  for (const entry of await readdir(prismData, { withFileTypes: true })) {
    if (entry.name === "logs") continue;
    const source = join(prismData, entry.name);
    const destination = join(isolated, entry.name);
    if (entry.isDirectory()) await symlink(source, destination, "dir");
    else if (entry.isFile()) {
      await writeFile(destination, await readFile(source), { mode: 0o600 });
      await chmod(destination, 0o600);
    }
  }
  return isolated;
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
    await Bun.sleep(500);
  }
  throw new Error(`Minecraft did not start within 60s (Prism ${alive(launcher.pid) ? "is running" : "has exited"}). Read ${log}.`);
}

async function checkResourceRender(dir: string, label: string, variant: "a" | "b", server: ChildProcess): Promise<void> {
  const inventory = () => capture(["ui", "key-hold", "e", "80", "--client", "java"]);
  server.stdin?.write("gamemode survival @a\nclear @a\n");
  await Bun.sleep(750);
  await inventory();
  const before = await capture(["ui", "screenshot", `resource-${label}-before`, "--client", "java", "--output-dir", dir]);
  await inventory();
  server.stdin?.write("give @a diamond 1\n");
  await Bun.sleep(750);
  await inventory();
  const after = await capture(["ui", "screenshot", `resource-${label}-after`, "--client", "java", "--output-dir", dir]);
  await inventory();
  const added = await resourceColorPixels(after, variant) - await resourceColorPixels(before, variant);
  if (added < 32) throw new Error(`Resource probe ${label} did not show the ${variant} diamond texture in Java. Screenshots: ${before}, ${after}.`);
  console.log(`PASS resource pack ${label}: ${added} new texture-colored pixels in the Java inventory.`);
}

async function javaJoin(route: "java-java" | "java-bedrock", modpack: boolean, dir: string,
  target: { port: number; log: string; child: ChildProcess; proxyLog?: string }, entityProbe?: { child: ChildProcess; log: string },
  runEntityProbe = false, gameplayCases: readonly GameplayCaseId[] = [],
  resource?: { variant: "a" | "b"; label: string }, probeFailures?: string[]): Promise<string> {
  const name = modpack ? modpackPrismName : plainPrismName;
  if (await gameProcess(name)) throw new Error(`Prism instance ${name} is already running. Close it before the integration suite changes its mods.`);
  const { instance } = await preparePrism(modpack);
  const prismRoot = await isolatedPrismRoot(dir, modpack ? "modpack" : "plain");
  if (gameplayCases.length) await installProbeGuiScale(instance);
  const serverLogStart = (await textFile(target.log)).length;
  const connectionLogStart = target.proxyLog ? (await textFile(target.proxyLog)).length : 0;
  const clientLog = join(instance, "minecraft", "logs", "latest.log");
  await rm(clientLog, { force: true });
  const isolated = await displayEnv(true);
  if (!isolated) throw new Error("Integration tests require the private Xvfb display.");
  const log = join(dir, `${route}-${modpack ? "fabulously-optimized" : "plain"}-launcher.log`);
  const child = service("flatpak", ["run", "--nosocket=wayland", "--socket=x11", `--filesystem=${join(root, ".stackanvil", "lab")}:ro`,
    `--filesystem=${prismRoot}`,
    `--env=DISPLAY=${isolated.DISPLAY}`, `--env=XAUTHORITY=${isolated.XAUTHORITY}`,
    "--env=WAYLAND_DISPLAY=", "--env=QT_QPA_PLATFORM=xcb", "--env=SDL_VIDEODRIVER=x11", "--env=SDL_VIDEO_DRIVER=x11",
    "--env=SDL_VIDEO_FORCE_EGL=1",
    "--env=PULSE_SINK=stackanvil_silent", "org.prismlauncher.PrismLauncher",
    "--dir", prismRoot, "--launch", name, "--server", `127.0.0.1:${target.port}`], root, log, isolated);
  let gamePid: number | undefined;
  try {
    gamePid = await waitForGameProcess(child, log, name);
    if (route === "java-bedrock") {
      await waitForLog(clientLog, /Connecting to 127\.0\.0\.1/, () => alive(gamePid), 120_000);
      await Bun.sleep(3500);
      await capture(["ui", "click", "0.32", "0.76", "--client", "java"]);
    }
    const player = await waitForJoin({ route, serverLog: async () => (await textFile(target.log)).slice(serverLogStart), clientLog: () => textFile(clientLog),
      connectionLog: target.proxyLog ? async () => (await textFile(target.proxyLog!)).slice(connectionLogStart) : undefined,
      clientAlive: () => alive(gamePid), timeoutMs: 150_000, dwellMs: 20_000,
      onJoin: route === "java-java" ? (name) => {
        target.child.stdin?.write(`execute at ${name} run summon minecraft:interaction ~ ~ ~\n`);
      } : undefined });
    console.log(`PASS ${route}${modpack ? "+fabulously-optimized" : ""}: ${player} joined and remained connected for 20s.`);
    if (resource && entityProbe) await checkResourceRender(dir, resource.label, resource.variant, entityProbe.child);
    if (entityProbe && runEntityProbe) {
      for (const group of ["status", "metadata"] as const) {
        const logStart = (await textFile(entityProbe.log)).length;
        entityProbe.child.stdin?.write(`scriptevent vbprobe:${group} auto\n`);
        const result = await waitForProbe(group, async () => (await textFile(entityProbe.log)).slice(logStart),
          () => alive(gamePid) && alive(entityProbe.child.pid));
        console.log(`PASS ${group} entity probe: ${result.passed} script actions accepted.`);
      }
    }
    if (gameplayCases.length && entityProbe) {
      try {
        await runGameplayCases(gameplayCases, { server: entityProbe.child, serverLog: entityProbe.log,
          clientAlive: () => alive(gamePid), ui: (args) => capture(args), artifactDir: dir });
      } catch (error) {
        if (!probeFailures) throw error;
        probeFailures.push(String(error));
      }
    }
    return textFile(clientLog);
  } catch (error) {
    throw new Error(`${String(error)} Read ${clientLog}, ${log}${target.proxyLog ? `, and ${target.proxyLog}` : ""}.`);
  } finally {
    if (alive(gamePid)) {
      try { process.kill(gamePid!, "SIGINT"); } catch { /* Already stopped. */ }
    }
    if (alive(child.pid)) {
      try { process.kill(-child.pid!, "SIGINT"); } catch { /* Already stopped. */ }
    }
    for (let attempt = 0; attempt < 40 && alive(gamePid); attempt++) await Bun.sleep(250);
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
  const entityProbe = selected.includes("--entity-probe");
  const resourceProbe = selected.includes("--resource-pack-probe");
  const resourceRun = Date.now().toString(36);
  const gameplayProbe = selected.includes("--gameplay-probe");
  const gameplayInput = selected.includes("--gameplay-cases") ? selected[selected.indexOf("--gameplay-cases") + 1] : undefined;
  if (selected.includes("--gameplay-cases") && (!gameplayInput || gameplayInput.startsWith("--"))) {
    throw new Error("--gameplay-cases needs a comma-separated case list.");
  }
  const gameplayCases = gameplayInput ? gameplayInput.split(",") as GameplayCaseId[]
    : gameplayProbe ? gameplayCaseIds : [];
  if (gameplayCases.some((id) => !gameplayCaseIds.includes(id))) throw new Error(`Unknown gameplay case. Use: ${gameplayCaseIds.join(", ")}.`);
  const routes: JoinRoute[] = selected.includes("--route") ? [selected[selected.indexOf("--route") + 1] as JoinRoute]
    : ["java-java", "java-bedrock", "bedrock-bedrock"];
  if (routes.some((route) => !["java-java", "java-bedrock", "bedrock-bedrock"].includes(route))) {
    throw new Error("Use --route java-java, java-bedrock, or bedrock-bedrock.");
  }
  if ((entityProbe || gameplayCases.length || resourceProbe) && !routes.includes("java-bedrock")) throw new Error("Probe cases require the java-bedrock route.");
  if ((entityProbe || gameplayCases.length || resourceProbe) && selected.includes("--modpack-only")) throw new Error("Probe cases require the plain Java client run.");
  if (process.env.STACKANVIL_USE_DESKTOP === "1") throw new Error("Integration tests require a private display and never take desktop focus.");
  if (await activeDisplay()) throw new Error("The StackAnvil private display is already running. Stop the lab or capture session before integration tests.");
  if (!selected.includes("--reuse-build")) await command(process.execPath, [join(root, "src", "cli.ts"), "stack", "build", "viafabricplus-bedrock"]);
  const dir = join(privateRoot, "runs", new Date().toISOString().replace(/[:.]/g, "-"));
  await mkdir(dir, { recursive: true, mode: 0o700 });
  console.log(`Private logs: ${dir}`);
  await ensureDisplay();
  try {
    const probeFailures: string[] = [];
    const java = routes.includes("java-java") ? await javaServer(dir) : undefined;
    const nativeBedrock = routes.includes("bedrock-bedrock") ? await bedrockServer(dir, bdsSource, "bedrock-native-server") : undefined;
    const proxyBedrock = routes.includes("java-bedrock") ? await bedrockServer(dir, proxyBdsSource, "bedrock-proxy-server", entityProbe || gameplayCases.length > 0,
      resourceProbe ? { variant: "a", run: resourceRun } : undefined) : undefined;
    const proxy = proxyBedrock ? await viaProxy(dir, proxyBedrock.port, proxyBedrock.version) : undefined;
    for (const route of routes) {
      if (route === "java-java" && java) {
        if (!selected.includes("--modpack-only")) await javaJoin(route, false, dir, java);
        await javaJoin(route, true, dir, java);
      } else if (route === "java-bedrock" && proxy && proxyBedrock) {
        let modpackProxy = proxy;
        let modpackBedrock = proxyBedrock;
        const proxyLogStart = (await textFile(proxy.log)).length;
        const firstClientLog = !selected.includes("--modpack-only") ? await javaJoin(route, false, dir, { ...proxy, log: proxyBedrock.log, proxyLog: proxy.log },
          entityProbe || gameplayCases.length || resourceProbe ? proxyBedrock : undefined, entityProbe, gameplayCases,
          resourceProbe ? { variant: "a", label: "a-first" } : undefined, probeFailures) : "";
        if (resourceProbe) {
          const firstConversions = convertedPackCount((await textFile(proxy.log)).slice(proxyLogStart) + firstClientLog);
          if (!firstConversions) throw new Error("Resource probe A did not convert its new pack.");
          const repeatStart = (await textFile(proxy.log)).length;
          const repeatClientLog = await javaJoin(route, false, dir, { ...proxy, log: proxyBedrock.log, proxyLog: proxy.log }, proxyBedrock,
            false, [], { variant: "a", label: "a-repeat" });
          const repeatedConversions = convertedPackCount((await textFile(proxy.log)).slice(repeatStart) + repeatClientLog);
          if (repeatedConversions) throw new Error("Resource probe A converted the same content again.");
          console.log("PASS resource pack cache: unchanged content reused the conversion.");

          if (alive(proxy.child.pid)) process.kill(-proxy.child.pid!, "SIGINT");
          for (let attempt = 0; attempt < 40 && alive(proxy.child.pid); attempt++) await Bun.sleep(250);
          if (alive(proxy.child.pid)) throw new Error("ViaProxy did not stop before the changed resource pack run.");

          const changedServer = await bedrockServer(dir, proxyBdsSource, "bedrock-resource-changed-server", false,
            { variant: "b", run: resourceRun });
          const changedProxy = await viaProxy(dir, changedServer.port, changedServer.version, "viaproxy-resource-changed", "viaproxy");
          const changedStart = (await textFile(changedProxy.log)).length;
          const changedClientLog = await javaJoin(route, false, dir, { ...changedProxy, log: changedServer.log, proxyLog: changedProxy.log }, changedServer,
            false, [], { variant: "b", label: "b-changed" });
          const changedConversions = convertedPackCount((await textFile(changedProxy.log)).slice(changedStart) + changedClientLog);
          if (!changedConversions) throw new Error("Resource probe B did not convert changed content.");
          console.log("PASS resource pack cache: changed content produced a new conversion.");
          modpackProxy = changedProxy;
          modpackBedrock = changedServer;
        } else if (gameplayCases.length) {
          await javaJoin(route, false, dir, { ...proxy, log: proxyBedrock.log, proxyLog: proxy.log });
          console.log("PASS gameplay reconnect: the Java client rejoined the same Bedrock world.");
        }
        await javaJoin(route, true, dir, { ...modpackProxy, log: modpackBedrock.log, proxyLog: modpackProxy.log });
      } else if (route === "bedrock-bedrock" && nativeBedrock) {
        await bedrockJoin(dir, nativeBedrock);
      }
    }
    if (probeFailures.length) throw new Error(probeFailures.join("\n"));
  } finally {
    await cleanup();
  }
}

Effect.runPromise(Effect.tryPromise({ try: main, catch: (cause) => cause instanceof Error ? cause : new Error(String(cause)) }))
  .catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
