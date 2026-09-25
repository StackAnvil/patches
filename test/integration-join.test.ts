import { expect, test } from "bun:test";
import { joinedPlayer, waitForJoin } from "../src/integration/join.ts";

test("join parser requires a completed player spawn", () => {
  expect(joinedPlayer("java-java", "AlexProgrammerDE joined the game")).toBe("AlexProgrammerDE");
  expect(joinedPlayer("java-bedrock", "Player connected: AlexProgrammerDE")).toBeUndefined();
  expect(joinedPlayer("bedrock-bedrock", "Player Spawned: AlexProgrammerDE xuid: 123")).toBe("AlexProgrammerDE");
  expect(joinedPlayer("bedrock-bedrock", "Player Spawned: Bedrock Tester xuid: 123")).toBe("Bedrock Tester");
});

test("a crash after joining fails the stability check", async () => {
  let polls = 0;
  let joined = false;
  await expect(waitForJoin({
    route: "java-java", timeoutMs: 1000, dwellMs: 100, pollMs: 1,
    serverLog: async () => "AlexProgrammerDE joined the game",
    clientLog: async () => ++polls > 1 ? "ClassCastException: renderer state" : "",
    clientAlive: () => true,
    onJoin: () => { joined = true; },
  })).rejects.toThrow();
  expect(joined).toBe(true);
});

test("a Bedrock disconnect before the dwell period fails", async () => {
  let polls = 0;
  let joined = false;
  await expect(waitForJoin({
    route: "bedrock-bedrock", timeoutMs: 1000, dwellMs: 100, pollMs: 1,
    serverLog: async () => ++polls > 1
      ? "Player Spawned: AlexProgrammerDE xuid: 123\nPlayer disconnected: AlexProgrammerDE"
      : "Player Spawned: AlexProgrammerDE xuid: 123",
    clientLog: async () => "", clientAlive: () => true,
    onJoin: () => { joined = true; },
  })).rejects.toThrow();
  expect(joined).toBe(true);
});
