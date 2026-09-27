import { BlockPermutation, CommandPermissionLevel, EquipmentSlot, GameMode, ItemStack, system, world } from "@minecraft/server";

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

define("creative-block-break", "blocks", async (player) => {
  await prepareArena(player, GameMode.Creative);
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

define("offhand-block-place", "blocks", async (player) => {
  await prepareArena(player);
  blockAt(player.dimension, 0, 1, 2).setType("minecraft:stone");
  equipment(player).setEquipment(EquipmentSlot.Offhand, new ItemStack("minecraft:dirt", 2));
  player.teleport(position(), { dimension: arena.dimension, facingLocation: position(0.5, 1.5, 2.5) });
  await nextTick();
  const equipped = equipment(player).getEquipment(EquipmentSlot.Offhand);
  if (equipped?.typeId !== "minecraft:dirt") throw new Error(`Bedrock rejected offhand dirt: ${equipped?.typeId ?? "empty"}`);
  return {};
}, (player) => {
  const neighbors = [[-1, 1, 2], [1, 1, 2], [0, 0, 2], [0, 2, 2], [0, 1, 1], [0, 1, 3]];
  const placed = neighbors.filter(([x, y, z]) => blockAt(player.dimension, x, y, z).typeId === "minecraft:dirt");
  const offhand = equipment(player).getEquipment(EquipmentSlot.Offhand);
  return { passed: placed.length === 1 && offhand?.amount === 1,
    observed: { placed, offhand: offhand?.typeId, amount: offhand?.amount },
    expected: { placed: 1, offhand: "minecraft:dirt", amount: 1 } };
});

define("offhand-shield-use", "equipment", async (player) => {
  await prepareArena(player);
  equipment(player).setEquipment(EquipmentSlot.Offhand, new ItemStack("minecraft:shield"));
  await nextTick();
  if (equipment(player).getEquipment(EquipmentSlot.Offhand)?.typeId !== "minecraft:shield") {
    throw new Error("Bedrock did not equip the offhand shield.");
  }
  const observation = { sneakingWhileUsing: false };
  const monitor = system.runInterval(() => {
    if (player.isValid && player.isSneaking) observation.sneakingWhileUsing = true;
  }, 1);
  return { observation, monitor };
}, (_player, fixture) => {
  system.clearRun(fixture.monitor);
  return { passed: fixture.observation.sneakingWhileUsing, observed: fixture.observation,
    expected: "Bedrock sees the sneak input used to raise the shield." };
});

async function prepareShieldProjectile(player, withShield) {
  await prepareArena(player);
  for (let z = 0; z <= 5; z++) {
    for (let y = 1; y <= 3; y++) {
      blockAt(arena.dimension, -1, y, z).setType("minecraft:stone");
      blockAt(arena.dimension, 1, y, z).setType("minecraft:stone");
    }
    blockAt(arena.dimension, 0, 3, z).setType("minecraft:stone");
  }
  if (withShield) equipment(player).setEquipment(EquipmentSlot.Offhand, new ItemStack("minecraft:shield"));
  await nextTick();
  const observation = { arrowHits: 0, sneakingWhileUsing: false, hitsWhileSneaking: 0, damageEvents: [] };
  system.runTimeout(() => {
    if (!player.isValid) return;
    const skeleton = player.dimension.spawnEntity("minecraft:skeleton", position(0.5, 1, 4.5));
    skeleton.addTag(ENTITY_TAG);
    skeleton.addEffect("slowness", 400, { amplifier: 255, showParticles: false });
  }, 40);
  const monitor = system.runInterval(() => {
    if (player.isValid && player.isSneaking) observation.sneakingWhileUsing = true;
  }, 1);
  return { playerId: player.id, health: player.getComponent("minecraft:health")?.currentValue, observation, monitor };
}

world.afterEvents.projectileHitEntity.subscribe((event) => {
  if (!active?.scenario.id.startsWith("shield-projectile-") || event.projectile.typeId !== "minecraft:arrow") return;
  if (event.getEntityHit()?.entity.id === active.fixture.playerId) {
    active.fixture.observation.arrowHits++;
    if (event.getEntityHit()?.entity.isSneaking) active.fixture.observation.hitsWhileSneaking++;
  }
});

world.afterEvents.entityHurt.subscribe((event) => {
  if (!active?.scenario.id.startsWith("shield-projectile-") || event.hurtEntity.id !== active.fixture.playerId) return;
  active.fixture.observation.damageEvents.push({ tick: system.currentTick, damage: event.damage,
    cause: event.damageSource.cause, sneaking: event.hurtEntity.isSneaking });
});

define("shield-projectile-baseline", "equipment", async (player) => prepareShieldProjectile(player, false),
  (player, fixture) => {
    system.clearRun(fixture.monitor);
    const health = player.getComponent("minecraft:health")?.currentValue;
    return { passed: fixture.observation.arrowHits > 0 && health < fixture.health,
      observed: { ...fixture.observation, health, before: fixture.health },
      expected: "A frontal skeleton arrow hits and damages an unshielded player." };
  });

define("shield-projectile-block", "equipment", async (player) => prepareShieldProjectile(player, true),
  (player, fixture) => {
    system.clearRun(fixture.monitor);
    const health = player.getComponent("minecraft:health")?.currentValue;
    const blockedWhileUsing = fixture.observation.hitsWhileSneaking > 0
      && !fixture.observation.damageEvents.some((event) => event.sneaking);
    return { passed: blockedWhileUsing && fixture.observation.sneakingWhileUsing,
      observed: { ...fixture.observation, health, before: fixture.health },
      expected: "A frontal arrow hits while the shield is raised without damage during active use." };
  });

define("offhand-elytra-rocket", "equipment", async (player) => {
  await prepareArena(player);
  equipment(player).setEquipment(EquipmentSlot.Chest, new ItemStack("minecraft:elytra"));
  equipment(player).setEquipment(EquipmentSlot.Offhand, new ItemStack("minecraft:firework_rocket", 3));
  await nextTick();
  if (equipment(player).getEquipment(EquipmentSlot.Chest)?.typeId !== "minecraft:elytra"
      || equipment(player).getEquipment(EquipmentSlot.Offhand)?.amount !== 3) {
    throw new Error("Bedrock did not equip the elytra and three offhand rockets.");
  }
  player.addEffect("resistance", 200, { amplifier: 255, showParticles: false });
  const observation = { gliding: false, rocketConsumedWhileGliding: false, speedBeforeUse: 0,
    maxSpeedAfterUse: 0, maxHorizontalSpeed: 0 };
  let previousCount = 3;
  let previousSpeed = 0;
  const monitor = system.runInterval(() => {
    if (!player.isValid) return;
    observation.gliding ||= player.isGliding;
    const velocity = player.getVelocity();
    const speed = Math.hypot(velocity.x, velocity.z);
    observation.maxHorizontalSpeed = Math.max(observation.maxHorizontalSpeed, speed);
    const offhand = equipment(player).getEquipment(EquipmentSlot.Offhand);
    const count = offhand?.typeId === "minecraft:firework_rocket" ? offhand.amount : 0;
    if (player.isGliding && count < previousCount && !observation.rocketConsumedWhileGliding) {
      observation.rocketConsumedWhileGliding = true;
      observation.speedBeforeUse = previousSpeed;
    }
    if (observation.rocketConsumedWhileGliding) observation.maxSpeedAfterUse = Math.max(observation.maxSpeedAfterUse, speed);
    previousCount = count;
    previousSpeed = speed;
  }, 1);
  return { observation, monitor };
}, (player, fixture) => {
  system.clearRun(fixture.monitor);
  const offhand = equipment(player).getEquipment(EquipmentSlot.Offhand);
  const remaining = offhand?.typeId === "minecraft:firework_rocket" ? offhand.amount : 0;
  const health = player.getComponent("minecraft:health")?.currentValue;
  return { passed: fixture.observation.gliding && fixture.observation.rocketConsumedWhileGliding
      && fixture.observation.maxSpeedAfterUse > fixture.observation.speedBeforeUse + 0.15 && health > 0,
    observed: { ...fixture.observation, remaining, health,
      location: player.location },
    expected: "Rocket count falls during glide, horizontal speed rises, and the player survives." };
});

define("boat-forward", "movement", async (player) => {
  await prepareArena(player);
  for (let x = -30; x <= 30; x++) {
    for (let z = -2; z <= 2; z++) blockAt(arena.dimension, x, 0, z).setType("minecraft:water");
  }
  const boat = player.dimension.spawnEntity("minecraft:boat", position(0.5, 0.4, 0.5));
  boat.addTag(ENTITY_TAG);
  const rideable = boat.getComponent("minecraft:rideable");
  if (!rideable?.addRider(player)) throw new Error("Could not mount the player in the boat.");
  await nextTick();
  const observation = { samples: 0, riderSamples: 0, maxStep: 0, pathLength: 0 };
  let previous = { ...boat.location };
  const monitor = system.runInterval(() => {
    if (!boat.isValid) return;
    const location = boat.location;
    const step = Math.hypot(location.x - previous.x, location.z - previous.z);
    observation.samples++;
    observation.riderSamples += rideable.getRiders().some((rider) => rider.id === player.id) ? 1 : 0;
    observation.maxStep = Math.max(observation.maxStep, step);
    observation.pathLength += step;
    previous = { ...location };
  }, 1);
  return { boat, start: { ...boat.location }, observation, monitor };
}, (player, fixture) => {
  system.clearRun(fixture.monitor);
  const delta = { x: fixture.boat.location.x - fixture.start.x, y: fixture.boat.location.y - fixture.start.y,
    z: fixture.boat.location.z - fixture.start.z };
  const distance = Math.hypot(delta.x, delta.z);
  return { passed: distance > 0.8 && Math.abs(delta.y) < 2
      && fixture.observation.riderSamples > 0 && fixture.observation.maxStep < 2,
    observed: { delta, distance, player: player.location, ...fixture.observation },
    expected: "Ridden boat stays on water, moves at least 0.8 blocks, and has no two-block jump between ticks." };
});

define("minecart-dismount", "movement", async (player) => {
  await prepareArena(player);
  for (let z = -2; z <= 28; z++) {
    for (let x = -1; x <= 1; x++) {
      blockAt(arena.dimension, x, -1, z).setType(x === 0 ? "minecraft:redstone_block" : "minecraft:stone");
      for (let y = 0; y <= 3; y++) blockAt(arena.dimension, x, y, z).setType("minecraft:air");
    }
    blockAt(arena.dimension, 0, 0, z).setPermutation(BlockPermutation.resolve("minecraft:golden_rail", { rail_direction: 0 }));
  }
  const minecart = player.dimension.spawnEntity("minecraft:minecart", position(0.5, 0.2, 0.5));
  minecart.addTag(ENTITY_TAG);
  const rideable = minecart.getComponent("minecraft:rideable");
  if (!rideable?.addRider(player)) throw new Error("Could not mount the player in the minecart.");
  await nextTick();
  const start = { ...minecart.location };
  minecart.applyImpulse({ x: 0, y: 0, z: 0.25 });
  const observation = { riderSamples: 0, maxDistance: 0, maxStep: 0, dismountPosition: null };
  let previous = { ...minecart.location };
  let lastRiddenPosition;
  const monitor = system.runInterval(() => {
    if (!minecart.isValid) return;
    const location = minecart.location;
    const riding = rideable.getRiders().some((rider) => rider.id === player.id);
    if (riding) {
      observation.riderSamples++;
      lastRiddenPosition = { ...location };
    } else if (lastRiddenPosition && !observation.dismountPosition) {
      observation.dismountPosition = lastRiddenPosition;
    }
    observation.maxDistance = Math.max(observation.maxDistance, Math.hypot(location.x - start.x, location.z - start.z));
    observation.maxStep = Math.max(observation.maxStep, Math.hypot(location.x - previous.x, location.z - previous.z));
    previous = { ...location };
  }, 1);
  return { minecart, rideable, start, observation, monitor };
}, (player, fixture) => {
  system.clearRun(fixture.monitor);
  const vehicle = fixture.minecart.location;
  const rider = fixture.rideable.getRiders().some((entity) => entity.id === player.id);
  const fromStart = Math.hypot(player.location.x - fixture.start.x, player.location.z - fixture.start.z);
  const dismountPosition = fixture.observation.dismountPosition;
  const fromDismount = dismountPosition
    ? Math.hypot(player.location.x - dismountPosition.x, player.location.z - dismountPosition.z) : null;
  return { passed: fixture.observation.maxDistance > 2 && fixture.observation.riderSamples > 0
      && fixture.observation.maxStep < 2 && !rider && fromStart > 1.5 && fromDismount !== null && fromDismount < 3,
    observed: { rider, fromStart, fromDismount, player: player.location, vehicle, ...fixture.observation },
    expected: "The player dismounts after the minecart moves and remains near its new position." };
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

define("chest-rapid-transfer", "inventory", async (player) => {
  await prepareArena(player);
  blockAt(player.dimension, 0, 1, 2).setType("minecraft:chest");
  await nextTick();
  const chest = blockAt(player.dimension, 0, 1, 2).getComponent("minecraft:inventory")?.container;
  if (!chest) throw new Error("Chest inventory is unavailable.");
  chest.setItem(0, new ItemStack("minecraft:emerald", 4));
  chest.setItem(1, new ItemStack("minecraft:diamond", 3));
  return {};
}, (player) => {
  const chest = blockAt(player.dimension, 0, 1, 2).getComponent("minecraft:inventory")?.container;
  if (!chest) throw new Error("Chest inventory is unavailable.");
  const observed = {
    chestEmeralds: countItem(chest, "minecraft:emerald"),
    chestDiamonds: countItem(chest, "minecraft:diamond"),
    playerEmeralds: countItem(inventory(player), "minecraft:emerald"),
    playerDiamonds: countItem(inventory(player), "minecraft:diamond"),
  };
  const expected = { chestEmeralds: 0, chestDiamonds: 0, playerEmeralds: 4, playerDiamonds: 3 };
  return { passed: Object.entries(expected).every(([key, value]) => observed[key] === value), observed, expected };
});

define("chest-pickup-all", "inventory", async (player) => {
  await prepareArena(player);
  blockAt(player.dimension, 0, 1, 2).setType("minecraft:chest");
  await nextTick();
  const chest = blockAt(player.dimension, 0, 1, 2).getComponent("minecraft:inventory")?.container;
  if (!chest) throw new Error("Chest inventory is unavailable.");
  chest.setItem(0, new ItemStack("minecraft:emerald", 2));
  chest.setItem(1, new ItemStack("minecraft:emerald", 3));
  chest.setItem(2, new ItemStack("minecraft:emerald", 4));
  return {};
}, (player) => {
  const chest = blockAt(player.dimension, 0, 1, 2).getComponent("minecraft:inventory")?.container;
  if (!chest) throw new Error("Chest inventory is unavailable.");
  const observed = { chest: countItem(chest, "minecraft:emerald"), player: countItem(inventory(player), "minecraft:emerald") };
  return { passed: observed.chest === 0 && observed.player === 9, observed, expected: { chest: 0, player: 9 } };
});

for (const id of ["crafting-manual-sticks", "crafting-book-sticks"]) {
  define(id, "crafting", async (player) => {
    await prepareArena(player);
    blockAt(player.dimension, 0, 1, 2).setType("minecraft:crafting_table");
    giveSelected(player, "minecraft:oak_planks", 2);
    return {};
  }, (player) => {
    const observed = {
      planks: countItem(inventory(player), "minecraft:oak_planks"),
      sticks: countItem(inventory(player), "minecraft:stick"),
    };
    return { passed: observed.planks === 0 && observed.sticks === 4,
      observed, expected: { planks: 0, sticks: 4 } };
  });
}

define("lab-table-then-chest", "inventory", async (player) => {
  await prepareArena(player);
  blockAt(player.dimension, 0, 1, 2).setType("minecraft:lab_table");
  return { labInteracted: false, chestReady: false };
}, (player, fixture) => {
  const chest = blockAt(player.dimension, 0, 1, 1).getComponent("minecraft:inventory")?.container;
  const observed = {
    labInteracted: fixture.labInteracted,
    chestReady: fixture.chestReady,
    chest: chest ? countItem(chest, "minecraft:emerald") : null,
    player: countItem(inventory(player), "minecraft:emerald"),
  };
  return { passed: observed.labInteracted && observed.chestReady && observed.chest === 0 && observed.player === 4,
    observed, expected: { labInteracted: true, chestReady: true, chest: 0, player: 4 } };
});

for (const [id, typeId] of [["chest-boat-transfer", "minecraft:chest_boat"],
  ["chest-minecart-transfer", "minecraft:chest_minecart"]]) {
  define(id, "inventory", async (player) => {
    await prepareArena(player);
    if (typeId === "minecraft:chest_minecart") {
      blockAt(player.dimension, 0, 0, 2).setType("minecraft:rail");
    }
    const entity = player.dimension.spawnEntity(typeId, position(0.5, 1, 2.5));
    entity.addTag(ENTITY_TAG);
    const storage = entity.getComponent("minecraft:inventory")?.container;
    if (!storage) throw new Error(`${typeId} inventory is unavailable.`);
    storage.setItem(0, new ItemStack("minecraft:emerald", 4));
    player.teleport(position(), { dimension: arena.dimension, facingLocation: position(0.5, -0.8, 2.5) });
    return { entity, interactionStarted: false, interacted: false };
  }, (player, fixture) => {
    const storage = fixture.entity.getComponent("minecraft:inventory")?.container;
    if (!storage) throw new Error(`${typeId} inventory is unavailable.`);
    const observed = { interactionStarted: fixture.interactionStarted, interacted: fixture.interacted,
      storage: countItem(storage, "minecraft:emerald"),
      player: countItem(inventory(player), "minecraft:emerald") };
    return { passed: observed.storage === 0 && observed.player === 4,
      observed, expected: { storage: 0, player: 4 } };
  });
}

world.beforeEvents.playerInteractWithEntity.subscribe((event) => {
  if (!active?.scenario.id.startsWith("chest-") || event.player.name !== active.playerName
      || event.target.id !== active.fixture.entity?.id) return;
  active.fixture.interactionStarted = true;
});

world.afterEvents.playerInteractWithEntity.subscribe((event) => {
  if (!active?.scenario.id.startsWith("chest-") || event.player.name !== active.playerName
      || event.target.id !== active.fixture.entity?.id) return;
  active.fixture.interacted = true;
  record(active.scenario.id, active.run, "entity-interaction", "observed",
    { entityType: event.target.typeId, sneaking: event.player.isSneaking });
});

world.afterEvents.playerInteractWithBlock.subscribe((event) => {
  if (active?.scenario.id !== "lab-table-then-chest" || event.player.name !== active.playerName
      || event.block.typeId !== "minecraft:lab_table") return;
  active.fixture.labInteracted = true;
  system.runTimeout(() => {
    if (active?.scenario.id !== "lab-table-then-chest") return;
    const chestBlock = blockAt(event.player.dimension, 0, 1, 1);
    chestBlock.setType("minecraft:chest");
    const chest = chestBlock.getComponent("minecraft:inventory")?.container;
    if (!chest) return;
    chest.setItem(0, new ItemStack("minecraft:emerald", 4));
    active.fixture.chestReady = true;
  }, 4);
});

define("enchant-basic", "inventory", async (player) => {
  await prepareArena(player);
  blockAt(player.dimension, 0, 1, 2).setType("minecraft:enchanting_table");
  inventory(player).setItem(0, new ItemStack("minecraft:iron_sword"));
  inventory(player).setItem(1, new ItemStack("minecraft:lapis_lazuli", 3));
  player.resetLevel();
  player.addLevels(30);
  return {};
}, (player) => {
  const sword = inventory(player).getItem(0);
  const enchantments = sword?.getComponent("minecraft:enchantable")?.getEnchantments() ?? [];
  const observed = { sword: sword?.typeId, enchantments: enchantments.map(({ type, level }) => ({ id: type.id, level })),
    lapis: countItem(inventory(player), "minecraft:lapis_lazuli"), level: player.level };
  return { passed: observed.sword === "minecraft:iron_sword" && observed.enchantments.length > 0
    && observed.lapis === 2 && observed.level < 30,
  observed, expected: "An enchanted iron sword, two lapis, and reduced experience level." };
});

define("creative-select", "creative", async (player) => {
  await prepareArena(player, GameMode.Creative);
  return {};
}, (player) => {
  const stars = countItem(inventory(player), "minecraft:nether_star");
  return { passed: stars > 0, observed: { stars, gameMode: player.getGameMode() }, expected: "At least one nether star selected from the Java creative menu." };
});

define("creative-replace", "creative", async (player) => {
  await prepareArena(player, GameMode.Creative);
  inventory(player).setItem(0, new ItemStack("minecraft:emerald"));
  return {};
}, (player) => {
  const held = inventory(player).getItem(0)?.typeId;
  return { passed: held === "minecraft:nether_star", observed: { held }, expected: "minecraft:nether_star" };
});

define("creative-replace-main", "creative", async (player) => {
  await prepareArena(player, GameMode.Creative);
  inventory(player).setItem(9, new ItemStack("minecraft:emerald"));
  return {};
}, (player) => {
  const item = inventory(player).getItem(9)?.typeId;
  return { passed: item === "minecraft:nether_star", observed: { item }, expected: "minecraft:nether_star in the first main inventory slot" };
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

export function startGameplay(id, run, player) {
  if (!active || active.scenario.id !== id || active.run !== run || active.playerName !== player?.name
      || id !== "offhand-elytra-rocket") {
    record(id, run, "start", "error", { error: "The elytra flight scenario is not active for this player and run." });
    return;
  }
  try {
    player.teleport(position(0.5, 50, 0.5),
      { dimension: arena.dimension, facingLocation: position(0.5, 50, 8.5) });
    active.fixture.observation.flightStartTick = system.currentTick;
    record(id, run, "start", "ready", { observed: { location: player.location } });
  } catch (error) {
    record(id, run, "start", "error", { error: String(error) });
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
