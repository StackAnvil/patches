import { createConnection } from "node:net";

/** One connection per operation. QMP events can arrive between replies. */
export async function withQmp<T>(path: string, operation: (command: QmpCommand) => Promise<T>, timeoutMs = 5000): Promise<T> {
  const socket = createConnection(path);
  socket.setEncoding("utf8");
  let buffer = "";
  let nextId = 0;
  let failure: Error | undefined;
  const pending = new Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void }>();
  let greet!: () => void;
  let rejectGreeting!: (error: Error) => void;
  const greeting = new Promise<void>((resolve, reject) => { greet = resolve; rejectGreeting = reject; });
  const fail = (error: Error) => {
    failure = error;
    rejectGreeting(error);
    for (const request of pending.values()) request.reject(error);
    pending.clear();
    socket.destroy();
  };
  socket.setTimeout(timeoutMs, () => fail(new Error("QMP timed out. The guest was left running.")));
  socket.on("error", fail);
  socket.on("end", () => fail(new Error("QMP disconnected.")));
  socket.on("data", (data) => {
    buffer += data;
    if (buffer.length > 1024 * 1024) { fail(new Error("QMP reply exceeds the size limit.")); return; }
    let newline: number;
    while ((newline = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (!line) continue;
      try {
        const message = JSON.parse(line) as { QMP?: unknown; id?: number; return?: unknown; error?: { desc?: string } };
        if (message.QMP) greet();
        if (message.id === undefined) continue;
        const request = pending.get(message.id);
        if (!request) continue;
        pending.delete(message.id);
        if (message.error) request.reject(new Error(message.error.desc ?? "QMP rejected the command."));
        else request.resolve(message.return);
      } catch (cause) { fail(new Error("Invalid QMP reply.", { cause })); return; }
    }
  });
  const command: QmpCommand = (execute, args) => new Promise((resolve, reject) => {
    if (failure) { reject(failure); return; }
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.write(`${JSON.stringify({ execute, arguments: args, id })}\n`);
  });
  const deadline = setTimeout(() => fail(new Error("QMP operation timed out. The guest was left running.")), timeoutMs);
  try {
    await greeting;
    await command("qmp_capabilities");
    return await operation(command);
  } finally { clearTimeout(deadline); socket.destroy(); }
}

export type QmpCommand = (execute: string, args?: Record<string, unknown>) => Promise<unknown>;

export function withNamedQmp<T>(path: string, name: string, operation: (command: QmpCommand) => Promise<T>): Promise<T> {
  return withQmp(path, async (command) => {
    const identity = await command("query-name") as { name?: string };
    if (identity.name !== name) throw new Error("QMP VM identity does not match this lab profile. No guest action was sent.");
    return operation(command);
  });
}

export function keyEvents(chord: string): Record<string, unknown>[] {
  const keys = chord.split("+");
  if (!keys.length || keys.some((key) => !/^[a-z0-9][a-z0-9_-]*$/.test(key))) {
    throw new Error("Use QEMU key names, such as ret, esc, or ctrl+alt+delete.");
  }
  return keys.map((key) => ({ type: "qcode", data: key }));
}

export function pointerEvents(x: number, y: number, button: string): Record<string, unknown>[] {
  if (![x, y].every((value) => Number.isFinite(value) && value >= 0 && value <= 1)) {
    throw new Error("Pointer coordinates must be fractions from 0 to 1.");
  }
  if (button !== "left" && button !== "right" && button !== "middle") throw new Error("Use left, right, or middle.");
  return [
    { type: "abs", data: { axis: "x", value: Math.round(x * 32767) } },
    { type: "abs", data: { axis: "y", value: Math.round(y * 32767) } },
    { type: "btn", data: { button, down: true } },
  ];
}

export async function clickPointer(command: QmpCommand, x: number, y: number, button: string, holdMs = 100): Promise<void> {
  validateHoldMs(holdMs);
  await command("input-send-event", { events: pointerEvents(x, y, button) });
  try {
    // Guests can sample input once per frame and miss an immediate press/release.
    await new Promise<void>((resolve) => setTimeout(resolve, holdMs));
  } finally {
    await command("input-send-event", { events: [{ type: "btn", data: { button, down: false } }] });
  }
}

export function validateHoldMs(holdMs: number): void {
  if (!Number.isInteger(holdMs) || holdMs < 1 || holdMs > 2000) {
    throw new Error("Input hold time must be an integer from 1 to 2000 milliseconds.");
  }
}
