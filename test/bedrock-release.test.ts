import { expect, test } from "bun:test";
import { bedrockRelease, unsupportedServerRelease } from "../src/bedrock-release.ts";

test("a hotfix server joins ViaProxy under its release line name", () => {
  expect(bedrockRelease("1.26.66.1")).toBe("1.26.60");
  expect(bedrockRelease("1.26.60")).toBe("1.26.60");
  expect(bedrockRelease("1.21.111.1")).toBe("1.21.110");
  expect(unsupportedServerRelease("1.26.66", "1.26.60")).toBeUndefined();
});

test("a server from another release line stops the run before ViaProxy starts", () => {
  expect(unsupportedServerRelease("1.26.45", "1.26.60")).toContain(
    "Bedrock server 1.26.45 is not on the supported 1.26.60 release line.",
  );
  expect(bedrockRelease("latest")).toBeUndefined();
});
