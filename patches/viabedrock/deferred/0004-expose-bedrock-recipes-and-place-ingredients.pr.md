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

## Preserve native transfer identities in cooking requests

Cooking placement no longer substitutes a negative request ID for every slot changed earlier in the request.
Native partial and complete moves preserve the source ID in an empty destination.
Merging retains the occupied destination ID. An emptied ingredient slot uses ID zero when filled again.
The planner now exposes its immutable actions directly, without an unused request-ID parameter or a changed-slot repair pass.
Cooking sources use native hotbar 28 and inventory 29, with physical slot indices. Returns retain combined player provider 12.

Three regressions fail against the previous substitution.
They cover multi-source bulk placement, a cleared ingredient slot, and rejection recovery with native merge rules.
A separate optional comparison uses `STACKANVIL_NATIVE_REQUEST_WIRE` to verify the complete cooking payload against the pinned executable.

A fresh native process produces five payloads through original request detach, owned-request conversion, serialization context construction, and byte writes.
These cover cooking placement plus partial and complete ordinary transfers into empty and occupied destinations.
The BinaryStream fields and packet view remain controlled construction data.
The enclosing sender, complete controller/model ownership, transport framing, live acceptance, and authored cooking controls remain unverified.
The [request reference](../../../docs/native-cooking-actions.md#request-payload-identities) records the original functions and evidence limits.

All eighteen focused planner/request tests pass, including the complete native cooking payload comparison.

All 104 core patches replay after integration with the concurrent movement correction changes.
The integrated four-project build passes 2,383 tests, with 212 optional skips and no failures or errors.
Main, tool, and test Checkstyle report no errors. Offline validation also passes.
All 1,385 core classes match the core JAR embedded in the Fabric add-on.
The removed changed-slot helper has no remaining class in either build.
