import { expect } from "bun:test";

// Bun declares `expect(...).rejects` matchers as void, so awaiting them fails type-aware lint.
export async function expectRejection(promise: Promise<unknown>, message?: string) {
  const error = await promise.then(
    () => undefined,
    (cause: unknown) => cause,
  );
  expect(error).toBeInstanceOf(Error);
  if (message !== undefined) expect((error as Error).message).toContain(message);
}
