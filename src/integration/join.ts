export type JoinRoute = "java-java" | "java-bedrock" | "bedrock-bedrock";

export interface JoinProbe {
  route: JoinRoute;
  serverLog(): Promise<string>;
  clientLog(): Promise<string>;
  clientAlive(): boolean;
  onJoin?(player: string): void | Promise<void>;
  timeoutMs: number;
  dwellMs: number;
  pollMs?: number;
}

export function joinedPlayer(route: JoinRoute, log: string): string | undefined {
  if (route === "java-java") {
    return /\b([A-Za-z0-9_]+) joined the game\b/.exec(log)?.[1];
  }
  return /Player Spawned:\s*(.+?)\s+xuid:/.exec(log)?.[1];
}

export async function waitForJoin(probe: JoinProbe): Promise<string> {
  const started = Date.now();
  let joinedAt: number | undefined;
  let player: string | undefined;
  while (Date.now() - started < probe.timeoutMs) {
    const [server, client] = await Promise.all([probe.serverLog(), probe.clientLog()]);
    if (/\b(?:ReportedException|ClassCastException|Crash report saved to|Exception in thread)\b/.test(client)) {
      throw new Error(`Client crashed on ${probe.route}.`);
    }
    if (!probe.clientAlive()) throw new Error(`Client exited before the ${probe.route} stability check finished.`);
    const current = joinedPlayer(probe.route, server);
    if (current && !joinedAt) {
      joinedAt = Date.now();
      player = current;
      await probe.onJoin?.(current);
    }
    if (joinedAt && player) {
      const escaped = player.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const postJoin = server.slice(server.search(probe.route === "java-java" ? /joined the game/ : /Player Spawned:/));
      if (new RegExp(probe.route === "java-java"
        ? `${escaped} lost connection\\b` : `Player disconnected:\\s*${escaped}\\b`).test(postJoin)) {
        throw new Error(`${player} disconnected before the ${probe.route} stability check finished.`);
      }
      if (Date.now() - joinedAt >= probe.dwellMs) return player;
    }
    await Bun.sleep(probe.pollMs ?? 1000);
  }
  throw new Error(`${probe.route} did not complete a join within ${probe.timeoutMs / 1000}s.`);
}
