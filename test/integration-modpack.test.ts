import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { expect, spyOn, test } from "bun:test";
import {
  inspectPinnedModpack,
  packOverrides,
  replacePackFiles,
  updateModpack,
  validatePackIndex,
  verifiedDownload,
} from "../src/integration/modpack.ts";
import { root } from "../src/model.ts";

const target = { minecraft: "26.3", fabricLoader: "0.19.5" };

function index(path = "mods/example.jar") {
  return {
    formatVersion: 1,
    game: "minecraft",
    versionId: "15.0.0-alpha.3",
    dependencies: { minecraft: target.minecraft, "fabric-loader": target.fabricLoader },
    files: [{ path, downloads: ["https://cdn.modrinth.com/example.jar"], hashes: { sha512: "a".repeat(128) } }],
  };
}

test("rejects incompatible loaders and archive path escapes", () => {
  expect(() => validatePackIndex(index(), { ...target, fabricLoader: "0.19.6" })).toThrow();
  expect(() => validatePackIndex(index("mods/../options.txt"), target)).toThrow();
});

test("rejects missing download hashes", () => {
  const pack = index();
  pack.files[0]!.hashes.sha512 = "";
  expect(() => validatePackIndex(pack, target)).toThrow();
});

test("the pinned modpack archive matches its lock and contains client files", async () => {
  const pack = await inspectPinnedModpack();
  expect(pack.files).toBeGreaterThan(0);
  expect(pack.overrides).toBeGreaterThan(0);
});

test("replaces a pinned mod without keeping both versions or mutating the baseline", () => {
  const original = validatePackIndex(index(), target);
  const replacement = { ...original.files[0]!, path: "mods/replacement.jar" };
  expect(replacePackFiles(original, { "mods/example.jar": replacement }).files).toEqual([replacement]);
  expect(original.files).toEqual(index().files);
  expect(() => replacePackFiles(original, { "mods/missing.jar": replacement })).toThrow();
  expect(() => replacePackFiles(original, { "mods/example.jar": { ...replacement, path: "../escape.jar" } })).toThrow();
  original.files.push({ ...replacement });
  expect(() => replacePackFiles(original, { "mods/example.jar": replacement })).toThrow();
});

async function withPack(files: Record<string, string>, run: (pack: string, entries: string[]) => Promise<void>) {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-mrpack-"));
  try {
    const staging = join(directory, "staging");
    for (const [path, text] of Object.entries(files)) {
      await mkdir(dirname(join(staging, path)), { recursive: true });
      await writeFile(join(staging, path), text);
    }
    const pack = join(directory, "pack.mrpack");
    execFileSync("zip", ["-q", pack, ...Object.keys(files)], { cwd: staging });
    await run(pack, Object.keys(files));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test("extracts override names containing unzip wildcard characters literally", async () => {
  await withPack(
    {
      "overrides/config/a[1].txt": "bracket",
      "overrides/config/a1.txt": "plain",
      "overrides/config/b*.txt": "star",
      "overrides/config/bx.txt": "other",
    },
    async (pack, entries) => {
      const overrides = await packOverrides(pack, entries);
      const text = (path: string) => Buffer.from(overrides.get(path) ?? []).toString("utf8");
      expect(text("config/a[1].txt")).toBe("bracket");
      expect(text("config/b*.txt")).toBe("star");
    },
  );
});

test("client overrides replace shared overrides even when the archive lists them first", async () => {
  await withPack(
    {
      "client-overrides/options.txt": "client",
      "overrides/options.txt": "shared",
      "overrides/config/shared.txt": "kept",
    },
    async (pack, entries) => {
      const overrides = await packOverrides(pack, entries);
      expect(Object.fromEntries([...overrides].map(([path, bytes]) => [path, Buffer.from(bytes).toString("utf8")]))).toEqual({
        "options.txt": "client",
        "config/shared.txt": "kept",
      });
    },
  );
});

test("accepts a cached download whose index spells the SHA-512 in uppercase", async () => {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-mrpack-cache-"));
  try {
    const file = join(directory, "example.jar");
    await writeFile(file, "cached mod");
    const hash = createHash("sha512").update("cached mod").digest("hex").toUpperCase();
    const pack = index();
    pack.files[0]!.hashes.sha512 = hash;
    expect(validatePackIndex(pack, target).files[0]!.hashes.sha512).toBe(hash);
    // No download URLs: only the verified cached file can satisfy this request.
    await verifiedDownload([], file, hash);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("a downloaded modpack that fails validation leaves no file in the tracked modpack directory", async () => {
  const modpacks = join(root, "integration", "modpacks");
  const before = (await readdir(modpacks)).toSorted();
  const pinned = await readFile(join(modpacks, "fabulously-optimized.mrpack"));
  await withPack({ "modrinth.index.json": JSON.stringify({ ...index(), dependencies: { minecraft: "26.3" } }) }, async (pack) => {
    const bytes = await readFile(pack);
    const sha512 = createHash("sha512").update(bytes).digest("hex");
    const cached = join(root, ".stackanvil", "integration", "cache", "modpack", sha512);
    const version = { id: "fake", version_number: "15.0.0-alpha.3", files: [{ filename: "pack.mrpack", url: "https://cdn.modrinth.com/pack.mrpack", primary: true, hashes: { sha512 } }] };
    const fetch = spyOn(globalThis, "fetch").mockImplementation((async (url: string | URL | Request) =>
      String(url).startsWith("https://api.modrinth.com/") ? Response.json([version]) : new Response(bytes)) as typeof globalThis.fetch);
    try {
      await expect(updateModpack()).rejects.toThrow("does not specify a Fabric loader");
    } finally {
      fetch.mockRestore();
      await rm(cached, { force: true });
    }
  });
  expect((await readdir(modpacks)).toSorted()).toEqual(before);
  expect((await readFile(join(modpacks, "fabulously-optimized.mrpack"))).equals(pinned)).toBe(true);
});
