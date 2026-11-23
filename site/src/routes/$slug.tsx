import { createFileRoute, notFound } from "@tanstack/react-router";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { Suspense } from "react";
import { getDocument, pageTree } from "../lib/documents";
import { documentLoader } from "../lib/document-content";
import { pageHead } from "../lib/metadata";
import { site } from "../lib/site";

export const Route = createFileRoute("/$slug")({
  loader: async ({ params }) => {
    const page = getDocument(params.slug);
    // oxlint-disable-next-line typescript/only-throw-error -- TanStack Router expects the notFound() object to be thrown
    if (!page) throw notFound();
    await (await import("../lib/document-content")).documentLoader.preload(page.path);
    return { path: page.path, slug: page.slug, title: page.title, description: page.description };
  },
  head: ({ loaderData }) =>
    loaderData
      ? pageHead(loaderData, loaderData.slug)
      : {
          meta: [{ title: "Page not found · StackAnvil" }, { name: "robots", content: "noindex" }],
        },
  component: DocumentPage,
});

function DocumentPage() {
  const page = Route.useLoaderData();
  const content = documentLoader.useContent(page.path, { slug: page.slug });
  return (
    <div id="main-content" className="docs-shell" tabIndex={-1}>
      <DocsLayout
        tree={pageTree}
        nav={{ title: "Documentation", url: "/getting-started/" }}
        themeSwitch={{ enabled: false }}
        searchToggle={{ enabled: false }}
        links={[]}
        sidebar={{
          footer: (
            <a className="sidebar-community" href={site.discord}>
              Stuck on a step?
              <span>Ask on Discord</span>
            </a>
          ),
        }}
      >
        <Suspense fallback={<p>Loading guide…</p>}>{content}</Suspense>
      </DocsLayout>
    </div>
  );
}
