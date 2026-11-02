import { ItemStack, system, world, type Player } from "@minecraft/server";
import { movingFoodUsePasses, pearlWindChargePasses, type PlayerUseObservation } from "../../../src/integration/player-use-observation.ts";
import type { ProbeContext } from "./complex-gameplay.ts";

export function registerPlayerUseGameplay(context: ProbeContext) {
  const { define, prepareArena, inventory, countItem, position, getActive } = context;
  function observationFor(player: Player) {
    const current = getActive();
    return current?.playerName === player.name && !current.fixture.closed ? current.fixture.playerUse : undefined;
  }

  for (const [signal, action] of [[world.afterEvents.itemStartUse, "start"],
    [world.afterEvents.itemCompleteUse, "complete"], [world.afterEvents.itemStopUse, "stop"],
    [world.afterEvents.itemReleaseUse, "release"], [world.afterEvents.itemUse, "use"]] as const) {
    signal.subscribe((event) => {
      const observation = observationFor(event.source);
      if (observation && event.itemStack) observation.events.push({ item: event.itemStack.typeId, action, tick: system.currentTick });
    });
  }
  world.afterEvents.projectileHitBlock.subscribe((event) => {
    if (event.source?.typeId !== "minecraft:player") return;
    const player = event.source as Player;
    const observation = observationFor(player);
    if (!observation) return;
    observation.impacts.push({ type: event.projectile.typeId, tick: system.currentTick,
      playerPosition: { ...player.location }, impactPosition: { ...event.location } });
  });
  system.runInterval(() => {
    const current = getActive();
    if (!current || current.fixture.closed) return;
    const observation = current.fixture.playerUse;
    if (!observation || (observation.events.length === 0 && observation.kind !== "pearl-wind-moving")) return;
    const player = world.getAllPlayers().find((candidate) => candidate.name === current.playerName);
    if (!player) return;
    try {
      if (observation.frames.length >= 400) throw new Error("Player-use observation exceeded 400 ticks.");
      observation.frames.push({ tick: system.currentTick, position: { ...player.location },
        velocity: player.getVelocity(), onGround: player.isOnGround });
    } catch (error) { observation.error = String(error); }
  }, 1);

  for (const id of ["pearl-wind-charge", "pearl-wind-charge-moving", "eat-moving-repeat", "eat-moving-last"] as const) {
    define(id, "player-use", async (player): Promise<{ playerUse: PlayerUseObservation; closed: boolean }> => {
      await prepareArena(player);
      const from = position(-8, -1, -8), to = position(8, -1, 32);
      player.dimension.runCommand(`fill ${Math.floor(from.x)} ${from.y} ${Math.floor(from.z)} ${Math.floor(to.x)} ${to.y} ${Math.floor(to.z)} stone`);
      player.dimension.runCommand(`fill ${Math.floor(from.x)} ${from.y + 1} ${Math.floor(from.z)} ${Math.floor(to.x)} ${to.y + 11} ${Math.floor(to.z)} air`);
      const kind = id === "pearl-wind-charge-moving" ? "pearl-wind-moving" : id === "pearl-wind-charge" ? "pearl-wind" : "food";
      const initialFood = kind === "food" ? id === "eat-moving-last" ? 1 : 6 : 0;
      if (kind === "food") inventory(player).setItem(0, new ItemStack("minecraft:golden_apple", initialFood));
      else {
        inventory(player).setItem(0, new ItemStack("minecraft:ender_pearl", 4));
        inventory(player).setItem(1, new ItemStack("minecraft:wind_charge", 4));
      }
      player.clearVelocity();
      player.teleport(position(), { dimension: player.dimension, rotation: { x: kind === "food" ? 0 : 70, y: 0 } });
      const playerUse: PlayerUseObservation = { kind, initialFood, remainingFood: initialFood,
        remainingPearls: 4, remainingWindCharges: 4, absorption: 0, start: { ...player.location },
        events: [], impacts: [], frames: [] };
      return { playerUse, closed: false };
    }, (player, fixture) => {
      fixture.closed = true;
      const observation = fixture.playerUse;
      observation.remainingFood = countItem(inventory(player), "minecraft:golden_apple");
      observation.remainingPearls = countItem(inventory(player), "minecraft:ender_pearl");
      observation.remainingWindCharges = countItem(inventory(player), "minecraft:wind_charge");
      observation.absorption = player.getEffect("absorption")?.duration ?? 0;
      return { passed: observation.kind === "food" ? movingFoodUsePasses(observation) : pearlWindChargePasses(observation),
        observed: observation, expected: observation.kind !== "food"
          ? "A pearl teleport, a wind-charge launch, and a settled landing. The moving case also requires walking before the throw."
          : "Food completes while moving, grants absorption and stops when the last item is consumed." };
    });
  }
}
