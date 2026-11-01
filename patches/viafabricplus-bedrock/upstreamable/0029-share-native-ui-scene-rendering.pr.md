# feat(ui): share native scene rendering and GUI actors

## Purpose

Share bounded scene, layout, image, text and actor rendering primitives before registering domain-specific forms and containers.

## Design constraints

Share authored scene, layout, image, text, actor, and focus primitives. Preserve same-pack bitmap metadata, legacy layouts, native atlas sampling, and GUI raster coverage.

Prerequisites:

- viabedrock/0095-share-native-ui-programs-and-resources.patch: Publish shared UI scene and program contracts before the client renderer.

- viafabricplus-bedrock/0002-native-entities-and-skins.patch: Preserve native actor material depth state and dynamic pipeline selection in GUI portrait consumers.

## Validation and remaining limits

Opacity revisions let container screens reuse their draw lists between visual changes.
Alpha samples and reset events invalidate retained opacity.
Layout changes retain a separate revision.

Regression coverage includes `BedrockBitmapFontResourcesTest`, `BedrockGuiActorAppearanceTest`, `BedrockGuiActorContextTest`, `BedrockResourceLibraryTest`.

At 1280 × 720, all 16 current-font labels match native 26.60 at UI scales 1 and 2. All 16 legacy labels match at UI scale 2. Direct and ViaProxy controls pass Java GUI scale changes and resource reloads. The point-sampling GPU regression fails before the correction and passes on Intel and software rendering.

Unanchored manual-grid cells use their grid origins.
The regression uses the native four-row armor shape, which previously shifted down and overlapped the main inventory.
Explicit anchors and full-parent percentage dimensions retain separate regression coverage.
Live player and horse portraits apply control opacity when Java composites their GUI textures.
Color controls cover premultiplied RGB and alpha, transparent frames, and independent perspectives.
The existing independent actor material-coverage path remains separate.
Fixed collection grids retain their full logical height while layout positions each instantiated cell by its original source index.
Regressions compare complete and windowed geometry, distant scroll positions, resize, final rows, and offscreen keyboard neighbors.
Overlapping windows retain animation clocks by source identity.
These controls do not establish identical native pooling or frame timing.
Broader viewports, complete inventory pixels, entrance timing, and TrueType comparisons remain open.

Alpha tracks honor `scale_from_starting_alpha` and retain their initial scale across scene refreshes.
Native Bedrock 1.26.60.5 captures ImageComponent alpha when creating the track and multiplies the interpolated value by that scale.
The default Survival backdrop uses this flag with opacity 0.4. Ignoring it makes the settled backdrop opaque.
A regression fails before the correction and covers the fade, potential-opacity bound, retained clock, and absolute-track behavior.
Leaf controls skip child-state selection after contributing their own draw state.
Animation updates reuse an index of controls with authored tracks. Root replacement and binding refreshes rebuild that index.
The scoped-clock regression checks that an update leaves unrelated registered controls unchanged.

The [owning patch](0029-share-native-ui-scene-rendering.patch) retains implementation rationale and versioned evidence.

Local image controls honor `allow_debug_missing_texture: false` when the resource is absent.
The renderer omits that decoration and preserves the rest of the authored scene. Required and malformed images keep their existing error behavior.
Native Bedrock 1.26.60.5 shows Enchanted's hub menu with these optional decorations. All 58 exported native pack files match the add-on capture.
The image regression checks omission, required-image failure, and recovery after a source change. Client decoding shares the converted-pack dimension policy and retains the previous 16-Mipixel budget for tall or wide frame strips.
Regression cases accept the native atlas shape through eviction and reload and release buffers rejected by the pixel or side bounds.
Stack fill allocation preserves sibling-derived dimensions on the other axis.
A reduced regression fails before the correction and retains visible child controls in both orientations.
Enchanted's native hub uses this layout for its four smaller trending cards.
Fractional grid capacity tolerates a one-ULP round-down at an exact fit on either axis. Larger cells still wrap.
The rebuilt add-on opens Enchanted's authored hub with all five trending cards and the three lower game cards.
A physical OP SMP selection sends original response index 2 and receives Transfer, matching native. The destination connection times out.
Complete gameplay after transfer, final typography, screen overlays, and animation parity remain unverified.

Local native UI JPEGs use a bounded reloadable texture. The texture manager owns upload, replacement, reload, and retirement.
Tests compare decoded pixels with the previous PNG conversion, check replacement resources after reload, and reject oversized headers before decoding.
A private control checks all 126 matched JPEGs in the captured MegaSMP packs without a decoded pixel difference.
An installed-client GPU control renders the captured bundle banner with identical pixels through the JPEG and previous PNG paths, including after resource reload.
The full four-project build passes. These controls do not establish complete native screen appearance or frame timing.
