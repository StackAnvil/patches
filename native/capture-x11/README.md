# X11 capture helper

This Rust CLI captures X11 windows and sends bounded keyboard and pointer input.
StackAnvil builds it on demand for `bun run capture ui`.
It connects directly to X11 through `x11rb`, without linking Xlib or libXtst.
The X server must support XTest for input commands.

## Build and test

Install Rust 1.85 or newer with Cargo.
From the repository root, build the helper:

```bash
cargo build --locked --release --manifest-path native/capture-x11/Cargo.toml --target-dir .stackanvil/tools/capture-x11-build
.stackanvil/tools/capture-x11-build/release/capture-x11 --help
```

Install Xvfb before running the complete test suite:

```bash
bun run test:capture:native
```

The integration tests start their own authenticated Xvfb servers with TCP disabled.
They never use your desktop display.
Set `CAPTURE_X11_XVFB` if the Xvfb executable is outside `PATH`.

## Commands

Commands use the display selected by `DISPLAY` and the credentials selected by `XAUTHORITY`.
Window IDs accept decimal or hexadecimal notation.
Pixel and pointer coordinates use whole pixels relative to the selected window.

| Command | Arguments | Output or action |
| --- | --- | --- |
| `list` | None | JSON windows with ID, title, position, and size |
| `pointer` | None | Root x, root y, and child window ID |
| `active` | None | Active window ID, with an input-focus fallback |
| `pixel` | `ID X Y` | Three RGB values from 0 to 255 |
| `screenshot` | `ID FILE` | Binary PPM image |
| `focus` | `ID` | Request focus through the window manager, or focus directly on an isolated display |
| `resize` | `ID WIDTH HEIGHT [X Y]` | Resize, with optional placement on an isolated display |
| `click`, `double-click` | `ID X Y [left\|right]` | One or two clicks |
| `mouse-hold` | `ID X Y BUTTON MS` | Move, press, hold, and release |
| `button-hold` | `ID BUTTON MS` | Press, hold, and release without moving |
| `key`, `double-key` | `ID NAME` | One or two key sequences, such as `Control+b` |
| `key-hold` | `ID NAME MS` | Hold a key sequence |
| `type` | `ID TEXT` | Type lowercase ASCII letters, digits, spaces, periods, and hyphens |
| `drag` | `ID BUTTON DWELL_MS X0 Y0 X1 Y1 ...` | Hold a button across an ordered path |

Hold durations range from 1 to 10000 ms.
Drags accept 2 to 64 points, with 1 to 1000 ms per point and a total hold of at most 10000 ms.
Window sizes range from 640 by 360 to 16384 by 16384 pixels.
Placement requires `STACKANVIL_UI_ISOLATED=1` and must fit the display.

Input commands raise and focus the selected window.
Use StackAnvil's [capture lab](../../docs/capture-lab.md) to keep input on an isolated display.
The Bun caller requires explicit permission for desktop input.

SIGINT, SIGTERM, and command failures release keys and buttons pressed by the helper.
SIGKILL or an X server failure cannot guarantee a release.
Interrupted commands return 130 for SIGINT or 143 for SIGTERM.
Other failures return 1; invalid command arguments return 2.

The helper uses the repository's [GPL-3.0-or-later license](../../LICENSE).
