# Completed player prediction frames

## Advancing frame identities

Completed client frame IDs increase throughout each connection, including stationary and mounted samples.
Core retains the last accepted frame ID after consumption or position rejection.
Duplicate and older payloads cannot replace newer pending physics or bind consumed physics to a later auth-input tick.
Valid rider time bindings remain available.
New connections create fresh storage and accept frame zero.

Targeted regressions exercise storage and the actual custom-payload handler.
The handler regression fails against the earlier implementation and passes with the retained frame ID.
It checks historical time bindings, motion, posture, frame ordering, rejected positions, and connection reset.
These tests do not establish native trajectory parity or fresh live route behavior.

## Purpose

Use completed local physics for Bedrock auth-input motion when a client provides the negotiated prediction channel.
Keep frame validation, event state, auth-input construction, and correction handling in ViaBedrock.
Support direct connections and ViaProxy with the same payload.

A frame carries feet position, motion, independent swimming, crawling, and sneaking flags, completed collision axes, and the ground-jump event.
Core compares the position with the standard Java movement stream and consumes each sample once.
It discards unmatched samples, including stale samples after a teleport.
The codec rejects non-finite coordinates, unknown flags, extra fields, and incompatible protocol revisions.
Vehicle prediction keeps its existing path.
Ordinary Java clients retain the existing motion approximation.

## Target evidence

Private native 1.26.51.1 captures use protocol 2193 against strict BDS 1.26.51.1.
The raw recorder preserves the native gameplay packets through HTTP NetherNet.

At eye Y 103.4815826, native water-idle motion is about -0.022315647 blocks per tick.
At the matching translated position, the old core reports about -0.0996117 because it applies air gravity.
Native air-floor gameplay motion is about -0.0784, while native water-floor idle motion remains about -0.005.
The zero-motion dry-floor frames occur during startup.
Core preserves the completed motion without another gravity approximation.

The [movement overview](https://mojang.github.io/bedrock-protocol-docs/guides/player-movement-overview/) describes client prediction and server corrections.
The [nearby preview packet reference](https://mojang.github.io/bedrock-protocol-docs/1.26.50-preview.26/packets/player-auth-input-packet/) identifies the motion field.
Its protocol is 2192. The target captures and generated 2193 enums establish the values used here.

Java 26.3 bytecode places `LocalPlayer.sendChanges` after local physics and before `CLIENT_TICK_END`.
The client sends the sample after standard Java movement, including stationary ticks.
Core also emits swimming start and stop events from the local frame.
Remote entities cannot supply local swimming transitions.

## Testing and limits

Five targeted tests cover transport, version rejection, finite values, flag validation, frame consumption, teleport staleness, and swimming edges.
The full build passes with 16 converter tests, 629 core tests, and 603 add-on tests.
There are 135 skips across core and add-on tests, with no failures or errors.
Live direct and ViaProxy strict-BDS comparisons match the native water-idle motion field within about 2e-9.
Both routes complete jump, fall, and water cases without corrections in the controlled water cases.
Startup and elevated-teleport corrections remain.
A ViaProxy sprint-swim case emits one start and one stop event without an additional correction.
A native sprint-swim capture confirms start event 29 and stop event 30.
The add-on aligns its start timing with native.
The later release comparisons below also verify release event ordering.
Remaining movement cases need separate native comparisons.

## Completed collision state

Native wall and open-water captures clear horizontal collision on the swimming-release frame.
Sparse Java position packets can omit that stationary frame and leave core with the previous horizontal collision.
Wire revisions 2 and 3 carry both completed collision axes independently from grounded state.
Core uses these axes only for a matching unmounted frame outside dimension changes.
Ordinary Java clients retain the existing collision translation.
The current codec test covers all sixteen pose, collision, and jump combinations, including stationary motion.

Live direct and ViaProxy strict-BDS runs match four native swimming-stop cases.
These cover wall and open-water release, forward release with held sprint, and sprint release with held forward.
Swimming-stop and sprint-stop events follow the native frame order, including completed collision axes and drag 0.9 followed by 0.8.
The direct journal records one zero-velocity fixture correction; the proxy journal records two.
No correction occurs during controlled release cases.
Dry-floor sprint and jump inputs produce movement on both routes.
The final proxy reset interrupts its jump and receives its second fixture correction.

Each observer case contains 120 server ticks.
The dependency builds pass with 629 core tests and 603 add-on tests, with no failures or errors.
The codec test covers all eight pose and collision combinations in stationary frames.
The rest of the movement matrix remains unverified by these cases.

## Authoritative correction velocity

`CORRECT_PLAYER_MOVE_PREDICTION` carries position, motion, grounded state, and a simulation tick.
The [nearby packet reference](https://mojang.github.io/bedrock-protocol-docs/1.26.50-preview.26/packets/correct-player-move-prediction-packet/) describes this layout for protocol 2192.
Native protocol 2193 captures confirm the layout and zero-velocity corrections around fixture teleports.
The movement guide requires immediate application when the correction tick lies outside available history.

Core previously discarded motion outside gliding and canceled corrections outside its tick window.
It now applies absolute motion for every player pose, including zero-velocity resets.
Unknown rewind types cancel the Java output before logging the unsupported value.
The gliding-only implementation moves out of the deferred rocket patch into this general correction handler.

Four parameterized test cases cover zero, past, current, and future ticks.
Each case exercises both gliding states and zero and nonzero motion through the actual packet mapping.
They verify position, motion, relative flags, grounded state, and complete packet consumption.

**Incomplete:** Core applies corrections immediately because it has no usable movement history for replay.
Corrections inside history still need rewind and input resimulation.
Vehicle velocity, angular velocity, and movement-related metadata, attributes, and effects need matching reconciliation.

## Authoritative grounded state

Strict-BDS Piercing recordings expose a separate correction mismatch.
An airborne correction carries horizontal motion of about -0.076424 and -0.273441.
The first local frame reduces both components by 0.546 because Java retains the prior grounded state.
The target server expects airborne drag at this point.
Java's player-position packet carries position and motion, but no grounded field.

A live Java 26.3 probe checks a zero-relative entity teleport as an alternative.
It changes grounded state but starts two-step interpolation on the local player.
Java ignores ordinary relative movement and position-sync ground updates for locally authoritative entities.
The [movement guide](https://mojang.github.io/bedrock-protocol-docs/guides/player-movement-overview/) requires corrections without interpolation.
These findings establish why faithful ground delivery needs client integration.

Core negotiates `viabedrock:player_correction_v1` and sends the missing state before the standard position packet.
The versioned codec retains the Java player ID, teleport ID, native correction tick, and grounded state.
Core also owns the one-use pairing tracker.
The add-on applies this state after the matching standard packet updates position and motion.
A different player, another position packet, connection changes, or prior consumption invalidate the pending state.
Passengers do not receive a player ground update from this path.
Clients without the channel retain standard position and velocity translation.

Six focused test cases cover codec compatibility, pairing lifecycle, and 64 packet combinations.
The packet combinations include both channel states, both grounded states, both gliding states, two velocities, and four correction ages.

**Incomplete:** The retained tick identifies the correction but does not provide rewind or input resimulation.
Ordinary Java clients still lack faithful grounded-state delivery.
Vehicle motion and broader movement-related history remain requirements.

## Ground-jump events

Native 1.26.51.1 protocol 2193 separates held liquid-rise input from a ground-jump impulse.
The saved pool-floor reference holds `Jumping`, `JumpDown`, and `WantUp` for 29 frames without `StartJumping`.
Its two-frame dry jump emits `StartJumping` only on the first frame.
The old grounded-plus-held-input condition adds a false start event to the first water-rise frame.
Its position and motion already match native.

Wire revision 3 adds the observed ground-jump event to the completed frame.
Negotiate `viabedrock:player_prediction_v3` independently so older layouts cannot be interpreted as revision 3.
For a matching unmounted frame outside dimension changes, core constructs `StartJumping` from that event.
Connections without a completed sample retain the standard Java approximation.
The add-on observes `jumpFromGround`; it does not construct Bedrock packet flags.

Live direct and matching ViaProxy captures complete join and spawn against strict BDS.
The direct comparison covers all 29 native water-rise frames; ViaProxy covers the first 28.
Both routes match all reference flags and the two dry-jump frames.
Maximum water-rise position difference is about 0.000008 blocks; motion differences stay below 0.000000045 blocks per tick.
Neither route receives a correction during these cases.
Separate 64-frame swimming checks retain native surface, sprint, and re-entry events without corrections.

The dependency builds pass with 16 converter, 636 core, and 608 add-on tests.
There are no failures or errors; 135 environment-dependent tests skip.
ViaProxy also builds with the updated embedded core.
The codec covers all sixteen independent pose, collision, and jump combinations, including stationary frames.
Version tests reject revisions 1, 2, and 4, plus a mismatched Bedrock protocol.

**Incomplete:** Ordinary Java clients still approximate jump events.
Automatic jumps, obstructed jumps, other liquid conditions, vehicle movement, and history resimulation need separate native verification.

## Native local posture

Matching 1.26.51.1 executable inspection identifies the native `SneakTriggerIntentSystem` callback at `0x14b177a30`.
Its block-space probes use heights of 1.8, 1.49, and 0.6 blocks, with a 0.01-block inset.
Swimming, crawling, and sneaking remain independent flags.
The request writer at `0x1490c8cb0` distinguishes flight, which suppresses requested sneaking, from gliding, which bypasses forced crouching or crawling.
Passengers, spectators, and spin attacks also bypass forced posture.
The low-space swimming branch compares squared movement with float bits `0x3effffff`.
These values come from the matching executable; raw decompilation remains private.

Core exposes this decision as `PlayerPosture.next` for the add-on's local collision and input observations.
Revision 4 carries the independent posture flags through `viabedrock:player_prediction_v4`.
Core emits swimming and crawling edges from each accepted completed frame.
Forced sneaking does not invent physical `SneakDown` or `WantDown` input.
The held sneak input remains separate from the predicted posture.
Codec tests cover all 64 combinations and reject incompatible revisions and unknown bits.

Eight posture tests cover low-space transitions, flight and forced-standing gates, blocked crawl space, independent sneaking, and the exact movement boundary.
A packet test covers forced sneaking without held sneak input.
The full build passes 16 converter, 648 core, and 612 add-on test cases, with 135 skips and no failures or errors.

Both strict-BDS routes emit crawling start and stop events and retain the short body before server crawling metadata arrives.
The direct ceiling cases still receive one nonzero correction per angle.
ViaProxy receives two at 45 degrees and one at 35 degrees in this run.
Open-water comparisons and held swimming-jump regressions remain within the preceding accepted results.

**Incomplete:** The first crawl-to-swim frame still differs in input scale, sprint state, and water drag.
ViaProxy can receive a further correction while an earlier correction is in transit.
Server-tick history, authoritative flag reconciliation, and resimulation remain requirements.
Fresh native ceiling captures remain required; these tests do not establish full movement parity.

## Native water contact and input scaling

The matching 1.26.51.1 input calculator at `0x1404495e0` bypasses posture input slowdown during flight, swimming, or water contact.
Its caller adapter at `0x14669d7d0` identifies the water argument as `WasInWaterFlagComponent`.
The optional scalar comes from `SneakingComponent`.
The request writer at `0x148b58fe0` copies the processed movement coordinates.

Core exposes the bypass as `PlayerPosture.slowsMovementInput`.
The add-on samples water contact before input.
Revision 5 carries that contact through `viabedrock:player_prediction_v5`, keeping packet construction aligned with client physics.
The water bypass applies on the first crawl-to-water frame, before the posture trigger clears crawling.
Earlier prediction channels remain incompatible and cannot send completed frames to the new channel.

Tests cover physical sneak, forced sneak, crawling, all three bypasses, and the water re-entry boundary.
The codec covers all 128 flag combinations and rejects incompatible revisions, protocols, non-finite vectors, and unknown bits.
Swift Sneak scalars, item-use slowdown, and server-tick history remain separate requirements.

Verification after the water-contact change passes all four project builds and both complete patch stacks.
The build passes 16 converter, 651 core, and 584 add-on test cases, with 133 skips and no failures or errors.
`bun run check` passes.
Both strict-BDS routes complete the 35-degree and 45-degree ceiling cases without corrections.
Both held-sneak swimming cases also receive no corrections.
All 302 comparable frames across the five cases match the direct route exactly in position, motion, and input flags.
Each route matches 64 saved native open-water frames without event mismatches.
Both 48-frame held swimming-jump cases match the preceding accepted reference exactly.
Fixture teleports produce one zero-velocity correction directly and two through ViaProxy, outside the movement cases.
Fresh native ceiling comparisons and broader movement verification remain requirements.

## Swift Sneak and normalized input

Matching 1.26.51.1 executable inspection identifies `SneakingSystem` at `0x14b192c50` and its callback at `0x14b193600`.
They compute `min(1F, 0.3F + level * 0.15F)` with separate float operations.
The bonus requires the prior sneaking or crawling flag.
Registration `0x14681da00` places input before the scalar producer and applies sneak actions later.
Core retains that scalar in `SneakingInputState`, consumes it, then produces its successor before applying the new posture.
This preserves the startup phase without a tick counter.
The add-on uses the same state for local physics.

Equipment update `0x1432760e0` reads enchantment 37 from leg slot 2.
It creates the enchantment component only when absent and removes it for nonpositive levels.
Positive replacements retain the original level until removal.
Core and the add-on share that lifecycle, including idle updates.
Parser `0x14519b430` reads the low byte of a short ID and defaults incorrectly typed fields to zero.
Lookup `0x1432602c0` returns the first matching entry.
Valid Java enchantment translation uses the same lookup, so duplicate entries cannot give the add-on a different Swift Sneak level.

The native input calculator normalizes directions before applying the scalar.
The add-on now retains that normalization instead of Java's square-speed expansion.
This also corrects ordinary diagonal walking and unenchanted diagonal sneaking.
Connections to Java servers retain their existing local input behavior.

Four additional test methods cover scalar boundaries, equipment lifecycle, typed enchantment lookup, and duplicate entries.
Another test covers the retained scalar across startup, release, removal, re-equipping, and crawling.
All four project builds pass, with 16 converter, 656 core, and 584 add-on test cases.
There are 133 environment-dependent skips and no failures or errors.
Both complete patch stacks replay, and `bun run check` passes.

Live strict-BDS direct and ViaProxy runs each complete ten controlled cases without movement corrections.
They cover base sneaking, level 1, retained positive replacements, removal, fresh levels 2 and 3, and diagonal movement.
The direct cases contain 399 forward frames; ViaProxy contains 402.
All 397 comparable frames match exactly in position, motion, movement vectors, and input flags.
Fixture teleports produce zero-velocity corrections outside these cases.
Both recordings complete join and spawn with protocol 2193.

**Incomplete:** Fresh native Swift Sneak captures remain required because the current-boot native GPU guard prevents another native launch.
Boar comparisons, ordinary Java clients without the add-on, item-use slowdown, and correction history need separate verification.
Opposing physical directions still need native cancellation in core's direction helper.
These cases do not establish complete movement parity or Windows/macOS game-join compatibility.

## Opposing physical directions

Matching Bedrock 1.26.51.1 input calculator `0x1404495e0` adds opposing physical directions before normalization and slowdown.
Core now cancels those directions on each axis while retaining the physical input flags.
This broadens the existing direction helper in patch 0004.
The full-stack test in this patch covers all sixteen key combinations with six input scales.
It also retains unrelated sneak and sprint flags.

All four project builds pass, with 16 converter, 657 core, and 584 add-on test cases.
There are 133 environment-dependent skips and no failures or errors.
The full core stack replays, the standalone direction patch applies to the pinned base, and `bun run check` passes.

Strict-BDS direct and ViaProxy runs each complete eight controlled cases without movement corrections.
They cover opposing longitudinal input, opposing lateral input with forward movement, both axes, sneak combinations, and a forward control.
The direct route contains 322 controlled frames; ViaProxy contains 320.
Every captured movement vector matches the native calculation.
Both held directions remain present in the physical flags.
All 318 comparable frames match exactly in position, motion, movement vectors, and input flags.
ViaProxy receives one zero-velocity fixture correction outside these cases.
Both recordings reach join and spawn with protocol 2193.

The preceding build sent incorrect vectors in seven cases, but strict BDS accepted them without controlled corrections.
A clean strict-BDS result alone therefore does not establish input parity.
Fresh native captures remain required because the current-boot native GPU guard prevents another native launch.
Item-use slowdown, correction history, broader movement, real-server interoperability, and Windows/macOS game joins remain requirements.

## Native item-use slowdown and completion

Matching 1.26.51.1 executable inspection identifies the native item-use reader at `0x143fd7e10`.
An absent `minecraft:use_modifiers` component returns `0.35F`.
A present component without `movement_modifier` returns `1F`.
Producer `0x14c5f5e00` creates slowdown only outside the float epsilon boundary around one.
Consumer `0x14c60f9a0` squares the modifier before multiplying each posture-scaled input coordinate.
The native default therefore produces `0.122499995F`, rather than Java's default `0.2F`.
The phase-9 reset at `0x14c610370` removes the component after the frame.

The [official component reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_use_modifiers?view=minecraft-bedrock-stable) describes movement modifiers and vibrations.
The matching executable establishes the default, float arithmetic, and application order for this build.
Core translates network and resource-pack definitions into Java `USE_EFFECTS`.
Shield blocking retains its separate posture path.
Ordinary Java clients receive the component and use server item-use state for the auth-input fallback.
That fallback still needs live verification without the add-on.

The add-on suppresses Java's earlier item-use multiplier on Bedrock connections and applies the translated multiplier after posture input.
Revision 6 carries the scale actually used by completed local physics through direct connections and ViaProxy.
Core constructs the packet vector from that sample instead of reconstructing it after consumption or slot changes.
Codec tests cover all 128 flags with four scales and reject invalid scales and incompatible revisions.
Three modifier tests cover component defaults, vibration behavior, the native float boundary, and exact coordinate products.

The [matching completion schema](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/completed-using-item-packet/) describes protocol-2193 `COMPLETED_USING_ITEM`.
Strict-BDS captures confirm its signed little-endian item ID and use-method fields.
Core now translates matching selected-item completion into Java's `USE_ITEM_COMPLETE` event.
It preserves authoritative inventory counts and cancels completion for a replaced selected item.
Seven parameterized packet cases cover use methods, signed IDs, replacement protection, field consumption, and unchanged counts.

All four projects build, and both complete patch stacks replay successfully.
The build passes 16 converter, 667 core, and 584 add-on test cases, with 133 skips and no failures or errors.
`bun run check` passes.

Live strict-BDS direct and ViaProxy recordings both reach join and spawn with protocol 2193.
Each route covers bow charging, diagonals, sneaking, bow and trident release, repeated eating, and a forward control.
They contain 402 controlled frames each.
The charging vectors retain the native squared modifier and normalized diagonals.
Release restores full input on both routes.
All 240 comparable frames across five cases match exactly in position, motion, movement vectors, and input flags.
The timed trident release differs by one input frame between routes, so its complete trajectories are not counted as exact matches.

The direct repeated-eating case receives one nonzero correction, compared with four before completion translation.
ViaProxy receives no corrections during the seven controlled cases.
Its two zero-velocity corrections occur at fixture teleports outside those cases.
An additional 101-frame ViaProxy case consumes the last food item, restores full input, and receives no correction.
The visible hotbar is empty after consumption.

**Incomplete:** Repeated eating still needs native prediction and completion timing research because the direct correction remains.
Fresh native captures remain required; the current-boot native GPU guard prevents another native launch.
Custom modifier integration, ordinary Java clients, Boar comparisons, correction history, broader movement, and actual Windows/macOS joins remain requirements.
These results establish the named calculations and comparisons, not complete native movement parity.

## Native glide calculation

Core now supplies `GlideMovement` for unboosted travel.
The matching 1.26.51.1 `GlideMoveSystem` callback at `146667b10` uses float arithmetic and the native sine lookup.
View reconstruction follows the shortest wrapped angle delta from the previous rotation.
Slow Falling selects gravity during ascent as well as descent.
Descent exchange multiplies vertical speed before lift; reassociation changes rounded velocity.

All 4,366 bounded native execution cases match Java velocity bits exactly.
The fixtures supply CRT remainder, a regenerated sine table, status slots, and an absent rocket boost.
Native instructions perform angle reconstruction, status-slot admission, lift, steering, damping, and fall-distance stores.
Compact Java cases cover vertical views, wrapped turns, ascent, descent, Slow Falling, and multiplication-order regressions.

The add-on invokes the shared kernel for local Bedrock flight on direct and ViaProxy connections.
Its hook preserves the native fall-distance reset to one when entering velocity Y exceeds `-0.5`.
Runtime scheduling, collision resolution, input phases, rocket boosts, history replay, and live route comparisons remain unverified.
The strict BDS synthetic probe did not enter gliding and does not establish flight parity.
The [coverage ledger](../../../docs/bedrock-coverage.md#native-glide-travel-october-6-2026) retains packet and verification gaps.

The complete core and add-on stacks replay and build successfully against the pinned ViaFabricPlus artifact.
Core checks pass with 684 tests passing and 19 optional skips.
Add-on checks pass with 478 tests passing and 114 optional skips.
These checks verify compilation and the named tests; live flight remains unverified.


## Confirmed rocket boosts and frame identities

Core now decodes `MOVEMENT_EFFECT` into retained actor state and the versioned `viabedrock:movement_effect` payload.
The target protocol 2193 schema and native packet vtable `14e862850` establish the field order and packet ID 318.
Prediction revision 7 includes a completed frame identity.
Core retains 512 exact input-tick bindings and preserves original timing in late channel snapshots.
The shared timeline preserves confirmation timing without a receipt-time countdown.
The October 7 command ordering update below replaces the earlier blanket rejection of older confirmations.

The native calculator applies the confirmed boost before damping.
It sums the full impulse before adding entering velocity.
The production Java calculation matches all 8,732 boosted and unboosted native cases exactly.
Fixtures supply CRT remainder, a regenerated sine table, status slots, and valid or absent boost components.
Native instructions perform admission, angle reconstruction, arithmetic, damping, and fall-distance stores.
The add-on applies this shared calculation and suppresses the separate Java rocket impulse for its local Bedrock player.

Native effect generation and countdown match 216 controlled cases without prediction history or an outbound packet target.
Full incoming confirmation handling, phase ordering, speculative rocket use, rejection, and trajectory replay remain unverified or incomplete.
Dolphin and geyser physics and ordinary Java fallback remain incomplete.
The [coverage ledger](../../../docs/bedrock-coverage.md#confirmed-rocket-boost-and-frame-identity-october-6-2026) retains all live route and platform requirements.

The complete core and add-on stacks replay and build against the pinned ViaFabricPlus artifact.
Core checks pass with 691 tests passing and 19 optional skips.
Add-on checks pass with 478 tests passing and 114 optional skips.
Checkstyle passes for both stacks.
These checks verify compilation and the named tests; live flight and correction replay remain unverified.


## Confirmed dolphin boost and authoritative underwater speed

Core retains and transports `minecraft:underwater_movement` after PLAY, spawn, and channel registration.
Late registration receives retained values, including through ViaProxy.
The channel preserves clamping and zero without inventing a default for absent attributes.
The add-on applies shared boosted acceleration and damping only to the swimming local player with a confirmed effect and a known attribute.

Target 1.26.51.1 callbacks `148b99e40`, `14207c030`, and `142dee630` establish admission, full Depth Strider efficiency, and drag during boosts.
Production Java matches all 6,992 native speed/damping cases exactly.
Native admission passes 2,048 cases.
Fixtures supply ECS storage, attribute and enchantment boundaries, and plain-player traits.
Java tests exercise numeric regressions, independent effects, codec limits, pre-spawn retention, late registration, clamping, and zero.

An isolated strict-BDS synthetic probe receives initial player underwater speed `0.02` but no dolphin confirmation.
Its 16 corrections do not establish client trajectory parity.
Custom drag traits, missing attribute defaults, speculative dolphin admission, confirmation/history handling, correction replay, geyser physics, and live route comparisons remain incomplete or unverified.
The [coverage ledger](../../../docs/bedrock-coverage.md#confirmed-dolphin-boost-and-underwater-attributes-october-6-2026) retains the full goal and platform requirements.

The complete core and add-on stacks replay and build against the pinned ViaFabricPlus artifact.
Core checks pass with 695 tests passing and 19 optional skips.
Add-on checks pass with 478 tests passing and 114 optional skips.
CubeConverter passes all 16 tests, and Checkstyle passes for both Java stacks.
ViaProxy also builds and embeds the updated movement classes.
The rebuilt production calculator still matches all 6,992 native speed/damping cases exactly.
These checks establish the named calculations and transport tests; live boosted trajectories remain unverified.

## Ordinary water acceleration and damping

Core now shares ordinary and boosted water calculations through `WaterMovement`.
The add-on applies them with a known underwater-speed attribute and retains local state across death and respawn.
Missing remote actors and disconnected sessions still lose their state.

Matching native getters `14207c030` and `142dee630` establish clamped Depth Strider efficiency, airborne halving, float order, and drag interpolation.
The rebuilt production calculator matches all 19,456 bounded native speed/damping cases exactly.
These cases supply the walking-speed virtual boundary, ECS storage, attributes, equipment, and water traits.
They do not simulate the complete native world or client.

Fresh direct and ViaProxy clients reach actual strict-BDS spawn and complete plain-water and grounded Depth Strider 3 cases without nonzero movement corrections.
The enchanted first position advances to Z `0.59799999`; completed motion is `0.053508006`.
A separate runtime observation exposes underwater state loss during death/respawn, which the local-state retention change corrects.
The rebuilt direct client retains speed `0.02` during death and after respawn.
Its controlled enchanted-water windows have no corrections, but four nonzero corrections occur during separate respawn relocation.
That lifecycle/prediction gap remains open.
The rebuilt ViaProxy client retains speed `0.02` after respawn and completes both 17-frame enchanted cases without corrections during controlled input or release.
Three earlier fixture-position corrections remain outside those windows, including one idle vertical-gravity correction.
Invalid drowning, unavailable-arena, and expired-recording attempts do not count as valid comparisons.

Core passes 697 tests with 19 optional skips; the add-on passes 478 tests with 114 optional skips.
CubeConverter passes 16 tests; both Java stacks pass Checkstyle and complete replay/build.
ViaProxy builds with the updated calculator embedded.
The [coverage ledger](../../../docs/bedrock-coverage.md#ordinary-water-travel-and-local-state-across-respawn-october-6-2026) records evidence, route checks, and remaining fluid, prediction, platform, and full-goal requirements.

## Liquid current arithmetic

Core now owns `FluidCurrent` accumulation, normalization, and motion updates.
The add-on supplies observed cell flows on direct and ViaProxy connections.
It resets the accumulator each frame and preserves entering motion when flows cancel completely.
Water uses `0.014F`; lava uses `0.0035F`, independent from Java's fast-lava policy.
The previous double-normalization injections are removed.

The pinned 1.26.51.1 callback `1495e44e0` accumulates each flow in float.
Its squared length uses `z*z + (y*y + x*x)` in that instruction order.
It preserves zero-sum motion and normalizes nonzero currents at length `0.0001F`.
Separate float multiplication and addition update motion.
The full native callback passes 1,962 controlled executions with supplied world/contact observations and cell-flow vectors.
The production Java calculator matches all 654 admitted cases exactly, including sign bits.
Three Java tests retain numeric, threshold, cancellation, and reset regressions.

Per-cell flow generation, native contact gates, cell enumeration, mixed water/lava selection, loading, and phase scheduling remain incomplete or unverified.
These fixtures verify the named arithmetic and do not simulate the complete native world.
The [coverage ledger](../../../docs/bedrock-coverage.md#liquid-current-accumulation-and-strengths-october-6-2026) records live route results and remaining requirements.

Rebuilt direct and ViaProxy clients reach actual strict-BDS spawn.
Idle current cases pass on both routes, and both plain-water cases contain 22 controlled input frames without corrections during input.
A rebuilt fresh-channel fixture places its source through a server command.
Its ViaProxy run records 236 water/flowing samples and about 6.2 blocks of downstream displacement, with no correction after the final fixture teleport.
Current onset produces two nonzero corrections in a separate ViaProxy recording.
Joining beside the older channel wall produces 99 earlier corrections, with positive client current motion against server-cleared horizontal motion.
That wall/collision/loading gap remains required work; the arithmetic fix does not establish complete movement parity.
Core passes 700 tests with 19 optional skips; the add-on passes 478 tests with 114 optional skips.
Both stacks pass replay, build, and Checkstyle. CubeConverter passes 16 tests, and ViaProxy builds with the shared calculator embedded.
The TypeScript check, pack build, and all 135 tooling tests pass.


## Rounded-teleport collision contacts

Core `CollisionContact` now owns the clipped-motion output of native contact kernel `0x143327d80`.
It uses target 1.26.51.1 float32 bounds and the inclusive contact-distance threshold `0.000001F`.
The add-on supplies each actual voxel-shape box and applies the result on Bedrock sessions.
Separate boxes retain their gaps; unblocked motion retains its original Java boundary value.

Production Java matches 8,270 executions of the original native kernel with zero float-bit mismatches.
Three core tests cover six faces, motion away, signed zero, threshold boundaries, corners, overlap, and degenerate obstacles.
Two add-on tests cover the rounded channel-wall position and gaps between separate boxes.

The unfixed strict-BDS direct recording has 1,423 input frames and 152 corrections after the controlled rounded teleport.
A read-only runtime probe confirms the wall and full collision shapes are present while Java admits current-driven penetration.
The rebuilt direct recording has 1,427 input frames, the same teleport, and zero corrections.
It includes 22 backward-input frames away from the wall and 22 forward-input frames against it.
Live shape queries return zero approaching displacement while retaining motion away from the face.

Core passes 703 tests with 19 optional skips; the add-on passes 480 tests with 114 optional skips.
CubeConverter passes all 16 tests, both Java stacks pass Checkstyle, and the complete core/add-on/ViaProxy stacks replay and build.

Native axis order, obstacle order, overlap recovery and state, final box/position stores, and stepping remain incomplete.
Complete fluid phases and world shapes, correction replay, Boar, CubeCraft, platform joins, and the full complex gameplay matrix remain required.
The [coverage ledger](../../../docs/bedrock-coverage.md#native-collision-contacts-after-rounded-teleports-october-6-2026) records route evidence and the remaining scope.

The rebuilt ViaProxy comparison also reaches strict-BDS spawn and sends 1,618 input frames with zero corrections.
It includes the same rounded teleport, 22 backward-input frames, 22 forward-input frames, and later idle current contact.
Both routes verify this regression; complete native collision and the full gameplay matrix remain required.

## Native player step height

The target 1.26.51.1 player constructor reaches shared initialization that sets `MaxAutoStepComponent` to `0.5625F`.
Core sends this value through Java's ordinary step-height attribute at join, respawn, and dimension changes.
This reaches direct and ViaProxy clients without a new add-on payload.
It does not create a synthetic Bedrock attribute or change mounted creature heights.

The original constant load, complete setter lookup/store, and complete getter lookup/load pass 1,024 CPU execution cases.
The constructor call chain is verified from original instructions.
Fixtures supply the hash registry and existing ECS storage.
Full constructors, later component updates, variable creature heights, and world stepping remain outside this comparison.
A packet regression test verifies the attribute value, modifiers, entity identity, repeated delivery, and unchanged native attribute state.

The [coverage ledger](../../../docs/bedrock-coverage.md#native-player-step-height-october-6-2026) records route checks and remaining collision requirements.
This fixes the player height limit; native obstacle order, step selection, overlap recovery, and collision history still need implementation.

Rebuilt direct and ViaProxy clients reach actual strict-BDS spawn.
A read-only runtime probe verifies exact step-height bits at spawn, after death/respawn, in the Nether, and after returning on both routes.
The direct journal contains 1,784 auth-input frames and four corrections during Nether fixture placement.
The proxy journal contains 2,477 auth-input frames and six earlier spawn-current corrections.
Controlled walking has no corrections on either route.
Those setup and fluid/prediction gaps remain open.
Core passes 704 tests with 19 optional skips, the add-on passes 480 tests with 114 optional skips, and CubeConverter passes 16 tests.
Both Java stacks pass Checkstyle; core, add-on, converter, and ViaProxy stacks replay and build.

## Grounded correction verification, October 6, 2026

Both rebuilt routes complete actual spawn and finish normally against strict BDS 1.26.51.1.
The direct route sends 819 auth-input frames and receives four corrections.
ViaProxy sends 821 frames and receives six corrections.
Each recording includes two airborne motion corrections and one later grounded motion correction.
Other corrections carry zero motion around startup or fixture placement.
All three Piercing controls pass on each route.

Runtime snapshots match the authoritative grounded state before local physics after each nonzero correction.
Both airborne corrections on each route apply horizontal drag of about 0.91 on the next frame.
Each grounded correction applies drag of about 0.546.
The earlier direct recording incorrectly uses 0.546 after its first airborne correction.
These observations verify the grounded-state fix in these cases.
They do not establish correction-free movement or complete prediction parity.

Core passes 706 tests with 19 optional skips, and the add-on passes 480 tests with 114 optional skips.
CubeConverter passes all 16 tests.
Both complete patch stacks replay, all four project builds pass, and the TypeScript check passes.
Native GPU execution remains blocked by the current-boot guard.
Fresh native comparisons, rewind, resimulation, vehicle reconciliation, and the full gameplay matrix remain required.

## Corrected sine-table reference

The shared table now uses the pinned constructor's float division instead of a rounded reciprocal.
Reexecuting 8,732 boosted and unboosted glide cases matches every production float output.
One portable slow-falling expectation changes by one bit.
The native cases retain supplied CRT remainder, status slots, boost components, and the corrected table.
The Windows follow-up below replaces that supplied sine boundary. Live movement comparisons and the complete gameplay matrix remain open.

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

## Confirmed geyser movement and local Java lift, October 7, 2026

 Core owns the geyser calculation and confirmed effect timeline.
The add-on supplies local block, fluid, and collision observations at the start of player travel.
It excludes the local Bedrock player from Java's geyser launch ticker, including its fall-distance reset.
The existing movement-effect channel carries confirmations through direct and ViaProxy connections.

The pinned 1.26.51.1 callback `146655f00` checks the Flying ability and scans the body-center block column.
It queries 24 downward cells and then considers the following cell as a final candidate.
Only erupting or continuous potent sulfur qualifies.
One to four contiguous source-water cells select speed limits `0.4F`, `0.5F`, `0.6F`, and `0.7F`.
Extra-layer water counts only when the main collision box is empty.
A colliding cap or source liquid above the column rejects the boost.
This source-liquid check includes lava.
Below the selected height limit, motion below its speed limit gains `0.2F`.
The check precedes addition, so the resulting motion can exceed that speed limit.

 The original callback and helpers `149951440`, `1499514e0`, `1499518f0`, and `1430167b0` execute unchanged.
All 6,780 controlled cases match the production Java result bit for bit.
Fixtures supply block lookup, collision AABBs, dispatch, floor rounding, component storage, and packed block properties.
Native property lookup, Flying admission, profile selection, cap checks, and the motion update execute inside the original instructions.
Cases include inactive effects, all sulfur states, both water layers, source and flowing liquids, obstructions, negative coordinates, and speed limits.
Portable tests retain scan, height, overshoot, effect-lifecycle, and fluid-adapter controls.

**Incomplete or unverified:** These checks do not establish complete native world trajectories or client phase ordering.
Speculative local geyser admission, server confirmation timing, native fall-distance behavior, correction replay, and live boosted route comparisons remain required.
Stock Java motion, mixed fluids, vehicles, Boar, CubeCraft, platform joins, and the full gameplay matrix also remain in scope.
Private executable, Ghidra, and fixture evidence stays under `.stackanvil/research/geyser-boost/`.

**Regression checks:** The full core suite reports 787 tests with no failures or errors; 19 optional fixture tests skip.
The add-on reports 605 tests with no failures or errors; 117 optional fixture tests skip.
All three new client fluid-adapter tests execute.
Core and add-on patch replay and standalone PR checks pass.
ViaProxy builds against the updated core.
All 1,249 embedded core files match in both client and proxy bundles, excluding their bundle-specific manifest.

The current client spawns through ViaProxy on strict BDS 1.26.51.1 and remains connected for 20 seconds.
An ordinary Java 26.3 connection also completes the same stability check.
Runtime inspection confirms that both the sulfur ticker wrapper and the player travel injection transform their intended classes.
These connection checks do not exercise an active geyser or establish ordinary Java geyser motion.

## Local geyser admission investigation, October 7, 2026

**Observed failure:** The strict BDS fixture sends geyser effects with tick `0` and duration `100`.
Before this change, all ten observed confirmations had no client-frame binding.
None of the 173 observed travel calls had an active local geyser effect.
Upward server corrections did not prove local geyser physics worked.

**Implemented:** Core now reproduces local sulfur admission and the 100-frame effect refresh.
The add-on supplies actor bounds from the sulfur block ticker before Java checks its launch range.
Admission uses strict overlap with a one-block-wide column, from the sulfur base to `baseY + 6 * waterDepth`.
This range differs from the subsequent body-center lift check and its upper limit.
Refresh preserves longer and infinite active effects.
The local Bedrock actor still skips Java's launch impulse and fall-distance reset.

**Native evidence:** The original `144ae5140` producer and water-column helpers produced all 32 expected admission AABBs.
Cases cover both active sulfur states, all four profiles, negative coordinates, and large coordinates.
The fixture supplies block getters, collision boxes, dispatch, and client-level access.
Execution stops at the actor query. It does not execute native actor selection, scheduling, or complete world motion.
The existing 6,780 native lift cases still match the refactored core rule.

The native incoming handler `14133f140` applies effects directly to actors without replay state.
With replay state, `143281540` adjusts durations and `142890810` dispatches history commands.
Tick zero does not select a universal receipt-time deadline in this path.
The production timeline still needs complete confirmation-command replay and native phase verification.
Local admission fixes a separate missing production step.

**Regression checks:** The core build passes 790 tests, with 22 optional skips and no failures or errors.
The complete add-on build passes 605 tests, with 117 optional skips and no failures or errors.
The core native geyser reference test executes.
Both patch stacks replay, ViaProxy builds, and all 1,249 embedded core files match both bundles.
Artifact dry runs review nine exact replacement paths. Every replacement preserves the other 32 inventory entries.
Private rollback copies remain under `.stackanvil/research/geyser-live/artifacts/build-rollback/`.
Private client rollback copies remain under `.stackanvil/research/geyser-live/java-client-rollback-5/`.

**Live verification:** The current client joined strict BDS 1.26.51.1 through ViaProxy and stayed connected for 20 seconds.
The observer recorded 375 paired travel phases, including 89 active geyser phases and 36 velocity changes.
Every changed velocity matches the native float addition of `0.2F` bit for bit.
After the server removed the source, all 276 control phases left vertical velocity unchanged.
The retained effect was active for the first 20 control phases and inactive from completed frame 118 onward.
The observer supplied no client effect, input, or velocity values.
These observations verify this local lift path. They do not establish complete native trajectories or correction replay.

The fixture starts with an inactive source and waits for the client frame clock before activating the geyser.
An earlier driver activated the source before loading finished. BDS lifted the actor outside the admission range before observation began.
The final inventory contains the same 11 files. Only the launcher launch-time field and game log changed.
The private display and owned processes stopped. Both existing user servers retain their original process identities.

**Still required:** Complete native trajectories, actor selection, phase ordering, fall distance, history replay, and delayed confirmations.
Direct route comparisons, stock Java movement, mixed terrain, vehicles, Boar, CubeCraft, and actual platform joins remain required.
The full gameplay matrix and all other goal requirements remain open.
Private evidence remains under `.stackanvil/research/geyser-live/`.

## Native movement-effect command ordering, October 7, 2026

**Observed failure:** The native removal, activation, and infinite-effect sequence produced three different results from the old production timeline.
Core rejected each older confirmation because it retained the latest packet tick as an ordering timestamp.
A bounded comparison also found 720 differences across 1,944 synthetic command states.
This comparison covers component state. It does not count reachable gameplay failures or establish full movement parity.

**Native evidence:** The pinned 1.26.51.1 binary passes 16,038 constructor and application cases.
The original functions are `143281540`, `143298740`, and `143298970`.
They clamp durations below `-1` to zero and preserve infinite duration `-1`.
Finite adjustment uses unsigned tick comparison and signed 32-bit subtraction.
A change between active and inactive state forces application despite an older ordering timestamp.
Application clears that timestamp. Local prediction can set it again.

The original `142890810` dispatcher passes 3,521 cases with missing, partial, and complete fixture history.
It clamps selection to the oldest retained tick, distinguishes history and fallback paths, and marks the next retained frame dirty.
The original packet tick remains in the command after this selection.
A combined fixture passes 6,144 cases through the constructor, dispatcher, live application, and `142bbcd70` ring insertion.
It preserves each command's virtual table and records insertion into retained frames or the pending command vector.
A tick-zero command with duration 100 and clock 53 retains duration 47 in this fixture.
Tick zero therefore does not imply either permanent inactivity or a fresh receipt-time duration of 100.

The fixtures supply allocation, component storage, dispatch, preallocated frame arrays, and a replay-controller result.
They do not execute complete rewind, later queued callbacks, native actor creation, scheduling, or world trajectories.
Private evidence remains under `.stackanvil/research/movement-confirmation/`.

**Implemented:** Core now separates a local prediction frame from the confirmation's wire tick.
Mapped confirmations can force a state transition and clear local ordering state after admission.
Older confirmations no longer fail a blanket latest-packet-tick check.
Core snapshots retain packet arrival order.
Infinite effects remain active without a frame binding because they require no expiration deadline.
A finite effect with an unknown frame still requires an explicit input-clock reference for native duration adjustment.
The existing add-on consumes the shared core timeline.

**Verification:** The same stateful native countdown sequence now matches all four production observations.
Tests cover older removal, older activation, infinite duration, local prediction protection, forced transitions, and packet arrival order.
The owning core patch contains the fix. The full stack replays all 97 patches.

**Still required:** Transport the explicit native input-clock reference and retain commands for full history application.
Reproduce missing-frame, evicted-frame, future-tick, wraparound, and replay-controller behavior.
Verify correction replay, phase ordering, complete native trajectories, direct connections, and ViaProxy under latency.
Keep stock Java, vehicles, mixed terrain, Boar, CubeCraft, actual platform joins, and the full gameplay matrix in scope.

**Build and live regression:** Core passes 791 tests, with 22 optional skips and no failures or errors.
The add-on passes 605 tests, with 117 optional skips and no failures or errors. ViaProxy also builds.
Both upstream PR checks pass. All 1,250 core files match the client and proxy bundles, excluding each bundle's manifest.
A fresh strict BDS join through ViaProxy stays connected for 20 seconds.
The observer records 375 paired travel phases, 89 active geyser phases, and 36 bit-exact native float lift changes.
All 278 phases after source removal leave vertical velocity unchanged. The retained effect subsequently expires.
This check verifies the existing lift path after the ordering change. It does not verify complete native replay.

Dry runs review nine exact artifact replacements and the managed client fixture.
Each artifact replacement preserves the other 32 inventory entries.
The final client inventory contains the same 11 files. Both managed add-on copies match the reviewed artifact.
The launcher changes only its launch-time field and game log. Seven other inventory files remain unchanged.
Rollback copies remain under `.stackanvil/research/movement-confirmation/artifacts/build-rollback/` and `.stackanvil/research/movement-confirmation/java-client-rollback-1/`.
The private display and owned processes stop. Both existing user servers retain their original process identities.


## Past movement effects without a retained frame, October 7, 2026

**Implemented, with remaining replay gaps:** Core retains the latest emitted input tick and its matching completed client frame.
An input without a matching prediction invalidates the frame binding. Canceled inputs do not create clock references.
The negotiated `viabedrock:movement_effect_v2` payload carries this pair for the local player, plus the original effect and exact history binding.
The existing add-on reads the shared core codec and timeline. This state also travels through ViaProxy.

For past confirmations, core uses unsigned tick ordering and the native signed 32-bit duration calculation.
It then ages the remaining duration from the paired frame. It does not invent an evicted frame identity or a receipt-time deadline.
Tick-zero startup effects can remain active, and long effects can survive eviction of their original frame.
Repeated snapshots do not renew duration. Local geyser admission preserves a longer adjusted remainder.
An expired confirmation can force removal of a locally predicted effect.

**Native evidence:** The pinned 1.26.51.1 executable again passes all 16,038 constructor and application probes.
The production duration calculator matches every constructor result, including signed duration overflow and unsigned 64-bit tick boundaries.
The native reference test executes locally. These probes do not execute complete world movement or history rewind.
Private evidence remains under `.stackanvil/research/movement-clock/`.

**Regression checks:** Core passes 795 tests, with 22 optional skips and no failures or errors.
The add-on passes 605 tests, with 117 optional skips and no failures or errors. ViaProxy also builds.
The full core stack replays 97 patches. Both upstream PR checks pass.
All 1,250 core files match the add-on and proxy bundles, excluding the manifest.
The fix stays in the owning core patch; no add-on source change or later repair patch is necessary.

**Still required:** Unbound future commands, invalidated clock bindings, queued command application, replay-controller scheduling, and complete physics rewind.
Confirm actor replay-component creation and native simulation phase ordering.
Verify delayed confirmations, gaps during client/server tick stalls, and complete native trajectories through direct connections and ViaProxy.
Keep stock Java, vehicles, mixed terrain, Boar, CubeCraft, actual platform joins, and the full gameplay matrix in scope.


**Live transport regression:** A fresh strict BDS 1.26.51.1 join through ViaProxy stays connected for 20 seconds.
The observer records all seven effect fields in 12 confirmations. Every confirmation includes a paired input clock.
The input tick is 33 ahead of the paired client frame. Receipt observes zero or one additional completed frame.
These observations verify transport of distinct clock identities. They do not verify complete delayed-command replay.
The run records 368 paired travel phases, 90 active geyser phases, and 36 bit-exact native float lift changes.
All 269 phases after source removal leave vertical velocity unchanged. The retained effect subsequently expires.
The observer supplies no client effect, input, or velocity values.

Artifact dry runs review nine exact replacements. Each replacement preserves the other 32 inventory entries.
The client dry run reviews 2,689 fixture/helper source files and 11 existing client inventory files.
The final client inventory still contains 11 files. Both managed add-on copies match the reviewed artifact.
Only those copies, the launcher launch-time field, and the game log change. The seven other files remain unchanged.
Rollback copies remain under `.stackanvil/research/movement-clock/artifacts/build-rollback/` and `.stackanvil/research/movement-clock/java-client-rollback-1/`.
The private display and owned processes stop. Both existing user servers retain their original process identities.

## Future commands and native queued effect replay, October 7, 2026

Future effects use the paired input frame immediately and retain their full native duration.
A future command can replace local prediction when its clock reference is at or after the predicted frame.
Repeated snapshots keep their original expiration anchor. Unpaired and older clock references remain incomplete.
This change removes all 24 activity mismatches in 210 sampled native live applications.

The combined fixture executes 420 cases against the pinned 1.26.51.1 executable.
Across 300 replays, it executes 489 original queued callbacks and 1,131 original countdowns.
An expired command can regain duration through clamped history replay. Production still requires original-duration restoration and complete physics rewind.
The 21 pending-command cases stop before a subsequent frame drains their commands. Their intermediate states do not establish final game behavior.
Snapshot storage, input boundaries, and some rewind requests come from the fixture. Complete native world movement remains unverified.

Core passes 796 tests, including the existing 16,038 native effect cases and 6,780 native geyser vectors.
The add-on passes 605 tests. ViaProxy builds, 97 core patches replay, and both upstream PR checks pass.
All 1,250 core files match both downstream bundles, excluding the manifest.
The live strict BDS join through ViaProxy stays connected for 20 seconds.
It records 36 exact float lift changes and 280 unchanged phases after source removal, followed by effect expiration.
No add-on source change or later repair patch is necessary.

The [coverage ledger](../../../docs/bedrock-coverage.md#future-commands-and-native-queued-effect-replay-october-7-2026) records rollout inventories and remaining parity requirements.

### Native pending-command transfer

A further 42 native cases execute the original frame-capture function after dispatch and replay.
It transfers pending commands into the next retained frame, preserves the input object, marks the frame dirty, and clears pending entries.
Thirty positive or infinite commands trigger original queued application and countdown. Twelve zero-mask commands do not trigger replay.
The transfer and bounded component-state expectations match all 42 cases.
The fixture supplies snapshot and input boundaries and uses spare ring capacity.
Ordinary movement for zero-mask commands, ring growth, eviction, irregular clocks, full ownership, and complete world movement remain unverified.
The [coverage ledger](../../../docs/bedrock-coverage.md#subsequent-native-frame-capture-and-pending-commands) records the evidence and remaining production replay work.

### Native capture clocks and history boundaries

The original capture caller obtains its clock through a level virtual method and fills retained input after frame capture.
A new 344-case native fixture verifies caller guards, input fill, eviction, clock gaps, unsigned wrap, and physical ring growth.
It also executes 216 original queued callbacks and countdowns after capture.
Nonconsecutive clocks reset history. MAX-to-zero remains contiguous. Pending active commands preserve original duration through these changes.

The fixture supplies registry/input boundaries and allocator operations. Growth binds imported CRT copy/fill operations.
It does not verify complete native ownership, world physics, or scheduler phase ordering.
The production tick/frame mapping remains distinct from ordered simulation history.
Actual snapshot/input/command replay and client physics integration remain required.
The [coverage ledger](../../../docs/bedrock-coverage.md#native-frame-capture-clocks-and-history-boundaries-october-7-2026) records the complete evidence scope.

### Native replay dispatch and immutable identity

A further 2,396 native cases verify the original manager, replay callback, and immutable identity capture.
They execute 416 system callbacks and 2,054 snapshot insertions without mismatches in the bounded expectations.
Dispatch follows the supplied category's ordered indices. Optional hooks surround each system's replay method.
The immutable snapshot preserves actor identity and classification. It does not replace mutable movement snapshots.

Fixtures supply category membership, system implementations, ECS storage, and ownership boundaries.
The game's registered movement order, profiling mode, complete physics replay, and live correction behavior remain unverified.
Ordered mutable snapshots, external state, captured input, and queued commands remain production requirements.
The [coverage ledger](../../../docs/bedrock-coverage.md#native-replay-dispatch-and-identity-snapshots-october-7-2026) records evidence and remaining verification limits.

### Confirmed effects before native countdown

Original client registration constructs 367 systems, including 215 in correction movement.
Geyser movement precedes effect countdown. Native one-tick confirmations lift once, then expire.
The shared core timeline now ages confirmations at the completed frame and keeps local admission in the next physics step.
Repeated snapshots retain their original expiration anchor. No add-on source change or later repair patch is necessary.

New regression tests fail on the previous code. Core passes 798 tests with no failures or errors and 22 optional skips.
Twenty positive or infinite native cases compare directly against the production timeline.
The combined native fixture executes 32 cases, 160 steps, and 34,400 registered system dispatches.
Other system bodies, ECS iteration, allocator operations, and world inputs remain fixture boundaries.
Zero-duration packet phase behavior, complete ownership, native clock synchronization, full physics rewind, and both-route gameplay verification remain required.
The [coverage ledger](../../../docs/bedrock-coverage.md#bundle-actions-flight-state-names-and-flat-lighting-october-7-2026) records the flight implementation and remaining evidence requirements.

The add-on passes 605 tests. ViaProxy builds, and all 1,250 core files match both downstream bundles, excluding the manifest.
The strict BDS join through ViaProxy stays connected for 20 seconds.
The observer records 36 exact float lift changes, 275 unchanged phases after source removal, and subsequent effect expiration.
The saved full stack reproduces the tested source tree.
The coverage ledger records exact artifact replacements, preserved inventories, rollback paths, and remaining verification requirements.

### Native effect presence and captured input

The original mutable snapshot path retains effect-component presence without copying the effect vector.
New native checks pass 128 snapshot cases and 126 captured-input cases.
Captured input preserves selected timestamps, durations, and types under input flag `0x100`.

The corrected combined fixture passes 168 cases and executes 189 registered physics steps.
Queued commands execute before historical input. Enabled input overwrites the command in 42 controlled cases.
Stored-but-disabled records match absent-input controls.
A separate handler fixture passes 112 cases and 336 registered movement steps.
Independent replay-frame, effect-state, float-lift, and countdown expectations match the recorded results.

Historical input records, ECS discovery, ownership, and other world physics remain supplied fixture boundaries.
Earlier full effect-snapshot substitutions do not establish native restoration semantics.
No production source changes follow from this research alone.
Ordered command/input replay, actual client rewind, zero-duration scheduling, and both-route gameplay verification remain required.
The [coverage ledger](../../../docs/bedrock-coverage.md#native-effect-snapshots-and-captured-input-october-7-2026) records the functions, controls, and evidence limits.

### Native-generated effect input and production replay audit

The original admission helper passes 4,704 cases, including virtual client capture and materialized server packets.
An extended producer fixture passes 1,792 cases through original actor admission and input capture.
Successful client refreshes record into the matching retained input. Longer or infinite durations prevent refresh and capture.
Missing input preserves admission without creating a captured record.

The combined 336-case fixture generates historical records through native admission.
It verifies current source changes, command/input order, countdown, and bounded registered movement.
Independent expected states match 2,016 historical steps and 378 replayed steps.
The published core matches immediate confirmation duration activity in all 336 cases.
It differs after 28 of 84 historical rewinds, including 14 source-removal cases.
All 1,250 core files match both downstream bundles, excluding the manifest.

Source eligibility, clocks, ECS discovery, ownership, and non-effect snapshot callbacks remain fixture boundaries.
Full historical physics, clock advancement/alignment, zero-duration scheduling, and both-route verification remain required.
This continuation changes research ledgers without changing production source or runtime artifacts.
The [coverage ledger](../../../docs/bedrock-coverage.md#native-generation-of-effect-input-and-remaining-replay-gaps-october-7-2026) records the native paths and production gaps.

### Native player-input clock source

Original tick advancement publishes the level clock into `CurrentTickComponent`; the player-input builder reads that value.
Retained-frame capture executes through the canonical level clock getter without an offset.
All 90 new native cases pass. Original `Client Tick` metadata getter/setter checks pass in 56 builder cases.
Fixtures supply registry storage, ownership helpers, and pre-tick world callbacks. Raw wire encoding and ordinary scheduling remain unverified.
Production still needs ordered command/input history, exact Java frame bindings, and full physics replay.
The existing 28 replay mismatches remain unresolved. No production source changes in this continuation.
The [coverage ledger](../../../docs/bedrock-coverage.md#native-player-input-and-retained-history-clock-october-7-2026) records the evidence and remaining requirements.

### Native creative and spectator flight, October 7, 2026

Core now retains raw game mode, inherited level mode, independent vertical flight speed, and native friction and drag modifiers.
It sends a versioned snapshot after joining and refreshes it after mode, ability, metadata, and attribute changes.
The add-on uses the shared calculation after collision resolution and preserves ordinary Java movement.
Normal jump and sneak requests use their native input fields. Independent slow requests have no Java bindings.

The matching Bedrock 1.26.51.1, protocol 2193 control routine passes 18,000 bounded comparisons.
Its drag and friction routines pass another 3,456 bit-exact comparisons.
An eight-step native sequence covers mode, request, speed, modifier, and legacy-friction changes.
Targeted tests cover wire serialization, state changes, channel and join gates, and reconnect defaults.

These checks establish the bounded calculation and snapshot behavior.
They do not establish full flight trajectories, collision ordering, historical replay, strict BDS or Boar parity.
The add-on still depends on client observations for block friction and collision results.
Live flight and corrections through both routes remain required.

Final direct and ViaProxy runs, with plain graphics and Iris, verify the actual local flight context, production identities, and merged movement handlers. The corrected cutoff hook starts without an injection conflict. These observations do not drive flight or establish live trajectory parity.
The [combined runtime record](../../../docs/bedrock-coverage.md#final-combined-runtime-verification) retains the complete scene gates and remaining requirements.

### Swimming and jump state during flight

Native startup registers vertical flight control, jump eligibility, then swimming control.
Core now preserves that calculation order and separate float operations for vertical swimming velocity.
Flying suppresses the physical jump flag while retaining raw jump requests for flight control.
The add-on retains the actor swimming state during negotiated local Bedrock flight.
Its composable hooks preserve ordinary Java, remote actors, passengers, and context-loss behavior.

The production core helper matches all 3,072 native swimming cases bit for bit.
Twelve stateful native steps cover flight transitions, simultaneous requests, water state, and retained velocity.
Targeted tests cover calculation order, lifecycle gates, and the actual add-on assignment.
The full builds pass: 830 core tests and 495 add-on tests pass; 30 and 117 existing optional cases skip, respectively.
ViaProxy builds. Both downstream artifacts contain all 1,260 core entries unchanged, excluding the JAR manifest.
All owning patches replay cleanly.

Actual transformed startup passes with the new swimming and jump hooks on all four routes.
Direct and ViaProxy runs pass the complete recorded scene with 216 skins and all 31 controllers.
Both Iris runs pass shader disable, enable, and resource reload with native and ordinary lighting controls.
Plain rendering also passes directional light and actual model-dispatch controls.
The earlier rendering runs retain their different artifact identities.
Ordinary non-flying input eligibility, native look and material producers, complete collision physics, and live trajectories remain required.
The [coverage ledger](../../../docs/bedrock-coverage.md#swimming-and-jump-state-during-flight) records the evidence and remaining limits.

### Swimming pitch lookup

Core now owns the swimming look-Y calculation from current and previous float pitch.
It preserves the wrapped angle, negative float radians, and shared Windows sine lookup.
The add-on uses this helper only during negotiated local swimming flight.

The original Bedrock 1.26.51.1 callback `1490c0a00` passes 26,660 comparisons with supplied player pitch and previous pitch.
Both flying and ordinary swimming calculations match every look and motion bit.
The fixture reuses the exact table from the complete game initializer linked to official Windows UCRT `10.0.26100.9444`.
Actual Java 26.3 `Mth` differs in 17,364 resulting motion values across these boundary controls.
The largest flying difference is approximately `0.000125274` blocks per tick.
These controls deliberately sample rounding boundaries. Their counts do not estimate the frequency of differences during gameplay.

Targeted tests distinguish previous-pitch rounding, positive and negative lookup entries, flying amplification, and ordinary descent.
The native fixture supplies rotation fields, actor flags, breathing material, imported remainder, and initial motion.
Rotation-component construction, scheduling, material production, collision, and live strict BDS trajectories remain separate requirements.

Combined build verification: core passes 837 cases with 30 optional skips.
The add-on passes 495 cases with 117 optional skips. ViaProxy passes four cases.
Both downstream artifacts preserve all 1,260 core content files, excluding the JAR manifest.
The final core JAR also matches all 26,660 original callback comparisons.
Private artifact snapshots retain these exact build identities before the separate inventory repair.
No installation or runtime joins occur in this verification.

### Completed position and correction lifecycle

Java 26.3 `LocalPlayer.sendPosition` omits position packets when displacement is at most 0.0002 blocks and the reminder count is less than 20.
The add-on still sends the completed frame's float feet position and motion after `sendChanges`.
Core previously paired that fresh motion with the last standard Java position.
A raw packet regression reproduces stale X/Z for a completed displacement of `(0.0001, 0, -0.0001)`.

Core now applies the matching completed position before it advances tick history.
Matching retains the existing per-axis tolerance: the greater of `0.001F` and twice the tracked coordinate's float ULP.
Frame IDs remain strictly increasing for the connection lifetime, including rejected and consumed frames.
Each tick consumes at most one pending frame.

Position application requires a live, spawned player outside a dimension change, without a supported predicted vehicle.
The shared `preMove` checks preserve position-sync waits, current and destination chunk admission, and the existing single-update exception after authoritative teleport acknowledgement.
An unchanged completed position can supply motion, but it still passes these admission checks.
The existing `1.62F` feet-to-origin conversion remains unchanged.

Authoritative `setPosition` discards only unconsumed physics.
This prevents a frame recorded before a tiny correction from surviving the coordinate tolerance and replacing corrected position or motion.
The frame watermark and emitted input-tick history remain intact.
A discarded frame cannot rebind through a replayed payload, while a fresh post-correction frame remains usable.
Supported predicted-vehicle and dimension-change frames retain their clock mappings without applying player position or motion from the completed frame.

The existing revision-seven payload contains the required position fields, so the channel and codec identity remain unchanged.
The same core packet handler serves direct and ViaProxy connections.
Ordinary Java clients retain standard movement and the existing velocity approximation.

Verification covers 14 actual packet cases, including idle, reversal, replay, mismatched coordinates, missing frames, chunk loss, signed correction acknowledgement, mounting and dimension changes.
The cases also cover authoritative corrections, mode changes, dead and unspawned players, and float conversion boundaries.
Two unchanged-source negative controls reproduce stale coordinates and stale physics after a tiny correction.

Fourteen original native instruction cases confirm that the target sender copies current StateVector XYZ into `mPos` and velocity XYZ into `mPosDelta`.
These cases use valid sparse/dense generations zero and one, with supplied current, previous and velocity fields.
The fixture supplies the typed pool lookup and stops before the remaining sender fields and full serializer.
It does not establish live native height, pose, collision, rewind orchestration or trajectory equivalence.

All 98 core patches replay without conflicts.
The combined clean build and all Checkstyle tasks pass: 941 tests pass, 30 existing cases skip, and no cases fail.
The candidate JAR remains private.
No installation, direct or ViaProxy gameplay run, strict-BDS trajectory comparison, or native GPU session occurs in this verification.
Input-history resimulation and native height, breathing-material and camera input equivalence remain separate requirements.
Other passenger types and vehicle control ownership need separate admission and native movement comparisons.
