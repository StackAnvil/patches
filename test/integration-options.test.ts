import { describe, expect, test } from "bun:test";
import { integrationOptions } from "../src/integration/options.ts";

describe("integration argument validation before build or service startup", () => {
  test("rejects unknown options, positional arguments, and missing values", () => {
    for (const args of [["--reuse-buid"], ["java-bedrock"], ["--route"], ["--gameplay-cases", "--plain-only"]]) {
      expect(() => integrationOptions(args)).toThrow();
    }
  });

  test("keeps option values separate from flags", () => {
    const options = integrationOptions(["--route=java-bedrock", "--gameplay-cases", "chest-transfer", "--reuse-build", "--plain-only"]);
    expect(options.route).toBe("java-bedrock");
    expect(options["gameplay-cases"]).toBe("chest-transfer");
    expect(options["reuse-build"]).toBe(true);
    expect(options["plain-only"]).toBe(true);
    expect(options["entity-probe"]).toBeUndefined();
  });

  test("recognizes both help forms", () => {
    for (const args of [["--help"], ["-h"]]) {
      expect(integrationOptions(args).help).toBe(true);
    }
  });
});
