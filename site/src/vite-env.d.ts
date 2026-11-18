/// <reference types="vite/client" />

declare module "virtual:stackanvil-release" {
  // oxlint-disable-next-line typescript/consistent-type-imports -- ambient module declarations cannot import a relative module
  const release: import("./lib/releases").Release | null;
  export default release;
}

declare module "virtual:stackanvil-patches" {
  const projects: {
    project: string;
    patches: { file: string; state: "upstreamable" | "deferred"; title: string }[];
  }[];
  export default projects;
}
