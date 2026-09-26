import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getSeries, getTarget, root, targetIds } from "./model.ts";
import { parsePatchMessage } from "./patch-message.ts";

const repository = process.env.GITHUB_REPOSITORY ?? "StackAnvil/patches";
const commit = process.env.GITHUB_SHA ?? execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const groupTitles = { branding: "Branding", features: "Features", custom: "Custom" } as const;

function patchUrl(id: string, group: string, file: string): string {
  const path = ["patches", id, group, file].map(encodeURIComponent).join("/");
  return `https://github.com/${repository}/blob/${commit}/${path}`;
}

async function patchTitle(id: string, group: string, file: string): Promise<string> {
  const patch = await readFile(join(root, "patches", id, group, file), "utf8");
  return parsePatchMessage(patch).title;
}

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
  for (const group of ["branding", "features", "custom"] as const) {
    const patches = group === "features" ? series.features : series[group].map((file) => ({ file }));
    if (!patches.length) continue;
    lines.push(`### ${groupTitles[group]}`, "");
    for (const patch of patches) {
      const title = "title" in patch ? patch.title : await patchTitle(id, group, patch.file);
      lines.push(`- ${title} ([view patch](${patchUrl(id, group, patch.file)}))`);
    }
    lines.push("");
  }
}
await writeFile(join(root, "release-notes.md"), `${lines.join("\n")}\n`);
