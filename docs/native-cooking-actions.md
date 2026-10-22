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
| Registered recipe input delivery | 48 cases | Raw event fields select phases through original registrations and callbacks |
| Typed recipe event payloads | 576 cases | Integer index decoding and retained selection, command, source, and position fields |
| Recipe input result propagation | 288 plus 96 controls | Delivered phases retain their order; callback results combine with bitwise OR |
| Native event source resolution | 240 controls | Active-tab recipe sources through the original event callbacks |
| Installed cooking selection and release | 6 sequence steps | Real selection-only effects and release through the original input graph |
| Installed first recipe placement | 1 controlled click | Two native Place actions, retained destination identity, and final ingredient count |
| Repeated recipe placement | 30 input steps and snapshots | Capacity, selection clearing, return to player inventory, and placement after return |
| Predicted request payload identities | 5 complete payloads | Native identity callbacks assign request references after slot mutation |
| Owned request finalization and flush | 1 cooking payload plus an empty flush | Native ownership release, queue removal, packet construction, serialization, and cleanup |
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
The mode-`2` path, physical event producers, and complete recipe action pipeline still need verification.

Cooking action and result payloads use version `4` and preserve the numeric event phase alongside the command and snapshot identity.
Only phases `0`, `1`, and `2` are accepted.
Phase-free version `3` actions reject instead of receiving a default phase.
Replies echo the complete action, including its phase.
These payloads do not establish physical input mapping or activate authored cooking controls.
Negative-index cases are internal controls. They do not authorize invalid recipe identities.

Inherited container rules precede the cooking rule at equal priority.
The implementation must preserve that ordering instead of treating every recipe command as an immediate transfer.

## Input event delivery

The input fixture runs the original service registry, thread configuration, scheduler, and queue constructors before the base input constructor.
Eight original worker entries initialize their own readiness fields and reach condition waits.
The scheduler publishes the input queue's lifetime handle through its normal construction path.
The fixture supplies ordinary OS and CRT services, separate worker stacks and TLS, and a single-processor environment.
It does not supply game readiness flags or queue lifetime fields.

The original base input constructor is `0x144816390`.
The fixture separately constructs the router with `0x144634ae0` and registers all three recipe commands through `0x144dd48c0`.
Original callback cloning, callback maps, the dispatcher at `0x144819aa0`, and recipe phase callbacks execute.
Authored source lookup supplies `recipe_food`; the focus accessor supplies false.
The router records its arguments and supplies a result instead of executing state transitions or recipe effects.

For raw event kind `1`, bit zero of the byte at offset `0x28` delivers phase `0` first.
The two bytes at offsets `0x10` and `0x11` determine an additional phase:

| Byte at `0x10` | Byte at `0x11` | Additional phase |
| ---: | ---: | --- |
| `0` | `0` | None |
| `0` | `1` | `1` |
| `1` | `0` | `2` |
| `1` | `1` | None |

All 48 combinations of commands, byte values, and masks `0` through `3` pass.
The 288 result controls preserve this phase order for supplied router results `0`, `1`, `2`, `4`, `8`, and `255`.
Another 96 controls vary the two callback results independently.
The dispatcher combines their result bits with bitwise OR.
These raw fields do not establish physical mouse, keyboard, or controller meanings.

The typed payload fixture parses JSON through the original JsonCpp reader and parser.
It passes 576 cases across twelve payload shapes and the same command and event combinations.
The callbacks accept tested integer `#collection_index` values from `-1` through `2147483647`.
Missing, null, Boolean, string, array, object, fractional, and integral-real values yield index `-1`.
For example, integer `7` survives; real `7.0` yields `-1`.
Index decoding does not establish whether a recipe provider contains that index.

Phase `1` retains the decoded index, command, collection source, and numeric screen coordinates.
Phase `2` clears the retained index to `-1` before router delivery.
These checks cover the supplied `recipe_food` source and screen coordinates `11` and `13`.
The source lookup, focus value, raw events, and router results remain explicit fixture boundaries.
The fixtures do not establish physical input mapping, complete cooking-controller installation, recipe effects, wire requests, or live acceptance.

## Resolve recipe event sources

The original source accessor at `0x146c45d70` reads `#collection_name` from the event payload.
Its native tab map comes from initializer `0x146c9c340`.
The accessor resolves `recipe_book` through the active tab, except for tab `5`:

| Tab | Event source for `recipe_book` | Slot descriptor source for `recipe_book` |
| ---: | --- | --- |
| `1` | `recipe_food` | `recipe_food` |
| `2` | `recipe_items_furnace` | `recipe_items_furnace` |
| `3` | `recipe_blocks` | `recipe_blocks` |
| `4` | `recipe_search` | `recipe_search` |
| `5` | `recipe_book` | `inventory_items` |

The separate slot resolver at `0x146c46140` uses the map for every listed tab.
Event source resolution and slot descriptor resolution therefore differ at tab `5`.
Other tested collection names pass through the event accessor unchanged, including long custom names.
All 240 event controls run the original source accessor inside the registered phase callbacks.
Their focus accessor and router results remain supplied boundaries.

Recipe authority also requires the exact displayed cell identity.
The shared scope validator matches each recipe ID against its index in the sorted, visible recipe collection.
An ID from another visible cell cannot replace that identity.
Filtering and category selection compact the visible indices before this comparison.
Missing, non-integer, negative, out-of-range, and mismatched indices reject the control.
The validator does not authorize an inventory slot from a recipe preview.

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

Six further controls connect raw input to the original cooking state graph and selection-only effects.
The fixture constructs the original cooking manager at `0x14c53c710` over installed providers and owned physical storage.
It supplies one concrete recipe with a matching five-item ingredient and one output item.
The original ingredient matcher, source lookup, selected Item assignment, and selected name lookup execute.

For the primary command, raw flags `0,1` with mask `1` deliver phases `0` and `1` and leave state `25`.
The result is `1`, and the manager retains the selected output.
Raw flags `1,0` with mask `0` deliver phase `2`, return result `4`, and restore state `1`.
The selected output remains in the cooking manager after this release.
The tested secondary and tertiary sequences leave state `1` and return zero.
All six steps preserve the physical items and append no inventory action.

These controls run the real router and selection callback instead of recording their intended effects.
The recipe cache, registry tree, world/recipe interfaces, raw events, and focus accessor remain supplied.
Full cooking-controller and model-owner construction, first placement, repeated selection, transactions, and live acceptance remain unverified by these controls.

## Controlled first placement

A separate fresh fixture connects the installed input graph to the original placement and request code.
It starts with seven matching items in hotbar slot `0`, five in inventory slot `9`, and an empty furnace ingredient slot.
A primary recipe click returns `1` and leaves state `25`.
The native code appends these Place actions:

| Count | Source collection and slot | Source stack ID | Destination collection and slot | Destination stack ID |
| ---: | --- | ---: | --- | ---: |
| `7` | Hotbar `28`, slot `0` | `1000` | Furnace ingredient `25`, slot `0` | `0` |
| `5` | Inventory `29`, slot `9` | `1009` | Furnace ingredient `25`, slot `0` | `1000` |

The native snapshot then contains twelve items in the ingredient slot and empty player slots.
The selected output remains in the cooking manager.
The unpredicted fixture retains the positive stack ID from the first source.
The enabled prediction path instead uses the negative request ID for that second destination.
This observation concerns native action objects before complete request serialization.
The [payload checks](#request-payload-identities) separately verify those IDs through native serialization.

The fixture supplies consistent recipe caches, station data, and world interfaces.
It uses the original FurnaceModel vtable over controlled fields, without the complete model-owner constructor.
The original chunk lookup, native backing wrapper, destination guards, ingredient watcher, result lookup, transfer executor, and action append code execute.
The world interface supplies a controlled block-entity component rather than a constructed native furnace entity.
Other quantities, repeated selection, complete controller ownership, wire serialization, server acceptance, and visual parity remain unverified.

## Repeat placement and return

A fresh process also passes five six-step sequences through the original dispatcher, cooking graph, and placement code.
Each sequence presses and releases the same recipe three times.
The fixture supplies one concrete recipe and an Item with a maximum stack size of `64`.

| Initial hotbar slot `0` | Initial inventory slot `9` | Ingredient count after the first press | Player items left after placement |
| ---: | ---: | ---: | ---: |
| `1` | `0` | `1` | `0` |
| `0` | `1` | `1` | `0` |
| `7` | `5` | `12` | `0` |
| `32` | `32` | `64` | `0` |
| `64` | `64` | `64` | `64` |

The first press prefers hotbar sources and fills the ingredient slot to the available count or its capacity.
The second press returns those ingredients through combined player provider `12`, slot `0`.
That slot belongs to the hotbar, even when the first source was inventory slot `9`.
The native ingredient watcher then clears the selected output and its name.
The third press places the returned items again and restores the selected output.

Every press returns `1` and leaves state `25`.
Every release returns `4` and restores state `1` without another transfer.
The controls verify all thirty physical snapshots and conserve the supplied items.
They verify the shared hotbar, inventory, and combined-provider views independently.
Combined provider `12` aliases player inventory. It is distinct from cursor provider `59`.
The cursor remains empty throughout these sequences.

Each sequence uses fresh native backing wrappers, a cooking manager, and a request.
Its six events share that open request, without request submission or server acknowledgments.
These controls establish repeated selection under that boundary, not the complete native frame and request lifecycle.
The first-placement fixture's recipe, world, model-owner, and external interface limits still apply.
Other recipes, Item definitions, input modes, complete serialization, server acceptance, and visual parity remain unverified.
The Java recipe-book planner's one-increment mode does not implement this authored primary action.

## Request payload identities

The enabled prediction fixture executes the native client manager and its container identity callbacks.
The manager uses constructor flags `1,1` and client vtable `0x14e827ec0`.
The original constructor runs before a Level attaches and takes its normal null-Level branch.
The client subclass fields follow the inline initializer at `0x141336ca9`.
The complete Player constructor and negotiated flag provenance remain unverified.

The original `ClientScreenData` component constructor runs through typed storage at `0x1425bdf10`.
A controlled registry contains one live entity and that original component storage.
The predicted-container constructor `0x1425ac0b0` installs identity callback `0x147c9ac00` and observer `0x147c9aa20`.
The component retains those containers through the original vector append function.
Full screen registration and the corresponding world lookup remain unverified.

Five complete payloads cover one cooking click and four ordinary transfer controls.
The ordinary controls move partial or complete stacks into empty or occupied destinations.
Every changed source and destination receives the negative request ID.
This rule includes sources that become empty after a complete move.
Later actions in the same request use that request ID for each previously changed slot.
The first action still uses the original positive stack IDs or zero for an initially empty slot.

Cooking placement uses hotbar provider `28` and inventory provider `29`, with physical slot indices.
Returns use combined player provider `12`.
These player providers share the same physical slot identities.
The Java planner tracks changed physical slots and substitutes request references during request assembly.
Its codec matches the complete native cooking payload byte for byte.
The optional comparison now reads `STACKANVIL_NATIVE_FINALIZED_REQUEST_WIRE` from the owned finalization fixture below.
Regressions also cover multiple ingredient returns, refill of an emptied ingredient slot, and rejection recovery.
Java recipe-book quantities remain separate from native authored primary selection.

The earlier base-manager fixture used constructor flags `1,0` and wrappers without the native identity callback.
Those wrappers preserve positive IDs and clear empty slots to zero.
That fixture verifies serialization of unpredicted transfers, but it does not establish the enabled prediction behavior.
It cannot justify positive IDs for previously changed slots in production requests.

Original conversion `0x14273fc70` turns owned requests into packet payload values.
The original wrapper `0x14273aab0` constructs the serialization context and calls packet writer `0x14273a2d0`.
Original BinaryStream methods write every byte and grow the buffer.
The fixture supplies the stream fields from native inline construction and a packet view with sender mode `5`.
Requests remain explicitly open during this comparison.
The open-request fixture does not execute finalization, the enclosing sender, or containing stream construction.
The payload excludes packet headers and transport framing.
Recipe data, world interfaces, and model-owner limits remain unchanged from the first-placement fixture.
These checks do not establish network exchange, server acceptance, full frame ownership, or complete authored cooking controls.

## Owned request finalization and flush

A fresh fixture uses the EntityRegistry that the original request-manager constructor creates and owns.
Original function `0x1425c0460` creates its live screen entity.
Original function `0x1425c06e0` constructs its weak reference and retains the registry ownership.
The original typed map inserts the ClientScreenData storage, and the original component constructor initializes its members and pages.
Typed storage fields and client subclass fields still follow controlled native inline layouts.
Full Player registration, component signals, and mode negotiation remain unverified.

The fixture delivers the same two-source cooking input through the native prediction callbacks.
Original finish `0x1425b0cf0` calls detach `0x1425b0e50` and queues the owned request.
Detach clears the active request and weak reference, then releases exactly one weak count.
The registry retains one strong owner and its remaining weak references.
The request actions retain their IDs through finalization.

Original flush `0x1425b1f70` converts the queued request and constructs the actual native packet with mode `5`.
It clears the queue and destroys its owned requests before the transport call.
The external transport sink receives that packet and calls the original serialization wrapper `0x14273aab0`.
The native writer and BinaryStream methods emit the same complete cooking payload as the open-request fixture.
Native flush then destroys the converted payload values.
A second flush with an empty queue makes no transport call.
The Java planner and codec match these finalized native bytes.

The transport sink and BinaryStream fields remain supplied interfaces and data.
Screen container bindings use the original vector helper but remain controlled records.
The fixture starts its request explicitly before input.
Complete controller/model construction, physical input mapping, and the enclosing input/frame scope remain unverified.
The fixture does not execute transport framing, encryption, a network exchange, or server acceptance.
Authored cooking controls remain unfinished.

A second fresh control installs an owned screen lease through native EntityContext move `0x1425c0540` and deque append `0x147c88220`.
The inherited input wrapper `0x144819a20` delivers the cooking event without an explicitly opened request.
Each transfer starts and finishes its own native request through the retained screen context.
The resulting queue contains two requests, and the second destination references the first request ID.
Native flush serializes both requests in one packet and preserves the reference counts.
The input-child vector remains empty, and the complete screen registration method does not execute.
An enclosing frame scope or deferred recipe component can change this batching.
This omission control therefore does not establish full application request grouping.

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
