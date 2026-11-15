export const site = {
  title: "StackAnvil",
  url: "https://stackanvil.pistonmaster.net",
  description:
    "Play on Bedrock servers from Minecraft Java Edition with ViaProxy or the ViaFabricPlus Bedrock add-on.",
  github: "https://github.com/StackAnvil/patches",
  discord: "https://discord.gg/F4ZyEtXXge",
  curseforge:
    "https://www.curseforge.com/minecraft/mc-mods/stackanvil-bedrock-addon-for-viafabricplus",
  latestRelease: "https://github.com/StackAnvil/patches/releases/latest",
} as const;

export const homePage = { title: "Home", description: site.description };

export interface PageMetadata {
  title: string;
  description: string;
}

export function pageUrl(slug: string) {
  return slug === "index" ? "/" : `/${slug}/`;
}
