Translate representable Bedrock recipes into Java recipe books and place ingredients through authoritative inventory requests.
Keep native registration identity separate from Java display eligibility.
The server owns the final craft, cooking, fuel consumption and result metadata.

## Registration and action lifetime

Keep the first recipe for each station/name pair.
Reject network ID zero and IDs already registered by any station.
A rejected recipe reserves neither key.
Dispatch the target's fourteen known dynamic-recipe UUIDs and skip unknown factories.
Factory selection does not implement every dynamic crafting operation.

Retain raw shaped dimensions and flat ingredients before Java grid filtering.
Copy ingredient lists and nested result data when constructing recipes.
Presented books retain their original catalog and unlock revision.
Surviving registrations keep their click IDs; replacements receive fresh IDs.
An old Java click cannot target a different recipe after catalog replacement.

Clamp signed-short recipe result counts from one through 64 before constructing the result stack.
Validate every static result against the current item table before registration.
Reject air, unknown item IDs and empty results without claiming registration keys.

## Native evidence

The target is Bedrock 1.26.51.1, build 51061372, protocol 2193.
Fresh executable probes cover 49 station/name cases, 72 network-mode cases and 217 dimension cases.
They also cover 43 output states, all 65,536 inventory-constructor count inputs, all 256 stack counts and 142 dynamic UUIDs.

The probes supply initialized registry state, vector boundaries and comparison seams.
The dynamic probe supplies UUID constants from an earlier matching live snapshot.
Native guards and dispatch execute unchanged.
Complete factory construction, item ownership and visual parity remain outside these probes.
Raw executable data, live state and fixtures stay private.
Optional Java tests read the fixture directory through `STACKANVIL_NATIVE_RECIPE_REGISTRATION`.

## Validation

All four projects build with 2,219 passing Java tests and 152 optional skips.
Core Checkstyle passes. Offline tooling and patch-metadata checks pass.
The complete stack replays all 102 core patches.

Local BDS tests select recipes from the furnace, smoker and blast-furnace books.
Each test consumes its ingredient, waits for server cooking and transfers one result to player inventory.
Brewing consumes one nether wart and converts all three water bottles into awkward potions.
Both chest controls and reconnect checks pass.
Both final client profiles match all 1,336 core class entries from the built artifact.
The lab closes normally.

These tests use Java cooking screens.
The authored cooking catalog, input controls and client screen still need integration.
Native images and complete route parity remain unverified.

Inventory network codecs retain their signed-short clamping and byte narrowing.
CraftingData results use a separate descriptor conversion, with signed counts clamped from one through 64.
The recipe-only decoder consumes complete headers, including result IDs zero and negative one, and retains its clientbound write guard.

## Block ingredient identity (October 22, 2026)

The stripped-oak-wood regression now uses resolved block identity rather than raw auxiliary equality.
It executes the production matcher after both network item codecs.
The advertised ingredient accepts auxiliary 8 and canonical auxiliary 0 for the default block.
A runtime state on another axis fails the match.
The request rollback test supplies its ingredient predicate separately so it continues to test request ownership and acknowledgments.

The pinned native stripped-oak-wood factory, property registration, palette construction and virtual default selection execute in a separate fixture.
They produce canonical metadata 0, 1 and 2 for axes y, x and z.
The fixture supplies a null-material vector and empty optional component ownership.
It does not establish other builtin class constructors, runtime-ID assignment or visible parity.

Recipe results use the connection constructor after their separate count conversion and retain their clientbound write guard.
The complete signed-short count sweep uses the registry constructor for all 65,536 inputs.
Both wire auxiliary values 0 and 8 construct canonical metadata 0 before the production grid matcher checks the default and alternate axis.
The full build and eleven inventory controls pass; the authored cooking catalog and native controls remain unfinished.

## Native cooking source collection (October 22, 2026)

Furnace, smoker and blast-furnace placement now collect sources through the constructed Item's concrete descriptor hash.
The first nonempty stack in each group determines eligibility, including rejection.
An enchantment ListTag or a nonzero ByteTag lock rejects that initial stack.
Later stacks with the same descriptor retain the cached decision.
Groups sort by descending count with native tie ordering, while each group retains its source container and slot order.
Rejected groups remain in the sort because removing them can change ties.

The collector does not authorize merging different stack data.
Placement retains full stack compatibility, positive server IDs, slot restrictions, request ownership and rollback checks.
The authored cooking catalog and screen activation remain unfinished.

The pinned executable supplies 3,789 collection cases.
These include count boundaries, wildcard metadata, cache decisions across containers and insertion/partition sort boundaries.
Of these cases, 1,176 execute the actual typed-byte lookup over supplied compound trees.
They distinguish byte locks from short and integer values, including zero and negative-byte controls.
Generic NBT presence, ordinary Item ownership, container vectors, allocation, CRT, destruction and result-name construction remain supplied seams.
Native compound construction, block-derived collection cases, full transactions and visible parity remain outside the fixture.
The optional comparison reads `STACKANVIL_NATIVE_COOKING_SOURCES`.

All fourteen targeted tests and Checkstyle pass.
The full build passes 2,314 tests with 152 optional skips and no failures or errors.
All 102 core patches replay, and offline tooling and metadata checks pass.
A fresh strict-BDS ViaProxy run passes all three cooking stations and same-world reconnect.
Both launched profiles and the proxy match all 1,367 rebuilt core classes and both block-item resources.
The private display stops normally. These controls use Java cooking screens.

## Native cooking availability (October 22, 2026)

Selected-recipe placement now evaluates native source presence before creating an inventory request.
The station adapter checks output ownership and the native air identifier before reading providers.
It retains station input, furnace fuel, hotbar and inventory order, with optional cursor admission for callers that request it.
The current Java placement path keeps its empty-cursor requirement.

Availability stops at the first usable alternative input.
It does not require every alternative or apply transfer capacity and recipe-count limits.
Available results use state 0 with filtering and state 1 without it.
Unavailable or invalid outputs use states 3 and 2 respectively.
Placement still checks its own stack compatibility, capacity, server identities and rollback ownership.

The complete native evaluator, empty/air guard and source collector execute 6,072 cases on the pinned executable.
Java compares all 4,272 cases with legal boolean filter flags.
The remaining 1,800 raw-byte controls stay outside the controller contract.
Supplied boundaries include alternative extraction, controller provider and optional-container lookup, ordinary Item ownership, generic NBT presence and runtime services.
The actual native name initializer independently confirms `minecraft:air` as the guard's identifier.

This adapter evaluates the selected registered recipe.
The native displayed-output catalog extracts alternatives through full output-stack matching.
That extraction, authored catalog population, screen activation and cursor-aware native actions remain unfinished.
These checks do not establish visible native parity.
The optional Java comparison reads `STACKANVIL_NATIVE_COOKING_AVAILABILITY`.

All eighteen targeted tests and Checkstyle pass.
All four projects build with 2,318 passing tests, 152 optional skips and no failures or errors.
All 102 core patches replay. Tooling, all 264 regressions and patch metadata validation pass.
A fresh strict-BDS ViaProxy run passes all three cooking stations and same-world reconnect.
Both launched profiles and the proxy match all 1,368 rebuilt core classes and both block-item resources.
The private display stops normally. These controls use Java cooking screens.

## Native cooking input construction (October 22, 2026)

Cooking input expansion now constructs count-one Items with auxiliary zero after descriptor resolution.
A named block descriptor still resolves its declared auxiliary value before construction.
An invalid associated state therefore rejects the descriptor; a valid variant produces the Item's default association.
Availability and placement share those concrete queries.
This corrects selection of inventory variants that matched the declaration but differed from the native expanded input.

The complete target extractor, output matcher, descriptor visitation and ItemInstance constructor execute 252 controlled cases.
These comprise 108 ordinary/concrete/named expansion cases, 48 associated-default cases and 96 output-selection controls.
Java compares all 96 named or unknown-name expansions, including reassigned block ownership and null auxiliary admission.
Tests also cover explicit block runtime zero, default versus alternate block identity, source wildcards and request placement.
All 37 targeted tests and Checkstyle pass.
The optional native comparison reads `STACKANVIL_NATIVE_COOKING_INPUTS`.

The fixture supplies recipe registry trees, world and result accessors, an empty unlock context, captured Item registry storage, warm associated caches and runtime services.
It does not establish full factory installation, tag/Molang visitation order or nonempty output-data matching.
Tag and Molang membership retain the existing predicates.
Full output-alternative catalog population, authored screen controls and native action quantity/cursor behavior remain unfinished.

All four projects build with 2,323 passing tests, 152 optional skips and no failures or errors.
All 102 core patches replay, and offline tooling and metadata checks pass.

A fresh strict-BDS ViaProxy run passes all three cooking stations and same-world reconnect.
Both launched profiles and the rebuilt proxy match all 1,369 core classes and both block-item resources.
The run exits successfully and stops the private display normally.
These controls use ordinary recipes and Java cooking screens.
The declared-metadata correction is verified by the native fixture and targeted transfer regression; visible native parity remains unverified.

## Cooking output alternatives (October 22, 2026)

The cooking catalog now collects all matching unlocked input alternatives for each output at its station.
It retains native recipe order and invalidates snapshots after registration or unlock changes.
Replacing the connection's recipe tracker also retires its old catalog and action inputs.
Invalid, unknown and air outputs do not enter the catalog.
Availability uses these alternatives. Java placement still uses its selected registered recipe.

Output queries retain wildcard auxiliary values, query-sided Block identity, resolved restriction identities and shield timing.
They ignore root quantity and network IDs.
Native NBT equality distinguishes typed empty lists, treats signed floating zeroes as equal, and rejects NaNs, including within the same compound.
Null userdata and an empty compound compare equal.
Full network userdata determines charged-item construction within the same registry.
Independently mutated native child stacks remain outside this comparison.

The target's original userdata installer, charged-item loader and output matcher execute 361 comparisons.
Of these, 217 include at least one charged child.
Java matches all 361 results and the 96 earlier whole-extractor output controls.
It also matches 3,278 native Tag comparisons with valid UTF-8.
The other 208 cases contain malformed UTF-8, which Java strings cannot retain.

Restriction resolution uses the target's 58 builtin groups, exact primary names and aliases.
It preserves case, stops at the first missing group member, and deduplicates registered block identities.
Java matches all 116 native builtin resolution cases.
The shared wire loader now reads restriction arrays and shield timing after a zero NBT marker.
Both item wire formats retain these fields, including the completed fields of truncated tails.

The fixtures supply registry storage, generic Item definitions, NBT trees and runtime services.
Full native factory installation, pointer-hash collisions and malformed UTF-8 remain unverified.
Authored screen activation, catalog presentation and native quantity/cursor actions remain unfinished.
The full movement, mount, inventory, workstation, camera and rendering requirements remain active.

Optional comparisons read `STACKANVIL_NATIVE_COOKING_OUTPUT_DATA`, `STACKANVIL_NATIVE_ITEM_TAG_EQUALITY`,
`STACKANVIL_NATIVE_RESTRICTION_GROUPS` and `STACKANVIL_NATIVE_COOKING_INPUTS`.

The targeted run passes 53 tests and Checkstyle, with one optional block-name fixture skipped.
All four projects build with 2,332 passing tests, 152 optional skips and no failures or errors.
All 102 core and 38 client patches replay.
Offline tooling checks, all 264 regressions and patch metadata validation pass.

A fresh strict-BDS ViaProxy run passes all three cooking stations and same-world reconnect.
Both launched profiles and the proxy match all 1,371 rebuilt core classes and four block metadata resources.
The run exits successfully and stops its private display normally.
These controls use Java cooking screens and do not establish authored presentation or native action parity.

## Cooking model publication (October 22, 2026)

Core now publishes authoritative cooking snapshots to clients that negotiate the cooking model and progress channels.
Each snapshot contains the station catalog, translated recipe previews, category counts, preferences, item counts and raw progress.
The producer reuses one cooking catalog per snapshot.
The current add-on does not yet register these channels or replace its Java cooking screens.

Publication waits for the opened container's first authoritative contents.
The producer flushes the real Java content update before its derived cooking snapshot.
It binds the snapshot to the inventory owner, container lifetime, item revisions, recipe revision, resource program and preferences.
Deep item copies also detect predictions that change stacks without a server revision.
A state change during item conversion rejects the candidate snapshot.
Close, recovery and channel withdrawal retire publication ownership.

A separate progress message retains all four signed native properties and their data revision.
Progress updates keep the item update identity, so burn ticks do not repeatedly retire activation authority.
The tests cover all three families, wire round trips, category deduplication, slot order, progress, prediction, reload, preferences and tracker replacement.
They also cover reused menu IDs, failed conversion, recursive publication and packet order.

All four projects build with 2,338 passing tests, 152 optional skips and no failures or errors.
All 102 core and 38 client patches replay.
Client screen activation, authored controls, search, selection and native quantity/cursor actions remain unfinished.
These producer checks do not establish visible native parity.
All other inventory, movement, mount, camera and rendering requirements remain active.

A private Fabric observer receives the production payloads while Java cooking screens handle the live controls.
It validates 46 snapshots and 1,278 progress updates across all three cooking families, with no observation failures.
All snapshots resolve authored scenes with 39 inventory slot identities.
The CPU resolver reports recipe-action scopes in 39 snapshots.
Both running clients match all 1,376 rebuilt core classes and four block metadata resources through their class loaders.
The client profiles and proxy also match those artifacts.
All three cooking controls and same-world reconnect pass.
The run exits normally, stops its private display and removes the private observer mod.
These observations verify publication and CPU resolution, not authored screen rendering or native action parity.
Offline tooling checks, all 264 regressions and patch metadata validation pass.

## Track native prediction identities in cooking requests

Cooking requests use the negative request ID for any slot that an earlier action changed.
The native identity callback applies this rule to both transfer endpoints, including a source that becomes empty.
The planner tracks physical slots across hotbar, inventory, and combined player providers.
Cooking sources use providers 28 and 29. Returns use provider 12.

The earlier serialization fixture used the base manager and omitted the native identity callback.
Its positive IDs describe unpredicted wrappers and do not establish production prediction behavior.
The replacement fixture constructs the native predicted containers and the original ClientScreenData component.
It executes the original client identity callback, transfer mutation, payload conversion, and serialization.
Five complete payloads cover cooking placement and partial or complete moves into empty or occupied slots.

The manager takes its normal null-Level constructor branch before the controlled world attaches.
Client subclass fields, the one-entity registry, screen bindings, packet view, and stream fields remain controlled fixture data.
The open-request controls do not establish full Player or screen construction, finalization, transport, or live acceptance.
The [request reference](../../../docs/native-cooking-actions.md#request-payload-identities) records these boundaries.
The optional byte comparison now reads `STACKANVIL_NATIVE_FINALIZED_REQUEST_WIRE` from the stronger fixture below.

## Finalize and flush owned native cooking requests

A fresh fixture uses the registry owned by the original native request manager and creates its entity through the original helper.
Native weak-reference construction retains ownership, and native detach releases that ownership after the cooking input.
The original request finish queues both Place actions without changing their IDs.
The original enabled flush converts them, constructs the packet, clears and destroys the queue, and invokes the transport interface.
The transport sink calls the original serializer on that actual packet.
Native payload cleanup completes, and a second empty flush emits nothing.
The Java planner and codec match the finalized native payload byte for byte.

Typed storage and client subclass fields still follow controlled inline layouts.
Screen container bindings, the transport sink, and BinaryStream fields remain supplied boundaries.
Full Player/screen construction, component signals, negotiated mode provenance, outer input/frame ownership, and live acceptance remain unverified.
This evidence does not activate or complete authored cooking actions.

A separate fresh control installs the native screen lease and delivers input through the inherited wrapper without an explicit request scope.
Its two transfers create two queued requests, and the second destination references the first request ID.
Native flush serializes both requests and preserves registry reference counts.
The input-child vector remains empty, and full screen registration does not execute.
Outer frame ownership and deferred recipe execution can change batching, so this control does not establish full application grouping.

Validation: all 104 core patches replay. The four-project build passes 2,384 tests with 212 optional skips and no failures or errors.
The 19 focused planner/request tests include the finalized native byte comparison.
Checkstyle and offline validation pass. Authored cooking controls remain unfinished.

## Native primary action backend

The core now consumes negotiated version-`4` cooking actions against the exact current presentation and authored recipe cell.
Primary selection follows the native selected-output entry before the ingredient predicate.
It toggles an existing selection, collects ingredient sources from fuel and player providers, and returns ingredient and output items through native history.
Selection-only admission leaves history unchanged. The constructor starts with an empty history. Output return captures the post-placement player history.
Java recipe-book increment and maximum-quantity behavior remain separate.

Each transfer uses its own request and intermediate prediction, with negative references for earlier slot changes and physical player aliases.
The production primary action matches the native auto-scoped two-source packet byte for byte.
Follow-up phases retain their original gesture identity and do not repeat transfers.
Sequences, item snapshots, channel negotiation, menu ownership, and current authored commands protect action admission.
Intermediate publication waits until action completion. Highlights follow the visible recipe order after preference changes.

A fresh native prediction fixture executes six press/release steps with automatic scopes, owned finalization, and a flush after each input.
It confirms selection clearing, combined-provider return, refill references, and post-placement history through the original entry and transfer code.
Native constructor and entry evidence identifies the initially empty history and the output comparison that precedes ingredient matching.

The Fabric presentation remains passive. Physical input bindings, nonempty-cursor branches, cross-input prediction, authoritative model watchers, and live route acceptance remain unfinished.
Full native controller/model construction and independent frame scopes also remain unverified.

The combined four-project build passes 2,413 tests, with 213 optional skips and no failures or errors.
All 104 core patches replay with the incoming movement changes preserved.
The 43 focused cooking, UI-state, planner, and batch tests pass with both native wire comparisons enabled.
Checkstyle and offline validation pass. All 1,401 core classes match the add-on's embedded core byte for byte.

## Directional action negotiation

Cooking action negotiation now follows the payload direction.
The client registers its model, progress, and action-result receivers. The core advertises the separate action channel that it receives.
The core requires play state and server-authoritative inventory before it advertises or consumes actions.
Duplicate receiver registration does not repeat the advertisement.

Receiver withdrawal removes the advertisement and retires held input without transferring items again.
Re-registering receivers cannot resume the retired gesture. Loss of server authority also withdraws the capability and clears presentation ownership.
Packet regressions use real registration and action handlers without registering the action channel as a client receiver.
The original direction check rejects that valid action. The corrected handler executes it once.
Fabric screen bindings, complete authored controls, and live route acceptance remain unfinished.

The four-project build passes 2,418 tests, with 213 optional skips and no failures or errors.
All 45 focused cooking and request tests pass with both native wire comparisons enabled.
The 104 core and 38 add-on patches replay. Checkstyle and offline validation pass.
All 1,401 embedded core classes match the rebuilt core byte for byte.

A private Fabric observer verifies the channel lifecycle against BDS 1.26.51.1.
It observes action sending become unavailable after result-receiver withdrawal, then available after re-registration.
The production receiver retains all 39 slots across 187 frames from furnace, smoker, and blast-furnace menus, with no observer errors.
Both client sessions match all 1,401 core classes and four resources.

The three Java cooking cases and same-world reconnect pass. Cleanup leaves no owned client, server, or display processes, and the private observer is removed.
The observer sends no inventory actions. These observations establish channel lifecycle, while authored action execution and native screen parity remain unverified.

## Native cooking captions

The publisher now uses the shared native tab-label rules.
Disabling filtering selects the all-recipes caption; enabling it selects the furnace or smoker caption.
The inventory tab uses the shared survival key.
Program export preserves the current controller label's translation along with the authoritative title.

A publisher regression covers all three families, both filter states, and search/inventory tabs.
Preference changes advance the model update while opening and item authority remain stable.
Complete program round trips match the core-resolved scene.
The previous publisher fails this regression; the corrected publisher passes.
Sixty original getter controls establish the shared rules with supplied controller fields and bounded allocation/CRT seams.
Native fallback titles, complete input handling, and full screen parity remain open.

The final four-project build passes 2,487 tests, with 212 optional skips and no failures or errors.
The native navigation and caption suite runs without skips.
All 104 core and 38 add-on patches replay, and all 1,404 embedded core classes match.

A controlled BDS 1.26.51.1 client fixture exercises fourteen preference changes and six recipe press/release replies.
All fourteen model caption keys match the native getter cases and the shipped English table.
Eleven visible caption draws match their exported translations.
Furnace, smoker, and blast-furnace cooking and same-world reconnect pass.
Two runtime inventories match 2,520 classes and four data resources each.
Normal cleanup removes the private observer, restores the driver, and leaves no managed-profile JVM.
The scene projection removes unfinished controls and mappings, so it does not establish full default-screen or native pixel parity.


## Focused carried-item recipe actions

The backend retains an initial mode-`2` focus before the primary recipe press.
That focus permits selection with a carried Item while direct unfocused presses keep their empty-cursor check.
Focus itself transfers nothing and does not manufacture a selection snapshot.
Terminal release requires its original opening, snapshot, and controller context.
Capability withdrawal and menu replacement retire the permission.

Five fresh native controls execute the original graph, held-slot getter, focus entry, recipe effects, provider transfers, and owned request serialization.
Mode-`2` counts `0`, `1`, and `64` retain the cursor while placing twelve ingredients through two requests.
Carried controls in modes `1` and `3` produce no requests.
All three production mode-`2` request payloads match the original serialized bytes, including the changed destination's negative request reference.
Every request prediction retains the carried stack.

The [focused transfer reference](../../../docs/native-cooking-actions.md#focused-carried-item-transfers) lists the original functions and supplied interfaces.
Mandatory tests cover all three cooking families, mode-specific admission, exact-context release, capability loss, and reused menu identity.
The Java mouse adapter remains mode `1`.
Physical mode-`2` events, carried-item screen controls, full controller construction, server acceptance of that carried path, and native pixels remain unfinished.

The planner also rechecks player-UI contents and server revision after item metadata callbacks.
Changed contents or a revision-only replacement reject before station/player mutation or request submission.
The newer cursor remains intact, and a fresh retry retains the original selection history.

The final combined suites pass 2,621 tests, with 163 optional skips and no failures or errors.
All four projects build, and the final core rerun includes the integrated movement reference fixtures.
Cooking, camera, retained particle, attachable, and Iris GPU comparisons run without skips.
All 1,413 core classes match both packaged copies, and all 1,139 production client classes match the add-on.
The affected core and add-on stacks replay successfully.

A fresh BDS 1.26.51.1 route verifies version-five mouse actions in furnace, smoker, and blast-furnace screens.
All six press/release replies retain context `1` and their original authority across newer frames.
Each real ingredient starts cooking, all three ordinary follow-up cases pass, and same-world reconnect passes.
Both runtime inventories match 2,551 project class resources and four data resources.
Normal cleanup removes the observer, restores the private driver change, and leaves no managed-profile JVM.
The controlled scene projection preserves all 39 real slots while it removes unfinished controls and mappings.
This run does not establish unchanged authored screens, physical mode-`2` input, carried-item screen support, or native pixels.

## Player inventory options

Crafting-book changes now reach Bedrock player-inventory preferences instead of the furnace-only handler.
The native snapshot retains both tabs, filtering, and independent inventory and workbench layouts.
Menu ownership changes select the corresponding layout for Java's shared crafting book.
Pending close and recovery restore the inventory projection.

Java can change open and filter states. It cannot express native tab selection or every native layout.
Filter-only changes retain the exact native layout, including recipe-book-only and unknown values.
The other screen's layout and both tabs remain intact.
An unseen snapshot uses native None sentinels for fields that Java cannot supply.

`InventoryOptionsStorage` replaces the furnace-specific storage and owns all four Java book settings.
Player updates retain the three furnace books, and furnace updates retain the player book.
The existing native furnace channel keeps its wire format and negotiation behavior.

The [1.26.50-beta.26 schema](https://mojang.github.io/bedrock-protocol-docs/1.26.50-preview.26/packets/set-player-inventory-options-packet/) describes the signed VarInt fields and boolean.
The target 1.26.51.1/protocol 2193 original packet reports ID 307.
Its complete descriptor confirms field order and raw signed values across four samples, including integer extremes.
The capture supplies a typed output sink. It does not execute compressed native wire writers.
Committed tests verify Java wire bytes, packet routing, independent layouts, unknown values, furnace retention, and menu transitions.

This completes the options transport and Java projection needed by player inventory.
Authored player-inventory presentation, the live player renderer, native tabs/search, controller input, and visible native parity remain unfinished.
The full stack passes 2,798 tests, with 163 optional skips and no failures or errors.
All 1,450 core classes match both packaged copies, and all 1,185 client classes match the add-on.
Eleven options regressions execute the packaged core and reject four deliberately incorrect variants.
The rebuilt add-on passes 35 screen regressions and matches the existing 1,940 native UI cases across 14 corpora.
The bundle contains the exact two client JARs.
A fresh BDS 1.26.51.1 route passes the crafting-book sticks and furnace-book cooking scenarios.
These live checks verify the Java workflow; they do not establish native screen or pixel parity.

All five goal areas and the four original reports remain open.
These changes target release 0.3.53.


## Native ingredient counting

Count native ingredient availability separately from placement and stack request authority.
Group by concrete descriptor hash, retain the first stack's match set, and sort once by cardinality then descending quantity.
Preserve collection-relative source references, repeated allocation rounds and the final partial round.
Require at least one nonempty ingredient because the original counter does not terminate for empty recipes within the execution bounds.
Concrete recipe matching and registration admission remain the caller's unfinished integration work.

The current-owner producer snapshots grid, hotbar, inventory and optional cursor collections in native order.
Player and table grids use four and nine inputs. Armor, offhand and preview cells remain outside those collections.
The connection rewriter supplies actual descriptor conversion and hashing. Network IDs do not gate ingredient counts.
These APIs do not replace item authority, request admission or placement.

Complete original counter `0x14297b140` supplies 755 cases, 7,282 allocation rounds and 55,549 matcher calls.
Fifty controls cover large cardinality/quantity sorts, including native tie ordering.
Native descriptor construction, hashing, sorting, source-reference copying and nested cleanup execute.
Source backing, ordinary definitions, connection lookup and concrete recipe matching remain supplied interfaces.
The comparison checks counts, every round and reference, and exact matcher-call order.
See the [ingredient reference](../../../docs/native-player-inventory.md#ingredient-availability-rounds) for boundaries and source mappings.
Actual actor capture, concrete recipe admission/matching, complete availability evaluation, screen delivery, actions and pixels remain unfinished.

The full four-project build passes 2,850 tests, with 163 optional skips and no failures or errors.
Checkstyle passes. All 1,483 core classes match the embedded add-on and proxy copies; all 1,191 client classes match the tested add-on.
The packaged counter matches all 755 controls and six focused regressions, and rejects six deliberate semantic changes.
Retained packaged search, output-unlock and progressive-model comparisons also pass.


## Resolved Recipe source matcher

Bind already resolved ordinary descriptors to native Recipe source matching and current-owner counter snapshots.
Reject an `ench` ListTag or nonzero `minecraft:item_lock` ByteTag before the matcher's source conversion.
Retain absent versus empty userdata for empty descriptors, wildcard metadata and canonical associated block ownership.
Share source guards with cooking. Keep grid matching on its separate path.
The first nonzero stack still controls eligibility for every later source with its descriptor hash.

The original shaped and shapeless factories install the same matcher and comparator.
Actual Item construction, typed CompoundTag lookups, descriptor comparisons and the complete counter execute in the new reference.
It covers 1,443 direct matches and 260 counter controls, including 496 rounds and 3,305 matcher calls.
Thirty-nine shapeless controls also match. Typed metatype getters, ordinary definitions, registry lookup, source backing and allocator/CRT remain supplied interfaces.
The original constructor clears Item references at zero quantity; the fixture now executes that construction before typed userdata injection.

`countResolvedRecipeInputs` accepts resolved descriptors with explicit empty positions.
Deferred wire names can select aliases or block fallback. The model below resolves them against explicit registry interfaces.
Actual registry acquisition, tag/Molang payloads, complete wire admission and installed availability remain unfinished.
See the [resolved ingredient reference](../../../docs/native-player-inventory.md#resolved-ingredient-matching) for evidence and limits.

The full four-project build passes 2,854 tests, with 163 optional skips and no failures or errors. Checkstyle passes.
All 1,485 core classes match both embedded copies; all 1,191 client classes match the tested add-on.
The packaged matcher passes 1,703 direct/counter controls and three focused integration regressions, and rejects six deliberate semantic changes.
All retained counter, search, output-unlock and progressive-model comparisons also pass.


## Deferred name and alias descriptors

Resolve names through native signed-short narrowing, wildcard alias selection, ordinary lookup rewriting and BlockLegacy fallback.
Validate associated block state before metadata clamping. Keep a failed found Item separate from an absent Item eligible for fallback.
Retain each deferred position's first resolution, including failure, after source guards and conversion.
Preserve alias representatives independently of live membership, air-based emptiness and wildcard matching.

The rich current-owner counter overload requires an explicit complete registry context.
Query emptiness during native minimum and consumption phases instead of caching active slots before matching.
Keep candidate-first default descriptor dispatch separate from the generic key API's contract.

Complete original routines provide 1,904 resolution/emptiness controls, 4,032 comparisons and 220 full counter controls.
The mixed counters cover 514 rounds and 1,179 registry calls with exact lookup order and post-resolution cleanup.
Registry, alias/member, BlockLegacy/state and typed source interfaces remain supplied boundaries.
Actual registry acquisition, tag/Molang payload resolution, full wire admission and installed availability remain unfinished.
The [deferred descriptor reference](../../../docs/native-player-inventory.md#deferred-names-and-complex-aliases) records the contract and limits.

The full four-project build passes 2,859 tests, with 163 optional skips and no failures or errors. Checkstyle passes.
All 1,493 core classes match both embedded copies; all 1,191 client classes match the tested add-on.
The packaged core matches both new corpora and three focused integration regressions.
Nine deliberate changes fail value or lookup-order comparisons. All retained packaged comparisons also pass.


## Shared registry lookup dependency

Use the [registry foundation](../upstreamable/0095-integrate-authored-native-ui-presentation.pr.md#registry-name-lookup-ownership) for saved-name parsing, exact alias getters and metadata callbacks.
That patch owns the required protocol asset and its parser and alias tests.
Deferred descriptors retain wildcard alias selection on the earlier raw-name path, before ordinary lookup.

The [name-resolution reference](../../../docs/native-player-inventory.md#native-name-parsing-and-metadata-rewrites) records parser and callback evidence.
The [constructor reference](../../../docs/native-player-inventory.md#constructor-staging-and-secondary-names) separates staging keys, secondary maps and later block registration.
A DataDriven class alone does not establish priority-map lookup.
Complete live definitions, block fallback, recipe admission and installed availability remain unfinished.

Recipe consumers now use the shared registry's constructed definitions and independent numeric owners.
Numeric collisions retain both names. Generic Legacy definitions do not inherit builtin traits from a matching name.
Cooking and recipe tests use explicit numeric ownership instead of treating low builtin IDs as absent.
The complete recipe Registry interface and installed native availability remain unfinished.

## Retained definition consumers

Cooking input expansion reads the selected definition's block association before default stack construction.
It no longer replaces that named selection with the numeric owner for this check.
Output admission also retains the constructed stack's definition.
The shared constructor preserves canonical definition identity, and full stack queries retain their separate name-and-ID comparison.

Primitive fixtures declare their warm block caches, ordinary definitions and empty alias tables explicitly.
Their native counter and output-index expectations remain unchanged.
The separate complete registry control compares the packaged constructor and ItemRewriter against original native functions.
Installed recipe availability and NBT outer-loader admission remain unfinished.


## Definition-based default construction

Cooking input expansion now uses the selected descriptor Item for default construction.
Output-index registration uses the retained output Item for its count-one construction.
Both resolve the original definition's associated Block before numeric initialization can select a colliding owner.
The original cooking extractor `146989830` and registration call at `14324d432` use definition-pointer constructor `14247ead0`.

The [shared constructor control](0003-translate-server-authoritative-bedrock-requests.pr.md#named-and-definition-stack-construction) matches 2,304 named and 1,536 definition constructions.
All 4,440 earlier named outputs also match the packaged API.
The targeted consumer run passes 39 tests and Checkstyle.
Both packaged consumer regressions reject numeric-construction mutations by value.
The output mutation fixture explicitly supplies both competing Block conversions; these remain declared unit interfaces.
The existing primitive extractor and output-index controls retain their declared empty aliases and warm Block caches.

The complete four-project build passes 2,866 tests with 162 optional skips and no failures or errors.
All retained packaged comparisons pass.
Installed recipe availability, NBT outer-loader admission and complete native screen/action behavior remain unfinished.

## Player and workbench default layouts

Project saved layout zero and positive out-of-range values through the native constructor default.
Both native defaults show the recipe pane, independently of Java's previous visibility.
Keep the raw saved values when filtering changes, and project the other screen's layout when menu ownership changes.
Negative layouts retain the previous Java visibility as an explicit compatibility fallback.
The independent native profile that forces a layout remains outside this projection.

The recorded 1.26.51.1 constructor slice and registered layout getters provide 1,480 ordinary nonnegative cases.
The optional `STACKANVIL_NATIVE_PLAYER_LAYOUTS` comparison checks both prior Java visibility states, for 2,960 comparisons.
A focused packet regression also checks raw-value retention, filter changes and the two independent layouts.
Both new tests fail against the preceding packaged core and pass after the correction, with implementation origins verified.
The [layout reference](../../../docs/native-player-inventory.md#java-projection-of-default-layouts) records scope and limits.
This does not implement the authored player screen or resolve the original background report.

The complete four-project build passes 2,927 tests with 161 optional skips and no failures or errors.
Checkstyle and repository offline validation pass.
All 1,522 core classes match both embedded copies, all 1,191 client classes match the tested add-on, and all 198 assets remain unchanged.

## Player output availability count state

Evaluate admitted output candidates in native priority order through the full shared ingredient counter.
Respect concrete crafting-table requirements and preserve partial input across alternatives.
Complete input returns state zero with filtering, or state one without filtering.
Partial input or an equal retained selected stack returns state two. Otherwise, return state three.
Skip selected-stack comparison when partial input already determines the result.
Keep placement capacity and stack-request authority separate.

`ItemRewriter.playerRecipeAvailability` binds the decision to the actual current-owner source snapshot and native stack query.
The caller still owns candidate admission, descriptor resolution, concrete grid requirements and retained selection.
Search/unlock policy and installed player model publication remain unfinished.
This change does not install the authored E-key screen or resolve the reported background problem.

The original 1.26.51.1 evaluator at `0x143439420` agrees in 1,344 coupled source-bridge controls.
The control executes output lookup `0x143249b10`, priority sorting `0x143265d00` and original grid requirements.
Cursor enum/model-map lookup, concrete matching, counter `0x14297b140` and selected query `0x14248dac0` also execute.
The comparison retains exact counter visitation, including 33-, 41- and 65-candidate sorts.
It covers all four result states, 2,916 counter calls and 18,918 matcher calls.

Context tags, ordinary definitions, model/vector backing, one output-vector getter and registry/CRT services remain supplied interfaces.
Other tested virtual methods use copied original shaped/shapeless tables.
Evaluation temporaries balance against retained backing. Complete registry/actor/controller lifetime remains outside this control.
Wire admission, tag/Molang payloads, full installed availability, screen actions and pixels remain unfinished.
See the [player output availability reference](../../../docs/native-player-inventory.md#player-output-availability-count-state).

The ten targeted counter, source-bridge and availability tests pass with Checkstyle.
The complete four-project build passes 2,936 tests with 161 optional skips and no failures or errors.
Repository offline validation passes. All 106 patches replay.
The packaged core passes three availability tests, six ability tests, 34 frame cases, five layout tests and 83 permission/action checks.
Seven deliberate priority, table, partial, selected-stack, filter and source-bridge regressions fail value assertions, with implementation origins verified.
All 1,523 core classes match both embedded copies; all 1,191 client classes match the tested add-on.
All 198 assets and 1,509 existing core classes remain byte-identical to the ability milestone.
The change adds one candidate record. Eight changed nested classes retain identical declarations and instruction disassembly.
No new live inventory-screen capture ran for this change.

## Receiver-owned recipe tags

That milestone routes the constructed definition's tags into tag predicates, the then-restricted Molang parser, cooking expansion and recipe displays.
Filter definitions before default-item construction, preserving its independent numeric owner and Block conversion.
Focused collisions check expansion cardinality and displayed item identity.
At that milestone, native Molang compilation and wire descriptor admission remained separate.
The recipe expression follow-up below replaces the restricted parser.
See [the tag ownership reference](../../../docs/native-player-inventory.md#definition-owned-item-tags).

Both new consumer regressions pass against the packaged core.
Collapsing cooking enumeration to numeric owners fails the expansion cardinality assertion.
All 138 focused packaged checks and the four-project build pass.

## Native packet result conversion (October 25, 2026)

CraftingData result descriptors always contain the complete header, including empty result IDs.
Returning early for IDs zero and negative one left later packet fields misaligned.
The dedicated result decoder consumes count, auxiliary value, Block runtime ID and user-data bytes before handling an empty result.

The native result adapter clamps signed-short counts from one through 64.
Zero and negative values become one. Values above 64 become 64.
Inventory stack count narrowing remains separate.
The earlier 65,536-count reference exercised the inventory constructor, without the recipe result adapter.
It does not establish recipe packet count conversion.

Eleven fresh complete native packet controls produce ordinary apple outputs.
They execute schema and binary decoding, ingredient and result adapters, concrete recipe construction, result materialization, registration and output lookup.
All eleven enter the output index and match the apple source.
Descriptor and final ItemStack counts agree for every control.
Original packet, recipe registry, Item, Block, TLS, static and CRT cleanup leaves no allocations or held locks.
Three separate native packet controls consume complete headers for result IDs zero, negative one and 999.

Valid byte I/O and standard CRT, heap and synchronization services remain hosted.
Constructor-input and callback backing are declared. Ordinary results use zero Block runtime ID and a null world context.
These controls do not establish associated Block result conversion, nonzero palettes, the complete packet handler, installed player publication or physical network delivery.

All 106 ViaBedrock patches replay after this correction.
The four-project build passes 2,947 tests with 160 optional skips and no failures or errors.
ViaBedrock passes 1,816 tests with 83 optional skips.
The final targeted run passes all 14 checks and both Checkstyle tasks.
It compares cumulative Java registration IDs against every native output-index result.
Repository offline validation and patch metadata checks pass.

The packaged core passes 14 focused tests and all three complete-header packet comparisons.
Four tests fail value assertions against the preceding packaged core.
That core also fails to decode both empty-result packet controls. Implementation origins are verified.
All 1,523 core classes match both embedded copies.
Only the result decoder and three build-identity classes change; 1,519 classes and all 198 assets remain byte-identical.
No new installed player capture ran for this correction.

## Block result association and field bounds (October 25, 2026)

Result Item IDs must fit a signed short. Auxiliary values must be from zero through 32767.
The decoder checks those fields before narrowing or reading later fields.
Nineteen complete native packet controls establish eight accepted values and eleven rejections, including exact failure positions.
Original error-tree, packet and static cleanup completes without remaining allocations or held locks.
These field controls decode descriptors without materializing results.

Recipe result construction now reads the selected Item definition's own Block association before resolving metadata.
Associated Items discard transmitted auxiliary data; ordinary Items retain it.
A dedicated connection context supplies this constructor to the recipe decoder.
The shared inventory constructor keeps its existing behavior.

Twenty complete native packet-to-registration controls cover apple, stripped oak wood, acacia log and item-prefixed acacia planks.
Each uses auxiliary 0, 1, 2, 8 or 32767.
All twenty register, match the apple ingredient and select the recorded output state.
Acacia log auxiliary one previously produced the wrong constructed Item.
The preceding implementation also retained wildcard auxiliary data on three associated Block results.
Original packet, recipe, Item, Block, TLS, static and CRT retirement leaves no allocations or held locks.

Java comparisons construct the registry from the same typed NBT declarations.
Original native Block-selector observations supply the declared Block interface backing.
The packets transmit runtime ID zero. Their Item constructors select actual default Block states through the fallback path.
Nonzero transmitted runtime IDs, complete world-palette ownership, the full packet handler and installed player publication remain unverified here.

All 106 core patches replay. The four-project build passes 2,952 tests, with 160 optional skips and no failures or errors.
ViaBedrock passes 1,821 tests with 83 optional skips. All 19 focused packaged tests pass.
The packaged core matches all 39 new native packet comparisons.
The preceding core differs on eleven invalid-field cases and four Block-result cases; all fifteen differences fail value assertions.
Constructor signatures select each packaged version's actual construction API. Implementation origins are verified.
The range comparison supplies an empty construction boundary and compares parsing only.
The Block comparison uses the production registry constructor with declared native selector data.

All 1,524 core classes match both embedded copies.
Compared with the preceding core, 1,515 classes and all 198 assets remain byte-identical.
The new recipe context adds one interface.
Three existing implementation classes, two compiler-owned nested classes and three build-identity classes change.
Both nested classes retain identical declarations and instructions.
Packaged implementation classes match compilation. No new installed player capture ran.

## Owned runtime palette reference (October 25, 2026)

The optional `STACKANVIL_NATIVE_RECIPE_PALETTE` reference constructs and populates the original dense BlockPalette.
All 20,674 native slots carry assigned runtime IDs.
The packaged Java palette and descriptor policies match every recorded canonical auxiliary value.
The fixture includes a SHA-256-bound sidecar with typed state declarations.

All 168 packet results match through the real Java recipe constructor and retained output lookup.
The matrix covers four Items, three auxiliary values, ten valid nonzero slots, zero and three invalid runtime IDs.
It includes axis selection, mismatched owners and fallback behavior.
Registration remains separate from output lookup: twelve nondefault-axis results do not find their recipes through the normalized index.
The original network-ID index retains all 168 recipes. The comparison also checks its exact cumulative ID sets.
The comparison grants retained recipe IDs explicitly and compares lookup presence, without asserting complete candidate membership or order.

Earlier zero-runtime controls retained unassigned native runtime fields.
Their runtime-ID equality alone could not distinguish every axis state.
This reference compares actual assigned IDs and exact registered state identity.
A deliberate runtime-input regression fails twelve value assertions.
The checked-in test also passes against the packaged core, with implementation origins verified.
The focused stack run passes all 24 tests with no skips and both Checkstyle tasks.

Original packet, recipe, palette, Item, Block, TLS, static and CRT retirement completes without retained allocations or locks.
The harness hosts normal CRT exception counters and bounded allocation capacity. Guest C++ throw and unwind remain fatal.
The original palette methods store a borrowed Level token but do not read it.
Full Level construction, negotiated or hashed palette delivery, the complete handler and installed player behavior remain unverified.
Production implementation and resource files remain unchanged. No new live capture ran.
See the [owned palette reference](../../../docs/bedrock-coverage.md#owned-runtime-palettes-for-recipe-results-october-25-2026).

## Retained output index and candidate order (October 25, 2026)

`CraftingDataTracker.outputCandidates` returns retained recipes before caller unlock or availability filters.
It preserves the original per-output map traversal, station-context order and raw recipe-ID deduplication.
Replacement keeps the existing map node position, including replacement from a different station.
The output key retains the selected Item definition and auxiliary value.
The complete original query `143249870` compares actual Item pointers, rather than their numeric IDs.
The collision regression supplies typed retained definitions. A native collision caller remains outside that control.

The map foundation belongs to the earlier registry patch.
Item definition names keep FNV-1. Recipe string IDs use FNV-1a over UTF-8 bytes.
The earlier 168 palette queries now compare exact candidate IDs and order through the real Java policies.

The new `STACKANVIL_NATIVE_RECIPE_OUTPUT_INDEX` reference executes 528 complete native packets and 3,168 original output queries.
All candidate IDs and orders match Java.
It records capacities 8, 64, 512 and 1024, cross-station replacement, three global registration rejections and clearing.
Inputs include case differences, Unicode, an embedded NUL, long IDs and rejected-ID reuse.
Every packet also compares the actual native network-ID set.
The Java reference uses real Item registry, result-construction and output-index policies over the same typed declarations.

Original packet, recipe, Item, Block, TLS, static and CRT retirement completes without retained allocations or locks.
Caller context strings and constructor inputs remain declared backing. Standard runtime services and valid byte I/O remain hosted.
These ordinary results use zero runtime ID and a null world context.

All 106 core patches replay. The four-project build passes 2,956 tests with 160 optional skips and no failures or errors.
ViaBedrock passes 1,825 tests with 83 optional skips. Both Checkstyle tasks and repository offline validation pass.
All five focused packaged tests pass, with implementation origins verified.
The preceding core fails the typed definition-collision assertion.
A deliberate FNV-1 recipe hash fails both native candidate-order references by value.
The existing unlock reference shares fixed definition backing across independent trackers.
It retains every native input and the 1 GiB test heap.

All 1,524 core classes and 198 core assets match both embedded copies.
Compiled client classes also match the add-on, including its Minecraft bridge.
The new shared map replaces the private definition map.
The comparison retains 1,505 byte-identical core classes and all 198 assets from the preceding core.
Five existing implementations, ten nested classes and three build-identity classes change.
Nine nested declarations and instruction sets remain identical.
The output catalog changes only its generic map value type, with identical erased instructions.

Full descriptor admission, Molang context, retained player evaluation, controller ownership and installed publication remain unfinished.
No new live capture ran.
See the [candidate reference](../../../docs/bedrock-coverage.md#retained-recipe-output-candidates-october-25-2026).

## Packet-created counter comparison (October 25, 2026)

`STACKANVIL_NATIVE_CONCRETE_RECIPE_COUNTER` compares 160 actual native packet-created shaped recipes through the production resolved-descriptor counter.
It replaces supplied matcher answers with original descriptor resolution, concrete matching and counting.
All 264 rounds and 1,268 ingredient rows match, including source references.
Quantities zero, one, two and 64 retain their wire values but produce identical availability results in each controlled group.
Zero-quantity names remain nonempty. Placement quantities remain separate.

All 16 focused tests pass without skips, plus both Checkstyle tasks.
The comparison passes against the existing packaged core with ten implementation origins verified.
All 106 patches replay; repository offline validation passes. Production implementations, resources and artifacts remain unchanged.
Original packet, recipe, Item, Block, TLS, static and CRT cleanup leaves no allocations or locks.

Inputs remain typed ordinary apple sources and read-only collection backing, with zero runtime IDs and null world context.
No matching, count, emptiness or grid answer is supplied.
Full descriptor families, retained player evaluation and publication remain unfinished.
See the [counter reference](../../../docs/bedrock-coverage.md#packet-created-recipe-counting-october-25-2026).


## Native recipe expression context

Replace the literal-only Molang tag parser with the shared parser and float evaluator.
Keep recipe admission and bindings separate from Actor and rendering contexts.
The actual native loader selects usage group `tags` at version 13.
Original registration assigns exactly two of 319 bindings to that group: `any_tag` and `all_tags`.
Reject other queries during compilation, including queries in inactive branches.

Construct a fresh temporary frame with no writable Actor or context-variable provider.
Preserve missing-temporary faults, zero `this`, implicit bare tag calls and rejection of explicit empty calls.
Match case-sensitive FNV-1 HashedString values with native short-circuit argument evaluation.
Preserve the native result union's float view for a final string value.
Validate native math arities and read-only assignment targets before evaluation.
Use the shared parser's occurrence-specific grouping metadata to validate assignment arguments without changing rendering consumers.

The private original-executable controls cover packet-created predicates, compiler admission and genuine ItemInstance frame evaluation.
The [coverage ledger](../../../docs/bedrock-coverage.md#native-recipe-molang-context-october-25-2026) records final counts, artifact checks, supplied boundaries and remaining limits.
No native predicate or compiler answer is supplied by these controls.
The shared runtime follow-up closes the twelve measured assignment-result differences from the additional genuine-frame controls.
All 67 recipe admission results and 232 predicates now match the packaged core.
Broader caller lifetime, value/cast behavior and complete expression parity remain unfinished.
The retained Molang counter increment follows below.
The version-filtered Tag index and installed player publication remain unfinished.
No new live capture closes the original inventory, movement, eating or locator reports.


## Retained Molang counters

Retain compiled recipe Molang payloads independently of their empty representatives.
Match against tags from the converted source definition, while the counter keeps its existing numeric grouping key.
The native fallback constructor resolves that definition through numeric registry lookup.
The original source receiver can differ after an ID collision.

The retained API matches 320 complete native packet cases: 2,560 predicates, 636 counter rounds and 1,272 ingredient rows.
Compare exact amounts, source collections and slots across ingredient quantities zero, one, two and 64.
The Java control explicitly constructs retained descriptors from decoded packet fields.
The wire Molang predicate consumer now uses the converted receiver.
Production registration and installed player publication still use their existing recipe models.
The [coverage ledger](../../../docs/bedrock-coverage.md#retained-molang-recipe-counting-october-25-2026) records the boundary and remaining Tag work.

A further six-case control supplies a borrowed source header after original Item and Block registry initialization.
It declares the source definition cell, null Block and zero auxiliary value.
Original conversion and matching select the current numeric owner independently of that source receiver.
Cleanup completes without outstanding allocations or held locks.
The control does not establish retained-header construction or full recipe/player lifetime.

All four projects build with 2,980 passing tests, 152 optional skips and no failures or errors.
Both Checkstyle tasks, repository offline validation and all 106 patch replays pass.
Four focused retained-Molang tests pass against the packaged core, with nine implementation origins verified.
The new core matches all six source-header predicates.
The preceding core differs on two tag-query values without linkage failures.
All 4,864 existing packet predicate results still match the packaged core.

All 1,529 core classes and 198 core assets match both embedded copies.
All 1,192 compiled client classes match the add-on.
Compared with the preceding core, 1,509 classes and all 198 assets remain byte-identical.
Seven further classes retain identical declarations, instructions and bootstrap methods despite metadata changes.
The retained counter adapter intentionally changes its lambda target from the numeric key to the complete source descriptor.


## Retained Tag admission

Use the versioned registry index to admit Tag payloads.
Keep index-based emptiness separate from matching against the converted receiver's owned tags.
Preserve air-only index behavior and retain lazy Name, Empty, Tag and Molang values through one decoded-ingredient factory.
The existing wire Tag consumer now uses that index guard and converted receiver.

The mixed counter reference now compares all 608 packet cases: 4,864 predicates, 1,056 rounds and 2,112 ingredient rows.
The earlier 89,252-call Tag reference still compares the concrete payload matcher at its actual supplied-definition boundary.
Eight registry controls also compare exact versioned index membership.
See the [coverage ledger](../../../docs/bedrock-coverage.md#versioned-tag-admission-october-25-2026) for the corrected native scope teardown and context limits.
Installed retained recipe publication, other recipe families and all-empty counting remain unfinished.

All four projects build with 2,986 passing tests, 152 optional skips and no failures or errors.
Nineteen packaged checks pass with twelve implementation origins verified.
The eight packaged wire-admission projections match the observed native index and traced nonempty-index loader guard.
The preceding core differs on five projected values without linkage failures.
These projections are not additional original-executable payload runs.
All 4,864 existing packet predicates still match the packaged wire path.

All 1,530 core classes and 198 core assets match both embedded copies.
All 1,192 compiled client classes match the add-on.
Compared with the preceding core, 1,500 classes and 196 assets remain byte-identical.
Fourteen further classes retain identical declarations, instructions and bootstrap methods despite metadata changes.
Only the two registry/factory JSON assets change, and their earlier data remains equal after removal of the new minimum-version fields.


## Registered crafting ingredient ownership

Retain decoded ingredient payloads when accepting shaped and shapeless network recipes.
Preserve those owners across append and unlock updates. Create new owners after a clear update.
Use the retained payloads and native source guards in actual crafting-grid matching.
Keep other recipe families and the existing grid assignment algorithm separate.

The complete 608-packet counter comparison now reaches production registration before evaluating ingredients.
Its existing native reference still covers 4,864 predicates, 1,056 rounds and 2,112 ingredient rows.
Three regression methods cover independent lazy positions, duplicate and clear updates, registry replacement and native source eligibility.

Ten bounded original player-evaluator controls inspect the all-empty case.
Eight controls repeat the `INT_MAX` minimum with growing round counts. The observer interrupts them after four scans.
Two workbench-ineligible controls return state three without entering the counter.
Interrupted controls claim neither an availability return nor complete cleanup.
Java's explicit all-empty counter rejection remains a documented safety divergence.
Installed player recipe publication and the original reported live bugs remain unfinished.

All four projects build with 2,989 passing tests, 152 optional skips and no failures or errors.
ViaBedrock passes 1,854 tests with 79 optional skips. Both Checkstyle tasks and repository offline validation pass.
All 106 ViaBedrock patches replay.
Twenty-two packaged checks pass with thirteen implementation origins verified.
The separate wire predicate comparison still matches all 4,864 results.

All 1,531 core classes and 198 assets match both embedded copies. All 1,192 compiled client classes match the add-on.
Compared with the preceding core, 1,508 classes and all 198 assets remain byte-identical.
Sixteen further classes retain identical declarations, instructions and bootstrap methods despite metadata changes.
The synthetic recipe-type switch changes only its mapping order for the three crafting types.
The only new class is the matcher interface that preserves ingredient-position identity through grid assignment.

## Native block recipe contexts

Use the current block at the owning screen's position to select workbench recipe contexts.
Read shared component snapshots from the earlier block-definition patch. Keep recipe-specific typed fields and matching in this patch.
Preserve an empty component separately from an absent component, along with tag order, duplicates and empty strings.
The same owner-context API supplies retained output-candidate lookup.
Grid size and table name remain data fields. They do not establish new native layout or grid behavior.

Eighteen original producer controls cover state-before-legacy selection, fallback, copied output strings and position delivery.
Twelve original typed NBT controls establish field defaults and list-element behavior.
A complete original registry control checks 1,379 constructed BlockLegacy definitions without finding this legacy component.
The [coverage ledger](../../../docs/bedrock-coverage.md#native-recipe-block-contexts-october-25-2026) records supplied interfaces and cleanup boundaries.

Java production tests exercise changing workbench states, custom station matching, explicit-empty rejection, fallback and ordered output candidates.
Native model-position initialization, arbitrary component admission, complete native grid behavior and installed player publication remain unverified.
Unpositioned Java player inventory uses the fallback. The four original live reports remain unresolved.

All 106 ViaBedrock patches replay, and all four projects build.
The full run passes 2,993 tests with 152 optional skips and no failures or errors.
ViaBedrock passes 1,858 tests with 79 optional skips. Both Checkstyle tasks and repository offline validation pass.
Twenty-six packaged checks pass with fifteen implementation origins verified, including all twelve typed component controls.
The separate wire predicate path still matches all 4,864 results.
Four workbench projections match the measured context rules. The preceding packaged core differs on three values without linkage failures.
These projections supply world-state and component backing. They do not establish complete native grid or installed player/controller behavior.

All 1,532 core classes and 198 assets match both embedded copies. All 1,192 compiled client classes match the add-on.
Compared with the preceding core, 1,513 classes and all 198 assets remain byte-identical.
Eleven further classes retain identical declarations, instructions and bootstrap methods despite metadata changes.
The only added class is the typed crafting context. The native UI patch changes only exported hunk context.
