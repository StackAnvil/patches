import { expect, spyOn, test } from "bun:test";
import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  cachedGeyserArtifact,
  geyserConfig,
  geyserEntityUpdatesMatch,
} from "../src/integration/geyser.ts";
import { connectionFailure, joinedPlayer, waitForJoin } from "../src/integration/join.ts";
import { runGameplayCases, waitForGameplayEvent } from "../src/integration/gameplay-probe.ts";
import { expectRejection } from "./helpers/expect-rejection.ts";

test("Geyser joins and disconnects use the Java backend log, including colored names", async () => {
  const player = ".Bedrock_Tester";
  const joined = `[12:00:00 INFO]: \x1b[93m${player} joined the game\x1b[0m`;
  expect(joinedPlayer("java-geyser", joined)).toBe(player);
  expect(
    connectionFailure(
      "java-geyser",
      player,
      `${joined}\n[12:00:01 INFO]: other_player lost connection: Disconnected`,
    ),
  ).toBeUndefined();
  expect(
    connectionFailure(
      "java-geyser",
      player,
      `${joined}\n[12:00:01 INFO]: ${player} lost connection: Disconnected`,
    ),
  ).toBeDefined();
  let polls = 0;
  await expectRejection(
    waitForJoin({
      route: "java-geyser",
      timeoutMs: 100,
      dwellMs: 50,
      pollMs: 1,
      serverLog: () =>
        Promise.resolve(
          ++polls > 1
            ? `${joined}\n[12:00:01 INFO]: ${player} lost connection: Disconnected`
            : joined,
        ),
      clientLog: () => Promise.resolve(""),
      clientAlive: () => true,
    }),
  );
});

test("negative controls require an assertion failure and reject pass or command errors", async () => {
  const event = { id: "chest-transfer", run: "control", phase: "verify", tick: 1 };
  const output = (status: string) =>
    `[ViaBedrock Gameplay Probe] ${JSON.stringify({ ...event, status })}`;
  const control = (status: string) =>
    waitForGameplayEvent(
      "chest-transfer",
      "control",
      "verify",
      () => Promise.resolve(output(status)),
      () => true,
      100,
      1,
      "fail",
    );
  expect(await control("fail")).toMatchObject({ status: "fail" });
  await expectRejection(control("pass"));
  await expectRejection(control("error"));
});

test("a disconnected client stops gameplay and records untouched cases as skipped", async () => {
  const dir = await mkdtemp(join(tmpdir(), "stackanvil-geyser-"));
  const server = spawn(process.execPath, ["-e", "await Bun.stdin.text()"], {
    stdio: ["pipe", "ignore", "ignore"],
  });
  const closed = new Promise<void>((resolve) => {
    server.once("close", () => resolve());
  });
  const commands = spyOn(server.stdin, "write");
  let inputs = 0;
  try {
    const serverLog = join(dir, "server.log");
    await writeFile(serverLog, "");
    await expectRejection(
      runGameplayCases(["custom-entity-attack", "complex-world", "chest-transfer"], {
        server,
        serverLog,
        clientAlive: () => true,
        artifactDir: dir,
        ui: () => {
          inputs++;
          return Promise.resolve("");
        },
        connectionError: () => Promise.resolve("The proxy disconnected the client."),
      }),
      "1/1 attempted gameplay cases failed; 2 skipped",
    );
    const results = JSON.parse(await readFile(join(dir, "gameplay-results.json"), "utf8"));
    expect(
      results.map(({ id, status }: { id: string; status: string }) => ({ id, status })),
    ).toEqual([
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

test("fixture downloads replace a truncated cached artifact and reject corrupted bytes", async () => {
  const dir = await mkdtemp(join(tmpdir(), "stackanvil-geyser-cache-"));
  const bytes = new Uint8Array([1, 2, 3, 4]);
  const pin = { url: "https://example.invalid/geyser.jar", sha256: createHash("sha256").update(bytes).digest("hex") };
  const file = join(dir, `geyser-${pin.sha256}.jar`);
  let body = bytes;
  let downloads = 0;
  const download = (async () => {
    downloads++;
    return new Response(body);
  }) as unknown as typeof fetch;
  try {
    await writeFile(file, bytes.subarray(0, 2));
    expect(await cachedGeyserArtifact(file, pin, download)).toBe(file);
    expect(new Uint8Array(await readFile(file))).toEqual(bytes);
    await cachedGeyserArtifact(file, pin, download);
    expect(downloads).toBe(1);
    await rm(file);
    body = new Uint8Array([1, 2, 7, 4]);
    await expectRejection(cachedGeyserArtifact(file, pin, download), "checksum mismatch");
    expect(await Bun.file(file).exists()).toBe(false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("Geyser rejects invalid ports before creating a server configuration", () => {
  for (const port of [0, -1, 65536, 1.5, NaN]) expect(() => geyserConfig(port)).toThrow();
});

test("custom entity checks require the correct actor and changed property", () => {
  const uuid = randomUUID();
  const log = `[StackAnvil Geyser Probe] entity=${uuid} phase=1 health=0.8`;
  expect(geyserEntityUpdatesMatch("custom-entity-interact", { uuid, phase: 1 }, log)).toBe(true);
  expect(
    geyserEntityUpdatesMatch("custom-entity-interact", { uuid: randomUUID(), phase: 1 }, log),
  ).toBe(false);
  expect(geyserEntityUpdatesMatch("custom-entity-interact", { uuid, phase: 0 }, log)).toBe(false);
  expect(geyserEntityUpdatesMatch("custom-entity-attack", { uuid, health: 16 }, log)).toBe(true);
  expect(geyserEntityUpdatesMatch("custom-entity-attack", { uuid, health: 20 }, log)).toBe(false);
});

test("stress checks require repeated phase updates for every fixture entity", () => {
  const entityIds = Array.from({ length: 24 }, () => randomUUID());
  const records = entityIds.map((uuid) =>
    [0, 1]
      .map((phase) => `[StackAnvil Geyser Probe] entity=${uuid} phase=${phase} health=1.0`)
      .join("\n"),
  );
  expect(geyserEntityUpdatesMatch("complex-world", { entityIds }, records.join("\n"))).toBe(true);
  expect(
    geyserEntityUpdatesMatch("complex-world", { entityIds }, records.slice(1).join("\n")),
  ).toBe(false);
  expect(
    geyserEntityUpdatesMatch(
      "complex-world",
      { entityIds: Array(24).fill(entityIds[0]) },
      records.join("\n"),
    ),
  ).toBe(false);
});
