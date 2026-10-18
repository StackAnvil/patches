# Server restrictions for HUD elements

## Purpose

Apply ViaBedrock's authoritative HUD snapshot to Java 26.3 rendering.
Each restriction suppresses its own HUD element without changing local settings.
The implementation covers armor, health, hunger, air, vehicle health, crosshair, hotbar, contextual progress, status effects, and selected-item names.
Progress includes its background, fill, and XP level.
Spectator hotbar and item labels use the same restrictions.
Disconnect and local world exit clear the snapshot.

Core owns packet decoding and retained state.
The add-on receives the same versioned payload through direct connections and ViaProxy.
Java requires client rendering hooks because its protocol cannot hide individual HUD elements.

## Target evidence

The [core notes](../../viabedrock/upstreamable/0081-retain-server-hud-visibility.pr.md) record protocol 2193 captures and official references.
Native 1.26.51.1 hides health while retaining armor and hunger.
It hides XP text with the progress bar, and preserves selected-item text while hiding the hotbar.
These observations determine the independent rendering hooks.

## Testing and limits

The complete build passes with 875 tests passed and 110 skipped, including core Checkstyle.
Live direct and ViaProxy tests verify health, hunger, hotbar, crosshair, progress, and independent selected-item text.
A server reset restores the unrestricted elements while preserving F1's hidden-HUD setting on both routes.
Leaving the ViaProxy world clears all restrictions.
A remote disconnect from the direct route also clears them.

Armor and status-effect icons were absent during the initial Java fixture, despite native visibility.
The [core effect correction](../../viabedrock/upstreamable/0082-preserve-status-icons-independently-of-particles.pr.md) restores the status icon independently of particles.
Direct and ViaProxy comparisons now hide and reset this icon without removing its active effect.
The missing baseline armor meter still prevents a visible comparison for the armor hook.
Air, vehicle health, contextual jump bars, and spectator rendering still need native comparisons.
Paper doll, touch controls, and native control hints have no renderer in the current client.
Core retains their restrictions, but this patch does not supply those missing widgets.
The native `ToolTips` element does not justify suppressing inventory hover descriptions.
Broader JSON UI behavior, fog, and HUD layout parity remain incomplete.
