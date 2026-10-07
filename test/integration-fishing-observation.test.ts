import { expect, test } from "bun:test";
import { fishingRetrievalPasses, type FishingObservation } from "../src/integration/fishing-observation.ts";

function observation(entity = false): FishingObservation {
  return { uses: [100, entity ? 150 : 107], hooks: [{ id: "hook", spawned: 100, removed: entity ? 150 : 107 }],
    remainingHooks: [], rodCount: 1, rodDamage: entity ? 3 : 0, rewards: 0,
    target: entity ? { id: "cow", valid: true, healthBefore: 10, healthAfter: 10, frames: [
      { tick: 149, position: { x: 0, y: 0, z: 4 }, velocity: { x: 0, y: 0, z: 0 }, player: { x: 0, y: 0, z: 0 } },
      { tick: 151, position: { x: 0, y: 0.3, z: 3.7 }, velocity: { x: 0, y: 0.2, z: -0.25 }, player: { x: 0, y: 0, z: 0 } },
    ] } : undefined };
}

test("early retrieval requires a real short cast and removal without rewards or durability loss", () => {
  expect(fishingRetrievalPasses("early", observation())).toBe(true);
  for (const alter of [
    (value: FishingObservation) => { value.hooks = []; },
    (value: FishingObservation) => { value.uses = [100]; },
    (value: FishingObservation) => { value.hooks[0]!.removed = undefined; },
    (value: FishingObservation) => { value.hooks[0]!.spawned = 90; },
    (value: FishingObservation) => { value.hooks[0]!.removed = 106; },
    (value: FishingObservation) => { value.uses[1] = 121; value.hooks[0]!.removed = 121; },
    (value: FishingObservation) => { value.rewards = 1; },
    (value: FishingObservation) => { value.rodDamage = 1; },
    (value: FishingObservation) => { value.rodCount = 0; },
    (value: FishingObservation) => { value.remainingHooks = ["hook"]; },
  ]) {
    const value = observation(); alter(value);
    expect(fishingRetrievalPasses("early", value)).toBe(false);
  }
});

test("live retrieval requires a pull after reeling and target BDS durability", () => {
  expect(fishingRetrievalPasses("entity", observation(true))).toBe(true);
  for (const alter of [
    (value: FishingObservation) => { value.rodDamage = 5; },
    (value: FishingObservation) => { value.target!.valid = false; },
    (value: FishingObservation) => { value.target!.healthAfter = 9; },
    (value: FishingObservation) => { value.target!.frames[1]!.velocity.z = 0.25; },
    (value: FishingObservation) => { value.target!.frames[1]!.position.z = 4; },
    (value: FishingObservation) => { value.target!.frames[1]!.tick = 170; },
    (value: FishingObservation) => { value.target!.frames[0]!.velocity.z = -0.1; },
    (value: FishingObservation) => { value.target!.frames[0]!.tick = 145; },
    (value: FishingObservation) => { value.target!.frames[1]!.position.x = NaN; },
    (value: FishingObservation) => { value.target!.frames.reverse(); },
  ]) {
    const value = observation(true); alter(value);
    expect(fishingRetrievalPasses("entity", value)).toBe(false);
  }
});
