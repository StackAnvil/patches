import { existsSync } from "node:fs";
import { delimiter, join } from "node:path";
import { root } from "../model.ts";

const privateTools = join(root, ".stackanvil", "tools", "wayland-root", "usr");

export function waylandTool(name: string): string | undefined {
  const configured =
    name === "sway"
      ? process.env["STACKANVIL_SWAY_BINARY"]
      : name === "swaymsg"
        ? process.env["STACKANVIL_SWAYMSG_BINARY"]
        : undefined;
  const installed = configured ?? Bun.which(name);
  if (installed) return installed;
  const privateBinary = join(privateTools, "bin", name);
  return existsSync(privateBinary) ? privateBinary : undefined;
}

/** Private tool libraries apply only to helpers, never to game clients. */
export function waylandToolEnvironment(environment: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  if (!existsSync(join(privateTools, "bin"))) return environment;
  return {
    ...environment,
    PATH: [environment["PATH"], join(privateTools, "bin")].filter(Boolean).join(delimiter),
    LD_LIBRARY_PATH: [
      environment["LD_LIBRARY_PATH"],
      join(privateTools, "lib64"),
      join(privateTools, "lib"),
    ]
      .filter(Boolean)
      .join(delimiter),
  };
}

/** Force supported toolkits onto the chosen native display without an X11 fallback. */
export function nativeWaylandEnvironment(environment: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  if (!environment["WAYLAND_DISPLAY"])
    throw new Error("A native Wayland display is required. X11 and XWayland are unsupported.");
  const native: NodeJS.ProcessEnv = {
    ...environment,
    QT_QPA_PLATFORM: "wayland",
    GDK_BACKEND: "wayland",
    SDL_VIDEODRIVER: "wayland",
    SDL_VIDEO_DRIVER: "wayland",
    BOL_INPUT: "wayland",
    BOL_GAMESCOPE: "0",
  };
  delete native["DISPLAY"];
  delete native["XAUTHORITY"];
  delete native["WAYLAND_SOCKET"];
  return native;
}

/** Flatpak maps the socket selected by the launch environment into its sandbox. */
export function flatpakWaylandArguments(environment: NodeJS.ProcessEnv): string[] {
  const native = nativeWaylandEnvironment(environment);
  return [
    "--nosocket=x11",
    "--nosocket=fallback-x11",
    "--unset-env=DISPLAY",
    "--unset-env=XAUTHORITY",
    "--unset-env=WAYLAND_SOCKET",
    "--socket=wayland",
    ...[
      "QT_QPA_PLATFORM",
      "GDK_BACKEND",
      "SDL_VIDEODRIVER",
      "SDL_VIDEO_DRIVER",
      "PULSE_SINK",
      "PULSE_PROP",
      "PIPEWIRE_PROPS",
    ].map((name) => `--env=${name}=${native[name] ?? ""}`),
  ];
}
