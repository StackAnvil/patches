const reserveBytes = 5 * 1024 ** 3;

/** Budget the full copy size because reflinks may be unavailable or later become private. */
export function requirePrivateCopySpace(bytes: number, available: number): void {
  if (!Number.isSafeInteger(bytes) || bytes < 0 || !Number.isFinite(available) || available < bytes + reserveBytes) {
    throw new Error("Private copies require their full file size plus 5 GiB of free disk reserve.");
  }
}
