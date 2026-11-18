import projects from "virtual:stackanvil-patches";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";

const names: Record<string, string> = {
  viabedrock: "ViaBedrock",
  "viafabricplus-bedrock": "Bedrock add-on",
  viaproxy: "ViaProxy",
  cubeconverter: "CubeConverter",
};

function kind(title: string) {
  if (title.startsWith("feat")) return "feat";
  if (title.startsWith("fix")) return "fix";
  return "other";
}

const stacks = projects
  .filter(({ patches }) => patches.length > 0)
  .toSorted((a, b) => b.patches.length - a.patches.length);

export const patchCount = stacks.reduce((sum, { patches }) => sum + patches.length, 0);

/** One block per patch that StackAnvil carries for an upstream project. */
export function PatchStack() {
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [readout, setReadout] = useState<Record<string, string>>({});
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  function inspect(project: string, event: PointerEvent) {
    const title = (event.target as HTMLElement).dataset.title;
    if (title) setReadout((current) => ({ ...current, [project]: title }));
  }
  return (
    <div className="patch-stacks" ref={root} data-visible={visible}>
      {stacks.map(({ project, patches }) => (
        <div className="patch-stack" key={project}>
          <div className="patch-stack-head">
            <h3>{names[project] ?? project}</h3>
            <span>
              {patches.length} {patches.length === 1 ? "patch" : "patches"}
            </span>
          </div>
          <div
            className="patch-blocks"
            onPointerOver={(event) => inspect(project, event)}
            aria-hidden="true"
          >
            {patches.map((patch, index) => (
              <span
                key={index}
                className="patch-block"
                data-kind={kind(patch.title)}
                data-state={patch.state}
                data-title={patch.title}
                style={{ "--i": Math.min(index, 60) } as CSSProperties}
              />
            ))}
          </div>
          <p className="patch-readout mono" aria-hidden="true">
            {readout[project] ?? patches[0]?.title}
          </p>
        </div>
      ))}
    </div>
  );
}
