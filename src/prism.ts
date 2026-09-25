import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { promisify } from "node:util";
import { root } from "./model.ts";

const execute = promisify(execFile);
const bundleRoot = join(root, ".stackanvil", "prism-bundle");
const prismHome = join(homedir(), ".var", "app", "org.prismlauncher.PrismLauncher", "data", "PrismLauncher", "instances");
const prismInstance = process.env.STACKANVIL_JAVA_INSTANCE ?? "StackAnvil 26.3";

interface ArtifactManifest { artifacts: { file: string; sha256: string }[] }
interface FabricMod { id: string; version: string; depends: { minecraft: string }; jars?: { file: string }[] }

async function artifact(project: string): Promise<string> {
  const dir = join(root, "dist", project);
  const manifest = JSON.parse(await readFile(join(dir, "manifest.json"), "utf8")) as ArtifactManifest;
  if (manifest.artifacts.length !== 1) throw new Error(`Expected one ${project} release JAR`);
  const entry = manifest.artifacts[0]!;
  const file = join(dir, entry.file);
  const digest = createHash("sha256").update(Buffer.from(await Bun.file(file).arrayBuffer())).digest("hex");
  if (digest !== entry.sha256) throw new Error(`Build checksum failed for ${project}`);
  return file;
}

async function mod(file: string): Promise<FabricMod> {
  const { stdout } = await execute("unzip", ["-p", file, "fabric.mod.json"], { maxBuffer: 1024 * 1024 });
  return JSON.parse(stdout) as FabricMod;
}

async function prepareFiles(): Promise<{ directory: string; version: string }> {
  const baseJar = await artifact("viafabricplus");
  const addonJar = await artifact("viafabricplus-bedrock");
  const [base, addon] = await Promise.all([mod(baseJar), mod(addonJar)]);
  if (base.id !== "viafabricplus" || addon.id !== "viafabricplus-bedrock") throw new Error("The two Fabric mod IDs do not match the expected stack");
  if (base.depends.minecraft !== addon.depends.minecraft) throw new Error("ViaFabricPlus and its Bedrock add-on target different Minecraft versions");
  for (const name of ["ViaBedrock", "cubeconverter"]) {
    if (!addon.jars?.some(({ file }) => file.toLowerCase().includes(name.toLowerCase()) && file.endsWith("-StackAnvil.jar"))) {
      throw new Error(`The add-on does not embed the StackAnvil ${name} JAR`);
    }
  }
  const version = base.depends.minecraft;
  const loader = "0.19.5";
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

export async function installPrism(instanceName = prismInstance): Promise<string> {
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
  const files = (await readdir(join(directory, "minecraft", "mods"))).filter((file) => file.endsWith("-StackAnvil.jar"));
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
