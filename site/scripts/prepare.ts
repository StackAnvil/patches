import { mkdir, readdir, writeFile } from "node:fs/promises";
import { Effect, Schema } from "effect";
import { parseRelease } from "../src/lib/releases";
import { pageUrl, site } from "../src/lib/site";

async function fetchRelease() {
  try {
    const token = process.env["GITHUB_TOKEN"];
    const response = await fetch(
      "https://api.github.com/repos/StackAnvil/patches/releases/latest",
      {
        signal: AbortSignal.timeout(10_000),
        headers: {
          Accept: "application/vnd.github+json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );
    if (!response.ok) {
      process.stderr.write(
        `Release snapshot unavailable (HTTP ${response.status}); using GitHub release links.\n`,
      );
      return null;
    }
    const release = parseRelease(await response.json());
    if (!release)
      process.stderr.write("Release metadata is invalid; using GitHub release links.\n");
    return release;
  } catch {
    process.stderr.write("Release snapshot unavailable; using GitHub release links.\n");
    return null;
  }
}

/** Preparing the release snapshot, sitemap, or page list failed. */
// oxlint-disable-next-line unicorn/throw-new-error -- Schema.TaggedError is a class factory.
class PrepareError extends Schema.TaggedError<PrepareError, { readonly brand: unique symbol }>()(
  "PrepareError",
  {
    message: Schema.String,
    cause: Schema.Unknown,
  },
) {}

function prepareStep<A>(step: () => Promise<A>) {
  return Effect.tryPromise({
    try: step,
    catch: (cause) =>
      PrepareError.make({ message: cause instanceof Error ? cause.message : String(cause), cause }),
  });
}

const prepare = Effect.gen(function* () {
  const release = yield* prepareStep(fetchRelease);
  yield* prepareStep(() => mkdir(".generated", { recursive: true }));
  yield* prepareStep(() =>
    writeFile(".generated/release.json", `${JSON.stringify(release, null, 2)}\n`),
  );
  const files = yield* prepareStep(() => readdir("content/docs"));
  const paths = [
    "/",
    ...files.filter((file) => file.endsWith(".mdx")).map((file) => pageUrl(file.slice(0, -4))),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
    .toSorted()
    .map((path) => `  <url><loc>${new URL(path, site.url).href}</loc></url>`)
    .join("\n")}\n</urlset>\n`;
  yield* prepareStep(() => writeFile("public/sitemap.xml", sitemap));
  process.stdout.write(
    `Prepared ${paths.length} public pages${release ? ` with release ${release.tag}` : " with release-link fallbacks"}.\n`,
  );
});

if (import.meta.main) await Effect.runPromise(prepare);
