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

test.skipIf(!built)("publishes a burst of audit changes without a direct recorder and avoids unchanged writes", async () => {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-render-audit-"));
  try {
    const jar = await artifact("viaproxy");
    await writeFile(join(directory, "stackanvil-replay-directory.txt"), directory);
    await execute("javac", ["-cp", jar, "-d", directory,
      join(root, "src/replay/fabric/com/enderdash/agent/replay/fabric/RenderAudit.java"),
      join(root, "test/fixtures/RenderAuditSelfTest.java")]);
    const result = await execute("java", ["-cp", `${directory}${delimiter}${jar}`,
      "com.enderdash.agent.replay.fabric.RenderAuditSelfTest", directory], { cwd: directory });
    expect(result.stderr).toBeEmpty();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}, 15_000);
