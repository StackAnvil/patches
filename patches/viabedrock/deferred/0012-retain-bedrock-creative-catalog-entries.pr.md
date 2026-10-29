# Retain native creative entries

## Creative-menu drops

Java 26.3 emits `SET_CREATIVE_MODE_SLOT` with slot `-1` for creative-menu drops. The previous handler rejects this slot. Translate it into native creative craft, results, and drop actions from created-output slot 50. Preserve unrelated held items.

[Geyser implements the same native flow](https://github.com/GeyserMC/Geyser/blob/master/core/src/main/java/org/geysermc/geyser/translator/inventory/PlayerInventoryTranslator.java). Tests decode actual Java drop packets for stone and polished blackstone pressure plates. They cover single items, full stacks, pending-close queues, and invalid stack limits.

Live server-given plate drops already work in creative and survival mode. The native BDS catalog also preserves the plate runtime identity. This change targets the separate creative-menu packet path.

The updated ViaProxy build passes a category-menu Q control for a stone pressure plate. BDS also accepts a polished blackstone pressure plate dropped outside the creative catalog. Both controls use the repaired slot `-1` path.

## Creative action admission

Check cached raw player mode before accepting a direct creative packet.
Only `Default` inherits the level mode for this permission; the Java display mode does not grant access.
The shared helper is compared against 40 original actor getter observations.
Actor construction and delivery of those cached fields remain separate controls.

Validate incoming stacks through the destination provider with their whole transfer count.
Reject creative catalog drops with nonzero typed lock bytes.
These checks run before temporary inventory opening.
After opening and source refresh, replacement or clearing requires discard permission and a stack network ID.
Refused operations create no request or predicted change.

Action tests cover raw-mode differences, destination equipment and count rules, typed locks and rejected-response restoration after a mode change.
The full build passes 2,910 tests; the packaged core passes 68 focused checks and rejects 32 deliberate regressions by value.
Those packaged totals include earlier permission, identity and armor controls.

See [the native discard reference](../../../docs/native-player-inventory.md) for evidence and limits.
The new controls do not establish complete creative catalog production, created-output ownership or live acceptance of these permission changes.

## Live creative picker control

The current build completes a real E-key creative opening through ViaProxy and Bedrock 1.26.51.1.
Physical inventory-tab inputs preserve locked items after refused edits.
A physical catalog selection and hotbar placement sends CraftCreative, CraftResults and Place, then receives Success.
Client and core snapshots agree on the resulting item.
The ordinary Java picker remains installed; these observations do not establish the authored native player controller.
Physical refusals do not independently identify whether client or core admission stopped each operation.

See [the complete E-key control](../../../docs/native-player-inventory.md) for artifact verification, response counts and remaining limits.

## Bound player recipe model

`PlayerRecipeModel` binds the five progressive collections to the connection's registered recipe callbacks.
Categories read current abilities, unlocks and source counts.
Search retains its installed mode until an explicit policy reinstallation.
Category grouping captures Instabuild during construction, while search remains flat.

The model owns raw query bytes and a selected-output copy.
Equal raw bytes retain selection and the existing collection snapshot.
Every raw change clears selection and refreshes search immediately, including case changes and changes after a NUL.
This refresh preserves population cursors and dirty tabs.
Policy reinstallation preserves source rows, grouping and header expansion.

The factory requires an active container owner and retains its opening generation.
A later opening cannot reuse the old model, even when both openings use the same inventory object.
Effective filtering and cursor participation remain explicit inputs.
This API does not derive profile preferences or create a frontend screen.

The reference uses Bedrock 1.26.51.1, build 51061372, protocol 2193.
The original collection constructor, stored search callbacks, query setter, selected-stack operations, normalization, complete collection refresh and recipe counter execute together.
All 224 transitions match query ownership, selection retention, eligible counts, item order and producer call counts.
The controls vary installed and current abilities, filtering, raw edits and explicit reinstallation.
They include invalid UTF-8 bytes and queries beyond inline string capacity.

The probes supply model and map backing, four source rows, an empty grouping registry, actor and recipe backing, text producers and CRT services.
Native collection buffers and query temporaries return to the retained allocation baseline after their explicit destruction.
These controls do not establish complete backend registration or controller lifetime.
Frontend edit delivery and installed player-screen publication remain unfinished.
The ordinary Java picker remains installed.

All 104 core patches replay, and the four-project build passes 3,019 tests with 152 optional skips and no failures.
Both Checkstyle tasks pass.
All 29 packaged checks pass against the built core JAR, with 34 production class origins verified.
Both embedded consumers contain the same 1,544 core classes and 199 assets.
The add-on also matches all 1,193 compiled client classes.
