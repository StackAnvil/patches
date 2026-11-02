import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { link, mkdtemp, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

interface ReplayArtifact {
  role: "client-mod" | "transport" | "proxy-recorder";
  path: string;
}

/** Retain the staged bytes' identity before launch and private dependency cleanup. */
export async function writeReplayArtifactEvidence(
  output: string,
  files: readonly ReplayArtifact[],
): Promise<void> {
  const artifacts = [];
  for (const file of files) {
    const hash = createHash("sha256");
    let bytes = 0;
    for await (const chunk of createReadStream(file.path)) {
      hash.update(chunk);
      bytes += chunk.length;
    }
    artifacts.push({
      role: file.role,
      file: basename(file.path),
      bytes,
      sha256: hash.digest("hex"),
    });
  }
  const staging = await mkdtemp(join(dirname(output), ".artifact-evidence-"));
  try {
    const temporary = join(staging, "receipt.json");
    await writeFile(temporary, `${JSON.stringify({ schema: 1, artifacts }, null, 2)}\n`, {
      mode: 0o600,
      flag: "wx",
    });
    // Publish complete bytes without replacing evidence from another attempt.
    await link(temporary, output);
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}
