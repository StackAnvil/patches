import { labExecute, labIO, labValue, labError, runLabCommand } from "../lab/effect-runtime.ts";
import { spawn } from "node:child_process";
import { closeSync, existsSync, lstatSync, openSync } from "node:fs";
import { chmod, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { Effect } from "effect";
import { root } from "../model.ts";
import { artifact } from "../client-artifacts.ts";
import { installPrism } from "../prism.ts";
import { activeDisplay, displayEnv, ensureDisplay, stopDisplay } from "./display.ts";
import { vmMain } from "./vm.ts";
const privateRoot = join(root, ".stackanvil", "lab");
const processFile = join(privateRoot, "processes.json");
const serverHome = resolve(process.env.BEDROCK_SERVER_HOME ?? join(homedir(), "bedrock-server"));
const bedrockHome = resolve(
  process.env.BEDROCK_ON_LINUX_HOME ?? join(homedir(), ".local", "share", "bedrock-on-linux"),
);
const prismHome = join(
  homedir(),
  ".var",
  "app",
  "org.prismlauncher.PrismLauncher",
  "data",
  "PrismLauncher",
  "instances",
);
const javaInstance = process.env.STACKANVIL_JAVA_INSTANCE ?? "StackAnvil 26.3";
type Service = "server" | "viaproxy" | "java";
type Managed = Partial<
  Record<
    Service,
    {
      pid: number;
      startedAt: string;
      command: string;
    }
  >
>;
function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
function groupAlive(pid: number): boolean {
  try {
    process.kill(-pid, 0);
    return true;
  } catch {
    return false;
  }
}
const managedEffect = Effect.fn("Lab.managed")(function* () {
  if (!existsSync(processFile)) return {};
  return JSON.parse(yield* labIO("managed", async () => readFile(processFile, "utf8"))) as Managed;
});
const saveEffect = Effect.fn("Lab.save")(function* (entries: Managed) {
  yield* labIO("save", async () => mkdir(privateRoot, { recursive: true, mode: 0o700 }));
  yield* labIO("save", async () =>
    writeFile(processFile, `${JSON.stringify(entries, null, 2)}\n`, { mode: 0o600 }),
  );
}, Effect.uninterruptible);
const matchingProcessesEffect = Effect.fn("Lab.matchingProcesses")(function* (service: Service) {
  const output = yield* labExecute("ps", ["-eo", "pid=,args="], { maxBuffer: 4 * 1024 * 1024 });
  const pattern =
    service === "server"
      ? /(?:^|\s)(?:\.\/|[^ ]*\/)bedrock_server(?:\s|$)/
      : service === "viaproxy"
        ? /\bViaProxy(?:-[^ ]*)?\.jar\b.*\bcli\b/
        : /^\S*java(?:\s|$).*\borg\.prismlauncher\.EntryPoint\b/;
  return output.stdout.split("\n").flatMap((line) => {
    const found = /^\s*(\d+)\s+(.+)$/.exec(line);
    return found && pattern.test(found[2]!) ? [Number(found[1])] : [];
  });
});
const viaProxyJarEffect = Effect.fn("Lab.viaProxyJar")(function* () {
  const configured = process.env.VIAPROXY_JAR;
  return configured ? resolve(configured) : yield* labIO("viaProxyJar", () => artifact("viaproxy"));
});
const serviceCommandEffect = Effect.fn("Lab.serviceCommand")(function* (
  service: Service,
): Effect.fn.Return<
  {
    program: string;
    args: string[];
    cwd: string;
    env?: NodeJS.ProcessEnv;
  },
  import("./effect-runtime.ts").LabError
> {
  if (service === "server") {
    const program = join(serverHome, "bedrock_server");
    if (!existsSync(program))
      return yield* labError("serviceCommand", new Error(`Bedrock server missing: ${program}`));
    return {
      program,
      args: [],
      cwd: serverHome,
      env: { ...process.env, LD_LIBRARY_PATH: serverHome },
    };
  }
  if (service === "viaproxy") {
    const jar = yield* viaProxyJarEffect();
    if (!existsSync(jar))
      return yield* labError(
        "serviceCommand",
        new Error(`ViaProxy JAR missing: ${jar}. Run bun run build viaproxy.`),
      );
    return {
      program: Bun.which("java") ?? "java",
      args: [
        "-DskipUpdateCheck",
        "-jar",
        jar,
        "cli",
        "--bind-address",
        process.env.STACKANVIL_VIAPROXY_BIND ?? "127.0.0.1:25568",
        "--target-address",
        process.env.STACKANVIL_BEDROCK_TARGET ?? "127.0.0.1:19132",
        "--target-version",
        process.env.STACKANVIL_BEDROCK_VERSION ?? "Bedrock 1.26.51",
        "--auth-method",
        process.env.STACKANVIL_VIAPROXY_AUTH ?? "NONE",
        "--log-ips",
        "false",
      ],
      cwd: root,
    };
  }
  if (!existsSync(join(prismHome, javaInstance, "instance.cfg"))) {
    return yield* labError(
      "serviceCommand",
      new Error(`Prism instance missing: ${javaInstance}. Set STACKANVIL_JAVA_INSTANCE.`),
    );
  }
  if (!Bun.which("flatpak"))
    return yield* labError(
      "serviceCommand",
      new Error("Flatpak is required to launch the PrismLauncher instance."),
    );
  return {
    program: "flatpak",
    args: [
      "run",
      "--env=SDL_VIDEODRIVER=x11",
      "org.prismlauncher.PrismLauncher",
      "--launch",
      javaInstance,
      "--server",
      process.env.STACKANVIL_JAVA_SERVER ?? "127.0.0.1:25568",
    ],
    cwd: root,
  };
});
const startEffect = Effect.fn("Lab.start")(function* (service: Service) {
  const entries = yield* managedEffect();
  if (entries[service] && groupAlive(entries[service].pid)) {
    console.log(`${service} is already running under this lab (PID ${entries[service].pid}).`);
    return;
  }
  const external = yield* matchingProcessesEffect(service);
  if (external.length) {
    console.log(
      `${service} is already running outside this lab (PID ${external.join(", ")}). It will not be restarted or stopped by the lab.`,
    );
    return;
  }
  if (service === "java")
    console.log(`Prepared Prism instance: ${yield* labIO("start", async () => installPrism())}`);
  const command = yield* serviceCommandEffect(service);
  const isolated =
    service === "java" ? yield* labIO("start", async () => displayEnv(true)) : undefined;
  if (service === "java" && isolated) {
    command.args.splice(
      1,
      0,
      `--filesystem=${join(privateRoot)}:ro`,
      `--env=DISPLAY=${isolated.DISPLAY}`,
      `--env=XAUTHORITY=${isolated.XAUTHORITY}`,
      "--env=WAYLAND_DISPLAY=",
      "--env=PULSE_SINK=stackanvil_silent",
    );
    command.env = isolated;
  }
  if (service === "java" && !isolated && process.env.STACKANVIL_USE_DESKTOP !== "1") {
    return yield* labError(
      "start",
      new Error("A virtual display is required before launching Java."),
    );
  }
  yield* labIO("start", async () => mkdir(privateRoot, { recursive: true, mode: 0o700 }));
  let retained = false;
  // A successful registry write transfers ownership to the persistent lab.
  return yield* Effect.acquireUseRelease(
    labValue("start service", () => {
      const log = openSync(join(privateRoot, `${service}.log`), "a", 0o600);
      try {
        const child = spawn(command.program, command.args, {
          cwd: command.cwd,
          env: command.env ?? process.env,
          detached: true,
          stdio: ["ignore", log, log],
        });
        child.on("error", () => {});
        return child;
      } finally {
        closeSync(log);
      }
    }),
    (child) =>
      Effect.gen(function* () {
        child.unref();
        if (!child.pid) return yield* labError("start", new Error(`Could not start ${service}.`));
        yield* Effect.sleep(1500);
        if (!alive(child.pid))
          return yield* labError(
            "start",
            new Error(`${service} exited. Read the private ${service}.log.`),
          );
        entries[service] = {
          pid: child.pid,
          startedAt: new Date().toISOString(),
          command: command.program,
        };
        yield* saveEffect(entries);
        retained = true;
        console.log(`Started ${service} (PID ${child.pid}).`);
      }),
    (child) =>
      retained || !child.pid
        ? Effect.void
        : Effect.gen(function* () {
            const pid = child.pid!;
            yield* labValue("stop unrecorded service", () => {
              if (groupAlive(pid)) process.kill(-pid, "SIGINT");
            });
            for (let attempt = 0; attempt < 40 && groupAlive(pid); attempt++)
              yield* Effect.sleep(250);
            if (groupAlive(pid))
              return yield* labError(
                "stop unrecorded service",
                new Error(`Unrecorded service process group ${pid} remains alive.`),
              );
          }).pipe(Effect.orDie),
  );
});
const stopEffect = Effect.fn("Lab.stop")(function* (service: Service) {
  const entries = yield* managedEffect();
  const entry = entries[service];
  if (!entry || !groupAlive(entry.pid)) {
    console.log(`${service} is not running under this lab.`);
    delete entries[service];
    yield* saveEffect(entries);
    return;
  }
  process.kill(-entry.pid, "SIGINT");
  for (let i = 0; i < 40 && groupAlive(entry.pid); i++) yield* Effect.sleep(250);
  if (groupAlive(entry.pid))
    return yield* labError(
      "stop",
      new Error(`${service} did not stop. Process group ${entry.pid} was left running.`),
    );
  delete entries[service];
  yield* saveEffect(entries);
  console.log(`Stopped ${service}.`);
}, Effect.uninterruptible);
const statusEffect = Effect.fn("Lab.status")(function* () {
  const display = yield* labIO("status", async () => activeDisplay());
  console.log(
    `display: ${display ? `isolated ${display.display} (PID ${display.pid})` : "stopped"}`,
  );
  const entries = yield* managedEffect();
  for (const service of ["server", "viaproxy", "java"] as const) {
    const entry = entries[service];
    const external = yield* matchingProcessesEffect(service);
    console.log(
      `${service}: ${entry && groupAlive(entry.pid) ? `managed process group ${entry.pid}` : external.length ? `external PID ${external.join(", ")}` : "stopped"}`,
    );
  }
});
const credentialFiles = [
  "msa/token.json",
  "winegdk-preauth/device.json",
  "winegdk-preauth/device-key.pem",
];
const snapshotCredentialsEffect = Effect.fn("Lab.snapshotCredentials")(function* () {
  const destination = join(privateRoot, "credentials", "bedrock-on-linux");
  yield* labIO("snapshotCredentials", async () =>
    mkdir(destination, { recursive: true, mode: 0o700 }),
  );
  yield* labIO("snapshotCredentials", async () => chmod(destination, 0o700));
  const copied: string[] = [];
  for (const file of credentialFiles) {
    const source = join(bedrockHome, file);
    if (!existsSync(source)) continue;
    if (!lstatSync(source).isFile())
      return yield* labError(
        "snapshotCredentials",
        new Error(`Credential source must be a regular file: ${file}`),
      );
    const target = join(destination, file);
    yield* labIO("snapshotCredentials", async () =>
      mkdir(dirname(target), { recursive: true, mode: 0o700 }),
    );
    yield* labIO("snapshotCredentials", async () => chmod(dirname(target), 0o700));
    yield* labIO("snapshotCredentials", async () => copyFile(source, target));
    yield* labIO("snapshotCredentials", async () => chmod(target, 0o600));
    copied.push(file);
  }
  if (!copied.length)
    return yield* labError(
      "snapshotCredentials",
      new Error(`No known BedrockOnLinux credential files found under ${bedrockHome}.`),
    );
  console.log(
    `Copied ${copied.length} credential files to ignored private directory ${destination}. File contents were not displayed.`,
  );
});
const jvmEffect = Effect.fn("Lab.jvm")(function* (args: string[]) {
  const [action, pidText, third] = args;
  if (action === "list") {
    const { stdout } = yield* labExecute("jcmd", ["-l"]);
    console.log(stdout.trimEnd());
    return;
  }
  const pid = Number(pidText);
  if (!Number.isInteger(pid) || pid <= 0 || !alive(pid))
    return yield* labError("jvm", new Error("Supply a running local JVM PID."));
  let command: string[];
  switch (action) {
    case "threads":
      command = ["Thread.print", "-l"];
      break;
    case "properties":
      command = ["VM.system_properties"];
      break;
    case "jfr-start":
      command = [
        "JFR.start",
        `name=stackanvil-${pid}`,
        "settings=profile",
        `filename=${join(privateRoot, `jfr-${pid}.jfr`)}`,
      ];
      break;
    case "jfr-dump":
      command = [
        "JFR.dump",
        `name=stackanvil-${pid}`,
        `filename=${join(privateRoot, `jfr-${pid}.jfr`)}`,
      ];
      break;
    case "jfr-stop":
      command = ["JFR.stop", `name=stackanvil-${pid}`];
      break;
    case "agent":
      if (!third || !existsSync(resolve(third)))
        return yield* labError("jvm", new Error("Supply an existing local agent JAR."));
      yield* labIO("jvm", async () =>
        mkdir(join(privateRoot, "agent-attach"), { recursive: true, mode: 0o700 }),
      );
      yield* labExecute("javac", [
        "--add-modules",
        "jdk.attach",
        "-d",
        join(privateRoot, "agent-attach"),
        join(root, "src", "lab", "AttachAgent.java"),
      ]);
      yield* labExecute("java", [
        "--add-modules",
        "jdk.attach",
        "-cp",
        join(privateRoot, "agent-attach"),
        "AttachAgent",
        String(pid),
        resolve(third),
      ]);
      console.log(`Attached Java agent to PID ${pid}.`);
      return;
    case "native-agent":
      if (!third || !existsSync(resolve(third)))
        return yield* labError("jvm", new Error("Supply an existing local JVMTI library."));
      command = ["JVMTI.agent_load", resolve(third)];
      break;
    default:
      return yield* labError(
        "jvm",
        new Error(
          "Usage: bun run lab jvm <list|threads|properties|jfr-start|jfr-dump|jfr-stop|agent|native-agent> [pid] [agent file]",
        ),
      );
  }
  yield* labIO("jvm", async () => mkdir(privateRoot, { recursive: true, mode: 0o700 }));
  const { stdout, stderr } = yield* labExecute("jcmd", [String(pid), ...command], {
    maxBuffer: 32 * 1024 * 1024,
  });
  if (action === "properties" || action === "threads") {
    const file = join(privateRoot, `${action}-${pid}-${Date.now()}.txt`);
    yield* labIO("jvm", async () => writeFile(file, stdout + stderr, { mode: 0o600 }));
    console.log(`Private JVM diagnostic: ${file}`);
  } else console.log((stdout + stderr).trimEnd());
});
const doctorEffect = Effect.fn("Lab.doctor")(function* () {
  const viaProxy = yield* Effect.catch(viaProxyJarEffect(), () => Effect.succeed("missing"));
  console.log(
    JSON.stringify(
      {
        server: existsSync(join(serverHome, "bedrock_server")) ? serverHome : "missing",
        viaProxy: existsSync(viaProxy) ? viaProxy : "missing",
        bedrockOnLinux: existsSync(bedrockHome) ? bedrockHome : "missing",
        prismInstance: existsSync(join(prismHome, javaInstance, "instance.cfg"))
          ? javaInstance
          : "missing",
        jcmd: Bun.which("jcmd") ?? "missing",
        xauth: Bun.which("xauth") ?? "missing",
        pactl: Bun.which("pactl") ?? "missing",
        xvfb:
          Bun.which("Xvfb") ??
          (existsSync(join(root, ".stackanvil", "tools", "xvfb-root", "usr", "bin", "Xvfb"))
            ? "private install"
            : "missing"),
        capture: existsSync(join(root, "src", "capture", "cli.ts")) ? "available" : "missing",
      },
      null,
      2,
    ),
  );
  yield* statusEffect();
});
export const mainEffect = Effect.fn("Lab.main")(function* () {
  const [command, action, ...rest] = Bun.argv.slice(2);
  if (command === "vm")
    return yield* labIO("main", async () => vmMain(action ? [action, ...rest] : []));
  if (command === "doctor") return yield* doctorEffect();
  if (command === "status") return yield* statusEffect();
  if (command === "display" && action === "start") {
    console.log(yield* labIO("main", async () => ensureDisplay()));
    return;
  }
  if (command === "display" && action === "stop")
    return yield* labIO("main", async () => stopDisplay());
  if (command === "credentials" && action === "snapshot") return yield* snapshotCredentialsEffect();
  if (command === "java" && action === "prepare") {
    console.log(yield* labIO("main", async () => installPrism()));
    return;
  }
  if (command === "jvm" && action) return yield* jvmEffect([action, ...rest]);
  if (
    ["server", "viaproxy", "java"].includes(command ?? "") &&
    (action === "start" || action === "stop")
  ) {
    return yield* action === "start"
      ? startEffect(command as Service)
      : stopEffect(command as Service);
  }
  if (command === "up") {
    if (process.env.STACKANVIL_USE_DESKTOP !== "1")
      yield* labIO("main", async () => ensureDisplay());
    for (const service of ["server", "viaproxy", "java"] as const) yield* startEffect(service);
    return;
  }
  if (command === "down") {
    for (const service of ["java", "viaproxy", "server"] as const) yield* stopEffect(service);
    if (process.env.STACKANVIL_USE_DESKTOP !== "1") yield* labIO("main", async () => stopDisplay());
    return;
  }
  return yield* labError(
    "main",
    new Error(
      "Usage: bun run lab <doctor|status|credentials snapshot|server start|viaproxy start|java start|up|down|jvm ...|vm ...>",
    ),
  );
});
if (import.meta.main)
  runLabCommand(mainEffect()).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
