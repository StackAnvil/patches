import { afterEach, expect, test } from "bun:test";
import { lstat, mkdir, mkdtemp, readFile, readlink, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { prepareReplayPrismData, requireReplayCopySpace, privateReplayJavaPath, rebindReplayJavaConfig, validateReplayProfile } from "../src/replay/java-profile.ts";

const roots: string[] = [];
afterEach(async () => {
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true });
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
  expect(await privateReplayJavaPath(source, target, join(source, "java/bin/runtime"))).toBe(join(await realpath(target), "java/bin/runtime"));
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
    expect(await readFile(path, "utf8")).toBe(`JavaPath=${join(await realpath(target), "java/bin/java")}\n`);
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
  requireReplayCopySpace(1024, reserve + 1024);
  expect(() => requireReplayCopySpace(1024, reserve + 1023)).toThrow();
  expect(() => requireReplayCopySpace(-1, reserve)).toThrow();
  expect(() => requireReplayCopySpace(1024, Number.NaN)).toThrow();
});

test("copies through canonical ancestor aliases but refuses source and destination root symlinks", async () => {
  const { source, target, root } = await fixture(), alias = join(root, "ancestor");
  await symlink(root, alias);
  const sourceAlias = join(alias, "source"), targetAlias = join(alias, "private");
  await prepareReplayPrismData(sourceAlias, targetAlias);
  expect(await privateReplayJavaPath(sourceAlias, targetAlias, join(sourceAlias, "java/bin/java"))).toBe(join(await realpath(target), "java/bin/java"));
  await expect(privateReplayJavaPath(sourceAlias, targetAlias, join(sourceAlias, "java"))).rejects.toThrow();
  const sourceLink = join(root, "source-link"), targetLink = join(root, "target-link");
  await symlink(source, sourceLink); await symlink(target, targetLink);
  await expect(prepareReplayPrismData(sourceLink, target)).rejects.toThrow();
  await expect(prepareReplayPrismData(source, targetLink)).rejects.toThrow();
  await expect(validateReplayProfile(sourceLink)).rejects.toThrow();
  await writeFile(join(target, "assets/entry"), "private-change");
  expect(await readFile(join(source, "assets/entry"), "utf8")).toBe("original");
});
