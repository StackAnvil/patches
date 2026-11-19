import { flatpakWaylandArguments } from "../lab/wayland.ts";
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
import type { ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { chmod, mkdir, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { Clock, DateTime, Effect, Schema } from "effect";
import { isOneOf, parseJson, encodeJson, optionalEnv } from "../guards.ts";
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
import { connectionFailure, joinRoutes, waitForJoinEffect, type JoinRoute } from "./join.ts";
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
import { print, printError } from "../output.ts";
const privateRoot = join(root, ".stackanvil", "integration");
const captureCli = join(root, "src", "capture", "cli.ts");
const captureUi = createCaptureUi({
  captureDirectory: async () => {
    const captures = join(root, ".stackanvil", "captures");
    const { id } = parseJson(
      CaptureIdSchema,
      await readFile(join(captures, "current.json"), "utf8"),
    );
    if (!/^[a-z0-9][a-z0-9-]{0,90}$/u.test(id)) throw new Error("Invalid capture session ID.");
    return join(captures, id);
  },
});
const CaptureIdSchema = Schema.Struct({ id: Schema.String });
const prismData = join(
  homedir(),
  ".var",
  "app",
  "org.prismlauncher.PrismLauncher",
  "data",
  "PrismLauncher",
);
const bdsSource = resolve(process.env["BEDROCK_SERVER_HOME"] ?? join(homedir(), "bedrock-server"));
const proxyBdsSource = resolve(process.env["STACKANVIL_JAVA_BEDROCK_SERVER_HOME"] ?? bdsSource);
const textFileEffect = Effect.fn("Integration.textFile")(function* (path: string) {
  return yield* existsSync(path)
    ? labIO("textFile", async () => readFile(path, "utf8"))
    : Effect.succeed("");
});
/** Sends SIGINT to a process or, for a negative ID, its process group. It may already be gone. */
function interrupt(pid: number): void {
  try {
    process.kill(pid, "SIGINT");
  } catch {
    /* Already stopped. */
  }
}
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
  timeoutMs: number = 90_000,
) {
  const deadline = (yield* Clock.currentTimeMillis) + timeoutMs;
  while ((yield* Clock.currentTimeMillis) < deadline) {
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
    const existingBytes = yield* labIO("download", async () => Bun.file(path).arrayBuffer());
    const existing = createHash(algorithm).update(new Uint8Array(existingBytes)).digest("hex");
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
  const configuredJar = yield* optionalEnv("STACKANVIL_JAVA_SERVER_JAR");
  if (configuredJar) return resolve(configuredJar);
  const manifest = yield* labRequestJson(
    "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json",
    Schema.Struct({
      versions: Schema.Array(Schema.Struct({ id: Schema.String, url: Schema.String })),
    }),
  );
  const version = manifest.versions.find((entry) => entry.id === "26.3");
  if (!version)
    return yield* labError(
      "vanillaServer",
      new Error("Minecraft 26.3 is missing from Mojang's version manifest."),
    );
  const metadata = yield* labRequestJson(
    version.url,
    Schema.Struct({
      downloads: Schema.Struct({
        server: Schema.Struct({ url: Schema.String, sha1: Schema.String }),
      }),
    }),
  );
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
  geyser: boolean = false,
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
      `generator-settings=${encodeJson({
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
  yield* waitForLogEffect(log, /Done \(/u, child, 120_000);
  if (geyser) {
    yield* waitForLogEffect(log, /\[StackAnvil Java Probe\] ready/u, child);
    yield* waitForLogEffect(log, /\[StackAnvil Geyser Probe\] ready/u, child);
    yield* waitForLogEffect(log, /Enabled extension Boar/u, child);
    yield* waitForLogEffect(log, /Started Geyser on.*127\.0\.0\.1/u, child);
  }
  return { child, log, port, bedrockPort };
});
const setServerProperty = (value: string, key: string, replacement: string) =>
  new RegExp(`^${key}=.*$`, "mu").test(value)
    ? value.replace(new RegExp(`^${key}=.*$`, "mu"), `${key}=${replacement}`)
    : `${value}\n${key}=${replacement}\n`;

const bedrockServerEffect = Effect.fn("Integration.bedrockServer")(function* (
  dir: string,
  source: string,
  name: string,
  entityProbe: boolean = false,
  resourceProbe?: { variant: "a" | "b"; run: string },
  inventoryUiProbe: boolean = false,
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
  let changed = properties;
  for (const [key, value] of Object.entries({
    "server-name": "StackAnvil Integration",
    transport: "nethernet",
    "server-port": String(port),
    "server-portv6": String(port + 1),
    "level-name": "integration-world",
    "online-mode": "false",
    "allow-list": "false",
    "allow-cheats": "true",
    "enable-lan-visibility": "false",
    "server-authoritative-movement-strict": "true",
  })) {
    changed = setServerProperty(changed, key, value);
  }
  if (entityProbe) {
    changed = setServerProperty(changed, "content-log-console-output-enabled", "true");
    changed = setServerProperty(changed, "content-log-level", "info");
    yield* labIO("bedrockServer", async () => installEntityProbe(home, "integration-world"));
  }
  if (inventoryUiProbe) {
    changed = setServerProperty(changed, "texturepack-required", "true");
    yield* labIO("bedrockServer", () => installInventoryUiProbe(home, "integration-world"));
  }
  if (resourceProbe) {
    changed = setServerProperty(changed, "texturepack-required", "true");
    yield* labIO("bedrockServer", async () =>
      installResourceProbe(home, "integration-world", resourceProbe.variant, resourceProbe.run),
    );
  }
  if (entityProbe || resourceProbe) {
    changed = setServerProperty(changed, "force-gamemode", "false");
    changed = setServerProperty(changed, "gamemode", "survival");
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
  const output = yield* waitForLogEffect(log, /Server started\./u, child);
  if (entityProbe)
    yield* waitForLogEffect(log, /\[ViaBedrock Entity Probe\] ready/u, child, 30_000);
  if (resourceProbe) {
    child.stdin?.write("tickingarea add circle 0 64 0 2 stackanvil_probe\n");
    yield* waitForLogEffect(log, /Added ticking area centered/u, child, 30_000);
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
  const version = /Version:\s*(\d+\.\d+\.\d+)/u.exec(output)?.[1];
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
  };
});
const viaProxyEffect = Effect.fn("Integration.viaProxy")(function* (
  dir: string,
  bedrockPort: number,
  version: string,
  name: string = "viaproxy",
  homeName: string = name,
) {
  const configuredJar = yield* optionalEnv("VIAPROXY_JAR");
  const jar = configuredJar
    ? resolve(configuredJar)
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
      viaProxyTarget(`nethernet://127.0.0.1:${bedrockPort}`),
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
  yield* waitForLogEffect(log, /Binding proxy server/u, child);
  return { child, log, port };
});
const preparePrismEffect = Effect.fn("Integration.preparePrism")(function* (
  profile: GraphicsProfile,
) {
  const name = integrationPrismNames[profile];
  const instance = yield* labIO("preparePrism", async () => installPrism(name));
  if (profile === "shaders") {
    yield* labIO("preparePrism", async () => installGraphicsProfile(instance));
    print("Testing Fabulously Optimized with the pinned Bedrock shader profile.");
  } else if (profile === "optimized") {
    const version = yield* labIO("preparePrism", async () => installModpack(instance));
    yield* labIO("preparePrism", async () => configureShaders(instance));
    print(`Testing Fabulously Optimized ${version} with StackAnvil.`);
  } else {
    const mods = join(instance, "minecraft", "mods");
    for (const file of yield* labIO("preparePrism", async () => readdir(mods))) {
      if (/^(?:iris|sodium)-.*\.jar$/iu.test(file))
        yield* labIO("preparePrism", async () => rm(join(mods, file)));
    }
  }
  return { instance, name };
});
const isolatedPrismRootEffect = Effect.fn("Integration.isolatedPrismRoot")(function* (
  dir: string,
  name: string,
) {
  const isolated = join(dir, `prism-${name}-${(yield* Clock.currentTimeMillis).toString(36)}`);
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
  runEntityProbe: boolean = false,
  gameplayCases: readonly GameplayCaseId[] = [],
  resource?: {
    variant: "a" | "b";
    label: string;
  },
  probeFailures?: string[],
  negativeControls: boolean = false,
) {
  const { instance, name } = yield* preparePrismEffect(profile);
  const prismRoot = yield* isolatedPrismRootEffect(
    dir,
    profile === "shaders" ? "shaders" : profile === "optimized" ? "modpack" : "plain",
  );
  if (gameplayCases.length > 0)
    yield* labIO("javaJoin", async () => installProbeGuiScale(instance));
  const serverLogStart = (yield* textFileEffect(target.log)).length;
  const proxyLog = target.proxyLog;
  const connectionLogStart = proxyLog ? (yield* textFileEffect(proxyLog)).length : 0;
  const clientLog = join(instance, "minecraft", "logs", "latest.log");
  yield* labIO("javaJoin", async () => rm(clientLog, { force: true }));
  const isolated = yield* labIO("javaJoin", async () => displayEnv(true));
  if (!isolated)
    return yield* labError(
      "javaJoin",
      new Error("Integration tests require the private Wayland display."),
    );
  const log = join(
    dir,
    `${route}-${profile === "shaders" ? "fabulously-optimized-shaders" : profile === "optimized" ? "fabulously-optimized" : "plain"}-launcher.log`,
  );
  const child = yield* startIntegrationProcess(
    "flatpak",
    [
      "run",
      ...flatpakWaylandArguments(isolated),
      `--filesystem=${join(root, ".stackanvil", "lab")}:ro`,
      `--filesystem=${prismRoot}`,
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
    Effect.gen(function* () {
      gamePid = yield* waitForGameProcessEffect(child, log, name);
      if (route === "java-bedrock" || route === "java-geyser") {
        yield* waitForLogEffect(
          clientLog,
          /Connecting to 127\.0\.0\.1/u,
          () => alive(gamePid),
          120_000,
        );
        if (route === "java-geyser" && proxyLog) {
          const proxyLogText = async () => (await textFile(proxyLog)).slice(connectionLogStart);
          const deadline = (yield* Clock.currentTimeMillis) + 120_000;
          while (true) {
            const proxyOutput = yield* labIO("javaJoin", async () => proxyLogText());
            if (/All resource packs have been loaded/u.test(proxyOutput)) break;
            if (!alive(gamePid))
              return yield* labError(
                "javaJoin",
                new Error("The Java client stopped before resource packs were ready."),
              );
            if ((yield* Clock.currentTimeMillis) > deadline)
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
        connectionLog: proxyLog
          ? async () => (await textFile(proxyLog)).slice(connectionLogStart)
          : undefined,
        clientAlive: () => alive(gamePid),
        timeoutMs: 150_000,
        dwellMs: 20_000,
        onJoin:
          route === "java-java"
            ? (joined) => {
                target.child.stdin?.write(
                  `execute at ${joined} run summon minecraft:interaction ~ ~ ~\n`,
                );
              }
            : undefined,
      });
      const clientOutput = yield* textFileEffect(clientLog);
      const shaderPack =
        profile === "shaders"
          ? (yield* labIO("javaJoin", async () => readGraphicsLock())).shader.filename
          : undefined;
      const renderingFailures = graphicsFailures(clientOutput, shaderPack);
      if (renderingFailures.length > 0)
        return yield* labError("javaJoin", new Error(renderingFailures.join(" ")));
      print(
        `PASS ${route}${profile === "shaders" ? "+fabulously-optimized-shaders" : profile === "optimized" ? "+fabulously-optimized" : ""}: ${player} joined and remained connected for 20s.`,
      );
      if (resource) {
        const resourceLog = yield* textFileEffect(clientLog);
        if (!/Reloading ResourceManager:.*server\//u.test(resourceLog)) {
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
        print(
          `PASS resource pack ${resource.label}: converted texture matched and Java loaded the pack.`,
        );
      }
      if (entityProbe && runEntityProbe) {
        for (const group of ["status", "metadata"] as const) {
          const logStart = (yield* textFileEffect(entityProbe.log)).length;
          entityProbe.child.stdin?.write(`scriptevent vbprobe:${group} auto\n`);
          // oxlint-disable-next-line eslint/no-loop-func -- gamePid is set before this loop and is not reassigned in it
          const result = yield* labIO("javaJoin", async () =>
            waitForProbe(
              group,
              async () => (await textFile(entityProbe.log)).slice(logStart),
              () => alive(gamePid) && alive(entityProbe.child.pid),
            ),
          );
          print(`PASS ${group} entity probe: ${result.passed} script actions accepted.`);
        }
      }
      if (gameplayCases.length > 0 && entityProbe) {
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
                target.proxyLog ? (await textFile(target.proxyLog)).slice(connectionLogStart) : "",
              ),
            inspectClient:
              route === "java-geyser"
                ? async (id, serverLog, event) => {
                    if (isOneOf(geyserCaseIds, id)) {
                      if (
                        !/Reloading ResourceManager:.*server\//u.test(await textFile(clientLog))
                      ) {
                        throw new Error(
                          "The Java client did not load the converted Geyser resource pack.",
                        );
                      }
                      if (!(await convertedGeyserTexturesMatch(join(dir, "viaproxy-geyser")))) {
                        throw new Error(
                          "The converted Geyser pack is missing the custom entity model or fixture textures.",
                        );
                      }
                      if (id.startsWith("custom-entity") || id === "complex-world") {
                        const deadline = Date.now() + 5000;
                        while (!geyserEntityUpdatesMatch(id, event.observed, await serverLog())) {
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
        ).pipe(
          Effect.catch((error) =>
            Effect.gen(function* () {
              if (!probeFailures) return yield* labError("javaJoin", error);
              probeFailures.push(String(error));
            }),
          ),
        );
      }
      return yield* textFileEffect(clientLog);
    }).pipe(
      Effect.catch((error) =>
        labError(
          "javaJoin",
          new Error(
            `${String(error)} Read ${clientLog}, ${log}${target.proxyLog ? `, and ${target.proxyLog}` : ""}.`,
          ),
        ),
      ),
    ),
    Effect.orDie(
      Effect.gen(function* () {
        if (gamePid !== undefined && alive(gamePid)) interrupt(gamePid);
        if (child.pid !== undefined && alive(child.pid)) interrupt(-child.pid);
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
  env: NodeJS.ProcessEnv = process.env,
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
    const currentText = yield* labIO("bedrockJoin", async () => readFile(current, "utf8"));
    const { id } = parseJson(CaptureIdSchema, currentText);
    const existingText = yield* labIO("bedrockJoin", async () =>
      readFile(join(root, ".stackanvil", "captures", id, "session.json"), "utf8"),
    );
    const existing = parseJson(
      Schema.Struct({ stoppedAt: Schema.optionalKey(Schema.String), proxyPid: Schema.Finite }),
      existingText,
    );
    if (!existing.stoppedAt && alive(existing.proxyPid))
      return yield* labError(
        "bedrockJoin",
        new Error("An HTTPS capture is active. Stop it before the native join test."),
      );
  }
  const label = `stackanvil-it-${(yield* Clock.currentTimeMillis).toString(36)}`;
  const port = yield* tcpPort;
  const env = { ...process.env, STACKANVIL_PROXY_PORT: String(port) };
  let session: string | undefined;
  return yield* Effect.ensuring(
    Effect.gen(function* () {
      yield* captureEffect(["start", "native-join"], env);
      const captureText = yield* labIO("bedrockJoin", async () => readFile(current, "utf8"));
      const captureId = parseJson(CaptureIdSchema, captureText).id;
      session = captureId;
      yield* captureEffect(["launch"]);
      const sessionPath = join(root, ".stackanvil", "captures", captureId, "session.json");
      const sessionText = yield* labIO("bedrockJoin", async () => readFile(sessionPath, "utf8"));
      const gamePid = parseJson(
        Schema.Struct({ gamePid: Schema.optionalKey(Schema.Finite) }),
        sessionText,
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
      yield* Effect.sleep(20_000);
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
        .split(/\s+/u)
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
        clientLog: () => textFile(join(root, ".stackanvil", "captures", captureId, "game.log")),
        clientAlive: () => alive(gamePid),
        timeoutMs: 90_000,
        dwellMs: 20_000,
      });
      yield* captureEffect(["ui", "screenshot", "native-joined"]);
      print(`PASS bedrock-bedrock: ${player} joined and remained connected for 20s.`);
    }).pipe(
      Effect.catch((error) =>
        labError(
          "bedrockJoin",
          new Error(
            `${String(error)} Private native capture: ${session ? join(root, ".stackanvil", "captures", session) : dir}.`,
          ),
        ),
      ),
    ),
    Effect.orDie(
      Effect.gen(function* () {
        if (session) {
          yield* captureEffect(["game-stop"]).pipe(
            Effect.catch(() =>
              Effect.sync(() => {
                /* The client may already have exited. */
              }),
            ),
          );
          yield* captureEffect(["stop"]).pipe(
            Effect.catch(() =>
              Effect.sync(() => {
                /* Preserve the original failure. */
              }),
            ),
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
    const lines = original.split(/(?<=\n)/u);
    const retained = lines.filter((line) => !line.includes(`:${name}:127.0.0.1:${port}:`));
    if (retained.length !== lines.length)
      yield* labIO("removeTemporaryServer", async () => writeFile(file, retained.join("")));
  }
});
export const mainEffect = Effect.fn("Integration.main")(function* () {
  const options = integrationOptions(Bun.argv.slice(2));
  if (options.help) {
    print(integrationHelp);
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
  const resourceRun = (yield* Clock.currentTimeMillis).toString(36);
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
  const requestedRoute = options.route;
  if (requestedRoute !== undefined && !isOneOf(joinRoutes, requestedRoute)) {
    return yield* labError(
      "main",
      new Error("Use --route java-java, java-bedrock, bedrock-bedrock, or java-geyser."),
    );
  }
  // Reject the route before building the route list so the retained Geyser paths stay type-checked.
  if (requestedRoute === "java-geyser")
    return yield* labError(
      "main",
      new Error(
        "The pinned Geyser fixture does not provide NetherNet. Use the java-bedrock route.",
      ),
    );
  const routes: JoinRoute[] =
    requestedRoute !== undefined
      ? [requestedRoute]
      : ["java-java", "java-bedrock", "bedrock-bedrock"];
  if (shaders && !routes.some((candidate) => candidate.startsWith("java-")))
    return yield* labError("main", new Error("--shaders requires a Java client route."));
  const geyserRoute = routes.includes("java-geyser");
  const requestedInput = gameplayInput?.split(",") ?? [];
  const requestedCases = requestedInput.filter((id) => isOneOf(allGameplayCaseIds, id));
  const gameplayCases: GameplayCaseId[] = [
    ...new Set([
      ...(complexGameplay ? complexGameplayCaseIds : []),
      ...(geyserProbe ? geyserCaseIds : []),
      ...(gameplayInput
        ? requestedCases
        : gameplayProbe
          ? gameplayCasesForBackend(geyserRoute)
          : []),
      ...(negativeControls ? ["chest-transfer" as const] : []),
    ]),
  ];
  if (requestedCases.length !== requestedInput.length)
    return yield* labError(
      "main",
      new Error(`Unknown gameplay case. Use: ${allGameplayCaseIds.join(", ")}.`),
    );
  if (geyserRoute && gameplayCases.some((id) => isOneOf(complexGameplayCaseIds, id))) {
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
    (geyserProbe || negativeControls || gameplayCases.some((id) => isOneOf(geyserCaseIds, id))) &&
    !geyserRoute
  ) {
    return yield* labError(
      "main",
      new Error("Geyser cases and negative controls require --route java-geyser."),
    );
  }
  if (geyserRoute && gameplayCases.some((value) => isAuthoredInventoryCase(value))) {
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
  if (gameplayCases.length > 0 && !routes.includes("java-bedrock") && !geyserRoute)
    return yield* labError(
      "main",
      new Error("Gameplay cases require java-bedrock or java-geyser."),
    );
  if ((entityProbe || gameplayCases.length > 0 || resourceProbe) && modpackOnly)
    return yield* labError("main", new Error("Probe cases require the plain Java client run."));
  if ((yield* optionalEnv("STACKANVIL_USE_DESKTOP")) === "1")
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
  const now = yield* DateTime.now;
  const dir = join(privateRoot, "runs", DateTime.formatIso(now).replaceAll(/[:.]/gu, "-"));
  yield* labIO("main", async () => mkdir(dir, { recursive: true, mode: 0o700 }));
  print(`Private logs: ${dir}`);
  yield* (yield* IntegrationResources).acquireDisplay(ensureDisplay);
  return yield* Effect.gen(function* () {
    const probeFailures: string[] = [];
    const java = routes.includes("java-java") ? yield* javaServerEffect(dir) : undefined;
    const geyser = geyserRoute ? yield* javaServerEffect(dir, true) : undefined;
    const geyserProxy = geyser?.bedrockPort
      ? yield* viaProxyEffect(dir, geyser.bedrockPort, geyserBedrockVersion, "viaproxy-geyser")
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
          gameplayCases.some((value) => isAuthoredInventoryCase(value)),
        )
      : undefined;
    const proxy = proxyBedrock
      ? yield* viaProxyEffect(dir, proxyBedrock.port, proxyBedrock.version)
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
        if (gameplayCases.length > 0) {
          yield* javaJoinEffect(route, "plain", dir, target);
          print("PASS Geyser reconnect: the Java client rejoined the same Paper world.");
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
              entityProbe || gameplayCases.length > 0 || resourceProbe ? proxyBedrock : undefined,
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
          print("PASS resource pack cache: unchanged content reused the conversion.");
          if (proxy.child.pid !== undefined && alive(proxy.child.pid))
            process.kill(-proxy.child.pid, "SIGINT");
          for (let attempt = 0; attempt < 40 && alive(proxy.child.pid); attempt++)
            yield* Effect.sleep(250);
          if (alive(proxy.child.pid))
            return yield* labError(
              "main",
              new Error("ViaProxy did not stop before the changed resource pack run."),
            );
          if (proxyBedrock.child.pid !== undefined && alive(proxyBedrock.child.pid))
            process.kill(-proxyBedrock.child.pid, "SIGINT");
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
          print("PASS resource pack cache: changed content produced a new conversion.");
          modpackProxy = changedProxy;
          modpackBedrock = changedServer;
        } else if (gameplayCases.length > 0) {
          yield* javaJoinEffect(route, "plain", dir, {
            ...proxy,
            log: proxyBedrock.log,
            proxyLog: proxy.log,
          });
          print("PASS gameplay reconnect: the Java client rejoined the same Bedrock world.");
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
    if (probeFailures.length > 0)
      return yield* labError("main", new Error(probeFailures.join("\n")));
  });
});
// SDK callbacks expose Promises at their boundary.
function textFile(path: string) {
  return Effect.runPromise(textFileEffect(path));
}
function capture(args: string[], env = process.env) {
  return Effect.runPromise(captureEffect(args, env));
}
if (import.meta.main) {
  try {
    await runLabCommand(
      Effect.scoped(mainEffect().pipe(Effect.provide(integrationResourcesLayer(stopDisplay)))),
    );
  } catch (error: unknown) {
    printError(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
