export const complexGameplayCaseIds = [
  "bow-release", "bow-cancel", "bow-no-ammo", "crossbow-load", "crossbow-retain", "crossbow-fire",
  "splash-potion-throw", "lingering-potion-throw", "powder-snow-sink", "powder-snow-boots",
  "water-forward", "creative-flight-ascend",
  "bow-short-release", "bow-water-release", "crossbow-cancel", "crossbow-no-ammo",
  "splash-potion-speed", "lingering-potion-slowness",
  "fireball-hit", "fireball-dodge", "fireball-reflect", "small-fireball-hit", "small-fireball-dodge",
  "water-current", "lava-forward", "bubble-column-up", "bubble-column-down",
  "bow-hit", "crossbow-hit",
] as const;

export type RangedAction = "start" | "release" | "complete" | "stop" | "use";
export interface RangedObservation {
  item: string;
  ammunition: string;
  initialCount: number;
  remainingCount: number;
  events: { action: RangedAction; tick: number; remainingUseTicks?: number }[];
  slots?: { slot: number; tick: number }[];
  projectiles: { id: string; tick: number; type: string; speed: number }[];
  impacts?: { id: string; tick: number; location: { x: number; y: number; z: number }; target?: string }[];
  effects?: { tick: number; type: string; amplifier: number; duration: number }[];
  clouds?: { id: string; tick: number; location: { x: number; y: number; z: number } }[];
  target?: { id: string; healthBefore: number; healthAfter: number; damage: { tick: number; amount: number; projectile?: string }[] };
  error?: string;
}

export function rangedHitPasses(mode: "release" | "fire", observation: RangedObservation): boolean {
  if (!rangedObservationPasses(mode, observation)) return false;
  const shot = observation.projectiles[0]!;
  const target = observation.target;
  return !!target && Number.isFinite(target.healthBefore) && Number.isFinite(target.healthAfter)
    && target.healthBefore > 0 && target.healthAfter >= 0 && target.healthAfter < target.healthBefore
    && !!observation.impacts?.some((hit) => hit.id === shot.id && hit.target === target.id && hit.tick >= shot.tick)
    && target.damage.some((event) => event.projectile === shot.id && event.amount > 0 && event.tick >= shot.tick);
}

export function potionImpactPasses(observation: RangedObservation, effect: string, lingering: boolean): boolean {
  if (!rangedObservationPasses("throw", observation)) return false;
  const projectile = observation.projectiles[0]!;
  const impact = observation.impacts?.find((hit) => hit.id === projectile.id && Number.isInteger(hit.tick) && hit.tick >= projectile.tick);
  if (!impact) return false;
  const applied = observation.effects?.find((entry) => entry.type === effect && Number.isInteger(entry.tick) && entry.tick >= impact.tick
    && Number.isFinite(entry.duration) && entry.duration > 0 && entry.amplifier === 0);
  if (!applied) return false;
  return !lingering || !!observation.clouds?.some((cloud) => cloud.id && Number.isInteger(cloud.tick) && cloud.tick >= impact.tick
    && Math.hypot(cloud.location.x - impact.location.x, cloud.location.y - impact.location.y,
      cloud.location.z - impact.location.z) < 4);
}

/** A server observation contract, without assuming Java's charge or damage formulas. */
export function rangedObservationPasses(mode: "release" | "cancel" | "empty" | "load" | "fire" | "retain" | "throw",
  observation: RangedObservation): boolean {
  const { initialCount, remainingCount, events, projectiles, error } = observation;
  if (error || !Number.isInteger(initialCount) || !Number.isInteger(remainingCount)
    || initialCount < 0 || remainingCount < 0 || remainingCount > initialCount
    || events.some((event) => !Number.isInteger(event.tick) || event.tick < 0)
    || projectiles.some((projectile) => !projectile.id || !Number.isInteger(projectile.tick)
      || projectile.tick < 0 || !Number.isFinite(projectile.speed) || projectile.speed <= 0)
    || new Set(projectiles.map((projectile) => projectile.id)).size !== projectiles.length) return false;
  const started = events.find((event) => event.action === "start");
  const released = started && events.find((event) => event.action === "release" && event.tick > started.tick);
  const completed = started && events.find((event) => event.action === "complete" && event.tick > started.tick);
  const used = events.find((event) => event.action === "use");
  const expectedType = mode === "throw" ? observation.item : "minecraft:arrow";
  const oneProjectileAfter = (tick: number) => projectiles.length === 1
    && projectiles[0]!.type === expectedType && projectiles[0]!.tick >= tick;
  switch (mode) {
    case "empty": return initialCount === 0 && remainingCount === 0 && projectiles.length === 0;
    case "cancel": return !!started && !completed && remainingCount === initialCount && projectiles.length === 0
      && !!observation.slots?.some((entry) => entry.slot === 1 && entry.tick > started.tick);
    case "load": return !!completed && initialCount - remainingCount === 1 && projectiles.length === 0;
    case "fire": return !!completed && initialCount - remainingCount === 1 && oneProjectileAfter(completed.tick);
    case "retain": {
      if (!completed || initialCount - remainingCount !== 1 || !oneProjectileAfter(completed.tick)) return false;
      const away = observation.slots?.find((entry) => entry.slot === 1 && entry.tick > completed.tick);
      const back = away && observation.slots?.find((entry) => entry.slot === 0 && entry.tick > away.tick);
      return !!back && projectiles[0]!.tick >= back.tick;
    }
    case "release": return !!released && initialCount - remainingCount === 1 && oneProjectileAfter(released.tick);
    case "throw": return !!used && initialCount - remainingCount === 1 && oneProjectileAfter(used.tick);
  }
}
