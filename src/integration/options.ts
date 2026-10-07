import { parseArgs } from "node:util";

export function integrationOptions(args: readonly string[]) {
  return parseArgs({
    args: [...args],
    allowPositionals: false,
    strict: true,
    options: {
      help: { type: "boolean", short: "h" },
      "reuse-build": { type: "boolean" },
      "plain-only": { type: "boolean" },
      "modpack-only": { type: "boolean" },
      shaders: { type: "boolean" },
      route: { type: "string" },
      "entity-probe": { type: "boolean" },
      "resource-pack-probe": { type: "boolean" },
      "gameplay-probe": { type: "boolean" },
      "gameplay-complex": { type: "boolean" },
      "gameplay-cases": { type: "string" },
      "geyser-probe": { type: "boolean" },
      "negative-controls": { type: "boolean" },
    },
  }).values;
}

export const integrationHelp = `Usage: bun run test:integration [options]

  --help, -h              Show help without building or starting services
  --reuse-build           Use the current verified build artifacts
  --route <route>         java-java, java-bedrock, bedrock-bedrock, or java-geyser
  --plain-only            Test the plain Java client
  --modpack-only          Test the optimized Java client
  --shaders               Test the pinned shader profile
  --entity-probe          Run the Bedrock entity probe
  --resource-pack-probe   Run the Bedrock resource-pack probe
  --gameplay-probe        Run the backend's gameplay cases
  --gameplay-complex      Include complex Bedrock gameplay cases
  --gameplay-cases <ids>  Run comma-separated gameplay case IDs
  --geyser-probe          Include Geyser custom-content cases
  --negative-controls    Include Geyser negative controls

The default run builds all projects and starts private test services.
Unknown options and missing option values stop before the build.`;
