# StackAnvil website

The Jekyll source for [stackanvil.pistonmaster.net](https://stackanvil.pistonmaster.net) lives here. The site uses [Just the Docs](https://just-the-docs.github.io/just-the-docs/) with a StackAnvil color scheme and custom styles.

```bash
cd site
bundle install
bundle exec jekyll serve
```

Open `http://localhost:4000`. GitHub Actions builds and publishes this directory when `main` changes. The site uses `jekyll-sitemap` to create `/sitemap.xml` for Search Console.

The root-level IndexNow key file proves ownership of this host when you submit new or changed URLs to Bing. Keep the file in place for future submissions.
