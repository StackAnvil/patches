import { Link } from "@tanstack/react-router";
import { ArrowDownToLine, Cable, ExternalLink, Package, Puzzle } from "lucide-react";
import type { CSSProperties } from "react";
import { releaseLink, setupDownloads, type Release, type Setup } from "../lib/releases";
import { formatSize, setupGuides, setupOrder } from "../lib/setups";
import { ForgeScene } from "./forge-scene";

const icons = { proxy: Cable, fabric: Puzzle, modpack: Package } as const;

export function SetupSwitch({
  setup,
  onChange,
  disabled,
  name,
}: {
  setup: Setup;
  onChange: (setup: Setup) => void;
  disabled?: boolean;
  name: string;
}) {
  return (
    <fieldset
      className="setup-switch"
      disabled={disabled}
      style={{ "--index": setupOrder.indexOf(setup) } as CSSProperties}
    >
      <legend className="sr-only">Connection setup</legend>
      <span className="switch-thumb" aria-hidden="true" />
      {setupOrder.map((id) => {
        const guide = setupGuides[id];
        const Icon = icons[id];
        return (
          <label key={id} className="switch-option" data-selected={setup === id}>
            <input
              type="radio"
              name={name}
              value={id}
              checked={setup === id}
              onChange={() => onChange(id)}
            />
            <Icon size={20} aria-hidden="true" />
            <span>
              <strong>{guide.name}</strong>
              <small>{guide.short}</small>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

export function DownloadFiles({ release, setup }: { release: Release | null; setup: Setup }) {
  const downloads = setupDownloads(release, setup);
  if (downloads.length === 0)
    return (
      <div className="download-fallback">
        <p>
          {release
            ? "Direct downloads for this setup are missing from the latest release. Its asset list has the files and notes."
            : "This site build has no release snapshot. GitHub has the latest files and notes."}
        </p>
        <a className="button forge" href={releaseLink(release)}>
          Open the latest release
          <ExternalLink size={16} aria-hidden="true" />
        </a>
      </div>
    );
  return (
    <ul className="download-files">
      {downloads.map(({ title, asset }) => (
        <li key={asset.name}>
          <a className="download-chip" href={asset.url} aria-label={`Download ${title}`}>
            <span className="chip-icon">
              <ArrowDownToLine size={20} aria-hidden="true" />
            </span>
            <span className="chip-text">
              <strong>{title}</strong>
              <span className="mono">{asset.name}</span>
            </span>
            <span className="chip-size">{formatSize(asset.size)}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function NextSteps({ setup, release }: { setup: Setup; release: Release | null }) {
  return (
    <ol className="next-steps" key={setup}>
      {setupGuides[setup].steps(release?.minecraft).map((step, index) => (
        <li key={step} style={{ "--step": index } as CSSProperties}>
          <span className="step-number" aria-hidden="true">
            {index + 1}
          </span>
          <p>{step}</p>
        </li>
      ))}
    </ol>
  );
}

/** The setup chooser: pick a setup, watch the route change, download its files. */
export function SetupStage({
  setup,
  onChange,
  release,
  hydrated,
  heading,
  headingId,
}: {
  setup: Setup;
  onChange: (setup: Setup) => void;
  release: Release | null;
  hydrated: boolean;
  heading: string;
  headingId: string;
}) {
  const guide = setupGuides[setup];
  return (
    <section className="stage" aria-labelledby={headingId}>
      <div className="stage-top">
        <h2 id={headingId}>{heading}</h2>
        <SetupSwitch
          name={`${headingId}-setup`}
          setup={setup}
          onChange={onChange}
          disabled={!hydrated}
        />
      </div>
      <ForgeScene setup={setup} minecraft={release?.minecraft} />
      <div className="stage-bottom">
        <div className="stage-copy" key={setup}>
          <h3>{guide.title}</h3>
          <p>{guide.description}</p>
          {release?.minecraft && setup !== "proxy" && (
            <p className="compatibility-line">
              For Minecraft Java Edition <strong>{release.minecraft}</strong>. The release notes
              list the required Fabric Loader.
            </p>
          )}
        </div>
        <div className="stage-downloads">
          <DownloadFiles release={release} setup={setup} />
          <p className="stage-links">
            <Link to="/$slug/" params={{ slug: "getting-started" }} hash={guide.guideHash}>
              Setup guide
            </Link>
            {release && (
              <a className="mono" href={release.url}>
                {release.tag}
              </a>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
