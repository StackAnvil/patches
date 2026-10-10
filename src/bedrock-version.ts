import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { Effect } from "effect";

const products = {
  release: { id: "9NBLGGH2JHXJ", family: "Microsoft.MinecraftUWP" },
  preview: { id: "9P5X4QVLC2XR", family: "Microsoft.MinecraftWindowsBeta" },
} as const;
export type BedrockChannel = keyof typeof products;
type FetchMetadata = (url: URL, init: RequestInit) => Promise<Response>;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const metadataLimit = 2 * 1024 * 1024;

export interface BedrockVersionPin {
  channel: BedrockChannel;
  productId: string;
  contentId: string;
  versionId: string;
  packageVersion: string;
  fileName: string;
  fileSize: number;
}

interface BedrockVersionLookup {
  channel?: BedrockChannel;
  authorization?: string;
  versionId?: string;
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Unexpected package metadata structure");
  return value as Record<string, unknown>;
}

function windowsPackageVersion(versionId: string): string {
  const match = /^(\d+\.\d+\.\d+\.\d+)\.(.+)$/.exec(versionId);
  if (!match || !uuid.test(match[2]!)) throw new Error("Invalid Xbox version ID");
  return match[1]!;
}

/** Accept an Authorization header or the JSON response from Xbox XSTS authorization. */
export function xboxAuthorization(text: string): string {
  let header = text.trim();
  if (header.startsWith("{")) {
    try {
      const response = record(JSON.parse(header));
      const claims = record(response.DisplayClaims).xui;
      if (!Array.isArray(claims) || claims.length !== 1) throw new Error();
      const hash = record(claims[0]).uhs;
      if (typeof hash !== "string" || typeof response.Token !== "string") throw new Error();
      header = `XBL3.0 x=${hash};${response.Token}`;
    } catch {
      throw new Error("The auth file must contain an Xbox Authorization header or an XSTS response with Token and DisplayClaims.xui[0].uhs");
    }
  }
  if (!/^XBL3\.0 x=\d+;[A-Za-z0-9._~+/-]+=*$/.test(header)) {
    throw new Error("Invalid Xbox Authorization header. Use XBL3.0 x=<user hash>;<XSTS token>");
  }
  return header;
}

export function bedrockContentId(metadata: unknown, productId: string): string {
  const items = record(metadata).Items;
  if (!Array.isArray(items)) throw new Error("The Store response contains no products");
  const ids = new Set<string>();
  for (const item of items.map(record)) {
    if (item.ProductId !== productId) continue;
    if (!Array.isArray(item.ContentIds)) throw new Error("The Store product contains no content IDs");
    for (const id of item.ContentIds) {
      if (typeof id !== "string" || !uuid.test(id)) throw new Error("The Store product contains an invalid content ID");
      ids.add(id.toLowerCase());
    }
  }
  if (ids.size !== 1) throw new Error("Expected one Windows content ID for the selected Bedrock product");
  return [...ids][0]!;
}

export function bedrockVersionPin(metadata: unknown, channel: BedrockChannel, contentId: string): BedrockVersionPin {
  const response = record(metadata);
  if (response.PackageFound !== true) throw new Error("Xbox found no package for this lookup. The version can be unavailable, or the account can lack entitlement");
  if (typeof response.ContentId !== "string" || response.ContentId.toLowerCase() !== contentId) {
    throw new Error("Xbox returned a different content ID");
  }
  const versionId = response.VersionId;
  if (typeof versionId !== "string") throw new Error("Invalid Xbox version ID");
  const packageVersion = windowsPackageVersion(versionId);
  if (response.Version !== versionId && response.Version !== packageVersion) throw new Error("Xbox package version and version ID differ");
  if (response.UpdatePredownload !== false) throw new Error("Xbox did not confirm that this package is available now");
  if (!Array.isArray(response.PackageFiles)) throw new Error("Xbox returned no package files");
  const product = products[channel];
  const fileName = `${product.family}_${packageVersion}_x64__8wekyb3d8bbwe.msixvc`;
  const files = response.PackageFiles.map(record).filter((file) => file.FileName === fileName);
  if (files.length !== 1) throw new Error("Expected one full x64 MSIXVC package for the selected Bedrock version");
  const file = files[0]!;
  if (typeof file.ContentId !== "string" || file.ContentId.toLowerCase() !== contentId || file.VersionId !== versionId
    || typeof file.FileSize !== "number" || !Number.isSafeInteger(file.FileSize) || file.FileSize <= 0) {
    throw new Error("The full package has inconsistent identity or size metadata");
  }
  // Deliberately exclude KeyBlob, license data, and temporary CDN URLs from the pin.
  return { channel, productId: product.id, contentId, versionId, packageVersion, fileName, fileSize: file.FileSize };
}

function metadataRequest(url: URL, headers: Record<string, string>, fetchMetadata: FetchMetadata) {
  return Effect.tryPromise({
    try: async (signal) => {
      let response: Response;
      try {
        response = await fetchMetadata(url, {
          headers: { Accept: "application/json", ...headers },
          redirect: "error",
          signal: AbortSignal.any([signal, AbortSignal.timeout(30_000)]),
        });
      } catch {
        throw new Error(`Could not reach ${url.hostname}. Check the network and TLS trust`);
      }
      if (!response.ok) {
        await response.body?.cancel().catch(() => {});
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Xbox authentication failed (HTTP ${response.status}). Supply --auth-file with a fresh XSTS token for http://update.xboxlive.com`);
        }
        throw new Error(`Metadata request to ${url.hostname} failed (HTTP ${response.status})`);
      }
      if (!response.body) throw new Error("The metadata response is empty");
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          size += value.length;
          if (size > metadataLimit) throw new Error("The metadata response exceeds 2 MiB");
          chunks.push(value);
        }
        return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
      } catch {
        await reader.cancel().catch(() => {});
        throw new Error("Could not read valid JSON metadata within the time and size limits");
      } finally {
        reader.releaseLock();
      }
    },
    catch: (cause) => cause instanceof Error ? cause : new Error("Metadata request failed"),
  });
}

export const resolveBedrockVersion = Effect.fn("resolveBedrockVersion")(function* (
  { channel = "release", authorization, versionId }: BedrockVersionLookup = {}, fetchMetadata: FetchMetadata = fetch,
) {
  if (versionId !== undefined) yield* Effect.try({
    try: () => windowsPackageVersion(versionId), catch: (cause) => cause instanceof Error ? cause : new Error("Invalid Xbox version ID"),
  });
  const auth = authorization === undefined ? undefined : yield* Effect.try({
    try: () => xboxAuthorization(authorization), catch: (cause) => cause instanceof Error ? cause : new Error("Invalid Xbox authorization"),
  });
  const catalog = new URL("https://storesdk.dsx.mp.microsoft.com/v8.0/Sdk/products/contentId");
  catalog.search = new URLSearchParams({
    market: "US", locale: "en-US", languages: "en-US", deviceFamily: "Windows.Desktop", productIds: products[channel].id,
  }).toString();
  const catalogMetadata = yield* metadataRequest(catalog, {}, fetchMetadata);
  const contentId = yield* Effect.try({
    try: () => bedrockContentId(catalogMetadata, products[channel].id),
    catch: (cause) => cause instanceof Error ? cause : new Error("Invalid Store content ID"),
  });
  const packageUrl = new URL(versionId === undefined
    ? `https://packagespc.xboxlive.com/GetBasePackage/${contentId}`
    : `https://packagespc.xboxlive.com/GetSpecificBasePackage/${contentId}/${versionId}`);
  const headers: Record<string, string> = { "x-xbl-contract-version": "3" };
  if (auth) headers.Authorization = auth;
  const metadata = yield* metadataRequest(packageUrl, headers, fetchMetadata);
  return yield* Effect.try({
    try: () => {
      const pin = bedrockVersionPin(metadata, channel, contentId);
      if (versionId !== undefined && pin.versionId.toLowerCase() !== versionId.toLowerCase()) {
        throw new Error("Xbox returned a different version from the requested pin");
      }
      return pin;
    },
    catch: (cause) => cause instanceof Error ? cause : new Error("Invalid Xbox package metadata"),
  });
});

const help = `Resolve the latest Windows Bedrock package ID for a reviewed pin.

Usage: bun run bedrock:version [--channel release|preview] [--auth-file PATH]
       [--version-id ID]

The default channel is release. JSON goes to stdout. Errors go to stderr.
Use --version-id to verify an exact package instead of the latest release.
The auth file accepts XBL3.0 x=<user hash>;<XSTS token>, or an XSTS JSON response.
Get the token with the relying party http://update.xboxlive.com.
A Minecraft login token uses a different relying party and cannot replace it.
The script reads metadata only. It does not download or decrypt the game.
See docs/bedrock-package-version.md for the authentication steps.
`;

export async function bedrockVersionMain(args: string[]): Promise<void> {
  const { values } = parseArgs({ args, options: {
    channel: { type: "string", default: "release" }, "auth-file": { type: "string" }, "version-id": { type: "string" },
    help: { type: "boolean", short: "h" },
  } });
  if (values.help) { process.stdout.write(help); return; }
  if (values.channel !== "release" && values.channel !== "preview") throw new Error("Choose --channel release or preview");
  const authorization = values["auth-file"] === undefined ? undefined : xboxAuthorization(await readFile(values["auth-file"], "utf8"));
  const pin = await Effect.runPromise(resolveBedrockVersion({ channel: values.channel, authorization, versionId: values["version-id"] }));
  process.stdout.write(`${JSON.stringify(pin, null, 2)}\n`);
}

if (import.meta.main) {
  bedrockVersionMain(process.argv.slice(2)).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Could not resolve the Bedrock version ID");
    process.exitCode = 1;
  });
}
