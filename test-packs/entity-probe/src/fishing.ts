import { ItemStack, system, world } from "@minecraft/server";
import { fishingRetrievalPasses, type FishingObservation } from "../../../src/integration/fishing-observation.ts";
import type { ProbeContext } from "./complex-gameplay.ts";

export function registerFishingGameplay({ define, prepareArena, inventory, countItem, blockAt, position, getActive, tagEntity }: ProbeContext) {
  world.afterEvents.itemUse.subscribe(({ source, itemStack }) => {
    const current = getActive();
    if (current?.playerName === source.name && !current.fixture.closed
        && itemStack.typeId === "minecraft:fishing_rod") current.fixture.fishing?.uses.push(system.currentTick);
  });
  world.afterEvents.entitySpawn.subscribe(({ entity }) => {
    const current = getActive();
    if (!current?.fixture.fishing || current.fixture.closed || entity.typeId !== "minecraft:fishing_hook") return;
    current.fixture.fishing.hooks.push({ id: entity.id, spawned: system.currentTick });
    tagEntity(entity);
  });
  world.afterEvents.entityRemove.subscribe(({ removedEntityId }) => {
    const current = getActive();
    if (!current?.fixture.fishing || current.fixture.closed) return;
    const hook = current.fixture.fishing.hooks.find((entry) => entry.id === removedEntityId);
    if (hook) hook.removed = system.currentTick;
  });
  system.runInterval(() => {
    const current = getActive();
    const target = current?.fixture.fishingTarget;
    if (!current?.fixture.fishing?.target || !current.fixture.fishing.uses.length
        || current.fixture.closed || !target?.isValid) return;
    const player = world.getAllPlayers().find((entry) => entry.name === current.playerName);
    if (!player) return;
    try {
      const frames = current.fixture.fishing.target.frames;
      if (frames.length < 200) frames.push({ tick: system.currentTick, position: { ...target.location },
        velocity: target.getVelocity(), player: { ...player.location } });
    } catch (error) { current.fixture.fishing.error = String(error); }
  }, 1);

  for (const mode of ["early", "entity"] as const) {
    define(`fishing-${mode}-reel`, "fishing", async (player) => {
      if (world.getAllPlayers().length !== 1) throw new Error("The fishing probe requires one player to isolate hook spawns.");
      await prepareArena(player);
      for (let x = -3; x <= 3; x++) for (let z = -3; z <= 12; z++) {
        blockAt(player.dimension, x, -3, z).setType("minecraft:stone");
        for (let y = -2; y <= 3; y++) blockAt(player.dimension, x, y, z)
          .setType(y < 0 ? mode === "early" && z >= 2 ? "minecraft:water" : "minecraft:stone" : "minecraft:air");
      }
      const occupants = player.dimension.getEntities({ location: position(0.5, 0, 5.5), maxDistance: 16 })
        .filter((entity) => entity.typeId !== "minecraft:player");
      if (occupants.length) throw new Error(`The fishing arena contains other entities: ${occupants.map((entity) => entity.typeId).join(", ")}.`);
      inventory(player).setItem(0, new ItemStack("minecraft:fishing_rod"));
      player.teleport(position(), { rotation: { x: mode === "early" ? 30 : 15, y: 0 } });
      const fishing: FishingObservation = { uses: [], hooks: [], remainingHooks: [], rodCount: 1, rodDamage: 0, rewards: 0 };
      const target = mode === "entity" ? player.dimension.spawnEntity("minecraft:cow", position(0.5, 0, 3.5)) : undefined;
      if (target) {
        tagEntity(target);
        target.addEffect("slowness", 400, { amplifier: 10, showParticles: false });
        const health = target.getComponent("minecraft:health")?.currentValue;
        if (health === undefined) throw new Error("Fishing target health is unavailable.");
        fishing.target = { id: target.id, valid: true, healthBefore: health, healthAfter: health, frames: [] };
      }
      return { fishing, fishingTarget: target, closed: false as boolean };
    }, (player, fixture) => {
      fixture.closed = true;
      const container = inventory(player);
      const rod = container.getItem(0);
      const observation = fixture.fishing;
      observation.rodCount = countItem(container, "minecraft:fishing_rod");
      observation.rodDamage = rod?.typeId === "minecraft:fishing_rod"
        ? rod.getComponent("minecraft:durability")?.damage ?? -1 : -1;
      for (let slot = 0; slot < container.size; slot++) {
        const item = container.getItem(slot);
        if (item && item.typeId !== "minecraft:fishing_rod") observation.rewards += item.amount;
      }
      observation.remainingHooks = player.dimension.getEntities({ type: "minecraft:fishing_hook" }).map((hook) => hook.id);
      if (observation.target && fixture.fishingTarget) {
        observation.target.valid = fixture.fishingTarget.isValid;
        observation.target.healthAfter = fixture.fishingTarget.isValid
          ? fixture.fishingTarget.getComponent("minecraft:health")?.currentValue ?? -1 : -1;
      }
      return { passed: fishingRetrievalPasses(mode, observation), observed: observation,
        expected: { casts: 1, reels: 1, removedHooks: 1, remainingHooks: 0, rewards: 0,
          rodDamage: mode === "entity" ? 3 : 0, liveTargetPull: mode === "entity" } };
    });
  }
}
