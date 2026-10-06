interface ReleaseDownload {
  title: string;
  description: string;
  url: string;
}

const downloads = [
  { title: "Prism Launcher instance", pattern: /^StackAnvil-.+-Prism-Launcher_Config\.zip$/,
    description: "Import into Prism Launcher for a prepared Fabric client with both mods." },
  { title: "Bedrock add-on", pattern: /^viafabricplus-bedrock-.+-StackAnvil\.jar$/,
    description: "Install in your Fabric client's mods folder alongside ViaFabricPlus." },
  { title: "ViaFabricPlus", pattern: /^ViaFabricPlus-.+\.jar$/,
    description: "The pinned upstream mod, required by the Bedrock add-on." },
  { title: "ViaProxy", pattern: /^ViaProxy-.+-StackAnvil\.jar$/,
    description: "Run as a separate proxy for an existing Java client." },
  { title: "ViaBedrock", pattern: /^ViaBedrock-.+-StackAnvil\.jar$/,
    description: "Library for developers who embed Bedrock protocol translation." },
  { title: "CubeConverter", pattern: /^cubeconverter-.+-StackAnvil\.jar$/,
    description: "Library for developers who convert Bedrock resource packs." },
];

export function releaseDownloads(repository: string, tag: string, files: readonly string[]): ReleaseDownload[] {
  if (!tag) throw new Error("A release tag is required for download links");
  return downloads.map(({ title, description, pattern }) => {
    const matches = files.filter((file) => pattern.test(file));
    if (matches.length !== 1) throw new Error(`Expected one ${title} download, found ${matches.length}`);
    return { title, description,
      url: `https://github.com/${repository}/releases/download/${encodeURIComponent(tag)}/${encodeURIComponent(matches[0]!)}` };
  });
}

export function releaseDownloadSection(repository: string, tag: string, files: readonly string[]): string[] {
  return [
    "> [!IMPORTANT]",
    "> For a Fabric client, install both ViaFabricPlus and the Bedrock add-on. The Prism Launcher instance includes both mods.",
    "> ViaProxy runs as a separate program. ViaBedrock and CubeConverter are developer libraries, not standalone Fabric mods.", "",
    "## Download links", "",
    "| Download | Use |",
    "| --- | --- |",
    ...releaseDownloads(repository, tag, files).map(({ title, description, url }) => `| [${title}](${url}) | ${description} |`), "",
  ];
}
