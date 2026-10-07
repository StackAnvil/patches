export type JoinRoute = "java-java" | "java-bedrock" | "bedrock-bedrock" | "java-geyser";

function javaBackend(route: JoinRoute): boolean {
  return route === "java-java" || route === "java-geyser";
}

export function connectionFailure(route: JoinRoute, player: string | undefined, server: string, connection = ""): string | undefined {
  const disconnect = connection.replace(/\x1b\[[0-9;]*m/g, "").split("\n")
    .find((line) => line.includes("[SERVER DISCONNECT]") || line.includes("[PROXY KICK]"));
  if (disconnect) return `Proxy closed the ${route} connection: ${disconnect.slice(disconnect.indexOf("["))}`;
  if (!player) return undefined;
  const escaped = player.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const plain = server.replace(/\x1b\[[0-9;]*m/g, "");
  const pattern = javaBackend(route) ? `${escaped} lost connection\\b` : `Player disconnected:\\s*${escaped}\\b`;
  return new RegExp(pattern).test(plain) ? `${player} disconnected on ${route}.` : undefined;
}

export interface JoinProbe {
  route: JoinRoute;
  serverLog(): Promise<string>;
  clientLog(): Promise<string>;
  connectionLog?(): Promise<string>;
  clientAlive(): boolean;
  onJoin?(player: string): void | Promise<void>;
  timeoutMs: number;
  dwellMs: number;
  pollMs?: number;
}

export function joinedPlayer(route: JoinRoute, log: string): string | undefined {
  log = log.replace(/\x1b\[[0-9;]*m/g, "");
  if (javaBackend(route)) {
    return /\]: (?:System chat: )?([^\r\n]+?) joined the game\b/m.exec(log)?.[1]
      ?? /^(?:System chat: )?([^\r\n]+?) joined the game\b/m.exec(log)?.[1];
  }
  return /Player Spawned:\s*(.+?)\s+xuid:/.exec(log)?.[1];
}

export async function waitForJoin(probe: JoinProbe): Promise<string> {
  const started = Date.now();
  let joinedAt: number | undefined;
  let player: string | undefined;
  while (Date.now() - started < probe.timeoutMs) {
    const [serverOutput, client, connection] = await Promise.all([
      probe.serverLog(), probe.clientLog(), probe.connectionLog?.() ?? Promise.resolve(""),
    ]);
    const server = serverOutput.replace(/\x1b\[[0-9;]*m/g, "");
    if (/\b(?:ReportedException|ClassCastException|Crash report saved to|Exception in thread)\b/.test(client)) {
      throw new Error(`Client crashed on ${probe.route}.`);
    }
    if (!probe.clientAlive()) throw new Error(`Client exited before the ${probe.route} stability check finished.`);
    const earlyFailure = connectionFailure(probe.route, undefined, server, connection);
    if (earlyFailure) throw new Error(earlyFailure);
    const current = joinedPlayer(probe.route, server);
    if (current && !joinedAt) {
      joinedAt = Date.now();
      player = current;
      await probe.onJoin?.(current);
    }
    if (joinedAt && player) {
      const postJoin = server.slice(server.search(javaBackend(probe.route) ? /joined the game/ : /Player Spawned:/));
      const failure = connectionFailure(probe.route, player, postJoin);
      if (failure) throw new Error(failure);
      if (Date.now() - joinedAt >= probe.dwellMs) return player;
    }
    await Bun.sleep(probe.pollMs ?? 1000);
  }
  throw new Error(`${probe.route} did not complete a join within ${probe.timeoutMs / 1000}s.`);
}
