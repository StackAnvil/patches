import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pageUrl, site } from "../src/lib/site";

interface HtmlPage {
  path: string;
  html: string;
  ids: Set<string>;
  links: string[];
  h1s: number;
  canonical?: string;
  description?: string | undefined;
  discord?: string;
}

async function inspect(path: string, html: string): Promise<HtmlPage> {
  const page: HtmlPage = { path, html, ids: new Set(), links: [], h1s: 0 };
  const parser = new HTMLRewriter()
    .on("[id]", {
      element(element) {
        const id = element.getAttribute("id");
        if (id !== null) page.ids.add(id);
      },
    })
    .on("a[href]", {
      element(element) {
        const href = element.getAttribute("href");
        if (href !== null) page.links.push(href);
      },
    })
    .on("script[src], img[src]", {
      element(element) {
        const src = element.getAttribute("src");
        if (src !== null) page.links.push(src);
      },
    })
    .on("link[href]", {
      element(element) {
        const href = element.getAttribute("href");
        if (href === null) return;
        page.links.push(href);
        if (element.getAttribute("rel") === "canonical") page.canonical = href;
      },
    })
    .on("h1", {
      element() {
        page.h1s++;
      },
    })
    .on('meta[name="description"]', {
      element(element) {
        page.description = element.getAttribute("content") ?? undefined;
      },
    })
    .on('script[id="discord:component-embed"]', {
      text(chunk) {
        page.discord = (page.discord ?? "") + chunk.text;
      },
    });
  await parser.transform(new Response(html)).text();
  return page;
}

async function verify(): Promise<void> {
  const root = resolve("dist/client");
  const docs = (await readdir("content/docs")).filter((file) => file.endsWith(".mdx"));
  const paths = ["/", ...docs.map((file) => pageUrl(file.slice(0, -4)))];
  const pages = new Map<string, HtmlPage>();
  for (const path of paths) {
    const html = await readFile(join(root, path, "index.html"), "utf8");
    const page = await inspect(path, html);
    if (page.h1s !== 1) throw new Error(`${path}: expected one H1, got ${page.h1s}`);
    if (page.canonical !== new URL(path, site.url).href)
      throw new Error(`${path}: missing or incorrect canonical URL`);
    if (!page.description) throw new Error(`${path}: missing page description`);
    if (!page.discord) throw new Error(`${path}: missing Discord component preview`);
    JSON.parse(page.discord);
    if (html.includes("{{") || html.includes("{:toc}") || html.includes("/_serverFn/"))
      throw new Error(`${path}: unresolved template or application-server dependency`);
    pages.set(path, page);
  }
  for (const page of pages.values()) {
    for (const href of page.links) {
      const url = new URL(href, new URL(page.path, site.url));
      if (url.origin !== site.url) continue;
      const targetPath = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
      const targetPage = pages.get(targetPath);
      if (targetPage) {
        if (url.hash && !targetPage.ids.has(decodeURIComponent(url.hash.slice(1))))
          throw new Error(`${page.path}: missing anchor ${href}`);
      } else if (!(await stat(join(root, url.pathname))).isFile()) {
        throw new Error(`${page.path}: missing static asset ${href}`);
      }
    }
  }
  for (const anchor of [
    "use-viaproxy",
    "use-viafabricplus-and-the-bedrock-add-on",
    "import-the-client-modpack",
    "if-something-does-not-work",
  ]) {
    if (!pages.get("/getting-started/")?.ids.has(anchor))
      throw new Error(`Missing published play-guide anchor: ${anchor}`);
  }
  for (const anchor of [
    "stackanvil",
    "choose-how-to-connect",
    "what-is-stackanvil",
    "build-or-contribute",
  ]) {
    if (!pages.get("/")?.ids.has(anchor))
      throw new Error(`Missing published homepage anchor: ${anchor}`);
  }
  const sitemap = await readFile(join(root, "sitemap.xml"), "utf8");
  for (const path of paths)
    if (!sitemap.includes(`<loc>${new URL(path, site.url).href}</loc>`))
      throw new Error(`Sitemap omits ${path}`);
  const search: unknown = JSON.parse(await readFile(join(root, "search-index.json"), "utf8"));
  if (!search || typeof search !== "object" || !("type" in search))
    throw new Error("Missing static search database");
  const notFound = await readFile(join(root, "404.html"), "utf8");
  if (!notFound.includes("Page not found") || !notFound.includes("noindex"))
    throw new Error("Missing static 404 page");
  for (const asset of ["robots.txt", ".nojekyll", "cf70432e5bef85bca3e57ade02b1d219.txt"])
    await stat(join(root, asset));
  process.stdout.write(
    `Verified ${pages.size} prerendered pages, internal links and anchors, metadata, search, sitemap, and static assets.\n`,
  );
}

if (import.meta.main) await verify();
