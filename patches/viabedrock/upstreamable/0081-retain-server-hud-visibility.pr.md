# Server HUD visibility

## Purpose

Decode `SET_HUD` in ViaBedrock core for Bedrock 1.26.51.1, protocol 2193.
Retain independent restrictions for every target HUD element per connection.
Send versioned snapshots to registered clients through direct connections and ViaProxy.
Late channel registration receives the current restriction set.

A reset removes restrictions only for the listed elements.
It preserves the player's local HUD settings.
Unknown element IDs survive transport without acquiring another element's meaning.
Packet arrays and accumulated snapshots have a limit of 4,096 elements.

## Target evidence

Private BDS 1.26.51.1 captures establish packet 308's unsigned array length, signed varint element IDs, and signed visibility operation.
The server sends IDs 0 through 12, with Hide=0 and Reset=1.
`hud reset all` sends all thirteen IDs explicitly.
It does not send a special all-elements ID or an empty list.

The [protocol 2193 reference](https://mojang.github.io/bedrock-protocol-docs/1.26.50/packets/set-hud-packet/) agrees with the captured layout and mappings.
The [HUD visibility reference](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/hudvisibility?view=minecraft-bedrock-stable) defines reset as restoration of local settings.
Native 1.26.51.1 comparisons establish independent health, armor, hunger, crosshair, hotbar, progress, and status-effect restrictions.
Hiding progress also hides the XP level.
Hiding the hotbar preserves the selected item's name.

## Testing and limits

Three tests cover captured array alignment, independent resets, duplicate IDs, immutable state, unknown IDs, snapshot compatibility, truncation, and size limits.
Accumulated restrictions cannot exceed the client snapshot limit.
The complete core suite reports 440 tests, with one optional fixture skip and no failures or errors.
Core Checkstyle passes on the complete stack.
The preceding complete build reports 875 tests passed and 110 skipped across core, converter, and add-on suites.

Live Java 26.3 tests verify state delivery through direct connections and ViaProxy.
The [client integration](../../viafabricplus-bedrock/upstreamable/0021-apply-server-element-visibility-restrictions.pr.md) records visible results and remaining comparisons.
Java has no standard protocol operation for individual HUD visibility.
Ordinary clients retain their local presentation and receive no unregistered custom payload.
This patch does not implement player fog or the missing native-only HUD widgets.
