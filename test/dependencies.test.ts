import { expect, test } from "bun:test";
import { buildOrder } from "../src/dependencies.ts";
import { getTargets } from "../src/model.ts";

test("dependent targets build after their patched dependencies", async () => {
  const order = buildOrder(await getTargets(), "viafabricplus-bedrock");
  expect(order.at(-1)).toBe("viafabricplus-bedrock");
  expect(order.indexOf("cubeconverter")).toBeLessThan(order.indexOf("viabedrock"));
  expect(order.indexOf("viabedrock")).toBeLessThan(order.indexOf("viafabricplus-bedrock"));
  expect(order.indexOf("viafabricplus")).toBeLessThan(order.indexOf("viafabricplus-bedrock"));
});

test("dependency cycles and unknown targets stop the build", async () => {
  const targets = await getTargets();
  expect(() => buildOrder({ ...targets, cubeconverter: { ...targets.cubeconverter!, dependsOn: ["viabedrock"] } }, "all"))
    .toThrow(/Dependency cycle/);
  expect(() => buildOrder(targets, "missing")).toThrow(/Unknown target/);
});
