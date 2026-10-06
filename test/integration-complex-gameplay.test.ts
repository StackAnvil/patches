import { expect, mock, test } from "bun:test";
import type { Entity, Player } from "@minecraft/server";
import type { RangedObservation } from "../src/integration/ranged-observation.ts";
import type { IncomingProjectileObservation } from "../src/integration/projectile-observation.ts";

const callbacks = new Map<string, (event: any) => void>();
const pending: (() => void)[] = [];
let sample: () => void;
const signal = (name: string) => ({ subscribe(callback: (event: any) => void) { callbacks.set(name, callback); } });
const player = { name: "ProbePlayer", id: "player", selectedSlotIndex: 0 } as Player;
mock.module("@minecraft/server", () => ({
  EnchantmentType: class {}, EquipmentSlot: {}, GameMode: {}, ItemStack: class {}, Potions: {},
  system: { currentTick: 10, run(callback: () => void) { pending.push(callback); },
    runTimeout(callback: () => void) { pending.push(callback); },
    runInterval(callback: () => void) { sample = callback; } },
  world: { getAllPlayers: () => [player], afterEvents: Object.fromEntries(
    ["itemStartUse", "itemReleaseUse", "itemCompleteUse", "itemStopUse", "itemUse", "entitySpawn",
      "projectileHitBlock", "projectileHitEntity", "effectAdd", "entityHitEntity", "entityHurt"]
      .map((name) => [name, signal(name)])) },
}));
const { registerComplexGameplay } = await import("../test-packs/entity-probe/src/complex-gameplay.ts");
type Context = Parameters<typeof registerComplexGameplay>[0];
let active: ReturnType<Context["getActive"]>;
registerComplexGameplay({ define() {}, getActive: () => active, tagEntity() {},
  prepareArena: async () => {}, inventory: () => { throw new Error("Unused fixture setup"); },
  equipment: () => { throw new Error("Unused fixture setup"); }, countItem: () => 0,
  blockAt: () => { throw new Error("Unused fixture setup"); }, position: () => ({ x: 0, y: 0, z: 0 }) });

function prepareObservation(): RangedObservation {
  const ranged: RangedObservation = { item: "minecraft:bow", ammunition: "minecraft:arrow", initialCount: 4,
    remainingCount: 4, events: [], projectiles: [], slots: [] };
  active = { playerName: player.name, fixture: { ranged } };
  return ranged;
}

function spawn(owner: string) {
  callbacks.get("entitySpawn")!({ entity: { id: "arrow", typeId: "minecraft:arrow",
    getComponent: () => ({ owner: { typeId: "minecraft:player", name: owner } }),
    getVelocity: () => ({ x: 0, y: 0, z: 3 }) } });
}

test("projectiles from other players cannot satisfy the active ranged fixture", () => {
  const ranged = prepareObservation();
  spawn("OtherPlayer");
  pending.shift()!();
  expect(ranged.projectiles).toHaveLength(0);
  spawn(player.name);
  pending.shift()!();
  expect(ranged.projectiles).toMatchObject([{ speed: 3, tick: 10 }]);
});

test("a deferred projectile cannot leak into a newer or verified fixture", () => {
  const previous = prepareObservation();
  spawn(player.name);
  const current = prepareObservation();
  pending.shift()!();
  expect(previous.projectiles).toHaveLength(0);
  expect(current.projectiles).toHaveLength(0);
  spawn(player.name);
  active!.fixture.closed = true;
  pending.shift()!();
  expect(current.projectiles).toHaveLength(0);
});

test("use events require the active player and item and stop after verification", () => {
  const ranged = prepareObservation();
  const started = callbacks.get("itemStartUse")!;
  started({ source: { name: "OtherPlayer" }, itemStack: { typeId: ranged.item } });
  started({ source: player, itemStack: { typeId: "minecraft:crossbow" } });
  expect(ranged.events).toHaveLength(0);
  started({ source: player, itemStack: { typeId: ranged.item }, useDuration: 72000 });
  expect(ranged.events).toMatchObject([{ tick: 10, remainingUseTicks: 72000 }]);
  active!.fixture.closed = true;
  started({ source: player, itemStack: { typeId: ranged.item } });
  expect(ranged.events).toHaveLength(1);
});

test("delayed knockback cannot act on a replaced, closed, or cancelled fixture", () => {
  let impulses = 0;
  const source = { ...player, location: { x: 0, y: 0, z: 0 }, getVelocity: () => ({ x: 0, y: 0, z: 0 }),
    applyKnockback: () => impulses++ };
  const started = callbacks.get("itemStartUse")!;
  for (const invalidate of [() => { prepareObservation(); },
    () => { active!.fixture.closed = true; }, () => { source.selectedSlotIndex = 1; },
    () => { callbacks.get("itemStopUse")!({ source, itemStack: { typeId: active!.fixture.ranged!.item } }); }]) {
    source.selectedSlotIndex = 0;
    const ranged = prepareObservation();
    active!.fixture.knockback = { pending: false };
    started({ source, itemStack: { typeId: ranged.item } });
    invalidate();
    pending.shift()!();
  }
  expect(impulses).toBe(0);
  source.selectedSlotIndex = 0;
  const ranged = prepareObservation();
  active!.fixture.knockback = { pending: false };
  started({ source, itemStack: { typeId: ranged.item } });
  started({ source, itemStack: { typeId: ranged.item } });
  expect(pending).toHaveLength(1);
  pending.shift()!();
  expect(impulses).toBe(1);
  expect(active!.fixture.knockback.impulse?.force).toEqual({ x: 0.35, y: 0.4, z: 0 });
});

test("hotbar samples record transitions without duplicating stationary frames", () => {
  const ranged = prepareObservation();
  sample();
  sample();
  expect(ranged.slots).toHaveLength(1);
  Object.assign(player, { selectedSlotIndex: 1 });
  sample();
  expect(ranged.slots).toMatchObject([{ slot: 0 }, { slot: 1 }]);
  Object.assign(player, { selectedSlotIndex: 0 });
});

test("forced server selection runs once and cannot leak into another charging session", () => {
  const started = callbacks.get("itemStartUse")!;
  const source = { ...player, selectedSlotIndex: 0 };
  const prepare = () => {
    const ranged = prepareObservation();
    active!.fixture.serverSlotUse = { pending: false, followup: { item: "minecraft:snowball", ammunition: "minecraft:snowball",
      initialCount: 4, remainingCount: 4, events: [], projectiles: [] } };
    return ranged;
  };
  for (const invalidate of [() => { prepareObservation(); }, () => { active!.fixture.closed = true; },
    () => { callbacks.get("itemStopUse")!({ source, itemStack: { typeId: "minecraft:bow" } }); }]) {
    source.selectedSlotIndex = 0;
    prepare();
    started({ source, itemStack: { typeId: "minecraft:bow" } });
    invalidate();
    pending.shift()!();
    expect(source.selectedSlotIndex).toBe(0);
  }
  prepare();
  started({ source, itemStack: { typeId: "minecraft:bow" } });
  started({ source, itemStack: { typeId: "minecraft:bow" } });
  expect(pending).toHaveLength(1);
  pending.shift()!();
  expect(source.selectedSlotIndex).toBe(1);
  expect(active!.fixture.serverSlotUse!.selection).toEqual({ tick: 10, from: 0, to: 1 });
  callbacks.get("itemUse")!({ source, itemStack: { typeId: "minecraft:snowball" } });
  expect(active!.fixture.serverSlotUse!.followup.events).toEqual([{ action: "use", tick: 10 }]);
  expect(active!.fixture.ranged!.events.every((event) => event.action === "start")).toBe(true);
});

test("impact and effect observations exclude other players and close with their fixture", () => {
  const ranged = prepareObservation();
  ranged.impacts = [];
  ranged.effects = [];
  const impact = callbacks.get("projectileHitBlock")!;
  const effect = callbacks.get("effectAdd")!;
  const hit = { projectile: { id: "potion" }, source: { id: player.id }, location: { x: 0, y: 0, z: 0 } };
  impact({ ...hit, source: { id: "other-player" } });
  effect({ entity: { typeId: "minecraft:player", name: "OtherPlayer" }, effect: { typeId: "minecraft:speed", duration: 100, amplifier: 0 } });
  expect(ranged.impacts).toHaveLength(0);
  expect(ranged.effects).toHaveLength(0);
  impact(hit);
  effect({ entity: { ...player, typeId: "minecraft:player" }, effect: { typeId: "minecraft:speed", duration: 100, amplifier: 0 } });
  expect(ranged.impacts).toHaveLength(1);
  expect(ranged.effects).toHaveLength(1);
  active!.fixture.closed = true;
  impact(hit);
  effect({ entity: { ...player, typeId: "minecraft:player" }, effect: { typeId: "minecraft:speed", duration: 100, amplifier: 0 } });
  expect(ranged.impacts).toHaveLength(1);
  expect(ranged.effects).toHaveLength(1);
});

test("clouds require an owned nearby impact and cannot leak through deferred callbacks", () => {
  const ranged = prepareObservation();
  ranged.clouds = [];
  ranged.impacts = [{ id: "potion", tick: 10, location: { x: 0, y: 0, z: 0 } }];
  const cloud = () => callbacks.get("entitySpawn")!({ entity: { id: "cloud", typeId: "minecraft:area_effect_cloud", location: { x: 0, y: 0, z: 0 } } });
  cloud(); pending.shift()!();
  expect(ranged.clouds).toHaveLength(0);
  ranged.projectiles.push({ id: "potion", tick: 9, type: "minecraft:lingering_potion", speed: 0.5 });
  cloud(); pending.shift()!();
  expect(ranged.clouds).toHaveLength(1);
  cloud(); prepareObservation(); pending.shift()!();
  expect(ranged.clouds).toHaveLength(1);
});

test("each Piercing target keeps its own damage attribution and health", () => {
  const ranged = prepareObservation();
  ranged.targets = ["first", "second"].map((id) => ({ id, healthBefore: 100, healthAfter: 100, damage: [] }));
  const hurt = callbacks.get("entityHurt")!;
  const event = (id: string) => ({ hurtEntity: { id, getComponent: () => ({ currentValue: 94 }) }, damage: 6,
    damageSource: { damagingProjectile: { id: "arrow" } } });
  hurt(event("unrelated"));
  hurt(event("second"));
  expect(ranged.targets[0]!.damage).toHaveLength(0);
  expect(ranged.targets[1]).toMatchObject({ healthAfter: 94, damage: [{ amount: 6, projectile: "arrow", tick: 10 }] });
  active!.fixture.closed = true;
  hurt(event("first"));
  expect(ranged.targets[0]!.healthAfter).toBe(100);
});

test("the incoming control selects an owned collision course and removes only its off-course shots", () => {
  let removedShots = 0;
  let stoppedShooter = 0;
  const incoming: IncomingProjectileObservation = { playerId: player.id, shooterId: "shooter", type: "minecraft:fireball", start: { x: 0, y: 0, z: 0 },
    end: { x: 0, y: 0, z: 0 }, forward: { x: 0, y: 0, z: 1 },
    playerBounds: { center: { x: 0, y: 0.9, z: 0 }, extent: { x: 0.3, y: 0.9, z: 0.3 } },
    healthBefore: 20, healthAfter: 20, frames: [], playerFrames: [], attacks: [], hits: [], damage: [] };
  active = { playerName: player.name, fixture: { incoming,
    shooter: { remove: () => stoppedShooter++ } as unknown as Entity } };
  function shot(owner: string, x: number) {
    callbacks.get("entitySpawn")!({ entity: { id: "shot", typeId: incoming.type,
      getComponent: () => ({ owner: { id: owner } }), getVelocity: () => ({ x: 0, y: 0, z: -0.5 }),
      getAABB: () => ({ center: { x, y: 1, z: 8 }, extent: { x: 0.5, y: 0.5, z: 0.5 } }),
      remove: () => removedShots++ } });
    pending.shift()!();
  }
  shot("another-shooter", 0);
  expect(removedShots).toBe(0);
  expect(incoming.frames).toHaveLength(0);
  shot("shooter", 3);
  expect(removedShots).toBe(1);
  expect(stoppedShooter).toBe(0);
  shot("shooter", 0);
  expect(incoming.frames).toHaveLength(1);
  expect(stoppedShooter).toBe(1);
  expect(removedShots).toBe(1);
  Object.assign(player, { location: { x: 1, y: 0, z: 0 }, getVelocity: () => ({ x: 0.2, y: 0, z: 0 }) });
  sample();
  sample();
  expect(incoming.playerFrames).toEqual([{ tick: 10, position: { x: 1, y: 0, z: 0 }, velocity: { x: 0.2, y: 0, z: 0 } }]);
  active!.fixture.closed = true;
  Object.assign(player, { location: { x: 2, y: 0, z: 0 } });
  sample();
  expect(incoming.playerFrames).toHaveLength(1);
});
