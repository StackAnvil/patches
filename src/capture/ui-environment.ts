/** Keep one display binding for the entire UI command, including window selection. */
export function captureUiEnvironment(
  ownedDisplay: () => Promise<NodeJS.ProcessEnv | undefined>,
  desktopEnvironment: NodeJS.ProcessEnv,
): () => Promise<NodeJS.ProcessEnv> {
  let environment: Promise<NodeJS.ProcessEnv> | undefined;
  return () => environment ??= ownedDisplay().then((isolated) => {
    if (isolated) return isolated;
    if (desktopEnvironment.STACKANVIL_USE_DESKTOP === "1") return desktopEnvironment;
    throw new Error("The private display is stopped. Start the lab display before using capture UI. Desktop capture requires explicit STACKANVIL_USE_DESKTOP=1.");
  });
}
