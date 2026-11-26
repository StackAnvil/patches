import { expect, test } from "bun:test";
import {
  acceptNativeTrust,
  revealNativeTitle,
  scrollToNativeAddServer,
} from "../src/replay/native-menu.ts";

const button = [198, 198, 198];
const dialog = [9, 9, 9];
const noWait = async () => {};

test("a clear title screen gets no Escape, which would open the exit prompt", async () => {
  let escapes = 0;
  await revealNativeTitle(
    async () => button,
    async () => void escapes++,
    noWait,
  );
  expect(escapes).toBe(0);
});

test("startup promotions are closed with Escape until Play shows", async () => {
  const screens = [dialog, dialog, button];
  let escapes = 0;
  await revealNativeTitle(
    async () => screens[escapes] ?? button,
    async () => void escapes++,
    noWait,
  );
  expect(escapes).toBe(2);
  await expect(
    revealNativeTitle(
      async () => dialog,
      async () => {},
      noWait,
    ),
  ).rejects.toThrow("native-title-blocked.png");
});

test("Add server is clicked only after both bottom buttons scroll into view", async () => {
  // A scrolling row can briefly pass the button color under one sample but not both.
  const frames: [number[], number[]][] = [
    [dialog, dialog],
    [[183, 183, 183], [40, 40, 40]],
    [[208, 209, 212], [208, 209, 212]],
  ];
  let presses = 0;
  await scrollToNativeAddServer(
    async (x) => (frames[presses] ?? frames[2]!)[x < 0.6 ? 0 : 1],
    async () => void presses++,
    noWait,
  );
  expect(presses).toBe(2);
  await expect(
    scrollToNativeAddServer(
      async () => dialog,
      async () => {},
      noWait,
    ),
  ).rejects.toThrow("Add server");
});

test("the trust prompt is accepted when it appears after loading, and never on other screens", async () => {
  const loading = (y: number) => (y > 0.65 ? [20, 18, 15] : [198, 198, 198]);
  const prompt = (y: number) => (y > 0.65 ? [30, 130, 30] : [198, 198, 198]);
  // A light logo or sky above the dialog must not count as the prompt.
  let seconds = 0;
  let accepted = 0;
  expect(
    await acceptNativeTrust(
      async (_x, y) => (seconds < 10 ? loading(y) : prompt(y)),
      async () => void accepted++,
      async () => void seconds++,
    ),
  ).toBe(true);
  expect([seconds, accepted]).toEqual([10, 1]);
  const failed = (y: number) => (y > 0.65 ? [49, 50, 51] : [49, 50, 51]);
  expect(
    await acceptNativeTrust(
      async (_x, y) => failed(y),
      async () => void accepted++,
      noWait,
      5,
    ),
  ).toBe(false);
  expect(accepted).toBe(1);
});
