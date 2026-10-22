import { describe, expect, test } from "bun:test";
import { chestViewport, containerPoint } from "../src/integration/container-viewport.ts";

describe("container viewport", () => {
  test.each([
    { width: 854, height: 480, scale: 1 },
    { width: 854, height: 480, scale: 2 },
    { width: 1920, height: 1080, scale: 4 },
  ])(
    "detects the menu scale and uses it for the actual slot click",
    async ({ width, height, scale }) => {
      const window = { width, height };
      const left = (window.width - 176 * scale) / 2;
      const top = (window.height - 168 * scale) / 2;
      const header = top + 15 * scale;
      const footer = top + 162 * scale;
      const viewport = await chestViewport(window, async (x, y) => {
        const px = Math.floor(x * (window.width - 1));
        const py = Math.floor(y * (window.height - 1));
        return (Math.abs(py - header) < 0.01 || Math.abs(py - footer) < 0.01) &&
          px >= left &&
          px <= left + 176 * scale
          ? [198, 198, 198]
          : [0, 0, 0];
      });
      expect(viewport?.containerScale).toBe(scale);
      const point = containerPoint(viewport!, 176, 168, 17, 27);
      expect(Math.floor(point[0] * (window.width - 1))).toBe(left + 17 * scale);
      expect(Math.floor(point[1] * (window.height - 1))).toBe(top + 27 * scale);
    },
  );

  test("requires both header and footer samples before clicking", async () => {
    const window = { width: 854, height: 478 };
    expect(
      await chestViewport(window, async (_x, y) => (y < 0.5 ? [198, 198, 198] : [0, 0, 0])),
    ).toBeNull();
    expect(await chestViewport(window, async () => [])).toBeNull();
  });
});
