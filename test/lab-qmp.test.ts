import { expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer, type Socket } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clickPointer, withNamedQmp, withQmp } from "../src/lab/qmp.ts";

async function fixture(reply: (socket: Socket, request: { execute: string; id: number }) => void, operation: (path: string) => Promise<void>) {
  const directory = await mkdtemp(join(tmpdir(), "sa-qmp-"));
  const path = join(directory, "qmp.socket");
  const sockets = new Set<Socket>();
  const server = createServer((socket) => {
    sockets.add(socket);
    socket.on("error", () => {});
    socket.on("close", () => sockets.delete(socket));
    socket.write('{"QMP":');
    setTimeout(() => socket.write('{} }\r\n'), 5);
    let buffer = "";
    socket.on("data", (data) => {
      buffer += data.toString();
      let newline: number;
      while ((newline = buffer.indexOf("\n")) >= 0) {
        const request = JSON.parse(buffer.slice(0, newline));
        buffer = buffer.slice(newline + 1);
        reply(socket, request);
      }
    });
  });
  await new Promise<void>((resolve, reject) => { server.once("error", reject); server.listen(path, resolve); });
  try { await operation(path); } finally {
    for (const socket of sockets) socket.destroy();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await rm(directory, { recursive: true, force: true });
  }
}

test("QMP handles fragmented greeting, interleaved events, and replies to concurrent requests", async () => {
  const received: number[] = [];
  await fixture((socket, request) => {
    received.push(request.id);
    socket.write(JSON.stringify({ event: "RESUME" }) + "\n");
    const reply = JSON.stringify({ id: request.id, return: { request: request.id } }) + "\r\n";
    socket.write(reply.slice(0, 5));
    socket.write(reply.slice(5));
  }, async (path) => {
    const result = await withQmp(path, async (command) => Promise.all([command("query-status"), command("query-name")]));
    expect(received).toEqual([1, 2, 3]);
    expect(result).toEqual([{ request: 2 }, { request: 3 }]);
  });
});

test("QMP surfaces command rejection and times out without sending a shutdown", async () => {
  await fixture((socket, request) => socket.write(JSON.stringify({ id: request.id, error: { desc: "unsupported" } }) + "\n"),
    async (path) => { await expect(withQmp(path, async () => undefined)).rejects.toBeInstanceOf(Error); });
  let commands = 0;
  await fixture(() => { commands++; }, async (path) => {
    await expect(withQmp(path, async () => undefined, 30)).rejects.toBeInstanceOf(Error);
    expect(commands).toBe(1);
  });
});

test("guest identity mismatch blocks the operation before input or shutdown", async () => {
  let commands = 0;
  let actions = 0;
  await fixture((socket, request) => {
    commands++;
    socket.write(JSON.stringify({ id: request.id, return: { name: "other-guest" } }) + "\n");
  }, async (path) => {
    await expect(withNamedQmp(path, "owned-guest", async () => { actions++; })).rejects.toBeInstanceOf(Error);
    expect(commands).toBe(2);
    expect(actions).toBe(0);
  });
});

test("guest clicks settle the cursor before holding the button across sampling frames", async () => {
  let movedAt = 0;
  const events: { down: boolean; time: number }[] = [];
  await fixture((socket, request) => {
    const args = (request as { arguments?: { events?: { type: string; data: { down?: boolean } }[] } }).arguments;
    for (const event of args?.events ?? []) {
      if (event.type === "abs") movedAt = performance.now();
      if (event.type === "btn") events.push({ down: event.data.down!, time: performance.now() });
    }
    socket.write(JSON.stringify({ id: request.id, return: {} }) + "\n");
  }, async (path) => {
    await withQmp(path, (command) => clickPointer(command, 0.5, 0.5, "left", 150));
  });
  expect(events.map((event) => event.down)).toEqual([true, false]);
  expect(events[0]!.time - movedAt).toBeGreaterThanOrEqual(90);
  expect(events[1]!.time - events[0]!.time).toBeGreaterThanOrEqual(140);
});

test("invalid click durations leave the button untouched", async () => {
  let calls = 0;
  for (const duration of [0, 2001, 1.5, NaN, Infinity]) {
    await expect(clickPointer(async () => { calls++; }, 0.5, 0.5, "left", duration)).rejects.toBeInstanceOf(Error);
  }
  expect(calls).toBe(0);
});
