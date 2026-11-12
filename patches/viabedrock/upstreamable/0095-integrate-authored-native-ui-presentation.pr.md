# feat(ui): resolve authored Bedrock server UI scenes

## Purpose

Evaluate loaded JSON UI templates, scoped variables, collection bindings and bounded native string expressions against each server form. Preserve original form IDs and button indices when projecting Java dialogs or sending raw inputs to a client with a confirmed UI program. The add-on reads images and nine-slice metadata from nested Bedrock packs. Keep the versioned built-in UI identity in conversion fingerprints.

## Design constraints

Core owns menu identity, authoritative state, recipe actions, and response reconciliation. Publish authored presentation only after the frontend confirms the accepted program identity and resource generation. Keep ordinary Java fallbacks available.

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

Form captions accept RawMessage objects as well as strings. Resolution uses the accepted language stack before form decoding and preserves IDs, content ordering and response shape. A packet-to-state regression covers a translated label-only story form. A live SoulSteel join now displays the translated opening story without the former decoder exception. Continued connection and story progression remain under investigation.

Negotiated chat notifications retain bounded creation history independently of ordinary Java chat. Refreshes preserve existing factory identities; missing capability or unsupported presentation retains the Java path. Regressions cover history eviction, fallback and scene updates.

Action-form text values: core keeps the text limits of the action form that the native channel presented. A `text_values` payload for that form becomes the native JSON string array, such as `["red"]` for the CubeCraft Wardrobe search. A payload that also names a button, has another value count or exceeds a limit closes the form instead of sending invented text. `ActionFormTextResponseTest` covers these responses. A live Wardrobe check confirms visible typed text and the native responses for untouched, focused-empty, typed and cleared fields; ordinary numeric navigation also works.

Logical containers and unset text: a logical family is presented only with an action backend, because its high slots have no Java menu slot for vanilla input; the legacy backend declines it. `NativeContainerUiState` resets the logical items once per presentation and then sends only changed slots, and stops when the presentation no longer owns the menu (`NativeContainerUiStateTest`). For action-form text, official 1.26.60.5 sends `[null]` for an untouched Wardrobe search field and `[""]` after focus alone or a cleared field. A `text_set` byte per value marks focused or edited fields; an unset field must be empty and becomes `null`, and payloads without flags keep string values (`ActionFormTextResponseTest`). Custom-form defaults are unchanged.

Vanilla equipment hover text is resolved in the core and retained with the converted item. Authored action scope and add-on rendering use that same language-resolved text. The existing native enchantment table supplies category order, names and level rules; armor, dye and melee damage sections precede lore. Original 1.26.60.5 instruction controls verify name color, section styles and order, first-match Sharpness lookup, damage arithmetic and the resistance display factor. They use declared allocator, tag, translation and item-property inputs; they do not establish complete per-item class or component parity. The captured native shop registry has no component overrides for the affected vanilla equipment. Unknown item branches, trim and data-driven item definitions remain outside the added path. Per-item native class and material-property association is not fully verified. Targeted tests cover enchanted damage, dyed armor, localization, unsupported fields and the legacy action fallback.

Oversized action forms use the separately negotiated `viabedrock:native_program_form` channel. Older action-form clients receive ordinary dialog controls. An owner- and form-ID-checked fallback request also restores ordinary action controls and clears the native text-value contract. Packet regressions cover negotiation without sending a compact program to an older client.

Accepted scoreboard scenes use the independent `viabedrock:native_hud_scoreboard_v1` capability. Objective selection, score batches, identity changes and removal refresh or clear its snapshot; ordinary Java objective and score packets remain available as fallback. The snapshot retains raw Bedrock names and native score values. Join and capability snapshots include the current sidebar.

HUD root snapshots include current boss-bar progress and refresh when the server changes it. This keeps an authored progress image current after its duplicate Java fallback has been suppressed.

HUD root snapshots also carry the current title and subtitle strings, which the native HUD controller publishes to persistent controls as well as title factories. Each title update refreshes the root; a repeated title that leaves the scene unchanged sends nothing. The title state retains the root's `visibility_changed` binding values for the connection. MegaSMP repeats a `%obj%Tutorial` title every second, and its accepted pack hides that text from `hud_title_text` and shows it in a small top objective panel. `NativeHudPacketTest` drives SET_TITLE packets through a reduced copy of that pack. The routed title cancels the Java title, the root shows the objective, a repeat resends only the title scene, and an unrelated title leaves the objective in place. Removing the root refresh makes the test fail. Native visual parity was not compared.
