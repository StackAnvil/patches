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

The default player and workbench scenes retain ordinary controls.
Their Help command and remaining renderer bindings need implementation before the add-on admits those hosts.
Rejected presentations remain retired until the next opening, so subsequent updates do not repeat the failed installation.
Bulk recipe actions, Creative cursor replacement, complete cooking integration, live transfers, and the original E-key background report remain unresolved.

The [owning patch](0029-present-authored-native-containers.patch) retains implementation rationale and versioned evidence.
