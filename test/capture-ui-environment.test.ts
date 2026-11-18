import { expectRejection } from "./helpers/expect-rejection.ts";
import { describe, expect, test } from "bun:test";
import { captureUiEnvironment } from "../src/capture/ui-environment.ts";

describe("capture UI display ownership", () => {
  test("keeps the owned display after it stops between selection and capture", async () => {
    const isolated = {
      WAYLAND_DISPLAY: "/private/wayland-1",
      SWAYSOCK: "/private/sway.sock",
      STACKANVIL_UI_ISOLATED: "1",
    };
    let active: NodeJS.ProcessEnv | undefined = isolated;
    let lookups = 0;
    const environment = captureUiEnvironment(
      () => {
        lookups++;
        return Promise.resolve(active);
      },
      { DISPLAY: ":99" },
    );
    expect((await environment())["WAYLAND_DISPLAY"]).toBe(isolated.WAYLAND_DISPLAY);
    active = undefined;
    expect((await environment())["WAYLAND_DISPLAY"]).toBe(isolated.WAYLAND_DISPLAY);
    expect(lookups).toBe(1);
  });

  test("refuses an unmanaged desktop even when DISPLAY and a window ID are available", async () => {
    const environment = captureUiEnvironment(() => Promise.resolve(undefined), { DISPLAY: ":99" });
    await expectRejection(environment());
  });

  test("retains explicit desktop capture", async () => {
    const desktop = { WAYLAND_DISPLAY: "wayland-0", STACKANVIL_USE_DESKTOP: "1" };
    expect(
      (await captureUiEnvironment(() => Promise.resolve(undefined), desktop)())["WAYLAND_DISPLAY"],
    ).toBe(desktop.WAYLAND_DISPLAY);
  });

  test("does not switch to a newly started display after ownership lookup fails", async () => {
    let active: NodeJS.ProcessEnv | undefined;
    const environment = captureUiEnvironment(() => Promise.resolve(active), { DISPLAY: ":99" });
    await expectRejection(environment());
    active = { WAYLAND_DISPLAY: "wayland-1" };
    await expectRejection(environment());
  });
});

test("explicit desktop opt-in cannot enable an X11-only session", async () => {
  const environment = captureUiEnvironment(() => Promise.resolve(undefined), {
    DISPLAY: ":0",
    STACKANVIL_USE_DESKTOP: "1",
  });
  await expectRejection(environment(), "X11 and XWayland are unsupported");
});
