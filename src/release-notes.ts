import { execFileSync } from "node:child_process";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getSeries, getTarget, root, targetIds } from "./model.ts";
import { parsePatchMessage } from "./patch-message.ts";
import { releaseDownloadSection } from "./release-downloads.ts";

const repository = process.env.GITHUB_REPOSITORY ?? "StackAnvil/patches";
const commit = process.env.GITHUB_SHA ?? execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const groupTitles = { setup: "Setup", upstreamable: "Upstreamable", deferred: "Deferred" } as const;
const tag = process.argv[2] ?? (process.env.GITHUB_REF_TYPE === "tag" ? process.env.GITHUB_REF_NAME
  : process.env.GITHUB_RUN_NUMBER ? `stack-v0.0.${process.env.GITHUB_RUN_NUMBER}` : undefined);
if (!tag) throw new Error("Usage: bun src/release-notes.ts <release-tag> [release-assets-directory]");
const assets = await readdir(process.argv[3] ?? join(root, "release"));

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
  ...releaseDownloadSection(repository, tag, assets),
  "The StackAnvil JARs contain experimental patch stacks. The ViaFabricPlus JAR is an unchanged, pinned upstream Jenkins build.", "",
  "Setup patches prepare StackAnvil builds. Upstreamable patches can become our PRs. Deferred patches track work that another contributor already owns upstream.", "",
  "## Play from Java Edition", "",
  "### ViaProxy", "",
  "Download the `ViaProxy-...-StackAnvil.jar` file. Run it beside your regular Java client, enter the Bedrock server address and version, and select Start. Join the address shown by ViaProxy from Java Edition. The JAR includes the patched ViaBedrock build; no client mods are needed.", "",
  "### ViaFabricPlus + Bedrock add-on", "",
  "**Bedrock add-on downloads:** [CurseForge](https://www.curseforge.com/minecraft/mc-mods/stackanvil-bedrock-addon-for-viafabricplus).", "",
  "For Minecraft Java Edition 26.3 with Fabric Loader 0.19.5, install the `ViaFabricPlus-...jar` and `viafabricplus-bedrock-...-StackAnvil.jar` files from this release in the same client's mods folder. The ViaFabricPlus JAR is a copy of the pinned upstream Jenkins artifact. The add-on includes the patched ViaBedrock and CubeConverter libraries, so do not install those JARs as separate Fabric mods.", "",
  "See the [player guide](https://stackanvil.pistonmaster.net/getting-started/) for connection and sign-in steps for both setups.", "",
  "### Optional Prism Launcher instance", "",
  "If you want a prepared Fabric client, import `StackAnvil-26.3-Prism-Launcher_Config.zip` into Prism Launcher. It contains the same tested ViaFabricPlus and Bedrock add-on pair. Prism Launcher downloads Minecraft and asks for your own Java Edition account.", "",
  "## Libraries for developers", "",
  "The CubeConverter and ViaBedrock JARs are also available for projects that use those libraries. The [StackAnvil Maven repository](https://github.com/StackAnvil/maven) publishes the four StackAnvil builds under the matching release version.", "",
];
const viaFabricPlusPin = JSON.parse(await readFile(join(root, "viafabricplus.json"), "utf8")) as { build: number; commit: string; version: string };
lines.push("## ViaFabricPlus", "", `- Upstream Jenkins build: [#${viaFabricPlusPin.build}](https://ci.viaversion.com/job/ViaFabricPlus/${viaFabricPlusPin.build}/)`,
  `- Upstream commit: [${viaFabricPlusPin.commit.slice(0, 12)}](https://github.com/ViaVersion/ViaFabricPlus/commit/${viaFabricPlusPin.commit})`,
  `- Version: ${viaFabricPlusPin.version}`, "");
for (const id of await targetIds()) {
  const target = await getTarget(id);
  const series = await getSeries(id);
  lines.push(`## ${id}`, "", `Upstream base: [${target.baseSha.slice(0, 12)}](https://github.com/${target.upstream}/commit/${target.baseSha})`, "");
  for (const group of ["setup", "upstreamable", "deferred"] as const) {
    const patches = group === "setup" ? series.setup.map((file) => ({ file })) : series[group];
    if (!patches.length) continue;
    lines.push(`### ${groupTitles[group]}`, "");
    for (const patch of patches) {
      const title = "title" in patch ? patch.title : await patchTitle(id, group, patch.file);
      lines.push(`- ${title} ([view patch](${patchUrl(id, group, patch.file)}))`);
      if ("reason" in patch) lines.push(`  - Reason: ${patch.reason}`);
    }
    lines.push("");
  }
}
await writeFile(join(root, "release-notes.md"), `${lines.join("\n")}\n`);
