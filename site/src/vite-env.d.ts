/// <reference types="vite/client" />

declare module "virtual:stackanvil-release" {
  const release: import("./lib/releases").Release | null;
  export default release;
}

declare module "virtual:stackanvil-patches" {
  const projects: {
    project: string;
    patches: { state: "upstreamable" | "deferred"; title: string }[];
  }[];
  export default projects;
}
