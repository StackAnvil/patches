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
