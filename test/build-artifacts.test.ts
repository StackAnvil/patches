import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "bun:test";
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
