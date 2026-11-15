import { site } from "./site";

export interface ReleaseAsset {
  name: string;
  url: string;
  size: number;
}

export interface Release {
  tag: string;
  url: string;
  publishedAt: string;
  assets: ReleaseAsset[];
  minecraft?: string;
}

export type Setup = "proxy" | "fabric" | "modpack";

function githubUrl(value: unknown, prefix: string) {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    return url.origin === "https://github.com" &&
      url.pathname.startsWith(prefix) &&
      !url.username &&
      !url.password
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}

export function parseRelease(value: unknown): Release | null {
  if (!value || typeof value !== "object") return null;
  if (
    !("tag_name" in value) ||
    typeof value.tag_name !== "string" ||
    !("html_url" in value) ||
    !("assets" in value) ||
    !Array.isArray(value.assets) ||
    ("draft" in value && value.draft) ||
    ("prerelease" in value && value.prerelease)
  )
    return null;
  const url = githubUrl(value.html_url, "/StackAnvil/patches/releases/tag/");
  if (!url) return null;
  const tag = value.tag_name;
  const assets = value.assets.flatMap((asset: unknown): ReleaseAsset[] => {
    if (!asset || typeof asset !== "object") return [];
    if (
      !("name" in asset) ||
      typeof asset.name !== "string" ||
      !("browser_download_url" in asset) ||
      !("size" in asset) ||
      typeof asset.size !== "number" ||
      asset.size < 0 ||
      ("state" in asset && asset.state !== "uploaded")
    )
      return [];
    const download = githubUrl(
      asset.browser_download_url,
      "/StackAnvil/patches/releases/download/",
    );
    if (!download) return [];
    // A release snapshot must never combine assets from different release tags.
    const expected = `/StackAnvil/patches/releases/download/${encodeURIComponent(tag)}/`;
    if (!new URL(download).pathname.startsWith(expected)) return [];
    return [{ name: asset.name, url: download, size: asset.size }];
  });
  const modpack = assets.find((asset) => /^StackAnvil-(.+)\.mrpack$/.test(asset.name));
  return {
    tag: value.tag_name,
    url,
    publishedAt:
      "published_at" in value && typeof value.published_at === "string" ? value.published_at : "",
    assets,
    ...(modpack ? { minecraft: modpack.name.slice("StackAnvil-".length, -".mrpack".length) } : {}),
  };
}

function only(assets: ReleaseAsset[], pattern: RegExp) {
  const matches = assets.filter((asset) => pattern.test(asset.name));
  return matches.length === 1 ? matches[0] : undefined;
}

export function setupDownloads(release: Release | null, setup: Setup) {
  const assets = release?.assets ?? [];
  const proxy = only(assets, /^ViaProxy-.+-StackAnvil\.jar$/);
  const viafabricplus = only(
    assets,
    /^ViaFabricPlus-(?!.*(?:-sources|-javadoc|-api)\.jar$).+\.jar$/,
  );
  const addon = only(assets, /^viafabricplus-bedrock-.+-StackAnvil\.jar$/);
  const modpack = only(assets, /^StackAnvil-.+\.mrpack$/);
  if (setup === "proxy") return proxy ? [{ title: "ViaProxy", asset: proxy }] : [];
  if (setup === "modpack") return modpack ? [{ title: "Client modpack", asset: modpack }] : [];
  return viafabricplus && addon
    ? [
        { title: "ViaFabricPlus", asset: viafabricplus },
        { title: "Bedrock add-on", asset: addon },
      ]
    : [];
}

export function releaseLink(release: Release | null) {
  return release?.url ?? site.latestRelease;
}
