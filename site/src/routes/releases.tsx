import { createFileRoute, Link, useHydrated } from "@tanstack/react-router";
import release from "virtual:stackanvil-release";
import { Suspense } from "react";
import { requireDocument } from "../lib/documents";
import { documentLoader } from "../lib/document-content";
import { pageHead } from "../lib/metadata";
import { NextSteps, SetupStage } from "../components/downloads";
import { releaseLink, type Setup } from "../lib/releases";
import { defaultSetup, setupGuides } from "../lib/setups";
import { site } from "../lib/site";

const page = requireDocument("releases");

export const Route = createFileRoute("/releases")({
  // TanStack merges the validated result over the raw query, so an unknown
  // setup must be overwritten. Omitting it would keep `?setup=bogus`.
  validateSearch: (search: Record<string, unknown>): { setup?: Setup | undefined } => ({
    setup:
      search["setup"] === "proxy" || search["setup"] === "fabric" || search["setup"] === "modpack"
        ? search["setup"]
        : undefined,
  }),
  loader: async () => {
    await (await import("../lib/document-content")).documentLoader.preload(page.path);
  },
  head: () => pageHead(page, "releases", release),
  component: Downloads,
});

function Downloads() {
  const search = Route.useSearch();
  const hydrated = useHydrated();
  // Static hosts serve the same HTML for every query. Match that HTML during
  // hydration, then apply the setup from a shared download link.
  const setup = hydrated ? (search.setup ?? defaultSetup) : defaultSetup;
  const navigate = Route.useNavigate();
  const details = documentLoader.useContent(page.path, { slug: "releases", details: true });
  return (
    <main id="main-content" className="downloads">
      <div className="page-heading shell-width">
        <h1 id="download-stackanvil">Download StackAnvil</h1>
        <p>
          Every setup joins the same Bedrock servers. Pick the one that fits the way you play Java
          Edition.
        </p>
      </div>
      <noscript>
        <p className="noscript-note shell-width">
          For all setup options, <a href={releaseLink(release)}>open the release assets</a> and{" "}
          <a href="/getting-started/">follow the play guide</a>.
        </p>
      </noscript>
      <div className="shell-width">
        <SetupStage
          setup={setup}
          release={release}
          hydrated={hydrated}
          heading="Pick a setup"
          headingId="selection-heading"
          onChange={(id) => {
            void navigate({ search: { setup: id }, resetScroll: false });
          }}
        />
      </div>
      <section className="steps-section shell-width" aria-labelledby="after-download">
        <div className="section-heading">
          <h2 id="after-download">After the download</h2>
          <p>
            <Link
              to="/$slug/"
              params={{ slug: "getting-started" }}
              hash={setupGuides[setup].guideHash}
            >
              Read the installation guide
            </Link>{" "}
            or <a href={site.discord}>get help on Discord</a>.
            {setup === "fabric" && (
              <>
                {" "}
                The add-on is also on <a href={site.curseforge}>CurseForge</a>.
              </>
            )}
          </p>
        </div>
        <NextSteps setup={setup} release={release} />
      </section>
      <section className="download-details shell-width" aria-label="Download and library details">
        <Suspense>{details}</Suspense>
      </section>
    </main>
  );
}
