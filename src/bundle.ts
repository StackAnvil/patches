import { Effect } from "effect";
import { bundleModpack } from "./modpack.ts";

try {
  console.log(await Effect.runPromise(bundleModpack()));
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
