import { execFile, spawn, type ChildProcess } from "node:child_process";
import { closeSync, existsSync, openSync } from "node:fs";
import { chmod, cp, mkdir, mkdtemp, readFile, readdir, readlink, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, join, resolve, delimiter } from "node:path";
import { createServer } from "node:net";
import { createSocket } from "node:dgram";
import { promisify } from "node:util";
import { Effect } from "effect";
import { root } from "../model.ts";
import { artifact } from "../client-artifacts.ts";
import { installModpack } from "../integration/modpack.ts";
import { configureShaders, graphicsFailures, installGraphicsProfile, readGraphicsLock, type GraphicsProfile } from "../integration/graphics.ts";
import { activeDisplay, displayEnv, stopDisplay } from "../lab/display.ts";
import { inspectJournal } from "./journal.ts";
import { prepareFormFixture } from "./form-fixture.ts";
import { prepareReplayPrismData, rebindReplayJavaConfig, validateReplayProfile } from "./java-profile.ts";
import { OwnedProcesses, requireOwnedSilentModule } from "./owned-processes.ts";
import { requireNativeOfflineReplay, requireNativeReplayProcessNamespaces, type NativeOfflineProof } from "./native-offline.ts";
import { prepareNativeReplayPrefix } from "./native-prefix.ts";
import { prepareNativeProfile } from "./native-profile.ts";
import { hasGameplayAcknowledgments, verifyRendering, type SceneFeatures, type RenderAudit, type ControllerAudit } from "./verification.ts";

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
let javaCleanup: OwnedProcesses | undefined;
let javaDisplayCleanup: OwnedProcesses | undefined;

function alive(pid?: number): boolean { if (!pid) return false; try { process.kill(pid, 0); return true; } catch { return false; } }
async function logText(path: string): Promise<string> { return existsSync(path) ? readFile(path, "utf8") : ""; }
function service(program: string, args: string[], cwd: string, log: string, env = process.env): ChildProcess {
  const fd = openSync(log, "wx", 0o600);
  const child = spawn(program, args, { cwd, env, detached: true, stdio: ["ignore", fd, fd] });
  closeSync(fd); children.push(child);
  if (javaCleanup && child.pid) javaCleanup.capture(child.pid);
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
async function buildPlugin(jar: string): Promise<{ classes: string; plugin: string; build: string; observer: string }> {
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
  const manifest = join(build, "controller-observer.mf");
  await writeFile(manifest, "Premain-Class: com.enderdash.agent.replay.ControllerAuditAgent\n", { mode: 0o600 });
  const observer = join(build, "controller-observer.jar");
  const observerClasses = (await readdir(join(classes, "com/enderdash/agent/replay"))).filter((name) =>
    name === "ControllerAuditAgent.class" || name.startsWith("ControllerAuditAgent$") || name.startsWith("PrivateFiles"));
  await execute("jar", ["--create", "--file", observer, "--manifest", manifest,
    ...observerClasses.flatMap((name) => ["-C", classes, `com/enderdash/agent/replay/${name}`])]);
  return { classes, plugin, build, observer };
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
    join(root, "src/replay/java/com/enderdash/agent/replay/PrivateFiles.java"),
    join(root, "src/replay/java/com/enderdash/agent/replay/PacketJournal.java"),
    join(root, "src/replay/java/com/enderdash/agent/replay/CameraPresetAudit.java"), ...files]);
  await writeFile(join(classes, "fabric.mod.json"), JSON.stringify({ schemaVersion: 1, id: "stackanvil_recorder", version: "1.0.0",
    name: "StackAnvil private replay recorder", environment: "client", mixins: ["stackanvil-recorder.mixins.json"],
    depends: { "viafabricplus-bedrock": "*" } }), { mode: 0o600 });
  await writeFile(join(classes, "stackanvil-recorder.mixins.json"), JSON.stringify({ required: true,
    package: "com.enderdash.agent.replay.fabric.mixin", compatibilityLevel: "JAVA_25", client: ["MixinPacketCodec", "MixinPlayerSkins", "MixinRenderStore", "MixinCustomEntity", "MixinCustomActorFrame", "MixinHeldItemLight", "MixinReplayCamera", "MixinPlayerFrame", "MixinMovementAudit"] }), { mode: 0o600 });
  const output = join(build, "fabric-recorder.jar");
  await execute("jar", ["--create", "--file", output, "-C", classes, "."]);
  return output;
}

async function launchJava(directory: string, address: string, client: "addon" | "proxy", recorder: string, graphics: GraphicsProfile, account?: string, guiScale?: number, softwareRendering = false): Promise<{ pid: number; log: string }> {
  const softwareIcd = "/usr/share/vulkan/icd.d/lvp_icd.x86_64.json";
  if (softwareRendering) {
    try {
      const { stdout } = await execute("flatpak", ["run", "--nodevice=all", "--command=cat", "org.prismlauncher.PrismLauncher", softwareIcd]);
      const manifest = JSON.parse(stdout) as { ICD?: { library_path?: unknown } };
      if (typeof manifest.ICD?.library_path !== "string" || !/(?:^|\/)libvulkan_lvp\.so(?:\.\d+)*$/.test(manifest.ICD.library_path)) {
        throw new Error("Unexpected software Vulkan driver.");
      }
    } catch {
      throw new Error("Software replay requires the readable lavapipe ICD in the Prism Flatpak runtime.");
    }
  }
  const existingDisplay = await activeDisplay();
  const isolated = await displayEnv(true);
  if (!isolated) throw new Error("The replay lab requires a private virtual display.");
  if (javaCleanup && !existingDisplay) {
    const owned = await activeDisplay();
    if (!owned) throw new Error("The owned Java display disappeared.");
    javaDisplayCleanup = new OwnedProcesses();
    for (const pid of [owned.pid, ...(owned.audioPid ? [owned.audioPid] : [])]) {
      javaDisplayCleanup.capture(pid);
      javaCleanup.exclude(pid);
    }
  }
  const sourceName = process.env.STACKANVIL_REPLAY_INSTANCE ?? "StackAnvil Integration 26.3";
  const source = join(prismData, "instances", sourceName);
  if (!existsSync(join(source, "instance.cfg"))) throw new Error("Prepare the integration Prism instance with bun run test:integration first.");
  await validateReplayProfile(source);
  const name = `Replay-${basename(directory)}`;
  const prism = join(directory, "prism");
  await mkdir(prism, { mode: 0o700 });
  await mkdir(join(prism, "logs"), { mode: 0o700 });
  await mkdir(join(prism, "instances"), { mode: 0o700 });
  await prepareReplayPrismData(prismData, prism);
  const globalCfg = join(prism, "prismlauncher.cfg");
  if (existsSync(globalCfg)) await rebindReplayJavaConfig(globalCfg, prismData, prism);
  const instance = join(prism, "instances", name);
  await mkdir(instance, { mode: 0o700 });
  for (const file of ["instance.cfg", "mmc-pack.json"]) await cp(join(source, file), join(instance, file));
  const cfgPath = join(instance, "instance.cfg");
  await rebindReplayJavaConfig(cfgPath, prismData, prism);
  if (address.startsWith("nethernet://")) {
    // Prism's host/port launcher option appends a Java port to URI addresses.
    const pack = JSON.parse(await readFile(join(instance, "mmc-pack.json"), "utf8")) as { components: { uid: string; version: string }[] };
    const minecraft = pack.components.find((component) => component.uid === "net.minecraft");
    if (!minecraft) throw new Error("The integration instance has no Minecraft component.");
    const component = JSON.parse(await readFile(join(prismData, "meta/net.minecraft", `${minecraft.version}.json`), "utf8"));
    component.minecraftArguments += ` --quickPlayMultiplayer ${address}`;
    await mkdir(join(instance, "patches"), { mode: 0o700 });
    await writeFile(join(instance, "patches/net.minecraft.json"), JSON.stringify(component), { mode: 0o600 });
  }
  const game = join(instance, "minecraft");
  await mkdir(game, { mode: 0o700 });
  for (const file of ["config", "options.txt"]) if (existsSync(join(source, "minecraft", file))) await cp(join(source, "minecraft", file), join(game, file), { recursive: true });
  if (guiScale !== undefined) {
    const optionsFile = join(game, "options.txt");
    let options = existsSync(optionsFile) ? await readFile(optionsFile, "utf8") : "";
    for (const [key, value] of [["guiScale", String(guiScale)], ["soundCategory_master", "0"], ["fullscreen", "false"]]) {
      const line = new RegExp(`^${key}:.*$`, "m");
      options = line.test(options) ? options.replace(line, `${key}:${value}`) : `${options.trimEnd()}\n${key}:${value}\n`;
    }
    await writeFile(optionsFile, options, { mode: 0o600 });
  }
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
  const managed: string[] = [];
  for (const project of ["viafabricplus", "viafabricplus-bedrock"]) {
    const file = await artifact(project);
    await cp(file, join(mods, basename(file)));
    managed.push(basename(file));
  }
  managed.push("stackanvil-recorder.jar");
  await writeFile(join(instance, ".stackanvil-managed"), JSON.stringify({ files: managed }), { mode: 0o600 });
  if (graphics === "shaders") await installGraphicsProfile(instance);
  else if (graphics === "optimized") {
    await installModpack(instance);
    await configureShaders(instance);
  }
  await writeFile(join(directory, "graphics-profile.json"), `${JSON.stringify({ profile: graphics,
    ...(graphics === "shaders" ? { lock: await readGraphicsLock() } : {}),
  }, null, 2)}\n`, { mode: 0o600 });
  await cp(recorder, join(mods, "stackanvil-recorder.jar"));
  await writeFile(join(game, "stackanvil-replay-directory.txt"), directory, { mode: 0o600 });
  const launcherLog = join(directory, "launcher.log");
  service("flatpak", ["run", "--nosocket=wayland", "--socket=x11", `--filesystem=${join(root, ".stackanvil/lab")}:ro`, `--filesystem=${directory}`,
    `--filesystem=${prismData}:ro`,
    ...(client === "addon" ? [`--filesystem=${join(privateRoot, "client-assets")}`] : []),
    `--env=DISPLAY=${isolated.DISPLAY}`, `--env=XAUTHORITY=${isolated.XAUTHORITY}`, "--env=WAYLAND_DISPLAY=", "--env=QT_QPA_PLATFORM=xcb",
    "--env=SDL_VIDEODRIVER=x11", "--env=SDL_VIDEO_DRIVER=x11", "--env=SDL_VIDEO_FORCE_EGL=1", "--env=PULSE_SINK=stackanvil_silent",
    ...(softwareRendering ? ["--nodevice=all", "--env=LIBGL_ALWAYS_SOFTWARE=1", "--env=GALLIUM_DRIVER=llvmpipe", "--env=MESA_LOADER_DRIVER_OVERRIDE=llvmpipe", `--env=VK_DRIVER_FILES=${softwareIcd}`] : []),
    "org.prismlauncher.PrismLauncher", "--dir", prism, "--launch", name,
    ...(address.startsWith("nethernet://") ? [] : ["--server", address])], root, launcherLog, isolated);
  const until = Date.now() + 60_000;
  while (Date.now() < until) {
    const { stdout } = await execute("ps", ["-eo", "pid=,args="], { maxBuffer: 8 * 1024 * 1024 });
    const line = stdout.split("\n").find((line) => line.includes("org.prismlauncher.EntryPoint") && line.includes(name));
    javaCleanup?.captureDescendants();
    if (line) {
      const pid = Number(line.trim().split(/\s/)[0]);
      if (basename(await readlink(`/proc/${pid}/exe`)) !== "java" || !javaCleanup?.owns(pid)) {
        throw new Error("Matching Java process is not a captured private launcher descendant.");
      }
      return { pid, log: join(game, "logs/latest.log") };
    }
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
  if (javaCleanup) {
    javaCleanup.captureDescendants();
    if (gamePid) javaCleanup.signal(gamePid, "SIGTERM");
    for (const identity of javaCleanup.all().toReversed()) javaCleanup.signal(identity.pid, "SIGTERM");
    const until = Date.now() + 15_000;
    while (Date.now() < until && javaCleanup.all().some(identity => javaCleanup!.alive(identity.pid))) await Bun.sleep(100);
    if (javaCleanup.all().some(identity => javaCleanup!.alive(identity.pid))) throw new Error("Owned Java processes did not stop normally; forced cleanup refused.");
    return;
  }
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
  // Native channel cleanup can wait up to 35 seconds for pending pack downloads.
  const until = Date.now() + (nativeClient ? 45_000 : 10_000);
  while (Date.now() < until && (alive(gamePid) || children.some((child) => alive(child.pid)))) await Bun.sleep(100);
  if (alive(gamePid)) process.kill(gamePid!, "SIGKILL");
  for (const child of children.toReversed()) if (alive(child.pid)) process.kill(-child.pid!, "SIGKILL");
}
async function main(): Promise<void> {
  const [mode, input, ...args] = Bun.argv.slice(2);
  if (mode === "--help" || mode === "help" || (mode === "form-fixture" && input === "--help")) {
    console.log(`Usage: bun run server-replay <record server|replay directory|inspect directory> [--seconds 120]
       bun run server-replay form-fixture /absolute/plan.json [--dry-run] [--verbose]
       bun run server-replay form-fixture /absolute/plan.json --apply --reviewed-preview <sha256> [--verbose]

Form fixtures combine a protocol-2193 bootstrap, captured form JSON, and declared decrypted packs.
The default is a read-only verbose preview. Apply creates a fresh private directory only.
Java replay options: --gui-scale 1..4 --software-rendering. Virtual display and zero audio remain enabled.`);
    return;
  }
  if (mode === "selftest") {
    const jar = await artifact("viaproxy");
    const { classes } = await buildPlugin(jar);
    for (const test of ["ReplaySelfTest", "NativeCaptureSelfTest", "PrivateFilesSelfTest"]) {
      const { stdout } = await execute("java", ["-cp", `${classes}${delimiter}${jar}`, `com.enderdash.agent.replay.${test}`]);
      console.log(stdout.trim());
    }
    return;
  }
  if (mode === "form-fixture" && input) {
    if (args.includes("--apply") && args.includes("--dry-run")) throw new Error("Choose --dry-run or --apply.");
    const known = new Set(["--apply", "--dry-run", "--verbose", "--reviewed-preview"]);
    for (let index = 0; index < args.length; index++) {
      if (!known.has(args[index]!)) throw new Error("Unknown form fixture option.");
      if (args[index] === "--reviewed-preview") index++;
    }
    const reviewedAt = args.indexOf("--reviewed-preview");
    const reviewed = reviewedAt < 0 ? undefined : args[reviewedAt + 1];
    if (args.includes("--apply") && (!reviewed || !/^[0-9a-f]{64}$/.test(reviewed))) {
      throw new Error("Fixture creation requires --apply --reviewed-preview <preview-sha256>.");
    }
    if (!args.includes("--apply") && reviewed !== undefined) throw new Error("--reviewed-preview requires --apply.");
    const preview = await Effect.runPromise(prepareFormFixture(resolve(input), privateRoot, args.includes("--apply") ? reviewed : undefined));
    console.log(JSON.stringify(preview, null, 2));
    return;
  }
  if (mode === "inspect" && input) { console.log(JSON.stringify(await inspectJournal(join(resolve(input), "packets.sbr")), null, 2)); return; }
  if (!input || (mode !== "record" && mode !== "replay")) throw new Error("Run bun run server-replay --help for recording, replay, and form-fixture usage.");
  const option = (name: string) => { const at = args.indexOf(name); return at < 0 ? undefined : args[at + 1]; };
  const seconds = Number(option("--seconds") ?? 120);
  const client = option("--client") ?? (mode === "replay" ? "addon" : "proxy");
  const transportOnly = args.includes("--transport-only");
  const guiScale = option("--gui-scale") === undefined ? undefined : Number(option("--gui-scale"));
  const softwareRendering = args.includes("--software-rendering");
  if (guiScale !== undefined && (!Number.isInteger(guiScale) || guiScale < 1 || guiScale > 4)) throw new Error("--gui-scale must be between 1 and 4.");
  if (client === "native" && (guiScale !== undefined || softwareRendering)) throw new Error("Java GUI/rendering options cannot change the native client guard.");
  const graphics = args.includes("--shaders") ? "shaders" : args.includes("--modpack") ? "optimized" : "plain";
  if (client === "native" && graphics !== "plain") throw new Error("--modpack and --shaders require a Java client.");
  if (client !== "addon" && client !== "proxy" && client !== "native") throw new Error("--client must be addon, proxy, or native.");
  if (client !== "native") javaCleanup = new OwnedProcesses();
  const nativeOffline = mode === "replay" && client === "native" ? await requireNativeOfflineReplay() : undefined;
  if (!Number.isInteger(seconds) || seconds < 20 || seconds > 300) throw new Error("--seconds must be between 20 and 300.");
  if (mode === "record" && input === "hive" && client !== "native" && !args.includes("--allow-hive")) throw new Error("ViaBedrock blacklists The Hive because translated clients can be banned. Use an official client capture, or explicitly pass --allow-hive for this diagnostic join.");
  let target = servers[input as keyof typeof servers];
  if (mode === "record" && input !== "local" && option("--target")) throw new Error("--target requires record local. Named servers use their configured address.");
  if (mode === "record" && input === "local") {
    target = option("--target")!;
    if (!/^(?:nethernet:\/\/)?127\.0\.0\.1:\d+$/.test(target ?? "")) throw new Error("Local recordings require --target 127.0.0.1:port or nethernet://127.0.0.1:port.");
  } else if (mode === "record" && !target) throw new Error("Unknown server.");
  const jar = await artifact("viaproxy");
  await mkdir(privateRoot, { recursive: true, mode: 0o700 });
  await chmod(privateRoot, 0o700);
  const { classes, plugin, build, observer } = await buildPlugin(jar);
  const recorder = client !== "native" ? await buildFabricRecorder(jar, build) : "";
  const directory = join(privateRoot, `${new Date().toISOString().replaceAll(":", "-")}-${mode}-${mode === "record" ? input : "scene"}`);
  await mkdir(directory, { mode: 0o700 });
  const proxyHome = join(directory, "proxy");
  await mkdir(proxyHome, { mode: 0o700 });
  await writeFile(join(proxyHome, "viabedrock.yml"), `blob-cache: disabled\npack-cache: disabled\ntranslate-resource-packs: true\ndisable-server-blacklist: ${input === "hive" && args.includes("--allow-hive")}\n`, { mode: 0o600 });
  await mkdir(join(proxyHome, "plugins"), { mode: 0o700 });
  await writeFile(join(proxyHome, "plugins/recorder.jar"), await readFile(plugin), { mode: 0o600 });
  if (mode === "record") {
    if (client === "proxy" && (input !== "local" || option("--account"))) {
      const authPath = resolve(option("--account") ?? process.env.STACKANVIL_BEDROCK_ACCOUNT ?? accountDefault);
      const auth = JSON.parse(await readFile(authPath, "utf8"));
      auth.accountType = "net.raphimc.viaproxy.saves.impl.accounts.BedrockAccount";
      await writeFile(join(proxyHome, "saves.json"), JSON.stringify({ accountsV4: [auth] }), { mode: 0o600 });
    }
  }
  const ownedDisplay = !await activeDisplay();
  let gamePid: number | undefined;
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
    }
    const bind = client === "addon" ? undefined : await port(client === "native");
    const proxyLog = join(directory, "proxy.log");
    let child: ChildProcess | undefined;
    if (client === "proxy") {
      child = service("java", [...(mode === "replay" ? [`-javaagent:${observer}=${join(directory, "controller-audit.json")}`] : []), "-DskipUpdateCheck", `-Dstackanvil.recording=${directory}`, "-jar", jar, "cli", "--bind-address", `127.0.0.1:${bind}`,
        "--target-address", target!, "--target-version", "Bedrock 1.26.51", "--auth-method", mode === "record" && (input !== "local" || option("--account")) ? "ACCOUNT" : "NONE", "--minecraft-account-index", "0", "--log-ips", "false"], proxyHome, proxyLog);
      await ready(child, proxyLog, /ViaProxy started successfully/);
    } else if (client === "native") {
      const netherNet = target!.startsWith("nethernet://");
      const destination = netherNet ? target!.slice("nethernet://".length) : target!;
      const separator = destination.lastIndexOf(":");
      const account = mode === "replay" || (input === "local" && !option("--account")) ? "offline" : resolve(option("--account") ?? process.env.STACKANVIL_BEDROCK_ACCOUNT ?? accountDefault);
      child = service("java", [`-Dlog4j2.configurationFile=${join(build, "log4j2.xml")}`, "-cp", `${classes}${delimiter}${jar}`,
        "com.enderdash.agent.replay.NativeCaptureProxy", directory, String(bind), destination.slice(0, separator), destination.slice(separator + 1), account, ...(netherNet ? ["--nethernet"] : [])], directory, proxyLog);
      await ready(child, proxyLog, /StackAnvil native capture ready/);
    }
    const assetAccount = client === "addon" ? option("--account")
      ?? (mode === "record" && input !== "local" ? process.env.STACKANVIL_BEDROCK_ACCOUNT ?? accountDefault : undefined) : undefined;
    const game = client === "native"
      ? await launchNative(directory, bind!, option("--native-home"), mode === "replay" || args.includes("--native-manual-connect"), nativeOffline)
      : await launchJava(directory, client === "addon" ? target! : `127.0.0.1:${bind}`, client, recorder, graphics, assetAccount ? resolve(assetAccount) : undefined, guiScale, softwareRendering);
    gamePid = game.pid;
    console.log(`Private ${mode} session: ${directory}`);
    // Keep connection setup separate from the requested gameplay scene.
    let waitingForNativeConnection = client === "native";
    let waitingForAddonSpawn = client === "addon";
    let until = Date.now() + (waitingForNativeConnection ? 300_000 : waitingForAddonSpawn ? 1_200_000 : seconds * 1000);
    while (!stopped && Date.now() < until && alive(gamePid) && (!child || alive(child.pid))) {
      javaCleanup?.captureDescendants();
      if (waitingForNativeConnection && existsSync(join(directory, "packets.sbr"))) {
        waitingForNativeConnection = false;
        until = Date.now() + seconds * 1000;
        console.log(`Native connection observed; capturing the full ${seconds}-second scene.`);
      }
      if (waitingForAddonSpawn && existsSync(join(directory, "gameplay-ready"))) {
        waitingForAddonSpawn = false;
        until = Date.now() + seconds * 1000;
        console.log(`Add-on gameplay observed; capturing the full ${seconds}-second scene.`);
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
    if (javaCleanup) await writeFile(join(directory, "process-ownership.json"), JSON.stringify({
      java: javaCleanup.all(), display: javaDisplayCleanup?.all() ?? [],
    }, null, 2), { mode: 0o600 });
    await stopAll(gamePid);
    if (ownedDisplay) await stopDisplay(javaDisplayCleanup ? {
      process: pid => {
        if (!javaDisplayCleanup!.alive(pid)) throw new Error("Owned display process exited before teardown.");
      },
      audioModule: async id => {
        const { stdout } = await execute("pactl", ["list", "modules", "short"]);
        requireOwnedSilentModule(stdout, id);
      },
    } : undefined);
    process.off("SIGINT", abort); process.off("SIGTERM", abort);
    // Proxy libraries write their own saves with default permissions.
    for (const name of ["saves.json", "viaproxy.yml"]) if (existsSync(join(proxyHome, name))) await chmod(join(proxyHome, name), 0o600);
  }
  if (client === "native" && /Native connection failed:|Native capture failed:/.test(await logText(join(directory, "proxy.log")))) throw new Error("The native recorder failed. Read its private proxy log; this capture is incomplete.");
  if (client === "native" && /Native pack observation failed:/.test(await logText(join(directory, "proxy.log")))) throw new Error("Native pack reconstruction failed. The raw recording is preserved for offline repair; read its private proxy log.");
  if (client === "native" && !/StackAnvil native pack observation complete/.test(await logText(join(directory, "proxy.log")))) throw new Error("Native pack reconstruction did not finish before shutdown. The raw recording is preserved; read its private proxy log.");
  if (unexpectedClientExit || stopped) throw new Error("The client exited or the run was cancelled before normal cleanup. Read its private client log.");
  if (/Client disconnected with reason:|Failed to handle packet|ReadTimeoutException|(?:Unreported|Reported) exception thrown!|A fatal error has been detected by the Java Runtime Environment|Mixin transformation .* failed|handlerAdded\(\) has thrown/.test(await logText(join(directory, "client.log")))) {
    throw new Error("The client disconnected or failed during the captured session. Read its private client log.");
  }
  if (mode === "record" && graphics === "shaders") {
    const failures = graphicsFailures(await logText(join(directory, "client.log")), (await readGraphicsLock()).shader.filename);
    if (failures.length) throw new Error(`${failures.join(" ")} Read the private client log.`);
  }
  if (!existsSync(join(directory, "packets.sbr"))) throw new Error("The client produced no packet journal. Read its private client and server logs.");
  const summary = await inspectJournal(join(directory, "packets.sbr"));
  await writeFile(join(directory, "manifest.json"), `${JSON.stringify({ schema: 1, mode, client, graphics, server: mode === "record" ? input : undefined, capturedAt: new Date().toISOString(), summary }, null, 2)}\n`, { mode: 0o600 });
  console.log(JSON.stringify(summary, null, 2));
  console.log(`Saved private ${mode} artifacts: ${directory}`);
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
    const controllerFile = join(directory, "controller-audit.json");
    const controllerAudit = client === "proxy" && existsSync(controllerFile)
      ? JSON.parse(await readFile(controllerFile, "utf8")) as ControllerAudit : undefined;
    const evaluationLog = client === "proxy" ? `${clientLog}\n${await logText(join(directory, "proxy.log"))}` : clientLog;
    const failures = [...verifyRendering(expected, audit, evaluationLog, !!original.ids[12], { required: client === "proxy", audit: controllerAudit }),
      ...graphicsFailures(clientLog, graphics === "shaders" ? (await readGraphicsLock()).shader.filename : undefined)];
    await writeFile(join(directory, "verification.json"), JSON.stringify({ transport: "pass", rendering: failures.length ? "fail" : "pass", failures, unregisteredActors: expected.unregisteredActorIdentifiers ?? [], expected, controllerAudit }, null, 2), { mode: 0o600 });
    console.log("PASS offline scene transport: playable spawn, complete payloads, and Java resource pack load.");
    if (failures.length) {
      console.log(`Rendering checks: ${failures.join(" ")}`);
      if (!transportOnly) throw new Error("Rendering verification failed. Read the private verification report and client log.");
    } else console.log("PASS native rendering checks: recorded skins installed unchanged, native renderers selected, and no unresolved model or block errors.");
  }
}

Effect.runPromise(Effect.tryPromise({ try: main, catch: (cause) => cause instanceof Error ? cause : new Error(String(cause)) }))
  .catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
