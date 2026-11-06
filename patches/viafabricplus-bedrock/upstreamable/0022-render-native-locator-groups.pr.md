## Native locator groups

The add-on now draws the core's locator-group snapshot with accepted textures, ARGB tint, actor binding, and position smoothing.
Native 1.26.51.1 (build 51061372, protocol 2193) captures and draw routine `0x148dc8e60` establish the default layout and projection.
The icon extent is `size * 5 + 2`, including zero and negative sizes.
Height arrows use the camera FOV and fixed geometry. Nearby groups draw over distant groups.
Tests cover bearing, size, FOV, smoothing, and stale-session rejection.
An isolated direct join verifies visible output, accepted textures, and positive, zero, and negative icon sizes.

## Current player updates

Official Bedrock 1.26.60.5 and BDS 1.26.60.6 provide protocol-2225 controls with a real remote player.
The server sends both `PLAYER_LOCATION` and native locator-group updates.
The group switches from its supplied position to the actor's client position after spawn.
The native observer stays connected while direct and ViaProxy peers join in turn.

Both Java routes display the remote-player marker when facing the observer.
Disabling `playerwaypoints` removes the marker on native and Java clients. Enabling it restores the marker.
Pixel measurements distinguish marker presence, removal, and restoration. They do not establish complete layout or image parity.
The timed Java recordings finish normally, and installed client and proxy hashes match the built artifacts.

The native client also displays a scripted location waypoint beside the player marker.
Removing that waypoint preserves the player marker.
After a dimension change, BDS explicitly hides a scripted waypoint from the other dimension.

These controls do not reproduce the reported missing locator bar.
Legacy-only player updates, full HUD definition overrides, custom textures, and the original reported server remain unverified.

Requires the [HUD visibility hooks](0021-apply-server-element-visibility-restrictions.pr.md).

## Upstream prerequisites

- [viafabricplus-bedrock patch](../../viafabricplus-bedrock/upstreamable/0021-apply-server-element-visibility-restrictions.pr.md): Land HUD visibility hooks before integrating locator draws with them.
