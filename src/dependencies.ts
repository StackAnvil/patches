import type { Target } from "./model.ts";

export function buildOrder(targets: Record<string, Target>, requested: string): string[] {
  if (requested !== "all" && !targets[requested]) throw new Error(`Unknown target ${requested}`);
  const permanent = new Set<string>();
  const visiting = new Set<string>();
  const ordered: string[] = [];

  function visit(id: string): void {
    if (permanent.has(id)) return;
    if (visiting.has(id)) throw new Error(`Dependency cycle includes ${id}`);
    const target = targets[id];
    if (!target) throw new Error(`Unknown dependency ${id}`);
    visiting.add(id);
    for (const dependency of target.dependsOn) visit(dependency);
    visiting.delete(id);
    permanent.add(id);
    ordered.push(id);
  }

  for (const id of requested === "all" ? Object.keys(targets) : [requested]) visit(id);
  return ordered;
}
