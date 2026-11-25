import { expect, test } from "bun:test";
import { protocolLoadFailures } from "../src/viaproxy-startup.ts";

test("names each protocol that ViaVersion failed to load once", () => {
  const log = [
    "[15:52:49] [Via-Mappingloader-1/ERROR] (ViaVersion) Error during loading of Protocol26_3To26_2",
    "java.util.concurrent.CompletionException: java.lang.IllegalArgumentException: Packet type STOP_SOUND already registered!",
    "[15:52:49] [Via-Mappingloader-2/ERROR] (ViaVersion) Error during loading of Protocol26_2To26_1",
    "[15:52:49] [Via-Mappingloader-3/ERROR] (ViaVersion) Error during loading of Protocol26_3To26_2",
    "[15:52:50] [Via Async Scheduler 0/INFO] (ViaVersion) Finished mapping loading, shutting down loader executor.",
  ].join("\n");

  expect(protocolLoadFailures(log)).toEqual(["Protocol26_3To26_2", "Protocol26_2To26_1"]);
});

test("reports no failures for a clean startup", () => {
  expect(
    protocolLoadFailures(
      "[00:33:43] [Via Async Scheduler 0/INFO] (ViaVersion) Finished mapping loading, shutting down loader executor.",
    ),
  ).toEqual([]);
});
