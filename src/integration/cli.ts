import { tcpPortEffect as tcpPort, udpPortEffect as udpPort } from "./ports.ts";
import {
  labIO,
  labError,
  labRequestBytes,
  labRequestJson,
  runLabCommand,
} from "../lab/effect-runtime.ts";
import { command as processCommand } from "../process.ts";
import {
  IntegrationResources,
  integrationResourcesLayer,
  startIntegrationProcess,
  retainServerDependencies,
} from "./resources.ts";
import { type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { chmod, mkdir, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { Effect } from "effect";
import { createCaptureUi } from "../capture/ui.ts";
import { activeDisplay, displayEnv, ensureDisplay, stopDisplay } from "../lab/display.ts";
import { root } from "../model.ts";
import { viaProxyTarget } from "../replay/targets.ts";
import { artifact } from "../client-artifacts.ts";
import { installPrism, prismProcess } from "../prism.ts";
import { installEntityProbe, waitForProbe } from "./entity-probe.ts";
import { isAuthoredInventoryCase, installInventoryUiProbe } from "./inventory-ui-probe.ts";
import {
  allGameplayCaseIds,
  gameplayCasesForBackend,
  installProbeGuiScale,
  runGameplayCases,
  type GameplayCaseId,
} from "./gameplay-probe.ts";
import {
  convertedGeyserTexturesMatch,
  geyserBedrockVersion,
  geyserCaseIds,
  geyserEntityUpdatesMatch,
  installJavaProbe,
} from "./geyser.ts";
import {
  convertedPackCount,
  convertedTextureMatches,
  installResourceProbe,
} from "./resource-probe.ts";
import { connectionFailure, waitForJoinEffect, type JoinRoute } from "./join.ts";
import { complexGameplayCaseIds } from "./ranged-observation.ts";
import { integrationHelp, integrationOptions } from "./options.ts";
import { installModpack } from "./modpack.ts";
import { copyBedrockServerInstallation } from "./server-installation.ts";
import {
  configureShaders,
  graphicsFailures,
  installGraphicsProfile,
  readGraphicsLock,
  integrationPrismNames,
  type GraphicsProfile,
} from "./graphics.ts";
const privateRoot = join(root, ".stackanvil", "integration");
const captureCli = join(root, "src", "capture", "cli.ts");
const captureUi = createCaptureUi({
  captureDirectory: async () => {
    const captures = join(root, ".stackanvil", "captures");
    const { id } = JSON.parse(await readFile(join(captures, "current.json"), "utf8")) as {
      id: string;
    };
    if (!/^[a-z0-9][a-z0-9-]{0,90}$/.test(id)) throw new Error("Invalid capture session ID.");
    return join(captures, id);
  },
});
const prismData = join(
  homedir(),
  ".var",
  "app",
  "org.prismlauncher.PrismLauncher",
  "data",
  "PrismLauncher",
);
const bdsSource = resolve(process.env.BEDROCK_SERVER_HOME ?? join(homedir(), "bedrock-server"));
const proxyBdsSource = resolve(process.env.STACKANVIL_JAVA_BEDROCK_SERVER_HOME ?? bdsSource);
const textFileEffect = Effect.fn("Integration.textFile")(function* (path: string) {
  return yield* existsSync(path)
    ? labIO("textFile", async () => readFile(path, "utf8"))
    : Effect.succeed("");
});
function alive(pid?: number): boolean {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
const commandEffect = (program: string, args: string[], env = process.env) =>
  processCommand(program, args, root, env).pipe(
    Effect.map((output) => output.trim()),
    Effect.mapError((cause) => labError("command", cause)),
  );
const waitForLogEffect = Effect.fn("Integration.waitForLog")(function* (
  path: string,
  pattern: RegExp,
  child: ChildProcess | (() => boolean),
  timeoutMs = 90000,
) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const log = yield* textFileEffect(path);
    if (pattern.test(log)) return log;
    if (!(typeof child === "function" ? child() : alive(child.pid)))
      return yield* labError(
        "waitForLog",
        new Error(`Service stopped before startup. Read ${path}.`),
      );
    yield* Effect.sleep(500);
  }
  return yield* labError(
    "waitForLog",
    new Error(`Service did not start within ${timeoutMs / 1000}s. Read ${path}.`),
  );
});
const downloadEffect = Effect.fn("Integration.download")(function* (
  url: string,
  path: string,
  hash: string,
  algorithm: "sha1" | "sha512",
) {
  if (existsSync(path)) {
    const existing = createHash(algorithm)
      .update(new Uint8Array(yield* labIO("download", async () => Bun.file(path).arrayBuffer())))
      .digest("hex");
    if (existing === hash) return;
  }
  const bytes = yield* labRequestBytes(url);
  if (createHash(algorithm).update(new Uint8Array(bytes)).digest("hex") !== hash)
    return yield* labError("download", new Error(`Download checksum mismatch: ${url}`));
  yield* labIO("download", async () =>
    mkdir(join(privateRoot, "cache"), { recursive: true, mode: 0o700 }),
  );
  yield* labIO("download", async () => writeFile(path, new Uint8Array(bytes), { mode: 0o600 }));
});
const vanillaServerEffect = Effect.fn("Integration.vanillaServer")(function* () {
  if (process.env.STACKANVIL_JAVA_SERVER_JAR)
    return resolve(process.env.STACKANVIL_JAVA_SERVER_JAR);
  const manifest = (yield* labRequestJson(
    "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json",
  )) as {
    versions: {
      id: string;
      url: string;
    }[];
  };
  const version = manifest.versions.find((entry) => entry.id === "26.3");
  if (!version)
    return yield* labError(
      "vanillaServer",
      new Error("Minecraft 26.3 is missing from Mojang's version manifest."),
    );
  const metadata = (yield* labRequestJson(version.url)) as {
    downloads: {
      server: {
        url: string;
        sha1: string;
      };
    };
  };
  const file = join(privateRoot, "cache", "minecraft-server-26.3.jar");
  yield* downloadEffect(
    metadata.downloads.server.url,
    file,
    metadata.downloads.server.sha1,
    "sha1",
  );
  return file;
});
const javaServerEffect = Effect.fn("Integration.javaServer")(function* (
  dir: string,
  geyser = false,
) {
  const port = yield* tcpPort;
  const bedrockPort = geyser ? yield* udpPort : undefined;
  const home = join(dir, geyser ? "geyser-server" : "java-server");
  yield* labIO("javaServer", async () => mkdir(home, { recursive: true, mode: 0o700 }));
  const jar = bedrockPort
    ? yield* labIO("javaServer", async () => installJavaProbe(home, bedrockPort))
    : yield* vanillaServerEffect();
  yield* labIO("javaServer", async () => writeFile(join(home, "eula.txt"), "eula=true\n"));
  const properties = [
    `server-port=${port}`,
    "server-ip=127.0.0.1",
    "online-mode=false",
    "enforce-secure-profile=false",
    "white-list=false",
    "enforce-whitelist=false",
    "allow-flight=true",
    "max-players=4",
    "motd=StackAnvil integration",
  ];
  if (geyser)
    properties.push(
      "level-type=minecraft:flat",
      `generator-settings=${JSON.stringify({
        layers: [
          { block: "minecraft:bedrock", height: 1 },
          { block: "minecraft:dirt", height: 2 },
          { block: "minecraft:grass_block", height: 1 },
        ],
        biome: "minecraft:plains",
      })}`,
      "level-seed=8675309",
      "view-distance=6",
      "simulation-distance=6",
    );
  yield* labIO("javaServer", async () =>
    writeFile(join(home, "server.properties"), `${properties.join("\n")}\n`),
  );
  const log = join(dir, geyser ? "geyser-server.log" : "java-server.log");
  const child = yield* startIntegrationProcess(
    Bun.which("java") ?? "java",
    ["-Xmx2G", "-jar", jar, "nogui"],
    home,
    log,
    process.env,
    true,
  );
  yield* waitForLogEffect(log, /Done \(/, child, 120000);
  if (geyser) {
    yield* waitForLogEffect(log, /\[StackAnvil Java Probe\] ready/, child);
    yield* waitForLogEffect(log, /\[StackAnvil Geyser Probe\] ready/, child);
    yield* waitForLogEffect(log, /Enabled extension Boar/, child);
    yield* waitForLogEffect(log, /Started Geyser on.*127\.0\.0\.1/, child);
  }
  return { child, log, port, bedrockPort };
});
const bedrockServerEffect = Effect.fn("Integration.bedrockServer")(function* (
  dir: string,
  source: string,
  name: string,
  entityProbe = false,
  resourceProbe?: { variant: "a" | "b"; run: string },
  inventoryUiProbe = false,
) {
  if (!existsSync(join(source, "bedrock_server")))
    return yield* labError(
      "bedrockServer",
      new Error(
        `Bedrock server missing in ${source}. Set BEDROCK_SERVER_HOME or STACKANVIL_JAVA_BEDROCK_SERVER_HOME.`,
      ),
    );
  const home = join(dir, name);
  yield* retainServerDependencies(() => copyBedrockServerInstallation(source, home));
  const port = yield* udpPort;
  const properties = yield* textFileEffect(join(source, "server.properties"));
  const set = (value: string, key: string, replacement: string) =>
    new RegExp(`^${key}=.*$`, "m").test(value)
      ? value.replace(new RegExp(`^${key}=.*$`, "m"), `${key}=${replacement}`)
      : `${value}\n${key}=${replacement}\n`;
  let changed = properties;
  for (const [key, value] of Object.entries({
    "server-name": "StackAnvil Integration",
    "server-port": String(port),
    "server-portv6": String(port + 1),
    "level-name": "integration-world",
    "online-mode": "false",
    "allow-list": "false",
    "allow-cheats": "true",
    "enable-lan-visibility": "false",
    "server-authoritative-movement-strict": "true",
  })) {
    changed = set(changed, key, value);
  }
  if (entityProbe) {
    changed = set(changed, "content-log-console-output-enabled", "true");
    changed = set(changed, "content-log-level", "info");
    yield* labIO("bedrockServer", async () => installEntityProbe(home, "integration-world"));
  }
  if (inventoryUiProbe) {
    changed = set(changed, "texturepack-required", "true");
    yield* labIO("bedrockServer", () => installInventoryUiProbe(home, "integration-world"));
  }
  if (resourceProbe) {
    changed = set(changed, "texturepack-required", "true");
    yield* labIO("bedrockServer", async () =>
      installResourceProbe(home, "integration-world", resourceProbe.variant, resourceProbe.run),
    );
  }
  if (entityProbe || resourceProbe) {
    changed = set(changed, "force-gamemode", "false");
    changed = set(changed, "gamemode", "survival");
  }
  yield* labIO("bedrockServer", async () =>
    writeFile(join(home, "server.properties"), changed, { mode: 0o600 }),
  );
  const log = join(dir, `${name}.log`);
  const child = yield* startIntegrationProcess(
    join(home, "bedrock_server"),
    [],
    home,
    log,
    { ...process.env, LD_LIBRARY_PATH: home },
    true,
  );
  const output = yield* waitForLogEffect(log, /Server started\./, child);
  if (entityProbe) yield* waitForLogEffect(log, /\[ViaBedrock Entity Probe\] ready/, child, 30000);
  if (resourceProbe) {
    child.stdin?.write("tickingarea add circle 0 64 0 2 stackanvil_probe\n");
    yield* waitForLogEffect(log, /Added ticking area centered/, child, 30000);
    let placed = false;
    for (let attempt = 0; attempt < 10 && !placed; attempt++) {
      child.stdin?.write("setblock 0 64 0 stackanvil:resource_probe_block\n");
      yield* Effect.sleep(1000);
      placed = (yield* textFileEffect(log)).includes("Block placed");
    }
    if (!placed)
      return yield* labError(
        "bedrockServer",
        new Error(`Could not place the custom probe block. Read ${log}.`),
      );
  }
  const version = /Version:\s*(\d+\.\d+\.\d+)/.exec(output)?.[1];
  if (!version)
    return yield* labError(
      "bedrockServer",
      new Error(`Could not read Bedrock server version. Read ${log}.`),
    );
  return {
    child,
    log,
    port,
    version,
    transport: /^transport=(.+)$/m.exec(changed)?.[1] ?? "raknet",
  };
});
const viaProxyEffect = Effect.fn("Integration.viaProxy")(function* (
  dir: string,
  bedrockPort: number,
  version: string,
  transport: string,
  name = "viaproxy",
  homeName = name,
) {
  const jar = process.env.VIAPROXY_JAR
    ? resolve(process.env.VIAPROXY_JAR)
    : yield* labIO("viaProxy", async () => artifact("viaproxy"));
  if (!existsSync(jar))
    return yield* labError(
      "viaProxy",
      new Error(`ViaProxy missing: ${jar}. Run bun run build viaproxy.`),
    );
  const port = yield* tcpPort;
  const log = join(dir, `${name}.log`);
  const home = join(dir, homeName);
  yield* labIO("viaProxy", async () => mkdir(home, { recursive: true, mode: 0o700 }));
  const child = yield* startIntegrationProcess(
    Bun.which("java") ?? "java",
    [
      "-DskipUpdateCheck",
      "-jar",
      jar,
      "cli",
      "--bind-address",
      `127.0.0.1:${port}`,
      "--target-address",
      viaProxyTarget(
        transport === "nethernet"
          ? `nethernet://127.0.0.1:${bedrockPort}`
          : `127.0.0.1:${bedrockPort}`,
      ),
      "--target-version",
      `Bedrock ${version}`,
      "--auth-method",
      "NONE",
      "--log-ips",
      "false",
    ],
    home,
    log,
  );
  yield* waitForLogEffect(log, /Binding proxy server/, child);
  return { child, log, port };
});
const preparePrismEffect = Effect.fn("Integration.preparePrism")(function* (
  profile: GraphicsProfile,
) {
  const name = integrationPrismNames[profile];
  const instance = yield* labIO("preparePrism", async () => installPrism(name));
  if (profile === "shaders") {
    yield* labIO("preparePrism", async () => installGraphicsProfile(instance));
    console.log("Testing Fabulously Optimized with the pinned Bedrock shader profile.");
  } else if (profile === "optimized") {
    const version = yield* labIO("preparePrism", async () => installModpack(instance));
    yield* labIO("preparePrism", async () => configureShaders(instance));
    console.log(`Testing Fabulously Optimized ${version} with StackAnvil.`);
  } else {
    const mods = join(instance, "minecraft", "mods");
    for (const file of yield* labIO("preparePrism", async () => readdir(mods))) {
      if (/^(?:iris|sodium)-.*\.jar$/i.test(file))
        yield* labIO("preparePrism", async () => rm(join(mods, file)));
    }
  }
  return { instance, name };
});
const isolatedPrismRootEffect = Effect.fn("Integration.isolatedPrismRoot")(function* (
  dir: string,
  name: string,
) {
  const isolated = join(dir, `prism-${name}-${Date.now().toString(36)}`);
  yield* labIO("isolatedPrismRoot", async () => mkdir(isolated, { recursive: true, mode: 0o700 }));
  yield* labIO("isolatedPrismRoot", async () => mkdir(join(isolated, "logs"), { mode: 0o700 }));
  for (const entry of yield* labIO("isolatedPrismRoot", async () =>
    readdir(prismData, { withFileTypes: true }),
  )) {
    if (entry.name === "logs") continue;
    const source = join(prismData, entry.name);
    const destination = join(isolated, entry.name);
    if (entry.isDirectory())
      yield* labIO("isolatedPrismRoot", async () => symlink(source, destination, "dir"));
    else if (entry.isFile()) {
      yield* labIO("isolatedPrismRoot", async () =>
        writeFile(destination, await readFile(source), { mode: 0o600 }),
      );
      yield* labIO("isolatedPrismRoot", async () => chmod(destination, 0o600));
    }
  }
  return isolated;
});
const waitForGameProcessEffect = Effect.fn("Integration.waitForGameProcess")(function* (
  launcher: ChildProcess,
  log: string,
  name: string,
) {
  for (let attempt = 0; attempt < 120; attempt++) {
    const pid = yield* labIO("waitForGameProcess", async () => prismProcess(name));
    if (pid) return pid;
    yield* Effect.sleep(500);
  }
  return yield* labError(
    "waitForGameProcess",
    new Error(
      `Minecraft did not start within 60s (Prism ${alive(launcher.pid) ? "is running" : "has exited"}). Read ${log}.`,
    ),
  );
});
const javaJoinEffect = Effect.fn("Integration.javaJoin")(function* (
  route: "java-java" | "java-bedrock" | "java-geyser",
  profile: GraphicsProfile,
  dir: string,
  target: {
    port: number;
    log: string;
    child: ChildProcess;
    proxyLog?: string;
  },
  entityProbe?: {
    child: ChildProcess;
    log: string;
  },
  runEntityProbe = false,
  gameplayCases: readonly GameplayCaseId[] = [],
  resource?: {
    variant: "a" | "b";
    label: string;
  },
  probeFailures?: string[],
  negativeControls = false,
) {
  const { instance, name } = yield* preparePrismEffect(profile);
  const prismRoot = yield* isolatedPrismRootEffect(
    dir,
    profile === "shaders" ? "shaders" : profile === "optimized" ? "modpack" : "plain",
  );
  if (gameplayCases.length) yield* labIO("javaJoin", async () => installProbeGuiScale(instance));
  const serverLogStart = (yield* textFileEffect(target.log)).length;
  const connectionLogStart = target.proxyLog ? (yield* textFileEffect(target.proxyLog)).length : 0;
  const clientLog = join(instance, "minecraft", "logs", "latest.log");
  yield* labIO("javaJoin", async () => rm(clientLog, { force: true }));
  const isolated = yield* labIO("javaJoin", async () => displayEnv(true));
  if (!isolated)
    return yield* labError(
      "javaJoin",
      new Error("Integration tests require the private Xvfb display."),
    );
  const log = join(
    dir,
    `${route}-${profile === "shaders" ? "fabulously-optimized-shaders" : profile === "optimized" ? "fabulously-optimized" : "plain"}-launcher.log`,
  );
  const child = yield* startIntegrationProcess(
    "flatpak",
    [
      "run",
      "--nosocket=wayland",
      "--socket=x11",
      `--filesystem=${join(root, ".stackanvil", "lab")}:ro`,
      `--filesystem=${prismRoot}`,
      `--env=DISPLAY=${isolated.DISPLAY}`,
      `--env=XAUTHORITY=${isolated.XAUTHORITY}`,
      "--env=WAYLAND_DISPLAY=",
      "--env=QT_QPA_PLATFORM=xcb",
      "--env=SDL_VIDEODRIVER=x11",
      "--env=SDL_VIDEO_DRIVER=x11",
      "--env=SDL_VIDEO_FORCE_EGL=1",
      "--env=PULSE_SINK=stackanvil_silent",
      "org.prismlauncher.PrismLauncher",
      "--dir",
      prismRoot,
      "--launch",
      name,
      "--server",
      `127.0.0.1:${target.port}`,
    ],
    root,
    log,
    isolated,
  );
  let gamePid: number | undefined;
  return yield* Effect.ensuring(
    Effect.catch(
      Effect.gen(function* () {
        gamePid = yield* waitForGameProcessEffect(child, log, name);
        if (route === "java-bedrock" || route === "java-geyser") {
          yield* waitForLogEffect(
            clientLog,
            /Connecting to 127\.0\.0\.1/,
            () => alive(gamePid),
            120000,
          );
          if (route === "java-geyser" && target.proxyLog) {
            const log = async () => (await textFile(target.proxyLog!)).slice(connectionLogStart);
            const deadline = Date.now() + 120000;
            while (
              !/All resource packs have been loaded/.test(
                yield* labIO("javaJoin", async () => log()),
              )
            ) {
              if (!alive(gamePid))
                return yield* labError(
                  "javaJoin",
                  new Error("The Java client stopped before resource packs were ready."),
                );
              if (Date.now() > deadline)
                return yield* labError(
                  "javaJoin",
                  new Error(`Resource packs did not become ready. Read ${target.proxyLog}.`),
                );
              yield* Effect.sleep(250);
            }
          }
          yield* Effect.sleep(3500);
          yield* captureEffect(["ui", "click", "0.32", "0.69", "--client", "java"]);
        }
        const player = yield* waitForJoinEffect({
          route,
          serverLog: async () => (await textFile(target.log)).slice(serverLogStart),
          clientLog: () => textFile(clientLog),
          connectionLog: target.proxyLog
            ? async () => (await textFile(target.proxyLog!)).slice(connectionLogStart)
            : undefined,
          clientAlive: () => alive(gamePid),
          timeoutMs: 150000,
          dwellMs: 20000,
          onJoin:
            route === "java-java"
              ? (name) => {
                  target.child.stdin?.write(
                    `execute at ${name} run summon minecraft:interaction ~ ~ ~\n`,
                  );
                }
              : undefined,
        });
        const renderingFailures = graphicsFailures(
          yield* textFileEffect(clientLog),
          profile === "shaders"
            ? (yield* labIO("javaJoin", async () => readGraphicsLock())).shader.filename
            : undefined,
        );
        if (renderingFailures.length)
          return yield* labError("javaJoin", new Error(renderingFailures.join(" ")));
        console.log(
          `PASS ${route}${profile === "shaders" ? "+fabulously-optimized-shaders" : profile === "optimized" ? "+fabulously-optimized" : ""}: ${player} joined and remained connected for 20s.`,
        );
        if (resource) {
          const log = yield* textFileEffect(clientLog);
          if (!/Reloading ResourceManager:.*server\//.test(log)) {
            return yield* labError(
              "javaJoin",
              new Error(`Resource probe ${resource.label} did not load the converted Java pack.`),
            );
          }
          if (
            !(yield* labIO("javaJoin", async () =>
              convertedTextureMatches(join(dir, "viaproxy"), resource.variant),
            ))
          ) {
            return yield* labError(
              "javaJoin",
              new Error(
                `Resource probe ${resource.label} did not preserve the ${resource.variant} texture in its converted pack.`,
              ),
            );
          }
          console.log(
            `PASS resource pack ${resource.label}: converted texture matched and Java loaded the pack.`,
          );
        }
        if (entityProbe && runEntityProbe) {
          for (const group of ["status", "metadata"] as const) {
            const logStart = (yield* textFileEffect(entityProbe.log)).length;
            entityProbe.child.stdin?.write(`scriptevent vbprobe:${group} auto\n`);
            const result = yield* labIO("javaJoin", async () =>
              waitForProbe(
                group,
                async () => (await textFile(entityProbe.log)).slice(logStart),
                () => alive(gamePid) && alive(entityProbe.child.pid),
              ),
            );
            console.log(`PASS ${group} entity probe: ${result.passed} script actions accepted.`);
          }
        }
        if (gameplayCases.length && entityProbe) {
          yield* Effect.catch(
            Effect.gen(function* () {
              yield* labIO("javaJoin", async () =>
                runGameplayCases(gameplayCases, {
                  server: entityProbe.child,
                  serverLog: entityProbe.log,
                  clientAlive: () => alive(gamePid),
                  ui: (args) => capture(args),
                  artifactDir: dir,
                  negativeControls,
                  connectionError: async () =>
                    connectionFailure(
                      route,
                      player,
                      (await textFile(target.log)).slice(serverLogStart),
                      target.proxyLog
                        ? (await textFile(target.proxyLog)).slice(connectionLogStart)
                        : "",
                    ),
                  inspectClient:
                    route === "java-geyser"
                      ? async (id, serverLog, event) => {
                          if (geyserCaseIds.includes(id as (typeof geyserCaseIds)[number])) {
                            if (
                              !/Reloading ResourceManager:.*server\//.test(
                                await textFile(clientLog),
                              )
                            ) {
                              throw new Error(
                                "The Java client did not load the converted Geyser resource pack.",
                              );
                            }
                            if (
                              !(await convertedGeyserTexturesMatch(join(dir, "viaproxy-geyser")))
                            ) {
                              throw new Error(
                                "The converted Geyser pack is missing the custom entity model or fixture textures.",
                              );
                            }
                            if (id.startsWith("custom-entity") || id === "complex-world") {
                              const deadline = Date.now() + 5000;
                              while (
                                !geyserEntityUpdatesMatch(id, event.observed, await serverLog())
                              ) {
                                if (Date.now() > deadline)
                                  throw new Error(
                                    "Geyser did not submit the expected custom entity property updates.",
                                  );
                                await Bun.sleep(100);
                              }
                            }
                          }
                        }
                      : undefined,
                }),
              );
            }),
            (error) =>
              Effect.gen(function* () {
                if (!probeFailures) return yield* labError("javaJoin", error);
                probeFailures.push(String(error));
              }),
          );
        }
        return yield* textFileEffect(clientLog);
      }),
      (error) =>
        labError(
          "javaJoin",
          new Error(
            `${String(error)} Read ${clientLog}, ${log}${target.proxyLog ? `, and ${target.proxyLog}` : ""}.`,
          ),
        ),
    ),
    Effect.orDie(
      Effect.gen(function* () {
        if (alive(gamePid)) {
          try {
            process.kill(gamePid!, "SIGINT");
          } catch {
            /* Already stopped. */
          }
        }
        if (alive(child.pid)) {
          try {
            process.kill(-child.pid!, "SIGINT");
          } catch {
            /* Already stopped. */
          }
        }
        for (let attempt = 0; attempt < 40 && alive(gamePid); attempt++) yield* Effect.sleep(250);
        if (existsSync(clientLog))
          yield* labIO("javaJoin", async () =>
            writeFile(
              join(
                dir,
                `${route}-${profile === "shaders" ? "shaders" : profile === "optimized" ? "optimized" : "plain"}-${Date.now()}.log`,
              ),
              await readFile(clientLog),
              { mode: 0o600 },
            ),
          );
      }),
    ),
  );
});
const captureEffect = Effect.fn("Integration.capture")(function* (
  args: string[],
  env = process.env,
) {
  if (args[0] === "ui") return yield* labIO("capture", async () => captureUi.command(args));
  return yield* commandEffect(process.execPath, [captureCli, ...args], env);
});
const bedrockJoinEffect = Effect.fn("Integration.bedrockJoin")(function* (
  dir: string,
  target: {
    port: number;
    log: string;
  },
) {
  const serverLogStart = (yield* textFileEffect(target.log)).length;
  const current = join(root, ".stackanvil", "captures", "current.json");
  if (existsSync(current)) {
    const { id } = JSON.parse(
      yield* labIO("bedrockJoin", async () => readFile(current, "utf8")),
    ) as {
      id: string;
    };
    const existing = JSON.parse(
      yield* labIO("bedrockJoin", async () =>
        readFile(join(root, ".stackanvil", "captures", id, "session.json"), "utf8"),
      ),
    ) as {
      stoppedAt?: string;
      proxyPid: number;
    };
    if (!existing.stoppedAt && alive(existing.proxyPid))
      return yield* labError(
        "bedrockJoin",
        new Error("An HTTPS capture is active. Stop it before the native join test."),
      );
  }
  const label = `stackanvil-it-${Date.now().toString(36)}`;
  const env = { ...process.env, STACKANVIL_PROXY_PORT: String(yield* tcpPort) };
  let session: string | undefined;
  return yield* Effect.ensuring(
    Effect.catch(
      Effect.gen(function* () {
        yield* captureEffect(["start", "native-join"], env);
        session = (
          JSON.parse(yield* labIO("bedrockJoin", async () => readFile(current, "utf8"))) as {
            id: string;
          }
        ).id;
        yield* captureEffect(["launch"]);
        const sessionPath = join(root, ".stackanvil", "captures", session, "session.json");
        const gamePid = (
          JSON.parse(yield* labIO("bedrockJoin", async () => readFile(sessionPath, "utf8"))) as {
            gamePid?: number;
          }
        ).gamePid;
        for (let attempt = 0; attempt < 90; attempt++) {
          const listing = yield* captureEffect(["ui", "list"]);
          if (listing.includes('"title": "Minecraft"')) break;
          if (!alive(gamePid))
            return yield* labError(
              "bedrockJoin",
              new Error(
                `Bedrock client exited. Read ${join(root, ".stackanvil", "captures", session, "game.log")}.`,
              ),
            );
          yield* Effect.sleep(1000);
        }
        yield* Effect.sleep(20000);
        yield* captureEffect(["ui", "screenshot", "native-menu"]);
        yield* captureEffect(["ui", "key", "Return"]);
        yield* Effect.sleep(2500);
        yield* captureEffect(["ui", "screenshot", "native-play-menu"]);
        yield* captureEffect(["ui", "click", "0.82", "0.11"]);
        yield* Effect.sleep(2500);
        yield* captureEffect(["ui", "screenshot", "native-server-list"]);
        yield* captureEffect(["ui", "click", "0.17", "0.22"]);
        yield* Effect.sleep(2000);
        yield* captureEffect(["ui", "screenshot", "native-add-form"]);
        yield* captureEffect(["ui", "click", "0.25", "0.17"]);
        yield* captureEffect(["ui", "type", label]);
        yield* captureEffect(["ui", "click", "0.25", "0.31"]);
        yield* captureEffect(["ui", "type", "127.0.0.1"]);
        yield* captureEffect(["ui", "click", "0.25", "0.46"]);
        yield* captureEffect(["ui", "key", "Control+a"]);
        yield* captureEffect(["ui", "type", String(target.port)]);
        yield* captureEffect(["ui", "click", "0.69", "0.57"]);
        yield* Effect.sleep(4000);
        yield* captureEffect(["ui", "screenshot", "native-before-trust"]);
        const trustPanelPixel = (yield* captureEffect(["ui", "pixel", "0.36", "0.28"]))
          .split(/\s+/)
          .map(Number);
        if (
          trustPanelPixel.length !== 3 ||
          trustPanelPixel.some((value) => !Number.isFinite(value))
        ) {
          return yield* labError(
            "bedrockJoin",
            new Error("Could not read the Bedrock trust dialog state."),
          );
        }
        if (trustPanelPixel.every((value) => value > 150)) {
          yield* captureEffect(["ui", "click", "0.5", "0.59"]);
        }
        const player = yield* waitForJoinEffect({
          route: "bedrock-bedrock",
          serverLog: async () => (await textFile(target.log)).slice(serverLogStart),
          clientLog: () => textFile(join(root, ".stackanvil", "captures", session!, "game.log")),
          clientAlive: () => alive(gamePid),
          timeoutMs: 90000,
          dwellMs: 20000,
        });
        yield* captureEffect(["ui", "screenshot", "native-joined"]);
        console.log(`PASS bedrock-bedrock: ${player} joined and remained connected for 20s.`);
      }),
      (error) =>
        labError(
          "bedrockJoin",
          new Error(
            `${String(error)} Private native capture: ${session ? join(root, ".stackanvil", "captures", session) : dir}.`,
          ),
        ),
    ),
    Effect.orDie(
      Effect.gen(function* () {
        if (session) {
          yield* Effect.catch(
            Effect.gen(function* () {
              yield* captureEffect(["game-stop"]);
            }),
            () =>
              Effect.sync(() => {
                /* The client may already have exited. */
              }),
          );
          yield* Effect.catch(
            Effect.gen(function* () {
              yield* captureEffect(["stop"]);
            }),
            () =>
              Effect.sync(() => {
                /* Preserve the original failure. */
              }),
          );
        }
        yield* removeTemporaryServerEffect(label, target.port);
      }),
    ),
  );
});
const removeTemporaryServerEffect = Effect.fn("Integration.removeTemporaryServer")(function* (
  name: string,
  port: number,
) {
  const users = join(
    homedir(),
    ".local",
    "share",
    "bedrock-on-linux",
    "compatdata",
    "pfx",
    "drive_c",
    "users",
    "steamuser",
    "AppData",
    "Roaming",
    "Minecraft Bedrock",
    "Users",
  );
  if (!existsSync(users)) return;
  for (const user of yield* labIO("removeTemporaryServer", async () => readdir(users))) {
    const file = join(users, user, "games", "com.mojang", "minecraftpe", "external_servers.txt");
    if (!existsSync(file)) continue;
    const original = yield* labIO("removeTemporaryServer", async () => readFile(file, "utf8"));
    const lines = original.split(/(?<=\n)/);
    const retained = lines.filter((line) => !line.includes(`:${name}:127.0.0.1:${port}:`));
    if (retained.length !== lines.length)
      yield* labIO("removeTemporaryServer", async () => writeFile(file, retained.join("")));
  }
});
export const mainEffect = Effect.fn("Integration.main")(function* () {
  const options = integrationOptions(Bun.argv.slice(2));
  if (options.help) {
    console.log(integrationHelp);
    return;
  }
  const plainOnly = options["plain-only"];
  const modpackOnly = options["modpack-only"];
  const shaders = options.shaders;
  if (shaders && plainOnly)
    return yield* labError(
      "main",
      new Error("--shaders requires the Fabulously Optimized client run."),
    );
  if (plainOnly && modpackOnly)
    return yield* labError("main", new Error("Choose --plain-only or --modpack-only, not both."));
  const entityProbe = options["entity-probe"] ?? false;
  const resourceProbe = options["resource-pack-probe"] ?? false;
  const resourceRun = Date.now().toString(36);
  const gameplayProbe = options["gameplay-probe"];
  const complexGameplay = options["gameplay-complex"];
  const geyserProbe = options["geyser-probe"];
  const negativeControls = options["negative-controls"] ?? false;
  const gameplayInput = options["gameplay-cases"];
  if (gameplayInput !== undefined && !gameplayInput) {
    return yield* labError(
      "main",
      new Error("--gameplay-cases needs a comma-separated case list."),
    );
  }
  const routes: JoinRoute[] =
    options.route !== undefined
      ? [options.route as JoinRoute]
      : ["java-java", "java-bedrock", "bedrock-bedrock"];
  if (
    routes.some(
      (route) => !["java-java", "java-bedrock", "bedrock-bedrock", "java-geyser"].includes(route),
    )
  ) {
    return yield* labError(
      "main",
      new Error("Use --route java-java, java-bedrock, bedrock-bedrock, or java-geyser."),
    );
  }
  if (shaders && !routes.some((route) => route.startsWith("java-")))
    return yield* labError("main", new Error("--shaders requires a Java client route."));
  const geyserRoute = routes.includes("java-geyser");
  const gameplayCases: GameplayCaseId[] = [
    ...new Set([
      ...(complexGameplay ? complexGameplayCaseIds : []),
      ...(geyserProbe ? geyserCaseIds : []),
      ...(gameplayInput
        ? (gameplayInput.split(",") as GameplayCaseId[])
        : gameplayProbe
          ? gameplayCasesForBackend(geyserRoute)
          : []),
      ...(negativeControls ? ["chest-transfer" as const] : []),
    ]),
  ];
  if (gameplayCases.some((id) => !allGameplayCaseIds.includes(id)))
    return yield* labError(
      "main",
      new Error(`Unknown gameplay case. Use: ${allGameplayCaseIds.join(", ")}.`),
    );
  if (
    geyserRoute &&
    gameplayCases.some((id) =>
      complexGameplayCaseIds.includes(id as (typeof complexGameplayCaseIds)[number]),
    )
  ) {
    return yield* labError(
      "main",
      new Error(
        "Complex gameplay fixtures require --route java-bedrock; the Java probe does not implement them yet.",
      ),
    );
  }
  if (gameplayCases.includes("offhand-block-place") && !geyserRoute) {
    return yield* labError(
      "main",
      new Error(
        "Delivered offhand dirt requires the java-geyser backend; use offhand-ineligible-block on java-bedrock.",
      ),
    );
  }
  if (gameplayCases.includes("offhand-ineligible-block") && geyserRoute) {
    return yield* labError(
      "main",
      new Error(
        "Offhand item eligibility requires the java-bedrock backend; use offhand-block-place on java-geyser.",
      ),
    );
  }
  if (
    (geyserProbe ||
      negativeControls ||
      gameplayCases.some((id) => geyserCaseIds.includes(id as (typeof geyserCaseIds)[number]))) &&
    !geyserRoute
  ) {
    return yield* labError(
      "main",
      new Error("Geyser cases and negative controls require --route java-geyser."),
    );
  }
  if (geyserRoute && gameplayCases.some(isAuthoredInventoryCase)) {
    return yield* labError(
      "main",
      new Error("Authored Bedrock inventory actions require the java-bedrock route."),
    );
  }
  if (
    geyserRoute &&
    (entityProbe || resourceProbe || gameplayCases.includes("lab-table-then-chest"))
  ) {
    return yield* labError(
      "main",
      new Error(
        "Bedrock named-event sweeps, the BDS cache probe, and lab tables are unavailable on the Java backend. Use --geyser-probe for custom content.",
      ),
    );
  }
  if ((entityProbe || resourceProbe) && !routes.includes("java-bedrock"))
    return yield* labError("main", new Error("Bedrock probes require the java-bedrock route."));
  if (gameplayCases.length && !routes.includes("java-bedrock") && !geyserRoute)
    return yield* labError(
      "main",
      new Error("Gameplay cases require java-bedrock or java-geyser."),
    );
  if ((entityProbe || gameplayCases.length || resourceProbe) && modpackOnly)
    return yield* labError("main", new Error("Probe cases require the plain Java client run."));
  if (process.env.STACKANVIL_USE_DESKTOP === "1")
    return yield* labError(
      "main",
      new Error("Integration tests require a private display and never take desktop focus."),
    );
  if (yield* labIO("main", async () => activeDisplay()))
    return yield* labError(
      "main",
      new Error(
        "The StackAnvil private display is already running. Stop the lab or capture session before integration tests.",
      ),
    );
  if (!options["reuse-build"])
    yield* commandEffect(process.execPath, [join(root, "src", "cli.ts"), "stack", "build", "all"]);
  const dir = join(privateRoot, "runs", new Date().toISOString().replace(/[:.]/g, "-"));
  yield* labIO("main", async () => mkdir(dir, { recursive: true, mode: 0o700 }));
  console.log(`Private logs: ${dir}`);
  yield* (yield* IntegrationResources).acquireDisplay(ensureDisplay);
  return yield* Effect.gen(function* () {
    const probeFailures: string[] = [];
    const java = routes.includes("java-java") ? yield* javaServerEffect(dir) : undefined;
    const geyser = geyserRoute ? yield* javaServerEffect(dir, true) : undefined;
    const geyserProxy = geyser?.bedrockPort
      ? yield* viaProxyEffect(
          dir,
          geyser.bedrockPort,
          geyserBedrockVersion,
          "raknet",
          "viaproxy-geyser",
        )
      : undefined;
    const nativeBedrock = routes.includes("bedrock-bedrock")
      ? yield* bedrockServerEffect(dir, bdsSource, "bedrock-native-server")
      : undefined;
    const proxyBedrock = routes.includes("java-bedrock")
      ? yield* bedrockServerEffect(
          dir,
          proxyBdsSource,
          "bedrock-proxy-server",
          entityProbe || gameplayCases.length > 0,
          resourceProbe ? { variant: "a", run: resourceRun } : undefined,
          gameplayCases.some(isAuthoredInventoryCase),
        )
      : undefined;
    const proxy = proxyBedrock
      ? yield* viaProxyEffect(dir, proxyBedrock.port, proxyBedrock.version, proxyBedrock.transport)
      : undefined;
    for (const route of routes) {
      if (route === "java-java" && java) {
        if (!modpackOnly) yield* javaJoinEffect(route, "plain", dir, java);
        if (!plainOnly) yield* javaJoinEffect(route, shaders ? "shaders" : "optimized", dir, java);
      } else if (route === "java-geyser" && geyser && geyserProxy) {
        const target = { ...geyserProxy, log: geyser.log, proxyLog: geyserProxy.log };
        if (!modpackOnly)
          yield* javaJoinEffect(
            route,
            "plain",
            dir,
            target,
            geyser,
            false,
            gameplayCases,
            undefined,
            probeFailures,
            negativeControls,
          );
        if (gameplayCases.length) {
          yield* javaJoinEffect(route, "plain", dir, target);
          console.log("PASS Geyser reconnect: the Java client rejoined the same Paper world.");
        }
        if (!plainOnly)
          yield* javaJoinEffect(route, shaders ? "shaders" : "optimized", dir, target);
      } else if (route === "java-bedrock" && proxy && proxyBedrock) {
        let modpackProxy = proxy;
        let modpackBedrock = proxyBedrock;
        const proxyLogStart = (yield* textFileEffect(proxy.log)).length;
        const firstClientLog = !modpackOnly
          ? yield* javaJoinEffect(
              route,
              "plain",
              dir,
              { ...proxy, log: proxyBedrock.log, proxyLog: proxy.log },
              entityProbe || gameplayCases.length || resourceProbe ? proxyBedrock : undefined,
              entityProbe,
              gameplayCases,
              resourceProbe ? { variant: "a", label: "a-first" } : undefined,
              probeFailures,
            )
          : "";
        if (
          resourceProbe &&
          (yield* textFileEffect(proxy.log)).includes(
            "Missing bedrock -> java block state mapping: stackanvil:resource_probe_block",
          )
        ) {
          return yield* labError(
            "main",
            new Error("The custom probe block fell back to an unrelated Java block state."),
          );
        }
        if (resourceProbe) {
          const firstConversions = convertedPackCount(
            (yield* textFileEffect(proxy.log)).slice(proxyLogStart) + firstClientLog,
          );
          if (!firstConversions)
            return yield* labError(
              "main",
              new Error("Resource probe A did not convert its new pack."),
            );
          const repeatStart = (yield* textFileEffect(proxy.log)).length;
          const repeatClientLog = yield* javaJoinEffect(
            route,
            "plain",
            dir,
            { ...proxy, log: proxyBedrock.log, proxyLog: proxy.log },
            proxyBedrock,
            false,
            [],
            { variant: "a", label: "a-repeat" },
          );
          const repeatedConversions = convertedPackCount(
            (yield* textFileEffect(proxy.log)).slice(repeatStart) + repeatClientLog,
          );
          if (repeatedConversions)
            return yield* labError(
              "main",
              new Error("Resource probe A converted the same content again."),
            );
          console.log("PASS resource pack cache: unchanged content reused the conversion.");
          if (alive(proxy.child.pid)) process.kill(-proxy.child.pid!, "SIGINT");
          for (let attempt = 0; attempt < 40 && alive(proxy.child.pid); attempt++)
            yield* Effect.sleep(250);
          if (alive(proxy.child.pid))
            return yield* labError(
              "main",
              new Error("ViaProxy did not stop before the changed resource pack run."),
            );
          if (alive(proxyBedrock.child.pid)) process.kill(-proxyBedrock.child.pid!, "SIGINT");
          for (let attempt = 0; attempt < 40 && alive(proxyBedrock.child.pid); attempt++)
            yield* Effect.sleep(250);
          if (alive(proxyBedrock.child.pid))
            return yield* labError(
              "main",
              new Error("Bedrock server did not stop before the changed resource pack run."),
            );
          const changedServer = yield* bedrockServerEffect(
            dir,
            proxyBdsSource,
            "bedrock-resource-changed-server",
            false,
            { variant: "b", run: resourceRun },
          );
          const changedProxy = yield* viaProxyEffect(
            dir,
            changedServer.port,
            changedServer.version,
            changedServer.transport,
            "viaproxy-resource-changed",
            "viaproxy",
          );
          const changedStart = (yield* textFileEffect(changedProxy.log)).length;
          const changedClientLog = yield* javaJoinEffect(
            route,
            "plain",
            dir,
            { ...changedProxy, log: changedServer.log, proxyLog: changedProxy.log },
            changedServer,
            false,
            [],
            { variant: "b", label: "b-changed" },
          );
          const changedConversions = convertedPackCount(
            (yield* textFileEffect(changedProxy.log)).slice(changedStart) + changedClientLog,
          );
          if (!changedConversions)
            return yield* labError(
              "main",
              new Error("Resource probe B did not convert changed content."),
            );
          console.log("PASS resource pack cache: changed content produced a new conversion.");
          modpackProxy = changedProxy;
          modpackBedrock = changedServer;
        } else if (gameplayCases.length) {
          yield* javaJoinEffect(route, "plain", dir, {
            ...proxy,
            log: proxyBedrock.log,
            proxyLog: proxy.log,
          });
          console.log("PASS gameplay reconnect: the Java client rejoined the same Bedrock world.");
        }
        if (!plainOnly)
          yield* javaJoinEffect(route, shaders ? "shaders" : "optimized", dir, {
            ...modpackProxy,
            log: modpackBedrock.log,
            proxyLog: modpackProxy.log,
          });
      } else if (route === "bedrock-bedrock" && nativeBedrock) {
        yield* bedrockJoinEffect(dir, nativeBedrock);
      }
    }
    if (probeFailures.length) return yield* labError("main", new Error(probeFailures.join("\n")));
  });
});
// SDK callbacks expose Promises at their boundary.
function textFile(path: string) {
  return Effect.runPromise(textFileEffect(path));
}
function capture(args: string[], env = process.env) {
  return Effect.runPromise(captureEffect(args, env));
}
if (import.meta.main)
  runLabCommand(
    Effect.scoped(mainEffect().pipe(Effect.provide(integrationResourcesLayer(stopDisplay)))),
  ).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
