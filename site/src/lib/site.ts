import bedrockAssets from "../../../bedrock-assets.json";

export const site = {
  title: "StackAnvil",
  url: "https://stackanvil.pistonmaster.net",
  /** The homepage title: the name plus what people search for. */
  headline: "Join Bedrock servers from Minecraft Java Edition",
  description:
    "Join Bedrock servers, Realms, and friends' worlds from Minecraft Java Edition with the ViaFabricPlus Bedrock add-on or ViaProxy. Free and open source.",
  github: "https://github.com/StackAnvil/patches",
  discord: "https://discord.gg/F4ZyEtXXge",
  curseforge:
    "https://www.curseforge.com/minecraft/mc-mods/stackanvil-bedrock-addon-for-viafabricplus",
  latestRelease: "https://github.com/StackAnvil/patches/releases/latest",
  issues: "https://github.com/StackAnvil/patches/issues",
  coverage: "https://github.com/StackAnvil/patches/blob/main/docs/bedrock-coverage.md",
} as const;

/** The Bedrock release the current stack targets, such as `1.26.60`. */
export const bedrockVersion = bedrockAssets.version.split(".").slice(0, 3).join(".");

export const homePage = { title: "Home", description: site.description };

export interface PageMetadata {
  title: string;
  description: string;
}

export function pageUrl(slug: string) {
  return slug === "index" ? "/" : `/${slug}/`;
}
