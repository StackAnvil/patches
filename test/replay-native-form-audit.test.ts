import { expect, test } from "bun:test";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { promisify } from "node:util";
import { root } from "../src/model.ts";
import { artifact } from "../src/prism.ts";

const execute = promisify(execFile);
const built = existsSync(join(root, "dist/viaproxy/manifest.json"));

test.skipIf(!built)("observes clipped form controls with inherited visibility and bounded private metadata", async () => {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-native-form-audit-"));
  try {
    const jar = await artifact("viaproxy");
    await execute("javac", ["-cp", jar, "-d", directory,
      join(root, "src/replay/java/com/enderdash/agent/replay/PrivateFiles.java"),
      join(root, "src/replay/fabric/com/enderdash/agent/replay/fabric/NativeFormAudit.java"),
      join(root, "test/fixtures/NativeFormAuditSelfTest.java")]);
    const result = await execute("java", ["-cp", `${directory}${delimiter}${jar}`,
      "com.enderdash.agent.replay.fabric.NativeFormAuditSelfTest", directory], { cwd: directory });
    expect(result.stderr).toBeEmpty();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}, 15_000);
