import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { parsePatchMessage } from "./patch-message.ts";

export const root = join(import.meta.dir, "..");

export interface Target {
  dependsOn: string[];
  upstream: string;
  fork: string;
  prAssignees: string[];
  baseBranch: string;
  baseSha: string;
  java: string;
  publication: string;
  buildTask: string;
}

export interface UpstreamablePatch {
  file: string;
  title: string;
}

export interface DeferredPatch {
  file: string;
  reason: string;
}

export interface Series {
  setup: string[];
  upstreamable: UpstreamablePatch[];
  deferred: DeferredPatch[];
}

export async function getTargets(): Promise<Record<string, Target>> {
  return JSON.parse(await readFile(join(root, "targets.json"), "utf8")) as Record<string, Target>;
}

export async function getTarget(id: string): Promise<Target> {
  const targets = await getTargets();
  const target = targets[id];
  if (!target) throw new Error(`Unknown target ${id}. Choose: ${Object.keys(targets).join(", ")}`);
  return target;
}

export async function targetIds(): Promise<string[]> {
  return Object.keys(await getTargets());
}

export async function getSeries(id: string): Promise<Series> {
  const series = JSON.parse(await readFile(join(root, "patches", id, "series.json"), "utf8")) as Series;
  const files = [
    ...series.setup.map((file) => join("setup", file)),
    ...series.upstreamable.map(({ file }) => join("upstreamable", file)),
    ...series.deferred.map(({ file }) => join("deferred", file)),
  ];
  if (new Set(files).size !== files.length) throw new Error(`Duplicate patch in ${id}/series.json`);
  for (const file of files) {
    if (!file.endsWith(".patch")) throw new Error(`Invalid patch name: ${file}`);
    const patch = await readFile(join(root, "patches", id, file), "utf8");
    const upstreamable = series.upstreamable.find(({ file: name }) => file === join("upstreamable", name));
    if (upstreamable) {
      const message = parsePatchMessage(patch);
      if (upstreamable.title !== message.title) throw new Error(`${file} subject differs from its title in ${id}/series.json`);
      if (!message.description) throw new Error(`${file} needs a commit body describing the change`);
    }
  }
  for (const deferred of series.deferred) {
    if (typeof deferred.reason !== "string" || !deferred.reason.trim()) {
      throw new Error(`${id}/deferred/${deferred.file} needs a reason in series.json`);
    }
  }
  return series;
}

export function patchPaths(id: string, series: Series): string[] {
  return [
    ...series.setup.map((file) => join(root, "patches", id, "setup", file)),
    ...series.upstreamable.map(({ file }) => join(root, "patches", id, "upstreamable", file)),
    ...series.deferred.map(({ file }) => join(root, "patches", id, "deferred", file)),
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
