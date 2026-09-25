import { execFile, spawn } from "node:child_process";
import { closeSync, existsSync, lstatSync, openSync } from "node:fs";
import { chmod, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { promisify } from "node:util";
import { Effect } from "effect";
import { root } from "../model.ts";
import { installPrism } from "../prism.ts";
import { activeDisplay, displayEnv, ensureDisplay, stopDisplay } from "./display.ts";

const execute = promisify(execFile);
const privateRoot = join(root, ".stackanvil", "lab");
const processFile = join(privateRoot, "processes.json");
const serverHome = resolve(process.env.BEDROCK_SERVER_HOME ?? join(homedir(), "bedrock-server"));
const viaProxyJar = resolve(process.env.VIAPROXY_JAR ?? join(root, ".stackanvil", "tools", "ViaProxy.jar"));
const bedrockHome = resolve(process.env.BEDROCK_ON_LINUX_HOME ?? join(homedir(), ".local", "share", "bedrock-on-linux"));
const prismHome = join(homedir(), ".var", "app", "org.prismlauncher.PrismLauncher", "data", "PrismLauncher", "instances");
const javaInstance = process.env.STACKANVIL_JAVA_INSTANCE ?? "StackAnvil 26.3";

type Service = "server" | "viaproxy" | "java";
type Managed = Partial<Record<Service, { pid: number; startedAt: string; command: string }>>;

function alive(pid: number): boolean {
  try { process.kill(pid, 0); return true; } catch { return false; }
}

function groupAlive(pid: number): boolean {
  try { process.kill(-pid, 0); return true; } catch { return false; }
}

async function managed(): Promise<Managed> {
  if (!existsSync(processFile)) return {};
  return JSON.parse(await readFile(processFile, "utf8")) as Managed;
}

async function save(entries: Managed): Promise<void> {
  await mkdir(privateRoot, { recursive: true, mode: 0o700 });
  await writeFile(processFile, `${JSON.stringify(entries, null, 2)}\n`, { mode: 0o600 });
}

async function matchingProcesses(service: Service): Promise<number[]> {
  const output = await execute("ps", ["-eo", "pid=,args="], { maxBuffer: 4 * 1024 * 1024 });
  const pattern = service === "server" ? /(?:^|\s)(?:\.\/|[^ ]*\/)bedrock_server(?:\s|$)/
    : service === "viaproxy" ? /\bViaProxy(?:-[^ ]*)?\.jar\b.*\bcli\b/
      : /^\S*java(?:\s|$).*\borg\.prismlauncher\.EntryPoint\b/;
  return output.stdout.split("\n").flatMap((line) => {
    const found = /^\s*(\d+)\s+(.+)$/.exec(line);
    return found && pattern.test(found[2]!) ? [Number(found[1])] : [];
  });
}

function serviceCommand(service: Service): { program: string; args: string[]; cwd: string; env?: NodeJS.ProcessEnv } {
  if (service === "server") {
    const program = join(serverHome, "bedrock_server");
    if (!existsSync(program)) throw new Error(`Bedrock server missing: ${program}`);
    return { program, args: [], cwd: serverHome, env: { ...process.env, LD_LIBRARY_PATH: serverHome } };
  }
  if (service === "viaproxy") {
    if (!existsSync(viaProxyJar)) throw new Error(`ViaProxy JAR missing: ${viaProxyJar}. Run bun run dev:setup.`);
    return {
      program: Bun.which("java") ?? "java",
      args: ["-DskipUpdateCheck", "-jar", viaProxyJar, "cli", "--bind-address", process.env.STACKANVIL_VIAPROXY_BIND ?? "127.0.0.1:25568",
        "--target-address", process.env.STACKANVIL_BEDROCK_TARGET ?? "127.0.0.1:19132", "--target-version",
        process.env.STACKANVIL_BEDROCK_VERSION ?? "Bedrock 1.26.51", "--auth-method", process.env.STACKANVIL_VIAPROXY_AUTH ?? "NONE", "--log-ips", "false"],
      cwd: root,
    };
  }
  if (!existsSync(join(prismHome, javaInstance, "instance.cfg"))) {
    throw new Error(`Prism instance missing: ${javaInstance}. Set STACKANVIL_JAVA_INSTANCE.`);
  }
  if (!Bun.which("flatpak")) throw new Error("Flatpak is required to launch the PrismLauncher instance.");
  return { program: "flatpak", args: ["run", "--env=SDL_VIDEODRIVER=x11", "org.prismlauncher.PrismLauncher", "--launch", javaInstance,
    "--server", process.env.STACKANVIL_JAVA_SERVER ?? "127.0.0.1:25568"], cwd: root };
}

async function start(service: Service): Promise<void> {
  const entries = await managed();
  if (entries[service] && groupAlive(entries[service].pid)) {
    console.log(`${service} is already running under this lab (PID ${entries[service].pid}).`);
    return;
  }
  const external = await matchingProcesses(service);
  if (external.length) {
    console.log(`${service} is already running outside this lab (PID ${external.join(", ")}). It will not be restarted or stopped by the lab.`);
    return;
  }
  if (service === "java") console.log(`Prepared Prism instance: ${await installPrism()}`);
  const command = serviceCommand(service);
  const isolated = service === "java" ? await displayEnv(true) : undefined;
  if (service === "java" && isolated) {
    command.args.splice(1, 0, `--filesystem=${join(privateRoot)}:ro`, `--env=DISPLAY=${isolated.DISPLAY}`,
      `--env=XAUTHORITY=${isolated.XAUTHORITY}`, "--env=WAYLAND_DISPLAY=", "--env=PULSE_SINK=stackanvil_silent");
    command.env = isolated;
  }
  if (service === "java" && !isolated && process.env.STACKANVIL_USE_DESKTOP !== "1") {
    throw new Error("A virtual display is required before launching Java.");
  }
  await mkdir(privateRoot, { recursive: true, mode: 0o700 });
  const log = openSync(join(privateRoot, `${service}.log`), "a", 0o600);
  const child = spawn(command.program, command.args, {
    cwd: command.cwd, env: command.env ?? process.env, detached: true, stdio: ["ignore", log, log],
  });
  closeSync(log);
  child.unref();
  if (!child.pid) throw new Error(`Could not start ${service}.`);
  await Bun.sleep(1500);
  if (!alive(child.pid)) throw new Error(`${service} exited. Read the private ${service}.log.`);
  entries[service] = { pid: child.pid, startedAt: new Date().toISOString(), command: command.program };
  await save(entries);
  console.log(`Started ${service} (PID ${child.pid}).`);
}

async function stop(service: Service): Promise<void> {
  const entries = await managed();
  const entry = entries[service];
  if (!entry || !groupAlive(entry.pid)) { console.log(`${service} is not running under this lab.`); delete entries[service]; await save(entries); return; }
  process.kill(-entry.pid, "SIGINT");
  for (let i = 0; i < 40 && groupAlive(entry.pid); i++) await Bun.sleep(250);
  if (groupAlive(entry.pid)) throw new Error(`${service} did not stop. Process group ${entry.pid} was left running.`);
  delete entries[service];
  await save(entries);
  console.log(`Stopped ${service}.`);
}

async function status(): Promise<void> {
  const display = await activeDisplay();
  console.log(`display: ${display ? `isolated ${display.display} (PID ${display.pid})` : "stopped"}`);
  const entries = await managed();
  for (const service of ["server", "viaproxy", "java"] as const) {
    const entry = entries[service];
    const external = await matchingProcesses(service);
    console.log(`${service}: ${entry && groupAlive(entry.pid) ? `managed process group ${entry.pid}` : external.length ? `external PID ${external.join(", ")}` : "stopped"}`);
  }
}

const credentialFiles = ["msa/token.json", "winegdk-preauth/device.json", "winegdk-preauth/device-key.pem"];

async function snapshotCredentials(): Promise<void> {
  const destination = join(privateRoot, "credentials", "bedrock-on-linux");
  await mkdir(destination, { recursive: true, mode: 0o700 });
  await chmod(destination, 0o700);
  const copied: string[] = [];
  for (const file of credentialFiles) {
    const source = join(bedrockHome, file);
    if (!existsSync(source)) continue;
    if (!lstatSync(source).isFile()) throw new Error(`Credential source must be a regular file: ${file}`);
    const target = join(destination, file);
    await mkdir(dirname(target), { recursive: true, mode: 0o700 });
    await chmod(dirname(target), 0o700);
    await copyFile(source, target);
    await chmod(target, 0o600);
    copied.push(file);
  }
  if (!copied.length) throw new Error(`No known BedrockOnLinux credential files found under ${bedrockHome}.`);
  console.log(`Copied ${copied.length} credential files to ignored private directory ${destination}. File contents were not displayed.`);
}

async function jvm(args: string[]): Promise<void> {
  const [action, pidText, third] = args;
  if (action === "list") {
    const { stdout } = await execute("jcmd", ["-l"]);
    console.log(stdout.trimEnd());
    return;
  }
  const pid = Number(pidText);
  if (!Number.isInteger(pid) || pid <= 0 || !alive(pid)) throw new Error("Supply a running local JVM PID.");
  let command: string[];
  switch (action) {
    case "threads": command = ["Thread.print", "-l"]; break;
    case "properties": command = ["VM.system_properties"]; break;
    case "jfr-start": command = ["JFR.start", `name=stackanvil-${pid}`, "settings=profile", `filename=${join(privateRoot, `jfr-${pid}.jfr`)}`]; break;
    case "jfr-dump": command = ["JFR.dump", `name=stackanvil-${pid}`, `filename=${join(privateRoot, `jfr-${pid}.jfr`)}`]; break;
    case "jfr-stop": command = ["JFR.stop", `name=stackanvil-${pid}`]; break;
    case "agent":
      if (!third || !existsSync(resolve(third))) throw new Error("Supply an existing local agent JAR.");
      await mkdir(join(privateRoot, "agent-attach"), { recursive: true, mode: 0o700 });
      await execute("javac", ["--add-modules", "jdk.attach", "-d", join(privateRoot, "agent-attach"),
        join(root, "src", "lab", "AttachAgent.java")]);
      await execute("java", ["--add-modules", "jdk.attach", "-cp", join(privateRoot, "agent-attach"),
        "AttachAgent", String(pid), resolve(third)]);
      console.log(`Attached Java agent to PID ${pid}.`);
      return;
    case "native-agent":
      if (!third || !existsSync(resolve(third))) throw new Error("Supply an existing local JVMTI library.");
      command = ["JVMTI.agent_load", resolve(third)];
      break;
    default: throw new Error("Usage: bun run lab jvm <list|threads|properties|jfr-start|jfr-dump|jfr-stop|agent|native-agent> [pid] [agent file]");
  }
  await mkdir(privateRoot, { recursive: true, mode: 0o700 });
  const { stdout, stderr } = await execute("jcmd", [String(pid), ...command], { maxBuffer: 32 * 1024 * 1024 });
  if (action === "properties" || action === "threads") {
    const file = join(privateRoot, `${action}-${pid}-${Date.now()}.txt`);
    await writeFile(file, stdout + stderr, { mode: 0o600 });
    console.log(`Private JVM diagnostic: ${file}`);
  } else console.log((stdout + stderr).trimEnd());
}

async function doctor(): Promise<void> {
  console.log(JSON.stringify({ server: existsSync(join(serverHome, "bedrock_server")) ? serverHome : "missing",
    viaProxy: existsSync(viaProxyJar) ? viaProxyJar : "missing",
    bedrockOnLinux: existsSync(bedrockHome) ? bedrockHome : "missing",
    prismInstance: existsSync(join(prismHome, javaInstance, "instance.cfg")) ? javaInstance : "missing",
    jcmd: Bun.which("jcmd") ?? "missing", xauth: Bun.which("xauth") ?? "missing",
    pactl: Bun.which("pactl") ?? "missing",
    xvfb: Bun.which("Xvfb") ?? (existsSync(join(root, ".stackanvil", "tools", "xvfb-root", "usr", "bin", "Xvfb")) ? "private install" : "missing"),
    capture: existsSync(join(root, "src", "capture", "cli.ts")) ? "available" : "missing" }, null, 2));
  await status();
}

async function main(): Promise<void> {
  const [command, action, ...rest] = Bun.argv.slice(2);
  if (command === "doctor") return doctor();
  if (command === "status") return status();
  if (command === "display" && action === "start") { console.log(await ensureDisplay()); return; }
  if (command === "display" && action === "stop") return stopDisplay();
  if (command === "credentials" && action === "snapshot") return snapshotCredentials();
  if (command === "java" && action === "prepare") { console.log(await installPrism()); return; }
  if (command === "jvm" && action) return jvm([action, ...rest]);
  if (["server", "viaproxy", "java"].includes(command ?? "") && (action === "start" || action === "stop")) {
    return action === "start" ? start(command as Service) : stop(command as Service);
  }
  if (command === "up") {
    if (process.env.STACKANVIL_USE_DESKTOP !== "1") await ensureDisplay();
    for (const service of ["server", "viaproxy", "java"] as const) await start(service);
    return;
  }
  if (command === "down") {
    for (const service of ["java", "viaproxy", "server"] as const) await stop(service);
    if (process.env.STACKANVIL_USE_DESKTOP !== "1") await stopDisplay();
    return;
  }
  throw new Error("Usage: bun run lab <doctor|status|credentials snapshot|server start|viaproxy start|java start|up|down|jvm ...>");
}

Effect.runPromise(Effect.tryPromise({ try: main, catch: (cause) => cause instanceof Error ? cause : new Error(String(cause)) }))
  .catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
