import { expect, test } from "bun:test";
import { incomingProjectilePasses, projectileThreatens, type IncomingProjectileObservation } from "../src/integration/projectile-observation.ts";

function incoming(): IncomingProjectileObservation {
  return { playerId: "player", shooterId: "ghast", type: "minecraft:fireball", projectileId: "fireball", launchedTick: 10,
    start: { x: 0, y: 0, z: 0 }, end: { x: 2, y: 0, z: 0 }, forward: { x: 0, y: 0, z: 1 }, healthBefore: 20, healthAfter: 20,
    playerBounds: { center: { x: 0, y: 0.9, z: 0 }, extent: { x: 0.3, y: 0.9, z: 0.3 } }, projectileExtent: { x: 0.5, y: 0.5, z: 0.5 },
    frames: [{ tick: 10, position: { x: 0, y: 1, z: 8 }, velocity: { x: 0, y: 0, z: -0.5 }, owner: "ghast" },
      { tick: 40, position: { x: 0, y: 1, z: -2 }, velocity: { x: 0, y: 0, z: -0.5 } }],
    attacks: [], hits: [], damage: [] };
}

test("collision-course checks reject off-axis and departing shots, including parallel and invalid bounds", () => {
  const shot = incoming();
  const projectile = { center: shot.frames[0]!.position, extent: shot.projectileExtent! };
  expect(projectileThreatens(shot.playerBounds, projectile, shot.frames[0]!.velocity)).toBe(true);
  expect(projectileThreatens(shot.playerBounds, projectile, { x: 0, y: 0, z: 1 })).toBe(false);
  expect(projectileThreatens(shot.playerBounds, { ...projectile, center: { x: 3, y: 1, z: 8 } }, shot.frames[0]!.velocity)).toBe(false);
  expect(projectileThreatens(shot.playerBounds, projectile, { x: 1, y: 0, z: -0.5 })).toBe(false);
  expect(projectileThreatens(shot.playerBounds, projectile, { x: 0, y: 0, z: 0 })).toBe(false);
  expect(projectileThreatens(shot.playerBounds, { ...projectile, extent: { x: -1, y: 1, z: 1 } }, shot.frames[0]!.velocity)).toBe(false);
});

test("dodging requires a real inbound shot passing the original plane, movement, and no damage", () => {
  const shot = incoming();
  expect(incomingProjectilePasses("dodge", shot)).toBe(true);
  expect(incomingProjectilePasses("hit", shot)).toBe(false);
  expect(incomingProjectilePasses("dodge", { ...shot, end: shot.start })).toBe(false);
  expect(incomingProjectilePasses("dodge", { ...shot, frames: [shot.frames[0]!] })).toBe(false);
  expect(incomingProjectilePasses("dodge", { ...shot, frames: [shot.frames[0]!, { ...shot.frames[1]!, position: { x: 0, y: 1, z: 2 } }] })).toBe(false);
  expect(incomingProjectilePasses("dodge", { ...shot, healthAfter: 19 })).toBe(false);
  expect(incomingProjectilePasses("dodge", { ...shot, damage: [{ tick: 15, amount: 1 }] })).toBe(false);
  expect(incomingProjectilePasses("dodge", { ...shot, hits: [{ tick: 15, projectile: shot.projectileId!, target: shot.playerId }] })).toBe(false);
});

test("a hit control requires both projectile contact and health loss", () => {
  const hit = { ...incoming(), healthAfter: 14, hits: [{ tick: 40, projectile: "fireball", target: "player" }],
    damage: [{ tick: 40, amount: 6, projectile: "fireball" }] };
  expect(incomingProjectilePasses("hit", hit)).toBe(true);
  expect(incomingProjectilePasses("hit", { ...hit, hits: [] })).toBe(false);
  expect(incomingProjectilePasses("hit", { ...hit, damage: [] })).toBe(false);
  expect(incomingProjectilePasses("hit", { ...hit, hits: [{ ...hit.hits[0]!, target: "another-player" }] })).toBe(false);
});

test("reflection requires the player's attack, a new owner, and outgoing motion", () => {
  const shot = incoming();
  shot.attacks = [{ tick: 20, player: shot.playerId, target: shot.projectileId! }];
  shot.frames[1] = { tick: 21, position: { x: 0, y: 1, z: 2 }, velocity: { x: 0, y: 0, z: 1 }, owner: shot.playerId };
  expect(incomingProjectilePasses("reflect", shot)).toBe(true);
  expect(incomingProjectilePasses("reflect", { ...shot, attacks: [] })).toBe(false);
  expect(incomingProjectilePasses("reflect", { ...shot, attacks: [{ ...shot.attacks[0]!, target: "another-shot" }] })).toBe(false);
  expect(incomingProjectilePasses("reflect", { ...shot, frames: [shot.frames[0]!, { ...shot.frames[1]!, owner: shot.shooterId }] })).toBe(false);
  expect(incomingProjectilePasses("reflect", { ...shot, frames: [shot.frames[0]!, { ...shot.frames[1]!, velocity: { x: 0, y: 0, z: -1 } }] })).toBe(false);
  expect(incomingProjectilePasses("reflect", { ...shot, frames: [shot.frames[0]!, { ...shot.frames[1]!, tick: 19 }] })).toBe(false);
});

test("invalid or stale trajectories cannot satisfy any incoming projectile case", () => {
  const shot = incoming();
  for (const invalid of [{ ...shot, projectileId: undefined }, { ...shot, error: "Lost projectile" },
    { ...shot, frames: [shot.frames[0]!, { ...shot.frames[1]!, tick: 10 }] },
    { ...shot, frames: [{ ...shot.frames[0]!, owner: "unrelated-mob" }, shot.frames[1]!] },
    { ...shot, frames: [{ ...shot.frames[0]!, velocity: { x: 0, y: 0, z: 1 } }, shot.frames[1]!] },
    { ...shot, end: { x: NaN, y: 0, z: 0 } }]) {
    expect(incomingProjectilePasses("dodge", invalid)).toBe(false);
  }
});
