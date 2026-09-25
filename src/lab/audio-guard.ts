import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execute = promisify(execFile);
const display = Bun.argv[2];
const sink = "stackanvil_silent";

interface Input {
  index: number;
  sink: number;
  mute: boolean;
  volume: Record<string, { value_percent: string }>;
  properties: Record<string, string>;
}

async function pactl(args: string[]): Promise<string> {
  return (await execute("pactl", args)).stdout;
}

async function mute(): Promise<void> {
  const sinks = await pactl(["list", "sinks", "short"]);
  const sinkId = Number(sinks.split("\n").find((line) => line.split("\t")[1] === sink)?.split("\t")[0]);
  if (!Number.isInteger(sinkId)) throw new Error("StackAnvil silent sink is missing.");
  const inputs = JSON.parse(await pactl(["-f", "json", "list", "sink-inputs"])) as Input[];
  for (const input of inputs) {
    const properties = input.properties;
    if (properties["window.x11.display"] !== display) continue;
    if (properties["application.name"] !== "Minecraft"
      && properties["pipewire.access.portal.app_id"] !== "org.prismlauncher.PrismLauncher") continue;
    const id = String(input.index);
    if (input.sink !== sinkId) await pactl(["move-sink-input", id, sink]);
    if (Object.values(input.volume ?? {}).some(({ value_percent }) => value_percent !== "0%")) {
      await pactl(["set-sink-input-volume", id, "0%"]);
    }
    if (!input.mute) await pactl(["set-sink-input-mute", id, "1"]);
  }
}

if (!display) throw new Error("Supply the lab display.");
for (;;) {
  try { await mute(); } catch (error) { console.error(error); }
  await Bun.sleep(500);
}
