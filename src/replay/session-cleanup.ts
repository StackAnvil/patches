export interface ReplaySessionCleanup {
  recordOwnership(): Promise<void>;
  stopProcesses(): Promise<void>;
  releaseDependencies(): Promise<void>;
  stopDisplay(): Promise<void>;
}

/** Evidence writes must not prevent teardown; live processes must retain their dependencies. */
export async function cleanupReplaySession(cleanup: ReplaySessionCleanup): Promise<void> {
  const errors: unknown[] = [];
  const attempt = async (action: () => Promise<void>): Promise<boolean> => {
    try {
      await action();
      return true;
    } catch (error) {
      errors.push(error);
      return false;
    }
  };
  await attempt(() => cleanup.recordOwnership());
  if (await attempt(() => cleanup.stopProcesses())) {
    await attempt(() => cleanup.releaseDependencies());
    await attempt(() => cleanup.stopDisplay());
  }
  if (errors.length === 1) throw errors[0];
  if (errors.length > 1) throw new AggregateError(errors, "Replay session cleanup failed.");
}
