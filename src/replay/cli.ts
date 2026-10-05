import { execFile, spawn, type ChildProcess } from "node:child_process";
import { closeSync, existsSync, openSync } from "node:fs";
import { chmod, cp, mkdir, mkdtemp, readFile, readdir, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, join, resolve, delimiter } from "node:path";
import { createServer } from "node:net";
import { createSocket } from "node:dgram";
import { promisify } from "node:util";
import { Effect } from "effect";
import { root } from "../model.ts";
import { artifact } from "../prism.ts";
import { activeDisplay, displayEnv, stopDisplay } from "../lab/display.ts";
import { inspectJournal } from "./journal.ts";
import { requireNativeOfflineReplay, requireNativeReplayProcessNamespaces, type NativeOfflineProof } from "./native-offline.ts";
import { prepareNativeReplayPrefix } from "./native-prefix.ts";
import { prepareNativeProfile } from "./native-profile.ts";
import { hasGameplayAcknowledgments, verifyRendering, type SceneFeatures, type RenderAudit } from "./verification.ts";

const execute = promisify(execFile);
const privateRoot = join(root, ".stackanvil", "replay");
const servers = {
  cubecraft: "play.cubecraft.net:19132",
  hive: "geo.hivebedrock.cloud:19132",
  lifeboat: "play.lbsg.net:19132",
  galaxite: "play.galaxite.net:19132",
  minehut: "bedrock.minehut.com:19132",
  geyser: "test.geysermc.org:19132",
};
const prismData = join(homedir(), ".var/app/org.prismlauncher.PrismLauncher/data/PrismLauncher");
const accountDefault = join(prismData, "instances/StackAnvil Desktop 26.3/minecraft/config/viafabricplus/bedrock.json");
const children: ChildProcess[] = [];
let nativeClient: { pid: number; directory: string } | undefined;

function alive(pid?: number): boolean { if (!pid) return false; try { process.kill(pid, 0); return true; } catch { return false; } }
async function logText(path: string): Promise<string> { return existsSync(path) ? readFile(path, "utf8") : ""; }
function service(program: string, args: string[], cwd: string, log: string, env = process.env): ChildProcess {
  const fd = openSync(log, "wx", 0o600);
  const child = spawn(program, args, { cwd, env, detached: true, stdio: ["ignore", fd, fd] });
  closeSync(fd); children.push(child);
  return child;
}
async function port(udp = false): Promise<number> {
  if (udp) {
    const socket = createSocket("udp4");
    await new Promise<void>((done) => socket.bind(0, "127.0.0.1", done));
    const value = socket.address().port;
    await new Promise<void>((done) => socket.close(done)); return value;
  }
  const server = createServer();
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Could not reserve a port.");
  await new Promise<void>((done) => server.close(() => done())); return address.port;
}
async function ready(child: ChildProcess, file: string, pattern: RegExp): Promise<void> {
  const until = Date.now() + 60_000;
  while (Date.now() < until) {
    if (pattern.test(await logText(file))) return;
    if (!alive(child.pid)) throw new Error(`Service exited. Read ${file}.`);
    await Bun.sleep(250);
  }
  throw new Error(`Service startup timed out. Read ${file}.`);
}
async function buildPlugin(jar: string): Promise<{ classes: string; plugin: string; build: string }> {
  await mkdir(privateRoot, { recursive: true, mode: 0o700 });
  await chmod(privateRoot, 0o700);
  const build = await mkdtemp(join(privateRoot, "build-"));
  const classes = join(build, "classes");
  await mkdir(classes, { recursive: true, mode: 0o700 });
  const source = join(root, "src/replay/java/com/enderdash/agent/replay");
  const files = (await readdir(source)).filter((name) => name.endsWith(".java")).map((name) => join(source, name));
  await execute("javac", ["-cp", jar, "-d", classes, ...files]);
  await writeFile(join(classes, "viaproxy.yml"), "name: StackAnvilRecorder\nauthor: StackAnvil\nversion: 1\nmain: com.enderdash.agent.replay.RecordingPlugin\n", { mode: 0o600 });
  const plugin = join(build, "recorder.jar");
  await execute("jar", ["--create", "--file", plugin, "-C", classes, "."]);
  await writeFile(join(build, "log4j2.xml"), '<Configuration status="ERROR"><Appenders><Console name="console"><PatternLayout pattern="%level %logger: %msg%n"/></Console></Appenders><Loggers><Root level="warn"><AppenderRef ref="console"/></Root></Loggers></Configuration>\n', { mode: 0o600 });
  return { classes, plugin, build };
}
async function ui(args: string[], directory: string, client = "java"): Promise<void> {
  await execute("bun", [join(root, "src/capture/cli.ts"), "ui", ...args, "--client", client, "--output-dir", directory], { cwd: root });
  if (args[0] === "screenshot") await chmod(join(directory, `${args[1]}.png`), 0o600);
}
async function buildFabricRecorder(jar: string, build: string): Promise<string> {
  const libraries = join(prismData, "libraries/net/fabricmc/sponge-mixin");
  const versions = (await readdir(libraries)).toSorted().toReversed();
  const version = versions[0];
  if (!version) throw new Error("Prepare the Fabric integration instance first.");
  const mixin = join(libraries, version, `sponge-mixin-${version}.jar`);
  const classes = join(build, "fabric-classes");
  await mkdir(classes, { recursive: true, mode: 0o700 });
  const source = join(root, "src/replay/fabric/com/enderdash/agent/replay/fabric");
  const files = [...new Bun.Glob("**/*.java").scanSync(source)].map((file) => join(source, file));
  await execute("javac", ["-proc:none", "-cp", `${jar}${delimiter}${mixin}`, "-d", classes,
    join(root, "src/replay/java/com/enderdash/agent/replay/PacketJournal.java"),
    join(root, "src/replay/java/com/enderdash/agent/replay/CameraPresetAudit.java"), ...files]);
  await writeFile(join(classes, "fabric.mod.json"), JSON.stringify({ schemaVersion: 1, id: "stackanvil_recorder", version: "1.0.0",
    name: "StackAnvil private replay recorder", environment: "client", mixins: ["stackanvil-recorder.mixins.json"],
    depends: { "viafabricplus-bedrock": "*" } }), { mode: 0o600 });
  await writeFile(join(classes, "stackanvil-recorder.mixins.json"), JSON.stringify({ required: true,
    package: "com.enderdash.agent.replay.fabric.mixin", compatibilityLevel: "JAVA_25", client: ["MixinPacketCodec", "MixinPlayerSkins", "MixinRenderStore", "MixinCustomEntity", "MixinCustomActorFrame", "MixinHeldItemLight", "MixinReplayCamera", "MixinPlayerFrame"] }), { mode: 0o600 });
  const output = join(build, "fabric-recorder.jar");
  await execute("jar", ["--create", "--file", output, "-C", classes, "."]);
  return output;
}

async function launchJava(directory: string, bind: number, client: "addon" | "proxy", recorder: string, account?: string): Promise<{ pid: number; log: string }> {
  const isolated = await displayEnv(true);
  if (!isolated) throw new Error("The replay lab requires a private virtual display.");
  const sourceName = process.env.STACKANVIL_REPLAY_INSTANCE ?? "StackAnvil Integration 26.3";
  const source = join(prismData, "instances", sourceName);
  if (!existsSync(join(source, "instance.cfg"))) throw new Error("Prepare the integration Prism instance with bun run test:integration first.");
  const name = `Replay-${basename(directory)}`;
  const prism = join(directory, "prism");
  await mkdir(prism, { mode: 0o700 });
  await mkdir(join(prism, "logs"), { mode: 0o700 });
  await mkdir(join(prism, "instances"), { mode: 0o700 });
  for (const entry of await readdir(prismData, { withFileTypes: true })) {
    if (entry.name === "logs" || entry.name === "instances") continue;
    if (entry.isDirectory()) await symlink(join(prismData, entry.name), join(prism, entry.name), "dir");
    else if (entry.isFile()) await writeFile(join(prism, entry.name), await readFile(join(prismData, entry.name)), { mode: 0o600 });
  }
  const instance = join(prism, "instances", name);
  await mkdir(instance, { mode: 0o700 });
  for (const file of ["instance.cfg", "mmc-pack.json"]) await cp(join(source, file), join(instance, file));
  const game = join(instance, "minecraft");
  await mkdir(game, { mode: 0o700 });
  for (const file of ["config", "options.txt"]) if (existsSync(join(source, "minecraft", file))) await cp(join(source, "minecraft", file), join(game, file), { recursive: true });
  const config = join(game, "config/viafabricplus");
  await mkdir(config, { recursive: true, mode: 0o700 });
  const settingsFile = join(config, "settings.json");
  const settings = existsSync(settingsFile) ? JSON.parse(await readFile(settingsFile, "utf8")) : {};
  settings.selected_protocol_version = client === "addon" ? "Bedrock 1.26.51" : "26.3";
  await writeFile(settingsFile, JSON.stringify(settings), { mode: 0o600 });
  await rm(join(config, "bedrock.json"), { force: true });
  if (account) await writeFile(join(config, "bedrock.json"), await readFile(account), { mode: 0o600 });
  if (client === "addon") {
    const assets = join(privateRoot, "client-assets");
    const existing = account ? join(dirname(account), "bedrock-assets") : undefined;
    if (!existsSync(assets) && existing && existsSync(existing)) await cp(existing, assets, { recursive: true });
    await mkdir(assets, { recursive: true, mode: 0o700 });
    await chmod(assets, 0o700);
    await rm(join(config, "bedrock-assets"), { recursive: true, force: true });
    await symlink(assets, join(config, "bedrock-assets"), "dir");
  }
  await writeFile(join(config, "viabedrock.yml"), "blob-cache: disabled\npack-cache: disabled\ntranslate-resource-packs: true\n", { mode: 0o600 });
  const mods = join(game, "mods");
  await mkdir(mods, { mode: 0o700 });
  for (const project of ["viafabricplus", "viafabricplus-bedrock"]) {
    const file = await artifact(project);
    await cp(file, join(mods, basename(file)));
  }
  await cp(recorder, join(mods, "stackanvil-recorder.jar"));
  await writeFile(join(game, "stackanvil-replay-directory.txt"), directory, { mode: 0o600 });
  const launcherLog = join(directory, "launcher.log");
  service("flatpak", ["run", "--nosocket=wayland", "--socket=x11", `--filesystem=${join(root, ".stackanvil/lab")}:ro`, `--filesystem=${directory}`,
    ...(client === "addon" ? [`--filesystem=${join(privateRoot, "client-assets")}`] : []),
    `--env=DISPLAY=${isolated.DISPLAY}`, `--env=XAUTHORITY=${isolated.XAUTHORITY}`, "--env=WAYLAND_DISPLAY=", "--env=QT_QPA_PLATFORM=xcb",
    "--env=SDL_VIDEODRIVER=x11", "--env=SDL_VIDEO_DRIVER=x11", "--env=SDL_VIDEO_FORCE_EGL=1", "--env=PULSE_SINK=stackanvil_silent",
    "org.prismlauncher.PrismLauncher", "--dir", prism, "--launch", name, "--server", `127.0.0.1:${bind}`], root, launcherLog, isolated);
  const until = Date.now() + 60_000;
  while (Date.now() < until) {
    const { stdout } = await execute("ps", ["-eo", "pid=,args="], { maxBuffer: 8 * 1024 * 1024 });
    const line = stdout.split("\n").find((line) => line.includes("org.prismlauncher.EntryPoint") && line.includes(name));
    if (line) return { pid: Number(line.trim().split(/\s/)[0]), log: join(game, "logs/latest.log") };
    await Bun.sleep(500);
  }
  throw new Error(`Minecraft startup timed out. Read ${launcherLog}.`);
}
async function launchNative(directory: string, bind: number, nativeHome?: string, manualConnect = false, offline?: NativeOfflineProof): Promise<{ pid: number; log: string }> {
  const isolated = await displayEnv(true);
  if (!isolated) throw new Error("Native recording requires the lab's private display.");
  const source = resolve(nativeHome ?? process.env.STACKANVIL_REPLAY_BEDROCK_HOME ?? join(homedir(), ".local/share/bedrock-on-linux"));
  const runtime = join(privateRoot, "native-client");
  await prepareNativeProfile({ source, privateRoot, runtime });
  const replayPrefix = offline ? await prepareNativeReplayPrefix({
    privateRoot, directory, sourcePrefix: process.env.BOL_WINEPREFIX || join(runtime, "compatdata/pfx"), port: bind,
  }) : undefined;
  const temporary = join(replayPrefix ?? join(runtime, "compatdata/pfx"), "drive_c/users/steamuser/AppData/Local/Temp/Minecraft Bedrock/minecraftpe");
  for (const name of ["packcache/resource", "ResPackDownloads"]) {
    const cache = join(temporary, name);
    if (!existsSync(cache)) continue;
    if (!(await realpath(cache)).startsWith(`${await realpath(replayPrefix ?? runtime)}/`)) throw new Error("The native server pack cache escapes the private profile.");
    for (const entry of await readdir(cache)) await rm(join(cache, entry), { recursive: true, force: true });
  }
  const app = join(root, ".stackanvil/tools/bedrock-on-linux/squashfs-root");
  const python = join(app, "usr/python/bin/python3.12");
  if (!existsSync(python)) throw new Error("Prepare BedrockOnLinux with bun run capture prepare-launcher first.");
  const log = join(directory, "native-client.log");
  const child = service(python, [join(app, "usr/bin/bedrock-on-linux"), "play"], root, log,
    { ...isolated, BOL_HOME: runtime, APPDIR: app, PULSE_SINK: "stackanvil_silent", ...(replayPrefix ? { BOL_WINEPREFIX: replayPrefix } : {}) });
  if (!child.pid) throw new Error("The native client did not start.");
  nativeClient = { pid: child.pid, directory };
  const until = Date.now() + 90_000;
  while (Date.now() < until) {
    if (!alive(child.pid)) throw new Error(`Native client exited. Read ${log}.`);
    const state = await execute("bun", [join(root, "src/capture/cli.ts"), "ui", "list", "--client", "bedrock"], { cwd: root });
    if (state.stdout.includes('"title": "Minecraft"')) break;
    await Bun.sleep(1000);
  }
  await Bun.sleep(20_000);
  await ui(["screenshot", "native-menu"], directory, "bedrock");
  if (offline) await requireNativeReplayProcessNamespaces(offline, [process.pid, ...children.flatMap(service => service.pid ? [service.pid] : [])]);
  if (manualConnect) {
    console.log(`Native client is waiting for verified manual connection to 127.0.0.1:${bind}.`);
    return { pid: child.pid, log };
  }
  await ui(["key", "Return"], directory, "bedrock"); await Bun.sleep(2500);
  await ui(["click", "0.82", "0.11"], directory, "bedrock"); await Bun.sleep(2500);
  await ui(["click", "0.17", "0.22"], directory, "bedrock"); await Bun.sleep(2000);
  for (const [row, value] of [["0.17", "stackanvil-native-recording"], ["0.31", "127.0.0.1"], ["0.46", String(bind)]] as const) {
    await ui(["click", "0.25", row], directory, "bedrock"); await Bun.sleep(250);
    await ui(["key", "Control+a"], directory, "bedrock"); await Bun.sleep(250);
    await ui(["type", value], directory, "bedrock"); await Bun.sleep(250);
  }
  await ui(["click", "0.69", "0.57"], directory, "bedrock");
  await Bun.sleep(4000);
  await ui(["screenshot", "native-before-trust"], directory, "bedrock");
  const pixel = await execute("bun", [join(root, "src/capture/cli.ts"), "ui", "pixel", "0.36", "0.28", "--client", "bedrock"], { cwd: root });
  const rgb = pixel.stdout.trim().split(/\s+/).map(Number);
  if (rgb.length === 3 && rgb.every((value) => value > 150)) await ui(["click", "0.5", "0.59"], directory, "bedrock");
  return { pid: child.pid, log };
}

async function stopAll(gamePid?: number): Promise<void> {
  if (nativeClient && alive(nativeClient.pid)) {
    try {
      await ui(["key", "Alt+F4"], nativeClient.directory, "bedrock");
      const until = Date.now() + 30_000;
      while (Date.now() < until && alive(nativeClient.pid)) await Bun.sleep(250);
    } catch {
      console.error("The private Bedrock window could not close normally. Read the native client log before launching it again.");
    }
  }
  if (nativeClient) {
    // Pack export may still be finishing after the native client closes its connection.
    const until = Date.now() + 40_000;
    const proxyLog = join(nativeClient.directory, "proxy.log");
    while (Date.now() < until && children.some((child) => alive(child.pid))) {
      if (/StackAnvil native capture connection closed|Native connection failed:|Native capture failed:/.test(await logText(proxyLog))) break;
      await Bun.sleep(250);
    }
  }
  if (alive(gamePid)) process.kill(gamePid!, "SIGTERM");
  for (const child of children.toReversed()) if (alive(child.pid)) process.kill(-child.pid!, "SIGTERM");
  const until = Date.now() + 10_000;
  while (Date.now() < until && (alive(gamePid) || children.some((child) => alive(child.pid)))) await Bun.sleep(100);
  if (alive(gamePid)) process.kill(gamePid!, "SIGKILL");
  for (const child of children.toReversed()) if (alive(child.pid)) process.kill(-child.pid!, "SIGKILL");
}
async function main(): Promise<void> {
  const [mode, input, ...args] = Bun.argv.slice(2);
  if (mode === "selftest") {
    const jar = await artifact("viaproxy");
    const { classes } = await buildPlugin(jar);
    for (const test of ["ReplaySelfTest", "NativeCaptureSelfTest"]) {
      const { stdout } = await execute("java", ["-cp", `${classes}${delimiter}${jar}`, `com.enderdash.agent.replay.${test}`]);
      console.log(stdout.trim());
    }
    return;
  }
  if (mode === "inspect" && input) { console.log(JSON.stringify(await inspectJournal(join(resolve(input), "packets.sbr")), null, 2)); return; }
  if (!input || (mode !== "record" && mode !== "replay")) throw new Error("Usage: bun run server-replay <record cubecraft|hive|lifeboat|galaxite|minehut|geyser|local --target host:port|replay directory|inspect directory> [--seconds 120]");
  const option = (name: string) => { const at = args.indexOf(name); return at < 0 ? undefined : args[at + 1]; };
  const seconds = Number(option("--seconds") ?? 120);
  const client = option("--client") ?? (mode === "replay" ? "addon" : "proxy");
  const transportOnly = args.includes("--transport-only");
  if (client !== "addon" && client !== "proxy" && client !== "native") throw new Error("--client must be addon, proxy, or native.");
  const nativeOffline = mode === "replay" && client === "native" ? await requireNativeOfflineReplay() : undefined;
  if (!Number.isInteger(seconds) || seconds < 20 || seconds > 300) throw new Error("--seconds must be between 20 and 300.");
  if (mode === "record" && input === "hive" && client !== "native" && !args.includes("--allow-hive")) throw new Error("ViaBedrock blacklists The Hive because translated clients can be banned. Use an official client capture, or explicitly pass --allow-hive for this diagnostic join.");
  let target = servers[input as keyof typeof servers];
  if (mode === "record" && input !== "local" && option("--target")) throw new Error("--target requires record local. Named servers use their configured address.");
  if (mode === "record" && input === "local") {
    target = option("--target")!;
    if (!/^(?:nethernet:\/\/)?127\.0\.0\.1:\d+$/.test(target ?? "")) throw new Error("Local recordings require --target 127.0.0.1:port or nethernet://127.0.0.1:port.");
    if (target.startsWith("nethernet://") && client !== "proxy") throw new Error("Local NetherNet recording requires --client proxy.");
  } else if (mode === "record" && !target) throw new Error("Unknown server.");
  const jar = await artifact("viaproxy");
  await mkdir(privateRoot, { recursive: true, mode: 0o700 });
  await chmod(privateRoot, 0o700);
  const { classes, plugin, build } = await buildPlugin(jar);
  const recorder = client !== "native" ? await buildFabricRecorder(jar, build) : "";
  const directory = join(privateRoot, `${new Date().toISOString().replaceAll(":", "-")}-${mode}-${mode === "record" ? input : "scene"}`);
  await mkdir(directory, { mode: 0o700 });
  const proxyHome = join(directory, "proxy");
  await mkdir(proxyHome, { mode: 0o700 });
  await writeFile(join(proxyHome, "viabedrock.yml"), `blob-cache: disabled\npack-cache: disabled\ntranslate-resource-packs: true\ndisable-server-blacklist: ${input === "hive" && args.includes("--allow-hive")}\n`, { mode: 0o600 });
  await mkdir(join(proxyHome, "plugins"), { mode: 0o700 });
  await writeFile(join(proxyHome, "plugins/recorder.jar"), await readFile(plugin), { mode: 0o600 });
  if (mode === "record") {
    if (input !== "local" || option("--account")) {
      const authPath = resolve(option("--account") ?? process.env.STACKANVIL_BEDROCK_ACCOUNT ?? accountDefault);
      const auth = JSON.parse(await readFile(authPath, "utf8"));
      auth.accountType = "net.raphimc.viaproxy.saves.impl.accounts.BedrockAccount";
      await writeFile(join(proxyHome, "saves.json"), JSON.stringify({ accountsV4: [auth] }), { mode: 0o600 });
    }
  }
  const ownedDisplay = !await activeDisplay();
  let gamePid: number | undefined;
  let replayPort: number | undefined;
  let stopped = false;
  let unexpectedClientExit = false;
  const abort = () => { stopped = true; };
  process.on("SIGINT", abort); process.on("SIGTERM", abort);
  try {
    if (mode === "replay") {
      const recording = resolve(input);
      await inspectJournal(join(recording, "packets.sbr"));
      if (client !== "native") {
        const { stdout } = await execute("java", [`-Dlog4j2.configurationFile=${join(build, "log4j2.xml")}`, "-cp", `${classes}${delimiter}${jar}`, "com.enderdash.agent.replay.SceneFeatures", join(recording, "packets.sbr")]);
        const features = JSON.parse(stdout) as SceneFeatures;
        if (features.localGeometrySkinUpdates && client === "proxy") await writeFile(join(directory, "replay-local-avatar.txt"), "1\n", { mode: 0o600 });
        if (features.localGeometrySkinUpdates && client === "addon") await execute("java", [`-Dlog4j2.configurationFile=${join(build, "log4j2.xml")}`, "-cp", `${classes}${delimiter}${jar}`, "com.enderdash.agent.replay.SceneFeatures", "--self-identity", join(recording, "packets.sbr"), join(directory, "replay-self-uuid.txt")]);
      }
      const udp = await port(true);
      const log = join(directory, "replay.log");
      const child = service("java", [`-Dlog4j2.configurationFile=${join(build, "log4j2.xml")}`, "-cp", `${classes}${delimiter}${jar}`, "com.enderdash.agent.replay.ReplayServer", recording, String(udp)], directory, log);
      await ready(child, log, /StackAnvil replay ready/);
      target = `127.0.0.1:${udp}`;
      replayPort = udp;
    }
    const bind = client === "addon" && replayPort ? replayPort : await port(client === "native");
    const proxyLog = join(directory, "proxy.log");
    let child: ChildProcess | undefined;
    if (client === "proxy") {
      child = service("java", ["-DskipUpdateCheck", `-Dstackanvil.recording=${directory}`, "-jar", jar, "cli", "--bind-address", `127.0.0.1:${bind}`,
        "--target-address", target!, "--target-version", "Bedrock 1.26.51", "--auth-method", mode === "record" && (input !== "local" || option("--account")) ? "ACCOUNT" : "NONE", "--minecraft-account-index", "0", "--log-ips", "false"], proxyHome, proxyLog);
      await ready(child, proxyLog, /ViaProxy started successfully/);
    } else if (client === "native") {
      const separator = target!.lastIndexOf(":");
      const account = mode === "replay" || (input === "local" && !option("--account")) ? "offline" : resolve(option("--account") ?? process.env.STACKANVIL_BEDROCK_ACCOUNT ?? accountDefault);
      child = service("java", [`-Dlog4j2.configurationFile=${join(build, "log4j2.xml")}`, "-cp", `${classes}${delimiter}${jar}`,
        "com.enderdash.agent.replay.NativeCaptureProxy", directory, String(bind), target!.slice(0, separator), target!.slice(separator + 1), account], directory, proxyLog);
      await ready(child, proxyLog, /StackAnvil native capture ready/);
    } else if (mode !== "replay") {
      throw new Error("Direct addon recording currently accepts local replay fixtures only. Use --client proxy for public recording.");
    }
    const assetAccount = client === "addon" ? option("--account") : undefined;
    const game = client === "native"
      ? await launchNative(directory, bind, option("--native-home"), mode === "replay" || args.includes("--native-manual-connect"), nativeOffline)
      : await launchJava(directory, bind, client, recorder, assetAccount ? resolve(assetAccount) : undefined);
    gamePid = game.pid;
    console.log(`Private ${mode} session: ${directory}`);
    // Give verified manual setup its own bound without shortening the recorded scene.
    let waitingForNativeConnection = client === "native";
    let until = Date.now() + (waitingForNativeConnection ? 300_000 : seconds * 1000);
    while (!stopped && Date.now() < until && alive(gamePid) && (!child || alive(child.pid))) {
      if (waitingForNativeConnection && existsSync(join(directory, "packets.sbr"))) {
        waitingForNativeConnection = false;
        until = Date.now() + seconds * 1000;
        console.log(`Native connection observed; capturing the full ${seconds}-second scene.`);
      }
      const log = await logText(game.log);
      if (client === "native" && /Native connection failed:|Native capture failed:|StackAnvil native capture connection closed/.test(await logText(proxyLog))) break;
      if (/Mixin transformation .* failed|Client disconnected with reason:|handlerAdded\(\) has thrown|(?:Unreported|Reported) exception thrown!|A fatal error has been detected by the Java Runtime Environment/.test(log)) break;
      await Bun.sleep(500);
    }
    await writeFile(join(directory, "client.log"), await logText(game.log), { mode: 0o600 });
    try {
      await ui(["screenshot", "scene"], directory, client === "native" ? "bedrock" : "java");
    } catch {
      await writeFile(join(directory, "screenshot-error.txt"), "The private client window was unavailable for a screenshot. Read client.log.\n", { mode: 0o600 });
    }
    unexpectedClientExit = !alive(gamePid);
  } finally {
    await stopAll(gamePid);
    if (ownedDisplay) await stopDisplay();
    process.off("SIGINT", abort); process.off("SIGTERM", abort);
    // Proxy libraries write their own saves with default permissions.
    for (const name of ["saves.json", "viaproxy.yml"]) if (existsSync(join(proxyHome, name))) await chmod(join(proxyHome, name), 0o600);
  }
  const summary = await inspectJournal(join(directory, "packets.sbr"));
  await writeFile(join(directory, "manifest.json"), `${JSON.stringify({ schema: 1, mode, client, server: mode === "record" ? input : undefined, capturedAt: new Date().toISOString(), summary }, null, 2)}\n`, { mode: 0o600 });
  console.log(JSON.stringify(summary, null, 2));
  console.log(`Saved private ${mode} artifacts: ${directory}`);
  if (client === "native" && /Native connection failed:|Native capture failed:/.test(await logText(join(directory, "proxy.log")))) throw new Error("The native recorder failed. Read its private proxy log; this capture is incomplete.");
  if (client === "native" && /Native pack observation failed:/.test(await logText(join(directory, "proxy.log")))) throw new Error("Native pack reconstruction failed. The raw recording is preserved for offline repair; read its private proxy log.");
  if (client === "native" && !/StackAnvil native pack observation complete/.test(await logText(join(directory, "proxy.log")))) throw new Error("Native pack reconstruction did not finish before shutdown. The raw recording is preserved; read its private proxy log.");
  if (unexpectedClientExit || stopped) throw new Error("The client exited or the run was cancelled before normal cleanup. Read its private client log.");
  if (/Client disconnected with reason:|Failed to handle packet|ReadTimeoutException|(?:Unreported|Reported) exception thrown!|A fatal error has been detected by the Java Runtime Environment|Mixin transformation .* failed|handlerAdded\(\) has thrown/.test(await logText(join(directory, "client.log")))) {
    throw new Error("The client disconnected or failed during the captured session. Read its private client log.");
  }
  if (!summary.reachedStartGame || !summary.reachedSpawn) throw new Error("The server did not announce initialization and spawn. Read its private logs and screenshot.");
  if (!hasGameplayAcknowledgments(summary.serverboundIds)) throw new Error("The server announced spawn, but the client did not initialize its player and begin gameplay movement. Read its private logs and screenshot.");
  if (mode === "replay" && !/StackAnvil replay scene complete/.test(await logText(join(directory, "replay.log")))) throw new Error("The replay stopped before the complete scene was sent.");
  if (mode === "replay") {
    const original = await inspectJournal(join(resolve(input), "packets.sbr"));
    if (original.sceneSha256 !== summary.sceneSha256) throw new Error("The replay changed or omitted scene packet payloads.");
    if (client === "native") {
      if (!summary.serverboundIds[113] || !summary.serverboundIds[144]) throw new Error("The official client did not acknowledge its local player and begin gameplay input.");
      if (!existsSync(join(directory, "scene.png")) || existsSync(join(directory, "screenshot-error.txt"))) throw new Error("The official replay produced no reference screenshot.");
      await writeFile(join(directory, "verification.json"), JSON.stringify({ transport: "pass", rendering: "reference-captured", evidence: ["complete unchanged scene payloads", "native local-player initialization", "native gameplay input", "resource-pack reconstruction", "reference screenshot"] }, null, 2), { mode: 0o600 });
      console.log("PASS offline official-client transport: complete unchanged scene, native gameplay acknowledgments, and saved reference screenshot.");
      return;
    }
    const clientLog = await logText(join(directory, "client.log"));
    if (!/Reloading ResourceManager:.*server\//.test(clientLog)) throw new Error("Java did not load the replay resource pack.");
    const { stdout } = await execute("java", [`-Dlog4j2.configurationFile=${join(build, "log4j2.xml")}`, "-cp", `${classes}${delimiter}${jar}`, "com.enderdash.agent.replay.SceneFeatures", join(resolve(input), "packets.sbr")]);
    const expected = JSON.parse(stdout) as SceneFeatures;
    const auditFile = join(directory, "render-audit.json");
    const audit = existsSync(auditFile) ? JSON.parse(await readFile(auditFile, "utf8")) as RenderAudit : undefined;
    const failures = verifyRendering(expected, audit, clientLog, !!original.ids[12]);
    await writeFile(join(directory, "verification.json"), JSON.stringify({ transport: "pass", rendering: failures.length ? "fail" : "pass", failures, unregisteredActors: expected.unregisteredActorIdentifiers ?? [], expected }, null, 2), { mode: 0o600 });
    console.log("PASS offline scene transport: playable spawn, complete payloads, and Java resource pack load.");
    if (failures.length) {
      console.log(`Rendering checks: ${failures.join(" ")}`);
      if (!transportOnly) throw new Error("Rendering verification failed. Read the private verification report and client log.");
    } else console.log("PASS native rendering checks: recorded skins installed unchanged, native renderers selected, and no unresolved model or block errors.");
  }
}

Effect.runPromise(Effect.tryPromise({ try: main, catch: (cause) => cause instanceof Error ? cause : new Error(String(cause)) }))
  .catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
