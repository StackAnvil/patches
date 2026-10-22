Container presentation binds the [shared scene renderer](0029-share-native-ui-scene-rendering.pr.md) to real Java menus and slots. Inventory content, cursor, clicks and close packets remain authoritative.

## Native storage presentation

The renderer also imports the core's native container program through a separate negotiated payload.
It binds the actual connection, menu object, menu ID and increasing presentation sequence.
The actual chest, shulker, hopper or dispenser menu owns slots, carried stacks, state revisions and every inventory action.
Version-3 presentation retains all eight core storage variants.
Tests cover each bundled scene's visible-control validation, actual menu identity and pickup, quick-move and drag dispatch.
Native visual and direct/ViaProxy transaction comparisons remain unverified.
Failed presentation restores the original ordinary screen; this remains an unresolved parity defect for a supported scene.

## Brewing stand

Version 4 adds the authored brewing screen over a real `BrewingStandMenu`.
Counter updates require the current play listener, menu object, kind, menu ID, and presentation sequence.
The screen uses full native counters independently of Java's short menu properties.
Its slots keep ordinary authoritative inventory operations. Storage count-one providers do not apply to this workstation.

A fresh BDS 1.26.51.1 test places nether wart through the screen, brews three water bottles, and transfers three awkward potions.
A read-only observer confirms the native screen class and matching core and client counter snapshots through completion.
Screenshots cover progress, completed items, and empty bottle placeholders.
The chest action, ordinary chest transfer, and reconnect checks also pass.
All 1,306 installed core classes match the rebuilt artifact.

The full build passes 2,162 tests, with 152 optional skips. Core and client stacks replay all 102 and 38 patches.
Native pixel, direct-client, and Iris comparisons remain open.

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

## Upstream prerequisites

- [viafabricplus-bedrock patch](../../viafabricplus-bedrock/upstreamable/0029-share-native-ui-scene-rendering.pr.md): Land shared scene and GUI actor rendering before container presentation.
