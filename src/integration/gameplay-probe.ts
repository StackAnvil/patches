import type { ChildProcess } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { root } from "../model.ts";

const prefix = "[ViaBedrock Gameplay Probe] ";

export const gameplayCaseIds = [
  "movement-left", "movement-right", "block-break", "block-place", "drop-item", "inventory-script-slot",
  "creative-select", "equip-helmet", "equip-offhand", "eat-golden-apple", "entity-attack", "entity-name",
  "map-hold", "command-time", "command-completion", "command-denied", "respawn", "dimension-change",
  "chest-transfer",
] as const;

export type GameplayCaseId = typeof gameplayCaseIds[number];
export type GameplayPhase = "prepare" | "verify";

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
        && (value.phase === "prepare" || value.phase === "verify") ? [value] : [];
    } catch {
      return [];
    }
  });
}

export async function waitForGameplayEvent(id: GameplayCaseId, run: string, phase: GameplayPhase,
  log: () => Promise<string>, alive: () => boolean, timeoutMs = 20_000, pollMs = 250): Promise<GameplayEvent> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const event = gameplayEvents(await log()).find((entry) => entry.id === id && entry.run === run && entry.phase === phase);
    if (event) {
      if (event.status === "error" || event.status === "fail") {
        throw new Error(`${id} ${phase} ${event.status}: ${event.error ?? JSON.stringify({ observed: event.observed, expected: event.expected })}`);
      }
      if (event.status !== (phase === "prepare" ? "ready" : "pass")) {
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

async function clickGui(ui: Ui, window: { width: number; height: number }, imageWidth: number, imageHeight: number,
  offsetX: number, offsetY: number): Promise<void> {
  const scale = 2;
  const left = (window.width - imageWidth * scale) / 2;
  const top = (window.height - imageHeight * scale) / 2;
  await ui(["ui", "click", String((left + offsetX * scale) / window.width),
    String((top + offsetY * scale) / window.height), "--client", "java"]);
}

async function chestTransfer(ui: Ui): Promise<void> {
  const window = await javaWindow(ui);
  const guiX = (window.width - 176 * 2) / 2 + 20;
  const guiY = (window.height - 168 * 2) / 2 + 20;
  const pixel = async () => (await ui(["ui", "pixel", String(guiX / window.width), String(guiY / window.height), "--client", "java"]))
    .trim().split(/\s+/).map(Number);
  const before = await pixel();
  await uiMouse(ui, "right");
  await Bun.sleep(500);
  const after = await pixel();
  const opened = before.length === 3 && after.length === 3
    && before.some((value, index) => Math.abs(value - after[index]!) > 30);
  if (!opened) {
    throw new Error("The Java chest screen did not open after right click.");
  }
  for (const y of [27, 151]) {
    await clickGui(ui, window, 176, 168, 17, y);
    await Bun.sleep(200);
  }
  await uiKey(ui, "Escape");
}

async function creativeSelect(ui: Ui): Promise<void> {
  await uiKey(ui, "e");
  await Bun.sleep(350);
  const window = await javaWindow(ui);
  await clickGui(ui, window, 195, 136, 175, -16);
  await ui(["ui", "type", "nether star", "--client", "java"]);
  await Bun.sleep(350);
  await clickGui(ui, window, 195, 136, 18, 27);
  await clickGui(ui, window, 195, 136, 18, 121);
  await uiKey(ui, "Escape");
}

export async function driveGameplay(id: GameplayCaseId, ui: Ui): Promise<void> {
  switch (id) {
    case "movement-left":
    case "movement-right":
      await ui(["ui", "key-hold", id === "movement-left" ? "a" : "d", "500", "--client", "java"]);
      return;
    case "block-break":
      await uiMouse(ui, "left", 1200);
      return;
    case "block-place":
    case "equip-helmet":
    case "entity-name":
    case "map-hold":
      await uiMouse(ui, "right");
      return;
    case "chest-transfer":
      await chestTransfer(ui);
      return;
    case "creative-select":
      await creativeSelect(ui);
      return;
    case "eat-golden-apple":
      await uiMouse(ui, "right", 2300);
      return;
    case "equip-offhand":
      await uiKey(ui, "f");
      return;
    case "drop-item":
    case "inventory-script-slot":
      await uiKey(ui, "q");
      return;
    case "entity-attack":
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
  }
}

export async function runGameplayCases(ids: readonly GameplayCaseId[], options: {
  server: ChildProcess;
  serverLog: string;
  clientAlive: () => boolean;
  ui: Ui;
  artifactDir: string;
}): Promise<void> {
  const results: { id: GameplayCaseId; status: "pass" | "fail"; observed?: unknown; error?: string; screenshots: string[] }[] = [];
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
      options.server.stdin?.write(`scriptevent vbprobe:prepare ${id} ${run}\n`);
      await waitForGameplayEvent(id, run, "prepare", log, alive);
      await Bun.sleep(500);
      screenshots.push(await options.ui(["ui", "screenshot", `gameplay-${id}-${run}-before`, "--client", "java",
        "--output-dir", options.artifactDir]));
      await driveGameplay(id, options.ui);
      await Bun.sleep(350);
      screenshots.push(await options.ui(["ui", "screenshot", `gameplay-${id}-${run}-after`, "--client", "java",
        "--output-dir", options.artifactDir]));
      options.server.stdin?.write(`scriptevent vbprobe:verify ${id} ${run}\n`);
      const event = await waitForGameplayEvent(id, run, "verify", log, alive);
      results.push({ id, status: "pass", observed: event.observed, screenshots });
      console.log(`PASS gameplay ${id}: ${JSON.stringify(event.observed)}`);
    } catch (error) {
      const message = String(error);
      if (screenshots.length === 1 && alive()) {
        try {
          screenshots.push(await options.ui(["ui", "screenshot", `gameplay-${id}-${run}-after`, "--client", "java",
            "--output-dir", options.artifactDir]));
        } catch { /* Preserve the original failure. */ }
      }
      results.push({ id, status: "fail", error: message, screenshots });
      console.error(`FAIL gameplay ${id}: ${message}${screenshots.length ? ` Screenshots: ${screenshots.join(", ")}.` : ""}`);
      stopped = !alive();
    }
    await writeFile(join(options.artifactDir, "gameplay-results.json"), `${JSON.stringify(results, null, 2)}\n`);
    if (stopped) break;
  }
  if (results.some((result) => result.status === "fail")) {
    throw new Error(`${results.filter((result) => result.status === "fail").length}/${ids.length} gameplay cases failed. Read ${join(options.artifactDir, "gameplay-results.json")}.`);
  }
}

export async function installProbeGuiScale(instance: string): Promise<void> {
  const file = join(instance, "minecraft", "options.txt");
  let content = await Bun.file(file).exists() ? await Bun.file(file).text() : "";
  content = /^guiScale:.*$/m.test(content) ? content.replace(/^guiScale:.*$/m, "guiScale:2") : `${content}guiScale:2\n`;
  await Bun.write(file, content);
}
