import { bundlePrism } from "./prism.ts";

bundlePrism().then(console.log).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
