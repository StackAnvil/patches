import { EquipmentSlot, GameMode, ItemStack, system, world,
  type Block, type Container, type Dimension, type EntityEquippableComponent, type Player, type Vector3 } from "@minecraft/server";
import { rangedObservationPasses, type RangedObservation } from "../../../src/integration/ranged-observation.ts";

interface MotionObservation {
  start: Vector3;
  samples: number;
  minY: number;
  maxY: number;
  waterSamples: number;
  flightSamples: number;
  frames: { tick: number; position: Vector3; velocity: Vector3; inWater: boolean; flying: boolean; onGround: boolean }[];
  error?: string;
}

interface Fixture {
  ranged?: RangedObservation;
  motion?: MotionObservation;
  closed?: boolean;
}

interface ProbeContext {
  define<T extends Fixture>(id: string, group: string, prepare: (player: Player) => Promise<T>,
    inspect: (player: Player, fixture: T) => { passed: boolean; observed: unknown; expected: unknown }): void;
  prepareArena(player: Player, mode?: GameMode): Promise<void>;
  inventory(player: Player): Container;
  equipment(player: Player): EntityEquippableComponent;
  countItem(container: Container, typeId: string): number;
  blockAt(dimension: Dimension, x: number, y: number, z: number): Block;
  position(x?: number, y?: number, z?: number): Vector3;
  getActive(): { fixture: Fixture; playerName: string } | undefined;
}

export function registerComplexGameplay({ define, prepareArena, inventory, equipment, countItem, blockAt, position, getActive }: ProbeContext) {
  function fixtureFor(player: Player) {
    const current = getActive();
    return current?.playerName === player?.name && !current.fixture.closed ? current.fixture : undefined;
  }

  for (const [signal, action] of [[world.afterEvents.itemStartUse, "start"],
    [world.afterEvents.itemReleaseUse, "release"], [world.afterEvents.itemCompleteUse, "complete"],
    [world.afterEvents.itemStopUse, "stop"], [world.afterEvents.itemUse, "use"]] as const) {
    signal.subscribe((event: { source: Player; itemStack?: ItemStack; useDuration?: number }) => {
      const observation = fixtureFor(event.source)?.ranged;
      if (!observation) return;
      const item = event.itemStack ?? inventory(event.source).getItem(event.source.selectedSlotIndex);
      if (item?.typeId !== observation.item) return;
      observation.events.push({ action, tick: system.currentTick, remainingUseTicks: event.useDuration });
    });
  }

  world.afterEvents.entitySpawn.subscribe((event) => {
    const current = getActive();
    if (!current?.fixture.ranged || current.fixture.closed) return;
    if (!["minecraft:arrow", "minecraft:splash_potion", "minecraft:lingering_potion"].includes(event.entity.typeId)) return;
    // Ownership and launch velocity can be assigned after the spawn notification.
    system.run(() => {
      if (getActive() !== current || current.fixture.closed) return;
      try {
        const entity = event.entity;
        const owner = entity.getComponent("minecraft:projectile")?.owner;
        if (owner?.typeId !== "minecraft:player" || (owner as Player).name !== current.playerName) return;
        const velocity = entity.getVelocity();
        current.fixture.ranged!.projectiles.push({ id: entity.id, type: entity.typeId, tick: system.currentTick,
          speed: Math.hypot(velocity.x, velocity.y, velocity.z) });
      } catch (error) {
        current.fixture.ranged!.error = String(error);
      }
    });
  });

  for (const [id, item, mode] of [["bow-release", "bow", "release"], ["bow-cancel", "bow", "cancel"],
    ["bow-no-ammo", "bow", "empty"], ["crossbow-load", "crossbow", "load"],
    ["crossbow-retain", "crossbow", "retain"], ["crossbow-fire", "crossbow", "fire"],
    ["splash-potion-throw", "splash_potion", "throw"], ["lingering-potion-throw", "lingering_potion", "throw"]] as const) {
    define(id, "ranged", async (player) => {
      await prepareArena(player);
      const container = inventory(player);
      const itemId = `minecraft:${item}`;
      container.setItem(0, new ItemStack(itemId));
      const ammunition = mode === "throw" ? itemId : "minecraft:arrow";
      if (mode !== "empty" && mode !== "throw") container.setItem(9, new ItemStack(ammunition, 4));
      const initialCount = countItem(container, ammunition);
      const ranged: RangedObservation = { item: itemId, ammunition, initialCount, remainingCount: initialCount, events: [], projectiles: [], slots: [] };
      const fixture: { ranged: RangedObservation; closed: boolean } = { ranged, closed: false };
      return fixture;
    }, (player, fixture) => {
      fixture.closed = true;
      fixture.ranged.remainingCount = countItem(inventory(player), fixture.ranged.ammunition);
      return { passed: rangedObservationPasses(mode, fixture.ranged), observed: fixture.ranged,
        expected: { mode, consumed: ["empty", "cancel"].includes(mode) ? 0 : 1,
          projectiles: ["release", "fire", "retain", "throw"].includes(mode) ? 1 : 0 } };
    });
  }

  system.runInterval(() => {
    const current = getActive();
    if (!current || current.fixture.closed || (!current.fixture.ranged && !current.fixture.motion)) return;
    const player = world.getAllPlayers().find((candidate) => candidate.name === current.playerName);
    if (!player) return;
    if (current.fixture.ranged) {
      const slots = current.fixture.ranged.slots!;
      if (slots.at(-1)?.slot !== player.selectedSlotIndex) slots.push({ slot: player.selectedSlotIndex, tick: system.currentTick });
    }
    const motion = current.fixture.motion;
    if (!motion) return;
    try {
      motion.samples++;
      motion.minY = Math.min(motion.minY, player.location.y);
      motion.maxY = Math.max(motion.maxY, player.location.y);
      if (player.isInWater) motion.waterSamples++;
      if (player.isFlying) motion.flightSamples++;
      if (motion.frames.length < 200) motion.frames.push({ tick: system.currentTick, position: { ...player.location },
        velocity: player.getVelocity(), inWater: player.isInWater, flying: player.isFlying, onGround: player.isOnGround });
    } catch (error) {
      motion.error = String(error);
    }
  }, 1);

  function motionFixture(player: Player) {
    const motion: MotionObservation = { start: { ...player.location }, samples: 0, minY: player.location.y,
      maxY: player.location.y, waterSamples: 0, flightSamples: 0, frames: [] };
    return { motion, closed: false };
  }

  for (const boots of [false, true]) {
    define(boots ? "powder-snow-boots" : "powder-snow-sink", "terrain", async (player) => {
      await prepareArena(player);
      for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) {
        blockAt(player.dimension, x, -3, z).setType("minecraft:stone");
        for (const y of [-2, -1]) blockAt(player.dimension, x, y, z).setType("minecraft:powder_snow");
      }
      if (boots) equipment(player).setEquipment(EquipmentSlot.Feet, new ItemStack("minecraft:leather_boots"));
      player.teleport(position());
      return motionFixture(player);
    }, (player, fixture) => {
      fixture.closed = true;
      const motion = fixture.motion;
      const displacement = player.location.y - motion.start.y;
      return { passed: !motion.error && motion.samples >= 10 && (boots
          ? motion.minY >= motion.start.y - 0.05 && Math.abs(displacement) < 0.05
          : motion.minY < motion.start.y - 0.25 && displacement < -0.25),
        observed: { ...motion, displacement, boots: equipment(player).getEquipment(EquipmentSlot.Feet)?.typeId },
        expected: boots ? "Leather boots keep the player on the powder snow surface." : "The player sinks into powder snow." };
    });
  }

  define("water-forward", "fluids", async (player) => {
    await prepareArena(player);
    for (let x = -2; x <= 2; x++) for (let z = -2; z <= 4; z++) {
      for (const y of [0, 1, 2]) blockAt(player.dimension, x, y, z).setType("minecraft:water");
    }
    player.teleport(position());
    return { ...motionFixture(player), forward: player.getViewDirection() };
  }, (player, fixture) => {
    fixture.closed = true;
    const delta = { x: player.location.x - fixture.motion.start.x, z: player.location.z - fixture.motion.start.z };
    const forward = delta.x * fixture.forward.x + delta.z * fixture.forward.z;
    return { passed: !fixture.motion.error && fixture.motion.waterSamples >= 10 && forward > 0.6,
      observed: { ...fixture.motion, delta, forward }, expected: "Forward movement of at least 0.6 blocks with ten water samples." };
  });

  define("creative-flight-ascend", "flight", async (player) => {
    await prepareArena(player, GameMode.Creative);
    return motionFixture(player);
  }, (player, fixture) => {
    fixture.closed = true;
    const ascent = player.location.y - fixture.motion.start.y;
    return { passed: !fixture.motion.error && fixture.motion.flightSamples >= 10 && ascent > 1,
      observed: { ...fixture.motion, ascent }, expected: "Creative flight remains active for ten samples and ascends more than one block." };
  });
}
