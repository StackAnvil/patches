import { expect, test } from "bun:test";
import { mkdtemp, mkdir, writeFile, readFile, rm, chmod } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createCaptureX11Builder } from "../src/capture/native.ts";

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "stackanvil-native-"));
  const source = join(root, "native", "capture-x11");
  const tools = join(root, ".stackanvil", "tools");
  const release = join(tools, "capture-x11-build", "release", "capture-x11");
  await mkdir(join(source, "src"), { recursive: true });
  await writeFile(join(source, "Cargo.toml"), "manifest");
  await writeFile(join(source, "Cargo.lock"), "lock");
  await writeFile(join(source, "src", "main.rs"), "source");
  let builds = 0;
  let fail = false;
  let unblock: Promise<void> | undefined;
  const env = { DISPLAY: ":999", STACKANVIL_UI_ISOLATED: "1" };
  const prepare = createCaptureX11Builder(async (args, cwd, actualEnv) => {
    expect(cwd).toBe(root);
    expect(actualEnv).toBe(env);
    expect(args).toEqual(["build", "--locked", "--release", "--manifest-path", join(source, "Cargo.toml"),
      "--target-dir", join(tools, "capture-x11-build")]);
    builds++;
    if (unblock) await unblock;
    if (fail) throw new Error("build failed");
    await mkdir(join(tools, "capture-x11-build", "release"), { recursive: true });
    await writeFile(release, new Uint8Array([builds]));
    await chmod(release, 0o755);
  }, root);
  return { root, source, tools, env, prepare, builds: () => builds,
    fail(value: boolean) { fail = value; }, block(promise: Promise<void>) { unblock = promise; } };
}

test("native builds invalidate on source, manifest, lockfile, and missing binary", async () => {
  const f = await fixture();
  try {
    const binary = await f.prepare(f.env);
    await f.prepare(f.env);
    expect(f.builds()).toBe(1);
    for (const file of ["src/main.rs", "src/input.rs", "Cargo.toml", "Cargo.lock"]) {
      await writeFile(join(f.source, file), new Uint8Array([f.builds()]));
      await f.prepare(f.env);
    }
    expect(f.builds()).toBe(5);
    await rm(binary);
    await f.prepare(f.env);
    expect(f.builds()).toBe(6);
  } finally { await rm(f.root, { recursive: true, force: true }); }
});

test("a failed rebuild preserves the usable executable and retries", async () => {
  const f = await fixture();
  try {
    const binary = await f.prepare(f.env);
    const receipt = await readFile(`${binary}.sha256`);
    await writeFile(join(f.source, "src", "main.rs"), new Uint8Array([99]));
    f.fail(true);
    await expect(f.prepare(f.env)).rejects.toBeInstanceOf(Error);
    expect(await readFile(binary)).toEqual(Buffer.from([1]));
    expect(await readFile(`${binary}.sha256`)).toEqual(receipt);
    f.fail(false);
    await f.prepare(f.env);
    expect(f.builds()).toBe(3);
    expect(await readFile(binary)).toEqual(Buffer.from([3]));
  } finally { await rm(f.root, { recursive: true, force: true }); }
});

test("concurrent commands share one native build", async () => {
  const f = await fixture();
  let release!: () => void;
  f.block(new Promise(resolve => { release = resolve; }));
  try {
    const first = f.prepare(f.env);
    const second = f.prepare(f.env);
    expect(first).toBe(second);
    release();
    expect(await first).toBe(await second);
    expect(f.builds()).toBe(1);
  } finally { release(); await rm(f.root, { recursive: true, force: true }); }
});
