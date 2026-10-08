import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { promisify } from "node:util";
import { root } from "./model.ts";
import { clientArtifacts } from "./client-artifacts.ts";

const execute = promisify(execFile);
const bundleRoot = join(root, ".stackanvil", "prism-bundle");
const prismHome = join(homedir(), ".var", "app", "org.prismlauncher.PrismLauncher", "data", "PrismLauncher", "instances");
const prismInstance = process.env.STACKANVIL_JAVA_INSTANCE ?? "StackAnvil 26.3";

async function prepareFiles(): Promise<{ directory: string; version: string }> {
  const { baseJar, addonJar, version, loader } = await clientArtifacts();
  const lwjgl = "3.4.3";
  await rm(bundleRoot, { recursive: true, force: true });
  const modsDir = join(bundleRoot, "minecraft", "mods");
  await mkdir(modsDir, { recursive: true });
  await copyFile(baseJar, join(modsDir, basename(baseJar)));
  await copyFile(addonJar, join(modsDir, basename(addonJar)));
  const pack = {
    components: [
      { cachedName: "LWJGL 3", cachedVersion: lwjgl, dependencyOnly: true, uid: "org.lwjgl3", version: lwjgl },
      { cachedName: "Minecraft", cachedRequires: [{ suggests: lwjgl, uid: "org.lwjgl3" }], cachedVersion: version,
        important: true, uid: "net.minecraft", version },
      { cachedName: "Intermediary Mappings", cachedRequires: [{ equals: version, uid: "net.minecraft" }],
        cachedVersion: version, dependencyOnly: true, uid: "net.fabricmc.intermediary", version },
      { cachedName: "Fabric Loader", cachedRequires: [{ uid: "net.fabricmc.intermediary" }],
        cachedVersion: loader, uid: "net.fabricmc.fabric-loader", version: loader },
    ],
    formatVersion: 1,
  };
  await writeFile(join(bundleRoot, "mmc-pack.json"), `${JSON.stringify(pack, null, 2)}\n`);
  await writeFile(join(bundleRoot, "instance.cfg"), `[General]\nConfigVersion=1.3\nInstanceType=OneSix\nAutomaticJava=true\nOverrideJavaLocation=false\nname=StackAnvil ${version}\niconKey=default\n`);
  return { directory: bundleRoot, version };
}

export async function bundlePrism(): Promise<string> {
  const { directory, version } = await prepareFiles();
  const output = join(root, "dist", "prism");
  await mkdir(output, { recursive: true });
  const file = join(output, `StackAnvil-${version}-Prism-Launcher_Config.zip`);
  await rm(file, { force: true });
  await execute("zip", ["-q", "-r", file, "instance.cfg", "mmc-pack.json", "minecraft"], { cwd: directory });
  await execute("unzip", ["-tq", file]);
  return file;
}

export async function prismProcess(instanceName: string): Promise<number | undefined> {
  const { stdout } = await execute("ps", ["-eo", "pid=,args="], { maxBuffer: 8 * 1024 * 1024 });
  for (const line of stdout.split("\n")) {
    const match = /^\s*(\d+)\s+(.+)$/.exec(line);
    if (match?.[2]?.includes("org.prismlauncher.EntryPoint") && match[2].includes(instanceName)) return Number(match[1]);
  }
  return undefined;
}

export async function installPrism(instanceName = prismInstance): Promise<string> {
  if (await prismProcess(instanceName)) throw new Error(`Prism instance ${instanceName} is already running. Close it before changing its mods.`);
  const { directory, version } = await prepareFiles();
  const destination = join(prismHome, instanceName);
  const marker = join(destination, ".stackanvil-managed");
  if (existsSync(destination) && !existsSync(marker)) {
    throw new Error(`Prism instance ${instanceName} already exists and is not managed by StackAnvil`);
  }
  const mods = join(destination, "minecraft", "mods");
  await mkdir(mods, { recursive: true });
  const previous = existsSync(marker) ? JSON.parse(await readFile(marker, "utf8")) as { files: string[] } : { files: [] };
  for (const file of previous.files) {
    if (/^[A-Za-z0-9.+-]+\.jar$/.test(file)) await rm(join(mods, file), { force: true });
  }
  const files = (await readdir(join(directory, "minecraft", "mods"))).filter((file) => file.endsWith(".jar"));
  for (const file of files) {
    const source = join(directory, "minecraft", "mods", file);
    await copyFile(source, join(mods, file));
  }
  await copyFile(join(directory, "mmc-pack.json"), join(destination, "mmc-pack.json"));
  if (!existsSync(join(destination, "instance.cfg"))) {
    await copyFile(join(directory, "instance.cfg"), join(destination, "instance.cfg"));
  }
  const optionsFile = join(destination, "minecraft", "options.txt");
  const options = existsSync(optionsFile) ? await readFile(optionsFile, "utf8") : "";
  await writeFile(optionsFile, /^soundCategory_master:.*$/m.test(options)
    ? options.replace(/^soundCategory_master:.*$/m, "soundCategory_master:0.0")
    : `${options}${options.endsWith("\n") || !options ? "" : "\n"}soundCategory_master:0.0\n`);
  await writeFile(marker, `${JSON.stringify({ version, files }, null, 2)}\n`);
  return destination;
}
