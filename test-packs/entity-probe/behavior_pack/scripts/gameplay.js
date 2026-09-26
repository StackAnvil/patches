import { CommandPermissionLevel, EquipmentSlot, GameMode, ItemStack, system, world } from "@minecraft/server";

const PREFIX = "[ViaBedrock Gameplay Probe]";
const ENTITY_TAG = "viabedrock_gameplay_probe";
const scenarios = new Map();
let arena;
let origin;
let arenaSerial = 0;
let active;
let respawns = 0;
let dimensionChanges = 0;

function record(id, run, phase, status, details = {}) {
  console.warn(`${PREFIX} ${JSON.stringify({ id, run, phase, status, tick: system.currentTick, ...details })}`);
}

function inventory(player) {
  const container = player.getComponent("minecraft:inventory")?.container;
  if (!container) throw new Error("Player inventory is unavailable.");
  return container;
}

function equipment(player) {
  const component = player.getComponent("minecraft:equippable");
  if (!component) throw new Error("Player equipment is unavailable.");
  return component;
}

function countItem(container, typeId) {
  let count = 0;
  for (let slot = 0; slot < container.size; slot++) {
    const item = container.getItem(slot);
    if (item?.typeId === typeId) count += item.amount;
  }
  return count;
}

function blockAt(dimension, x, y, z) {
  const block = dimension.getBlock({ x: arena.x + x, y: arena.y + y, z: arena.z + z });
  if (!block) throw new Error(`Block ${x},${y},${z} is unavailable.`);
  return block;
}

function position(x = 0.5, y = 0, z = 0.5) {
  return { x: arena.x + x, y: arena.y + y, z: arena.z + z };
}

function nextTick() {
  return new Promise((resolve) => system.runTimeout(() => resolve(), 1));
}

function clearEntities() {
  if (!arena) return;
  for (const entity of arena.dimension.getEntities({ tags: [ENTITY_TAG] })) entity.remove();
}

async function prepareArena(player, gameMode = GameMode.Survival) {
  if (!origin) origin = { dimension: player.dimension, x: Math.floor(player.location.x), z: Math.floor(player.location.z) };
  clearEntities();
  arena = { dimension: origin.dimension, x: origin.x + arenaSerial++ * 32, y: 250, z: origin.z };
  player.teleport(position(), { dimension: arena.dimension });
  await nextTick();
  for (let x = -3; x <= 3; x++) {
    for (let z = -3; z <= 4; z++) {
      blockAt(arena.dimension, x, -1, z).setType("minecraft:stone");
      for (let y = 0; y <= 3; y++) blockAt(arena.dimension, x, y, z).setType("minecraft:air");
    }
  }
  player.runCommand("clear @s");
  const gear = equipment(player);
  for (const slot of [EquipmentSlot.Head, EquipmentSlot.Chest, EquipmentSlot.Legs, EquipmentSlot.Feet, EquipmentSlot.Offhand]) {
    gear.setEquipment(slot);
  }
  player.setGameMode(gameMode);
  player.getComponent("minecraft:health")?.resetToMaxValue();
  player.commandPermissionLevel = CommandPermissionLevel.GameDirectors;
  player.selectedSlotIndex = 0;
  player.teleport(position(), { dimension: arena.dimension, facingLocation: position(0.5, 0, 2.5) });
  await nextTick();
}

function giveSelected(player, itemId, amount = 1) {
  player.runCommand(`give @s ${itemId} ${amount}`);
  player.selectedSlotIndex = 0;
}

function spawnTarget(player, typeId) {
  const entity = player.dimension.spawnEntity(typeId, position(0.5, 1, 2.5));
  entity.addTag(ENTITY_TAG);
  entity.addEffect("slowness", 400, { amplifier: 255, showParticles: false });
  player.teleport(position(), { dimension: arena.dimension, facingLocation: position(0.5, -0.4, 2.5) });
  return entity;
}

function define(id, group, prepare, inspect) {
  scenarios.set(id, { id, group, prepare, inspect });
}

for (const [id, direction] of [["movement-left", -1], ["movement-right", 1]]) {
  define(id, "movement", async (player) => {
    await prepareArena(player);
    const forward = player.getViewDirection();
    return { start: { ...player.location }, right: { x: -forward.z, z: forward.x }, direction };
  }, (player, fixture) => {
    const delta = { x: player.location.x - fixture.start.x, z: player.location.z - fixture.start.z };
    const lateral = delta.x * fixture.right.x + delta.z * fixture.right.z;
    return { passed: lateral * fixture.direction > 0.6, observed: { lateral, delta }, expected: "At least 0.6 blocks in the requested local direction." };
  });
}

define("block-break", "blocks", async (player) => {
  await prepareArena(player);
  blockAt(player.dimension, 0, 1, 2).setType("minecraft:dirt");
  return {};
}, (player) => {
  const typeId = blockAt(player.dimension, 0, 1, 2).typeId;
  return { passed: typeId === "minecraft:air", observed: { typeId }, expected: "minecraft:air" };
});

define("block-place", "blocks", async (player) => {
  await prepareArena(player);
  blockAt(player.dimension, 0, 1, 2).setType("minecraft:stone");
  giveSelected(player, "minecraft:dirt", 2);
  return {};
}, (player) => {
  const neighbors = [[-1, 1, 2], [1, 1, 2], [0, 0, 2], [0, 2, 2], [0, 1, 1], [0, 1, 3]];
  const placed = neighbors.filter(([x, y, z]) => blockAt(player.dimension, x, y, z).typeId === "minecraft:dirt");
  const remaining = countItem(inventory(player), "minecraft:dirt");
  return { passed: placed.length === 1 && remaining === 1, observed: { placed, remaining }, expected: { placed: 1, remaining: 1 } };
});

define("drop-item", "inventory", async (player) => {
  await prepareArena(player);
  giveSelected(player, "minecraft:emerald", 4);
  return {};
}, (player) => {
  const remaining = countItem(inventory(player), "minecraft:emerald");
  return { passed: remaining === 3, observed: { remaining }, expected: 3 };
});

define("inventory-script-slot", "inventory", async (player) => {
  await prepareArena(player);
  inventory(player).setItem(0, new ItemStack("minecraft:emerald", 2));
  return {};
}, (player) => {
  const remaining = countItem(inventory(player), "minecraft:emerald");
  return { passed: remaining === 1, observed: { remaining }, expected: 1 };
});

define("chest-transfer", "inventory", async (player) => {
  await prepareArena(player);
  blockAt(player.dimension, 0, 1, 2).setType("minecraft:chest");
  await nextTick();
  const chest = blockAt(player.dimension, 0, 1, 2).getComponent("minecraft:inventory")?.container;
  if (!chest) throw new Error("Chest inventory is unavailable.");
  chest.setItem(0, new ItemStack("minecraft:emerald", 4));
  return {};
}, (player) => {
  const chest = blockAt(player.dimension, 0, 1, 2).getComponent("minecraft:inventory")?.container;
  if (!chest) throw new Error("Chest inventory is unavailable.");
  const observed = { chest: countItem(chest, "minecraft:emerald"), player: countItem(inventory(player), "minecraft:emerald") };
  return { passed: observed.chest === 0 && observed.player === 4, observed, expected: { chest: 0, player: 4 } };
});

define("creative-select", "creative", async (player) => {
  await prepareArena(player, GameMode.Creative);
  return {};
}, (player) => {
  const stars = countItem(inventory(player), "minecraft:nether_star");
  return { passed: stars > 0, observed: { stars }, expected: "At least one nether star selected from the Java creative menu." };
});

define("equip-helmet", "equipment", async (player) => {
  await prepareArena(player);
  giveSelected(player, "minecraft:iron_helmet");
  return {};
}, (player) => {
  const typeId = equipment(player).getEquipment(EquipmentSlot.Head)?.typeId;
  return { passed: typeId === "minecraft:iron_helmet", observed: { typeId }, expected: "minecraft:iron_helmet" };
});

define("equip-offhand", "equipment", async (player) => {
  await prepareArena(player);
  giveSelected(player, "minecraft:shield");
  return {};
}, (player) => {
  const typeId = equipment(player).getEquipment(EquipmentSlot.Offhand)?.typeId;
  return { passed: typeId === "minecraft:shield", observed: { typeId }, expected: "minecraft:shield" };
});

define("eat-golden-apple", "equipment", async (player) => {
  await prepareArena(player);
  giveSelected(player, "minecraft:golden_apple");
  return {};
}, (player) => {
  const remaining = countItem(inventory(player), "minecraft:golden_apple");
  const absorption = player.getEffect("absorption")?.duration ?? 0;
  return { passed: remaining === 0 && absorption > 0, observed: { remaining, absorption }, expected: { remaining: 0, absorption: "active" } };
});

define("entity-attack", "interaction", async (player) => {
  await prepareArena(player);
  const entity = spawnTarget(player, "minecraft:cow");
  return { entity, health: entity.getComponent("minecraft:health")?.currentValue };
}, (_player, fixture) => {
  const health = fixture.entity.getComponent("minecraft:health")?.currentValue ?? 0;
  return { passed: health < fixture.health, observed: { health }, expected: `Less than ${fixture.health}` };
});

define("entity-name", "interaction", async (player) => {
  await prepareArena(player);
  const entity = spawnTarget(player, "minecraft:cow");
  const tag = new ItemStack("minecraft:name_tag");
  tag.nameTag = "StackAnvilProbe";
  inventory(player).setItem(0, tag);
  return { entity };
}, (_player, fixture) => {
  const name = fixture.entity.nameTag;
  return { passed: name === "StackAnvilProbe", observed: { name }, expected: "StackAnvilProbe" };
});

define("map-hold", "maps", async (player) => {
  await prepareArena(player);
  giveSelected(player, "minecraft:empty_map");
  return {};
}, (player) => {
  const selected = inventory(player).getItem(0)?.typeId;
  return { passed: selected === "minecraft:filled_map", observed: { selected }, expected: "minecraft:filled_map after using the empty map; inspect the Java map pixels separately." };
});

define("command-time", "commands", async (player) => {
  await prepareArena(player);
  world.setTimeOfDay(18000);
  return {};
}, () => {
  const time = world.getTimeOfDay();
  return { passed: time < 6000, observed: { time }, expected: "Daytime after the Java client runs /time set day." };
});

define("command-completion", "commands", async (player) => {
  await prepareArena(player);
  world.setTimeOfDay(18000);
  return {};
}, () => {
  const time = world.getTimeOfDay();
  return { passed: time < 6000, observed: { time }, expected: "Daytime after completing /time set day with Tab." };
});

define("command-denied", "commands", async (player) => {
  await prepareArena(player);
  player.commandPermissionLevel = CommandPermissionLevel.Any;
  world.setTimeOfDay(18000);
  return {};
}, () => {
  const time = world.getTimeOfDay();
  return { passed: time >= 15000, observed: { time }, expected: "Night remains after a player without command permission attempts /time set day." };
});

define("respawn", "lifecycle", async (player) => {
  await prepareArena(player);
  player.setSpawnPoint({ dimension: arena.dimension, ...position() });
  world.gameRules.doImmediateRespawn = true;
  const before = respawns;
  system.runTimeout(() => player.kill(), 2);
  return { before };
}, (player, fixture) => ({
  passed: respawns > fixture.before && player.isValid,
  observed: { respawns: respawns - fixture.before, valid: player.isValid },
  expected: "One respawn while the Java client remains connected.",
}));

define("dimension-change", "lifecycle", async (player) => {
  await prepareArena(player);
  player.setGameMode(GameMode.Creative);
  const before = dimensionChanges;
  system.runTimeout(() => player.teleport({ x: 0.5, y: 120, z: 0.5 }, { dimension: world.getDimension("nether") }), 2);
  return { before };
}, (player, fixture) => ({
  passed: dimensionChanges > fixture.before && player.dimension.id === "minecraft:nether",
  observed: { changes: dimensionChanges - fixture.before, dimension: player.dimension.id },
  expected: "minecraft:nether after a dimension change.",
}));

world.afterEvents.playerSpawn.subscribe((event) => {
  if (!event.initialSpawn) respawns++;
});
world.afterEvents.playerDimensionChange.subscribe(() => dimensionChanges++);

export function gameplayIds() {
  return [...scenarios.keys()];
}

export async function prepareGameplay(id, run, player) {
  run = run ?? "";
  if (!/^[a-z0-9-]{1,40}$/.test(run)) {
    record(id, run, "prepare", "error", { error: "Run ID must use lowercase letters, digits, and hyphens." });
    return;
  }
  const scenario = scenarios.get(id);
  if (!scenario) {
    record(id, run, "prepare", "error", { error: "Unknown scenario." });
    return;
  }
  if (!player) {
    record(id, run, "prepare", "error", { error: "A player must be online." });
    return;
  }
  active = undefined;
  try {
    const fixture = await scenario.prepare(player);
    active = { scenario, fixture, playerName: player.name, run };
    record(id, run, "prepare", "ready", { group: scenario.group });
  } catch (error) {
    record(id, run, "prepare", "error", { error: String(error) });
  }
}

export function verifyGameplay(id, run, player) {
  run = run ?? "";
  if (!active || active.scenario.id !== id || active.run !== run) {
    record(id, run, "verify", "error", { error: "This scenario is not active for this player and run." });
    return;
  }
  if (!player) {
    record(id, run, "verify", "fail", { observed: { connected: false }, expected: "The player remains connected." });
    return;
  }
  if (active.playerName !== player.name) {
    record(id, run, "verify", "error", { error: "A different player is online." });
    return;
  }
  try {
    const result = active.scenario.inspect(player, active.fixture);
    record(id, run, "verify", result.passed ? "pass" : "fail", { observed: result.observed, expected: result.expected });
  } catch (error) {
    record(id, run, "verify", "error", { error: String(error) });
  }
}

export function resetGameplay() {
  active = undefined;
  clearEntities();
}
