import type { Root } from "fumadocs-core/page-tree";
import { pageUrl, type PageMetadata } from "./site";

const metadata = import.meta.glob<{ frontmatter: PageMetadata }>("../../content/docs/*.mdx", {
  eager: true,
  query: "?only=frontmatter",
});

// oxlint-disable-next-line oxc/no-map-spread -- copy so the imported MDX frontmatter stays unchanged
const documents = Object.entries(metadata).map(([path, { frontmatter }]) => ({
  ...frontmatter,
  path,
  slug: path.slice(path.lastIndexOf("/") + 1, -4),
}));

export function getDocument(slug: string) {
  return documents.find((page) => page.slug === slug);
}

export function requireDocument(slug: string) {
  const page = getDocument(slug);
  if (!page) throw new Error(`Missing documentation: ${slug}`);
  return page;
}

const play = ["getting-started", "releases"];
const develop = ["build-from-source", "projects", "libraries", "patch-workflow", "contributing"];

export const pageTree: Root = {
  name: "Documentation",
  children: [
    { type: "separator", name: "Play" },
    ...play.map((value) => item(value)),
    { type: "separator", name: "Develop" },
    ...develop.map((value) => item(value)),
  ],
};

function item(slug: string) {
  const page = requireDocument(slug);
  return {
    type: "page" as const,
    name:
      slug === "getting-started"
        ? "Getting started"
        : slug === "releases"
          ? "Downloads"
          : page.title,
    url: pageUrl(slug),
  };
}
