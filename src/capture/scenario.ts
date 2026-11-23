import { Schema } from "effect";
import {
  checkDrag,
  checkFps,
  checkHold,
  checkId,
  checkKeyName,
  checkRatios,
  checkText,
} from "./ui.ts";

const MouseButton = Schema.Literals(["left", "right"]);
const StepSchema = Schema.Union([
  Schema.Struct({ action: Schema.Literal("mark"), label: Schema.String }),
  Schema.Struct({ action: Schema.Literal("wait"), ms: Schema.Finite }),
  Schema.Struct({ action: Schema.Literal("screenshot"), name: Schema.String }),
  Schema.Struct({
    action: Schema.Literals(["click", "doubleClick"]),
    x: Schema.Finite,
    y: Schema.Finite,
    button: Schema.optionalKey(MouseButton),
  }),
  Schema.Struct({
    action: Schema.Literal("mouseHold"),
    x: Schema.Finite,
    y: Schema.Finite,
    button: MouseButton,
    ms: Schema.Finite,
  }),
  Schema.Struct({ action: Schema.Literal("buttonHold"), button: MouseButton, ms: Schema.Finite }),
  Schema.Struct({
    action: Schema.Literal("drag"),
    points: Schema.Array(Schema.Struct({ x: Schema.Finite, y: Schema.Finite })),
    button: MouseButton,
    ms: Schema.Finite,
  }),
  Schema.Struct({ action: Schema.Literal("type"), text: Schema.String }),
  Schema.Struct({ action: Schema.Literals(["key", "doubleKey"]), key: Schema.String }),
  Schema.Struct({ action: Schema.Literal("keyHold"), key: Schema.String, ms: Schema.Finite }),
  Schema.Struct({
    action: Schema.Literal("videoStart"),
    name: Schema.String,
    fps: Schema.optionalKey(Schema.Finite),
  }),
  Schema.Struct({ action: Schema.Literal("videoStop") }),
]);
const isStep = Schema.is(StepSchema);
const isRecipe = Schema.is(
  Schema.Struct({ name: Schema.String, steps: Schema.Array(Schema.Unknown) }),
);

export type ScenarioStep = typeof StepSchema.Type;

export function checkMarker(label: string): void {
  if (!/^[A-Za-z0-9][A-Za-z0-9 _-]{0,80}$/u.test(label))
    throw new Error("Use a short marker with letters, digits, spaces, or hyphens.");
}

function checkStep(step: ScenarioStep): void {
  switch (step.action) {
    case "mark": {
      checkMarker(step.label);
      break;
    }
    case "wait": {
      if (!Number.isInteger(step.ms) || step.ms < 0 || step.ms > 120_000)
        throw new Error("Wait must be 0 to 120000 ms.");
      break;
    }
    case "screenshot": {
      checkId(step.name);
      break;
    }
    case "click":
    case "doubleClick": {
      checkRatios("Click", [step.x, step.y]);
      break;
    }
    case "mouseHold": {
      checkRatios("Click", [step.x, step.y]);
      checkHold("Mouse", step.ms);
      break;
    }
    case "buttonHold": {
      checkHold("Button", step.ms);
      break;
    }
    case "drag": {
      checkDrag(step.points, step.ms);
      break;
    }
    case "type": {
      checkText(step.text);
      break;
    }
    case "key":
    case "doubleKey": {
      checkKeyName(step.key);
      break;
    }
    case "keyHold": {
      checkKeyName(step.key);
      checkHold("Key", step.ms);
      break;
    }
    case "videoStart": {
      checkId(step.name);
      if (step.fps !== undefined) checkFps(step.fps);
      break;
    }
    case "videoStop": {
      break;
    }
  }
}

/** Checks every step before a scenario sends input, so an invalid step cannot strand a run. */
export function parseScenario(text: string): { name: string; steps: ScenarioStep[] } {
  const recipe: unknown = JSON.parse(text);
  if (!isRecipe(recipe)) throw new Error("Scenario needs a name and a steps array.");
  const steps = recipe.steps.map((step, index) => {
    try {
      if (!isStep(step)) throw new Error("Unknown action or invalid fields.");
      checkStep(step);
      return step;
    } catch (error) {
      throw new Error(
        `Scenario step ${index + 1}: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error },
      );
    }
  });
  return { name: recipe.name, steps };
}
