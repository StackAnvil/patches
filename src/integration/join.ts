import { Clock, Effect } from "effect";
import { labIO, LabError } from "../lab/effect-runtime.ts";
import { stripVTControlCharacters } from "node:util";

export type JoinRoute = "java-java" | "java-bedrock" | "bedrock-bedrock" | "java-geyser";

function javaBackend(route: JoinRoute): boolean {
  return route === "java-java" || route === "java-geyser";
}

export function connectionFailure(
  route: JoinRoute,
  player: string | undefined,
  server: string,
  connection = "",
): string | undefined {
  const disconnect = stripVTControlCharacters(connection)
    .split("\n")
    .find((line) => line.includes("[SERVER DISCONNECT]") || line.includes("[PROXY KICK]"));
  if (disconnect)
    return `Proxy closed the ${route} connection: ${disconnect.slice(disconnect.indexOf("["))}`;
  if (!player) return undefined;
  const escaped = player.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const plain = stripVTControlCharacters(server);
  const pattern = javaBackend(route)
    ? `${escaped} lost connection\\b`
    : `Player disconnected:\\s*${escaped}\\b`;
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
  log = stripVTControlCharacters(log);
  if (javaBackend(route)) {
    return (
      /\]: (?:System chat: )?([^\r\n]+?) joined the game\b/m.exec(log)?.[1] ??
      /^(?:System chat: )?([^\r\n]+?) joined the game\b/m.exec(log)?.[1]
    );
  }
  return /Player Spawned:\s*(.+?)\s+xuid:/.exec(log)?.[1];
}

export const waitForJoinEffect = Effect.fn("Integration.waitForJoin")(function* (probe: JoinProbe) {
  const started = yield* Clock.currentTimeMillis;
  let joinedAt: number | undefined;
  let player: string | undefined;
  while ((yield* Clock.currentTimeMillis) - started < probe.timeoutMs) {
    const [serverOutput, client, connection] = yield* Effect.all(
      [
        labIO("read server log", () => probe.serverLog()),
        labIO("read client log", () => probe.clientLog()),
        probe.connectionLog
          ? labIO("read connection log", () => probe.connectionLog!())
          : Effect.succeed(""),
      ],
      { concurrency: 3 },
    );
    const server = stripVTControlCharacters(serverOutput);
    if (
      /\b(?:ReportedException|ClassCastException|Crash report saved to|Exception in thread)\b/.test(
        client,
      )
    ) {
      return yield* new LabError({
        operation: "join probe",
        message: `Client crashed on ${probe.route}.`,
      });
    }
    if (!probe.clientAlive())
      return yield* new LabError({
        operation: "join probe",
        message: `Client exited before the ${probe.route} stability check finished.`,
      });
    const earlyFailure = connectionFailure(probe.route, undefined, server, connection);
    if (earlyFailure)
      return yield* new LabError({ operation: "join probe", message: earlyFailure });
    const current = joinedPlayer(probe.route, server);
    if (current && joinedAt === undefined) {
      joinedAt = yield* Clock.currentTimeMillis;
      player = current;
      if (probe.onJoin) yield* labIO("on join", async () => probe.onJoin!(current));
    }
    if (joinedAt !== undefined && player) {
      const postJoin = server.slice(
        server.search(javaBackend(probe.route) ? /joined the game/ : /Player Spawned:/),
      );
      const failure = connectionFailure(probe.route, player, postJoin);
      if (failure) return yield* new LabError({ operation: "join probe", message: failure });
      if ((yield* Clock.currentTimeMillis) - joinedAt >= probe.dwellMs) return player;
    }
    yield* Effect.sleep(probe.pollMs ?? 1000);
  }
  return yield* new LabError({
    operation: "join probe",
    message: `${probe.route} did not complete a join within ${probe.timeoutMs / 1000}s.`,
  });
});

export function waitForJoin(probe: JoinProbe): Promise<string> {
  return Effect.runPromise(waitForJoinEffect(probe));
}
