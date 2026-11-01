/** Explicit public targets let the lab inspect catalog experiences with dynamic endpoints. */
export function publicTarget(address: string | undefined): string {
  if (!address) throw new Error("Public recordings require --target host:port.");
  const error = "Use host:port, nethernet://host:port, or nethernet-xbox-json-rpc://network-id.";
  let parsed: URL;
  try {
    parsed = new URL(address.includes("://") ? address : `raknet://${address}`);
  } catch {
    throw new Error(error);
  }
  const networkId = parsed.protocol === "nethernet-xbox-json-rpc:";
  if (
    !["raknet:", "nethernet:", "nethernet-xbox-json-rpc:"].includes(parsed.protocol) ||
    !parsed.hostname ||
    !/^[a-zA-Z0-9.[\]:-]+$/.test(parsed.hostname) ||
    (networkId ? !!parsed.port : !parsed.port || Number(parsed.port) < 1) ||
    parsed.username ||
    parsed.password ||
    parsed.pathname ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error(error);
  }
  if (networkId) return `nethernet-xbox-json-rpc://${parsed.hostname}`;
  return `${parsed.protocol === "nethernet:" ? "nethernet://" : ""}${parsed.hostname.toLowerCase()}:${parsed.port}`;
}

export function hiveTarget(address: string): boolean {
  const host = new URL(
    address.includes("://") ? address : `raknet://${address}`,
  ).hostname.toLowerCase();
  return (
    host === "hivebedrock.cloud" ||
    host.endsWith(".hivebedrock.cloud") ||
    host === "hivebedrock.network" ||
    host.endsWith(".hivebedrock.network") ||
    host === "playhive.com" ||
    host.endsWith(".playhive.com")
  );
}

/** ViaProxy selects HTTP NetherNet for ordinary socket addresses. */
export function viaProxyTarget(address: string): string {
  return address.startsWith("nethernet://") ? address.slice("nethernet://".length) : address;
}
