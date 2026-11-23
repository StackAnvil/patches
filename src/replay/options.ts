const valueOptions = new Set([
  "--account",
  "--client",
  "--gui-scale",
  "--native-home",
  "--native-ice-address",
  "--seconds",
  "--target",
]);
const flagOptions = new Set([
  "--allow-hive",
  "--allow-transfers",
  "--modpack",
  "--native-manual-connect",
  "--shaders",
  "--software-rendering",
  "--transport-only",
]);

/** A misspelled, repeated, or incomplete option must not silently run a different session. */
export function requireSessionOptions(args: readonly string[]): void {
  const seen = new Set<string>();
  for (let index = 0; index < args.length; index++) {
    const name = args[index] ?? "";
    if (!valueOptions.has(name) && !flagOptions.has(name))
      throw new Error(`Unknown server-replay option: ${name}`);
    if (seen.has(name)) throw new Error(`Repeated server-replay option: ${name}`);
    seen.add(name);
    if (flagOptions.has(name)) continue;
    const value = args[index + 1];
    if (value === undefined || value.startsWith("--")) throw new Error(`${name} requires a value.`);
    index++;
  }
}
