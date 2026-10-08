Evaluate named actor properties before render controller selection. Saved CubeCraft controllers require string enum comparison and correct assignment and unary precedence. The shared Molang evaluator also supplies Geyser custom block permutations.

Validation: semantic parser/property regressions and the full 246-test ViaBedrock suite pass. Typed wire decoding stays in the existing metadata patch.

Carry resolved materials, `ignore_lighting`, and the evaluated floating light multiplier in each selected actor model. Material arrays resolve in the controller scope. Preserve wildcard and bone override order for the client renderer. A saved Bedrock 1.26.51.1 Hive logo requires the unlit controller input; CubeConverter supplies the source fields. Target protocol is 2193.

Validation: material selection tests cover named bindings, array choices, override order, immutable snapshots, and lighting state changes. The complete ViaBedrock build passes, including Checkstyle.


Native actor scale now remains available in `Entity.scale()` and
`query.model_scale`. Scale-only updates refresh models even when controller
selection stays equal. Converted item-display models multiply their fit
and origin offset by this scale. The saved protocol 2193 CubeCraft scene
supplies FLOAT metadata 38 values of 1.7 for banners and 5 for its hanging
cube, and the target 1.26.51.1 client renders the larger geometry. Its
`query.model_scale` getter at `14221ac00` reads the native float context.
The [Molang reference](https://mojang.github.io/bedrock-samples/Molang.html)
uses this query name.

Three semantic tests cover wire decoding, sparse updates, unchanged-model
refreshes, and controller conditions. Zero and negative scale values stay
intact. This change does not add client `scripts.scale` or camera animation
queries. Raw captures and executable probes remain private.

Evaluated actor models now retain immutable UV offset and scale expressions. UV-only changes refresh the model snapshot. Camera-dependent expressions reach the native renderer without protocol-side evaluation.

The target Bedrock 1.26.51.1 controller parser and ENTITY vertex shader establish identity defaults and `UV * scale + offset`. Target protocol is 2193. The licensed executable SHA-256 is `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`. Saved pack assets and native exports stay private. A semantic snapshot test evaluates retained lifetime expressions after replacement and checks UV-only model updates.

### Molang float runtime

Pin `org.redlance.mochafloats:runtime:6.1.0` from Maven Central and use its parser, lexer, and interpreter modules. The core requires Java 25. Keep the existing string equality, assignment precedence, and property bindings.

Mocha 3.0.1 calculates intermediate values as doubles. A final float cast cannot preserve Bedrock comparisons or repeated assignments. The [official property guide](https://learn.microsoft.com/en-us/minecraft/creator/documents/introductiontoentityproperties) documents float evaluation and the 16.7-million integer boundary. The [MochaFloats project](https://github.com/PlayerAnimationLibrary/mochafloats) defines float values and arithmetic. The [published runtime](https://repo.maven.apache.org/maven2/org/redlance/mochafloats/runtime/6.1.0/runtime-6.1.0.pom) depends on parser and lexer 6.1.0.

Targeted tests cover rounding before comparison, assignments, property inputs, and UV expressions. Full scene comparisons remain required for animation and rendering parity.

Validation: the complete ViaBedrock suite passes 490 tests with one optional test skipped. Checkstyle retains named unused parameters for Java 17 upstream PR patches while checking the Java 25 source. The built core retains the fork's MIT notice.

### Shared native math

Core now supplies the easing functions and regenerated sine lookup that previously existed only in the add-on. Both protocol controller evaluation and client animation use the same library.

Angle reduction preserves the target's float addition before the remainder and maps half-turns to `-180`. Directed rotation retains the start angle and allows extrapolation. This corrects endpoint sorting and repeated subtraction in the dependency.

Target Bedrock 1.26.51.1, protocol 2193, supplies 9,367 native comparisons. Constant dispatcher `140ae6140` and helper `140aeb870` match runtime operations `140b2c2b0` and `140b2d270`. The emulator supplies numeric nodes, runtime stacks, eligibility, cleanup, and a host C float remainder import. Native arithmetic and runtime stack operations execute unchanged. Raw data stays private. These probes do not establish complete parser or visible animation parity.

Validation: the full build passes 958 Java tests, including both native math fixtures. The bundle builds. Direct and ViaProxy particle graphs exercise all three shared functions and produce matching dimensions. Their downloaded archives retain the authored expressions. Visible parity and the existing actor and appearance gaps remain open.


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

Core publishes immutable actor inputs through `viabedrock:actor_state_v2` after capability registration and Java world initialization.
Snapshots retain native flags, named properties, scale, variants, typed spell color, runtime identity, and an actor lifetime token.
The local-player flag lets the frontend resolve its actual Java profile identity on either route.
Removal checks the lifetime token before releasing state.
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


## Shared core Molang grammar and statement results

**Evidence:** The matching Bedrock 1.26.51.1 executable distinguishes simple expression values from complex statement results.
A trailing semicolon changes `2` from result `2` to result `0`.
Statement lists return zero unless execution reaches an explicit return.
The target admits `return 2` without a separator but produces zero, while `return 2;` produces two.
It rejects a direct return followed by another statement in the same scope.
Returns inside selected conditional blocks stop later statements.
Unselected blocks leave execution active.

A private probe executes 25 declarations and 125 billboard samples through the native JSON reader, compiler, VM, and component functions.
Its previous VM context points to a valid private arena through the target TLS field.
Allocation, CRT operations, decimal conversion, single-thread locks, diagnostics, and the compiler's service-availability marker remain supplied boundaries.
The optional SDK observer is absent.
Native parser decisions and VM instructions execute unchanged.
Variable symbol registration and complete live world context remain outside this probe.

**Implemented:** ViaBedrock core now owns the shared token parser and statement-result rules.
Core entity processing and add-on animation and particle programs use that parser.
The add-on also uses core evaluation for numeric and string consumers.
The duplicate client parser and core assignment text rewriting are removed.
Query bindings, actor variables, and execution limits remain with their consumers.
The false branch of a conditional preserves assignment boundaries instead of assigning through the whole conditional.

**Verified tests:** All four projects build with 1,052 passing Java tests, 122 optional skips, and no failures or errors.
Core Checkstyle also passes.
The selected core and add-on suites pass 30 tests, with five unrelated optional references skipped.
Core matches all 41 earlier admission cases and all 25 new constant-statement declarations.
The particle component test matches all 125 native direction and UV samples, including recovered rejected declarations.
Tests also preserve variable side effects, reader parsing, string returns, assignment boundaries, and client execution limits.


**Verified runtime:** Complete direct and ViaProxy replays preserve the CubeCraft scene hash `ede0e43b2874418cbb6b62135898efe0553009307d33fecd0f258383643d5d83`.
Both retain all 311 skin updates and pass transport and rendering checks.
Thirty-six authored direction fixtures load through production resource processing, simulation, and visual extraction on each route.
All reader diagnostics and sampled direction values match their expected states.
No particle loading, initialization, or observer errors occur.
Both routes submit forward draws for translucent and additive particles.
Improved transparency stages were not verified in this parser run.
Screenshot review confirms custom lobby models and hotbar icons.
Overlapping labels and the Java tutorial toast remain presentation gaps.
These checks verify packaged integration without establishing native image or timing parity.

**Remaining:** Complete lexical admission, variable registration, nested control flow, pack-version gates, and SDK world context need further native comparisons.
The authored runtime controls do not establish native images or animation timing.
Typed schema dispatch, interpolation, item classification, and all other coverage requirements remain active.


## Shared core Molang jumps and float loops

**Evidence:** Bedrock 1.26.51.1 returns through nested selected scopes and stops later statements.
`break` and `continue` target the nearest active loop.
Positive fractional loop counts run while their float remainder exceeds zero.
Counts `0.5`, `1.5`, and `1025` therefore execute once, twice, and 1,025 times.
The former client floor and 1,024 clamp did not match this target.
Empty scopes and malformed loop bodies fail compilation.

The [Mojang Molang reference](https://mojang.github.io/bedrock-samples/Molang.html#loop) currently identifies version 1.21.90.3 and describes a 1,024 loop limit.
The matching 1.26.51.1 VM probes differ, so these changes follow the pinned executable evidence.
A limit elsewhere in the full live engine remains unverified.

Private probes execute 57 declarations and 285 billboard samples through the target compiler, VM, and component functions.
Eight declarations use temporary variables to measure mutations and nested jumps.
For those cases, native registry constructors and registration instructions execute unchanged.
The previous VM context uses empty native variable vectors.
Supplied boundaries remain allocation, CRT operations, locks, diagnostics, TLS storage, and the compiler service marker.
Actor variables, complete world context, and native array iteration remain outside this comparison.
A private instruction cap interrupted a much larger loop; that interruption does not establish a native execution limit.

**Implemented:** Core compiles jumps and loop calls into private runtime functions before evaluation.
These functions unwind nested frames while retaining Mocha float arithmetic and property bindings.
The add-on uses this shared evaluator for numeric and string consumers.
Its duplicate equality helper, loop clamp, and execution guard are removed.
Core preserves the existing 16,384-iteration host budget across nested and successive loops, including array iteration.
This budget bounds untrusted work; it is a compatibility policy rather than verified native behavior.
Completed mutations remain visible when the budget ends evaluation with zero.

**Verified tests:** All four projects build with 1,061 passing Java tests, 120 optional skips, and no failures or errors.
Core Checkstyle passes.
Core evaluation and particle components match all 57 native declarations and 285 direction and UV samples.
Regression tests cover nested return mutation order, fractional counts, nearest-loop jumps, array bindings, and the shared host budget.
Both numeric and string client consumers use the same control flow.
Reader diagnostics are compared against compiler rejection, separately from later VM diagnostics.

Particle starts now release their pending slot before completing the public future.
Cached completions can invoke callbacks inline; those callbacks must see capacity from work that has already finished.
The previous ordering could reject chained starts against the 32-slot limit.
Two regressions exercise 128 nested cached starts with an almost-full queue, runtime failures, and rejected starts.
The existing pending-start, cached-graph, emitter, and image-memory limits remain in effect.

Early direct runs passed coarse scene checks while several authored starts were rejected.
A thread sample in an OpenGL draw did not establish a graphics fault.
The pending-slot completion order was corrected and receives separate regression coverage.
The private observer also kept scheduling an obsolete fixture queue after a resource reload canceled it.
That duplicate queue filled the bounded cache; the observer now stops scheduling when its playback generation changes.
Resource reload cancellation remains expected, and cache capacity is not raised for the test.

**Verified runtime:** Complete 240-second direct and ViaProxy replays preserve the CubeCraft scene hash `ede0e43b2874418cbb6b62135898efe0553009307d33fecd0f258383643d5d83`.
Both retain all 311 skin updates and pass transport and rendering checks.
Each route loads 68 authored direction definitions through production loading, simulation, and visual extraction.
Every reader diagnostic and sampled direction matches its expected state.
Translucent and additive controls also start, giving 70 distinct authored effects on each route.
No capacity rejection or observer error occurs in the successful runs.
The final ViaProxy observer records one expected start cancellation during a resource reload.
Both routes submit forward draws; improved-transparency stages remain unverified in this run.
Screenshots show the custom lobby models and hotbar icons, alongside overlapping labels and the Java tutorial toast.
These saved-scene checks do not establish a new live-server join, native image parity, or animation timing parity.

**Remaining:** Complete grammar admission, actor and world contexts, native array iteration, pack-version gates, and visible animation timing remain unverified or incomplete.
Runtime diagnostic text also needs comparison.
All other coverage requirements remain active.

## Explicit temporary evaluation groups

Core supplies caller-owned groups for related expressions that share temporary values.
Single-expression calls retain fresh storage, and persistent actor bindings remain shared.
Expression frames and current values stay independent.
The add-on uses this API for billboard sampling.
The [coverage ledger](../../../docs/bedrock-coverage.md#shared-temporary-variables-in-billboard-expressions) records 45 new native samples, supplied boundaries, regression coverage, and remaining scope and missing-value gaps.
All four projects build with 1,065 passing Java tests and 120 optional skips.
Core Checkstyle passes.
Complete 240-second CubeCraft replays pass through direct and ViaProxy routes.
Each preserves 311 skin updates and verifies 77 authored direction cases plus two material controls.
No active capacity rejection or observer error occurs; native image and timing parity remain unverified.

## Missing Molang members and null coalescing

Core now distinguishes a missing variable member from a valid zero or empty string.
A missing read stops later operations while preserving earlier writes.
Null coalescing catches that fault in its left operand without intercepting control-flow jumps.
Assignment and array-loop targets keep their mutable bindings, and query access stays with its consumer.

The pinned Bedrock 1.26.51.1 compiler, VM, and billboard functions supply 67 declarations and 335 samples.
Twenty-seven cases use a supplied empty native variable map.
The remaining cases cover temporaries, strings, branches, loops, arithmetic, and nested jumps.
Native registry initialization and store cleanup execute unchanged.
Host allocation, CRT operations, TLS, locks, and diagnostic boundaries remain supplied.

The parser rejects unparenthesized assignment chains before evaluation, matching all three tested native rejections.
Parenthesized nested assignments remain admitted.
Embedded assignment results remain incomplete because native store instructions retain accumulator state and some arithmetic instructions fuse constant results.
The [coverage ledger](../../../docs/bedrock-coverage.md#missing-molang-values-and-fault-propagation) records this separate gap and the full verification boundary.

Source syntax and compiled runtime expressions now have separate boundaries.
The client validates source length, node count, and depth before core generates helper calls.
Generated instructions therefore cannot consume a valid script's source budget.
The existing aggregate-script regressions cover this boundary without increasing any limit.
Counter fixtures now initialize their variables or use explicit null coalescing before increments.

Validation: all four builds pass with 1,071 Java tests, 120 optional skips, and no failures or errors.
Core Checkstyle passes.
Core matches 67 validity declarations and the previous 57 control-flow cases.
Particle components match 133 combined native declarations and 665 samples.

Complete 240-second direct and ViaProxy CubeCraft replays pass with the unchanged scene payload and all 311 skin updates.
Each verifies 87 authored direction fixtures plus two material controls through production loading, simulation, and visual extraction.
All reader states and sampled directions match, with no active capacity rejection or observer error.
Each route records one expected start cancellation during resource reload.
Both controls submit forward draws; improved transparency remains unverified in this run.
Screenshots retain custom lobby models, the hanging cube, hotbar icons, overlapping labels, and the Java tutorial toast.
These saved-scene checks do not establish a fresh live-server join or native image and timing parity.

## Compile custom actor expressions once

A Windows CubeCraft join captured repeated parser work on the Netty client thread during custom actor ticks.
Core now keeps compiled expressions in each custom actor and reuses them for controller selection, arrays, materials, lighting, and scripts.
The cache stores syntax only. Each evaluation reads the current scope and creates fresh temporary variables.
The actor owns its cache, so removal releases cached source without a process-wide retention policy.

Targeted tests verify changed material queries, independent caller variables, persistent actor variables, and reset temporary variables.
The complete patch stack replays successfully. Live joining and visible parity remain separate checks.

## Native trigonometry boundaries, October 7, 2026

Core now preserves the native float-to-integer conversion used by the shared sine lookup.
NaN and overflowing products select entry zero instead of Java's saturated positive index.
The cosine shift occurs before its own conversion check.
The table constructor now divides each integer index by `10430.378F` before sine evaluation.
Multiplication by the rounded reciprocal disagreed with 8,554 entries in the captured target table.

The pinned fishing lookup executes 3,200 inputs covering every float exponent, conversion boundaries, signed zero, subnormals, infinities, and NaNs.
Production matches the executed indices and the initializer with its supplied sine boundary exactly.
The complete native initializer executes all 65,536 float divisions and stores.
Stack probing, byte copying, and the imported sine function remain supplied.
The initial supplied function rounds double sine to float; 86 entries differ from the captured Wine runtime table.
Initial tests check the supplied initializer exactly and the captured values within one float ULP.
The Windows follow-up below replaces that supplied sine boundary. No captured table enters production.

The corrected table also matches 8,732 executed glide cases with and without rocket boosts.
These cover turns, ascent, descent, angle seams, slow falling, and differing previous rotations.
Their native kernel retains supplied status slots, boost components, CRT remainder, and the corrected table.
One portable glide expectation changes by one float bit after correcting its reference table.
The 720 fishing approach and tease cases also pass with the corrected initializer.
These arithmetic checks do not establish complete movement, fishing, or visible parity.

Validation: core passes 779 tests with 19 optional skips, and the add-on passes 602 tests with 69 optional skips.
Both counts include the new private reference checks, with no failures or errors.
Core, add-on, and ViaProxy builds pass. Both standalone reference PR checks pass.
The final add-on and ViaProxy bundles retain all 1,243 core content files byte-for-byte, excluding bundle metadata.
Reviewed artifact replacements preserve 32 unrelated files and keep private rollback copies. No service restarts occur.

## Windows sine-table verification, October 7, 2026

The captured Linux native-client table uses Wine's `sinf`, not Microsoft's Windows runtime.
Executing Wine's complete function reproduces all 65,536 captured entries exactly.
The installed Windows guest supplies official UCRT `10.0.26100.9444` through a read-only disk extraction.
Its complete SSE function differs from Wine at one entry and from rounded double sine at 85 entries.
Independent hardware executions of the Windows SSE and FMA paths produce identical tables.

The pinned game's complete initializer now executes with the official Windows sine import in one emulated address space.
Only stack probing and the final byte copy remain supplied.
A portable producer matches every resulting float bit through bounded range reduction and polynomials.
Its arithmetic derives from [AMD's BSD-licensed AOCL-LibM implementation](https://github.com/amd/aocl-libm-ose/blob/29fd054f383e6c5e2dec2fce781d5220059f1836/src/isa/avx/masm/sinf.asm).
The source and packaged resources retain the license notice.
Production ships no runtime DLL, captured table, or dependency on a Bedrock installation.

Nine portable controls distinguish Windows rounding from rounded double sine and Wine.
The private all-entry test verifies the complete production table against the linked native initializer.
Reexecuting 8,732 glide cases and 720 fishing approach and tease cases uses the Windows table.
The glide comparison matches every production motion bit, including boosted cases.
These probes still supply status slots, boost components, random samples, world getters, and other documented boundaries.
Windows process initialization, other runtime versions, Android and console math, live movement, and complete visible parity remain separate requirements.

Validation: core passes 781 tests with 19 optional skips. The add-on passes 602 tests with 69 optional skips.
Both suites report no failures or errors. Core, ViaProxy, and add-on builds pass.
Both standalone reference PR checks pass, and the complete 97-patch core stack replays from its pinned base.
Both downstream bundles retain all 1,246 core files byte-for-byte, excluding the JAR manifest, including the AMD license.

Reviewed artifact replacements preserve 32 unrelated files per project and retain private rollback copies under `.stackanvil/research/fishing-feedback/crt/build-rollback/`.
No service restarts or new live-server joins occur in this verification.

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
