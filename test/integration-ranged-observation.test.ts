import { expect, test } from "bun:test";
import { rangedObservationPasses, type RangedObservation } from "../src/integration/ranged-observation.ts";

function chargedShot(): RangedObservation {
  return { item: "minecraft:bow", ammunition: "minecraft:arrow", initialCount: 4, remainingCount: 3,
    events: [{ action: "start", tick: 10 }, { action: "release", tick: 35, remainingUseTicks: 71975 }],
    projectiles: [{ id: "owned-arrow", tick: 36, type: "minecraft:arrow", speed: 3 }] };
}

test("a shot requires an ordered use cycle, one moving projectile, and one consumed arrow", () => {
  const shot = chargedShot();
  expect(rangedObservationPasses("release", shot)).toBe(true);
  expect(rangedObservationPasses("release", { ...shot, events: [...shot.events].reverse().map((event, i) => ({ ...event, tick: 10 + i })) })).toBe(false);
  expect(rangedObservationPasses("release", { ...shot, projectiles: [{ ...shot.projectiles[0]!, tick: 9 }] })).toBe(false);
  expect(rangedObservationPasses("release", { ...shot, projectiles: [] })).toBe(false);
  expect(rangedObservationPasses("release", { ...shot, projectiles: [...shot.projectiles, ...shot.projectiles] })).toBe(false);
  expect(rangedObservationPasses("release", { ...shot, remainingCount: 4 })).toBe(false);
  expect(rangedObservationPasses("release", { ...shot, projectiles: [{ ...shot.projectiles[0]!, speed: NaN }] })).toBe(false);
  expect(rangedObservationPasses("release", { ...shot, error: "Projectile vanished before observation" })).toBe(false);
});

test("cancelled charging and an empty quiver reject phantom projectiles or consumed ammunition", () => {
  const cancelled = { ...chargedShot(), remainingCount: 4, projectiles: [], events: [{ action: "start" as const, tick: 10 }] };
  expect(rangedObservationPasses("cancel", cancelled)).toBe(true);
  expect(rangedObservationPasses("cancel", { ...cancelled, events: [] })).toBe(false);
  expect(rangedObservationPasses("cancel", chargedShot())).toBe(false);
  expect(rangedObservationPasses("empty", { ...cancelled, initialCount: 0, remainingCount: 0 })).toBe(true);
  expect(rangedObservationPasses("empty", { ...chargedShot(), initialCount: 0, remainingCount: 0 })).toBe(false);
});

test("crossbows distinguish loading from firing and require a witnessed loaded hotbar round trip", () => {
  const loaded = { ...chargedShot(), item: "minecraft:crossbow", projectiles: [],
    events: [{ action: "start" as const, tick: 10 }, { action: "complete" as const, tick: 35 }] };
  expect(rangedObservationPasses("load", loaded)).toBe(true);
  expect(rangedObservationPasses("fire", loaded)).toBe(false);
  const fired = { ...loaded, projectiles: [{ id: "bolt", tick: 60, type: "minecraft:arrow", speed: 3 }] };
  expect(rangedObservationPasses("fire", fired)).toBe(true);
  expect(rangedObservationPasses("load", fired)).toBe(false);
  expect(rangedObservationPasses("retain", fired)).toBe(false);
  const slots = [{ slot: 0, tick: 10 }, { slot: 1, tick: 40 }, { slot: 0, tick: 50 }];
  expect(rangedObservationPasses("retain", { ...fired, slots })).toBe(true);
  expect(rangedObservationPasses("retain", { ...fired, slots: [...slots.slice(0, 2), { slot: 0, tick: 70 }] })).toBe(false);
  expect(rangedObservationPasses("retain", { ...fired, slots: [{ slot: 1, tick: 20 }, { slot: 0, tick: 30 }] })).toBe(false);
});

test("thrown potions require a use event and the matching projectile type", () => {
  const potion = { ...chargedShot(), item: "minecraft:splash_potion", ammunition: "minecraft:splash_potion",
    initialCount: 1, remainingCount: 0, events: [{ action: "use" as const, tick: 10 }],
    projectiles: [{ id: "potion", tick: 11, type: "minecraft:splash_potion", speed: 0.5 }] };
  expect(rangedObservationPasses("throw", potion)).toBe(true);
  expect(rangedObservationPasses("throw", { ...potion, projectiles: chargedShot().projectiles })).toBe(false);
  expect(rangedObservationPasses("throw", { ...potion, events: [] })).toBe(false);
});
