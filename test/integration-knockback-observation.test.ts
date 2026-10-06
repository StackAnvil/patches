import { expect, test } from "bun:test";
import { rangedKnockbackPasses, type KnockbackFrame, type KnockbackImpulse } from "../src/integration/knockback-observation.ts";
import type { RangedObservation } from "../src/integration/ranged-observation.ts";

const shot: RangedObservation = { item: "minecraft:bow", ammunition: "minecraft:arrow", initialCount: 4, remainingCount: 3,
  events: [{ action: "start", tick: 10 }, { action: "release", tick: 35 }],
  projectiles: [{ id: "arrow", tick: 36, type: "minecraft:arrow", speed: 3 }] };
const impulse: KnockbackImpulse = { tick: 14, position: { x: 0, y: 250, z: 0 }, force: { x: 0.35, y: 0.4, z: 0 },
  velocityBefore: { x: 0, y: 0, z: 0 }, velocityAfter: { x: 0.35, y: 0.4, z: 0 } };
const airborne: KnockbackFrame = { tick: 15, position: { x: 0.3, y: 250.3, z: 0 },
  velocity: { x: 0.3, y: 0.3, z: 0 }, onGround: false };

test("charging must survive a witnessed airborne impulse before release or loading completion", () => {
  expect(rangedKnockbackPasses("release", shot, impulse, [airborne])).toBe(true);
  const crossbow = { ...shot, item: "minecraft:crossbow",
    events: [{ action: "start" as const, tick: 10 }, { action: "complete" as const, tick: 35 }] };
  expect(rangedKnockbackPasses("fire", crossbow, impulse, [airborne])).toBe(true);
  for (const frame of [{ ...airborne, tick: 14 }, { ...airborne, tick: 35 }, { ...airborne, onGround: true },
    { ...airborne, position: { ...airborne.position, x: -0.3 } }, { ...airborne, position: { ...airborne.position, y: 250 } },
    { ...airborne, velocity: { ...airborne.velocity, x: NaN } }]) {
    expect(rangedKnockbackPasses("release", shot, impulse, [frame])).toBe(false);
  }
  for (const invalid of [undefined, { ...impulse, tick: 10 }, { ...impulse, tick: 35 },
    { ...impulse, force: { x: 0, y: 0.4, z: 0 } }, { ...impulse, force: { x: 0.35, y: 0, z: 0 } }]) {
    expect(rangedKnockbackPasses("release", shot, invalid, [airborne])).toBe(false);
  }
  expect(rangedKnockbackPasses("release", { ...shot, events: [shot.events[0]!, { action: "stop", tick: 16 }, shot.events[1]!] }, impulse, [airborne])).toBe(false);
  expect(rangedKnockbackPasses("release", { ...shot, remainingCount: 4 }, impulse, [airborne])).toBe(false);
});

test("slot cancellation follows the impulse without firing or consuming ammunition", () => {
  const cancelled: RangedObservation = { ...shot, remainingCount: 4, projectiles: [],
    events: [{ action: "start", tick: 10 }, { action: "stop", tick: 20 }], slots: [{ slot: 0, tick: 10 }, { slot: 1, tick: 20 }] };
  expect(rangedKnockbackPasses("cancel", cancelled, impulse, [airborne])).toBe(true);
  expect(rangedKnockbackPasses("cancel", { ...cancelled, projectiles: shot.projectiles }, impulse, [airborne])).toBe(false);
  expect(rangedKnockbackPasses("cancel", { ...cancelled, slots: [{ slot: 1, tick: 13 }] }, impulse, [airborne])).toBe(false);
  expect(rangedKnockbackPasses("cancel", { ...cancelled, events: [...cancelled.events, { action: "stop", tick: 12 }] }, impulse, [airborne])).toBe(false);
});
