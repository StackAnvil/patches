import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { fumadocsMdx } from "fumadocs-mdx/vite";
import { defineConfig } from "vite";

const docs = readdirSync(new URL("./content/docs", import.meta.url))
  .filter((file) => file.endsWith(".mdx"))
  .map((file) => `/${file.slice(0, -4)}/`);

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  plugins: [
    {
      name: "stackanvil-release",
      resolveId(id) {
        if (id === "virtual:stackanvil-release") return `\0${id}`;
      },
      load(id) {
        if (id !== "\0virtual:stackanvil-release") return;
        try {
          return `export default ${readFileSync(new URL("./.generated/release.json", import.meta.url), "utf8")};`;
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
          return "export default null;";
        }
      },
    },
    {
      // Upstream-bound patch titles, read from the repository's patch series.
      name: "stackanvil-patches",
      resolveId(id) {
        if (id === "virtual:stackanvil-patches") return `\0${id}`;
      },
      load(id) {
        if (id !== "\0virtual:stackanvil-patches") return;
        const root = new URL("../patches/", import.meta.url);
        const projects = readdirSync(root, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map(({ name }) => {
            const series = JSON.parse(
              readFileSync(new URL(`${name}/series.json`, root), "utf8"),
            ) as Record<string, (string | { file: string; title?: string })[]>;
            this.addWatchFile(fileURLToPath(new URL(`${name}/series.json`, root)));
            const patches = (["upstreamable", "deferred"] as const).flatMap((state) =>
              (series[state] ?? []).map((entry) => ({
                file: typeof entry === "string" ? entry : entry.file,
                state,
                title:
                  typeof entry !== "string" && entry.title
                    ? entry.title
                    : (typeof entry === "string" ? entry : entry.file)
                        .replace(/^\d+-/, "")
                        .replace(/\.patch$/, "")
                        .replaceAll("-", " "),
              })),
            );
            return { project: name, patches };
          });
        return `export default ${JSON.stringify(projects)};`;
      },
    },
    fumadocsMdx(),
    tailwindcss(),
    tanstackStart({
      router: { quoteStyle: "double", semicolons: true },
      prerender: {
        enabled: true,
        autoSubfolderIndex: true,
        crawlLinks: false,
        autoStaticPathsDiscovery: false,
        failOnError: true,
      },
      pages: [
        { path: "/" },
        ...docs.map((path) => ({ path })),
        { path: "/search-index.json", prerender: { outputPath: "/search-index.json" } },
        { path: "/404", prerender: { outputPath: "/404.html" } },
      ],
    }),
    react(),
  ],
});
