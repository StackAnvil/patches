import { expect, test } from "bun:test";
import { incomingProjectilePasses, projectileThreatens, type IncomingProjectileObservation } from "../src/integration/projectile-observation.ts";

function incoming(): IncomingProjectileObservation {
  return { playerId: "player", shooterId: "ghast", type: "minecraft:fireball", projectileId: "fireball", launchedTick: 10,
    start: { x: 0, y: 0, z: 0 }, end: { x: 2, y: 0, z: 0 }, forward: { x: 0, y: 0, z: 1 }, healthBefore: 20, healthAfter: 20,
    playerBounds: { center: { x: 0, y: 0.9, z: 0 }, extent: { x: 0.3, y: 0.9, z: 0.3 } }, projectileExtent: { x: 0.5, y: 0.5, z: 0.5 },
    frames: [{ tick: 10, position: { x: 0, y: 1, z: 8 }, velocity: { x: 0, y: 0, z: -0.5 }, owner: "ghast" },
      { tick: 40, position: { x: 0, y: 1, z: -2 }, velocity: { x: 0, y: 0, z: -0.5 } }],
    playerFrames: [{ tick: 10, position: { x: 0, y: 0, z: 0 }, velocity: { x: 0, y: 0, z: 0 } },
      { tick: 20, position: { x: 2, y: 0, z: 0 }, velocity: { x: 0.2, y: 0, z: 0 } }],
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

test("a collision course must reach the player before a known obstruction", () => {
  const shot = incoming();
  const projectile = { center: shot.frames[0]!.position, extent: shot.projectileExtent! };
  const wall = { center: { x: 0, y: 1, z: 4 }, extent: { x: 1, y: 1, z: 0.5 } };
  expect(projectileThreatens(shot.playerBounds, projectile, shot.frames[0]!.velocity, [wall])).toBe(false);
  expect(projectileThreatens(shot.playerBounds, projectile, shot.frames[0]!.velocity,
    [{ ...wall, center: { ...wall.center, z: -4 } }])).toBe(true);
  expect(incomingProjectilePasses("dodge", { ...shot, collisionObstacles: [wall] })).toBe(false);
  expect(projectileThreatens(shot.playerBounds, projectile, shot.frames[0]!.velocity,
    [{ ...wall, extent: { x: Number.NaN, y: 1, z: 1 } }])).toBe(false);

  // The live small fireball grazes the expanded player bounds only after reaching the stone floor.
  const target = { center: { x: 125.5, y: 250.9, z: 0.5 }, extent: { x: 0.3, y: 0.9, z: 0.3 } };
  const descending = { center: { x: 125.5, y: 255.955261, z: 11.5 }, extent: { x: 0.155, y: 0.155, z: 0.155 } };
  const velocity = { x: 0.02974256, y: -0.62218976, z: -1.08132565 };
  const floor = { center: { x: 125.5, y: 249.5, z: 3.5 }, extent: { x: 8.5, y: 0.5, z: 11.5 } };
  expect(projectileThreatens(target, descending, velocity)).toBe(true);
  expect(projectileThreatens(target, descending, velocity, [floor])).toBe(false);
  expect(projectileThreatens(target, { ...descending, center: { x: 125.5, y: 251, z: 11.5 } },
    { x: 0, y: 0, z: -1.1 }, [floor])).toBe(true);

  // This later shot reaches the player first but then meets the floor before the required pass plane.
  const grazing = { ...descending, center: { x: 125.5, y: 253.755127, z: 11.5 } };
  const grazingVelocity = { x: -0.01209528, y: -0.38048825, z: -1.18137801 };
  const plane = { point: { x: 125.5, y: 250, z: -0.5 }, normal: { x: 0, y: 0, z: 1 } };
  expect(projectileThreatens(target, grazing, grazingVelocity, [floor])).toBe(true);
  expect(projectileThreatens(target, grazing, grazingVelocity, [floor], plane)).toBe(false);
  expect(projectileThreatens(target, { ...grazing, center: { x: 125.5, y: 251, z: 11.5 } },
    { x: 0, y: 0, z: -1.1 }, [floor], plane)).toBe(true);
  expect(projectileThreatens(target, grazing, grazingVelocity, [], { ...plane, normal: { x: 0, y: 0, z: 0 } })).toBe(false);
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

test("a dodge must move before the projectile passes, with valid ordered player samples", () => {
  const shot = incoming();
  for (const playerFrames of [[], [shot.playerFrames[0]!],
    shot.playerFrames.map((frame) => ({ ...frame, position: shot.start })),
    [shot.playerFrames[0]!, { ...shot.playerFrames[1]!, tick: 41 }],
    [shot.playerFrames[0]!, { ...shot.playerFrames[1]!, tick: 10 }],
    [{ ...shot.playerFrames[0]!, tick: 9 }, shot.playerFrames[1]!],
    [shot.playerFrames[0]!, { ...shot.playerFrames[1]!, position: { x: NaN, y: 0, z: 0 } }],
    [shot.playerFrames[0]!, { ...shot.playerFrames[1]!, velocity: { x: Infinity, y: 0, z: 0 } }]]) {
    expect(incomingProjectilePasses("dodge", { ...shot, playerFrames })).toBe(false);
  }
  shot.playerFrames[1]!.tick = 40;
  expect(incomingProjectilePasses("dodge", shot)).toBe(true);
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
