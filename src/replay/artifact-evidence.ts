import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { writeFile } from "node:fs/promises";
import { basename } from "node:path";

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
  await writeFile(output, `${JSON.stringify({ schema: 1, artifacts }, null, 2)}\n`, {
    mode: 0o600,
    flag: "wx",
  });
}
