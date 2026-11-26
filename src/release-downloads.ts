interface ReleaseDownload {
  title: string;
  description: string;
  url: string;
}

const downloads = [
  {
    title: "Bedrock client modpack",
    pattern: /^StackAnvil-.+\.mrpack$/u,
    description: "Import into a launcher that supports Modrinth modpacks.",
  },
  {
    title: "Bedrock add-on",
    pattern: /^viafabricplus-bedrock-.+-StackAnvil\.jar$/u,
    description: "Install in your Fabric client's mods folder alongside ViaFabricPlus.",
  },
  {
    title: "Foundry companion",
    pattern: /^stackanvil-foundry-companion-.+\.jar$/u,
    description:
      "Optional. Start your Bedrock Foundry servers from the client and join them. Install beside the Bedrock add-on.",
  },
  {
    title: "ViaFabricPlus",
    pattern: /^ViaFabricPlus-.+\.jar$/u,
    description: "The pinned upstream mod, required by the Bedrock add-on.",
  },
  {
    title: "ViaProxy",
    pattern: /^ViaProxy-.+-StackAnvil\.jar$/u,
    description: "Run as a separate proxy for an existing Java client.",
  },
  {
    title: "ViaBedrock",
    pattern: /^ViaBedrock-.+-StackAnvil\.jar$/u,
    description: "Library for developers who embed Bedrock protocol translation.",
  },
  {
    title: "CubeConverter",
    pattern: /^cubeconverter-.+-StackAnvil\.jar$/u,
    description: "Library for developers who convert Bedrock resource packs.",
  },
];

export function releaseDownloads(
  repository: string,
  tag: string,
  files: readonly string[],
): ReleaseDownload[] {
  if (!tag) throw new Error("A release tag is required for download links");
  return downloads.map(({ title, description, pattern }) => {
    const matches = files.filter((file) => pattern.test(file));
    const [match] = matches;
    if (match === undefined || matches.length !== 1)
      throw new Error(`Expected one ${title} download, found ${matches.length}`);
    return {
      title,
      description,
      url: `https://github.com/${repository}/releases/download/${encodeURIComponent(tag)}/${encodeURIComponent(match)}`,
    };
  });
}

export function releaseDownloadSection(
  repository: string,
  tag: string,
  files: readonly string[],
): string[] {
  return [
    "> [!IMPORTANT]",
    "> Import the .mrpack for a prepared Fabric client, or install both ViaFabricPlus and the Bedrock add-on manually.",
    "> ViaProxy runs as a separate program. ViaBedrock and CubeConverter are developer libraries, not standalone Fabric mods.",
    "",
    "## Download links",
    "",
    "| Download | Use |",
    "| --- | --- |",
    ...releaseDownloads(repository, tag, files).map(
      ({ title, description, url }) => `| [${title}](${url}) | ${description} |`,
    ),
    "",
  ];
}
