import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { Effect } from "effect";
import { root } from "../model.ts";
import { installPrism } from "../prism.ts";
import { installModpack, verifiedDownload, type PackFile } from "./modpack.ts";

export type GraphicsProfile = "plain" | "optimized" | "shaders";
export const integrationPrismNames: Record<GraphicsProfile, string> = {
  plain: "StackAnvil Integration 26.3",
  optimized: "Fabulously Optimized StackAnvil Integration 26.3",
  shaders: "Fabulously Optimized Shaders StackAnvil Integration 26.3",
};

interface GraphicsLock {
  minecraft: string;
  replacements: Record<string, PackFile>;
  shader: { filename: string; downloads: string[]; sha512: string; options: Record<string, string> };
}

export async function readGraphicsLock(): Promise<GraphicsLock> {
  const lock = JSON.parse(await readFile(join(root, "integration/modpacks/bedrock-shaders.json"), "utf8")) as GraphicsLock;
  if (!/^[A-Za-z0-9_.+-]+\.zip$/.test(lock.shader.filename) || !/^[a-f0-9]{128}$/.test(lock.shader.sha512)) {
    throw new Error("Invalid Bedrock shader lock file.");
  }
  return lock;
}

/** Preserve unrelated Iris preferences while replacing every managed key, including duplicates. */
export function updateProperties(text: string, values: Readonly<Record<string, string>>): string {
  const lines = text.split(/\r?\n/).filter((line) => {
    const key = /^\s*([^#!\s=:]+)\s*[=:]/.exec(line)?.[1];
    return !key || !Object.hasOwn(values, key);
  });
  while (lines.at(-1) === "") lines.pop();
  return [...lines, ...Object.entries(values).map(([key, value]) => `${key}=${value}`), ""].join("\n");
}

export async function configureShaders(instance: string, shader?: GraphicsLock["shader"]): Promise<void> {
  const game = join(instance, "minecraft");
  const config = join(game, "config");
  await mkdir(config, { recursive: true, mode: 0o700 });
  if (shader) {
    await mkdir(join(game, "shaderpacks"), { recursive: true, mode: 0o700 });
    await writeFile(join(game, "shaderpacks", `${shader.filename}.txt`), updateProperties("", shader.options), { mode: 0o600 });
    await writeFile(join(config, "lambdynlights.toml"), 'mode = "fancy"\n[light_sources]\nentities = true\nself = true\n', { mode: 0o600 });
  }
  // Modpack Defaults can restore Iris preferences on the first launch. Set both copies.
  for (const path of [join(config, "iris.properties"), join(config, "modpack_defaults/config/iris.properties")]) {
    const previous = existsSync(path) ? await readFile(path, "utf8") : "";
    await mkdir(dirname(path), { recursive: true, mode: 0o700 });
    await writeFile(path, updateProperties(previous, {
      enableShaders: String(!!shader), shaderPack: shader?.filename ?? "",
      ...(shader ? { maxShadowRenderDistance: "12" } : {}),
    }), { mode: 0o600 });
  }
  if (shader) await copyFile(join(config, "lambdynlights.toml"), join(config, "modpack_defaults/config/lambdynlights.toml"));
}

export async function installGraphicsProfile(instance: string): Promise<void> {
  const lock = await readGraphicsLock();
  const pack = JSON.parse(await readFile(join(instance, "mmc-pack.json"), "utf8")) as { components: { uid: string; version: string }[] };
  if (pack.components.find((component) => component.uid === "net.minecraft")?.version !== lock.minecraft) {
    throw new Error(`The shader profile requires Minecraft ${lock.minecraft}.`);
  }
  const cached = join(root, ".stackanvil/integration/cache/shaders", lock.shader.sha512);
  await verifiedDownload(lock.shader.downloads, cached, lock.shader.sha512);
  await installModpack(instance, lock.replacements);
  const shaders = join(instance, "minecraft/shaderpacks");
  await mkdir(shaders, { recursive: true, mode: 0o700 });
  await copyFile(cached, join(shaders, lock.shader.filename));
  await configureShaders(instance, lock.shader);
  await writeFile(join(instance, ".stackanvil-graphics.json"), `${JSON.stringify(lock, null, 2)}\n`, { mode: 0o600 });
}

export function graphicsFailures(clientLog: string, shaderFilename?: string): string[] {
  const failures: string[] = [];
  if (shaderFilename && !clientLog.split(/\r?\n/).some((line) => line.endsWith(`Using shaderpack: ${shaderFilename}`))) {
    failures.push("Iris did not activate the pinned shader pack.");
  }
  if (/Missing program viafabricplus-bedrock:pipeline\//.test(clientLog)) {
    failures.push("Iris has no override for a Bedrock render pipeline; actor vertex formats can disagree.");
  }
  if (/Failed to create shader rendering pipeline|Shader compilation failed|Failed to compile shader/.test(clientLog)) {
    failures.push("The client failed to compile or activate its shader pipeline.");
  }
  return failures;
}

if (import.meta.main) {
  Effect.runPromise(Effect.tryPromise({ try: async () => {
    const instance = await installPrism(integrationPrismNames.shaders);
    await installGraphicsProfile(instance);
    console.log(`Prepared ${integrationPrismNames.shaders}: ${instance}`);
  }, catch: (cause) => cause instanceof Error ? cause : new Error(String(cause)) }))
    .catch((error: unknown) => { console.error(error); process.exitCode = 1; });
}
