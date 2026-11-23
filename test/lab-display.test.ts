import { expect, test } from "bun:test";
import { unloadSilentModule } from "../src/lab/display.ts";

const silent = "sink_name=stackanvil_silent sink_properties=device.description=StackAnvil-Silent";

function fakePactl(modules: string) {
  const calls: string[][] = [];
  return {
    calls,
    run: async (args: string[]) => {
      calls.push(args);
      if (args[0] === "list") return modules;
      if (!modules.split("\n").some((line) => line.startsWith(`${args[1]}\t`)))
        throw new Error("Failure: No such entity");
      return "";
    },
  };
}

test("display stop skips a saved audio module ID that a restarted sound server dropped or reused", async () => {
  const id = 536870916;
  for (const modules of [
    "536870912\tmodule-always-sink\t\t\n",
    `536870912\tmodule-always-sink\t\t\n${id}\tmodule-loopback\tsource=mic\t\n`,
  ]) {
    const pactl = fakePactl(modules);
    await unloadSilentModule(id, pactl.run);
    expect(pactl.calls).toEqual([["list", "modules", "short"]]);
  }
  const pactl = fakePactl(`536870912\tmodule-always-sink\t\t\n${id}\tmodule-null-sink\t${silent}\t\n`);
  await unloadSilentModule(id, pactl.run);
  expect(pactl.calls.at(-1)).toEqual(["unload-module", String(id)]);
});
