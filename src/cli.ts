import { Effect } from "effect";
import { getSeries, getTarget, targetIds } from "./model.ts";
import { build, buildPr } from "./build.ts";
import { abortApply, addPatch, continueApply, edit, rebuild, sync, workdir } from "./stack.ts";
import { assignPr, prBody, syncPr } from "./pr.ts";
import { devSetup } from "./dev.ts";

const [area, action, id, extra, ...rest] = process.argv.slice(2);
const argumentsAfterProject = extra ? [extra, ...rest] : rest;

function option(name: string): string | undefined {
  const index = argumentsAfterProject.indexOf(name);
  return index >= 0 ? argumentsAfterProject[index + 1] : undefined;
}

const artifact = { runId: option("--run-id"), artifactId: option("--artifact-id") };

async function main(): Promise<void> {
  if (area === "dev" && action === "setup") {
    await Effect.runPromise(devSetup());
    return;
  }
  if (area !== "stack" && area !== "pr") throw new Error("Usage: bun run stack <stack|pr|dev> <command> [project]");
  if (!id) throw new Error(`Choose a project: ${(await targetIds()).join(", ")}`);
  if (area === "stack") {
    switch (action) {
      case "sync": console.log(await Effect.runPromise(sync(id))); return;
      case "continue": console.log(await Effect.runPromise(continueApply(id, extra === "--pr" ? "pr" : "full"))); return;
      case "abort": console.log(await Effect.runPromise(abortApply(id, extra === "--pr" ? "pr" : "full"))); return;
      case "edit":
        if (!extra) throw new Error("Supply a .patch filename to edit");
        console.log(`Edit ${workdir(id)}, stage changes, then run: bun run stack rebuild ${id}`);
        console.log(await Effect.runPromise(edit(id, extra)));
        return;
      case "rebuild": console.log(`Rebuilt ${await Effect.runPromise(rebuild(id))} patches`); return;
      case "build": console.log(await Effect.runPromise(build(id))); return;
      case "add": {
        if (extra !== "features" && extra !== "custom") throw new Error("Choose features or custom");
        console.log(await Effect.runPromise(addPatch(id, extra, rest[0])));
        return;
      }
      case "status": {
        const target = await getTarget(id);
        const series = await getSeries(id);
        console.log(JSON.stringify({ target, branding: series.branding.length, features: series.features, custom: series.custom.length }, null, 2));
        return;
      }
    }
  }
  if (area === "pr") {
    switch (action) {
      case "check": console.log(await Effect.runPromise(sync(id, "pr"))); return;
      case "body": console.log(await Effect.runPromise(prBody(id, artifact))); return;
      case "build": console.log(await Effect.runPromise(buildPr(id))); return;
      case "assign": console.log(JSON.stringify(await Effect.runPromise(assignPr(id)), null, 2)); return;
      case "sync": console.log(await Effect.runPromise(syncPr(id, artifact))); return;
    }
  }
  throw new Error(`Unknown command: ${area} ${action}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
