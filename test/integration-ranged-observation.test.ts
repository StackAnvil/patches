import { expect, test } from "bun:test";
import { potionImpactPasses, rangedHitPasses, rangedObservationPasses, type RangedObservation } from "../src/integration/ranged-observation.ts";

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
  const cancelled = { ...chargedShot(), remainingCount: 4, projectiles: [], events: [{ action: "start" as const, tick: 10 }],
    slots: [{ slot: 0, tick: 10 }, { slot: 1, tick: 15 }] };
  expect(rangedObservationPasses("cancel", cancelled)).toBe(true);
  expect(rangedObservationPasses("cancel", { ...cancelled, events: [] })).toBe(false);
  expect(rangedObservationPasses("cancel", { ...cancelled, slots: [] })).toBe(false);
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

test("potion effects require a consumed owned impact, and lingering effects require the nearby cloud", () => {
  const location = { x: 0, y: 0, z: 0 };
  const observation: RangedObservation = { item: "minecraft:lingering_potion", ammunition: "minecraft:lingering_potion",
    initialCount: 1, remainingCount: 0, events: [{ action: "use", tick: 10 }],
    projectiles: [{ id: "potion", tick: 11, type: "minecraft:lingering_potion", speed: 0.5 }],
    impacts: [{ id: "potion", tick: 15, location }], effects: [{ tick: 20, type: "minecraft:slowness", duration: 100, amplifier: 0 }],
    clouds: [{ id: "cloud", tick: 15, location }] };
  expect(potionImpactPasses(observation, "minecraft:slowness", true)).toBe(true);
  expect(potionImpactPasses({ ...observation, impacts: [{ id: "another-shot", tick: 15, location }] }, "minecraft:slowness", true)).toBe(false);
  expect(potionImpactPasses({ ...observation, effects: [{ ...observation.effects![0]!, tick: 9 }] }, "minecraft:slowness", true)).toBe(false);
  expect(potionImpactPasses({ ...observation, effects: [{ ...observation.effects![0]!, tick: 12 }] }, "minecraft:slowness", true)).toBe(false);
  expect(potionImpactPasses(observation, "minecraft:speed", true)).toBe(false);
  expect(potionImpactPasses({ ...observation, clouds: [] }, "minecraft:slowness", true)).toBe(false);
  expect(potionImpactPasses({ ...observation, clouds: [{ id: "elsewhere", tick: 15, location: { ...location, x: 10 } }] }, "minecraft:slowness", true)).toBe(false);
  expect(potionImpactPasses({ ...observation, effects: [{ ...observation.effects![0]!, duration: 0 }] }, "minecraft:slowness", true)).toBe(false);
});

test("ranged hits require damage and contact from the launched arrow against the same target", () => {
  const shot: RangedObservation = { ...chargedShot(), impacts: [{ id: "owned-arrow", tick: 40, target: "cow", location: { x: 0, y: 0, z: 4 } }],
    target: { id: "cow", healthBefore: 10, healthAfter: 4, damage: [{ tick: 40, amount: 6, projectile: "owned-arrow" }] } };
  expect(rangedHitPasses("release", shot)).toBe(true);
  expect(rangedHitPasses("release", { ...shot, impacts: [] })).toBe(false);
  expect(rangedHitPasses("release", { ...shot, target: { ...shot.target!, healthAfter: 10 } })).toBe(false);
  expect(rangedHitPasses("release", { ...shot, target: { ...shot.target!, damage: [{ tick: 40, amount: 6, projectile: "another-arrow" }] } })).toBe(false);
  expect(rangedHitPasses("release", { ...shot, impacts: [{ ...shot.impacts![0]!, target: "another-cow" }] })).toBe(false);
});
