import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { fumadocsMdx } from "fumadocs-mdx/vite";
import { Schema } from "effect";
import { defineConfig } from "vite";

// Each series lists patch files, or entries with a file and an optional title.
const SeriesSchema = Schema.Record(
  Schema.String,
  Schema.Array(
    Schema.Union([
      Schema.String,
      Schema.Struct({ file: Schema.String, title: Schema.optionalKey(Schema.String) }),
    ]),
  ),
);

const docs = readdirSync(new URL("./content/docs", import.meta.url))
  .filter((file) => file.endsWith(".mdx"))
  .map((file) => `/${file.slice(0, -4)}/`);

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  plugins: [
    {
      name: "stackanvil-release",
      resolveId(id) {
        return id === "virtual:stackanvil-release" ? `\0${id}` : null;
      },
      load(id) {
        if (id !== "\0virtual:stackanvil-release") return null;
        try {
          return `export default ${readFileSync(new URL("./.generated/release.json", import.meta.url), "utf8")};`;
        } catch (error) {
          if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
          return "export default null;";
        }
      },
    },
    {
      // Upstream-bound patch titles, read from the repository's patch series.
      name: "stackanvil-patches",
      resolveId(id) {
        return id === "virtual:stackanvil-patches" ? `\0${id}` : null;
      },
      load(id) {
        if (id !== "\0virtual:stackanvil-patches") return null;
        const root = new URL("../patches/", import.meta.url);
        const projects = readdirSync(root, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map(({ name }) => {
            const series = Schema.decodeUnknownSync(SeriesSchema)(
              JSON.parse(readFileSync(new URL(`${name}/series.json`, root), "utf8")),
            );
            this.addWatchFile(fileURLToPath(new URL(`${name}/series.json`, root)));
            const patches = (["upstreamable", "deferred"] as const).flatMap((state) =>
              (series[state] ?? []).map((entry) => ({
                file: typeof entry === "string" ? entry : entry.file,
                state,
                title:
                  typeof entry !== "string" && entry.title
                    ? entry.title
                    : (typeof entry === "string" ? entry : entry.file)
                        .replace(/^\d+-/u, "")
                        .replace(/\.patch$/u, "")
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
