# StackAnvil website

The source for [stackanvil.pistonmaster.net](https://stackanvil.pistonmaster.net) lives here.
The site uses TanStack Start, Fumadocs, and Vite. GitHub Pages serves the static build.

## Run the site locally

Install Bun and Node.js 22.12 or later. From the repository root, run:

```bash
bun install --frozen-lockfile
bun run site:dev
```

Open `http://localhost:3000`. The development server reloads when you edit a page or component.

## Edit a guide

Edit Markdown or MDX files in `site/content/docs/`. Each file needs `title` and `description` fields in its front matter.
Fumadocs supplies code highlighting, copy buttons, callouts, the page contents list, and search.
Keep existing filenames and heading anchors when you update published guides.

Guide URLs use the filename at the site root. For example, `getting-started.mdx` publishes at `/getting-started/`.
Add new guides to the navigation in `site/src/lib/documents.ts`.
TanStack Start generates `site/src/routeTree.gen.ts` when you run or build the site. Do not edit that file.

Edit the homepage in `site/src/routes/index.tsx` and the download chooser in `site/src/routes/releases.tsx`.
Shared site details live in `site/src/lib/site.ts`, and the setup choices and their steps live in `site/src/lib/setups.ts`.
Colors, layout, and animations live in `site/src/styles/app.css`.
The homepage patch stacks read `patches/*/series.json` at build time, so they update with the next site build.

## Check the static build

From the repository root, run:

```bash
bun run check
bun test test/site-embeds.test.ts test/site-releases.test.ts
bun run site:build
bun run site:preview
```

The preview serves `site/dist/client/` at `http://localhost:3000`. It uses only exported files, including the 404 page.
Set `PORT` to use another preview port.

To run the desktop and mobile browser tests, install their browser once, then test the exported site:

```bash
cd site
bunx --no-install playwright install chromium --only-shell
cd ..
bun run site:test
```

Run `bun run site:build` again before these tests if you change the source.
Use `bun run --cwd site format` to format website changes.

The build checks published pages, internal links, heading anchors, canonical URLs, Discord previews, the sitemap, and the search index.
Search runs in the browser from `search-index.json`. Client navigation loads compiled guide modules without a running application server.

## Refresh downloads and publish

Each build fetches the latest public GitHub release and selects its download assets.
The Fabric chooser requires both JARs from that release. Incomplete or ambiguous asset lists use a link to the release instead.
If GitHub is unavailable, the site builds with links to GitHub releases. Set `GITHUB_TOKEN` to authenticate the build request.
The token stays in the build process and does not enter the exported site.

The Pages workflow publishes after website changes on `main`, a published release, or a successful release workflow.
You can also run **Publish website** manually in GitHub Actions to refresh the release snapshot.
Download information stays fixed until the next site build.

The build generates `sitemap.xml`. Keep the IndexNow key file in `site/public/` to preserve ownership verification.
Place other files that need stable public URLs in `site/public/`.
Keep local screenshots and design prototypes in the ignored `.stackanvil/` directory.
