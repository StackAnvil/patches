# Native cooking action reference

This reference records verified behavior for contributors who implement authored furnace, smoker, and blast-furnace controls.
The cooking action backend and authored controls remain unfinished.
The current client receives cooking snapshots and progress while ordinary Java screens handle gameplay.

## Version and evidence

The reference executable is Bedrock 1.26.51.1, build 51061372, protocol 2193.
Private fixtures execute original instructions with controlled menu data and explicit external boundaries.
Licensed binaries, captured data, and fixture outputs remain outside this repository.
The [Bedrock source guide](bedrock-development-sources.md) explains source selection and version checks.

| Check | Cases or registrations | Established behavior |
| --- | ---: | --- |
| Transfer quantity decoder | 1,638 cases | Descriptor domains, signed bounds, byte narrowing, and rejected values |
| Cooking selection predicate and ingredient matcher | 2,160 cases | Ingredient matching, fallback access, and recipe-collection rejection |
| Base and cooking state registrations | 94 plus 7 registrations | Callback identities and registration order |
| Native state storage | 101 registrations | Higher priorities run first. Equal priorities retain registration order. |
| Selected-recipe release | 90 cases | Exit conditions, actual base-state reset, and handled result |
| Initial-state recipe dispatch | 1,620 cases | Command, held-item, source-permission, and controlled input-mode conditions |
| Cooking item-return planner | 1,500 cases | Original-slot deficits and the remaining count passed to auto-placement |
| Physical-slot snapshot producer | 45 cases plus 2 copy controls | Provider traversal, empty slots, append behavior, vector growth, and ordinary item-copy ownership |
| Registered cooking providers | 3 ingredient descriptors | Eleven registrations, native model import, skip callbacks, and 76-slot capture order |
| Installed-provider history replacement | 7 cases plus 7 repeated-return controls | Inventory deficits precede hotbar deficits; each return replaces stored history |
| Installed ordinary source policies | 480 cases | Typed item locks and source count limits for hotbar and inventory |
| Installed ordinary transfer executor | 30 cases | Native permissions, owned slot mutation, request allocation, and Place-action assembly |
| Cooking return destination maps | 6 controls | Original initializer selects the combined inventory provider for all three ingredient descriptors |
| Owned cooking return execution | 24 cases plus 24 repeated-return controls | Native transfers, fallback placement, coherent provider views, and Place actions with an unresolved world target |

These checks cover different boundaries. Their case counts do not measure native gameplay or visual parity.

## Recipe command dispatch

The authored commands are `button.recipe_select`, `button.recipe_secondary`, and `button.recipe_tertiary`.
Their names identify input commands. They do not specify transfer quantities.

The native controller starts in internal state `1`. Recipe selection uses state `25`.
These state numbers belong to the UI controller, not the network protocol.

For valid recipe indices and input-mode field values `0`, `1`, or `3`, the initial-state fixture establishes these rules:

- Primary command at event phase `0` enters recipe selection when the held item is empty and the source permits selection.
- Secondary and tertiary commands do not enter recipe selection in these cases.
- A nonempty held item prevents that primary transition.
- In selected-recipe state `25`, primary or secondary at phase `2` returns to state `1`.
- Other tested phases and the tertiary command leave selected-recipe state unchanged.

The release transition executes the real base-state reset and returns handled bit `4`.
The fixtures do not establish physical input-mode mappings or how Java mouse events produce native event phases.
The mode-`2` path and complete input callback pipeline still need verification.
Negative-index cases are internal controls. They do not authorize invalid recipe identities.

Inherited container rules precede the cooking rule at equal priority.
The implementation must preserve that ordering instead of treating every recipe command as an immediate transfer.

## Selection and ingredient placement

The selection predicate checks the physical ingredient first.
When the native air check rejects that item, the predicate reads the controller fallback.
It compares the item with the clicked output's accepted ingredient alternatives using full native item matching.

A matching ingredient takes the selection-only branch.
That branch updates the selected output without invoking ingredient auto-placement.
The other branch can return previous ingredients and collect ingredients for the new selection.

Action sources and availability sources differ:

| Use | Native collection IDs |
| --- | --- |
| Ingredient auto-placement sources | Fuel `24`, hotbar `28`, inventory `29` |
| Availability sources | Ingredient `25`, fuel `24`, hotbar `28`, inventory `29`, and optional cursor `59` |

The action source vector does not include the cursor.
Held-item handling belongs to the controller dispatch path.
The existing Java recipe-book planner has separate quantity and placement behavior.
It cannot establish native action parity.

## Transfer quantities

The shared `NativeTransferQuantity` decoder receives an available count after the executor resolves source validity and any maximum-stack lookup.
It narrows that count to an unsigned byte before applying the descriptor.

| Kind | Value | Selected count |
| ---: | ---: | --- |
| `0` | Signed explicit count | Available count limited by the explicit count, with a minimum of zero |
| `1` | `0` | All available items |
| `1` | `1` | Half, rounded upward |
| `1` | `2` | One |
| `2` | `0` | All available items |
| `2` | `1` | One |

Unknown kinds and unsupported values select zero.
At this internal boundary, the one-item modes return one even for an available count of zero.
The executor's empty-source guard precedes the decoder.
Permissions, actual source count, destination capacity, mutation, and request encoding remain separate steps.

## Return previous ingredients

The return planner first examines stored source snapshots for hotbar and inventory slots.
It requires a matching stored item and either a compatible current destination or an empty destination.
It restores the deficit between the stored count and the current destination count, limited by the remaining ingredient count.
It then passes the remaining ingredient to generic auto-placement with an all-items descriptor.

The return fixture supplies transfer effects at explicit capacities and records the generic auto-placement call.
It does not execute generic auto-placement.
The installed-provider fixture below separately establishes capture order and history replacement with supplied transfer effects.
The owned-backing fixture below executes cooking-source transfers and generic auto-placement with an unresolved world target.
The complete recipe-selection action pipeline remains unverified.

## Capture physical slots

The complete native snapshot producer is `0x1433f7c60`.
It traverses the manager's provider entries and locks each available provider reference.
A nonzero result from the provider's skip callback excludes that provider.
The callback's broader meaning remains unverified.

For each included provider, capture every slot in ascending index order, including empty slots.
Each entry contains an independent item copy, collection key, slot index, comparison flag, and empty flag.
The producer initializes the comparison flag to false and derives the empty flag from the source count.
It appends to the supplied vector and preserves existing entries.
The return helper separately destroys and clears its previous entries before requesting the next capture.

The fixture supplies provider traversal order, skip results, sizes, and item accessors.
It executes the original producer, item constructors, copies, vector growth, and entry destruction.
Real native shared ownership supplies reference locking and release.
All 45 cases pass and restore the checked ownership counts.
Cases include long collection keys, full 36-slot player captures, and aligned vector growth.
Actual provider registration order and complete controller construction remain outside this probe.

Two additional controls copy ordinary non-block items with zero count, both with and without retained source identity.
Both copies clear the Item identity and auxiliary value.
These controls do not cover populated userdata or the separate associated-block wildcard constructor path.
Do not generalize them into an unconditional rule for every empty stack field.

The selection callback at `0x146c46900` also captures separate before and after vectors.
It passes copied vectors to comparator `0x1450d98b0` through its controller callback.
The 45-case probe does not execute that callback or comparator.
It does not establish history filtering or the complete history lifecycle.
Keep snapshot capture, history replacement, and selection effects as distinct verification boundaries.

## Registered providers and history replacement

The registration slice at `0x146985800` through `0x1469867e1` creates eleven providers.
It registers cursor, hotbar, inventory, combined inventory, ingredient, fuel, and output providers first.
Food, block, furnace-item, and search recipe providers follow.
The generic manager constructor at `0x1433e3ac0` imports these providers through native model construction and map insertion.

Three controls use ingredient descriptors `25`, `45`, and `46` for furnace, blast furnace, and smoker providers.
Their original skip callbacks exclude all four recipe providers from physical capture.
Original size and item accessors produce the same ordered 76-slot snapshot in each control:

| Collection | Captured slots |
| --- | ---: |
| `inventory_items` | 27 |
| `cursor_items` | 1 |
| `hotbar_items` | 9 |
| `furnace_output_items` | 1 |
| `combined_hotbar_and_inventory_items` | 36 |
| `furnace_ingredient_items` | 1 |
| `furnace_fuel_items` | 1 |

The combined view appears alongside the separate inventory and hotbar views.
These 76 entries do not represent 76 distinct physical storage slots.
Capture follows the manager's map traversal, which differs from provider registration order.
Preserve the captured order when examining stored return destinations.

Seven base-furnace controls then execute the original capture and return helper with owned item caches.
The stored inventory slot starts with five items; the hotbar slot starts with seven.
Before return, their current counts are one and two.
At ingredient counts `0`, `1`, `4`, `5`, `9`, `10`, and `64`, return restores the inventory deficit before the hotbar deficit.
Generic auto-placement receives the remaining ingredient count and the all-items descriptor.

The helper destroys the previous history entries and captures the current slots after each return.
Seven repeated-return controls observe this replacement history and request no further deficit restoration.
They retain the current ingredient remainder, including zero, for the recorded generic auto-placement call.
Copied-item ownership counts return to their baseline after snapshot and cache cleanup.

These controls supply collection names from a separately verified native registry fixture.
They also supply a game inventory size of 36, an abstract Level, and a live empty recipe service.
These controls supply owned provider caches and replace the cache-reset function.
The original provider constructors, registration, generic manager import, accessors, capture, full item queries, and history replacement execute.

Transfer effects remain an explicit count-mutation boundary with capacity 64.
Generic auto-placement records its inputs without moving items.
The complete cooking subclass, enclosing selection callbacks, physical input mapping, transfer permissions, transaction assembly, and live acceptance remain unverified.
The variant controls cover empty capture order; they do not execute blast-furnace or smoker returns.

## Installed ordinary transfer execution

The ordinary transfer fixture binds original hotbar and inventory providers to a constructed native backing container.
The backing constructor is `0x147c96d60`; provider binding uses `0x143434050`.
The standard policy installer at `0x1431afb60` registers their slot ranges and source filters.
Construction and binding alone leave the source-validity map empty, so the executor rejects transfers.

The complete source check at `0x147c98300` then passes 480 controlled cases.
These cases vary source count, requested quantity, absent userdata, empty compounds, and ByteTag, ShortTag, and IntTag lock values.
Both generic and typed NBT lookups execute original instructions over supplied compound trees.

For hotbar and inventory sources, a ByteTag `minecraft:item_lock` value of `1` prevents removal.
Values `0`, `2`, `127`, `128`, and `255` permit removal when the source count covers the requested quantity.
Missing tags and tested non-ByteTag values also permit removal.
Cooking ingredient selection uses a separate rule that rejects every nonzero ByteTag lock value.
Keep these permission rules separate.

Thirty additional cases execute the original transfer executor at `0x1433e8380` from hotbar slot zero to inventory slot zero.
They cover empty and compatible occupied destinations, explicit quantities `0`, `1`, and `3`, and five source-lock states.
The lock states are absent userdata and ByteTag values `0`, `1`, `2`, and `255`.
Rejected or zero-quantity moves leave both slots unchanged and append no action.
Accepted moves update backing storage and provider caches and append the expected Place action.

The native request manager constructor at `0x1425aa270` receives fixture flags `1` and `0`.
The original request-start function allocates negative request IDs and constructs each current request.
Original descriptor construction, permission checks, ordinary item merging, owned item copies, request validation, and action append execute together.
The fixture checks transfer counts, collection IDs, physical slot indices, and supplied stack-network IDs in the resulting actions.
A fresh process reproduces all 480 policy cases and 30 executor cases.

These fixtures supply a generic Item definition, synchronized initial slot values, numeric stack-network IDs, and compound trees.
They also supply storage read/size interfaces, an abstract game context, and an empty notification subscriber list.
Three diagnostic string-formatting functions return empty strings.
The request-manager flag combination omits its separate world-subscription path.
Provider content synchronization remains a supplied boundary; the combined inventory view is outside these transfer cases.
No transfer, permission, merge, item-copy, request-allocation, request-validation, or action-append function is substituted.

These results cover hotbar and inventory sources.
The server-menu helper starts from `container_items`, which has separate source-policy registration.
Cooking-source transfers, generic auto-placement, full controller input, wire serialization, server acceptance, and graphical behavior remain outside these ordinary-transfer fixtures.

## Owned cooking return execution

A separate fixture gives each backing container its own physical Item objects.
The original binding code fills the separate inventory, hotbar, combined inventory, ingredient, fuel, and output caches.
The cache-reset function at `0x143443d00` executes unchanged.
Transfers update the combined and separate views through original native callbacks.

The complete cooking destination-map initializer at `0x146c44e80` supplies the return destination vector.
Six controls cover ingredient descriptors `25`, `45`, and `46` with raw controller field `0x12bc` values `0` and `1`.
Every ingredient return vector contains one `combined_hotbar_and_inventory_items` entry with its flag set to false.
These controls do not establish physical input-mode mappings or complete controller construction.

Three fresh processes execute eight return cases each, one process per ingredient descriptor.
The first seven cases use ingredient counts `0`, `1`, `4`, `5`, `9`, `10`, and `64`.
Stored inventory and hotbar counts are five and seven; current counts are one and two.
The original history-return helper restores the inventory deficit before the hotbar deficit.
It then executes generic auto-placement into the combined inventory provider.
A count of 64 produces Place actions for four inventory items, five hotbar items, and 55 remaining items.

The eighth case checks occupied-stack capacity and empty-slot placement.
Stored inventory and hotbar counts are 64 and 63; current counts are 63 and 60.
Returning 64 ingredients produces four Place actions: inventory one, hotbar three, combined hotbar one, and combined empty-slot 59.
The final inventory stack and first hotbar stack each contain 64 items.
The next hotbar slot contains 59 items.

The fixtures check collection descriptors, physical slot indices, counts, and stack-network IDs in the native Place actions.
The ingredient source retains its supplied positive stack-network ID across these actions.
The new empty destination uses stack-network ID zero.
All separate and combined inventory views agree after each return.
Twenty-four repeated-return controls append no further actions and preserve the replacement history.

Original provider registration, backing construction, binding, cache reset, policies, history capture, return, generic auto-placement, and transfer execution run together.
Request-manager construction, negative request-ID allocation, Place construction, validation, and append also execute original instructions.
The fixtures do not substitute these functions.

Initial physical slots, incoming authoritative values, a generic Item definition, numeric stack-network IDs, and collection-name lookup remain supplied inputs.
Original binding refreshes caches after the supplied authoritative changes.
Abstract Dimension and BlockSource interfaces exercise the unresolved-world-target branch with no loaded chunk.
These checks do not cover a loaded furnace block entity or its world updates.
An empty notification subscriber list, shared world ownership, and three diagnostic string formatters are also supplied.
Full cooking-manager and controller construction, recipe selection, input delivery, wire serialization, server acceptance, and graphical behavior remain unverified.

## Implementation boundaries

The [shared UI patch](../patches/viabedrock/upstreamable/0095-share-native-ui-programs-and-resources.patch) owns the cooking messages, scene contracts, and presentation authority.
The [inventory request patch](../patches/viabedrock/deferred/0003-translate-server-authoritative-bedrock-requests.patch) owns request prediction, response reconciliation, and transfer quantities.

Remaining work includes complete controller initialization, the input pipeline, selection-history boundaries, the complete recipe-selection transfer pipeline, loaded world targets, revision-bound action handling, and authored client controls.
Native visual comparisons remain separate from these instruction-level checks.
