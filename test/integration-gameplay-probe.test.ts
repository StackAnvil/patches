import { expect, test } from "bun:test";
import { gameplayEvents, gameplayCasesForBackend, minecartDismountHasClearance, waitForGameplayEvent, waitForJavaWorldHud, type GameplayEvent } from "../src/integration/gameplay-probe.ts";

test("gameplay events match their case, run, and phase", async () => {
  const log = [
    '[ViaBedrock Gameplay Probe] {"id":"block-break","run":"old","phase":"verify","status":"pass","tick":1}',
    '[ViaBedrock Gameplay Probe] {"id":"block-break","run":"new","phase":"prepare","status":"ready","tick":2}',
    '[ViaBedrock Gameplay Probe] {"id":"block-break","run":"new","phase":"start","status":"ready","tick":3}',
    '[ViaBedrock Gameplay Probe] {"id":"block-break","run":"new","phase":"verify","status":"fail","tick":4,"observed":{"typeId":"minecraft:dirt"},"expected":"minecraft:air"}',
  ].join("\n");

  expect(gameplayEvents(log)).toHaveLength(4);
  await expect(waitForGameplayEvent("block-break", "new", "prepare", async () => log, () => true, 10, 1))
    .resolves.toMatchObject({ status: "ready", tick: 2 });
  await expect(waitForGameplayEvent("block-break", "new", "start", async () => log, () => true, 10, 1))
    .resolves.toMatchObject({ status: "ready", tick: 3 });
  await expect(waitForGameplayEvent("block-break", "new", "verify", async () => log, () => true, 10, 1))
    .rejects.toThrow("minecraft:dirt");
});

test("a stopped client fails a pending gameplay case", async () => {
  await expect(waitForGameplayEvent("movement-left", "run", "verify", async () => "", () => false, 10, 1))
    .rejects.toThrow("stopped");
});

test("a failed projectile startup retains its authoritative evidence in the error cause", async () => {
  const bounds = { center: { x: 0, y: 1, z: 0 }, extent: { x: 0.3, y: 0.9, z: 0.3 } };
  const event: GameplayEvent = { id: "small-fireball-hit", run: "probe", phase: "start", status: "error", tick: 400,
    projectileStartup: { shooterId: "shooter", playerBounds: bounds, launches: [
      { tick: 100, bounds, velocity: { x: 1, y: 0, z: 0 }, owner: "shooter", accepted: false },
    ] } };
  for (const status of ["error", "fail", "pass"] as const) {
    const result = { ...event, status };
    const log = `[ViaBedrock Gameplay Probe] ${JSON.stringify(result)}`;
    const error = await waitForGameplayEvent("small-fireball-hit", event.run, "start", async () => log, () => true, 10, 1)
      .then(() => undefined, (error: unknown) => error);
    expect(error).toBeInstanceOf(Error);
    expect(JSON.parse(JSON.stringify((error as Error).cause))).toEqual(result);
  }
});

test("minecart dismount remains near the rail height and within the track", () => {
  const observed = { fromStart: 22.2, player: { y: 250 }, dismountPosition: { y: 250.15 } };
  expect(minecartDismountHasClearance(observed)).toBe(true);
  expect(minecartDismountHasClearance({ ...observed, player: { y: 249.2 } })).toBe(false);
  expect(minecartDismountHasClearance({ ...observed, dismountPosition: { y: 249.2 } })).toBe(false);
  expect(minecartDismountHasClearance({ ...observed, fromStart: 29 })).toBe(false);
  expect(minecartDismountHasClearance(null)).toBe(false);
});

test("world readiness waits for the drawn HUD instead of accepting a dimension loading screen", async () => {
  const hud = new Map([["248,436", "246 246 246"], ["248,438", "161 178 157"], ["244,448", "213 232 208"]]);
  let samples = 0;
  await waitForJavaWorldHud(async (args) => {
    if (args[1] === "list") return JSON.stringify([{ title: "Minecraft 26.3", width: 854, height: 480 }]);
    const index = samples++;
    const x = Math.floor(Number(args[2]) * 853);
    const y = Math.floor(Number(args[3]) * 479);
    return index < 3 ? "100 13 202" : hud.get(`${x},${y}`) ?? "0 0 0";
  }, () => true, 100, 1);
  expect(samples).toBe(30);
});

test("a hotbar selection left by cancellation is still a visible world HUD", async () => {
  for (const slot of [1, 8]) {
    const hud = new Map([[`${248 + slot * 40},436`, "246 246 246"],
      [`${248 + slot * 40},438`, "161 178 157"], [`${244 + slot * 40},448`, "213 232 208"]]);
    await waitForJavaWorldHud(async (args) => {
      if (args[1] === "list") return JSON.stringify([{ title: "Minecraft 26.3", width: 854, height: 480 }]);
      return hud.get(`${Math.floor(Number(args[2]) * 853)},${Math.floor(Number(args[3]) * 479)}`) ?? "0 0 0";
    }, () => true, 100, 1);
  }
});

test("world readiness fails if the client stops or never draws its HUD", async () => {
  const ui = async (args: string[]) => args[1] === "list"
    ? JSON.stringify([{ title: "Minecraft 26.3", width: 854, height: 480 }]) : "100 13 202";
  await expect(waitForJavaWorldHud(ui, () => false, 100, 1)).rejects.toThrow("stopped");
  await expect(waitForJavaWorldHud(ui, () => true, 5, 1)).rejects.toThrow("did not become visible");
});

test("native item eligibility and delivered Geyser offhand snapshots select distinct cases", () => {
  expect(gameplayCasesForBackend(false)).toContain("offhand-ineligible-block");
  expect(gameplayCasesForBackend(false)).not.toContain("offhand-block-place");
  expect(gameplayCasesForBackend(true)).toContain("offhand-block-place");
  expect(gameplayCasesForBackend(true)).not.toContain("offhand-ineligible-block");
});
