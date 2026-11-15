import { createDiscordEmbed, serializeDiscordEmbed } from "../../../scripts/discord-embed";
import { homePage, pageUrl, site, type PageMetadata } from "./site";
import type { Release } from "./releases";

export function pageEmbed(
  page: { title: string; description?: string },
  slug: string,
  website: { title: string; url: string; description: string } = site,
  release?: { version: string; minecraft?: string },
) {
  return createDiscordEmbed({
    title: `${page.title} · ${website.title}`,
    description: [
      page.description ?? website.description,
      ...(slug === "releases" && release
        ? [
            `Release ${release.version}${release.minecraft ? ` · Minecraft ${release.minecraft}` : ""}`,
          ]
        : []),
    ].join("\n"),
    url: new URL(pageUrl(slug), website.url).href,
    label: slug === "releases" ? "View downloads" : "Read guide",
    links: [
      { label: "Latest release", url: site.latestRelease },
      { label: "Installation", url: new URL("/getting-started/", website.url).href },
    ],
  });
}

export function pageHead(
  page: PageMetadata = homePage,
  slug = "index",
  release: Release | null = null,
) {
  const title = page.title === "Home" ? site.title : `${page.title} · ${site.title}`;
  const url = new URL(pageUrl(slug), site.url).href;
  const image = new URL("/assets/images/social.png", site.url).href;
  const component = pageEmbed(
    page,
    slug,
    site,
    release ? { version: release.tag, minecraft: release.minecraft } : undefined,
  );
  return {
    meta: [
      { title },
      { name: "description", content: page.description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: site.title },
      { property: "og:title", content: title },
      { property: "og:description", content: page.description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: page.description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: component
      ? [
          {
            id: "discord:component-embed",
            type: "application/json",
            children: serializeDiscordEmbed(component),
          },
        ]
      : [],
  };
}
