# Status-effect icons

## Purpose

Preserve Bedrock status icons independently of effect particles.
Set Java's `SHOW_ICON` flag for translated active effects while retaining their particle and ambient flags.
The same core update method handles live updates and retained effect snapshots.
This correction uses standard Java packets and requires no client add-on.

## Target evidence

The [near-target preview reference](https://mojang.github.io/bedrock-protocol-docs/1.26.50-preview.26/packets/mob-effect-packet/) describes separate effect, particle, duration, tick, and ambient fields.
It describes protocol 2192, so a target capture establishes the protocol 2193 layout.
A private BDS 1.26.51.1 capture adds Speed II with particles=false, ambient=false, and duration=19,980 ticks.
The decoder consumes the complete packet without remaining bytes.
The native 1.26.51.1 fixture displays the speed icon with `effect @s speed 999 1 true`.
That command hides particles but retains the icon.
The previous Java translation omitted the independent icon flag.

## Testing and limits

A packet test covers all ambient and particle combinations, retained effect state, and infinite duration.
The complete build reports 876 tests passed and 110 skipped, with no failures or errors.
Core Checkstyle passes.
This patch also applies independently to the pinned upstream base through `pr check --patch`.

Live direct and ViaProxy comparisons show the speed icon with particles disabled.
A ViaProxy comparison with the Bedrock add-on removed also shows the icon.
Both add-on routes hide the icon on `SET_HUD` and restore it on reset without removing the active effect.
Clearing effects removes the retained effect and its icon through ViaProxy.
Further effect-specific timing, movement, blending, and inventory presentation comparisons remain incomplete.
The separate armor-meter gap remains open.
