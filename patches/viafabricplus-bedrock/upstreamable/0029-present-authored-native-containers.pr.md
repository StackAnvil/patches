# feat(inventory): present authored native containers

## Purpose

Bind authored container geometry to authoritative Java menus, slots and cursor state without changing inventory request ownership.

## Design constraints

Bind authored geometry and controls to the actual menu, cursor, slots, connection, and opening token. Keep request ownership in core and use ordinary screens when required components are unavailable.

Prerequisites:

- viafabricplus-bedrock/0029-share-native-ui-scene-rendering.patch: Land shared scene and GUI actor rendering before container presentation.

## Validation and remaining limits

Regression coverage includes `BedrockNativeContainerScreenTest`, `NativeContainerButtonTest`, `NativeContainerGeometryTest`, `NativeContainerInputTest`.

Authored slot labels use [shared native count text](../../viabedrock/upstreamable/0095-share-native-ui-programs-and-resources.pr.md).
The consumer regression keeps raw binding quantities and genuine quickcraft preview text independent of display capping.

Player and workbench snapshots retain actual menu slots, recipe identities, and full item previews.
Commands carry the opening, generation, snapshot revision, and request sequence.
Buffered search edits survive an acknowledgment that advances the container generation.
Late replies and hover exits cannot affect a replacement opening or selection.

Default player and workbench graphs retain all 46 menu slots and real recipe rows.
Help uses the native How to Play or Encyclopedia graph and the client key bindings.
Screen regressions cover slot confirmation, keyboard Back, Escape, repeated Help openings, and a retained carried stack.
Model regressions retain the opening and pending search across Help and source updates.
Live direct and ViaProxy checks reach Help in the inventory-only layout.
The proxy control resolves navigation labels, returns on Escape, and confirms an eight-log pickup with a successful server response.
Inactive recipe icons and bundle previews still restore ordinary controls.
Unsupported visible glyphs, recipe auxiliary actions, and held-selection commands also restore ordinary controls.
Rejected presentations remain retired until the next opening, so subsequent updates do not repeat the failed installation.
Bulk recipe actions, Creative cursor replacement, complete cooking integration, live transfers, and the original E-key background report remain unresolved.

The [owning patch](0029-present-authored-native-containers.patch) retains implementation rationale and versioned evidence.
