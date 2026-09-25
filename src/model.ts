import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

export const root = join(import.meta.dir, "..");

export interface Target {
  upstream: string;
  fork: string;
  baseBranch: string;
  baseSha: string;
  java: string;
  buildTask: string;
}

export interface Feature {
  file: string;
  title: string;
  sourcePr?: string;
}

export interface Series {
  branding: string[];
  features: Feature[];
  custom: string[];
}

export async function getTarget(id: string): Promise<Target> {
  const targets = JSON.parse(await readFile(join(root, "targets.json"), "utf8")) as Record<string, Target>;
  const target = targets[id];
  if (!target) throw new Error(`Unknown target ${id}. Choose: ${Object.keys(targets).join(", ")}`);
  return target;
}

export async function targetIds(): Promise<string[]> {
  return Object.keys(JSON.parse(await readFile(join(root, "targets.json"), "utf8")) as Record<string, Target>);
}

export async function getSeries(id: string): Promise<Series> {
  const series = JSON.parse(await readFile(join(root, "patches", id, "series.json"), "utf8")) as Series;
  const files = [
    ...series.branding.map((file) => join("branding", file)),
    ...series.features.map(({ file }) => join("features", file)),
    ...series.custom.map((file) => join("custom", file)),
  ];
  if (new Set(files).size !== files.length) throw new Error(`Duplicate patch in ${id}/series.json`);
  for (const file of files) {
    if (!file.endsWith(".patch")) throw new Error(`Invalid patch name: ${file}`);
    await readFile(join(root, "patches", id, file));
  }
  return series;
}

export function patchPaths(id: string, series: Series): string[] {
  return [
    ...series.branding.map((file) => join(root, "patches", id, "branding", file)),
    ...series.features.map(({ file }) => join(root, "patches", id, "features", file)),
    ...series.custom.map((file) => join(root, "patches", id, "custom", file)),
  ];
}

export async function listArtifacts(dir: string): Promise<string[]> {
  const libs = join(dir, "build", "libs");
  const entries = await readdir(libs, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".jar"))
    .map((entry) => join(libs, entry.name))
    .filter((path) => !/-(?:dev|sources|javadoc)\.jar$/i.test(path));
}
