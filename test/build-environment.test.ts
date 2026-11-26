import { afterEach, expect, test } from "bun:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { buildEnvironment, builtinAssetArguments, prepareBuildInputs } from "../src/build.ts";
import { buildOrder } from "../src/dependencies.ts";
import { getTargets } from "../src/model.ts";

const variables = [
  "STACKANVIL_JAVA_17",
  "STACKANVIL_JAVA_25",
  "STACKANVIL_JAVA_99",
  "STACKANVIL_OREUI_SHAPER_RESOURCES",
  "STACKANVIL_REQUIRE_ALL_OREUI_SHAPERS",
  "JAVA_HOME",
  "HOME",
] as const;
const saved = Object.fromEntries(variables.map((name) => [name, process.env[name]]));
const directories: string[] = [];

async function jdk(javaVersion: string): Promise<string> {
  const home = await mkdtemp(join(tmpdir(), "stackanvil-jdk-"));
  directories.push(home);
  await mkdir(join(home, "bin"));
  await writeFile(join(home, "bin", "java"), "");
  await writeFile(join(home, "release"), `IMPLEMENTOR="Test"\nJAVA_VERSION="${javaVersion}"\n`);
  return home;
}

afterEach(async () => {
  for (const name of variables) {
    const value = saved[name];
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
  await Promise.all(directories.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

test("the target JDK replaces the host runtime without changing the host environment", async () => {
  const home = await jdk("17.0.15");
  const hostHome = process.env["JAVA_HOME"];
  const hostPath = process.env["PATH"];
  process.env["STACKANVIL_JAVA_17"] = home;
  const environment = await buildEnvironment("17");
  expect(environment["JAVA_HOME"]).toBe(home);
  expect(environment["PATH"]?.split(":")[0]).toBe(join(home, "bin"));
  expect(process.env["JAVA_HOME"]).toBe(hostHome);
  expect(process.env["PATH"]).toBe(hostPath);
});

test("an override that is not the requested Java version stops the build", async () => {
  const home = await jdk("21.0.11");
  process.env["STACKANVIL_JAVA_17"] = home;
  await expect(buildEnvironment("17")).rejects.toThrow(
    `STACKANVIL_JAVA_17 must name a Java 17 JDK home, but ${home} is Java 21.`,
  );
  process.env["STACKANVIL_JAVA_17"] = join(home, "missing");
  await expect(buildEnvironment("17")).rejects.toThrow("is not a JDK home with bin/java and a release file");
});

test("the host JAVA_HOME is used only when it has the requested version", async () => {
  process.env["HOME"] = await mkdtemp(join(tmpdir(), "stackanvil-home-"));
  directories.push(process.env["HOME"]);
  process.env["JAVA_HOME"] = await jdk("21.0.11");
  await expect(buildEnvironment("99")).rejects.toThrow("Java 99 is missing");
  process.env["JAVA_HOME"] = await jdk("99.0.1");
  expect((await buildEnvironment("99"))["JAVA_HOME"]).toBe(process.env["JAVA_HOME"]);
});

test("a full build reports every missing input before the first Gradle build", async () => {
  const repository = await mkdtemp(join(tmpdir(), "stackanvil-build-inputs-"));
  directories.push(repository);
  await writeFile(join(repository, "bedrock-assets.json"), '{"version":"1.26.60.5"}');
  process.env["STACKANVIL_OREUI_SHAPER_RESOURCES"] = join(repository, "shaper");
  // Release mode reports missing engines instead of compiling the host's.
  process.env["STACKANVIL_REQUIRE_ALL_OREUI_SHAPERS"] = "1";
  process.env["STACKANVIL_JAVA_17"] = await jdk("21.0.11");
  process.env["STACKANVIL_JAVA_25"] = await jdk("25.0.1");
  const targets = await getTargets();
  const result = prepareBuildInputs(buildOrder(targets, "all"), targets, repository);
  // CubeConverter and ViaBedrock come first in the order, but the add-on's inputs are still checked.
  await expect(result).rejects.toThrow("STACKANVIL_JAVA_17 must name a Java 17 JDK home");
  await expect(result).rejects.toThrow("Bundled Bedrock UI is missing for 1.26.60.5");
  await expect(result).rejects.toThrow("OreUI shaper resources are missing for linux-x64");
});

test("add-on PR builds use the tracked assets without the setup-only OreUI shaper", async () => {
  process.env["STACKANVIL_OREUI_SHAPER_RESOURCES"] = join(tmpdir(), "stackanvil-missing-shaper");
  expect(await builtinAssetArguments("viafabricplus-bedrock")).toEqual([
    expect.stringMatching(/^-PbedrockBuiltinAssets=/u),
  ]);
});
