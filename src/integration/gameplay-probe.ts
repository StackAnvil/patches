import type { ChildProcess } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { root } from "../model.ts";
import { geyserCaseIds, geyserNegativeControlIds } from "./geyser.ts";
import { complexGameplayCaseIds } from "./ranged-observation.ts";

const prefix = "[ViaBedrock Gameplay Probe] ";

export const gameplayCaseIds = [
  "movement-left", "movement-right", "block-break", "creative-block-break", "block-place", "tnt-explosion", "water-flow", "drop-item", "inventory-script-slot",
  "creative-select", "creative-replace", "creative-replace-main", "creative-replace-twice", "equip-helmet", "equip-offhand", "offhand-remove", "eat-golden-apple", "entity-attack", "entity-name",
  "map-hold", "command-time", "command-completion", "command-denied", "respawn", "dimension-change",
  "chest-transfer", "chest-rapid-transfer", "chest-pickup-all", "lab-table-then-chest", "chest-boat-transfer", "chest-minecart-transfer", "furnace-quick-move-log", "furnace-quick-move-coal", "enchant-basic",
  "offhand-ineligible-block", "offhand-shield-use", "offhand-elytra-rocket", "mainhand-elytra-rocket", "boat-forward", "minecart-dismount",
  "shield-projectile-baseline", "shield-projectile-block",
  "crafting-manual-sticks", "crafting-book-sticks", "crafting-bulk-sticks",
] as const;

export const allGameplayCaseIds = [...gameplayCaseIds, ...complexGameplayCaseIds, ...geyserCaseIds, "offhand-block-place"] as const;
export type GameplayCaseId = typeof allGameplayCaseIds[number];
export type GameplayPhase = "prepare" | "start" | "verify" | "invalidate";

export function gameplayCasesForBackend(geyser: boolean): GameplayCaseId[] {
  return geyser ? gameplayCaseIds.filter((id) => id !== "lab-table-then-chest")
    .map((id) => id === "offhand-ineligible-block" ? "offhand-block-place" : id) : [...gameplayCaseIds];
}

export interface GameplayEvent {
  id: string;
  run: string;
  phase: GameplayPhase;
  status: "ready" | "pass" | "fail" | "error";
  tick: number;
  group?: string;
  observed?: unknown;
  expected?: unknown;
  error?: string;
}

export function gameplayEvents(log: string): GameplayEvent[] {
  return log.split("\n").flatMap((line) => {
    const marker = line.indexOf(prefix);
    if (marker < 0) return [];
    try {
      const value = JSON.parse(line.slice(marker + prefix.length)) as GameplayEvent;
      return typeof value.id === "string" && typeof value.run === "string"
        && ["prepare", "start", "verify", "invalidate"].includes(value.phase) ? [value] : [];
    } catch {
      return [];
    }
  });
}

export function minecartDismountHasClearance(observed: unknown): boolean {
  if (!observed || typeof observed !== "object") return false;
  const { fromStart, player, dismountPosition } = observed as Record<string, unknown>;
  const playerY = player && typeof player === "object" && "y" in player ? player.y : undefined;
  const cartY = dismountPosition && typeof dismountPosition === "object" && "y" in dismountPosition
    ? dismountPosition.y : undefined;
  if (typeof fromStart !== "number" || !Number.isFinite(fromStart)
    || typeof playerY !== "number" || !Number.isFinite(playerY)
    || typeof cartY !== "number" || !Number.isFinite(cartY)) return false;

  // The probe builds rails over a floor at Y=250, ending 28 blocks from the spawn point.
  return fromStart > 1.5 && fromStart < 27.5
    && cartY >= 250 && cartY <= 250.5
    && playerY >= 249.95 && playerY <= cartY + 1.25;
}

export async function waitForGameplayEvent(id: GameplayCaseId, run: string, phase: GameplayPhase,
  log: () => Promise<string>, alive: () => boolean, timeoutMs = 20_000, pollMs = 250,
  expectedStatus: "pass" | "ready" | "fail" = phase === "verify" ? "pass" : "ready"): Promise<GameplayEvent> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const event = gameplayEvents(await log()).find((entry) => entry.id === id && entry.run === run && entry.phase === phase);
    if (event) {
      if (event.status === "error" || (event.status === "fail" && expectedStatus !== "fail")) {
        throw new Error(`${id} ${phase} ${event.status}: ${event.error ?? JSON.stringify({ observed: event.observed, expected: event.expected })}`);
      }
      if (event.status !== expectedStatus) {
        throw new Error(`${id} ${phase} returned unexpected status ${event.status}.`);
      }
      return event;
    }
    if (!alive()) throw new Error(`A game process stopped during ${id} ${phase}.`);
    await Bun.sleep(pollMs);
  }
  throw new Error(`${id} ${phase} did not finish in ${timeoutMs / 1000}s.`);
}

type Ui = (args: string[]) => Promise<string>;

async function uiKey(ui: Ui, key: string): Promise<void> {
  await ui(["ui", "key-hold", key, "80", "--client", "java"]);
}

async function uiMouse(ui: Ui, button: "left" | "right", durationMs = 150): Promise<void> {
  await ui(["ui", "button-hold", button, String(durationMs), "--client", "java"]);
}

async function javaWindow(ui: Ui): Promise<{ width: number; height: number }> {
  const windows = JSON.parse(await ui(["ui", "list"])) as { title: string; width: number; height: number }[];
  const window = windows.find((entry) => /^minecraft\*?\s/i.test(entry.title));
  if (!window) throw new Error("Java client window is unavailable.");
  return window;
}

/** The probe fixes GUI scale to two. A selected hotbar cell proves the world HUD is drawn. */
export async function waitForJavaWorldHud(ui: Ui, alive: () => boolean, timeoutMs = 20_000, pollMs = 100): Promise<void> {
  const window = await javaWindow(ui);
  const left = (Math.floor(window.width / 2 / 2) - 92) * 2;
  const top = (Math.floor(window.height / 2) - 23) * 2;
  // Opaque pixels from Java 26.3's hotbar_selection sprite. They establish that
  // the actual world HUD is drawn, rather than a dimension loading/menu screen.
  const samples = [
    { x: 3, y: 1, rgb: [246, 246, 246] },
    { x: 3, y: 2, rgb: [161, 178, 157] },
    { x: 1, y: 7, rgb: [213, 232, 208] },
  ];
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!alive()) throw new Error("A game process stopped before Java's world HUD became visible.");
    for (let slot = 0; slot < 9; slot++) {
      const pixels = await Promise.all(samples.map(async ({ x, y }) => (await ui([
        "ui", "pixel", String((left + (slot * 20 + x) * 2 + 0.5) / (window.width - 1)), String((top + y * 2 + 0.5) / (window.height - 1)), "--client", "java",
      ])).trim().split(/\s+/).map(Number)));
      if (pixels.every((pixel, index) => pixel.length === 3
        && pixel.every((channel, channelIndex) => Math.abs(channel - samples[index]!.rgb[channelIndex]!) <= 2))) return;
    }
    await Bun.sleep(pollMs);
  }
  throw new Error(`Java's world HUD did not become visible within ${timeoutMs / 1000}s.`);
}

async function javaDeathScreenVisible(ui: Ui): Promise<boolean> {
  const pixel = async (x: number, y: number) => (await ui([
    "ui", "pixel", String(x), String(y), "--client", "java",
  ])).trim().split(/\s+/).map(Number);
  const heading = await pixel(0.5, 0.275);
  const button = await pixel(0.5, 0.59);
  return heading.length === 3 && heading.every((channel) => channel >= 240)
    && button.length === 3 && button.every((channel) => channel >= 40 && channel <= 130)
    && Math.max(...button) - Math.min(...button) <= 4;
}

async function respawnJavaClient(ui: Ui): Promise<void> {
  if (!await javaDeathScreenVisible(ui)) return;
  await ui(["ui", "click", "0.5", "0.59", "left", "--client", "java"]);
  for (let attempt = 0; attempt < 10; attempt++) {
    await Bun.sleep(500);
    if (!await javaDeathScreenVisible(ui)) return;
  }
  throw new Error("Java client remained on the death screen after clicking Respawn.");
}

async function clickGui(ui: Ui, window: { width: number; height: number }, imageWidth: number, imageHeight: number,
  offsetX: number, offsetY: number, button: "left" | "right" = "left", doubleClick = false): Promise<void> {
  const scale = 2;
  const left = (window.width - imageWidth * scale) / 2;
  const top = (window.height - imageHeight * scale) / 2;
  await ui(["ui", doubleClick ? "double-click" : "click", String((left + offsetX * scale) / window.width),
    String((top + offsetY * scale) / window.height), button, "--client", "java"]);
}

async function craftSticksManually(ui: Ui): Promise<void> {
  await uiMouse(ui, "right");
  await Bun.sleep(500);
  await ui(["ui", "screenshot", "crafting-manual-open", "--client", "java", "--output-dir", join(root, ".stackanvil", "integration")]);
  const window = await javaWindow(ui);
  await clickGui(ui, window, 176, 166, 16, 150);
  await Bun.sleep(500);
  await ui(["ui", "screenshot", "crafting-manual-picked", "--client", "java", "--output-dir", join(root, ".stackanvil", "integration")]);
  await clickGui(ui, window, 176, 166, 38, 26, "right");
  await Bun.sleep(500);
  await clickGui(ui, window, 176, 166, 38, 44, "right");
  await ui(["ui", "screenshot", "crafting-manual-grid", "--client", "java", "--output-dir", join(root, ".stackanvil", "integration")]);
  await Bun.sleep(300);
  await clickGui(ui, window, 176, 166, 132, 44);
  await ui(["ui", "screenshot", "crafting-manual-output", "--client", "java", "--output-dir", join(root, ".stackanvil", "integration")]);
  await clickGui(ui, window, 176, 166, 34, 150);
  await uiKey(ui, "Escape");
}

async function craftSticksInBulk(ui: Ui): Promise<void> {
  await uiMouse(ui, "right");
  await Bun.sleep(500);
  const window = await javaWindow(ui);
  await clickGui(ui, window, 176, 166, 16, 150);
  for (const y of [26, 44]) {
    for (let count = 0; count < 4; count++) {
      await clickGui(ui, window, 176, 166, 38, y, "right");
      await Bun.sleep(150);
    }
  }
  await Bun.sleep(350);
  await Promise.all([
    ui(["ui", "key-hold", "Shift_L", "800", "--client", "java"]),
    (async () => { await Bun.sleep(200); await clickGui(ui, window, 176, 166, 132, 44); })(),
  ]);
  await Bun.sleep(500);
  await uiKey(ui, "Escape");
}

async function removeOffhandToInventory(ui: Ui): Promise<void> {
  await uiKey(ui, "e");
  await Bun.sleep(350);
  const window = await javaWindow(ui);
  await clickGui(ui, window, 176, 166, 85, 70);
  await Bun.sleep(350);
  await ui(["ui", "screenshot", "offhand-remove-cursor", "--client", "java", "--output-dir", join(root, ".stackanvil", "integration")]);
  await clickGui(ui, window, 176, 166, 16, 92);
  await Bun.sleep(500);
  await uiKey(ui, "Escape");
}

async function rejectIneligibleOffhandBlock(ui: Ui): Promise<void> {
  const window = await javaWindow(ui);
  const slots = [[80, 65], [85, 70], [90, 75], [11, 145], [16, 150], [21, 155],
    [150, 15], [150, 162], [10, 162]] as const;
  const readSlots = () => Promise.all(slots.map(async ([x, y]) => {
    const left = (window.width - 176 * 2) / 2;
    const top = (window.height - 166 * 2) / 2;
    return (await ui(["ui", "pixel", String((left + x * 2 + 0.5) / (window.width - 1)),
      String((top + y * 2 + 0.5) / (window.height - 1)), "--client", "java"])).trim().split(/\s+/).map(Number);
  }));
  await uiKey(ui, "e");
  const deadline = Date.now() + 10_000;
  let baseline: number[][] | undefined;
  while (Date.now() < deadline) {
    const pixels = await readSlots();
    // Observe the actual inventory panel and empty offhand before accepting
    // colored dirt pixels in its main hotbar item as the reference snapshot.
    const visible = pixels.slice(6).every((pixel) => pixel.length === 3
      && pixel.every((channel) => Math.abs(channel - 198) <= 2));
    const empty = pixels.slice(0, 3).every((pixel) => pixel.length === 3
      && Math.max(...pixel) - Math.min(...pixel) <= 2);
    if (visible && empty && pixels.slice(3, 6).some((pixel) => Math.max(...pixel) - Math.min(...pixel) > 15)) {
      baseline = pixels.slice(0, 6);
      break;
    }
    await Bun.sleep(100);
  }
  if (!baseline) throw new Error("Java did not render the fixture's mainhand dirt in its inventory.");
  await uiKey(ui, "Escape");
  await uiKey(ui, "f");
  await uiKey(ui, "e");
  let synchronized = false;
  const syncDeadline = Date.now() + 10_000;
  while (Date.now() < syncDeadline) {
    const pixels = await readSlots();
    const visible = pixels.slice(6).every((pixel) => pixel.length === 3
      && pixel.every((channel) => Math.abs(channel - 198) <= 2));
    if (visible && pixels.slice(0, 6).every((pixel, index) => pixel.length === 3
      && pixel.every((channel, component) => Math.abs(channel - baseline![index]![component]!) <= 2))) {
      synchronized = true;
      break;
    }
    await Bun.sleep(100);
  }
  await uiKey(ui, "Escape");
  if (!synchronized) throw new Error("Java retained a ghost offhand item or lost its mainhand after the rejected swap.");
}

async function openChest(ui: Ui, sneak = false): Promise<{ width: number; height: number }> {
  const window = await javaWindow(ui);
  const left = (window.width - 176 * 2) / 2;
  const top = (window.height - 168 * 2) / 2;
  const screenVisible = async () => {
    // Check blank parts of both the header and footer. The world's color at one
    // pixel can match the panel, especially when looking at a chest boat.
    const pixels = await Promise.all(([[10, 15], [150, 15], [10, 162], [150, 162]] as const).map(async ([x, y]) =>
      (await ui(["ui", "pixel", String((left + x * 2) / window.width),
        String((top + y * 2) / window.height), "--client", "java"]))
        .trim().split(/\s+/).map(Number)));
    return pixels.every((pixel) => pixel.length === 3
      && pixel.every((channel) => Math.abs(channel - 198) <= 2));
  };
  if (sneak) {
    await Promise.all([
      ui(["ui", "key-hold", "Shift_L", "1000", "--client", "java"]),
      (async () => { await Bun.sleep(200); await uiMouse(ui, "right"); })(),
    ]);
  } else {
    await uiMouse(ui, "right");
  }
  await Bun.sleep(500);
  if (!await screenVisible()) {
    throw new Error("The Java chest screen did not open after right click.");
  }
  return window;
}

async function chestTransfer(ui: Ui, sneak = false, slots: readonly number[] = [0]): Promise<void> {
  const window = await openChest(ui, sneak);
  await Promise.all([
    ui(["ui", "key-hold", "Shift_L", "1500", "--client", "java"]),
    (async () => {
      await Bun.sleep(200);
      for (const slot of slots) {
        await clickGui(ui, window, 176, 168, 17 + slot * 18, 27);
      }
    })(),
  ]);
  await Bun.sleep(500);
  await uiKey(ui, "Escape");
}

async function chestPickupAll(ui: Ui): Promise<void> {
  const window = await openChest(ui);
  await clickGui(ui, window, 176, 168, 17, 27, "left", true);
  await Bun.sleep(600);
  await ui(["ui", "screenshot", "chest-pickup-all-collected", "--client", "java", "--output-dir", join(root, ".stackanvil", "integration")]);
  await clickGui(ui, window, 176, 168, 17, 150);
  await Bun.sleep(500);
  await uiKey(ui, "Escape");
}

async function furnaceQuickMove(ui: Ui): Promise<void> {
  await uiMouse(ui, "right");
  await Bun.sleep(500);
  const window = await javaWindow(ui);
  await Promise.all([
    ui(["ui", "key-hold", "Shift_L", "800", "--client", "java"]),
    (async () => { await Bun.sleep(200); await clickGui(ui, window, 176, 166, 16, 150); })(),
  ]);
  await Bun.sleep(500);
  await uiKey(ui, "Escape");
}

async function creativeSelect(ui: Ui, mainInventory = false, itemName = "nether star"): Promise<void> {
  await uiKey(ui, "e");
  await Bun.sleep(350);
  const window = await javaWindow(ui);
  await clickGui(ui, window, 195, 136, 175, -16);
  await ui(["ui", "key", "Control+a", "--client", "java"]);
  await ui(["ui", "type", itemName, "--client", "java"]);
  await Bun.sleep(350);
  await clickGui(ui, window, 195, 136, 18, 27);
  if (mainInventory) {
    await clickGui(ui, window, 195, 136, 182, 150);
    await Bun.sleep(250);
    await clickGui(ui, window, 195, 136, 17, 62);
  } else {
    await clickGui(ui, window, 195, 136, 18, 121);
  }
  await uiKey(ui, "Escape");
}

export async function driveGameplay(id: GameplayCaseId, ui: Ui, start?: () => Promise<void>): Promise<void> {
  switch (id) {
    case "bow-release":
    case "bow-no-ammo":
    case "bow-water-release":
    case "bow-hit":
    case "bow-infinity":
    case "bow-infinity-no-ammo":
    case "bow-knockback-release":
      await uiMouse(ui, "right", 1300);
      await Bun.sleep(300);
      return;
    case "bow-short-release":
      await uiMouse(ui, "right", 250);
      await Bun.sleep(300);
      return;
    case "bow-server-slot-use":
    case "crossbow-server-slot-use":
      await uiMouse(ui, "right", 500);
      await Bun.sleep(350);
      await uiMouse(ui, "right");
      await Bun.sleep(300);
      return;
    case "bow-cancel":
    case "crossbow-cancel":
    case "bow-knockback-cancel":
    case "crossbow-knockback-cancel":
      await Promise.all([
        uiMouse(ui, "right", 1300),
        (async () => { await Bun.sleep(500); await uiKey(ui, "2"); })(),
      ]);
      await Bun.sleep(300);
      return;
    case "crossbow-load":
    case "crossbow-no-ammo":
    case "crossbow-retain":
    case "crossbow-fire":
    case "crossbow-hit":
    case "crossbow-multishot":
    case "crossbow-quick-charge-1":
    case "crossbow-quick-charge-2":
    case "crossbow-quick-charge-3":
    case "crossbow-piercing-0":
    case "crossbow-piercing-1":
    case "crossbow-piercing-4":
    case "crossbow-knockback-fire":
      await uiMouse(ui, "right", 2000);
      await Bun.sleep(300);
      if (id === "crossbow-retain") {
        await uiKey(ui, "2");
        await Bun.sleep(350);
        await uiKey(ui, "1");
        await Bun.sleep(350);
      }
      if (id !== "crossbow-load" && id !== "crossbow-no-ammo") {
        await uiMouse(ui, "right");
        await Bun.sleep(id.startsWith("crossbow-piercing-") ? 1800 : 300);
      }
      return;
    case "splash-potion-throw":
    case "lingering-potion-throw":
      await uiMouse(ui, "right");
      await Bun.sleep(300);
      return;
    case "splash-potion-speed":
    case "lingering-potion-slowness":
      await uiMouse(ui, "right");
      await Bun.sleep(1800);
      return;
    case "powder-snow-sink":
    case "powder-snow-boots":
      await Bun.sleep(1800);
      return;
    case "water-forward":
    case "lava-forward":
      await ui(["ui", "key-hold", "w", "1800", "--client", "java"]);
      return;
    case "water-current":
    case "bubble-column-up":
    case "bubble-column-down":
      await Bun.sleep(1800);
      return;
    case "fireball-hit":
    case "fireball-dodge":
    case "fireball-reflect":
    case "small-fireball-hit":
    case "small-fireball-dodge":
      if (!start) throw new Error("The projectile start event is unavailable.");
      await start();
      if (id.endsWith("dodge")) await ui(["ui", "key-hold", "d", "650", "--client", "java"]);
      if (id === "fireball-reflect") await uiMouse(ui, "left", 3500);
      await Bun.sleep(5000);
      return;
    case "creative-flight-ascend":
      await uiKey(ui, "space");
      await Bun.sleep(100);
      await ui(["ui", "key-hold", "space", "1200", "--client", "java"]);
      await Bun.sleep(350);
      return;
    case "movement-left":
    case "movement-right":
      await ui(["ui", "key-hold", id === "movement-left" ? "a" : "d", "500", "--client", "java"]);
      return;
    case "block-break":
    case "creative-block-break":
    case "custom-block-break":
      await uiMouse(ui, "left", 1200);
      return;
    case "tnt-explosion":
      await uiMouse(ui, "right");
      await Bun.sleep(6500);
      return;
    case "water-flow":
      await uiMouse(ui, "right");
      await Bun.sleep(2500);
      return;
    case "block-place":
    case "custom-block-place":
    case "custom-entity-interact":
    case "offhand-block-place":
    case "equip-helmet":
    case "entity-name":
    case "map-hold":
      await uiMouse(ui, "right");
      return;
    case "offhand-ineligible-block":
      await rejectIneligibleOffhandBlock(ui);
      return;
    case "chest-transfer":
    case "custom-item-transfer":
      await chestTransfer(ui);
      return;
    case "chest-rapid-transfer":
      await chestTransfer(ui, false, [0, 1]);
      return;
    case "chest-pickup-all":
      await chestPickupAll(ui);
      return;
    case "lab-table-then-chest":
      await uiMouse(ui, "right");
      await Bun.sleep(750);
      await chestTransfer(ui);
      return;
    case "chest-boat-transfer":
      await chestTransfer(ui, true);
      return;
    case "chest-minecart-transfer":
      await chestTransfer(ui);
      return;
    case "furnace-quick-move-log":
    case "furnace-quick-move-coal":
      await furnaceQuickMove(ui);
      return;
    case "enchant-basic": {
      await uiMouse(ui, "right");
      await Bun.sleep(600);
      await ui(["ui", "screenshot", "enchant-open", "--client", "java", "--output-dir", join(root, ".stackanvil", "integration")]);
      const window = await javaWindow(ui);
      await clickGui(ui, window, 176, 166, 16, 150);
      await Bun.sleep(500);
      await clickGui(ui, window, 176, 166, 23, 55);
      await Bun.sleep(500);
      await ui(["ui", "screenshot", "enchant-sword", "--client", "java", "--output-dir", join(root, ".stackanvil", "integration")]);
      await clickGui(ui, window, 176, 166, 34, 150);
      await Bun.sleep(500);
      await clickGui(ui, window, 176, 166, 43, 55);
      await Bun.sleep(800);
      await ui(["ui", "screenshot", "enchant-material", "--client", "java", "--output-dir", join(root, ".stackanvil", "integration")]);
      await clickGui(ui, window, 176, 166, 72, 23);
      await Bun.sleep(900);
      await ui(["ui", "screenshot", "enchant-chosen", "--client", "java", "--output-dir", join(root, ".stackanvil", "integration")]);
      await clickGui(ui, window, 176, 166, 23, 55);
      await Bun.sleep(500);
      await clickGui(ui, window, 176, 166, 16, 150);
      await Bun.sleep(500);
      await clickGui(ui, window, 176, 166, 43, 55);
      await Bun.sleep(500);
      await clickGui(ui, window, 176, 166, 34, 150);
      await Bun.sleep(500);
      await uiKey(ui, "Escape");
      return;
    }
    case "crafting-manual-sticks":
      await craftSticksManually(ui);
      return;
    case "crafting-bulk-sticks":
      await craftSticksInBulk(ui);
      return;
    case "crafting-book-sticks":
      await uiMouse(ui, "right");
      await Bun.sleep(500);
      {
        const window = await javaWindow(ui);
        await clickGui(ui, window, 176, 166, 12, 40);
        await Bun.sleep(300);
        await ui(["ui", "click", String((window.width / 2 - 188) / window.width),
          String((window.height / 2 - 126) / window.height), "left", "--client", "java"]);
        await ui(["ui", "type", "stick", "--client", "java"]);
        await Bun.sleep(300);
        await ui(["ui", "screenshot", "crafting-book-filtered", "--client", "java", "--output-dir", join(root, ".stackanvil", "integration")]);
        await ui(["ui", "click", String((window.width / 2 - 273) / window.width),
          String((window.height / 2 - 80) / window.height), "left", "--client", "java"]);
        await Bun.sleep(350);
        await ui(["ui", "screenshot", "crafting-book-selected", "--client", "java", "--output-dir", join(root, ".stackanvil", "integration")]);
        await ui(["ui", "click", String((window.width / 2 + 241) / window.width),
          String((window.height / 2 - 80) / window.height), "left", "--client", "java"]);
        await Bun.sleep(500);
        await ui(["ui", "screenshot", "crafting-book-output", "--client", "java", "--output-dir", join(root, ".stackanvil", "integration")]);
        await ui(["ui", "click", String((window.width / 2 + 45) / window.width),
          String((window.height / 2 + 134) / window.height), "left", "--client", "java"]);
        // Recipe-book visibility persists and shifts the next crafting screen.
        await ui(["ui", "click", String((window.width / 2 + 3) / window.width),
          String((window.height / 2 - 86) / window.height), "left", "--client", "java"]);
        await uiKey(ui, "Escape");
      }
      return;
    case "creative-select":
    case "creative-replace":
      await creativeSelect(ui);
      return;
    case "creative-replace-main":
      await creativeSelect(ui, true);
      return;
    case "creative-replace-twice":
      await creativeSelect(ui);
      await Bun.sleep(800);
      await creativeSelect(ui, false, "ender pearl");
      await Bun.sleep(800);
      return;
    case "eat-golden-apple":
      await uiMouse(ui, "right", 2300);
      return;
    case "offhand-shield-use":
      await uiMouse(ui, "right", 1000);
      return;
    case "shield-projectile-baseline":
      await Bun.sleep(11000);
      return;
    case "shield-projectile-block":
      await uiMouse(ui, "right", 9500);
      return;
    case "offhand-elytra-rocket":
    case "mainhand-elytra-rocket":
      await uiKey(ui, "e");
      await Bun.sleep(300);
      await ui(["ui", "screenshot", "elytra-equipped-before-flight", "--client", "java", "--output-dir", join(root, ".stackanvil", "integration")]);
      await uiKey(ui, "Escape");
      if (!start) throw new Error("The elytra flight start event is unavailable.");
      await start();
      await Bun.sleep(700);
      await uiKey(ui, "space");
      await Bun.sleep(350);
      await uiMouse(ui, "right");
      await Bun.sleep(450);
      return;
    case "boat-forward":
      await ui(["ui", "key-hold", "w", "1800", "--client", "java"]);
      return;
    case "minecart-dismount":
      await Bun.sleep(1800);
      await uiKey(ui, "Shift_L");
      await Bun.sleep(650);
      return;
    case "equip-offhand":
      await uiKey(ui, "f");
      return;
    case "offhand-remove":
      await removeOffhandToInventory(ui);
      return;
    case "drop-item":
    case "inventory-script-slot":
      await uiKey(ui, "q");
      return;
    case "entity-attack":
    case "custom-entity-attack":
      await uiMouse(ui, "left");
      return;
    case "command-time":
    case "command-denied":
      await uiKey(ui, "slash");
      await ui(["ui", "type", "time set day", "--client", "java"]);
      await uiKey(ui, "Return");
      return;
    case "command-completion":
      await uiKey(ui, "slash");
      await ui(["ui", "type", "time se", "--client", "java"]);
      await uiKey(ui, "Tab");
      await ui(["ui", "type", " day", "--client", "java"]);
      await uiKey(ui, "Return");
      return;
    case "respawn":
    case "dimension-change":
      await Bun.sleep(1500);
      return;
    case "complex-world":
      await ui(["ui", "key-hold", "w", "9000", "--client", "java"]);
      return;
  }
}

export async function runGameplayCases(ids: readonly GameplayCaseId[], options: {
  server: ChildProcess;
  serverLog: string;
  clientAlive: () => boolean;
  ui: Ui;
  artifactDir: string;
  negativeControls?: boolean;
  connectionError?: () => Promise<string | undefined>;
  inspectClient?: (id: GameplayCaseId, log: () => Promise<string>, event: GameplayEvent) => Promise<void>;
}): Promise<void> {
  const results: { id: GameplayCaseId; status: "pass" | "fail" | "skip"; observed?: unknown; error?: string; screenshots: string[]; negativeControl?: GameplayEvent }[] = [];
  const serverAlive = () => {
    if (!options.server.pid) return false;
    try { process.kill(options.server.pid, 0); return true; } catch { return false; }
  };
  for (const [index, id] of ids.entries()) {
    const run = `${Date.now().toString(36)}${index.toString(36)}`;
    const logStart = (await readFile(options.serverLog, "utf8")).length;
    const log = async () => (await readFile(options.serverLog, "utf8")).slice(logStart);
    const alive = () => options.clientAlive() && serverAlive();
    const screenshots: string[] = [];
    let stopped = false;
    try {
      const connectionError = await options.connectionError?.();
      if (connectionError) throw new Error(connectionError);
      await respawnJavaClient(options.ui);
      options.server.stdin?.write(`scriptevent vbprobe:prepare ${id} ${run}\n`);
      await waitForGameplayEvent(id, run, "prepare", log, alive);
      await waitForJavaWorldHud(options.ui, alive);
      // Cancellation cases leave another cell selected. Set the input precondition
      // explicitly after the world is visible, rather than treating that as loading.
      await uiKey(options.ui, "1");
      screenshots.push(await options.ui(["ui", "screenshot", `gameplay-${id}-${run}-before`, "--client", "java",
        "--output-dir", options.artifactDir]));
      await driveGameplay(id, options.ui, async () => {
        options.server.stdin?.write(`scriptevent vbprobe:start ${id} ${run}\n`);
        await waitForGameplayEvent(id, run, "start", log, alive, 30_000, 25);
      });
      await Bun.sleep(350);
      screenshots.push(await options.ui(["ui", "screenshot", `gameplay-${id}-${run}-after`, "--client", "java",
        "--output-dir", options.artifactDir]));
      options.server.stdin?.write(`scriptevent vbprobe:verify ${id} ${run}\n`);
      const event = await waitForGameplayEvent(id, run, "verify", log, alive);
      if (id === "minecart-dismount" && !minecartDismountHasClearance(event.observed)) {
        throw new Error(`Minecart dismount left the rail or clipped below its floor: ${JSON.stringify(event.observed)}`);
      }
      await options.inspectClient?.(id, log, event);
      let negativeControl: GameplayEvent | undefined;
      if (options.negativeControls && geyserNegativeControlIds.includes(id as typeof geyserNegativeControlIds[number])) {
        const controlStart = (await readFile(options.serverLog, "utf8")).length;
        const controlLog = async () => (await readFile(options.serverLog, "utf8")).slice(controlStart);
        options.server.stdin?.write(`scriptevent vbprobe:invalidate ${id} ${run}\n`);
        await waitForGameplayEvent(id, run, "invalidate", controlLog, alive);
        options.server.stdin?.write(`scriptevent vbprobe:verify ${id} ${run}\n`);
        negativeControl = await waitForGameplayEvent(id, run, "verify", controlLog, alive, 20_000, 250, "fail");
        console.log(`PASS negative control ${id}: verification rejected the corrupted fixture.`);
      }
      results.push({ id, status: "pass", observed: event.observed, screenshots, negativeControl });
      console.log(`PASS gameplay ${id}: ${JSON.stringify(event.observed)}`);
    } catch (error) {
      const connectionError = await options.connectionError?.();
      const message = connectionError ?? String(error);
      if (screenshots.length < 2 && !connectionError && alive()) {
        try {
          screenshots.push(await options.ui(["ui", "screenshot", `gameplay-${id}-${run}-after`, "--client", "java",
            "--output-dir", options.artifactDir]));
        } catch { /* Preserve the original failure. */ }
      }
      results.push({ id, status: "fail", error: message, screenshots });
      console.error(`FAIL gameplay ${id}: ${message}${screenshots.length ? ` Screenshots: ${screenshots.join(", ")}.` : ""}`);
      stopped = !alive() || Boolean(connectionError);
    }
    if (stopped) {
      for (const pending of ids.slice(index + 1)) results.push({ id: pending, status: "skip",
        error: "The connection or a game process stopped before this case could run.", screenshots: [] });
    }
    await writeFile(join(options.artifactDir, "gameplay-results.json"), `${JSON.stringify(results, null, 2)}\n`);
    if (stopped) break;
  }
  if (results.some((result) => result.status === "fail")) {
    const failed = results.filter((result) => result.status === "fail").length;
    const skipped = results.filter((result) => result.status === "skip").length;
    throw new Error(`${failed}/${results.length - skipped} attempted gameplay cases failed; ${skipped} skipped. Read ${join(options.artifactDir, "gameplay-results.json")}.`);
  }
}

export async function installProbeGuiScale(instance: string): Promise<void> {
  const file = join(instance, "minecraft", "options.txt");
  let content = await Bun.file(file).exists() ? await Bun.file(file).text() : "";
  content = /^guiScale:.*$/m.test(content) ? content.replace(/^guiScale:.*$/m, "guiScale:2") : `${content}guiScale:2\n`;
  await Bun.write(file, content);
}
