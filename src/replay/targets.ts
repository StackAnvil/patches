/** Explicit public targets let the lab inspect catalog experiences with dynamic endpoints. */
export function publicTarget(address: string | undefined): string {
  if (!address) throw new Error("Public recordings require --target host:port.");
  const netherNet = address.startsWith("nethernet://");
  let parsed: URL;
  try {
    parsed = new URL(netherNet ? address : `raknet://${address}`);
  } catch {
    throw new Error("Use host:port or nethernet://host:port for a public target.");
  }
  if (
    parsed.protocol !== (netherNet ? "nethernet:" : "raknet:") ||
    !parsed.hostname ||
    !/^[a-zA-Z0-9.[\]:-]+$/.test(parsed.hostname) ||
    !parsed.port ||
    Number(parsed.port) < 1 ||
    parsed.username ||
    parsed.password ||
    parsed.pathname ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error("Use host:port or nethernet://host:port for a public target.");
  }
  return `${netherNet ? "nethernet://" : ""}${parsed.hostname.toLowerCase()}:${parsed.port}`;
}

export function hiveTarget(address: string): boolean {
  const host = new URL(
    address.includes("://") ? address : `raknet://${address}`,
  ).hostname.toLowerCase();
  return (
    host === "hivebedrock.cloud" ||
    host.endsWith(".hivebedrock.cloud") ||
    host === "hivebedrock.network" ||
    host.endsWith(".hivebedrock.network")
  );
}

/** ViaProxy selects HTTP NetherNet for ordinary socket addresses. */
export function viaProxyTarget(address: string): string {
  return address.startsWith("nethernet://") ? address.slice("nethernet://".length) : address;
}
