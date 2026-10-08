import { createHash } from "node:crypto";
import { mkdir, readFile, link, unlink, stat, writeFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { builtinUiManifest } from "../src/bedrock-ui.ts";
import { assetZip, readBedrockArchive } from "./bundle-bedrock-assets.ts";

/** Build-time inputs come from an acquired package. Runtime consumers use the resulting JAR resource. */
export async function planBedrockUi(game: string, version: string, output: string) {
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(version)) throw new Error("Expected a four-part Bedrock version");
  const protocol = version.split(".").slice(0, 3).join(".");
  const manifest = JSON.parse(await readFile(join(game, "data", "resource_packs", `vanilla_${protocol}`, "manifest.json"), "utf8"));
  if (manifest.header.version.join(".") !== protocol) throw new Error("Bedrock resource version mismatch");
  const files = new Map<string, Uint8Array>();
  const sources: { path: string; sha256: string; entries: number }[] = [];
  for (const pack of ["vanilla_base", "vanilla"]) {
    const path = join(game, "data", "resource_packs", pack, "__brarchive", "ui.brarchive");
    const original = `${path}.bol-orig`;
    const selected = await stat(original).then((info) => info.isFile() ? original : path).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
      return path;
    });
    const bytes = await readFile(selected);
    const entries = readBedrockArchive(bytes);
    sources.push({ path: selected, sha256: createHash("sha256").update(bytes).digest("hex"), entries: entries.size });
    for (const [name, contents] of entries) {
      if (!name.endsWith(".json") || !contents.length) continue;
      if (contents.length > 1024 * 1024) throw new Error("UI definition exceeds the file limit");
      const document: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(contents));
      if (typeof document !== "object" || document === null || Array.isArray(document)) throw new Error("Invalid UI definition");
      files.set(`ui/${name}`, contents);
    }
  }
  for (const pack of ["vanilla_base", "vanilla"]) {
    const archive = join(game, "data", "resource_packs", pack, "__brarchive", "textures", "ui.brarchive");
    const bytes = await readFile(archive);
    const entries = readBedrockArchive(bytes);
    sources.push({ path: archive, sha256: createHash("sha256").update(bytes).digest("hex"), entries: entries.size });
    for (const [name, contents] of entries) {
      if (contents.length && /\.(png|json)$/.test(name)) files.set(`textures/ui/${name}`, contents);
    }
    const loose = join(game, "data", "resource_packs", pack, "textures", "ui");
    async function addLoose(directory: string, prefix: string): Promise<void> {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        if (entry.isSymbolicLink()) throw new Error("UI assets contain a symbolic link");
        const selected = join(directory, entry.name);
        const path = `${prefix}/${entry.name}`;
        if (entry.isDirectory()) await addLoose(selected, path);
        else if (entry.isFile() && /\.(png|json)$/.test(entry.name)) {
          const bytes = await readFile(selected);
          if (bytes.length > 16 * 1024 * 1024) throw new Error("UI image exceeds the file limit");
          if (bytes.length) {
            files.set(path, bytes);
            sources.push({ path: selected, sha256: createHash("sha256").update(bytes).digest("hex"), entries: 1 });
          }
        }
      }
    }
    await addLoose(loose, "textures/ui").catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
    });
  }
  for (const pack of ["vanilla_base", "vanilla"]) {
    const root = join(game, "data", "resource_packs", pack);
    const archive = join(root, "__brarchive", "font.brarchive");
    const bytes = await readFile(archive).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
      return undefined;
    });
    if (bytes) {
      const entries = readBedrockArchive(bytes);
      sources.push({ path: archive, sha256: createHash("sha256").update(bytes).digest("hex"), entries: entries.size });
      for (const [name, contents] of entries) {
        if (contents.length && /\.(ttf|json)$/.test(name)) files.set(`font/${name}`, contents);
      }
    }
    async function addFonts(directory: string, prefix: string): Promise<void> {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        if (entry.isSymbolicLink()) throw new Error("UI fonts contain a symbolic link");
        const selected = join(directory, entry.name), path = `${prefix}/${entry.name}`;
        if (entry.isDirectory()) await addFonts(selected, path);
        else if (entry.isFile() && /\.(ttf|json)$/.test(entry.name)) {
          const bytes = await readFile(selected);
          if (bytes.length > 16 * 1024 * 1024) throw new Error("UI font exceeds the file limit");
          if (bytes.length) {
            files.set(path, bytes);
            sources.push({ path: selected, sha256: createHash("sha256").update(bytes).digest("hex"), entries: 1 });
          }
        }
      }
    }
    await addFonts(join(root, "font"), "font").catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
    });
  }
  if (files.size > 4096 || [...files.values()].reduce((total, bytes) => total + bytes.length, 0) > 64 * 1024 * 1024) {
    throw new Error("Built-in UI bundle exceeds limits");
  }
  if (!files.has("ui/server_form.json") || !files.has("ui/ui_common.json")) throw new Error("Incomplete built-in UI");
  files.set("NOTICE.txt", Buffer.from(`Minecraft: Bedrock Edition ${version} built-in UI definitions.\nCopyright Mojang AB and Microsoft.\nNative file contents are unchanged.\n`));
  const bytes = assetZip(files);
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  return { bytes, preview: { version, output, manifest: `${output}.manifest.json`, sha256, size: bytes.length, files: files.size, sources } };
}

export async function applyBedrockUi(plan: Awaited<ReturnType<typeof planBedrockUi>>) {
  const metadata = Buffer.from(`${JSON.stringify(builtinUiManifest(plan.preview.version, plan.bytes), null, 2)}\n`);
  const targets = [[plan.preview.output, plan.bytes], [plan.preview.manifest, metadata]] as const;
  for (const [path] of targets) {
    const exists = await stat(path).then(() => true).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
      return false;
    });
    if (exists) throw new Error("UI output already exists; choose a fresh reviewed destination");
  }
  await mkdir(dirname(plan.preview.output), { recursive: true });
  const published: string[] = [];
  try {
    for (const [output, bytes] of targets) {
      const staging = `${output}.staging`;
      await writeFile(staging, bytes, { flag: "wx" });
      try {
        // Linking publishes completed bytes atomically and never replaces another writer's output.
        await link(staging, output);
        published.push(output);
      } finally {
        await unlink(staging);
      }
    }
  } catch (error) {
    for (const path of published.reverse()) await unlink(path);
    throw error;
  }
  return plan.preview;
}

if (import.meta.main) {
  const [game, version, output, ...flags] = process.argv.slice(2);
  if (!game || !version || !output || flags.some((flag) => !["--dry-run", "--verbose"].includes(flag))) {
    throw new Error("Usage: bun scripts/bundle-bedrock-ui.ts <game-directory> <version> <fresh-output.zip> [--dry-run] [--verbose]");
  }
  const plan = await planBedrockUi(game, version, output);
  console.log(JSON.stringify(plan.preview, null, flags.includes("--verbose") ? 2 : 0));
  if (!flags.includes("--dry-run")) await applyBedrockUi(plan);
}
