interface Vector { x: number; y: number; z: number }
interface Bounds { center: Vector; extent: Vector }
const validVector = (vector: Vector) => [vector.x, vector.y, vector.z].every(Number.isFinite);

/** Linear collision-course check using the server's actual collision bounds. */
export function projectileThreatens(target: Bounds, projectile: Bounds, velocity: Vector): boolean {
  if (![target.center, target.extent, projectile.center, projectile.extent, velocity].every(validVector)
    || [target.extent, projectile.extent].some((extent) => [extent.x, extent.y, extent.z].some((value) => value < 0))) return false;
  let enter = 0;
  let exit = Infinity;
  for (const axis of ["x", "y", "z"] as const) {
    const distance = projectile.center[axis] - target.center[axis];
    const extent = target.extent[axis] + projectile.extent[axis];
    const speed = velocity[axis];
    if (speed === 0) {
      if (Math.abs(distance) > extent) return false;
      continue;
    }
    const first = (-extent - distance) / speed;
    const last = (extent - distance) / speed;
    enter = Math.max(enter, Math.min(first, last));
    exit = Math.min(exit, Math.max(first, last));
    if (enter > exit) return false;
  }
  return Number.isFinite(enter) && Number.isFinite(exit) && exit > 0;
}

export interface IncomingProjectileObservation {
  playerId: string;
  shooterId: string;
  type: string;
  start: Vector;
  forward: Vector;
  playerBounds: Bounds;
  projectileExtent?: Vector;
  healthBefore: number;
  healthAfter: number;
  end: Vector;
  projectileId?: string;
  launchedTick?: number;
  frames: { tick: number; position: Vector; velocity: Vector; owner?: string }[];
  attacks: { tick: number; player: string; target: string }[];
  hits: { tick: number; projectile: string; target: string }[];
  damage: { tick: number; amount: number; projectile?: string }[];
  error?: string;
}

/** Require a witnessed incoming shot; an idle client cannot pass the dodge control. */
export function incomingProjectilePasses(mode: "hit" | "dodge" | "reflect", observation: IncomingProjectileObservation): boolean {
  const { projectileId, launchedTick, frames, healthBefore, healthAfter, start, end, forward } = observation;
  if (observation.error || !projectileId || launchedTick === undefined || !Number.isInteger(launchedTick)
    || !Number.isFinite(healthBefore) || !Number.isFinite(healthAfter) || healthBefore <= 0 || healthAfter <= 0
    || ![start, end, forward].every(validVector) || frames.length < 2
    || frames.some((frame, index) => !validVector(frame.position) || !validVector(frame.velocity)
      || !Number.isInteger(frame.tick) || frame.tick < launchedTick || (index > 0 && frame.tick <= frames[index - 1]!.tick))) return false;
  const along = (position: Vector) => (position.x - start.x) * forward.x + (position.z - start.z) * forward.z;
  const toward = (velocity: Vector) => velocity.x * forward.x + velocity.z * forward.z;
  const first = frames[0]!;
  if (first.owner !== observation.shooterId || along(first.position) <= 1 || toward(first.velocity) >= 0) return false;
  if (!observation.projectileExtent || !projectileThreatens(observation.playerBounds,
    { center: first.position, extent: observation.projectileExtent }, first.velocity)) return false;
  const hitPlayer = observation.hits.some((hit) => hit.projectile === projectileId && hit.target === observation.playerId
    && hit.tick >= launchedTick);
  const damaged = observation.damage.some((event) => event.tick >= launchedTick && event.amount > 0);
  if (mode === "hit") return hitPlayer && healthAfter < healthBefore
    && observation.damage.some((event) => event.tick >= launchedTick && event.amount > 0 && event.projectile === projectileId);
  if (hitPlayer || damaged || healthAfter < healthBefore) return false;
  if (mode === "dodge") {
    const lateral = Math.abs((end.x - start.x) * -forward.z + (end.z - start.z) * forward.x);
    return lateral > 1 && frames.some((frame) => along(frame.position) < -1);
  }
  const attack = observation.attacks.find((event) => event.player === observation.playerId
    && event.target === projectileId && event.tick >= launchedTick);
  return !!attack && frames.some((frame) => frame.tick >= attack.tick && frame.owner === observation.playerId
    && toward(frame.velocity) > 0);
}
