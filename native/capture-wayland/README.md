# Wayland capture helper

This Rust CLI captures native Wayland windows and sends bounded keyboard and pointer input.
StackAnvil builds it on demand for `bun run capture ui`.
It uses Sway IPC for window geometry and focus, Wayland protocols for input, and `grim` for screenshots.
Video recording uses `wf-recorder` without audio.
The private lab disables XWayland. X11 windows are unsupported.

## Build and test

Install Rust 1.85 or newer with Cargo and the libxkbcommon development package.
From the repository root, build the helper:

```bash
cargo build --locked --release --manifest-path native/capture-wayland/Cargo.toml --target-dir .stackanvil/tools/capture-wayland-build
.stackanvil/tools/capture-wayland-build/release/capture-wayland --help
```

Install Sway, `grim`, `wf-recorder`, and FFmpeg before running the complete test suite:

```bash
bun run test:capture:native
```

The integration tests start their own private headless Sway compositors with XWayland disabled.
A native Wayland fixture receives input and draws known pixels.
Tests cover screenshots, relative motion, key chords, drag interruption, and video finalization.
They never use your desktop display.
Set `CAPTURE_WAYLAND_SWAY` if Sway is outside `PATH`.

## Commands

Commands use `WAYLAND_DISPLAY` and the Sway IPC socket in `SWAYSOCK`.
Window IDs are Sway container IDs. Decimal and hexadecimal notation are accepted.
Pixel and pointer coordinates use whole pixels relative to the window's content rectangle.
The output must use scale 1 with no rotation. Absolute input requires one active output.

| Command                 | Arguments                            | Output or action                                                      |
| ----------------------- | ------------------------------------ | --------------------------------------------------------------------- |
| `list`                  | None                                 | JSON windows with ID, title, position, and size                       |
| `active`                | None                                 | Focused native window ID                                              |
| `pixel`                 | `ID X Y`                             | Three RGB values from 0 to 255                                        |
| `screenshot`            | `ID FILE`                            | Private binary PPM image without overwriting an existing file         |
| `record`                | `ID FPS FILE`                        | Private H.264 recording at 1 to 120 FPS                               |
| `serve`                 | `SOCKET`                             | Keep one virtual keyboard and pointer available for private lab input |
| `focus`                 | `ID`                                 | Focus the selected native window                                      |
| `move`                  | `ID X Y`                             | Move the pointer without pressing a button                            |
| `look`                  | `ID DX DY`                           | Send one relative pointer motion of up to 2000 pixels on each axis    |
| `resize`                | `ID WIDTH HEIGHT [X Y]`              | Resize, with optional placement on an isolated display                |
| `click`, `double-click` | `ID X Y [left\|right]`               | One or two clicks                                                     |
| `mouse-hold`            | `ID X Y BUTTON MS`                   | Move, press, hold, and release                                        |
| `button-hold`           | `ID BUTTON MS`                       | Press, hold, and release without moving                               |
| `key`, `double-key`     | `ID NAME`                            | One or two key sequences, such as `Control+b`                         |
| `key-hold`              | `ID NAME MS`                         | Hold a key sequence                                                   |
| `type`                  | `ID TEXT`                            | Type lowercase ASCII letters, digits, spaces, periods, and hyphens    |
| `drag`                  | `ID BUTTON DWELL_MS X0 Y0 X1 Y1 ...` | Hold a button across an ordered path                                  |

Hold durations range from 1 to 10000 ms.
Drags accept 2 to 64 points, with 1 to 1000 ms per point and a total hold of at most 10000 ms.
Window sizes range from 640 by 360 to 16384 by 16384 pixels.
Placement requires `STACKANVIL_UI_ISOLATED=1` and must fit the display.

Input commands raise and focus the selected window.
The lab starts `serve` before the clients and sets `STACKANVIL_INPUT_SOCKET` for commands.
The input service serializes actions and releases held input when a caller disconnects.
Desktop input requires Sway and the virtual keyboard and virtual pointer protocols.
Use StackAnvil's [capture lab](../../docs/capture-lab.md) to keep input on an isolated display.
The Bun caller requires explicit permission for desktop input.

SIGINT, SIGTERM, and command failures release keys and buttons pressed by the helper.
A window change during held input also releases it.
Recordings stop when the selected window moves, resizes, loses focus, or closes.
A compositor failure cannot guarantee a release.
If a command receives SIGKILL, the input service releases its held input when the connection closes.
Interrupted commands return 130 for SIGINT or 143 for SIGTERM.
Other failures return 1; invalid command arguments return 2.

The helper uses the repository's [GPL-3.0-or-later license](../../LICENSE).
