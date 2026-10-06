# Completed player prediction frames

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
