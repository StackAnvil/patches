import { createFileRoute, Link, useHydrated } from "@tanstack/react-router";
import { ArrowDownToLine, Box, Check, ExternalLink, Folder, Layers, Server } from "lucide-react";
import release from "virtual:stackanvil-release";
import { Suspense } from "react";
import { getDocument } from "../lib/documents";
import { documentLoader } from "../lib/document-content";
import { pageHead } from "../lib/metadata";
import { releaseLink, setupDownloads, type Setup } from "../lib/releases";
import { site } from "../lib/site";

const page = getDocument("releases")!;
const setups = [
  { id: "proxy", title: "ViaProxy", detail: "Your regular Java client", icon: Server },
  { id: "fabric", title: "Fabric mods", detail: "ViaFabricPlus + add-on", icon: Box },
  { id: "modpack", title: "Client modpack", detail: "Prepared Fabric client", icon: Layers },
] as const;

const descriptions = {
  proxy: {
    title: "Your regular client. One proxy.",
    description:
      "Run the StackAnvil ViaProxy JAR beside Minecraft. Your Java client connects to ViaProxy, which connects to the Bedrock server.",
    instruction: "Run the JAR in its own folder. Keep ViaProxy open while you play.",
  },
  fabric: {
    title: "Two matching mods. One tested setup.",
    description:
      "Use ViaFabricPlus and the Bedrock add-on from the same StackAnvil release. The add-on includes the patched ViaBedrock and CubeConverter libraries.",
    instruction:
      "Install both JARs in your Fabric client's mods folder. Keep only one ViaFabricPlus JAR.",
  },
  modpack: {
    title: "A Fabric client, ready to import.",
    description:
      "The client modpack includes the tested ViaFabricPlus and Bedrock add-on JARs. It also selects Minecraft and Fabric Loader for you.",
    instruction:
      "Import the .mrpack into Modrinth App, Prism Launcher, or ATLauncher. Sign in with your Java Edition account.",
  },
} as const;

export const Route = createFileRoute("/releases")({
  validateSearch: (search: Record<string, unknown>): { setup?: Setup } => ({
    ...(search.setup === "proxy" || search.setup === "fabric" || search.setup === "modpack"
      ? { setup: search.setup }
      : {}),
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
  const setup = hydrated ? (search.setup ?? "proxy") : "proxy";
  const navigate = Route.useNavigate();
  const downloads = setupDownloads(release, setup);
  const current = descriptions[setup];
  const Content = documentLoader.getComponent(page.path);
  return (
    <main id="main-content" className="downloads content-width">
      <div className="page-heading">
        <h1 id="download-stackanvil">Choose your setup</h1>
        <p>Play on Bedrock servers from Java Edition. Start with the way you want to connect.</p>
      </div>
      <noscript>
        <p className="installation-note">
          For all setup options, <a href={releaseLink(release)}>open the release assets</a> and{" "}
          <a href="/getting-started/">follow the play guide</a>.
        </p>
      </noscript>
      <fieldset className="setup-selector" disabled={!hydrated}>
        <legend className="sr-only">Connection setup</legend>
        {setups.map(({ id, title, detail, icon: Icon }) => (
          <label key={id} className={`setup-choice ${setup === id ? "selected" : ""}`}>
            <input
              type="radio"
              name="setup"
              value={id}
              checked={setup === id}
              onChange={() => {
                void navigate({ search: { setup: id }, resetScroll: false });
              }}
            />
            <Icon size={25} />
            <span>
              <strong>{title}</strong>
              <span>{detail}</span>
            </span>
            {setup === id && <Check size={17} className="choice-check" />}
          </label>
        ))}
      </fieldset>
      <section className="download-selection" aria-labelledby="selection-heading">
        <div className="selection-heading">
          <div>
            <h2 id="selection-heading">{current.title}</h2>
            <p>{current.description}</p>
          </div>
          {release && (
            <a className="release-tag mono" href={release.url}>
              {release.tag}
              <ExternalLink size={13} />
            </a>
          )}
        </div>
        {release?.minecraft && setup !== "proxy" && (
          <p className="compatibility-line">
            Client modpack for Minecraft Java Edition <strong>{release.minecraft}</strong>. Check
            the release notes for the required Fabric Loader.
          </p>
        )}
        {downloads.length > 0 ? (
          <div className="download-list">
            {downloads.map(({ title, asset }) => (
              <div className="download-row" key={asset.name}>
                <Box size={25} className="download-icon" />
                <div>
                  <h3>{title}</h3>
                  <p className="mono filename">{asset.name}</p>
                </div>
                <span className="asset-size">{(asset.size / 1024 / 1024).toFixed(1)} MB</span>
                <a className="button primary" href={asset.url} aria-label={`Download ${title}`}>
                  <ArrowDownToLine size={17} />
                  Download
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="release-fallback">
            <h3>Get the files from GitHub</h3>
            <p>
              {release
                ? "Direct downloads for this setup are unavailable in this release. Check its assets and release notes before installing."
                : "We could not load a release snapshot for this site build. GitHub has the latest files and installation notes."}
            </p>
            <a className="button primary" href={releaseLink(release)}>
              View release assets
              <ExternalLink size={16} />
            </a>
          </div>
        )}
        <div className="installation-note">
          <Folder size={23} />
          <p>{current.instruction}</p>
        </div>
        <nav className="download-help" aria-label="Installation help">
          <Link
            to="/$slug/"
            params={{ slug: "getting-started" }}
            hash={setup === "proxy" ? "use-viaproxy" : "use-viafabricplus-and-the-bedrock-add-on"}
          >
            Read the installation guide
          </Link>
          <a href={site.discord}>Get help on Discord</a>
          <a href={site.curseforge}>Find the add-on on CurseForge</a>
        </nav>
      </section>
      <aside className="experimental-notice">
        <span className="notice-mark">!</span>
        <p>
          <strong>Experimental builds.</strong> StackAnvil is independent of ViaVersion. Test these
          builds before relying on them for a long play session.
        </p>
      </aside>
      <section className="download-details" aria-label="Download and library details">
        <Suspense>
          <Content slug="releases" details />
        </Suspense>
      </section>
    </main>
  );
}
