import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Schema } from "effect";
import { parseJson } from "../guards.ts";
import { printError } from "../output.ts";

const execute = promisify(execFile);
const identity = Bun.argv[2];
const sink = "stackanvil_silent";

const InputsSchema = Schema.Array(
  Schema.Struct({
    index: Schema.Finite,
    sink: Schema.Finite,
    mute: Schema.Boolean,
    volume: Schema.optionalKey(
      Schema.Record(Schema.String, Schema.Struct({ value_percent: Schema.String })),
    ),
    properties: Schema.Record(Schema.String, Schema.String),
  }),
);

async function pactl(args: string[]): Promise<string> {
  return (await execute("pactl", args)).stdout;
}

async function mute(): Promise<void> {
  const sinks = await pactl(["list", "sinks", "short"]);
  const sinkId = Number(
    sinks
      .split("\n")
      .find((line) => line.split("\t")[1] === sink)
      ?.split("\t")[0],
  );
  if (!Number.isInteger(sinkId)) throw new Error("StackAnvil silent sink is missing.");
  const inputs = parseJson(InputsSchema, await pactl(["-f", "json", "list", "sink-inputs"]));
  for (const input of inputs) {
    const properties = input.properties;
    if (properties["stackanvil.lab"] !== identity) continue;
    const id = String(input.index);
    if (input.sink !== sinkId) await pactl(["move-sink-input", id, sink]);
    if (Object.values(input.volume ?? {}).some(({ value_percent }) => value_percent !== "0%")) {
      await pactl(["set-sink-input-volume", id, "0%"]);
    }
    if (!input.mute) await pactl(["set-sink-input-mute", id, "1"]);
  }
}

if (!identity) throw new Error("Supply the lab audio identity.");
for (;;) {
  try {
    await mute();
  } catch (error) {
    printError(error);
  }
  await Bun.sleep(500);
}
