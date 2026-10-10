import { afterEach, expect, test } from "bun:test";
import { cp, lstat, mkdir, mkdtemp, readFile, rename, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { copyBedrockServerInstallation } from "../src/integration/server-installation.ts";

const roots: string[] = [];
const reserve = 5 * 1024 ** 3;

afterEach(async () => {
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true });
});

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "stackanvil-server-copy-"));
  roots.push(root);
  const source = join(root, "source"), destination = join(root, "server");
  await mkdir(join(source, "data", "nested"), { recursive: true });
  const binary = Uint8Array.of(1, 2, 3), data = Uint8Array.of(4, 5, 6, 7);
  await writeFile(join(source, "bedrock_server"), binary, { mode: 0o700 });
  await writeFile(join(source, "data", "nested", "input.bin"), data);
  await writeFile(join(source, "unused.bin"), new Uint8Array(128));
  return { source, destination, root, binary, data };
}

test("budgets the complete selected tree before copying and excludes unrelated files", async () => {
  const input = await fixture();
  let copies = 0;
  const io = {
    availableBytes: async () => reserve + input.binary.length + input.data.length - 1,
    copy: async (source: string, destination: string) => {
      copies++;
      await cp(source, join(destination, source.split("/").at(-1)!), { recursive: true });
    },
  };
  await expect(copyBedrockServerInstallation(input.source, input.destination, io)).rejects.toThrow();
  expect(copies).toBe(0);
  expect(await lstat(input.destination).catch(error => error.code)).toBe("ENOENT");
  io.availableBytes = async () => reserve + input.binary.length + input.data.length;
  await copyBedrockServerInstallation(input.source, input.destination, io);
  expect(copies).toBe(2);
  expect(new Uint8Array(await readFile(join(input.destination, "data", "nested", "input.bin")))).toEqual(input.data);
  expect((await lstat(join(input.destination, "bedrock_server"))).mode & 0o777).toBe(0o700);
  expect(await lstat(join(input.destination, "unused.bin")).catch(error => error.code)).toBe("ENOENT");
});

test("removes only the newly created partial copy when copying runs out of disk space", async () => {
  const input = await fixture();
  const failure = Object.assign(new Error(), { code: "ENOSPC" });
  let copies = 0;
  const result = await copyBedrockServerInstallation(input.source, input.destination, {
    availableBytes: async () => reserve + 1024,
    copy: async (source, destination) => {
      if (++copies === 2) throw failure;
      await cp(source, join(destination, "bedrock_server"));
    },
  }).catch(error => error);
  expect(result).toBe(failure);
  expect(copies).toBe(2);
  expect(await lstat(input.destination).catch(error => error.code)).toBe("ENOENT");
  expect(new Uint8Array(await readFile(join(input.source, "bedrock_server")))).toEqual(input.binary);
});

test("retains a replacement directory and the original copy when ownership changes during a failed copy", async () => {
  const input = await fixture(), retained = join(input.root, "retained");
  const failure = Object.assign(new Error(), { code: "ENOSPC" });
  const result = await copyBedrockServerInstallation(input.source, input.destination, {
    availableBytes: async () => reserve + 1024,
    copy: async () => {
      await rename(input.destination, retained);
      await mkdir(input.destination);
      await writeFile(join(input.destination, "keep.bin"), input.data);
      throw failure;
    },
  }).catch(error => error);
  expect(result).toBeInstanceOf(AggregateError);
  expect(result.errors[0]).toBe(failure);
  expect(new Uint8Array(await readFile(join(input.destination, "keep.bin")))).toEqual(input.data);
  expect((await lstat(retained)).isDirectory()).toBe(true);
});

test("refuses to overwrite an existing run", async () => {
  const input = await fixture();
  await mkdir(input.destination);
  await writeFile(join(input.destination, "keep.bin"), input.data);
  let copies = 0;
  await expect(copyBedrockServerInstallation(input.source, input.destination, {
    availableBytes: async () => reserve + 1024,
    copy: async () => { copies++; },
  })).rejects.toThrow();
  expect(copies).toBe(0);
  expect(new Uint8Array(await readFile(join(input.destination, "keep.bin")))).toEqual(input.data);
});

test("rejects write-through server inputs before creating a copy", async () => {
  const input = await fixture(), outside = join(input.root, "shared");
  await mkdir(outside);
  await symlink(outside, join(input.source, "data", "shared"), "dir");
  let copies = 0;
  await expect(copyBedrockServerInstallation(input.source, input.destination, {
    availableBytes: async () => reserve + 1024,
    copy: async () => { copies++; },
  })).rejects.toThrow();
  expect(copies).toBe(0);
  expect(await lstat(input.destination).catch(error => error.code)).toBe("ENOENT");
});

test("copies a real installation privately with the production copier", async () => {
  const input = await fixture();
  await copyBedrockServerInstallation(input.source, input.destination);
  await writeFile(join(input.destination, "data", "nested", "input.bin"), Uint8Array.of(8));
  expect(new Uint8Array(await readFile(join(input.source, "data", "nested", "input.bin")))).toEqual(input.data);
});

test("releases unchanged copied dependencies and retains worlds, modified packs and probe additions", async () => {
  const input = await fixture();
  for (const name of ["behavior_packs/builtin", "resource_packs/builtin", "definitions"]) {
    await mkdir(join(input.source, name), { recursive: true });
    await writeFile(join(input.source, name, "input.bin"), input.data);
  }
  const release = await copyBedrockServerInstallation(input.source, input.destination);
  await writeFile(join(input.destination, "resource_packs/builtin/input.bin"), input.binary);
  await mkdir(join(input.destination, "behavior_packs/probe"));
  await writeFile(join(input.destination, "behavior_packs/probe/input.bin"), input.binary);
  await mkdir(join(input.destination, "worlds"));
  await writeFile(join(input.destination, "worlds/input.bin"), input.data);
  await release();
  await release();
  for (const name of ["bedrock_server", "definitions", "behavior_packs/builtin"]) {
    expect(await lstat(join(input.destination, name)).catch(error => error.code)).toBe("ENOENT");
  }
  for (const name of ["resource_packs/builtin/input.bin", "behavior_packs/probe/input.bin"]) {
    expect(new Uint8Array(await readFile(join(input.destination, name)))).toEqual(input.binary);
  }
  expect(new Uint8Array(await readFile(join(input.destination, "worlds/input.bin")))).toEqual(input.data);
  expect(new Uint8Array(await readFile(join(input.destination, "data/nested/input.bin")))).toEqual(input.data);
  expect(new Uint8Array(await readFile(join(input.source, "bedrock_server")))).toEqual(input.binary);
});

test("refuses dependency cleanup after replacing its owned directory or linking a pack ancestor", async () => {
  const input = await fixture();
  await mkdir(join(input.source, "resource_packs/builtin"), { recursive: true });
  await writeFile(join(input.source, "resource_packs/builtin/input.bin"), input.data);
  const release = await copyBedrockServerInstallation(input.source, input.destination);
  const retained = join(input.root, "retained");
  await rename(input.destination, retained);
  await mkdir(input.destination);
  await writeFile(join(input.destination, "bedrock_server"), input.binary);
  await expect(release()).rejects.toThrow();
  expect(new Uint8Array(await readFile(join(input.destination, "bedrock_server")))).toEqual(input.binary);
  await rm(input.destination, { recursive: true });
  await rename(retained, input.destination);
  const packs = join(input.destination, "resource_packs");
  await rename(packs, join(input.root, "packs"));
  await symlink(join(input.root, "packs"), packs, "dir");
  await expect(release()).rejects.toThrow();
  expect(new Uint8Array(await readFile(join(input.destination, "bedrock_server")))).toEqual(input.binary);
  expect(new Uint8Array(await readFile(join(input.root, "packs/builtin/input.bin")))).toEqual(input.data);
});

test("retains a pack when files move between directories without changing their bytes", async () => {
  const input = await fixture();
  await mkdir(join(input.source, "resource_packs/builtin/a"), { recursive: true });
  await writeFile(join(input.source, "resource_packs/builtin/a/b"), input.data);
  const release = await copyBedrockServerInstallation(input.source, input.destination);
  const pack = join(input.destination, "resource_packs/builtin");
  await rename(join(pack, "a/b"), join(pack, "b"));
  await release();
  expect(new Uint8Array(await readFile(join(pack, "b")))).toEqual(input.data);
  expect((await lstat(join(pack, "a"))).isDirectory()).toBe(true);
});
