import { expect, test } from "bun:test";
import { Effect } from "effect";
import { bedrockContentId, bedrockVersionPin, resolveBedrockVersion, xboxAuthorization } from "../src/bedrock-version.ts";

const contentId = "7792d9ce-355a-493c-afbd-768f4a77c3b0";
const productId = "9NBLGGH2JHXJ";
const packageVersion = "1.26.5101.0";
const versionId = `${packageVersion}.953b8ef8-b2a7-46f7-b9e9-95e50bb4eeb7`;
const token = "private.test.token";
const authorization = `XBL3.0 x=123456789;${token}`;

function packageMetadata() {
  return {
    PackageFound: true, ContentId: contentId, VersionId: versionId, Version: versionId, UpdatePredownload: false,
    PackageFiles: [
      { FileName: "update.xsp", FileSize: 6000 },
      {
        ContentId: contentId, VersionId: versionId,
        FileName: `Microsoft.MinecraftUWP_${packageVersion}_x64__8wekyb3d8bbwe.msixvc`,
        FileSize: 2069975040, KeyBlob: token, RelativeUrl: token, CdnRootPaths: [token],
      },
    ],
  };
}

test("resolve the selected desktop product and deduplicate content IDs", () => {
  const item = { ProductId: productId, ContentIds: [contentId, contentId.toUpperCase()] };
  expect(bedrockContentId({ Items: [{ ProductId: "OTHER", ContentIds: [] }, item, item] }, productId)).toBe(contentId);
  expect(() => bedrockContentId({ Items: [item, { ...item, ContentIds: ["00000000-0000-0000-0000-000000000000"] }] }, productId)).toThrow();
  expect(() => bedrockContentId({ Items: [item] }, "OTHER")).toThrow();
});

test("select the full package and omit license and CDN data from the pin", () => {
  const pin = bedrockVersionPin(packageMetadata(), "release", contentId);
  expect(pin).toEqual({
    channel: "release", productId, contentId, versionId, packageVersion,
    fileName: `Microsoft.MinecraftUWP_${packageVersion}_x64__8wekyb3d8bbwe.msixvc`, fileSize: 2069975040,
  });
  expect(JSON.stringify(pin)).not.toContain(token);
});

test("refuse mismatched versions, wrong products, predownloads, and incomplete packages", () => {
  const original = packageMetadata();
  for (const changes of [
    { PackageFound: false }, { ContentId: "other" }, { VersionId: contentId }, { Version: "0" },
    { UpdatePredownload: true }, { PackageFiles: original.PackageFiles.slice(0, 1) },
    { PackageFiles: [original.PackageFiles[1], original.PackageFiles[1]] },
    ...[{ VersionId: "other" }, { ContentId: "other" }, { FileSize: -1 }, { FileSize: 1.5 }]
      .map((fileChanges) => ({ PackageFiles: [{ ...original.PackageFiles[1], ...fileChanges }] })),
  ]) {
    expect(() => bedrockVersionPin({ ...original, ...changes }, "release", contentId)).toThrow();
  }
  expect(() => bedrockVersionPin(original, "preview", contentId)).toThrow();
});

test("accept XSTS JSON and reject malformed auth without revealing its contents", () => {
  expect(xboxAuthorization(` ${authorization}\n`)).toBe(authorization);
  expect(xboxAuthorization(JSON.stringify({ Token: token, DisplayClaims: { xui: [{ uhs: "123456789" }] } }))).toBe(authorization);
  for (const text of ["{\"Token\":\"private", `Bearer ${token}`, `${authorization}\r\nInjected: ${token}`,
    JSON.stringify({ Token: token, DisplayClaims: { xui: [{ uhs: "123" }, { uhs: "456" }] } })]) {
    let error: unknown;
    try { xboxAuthorization(text); } catch (cause) { error = cause; }
    expect(error).toBeInstanceOf(Error);
    expect(String(error)).not.toContain(token);
  }
});

test("send authentication only to Xbox and use the preview content ID from the Store", async () => {
  const previewContentId = "98bd2335-9b01-4e4c-bd05-ccc01614078b";
  const metadata = packageMetadata();
  metadata.ContentId = previewContentId;
  metadata.PackageFiles[1]!.ContentId = previewContentId;
  metadata.PackageFiles[1]!.FileName = `Microsoft.MinecraftWindowsBeta_${packageVersion}_x64__8wekyb3d8bbwe.msixvc`;
  const calls: { url: URL; init: RequestInit }[] = [];
  const pin = await Effect.runPromise(resolveBedrockVersion({ channel: "preview", authorization }, async (url, init) => {
    calls.push({ url, init });
    return Response.json(calls.length === 1 ? { Items: [{ ProductId: "9P5X4QVLC2XR", ContentIds: [previewContentId] }] } : metadata);
  }));
  expect(pin.contentId).toBe(previewContentId);
  expect(calls).toHaveLength(2);
  expect(calls[0]!.url.searchParams.get("deviceFamily")).toBe("Windows.Desktop");
  expect(new Headers(calls[0]!.init.headers).has("Authorization")).toBe(false);
  expect(calls[1]!.url.href).toBe(`https://packagespc.xboxlive.com/GetBasePackage/${previewContentId}`);
  expect(new Headers(calls[1]!.init.headers).get("Authorization")).toBe(authorization);
  expect(calls.every(({ init }) => init.redirect === "error" && init.signal !== undefined)).toBe(true);
});

test("authentication, response, and transport errors never print raw credentials", async () => {
  for (const fail of [
    () => new Response(token, { status: 401 }),
    () => new Response(token, { status: 403 }),
    () => new Response(token, { status: 302 }),
    () => new Response(token),
    () => new Response("x".repeat(2 * 1024 * 1024 + 1)),
    () => { throw new Error(authorization); },
  ]) {
    let call = 0;
    const effect = resolveBedrockVersion({ authorization }, async () => {
      if (++call === 1) return Response.json({ Items: [{ ProductId: productId, ContentIds: [contentId] }] });
      return fail();
    });
    const result = await Effect.runPromise(Effect.result(effect));
    expect(result._tag).toBe("Failure");
    expect(JSON.stringify(result)).not.toContain(token);
  }
});

test("look up an exact version and reject an unexpected latest-version fallback", async () => {
  const urls: string[] = [];
  const lookup = (metadata: unknown) => resolveBedrockVersion({ authorization, versionId }, async (url) => {
    urls.push(url.href);
    return Response.json(url.hostname === "storesdk.dsx.mp.microsoft.com"
      ? { Items: [{ ProductId: productId, ContentIds: [contentId] }] } : metadata);
  });
  const pin = await Effect.runPromise(lookup(packageMetadata()));
  expect(pin.versionId).toBe(versionId);
  expect(urls[1]).toBe(`https://packagespc.xboxlive.com/GetSpecificBasePackage/${contentId}/${versionId}`);
  const metadata = packageMetadata();
  metadata.VersionId = `${packageVersion}.00000000-0000-0000-0000-000000000000`;
  metadata.Version = metadata.VersionId;
  metadata.PackageFiles[1]!.VersionId = metadata.VersionId;
  expect((await Effect.runPromise(Effect.result(lookup(metadata))))._tag).toBe("Failure");
  let called = false;
  const invalid = resolveBedrockVersion({ versionId: "../latest" }, async () => { called = true; return Response.json({}); });
  expect((await Effect.runPromise(Effect.result(invalid)))._tag).toBe("Failure");
  expect(called).toBe(false);
});
