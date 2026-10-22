import { expect, test } from "bun:test";
import { hiveTarget, publicTarget } from "../src/replay/targets.ts";

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
  ])
    expect(hiveTarget(publicTarget(address))).toBe(true);
  for (const address of [
    "play.cubecraft.net:19132",
    "hivebedrock.cloud.example.org:19132",
    "nothivebedrock.cloud:19132",
  ])
    expect(hiveTarget(publicTarget(address))).toBe(false);
});
