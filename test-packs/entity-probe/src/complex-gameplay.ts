import { EnchantmentType, EquipmentSlot, GameMode, ItemStack, Potions, system, world,
  type Block, type Container, type Dimension, type Entity, type EntityEquippableComponent, type Player, type Vector3 } from "@minecraft/server";
import { potionImpactPasses, rangedHitPasses, rangedObservationPasses, type RangedExpectation, type RangedObservation } from "../../../src/integration/ranged-observation.ts";
import { incomingProjectilePasses, projectileThreatens, type IncomingProjectileObservation } from "../../../src/integration/projectile-observation.ts";

interface MotionObservation {
  start: Vector3;
  samples: number;
  minY: number;
  maxY: number;
  waterSamples: number;
  flightSamples: number;
  lavaSamples: number;
  bubbleSamples: number;
  flowingSamples: number;
  frames: { tick: number; position: Vector3; velocity: Vector3; inWater: boolean; flying: boolean; onGround: boolean;
    block: string; liquidDepth?: number }[];
  error?: string;
}

interface Fixture {
  ranged?: RangedObservation;
  motion?: MotionObservation;
  incoming?: IncomingProjectileObservation;
  projectile?: Entity;
  shooter?: Entity;
  closed?: boolean;
}

interface ProbeContext {
  define<T extends Fixture>(id: string, group: string, prepare: (player: Player) => Promise<T>,
    inspect: (player: Player, fixture: T) => { passed: boolean; observed: unknown; expected: unknown },
    start?: (player: Player, fixture: T) => Promise<void>): void;
  prepareArena(player: Player, mode?: GameMode): Promise<void>;
  inventory(player: Player): Container;
  equipment(player: Player): EntityEquippableComponent;
  countItem(container: Container, typeId: string): number;
  blockAt(dimension: Dimension, x: number, y: number, z: number): Block;
  position(x?: number, y?: number, z?: number): Vector3;
  getActive(): { fixture: Fixture; playerName: string } | undefined;
  tagEntity(entity: Entity): void;
}

export function registerComplexGameplay({ define, prepareArena, inventory, equipment, countItem, blockAt, position, getActive, tagEntity }: ProbeContext) {
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
    if (!current || current.fixture.closed) return;
    if (event.entity.typeId === "minecraft:area_effect_cloud" && current.fixture.ranged?.clouds) {
      const cloud = { id: event.entity.id, tick: system.currentTick, location: { ...event.entity.location } };
      system.run(() => {
        if (getActive() !== current || current.fixture.closed) return;
        const ranged = current.fixture.ranged!;
        if (!ranged.impacts?.some((impact) => ranged.projectiles.some((shot) => shot.id === impact.id)
            && Math.hypot(cloud.location.x - impact.location.x, cloud.location.y - impact.location.y,
              cloud.location.z - impact.location.z) < 4)) return;
        ranged.clouds!.push(cloud);
        if (event.entity.isValid) tagEntity(event.entity);
      });
      return;
    }
    if (!["minecraft:arrow", "minecraft:splash_potion", "minecraft:lingering_potion", "minecraft:fireball", "minecraft:small_fireball"].includes(event.entity.typeId)) return;
    // Ownership and launch velocity can be assigned after the spawn notification.
    system.run(() => {
      if (getActive() !== current || current.fixture.closed) return;
      try {
        const entity = event.entity;
        const owner = entity.getComponent("minecraft:projectile")?.owner;
        if (current.fixture.incoming && entity.typeId === current.fixture.incoming.type
            && owner?.id === current.fixture.incoming.shooterId && !current.fixture.incoming.projectileId) {
          const incoming = current.fixture.incoming;
          const bounds = entity.getAABB();
          const velocity = entity.getVelocity();
          tagEntity(entity);
          if (!projectileThreatens(incoming.playerBounds, bounds, velocity)) {
            entity.remove();
            return;
          }
          incoming.projectileId = entity.id;
          incoming.launchedTick = system.currentTick;
          incoming.projectileExtent = { ...bounds.extent };
          incoming.frames.push({ tick: system.currentTick, position: { ...bounds.center }, velocity, owner: owner.id });
          current.fixture.projectile = entity;
          // A blaze fires a burst. Keep one genuine shot for a reproducible control.
          current.fixture.shooter?.remove();
          return;
        }
        if (!current.fixture.ranged) return;
        if (owner?.typeId !== "minecraft:player" || (owner as Player).name !== current.playerName) return;
        const velocity = entity.getVelocity();
        current.fixture.ranged!.projectiles.push({ id: entity.id, type: entity.typeId, tick: system.currentTick,
          speed: Math.hypot(velocity.x, velocity.y, velocity.z) });
      } catch (error) {
        const observation = current.fixture.ranged ?? current.fixture.incoming;
        if (observation) observation.error = String(error);
      }
    });
  });

  for (const signal of [world.afterEvents.projectileHitBlock, world.afterEvents.projectileHitEntity]) {
    signal.subscribe((event) => {
      const current = getActive();
      if (!current || current.fixture.closed) return;
      const target = "getEntityHit" in event ? event.getEntityHit().entity?.id : undefined;
      const ranged = current.fixture.ranged;
      if (ranged?.impacts && (event.source?.id === world.getAllPlayers().find((player) => player.name === current.playerName)?.id
          || ranged.projectiles.some((shot) => shot.id === event.projectile.id))) {
        ranged.impacts.push({ id: event.projectile.id, tick: system.currentTick, location: { ...event.location }, target });
      }
      const incoming = current.fixture.incoming;
      if (incoming?.projectileId === event.projectile.id && target) {
        incoming.hits.push({ tick: system.currentTick, projectile: event.projectile.id, target });
      }
    });
  }
  world.afterEvents.effectAdd.subscribe((event) => {
    const ranged = event.entity.typeId === "minecraft:player" ? fixtureFor(event.entity as Player)?.ranged : undefined;
    if (ranged?.effects) ranged.effects.push({ tick: system.currentTick, type: event.effect.typeId,
      duration: event.effect.duration, amplifier: event.effect.amplifier });
  });
  world.afterEvents.entityHitEntity.subscribe((event) => {
    const incoming = getActive()?.fixture;
    if (!incoming?.closed && incoming?.incoming && event.damagingEntity.id === incoming.incoming.playerId) {
      incoming.incoming.attacks.push({ tick: system.currentTick, player: event.damagingEntity.id, target: event.hitEntity.id });
    }
  });
  world.afterEvents.entityHurt.subscribe((event) => {
    const fixture = getActive()?.fixture;
    if (fixture?.closed) return;
    const target = fixture?.ranged?.target;
    if (target?.id === event.hurtEntity.id) {
      target.damage.push({ tick: system.currentTick, amount: event.damage, projectile: event.damageSource.damagingProjectile?.id });
      target.healthAfter = event.hurtEntity.getComponent("minecraft:health")?.currentValue ?? 0;
    }
    if (!fixture?.closed && fixture?.incoming && event.hurtEntity.id === fixture.incoming.playerId) {
      fixture.incoming.damage.push({ tick: system.currentTick, amount: event.damage, projectile: event.damageSource.damagingProjectile?.id });
    }
  });

  for (const [id, item, mode] of [["bow-release", "bow", "release"], ["bow-cancel", "bow", "cancel"],
    ["bow-no-ammo", "bow", "empty"], ["crossbow-load", "crossbow", "load"],
    ["crossbow-retain", "crossbow", "retain"], ["crossbow-fire", "crossbow", "fire"],
    ["splash-potion-throw", "splash_potion", "throw"], ["lingering-potion-throw", "lingering_potion", "throw"],
    ["bow-short-release", "bow", "release"], ["bow-water-release", "bow", "release"],
    ["crossbow-cancel", "crossbow", "cancel"], ["crossbow-no-ammo", "crossbow", "empty"],
    ["bow-hit", "bow", "release"], ["crossbow-hit", "crossbow", "fire"],
    ["bow-infinity", "bow", "release"], ["bow-infinity-no-ammo", "bow", "empty"],
    ["crossbow-multishot", "crossbow", "fire"],
    ["crossbow-quick-charge-1", "crossbow", "fire"], ["crossbow-quick-charge-2", "crossbow", "fire"],
    ["crossbow-quick-charge-3", "crossbow", "fire"]] as const) {
    const infinity = id === "bow-infinity" || id === "bow-infinity-no-ammo";
    const multishot = id === "crossbow-multishot";
    const quickCharge = id.startsWith("crossbow-quick-charge-") ? Number(id.at(-1)) : 0;
    const expectation: RangedExpectation = {
      consumed: ["empty", "cancel"].includes(mode) || infinity ? 0 : 1,
      projectileCount: multishot ? 3 : 1,
      // Target BDS reports remaining durations 20/15/10 and completes one tick earlier.
      minChargeTicks: quickCharge ? 24 - 5 * quickCharge : undefined,
      maxChargeTicks: quickCharge ? 26 - 5 * quickCharge : undefined,
    };
    define(id, "ranged", async (player) => {
      await prepareArena(player);
      if (id === "bow-water-release") {
        for (let x = -2; x <= 2; x++) for (let z = -2; z <= 4; z++) for (const y of [0, 1, 2]) {
          blockAt(player.dimension, x, y, z).setType("minecraft:water");
        }
      }
      const container = inventory(player);
      const itemId = `minecraft:${item}`;
      const weapon = new ItemStack(itemId);
      if (infinity || multishot || quickCharge) {
        const enchantable = weapon.getComponent("minecraft:enchantable");
        if (!enchantable) throw new Error("The ranged weapon cannot receive its fixture enchantment.");
        enchantable.addEnchantment({ type: new EnchantmentType(infinity ? "infinity" : multishot ? "multishot" : "quick_charge"),
          level: quickCharge || 1 });
      }
      container.setItem(0, weapon);
      const ammunition = mode === "throw" ? itemId : "minecraft:arrow";
      if (mode !== "empty" && mode !== "throw") container.setItem(9, new ItemStack(ammunition, 4));
      const initialCount = countItem(container, ammunition);
      const ranged: RangedObservation = { item: itemId, ammunition, initialCount, remainingCount: initialCount, events: [], projectiles: [], slots: [] };
      if (id === "bow-hit" || id === "crossbow-hit") {
        const target = player.dimension.spawnEntity("minecraft:cow", position(0.5, 0, 4.5));
        tagEntity(target);
        target.addEffect("slowness", 400, { amplifier: 255, showParticles: false });
        const health = target.getComponent("minecraft:health")?.currentValue;
        if (health === undefined) throw new Error("Target health is unavailable.");
        ranged.target = { id: target.id, healthBefore: health, healthAfter: health, damage: [] };
        ranged.impacts = [];
        player.teleport(position(), { rotation: { x: 5, y: 0 } });
      }
      const fixture = { ranged, closed: false, motion: motionFixture(player).motion };
      return fixture;
    }, (player, fixture) => {
      fixture.closed = true;
      fixture.ranged.remainingCount = countItem(inventory(player), fixture.ranged.ammunition);
      const release = fixture.ranged.events.find((event) => event.action === "release");
      const start = fixture.ranged.events.find((event) => event.action === "start");
      const charge = release && start ? release.tick - start.tick : undefined;
      return { passed: rangedObservationPasses(mode, fixture.ranged, expectation)
          && (id !== "bow-short-release" || (charge !== undefined && charge > 0 && charge <= 12))
          && (id !== "bow-water-release" || fixture.motion.waterSamples >= 10)
          && (id !== "bow-hit" || rangedHitPasses("release", fixture.ranged))
          && (id !== "crossbow-hit" || rangedHitPasses("fire", fixture.ranged)),
        observed: { ...fixture.ranged, charge, motion: fixture.motion },
        expected: { mode, ...expectation,
          projectileCount: ["release", "fire", "retain", "throw"].includes(mode) ? expectation.projectileCount : 0 } };
    });
  }

  for (const lingering of [false, true]) {
    define(lingering ? "lingering-potion-slowness" : "splash-potion-speed", "ranged", async (player) => {
      await prepareArena(player);
      const item = Potions.resolve(lingering ? "minecraft:slowness" : "minecraft:swiftness", lingering ? "ThrownLingering" : "ThrownSplash");
      inventory(player).setItem(0, item);
      player.teleport(position(), { rotation: { x: 80, y: 0 } });
      const ranged: RangedObservation = { item: item.typeId, ammunition: item.typeId, initialCount: 1, remainingCount: 1,
        events: [], projectiles: [], slots: [], impacts: [], effects: [], clouds: [] };
      return { ranged, closed: false as boolean, motion: motionFixture(player).motion };
    }, (player, fixture) => {
      fixture.closed = true;
      fixture.ranged.remainingCount = countItem(inventory(player), fixture.ranged.ammunition);
      return { passed: potionImpactPasses(fixture.ranged, lingering ? "minecraft:slowness" : "minecraft:speed", lingering),
        observed: { ...fixture.ranged, motion: fixture.motion },
        expected: "One consumed potion, an owned projectile impact, and the matching effect; lingering use also creates a nearby cloud." };
    });
  }

  system.runInterval(() => {
    const current = getActive();
    if (!current || current.fixture.closed) return;
    const player = world.getAllPlayers().find((candidate) => candidate.name === current.playerName);
    if (!player) return;
    const incoming = current.fixture.incoming;
    if (incoming && current.fixture.projectile?.isValid && incoming.frames.length < 200
        && incoming.frames.at(-1)?.tick !== system.currentTick) {
      try {
        const projectile = current.fixture.projectile;
        incoming.frames.push({ tick: system.currentTick, position: { ...projectile.getAABB().center }, velocity: projectile.getVelocity(),
          owner: projectile.getComponent("minecraft:projectile")?.owner?.id });
      } catch (error) { incoming.error = String(error); }
    }
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
      const block = player.dimension.getBlock({ x: Math.floor(player.location.x), y: Math.floor(player.location.y), z: Math.floor(player.location.z) });
      const depth = block?.permutation.getState("liquid_depth");
      const liquidDepth = typeof depth === "number" ? depth : undefined;
      if (block?.typeId === "minecraft:lava" || block?.typeId === "minecraft:flowing_lava") motion.lavaSamples++;
      if (block?.typeId === "minecraft:bubble_column") motion.bubbleSamples++;
      if (player.isInWater && liquidDepth !== undefined && liquidDepth > 0) motion.flowingSamples++;
      if (motion.frames.length < 200) motion.frames.push({ tick: system.currentTick, position: { ...player.location },
        velocity: player.getVelocity(), inWater: player.isInWater, flying: player.isFlying, onGround: player.isOnGround,
        block: block?.typeId ?? "unavailable", liquidDepth });
    } catch (error) {
      motion.error = String(error);
    }
  }, 1);

  function motionFixture(player: Player) {
    const motion: MotionObservation = { start: { ...player.location }, samples: 0, minY: player.location.y,
      maxY: player.location.y, waterSamples: 0, flightSamples: 0, lavaSamples: 0, bubbleSamples: 0, flowingSamples: 0, frames: [] };
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

  define("water-current", "fluids", async (player) => {
    await prepareArena(player);
    for (let z = -1; z <= 8; z++) {
      blockAt(player.dimension, 0, -1, z).setType("minecraft:stone");
      for (let y = 0; y <= 2; y++) for (const x of [-1, 1]) blockAt(player.dimension, x, y, z).setType("minecraft:stone");
    }
    for (const z of [-1, 8]) for (let y = 0; y <= 2; y++) blockAt(player.dimension, 0, y, z).setType("minecraft:stone");
    // Server commands schedule fluid updates; a Script API permutation can remain stationary.
    const source = blockAt(player.dimension, 0, 0, 0).location;
    player.runCommand(`setblock ${source.x} ${source.y} ${source.z} flowing_water`);
    await new Promise<void>((resolve) => system.runTimeout(resolve, 40));
    player.teleport(position(0.5, 0, 1.5), { rotation: { x: 0, y: 0 } });
    return motionFixture(player);
  }, (player, fixture) => {
    fixture.closed = true;
    const delta = player.location.z - fixture.motion.start.z;
    return { passed: !fixture.motion.error && fixture.motion.flowingSamples >= 10 && delta > 0.25,
      observed: { ...fixture.motion, delta }, expected: "Flowing water moves an idle player downstream with ten flowing-water samples." };
  });

  define("lava-forward", "fluids", async (player) => {
    await prepareArena(player);
    player.addEffect("fire_resistance", 400, { showParticles: false });
    for (let x = -2; x <= 2; x++) for (let z = -2; z <= 4; z++) for (const y of [0, 1, 2]) {
      blockAt(player.dimension, x, y, z).setType("minecraft:lava");
    }
    player.teleport(position());
    return { ...motionFixture(player), forward: player.getViewDirection() };
  }, (player, fixture) => {
    fixture.closed = true;
    const delta = { x: player.location.x - fixture.motion.start.x, z: player.location.z - fixture.motion.start.z };
    const forward = delta.x * fixture.forward.x + delta.z * fixture.forward.z;
    return { passed: !fixture.motion.error && fixture.motion.lavaSamples >= 10 && forward > 0.25,
      observed: { ...fixture.motion, forward, delta }, expected: "Forward travel in lava with ten lava samples and fire resistance." };
  });

  for (const down of [false, true]) {
    define(down ? "bubble-column-down" : "bubble-column-up", "fluids", async (player) => {
      await prepareArena(player);
      for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) {
        blockAt(player.dimension, x, -4, z).setType(down ? "minecraft:magma" : "minecraft:soul_sand");
        for (let y = -3; y <= 2; y++) blockAt(player.dimension, x, y, z).setType("minecraft:water");
      }
      await new Promise<void>((resolve) => system.runTimeout(resolve, 40));
      player.teleport(position(0.5, 0, 0.5));
      return motionFixture(player);
    }, (player, fixture) => {
      fixture.closed = true;
      const delta = player.location.y - fixture.motion.start.y;
      return { passed: !fixture.motion.error && fixture.motion.bubbleSamples >= 10 && (down ? delta < -0.5 : delta > 0.5),
        observed: { ...fixture.motion, delta }, expected: "An idle player moves in the column's direction with ten bubble-column samples." };
    });
  }

  for (const [id, small, mode] of [["fireball-hit", false, "hit"], ["fireball-dodge", false, "dodge"],
    ["fireball-reflect", false, "reflect"], ["small-fireball-hit", true, "hit"], ["small-fireball-dodge", true, "dodge"]] as const) {
    define(id, "combat", async (player) => {
      await prepareArena(player);
      player.runCommand("difficulty normal");
      for (let x = -8; x <= 8; x++) for (let z = -8; z <= 14; z++) {
        blockAt(player.dimension, x, -1, z).setType("minecraft:stone");
        for (let y = 0; y <= 5; y++) blockAt(player.dimension, x, y, z).setType("minecraft:air");
      }
      player.teleport(position(), { rotation: { x: 0, y: 0 } });
      const health = player.getComponent("minecraft:health")?.currentValue;
      if (health === undefined) throw new Error("Player health is unavailable.");
      const incoming: IncomingProjectileObservation = { playerId: player.id, shooterId: "", type: small ? "minecraft:small_fireball" : "minecraft:fireball",
        start: { ...player.location }, end: { ...player.location }, forward: player.getViewDirection(), healthBefore: health, healthAfter: health,
        playerBounds: player.getAABB(),
        frames: [], attacks: [], hits: [], damage: [] };
      return { incoming, closed: false as boolean, projectile: undefined as Entity | undefined, shooter: undefined as Entity | undefined };
    }, (player, fixture) => {
      fixture.closed = true;
      fixture.incoming.end = { ...player.location };
      fixture.incoming.healthAfter = player.getComponent("minecraft:health")?.currentValue ?? 0;
      return { passed: incomingProjectilePasses(mode, fixture.incoming), observed: fixture.incoming,
        expected: mode === "hit" ? "A genuine incoming projectile hits and damages the player."
          : mode === "dodge" ? "The player moves aside, the projectile passes the original position, and the player takes no damage."
          : "A player attack reverses the incoming projectile and changes its owner without damaging the player." };
    }, async (player, fixture) => {
      const shooter = player.dimension.spawnEntity(small ? "minecraft:blaze" : "minecraft:ghast", position(0.5, small ? 0 : -1, 12.5));
      tagEntity(shooter);
      shooter.addEffect("slowness", 400, { amplifier: 255, showParticles: false });
      fixture.shooter = shooter;
      fixture.incoming.shooterId = shooter.id;
      if (small) shooter.triggerEvent("switch_to_ranged");
      // Wait for the actual shot, so HUD loading time cannot consume the dodge window.
      for (let tick = 0; tick < 400; tick++) {
        if (getActive()?.fixture !== fixture || fixture.closed) throw new Error("The projectile fixture was replaced.");
        if (fixture.incoming.error) throw new Error(fixture.incoming.error);
        if (fixture.incoming.projectileId) return;
        await new Promise<void>((resolve) => system.runTimeout(resolve, 1));
      }
      fixture.closed = true;
      shooter.remove();
      throw new Error("The native shooter did not produce a projectile on a collision course within twenty seconds.");
    });
  }

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
