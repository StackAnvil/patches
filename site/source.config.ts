import { defineConfig, defineDocs } from "fumadocs-mdx/config";

export const docs = defineDocs({
  dir: "content/docs",
});

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      // github-dark comments measure 3.5:1 on the dark code background; this theme reaches 5.5:1.
      themes: { light: "github-light", dark: "github-dark-default" },
    },
  },
});
