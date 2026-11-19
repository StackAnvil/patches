"""Launch the bundled BedrockOnLinux CLI only when native Wayland is available."""

import os
import runpy
import sys
from pathlib import Path


def main():
    if len(sys.argv) < 2:
        raise SystemExit("Supply the bundled BedrockOnLinux launcher path.")
    if not os.environ.get("WAYLAND_DISPLAY") or os.environ.get("DISPLAY"):
        raise SystemExit("Bedrock requires a native Wayland display without DISPLAY.")
    if os.environ.get("BOL_INPUT") != "wayland":
        raise SystemExit("Set BOL_INPUT=wayland before launching Bedrock.")
    launcher = Path(sys.argv[1]).resolve()
    for directory in (
        launcher.parent,
        launcher.parent.parent / "lib" / "bedrock-on-linux",
    ):
        if (directory / "bol").is_dir():
            sys.path.insert(0, str(directory))
            break
    from bol.proton import proton_path
    from bol.util import custom_env_map, load_settings
    from bol.waylanddrv import engine_wayland_driver_problem

    settings = load_settings()
    gamescope = settings.get("gamescope") or os.environ.get("BOL_GAMESCOPE", "0")
    if str(gamescope).lower() not in ("0", "no", "off", "false", ""):
        raise SystemExit(
            "Disable Gamescope in BedrockOnLinux. "
            "The lab requires native Wayland without XWayland."
        )
    custom = custom_env_map(settings.get("custom_env") or "")
    protected = {
        "DISPLAY",
        "XAUTHORITY",
        "WAYLAND_DISPLAY",
        "WAYLAND_SOCKET",
        "XDG_RUNTIME_DIR",
        "BOL_INPUT",
        "BOL_GAMESCOPE",
        "PROTON_ENABLE_WAYLAND",
    }
    if protected.intersection(custom):
        raise SystemExit(
            "Remove display and input overrides from the BedrockOnLinux custom "
            "environment before using the Wayland lab."
        )
    problem = engine_wayland_driver_problem(proton_path())
    if problem:
        raise SystemExit(
            f"Bedrock native Wayland is unavailable: {problem} "
            "XWayland fallback is disabled."
        )
    sys.argv = [str(launcher), *sys.argv[2:]]
    runpy.run_path(str(launcher), run_name="__main__")


if __name__ == "__main__":
    main()
