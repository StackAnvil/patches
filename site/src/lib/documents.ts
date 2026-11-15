import type { Root } from "fumadocs-core/page-tree";
import { pageUrl, type PageMetadata } from "./site";

const metadata = import.meta.glob<{ frontmatter: PageMetadata }>("../../content/docs/*.mdx", {
  eager: true,
  query: "?only=frontmatter",
});

export const documents = Object.entries(metadata).map(([path, { frontmatter }]) => ({
  ...frontmatter,
  path,
  slug: path.split("/").at(-1)!.slice(0, -4),
}));

export function getDocument(slug: string) {
  return documents.find((page) => page.slug === slug);
}

const play = ["getting-started", "releases"];
const develop = ["build-from-source", "projects", "libraries", "patch-workflow", "contributing"];

export const pageTree: Root = {
  name: "Documentation",
  children: [
    { type: "separator", name: "Play" },
    ...play.map(item),
    { type: "separator", name: "Develop" },
    ...develop.map(item),
  ],
};

function item(slug: string) {
  const page = getDocument(slug);
  if (!page) throw new Error(`Missing documentation: ${slug}`);
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
