import { expect, test } from "bun:test";
import { parseRelease, releaseLink, setupDownloads } from "../site/src/lib/releases";

const tag = "stack-v1.2.3";
function asset(name: string, release = tag) {
  return {
    name,
    browser_download_url: `https://github.com/StackAnvil/patches/releases/download/${release}/${name}`,
    size: 1024,
    state: "uploaded",
  };
}
function release(assets: ReturnType<typeof asset>[]) {
  return {
    tag_name: tag,
    html_url: `https://github.com/StackAnvil/patches/releases/tag/${tag}`,
    published_at: "2026-11-14T12:00:00Z",
    assets,
  };
}

test("Fabric downloads contain only the tested pair from one release", () => {
  const parsed = parseRelease(
    release([
      asset("ViaFabricPlus-5.1.4-SNAPSHOT.jar"),
      asset("ViaFabricPlus-5.1.4-SNAPSHOT-api.jar"),
      asset("viafabricplus-bedrock-1.0-StackAnvil.jar"),
      asset("ViaProxy-3.4-StackAnvil.jar"),
      asset("StackAnvil-26.3.mrpack"),
    ]),
  );
  expect(setupDownloads(parsed, "fabric").map(({ asset }) => asset.name)).toEqual([
    "ViaFabricPlus-5.1.4-SNAPSHOT.jar",
    "viafabricplus-bedrock-1.0-StackAnvil.jar",
  ]);
  expect(setupDownloads(parsed, "proxy")[0]?.title).toBe("ViaProxy");
  expect(setupDownloads(parsed, "modpack")[0]?.asset.name).toBe("StackAnvil-26.3.mrpack");
  expect(parsed?.minecraft).toBe("26.3");
});

test("an incomplete or ambiguous Fabric pair falls back to the release assets", () => {
  const incomplete = parseRelease(release([asset("ViaFabricPlus-5.1.4.jar")]));
  expect(setupDownloads(incomplete, "fabric")).toEqual([]);
  expect(releaseLink(incomplete)).toBe(`https://github.com/StackAnvil/patches/releases/tag/${tag}`);
  const ambiguous = parseRelease(
    release([
      asset("ViaFabricPlus-5.1.3.jar"),
      asset("ViaFabricPlus-5.1.4.jar"),
      asset("viafabricplus-bedrock-1.0-StackAnvil.jar"),
    ]),
  );
  expect(setupDownloads(ambiguous, "fabric")).toEqual([]);
});

test("foreign assets and assets from another tag cannot enter the download pair", () => {
  const parsed = parseRelease(
    release([
      asset("ViaFabricPlus-5.1.4.jar"),
      asset("viafabricplus-bedrock-1.0-StackAnvil.jar", "stack-v0.9.0"),
      {
        ...asset("viafabricplus-bedrock-2.0-StackAnvil.jar"),
        browser_download_url: "https://example.com/untrusted.jar",
      },
    ]),
  );
  expect(setupDownloads(parsed, "fabric")).toEqual([]);
  expect(parsed?.assets).toHaveLength(1);
});

test("missing or unpublished release metadata leaves a usable GitHub fallback", () => {
  expect(parseRelease(null)).toBeNull();
  expect(parseRelease({ ...release([]), draft: true })).toBeNull();
  expect(parseRelease({ ...release([]), prerelease: true })).toBeNull();
  expect(parseRelease({ ...release([]), html_url: "https://example.com/release" })).toBeNull();
  expect(setupDownloads(null, "proxy")).toEqual([]);
  expect(releaseLink(null)).toBe("https://github.com/StackAnvil/patches/releases/latest");
});
