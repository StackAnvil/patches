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
  throw new Error("A dialog still covers the native title screen. Read native-menu.png.");
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
