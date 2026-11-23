import { createFileRoute, Link, useHydrated } from "@tanstack/react-router";
import { ArrowDownToLine, GitPullRequestArrow, Server, Sparkles } from "lucide-react";
import release from "virtual:stackanvil-release";
import { useState } from "react";
import { NextSteps, SetupStage } from "../components/downloads";
import { Faq } from "../components/faq";
import { FeatureHotbar } from "../components/hotbar";
import { PatchStack } from "../components/patch-stack";
import { patchCount } from "../components/patch-stacks";
import { pageHead } from "../lib/metadata";
import type { Setup } from "../lib/releases";
import { setupGuides } from "../lib/setups";
import { bedrockVersion, homePage, site } from "../lib/site";

export const Route = createFileRoute("/")({
  head: () => pageHead(homePage, "index", release),
  component: Home,
});

const releaseDate = release?.publishedAt
  ? new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(
      new Date(release.publishedAt),
    )
  : undefined;

const questions = [
  {
    question: "Does the server need to install anything?",
    answer: "No. StackAnvil runs on your computer. The server sees an ordinary Bedrock connection.",
  },
  {
    question: "Do I need a Bedrock account?",
    answer:
      "You need a Java Edition account to play. Servers in online mode, Realms, and Bedrock Friends also need a Microsoft sign-in for Bedrock. ViaProxy has an Accounts tab for it, and ViaFabricPlus has Bedrock settings.",
  },
  {
    question: "Which versions does it support?",
    answer: `The current stack targets Bedrock ${bedrockVersion}${release?.minecraft ? `. The Fabric setups use Minecraft Java Edition ${release.minecraft}` : ""}. Choose the Bedrock version the server uses in ViaProxy or ViaFabricPlus.`,
  },
  {
    question: "Does it change my singleplayer worlds?",
    answer:
      "No. StackAnvil only changes how your client talks to a Bedrock server. It does not convert worlds or turn a Java server into a Bedrock server.",
  },
  {
    question: "Does it work on Windows and macOS?",
    answer:
      "ViaProxy and the Fabric mods are Java programs, so they run where Minecraft Java Edition runs. Most testing so far happens on Linux. Tell us on Discord if something fails on your system.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes. StackAnvil and the projects it builds on are open source. You can read every change on GitHub.",
  },
];

function Home() {
  const hydrated = useHydrated();
  const [setup, setSetup] = useState<Setup>("proxy");
  return (
    <main id="main-content" className="home">
      <section className="hero">
        <div className="hero-intro shell-width">
          <h1 id="stackanvil">Play Bedrock servers from Java Edition</h1>
          <div>
            <p className="lead">
              StackAnvil translates between the two editions on your computer. Keep your Java client
              and join Bedrock servers, Realms, and friends&apos; worlds.
            </p>
            <ul className="hero-facts">
              <li>
                <Server size={18} aria-hidden="true" />
                Nothing to install on the server
              </li>
              <li>
                <Sparkles size={18} aria-hidden="true" />
                Free and open source
              </li>
            </ul>
          </div>
        </div>
        <div className="shell-width">
          <SetupStage
            setup={setup}
            onChange={setSetup}
            release={release}
            hydrated={hydrated}
            heading="How do you want to play?"
            headingId="choose-how-to-connect"
          />
        </div>
      </section>

      <section className="steps-section shell-width" aria-labelledby="first-join">
        <div className="section-heading">
          <h2 id="first-join">Three steps to your first join</h2>
          <p>
            Steps for {setupGuides[setup].name}. Switch the setup above to see the others.{" "}
            <Link
              to="/$slug/"
              params={{ slug: "getting-started" }}
              hash={setupGuides[setup].guideHash}
            >
              Read the full guide
            </Link>
          </p>
        </div>
        <NextSteps setup={setup} release={release} />
      </section>

      <section className="works-section" aria-labelledby="what-works">
        <div className="shell-width works-layout">
          <div className="works-intro">
            <div className="section-heading">
              <h2 id="what-works">What already works</h2>
              <p>
                StackAnvil targets Bedrock {bedrockVersion}. Pick a slot to see what it translates.
              </p>
            </div>
            <aside className="experimental-note" aria-label="Experimental builds">
              <p>
                <strong>Still experimental.</strong> Some Bedrock behavior still fails or looks
                different, and no area matches the Bedrock game exactly yet.
              </p>
              <p className="note-links">
                <a href={site.coverage}>Known gaps</a>
                <a href={site.issues}>Report a problem</a>
              </p>
            </aside>
          </div>
          <FeatureHotbar />
        </div>
      </section>

      <section className="upstream-section shell-width" aria-labelledby="what-is-stackanvil">
        <div className="upstream-copy">
          <h2 id="what-is-stackanvil">Every fix goes back upstream</h2>
          <p>
            StackAnvil carries {patchCount} changes to the projects it builds on, one patch each.
            Every patch goes to its original project for review, so fixes reach everyone who uses
            them. Point at a block to read its patch.
          </p>
          <ul className="patch-legend" aria-label="Legend">
            <li data-kind="feat">Feature</li>
            <li data-kind="fix">Fix</li>
            <li data-kind="other">Build or other</li>
            <li data-state="deferred">Covered by another upstream PR</li>
          </ul>
          <nav id="build-or-contribute" className="dev-links" aria-label="Developer guides">
            <Link to="/$slug/" params={{ slug: "patch-workflow" }}>
              <GitPullRequestArrow size={17} aria-hidden="true" />
              Patch workflow
            </Link>
            <Link to="/$slug/" params={{ slug: "build-from-source" }}>
              Build from source
            </Link>
            <Link to="/$slug/" params={{ slug: "libraries" }}>
              Maven and Javadocs
            </Link>
            <Link to="/$slug/" params={{ slug: "contributing" }}>
              Contribute
            </Link>
          </nav>
        </div>
        <PatchStack />
      </section>

      <section className="faq-section shell-width" aria-labelledby="questions">
        <div className="section-heading">
          <h2 id="questions">Questions before you start</h2>
          <p>
            Something else? <a href={site.discord}>Ask on Discord</a>.
          </p>
        </div>
        <Faq items={questions} />
      </section>

      <section className="finale" aria-labelledby="latest-build">
        <div className="finale-sparks" aria-hidden="true">
          {Array.from({ length: 16 }, (_, index) => (
            <span key={index} style={{ "--n": index }} />
          ))}
        </div>
        <div className="shell-width finale-inner">
          <h2 id="latest-build">Your server list just got longer</h2>
          <p>
            {release
              ? `${release.tag} is ready${releaseDate ? `, released ${releaseDate}` : ""}.`
              : "The latest release is on GitHub."}{" "}
            If you get stuck, the Discord can help.
          </p>
          <div className="actions">
            <Link className="button forge large" to="/releases/" search={{ setup }}>
              <ArrowDownToLine size={20} aria-hidden="true" />
              Get {setupGuides[setup].name}
            </Link>
            <a className="button ghost large" href={site.discord}>
              Join the Discord
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
