import { format } from "node:util";

/** Writes one line of command output to standard output, formatted like `console.log`. */
export function print(...values: unknown[]): void {
  process.stdout.write(`${format(...values)}\n`);
}

/** Writes one line of diagnostics to standard error, formatted like `console.error`. */
export function printError(...values: unknown[]): void {
  process.stderr.write(`${format(...values)}\n`);
}
