/// <reference types="vite/client" />

declare module "virtual:stackanvil-release" {
  const release: import("./lib/releases").Release | null;
  export default release;
}
