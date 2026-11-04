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

Action-form dialog labels use the accepted pack translator, as the title and body already do.
`ModalFormTransitionTest` covers translated and literal buttons without authored JSON UI.
Native Bedrock 1.26.60.5 and BDS 1.26.60.6 establish the expected text with the same English language pack.
Rebuilt direct and ViaProxy clients show the translated button in Java dialogs and return original response indices 0 and 1.
This verifies the generic fallback defect; the original Lifeboat dialog report still needs a matching form capture.

The [owning patch](0095-integrate-authored-native-ui-presentation.patch) retains implementation rationale and versioned evidence.

Bundle snapshots retain physical slots, view limits, native names, and localized descriptions. Bounded physical preview tables preserve full item components independently of Java bundle contents; identity and amounts must match before a client can use them. Storage and cooking scene controllers accept explicit tooltip views and preserve native visibility, remaining capacity, selection, and overflow values through program export. Original 1.26.60.5 callbacks and local scene tests cover these boundaries. The shared controller publishes the native container classification. Player and workbench integration and their scene tests live in [deferred patch 0012](../deferred/0012-retain-bedrock-creative-catalog-entries.patch), outside this upstream PR. Input lifetime, rendering, and live comparisons remain unfinished.
