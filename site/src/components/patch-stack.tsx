import { useEffect, useRef, useState, type PointerEvent } from "react";
import { stacks } from "./patch-stacks";

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

/** One block per patch that StackAnvil carries for an upstream project. */
export function PatchStack() {
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [readout, setReadout] = useState<Record<string, string>>({});
  useEffect(() => {
    const node = root.current;
    if (!node) return undefined;
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
    const title = event.target instanceof HTMLElement ? event.target.dataset.title : undefined;
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
                key={patch.file}
                className="patch-block"
                data-kind={kind(patch.title)}
                data-state={patch.state}
                data-title={patch.title}
                style={{ "--i": Math.min(index, 60) }}
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
