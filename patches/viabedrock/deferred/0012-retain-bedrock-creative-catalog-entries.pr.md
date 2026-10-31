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

`NativePlayerRecipeState` constructs the real model for an installed E-key opening, including while its native acknowledgment is pending.
The read-only context uses cached player sources and the connection's actual recipes.
The acknowledgment preserves the model, query, selected output, and captured ability policies.
Acknowledged container identity and generation still control item actions.
A workbench model retains its exact container generation.
Retired openings cannot read replacement sources or retire a later workbench model.

Real profile settings update filtering and the selected tab.
Missing profile preferences remain absent; the initial filtering value follows the observed current native constructor.
Source, recipe, unlock, ability, rule, and preference changes invalidate the retained collections.
Catalog replacement refreshes source collections while preserving the backend's installed policies and owned query.
The state publishes the retained rows and full item previews through a bounded, compressed protocol-2225 snapshot.
The view adapter can expand a fixed recipe-grid window while retaining every source row and item preview.
Local windows preserve original recipe IDs, all real menu slots, and the authoritative snapshot revision.
A 2,000-row Creative regression covers distant windows and exported-program round trips.
Each snapshot carries its opening, container generation, revision, and both independent native layouts.
Search and preference commands can use a pending opening. Item requests require the acknowledged generation.

The reference uses Bedrock 1.26.51.1, build 51061372, protocol 2193.
The original collection constructor, stored search callbacks, query setter, selected-stack operations, normalization, complete collection refresh and recipe counter execute together.
All 224 transitions match query ownership, selection retention, eligible counts, item order and producer call counts.
The controls vary installed and current abilities, filtering, raw edits and explicit reinstallation.
They include invalid UTF-8 bytes and queries beyond inline string capacity.

The probes supply model and map backing, four source rows, an empty grouping registry, actor and recipe backing, text producers and CRT services.
Native collection buffers and query temporaries return to the retained allocation baseline after their explicit destruction.
These controls do not establish complete backend registration or controller lifetime.
Current 1.26.60.5 constructor and controller instruction mapping confirms the captured fields and initial filtering value.
It does not establish native construction timing relative to the network acknowledgment or frame-level population timing.
Unpositioned pending player contexts retain the documented fallback crafting tags.
The add-on retains snapshot identity and buffers search edits while a command awaits its reply.
Player snapshots include both real Help graphs and their translations.
The current native callback selects How to Play topic 5 for Survival and Encyclopedia topic 47 for Creative.
A physical 1.26.60.5 capture confirms the Survival Your First Craft topic.
Translated Help paragraphs replace both plain text and rendered components, preserving the native color palette.
Program round trips retain these components and navigation labels from authored topic and category variables. Full installed Help lifetimes and glyph appearance remain unverified.
Bulk recipe selection, Creative cursor replacement, and complete installed action parity remain unfinished.

The retained model exposes output quantity separately from availability and action admission.
Candidate recipes share source consumption in priority order. Count reads retain the native crafting-input, cursor, and player-inventory order.
Creative counts follow the current game mode, independently of the model's captured Instabuild policies.
A 1.26.60.5 capture supplies observed totals of 44 planks, three crafting tables, and four chests.
The last example crafts three chests when Shift-clicked, so the displayed total is not an action quantity.
Targeted tests cover these totals, candidate overlap, live source changes, game-mode inheritance, and retired openings.
These controls do not execute the complete native cache wrapper or establish installed player-screen parity.

Five lifecycle regression cases exercise pending source changes, retained search policies, stale acknowledgments, profile/catalog updates, and same-object workbench reopening.
These tests establish Java ownership and observable collection state; they do not establish complete native screen parity.

Creative catalog cells use the current effective game mode for permission.
They remain active without recipe ingredients, while retained availability and captured search policies stay unchanged.
The Bedrock 1.26.60.5 background callback bypasses recipe-disabled colors in Creative.
A protocol-2225 native capture selects a trapped chest through CraftCreative and takes the resulting stack to the cursor.
Current native background controls cover explicit and inherited Creative modes.
A snapshot regression checks active Creative cells without ingredients and restores recipe restrictions in Survival.
A live add-on check removes the red disabled backgrounds.
The picker validates the full cursor stack before transfer admission while preserving the unit-sized native craft result.
Request regressions cover stack sizes one and 64, cursor prediction, and the restoration snapshot.
An installed add-on test selects 64 rails and places them in the hotbar; BDS accepts both requests.
Proxy validation of this quantity fix remains open. Cursor replacement, bulk actions, and complete native screen parity remain unfinished.
