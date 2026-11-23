import { expect, test } from "bun:test";
import { buildOrder } from "../src/dependencies.ts";
import { required } from "../src/guards.ts";
import { getTarget, getTargets } from "../src/model.ts";

test("dependent targets build after their patched dependencies", async () => {
  const order = buildOrder(await getTargets(), "viafabricplus-bedrock");
  expect(order.at(-1)).toBe("viafabricplus-bedrock");
  expect(order.indexOf("cubeconverter")).toBeLessThan(order.indexOf("viabedrock"));
  expect(order.indexOf("viabedrock")).toBeLessThan(order.indexOf("viafabricplus-bedrock"));
  expect(order).not.toContain("viafabricplus");
  const proxyOrder = buildOrder(await getTargets(), "viaproxy");
  expect(proxyOrder.at(-1)).toBe("viaproxy");
  expect(proxyOrder.indexOf("viabedrock")).toBeLessThan(proxyOrder.indexOf("viaproxy"));
});

test("dependency cycles and unknown targets stop the build", async () => {
  const targets = await getTargets();
  expect(() =>
    buildOrder(
      {
        ...targets,
        cubeconverter: {
          ...required(targets["cubeconverter"], "The cubeconverter target"),
          dependsOn: ["viabedrock"],
        },
      },
      "all",
    ),
  ).toThrow(/Dependency cycle/);
  expect(() => buildOrder(targets, "missing")).toThrow(/Unknown target/);
});

test("inherited object members are unknown targets", async () => {
  const targets = await getTargets();
  expect(() => buildOrder(targets, "constructor")).toThrow("Unknown target constructor");
  expect(() => buildOrder(targets, "__proto__")).toThrow("Unknown target __proto__");
  await expect(getTarget("toString")).rejects.toThrow(/^Unknown target toString\./u);
});
