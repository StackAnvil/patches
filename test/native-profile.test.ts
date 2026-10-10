import { afterEach, expect, test } from "bun:test";
import { cp, lstat, mkdir, mkdtemp, readFile, readlink, realpath, rename, rm, stat, statfs, symlink, truncate, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { prepareNativeProfile, requireNativeProfileIdle } from "../src/replay/native-profile.ts";

const temporary: string[] = [];
afterEach(async () => { for (const path of temporary.splice(0)) await rm(path, { recursive: true, force: true }); });

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "stackanvil-native-profile-")); temporary.push(root);
  const source = join(root, "source"), privateRoot = join(root, "replay"), runtime = join(privateRoot, "native-client");
  const game = join(source, "games", "release", "1.26.51.1"), proton = join(source, "proton", "engine");
  await mkdir(game, { recursive: true }); await mkdir(proton, { recursive: true }); await mkdir(privateRoot);
  const payload = Buffer.from([0x4d, 0x5a, 1, 7, 9]);
  await writeFile(join(game, "Minecraft.Windows.exe"), payload);
  await writeFile(join(proton, "proton"), payload);
  await symlink(game, join(source, "content"), "dir");
  const settings = { mc_version: "1.26.51.1", game_dir: game, proton, retain: 17 };
  await writeFile(join(source, "settings.json"), JSON.stringify(settings));
  return { root, source, privateRoot, runtime, game, proton, payload, settings };
}

test("copies absolute launcher content into the private installation without changing source", async () => {
  const input = await fixture(), sourceSettings = await readFile(join(input.source, "settings.json"));
  const result = await prepareNativeProfile(input);
  const copied = await realpath(join(result.runtime, "content", "Minecraft.Windows.exe"));
  expect(copied).toBe(await realpath(join(result.settings.game_dir, "Minecraft.Windows.exe")));
  expect(copied).not.toBe(await realpath(join(input.game, "Minecraft.Windows.exe")));
  expect((await stat(copied)).ino).not.toBe((await stat(join(input.game, "Minecraft.Windows.exe"))).ino);
  await writeFile(copied, Buffer.from([0x4d, 0x5a, 4]));
  expect(await readFile(join(input.game, "Minecraft.Windows.exe"))).toEqual(input.payload);
  expect(await readFile(join(input.source, "settings.json"))).toEqual(sourceSettings);
  expect(await readlink(join(input.source, "content"))).toBe(input.game);
  expect(result.settings.retain).toBe(input.settings.retain);
  expect(await realpath(result.settings.proton)).toBe(join(input.runtime, relative(input.source, input.proton)));
});

test("supports relative content and internal source path aliases", async () => {
  const input = await fixture(), alias = join(input.source, "selected-game");
  await rm(join(input.source, "content")); await symlink(relative(input.source, input.game), join(input.source, "content"));
  await symlink(input.game, alias);
  await writeFile(join(input.source, "settings.json"), JSON.stringify({ ...input.settings, game_dir: alias }));
  const result = await prepareNativeProfile(input);
  expect(await realpath(join(result.runtime, "content"))).toBe(join(input.runtime, ".stackanvil-game"));
  expect(await realpath(alias)).toBe(input.game);
});

test("shares the source GPU interlock without copying its incident or lock files", async () => {
  const input = await fixture();
  const marker = join(input.source, ".gpu-launch-in-progress.json"), acknowledgement = join(input.source, ".gpu-safety-ack.json");
  await writeFile(marker, input.payload);
  await writeFile(acknowledgement, input.payload);
  await writeFile(join(input.source, ".shared-assets.lock"), input.payload);
  await writeFile(join(input.source, ".launch.lock"), input.payload);
  const result = await prepareNativeProfile(input);
  const guardRoot = join(await realpath(join(result.runtime, "games")), "..");
  expect(await realpath(guardRoot)).toBe(input.source);
  expect(await readFile(join(guardRoot, ".gpu-launch-in-progress.json"))).toEqual(input.payload);
  for (const name of [".gpu-launch-in-progress.json", ".gpu-safety-ack.json", ".shared-assets.lock", ".launch.lock"]) {
    await expect(lstat(join(result.runtime, name))).rejects.toThrow();
  }
  const changed = Buffer.from([7, 13]);
  await writeFile(acknowledgement, changed);
  expect(await readFile(join(guardRoot, ".gpu-safety-ack.json"))).toEqual(changed);
  expect(await realpath(result.settings.game_dir)).not.toStartWith(await realpath(join(result.runtime, "games")));
});

test("migrates an idle cached copy without losing its private game changes", async () => {
  const input = await fixture();
  await cp(input.source, input.runtime, { recursive: true });
  await writeFile(join(input.runtime, ".stackanvil-source"), input.source);
  const oldGame = join(input.runtime, relative(input.source, input.game));
  const changed = Buffer.from([0x4d, 0x5a, 19]);
  await writeFile(join(oldGame, "Minecraft.Windows.exe"), changed);
  const result = await prepareNativeProfile(input);
  expect(await realpath(join(result.runtime, "games"))).toBe(join(input.source, "games"));
  expect(await readFile(join(result.settings.game_dir, "Minecraft.Windows.exe"))).toEqual(changed);
  expect(await readFile(join(input.game, "Minecraft.Windows.exe"))).toEqual(input.payload);
  expect(await realpath(result.settings.game_dir)).toBe(join(input.runtime, ".stackanvil-games", relative(join(input.source, "games"), input.game)));
  expect((await prepareNativeProfile(input)).settings.game_dir).toBe(result.settings.game_dir);
});

test("preserves an unresolved cached incident and refuses to change its interlock", async () => {
  const input = await fixture();
  await cp(input.source, input.runtime, { recursive: true });
  await writeFile(join(input.runtime, ".stackanvil-source"), input.source);
  const marker = join(input.runtime, ".gpu-launch-in-progress.json");
  await writeFile(marker, input.payload);
  const settings = await readFile(join(input.runtime, "settings.json"));
  await expect(prepareNativeProfile(input)).rejects.toThrow();
  expect((await lstat(join(input.runtime, "games"))).isDirectory()).toBe(true);
  expect(await readFile(marker)).toEqual(input.payload);
  expect(await readFile(join(input.runtime, "settings.json"))).toEqual(settings);
  expect(await readFile(join(input.game, "Minecraft.Windows.exe"))).toEqual(input.payload);
});

test("refuses a migration archive collision without replacing either directory", async () => {
  const input = await fixture();
  await cp(input.source, input.runtime, { recursive: true });
  await writeFile(join(input.runtime, ".stackanvil-source"), input.source);
  const archive = join(input.runtime, ".stackanvil-games");
  await mkdir(archive);
  await writeFile(join(archive, "sentinel"), input.payload);
  await expect(prepareNativeProfile(input)).rejects.toThrow();
  expect((await lstat(join(input.runtime, "games"))).isDirectory()).toBe(true);
  expect(await readFile(join(archive, "sentinel"))).toEqual(input.payload);
  expect(await readFile(join(input.runtime, relative(input.source, input.game), "Minecraft.Windows.exe"))).toEqual(input.payload);
});

test("rejects a cached games link to a foreign interlock", async () => {
  const input = await fixture();
  await prepareNativeProfile(input);
  const foreign = join(input.root, "foreign-games");
  await mkdir(foreign);
  const games = join(input.runtime, "games");
  await rm(games); await symlink(foreign, games);
  const settings = await readFile(join(input.runtime, "settings.json"));
  await expect(prepareNativeProfile(input)).rejects.toThrow();
  expect(await readlink(games)).toBe(foreign);
  expect(await readFile(join(input.runtime, "settings.json"))).toEqual(settings);
});

test("does not relabel a cached executable when the source selects a different game", async () => {
  const input = await fixture(), first = await prepareNativeProfile(input);
  const game = join(input.source, "games", "imported", "1.26.51.1");
  await mkdir(game, { recursive: true });
  const changed = Buffer.from([0x4d, 0x5a, 29]);
  await writeFile(join(game, "Minecraft.Windows.exe"), changed);
  await writeFile(join(input.source, "settings.json"), JSON.stringify({ ...input.settings, game_dir: game }));
  const settings = await readFile(join(input.runtime, "settings.json"));
  await expect(prepareNativeProfile(input)).rejects.toThrow();
  expect(await readFile(join(first.settings.game_dir, "Minecraft.Windows.exe"))).toEqual(input.payload);
  expect(await readFile(join(input.runtime, "settings.json"))).toEqual(settings);
  expect(await readFile(join(game, "Minecraft.Windows.exe"))).toEqual(changed);
});

test("repairs a cached owned source-pointing content link and preserves copied executable", async () => {
  const input = await fixture(), first = await prepareNativeProfile(input);
  const copied = join(first.settings.game_dir, "Minecraft.Windows.exe"), modified = Buffer.from([0x4d, 0x5a, 12]);
  await writeFile(copied, modified);
  await rm(join(input.runtime, "content")); await symlink(input.game, join(input.runtime, "content"));
  const second = await prepareNativeProfile(input);
  expect(await readFile(join(second.runtime, "content", "Minecraft.Windows.exe"))).toEqual(modified);
  expect(await readFile(join(input.game, "Minecraft.Windows.exe"))).toEqual(input.payload);
  expect((await stat(copied)).ino).not.toBe((await stat(join(input.game, "Minecraft.Windows.exe"))).ino);
});

test("rejects source path escapes using filesystem boundaries", async () => {
  const input = await fixture(), outside = join(input.root, "source-neighbor");
  await mkdir(outside);
  await writeFile(join(input.source, "settings.json"), JSON.stringify({ ...input.settings, proton: outside }));
  await expect(prepareNativeProfile(input)).rejects.toThrow();
  await expect(lstat(input.runtime)).rejects.toThrow();
});

test("rejects a copied executable symlink that still resolves into source", async () => {
  const input = await fixture(), executable = join(input.game, "Minecraft.Windows.exe"), actual = join(input.game, "actual.exe");
  await rm(executable); await writeFile(actual, input.payload); await symlink(actual, executable);
  await expect(prepareNativeProfile(input)).rejects.toThrow();
  expect(await readFile(actual)).toEqual(input.payload);
  expect(await readlink(executable)).toBe(actual);
  await expect(lstat(input.runtime)).rejects.toThrow();
});

test("does not replace unexpected content directories", async () => {
  const input = await fixture(); await rm(join(input.source, "content")); await mkdir(join(input.source, "content"));
  await writeFile(join(input.source, "content", "sentinel"), input.payload);
  await expect(prepareNativeProfile(input)).rejects.toThrow();
  await expect(lstat(input.runtime)).rejects.toThrow();
  expect(await readFile(join(input.source, "content", "sentinel"))).toEqual(input.payload);
});

test("budgets a full native copy before creating its private directory", async () => {
  const input = await fixture(), filesystem = await statfs(input.privateRoot);
  const executable = join(input.game, "Minecraft.Windows.exe");
  const bytes = filesystem.bavail * filesystem.bsize + 1;
  // A sparse source exercises the real filesystem guard without allocating disk or copying it.
  await truncate(executable, bytes);
  await expect(prepareNativeProfile(input)).rejects.toThrow();
  await expect(lstat(input.runtime)).rejects.toThrow();
  expect((await stat(executable)).size).toBe(bytes);
  expect(await readFile(join(input.proton, "proton"))).toEqual(input.payload);
});

test("does not budget or copy unselected game installations", async () => {
  const input = await fixture(), other = join(input.source, "games", "unused"), filesystem = await statfs(input.privateRoot);
  await mkdir(other);
  const executable = join(other, "Minecraft.Windows.exe");
  await writeFile(executable, input.payload);
  await truncate(executable, filesystem.bavail * filesystem.bsize + 1);
  const result = await prepareNativeProfile(input);
  expect(await readFile(join(result.settings.game_dir, "Minecraft.Windows.exe"))).toEqual(input.payload);
  await expect(lstat(join(input.runtime, ".stackanvil-game", "unused"))).rejects.toThrow();
  expect((await stat(executable)).size).toBe(filesystem.bavail * filesystem.bsize + 1);
});

test("retains a replaced directory when fresh-copy rollback is requested", async () => {
  const input = await fixture(), saved = join(input.privateRoot, "saved-copy");
  let replaced = false;
  await expect(prepareNativeProfile({ ...input, assertIdle: async profile => {
    if (profile !== input.runtime || replaced) return;
    replaced = true;
    await rename(input.runtime, saved);
    await mkdir(input.runtime);
    await writeFile(join(input.runtime, "sentinel"), input.payload);
    throw new Error("Preparation interrupted");
  } })).rejects.toBeInstanceOf(AggregateError);
  expect(await readFile(join(input.runtime, "sentinel"))).toEqual(input.payload);
  expect(await readFile(join(saved, ".stackanvil-game", "Minecraft.Windows.exe"))).toEqual(input.payload);
  expect(await readFile(join(input.game, "Minecraft.Windows.exe"))).toEqual(input.payload);
});

test("retains a fresh copy when its launcher becomes busy before rollback", async () => {
  const input = await fixture();
  await expect(prepareNativeProfile({ ...input, assertIdle: async profile => {
    if (profile === input.runtime) throw new Error("Concurrent launcher");
  } })).rejects.toBeInstanceOf(AggregateError);
  expect(await readFile(join(input.runtime, ".stackanvil-game", "Minecraft.Windows.exe"))).toEqual(input.payload);
  expect(await readFile(join(input.game, "Minecraft.Windows.exe"))).toEqual(input.payload);
});

test("retains an incident created during fresh-copy preparation", async () => {
  const input = await fixture(), marker = join(input.runtime, ".gpu-launch-in-progress.json");
  let interrupted = false;
  await expect(prepareNativeProfile({ ...input, assertIdle: async profile => {
    if (profile !== input.runtime || interrupted) return;
    interrupted = true;
    await writeFile(marker, input.payload);
    throw new Error("Preparation interrupted");
  } })).rejects.toBeInstanceOf(AggregateError);
  expect(await readFile(marker)).toEqual(input.payload);
  expect(await readFile(join(input.runtime, ".stackanvil-game", "Minecraft.Windows.exe"))).toEqual(input.payload);
  expect(await readFile(join(input.game, "Minecraft.Windows.exe"))).toEqual(input.payload);
});

test("preserves cached settings when unexpected content directories prevent repair", async () => {
  const input = await fixture(); await prepareNativeProfile(input);
  const settings = join(input.runtime, "settings.json");
  await writeFile(settings, JSON.stringify({ ...input.settings, retain: 29 }));
  const previous = await readFile(settings);
  await rm(join(input.runtime, "content")); await mkdir(join(input.runtime, "content"));
  await writeFile(join(input.runtime, "content", "sentinel"), input.payload);
  await expect(prepareNativeProfile(input)).rejects.toThrow();
  expect(await readFile(settings)).toEqual(previous);
  expect(await readFile(join(input.runtime, "content", "sentinel"))).toEqual(input.payload);
});

test("rejects settings and ownership marker symlinks before writing external files", async () => {
  const input = await fixture(); await prepareNativeProfile(input);
  const outside = join(input.root, "outside"); await writeFile(outside, input.payload);
  const settings = join(input.runtime, "settings.json"); await rm(settings); await symlink(outside, settings);
  await expect(prepareNativeProfile(input)).rejects.toThrow(); expect(await readFile(outside)).toEqual(input.payload);
  await rm(settings); await writeFile(settings, JSON.stringify(input.settings));
  const marker = join(input.runtime, ".stackanvil-source"); await rm(marker); await symlink(outside, marker);
  await expect(prepareNativeProfile(input)).rejects.toThrow(); expect(await readFile(outside)).toEqual(input.payload);
});

test("rejects foreign cached copies and root aliases without modifying them", async () => {
  const input = await fixture(); await prepareNativeProfile(input);
  const marker = join(input.runtime, ".stackanvil-source"); await writeFile(marker, input.root);
  await expect(prepareNativeProfile(input)).rejects.toThrow(); expect(await readFile(marker, "utf8")).toBe(input.root);
  await rm(input.runtime, { recursive: true }); await symlink(input.source, input.runtime);
  await expect(prepareNativeProfile(input)).rejects.toThrow(); expect(await readlink(input.runtime)).toBe(input.source);
});

test("refuses a busy cached profile before repairing launcher pointers", async () => {
  const input = await fixture(); await prepareNativeProfile(input);
  await rm(join(input.runtime, "content")); await symlink(input.game, join(input.runtime, "content"));
  await expect(prepareNativeProfile({ ...input, assertIdle: async profile => {
    if (profile === input.runtime) throw new Error("Concurrent launcher");
  } })).rejects.toThrow();
  expect(await readlink(join(input.runtime, "content"))).toBe(input.game);
});

test("rechecks cached ownership after an idle boundary before replacing content", async () => {
  const input = await fixture(); await prepareNativeProfile(input);
  await rm(join(input.runtime, "content")); await symlink(input.game, join(input.runtime, "content"));
  const marker = join(input.runtime, ".stackanvil-source");
  await expect(prepareNativeProfile({ ...input, assertIdle: async profile => {
    if (profile === input.runtime) await writeFile(marker, input.root);
  } })).rejects.toThrow();
  expect(await readlink(join(input.runtime, "content"))).toBe(input.game);
  expect(await readFile(join(input.game, "Minecraft.Windows.exe"))).toEqual(input.payload);
});

test("rejects source settings aliases without creating a runtime", async () => {
  const input = await fixture(), outside = join(input.root, "settings.json");
  await writeFile(outside, JSON.stringify(input.settings));
  await rm(join(input.source, "settings.json")); await symlink(outside, join(input.source, "settings.json"));
  const previous = await readFile(outside);
  await expect(prepareNativeProfile(input)).rejects.toThrow();
  expect(await readFile(outside)).toEqual(previous);
  await expect(lstat(input.runtime)).rejects.toThrow();
});

test.skipIf(process.platform !== "linux")("detects exact live launcher ownership without running Bedrock", async () => {
  const input = await fixture();
  const child = Bun.spawn([process.execPath, "-e", 'console.log("ready"); setInterval(() => {}, 1000)'], {
    env: { ...process.env, BOL_HOME: input.runtime }, stdout: "pipe", stderr: "ignore",
  });
  try {
    const reader = child.stdout.getReader(); await reader.read(); reader.releaseLock();
    await expect(requireNativeProfileIdle(input.runtime)).rejects.toThrow();
    await requireNativeProfileIdle(input.source);
  } finally { child.kill(); await child.exited; }
});
