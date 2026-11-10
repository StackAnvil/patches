# feat(ui): resolve authored Bedrock server UI scenes

## Purpose

Evaluate loaded JSON UI templates, scoped variables, collection bindings and bounded native string expressions against each server form. Preserve original form IDs and button indices when projecting Java dialogs or sending a negotiated native rendering scene to a client integration. Keep pack texture bytes and nine-slice metadata in the converted pack, and include the versioned built-in UI identity in conversion fingerprints.

## Design constraints

Core owns menu identity, authoritative state, recipe actions, and response reconciliation. Publish authored presentation only through negotiated, lifetime-bound programs. Keep ordinary Java fallbacks available.

Prerequisites:

- viabedrock/0095-share-native-ui-programs-and-resources.patch: Land the shared UI program and scene contracts before registering presentation channels.

- viabedrock/0054-render-native-block-state-geometry-and-materials.patch: Land canonical block auxiliary descriptors and restriction lookup before native subtype-aware merge checks.

- viabedrock/0078-preserve-native-identifiers-in-java-item-data.patch: Provide immutable native item predicates and their Java item-context transport.

Native item predicates belong to the constructed receiver. Built-in Snowballs retain their constructor-installed throwable component when declarations omit it. Data-driven replacement of that name starts from its new class. Numeric lookup and retained definitions remain separate during item-ID collisions. `ItemRegistryAirUseTest` covers these boundaries.

## Validation and remaining limits

Regression coverage includes `NativeItemNamesTest`, `NativeItemStackingTest`, `NativeContainerLegacyActionsTest`, `NativeContainerTransferTest`.

`NativeItemStorageData` publishes storage weight independently of Java bundle contents.
It reads typed definition components, cached weight, and actual dynamic contents. Missing containers remain unknown.
The original 1.26.60.5 producer executes 159 controls; 24 representative cases ship as regression data.
The controls supply Item queries, typed NBT lookup, container/vector backing, and descriptor storage.
Component defaults, tooltip selection, source timing, and complete installed pixels remain unverified.

Storage weight, physical tooltip snapshots, and transfer planning share the native container-identity decoder.
Original storage admission and child lookup controls execute the native CompoundTag presence and typed-int getters: a present string identity selects container zero, while an absent identity selects none.
Local regressions cover zero-container weight, unknown contents, tooltip transport, and physical insertion.
Full protocol tag construction and installed controller behavior remain outside these controls.

`ItemStoragePolicy` retains typed slot limits, nesting flags, and immutable lowercase descriptor maps on each selected definition.
Registry regressions cover packet mutation, numeric-ID collisions, absent updates, and malformed replacements without inventing unrestricted filters.
The full stack supplies descriptor binding and request execution in [deferred patch 0012](../deferred/0012-retain-bedrock-creative-catalog-entries.patch). Effective expression version context and controller delivery remain unfinished.

Packet, menu-lifetime, and action tests cover supported adapters. Complete installed player/cooking controllers and live native parity remain unfinished.

Selected-item presentation retains an immutable source/count snapshot independently of the real cursor.
Explicit selected-item bindings take precedence over enclosing slot and recipe collections.
Scene regressions check the original selected icon and count controls, source retirement, and oversized quantities.
Installed selected-source validation and its limits are recorded in the [cooking reference](../../../docs/native-cooking-actions.md#validation).

Action-form dialog labels use the accepted pack translator, as the title and body already do.
`ModalFormTransitionTest` covers translated and literal buttons without authored JSON UI.
Native Bedrock 1.26.60.5 and BDS 1.26.60.6 establish the expected text with the same English language pack.
Rebuilt direct and ViaProxy clients show the translated button in Java dialogs and return original response indices 0 and 1.
This verifies the generic fallback defect; the original Lifeboat dialog report still needs a matching form capture.

The [owning patch](0095-integrate-authored-native-ui-presentation.patch) retains implementation rationale and versioned evidence.

Bundle snapshots retain physical slots, view limits, native names, and localized descriptions. Bounded physical preview tables preserve full item components independently of Java bundle contents; identity and amounts must match before a client can use them. Storage and cooking scene controllers accept explicit tooltip views and preserve native visibility, remaining capacity, selection, and overflow values through program export. Original 1.26.60.5 callbacks and local scene tests cover these boundaries. The shared controller publishes the native container classification. Player and workbench integration and their scene tests live in [deferred patch 0012](../deferred/0012-retain-bedrock-creative-catalog-entries.patch), outside this upstream PR. Live selected-item detail instances travel with the retained view independently of bundle visibility. The factory stays dormant until requested. A transported controller regression covers popup creation, refresh, and retirement. Bundle count bindings use native display text before layout and retain physical count annotations for extraction. Full input lifetime, native detail visibility, and live pixel comparisons remain unfinished.

`NativeBundleTransferPlan` retains physical child slots, native preparation order, and cleanup transfers after a rejected insertion.
`NativeBundleTransferPlanTest` compares 47 original 1.26.60.5 mutation controls and checks owned item snapshots.
The controls cover weights, filters, nesting, partial extraction, holes, and interleaved merges.
Desktop default extraction uses a separate single-Take path. Twelve original native helper controls and four generic-transfer controls establish last physical selection, partial merging, rejection, empty vectors, and zero-count retained definitions. Local regressions preserve this distinction from selected-cell extraction and its compaction. The full stack supplies trusted policy and request adapters in deferred patch 0012; live controller calls remain unfinished.

Boss events keep native collection order and resend the HUD root only when it changes.
Each Java boss bar follows the accepted boss panel: a bar the pack presents elsewhere leaves the Java boss overlay and returns if a later name makes it visible.
Progress and style updates reach only shown bars, and a removed actor leaves the collection.
On CubeCraft, this removes the raw `cc_hotbar_text…` name and purple bar shown during the Free For All queue, kit selection, arena spawn and Skyblock introduction.
`NativeHudBossBarsTest` covers add, hide, rename and return transitions. Clients without the negotiated native HUD root channel retain their Java bars. Late channel registration reconciles existing bars with the authored HUD; a regression also covers restoring the fallback when that capability is absent.
Offline replay of a captured CubeCraft Skyblock introduction shows the Introduction boss bar at the top and the authored "Hold sneak to skip panorama" text above the hotbar; the raw `cc_hotbar_text` bar no longer appears. No live CubeCraft recheck ran for this change.
