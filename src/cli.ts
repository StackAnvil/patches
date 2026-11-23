import { Effect } from "effect";
import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { getSeries, getTarget, targetIds } from "./model.ts";
import { build, buildPr } from "./build.ts";
import { abortApply, addPatch, continueApply, edit, rebuild, sync, workdir } from "./stack.ts";
import { prBody, syncPr, updatePrParticipants } from "./pr.ts";
import { devSetup } from "./dev.ts";
import { healthFailed, healthMarkdown, patchHealth } from "./health.ts";
import { writeReport } from "./validation.ts";
import { print, printError } from "./output.ts";

const [area, action] = process.argv.slice(2);

const patchOption = { patch: { type: "string" } } as const;
const artifactOptions = {
  "run-id": { type: "string" },
  "artifact-id": { type: "string" },
} as const;
const applyOptions = { pr: { type: "boolean" }, ...patchOption } as const;
const commandOptions = {
  stack: {
    sync: {},
    continue: applyOptions,
    abort: applyOptions,
    edit: {},
    rebuild: {},
    build: {},
    add: { reason: { type: "string" } },
    status: {},
  },
  pr: {
    check: patchOption,
    body: { ...patchOption, ...artifactOptions },
    build: patchOption,
    assign: patchOption,
    sync: { ...patchOption, ...artifactOptions },
  },
} as const;

/** Parses flags anywhere after the command and rejects flags the command does not accept. */
function commandArguments(options: Record<string, { type: "string" | "boolean" }>) {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(4),
    allowPositionals: true,
    strict: true,
    options,
  });
  const text = (name: string) => {
    const value = values[name];
    return typeof value === "string" ? value : undefined;
  };
  return { positionals, flag: (name: string) => values[name] === true, text };
}

async function main(): Promise<void> {
  if (area === "stack" && action === "health") {
    const { values, positionals } = parseArgs({
      args: process.argv.slice(4),
      allowPositionals: true,
      options: { upstream: { type: "boolean" }, output: { type: "string" } },
    });
    if (positionals.length > 1) throw new Error("Choose one project or all.");
    const report = await patchHealth(positionals[0] ?? "all", { upstream: values.upstream });
    if (values.output) {
      await writeReport(resolve(values.output), report, healthMarkdown(report));
      print(`Patch health: ${values.output}`);
    } else print(JSON.stringify(report, null, 2));
    if (healthFailed(report)) process.exitCode = 1;
    return;
  }
  if (area === "dev" && action === "setup") {
    await Effect.runPromise(devSetup());
    return;
  }
  if (area !== "stack" && area !== "pr")
    throw new Error("Usage: bun run stack <stack|pr|dev> <command> [project]");
  const areaOptions: Record<
    string,
    Record<string, { type: "string" | "boolean" }>
  > = commandOptions[area];
  const options = action === undefined ? undefined : areaOptions[action];
  if (action === undefined || !options) {
    const commands = [...Object.keys(areaOptions), ...(area === "stack" ? ["health"] : [])];
    throw new Error(`Choose a ${area} command: ${commands.join(", ")}`);
  }
  const { positionals, flag, text } = commandArguments(options);
  const [id, extra, ...rest] = positionals;
  if (!id) throw new Error(`Choose a project: ${(await targetIds()).join(", ")}`);
  const expected = action === "edit" ? 2 : action === "add" ? 3 : 1;
  const unexpected = positionals.slice(expected);
  if (unexpected.length > 0) throw new Error(`Unexpected arguments: ${unexpected.join(" ")}`);
  // Only stack continue and abort accept both flags.
  if (area === "stack" && text("patch") && !flag("pr"))
    throw new Error("--patch selects a PR checkout and requires --pr");
  const patchFile = text("patch");
  const artifact = { runId: text("run-id"), artifactId: text("artifact-id") };
  if (area === "stack") {
    switch (action) {
      case "sync": {
        print(await Effect.runPromise(sync(id)));
        return;
      }
      case "continue": {
        print(await Effect.runPromise(continueApply(id, flag("pr") ? "pr" : "full", patchFile)));
        return;
      }
      case "abort": {
        print(await Effect.runPromise(abortApply(id, flag("pr") ? "pr" : "full", patchFile)));
        return;
      }
      case "edit": {
        if (!extra) throw new Error("Supply a .patch filename to edit");
        print(`Edit ${workdir(id)}, stage changes, then run: bun run stack rebuild ${id}`);
        print(await Effect.runPromise(edit(id, extra)));
        return;
      }
      case "rebuild": {
        print(`Rebuilt ${await Effect.runPromise(rebuild(id))} patches`);
        return;
      }
      case "build": {
        print(await Effect.runPromise(build(id)));
        return;
      }
      case "add": {
        if (extra !== "upstreamable" && extra !== "deferred")
          throw new Error("Choose upstreamable or deferred");
        print(await Effect.runPromise(addPatch(id, extra, rest[0], text("reason"))));
        return;
      }
      case "status": {
        const target = await getTarget(id);
        const series = await getSeries(id);
        print(
          JSON.stringify(
            {
              target,
              setup: series.setup.length,
              upstreamable: series.upstreamable,
              deferred: series.deferred,
            },
            null,
            2,
          ),
        );
        return;
      }
    }
  }
  if (area === "pr") {
    switch (action) {
      case "check": {
        print(await Effect.runPromise(sync(id, "pr", patchFile)));
        return;
      }
      case "body": {
        print(await Effect.runPromise(prBody(id, artifact, patchFile)));
        return;
      }
      case "build": {
        print(await Effect.runPromise(buildPr(id, patchFile)));
        return;
      }
      case "assign": {
        print(
          JSON.stringify(
            await Effect.runPromise(updatePrParticipants(id, undefined, patchFile)),
            null,
            2,
          ),
        );
        return;
      }
      case "sync": {
        print(await Effect.runPromise(syncPr(id, artifact, patchFile)));
        return;
      }
    }
  }
  throw new Error(`Unknown command: ${area} ${action}`);
}

try {
  await main();
} catch (error: unknown) {
  printError(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
