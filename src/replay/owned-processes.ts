import { readFileSync, readdirSync } from "node:fs";

export interface ProcessIdentity {
  pid: number;
  startTicks: string;
}
export interface ProcessEntry extends ProcessIdentity {
  parent: number;
}
interface ProcessSystem {
  read: (pid: number) => ProcessEntry | undefined;
  ids: () => number[];
  signal: (pid: number, signal: NodeJS.Signals) => void;
}

function entry(pid: number): ProcessEntry | undefined {
  try {
    const value = readFileSync(`/proc/${pid}/stat`, "utf8");
    const fields = value.slice(value.lastIndexOf(")") + 2).split(" ");
    if (fields[0] === "Z") return undefined;
    return { pid, parent: Number(fields[1]), startTicks: fields[19]! };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT" || (error as NodeJS.ErrnoException).code === "ESRCH") return undefined;
    throw error;
  }
}

/** Records real process birth identities and refuses signals after PID reuse. */
export class OwnedProcesses {
  private readonly identities = new Map<number, ProcessIdentity>();
  private readonly excluded = new Set<number>();

  constructor(private readonly system: ProcessSystem = {
    read: entry,
    ids: () => readdirSync("/proc").filter(name => /^\d+$/.test(name)).map(Number),
    signal: (pid, signal) => process.kill(pid, signal),
  }) {}

  exclude(pid: number): void {
    this.excluded.add(pid);
    this.identities.delete(pid);
  }

  owns(pid: number): boolean {
    return this.identities.has(pid) && this.alive(pid);
  }

  capture(pid: number): ProcessIdentity {
    const current = this.system.read(pid);
    if (!current) throw new Error("Owned process exited before its identity was captured.");
    const saved = this.identities.get(pid);
    if (saved && saved.startTicks !== current.startTicks) throw new Error("Owned PID was reused.");
    const identity = { pid, startTicks: current.startTicks };
    this.identities.set(pid, identity);
    return identity;
  }

  captureDescendants(): void {
    const entries = this.system.ids().flatMap(pid => {
      const value = this.system.read(pid);
      return value ? [value] : [];
    });
    const owned = new Set([...this.identities.values()].filter(identity => this.system.read(identity.pid)?.startTicks === identity.startTicks).map(identity => identity.pid));
    let changed = true;
    while (changed) {
      changed = false;
      for (const process of entries) {
        if (!this.excluded.has(process.pid) && !owned.has(process.pid) && owned.has(process.parent)) {
          const current = this.system.read(process.pid);
          if (!current || current.startTicks !== process.startTicks || current.parent !== process.parent) continue;
          const saved = this.identities.get(process.pid);
          if (saved && saved.startTicks !== current.startTicks) throw new Error("Owned descendant PID was reused.");
          this.identities.set(process.pid, { pid: process.pid, startTicks: current.startTicks });
          owned.add(process.pid);
          changed = true;
        }
      }
    }
  }

  alive(pid: number): boolean {
    const saved = this.identities.get(pid);
    if (!saved) throw new Error("Unrecorded process identity.");
    const current = this.system.read(pid);
    if (!current) return false;
    if (current.startTicks !== saved.startTicks) throw new Error("Owned PID changed; signal refused.");
    return true;
  }

  signal(pid: number, signal: NodeJS.Signals): void {
    if (this.alive(pid)) this.system.signal(pid, signal);
  }

  all(): ProcessIdentity[] {
    return [...this.identities.values()];
  }
}

/** Verify the saved null-sink module ID using pactl's explicit short-format columns. */
export function requireOwnedSilentModule(output: string, id: number): void {
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("Invalid owned audio module ID.");
  const matches = output.split("\n").map(line => line.split("\t")).filter(fields => fields[0] === String(id));
  if (matches.length !== 1 || matches[0]![1] !== "module-null-sink"
    || matches[0]![2] !== "sink_name=stackanvil_silent sink_properties=device.description=StackAnvil-Silent") {
    throw new Error("Owned audio module identity changed; unload refused.");
  }
}
