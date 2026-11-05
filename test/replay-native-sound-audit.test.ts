import { expect, test } from "bun:test";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { promisify } from "node:util";
import { root } from "../src/model.ts";
import { artifact } from "../src/client-artifacts.ts";

const execute = promisify(execFile);
const built = existsSync(join(root, "dist/viaproxy/manifest.json"));

test.skipIf(!built)("keeps level requests separate from PCM starts and bounds private sound observations", async () => {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-native-sound-audit-"));
  try {
    const jar = await artifact("viaproxy");
    await writeFile(join(directory, "stackanvil-replay-directory.txt"), directory);
    await execute("javac", ["-cp", jar, "-d", directory,
      join(root, "src/replay/java/net/pistonmaster/stackanvil/replay/PrivateFiles.java"),
      join(root, "src/replay/fabric/net/pistonmaster/stackanvil/replay/fabric/NativeSoundAudit.java"),
      join(root, "test/fixtures/NativeSoundAuditSelfTest.java")]);
    const result = await execute("java", ["-cp", `${directory}${delimiter}${jar}`,
      "net.pistonmaster.stackanvil.replay.fabric.NativeSoundAuditSelfTest", directory], { cwd: directory });
    expect(result.stderr).toBeEmpty();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}, 15_000);
