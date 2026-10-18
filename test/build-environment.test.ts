import { expect, test } from "bun:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { buildEnvironment } from "../src/build.ts";

test("the target JDK replaces the host runtime without changing the host environment", async () => {
  const jdk = await mkdtemp(join(tmpdir(), "stackanvil-jdk-"));
  const previous = process.env.STACKANVIL_JAVA_17;
  const hostHome = process.env.JAVA_HOME;
  const hostPath = process.env.PATH;
  try {
    await mkdir(join(jdk, "bin"));
    await writeFile(join(jdk, "bin", "java"), "");
    process.env.STACKANVIL_JAVA_17 = jdk;
    const environment = await buildEnvironment("17");
    expect(environment.JAVA_HOME).toBe(jdk);
    expect(environment.PATH?.split(":")[0]).toBe(join(jdk, "bin"));
    expect(process.env.JAVA_HOME).toBe(hostHome);
    expect(process.env.PATH).toBe(hostPath);
  } finally {
    if (previous === undefined) delete process.env.STACKANVIL_JAVA_17;
    else process.env.STACKANVIL_JAVA_17 = previous;
    await rm(jdk, { recursive: true, force: true });
  }
});
