export const complexGameplayCaseIds = [
  "bow-release", "bow-cancel", "bow-no-ammo", "crossbow-load", "crossbow-retain", "crossbow-fire",
  "splash-potion-throw", "lingering-potion-throw", "powder-snow-sink", "powder-snow-boots",
  "water-forward", "creative-flight-ascend",
  "bow-short-release", "bow-water-release", "crossbow-cancel", "crossbow-no-ammo",
  "splash-potion-speed", "lingering-potion-slowness",
  "fireball-hit", "fireball-dodge", "fireball-reflect", "small-fireball-hit", "small-fireball-dodge",
  "water-current", "lava-forward", "bubble-column-up", "bubble-column-down",
  "bow-hit", "crossbow-hit",
  "bow-infinity", "bow-infinity-no-ammo", "crossbow-multishot",
  "crossbow-quick-charge-1", "crossbow-quick-charge-2", "crossbow-quick-charge-3",
  "crossbow-piercing-0", "crossbow-piercing-1", "crossbow-piercing-4",
  "bow-knockback-release", "bow-knockback-cancel", "crossbow-knockback-fire", "crossbow-knockback-cancel",
  "bow-server-slot-use", "crossbow-server-slot-use",
] as const;

export type RangedAction = "start" | "release" | "complete" | "stop" | "use";
export interface RangedExpectation {
  consumed?: number;
  projectileCount?: number;
  minChargeTicks?: number;
  maxChargeTicks?: number;
}
export interface RangedTarget {
  id: string;
  healthBefore: number;
  healthAfter: number;
  damage: { tick: number; amount: number; projectile?: string }[];
}
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
  target?: RangedTarget;
  targets?: RangedTarget[];
  error?: string;
}

export interface ServerSlotUse {
  pending: boolean;
  selection?: { tick: number; from: number; to: number };
  followup: RangedObservation;
}

/** A forced switch must cancel charging and preserve use of the newly selected stack. */
export function serverSlotUsePasses(ranged: RangedObservation, switched: ServerSlotUse | undefined): boolean {
  if (!switched?.selection || !rangedObservationPasses("cancel", ranged)
      || !rangedObservationPasses("throw", switched.followup)) return false;
  const selection = switched.selection;
  const start = ranged.events.find((event) => event.action === "start")!;
  const use = switched.followup.events.find((event) => event.action === "use")!;
  return Number.isInteger(selection.tick) && selection.tick > start.tick
    && selection.from === 0 && selection.to === 1 && use.tick > selection.tick
    && !!ranged.slots?.some((entry) => entry.slot === 1 && entry.tick >= selection.tick && entry.tick <= use.tick);
}

/** One arrow must hit the ordered chain and leave the next target untouched. */
export function rangedPiercingPasses(observation: RangedObservation, hitCount: number): boolean {
  if (!Number.isInteger(hitCount) || hitCount < 1 || !rangedObservationPasses("fire", observation)) return false;
  const targets = observation.targets;
  if (!targets || targets.length !== hitCount + 1 || new Set(targets.map((target) => target.id)).size !== targets.length) return false;
  const shot = observation.projectiles[0]!;
  let previousTick = shot.tick;
  for (const [index, target] of targets.entries()) {
    if (!target.id || !Number.isFinite(target.healthBefore) || !Number.isFinite(target.healthAfter)
        || target.healthBefore <= 0 || target.healthAfter < 0) return false;
    const contacts = observation.impacts?.filter((impact) => impact.target === target.id) ?? [];
    if (index === hitCount) {
      if (contacts.length || target.damage.length || target.healthBefore !== target.healthAfter) return false;
      continue;
    }
    if (contacts.length !== 1 || target.damage.length !== 1 || target.healthAfter >= target.healthBefore) return false;
    const contact = contacts[0]!;
    const damage = target.damage[0]!;
    if (contact.id !== shot.id || !Number.isInteger(contact.tick) || contact.tick < previousTick
        || damage.projectile !== shot.id || !Number.isInteger(damage.tick) || damage.tick < shot.tick
        || !Number.isFinite(damage.amount) || damage.amount <= 0) return false;
    previousTick = contact.tick;
  }
  return true;
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
  observation: RangedObservation, expectation: RangedExpectation = {}): boolean {
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
  const consumed = expectation.consumed ?? 1;
  const projectileCount = expectation.projectileCount ?? 1;
  if (!Number.isInteger(consumed) || consumed < 0 || !Number.isInteger(projectileCount) || projectileCount < 1
    || [expectation.minChargeTicks, expectation.maxChargeTicks].some((ticks) => ticks !== undefined && (!Number.isInteger(ticks) || ticks < 1))
    || (expectation.minChargeTicks !== undefined && expectation.maxChargeTicks !== undefined && expectation.minChargeTicks > expectation.maxChargeTicks)) return false;
  const expectedType = mode === "throw" ? observation.item : "minecraft:arrow";
  const projectilesAfter = (tick: number) => projectiles.length === projectileCount
    && projectiles.every((projectile) => projectile.type === expectedType && projectile.tick >= tick)
    && Math.max(...projectiles.map((projectile) => projectile.tick)) - Math.min(...projectiles.map((projectile) => projectile.tick)) <= 1;
  const chargePasses = (end: { tick: number } | undefined): end is { tick: number } => !!end && !!started
    && (expectation.minChargeTicks === undefined || end.tick - started.tick >= expectation.minChargeTicks)
    && (expectation.maxChargeTicks === undefined || end.tick - started.tick <= expectation.maxChargeTicks);
  const ammunitionPasses = initialCount > 0 && initialCount - remainingCount === consumed;
  switch (mode) {
    case "empty": return initialCount === 0 && remainingCount === 0 && projectiles.length === 0;
    case "cancel": return !!started && !completed && remainingCount === initialCount && projectiles.length === 0
      && !!observation.slots?.some((entry) => entry.slot === 1 && entry.tick > started.tick);
    case "load": return chargePasses(completed) && ammunitionPasses && projectiles.length === 0;
    case "fire": return chargePasses(completed) && ammunitionPasses && projectilesAfter(completed.tick);
    case "retain": {
      if (!chargePasses(completed) || !ammunitionPasses || !projectilesAfter(completed.tick)) return false;
      const away = observation.slots?.find((entry) => entry.slot === 1 && entry.tick > completed.tick);
      const back = away && observation.slots?.find((entry) => entry.slot === 0 && entry.tick > away.tick);
      return !!back && projectiles.every((projectile) => projectile.tick >= back.tick);
    }
    case "release": return chargePasses(released) && ammunitionPasses && projectilesAfter(released.tick);
    case "throw": return !!used && ammunitionPasses && projectilesAfter(used.tick);
  }
}
