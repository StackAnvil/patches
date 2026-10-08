import { Effect } from "effect";
import { bundleModpack } from "./modpack.ts";

Effect.runPromise(bundleModpack()).then(console.log).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
