export interface ContainerWindow {
  width: number;
  height: number;
  containerScale?: number;
}

export function containerPoint(
  window: ContainerWindow,
  imageWidth: number,
  imageHeight: number,
  x: number,
  y: number,
): readonly [number, number] {
  const scale = window.containerScale ?? 2;
  // Capture floors ratios against the last pixel index. Address the pixel center.
  return [
    ((window.width - imageWidth * scale) / 2 + x * scale + 0.5) / (window.width - 1),
    ((window.height - imageHeight * scale) / 2 + y * scale + 0.5) / (window.height - 1),
  ];
}

export async function chestViewport(
  window: ContainerWindow,
  readPixel: (x: number, y: number) => Promise<number[]>,
): Promise<ContainerWindow | null> {
  // Native desktop UI uses a 376 x 250 minimum viewport, independently of Java's GUI scale.
  const nativeScale = Math.max(
    1,
    Math.min(8, Math.floor(window.width / 376), Math.floor(window.height / 250)),
  );
  for (const containerScale of new Set([nativeScale, 2])) {
    const candidate = { ...window, containerScale };
    const pixels = await Promise.all(
      (
        [
          [10, 15],
          [150, 15],
          [10, 162],
          [150, 162],
        ] as const
      ).map(([x, y]) => readPixel(...containerPoint(candidate, 176, 168, x, y))),
    );
    if (
      pixels.every(
        (pixel) => pixel.length === 3 && pixel.every((channel) => Math.abs(channel - 198) <= 2),
      )
    ) {
      return candidate;
    }
  }
  return null;
}
