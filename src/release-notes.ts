import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getSeries, getTarget, root, targetIds } from "./model.ts";

const lines = ["# StackAnvil builds", "", "These JARs contain the full StackAnvil stacks. They are experimental and differ from the clean upstream PR branches.", ""];
for (const id of await targetIds()) {
  const target = await getTarget(id);
  const series = await getSeries(id);
  lines.push(`## ${id}`, "", `Upstream base: [${target.baseSha.slice(0, 12)}](https://github.com/${target.upstream}/commit/${target.baseSha})`, "");
  if (series.features.length) {
    lines.push("Feature patches:");
    for (const feature of series.features) lines.push(`- ${feature.title}${feature.sourcePr ? ` ([original PR](${feature.sourcePr}))` : ""}`);
  } else {
    lines.push("No feature patches yet. This build contains the branding patch.");
  }
  lines.push("");
}
await writeFile(join(root, "release-notes.md"), `${lines.join("\n")}\n`);
