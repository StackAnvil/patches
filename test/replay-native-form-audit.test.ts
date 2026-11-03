import { expect, test } from "bun:test";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { promisify } from "node:util";
import { root } from "../src/model.ts";
import { artifact } from "../src/client-artifacts.ts";

const execute = promisify(execFile);
const built = existsSync(join(root, "dist/viaproxy/manifest.json"));

test.skipIf(!built)("distinguishes authored forms, shared scenes and fallback dialogs while retaining bounded geometry", async () => {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-native-form-audit-"));
  try {
    const jar = await artifact("viaproxy");
    await execute("javac", ["-cp", jar, "-d", directory,
      join(root, "src/replay/java/net/pistonmaster/stackanvil/replay/PrivateFiles.java"),
      join(root, "src/replay/fabric/net/pistonmaster/stackanvil/replay/fabric/NativeFormAudit.java"),
      join(root, "test/fixtures/NativeFormAuditSelfTest.java"),
      ...["NativeUiSceneScreen", "BedrockFormController", "BedrockFallbackFormScreen", "DialogScreen"]
        .map((name) => join(root, "test/fixtures/native-form-audit", `${name}.java`))]);
    const result = await execute("java", ["-cp", `${directory}${delimiter}${jar}`,
      "net.pistonmaster.stackanvil.replay.fabric.NativeFormAuditSelfTest", directory], { cwd: directory });
    expect(result.stderr).toBeEmpty();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}, 15_000);
