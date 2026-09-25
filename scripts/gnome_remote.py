"""Send test input through GNOME's RemoteDesktop session on Wayland."""

import subprocess
import sys
import time
from gi.repository import Gio, GLib

DESTINATION = "org.gnome.Mutter.RemoteDesktop"
ROOT = "/org/gnome/Mutter/RemoteDesktop"
SESSION = "org.gnome.Mutter.RemoteDesktop.Session"
KEYS = {
    "Escape": 0xFF1B,
    "Return": 0xFF0D,
    "Enter": 0xFF0D,
    "Tab": 0xFF09,
    "Up": 0xFF52,
    "Down": 0xFF54,
    "Left": 0xFF51,
    "Right": 0xFF53,
    "Space": 0x0020,
    "Control": 0xFFE3,
    "Alt": 0xFFE9,
    "Shift": 0xFFE1,
}
KEYS.update({f"F{number}": 0xFFBD + number for number in range(1, 13)})


def pointer() -> tuple[int, int]:
    output = subprocess.check_output([sys.argv[1], "pointer"], text=True)
    x, y, _ = output.split()
    return int(x), int(y)


def main() -> None:
    if len(sys.argv) < 4:
        raise SystemExit("Usage: gnome_remote.py <capture-x11> key NAME | click X Y")
    if sys.argv[2] == "click" and len(sys.argv) != 5:
        raise SystemExit("Usage: gnome_remote.py <capture-x11> click X Y")
    bus = Gio.bus_get_sync(Gio.BusType.SESSION, None)
    path = bus.call_sync(
        DESTINATION, ROOT, DESTINATION, "CreateSession", None,
        GLib.VariantType("(o)"), Gio.DBusCallFlags.NONE, -1, None,
    ).unpack()[0]

    def call(method: str, argument: GLib.Variant | None = None) -> None:
        bus.call_sync(
            DESTINATION, path, SESSION, method, argument,
            None, Gio.DBusCallFlags.NONE, -1, None,
        )

    call("Start")
    time.sleep(0.2)
    try:
        if sys.argv[2] == "key":
            names = sys.argv[3].split("+")
            codes = [KEYS.get(name, ord(name) if len(name) == 1 else 0) for name in names]
            if any(code == 0 for code in codes):
                raise ValueError("Unknown key name")
            for code in codes:
                call("NotifyKeyboardKeysym", GLib.Variant("(ub)", (code, True)))
            time.sleep(0.12)
            for code in reversed(codes):
                call("NotifyKeyboardKeysym", GLib.Variant("(ub)", (code, False)))
        elif sys.argv[2] == "click":
            target_x, target_y = int(sys.argv[3]), int(sys.argv[4])
            last_distance = None
            for _ in range(12):
                current_x, current_y = pointer()
                dx, dy = target_x - current_x, target_y - current_y
                if abs(dx) <= 12 and abs(dy) <= 12:
                    break
                distance = abs(dx) + abs(dy)
                if distance == last_distance:
                    raise RuntimeError("Pointer did not move toward the target")
                last_distance = distance
                call("NotifyPointerMotionRelative", GLib.Variant("(dd)", (
                    float(max(-1500, min(1500, dx / 2))),
                    float(max(-1500, min(1500, dy / 2))),
                )))
                time.sleep(0.12)
            else:
                raise RuntimeError(f"Pointer could not reach {target_x}, {target_y}")
            call("NotifyPointerButton", GLib.Variant("(ib)", (272, True)))
            time.sleep(0.12)
            call("NotifyPointerButton", GLib.Variant("(ib)", (272, False)))
        else:
            raise ValueError("Use key or click")
        time.sleep(0.1)
    finally:
        call("Stop")


if __name__ == "__main__":
    main()
