import { afterEach, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, stat, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { nativeReplayServerLine, prepareNativeReplayPrefix, requireNativePrefixIdle, validateNativeReplayPrefix } from "../src/replay/native-prefix.ts";

const temporary: string[] = [];
afterEach(async () => { for (const path of temporary.splice(0)) await rm(path, { recursive: true, force: true }); });

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "stackanvil-native-prefix-")); temporary.push(root);
  const privateRoot = join(root, "replay"), directory = join(privateRoot, "run"), sourcePrefix = join(root, "template");
  await mkdir(directory, { recursive: true });
  const folders = [
    "drive_c/users/steamuser/AppData/Roaming/Minecraft Bedrock/Users/Shared/games/com.mojang/minecraftpe",
    "drive_c/users/steamuser/AppData/Local/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/minecraftpe",
  ];
  const original = Buffer.from("7:previous private list:example.invalid:19132:123\n");
  for (const folder of folders) {
    await mkdir(join(sourcePrefix, folder), { recursive: true });
    await writeFile(join(sourcePrefix, folder, "external_servers.txt"), original);
    await writeFile(join(sourcePrefix, folder, "external_servers.txt.bol-seeded"), original);
    await writeFile(join(sourcePrefix, folder, "options.txt"), "graphics_mode:1\ngfx_gamma:0.5\n");
  }
  return { root, privateRoot, directory, sourcePrefix, folders, original, port: 32123 };
}

test("serializes exactly one loopback row with validated port and integer timestamp", () => {
  const fields = nativeReplayServerLine(32123, 1234).trimEnd().split(":");
  expect(fields).toHaveLength(5);
  expect(fields.slice(2)).toEqual(["127.0.0.1", "32123", "1234"]);
  for (const port of [0, -1, 65536, 1.5, NaN]) expect(() => nativeReplayServerLine(port, 1234)).toThrow();
  for (const time of [-1, Infinity, 1.5]) expect(() => nativeReplayServerLine(32123, time)).toThrow();
});

test("clones both versioned layouts, preserves template/options, and backs up replaced lists", async () => {
  const input = await fixture();
  const prefix = await prepareNativeReplayPrefix(input);
  await validateNativeReplayPrefix(prefix, input.directory, input.sourcePrefix);
  const source = await stat(input.sourcePrefix), clone = await stat(prefix);
  expect(clone.ino).not.toBe(source.ino);
  for (const folder of input.folders) {
    expect(await readFile(join(input.sourcePrefix, folder, "external_servers.txt"))).toEqual(input.original);
    expect(await readFile(join(prefix, folder, "options.txt"))).toEqual(await readFile(join(input.sourcePrefix, folder, "options.txt")));
    expect(await readFile(join(prefix, folder, "external_servers.txt.bol-seeded"))).toEqual(input.original);
    const rows = (await readFile(join(prefix, folder, "external_servers.txt"), "utf8")).trimEnd().split("\n");
    expect(rows).toHaveLength(1);
    expect(rows[0]!.split(":").slice(2, 4)).toEqual(["127.0.0.1", String(input.port)]);
  }
  for (let index = 0; index < input.folders.length; index++) {
    expect(await readFile(join(input.directory, "native-server-list-backup", `${index}.original`))).toEqual(input.original);
  }
});

test("rejects an unowned existing destination without altering its files", async () => {
  const input = await fixture(), prefix = join(input.directory, "native-prefix");
  await mkdir(prefix); await writeFile(join(prefix, "sentinel"), input.original);
  await expect(prepareNativeReplayPrefix(input)).rejects.toThrow();
  expect(await readFile(join(prefix, "sentinel"))).toEqual(input.original);
});

test("rejects run escapes and recursive source copies before creating a clone", async () => {
  const input = await fixture();
  await expect(prepareNativeReplayPrefix({ ...input, privateRoot: input.sourcePrefix })).rejects.toThrow();
  await expect(prepareNativeReplayPrefix({ ...input, sourcePrefix: input.privateRoot })).rejects.toThrow();
  await expect(stat(join(input.directory, "native-prefix"))).rejects.toThrow();
});

test("rejects a source inode alias and missing or mismatched ownership markers", async () => {
  const input = await fixture(), prefix = await prepareNativeReplayPrefix(input);
  await expect(validateNativeReplayPrefix(prefix, input.directory, prefix)).rejects.toThrow();
  const marker = join(prefix, ".stackanvil-replay-prefix.json");
  const owner = JSON.parse(await readFile(marker, "utf8"));
  await writeFile(marker, JSON.stringify({ ...owner, source: input.directory }));
  await expect(validateNativeReplayPrefix(prefix, input.directory, input.sourcePrefix)).rejects.toThrow();
  await rm(marker);
  await expect(validateNativeReplayPrefix(prefix, input.directory, input.sourcePrefix)).rejects.toThrow();
});

test("rejects server-list symlinks without touching their external target", async () => {
  const input = await fixture(), outside = join(input.root, "outside-list");
  await writeFile(outside, input.original);
  const list = join(input.sourcePrefix, input.folders[0]!, "external_servers.txt");
  await rm(list); await symlink(outside, list);
  await expect(prepareNativeReplayPrefix(input)).rejects.toThrow();
  expect(await readFile(outside)).toEqual(input.original);
});

test("rejects a symlink alias for the owned clone", async () => {
  const input = await fixture(), prefix = await prepareNativeReplayPrefix(input);
  const other = join(input.directory, "other-prefix");
  await rm(prefix, { recursive: true }); await mkdir(other); await symlink(other, prefix);
  await expect(validateNativeReplayPrefix(prefix, input.directory, input.sourcePrefix)).rejects.toThrow();
});

test("detects a prefix becoming busy before atomic list replacement", async () => {
  const input = await fixture(); let checks = 0;
  await expect(prepareNativeReplayPrefix({ ...input, assertIdle: async () => {
    if (++checks === 3) throw new Error("Concurrent Wine process");
  } })).rejects.toThrow();
  expect(checks).toBe(3);
  for (const folder of input.folders) {
    expect(await readFile(join(input.directory, "native-prefix", folder, "external_servers.txt"))).toEqual(input.original);
  }
});

test("concurrent preparers cannot merge or overwrite the winning clone", async () => {
  const input = await fixture(); let release!: () => void, entered!: () => void;
  const waiting = new Promise<void>(resolve => { release = resolve; });
  const firstCheck = new Promise<void>(resolve => { entered = resolve; });
  const loser = prepareNativeReplayPrefix({ ...input, port: 12345, assertIdle: async () => { entered(); await waiting; } });
  await firstCheck;
  const winner = await prepareNativeReplayPrefix(input);
  release(); await expect(loser).rejects.toThrow();
  for (const folder of input.folders) {
    const fields = (await readFile(join(winner, folder, "external_servers.txt"), "utf8")).trim().split(":");
    expect(Number(fields[3])).toBe(input.port);
  }
});

test.skipIf(!["linux", "darwin"].includes(process.platform))("detects a live exact WINEPREFIX without running Wine", async () => {
  const input = await fixture();
  const child = Bun.spawn([process.execPath, "-e", 'console.log("ready"); setInterval(() => {}, 1000)'], {
    env: { ...process.env, WINEPREFIX: input.sourcePrefix }, stdout: "pipe", stderr: "ignore",
  });
  try {
    const reader = child.stdout.getReader();
    await reader.read(); reader.releaseLock();
    await expect(requireNativePrefixIdle(input.sourcePrefix)).rejects.toThrow();
    await requireNativePrefixIdle(join(input.root, "another-prefix"));
  } finally { child.kill(); await child.exited; }
});
