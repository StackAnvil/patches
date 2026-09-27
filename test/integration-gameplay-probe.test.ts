import { expect, test } from "bun:test";
import { gameplayEvents, minecartDismountHasClearance, waitForGameplayEvent } from "../src/integration/gameplay-probe.ts";

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

test("minecart dismount remains near the rail height and within the track", () => {
  const observed = { fromStart: 22.2, player: { y: 250 }, dismountPosition: { y: 250.15 } };
  expect(minecartDismountHasClearance(observed)).toBe(true);
  expect(minecartDismountHasClearance({ ...observed, player: { y: 249.2 } })).toBe(false);
  expect(minecartDismountHasClearance({ ...observed, dismountPosition: { y: 249.2 } })).toBe(false);
  expect(minecartDismountHasClearance({ ...observed, fromStart: 29 })).toBe(false);
  expect(minecartDismountHasClearance(null)).toBe(false);
});
