import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Effect } from "effect";
import { createDiscordEmbed, serializeDiscordEmbed } from "./discord-embed";

export function pageEmbed(
  frontmatter: { title: string; description?: string },
  slug: string,
  site: { title: string; url: string; description: string },
  release?: { version: string; minecraft?: string },
) {
  return createDiscordEmbed({
    title: `${frontmatter.title} · ${site.title}`,
    description: [
      frontmatter.description ?? site.description,
      ...(slug === "releases" && release
        ? [
            `Release ${release.version}${release.minecraft ? ` · Minecraft ${release.minecraft}` : ""}`,
          ]
        : []),
    ].join("\n"),
    url: new URL(slug === "index" ? "/" : `/${slug}/`, site.url).href,
    label: slug === "releases" ? "View downloads" : "Read guide",
    links: [
      { label: "Latest release", url: "https://github.com/StackAnvil/patches/releases/latest" },
      { label: "Installation", url: new URL("/getting-started/", site.url).href },
    ],
  });
}

async function latestRelease() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const response = await fetch(
      "https://api.github.com/repos/StackAnvil/patches/releases/latest",
      {
        signal: AbortSignal.timeout(5000),
        headers: {
          Accept: "application/vnd.github+json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );
    if (!response.ok) return undefined;
    const release: unknown = await response.json();
    if (
      typeof release !== "object" ||
      !release ||
      !("tag_name" in release) ||
      typeof release.tag_name !== "string"
    )
      return undefined;
    const assets = "assets" in release && Array.isArray(release.assets) ? release.assets : [];
    const minecraft = assets.flatMap((asset: unknown) =>
      typeof asset === "object" && asset && "name" in asset && typeof asset.name === "string"
        ? (asset.name.match(/^StackAnvil-(.+)\.mrpack$/)?.[1] ?? [])
        : [],
    )[0];
    return { version: release.tag_name, minecraft };
  } catch {
    return undefined;
  }
}

const generate = Effect.gen(function* () {
  const site = Bun.YAML.parse(yield* Effect.tryPromise(() => readFile("site/_config.yml", "utf8")));
  if (
    typeof site !== "object" ||
    !site ||
    !("title" in site) ||
    !("url" in site) ||
    !("description" in site) ||
    typeof site.title !== "string" ||
    typeof site.url !== "string" ||
    typeof site.description !== "string"
  )
    throw new Error("Invalid site metadata");
  const release = yield* Effect.tryPromise(latestRelease);
  const entries: Record<string, string> = {};
  for (const filename of yield* Effect.tryPromise(() => readdir("site"))) {
    if (!filename.endsWith(".md") || filename === "README.md" || filename === "404.md") continue;
    const content = yield* Effect.tryPromise(() => readFile(join("site", filename), "utf8"));
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match?.[1]) continue;
    const page = Bun.YAML.parse(match[1]);
    if (typeof page !== "object" || !page || !("title" in page) || typeof page.title !== "string")
      continue;
    const component = pageEmbed(
      {
        title: page.title,
        description:
          "description" in page && typeof page.description === "string"
            ? page.description
            : undefined,
      },
      filename.slice(0, -3),
      { title: site.title, url: site.url, description: site.description },
      release,
    );
    if (component) entries[filename] = serializeDiscordEmbed(component);
  }
  yield* Effect.tryPromise(() => mkdir("site/_data", { recursive: true }));
  yield* Effect.tryPromise(() =>
    writeFile("site/_data/discord_embeds.json", JSON.stringify(entries, null, 2) + "\n"),
  );
  console.log(`Generated Discord previews for ${Object.keys(entries).length} pages`);
});

if (import.meta.main) await Effect.runPromise(generate);
