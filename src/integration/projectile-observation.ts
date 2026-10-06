interface Vector { x: number; y: number; z: number }
interface Bounds { center: Vector; extent: Vector }
interface Plane { point: Vector; normal: Vector }
const validVector = (vector: Vector) => [vector.x, vector.y, vector.z].every(Number.isFinite);
const validBounds = (bounds: Bounds) => [bounds.center, bounds.extent].every(validVector)
  && [bounds.extent.x, bounds.extent.y, bounds.extent.z].every(value => value >= 0);

function contactTime(target: Bounds, projectile: Bounds, velocity: Vector): number | undefined {
  let enter = 0;
  let exit = Infinity;
  for (const axis of ["x", "y", "z"] as const) {
    const distance = projectile.center[axis] - target.center[axis];
    const extent = target.extent[axis] + projectile.extent[axis];
    const speed = velocity[axis];
    if (speed === 0) {
      if (Math.abs(distance) > extent) return;
      continue;
    }
    const first = (-extent - distance) / speed;
    const last = (extent - distance) / speed;
    enter = Math.max(enter, Math.min(first, last));
    exit = Math.min(exit, Math.max(first, last));
    if (enter > exit) return;
  }
  return Number.isFinite(enter) && Number.isFinite(exit) && exit > 0 ? enter : undefined;
}

/** Linear collision course with clear flight to the target and optional pass plane. */
export function projectileThreatens(target: Bounds, projectile: Bounds, velocity: Vector,
  obstacles: readonly Bounds[] = [], clearancePlane?: Plane): boolean {
  if (!validVector(velocity) || ![target, projectile, ...obstacles].every(validBounds)) return false;
  const targetTime = contactTime(target, projectile, velocity);
  if (targetTime === undefined) return false;
  let throughTime = targetTime;
  if (clearancePlane) {
    if (![clearancePlane.point, clearancePlane.normal].every(validVector)) return false;
    const normal = clearancePlane.normal;
    const speed = velocity.x * normal.x + velocity.y * normal.y + velocity.z * normal.z;
    const distance = (clearancePlane.point.x - projectile.center.x) * normal.x
      + (clearancePlane.point.y - projectile.center.y) * normal.y
      + (clearancePlane.point.z - projectile.center.z) * normal.z;
    const planeTime = distance / speed;
    if (speed >= 0 || !Number.isFinite(planeTime) || planeTime < 0) return false;
    throughTime = Math.max(throughTime, planeTime);
  }
  return obstacles.every(obstacle => {
    const obstacleTime = contactTime(obstacle, projectile, velocity);
    return obstacleTime === undefined || obstacleTime > throughTime;
  });
}

export interface IncomingProjectileObservation {
  playerId: string;
  shooterId: string;
  type: string;
  start: Vector;
  forward: Vector;
  playerBounds: Bounds;
  collisionObstacles?: Bounds[];
  clearancePlane?: Plane;
  projectileExtent?: Vector;
  healthBefore: number;
  healthAfter: number;
  end: Vector;
  projectileId?: string;
  launchedTick?: number;
  launches?: { tick: number; bounds: Bounds; velocity: Vector; owner?: string; accepted: boolean }[];
  frames: { tick: number; position: Vector; velocity: Vector; owner?: string }[];
  playerFrames: { tick: number; position: Vector; velocity: Vector }[];
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
    { center: first.position, extent: observation.projectileExtent }, first.velocity,
    observation.collisionObstacles, observation.clearancePlane)) return false;
  const hitPlayer = observation.hits.some((hit) => hit.projectile === projectileId && hit.target === observation.playerId
    && hit.tick >= launchedTick);
  const damaged = observation.damage.some((event) => event.tick >= launchedTick && event.amount > 0);
  if (mode === "hit") return hitPlayer && healthAfter < healthBefore
    && observation.damage.some((event) => event.tick >= launchedTick && event.amount > 0 && event.projectile === projectileId);
  if (hitPlayer || damaged || healthAfter < healthBefore) return false;
  if (mode === "dodge") {
    const lateral = Math.abs((end.x - start.x) * -forward.z + (end.z - start.z) * forward.x);
    const passed = frames.find((frame) => along(frame.position) < -1);
    if (!passed || lateral <= 1 || observation.playerFrames.length < 2
        || observation.playerFrames.some((frame, index) => !validVector(frame.position) || !validVector(frame.velocity)
          || !Number.isInteger(frame.tick) || frame.tick < launchedTick
          || (index > 0 && frame.tick <= observation.playerFrames[index - 1]!.tick))) return false;
    return observation.playerFrames.some((frame) => frame.tick <= passed.tick
      && Math.abs((frame.position.x - start.x) * -forward.z + (frame.position.z - start.z) * forward.x) > 1);
  }
  const attack = observation.attacks.find((event) => event.player === observation.playerId
    && event.target === projectileId && event.tick >= launchedTick);
  return !!attack && frames.some((frame) => frame.tick >= attack.tick && frame.owner === observation.playerId
    && toward(frame.velocity) > 0);
}
