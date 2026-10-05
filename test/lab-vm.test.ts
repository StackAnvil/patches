import { describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { prepareVm, shareResponse, validateSpec, type VmSpec } from "../src/lab/vm.ts";
import { keyEvents, pointerEvents } from "../src/lab/qmp.ts";

const spec: VmSpec = { version: 1, guest: "windows", release: "11", name: "sa-windows-0123456789ab", cores: 4, ramGiB: 8, diskGiB: 128 };
async function temporary(operation: (path: string) => Promise<void>) {
  const path = await mkdtemp(join(tmpdir(), "sa-vm-"));
  try { await operation(path); } finally { await rm(path, { recursive: true, force: true }); }
}

describe("VM installation preservation", () => {
  test("repeated preparation preserves the disk, original config, and user overrides", async () => temporary(async (path) => {
    let downloads = 0;
    const download = async () => { downloads++; await writeFile(join(path, "windows-11.conf"), "guest_os=windows\n"); };
    await prepareVm(path, spec, download);
    await mkdir(join(path, "windows-11"));
    const disk = Buffer.from([0x51, 0x46, 0x49, 0xfb, 17, 29]);
    await writeFile(join(path, "windows-11", "disk.qcow2"), disk);
    const override = Buffer.from("ram=12G\n");
    await writeFile(join(path, `${spec.name}.conf`), override);
    const original = await readFile(join(path, "windows-11.conf"));
    await prepareVm(path, spec, download);
    expect(downloads).toBe(1);
    expect((await readFile(join(path, "windows-11", "disk.qcow2"))).equals(disk)).toBe(true);
    expect((await readFile(join(path, `${spec.name}.conf`))).equals(override)).toBe(true);
    expect((await readFile(join(path, "windows-11.conf"))).equals(original)).toBe(true);
    await expect(prepareVm(path, { ...spec, ramGiB: 16 }, download)).rejects.toBeInstanceOf(Error);
    expect(downloads).toBe(1);
  }));

  test("resumes a failed media download without losing its profile", async () => temporary(async (path) => {
    await expect(prepareVm(path, spec, async () => { throw new Error(); })).rejects.toBeInstanceOf(Error);
    const profile = await readFile(join(path, "profile.json"));
    await prepareVm(path, spec, async () => { await writeFile(join(path, "windows-11.conf"), "guest_os=windows\n"); });
    expect((await readFile(join(path, "profile.json"))).equals(profile)).toBe(true);
  }));

  test("refuses foreign directories and orphaned disks before invoking Quickget", async () => temporary(async (path) => {
    let downloads = 0;
    const download = async () => { downloads++; };
    await writeFile(join(path, "other.conf"), "");
    await expect(prepareVm(path, spec, download)).rejects.toBeInstanceOf(Error);
    await rm(join(path, "other.conf"));
    await writeFile(join(path, "profile.json"), JSON.stringify(spec));
    await mkdir(join(path, "windows-11"));
    await writeFile(join(path, "windows-11", "disk.qcow2"), Buffer.from([1]));
    await expect(prepareVm(path, spec, download)).rejects.toBeInstanceOf(Error);
    expect(downloads).toBe(0);
  }));
});

test("guest input validation rejects invalid numeric events and unsafe profiles", () => {
  for (const value of [NaN, Infinity, -0.1, 1.1]) expect(() => pointerEvents(value, 0.5, "left")).toThrow();
  expect(() => pointerEvents(0.5, 0.5, "unknown")).toThrow();
  expect(pointerEvents(1, 0, "left")).toEqual([
    { type: "abs", data: { axis: "x", value: 32767 } },
    { type: "abs", data: { axis: "y", value: 0 } },
    { type: "btn", data: { button: "left", down: true } },
  ]);
  expect(keyEvents("ctrl+alt+delete")).toHaveLength(3);
  expect(() => keyEvents("ctrl+\nquit")).toThrow();
  for (const changed of [{ release: "../../other" }, { cores: 0 }, { ramGiB: NaN }, { name: "other" }]) {
    expect(() => validateSpec({ ...spec, ...changed })).toThrow();
  }
});

test("artifact share cannot expose arbitrary files or traverse directories", async () => temporary(async (path) => {
  await writeFile(join(path, "credentials.json"), JSON.stringify({ private: true }));
  await writeFile(join(path, "manifest.json"), JSON.stringify({ files: [] }));
  for (const name of ["/credentials.json", "/../credentials.json", "/%2e%2e/credentials.json", "/missing", "/sub/manifest.json"]) {
    expect(shareResponse(name, path).status).toBe(404);
  }
  expect(await shareResponse("/manifest.json", path).json()).toEqual({ files: [] });
}));
