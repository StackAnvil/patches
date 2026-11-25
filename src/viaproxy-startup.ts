import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Effect } from "effect";
import { artifact } from "./client-artifacts.ts";
import { tcpPortEffect } from "./integration/ports.ts";
import { print, printError } from "./output.ts";

const loadedMarker = "Finished mapping loading";
const startupTimeoutMs = 180_000;

/**
 * Names the protocols that ViaVersion could not load. ViaVersion keeps running without them, so a
 * mismatched ViaVersion and ViaBackwards build starts fine and only fails when a player joins.
 */
export function protocolLoadFailures(log: string): string[] {
  const names = [...log.matchAll(/Error during loading of (\S+)/gu)].map((match) => match[1]);
  return [...new Set(names.filter((name) => name !== undefined))];
}

/** Starts the built ViaProxy until all protocol mappings have loaded and returns its log. */
async function startViaProxyUntilLoaded(jar: string): Promise<string> {
  const home = await mkdtemp(join(tmpdir(), "stackanvil-viaproxy-startup-"));
  const port = await Effect.runPromise(tcpPortEffect);
  const child = Bun.spawn(
    [
      Bun.which("java") ?? "java",
      "-DskipUpdateCheck",
      "-jar",
      jar,
      "cli",
      "--bind-address",
      `127.0.0.1:${port}`,
      "--target-address",
      "127.0.0.1:19132",
      "--target-version",
      "Bedrock 1.26.60",
      "--auth-method",
      "NONE",
    ],
    { cwd: home, stdin: "ignore", stdout: "pipe", stderr: "pipe" },
  );
  let log = "";
  const collect = async (stream: ReadableStream<Uint8Array>) => {
    const decoder = new TextDecoder();
    for await (const chunk of stream) log += decoder.decode(chunk, { stream: true });
  };
  const readers = Promise.all([collect(child.stdout), collect(child.stderr)]);
  try {
    const deadline = Date.now() + startupTimeoutMs;
    while (!log.includes(loadedMarker)) {
      if (child.exitCode !== null) throw new Error(`ViaProxy exited early:\n${log}`);
      if (Date.now() > deadline) throw new Error(`ViaProxy did not finish loading:\n${log}`);
      await Bun.sleep(250);
    }
    return log;
  } finally {
    child.kill();
    await child.exited;
    await readers;
    await rm(home, { recursive: true, force: true });
  }
}

if (import.meta.main) {
  const jar = process.argv[2] ?? (await artifact("viaproxy"));
  const failures = protocolLoadFailures(await startViaProxyUntilLoaded(jar));
  if (failures.length > 0) {
    printError(`ViaProxy failed to load ${failures.length} protocols: ${failures.join(", ")}`);
    process.exit(1);
  }
  print(`ViaProxy loaded every protocol: ${jar}`);
}
