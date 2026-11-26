import { Schema } from "effect";
import { parseJson } from "../guards.ts";

/** Samples one RGB pixel at fractions of the native client's content area. */
type Pixel = (x: number, y: number) => Promise<number[]>;
type Press = () => Promise<void>;
type Wait = (milliseconds: number) => Promise<void>;

// Bedrock 1.26.60 draws its unfocused menu buttons in light grey: Play is 198 198 198 and the
// Servers tab's Add server is 208 209 212. Dialogs, artwork and scrolling rows never pass.
function menuButton(rgb: readonly number[]): boolean {
  return rgb.length === 3 && rgb.every((value) => value >= 190 && value <= 220);
}

/**
 * Startup promotions can cover the title screen. Escape closes a dialog, but on a clear title
 * screen it opens the exit prompt, so press it only while the Play button is hidden. A stray exit
 * prompt also hides Play, and the next Escape cancels it.
 */
export async function revealNativeTitle(pixel: Pixel, escape: Press, wait: Wait): Promise<void> {
  for (let attempt = 0; attempt < 6; attempt++) {
    if (menuButton(await pixel(0.42, 0.5))) return;
    await escape();
    await wait(2000);
  }
  throw new Error("A dialog still covers the native title screen. Read native-title-blocked.png.");
}

/** Featured servers fill the tab, so move focus down until both bottom buttons are visible. */
export async function scrollToNativeAddServer(
  pixel: Pixel,
  down: Press,
  wait: Wait,
): Promise<void> {
  for (let presses = 0; presses <= 60; presses++) {
    // Sample each button's blank padding, left of its label.
    if (menuButton(await pixel(0.57, 0.938)) && menuButton(await pixel(0.755, 0.938))) return;
    await down();
    await wait(150);
  }
  throw new Error(
    "The native Servers tab did not reach its Add server button. Read native-servers.png.",
  );
}

/**
 * A fresh profile asks whether to trust the loopback server about ten seconds after Add and play.
 * Its grey Trust and Join button sits above a green Don't Trust button. Loading screens, the title
 * screen and connection errors have no green at that position. Returns whether it accepted.
 */
export async function acceptNativeTrust(
  pixel: Pixel,
  accept: Press,
  wait: Wait,
  attempts = 40,
): Promise<boolean> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const [red = 0, green = 0, blue = 0] = await pixel(0.42, 0.686);
    if (green >= 100 && red <= 80 && blue <= 80 && menuButton(await pixel(0.42, 0.591))) {
      await accept();
      return true;
    }
    await wait(1000);
  }
  return false;
}

const WindowsSchema = Schema.Array(Schema.Struct({ title: Schema.String, height: Schema.Finite }));

/** Wine draws the window caption inside the surface under winewayland. */
const captionHeight = 26;

export interface NativeMenu {
  /** Runs one `capture ui` command against the Bedrock window and returns its output. */
  ui: (args: string[]) => Promise<string>;
  wait: Wait;
}

/**
 * Add a server from the 1.26.60 title screen, join it and accept its trust prompt. Positions are
 * fractions of the game's content area below the caption. Returns whether a trust prompt appeared.
 */
export async function joinNativeServer(
  menu: NativeMenu,
  server: { name: string; address: string; port: number },
): Promise<boolean> {
  // The window list covers every client on the display, so select the Bedrock window by title.
  const windows = parseJson(WindowsSchema, await menu.ui(["list"]));
  const height =
    windows.find((window) => /^minecraft(?: for windows| bedrock)?$/iu.test(window.title))
      ?.height ?? 0;
  if (height <= captionHeight) throw new Error("The native client window has no content area.");
  const y = (fraction: number) =>
    String((captionHeight + fraction * (height - captionHeight)) / height);
  // Bedrock under winewayland ignores a press on a control it has not seen the pointer hover first.
  const click = async (x: number, fraction: number) => {
    await menu.ui(["move", String(x), y(fraction)]);
    await menu.wait(400);
    await menu.ui(["mouse-hold", String(x), y(fraction), "left", "150"]);
  };
  const pixel = async (x: number, fraction: number) =>
    (await menu.ui(["pixel", String(x), y(fraction)])).trim().split(/\s+/u).map(Number);
  const screenshotOnFailure = (name: string) => async (cause: unknown) => {
    await menu.ui(["screenshot", name]);
    throw cause;
  };
  await revealNativeTitle(
    pixel,
    async () => {
      await menu.ui(["key", "Escape"]);
    },
    menu.wait,
  ).catch(screenshotOnFailure("native-title-blocked"));
  await click(0.5, 0.5);
  // The Play screen opens several seconds later and ignores input while it animates in.
  await menu.wait(12_000);
  await click(0.82, 0.11);
  await menu.wait(2500);
  await menu.ui(["move", "0.5", y(0.7)]);
  await scrollToNativeAddServer(
    pixel,
    async () => {
      await menu.ui(["key", "Down"]);
    },
    menu.wait,
  ).catch(screenshotOnFailure("native-servers"));
  await click(0.646, 0.938);
  await menu.wait(2000);
  for (const [row, value] of [
    [0.17, server.name],
    [0.31, server.address],
    [0.46, String(server.port)],
  ] as const) {
    await click(0.25, row);
    await menu.wait(250);
    await menu.ui(["key", "Control+a"]);
    await menu.wait(250);
    await menu.ui(["type", value]);
    await menu.wait(250);
  }
  await click(0.69, 0.57);
  const trusted = await acceptNativeTrust(pixel, () => click(0.5, 0.59), menu.wait);
  await menu.ui(["screenshot", "native-after-trust"]);
  return trusted;
}
