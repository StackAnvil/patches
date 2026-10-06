import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { configureShaders, graphicsFailures, readGraphicsLock, updateProperties } from "../src/integration/graphics.ts";
import { verifiedDownload } from "../src/integration/modpack.ts";

test("sets Iris preferences once and retains unrelated settings across repeated setup", () => {
  const values = { enableShaders: "true", shaderPack: "test.zip" };
  const original = "# preferences\r\nenableShaders=false\r\n enableShaders : false\r\nshaderPack=old.zip\r\ncolorSpace=SRGB\r\n";
  const changed = updateProperties(original, values);
  const parsed = Object.fromEntries(changed.split("\n").filter((line) => !line.startsWith("#") && line.includes("=")).map((line) => line.split("=")));
  expect(parsed).toEqual({ ...values, colorSpace: "SRGB" });
  expect(changed.split("\n").filter((line) => line.startsWith("enableShaders="))).toHaveLength(1);
  expect(updateProperties(changed, values)).toEqual(changed);
});

test("enables shaders in live and first-launch defaults, then resets the baseline", async () => {
  const instance = await mkdtemp(join(tmpdir(), "stackanvil-graphics-"));
  try {
    const lock = await readGraphicsLock();
    await configureShaders(instance, lock.shader);
    const live = join(instance, "minecraft/config/iris.properties");
    const defaults = join(instance, "minecraft/config/modpack_defaults/config/iris.properties");
    expect(await readFile(live, "utf8")).toEqual(await readFile(defaults, "utf8"));
    expect(Bun.TOML.parse(await readFile(join(instance, "minecraft/config/lambdynlights.toml"), "utf8"))).toEqual({
      mode: "fancy", light_sources: { entities: true, self: true },
    });
    const options = await readFile(join(instance, "minecraft/shaderpacks", `${lock.shader.filename}.txt`), "utf8");
    expect(Object.fromEntries(options.trim().split("\n").map((line) => line.split("=")))).toEqual(lock.shader.options);
    await configureShaders(instance);
    for (const path of [live, defaults]) {
      const properties = Object.fromEntries((await readFile(path, "utf8")).trim().split("\n").map((line) => line.split("=")));
      expect(properties.enableShaders).toEqual("false");
      expect(properties.shaderPack).toEqual("");
    }
  } finally { await rm(instance, { recursive: true, force: true }); }
});

test("reuses a verified shader cache but rejects damaged bytes without overwriting them", async () => {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-shader-cache-"));
  try {
    const path = join(directory, "shader.zip");
    const bytes = new Uint8Array([1, 4, 9, 16]);
    const hash = createHash("sha512").update(bytes).digest("hex");
    await writeFile(path, bytes);
    await verifiedDownload([], path, hash);
    expect(new Uint8Array(await readFile(path))).toEqual(bytes);
    await writeFile(path, bytes.subarray(0, 2));
    await expect(verifiedDownload([], path, hash)).rejects.toThrow();
    expect(new Uint8Array(await readFile(path))).toEqual(bytes.subarray(0, 2));
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("requires the selected shader and detects the reported pipeline failure independently of joins", () => {
  const active = "[Render thread/INFO]: Using shaderpack: test.zip\n";
  expect(graphicsFailures(active, "test.zip")).toHaveLength(0);
  expect(graphicsFailures(active, "other.zip")).toHaveLength(1);
  expect(graphicsFailures("[Render thread/INFO]: Using shaderpack: (off)", "test.zip")).toHaveLength(1);
  expect(graphicsFailures(`${active}Missing program viafabricplus-bedrock:pipeline/actor_false_false_false_false in override list\n`, "test.zip")).toHaveLength(1);
  expect(graphicsFailures(`${active}Failed to create shader rendering pipeline`, "test.zip")).toHaveLength(1);
  expect(graphicsFailures("", undefined)).toHaveLength(0);
});
