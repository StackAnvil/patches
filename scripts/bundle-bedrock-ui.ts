import { createHash } from "node:crypto";
import { mkdir, readFile, link, unlink, stat, writeFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { builtinUiManifest, verifyBuiltinUiContents } from "../src/bedrock-ui.ts";
import { assetZip, readBedrockArchive } from "./bundle-bedrock-assets.ts";

/** Build-time inputs come from an acquired package. Runtime consumers use the resulting JAR resource. */
export async function planBedrockUi(game: string, version: string, output: string) {
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(version)) throw new Error("Expected a four-part Bedrock version");
  const protocol = version.split(".").slice(0, 3).join(".");
  const manifest = JSON.parse(await readFile(join(game, "data", "resource_packs", `vanilla_${protocol}`, "manifest.json"), "utf8"));
  if (manifest.header.version.join(".") !== protocol) throw new Error("Bedrock resource version mismatch");
  const files = new Map<string, Uint8Array>();
  const sources: { path: string; sha256: string; entries: number }[] = [];
  const categories = [
    { path: "ui", formats: /\.json$/, limit: 1024 * 1024, required: true },
    { path: "textures/ui", formats: /\.(png|jpg|tga|json)$/, limit: 16 * 1024 * 1024, required: true },
    { path: "font", formats: /\.(ttf|png|json)$/, limit: 16 * 1024 * 1024, required: false },
  ];
  for (const pack of ["vanilla_base", "vanilla"]) {
    const root = join(game, "data", "resource_packs", pack);
    for (const category of categories) {
      function add(path: string, contents: Uint8Array): void {
        if (!contents.length || !category.formats.test(path)) return;
        // Native MSDF atlases are not consumed by the current TTF UI renderer.
        if (category.path === "font" && path.startsWith("font/smooth/") && path.endsWith(".png")) return;
        if (contents.length > category.limit) throw new Error(`UI asset exceeds the file limit: ${path}`);
        if (category.path === "ui") {
          const document: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(contents));
          if (typeof document !== "object" || document === null || Array.isArray(document)) throw new Error("Invalid UI definition");
        }
        files.set(path, contents);
      }
      async function readArchive(path: string, prefix: string, required: boolean): Promise<void> {
        const original = `${path}.bol-orig`;
        const selected = await stat(original).then((info) => info.isFile() ? original : path).catch((error: NodeJS.ErrnoException) => {
          if (error.code !== "ENOENT") throw error;
          return path;
        });
        const bytes = await readFile(selected).catch((error: NodeJS.ErrnoException) => {
          if (required || error.code !== "ENOENT") throw error;
          return undefined;
        });
        if (!bytes) return;
        const entries = readBedrockArchive(bytes);
        sources.push({ path: selected, sha256: createHash("sha256").update(bytes).digest("hex"), entries: entries.size });
        for (const [name, contents] of entries) add(`${prefix}/${name}`, contents);
      }
      async function walk(directory: string, prefix: string, archives: boolean): Promise<void> {
        const entries = await readdir(directory, { withFileTypes: true }).catch((error: NodeJS.ErrnoException) => {
          if (error.code !== "ENOENT") throw error;
          return [];
        });
        for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, "en"))) {
          if (entry.isSymbolicLink()) throw new Error("UI assets contain a symbolic link");
          const selected = join(directory, entry.name), path = `${prefix}/${entry.name}`;
          if (entry.isDirectory()) await walk(selected, path, archives);
          else if (entry.isFile() && archives && entry.name.endsWith(".brarchive")) {
            await readArchive(selected, path.slice(0, -".brarchive".length), true);
          } else if (entry.isFile() && !archives && category.formats.test(entry.name)) {
            const bytes = await readFile(selected);
            add(path, bytes);
            if (bytes.length) sources.push({ path: selected, sha256: createHash("sha256").update(bytes).digest("hex"), entries: 1 });
          }
        }
      }
      // Subdirectories have their own native archives, including settings templates and font atlases.
      await readArchive(join(root, "__brarchive", `${category.path}.brarchive`), category.path, category.required);
      await walk(join(root, "__brarchive", category.path), category.path, true);
      await walk(join(root, category.path), category.path, false);
    }
  }
  if (files.size > 4096 || [...files.values()].reduce((total, bytes) => total + bytes.length, 0) > 64 * 1024 * 1024) {
    throw new Error("Built-in UI bundle exceeds limits");
  }
  if (!files.has("ui/server_form.json") || !files.has("ui/ui_common.json")) throw new Error("Incomplete built-in UI");
  files.set("NOTICE.txt", Buffer.from(`Minecraft: Bedrock Edition ${version} built-in UI definitions.\nCopyright Mojang AB and Microsoft.\nNative file contents are unchanged.\n`));
  const bytes = assetZip(files);
  verifyBuiltinUiContents(bytes);
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
