import { expect, test } from "bun:test";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { promisify } from "node:util";
import { root } from "../src/model.ts";
import { artifact } from "../src/prism.ts";

const execute = promisify(execFile);
const built = existsSync(join(root, "dist/viaproxy/manifest.json"));

test.skipIf(!built)("observes retained camera state after decoder ownership ends and rejects an unhandled table", async () => {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-camera-preset-audit-"));
  try {
    const jar = await artifact("viaproxy");
    const logging = join(directory, "log4j2.xml");
    await writeFile(logging, '<Configuration status="ERROR"><Loggers><Root level="off"/></Loggers></Configuration>');
    await execute("javac", ["-cp", jar, "-d", directory,
      join(root, "src/replay/java/com/enderdash/agent/replay/CameraPresetAudit.java"),
      join(root, "test/fixtures/CameraPresetAuditSelfTest.java")]);
    const result = await execute("java", [`-Dlog4j2.configurationFile=${logging}`, "-cp", `${directory}${delimiter}${jar}`,
      "com.enderdash.agent.replay.CameraPresetAuditSelfTest", directory]);
    expect(result.stderr).toBeEmpty();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}, 15_000);
