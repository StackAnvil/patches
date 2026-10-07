import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";

export function builtinUiManifest(version: string, bytes: Uint8Array) {
  return { format: 1, version, size: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
}

/** Checks an acquired versioned bundle before Gradle embeds it in the core JAR. */
export async function verifyBuiltinUi(path: string, version: string): Promise<string> {
  const metadata: unknown = JSON.parse(await readFile(`${path}.manifest.json`, "utf8"));
  if (typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) {
    throw new Error("Invalid bundled Bedrock UI manifest");
  }
  const size = (await stat(path)).size;
  if (size > 64 * 1024 * 1024) throw new Error("Bundled Bedrock UI exceeds the size limit");
  const actual = builtinUiManifest(version, await readFile(path));
  const declared = metadata as Record<string, unknown>;
  if (actual.size > 64 * 1024 * 1024 || Object.entries(actual).some(([key, value]) => declared[key] !== value)) {
    throw new Error("Bundled Bedrock UI identity mismatch");
  }
  return path;
}
