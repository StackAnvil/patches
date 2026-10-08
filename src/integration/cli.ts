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
import { createCaptureUi } from "../capture/ui.ts";
import { activeDisplay, displayEnv, ensureDisplay, stopDisplay } from "../lab/display.ts";
import { root } from "../model.ts";
import { artifact } from "../client-artifacts.ts";
import { installPrism, prismProcess } from "../prism.ts";
import { installEntityProbe, waitForProbe } from "./entity-probe.ts";
import { allGameplayCaseIds, gameplayCasesForBackend, installProbeGuiScale, runGameplayCases, type GameplayCaseId } from "./gameplay-probe.ts";
import { convertedGeyserTexturesMatch, geyserBedrockVersion, geyserCaseIds, geyserEntityUpdatesMatch, installJavaProbe } from "./geyser.ts";
import { convertedPackCount, convertedTextureMatches, installResourceProbe } from "./resource-probe.ts";
import { connectionFailure, waitForJoin, type JoinRoute } from "./join.ts";
import { complexGameplayCaseIds } from "./ranged-observation.ts";
import { integrationHelp, integrationOptions } from "./options.ts";
import { installModpack } from "./modpack.ts";
import { configureShaders, graphicsFailures, installGraphicsProfile, readGraphicsLock, integrationPrismNames, type GraphicsProfile } from "./graphics.ts";

const execute = promisify(execFile);
const privateRoot = join(root, ".stackanvil", "integration");
const captureCli = join(root, "src", "capture", "cli.ts");
const captureUi = createCaptureUi({ captureDirectory: async () => {
  const captures = join(root, ".stackanvil", "captures");
  const { id } = JSON.parse(await readFile(join(captures, "current.json"), "utf8")) as { id: string };
  if (!/^[a-z0-9][a-z0-9-]{0,90}$/.test(id)) throw new Error("Invalid capture session ID.");
  return join(captures, id);
} });
const prismData = join(homedir(), ".var", "app", "org.prismlauncher.PrismLauncher", "data", "PrismLauncher");
const bdsSource = resolve(process.env.BEDROCK_SERVER_HOME ?? join(homedir(), "bedrock-server"));
const proxyBdsSource = resolve(process.env.STACKANVIL_JAVA_BEDROCK_SERVER_HOME ?? bdsSource);
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

async function javaServer(dir: string, geyser = false): Promise<{ child: ChildProcess; log: string; port: number; bedrockPort?: number }> {
  const port = await tcpPort();
  const bedrockPort = geyser ? await udpPort() : undefined;
  const home = join(dir, geyser ? "geyser-server" : "java-server");
  await mkdir(home, { recursive: true, mode: 0o700 });
  const jar = bedrockPort ? await installJavaProbe(home, bedrockPort) : await vanillaServer();
  await writeFile(join(home, "eula.txt"), "eula=true\n");
  const properties = [
    `server-port=${port}`, "server-ip=127.0.0.1", "online-mode=false", "enforce-secure-profile=false",
    "white-list=false", "enforce-whitelist=false", "allow-flight=true", "max-players=4", "motd=StackAnvil integration",
  ];
  if (geyser) properties.push(
    "level-type=minecraft:flat",
    `generator-settings=${JSON.stringify({ layers: [
      { block: "minecraft:bedrock", height: 1 }, { block: "minecraft:dirt", height: 2 },
      { block: "minecraft:grass_block", height: 1 },
    ], biome: "minecraft:plains" })}`,
    "level-seed=8675309", "view-distance=6", "simulation-distance=6",
  );
  await writeFile(join(home, "server.properties"), `${properties.join("\n")}\n`);
  const log = join(dir, geyser ? "geyser-server.log" : "java-server.log");
  const child = service(Bun.which("java") ?? "java", ["-Xmx2G", "-jar", jar, "nogui"], home, log, process.env, true);
  await waitForLog(log, /Done \(/, child, 120_000);
  if (geyser) {
    await waitForLog(log, /\[StackAnvil Java Probe\] ready/, child);
    await waitForLog(log, /\[StackAnvil Geyser Probe\] ready/, child);
    await waitForLog(log, /Enabled extension Boar/, child);
    await waitForLog(log, /Started Geyser on.*127\.0\.0\.1/, child);
  }
  return { child, log, port, bedrockPort };
}

async function bedrockServer(dir: string, source: string, name: string, entityProbe = false,
  resourceProbe?: { variant: "a" | "b"; run: string }): Promise<{ child: ChildProcess; log: string; port: number; version: string; transport: string }> {
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
    "server-portv6": String(port + 1), "level-name": "integration-world", "online-mode": "false", "allow-list": "false",
    "allow-cheats": "true", "enable-lan-visibility": "false", "server-authoritative-movement-strict": "true" })) {
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
  if (resourceProbe) {
    child.stdin?.write("tickingarea add circle 0 64 0 2 stackanvil_probe\n");
    await waitForLog(log, /Added ticking area centered/, child, 30_000);
    let placed = false;
    for (let attempt = 0; attempt < 10 && !placed; attempt++) {
      child.stdin?.write("setblock 0 64 0 stackanvil:resource_probe_block\n");
      await Bun.sleep(1000);
      placed = (await textFile(log)).includes("Block placed");
    }
    if (!placed) throw new Error(`Could not place the custom probe block. Read ${log}.`);
  }
  const version = /Version:\s*(\d+\.\d+\.\d+)/.exec(output)?.[1];
  if (!version) throw new Error(`Could not read Bedrock server version. Read ${log}.`);
  return { child, log, port, version, transport: /^transport=(.+)$/m.exec(changed)?.[1] ?? "raknet" };
}

async function viaProxy(dir: string, bedrockPort: number, version: string, transport: string, name = "viaproxy", homeName = name): Promise<{ child: ChildProcess; log: string; port: number }> {
  const jar = process.env.VIAPROXY_JAR ? resolve(process.env.VIAPROXY_JAR) : await artifact("viaproxy");
  if (!existsSync(jar)) throw new Error(`ViaProxy missing: ${jar}. Run bun run build viaproxy.`);
  const port = await tcpPort();
  const log = join(dir, `${name}.log`);
  const home = join(dir, homeName);
  await mkdir(home, { recursive: true, mode: 0o700 });
  const child = service(Bun.which("java") ?? "java", ["-DskipUpdateCheck", "-jar", jar, "cli",
    "--bind-address", `127.0.0.1:${port}`, "--target-address", transport === "nethernet" ? `nethernet://127.0.0.1:${bedrockPort}` : `127.0.0.1:${bedrockPort}`,
    "--target-version", `Bedrock ${version}`, "--auth-method", "NONE", "--log-ips", "false"], home, log);
  await waitForLog(log, /Binding proxy server/, child);
  return { child, log, port };
}

async function preparePrism(profile: GraphicsProfile): Promise<{ instance: string; name: string }> {
  const name = integrationPrismNames[profile];
  const instance = await installPrism(name);
  if (profile === "shaders") {
    await installGraphicsProfile(instance);
    console.log("Testing Fabulously Optimized with the pinned Bedrock shader profile.");
  } else if (profile === "optimized") {
    const version = await installModpack(instance);
    await configureShaders(instance);
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

async function waitForGameProcess(launcher: ChildProcess, log: string, name: string): Promise<number> {
  for (let attempt = 0; attempt < 120; attempt++) {
    const pid = await prismProcess(name);
    if (pid) return pid;
    await Bun.sleep(500);
  }
  throw new Error(`Minecraft did not start within 60s (Prism ${alive(launcher.pid) ? "is running" : "has exited"}). Read ${log}.`);
}

async function javaJoin(route: "java-java" | "java-bedrock" | "java-geyser", profile: GraphicsProfile, dir: string,
  target: { port: number; log: string; child: ChildProcess; proxyLog?: string }, entityProbe?: { child: ChildProcess; log: string },
  runEntityProbe = false, gameplayCases: readonly GameplayCaseId[] = [],
  resource?: { variant: "a" | "b"; label: string }, probeFailures?: string[], negativeControls = false): Promise<string> {
  const { instance, name } = await preparePrism(profile);
  const prismRoot = await isolatedPrismRoot(dir, profile === "shaders" ? "shaders" : profile === "optimized" ? "modpack" : "plain");
  if (gameplayCases.length) await installProbeGuiScale(instance);
  const serverLogStart = (await textFile(target.log)).length;
  const connectionLogStart = target.proxyLog ? (await textFile(target.proxyLog)).length : 0;
  const clientLog = join(instance, "minecraft", "logs", "latest.log");
  await rm(clientLog, { force: true });
  const isolated = await displayEnv(true);
  if (!isolated) throw new Error("Integration tests require the private Xvfb display.");
  const log = join(dir, `${route}-${profile === "shaders" ? "fabulously-optimized-shaders" : profile === "optimized" ? "fabulously-optimized" : "plain"}-launcher.log`);
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
    if (route === "java-bedrock" || route === "java-geyser") {
      await waitForLog(clientLog, /Connecting to 127\.0\.0\.1/, () => alive(gamePid), 120_000);
      if (route === "java-geyser" && target.proxyLog) {
        const log = async () => (await textFile(target.proxyLog!)).slice(connectionLogStart);
        const deadline = Date.now() + 120_000;
        while (!/All resource packs have been loaded/.test(await log())) {
          if (!alive(gamePid)) throw new Error("The Java client stopped before resource packs were ready.");
          if (Date.now() > deadline) throw new Error(`Resource packs did not become ready. Read ${target.proxyLog}.`);
          await Bun.sleep(250);
        }
      }
      await Bun.sleep(3500);
      await capture(["ui", "click", "0.32", "0.69", "--client", "java"]);
    }
    const player = await waitForJoin({ route, serverLog: async () => (await textFile(target.log)).slice(serverLogStart), clientLog: () => textFile(clientLog),
      connectionLog: target.proxyLog ? async () => (await textFile(target.proxyLog!)).slice(connectionLogStart) : undefined,
      clientAlive: () => alive(gamePid), timeoutMs: 150_000, dwellMs: 20_000,
      onJoin: route === "java-java" ? (name) => {
        target.child.stdin?.write(`execute at ${name} run summon minecraft:interaction ~ ~ ~\n`);
      } : undefined });
    const renderingFailures = graphicsFailures(await textFile(clientLog),
      profile === "shaders" ? (await readGraphicsLock()).shader.filename : undefined);
    if (renderingFailures.length) throw new Error(renderingFailures.join(" "));
    console.log(`PASS ${route}${profile === "shaders" ? "+fabulously-optimized-shaders" : profile === "optimized" ? "+fabulously-optimized" : ""}: ${player} joined and remained connected for 20s.`);
    if (resource) {
      const log = await textFile(clientLog);
      if (!/Reloading ResourceManager:.*server\//.test(log)) {
        throw new Error(`Resource probe ${resource.label} did not load the converted Java pack.`);
      }
      if (!await convertedTextureMatches(join(dir, "viaproxy"), resource.variant)) {
        throw new Error(`Resource probe ${resource.label} did not preserve the ${resource.variant} texture in its converted pack.`);
      }
      console.log(`PASS resource pack ${resource.label}: converted texture matched and Java loaded the pack.`);
    }
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
          clientAlive: () => alive(gamePid), ui: (args) => capture(args), artifactDir: dir, negativeControls,
          connectionError: async () => connectionFailure(route, player,
            (await textFile(target.log)).slice(serverLogStart),
            target.proxyLog ? (await textFile(target.proxyLog)).slice(connectionLogStart) : ""),
          inspectClient: route === "java-geyser" ? async (id, serverLog, event) => {
            if (geyserCaseIds.includes(id as typeof geyserCaseIds[number])) {
              if (!/Reloading ResourceManager:.*server\//.test(await textFile(clientLog))) {
                throw new Error("The Java client did not load the converted Geyser resource pack.");
              }
              if (!await convertedGeyserTexturesMatch(join(dir, "viaproxy-geyser"))) {
                throw new Error("The converted Geyser pack is missing the custom entity model or fixture textures.");
              }
              if (id.startsWith("custom-entity") || id === "complex-world") {
                const deadline = Date.now() + 5000;
                while (!geyserEntityUpdatesMatch(id, event.observed, await serverLog())) {
                  if (Date.now() > deadline) throw new Error("Geyser did not submit the expected custom entity property updates.");
                  await Bun.sleep(100);
                }
              }
            }
          } : undefined });
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
    if (existsSync(clientLog)) await writeFile(join(dir, `${route}-${profile === "shaders" ? "shaders" : profile === "optimized" ? "optimized" : "plain"}-${Date.now()}.log`), await readFile(clientLog), { mode: 0o600 });
  }
}

async function capture(args: string[], env = process.env): Promise<string> {
  if (args[0] === "ui") return captureUi.command(args);
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
  const options = integrationOptions(Bun.argv.slice(2));
  if (options.help) {
    console.log(integrationHelp);
    return;
  }
  const plainOnly = options["plain-only"];
  const modpackOnly = options["modpack-only"];
  const shaders = options.shaders;
  if (shaders && plainOnly) throw new Error("--shaders requires the Fabulously Optimized client run.");
  if (plainOnly && modpackOnly) throw new Error("Choose --plain-only or --modpack-only, not both.");
  const entityProbe = options["entity-probe"] ?? false;
  const resourceProbe = options["resource-pack-probe"] ?? false;
  const resourceRun = Date.now().toString(36);
  const gameplayProbe = options["gameplay-probe"];
  const complexGameplay = options["gameplay-complex"];
  const geyserProbe = options["geyser-probe"];
  const negativeControls = options["negative-controls"] ?? false;
  const gameplayInput = options["gameplay-cases"];
  if (gameplayInput !== undefined && !gameplayInput) {
    throw new Error("--gameplay-cases needs a comma-separated case list.");
  }
  const routes: JoinRoute[] = options.route !== undefined ? [options.route as JoinRoute]
    : ["java-java", "java-bedrock", "bedrock-bedrock"];
  if (routes.some((route) => !["java-java", "java-bedrock", "bedrock-bedrock", "java-geyser"].includes(route))) {
    throw new Error("Use --route java-java, java-bedrock, bedrock-bedrock, or java-geyser.");
  }
  if (shaders && !routes.some((route) => route.startsWith("java-"))) throw new Error("--shaders requires a Java client route.");
  const geyserRoute = routes.includes("java-geyser");
  const gameplayCases: GameplayCaseId[] = [...new Set([
    ...(complexGameplay ? complexGameplayCaseIds : []),
    ...(geyserProbe ? geyserCaseIds : []),
    ...(gameplayInput ? gameplayInput.split(",") as GameplayCaseId[]
      : gameplayProbe ? gameplayCasesForBackend(geyserRoute) : []),
    ...(negativeControls ? ["chest-transfer" as const] : []),
  ])];
  if (gameplayCases.some((id) => !allGameplayCaseIds.includes(id))) throw new Error(`Unknown gameplay case. Use: ${allGameplayCaseIds.join(", ")}.`);
  if (geyserRoute && gameplayCases.some((id) => complexGameplayCaseIds.includes(id as typeof complexGameplayCaseIds[number]))) {
    throw new Error("Complex gameplay fixtures require --route java-bedrock; the Java probe does not implement them yet.");
  }
  if (gameplayCases.includes("offhand-block-place") && !geyserRoute) {
    throw new Error("Delivered offhand dirt requires the java-geyser backend; use offhand-ineligible-block on java-bedrock.");
  }
  if (gameplayCases.includes("offhand-ineligible-block") && geyserRoute) {
    throw new Error("Offhand item eligibility requires the java-bedrock backend; use offhand-block-place on java-geyser.");
  }
  if ((geyserProbe || negativeControls || gameplayCases.some((id) => geyserCaseIds.includes(id as typeof geyserCaseIds[number]))) && !geyserRoute) {
    throw new Error("Geyser cases and negative controls require --route java-geyser.");
  }
  if (geyserRoute && (entityProbe || resourceProbe || gameplayCases.includes("lab-table-then-chest"))) {
    throw new Error("Bedrock named-event sweeps, the BDS cache probe, and lab tables are unavailable on the Java backend. Use --geyser-probe for custom content.");
  }
  if ((entityProbe || resourceProbe) && !routes.includes("java-bedrock")) throw new Error("Bedrock probes require the java-bedrock route.");
  if (gameplayCases.length && !routes.includes("java-bedrock") && !geyserRoute) throw new Error("Gameplay cases require java-bedrock or java-geyser.");
  if ((entityProbe || gameplayCases.length || resourceProbe) && modpackOnly) throw new Error("Probe cases require the plain Java client run.");
  if (process.env.STACKANVIL_USE_DESKTOP === "1") throw new Error("Integration tests require a private display and never take desktop focus.");
  if (await activeDisplay()) throw new Error("The StackAnvil private display is already running. Stop the lab or capture session before integration tests.");
  if (!options["reuse-build"]) await command(process.execPath, [join(root, "src", "cli.ts"), "stack", "build", "all"]);
  const dir = join(privateRoot, "runs", new Date().toISOString().replace(/[:.]/g, "-"));
  await mkdir(dir, { recursive: true, mode: 0o700 });
  console.log(`Private logs: ${dir}`);
  await ensureDisplay();
  try {
    const probeFailures: string[] = [];
    const java = routes.includes("java-java") ? await javaServer(dir) : undefined;
    const geyser = geyserRoute ? await javaServer(dir, true) : undefined;
    const geyserProxy = geyser?.bedrockPort ? await viaProxy(dir, geyser.bedrockPort, geyserBedrockVersion, "raknet", "viaproxy-geyser") : undefined;
    const nativeBedrock = routes.includes("bedrock-bedrock") ? await bedrockServer(dir, bdsSource, "bedrock-native-server") : undefined;
    const proxyBedrock = routes.includes("java-bedrock") ? await bedrockServer(dir, proxyBdsSource, "bedrock-proxy-server", entityProbe || gameplayCases.length > 0,
      resourceProbe ? { variant: "a", run: resourceRun } : undefined) : undefined;
    const proxy = proxyBedrock ? await viaProxy(dir, proxyBedrock.port, proxyBedrock.version, proxyBedrock.transport) : undefined;
    for (const route of routes) {
      if (route === "java-java" && java) {
        if (!modpackOnly) await javaJoin(route, "plain", dir, java);
        if (!plainOnly) await javaJoin(route, shaders ? "shaders" : "optimized", dir, java);
      } else if (route === "java-geyser" && geyser && geyserProxy) {
        const target = { ...geyserProxy, log: geyser.log, proxyLog: geyserProxy.log };
        if (!modpackOnly) await javaJoin(route, "plain", dir, target, geyser, false, gameplayCases, undefined, probeFailures, negativeControls);
        if (gameplayCases.length) {
          await javaJoin(route, "plain", dir, target);
          console.log("PASS Geyser reconnect: the Java client rejoined the same Paper world.");
        }
        if (!plainOnly) await javaJoin(route, shaders ? "shaders" : "optimized", dir, target);
      } else if (route === "java-bedrock" && proxy && proxyBedrock) {
        let modpackProxy = proxy;
        let modpackBedrock = proxyBedrock;
        const proxyLogStart = (await textFile(proxy.log)).length;
        const firstClientLog = !modpackOnly ? await javaJoin(route, "plain", dir, { ...proxy, log: proxyBedrock.log, proxyLog: proxy.log },
          entityProbe || gameplayCases.length || resourceProbe ? proxyBedrock : undefined, entityProbe, gameplayCases,
          resourceProbe ? { variant: "a", label: "a-first" } : undefined, probeFailures) : "";
        if (resourceProbe && (await textFile(proxy.log)).includes("Missing bedrock -> java block state mapping: stackanvil:resource_probe_block")) {
          throw new Error("The custom probe block fell back to an unrelated Java block state.");
        }
        if (resourceProbe) {
          const firstConversions = convertedPackCount((await textFile(proxy.log)).slice(proxyLogStart) + firstClientLog);
          if (!firstConversions) throw new Error("Resource probe A did not convert its new pack.");
          const repeatStart = (await textFile(proxy.log)).length;
          const repeatClientLog = await javaJoin(route, "plain", dir, { ...proxy, log: proxyBedrock.log, proxyLog: proxy.log }, proxyBedrock,
            false, [], { variant: "a", label: "a-repeat" });
          const repeatedConversions = convertedPackCount((await textFile(proxy.log)).slice(repeatStart) + repeatClientLog);
          if (repeatedConversions) throw new Error("Resource probe A converted the same content again.");
          console.log("PASS resource pack cache: unchanged content reused the conversion.");

          if (alive(proxy.child.pid)) process.kill(-proxy.child.pid!, "SIGINT");
          for (let attempt = 0; attempt < 40 && alive(proxy.child.pid); attempt++) await Bun.sleep(250);
          if (alive(proxy.child.pid)) throw new Error("ViaProxy did not stop before the changed resource pack run.");
          if (alive(proxyBedrock.child.pid)) process.kill(-proxyBedrock.child.pid!, "SIGINT");
          for (let attempt = 0; attempt < 40 && alive(proxyBedrock.child.pid); attempt++) await Bun.sleep(250);
          if (alive(proxyBedrock.child.pid)) throw new Error("Bedrock server did not stop before the changed resource pack run.");

          const changedServer = await bedrockServer(dir, proxyBdsSource, "bedrock-resource-changed-server", false,
            { variant: "b", run: resourceRun });
          const changedProxy = await viaProxy(dir, changedServer.port, changedServer.version, changedServer.transport, "viaproxy-resource-changed", "viaproxy");
          const changedStart = (await textFile(changedProxy.log)).length;
          const changedClientLog = await javaJoin(route, "plain", dir, { ...changedProxy, log: changedServer.log, proxyLog: changedProxy.log }, changedServer,
            false, [], { variant: "b", label: "b-changed" });
          const changedConversions = convertedPackCount((await textFile(changedProxy.log)).slice(changedStart) + changedClientLog);
          if (!changedConversions) throw new Error("Resource probe B did not convert changed content.");
          console.log("PASS resource pack cache: changed content produced a new conversion.");
          modpackProxy = changedProxy;
          modpackBedrock = changedServer;
        } else if (gameplayCases.length) {
          await javaJoin(route, "plain", dir, { ...proxy, log: proxyBedrock.log, proxyLog: proxy.log });
          console.log("PASS gameplay reconnect: the Java client rejoined the same Bedrock world.");
        }
        if (!plainOnly) await javaJoin(route, shaders ? "shaders" : "optimized", dir, { ...modpackProxy, log: modpackBedrock.log, proxyLog: modpackProxy.log });
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
