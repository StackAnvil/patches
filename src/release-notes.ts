import { execFileSync } from "node:child_process";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getSeries, getTarget, root, targetIds } from "./model.ts";
import { modpackTarget } from "./modpack.ts";
import { parsePatchMessage } from "./patch-message.ts";
import { releaseDownloadSection } from "./release-downloads.ts";
import { readViaFabricPlusPin } from "./viafabricplus.ts";

const repository = process.env["GITHUB_REPOSITORY"] ?? "StackAnvil/patches";
const commit =
  process.env["GITHUB_SHA"] ??
  execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const groupTitles = { setup: "Setup", upstreamable: "Upstreamable", deferred: "Deferred" } as const;
const tag =
  process.argv[2] ??
  (process.env["GITHUB_REF_TYPE"] === "tag"
    ? process.env["GITHUB_REF_NAME"]
    : process.env["GITHUB_RUN_NUMBER"]
      ? `stack-v0.0.${process.env["GITHUB_RUN_NUMBER"]}`
      : undefined);
if (!tag)
  throw new Error("Usage: bun src/release-notes.ts <release-tag> [release-assets-directory]");
const assetsDir = process.argv[3] ?? join(root, "release");
const assets = await readdir(assetsDir);
const downloads = releaseDownloadSection(repository, tag, assets);
const [packFile, ...otherPacks] = assets.filter((file) => file.endsWith(".mrpack"));
if (packFile === undefined || otherPacks.length > 0) throw new Error("Expected one modpack");
const pack = await modpackTarget(join(assetsDir, packFile));

function patchUrl(id: string, group: string, file: string): string {
  const path = ["patches", id, group, file].map((value) => encodeURIComponent(value)).join("/");
  return `https://github.com/${repository}/blob/${commit}/${path}`;
}

async function patchTitle(id: string, group: string, file: string): Promise<string> {
  const patch = await readFile(join(root, "patches", id, group, file), "utf8");
  return parsePatchMessage(patch).title;
}

const lines = [
  "# StackAnvil builds",
  "",
  ...downloads,
  "Validation results and coverage limits are attached as `validation.json` and `validation.md`. These reports do not establish native Bedrock parity.",
  "",
  "The StackAnvil JARs contain experimental patch stacks. The ViaFabricPlus JAR is an unchanged, pinned upstream Jenkins build.",
  "",
  "Setup patches prepare StackAnvil builds. Upstreamable patches can become our PRs. Deferred patches track work that another contributor already owns upstream.",
  "",
  "## Play from Java Edition",
  "",
  "### Bedrock client modpack",
  "",
  `Import \`${pack.file}\` into a launcher that supports Modrinth modpacks, such as Modrinth App, Prism Launcher, or ATLauncher. The pack contains this release's exact ViaFabricPlus, Bedrock add-on, and Foundry companion JARs. It selects Minecraft ${pack.minecraft} with Fabric Loader ${pack.loader}. Sign in with your own Java Edition account.`,
  "",
  "### ViaProxy",
  "",
  "Download the `ViaProxy-...-StackAnvil.jar` file. Run it beside your regular Java client, enter the Bedrock server address and version, and select Start. Join the address shown by ViaProxy from Java Edition. The JAR includes the patched ViaBedrock build; no client mods are needed.",
  "",
  "### ViaFabricPlus + Bedrock add-on",
  "",
  "**Bedrock add-on downloads:** [CurseForge](https://www.curseforge.com/minecraft/mc-mods/stackanvil-bedrock-addon-for-viafabricplus).",
  "",
  `For Minecraft Java Edition ${pack.minecraft} with Fabric Loader ${pack.loader}, install the \`ViaFabricPlus-...jar\` and \`viafabricplus-bedrock-...-StackAnvil.jar\` files from this release in the same client's mods folder. The ViaFabricPlus JAR is a copy of the pinned upstream Jenkins artifact. The add-on includes the patched ViaBedrock and CubeConverter libraries, so do not install those JARs as separate Fabric mods.`,
  "",
  "### Bedrock Foundry companion",
  "",
  "The optional `stackanvil-foundry-companion-...jar` adds **Bedrock Foundry** to ViaFabricPlus' server lists. It starts a server that you set up in [Bedrock Foundry](https://github.com/StackAnvil/BedrockFoundry), joins it, and stops it when you press Stop or quit the game. Install it beside the Bedrock add-on. It needs Bedrock Foundry 0.2.0 or newer.",
  "",
  "See the [player guide](https://stackanvil.pistonmaster.net/getting-started/) for connection and sign-in steps for both setups.",
  "",
  "## Libraries for developers",
  "",
  "The CubeConverter and ViaBedrock JARs are also available for projects that use those libraries. The [StackAnvil Maven repository](https://github.com/StackAnvil/maven) publishes the four StackAnvil builds under the matching release version.",
  "",
];
const viaFabricPlusPin = await readViaFabricPlusPin();
lines.push(
  "## ViaFabricPlus",
  "",
  `- Upstream Jenkins build: [#${viaFabricPlusPin.build}](https://ci.viaversion.com/job/ViaFabricPlus/${viaFabricPlusPin.build}/)`,
  `- Upstream commit: [${viaFabricPlusPin.commit.slice(0, 12)}](https://github.com/ViaVersion/ViaFabricPlus/commit/${viaFabricPlusPin.commit})`,
  `- Version: ${viaFabricPlusPin.version}`,
  "",
);
for (const id of await targetIds()) {
  const target = await getTarget(id);
  const series = await getSeries(id);
  lines.push(
    `## ${id}`,
    "",
    `Upstream base: [${target.baseSha.slice(0, 12)}](https://github.com/${target.upstream}/commit/${target.baseSha})`,
    "",
  );
  for (const group of ["setup", "upstreamable", "deferred"] as const) {
    const patches: readonly { file: string; title?: string; reason?: string }[] =
      group === "setup" ? series.setup.map((file) => ({ file })) : series[group];
    if (patches.length === 0) continue;
    lines.push(`### ${groupTitles[group]}`, "");
    for (const patch of patches) {
      const title = patch.title ?? (await patchTitle(id, group, patch.file));
      lines.push(`- ${title} ([view patch](${patchUrl(id, group, patch.file)}))`);
      if (patch.reason !== undefined) lines.push(`  - Reason: ${patch.reason}`);
    }
    lines.push("");
  }
}
await writeFile(join(root, "release-notes.md"), `${lines.join("\n")}\n`);
