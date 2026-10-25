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

Decode recipe counts through the target's signed-short conversion before storing the positive low byte.
Counts 128 through 255 remain nonempty.
Validate every static result against the current item table before registration.
Reject air, unknown item IDs and empty results without claiming registration keys.

## Native evidence

The target is Bedrock 1.26.51.1, build 51061372, protocol 2193.
Fresh executable probes cover 49 station/name cases, 72 network-mode cases and 217 dimension cases.
They also cover 43 output states, all 65,536 wire counts, all 256 stack counts and 142 dynamic UUIDs.

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

The shared network codec now owns signed-short count clamping for inventory items and recipe results alike.
The recipe-only type retains its clientbound write guard and no longer duplicates count conversion.
The codec patch records the fresh native constructor comparison and regression.

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

Recipe results now use the same connection constructor as inventory stacks and retain their clientbound write guard.
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
