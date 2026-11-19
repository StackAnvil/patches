import { Clock, Effect } from "effect";
import { labIO, LabError } from "../lab/effect-runtime.ts";
import { stripVTControlCharacters } from "node:util";

export const joinRoutes = ["java-java", "java-bedrock", "bedrock-bedrock", "java-geyser"] as const;
export type JoinRoute = (typeof joinRoutes)[number];

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
  const escaped = player.replaceAll(/[.*+?^${}()|[\]\\]/gu, String.raw`\$&`);
  const plain = stripVTControlCharacters(server);
  const pattern = javaBackend(route)
    ? `${escaped} lost connection\\b`
    : `Player disconnected:\\s*${escaped}\\b`;
  return new RegExp(pattern, "u").test(plain) ? `${player} disconnected on ${route}.` : undefined;
}

export interface JoinProbe {
  route: JoinRoute;
  serverLog(): Promise<string>;
  clientLog(): Promise<string>;
  connectionLog?: (() => Promise<string>) | undefined;
  clientAlive(): boolean;
  onJoin?: ((player: string) => void | Promise<void>) | undefined;
  timeoutMs: number;
  dwellMs: number;
  pollMs?: number;
}

export function joinedPlayer(route: JoinRoute, rawLog: string): string | undefined {
  const log = stripVTControlCharacters(rawLog);
  if (javaBackend(route)) {
    return (
      /\]: (?:System chat: )?([^\r\n]+?) joined the game\b/mu.exec(log)?.[1] ??
      /^(?:System chat: )?([^\r\n]+?) joined the game\b/mu.exec(log)?.[1]
    );
  }
  return /Player Spawned:\s*(.+?)\s+xuid:/u.exec(log)?.[1];
}

export const waitForJoinEffect = Effect.fn("Integration.waitForJoin")(function* (probe: JoinProbe) {
  const started = yield* Clock.currentTimeMillis;
  let joinedAt: number | undefined;
  let player: string | undefined;
  const connectionLog = probe.connectionLog;
  while ((yield* Clock.currentTimeMillis) - started < probe.timeoutMs) {
    const [serverOutput, client, connection] = yield* Effect.all(
      [
        labIO("read server log", () => probe.serverLog()),
        labIO("read client log", () => probe.clientLog()),
        connectionLog ? labIO("read connection log", () => connectionLog()) : Effect.succeed(""),
      ],
      { concurrency: 3 },
    );
    const server = stripVTControlCharacters(serverOutput);
    if (
      /\b(?:ReportedException|ClassCastException|Crash report saved to|Exception in thread)\b/u.test(
        client,
      )
    ) {
      return yield* LabError.make({
        operation: "join probe",
        message: `Client crashed on ${probe.route}.`,
      });
    }
    if (!probe.clientAlive())
      return yield* LabError.make({
        operation: "join probe",
        message: `Client exited before the ${probe.route} stability check finished.`,
      });
    const earlyFailure = connectionFailure(probe.route, undefined, server, connection);
    if (earlyFailure)
      return yield* LabError.make({ operation: "join probe", message: earlyFailure });
    const current = joinedPlayer(probe.route, server);
    if (current && joinedAt === undefined) {
      joinedAt = yield* Clock.currentTimeMillis;
      player = current;
      const onJoin = probe.onJoin;
      if (onJoin) yield* labIO("on join", async () => onJoin(current));
    }
    if (joinedAt !== undefined && player) {
      const postJoin = server.slice(
        server.search(javaBackend(probe.route) ? /joined the game/u : /Player Spawned:/u),
      );
      const failure = connectionFailure(probe.route, player, postJoin);
      if (failure) return yield* LabError.make({ operation: "join probe", message: failure });
      if ((yield* Clock.currentTimeMillis) - joinedAt >= probe.dwellMs) return player;
    }
    yield* Effect.sleep(probe.pollMs ?? 1000);
  }
  return yield* LabError.make({
    operation: "join probe",
    message: `${probe.route} did not complete a join within ${probe.timeoutMs / 1000}s.`,
  });
});

export function waitForJoin(probe: JoinProbe): Promise<string> {
  return Effect.runPromise(waitForJoinEffect(probe));
}
