import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Schema } from "effect";
import { parseJson } from "./guards.ts";
import { root } from "./model.ts";

const BedrockAssetsSchema = Schema.Struct({ version: Schema.String });

/**
 * Names the Bedrock release line of a full version, such as 1.26.60 for the 1.26.66.1 hotfix.
 * ViaProxy lists only release lines, so a hotfix server needs its line's name as the target version.
 */
export function bedrockRelease(version: string): string | undefined {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:\.\d+)?$/u.exec(version);
  if (!match) return undefined;
  const [, major, minor, patch] = match;
  return `${major}.${minor}.${Math.floor(Number(patch) / 10) * 10}`;
}

/** Returns the release line of the pinned Bedrock assets, which is the one ViaBedrock supports. */
export async function pinnedBedrockRelease(repository = root): Promise<string> {
  const { version } = parseJson(
    BedrockAssetsSchema,
    await readFile(join(repository, "bedrock-assets.json"), "utf8"),
  );
  const release = bedrockRelease(version);
  if (!release) throw new Error(`Invalid pinned Bedrock asset version: ${version}`);
  return release;
}

/** Explains why a test server cannot join through ViaProxy, or returns undefined when it can. */
export function unsupportedServerRelease(
  serverVersion: string,
  supportedRelease: string,
): string | undefined {
  const release = bedrockRelease(serverVersion);
  if (release === supportedRelease) return undefined;
  return `Bedrock server ${serverVersion} is not on the supported ${supportedRelease} release line. Install a ${supportedRelease} server and point BEDROCK_SERVER_HOME or STACKANVIL_JAVA_BEDROCK_SERVER_HOME at it.`;
}
