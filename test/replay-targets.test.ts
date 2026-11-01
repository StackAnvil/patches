import { expect, test } from "bun:test";
import { hiveTarget, publicTarget, viaProxyTarget } from "../src/replay/targets.ts";

test("accepts catalog endpoints and keeps their transport", () => {
  expect(publicTarget("20.101.55.176:30787")).toBe("20.101.55.176:30787");
  expect(publicTarget("play.enchanted.gg:19132")).toBe("play.enchanted.gg:19132");
  expect(publicTarget("nethernet://example.org:443")).toBe("nethernet://example.org:443");
  expect(publicTarget("[::1]:19132")).toBe("[::1]:19132");
  for (const address of [
    undefined,
    "",
    "example.org",
    "example.org:0",
    "example.org:65536",
    "user:secret@example.org:19132",
    "https://example.org:443",
    "example.org:19132/path",
    "example.org:19132?token=secret",
    "example.org:19132#fragment",
  ]) {
    expect(() => publicTarget(address)).toThrow();
  }
});

test("recognizes Hive targets without matching unrelated suffixes", () => {
  for (const address of [
    "geo.hivebedrock.cloud:19132",
    "GEO.HIVEBEDROCK.CLOUD:19132",
    "nethernet://hivebedrock.network:443",
    "nethernet.playhive.com:19132",
  ])
    expect(hiveTarget(publicTarget(address))).toBe(true);
  for (const address of [
    "play.cubecraft.net:19132",
    "hivebedrock.cloud.example.org:19132",
    "nothivebedrock.cloud:19132",
    "notplayhive.com:19132",
  ])
    expect(hiveTarget(publicTarget(address))).toBe(false);
});

test("keeps hosted experience network IDs separate from socket endpoints", () => {
  const target = "nethernet-xbox-json-rpc://12345678-1234-1234-1234-123456789abc";
  expect(publicTarget(target)).toBe(target);
  expect(viaProxyTarget(publicTarget(target))).toBe(target);
  for (const invalid of [
    `${target}:19132`,
    `${target}/path`,
    `${target}?token=secret`,
    "nethernet-xbox-json-rpc://user:secret@network-id",
  ])
    expect(() => publicTarget(invalid)).toThrow();
});

test("passes NetherNet hosts and ports to ViaProxy as socket addresses", () => {
  expect(viaProxyTarget(publicTarget("nethernet://127.0.0.1:5701"))).toBe("127.0.0.1:5701");
  expect(viaProxyTarget(publicTarget("nethernet://[::1]:5701"))).toBe("[::1]:5701");
  expect(viaProxyTarget(publicTarget("example.org:19132"))).toBe("example.org:19132");
});
