import { Schema } from "effect";

/** Returns the system error code, such as `ENOENT`, when the value carries one. */
export function errorCode(error: unknown): string | undefined {
  return typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
    ? error.code
    : undefined;
}

/** Narrows a string to one of the given literal values. */
export function isOneOf<const T extends string>(values: readonly T[], value: string): value is T {
  return values.some((candidate) => candidate === value);
}

/**
 * Parses JSON text and checks it against the schema. The parsed value is returned unchanged, so
 * unknown keys and key order survive a later write.
 */
export function parseJson<S extends Schema.Decoder<unknown>>(schema: S, text: string): S["Type"] {
  const value: unknown = JSON.parse(text);
  if (Schema.is(schema)(value)) return value;
  // Decode only to throw an error that names the failing path.
  Schema.decodeSync(schema)(value);
  throw new Error("JSON does not match the expected shape.");
}

/** A JSON object whose values are checked by the caller. */
export const JsonObjectSchema = Schema.Record(Schema.String, Schema.Unknown);

/** Checks for a plain JSON-style object. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Reads a string property, such as `stdout` on a failed child process error. */
export function stringProperty(value: unknown, key: string): string | undefined {
  const property = isRecord(value) ? value[key] : undefined;
  return typeof property === "string" ? property : undefined;
}

/** Returns the value, or throws a descriptive error when an expected value is missing. */
export function required<T>(value: T | undefined, description: string): T {
  if (value === undefined) throw new Error(`${description} is missing.`);
  return value;
}
