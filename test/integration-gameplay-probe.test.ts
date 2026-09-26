import { expect, test } from "bun:test";
import { gameplayEvents, waitForGameplayEvent } from "../src/integration/gameplay-probe.ts";

test("gameplay events match their case, run, and phase", async () => {
  const log = [
    '[ViaBedrock Gameplay Probe] {"id":"block-break","run":"old","phase":"verify","status":"pass","tick":1}',
    '[ViaBedrock Gameplay Probe] {"id":"block-break","run":"new","phase":"prepare","status":"ready","tick":2}',
    '[ViaBedrock Gameplay Probe] {"id":"block-break","run":"new","phase":"verify","status":"fail","tick":3,"observed":{"typeId":"minecraft:dirt"},"expected":"minecraft:air"}',
  ].join("\n");

  expect(gameplayEvents(log)).toHaveLength(3);
  await expect(waitForGameplayEvent("block-break", "new", "prepare", async () => log, () => true, 10, 1))
    .resolves.toMatchObject({ status: "ready", tick: 2 });
  await expect(waitForGameplayEvent("block-break", "new", "verify", async () => log, () => true, 10, 1))
    .rejects.toThrow("minecraft:dirt");
});

test("a stopped client fails a pending gameplay case", async () => {
  await expect(waitForGameplayEvent("movement-left", "run", "verify", async () => "", () => false, 10, 1))
    .rejects.toThrow("stopped");
});
