## Purpose

Render server-authored Bedrock form and container scenes after ViaBedrock resolves pack definitions, variables and bindings. Keep each original form ID and button index. Use the existing Java click-action response path and a negotiated client payload. Negotiate native custom-form support separately, and keep the original content indices and response types.

The renderer uses accepted pack textures and bundled licensed UI definitions. Pack paths use accepted textures; public HTTPS image URLs load asynchronously without account credentials or another package acquisition. No local Bedrock installation is required. Ordinary Java controls remain the fallback when a visible control or dimension cannot be rendered. Missing or corrupt individual images retain usable captions and responses.

## Behavior

- Keep authored control hierarchy, anchors, signed offsets, stack and grid layouts, content dimensions, layers and clipping.
- Default image dimensions inherit the control's owner extent. Use texture aspect sizing only when `default_size_scales_to_ratio` is enabled. Slider skins therefore fill their authored track and thumb bounds.
- Apply native small, normal, large and extra-large font multipliers consistently to label measurements, wrapping and drawing. Multiply by the authored font factor without imposing a minimum size. A zero factor has zero text extent; unknown size names use normal, as the native parser does. Visible negative factors retain ordinary controls until native layout and mirrored drawing are verified. Hidden controls with negative factors remain accepted.
- Measure wrapped labels within their resolved width and clip text to authored bounds. Draw labels, accepted pack images, public HTTPS images and native four-side nine-slice borders. Select authored default, hover and locked visual branches. Support the native `hover_text_renderer` through formatted Java tooltips; other visible custom renderers retain the ordinary-form fallback.
- Play resolved alpha tracks, including initially transparent cards and hover branch reentry.
- Keep hidden controls, authored properties and collection indices. Reset their computed size metrics to zero through inherited visibility, as the original visibility setter and dependency scheduler do. Child, peer, stack cursor and fill calculations consume those computed metrics. Keep disabled controls measured. Default stacks sum their main axis and inherit their cross axis from the parent; explicit content dimensions retain their own dependency rules. Do not prune collection entries or remap grid response indices.
- Use Java focus, narration, tooltips, keyboard navigation and pointer handling. Provide bounded vertical and horizontal scrolling with proportional, draggable thumbs.
- Omit individually missing or corrupt valid images with a readable status, preserving usable captions and responses. Invalid resource identifiers keep the ordinary-form fallback.
- Reject stale-connection responses and send at most one response from a screen.
- Keep original buttons usable while remote images load or fail. Fetch and decode on four workers, validate redirects, share a 20-second deadline, and cap each image at 4 MiB and four million pixels, with a sixteen-million-pixel screen budget including pending uploads. Cache normalized PNGs by target version and full URL hash with 128-entry and 64 MiB limits. Release each screen's dynamic textures when it closes. Do not retain failed requests across reopened menus.

## Custom controls

Resolve labels, headers, dividers, toggles, text inputs, dropdowns, sliders and step sliders through the authored UI program. Keep input widgets stable while dependent controls resolve again, preserving caret, selection and focus. Expanded dropdowns use their authored branches. Responses retain null slots for prose and the original boolean, text, scalar or option values. Unsupported visible controls retain ordinary controls.

Apply native slider placement after layout. Keep authored anchors, position the thumb along the full owner extent, and preserve the progress clip ratio and step rounding. Select default, hover, disabled and pressed visual states before measuring their branches. Hidden descendants retain their authored visibility. Use the current Minecraft mouse-button constant for clicks, drags and releases; its SDL left-button value is 1.

Apply image clipping to each native slice in submission order. Pixel-perfect clipping rounds against source pixels. Keep corner slices and signed interiors, and omit only non-finite output quads. Active clipping bypasses the single-image aspect fit; nine-slice images also bypass that fit.

## Evidence and limits

Research uses the pinned official 1.26.51.1 native executable and actual captured resource-pack definitions. Original native controls bind scalar/four-side nine-slice parsing, missing-template child omission, grid rescaling ratios, dimension token parsing and child/peer dependency enumeration. The original native image draw consumer also binds left/top/right/bottom sides, corner-edge-center submission order, UV border scaling by both metadata dimensions, and unclamped signed interiors on undersized destinations. The Java submission normalizes inverted destination bounds while swapping float UV endpoints through the existing GUI pipeline. Native GPU winding and culling remain unverified. The original visibility setter, metric constructor, callback, registrar and dependency scheduler also bind fresh and re-hidden size resets, default stack axes, nested hidden-descendant wrappers and header fill allocation. Factory hierarchy and visibility flags are supplied in these controls; collection clone/population and controller notifications remain outside the fixture. The original label loader, enum parser and text-submission consumer bind font-size multipliers of 0.5, 1, 2 and 4, multiplied by the authored factor. The wrapping consumer uses the same product. Named-font lookup is case-sensitive, but the native registry-to-file initialization and glyph renderer are not yet bound. Acquired metadata-selected TTF families now use isolated Java font resources, with native hhea size and baseline normalization and default glyph fallback. Alias/MSDF families and exact native raster pixels remain unverified. These results do not establish full native pixel layout.

The Java layout solver still uses bounded iterative measurement. Its mixed-template grid extents, zero maximum-size sentinel, proportional scrollbar geometry and polynomial alpha easing need further native consumer comparison. Native font-family glyph metrics, baseline and tooltip pixel placement, size/UV/color tracks, loop behavior and named next-animation chains remain open. Authored final static dimensions remain usable when a size animation is present.

## Asset pipeline boundary

The addon provider can supply bundled `ui/*.json` definitions and textures to the core when its optional `builtin_ui.zip` is absent. The current five tracked addon asset ZIPs contain zero `ui/` entries, however. Expanding the producer whitelist does not add definitions to those existing bundles. A default CI build without the optional core UI ZIP therefore still lacks the native baseline templates. Server packs that depend on them may use ordinary form controls instead.

The provider currently reads only its packaged, version-checked asset library. It does not acquire missing UI definitions from a Microsoft Store session or a versioned runtime package cache. If the entire addon asset bundle is absent, its loader throws instead of returning an empty layer. These are separate pipeline and graceful-loading gaps. The verified private core candidate includes the official UI baseline; its successful build is not evidence that default CI has that baseline.

## Verification

- Twenty-six targeted layout and image-region tests cover anchors, sparse original actions, visibility lifecycle, disabled-control geometry, hidden descendant wrappers, default stack axes, wrapping, clipping, grid rescaling, drag clamps, resize, alpha branch reentry and native asymmetric/signed/float-UV regions. Five regression cases fail without the computed-visibility fix and pass with it.
- Three production HTTP fixture tests cover nonblocking deduplication, offline cache reuse, target-version isolation, redirects, stream bounds, corrupt caches and decoded pixel limits, rejected queues and reopening after a transient HTTP failure. All 18 distinct remote images from five actual captured raw forms download and decode through this loader in a private probe. That result does not prove actual client rendering.
- Private probes parse and lay out all four actual captured ActionForm scenes with inferred font and image metrics. Their original button counts are 19, 36, 8 and 25. At two viewports, the repaired header retains positive width and the first captured Wardrobe category enters its viewport. Original visible action sets remain unchanged. A separate audit resolves all 603 image nodes through actual converted PNGs and cached HTTPS images, then verifies all 4,195 production-generated source and destination regions. Six complete native draw controls match 54 Java region quads and 432 coordinates. These are CPU geometry and real-image-dimension checks, not Java GPU drawing. The Wardrobe scene includes sixteen bound native hover-text nodes. Earlier synthetic Game Selector and variant probes remain separate evidence. These checks do not claim native screenshot parity.
- Three additional font regressions exercise native size factors through wrapped stack allocation, explicit clipping, zero and hidden negative factors, original response identity, normal fallback and small unclamped text. All fail with the prior factor-only implementation and pass with the change. The private font/layout suite passes all 26 cases. A separate gate keeps the original action sets and positive sized captions in all four actual captured scenes at two viewports, using inferred Java glyph metrics. The combined replay and full build now include this source change.
- Before the container extension, the complete 31-patch replay and combined Gradle test, check and build gates passed: 674 tests, 556 passed, 118 skipped, no failures or errors. Access-widener validation passes. This project declares no Checkstyle task.
- Four interaction tests exercise the actual SDL left-button value, dependent toggle visibility, dropdown expansion and selection, typed responses with null slots, inverted scalar and stepped sliders, single-option sliders, and validation of newly visible unsupported controls. The click regression fails before the mouse-button fix.
- Native slider execution fixtures cover 184 placement, pointer, state and progress cases. Image-clipping fixtures compare 80 controls and 1,888 coordinates, plus aspect-dispatch and zero-source cases. These are CPU consumer checks with supplied components; native scheduler integration and GPU drawing remain unverified.
- The current immutable core candidate has SHA-256 `2e348845a6cc04732804dec3b555ecbdb57e9175e7324951544a4eb6799ca6ce`. The paired addon candidate has SHA-256 `99e7a8f8f63e85c83ff9527dae6ebf2f2cb275a2c88a3bf9e8caa2322aab0d04`; all 1,323 approved core namespace, asset and license entries match, excluding the manifest and the Loom-added module descriptor. Detailed evidence remains private. No credentials, captures, screenshots, bundled official assets or private paths are added to this patch.

Actual client menu rendering, resource reloads and Iris routes must be checked with the final candidate before release.

The image sizing change passes all 27 layout tests. Seven native default, explicit, hidden and min/max sizing controls and four opt-in aspect controls establish the pinned build's behavior. All five captured Settings step sliders pass CPU layout at two viewports using the actual program and PNG dimensions. Live GPU rendering remains pending for this change.

## Native chest presentation

The renderer also imports the core's native container program through a separate negotiated payload.
It binds the actual connection, menu object, menu ID and increasing presentation sequence.
The existing ChestMenu owns slots, carried stacks, state revisions and every inventory action.
Unsupported presentation keeps the complete ordinary container screen.

Shared UI classes now own bounded scene parsing, layout, images, text, font factors, scroll geometry and visual states.
Modal forms retain their own response model and custom input state.
Native containers use typed slot and cursor annotations, rather than fake form actions.

Authored slot buttons inherit their real cell extent when their dimensions are absent or default.
Explicit dimensions still apply. Each ordinary native cell has an 18-pixel input rectangle and a 16-pixel item renderer.
The same clipped rectangle controls hovering, tooltips and vanilla click, release and quickcraft handling.
Scrolled rows retain their registration while their hover rectangles respect the viewport.

Native progress bars use authored dimensions and flags, original endpoint quantization, shadow bounds, rounding, storage minimums and durability colors.
Java damage and count come from the actual stack, including vanilla's quickcraft preview.
The slot decoration hook suppresses duplicate Java bars and counts.
Typed authored count labels use Java count presentation once at their resolved bounds and clip.
The vanilla carried item and its decorations remain authoritative.

Transient flights compare actual mapped slot states after genuine menu operations or revisions.
They cancel unchanged same-slot counts and match equivalent item losses to gains.
Unmatched additions or removals produce no flight.
Matched collection controls provide top-left coordinates and width divided by sixteen for scale.
Flights use native quintic motion, distance-based duration and the original 0.3-second lifetime.
No synthetic carried-item collection or mouse anchor is added.

Native lock bytes come from retained pre-conversion user data with exact ByteTag semantics.
Absent or wrong-type values produce zero. The owned Bedrock connection supplies the actual showTags gamerule.
Nonzero values keep ordinary controls if that rule source is unavailable. Empty stacks suppress lock decorations.
Known Java or retained native bundles keep ordinary controls while storage bindings remain unsupported.
Unknown storage values stay absent, rather than fabricated zero amounts.
An active progress bar with invalid amounts or an active unsupported item filter triggers ordinary controls.

### Evidence and remaining boundaries

Original native CPU fixtures cover twenty progress cases, seven flight timing cases, four initial queue cases, eight state comparisons and five anchors.
Twenty-five genuine NBT controls and 125 complete UI callback controls establish unsigned typed lock reads, missing-value behavior and showTags-gated decorations.
Native collection marker preference, local Java operation timing, item equivalence and cursor collection membership remain bounded adapter assumptions.
Absent inactive-item filters use ordinary Java item presentation; no false native binding is manufactured. A projected active filter keeps the ordinary screen.
Java device scale supplies endpoint quantization. Count formatting uses Java presentation, not a claimed native formatter.

Actual accepted-pack three-row and six-row programs resolve all 63 and 90 slot addresses.
Their active slot rectangles and 65 or 92 PNG slice paths pass CPU validation with actual image dimensions.
The paired v9 overlay retains all 63 and 90 typed authored count labels and one chest title per kind.
That shallow same-name definition overlay follows the actual versioned partial pack declarations; original native publication semantics remain under investigation.
A separate export/import probe preserves a supplied OPEN_SCREEN title while retaining the captured condition title.
The private shared form/container suite passes 72 tests with one skipped fixture.
It also rejects an unsupported visible button action while accepting the same hidden control.
Tooltip tests preserve styled runs and leading, repeated and trailing blank lines across CRLF normalization and width wrapping.
The actual Wardrobe capture has sixteen components with two line breaks and no authored width; these now use the multiline path.
These checks do not establish GPU drawing, live transfer behavior, resource reloads or Iris compatibility.
Those final client gates remain required before release.

The final container, form, tooltip and preserved actor changes pass the complete normal 31-patch replay and clean Gradle check, build and POM gates: 696 tests, 578 passed, 118 optional skips, no failures or errors. Access-widener validation passes. All 1,302 embedded core entries match the paired immutable core. The 38 installed artifacts remain unchanged. Live inventory transfers, resource reloads and Iris compatibility remain required before release.

## Actor-backed UI portraits

The shared renderer accepts the pinned `live_horse_renderer` for verified real player actors.
The negotiated actor-state v3 channel maps the authored signed native UID to the actual Java UUID.
The legacy v2 channel remains byte-compatible and has no inferred UID.
Missing or removed actors produce no portrait. Unverified actor classes retain ordinary controls.

Original target CPU controls establish string UID parsing, missing ID `-1`, player-family admission, mouse input mode and camera rotation.
The camera uses the authored box center and width through the normal Java entity GUI pipeline.
A scoped transform separates depth from Java's uniform GUI scale.
Portrait controllers, equipment and emotes retain separate playback, variables and caches.
Scene changes, actor replacement and screen closure retire those retained resources.
World animation clocks and effect dispatch remain unchanged.
Active GUI particle or sound cues retain ordinary controls until their submission is implemented.
Unsupported portrait opacity also retains ordinary controls.

Grid capacities use integer count bounds independently of pixel geometry bounds.
The accepted Social definitions contain a million-cell capacity with only a bounded number of actual children.
Sparse measurement visits those children without allocating or iterating the declared capacity.
Malformed, fractional and overflowing capacities remain rejected.
The prior fixed-grid position formula remained a native comparison boundary.

The focused suite passes 42 cases: 39 passed and three optional fixtures skipped.
It covers independent playback, failure-safe scope restoration, transform preservation, resource retirement, signed UID parsing and bounded grid measurement.
The actual accepted ordinary chest scene passes 63 slot addresses and 65 image regions.
That prior supplied profile-title scene passes parsing and layout, then correctly rejects an unresolved close-button mapping.
Its authored portrait UID is 150150. These supplied title and empty-menu inputs do not establish actual Social metadata delivery or actor presence.
Native projection, pixels, transformed startup, resource reloads and Iris compatibility remain required client gates.
The clean combined build passes 706 cases: 588 passed and 118 optional fixtures skipped.
The normal 31-patch replay, Gradle check, build, POM and access-widener gates pass.
All 1,304 embedded core entries match the private actor-UID candidate.
The 38 installed artifacts and all 58 frozen v10 files remain unchanged.
The private portrait candidate is not installed; actual client and Iris gates remain pending.

### Manual grid sizing and positions

Grids without an item template use each child's authored `grid_position`, with `[0,0]` when absent.
Their children measure percentages, anchors and offsets against the full parent extent.
The cell stride changes placement without dividing the child's measurement context.
Template grids retain their existing collection placement and sizing.
Only actual bounded children are measured; million-cell capacities allocate no additional nodes.

Original native property readers, GridItem writer and fresh dependency scheduler bind these rules.
The target layout suite passes 32 cases, including positions, constraints, hidden controls, templates and absent positions.
Zero or missing manual capacities retain ordinary fallback because their native secondary inactivity lifecycle remains unbound.
Malformed and overflowing positions also retain fallback; native machine overflow is not presented as a Java exception rule.

The accepted profile diagnostic selects 19 distinct addresses with full-parent geometry.
Its supplied hover strings remain separate from production values and captured Social data.
Production hover text, the native one-item autoplacement action and intentional subset admission remain open.
The strict action and full-slot completeness guards are unchanged.
Native portrait pixels, current client acceptance, resource reloads and Iris compatibility remain required client gates.

The final paired clean build passes 726 cases: 608 passed and 118 optional fixtures skipped.
Normal replay retains all 31 patches; Gradle check, build, POM and access-widener validation pass.
All 1,311 approved core entries match the private manual-grid core candidate.
The 38 installed artifacts, 58 frozen v10 files and 45 prior actor-candidate files remain unchanged.
These private candidates do not establish current client or Iris acceptance.


## Authored manual container interaction

A negotiated native action capability permits an intentionally authored subset of real menu slots.
Full template chests still require complete slot coverage.
Every active authored action must map to its real menu slot and clipped pointer rectangle.
Hidden or omitted slots do not receive generic pickup, shift, number-key, drop, double-click or drag actions.

The client waits for real contents on the same menu object before preparing the presentation.
It waits for server activation acknowledgment before sending a count-one request.
Closing, disconnecting, replacing the menu or receiving stale sequence data retires ownership.
A send or presentation failure disposes the candidate or restores ordinary controls for that exact menu.
Scroll-triggered scene refresh shares the same deterministic fallback path as slot and tick updates.

Real typed custom-name and lore presentation supplies the native-proven hover subset.
Unsupported default-name, filter or translation inputs retain fallback instead of fabricated descriptions.
The controlled named physical chest projection registers authored slots 9, 17 and 18 from actual item data.
This CPU projection is distinct from actual actor-backed Social delivery or GPU verification.

Four private screen integration tests pass, including installed presentation failure and transport cleanup.
Additional controller tests cover empty opening followed by real contents and reused-menu rejection.
The final paired clean build passes 730 cases: 612 passed and 118 optional fixtures skipped.
Access-widener validation, check, build and POM generation pass.
The separate compact export replay applies all 99 core and 31 addon patches and reproduces the tested source bytes.
All 1,323 approved core entries also match the freshly shaded ViaProxy artifact, which passes its four tests.
The 38 installed files and previous candidates remain unchanged.

A separate offline evaluation uses the captured actor name and real typed item names.
It selects the authored manual branch, references slots 0 through 18, and exposes actions for slots 9 through 14.
This does not establish initial actor metadata timing, authored coverage during live preparation, server action acceptance or rendered pixels.
Native controller focus/navigation and complete native pixel parity remain unverified.
