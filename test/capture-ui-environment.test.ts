import { describe, expect, test } from "bun:test";
import { captureUiEnvironment } from "../src/capture/ui-environment.ts";

describe("capture UI display ownership", () => {
  test("keeps the owned display after it stops between selection and capture", async () => {
    const isolated = { DISPLAY: ":102", XAUTHORITY: "/private/display.auth", STACKANVIL_UI_ISOLATED: "1" };
    let active: NodeJS.ProcessEnv | undefined = isolated;
    let lookups = 0;
    const environment = captureUiEnvironment(async () => { lookups++; return active; }, { DISPLAY: ":99" });
    expect(await environment()).toBe(isolated);
    active = undefined;
    expect(await environment()).toBe(isolated);
    expect(lookups).toBe(1);
  });

  test("refuses an unmanaged desktop even when DISPLAY and a window ID are available", async () => {
    const environment = captureUiEnvironment(async () => undefined, { DISPLAY: ":99" });
    await expect(environment()).rejects.toBeInstanceOf(Error);
  });

  test("retains explicit desktop capture", async () => {
    const desktop = { DISPLAY: ":99", STACKANVIL_USE_DESKTOP: "1" };
    expect(await captureUiEnvironment(async () => undefined, desktop)()).toBe(desktop);
  });

  test("does not switch to a newly started display after ownership lookup fails", async () => {
    let active: NodeJS.ProcessEnv | undefined;
    const environment = captureUiEnvironment(async () => active, { DISPLAY: ":99" });
    await expect(environment()).rejects.toBeInstanceOf(Error);
    active = { DISPLAY: ":102" };
    await expect(environment()).rejects.toBeInstanceOf(Error);
  });
});
