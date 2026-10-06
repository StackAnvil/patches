export const complexGameplayCaseIds = [
  "bow-release", "bow-cancel", "bow-no-ammo", "crossbow-load", "crossbow-retain", "crossbow-fire",
  "splash-potion-throw", "lingering-potion-throw", "powder-snow-sink", "powder-snow-boots",
  "water-forward", "creative-flight-ascend",
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
  error?: string;
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
    case "cancel": return !!started && remainingCount === initialCount && projectiles.length === 0;
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
