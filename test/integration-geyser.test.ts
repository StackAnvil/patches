import { expect, spyOn, test } from "bun:test";
import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { geyserConfig, geyserEntityUpdatesMatch, verifyGeyserArtifact } from "../src/integration/geyser.ts";
import { connectionFailure, joinedPlayer, waitForJoin } from "../src/integration/join.ts";
import { runGameplayCases, waitForGameplayEvent } from "../src/integration/gameplay-probe.ts";

test("Geyser joins and disconnects use the Java backend log, including colored names", async () => {
  const player = ".Bedrock_Tester";
  const joined = `[12:00:00 INFO]: \x1b[93m${player} joined the game\x1b[0m`;
  expect(joinedPlayer("java-geyser", joined)).toBe(player);
  expect(connectionFailure("java-geyser", player, `${joined}\n[12:00:01 INFO]: other_player lost connection: Disconnected`)).toBeUndefined();
  expect(connectionFailure("java-geyser", player, `${joined}\n[12:00:01 INFO]: ${player} lost connection: Disconnected`)).toBeDefined();
  let polls = 0;
  await expect(waitForJoin({
    route: "java-geyser", timeoutMs: 100, dwellMs: 50, pollMs: 1,
    serverLog: async () => ++polls > 1 ? `${joined}\n[12:00:01 INFO]: ${player} lost connection: Disconnected` : joined,
    clientLog: async () => "", clientAlive: () => true,
  })).rejects.toThrow();
});

test("negative controls require an assertion failure and reject pass or command errors", async () => {
  const event = { id: "chest-transfer", run: "control", phase: "verify", tick: 1 };
  const output = (status: string) => `[ViaBedrock Gameplay Probe] ${JSON.stringify({ ...event, status })}`;
  const control = (status: string) => waitForGameplayEvent("chest-transfer", "control", "verify",
    async () => output(status), () => true, 100, 1, "fail");
  await expect(control("fail")).resolves.toMatchObject({ status: "fail" });
  await expect(control("pass")).rejects.toThrow();
  await expect(control("error")).rejects.toThrow();
});

test("a disconnected client stops gameplay and records untouched cases as skipped", async () => {
  const dir = await mkdtemp(join(tmpdir(), "stackanvil-geyser-"));
  const server = spawn(process.execPath, ["-e", "await Bun.stdin.text()"], { stdio: ["pipe", "ignore", "ignore"] });
  const closed = new Promise<void>((resolve) => server.once("close", () => resolve()));
  const commands = spyOn(server.stdin!, "write");
  let inputs = 0;
  try {
    const serverLog = join(dir, "server.log");
    await writeFile(serverLog, "");
    await expect(runGameplayCases(["custom-entity-attack", "complex-world", "chest-transfer"], {
      server, serverLog, clientAlive: () => true, artifactDir: dir,
      ui: async () => { inputs++; return ""; },
      connectionError: async () => "The proxy disconnected the client.",
    })).rejects.toThrow("1/1 attempted gameplay cases failed; 2 skipped");
    const results = JSON.parse(await readFile(join(dir, "gameplay-results.json"), "utf8"));
    expect(results.map(({ id, status }: { id: string; status: string }) => ({ id, status }))).toEqual([
      { id: "custom-entity-attack", status: "fail" },
      { id: "complex-world", status: "skip" },
      { id: "chest-transfer", status: "skip" },
    ]);
    expect(inputs).toBe(0);
    expect(commands).not.toHaveBeenCalled();
  } finally {
    commands.mockRestore();
    server.kill();
    await closed;
    await rm(dir, { recursive: true, force: true });
  }
});

test("fixture downloads reject corrupted bytes before installation", () => {
  const bytes = new Uint8Array([1, 2, 3, 4]);
  const expected = createHash("sha256").update(bytes).digest("hex");
  expect(() => verifyGeyserArtifact(bytes, expected)).not.toThrow();
  bytes[2] ^= 1;
  expect(() => verifyGeyserArtifact(bytes, expected)).toThrow();
});

test("Geyser rejects invalid ports before creating a server configuration", () => {
  for (const port of [0, -1, 65536, 1.5, NaN]) expect(() => geyserConfig(port)).toThrow();
});

test("custom entity checks require the correct actor and changed property", () => {
  const uuid = randomUUID();
  const log = `[StackAnvil Geyser Probe] entity=${uuid} phase=1 health=0.8`;
  expect(geyserEntityUpdatesMatch("custom-entity-interact", { uuid, phase: 1 }, log)).toBe(true);
  expect(geyserEntityUpdatesMatch("custom-entity-interact", { uuid: randomUUID(), phase: 1 }, log)).toBe(false);
  expect(geyserEntityUpdatesMatch("custom-entity-interact", { uuid, phase: 0 }, log)).toBe(false);
  expect(geyserEntityUpdatesMatch("custom-entity-attack", { uuid, health: 16 }, log)).toBe(true);
  expect(geyserEntityUpdatesMatch("custom-entity-attack", { uuid, health: 20 }, log)).toBe(false);
});

test("stress checks require repeated phase updates for every fixture entity", () => {
  const entityIds = Array.from({ length: 24 }, () => randomUUID());
  const records = entityIds.map((uuid) => [0, 1].map((phase) =>
    `[StackAnvil Geyser Probe] entity=${uuid} phase=${phase} health=1.0`).join("\n"));
  expect(geyserEntityUpdatesMatch("complex-world", { entityIds }, records.join("\n"))).toBe(true);
  expect(geyserEntityUpdatesMatch("complex-world", { entityIds }, records.slice(1).join("\n"))).toBe(false);
  expect(geyserEntityUpdatesMatch("complex-world", { entityIds: Array(24).fill(entityIds[0]) }, records.join("\n"))).toBe(false);
});
