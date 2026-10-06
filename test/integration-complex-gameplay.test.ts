import { expect, mock, test } from "bun:test";
import type { Player } from "@minecraft/server";
import type { RangedObservation } from "../src/integration/ranged-observation.ts";

const callbacks = new Map<string, (event: any) => void>();
const pending: (() => void)[] = [];
let sample: () => void;
const signal = (name: string) => ({ subscribe(callback: (event: any) => void) { callbacks.set(name, callback); } });
const player = { name: "ProbePlayer", selectedSlotIndex: 0 } as Player;
mock.module("@minecraft/server", () => ({
  EquipmentSlot: {}, GameMode: {}, ItemStack: class {},
  system: { currentTick: 10, run(callback: () => void) { pending.push(callback); },
    runInterval(callback: () => void) { sample = callback; } },
  world: { getAllPlayers: () => [player], afterEvents: Object.fromEntries(
    ["itemStartUse", "itemReleaseUse", "itemCompleteUse", "itemStopUse", "itemUse", "entitySpawn"]
      .map((name) => [name, signal(name)])) },
}));
const { registerComplexGameplay } = await import("../test-packs/entity-probe/src/complex-gameplay.ts");
type Context = Parameters<typeof registerComplexGameplay>[0];
let active: ReturnType<Context["getActive"]>;
registerComplexGameplay({ define() {}, getActive: () => active,
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
