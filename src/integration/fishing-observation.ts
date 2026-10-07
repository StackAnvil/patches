interface Vector3 { x: number; y: number; z: number }

export interface FishingObservation {
  uses: number[];
  hooks: { id: string; spawned: number; removed?: number }[];
  remainingHooks: string[];
  rodCount: number;
  rodDamage: number;
  rewards: number;
  target?: { id: string; valid: boolean; healthBefore: number; healthAfter: number;
    frames: { tick: number; position: Vector3; velocity: Vector3; player: Vector3 }[] };
  error?: string;
}

/** Require genuine cast/reel lifetime and target BDS inventory and motion outcomes. */
export function fishingRetrievalPasses(mode: "early" | "entity", observation: FishingObservation): boolean {
  if (observation.error || observation.uses.length !== 2 || observation.hooks.length !== 1
      || observation.remainingHooks.length || observation.rodCount !== 1 || observation.rewards !== 0
      || observation.rodDamage !== (mode === "entity" ? 3 : 0)) return false;
  const [cast, reel] = observation.uses;
  const hook = observation.hooks[0]!;
  const removed = hook.removed;
  if (removed === undefined || ![cast, reel, hook.spawned, removed].every((tick) => Number.isInteger(tick) && tick >= 0)
      || !hook.id || reel <= cast || Math.abs(hook.spawned - cast) > 1
      || removed < reel || removed - reel > 2) return false;
  if (mode === "early") return reel - cast <= 20 && !observation.target;

  const target = observation.target;
  if (!target?.id || !target.valid || !Number.isFinite(target.healthBefore) || target.healthBefore <= 0
      || target.healthAfter !== target.healthBefore) return false;
  if (target.frames.some((frame) => !Number.isInteger(frame.tick)
      || [frame.position, frame.velocity, frame.player].some((vector) => !Object.values(vector).every(Number.isFinite)))) return false;
  if (target.frames.some((frame, index) => index > 0 && frame.tick <= target.frames[index - 1]!.tick)) return false;
  const before = target.frames.findLast((frame) => frame.tick < reel);
  if (!before || reel - before.tick > 2 || Math.hypot(before.velocity.x, before.velocity.z) > 0.025) return false;
  const toward = { x: before.player.x - before.position.x, z: before.player.z - before.position.z };
  const distance = Math.hypot(toward.x, toward.z);
  if (distance <= 1) return false;
  const after = target.frames.filter((frame) => frame.tick >= reel && frame.tick <= reel + 12);
  return after.some((frame) => (frame.velocity.x * toward.x + frame.velocity.z * toward.z) / distance > 0.05
      && frame.velocity.y > 0.02)
    && after.some((frame) => ((frame.position.x - before.position.x) * toward.x
      + (frame.position.z - before.position.z) * toward.z) / distance > 0.2);
}
