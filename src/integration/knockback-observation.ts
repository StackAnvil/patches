import { rangedObservationPasses, type RangedObservation } from "./ranged-observation.ts";

interface Vector {
  x: number;
  y: number;
  z: number;
}

export interface KnockbackImpulse {
  tick: number;
  position: Vector;
  force: Vector;
  velocityBefore: Vector;
  velocityAfter: Vector;
}

export interface KnockbackFrame {
  tick: number;
  position: Vector;
  velocity: Vector;
  onGround: boolean;
}

/** Require displacement during charging, rather than an impulse after the shot. */
export function rangedKnockbackPasses(mode: "release" | "fire" | "cancel", ranged: RangedObservation,
  impulse: KnockbackImpulse | undefined, frames: readonly KnockbackFrame[]): boolean {
  if (!rangedObservationPasses(mode, ranged) || !impulse || !Number.isInteger(impulse.tick)
      || [impulse.position, impulse.force, impulse.velocityBefore, impulse.velocityAfter]
        .some((vector) => ![vector.x, vector.y, vector.z].every(Number.isFinite))) return false;
  const start = ranged.events.find((event) => event.action === "start")!;
  const endTick = mode === "cancel"
    ? ranged.slots?.find((entry) => entry.slot === 1 && entry.tick > start.tick)?.tick
    : ranged.events.find((event) => event.action === (mode === "release" ? "release" : "complete")
      && event.tick > start.tick)?.tick;
  const horizontal = Math.hypot(impulse.force.x, impulse.force.z);
  if (endTick === undefined || !Number.isInteger(endTick) || impulse.tick <= start.tick || impulse.tick >= endTick
      || horizontal <= 0 || impulse.force.y <= 0) return false;
  // A prior stop/release/completion cannot count as charging through the impulse.
  const interrupted = ranged.events.find((event) => ["stop", "release", "complete"].includes(event.action)
    && event.tick >= start.tick && event.tick < endTick);
  if (interrupted) return false;
  return frames.some((frame) => Number.isInteger(frame.tick) && frame.tick > impulse.tick && frame.tick < endTick
    && !frame.onGround && [frame.position, frame.velocity].every((vector) => [vector.x, vector.y, vector.z].every(Number.isFinite))
    && frame.position.y > impulse.position.y + 0.05
    && ((frame.position.x - impulse.position.x) * impulse.force.x
      + (frame.position.z - impulse.position.z) * impulse.force.z) / horizontal > 0.05);
}
