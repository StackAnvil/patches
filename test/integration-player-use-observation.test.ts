import { expect, test } from "bun:test";
import {
  movingFoodUsePasses,
  pearlWindChargePasses,
  type PlayerUseObservation,
} from "../src/integration/player-use-observation.ts";

function pearlWind(): PlayerUseObservation {
  return {
    kind: "pearl-wind",
    initialFood: 0,
    remainingFood: 0,
    remainingPearls: 3,
    remainingWindCharges: 3,
    absorption: 0,
    start: { x: 0, y: 70, z: 0 },
    events: [
      { item: "minecraft:ender_pearl", action: "use", tick: 1 },
      { item: "minecraft:wind_charge", action: "use", tick: 3 },
    ],
    impacts: [
      { type: "minecraft:ender_pearl", tick: 2, playerPosition: { x: 0, y: 70, z: 1 } },
      { type: "minecraft:wind_charge_projectile", tick: 4, playerPosition: { x: 0, y: 70, z: 1 } },
    ],
    frames: Array.from({ length: 110 }, (_, index) => ({
      tick: index + 1,
      position: {
        x: 0,
        y: index >= 4 && index <= 35 ? 70 + 3 * Math.sin(((index - 4) / 31) * Math.PI) : 70,
        z: 1,
      },
      velocity: { x: 0, y: index >= 4 && index < 20 ? 0.4 : index <= 35 ? -0.2 : 0, z: 0 },
      onGround: index < 4 || index > 35,
    })),
  };
}

function food(initialFood = 6): PlayerUseObservation {
  const completions = initialFood === 1 ? 1 : 4;
  const result = pearlWind();
  result.kind = "food";
  result.initialFood = initialFood;
  result.remainingFood = initialFood - completions;
  result.absorption = 2300;
  result.impacts = [];
  result.events = Array.from({ length: completions }, (_, i) => [
    { item: "minecraft:golden_apple", action: "start" as const, tick: i * 38 + 1 },
    { item: "minecraft:golden_apple", action: "complete" as const, tick: i * 38 + 32 },
    { item: "minecraft:golden_apple", action: "stop" as const, tick: i * 38 + 32 },
  ]).flat();
  result.frames = Array.from({ length: completions * 38 + 40 }, (_, i) => ({
    tick: i + 1,
    position: { x: 0, y: 70, z: i * 0.03 },
    velocity: { x: 0, y: 0, z: 0.03 },
    onGround: true,
  }));
  return result;
}

test("pearl and wind charge require both native outcomes and a quiet landing", () => {
  expect(pearlWindChargePasses(pearlWind())).toBe(true);
  for (const alter of [
    (o: PlayerUseObservation) => {
      o.impacts.pop();
    },
    (o: PlayerUseObservation) => {
      o.remainingWindCharges = 4;
    },
    (o: PlayerUseObservation) => {
      o.events[1]!.tick = 8;
    },
    (o: PlayerUseObservation) => {
      o.impacts[0]!.playerPosition = { ...o.start };
    },
    (o: PlayerUseObservation) => {
      for (const f of o.frames) f.velocity.y = 0;
    },
    (o: PlayerUseObservation) => {
      for (const f of o.frames) f.position.y = 70;
    },
    (o: PlayerUseObservation) => {
      o.frames.at(-10)!.position.z += 0.5;
    },
    (o: PlayerUseObservation) => {
      o.frames.at(-1)!.onGround = false;
    },
    (o: PlayerUseObservation) => {
      o.frames.splice(10, 1);
    },
  ]) {
    const observation = pearlWind();
    alter(observation);
    expect(pearlWindChargePasses(observation)).toBe(false);
  }
});

test("moving eating must complete and consume the same number of items", () => {
  expect(movingFoodUsePasses(food())).toBe(true);
  for (const alter of [
    (o: PlayerUseObservation) => {
      o.remainingFood = 6;
    },
    (o: PlayerUseObservation) => {
      o.absorption = 0;
    },
    (o: PlayerUseObservation) => {
      o.events = o.events.filter((e) => e.action !== "complete");
    },
    (o: PlayerUseObservation) => {
      for (const f of o.frames) f.position.z = 0;
    },
    (o: PlayerUseObservation) => {
      for (const f of o.frames) if (f.tick <= 146) f.position.z = 0;
    },
    (o: PlayerUseObservation) => {
      o.events.unshift({ item: "minecraft:golden_apple", action: "complete", tick: 0 });
      o.remainingFood--;
    },
    (o: PlayerUseObservation) => {
      o.events.splice(1, 0, { item: "minecraft:golden_apple", action: "stop", tick: 12 });
    },
  ]) {
    const observation = food();
    alter(observation);
    expect(movingFoodUsePasses(observation)).toBe(false);
  }
});

test("last-item eating must stay stopped after consuming the stack", () => {
  expect(movingFoodUsePasses(food(1))).toBe(true);
  const looping = food(1);
  looping.events.push({ item: "minecraft:golden_apple", action: "start", tick: 40 });
  expect(movingFoodUsePasses(looping)).toBe(false);
  looping.events.at(-1)!.action = "use";
  expect(movingFoodUsePasses(looping)).toBe(false);
  const tooEarly = food(1);
  tooEarly.frames = tooEarly.frames.slice(0, 40);
  expect(movingFoodUsePasses(tooEarly)).toBe(false);
});
