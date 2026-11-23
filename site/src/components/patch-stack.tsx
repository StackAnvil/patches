import { useEffect, useRef, useState, type PointerEvent } from "react";
import { stacks } from "./patch-stacks";

const names: Record<string, string> = {
  viabedrock: "ViaBedrock",
  "viafabricplus-bedrock": "Bedrock add-on",
  viaproxy: "ViaProxy",
  cubeconverter: "CubeConverter",
};

/** Stacks this small list their titles instead of a row of blocks. */
const listLimit = 6;

type Patch = (typeof stacks)[number]["patches"][number];

function kind(title: string) {
  if (title.startsWith("feat")) return "feat";
  if (title.startsWith("fix")) return "fix";
  return "other";
}

function count(value: number, one: string, many: string) {
  return `${value} ${value === 1 ? one : many}`;
}

/** The legend in words, so a stack reads without hovering a block. */
function breakdown(patches: Patch[]) {
  const counts = { feat: 0, fix: 0, other: 0, deferred: 0 };
  for (const patch of patches)
    counts[patch.state === "deferred" ? "deferred" : kind(patch.title)]++;
  return [
    counts.feat && count(counts.feat, "feature", "features"),
    counts.fix && count(counts.fix, "fix", "fixes"),
    counts.other && `${counts.other} build or other`,
    counts.deferred && `${counts.deferred} covered elsewhere`,
  ]
    .filter(Boolean)
    .join(" · ");
}

/** One block per patch that StackAnvil carries for an upstream project. */
export function PatchStack() {
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<Record<string, string>>({});
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    if (root.current) observer.observe(root.current);
    return () => {
      observer.disconnect();
    };
  }, []);
  // Touch input fires pointerover on tap, so this also serves phones.
  function inspect(project: string, event: PointerEvent) {
    const file = event.target instanceof HTMLElement ? event.target.dataset["file"] : undefined;
    if (file) setSelected((current) => ({ ...current, [project]: file }));
  }
  return (
    <div className="patch-stacks" ref={root} data-visible={visible}>
      {stacks.map(({ project, patches }) => {
        const listed = patches.length <= listLimit;
        const active = patches.find(({ file }) => file === selected[project]);
        return (
          <div className="patch-stack" key={project}>
            <div className="patch-stack-head">
              <h3>{names[project] ?? project}</h3>
              <span>{count(patches.length, "patch", "patches")}</span>
            </div>
            {listed ? (
              <ul className="patch-list mono">
                {patches.map((patch) => (
                  <li
                    key={patch.file}
                    className="patch-item"
                    data-kind={kind(patch.title)}
                    data-state={patch.state}
                  >
                    {patch.title}
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <div
                  className="patch-blocks"
                  onPointerOver={(event) => {
                    inspect(project, event);
                  }}
                  aria-hidden="true"
                >
                  {patches.map((patch, index) => (
                    <span
                      key={patch.file}
                      className="patch-block"
                      data-kind={kind(patch.title)}
                      data-state={patch.state}
                      data-file={patch.file}
                      data-active={patch === active}
                      style={{ "--i": Math.min(index, 60) }}
                    />
                  ))}
                </div>
                <p className="patch-readout" data-selected={active !== undefined}>
                  {active?.title ?? breakdown(patches)}
                </p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
