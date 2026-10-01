import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { delimiter, join, resolve } from "node:path";
import { promisify } from "node:util";
import { Effect } from "effect";
import { root } from "../model.ts";
import pins from "../../integration/geyser.json";

const execute = promisify(execFile);
const source = join(root, "test-packs", "java-probe");
const cache = join(root, ".stackanvil", "integration", "geyser-build");
export const geyserBedrockVersion = pins.bedrock;
export const geyserCaseIds = ["custom-entity-attack", "custom-entity-interact", "custom-item-transfer",
  "custom-block-break", "custom-block-place", "complex-world"] as const;
export const geyserNegativeControlIds = ["chest-transfer", ...geyserCaseIds] as const;

export function geyserEntityUpdatesMatch(id: string, observed: unknown, log: string): boolean {
  if (!observed || typeof observed !== "object") return false;
  const value = observed as Record<string, unknown>;
  const updates = [...log.matchAll(/\[StackAnvil Geyser Probe\] entity=([0-9a-f-]{36}) phase=(\d+) health=([\d.]+)/g)]
    .map((match) => ({ uuid: match[1], phase: Number(match[2]), health: Number(match[3]) }));
  if (id === "complex-world") {
    if (!Array.isArray(value.entityIds) || value.entityIds.length !== 24 || new Set(value.entityIds).size !== 24) return false;
    return value.entityIds.every((uuid) => new Set(updates.filter((update) => update.uuid === uuid).map((update) => update.phase)).size > 1);
  }
  if (typeof value.uuid !== "string") return false;
  if (id === "custom-entity-attack") {
    return typeof value.health === "number" && value.health < 20 && updates.some((update) =>
      update.uuid === value.uuid && Math.abs(update.health * 20 - (value.health as number)) < 0.001);
  }
  return id === "custom-entity-interact" && value.phase === 1
    && updates.some((update) => update.uuid === value.uuid && update.phase === value.phase);
}

export async function convertedGeyserTexturesMatch(proxyHome: string): Promise<boolean> {
  const converted = join(proxyHome, "viabedrock", "server_packs", "converted");
  const expected = await Promise.all(["items/probe_token.png", "entity/probe.png", "blocks/probe_block.png"]
    .map((name) => Bun.file(join(source, "resource_pack", "textures", name)).arrayBuffer().then((bytes) => Buffer.from(bytes))));
  for (const file of await readdir(converted)) {
    if (!file.endsWith(".zip")) continue;
    const zip = join(converted, file);
    const { stdout } = await execute("unzip", ["-Z1", zip]);
    const entries = stdout.trim().split("\n");
    const item = "assets/viabedrock/textures/item/item_textures/items/probe_token.png";
    const entity = "assets/viabedrock/textures/item/entities/entity/probe.png";
    const blocks = entries.filter((name) => /^assets\/viabedrock\/textures\/block\/custom\/slot_\d+\.png$/.test(name));
    if (!entries.includes(item) || !entries.includes(entity)
      || !entries.includes("assets/viabedrock/models/entities/stackanvil/probe_entity/default_default.json")) continue;
    const read = async (path: string) => (await execute("unzip", ["-p", zip, path], { encoding: "buffer", maxBuffer: 16 * 1024 * 1024 })).stdout;
    if (!(await read(item)).equals(expected[0]!) || !(await read(entity)).equals(expected[1]!)) continue;
    for (const block of blocks) {
      if ((await read(block)).equals(expected[2]!) && entries.includes(block.replace("/textures/", "/models/").replace(/\.png$/, ".json"))) return true;
    }
  }
  return false;
}

export function verifyGeyserArtifact(bytes: Uint8Array, expected: string): void {
  if (createHash("sha256").update(bytes).digest("hex") !== expected) {
    throw new Error("Geyser fixture artifact checksum mismatch.");
  }
}

async function artifact(name: keyof typeof pins.artifacts): Promise<string> {
  const pin = pins.artifacts[name];
  const file = join(cache, `${name}-${pin.sha256}.jar`);
  if (await Bun.file(file).exists()) {
    verifyGeyserArtifact(new Uint8Array(await Bun.file(file).arrayBuffer()), pin.sha256);
    return file;
  }
  const response = await fetch(pin.url, {
    headers: { "User-Agent": "StackAnvil/1.0 (https://github.com/StackAnvil/patches)" },
  });
  if (!response.ok) throw new Error(`Cannot download ${name}: HTTP ${response.status}.`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  verifyGeyserArtifact(bytes, pin.sha256);
  await writeFile(file, bytes, { mode: 0o600 });
  return file;
}

async function files(dir: string, suffix: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const paths = await Promise.all(entries.map((entry) => entry.isDirectory()
    ? files(join(dir, entry.name), suffix) : Promise.resolve(entry.name.endsWith(suffix) ? [join(dir, entry.name)] : [])));
  return paths.flat();
}

export async function buildJavaProbe(): Promise<{ paper: string; geyser: string; viaversion: string; plugin: string; extension: string }> {
  await mkdir(cache, { recursive: true, mode: 0o700 });
  const [paper, geyser, viaversion] = await Promise.all([artifact("paper"), artifact("geyser"), artifact("viaversion")]);
  const runtime = join(cache, `paper-${pins.artifacts.paper.sha256}`);
  await mkdir(runtime, { recursive: true });
  // Paperclip resolves and verifies the API and runtime dependencies of this pinned server.
  await execute("java", ["-Dpaperclip.patchonly=true", "-jar", paper], { cwd: runtime, maxBuffer: 16 * 1024 * 1024 });
  const classpath = [...await files(join(runtime, "libraries"), ".jar"), ...await files(join(runtime, "versions"), ".jar"), geyser].join(delimiter);
  for (const module of ["plugin", "extension"] as const) {
    const classes = join(cache, `${module}-classes`);
    await rm(classes, { recursive: true, force: true });
    await mkdir(classes, { recursive: true });
    await execute("javac", ["--release", "25", "-encoding", "UTF-8", "-classpath", classpath, "-d", classes,
      ...await files(join(source, module, "src"), ".java")], { cwd: root, maxBuffer: 16 * 1024 * 1024 });
    await execute("jar", ["--create", "--file", join(cache, `${module}.jar`), "-C", classes, ".",
      "-C", join(source, module, "resources"), "."], { cwd: root });
  }
  return { paper, geyser, viaversion, plugin: join(cache, "plugin.jar"), extension: join(cache, "extension.jar") };
}

export function geyserConfig(port: number): string {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid Geyser UDP port.");
  return `bedrock:
  address: 127.0.0.1
  port: ${port}
  clone-remote-port: false
java:
  auth-type: offline
gameplay:
  enable-custom-content: true
  force-resource-packs: true
advanced:
  bedrock:
    broadcast-port: ${port}
    validate-bedrock-login: false
config-version: 8
`;
}

export async function installJavaProbe(home: string, port: number): Promise<string> {
  const artifacts = await buildJavaProbe();
  const plugins = join(home, "plugins");
  const geyserHome = join(plugins, "Geyser-Spigot");
  await mkdir(join(geyserHome, "extensions"), { recursive: true, mode: 0o700 });
  await mkdir(join(geyserHome, "packs"), { recursive: true });
  for (const [name, file] of Object.entries({ "Geyser-Spigot": artifacts.geyser, ViaVersion: artifacts.viaversion, StackAnvilProbe: artifacts.plugin })) {
    await cp(file, join(plugins, `${name}.jar`));
  }
  await cp(artifacts.extension, join(geyserHome, "extensions", "StackAnvilProbe.jar"));
  await cp(join(source, "custom_mappings"), join(geyserHome, "custom_mappings"), { recursive: true });
  await writeFile(join(geyserHome, "config.yml"), geyserConfig(port));
  const pack = join(cache, "resource_pack");
  await rm(pack, { recursive: true, force: true });
  await cp(join(source, "resource_pack"), pack, { recursive: true });
  // Give each run distinct pack content so a client cache cannot conceal fixture changes.
  await writeFile(join(pack, "stackanvil-run.txt"), home);
  await execute("jar", ["--create", "--no-manifest", "--file", join(geyserHome, "packs", "probe.mcpack"), "-C", pack, "."]);
  await writeFile(join(home, "geyser-pins.json"), `${JSON.stringify(pins, null, 2)}\n`);
  return artifacts.paper;
}

if (import.meta.main) {
  Effect.runPromise(Effect.tryPromise({ try: async () => {
    const destination = resolve(Bun.argv[2] ?? join(root, "dist", "test-packs", "java-probe"));
    await mkdir(destination, { recursive: true });
    await installJavaProbe(destination, 19132);
    console.log(destination);
  }, catch: (cause) => cause instanceof Error ? cause : new Error(String(cause)) }))
    .catch((error: unknown) => { console.error(error); process.exitCode = 1; });
}
