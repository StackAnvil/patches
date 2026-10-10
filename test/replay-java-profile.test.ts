import { afterEach, expect, test } from "bun:test";
import { lstat, mkdir, mkdtemp, readFile, readlink, rename, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { prepareReplayInstanceCleanup, prepareReplayPrismData, privateReplayJavaPath, rebindReplayJavaConfig, validateReplayProfile } from "../src/replay/java-profile.ts";
import { requirePrivateCopySpace } from "../src/copy-space.ts";

const roots: string[] = [];
afterEach(async () => {
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true });
});

test("releases private game dependencies and downloads while retaining settings, worlds and evidence", async () => {
  const { target, root } = await fixture();
  const game = join(target, "instances/run/minecraft");
  await mkdir(game, { recursive: true });
  const release = await prepareReplayInstanceCleanup(target, game);
  for (const file of ["mods/client.jar", "downloads/pack/content", "downloads/log.json", "config/settings.json", "worlds/level/db", "logs/latest.log", "options.txt"]) {
    const path = join(game, file);
    await mkdir(join(path, ".."), { recursive: true });
    await writeFile(path, "retained");
  }
  const external = join(root, "external");
  await mkdir(external);
  await writeFile(join(external, "original"), "untouched");
  await symlink(external, join(game, "mods/linked"));
  await release();
  await release();
  for (const file of ["mods", "downloads/pack"]) await expect(lstat(join(game, file))).rejects.toThrow();
  for (const file of ["downloads/log.json", "config/settings.json", "worlds/level/db", "logs/latest.log", "options.txt"]) {
    expect(await readFile(join(game, file), "utf8")).toBe("retained");
  }
  expect(await readFile(join(external, "original"), "utf8")).toBe("untouched");
});

test("refuses private game cleanup after a game or parent directory is replaced", async () => {
  for (const replaceParent of [false, true]) {
    const { target, root } = await fixture();
    const game = join(target, "instances/run/minecraft");
    await mkdir(join(game, "mods"), { recursive: true });
    await writeFile(join(game, "mods/client.jar"), "original");
    const release = await prepareReplayInstanceCleanup(target, game);
    const replaced = replaceParent ? join(target, "instances/run") : game;
    await rename(replaced, join(root, "saved"));
    await mkdir(join(game, "mods"), { recursive: true });
    await writeFile(join(game, "mods/client.jar"), "replacement");
    await expect(release()).rejects.toThrow();
    expect(await readFile(join(game, "mods/client.jar"), "utf8")).toBe("replacement");
  }
});

test("releases both private server pack caches without requiring a launcher download cache", async () => {
  const { target, root } = await fixture();
  const game = join(target, "instances/run/minecraft");
  await mkdir(game, { recursive: true });
  const release = await prepareReplayInstanceCleanup(target, game);
  const external = join(root, "external");
  await mkdir(external);
  await writeFile(join(external, "source-pack"), "original");
  for (const config of ["viafabricplus/viabedrock", "viabedrock"]) {
    const settings = join(game, "config", config);
    const cache = join(settings, "server_packs");
    await mkdir(join(cache, "converted-pack"), { recursive: true });
    await writeFile(join(cache, "converted-pack/asset"), "cached");
    await symlink(external, join(cache, "linked-pack"));
    await writeFile(join(settings, "settings.json"), "retained");
  }
  await release();
  await release();
  for (const config of ["viafabricplus/viabedrock", "viabedrock"]) {
    await expect(lstat(join(game, "config", config, "server_packs"))).rejects.toThrow();
    expect(await readFile(join(game, "config", config, "settings.json"), "utf8")).toBe("retained");
  }
  expect(await readFile(join(external, "source-pack"), "utf8")).toBe("original");
});

test("refuses server pack cleanup through a linked cache or config ancestor", async () => {
  for (const linked of ["config", "config/viafabricplus", "config/viafabricplus/viabedrock", "config/viafabricplus/viabedrock/server_packs"]) {
    const { target, root } = await fixture();
    const game = join(target, "instances/run/minecraft");
    await mkdir(join(game, "downloads"), { recursive: true });
    const release = await prepareReplayInstanceCleanup(target, game);
    const external = join(root, "external");
    await mkdir(join(external, "viafabricplus/viabedrock/server_packs"), { recursive: true });
    const original = join(external, "viafabricplus/viabedrock/server_packs/asset");
    await writeFile(original, "untouched");
    const link = join(game, linked);
    await mkdir(join(link, ".."), { recursive: true });
    await symlink(external, link);
    await expect(release()).rejects.toThrow();
    expect(await readFile(original, "utf8")).toBe("untouched");
  }
});

test("rejects external game paths and linked download roots", async () => {
  const { target, root } = await fixture();
  const external = join(root, "external");
  await mkdir(external);
  await writeFile(join(external, "original"), "untouched");
  await expect(prepareReplayInstanceCleanup(target, external)).rejects.toThrow();
  const game = join(target, "instances/run/minecraft");
  await mkdir(game, { recursive: true });
  const release = await prepareReplayInstanceCleanup(target, game);
  await symlink(external, join(game, "downloads"));
  await expect(release()).rejects.toThrow();
  expect(await readFile(join(external, "original"), "utf8")).toBe("untouched");
});
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "stackanvil-java-profile-"));
  roots.push(root);
  const source = join(root, "source");
  const target = join(root, "private");
  for (const directory of ["assets", "libraries", "cache", "meta", "icons", "java/bin", "instances", "logs"]) await mkdir(join(source, directory), { recursive: true });
  await mkdir(target);
  for (const directory of ["assets", "libraries", "cache", "meta", "icons"]) await writeFile(join(source, directory, "entry"), "original");
  await writeFile(join(source, "java/bin/java"), "private-runtime");
  await symlink("java", join(source, "java/bin/runtime"));
  await writeFile(join(source, "prismlauncher.cfg"), "configuration");
  return { source, target, root };
}

test("copies cached assets, libraries and launcher state privately without changing source bytes", async () => {
  const { source, target } = await fixture();
  for (const directory of ["assets/indexes", "libraries/metadata"]) {
    await mkdir(join(source, directory), { recursive: true });
    await writeFile(join(source, directory, "cached.json"), "{\"revision\":1}");
  }
  await prepareReplayPrismData(source, target);
  for (const directory of ["assets", "libraries", "cache", "meta", "icons"]) {
    await writeFile(join(target, directory, "entry"), "private-change");
    expect(await readFile(join(source, directory, "entry"), "utf8")).toBe("original");
  }
  expect(await readlink(join(target, "java/bin/runtime"))).toBe("java");
  expect(await readFile(join(target, "java/bin/runtime"), "utf8")).toBe("private-runtime");
  for (const directory of ["assets/indexes", "libraries/metadata"]) {
    await writeFile(join(target, directory, "cached.json"), "{\"revision\":2}");
    expect(await readFile(join(source, directory, "cached.json"), "utf8")).toBe("{\"revision\":1}");
    expect((await lstat(join(target, directory.split("/")[0]!))).isSymbolicLink()).toBe(false);
  }
  expect(await readFile(join(target, "prismlauncher.cfg"), "utf8")).toBe("configuration");
  expect(await privateReplayJavaPath(source, target, join(source, "java/bin/runtime"))).toBe(join(target, "java/bin/runtime"));
  await expect(privateReplayJavaPath(source, target, join(source, "assets/entry"))).rejects.toThrow();
  await expect(readFile(join(target, "instances"))).rejects.toThrow();
});

test("refuses write-through links in copied instance configuration and options", async () => {
  const { source, root } = await fixture();
  const profile = join(source, "instances/profile");
  await mkdir(join(profile, "minecraft/config"), { recursive: true });
  await writeFile(join(profile, "instance.cfg"), "private-profile");
  await writeFile(join(profile, "mmc-pack.json"), "{}");
  await writeFile(join(root, "external-options"), "unchanged");
  await symlink(join(root, "external-options"), join(profile, "minecraft/options.txt"));
  await expect(validateReplayProfile(profile)).rejects.toThrow();
  await rm(join(profile, "minecraft/options.txt"));
  await writeFile(join(profile, "minecraft/options.txt"), "private-options");
  await symlink(join(root, "external-options"), join(profile, "minecraft/config/linked"));
  await expect(validateReplayProfile(profile)).rejects.toThrow();
  expect(await readFile(join(root, "external-options"), "utf8")).toBe("unchanged");
  await rm(join(profile, "minecraft/config/linked"));
  await validateReplayProfile(profile);
});

test("rebinds global and instance Java selection without changing source configuration", async () => {
  const { source, target } = await fixture();
  const configured = `JavaPath=${join(source, "java/bin/java")}\n`;
  await writeFile(join(source, "prismlauncher.cfg"), configured);
  await prepareReplayPrismData(source, target);
  const instance = join(target, "instance.cfg");
  await writeFile(instance, configured);
  for (const path of [join(target, "prismlauncher.cfg"), instance]) {
    await rebindReplayJavaConfig(path, source, target);
    expect(await readFile(path, "utf8")).toBe(`JavaPath=${join(target, "java/bin/java")}\n`);
  }
  expect(await readFile(join(source, "prismlauncher.cfg"), "utf8")).toBe(configured);
  await writeFile(instance, "JavaPath=/usr/bin/java\n");
  await expect(rebindReplayJavaConfig(instance, source, target)).rejects.toThrow();
  expect(await readFile(instance, "utf8")).toBe("JavaPath=/usr/bin/java\n");
});

test("refuses escaping source links and existing output without changing source or existing data", async () => {
  const { source, target, root } = await fixture();
  await writeFile(join(root, "external"), "retained");
  await symlink(join(root, "external"), join(source, "cache/unsafe"));
  await expect(prepareReplayPrismData(source, target)).rejects.toThrow();
  expect(await readFile(join(root, "external"), "utf8")).toBe("retained");
  await rm(join(source, "cache/unsafe"));
  await writeFile(join(target, "prismlauncher.cfg"), "owned-existing");
  await expect(prepareReplayPrismData(source, target)).rejects.toThrow();
  expect(await readFile(join(target, "prismlauncher.cfg"), "utf8")).toBe("owned-existing");
  await expect(prepareReplayPrismData(source, source)).rejects.toThrow();
});

test("reserves disk for full private copies even when reflink support is unavailable", () => {
  const reserve = 5 * 1024 ** 3;
  requirePrivateCopySpace(1024, reserve + 1024);
  expect(() => requirePrivateCopySpace(1024, reserve + 1023)).toThrow();
  expect(() => requirePrivateCopySpace(-1, reserve)).toThrow();
  expect(() => requirePrivateCopySpace(1024, Number.NaN)).toThrow();
});

test("releases copied dependencies while retaining source, settings and run evidence", async () => {
  const { source, target } = await fixture();
  const release = await prepareReplayPrismData(source, target);
  await mkdir(join(target, "instances/run"), { recursive: true });
  const evidence = join(target, "instances/run/client.log");
  await writeFile(evidence, "captured evidence");
  await release();
  await release();
  for (const name of ["assets", "libraries", "java", "cache"]) {
    expect(await lstat(join(source, name))).toBeDefined();
    await expect(lstat(join(target, name))).rejects.toThrow();
  }
  expect(await readFile(evidence, "utf8")).toBe("captured evidence");
  expect(await readFile(join(target, "prismlauncher.cfg"), "utf8")).toBe("configuration");
  expect(await readFile(join(target, "meta/entry"), "utf8")).toBe("original");
});

test("refuses dependency cleanup after replacement of the owned directory", async () => {
  const { source, target, root } = await fixture();
  const release = await prepareReplayPrismData(source, target);
  const saved = join(root, "saved");
  await rename(target, saved);
  await symlink(source, target);
  await expect(release()).rejects.toThrow();
  expect(await readFile(join(source, "assets/entry"), "utf8")).toBe("original");
  await rm(target);
  await mkdir(join(target, "assets"), { recursive: true });
  await writeFile(join(target, "assets/entry"), "replacement");
  await expect(release()).rejects.toThrow();
  expect(await readFile(join(target, "assets/entry"), "utf8")).toBe("replacement");
  expect(await readFile(join(saved, "assets/entry"), "utf8")).toBe("original");
});
