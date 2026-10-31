# feat(ui): resolve authored Bedrock server UI scenes

## Purpose

Evaluate loaded JSON UI templates, scoped variables, collection bindings and bounded native string expressions against each server form. Preserve original form IDs and button indices when projecting Java dialogs or sending a negotiated native rendering scene to a client integration. Keep pack texture bytes and nine-slice metadata in the converted pack, and include the versioned built-in UI identity in conversion fingerprints.

## Design constraints

Core owns menu identity, authoritative state, recipe actions, and response reconciliation. Publish authored presentation only through negotiated, lifetime-bound programs. Keep ordinary Java fallbacks available.

Prerequisites:

- viabedrock/0095-share-native-ui-programs-and-resources.patch: Land the shared UI program and scene contracts before registering presentation channels.

- viabedrock/0054-render-native-block-state-geometry-and-materials.patch: Land canonical block auxiliary descriptors and restriction lookup before native subtype-aware merge checks.

## Validation and remaining limits

Regression coverage includes `NativeItemNamesTest`, `NativeItemStackingTest`, `NativeContainerLegacyActionsTest`, `NativeContainerTransferTest`.

`NativeItemStorageData` publishes storage weight independently of Java bundle contents.
It reads typed definition components, cached weight, and actual dynamic contents. Missing containers remain unknown.
The original 1.26.60.5 producer executes 159 controls; 24 representative cases ship as regression data.
The controls supply Item queries, typed NBT lookup, container/vector backing, and descriptor storage.
Component defaults, tooltip selection, source timing, and complete installed pixels remain unverified.

Packet, menu-lifetime, and action tests cover supported adapters. Complete installed player/cooking controllers and live native parity remain unfinished.

The [owning patch](0095-integrate-authored-native-ui-presentation.patch) retains implementation rationale and versioned evidence.
