import { expect, test } from "bun:test";
import { releaseDownloads } from "../src/release-downloads.ts";

const files = [
  "StackAnvil-26.3.mrpack",
  "viafabricplus-bedrock-1.1.1-StackAnvil.jar",
  "ViaFabricPlus-5.1.2-SNAPSHOT.jar", "ViaProxy-3.4.15-StackAnvil.jar",
  "ViaBedrock-0.0.31-StackAnvil.jar", "cubeconverter-1.3-StackAnvil.jar",
];

test("download links select each published artifact and preserve tag and filename encoding", () => {
  const tag = "stack-v0.3.6+preview";
  const released = [...files, "viafabricplus-manifest.json", "viafabricplus-bedrock-manifest.json", "StackAnvil-26.3-Prism-Launcher_Config.zip"];
  const urls = releaseDownloads("StackAnvil/patches", tag, released.reverse()).map(({ url }) => new URL(url));
  expect(urls).toHaveLength(files.length);
  expect(new Set(urls.map((url) => decodeURIComponent(url.pathname.split("/").at(-1)!)))).toEqual(new Set(files));
  for (const url of urls) {
    expect(url.origin).toBe("https://github.com");
    expect(decodeURIComponent(url.pathname.split("/").at(-2)!)).toBe(tag);
  }
});

test("missing or ambiguous artifacts cannot produce published download links", () => {
  for (const file of files) {
    expect(() => releaseDownloads("StackAnvil/patches", "stack-v0.3.6", files.filter((other) => other !== file))).toThrow();
    expect(() => releaseDownloads("StackAnvil/patches", "stack-v0.3.6", [...files, file])).toThrow();
  }
  expect(() => releaseDownloads("StackAnvil/patches", "", files)).toThrow();
});
