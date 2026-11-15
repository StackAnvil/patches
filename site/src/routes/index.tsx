import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownToLine, BookOpen, Box, Code2, ExternalLink, Server } from "lucide-react";
import release from "virtual:stackanvil-release";
import { ConnectionDiagram } from "../components/connection-diagram";
import { pageHead } from "../lib/metadata";
import { homePage, site } from "../lib/site";

export const Route = createFileRoute("/")({
  head: () => pageHead(homePage, "index", release),
  component: Home,
});

function Home() {
  return (
    <main id="main-content" className="home content-width">
      <section className="hero">
        <div className="hero-copy">
          <h1 id="stackanvil">
            Your Java client.
            <br />
            Bedrock servers.
          </h1>
          <p className="hero-description">
            Play with ViaProxy or our ViaFabricPlus Bedrock add-on. Choose the setup that fits your
            Java client.
          </p>
          <div className="actions">
            <Link className="button primary" to="/releases/">
              <ArrowDownToLine size={18} />
              Get StackAnvil
            </Link>
            <Link className="button secondary" to="/$slug/" params={{ slug: "getting-started" }}>
              <BookOpen size={18} />
              Read the play guide
            </Link>
          </div>
          {release && (
            <p className="release-caption">
              <span className="status-dot" />
              <a href={release.url}>{release.tag}</a>
              {release.minecraft && <span>Minecraft {release.minecraft} client modpack</span>}
            </p>
          )}
        </div>
        <ConnectionDiagram />
      </section>

      <section className="connection-options" aria-labelledby="choose-how-to-connect">
        <div className="section-intro">
          <h2 id="choose-how-to-connect">Choose how to connect</h2>
          <p>Two ways to reach the same server.</p>
        </div>
        <div className="setup-grid">
          <article className="setup-card">
            <Server className="setup-icon" size={27} />
            <div>
              <h3>Use your regular client</h3>
              <p>
                Run ViaProxy beside Minecraft. Enter a Bedrock server address, then join through
                your usual Java client. No client mods needed.
              </p>
              <Link className="text-link" to="/releases/" search={{ setup: "proxy" }}>
                Get ViaProxy
              </Link>
            </div>
            <span className="setup-kind">Standalone proxy</span>
          </article>
          <article className="setup-card">
            <Box className="setup-icon" size={27} />
            <div>
              <h3>Play inside Fabric</h3>
              <p>
                Add ViaFabricPlus and the Bedrock add-on to your Fabric client. Connect in-game,
                with Friends, Realms, and LAN menus.
              </p>
              <Link className="text-link" to="/releases/" search={{ setup: "fabric" }}>
                Get the Fabric mods
              </Link>
            </div>
            <span className="setup-kind">Two matching mods</span>
          </article>
        </div>
        <p className="modpack-link">
          Prefer a prepared Fabric client?{" "}
          <Link to="/releases/" search={{ setup: "modpack" }}>
            Import the client modpack.
          </Link>
        </p>
      </section>

      <section className="project-intro" aria-labelledby="what-is-stackanvil">
        <div>
          <h2 id="what-is-stackanvil">
            Built together.
            <br /> Shared upstream.
          </h2>
          <p>
            StackAnvil publishes patched ViaProxy and Bedrock add-on builds, backed by ViaBedrock
            and CubeConverter. We share each change separately with the original projects for
            review.
          </p>
        </div>
        <div className="project-links">
          <Link to="/$slug/" params={{ slug: "projects" }}>
            Explore the projects<span>What each part does</span>
          </Link>
          <Link to="/$slug/" params={{ slug: "patch-workflow" }}>
            Follow the patch workflow<span>From local change to upstream review</span>
          </Link>
          <a href={site.github}>
            Browse the source
            <ExternalLink size={15} />
          </a>
        </div>
      </section>

      <section className="developer-strip">
        <Code2 size={26} />
        <div>
          <h2 id="build-or-contribute">Working on the code?</h2>
          <p>Build a stack, use a library, or contribute a focused patch.</p>
        </div>
        <nav aria-label="Developer guides">
          <Link to="/$slug/" params={{ slug: "build-from-source" }}>
            Build from source
          </Link>
          <Link to="/$slug/" params={{ slug: "libraries" }}>
            Maven &amp; Javadocs
          </Link>
          <Link to="/$slug/" params={{ slug: "contributing" }}>
            Contribute
          </Link>
        </nav>
      </section>
      <aside className="experimental-notice">
        <span className="notice-mark">!</span>
        <p>
          <strong>Independent, experimental builds.</strong> Some Bedrock behavior can still fail or
          differ from the Bedrock game. You play from Java Edition with either setup. StackAnvil
          does not turn a Java server into a Bedrock server or change your singleplayer worlds.
        </p>
      </aside>
    </main>
  );
}
