/** Stop every video, then the proxy. A video that cannot finalize must not leave mitmdump running. */
export async function stopCaptureSession(
  videos: readonly (() => Promise<void>)[],
  proxy: () => Promise<void>,
): Promise<void> {
  const errors: unknown[] = [];
  for (const step of [...videos, proxy]) {
    try {
      await step();
    } catch (error) {
      errors.push(error);
    }
  }
  if (errors.length === 1) throw errors[0];
  if (errors.length > 1)
    throw new Error(
      errors.map((error) => (error instanceof Error ? error.message : String(error))).join(" "),
    );
}
