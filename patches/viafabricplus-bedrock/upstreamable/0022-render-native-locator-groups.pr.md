## Native locator groups

The add-on now draws the core's locator-group snapshot with accepted textures, ARGB tint, actor binding, and position smoothing.
Native 1.26.51.1 (build 51061372, protocol 2193) captures and draw routine `0x148dc8e60` establish the default layout and projection.
The icon extent is `size * 5 + 2`, including zero and negative sizes.
Height arrows use the camera FOV and fixed geometry. Nearby groups draw over distant groups.
Tests cover bearing, size, FOV, smoothing, and stale-session rejection.
The full add-on build passes with 798 tests, including 120 skipped tests.
An isolated direct join verifies visible output, accepted textures, and positive, zero, and negative icon sizes.
Full HUD definition overrides, legacy player-location presentation, and the remaining native comparison matrix are incomplete.

Requires the [HUD visibility hooks](0021-apply-server-element-visibility-restrictions.pr.md).

## Upstream prerequisites

- [viafabricplus-bedrock patch](../../viafabricplus-bedrock/upstreamable/0021-apply-server-element-visibility-restrictions.pr.md): Land HUD visibility hooks before integrating locator draws with them.
