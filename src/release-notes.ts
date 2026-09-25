import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getSeries, getTarget, root, targetIds } from "./model.ts";

const lines = [
  "# StackAnvil builds", "",
  "These JARs contain the full StackAnvil stacks. They are experimental and differ from the clean upstream PR branches.", "",
  "## Play the Java client", "",
  "Download `StackAnvil-26.3-Prism-Launcher_Config.zip` and import it as an instance in PrismLauncher. The instance contains the patched ViaFabricPlus and Bedrock add-on mods for Minecraft 26.3 with Fabric Loader 0.19.5. PrismLauncher downloads Minecraft and asks for your own account. The add-on embeds the patched ViaBedrock and CubeConverter JARs, so do not install them a second time as Fabric mods.", "",
  "For a local Bedrock server and ViaProxy test, follow the [development guide](https://github.com/StackAnvil/patches/blob/main/docs/development.md). The automated lab runs the clients on a private display at zero volume.", "",
  "## Use the libraries", "",
  "Download the individual CubeConverter, ViaBedrock, ViaFabricPlus, and Bedrock add-on JARs from this release. The [StackAnvil Maven repository](https://github.com/StackAnvil/maven) publishes them under the matching release version, along with the ViaFabricPlus API JAR.", "",
];
for (const id of await targetIds()) {
  const target = await getTarget(id);
  const series = await getSeries(id);
  lines.push(`## ${id}`, "", `Upstream base: [${target.baseSha.slice(0, 12)}](https://github.com/${target.upstream}/commit/${target.baseSha})`, "");
  if (series.features.length) {
    lines.push("Feature patches:");
    for (const feature of series.features) lines.push(`- ${feature.title}`);
  } else {
    lines.push("No feature patches yet. This build contains the branding patch.");
  }
  lines.push("");
}
await writeFile(join(root, "release-notes.md"), `${lines.join("\n")}\n`);
