import type { KnockbackFrame } from "./knockback-observation.ts";
import type { RangedAction } from "./ranged-observation.ts";

export interface PlayerUseObservation {
  kind: "pearl-wind" | "food";
  initialFood: number;
  remainingFood: number;
  remainingPearls: number;
  remainingWindCharges: number;
  absorption: number;
  start: { x: number; y: number; z: number };
  events: { item: string; action: RangedAction; tick: number }[];
  impacts: { type: string; tick: number; playerPosition: { x: number; y: number; z: number } }[];
  frames: KnockbackFrame[];
  error?: string;
}

function validFrames(observation: PlayerUseObservation): boolean {
  return (
    !observation.error &&
    [observation.start, ...observation.impacts.map((impact) => impact.playerPosition)].every((v) =>
      [v.x, v.y, v.z].every(Number.isFinite),
    ) &&
    observation.events.every((event) => Number.isInteger(event.tick)) &&
    observation.impacts.every((impact) => Number.isInteger(impact.tick)) &&
    observation.frames.length > 1 &&
    observation.frames.every(
      (frame, index, frames) =>
        Number.isInteger(frame.tick) &&
        (index === 0 || frame.tick === frames[index - 1]!.tick + 1) &&
        [frame.position, frame.velocity].every((v) => [v.x, v.y, v.z].every(Number.isFinite)),
    )
  );
}

/** Require both native uses and impacts, a teleport, a wind jump, then a quiet landing. */
export function pearlWindChargePasses(observation: PlayerUseObservation): boolean {
  if (!validFrames(observation) || observation.kind !== "pearl-wind") return false;
  const uses = observation.events.filter((event) => event.action === "use");
  const [pearl, wind] = uses;
  const pearlHit = observation.impacts.find((impact) => impact.type === "minecraft:ender_pearl");
  const windHit = observation.impacts.find(
    (impact) => impact.type === "minecraft:wind_charge_projectile",
  );
  if (
    uses.length !== 2 ||
    pearl?.item !== "minecraft:ender_pearl" ||
    wind?.item !== "minecraft:wind_charge" ||
    wind.tick <= pearl.tick ||
    wind.tick - pearl.tick > 4 ||
    !pearlHit ||
    !windHit ||
    pearlHit.tick < pearl.tick ||
    windHit.tick < wind.tick ||
    observation.remainingPearls !== 3 ||
    observation.remainingWindCharges !== 3 ||
    Math.hypot(
      pearlHit.playerPosition.x - observation.start.x,
      pearlHit.playerPosition.z - observation.start.z,
    ) < 0.4
  )
    return false;
  const after = observation.frames.filter((frame) => frame.tick >= windHit.tick);
  const tail = after.slice(-20);
  const end = tail.at(-1);
  return (
    !!end &&
    end.tick - windHit.tick >= 80 &&
    after.some((frame) => frame.velocity.y > 0.25 && !frame.onGround) &&
    after.some((frame) => frame.position.y > observation.start.y + 1) &&
    tail.length === 20 &&
    tail.every(
      (frame) =>
        frame.onGround &&
        Math.hypot(
          frame.position.x - end.position.x,
          frame.position.y - end.position.y,
          frame.position.z - end.position.z,
        ) < 0.02,
    )
  );
}

/** A visible eating loop must complete on the server while the player actually moves. */
export function movingFoodUsePasses(observation: PlayerUseObservation): boolean {
  if (!validFrames(observation) || observation.kind !== "food") return false;
  const events = observation.events.filter((event) => event.item === "minecraft:golden_apple");
  const completed = events.filter((event) => event.action === "complete");
  const consumed = observation.initialFood - observation.remainingFood;
  if (
    observation.absorption <= 0 ||
    consumed !== completed.length ||
    (observation.initialFood === 1 ? consumed !== 1 : consumed < 3)
  )
    return false;
  let movedWhileUsing = false;
  let start: number | undefined;
  for (const event of events) {
    if (event.action === "start") start = event.tick;
    else if (event.action === "complete") {
      if (start === undefined || event.tick - start < 30) return false;
      const startTick = start;
      const frames = observation.frames.filter(
        (frame) => frame.tick >= startTick && frame.tick <= event.tick,
      );
      const first = frames[0];
      const last = frames.at(-1);
      if (
        first &&
        last &&
        Math.hypot(last.position.x - first.position.x, last.position.z - first.position.z) > 0.2
      )
        movedWhileUsing = true;
      start = undefined;
    } else if (event.action === "stop" || event.action === "release") start = undefined;
  }
  const lastCompletion = completed.at(-1)!;
  return (
    movedWhileUsing &&
    (observation.initialFood !== 1 ||
      (observation.remainingFood === 0 &&
        observation.frames.at(-1)!.tick - lastCompletion.tick >= 30 &&
        !events.some(
          (event) => ["start", "use"].includes(event.action) && event.tick > lastCompletion.tick,
        )))
  );
}
