Actor properties and native state transport use the preceding [shared float runtime](0064-share-native-float-molang-runtime.pr.md). Interpreter, parser and math ownership is separate from actor integration.

## Typed appearance queries, October 26, 2026

Actor-state v5 carries an immutable map of typed INT metadata.
Revisions 2 through 4 retain their existing bytes and leave this map unavailable.
A known empty map supplies native zero defaults; an unavailable map supplies no integer queries.
Shared channel selection covers state replay, identity consumers, animation commands, and picking.

Core controllers and frontend actor scopes share `skin_id` and `trade_tier` conversion.
The pinned Bedrock 1.26.51.1 callbacks read slots 104 and 101, respectively.
They require native INT entries and convert signed int32 directly to float.
Absent entries, short vectors, and wrong types return zero.
Java profession, variant, and trading levels do not supply these inputs.

Original callbacks `1422134f0` and `142213ca0` pass 640 bounded executions.
Controls cover missing actors, vector bounds, absent entries, five metadata types, and eight signed or rounding boundaries.
The harness supplies backing memory and virtual type dispatch; the original callback instructions execute unchanged.
The executable SHA-256 is `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`.
Raw binaries, disassembly, captures, and execution fixtures remain private.

Semantic tests cover codec bounds, truncation, immutable ownership, sparse updates, strict metadata types, controller selection, and capability downgrade.
These controls establish query semantics and transport boundaries, not complete native actor or trading parity.

Fresh direct and ViaProxy BDS journals confirm native INT skin values 1, 2, and 1, with explicit trading tier 0.
The [frontend notes](../../viafabricplus-bedrock/upstreamable/0008-share-native-actor-and-resource-runtime.pr.md#integer-metadata-in-actor-scopes-october-26-2026) record visible texture, geometry, particle, and capability controls.
Higher trading tiers have native callback and semantic coverage only.
The full replayed build passes 3,065 tests with 152 optional skips and no failures.

## Negotiated custom actor state

Core publishes complete evaluated controller snapshots through `viabedrock:custom_entity`.
The payload uses the actual Java actor UUID and retains ordered models and material bindings.
It includes scale, lighting, and all four UV expressions.
An empty selection hides the actor. Removal releases its state.
Late registration removes existing display parts and republishes live actors.
Clients without the capability keep converted Java item displays.

The codec rejects mismatched versions, duplicate material bindings, invalid counts, and trailing data.
Limits are one MiB per payload, 128 models, 128 bindings per model, and 4,096 characters per string.
Six semantic tests cover complete round trips, immutable ownership, signed zero, removal, truncation, and these limits.
The add-on receives this state through both direct connections and ViaProxy.
Player properties, actor events, and complete animation behavior remain separate requirements.


**Recorded-scene verification:** The protocol 2193 CubeCraft recording passes direct playback `2026-10-04T13-33-22.116Z-replay-scene` and ViaProxy playback `2026-10-04T13-30-14.727Z-replay-scene`.
Both preserve the complete scene payload hash and load the accepted resource pack.
Each route receives 77 model updates for 31 actor identifiers and 43 geometry/texture combinations.
The identifier sets, selected combinations, and scale sets match exactly.
The banner scale remains 1.7 and the hanging logo scale remains 5.
Actual renderer submissions and final screenshots show the custom banners, NPC models, and hanging logo on both routes.
Neither run reports unresolved model errors or rejected skins.

These observations verify transport and supported rendering within this recorded scene.
They do not establish complete native visual parity, actor event support, or broader lifecycle behavior.
Raw packets, assets, account data, and screenshots remain private.

## Native actor inputs through ViaProxy

Core publishes immutable actor inputs after capability registration and Java world initialization. Legacy formats use `viabedrock:actor_state_v2` and the identity-aware `viabedrock:actor_state_v3`.
Snapshots retain native flags, named properties, scale, variants, typed spell color, runtime identity, and an actor lifetime token.
The local-player flag lets the frontend resolve its actual Java profile identity on either route.
Removal checks the lifetime token before releasing state.

### Native target-query metadata, October 26, 2026

The negotiated `viabedrock:actor_state_v4` format also carries target metadata as a signed Long.
Core prefers this format and preserves both earlier wire formats without changes.
Registration and withdrawal replay the appropriate snapshot, including when actor values remain unchanged.
Animation commands, picking, and vehicle prediction also accept the identity fields in the new format.

Bedrock 1.26.51.1 registers `query.has_target` at `1421e8107`; callback `1422130b0` reads metadata slot 6.
It requires a present Long entry and returns true for any nonzero value, including negative values.
It does not resolve the target actor. The separate AI filter uses different logic.
Core retains the typed value across sparse updates and supplies zero for absent or differently typed metadata.
Earlier wire formats leave the query unavailable in the frontend instead of supplying a false value.
Core render-controller evaluation and client animation and particle contexts use the same predicate.

Eighty bounded executions of the original callback verify actor presence, vector bounds, entry presence, type, zero, and signed extremes.
The fixture supplies backing storage and the entry's virtual type getter, including its guarded dispatch.
Native instructions perform the remaining reads, checks, and result selection.
Tests cover signed round trips, both legacy representations, truncation, sparse replacement, and immutable captured state.

Fresh direct and ViaProxy guardian controls receive a negative target ID when a real squid spawns, then zero when it dies.
Journal decoding verifies the Long type and matches the target to the squid's native spawn identity.
The authored model changes width, and its parent and child particles change red-green-red.
Actual Fabric receiver withdrawal selects the older format; restoration returns the native draw with the same playback instance.
The observer reads production state without supplying query values or creating effects.
Runtime artifact hashes match the build, and screenshots show the model, particles, fallback, restoration, and removal.
These controls verify the authored pack and transport path, without a native graphical baseline or complete guardian parity claim.

Source: [Molang query reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/molangreference/examples/molangconcepts/queryfunctions).
Dimension changes publish retained inputs after the Java respawn packet.

The codec preserves scalar types and rejects duplicate names, invalid kinds, unsupported versions, trailing bytes, and excessive counts.
Limits are one MiB per payload, 4,096 properties, and 4,096 characters per string.
Eight core tests cover immutable round trips, signed zero, malformed data, sparse updates, local identity, runtime ID reuse, and stale removal.

This channel supplies controller queries and effect inputs.
Complete actor events, interpolation, script variables, and native animation timing remain separate requirements.

**Recorded-scene verification:** Matching native capture `2026-10-04T14-17-15.690Z-record-local` supplies the property changes and dimension round trip.
Direct playback `2026-10-04T14-42-19.663Z-replay-scene` and ViaProxy playback `2026-10-04T14-38-50.359Z-replay-scene` preserve the complete scene payload hash.
Both load the accepted pack without a frontend Store account.
Each route receives 587 actor updates.
All message fields match after connection-specific UUIDs, lifetime tokens, and timestamps are excluded.
The local property sequence is orange, blue, orange, and blue.
The bool, int, enum string, and float retain their values and types.
Both routes remove and restore local inputs at each dimension change.
Final screenshots show the grounded blue costume and green equipment on both routes, consistent with the native selection.
Camera framing, lighting, full animation timing, and broader lifecycle behavior remain unverified.

### Raw names for native global transforms

Actor snapshots now include the raw typed `ActorDataIds.NAME` value.
Sparse updates retain the prior name, and explicit empty strings clear it.
Missing or incorrectly typed metadata produces an empty string.
The codec preserves formatting and case within its existing string and payload bounds.
Entity and codec tests cover these semantics.

The payload uses wire version two and the negotiated `viabedrock:actor_state_v2` channel.
An older add-on therefore cannot negotiate the previous name and receive the changed layout.
Ordinary Java translation does not require this native channel.
The frontend uses explicit raw names for target first-person global transforms.
Native player-name initialization from gamertags remains unverified.

Final direct and ViaProxy checks inject private authored `SET_ENTITY_DATA` packets before the production decoder.
Each frontend receives the unchanged formatted name `§aDinnerbone`, followed by the exact `Dinnerbone` name.
Both actual Minecraft hand entries submit the expected matrix for combined death and name transforms with the licensed `0.9375` scale.
They suppress duplicate Java hands and restore the pose and appearance scopes.
The fixture then clears the name, and both final screenshots show the native arm.
These supplied packet and graph inputs verify transport and draw-time composition, not native lifecycle or pixel parity.


### Native shield blocking timeline

The shared actor registry now retains blocking-start, successful-block, and damaged-block timestamps per player lifetime.
The local-player update records a rising transition flag while blocking remains active.
Successful-block and damaged-block updates require blocking without a transition.
Each update preserves its previous flag outside its guard, matching the target executable.
Replacement, runtime identity reuse, removal, and cleanup release the timer state.

`NativeShieldBlockingState` supplies the immutable updates and `query.shield_blocking_bob` arithmetic.
The callback requires blocking and a positive blocking-start timestamp but measures elapsed time from the damaged-block timestamp.
It preserves unsigned subtraction, float conversion, clamping, and exceptional float values.
The add-on only supplies the simulation tick and animation query binding.
The existing actor channel retains direct and ViaProxy flag transport.

The matching Bedrock 1.26.51.1 build 51061372 supplies instruction and live capture evidence.
Native instruction execution covers 120 start cases, 1,728 block/damage cases, and 2,700 bob cases.
Private fixtures supply flag and level-tick getters rather than emulate the complete actor system.
Unconditional tests cover guard transitions, separate damage timing, immutable retention, player replacement, stale removal, and registry cleanup.

The dependency build and final Java suites pass 1,019 tests, with 115 optional skips and no failures or errors.
The final core suite includes the complete private timestamp and bob fixture.
All 90 core patches replay successfully.

Direct and ViaProxy clients each match all 2,700 bob cases through the actual player animation query method.
Both observe one registry increment for each of 20 active Minecraft ticks and retain the existing hand checks.
Their private probes supply snapshots and timestamps and restore the registry afterward.
Complete network timing, client prediction, remote-player lifecycle, pause behavior, shield item classification, and final shield pixels remain separate requirements.
The [coverage ledger](../../../docs/bedrock-coverage.md#native-shield-blocking-timeline) records the implementation and runtime limits.


### Native hand height and retained-item update

`NativeHandItemState` supplies the target equip-height update and retained-item copy decision for one simulation tick.
The update targets zero for animated replacement and one for retain or immediate update.
It preserves the previous interpolation height and uses a maximum step of 0.4.
It copies immediate replacements regardless of height and other classifications at height 0.1 inclusively.
Native unordered-float arithmetic and copy guards retain their distinct behavior.

Bedrock 1.26.51.1 build 51061372 supplies the matching instructions.
Private execution covers 2,304 independent two-hand cases and 24 exact copy boundaries, including NaN, infinities, and adjacent float values.
The probe observes and skips native stack-copy calls rather than emulate their contents.
Unconditional tests cover replacement sequences, interpolation state, and boundary behavior.
The optional private fixture compares all instruction results.

The dependency builds and final Java suites pass 1,022 tests, with 115 optional skips and no failures or errors.
All 90 core patches replay successfully.
Direct and ViaProxy clients each match 4,608 actual Minecraft hand updates, including busy and ordinary hand states.
The private probes compare retained copies and preserve all four Java fallback modes.

The add-on supplies rendering integration and retains Java item comparison until the native classifiers are complete.
This helper does not depend on Minecraft client classes or a local Bedrock installation.
The [coverage ledger](../../../docs/bedrock-coverage.md#native-hand-height-and-retained-item-lifecycle) records runtime evidence and remaining item-classification gaps.


### Native color exceptions, copies, and selected-slot state

**Verified research:** The matching Bedrock 1.26.51.1 executable, build 51061372, supplies the color predicate and its complete hand-tick caller.
Static initializers bind the two native identifiers to `minecraft:glow_stick` and `minecraft:sparkler`.
Both initializer constants match the identifiers' FNV-1 hashes.
The predicate checks the hash and name bytes, with a mutual-pointer cache fast path for the first identifier.
These identifiers cover the Education color exception, not banners or shields.

The caller skips color handling after a retain result or when both stack counts are zero.
For an update or animated replacement, the helper requires equal native item IDs and a recognized current item.
It uses the block-derived auxiliary value when a block exists, except for raw wildcard value `32767`.
Otherwise, it uses the raw auxiliary value.
The helper masks the value with `31` and replaces results of `16` or more with `5`.

Both equal and unequal normalized colors copy the current stack into the retained stack.
Equal colors force retention, including after a selected-slot change.
Unequal colors leave the original update or animation result in place.
The color copy does not update the cached selected slot.
Only the ordinary main-hand copy updates that cache, after an immediate update or the existing height threshold.
The offhand receives no selected-slot change argument and never updates the main-hand slot cache.

The owner constructor prefix initializes the cached slot and all four height fields to zero.
It calls both native empty-stack constructors and retains the supplied client bridge.
Six sentinel cases execute those constructors and verify empty stacks, valid flags, auxiliary values, counts, restrictions, and variant tags.
The probe supplies the later owner allocation and stops before the remaining constructor body.
This proves initialization for that prefix, not world changes, appearance transitions, or the owner's complete lifetime.

| Native instruction probe | Cases | Scope |
| --- | --- | --- |
| Identifier predicate | 120 | Name and hash checks, storage, missing pointers, and cache branches |
| Color postprocessor | 26,136 | Raw/block auxiliary values, wildcard values, normalization, and observed copy calls |
| Base copy construction and destruction | 30 | Actual field writes and balanced weak-reference counts |
| Color helper with native copies | 1,728 | Actual construction, destruction, assignment, and empty variants |
| Complete hand-tick caller with native copies | 64,800 | Both hands, supplied classifications, heights, selected slots, cache writes, and retained fields |
| Owner constructor prefix | 6 | Actual empty-stack constructors, initial slot, heights, and bridge |

The larger caller probe executes actual native copy and empty-variant instructions instead of skipping them.
It verifies retained auxiliary values and counts as well as height results and selected-slot state.
The fixtures use synthetic stacks without user data, restrictions, or a charged item.
Virtual classifications, inventory getters, global string allocations, and CRT boundaries remain supplied.
The predicate fixtures also exercise synthetic cache states that do not establish valid live object construction.
These checks do not establish every item's virtual dispatch or final rendered pixels.

The private PE loader now zero-fills virtual section tails instead of reading adjacent raw-file bytes for uninitialized globals.
The two identifier globals occupy that zero-filled region before their initializers run.
All 2,176 earlier base and shield classifier cases still pass with the corrected loader.
Executable bytes, exports, synthetic fixtures, and emulator programs remain private.

**Incomplete:** Production still uses Java item classification.
Complete native NBT comparison, resolved restriction hashes, charged-item construction, item dispatch, and renderer lifetime transitions require further verification and implementation.
The color and selected-slot rules above are verified instruction behavior, not a claim that their production integration is complete.

## Compile custom actor expressions once

A Windows CubeCraft join captured repeated parser work on the Netty client thread during custom actor ticks.
Core now keeps compiled expressions in each custom actor and reuses them for controller selection, arrays, materials, lighting, and scripts.
The cache stores syntax only. Each evaluation reads the current scope and creates fresh temporary variables.
The actor owns its cache, so removal releases cached source without a process-wide retention policy.

Targeted tests verify changed material queries, independent caller variables, persistent actor variables, and reset temporary variables.
The complete patch stack replays successfully. Live joining and visible parity remain separate checks.

## Native actor identity negotiation, October 8, 2026

The optional `actor_state_v3` channel adds the actor's signed native unique ID.
The existing v2 channel retains its exact bytes. A v2 snapshot has no unique ID association.
The client resolves that association to the actual Java UUID, including the local player alias.
Connection cleanup, lifetime replacement and runtime or unique ID collisions retire the previous association.
Conditional index removal preserves a newer owner when an older actor is removed.

Native portrait draw `148ddc410` resolves `#entity_id` through Level virtual `+0x1f0` using the unique ID.
The target is Bedrock 1.26.51.1, build 51061372, protocol 2193.
Its signed decimal prefix parser and camera entry have 18 executed private controls.
Four original InputMode value constructors verify Undefined 0, Mouse 1, Touch 2 and GamePad 3.
These controls retain the documented host and controller boundaries. They do not establish visible portrait parity.

Actor capability registration and unregistration replay retained snapshots through the selected codec.
V3 takes priority when both channels are registered. Removing v3 replays through v2.
Removing all actor channels, then registering the same codec, also publishes unchanged inputs again.
The raw packet integration fixture belongs to the later 0092 test infrastructure.
The codec and registry tests remain independently compilable with this owning feature.

The complete 98-patch stack replays with normal hooks. The final private build passes
976 tests: 946 pass and 30 optional cases skip. Main, test and tool Checkstyle pass.
The owning feature retains 11 codec and registry cases. Final-stack actor, publication,
animation and picking suites pass 24 cases. Publication integration retains the existing
0092 Mockito infrastructure; animation cleanup belongs to 0086 and picking capability
handling belongs to deferred 0002.

The private core JAR has SHA-256 `177a0f8a1c88ac387845fee00d1453708ee3cbbc81e46c51b880f876b8c2d069`.
Its approved manifest contains 1,304 entries. All 38 installed files, 58 frozen v10 files,
eight immutable Maven inputs and the pinned UI baseline remain unchanged.
Actual Social actor metadata delivery, unsupported actor classes and native GPU output remain unverified.

## Upstream prerequisites

- [viabedrock patch](../../viabedrock/upstreamable/0064-share-native-float-molang-runtime.pr.md): Land the bounded float runtime before actor property evaluation.


## Complete controller sampler transport, October 26, 2026

Each evaluated render controller now retains one model with an ordered immutable list of texture bindings.
Secondary-only changes replace its snapshot and refresh the draw cache on the following render.
The negotiated `viabedrock:custom_entity_v2` channel carries those lists through direct connections and ViaProxy.
The original channel retains its version-one layout and sends the primary texture to older clients.
The 128-slot bound limits transport allocation; it does not describe native shader capacity.

Shared player, equipped-item, world, and portrait selections retain all sampler slots.
Current single-sampler material consumers explicitly use slot zero.
Unsupported masked materials still select their existing fallback; this transport does not implement their blending.

All 17 focused codec, model-state, store, and controller checks pass without skips.
They cover ordered bindings, immutable snapshots, secondary-only changes, version isolation, legacy encoding, malformed counts, and truncated data.
The full replayed build passes 3,077 tests, skips 152 optional tests, and reports no failures or errors.
Both core Checkstyle tasks pass, and packaged classes and embedded dependencies match their compiled outputs.

Fresh direct and Iris-enabled ViaProxy BDS controls change only the secondary texture, then restore it and remove the actor.
Both bindings reach the client, snapshots and draw caches change, and the native actor lifetime remains stable.
The renderer retains one red model from slot zero throughout; the blue and green secondary images never become extra geometry draws.
Read-only observations, replay audit bindings, server component transitions, and eight reviewed screenshots support these checks.
These authored fixtures use ordinary single-sampler materials and do not establish masked blending or native graphical parity.


## Evaluate every material assignment, October 26, 2026

Custom actors now evaluate every ordered material assignment before constructing their immutable pattern map.
Repeated patterns take their final declaration's position as well as its value.
Earlier expressions still update the actor scope even when a later assignment replaces their selected material.
The existing wire representation keeps unique patterns after evaluation, without a protocol change.

The converter prerequisite supplies complete ordered declarations.
The [Molang reference](https://mojang.github.io/bedrock-samples/Molang.html) specifies expression order, and the [animation reference](https://mojang.github.io/bedrock-samples/Animations.html) specifies later overrides.
The target Bedrock 1.26.51.1 library includes multiple material rules for supported native actors.
Authored repeated-pattern controls do not execute the native client.

A regression uses wildcard, arm, and repeated wildcard scripts to accumulate an ordered value of 123.
The earlier implementation produces 32 because it removes the first expression and evaluates the final wildcard before the arm rule.
The corrected implementation produces 123 and retains the final pattern order as arm, then wildcard.
The resulting map remains immutable.


### Live material override controls

A private BDS pack supplies two actor bones, one zero-alpha red texture, and three material assignments.
The final wildcard overrides an earlier arm-specific cutout rule.
Both actor parts therefore remain visible with the opaque material.
A native baby-state event selects cutout for both parts, and the adult-state event restores both.
Ordered script effects also select the red image instead of a blue negative-control image.

Fresh direct and Iris-enabled ViaProxy captures show both red parts, their disappearance, their restoration, and actor removal.
Received snapshots retain arm then wildcard order and the expected texture and materials.
The actor lifetime remains stable while snapshots and resolved draw caches change.
The downloaded pack matches every declared fixture file on both routes.
These controls establish authored behavior through real BDS state changes, without a native graphical baseline.
