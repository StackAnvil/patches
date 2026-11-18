import { expect, test } from "bun:test";
import { flatpakWaylandArguments, nativeWaylandEnvironment } from "../src/lab/wayland.ts";

test("native client launches discard inherited X11 drivers and Wayland connection descriptors", () => {
  const environment = nativeWaylandEnvironment({
    WAYLAND_DISPLAY: "/run/user/1000/private/wayland-1",
    DISPLAY: ":0",
    XAUTHORITY: "/desktop.auth",
    WAYLAND_SOCKET: "7",
    QT_QPA_PLATFORM: "xcb",
    SDL_VIDEODRIVER: "x11",
    SDL_VIDEO_DRIVER: "x11",
    PULSE_SINK: "stackanvil_silent",
    PULSE_PROP: "stackanvil.lab=private",
  });
  expect(environment["DISPLAY"]).toBeUndefined();
  expect(environment["XAUTHORITY"]).toBeUndefined();
  expect(environment["WAYLAND_SOCKET"]).toBeUndefined();
  expect(environment["WAYLAND_DISPLAY"]).toBe("/run/user/1000/private/wayland-1");
  expect(environment["QT_QPA_PLATFORM"]).toBe("wayland");
  expect(environment["SDL_VIDEO_DRIVER"]).toBe("wayland");
  expect(environment["SDL_VIDEODRIVER"]).toBe("wayland");
  expect(environment["PULSE_SINK"]).toBe("stackanvil_silent");
  expect(environment["PULSE_PROP"]).toBe("stackanvil.lab=private");
  expect(() => nativeWaylandEnvironment({ DISPLAY: ":0" })).toThrow(
    "X11 and XWayland are unsupported",
  );
});

test("sandboxed private clients receive only the lab Wayland socket and audio identity", () => {
  const args = flatpakWaylandArguments({
    WAYLAND_DISPLAY: "/run/user/1000/private/wayland-1",
    STACKANVIL_UI_ISOLATED: "1",
    DISPLAY: ":0",
    PULSE_PROP: "stackanvil.lab=private",
    PIPEWIRE_PROPS: "stackanvil.lab=private",
  });
  expect(args).toContain("--nosocket=x11");
  expect(args).toContain("--nosocket=fallback-x11");
  expect(args).toContain("--socket=wayland");
  expect(args).toContain("--unset-env=DISPLAY");
  expect(args).toContain("--unset-env=WAYLAND_SOCKET");
  expect(args).toContain("--env=PULSE_PROP=stackanvil.lab=private");
  expect(args).toContain("--env=PIPEWIRE_PROPS=stackanvil.lab=private");
  expect(args).not.toContain("--env=WAYLAND_DISPLAY=/run/user/1000/private/wayland-1");
});
