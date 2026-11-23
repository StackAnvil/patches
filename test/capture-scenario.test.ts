import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { parseScenario } from "../src/capture/scenario.ts";

function rejection(step: unknown): string {
  const steps = [{ action: "videoStart", name: "run" }, { action: "mark", label: "start" }, step];
  try {
    parseScenario(JSON.stringify({ name: "fixture", steps }));
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  return "accepted";
}

test("an invalid scenario step is rejected before the steps before it can run", () => {
  const point = { x: 0.5, y: 0.5 };
  for (const [step, message] of [
    [{ action: "wait", ms: -1 }, "Wait must be 0 to 120000 ms."],
    [{ action: "click", x: 1.5, y: 0.5 }, "between 0 and 1"],
    [{ action: "mouseHold", ...point, button: "left", ms: 10_001 }, "1 to 10000 ms"],
    [{ action: "buttonHold", button: "right", ms: 0 }, "1 to 10000 ms"],
    [{ action: "keyHold", key: "d", ms: 1.5 }, "1 to 10000 ms"],
    [{ action: "drag", button: "left", ms: 100, points: [point] }, "2 to 64 points"],
    [{ action: "screenshot", name: "Main-Menu" }, "lowercase letters"],
    [{ action: "videoStart", name: "after", fps: 240 }, "1 to 120"],
    [{ action: "mark", label: "" }, "short marker"],
    [{ action: "jump" }, "Unknown action"],
  ] as const) {
    const error = rejection(step);
    expect(error).toStartWith("Scenario step 3: ");
    expect(error).toContain(message);
  }
});

test("the documented example scenario passes validation", async () => {
  const scenario = parseScenario(await readFile("scenarios/realm-hub-observe.json", "utf8"));
  expect(scenario.steps.map((step) => step.action)).toEqual([
    "videoStart",
    "mark",
    "wait",
    "screenshot",
    "videoStop",
  ]);
});
