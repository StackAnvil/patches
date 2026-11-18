import { Effect } from "effect";
import { bundleModpack } from "./modpack.ts";
import { print, printError } from "./output.ts";

try {
  print(await Effect.runPromise(bundleModpack()));
} catch (error: unknown) {
  printError(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
