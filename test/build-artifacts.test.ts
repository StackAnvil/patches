import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "bun:test";
import { readBuildArtifact } from "../src/build.ts";
import { listArtifacts } from "../src/model.ts";

test("selects the main ViaProxy JAR from the build output", async () => {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-artifacts-"));
  try {
    const libs = join(directory, "build", "libs");
    await mkdir(libs, { recursive: true });
    for (const name of ["ViaProxy-3.4.14-StackAnvil.jar", "ViaProxy-3.4.14-StackAnvil+java8.jar", "ViaProxy-3.4.14-StackAnvil-sources.jar"]) {
      await writeFile(join(libs, name), "");
    }
    expect(await listArtifacts(directory)).toEqual([join(libs, "ViaProxy-3.4.14-StackAnvil.jar")]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("a selected Gradle module supplies both the distributed JAR and its matching publication", async () => {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-build-artifacts-"));
  const write = async (path: string, content: string) => {
    await mkdir(join(directory, path, ".."), { recursive: true });
    await writeFile(join(directory, path), content);
  };
  try {
    const pom = (artifact: string) =>
      `<project><groupId>org.oryxel.cube</groupId><artifactId>${artifact}</artifactId><version>1.3</version></project>`;
    await write("build/libs/cubeconverter-1.3.jar", "standard");
    await write("build/publications/maven/pom-default.xml", pom("cubeconverter"));
    await write("vv-json/build/libs/vv-json-1.3.jar", "ViaVersion");
    await write("vv-json/build/libs/vv-json-1.3-sources.jar", "sources");
    await write("vv-json/build/publications/other/pom-default.xml", pom("wrong-publication"));
    await write("vv-json/build/publications/maven/pom-default.xml", pom("vv-json"));
    const selected = await readBuildArtifact(directory, {
      publication: "Maven",
      artifactProject: ":vv-json",
    });
    expect(selected.artifact).toBe(join(directory, "vv-json/build/libs/vv-json-1.3.jar"));
    expect(selected.pom).toBe(pom("vv-json"));
    expect(selected.coordinate).toEqual({
      group: "org.oryxel.cube",
      artifact: "vv-json",
      version: "1.3",
    });
    expect((await readBuildArtifact(directory, { publication: "Maven" })).coordinate.artifact).toBe(
      "cubeconverter",
    );
    await rm(join(directory, "vv-json/build/publications/maven"), { recursive: true });
    await expect(
      readBuildArtifact(directory, { publication: "Maven", artifactProject: ":vv-json" }),
    ).rejects.toThrow();
    await expect(
      readBuildArtifact(directory, { publication: "Maven", artifactProject: "../elsewhere" }),
    ).rejects.toThrow(/Invalid Gradle artifact project/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
