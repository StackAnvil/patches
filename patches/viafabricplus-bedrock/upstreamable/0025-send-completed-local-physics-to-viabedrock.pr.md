# Send local player prediction to core

## Purpose

Send completed local physics through the negotiated ViaBedrock prediction channel.
Sample only the local player after standard Java movement and before the tick-end packet.
Send stationary frames too, so motion and swimming state do not depend on sparse position updates.

The payload carries position, motion, swimming state, completed collision axes, and the ground-jump event.
Core validates the sample and builds Bedrock auth input on direct connections and through ViaProxy.
The add-on supplies local fluid physics; core owns server correction translation.

Remove the former Entity-wide swimming hook.
That hook required a local core tracker and could forward another entity's swimming transition as local input.
Core now tracks transitions from the completed local frame.

## Target evidence

Private native 1.26.51.1 protocol 2193 captures against strict BDS expose the outgoing fluid-motion mismatch.
At matching idle-water positions, native motion is about -0.022315647 while the old core reports about -0.0996117.
Java 26.3 bytecode establishes the sample's position between completed physics, normal movement, and the tick-end packet.

## Testing and limits

Core tests cover the versioned payload, invalid samples, single-frame consumption, teleport staleness, and swimming events.
The full build passes, including 629 core tests and 603 add-on tests, with no failures or errors.
Live direct and ViaProxy strict-BDS comparisons match the native water-idle motion field within about 2e-9.
Both routes complete jump, fall, and water cases without corrections in the controlled water cases.
Startup and elevated-teleport corrections remain.
A ViaProxy sprint-swim case emits one start and one stop event without an additional correction.
A native capture confirms the swimming start and stop values.
The revised direct and ViaProxy start frames match native. The release comparison is recorded separately.
Fluid currents, lava, effects, vehicle physics, and the remaining movement matrix still need native comparisons.

## Swimming start timing

The native sprint-swim capture emits `StartSprinting` and `StartSwimming` together on the first movement frame.
The first forward motion is 0.01764 blocks per tick.
The initial Java sample emits the swimming event one frame later, at motion 0.033516.
Java updates swimming before `aiStep` computes sprinting.
Refresh the local swimming state after sprint changes and before fluid travel on Bedrock connections.
Direct and ViaProxy strict-BDS runs match the native first frame's flags and forward motion without corrections.
Native emits swimming stop on release and sprint stop on the following frame.
The initial Java implementation emits both together and retains horizontal collision on the first release frame.
The revised release implementation is described next.

## Swimming release physics

Repeated native 1.26.51.1 captures establish the same release order at a wall and in open water.
On forward release, native stops swimming and retains sprint drag for that frame.
It stops sprinting on the next frame and applies walking drag.
In open water, forward motion changes from 0.172425985 to 0.155183390, then 0.124146715.
Those changes use the native 0.9 and 0.8 drag factors, respectively.

Releasing the sprint key while holding forward does not stop swimming.
Releasing forward while holding sprint preserves the same two-frame stop order.

Move the local swimming update after sprint decisions and before fluid travel.
Sprint decisions therefore observe the completed swimming state from the previous frame.
Forward release updates the current swimming pose without prematurely changing sprint drag.
Other sprint restrictions remain active.
The change adjusts actual local physics; core still constructs the protocol events from completed frames and Java sprint commands.
The payload also includes completed collision axes on stationary frames.

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

## Surface exit physics

The native protocol 2193 reference includes upward swimming at about 30, 35, and 45 degrees.
Native teleports quantize the first two pitches to -29.998169 and -34.996948 degrees.
The comparison uses those recorded angles rather than the original command values.

At 30 degrees, native caps height and clears vertical motion on the first stationary capped frame.
The Java trajectory already matches that behavior within float rounding.
At steeper angles, Java initially remains swimming for one extra frame at the water boundary.
Its negative vertical inset reverses the short swimming box, and the AABB constructor swaps the bounds.
Clamp the inset to half the box height so it stays symmetric and cannot invert.
The box test covers short and tall heights, including zero height, without changing horizontal bounds.

Java also treats the old visual swimming pose as crawling on the surface-exit frame.
That applies a 30% input multiplier before the visual pose updates.
Ignore this transient crawling classification when the previous completed state is swimming.
Retain sprinting in shallow water, subject to the existing food, mobility, item, and vehicle restrictions.
Native keeps sprinting while it falls back into water with forward and sprint held.

The revised direct and ViaProxy routes match exit flags and motion before re-entry at all three angles.
The largest vertical position difference is about 0.000031 blocks.
Both completed route recordings have five corrections during early re-entry in the steeper cases.
**Incomplete:** Re-entry begins one or two frames early at steeper angles and still receives strict-BDS corrections.
These changes do not establish full fluid or correction parity.

## Native swimming re-entry condition

Inspection of the matching Windows 1.26.51.1 executable identifies `SwimTriggerSystem` and `PlayerBoundingBoxStateUpdateSystem`.
The trigger requires head-in-water, sprint intent, and permission to swim.
For look-direction Y at or above 0.15, it also requires two non-air material probes.
One probe uses the breathing point supplied by the head-position query.
The other uses the block above the collision-box center, calculated in single precision.
The bounding-box system supplies the breathing probe by flooring the interpolated head position.
The [component declaration](https://github.com/LiteLDev/LeviLamina/blob/main/src/mc/entity/components/PlayerInputRequestComponent.h) corroborates the breathing fields.
The matching executable establishes their layout and use for this build.

Apply these additional probes when entering swimming after local sprint decisions.
Preserve the previous completed swimming state for sprint-stop timing.
Do not use a fixed frame delay or change the eye height to fit the captured trajectory.
Tests cover the look threshold, both material gates, the standing-box boundary, and negative coordinates.
Live verification of the revised re-entry behavior follows below.

The native trigger also stops upward swimming when the breathing block becomes air and standing is unobstructed.
Its angle uses `acos(direction.x² + direction.z²)`, rather than the pitch angle itself.
It retains swimming at 45 degrees or less by that calculation, or when looking downward.
A second 35-degree surface exit exposes this distinction: Java's body-water check retains swimming for one extra frame.
Apply the breathing-block and angle checks before local travel.
Tests include shallow and steep upward directions, downward directions, and equivalent horizontal orientations.

The completed direct and ViaProxy comparisons each cover 64 frames at all three recorded reference angles.
Swimming and sprint events match native, including the second surface exit and re-entry.
Neither route receives a correction during the controlled cases.
Maximum vertical position difference is about 0.000031 blocks, and maximum horizontal difference is about 0.000008 blocks.
Motion-component differences remain below 0.000000060 blocks per tick.
Dependency builds pass with 16 converter tests, 636 core tests, and 607 add-on tests.
There are no failures or errors; 135 environment-dependent tests skip.
These results resolve the recorded re-entry gap.
Other movement directions, blocked standing space, fluid levels, currents, effects, and reconciliation history remain unverified.

## Breathing-material cap and blocked standing space

The matching 1.26.51.1 executable supplies a separate `SwimControlSystem` calculation.
For ordinary non-jumping, non-flying swimming, upward motion stops when the breathing block is outside liquid.
That check applies to every upward look direction.
Remove the former look-Y cutoff of 0.55 and use the breathing material.
Keep the existing flying and jump paths outside this change.

The swimming trigger cannot emit a swimming stop when its standing-space probe is blocked.
Preserve that swimming state before Java refreshes its pose.
This avoids repeated pose changes beneath a low ceiling.

A strict-BDS ceiling case swims upward at 45 degrees beneath blocks at Y=106.
The initial implementation receives 22 nonzero corrections and repeatedly changes its swimming state.
The revised direct case receives two initial corrections, then stays at the server's capped surface with zero vertical motion.
ViaProxy receives three initial corrections, then also settles.
These are server comparisons, not a fresh native ceiling capture.
The initial transition and correction timing remain incomplete on both routes.

Separate 64-frame open-water cases still match the saved native 30-, 35-, and 45-degree references on both routes.
Swimming and sprint events match, with no correction during those cases.
Position differences remain below 0.000031 blocks vertically and 0.000008 blocks horizontally.
The dependency build passes 16 converter, 636 core, and 608 add-on tests, with no failures or errors.
There are 135 environment-dependent skips.
The new cap test covers all upward directions and both breathing-material states.

**Incomplete:** Resolve the initial blocked-surface sprint and fluid-state transitions.
Compare a fresh native ceiling capture when the host GPU safety condition permits it.
Correction history replay, jump and flying swimming, other fluid levels, currents, and the remaining movement matrix remain requirements.

## Ground-jump observation

The saved native 1.26.51.1 protocol 2193 pool-floor reference rises with held jump input without emitting `StartJumping`.
The first dry-jump frame does emit that event.
Core's former grounded-plus-held-input heuristic incorrectly emits it during a water rise.

Observe local `jumpFromGround` calls, reset the observation before `aiStep`, and send it with the completed physics frame.
Use the separately negotiated revision-three prediction channel.
Core validates the frame and constructs the Bedrock event on both direct and ViaProxy connections.
Do not infer a ground jump from a velocity threshold or held liquid-rise input.

Live strict-BDS comparisons cover 29 water-rise frames directly and the first 28 through ViaProxy.
Both routes match native flags and the two dry-jump frames, without corrections during those cases.
Maximum water-rise position difference is about 0.000008 blocks; motion differences stay below 0.000000045 blocks per tick.
Both routes also retain the native events and motion in a separate 64-frame 35-degree swimming case, without corrections.
The ViaProxy repeat uses the rebuilt proxy JAR with the matching embedded core.

The dependency builds pass with 16 converter, 636 core, and 608 add-on tests.
There are no failures or errors; 135 environment-dependent tests skip.
The core codec covers all sixteen independent pose, collision, and jump combinations, including stationary frames.

**Incomplete:** Automatic jumps, obstructed jumps, swimming with jump or flying input, other fluid conditions, and correction history need separate verification.
The initial blocked-surface corrections remain unresolved.

## Jumping during swimming transitions

The matching 1.26.51.1 executable identifies `CurrentSwimAmountSystem` and `MobJumpSystem`.
The first system changes the swimming blend by 0.1 toward zero or one, with single-precision arithmetic.
The [component declaration](https://github.com/LiteLDev/LeviLamina/blob/main/src/mc/entity/components/SwimAmountComponent.h) corroborates the current and previous fields.
The matching executable establishes the step for this build; Java 26.3 uses 0.09.

The jump system suppresses water rises while the blend is strictly between zero and one.
Its callback receives `WasInWaterFlagComponent` for this gate; jumping is already a required view component.
The gate remains active after swimming stops, while the blend decays.
The former ten-tick counter resets on release and permits an immediate rise during that transition.

Use the existing blend instead of a separate counter, and apply the native step on Bedrock connections.
Retain the water and jumping gates so this suppression does not affect dry jumps.
The private movement observer now records the blend in each phase.
Core still validates completed frames and constructs auth input on both routes.

The original strict-BDS release-and-jump recording receives five nonzero corrections during the rise and subsequent settling.
The revised direct and ViaProxy recordings receive none.
They also cover entering swimming with jump held: motion is suppressed during the fractional blend, then resumes at one.
Both recordings complete join and spawn, with 1,718 direct and 2,116 proxy auth-input frames.
Each has three zero-velocity fixture corrections.

Separate 35-degree surface comparisons retain native events without corrections: 63 frames directly and 64 through ViaProxy.
Maximum position differences remain below 0.000031 blocks vertically and 0.000008 blocks horizontally.
Motion differences remain below 0.000000045 blocks per tick.
The dependency build passes 16 converter, 636 core, and 608 add-on tests, with no failures or errors and 135 environment-dependent skips.
`bun run check` also passes.

**Incomplete:** A fresh native capture with swimming and jump held together is still required.
The following section implements and exercises the native head-water branch.
Exact system phases, residual blend during dry jumps, flying, and other fluid conditions need separate verification.
The initial blocked-surface corrections and prediction history remain unresolved.

## Swimming jumps at the head-water boundary

The matching Windows 1.26.51.1 executable identifies another `MobJumpSystem` condition.
It suppresses water rises when swimming is active and `ActorHeadInWaterFlagComponent` is absent.
The fractional-blend condition remains independently active.
The head-water update uses the breathing-point query at interpolation zero and a strict comparison with the water surface.

The native depth calculation uses single-precision division and subtraction.
Source and falling water reach the block top; flowing depths one through seven subtract their depth divided by nine.
Preserve the native operation order and strict boundary comparison.
The Java source-fluid height would suppress rising before that boundary.
Apply these conditions within the existing water and jumping gates.
Core still owns completed-frame validation and auth-input construction on both connection routes.

The previous short strict-BDS case receives three nonzero corrections in 47 held-jump swimming frames, before reaching the wall.
The revised direct case receives none in 48 frames and remains at the server's accepted surface height.
A separate 150-frame direct repeat reaches the pool wall without corrections during the held input.
The release-and-jump case retains its blend suppression and resumes rising at zero.

ViaProxy repeats both 48-frame and 150-frame cases without corrections during the held input.
All 48 short-case positions, motion values, and input flags match the direct route exactly.
It also preserves the release-and-jump blend gate and matches the same native surface, ordinary water-rise, and dry-jump regression frames.
Both completed recordings join and spawn: 3,016 auth-input frames directly and 2,599 through ViaProxy.
They receive one and four zero-velocity fixture corrections respectively, with no nonzero corrections.

The direct regression also matches 64 saved native surface frames, 29 ordinary water-rise frames, and two initial dry-jump frames.
Those cases receive no corrections.
Two focused tests cover the head gate, blend combinations, and water-depth arithmetic at positive and negative world heights.
The dependency build passes 16 converter, 636 core, and 610 add-on tests.
There are no failures or errors; 135 environment-dependent tests skip.
`bun run check` passes.

**Incomplete:** A fresh native combined swimming-and-jump capture remains required.
The implementation uses the existing unmounted breathing-point integration; player-specific offset overrides and mounted geometry need further comparison.
Other water depths, falling water, currents, waterlogged blocks, exact system phases, and wall-climbing behavior need live native verification.
The separate initial ceiling corrections and prediction history remain unresolved.

### Preserve motion when the swimming body leaves water

The matching native `SwimControlSystem` view requires `WasInWaterFlagComponent`.
An airborne swimming pose therefore skips its vertical controller, including the head-out motion cap.
The add-on now checks body water before applying either behavior.
It retains motion for ordinary air gravity on the exit frame.

In the previous strict-BDS 45-degree ceiling case, Java reports vertical motion of -0.0784000 while the server reports +0.0556102.
The revised direct and ViaProxy cases retain +0.0556104, with no correction for that exit frame.
Both routes still receive two corrections per tested angle during ceiling re-entry.
Packet and local-frame evidence shows server actor metadata clearing swimming before that re-entry.
The matching native handler queues metadata with its server tick; core currently discards that tick.
The queue's application and local prediction rules remain under investigation.

The direct open-water regressions match all 192 saved native frames across 30, 35, and 45 degrees.
They retain swimming and sprint events and receive no corrections during those cases.
ViaProxy matches another 64 saved native frames at 45 degrees without corrections.
Its 48-frame held swimming-jump regression also receives no corrections.
The dependency build reports 16 converter, 636 core, and 610 add-on test cases, with 135 skips and no failures or errors.

These comparisons do not establish complete ceiling parity.
Fresh native ceiling captures, prediction history, and actual Windows/macOS game joins remain required.

### Retain native crawling separately from swimming

Strict BDS 1.26.51.1 clears the swimming flag and sets crawling, bit 114, at the ceiling exit.
Its sparse metadata retains the 0.6-block body height.
Core now translates that state into Java pose metadata after all flag words in the update have been retained.
Crawling does not set the Java swimming flag.
Ending crawling restores the pose from the remaining swimming, gliding, sleeping, or sneaking state.

Java 26.3 remote players retain the server pose.
The local player recalculates its desired pose each tick.
The add-on therefore retains core's short crawling pose from the existing native actor channel.
This works for direct and ViaProxy connections and preserves sleeping, gliding, and spin attack poses.

Three core tests cover the swimming-to-crawling transition, sparse flag updates, both flag-word orders, and restoration.
The full build passes 16 converter, 639 core, and 610 add-on test cases, with 135 skips and no failures or errors.
ViaProxy also builds successfully.

Both strict-BDS routes retain the 0.6-block body while swimming is off under the ceiling.
Direct corrections drop from two per angle to one; ViaProxy still receives two per angle.
A proxy frame retains swimming before the server crawling update takes effect.
Predicted native transitions and server-tick history replay remain required.

Direct open-water regressions match 192 saved native frames; ViaProxy matches another 64.
They retain swimming and sprint events and receive no corrections during those cases.
The held swimming-jump regressions match the preceding accepted reference: 48 frames directly and 47 through ViaProxy.
Both recordings join and spawn with protocol 2193.

### Predict native local posture

The local prediction now replaces the server-metadata dependency described above.
It uses core's `PlayerPosture` decision with local input and block collisions before travel.
The short desired pose follows local crawling state, while remote players retain core's server pose translation.
Sleeping, gliding, and spin attack poses retain their existing paths.

Matching 1.26.51.1 executable inspection establishes the posture rules and probe geometry.
Standing, crouching, and crawling probes use native float arithmetic, heights of 1.8, 1.49, and 0.6 blocks, and a 0.01-block inset.
Entity overlap does not prevent a native posture change.
Collapsed probe axes use their midpoint.
The add-on also uses the native 1.49-block crouching body height.

The posture trigger runs after `applyInput` and before travel.
Input scaling retains the preceding sneaking or crawling state, except during flight.
Flight suppresses requested sneaking; gliding, passengers, spectators, and spin attacks bypass forced posture.
The completed revision-4 frame carries independent swimming, crawling, and sneaking flags.
Core retains packet construction and edge tracking for direct connections and ViaProxy.

Two probe tests cover float rounding, native heights, ceiling overlap, collapsed axes, and unsupported poses.
The full build passes 16 converter, 648 core, and 612 add-on test cases, with 135 skips and no failures or errors.
`bun run check` also passes.

Both routes retain the short body locally during the 35-degree and 45-degree ceiling cases.
The direct route receives one nonzero correction per angle.
ViaProxy receives two at 45 degrees and one at 35 degrees in this run.
The remaining re-entry frame uses slow input and stops sprinting before travel; BDS expects greater forward acceleration and drag.
The additional proxy correction follows the first correction's delivery delay.
These observations require native phase and history research; they do not justify ignoring server corrections.

Direct open-water comparisons match 191 saved native frames across 30, 35, and 45 degrees without corrections.
The 48-frame held swimming-jump case matches the preceding accepted reference exactly in position, motion, and flags.
ViaProxy matches another 192 saved native open-water frames without corrections.
Its held swimming-jump case receives no corrections; the first 48 of 49 frames match the direct reference exactly.
Both routes still require fresh native ceiling and combined swimming-jump captures.

### Native water contact and input scaling

The matching 1.26.51.1 calculator at `0x1404495e0` bypasses posture slowdown during flight, swimming, or water contact.
Adapter `0x14669d7d0` identifies the water argument as `WasInWaterFlagComponent`.
The add-on uses core's shared decision and samples water contact before input.
Revision 5 transports that sample with the completed motion and posture.
Core can construct the same move vector on direct connections and through ViaProxy.
The first crawl-to-water frame now bypasses slowdown before the posture trigger changes its flags.
Swift Sneak, item-use slowdown, authoritative history replay, and fresh native ceiling comparisons remain separate requirements.

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

## Bound native item-use duration

Native 1.26.51.1 duration callback `0x14c6109b0` decrements positive ticks only and clamps at zero.
Java 26.3 continues below zero while the client waits for completion.
Bound the remaining counter for the local Bedrock player at its field write in `updateUsingItem`.
Keep server acknowledgment and inventory handling unchanged.
Remote players and Java connections retain their existing counter behavior.

Matching native constructor inspection proves completion's world-side gate.
Level getter `0x14117c450` reads byte `0x238` through vtable slot `0x9e8`.
Base constructor `0x14114e0c0` copies it from LevelArguments byte `0x120`.
Client factory `0x14086eef0` sets that argument to one before ClientLevel construction at `0x1412efe30`.
Native client completion therefore skips the server inventory transaction and completion-packet sender.
It still dispatches item event 7 through the item coordinator before clearing active use.
The server packet acknowledgment dispatches actor event 19 through a separate coordinator.
Gameplay handlers and downstream listeners remain untraced.
Their inventory effects and exact completion phase require more evidence.

A local-completion prototype receives two repeated-eating corrections on each strict-BDS route.
It also exposes delayed updates interrupting the next use cycle.
The direct and ViaProxy last-item cases each contain 100 moving frames without corrections.
The prototype is excluded from this patch; the bounded counter is the established native behavior.
Local completion prediction, metadata synchronization, late acknowledgment correlation, and history replay remain incomplete.

Verification builds all four projects and replays both complete patch stacks.
The suites contain 16 converter, 672 core, and 584 add-on test cases, with 133 skips and no failures or errors.
`bun run check` passes.
Both strict-BDS routes join and spawn with protocol 2193.
Each records 232 completed active-use frames without negative duration and seven server completions with one equipment update each.
Direct contains 160 repeated-eating frames and 100 last-item frames.
ViaProxy contains 161 and 101, respectively.
Both last-item cases finish with an empty held stack and no correction.
Direct repeated eating receives three nonzero corrections; ViaProxy receives none in this recording.
These observations verify the bounded counter and inventory flow, while completion and correction timing remain incomplete.

## Completion handlers and historical actor flags

Further matching-build inspection proves that the constructor-installed item and actor handlers return continuation without accessing inventory.
Additional listeners and later handler replacement remain untraced.
The native client also skips the server food event before updating nutrition and saturation.

Native actor-data assignment carries the server tick into prediction history.
Its predicted flag mask includes using-item bit 4.
Emulation executes both native flag kernels for 3,194 cases without mismatches.
An unchanged historical bit preserves a newer local start, while an authoritative clear still requires later-frame replay.
The [coverage ledger](../../../docs/bedrock-coverage.md#native-completion-handlers-and-historical-actor-flags-october-6-2026) records the function evidence and verification scope.

Core currently applies metadata immediately and discards its tick.
Historical state, ordered corrections, and later-input replay remain requirements before local completion can reproduce native timing.
These findings do not add completion prediction or establish movement parity.

## Correction snapshots and replay scheduling

Matching-build inspection now traces snapshot selection, correction queues, and the installed local-player replay policy.
Native compares a correction at tick T with captured state from T+1.
It applies the command to live state and schedules later replay when needed.
Missing frames follow separate paths; expired ticks are bounded to the earliest stored frame.
Exact native command and queue emulation passes 2,420 cases.
Wrapper and local-player replay-policy emulation passes another 3,370 cases.
The [coverage ledger](../../../docs/bedrock-coverage.md#native-correction-snapshots-and-replay-policy-october-6-2026) records target function addresses, boundaries, and fixture limits.

The item-use flag callback previously traced is `DealKineticDamageComponent` cleanup, not proof of ordinary food completion.
Frame correlation, complete snapshots, and actual later-input simulation remain necessary before this patch can predict local completion.

Native capture callback `0x143276a40` and restore kernel `0x14327b7c0` preserve component presence separately from field values.
Exact native capture and restoration pass 640 cases for movement speed, sneaking, actor flags, and state vectors.
The fixture supplies existing synthetic storage and substitutes cached component-view discovery.
Other components, allocation ownership, and full physics replay remain outside that verification.
The [snapshot reference](../../../docs/bedrock-coverage.md#native-snapshot-capture-and-restoration-october-6-2026) records the target evidence and limits.

## Preserve local item use across metadata updates

The patch prevents `LocalPlayer.onSyncedDataUpdated` from starting or stopping local item use on Bedrock connections.
Native keeps its active item instance and selected inventory slot separate from actor flags.
Core metadata remains authoritative; remote players and ordinary Java connections retain their existing behavior.

Strict-BDS recordings reach join and spawn through direct connections and ViaProxy with protocol 2193.
Each records 200 consecutive active-use frames during repeated eating, without inactive gaps between completions.
Each receives seven server completions and one equipment update per completion.
Last-item completion empties the held stack through authoritative updates.
Early release, slot changes, and server item replacement still stop use before duration expires.
Bow use also stops on release.
All four projects build, their patch stacks replay, and the test suites report no failures or errors.

Repeated eating still receives two movement corrections on each route.
The last-item movement case receives none directly and one through ViaProxy.
This change does not predict local completion or implement historical replay.
The [coverage ledger](../../../docs/bedrock-coverage.md#local-item-use-metadata-independence-october-6-2026) records the native function evidence and verification limits.

## Captured inputs and replay phases

Matching-build inspection traces retained inputs through native movement replay.
The native loop applies queued corrections and captured input before the movement step, then applies captured turn changes afterward.
Target callback RTTI identifies the movement dispatcher as `EntitySystems::tickMovementCorrectionReplay`.
Component-name hashes resolve movement input, interpolation, item slowdown, and buoyancy requests.
The target capture-method order differs from the SDK, so SDK slots cannot establish these bindings.

Exact native capture and pre-application bytes pass 1,280 cases across these four components.
The fixture verifies presence handling and preserved padding with existing synthetic storage.
It substitutes cached view discovery and excludes allocation ownership, collision data, post-application, and full physics replay.
The [input replay reference](../../../docs/bedrock-coverage.md#native-captured-inputs-and-movement-replay-october-6-2026) records function evidence and verification limits.
Production frame correlation and later-input simulation remain incomplete.

Further inspection verifies the native turn and collision phases independently.
Exact turn capture, body-rotation restoration, and post-movement turn application pass 1,280 cases.
Exact collision capture and application pass 256 cases with preallocated buffers.
Native capture transfers collision-buffer ownership into history and clears the source pointers.
Replay copies retained collision data back into live storage.
The fixtures exclude real allocator lifetime, capacity growth, full movement simulation, and visible native-client behavior.

Full metadata decoding of the existing strict-BDS recordings matches all 317 nonzero local update ticks to already-sent input frames.
Updates can arrive before the following frame exists, so future correction handling remains necessary.
Another 402 unique-position samples match completed Java observations to Bedrock input ticks.
Startup, respawn, repeated positions, and broader server behavior still require explicit frame correlation.
The [turn, collision, and clock reference](../../../docs/bedrock-coverage.md#native-replay-turns-collision-ownership-and-frame-clocks-october-6-2026) records the methods and verification limits.

## Replay settings and collision selection

Matching-build inspection resolves the retained external-data snapshot into play mode, input mode, rotation smoothing, game type, adventure settings, and menu/pause state.
Exact native capture, snapshot selection, and getters pass 2,048 cases.
The fixture supplies a synthetic context registry and preinitialized TLS/type keys.
It excludes actual menu behavior and full movement simulation.

Movement registration assigns collision reuse and shape refresh to the movement-replay category.
The main collision system also belongs to that category; the system that captures collision history uses two other categories.
Registration does not establish the complete execution order.

Native collision-history capture copies the live movement-request buffers before transferring the copies into retained input.
Exact history selection, copy construction, and capture pass 384 cases, including absent history and large-buffer alignment.
During replay, captured shapes are reused only when squared distance from the fetch position is below 4.
Exact reuse and vector transfer pass another 4,096 cases, including boundary and non-finite positions.
These fixtures substitute allocator or buffer-release boundaries and exclude real block-reference lifetime and complete physics.
The [settings and collision reference](../../../docs/bedrock-coverage.md#native-replay-settings-and-collision-selection-october-6-2026) records the methods and verification limits.

Production frame identity, retained settings and world state, ordered corrections, and later-input simulation remain incomplete.
These findings do not add production reconciliation or establish full movement parity.

## Native collision solver

Matching-build inspection distinguishes collision-shape gathering from actor movement.
The actor solver resolves Y, X, then Z, visits boxes in reverse order, and snaps contact distances within `0.000001` blocks to zero.
It maintains separate clipping and overlap-resolution alternatives and uses per-axis overlap limits to select between them.
Actor movement updates the final bounding box, owned shape boxes, original and resolved speed, and overlap flag.

Exact native contact, movement-sequence, and actor-movement bytes pass 10,288 comparisons against an independent float32 model.
These kernels execute without substituted code hooks.
Another 4,096 cases verify overlap-limit configuration, with cached ECS view discovery substituted.
The [collision solver reference](../../../docs/bedrock-coverage.md#native-collision-solving-and-overlap-limits-october-6-2026) records function evidence, fixture boundaries, and the Java 26.3 difference.

The add-on still uses Java collision solving.
Native overlap-state producers, stepping, final position updates, and retained-world replay remain incomplete.
These comparisons do not establish production collision parity or visible native behavior.


## Native stepping and finalization

Matching-build inspection establishes native step eligibility, step solving, overlap-state updates, and final position and collision updates.
Step eligibility consumes the always-step tag and checks exact horizontal motion changes before requesting a step.
The solver tests rise, X, Z, and descent, checks the final box against the full collision list, and requires greater horizontal displacement.
Exact native step instructions pass 2,064 cases, including ceilings and large aligned buffers.

Overlap updates read actor flag 109, retain penetration state across frames, and clear temporary overlap limits.
Exact overlap-update and step-eligibility instructions pass 1,024 and 1,280 cases respectively.
A temporary-limit producer raises vertical overlap to at least float32 `0.05` and passes another 1,536 cases.
Its caller conditions and other state producers remain unverified.

Finalization uses float32 box-derived position and a collision threshold of `2⁻²³`.
Grounded state depends on vertical collision, requested vertical motion, and prior grounded state.
No-clip updates position while preserving existing collision and grounded flags.
Exact finalization instructions pass 32,768 cases across threshold boundaries, prior flags, and ability states.

The [stepping and finalization reference](../../../docs/bedrock-coverage.md#native-stepping-overlap-updates-and-move-finalization-october-6-2026) records addresses and verification limits.
Fixtures substitute ECS or allocator boundaries and exclude complete scheduling, real component lifetime, and visible native behavior.
Production still uses Java collision solving.
Native shape collection, remaining overlap producers, retained-world replay, frame identity, and ordered corrections remain incomplete.


## Native collision queries and cache extension

Matching-build instruction comparisons establish the movement cap, step and inset search bounds, and inclusive cache-hit behavior.
The gatherer caps requested movement length at 16 blocks before searching.
Exact query and gather instructions pass 4,096 cases, including static result ordering and unloaded flags.
The world adapter supplies fixture records; native block traversal and optional actor shapes remain unverified.

Partially overlapping caches use ordered partition cells, float32 plane advances, coordinate deduplication, and volume-based merging.
Exact cache-extension instructions pass another 2,048 cases against an independent model.
They check 11,072 ordered fetches, 3,264 merges, stored bounds, and 8,544 matching allocations and releases.
World results are empty in these fixtures; real shape production, allocation lifetime, and replay remain unverified.

Exact world traversal and record construction pass another 640 cases with fixture world and block-type boundaries.
Loaded blocks use X/Z/Y loop order; unloaded-chunk barriers precede them with X advancing before Z.
The comparison checks 22,150 block visits and 18,140 records, including height limits, unloaded chunks, the below-world barrier, and border blocks.
The below-world barrier follows unloaded records and leaves the nearby-unloaded flag clear.
Border records follow loaded blocks, use strict horizontal intersection, and extend vertically to negative and positive float32 maximum.
Their block reference comes from the border manager, with a separate fixture reference for the world block used during shape generation.
The builder collision interface skips border collection.
Real shape generation, capacity growth, and full simulation remain unverified.

Exact overlap-component initialization passes 1,024 cases with insertion supplied by a fixture boundary.
The [collision-query reference](../../../docs/bedrock-coverage.md#native-collision-query-bounds-and-cache-extension-october-6-2026) records addresses, constants, and verification limits.
Production still uses Java collision solving.
Native obstacle ordering, remaining state producers, coherent frame identity, retained world state, and ordered corrections remain incomplete.


## Native player overlap state

Matching-build inspection identifies the player constructor through actor type 319.
Its persistent overlap minima are float32 `0.01` on each axis.
Exact actor-type assignment and the relevant constructor stores pass 1,024 cases and preserve adjacent bytes.
The full constructor, subclass overrides, and later lifecycle remain unverified.
The configured movement limits can exceed these persistent minima.

The native one-way collision callback removes boxes that no longer strictly intersect the actor and preserves surviving order.
Exact pruning passes 2,048 cases and checks 11,756 removals with a fixture CRT copy boundary.
Initial list creation and complete scheduling remain unverified.

The nearby-solid kernel merges nonzero vectors into temporary overlap minima and appends shapes in linked-list order.
Exact merging and append instructions pass 2,048 cases and check 8,198 shapes with sufficient existing request capacity.
Zero incoming vectors preserve temporary state; parallel references clear 20 bytes and preserve four padding bytes.
Actual nearby-solid production, buffer growth, and complete physics remain unverified.

The [player overlap reference](../../../docs/bedrock-coverage.md#native-player-overlap-defaults-and-collision-state-october-6-2026) records addresses and fixture limits.
Production still uses Java collision solving; these findings do not implement native movement or correction replay.


## Native block collision providers

Matching-build comparisons now establish position sampling, component lookup, range scaling, and the common block collision wrappers.
The offset initializer converts authored endpoints by float32 `1/16` and retains unsigned step counts.
Exact initialization and lookup pass 2,048 cases each.
Position sampling passes 8,192 cases and 8,192 additional Y-invariance checks.

Component boxes retain their list order, normalize endpoints, and use strict intersection.
Exact comparisons pass 4,096 cases with sufficient existing vector capacity.
The single collision envelope uses continuous offsets, while the component append path floors each offset into `BlockPos`.
Exact wrappers pass another 4,096 cases for each path.
The independent models follow executable float32 order, including differences obscured by decompilation.

The [block offset reference](../../../docs/bedrock-coverage.md#native-block-offsets-and-component-collision-shapes-october-6-2026) records addresses and fixture boundaries.
Wire definitions, range validation, per-type overrides, and production integration remain incomplete.
Production still uses Java collision solving; the converted custom-block properties currently omit random offsets.


## Native actor collision refresh

Matching-build registration identifies the separate `Rewind Solid Shape Refresh` system.
Its refresh kernel updates saved actor boxes in linked-list order during replay.
It prefers an enabled prediction history position and otherwise uses interpolation when any step field is nonzero.
Valid bounding-box and actor-offset components are also required.
Missing or stale state preserves the saved box.

Exact native refresh instructions pass 4,096 cases across 16,380 actor records with no mismatches.
They verify wrapped history selection, component generations, lazy lookups, fallback selection, float32 reconstruction, and preservation of unrelated data.
The [actor refresh reference](../../../docs/bedrock-coverage.md#native-actor-collision-shape-refresh-october-6-2026) records addresses, counts, and fixture boundaries.
Registry discovery, feature checks, paired-view creation, and the virtual position getter are fixture boundaries.
Actual nearby-solid collection, history creation and lifetime, and complete scheduling remain unverified.

Production still uses Java collision solving.
Native collision integration needs coherent frame identity, retained world state, ordered corrections, and later-frame simulation.
These comparisons establish one native replay kernel's behavior and do not establish complete movement parity.


## Native nearby-actor collision collection

Matching-build native collectors establish forward and reverse eligibility for actor collision boxes.
They expand query boxes by two blocks, validate component generations, and exclude the mover and foreign contexts.
Forward collection reads collidable and stackable properties.
Reverse collection also handles falling-block recipients and excludes actors on their first tick.

Nearby boxes use a map keyed by entity identity and entity context.
The native map updates duplicate actors without adding nodes or changing their traversal position.
Fresh comparisons establish traversal order within the supplied map capacity.

Exact native collector, map insertion, and reverse view-check instructions pass 6,144 cases across 38,509 candidate records.
They check all 64 reverse eligibility combinations, 9,991 node allocations, 2,212 duplicate eligible records, and repeated box updates without mismatches.
The [collector reference](../../../docs/bedrock-coverage.md#native-nearby-actor-collision-collectors-october-6-2026) records addresses, separate counts, and fixture boundaries.
World results, component discovery, allocator memory, existing nearby components, and sufficient map capacity are supplied by fixtures.
Actual query inclusion and ordering, ECS allocation, tag lifetime, and complete scheduling remain unverified.
The [map construction comparison](../../../docs/bedrock-coverage.md#native-collider-map-construction-and-growth-october-6-2026) now verifies initialization stores and rehash behavior with explicit fixture boundaries.

Production still uses Java collision solving.
Remaining overlap-state producers, one-way list creation, coherent frame identity, retained world state, and ordered corrections remain incomplete.
These comparisons do not establish full movement parity or actual platform joins.


## Native collider map growth

Matching-build native construction initializes an empty 80-byte nearby component and an eight-bucket collider map.
Its default load factor is one.
Native insertion preserves existing keyed nodes and grows capacity before adding a new collider.
Rehash groups the existing traversal by the new bucket mask and reverses the nodes within each group.
Capacity changes can alter collision-list order while preserving every box.

Exact native component initialization, map construction, insertion, and rehash instructions pass 1,024 cases with no mismatches.
They verify 32,871 distinct insertions, 3,299 duplicate updates, 717 automatic growth events, and 896 explicit rehashes.
The comparisons check 135,691 boxes and node addresses, plus large-buffer alignment and 1,221 matching prior-bucket releases.
The [map growth reference](../../../docs/bedrock-coverage.md#native-collider-map-construction-and-growth-october-6-2026) records capacity rules, addresses, counts, and fixture boundaries.

Fixtures supply allocator memory, release, CRT copying and ceiling, ECS emplacement, and the component slot.
Actual ECS registration, allocation lifetime, failure recovery, world-query ordering, and complete scheduling remain unverified.
One-way list creation, remaining overlap-state producers, retained world state, frame identity, and ordered corrections remain incomplete.
Production still uses Java collision solving; these comparisons do not establish complete movement parity.

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

## Grounded state after player corrections

Core retains and negotiates the grounded state that Java player-position packets omit.
The add-on pairs it with the player and teleport ID, then applies it after the standard position handler.
Position, motion, rotation, and teleport acknowledgments retain their existing translation.
Unmatched packets consume and invalidate pending state.
Connection initialization and disconnect also clear it.
The handler excludes passengers.

A live Java 26.3 probe establishes that zero-relative entity teleports start local interpolation even without displacement.
This alternative cannot provide faithful correction behavior.
Core's [correction notes](../../viabedrock/upstreamable/0092-retain-completed-client-prediction-frames.pr.md#authoritative-grounded-state) describe the wire format, version evidence, and pairing tests.
History rewind, input resimulation, vehicle state, and the full movement matrix remain requirements.

A private live JVM probe exercises the actual injected Java 26.3 position handler after BDS spawn.
Both grounded states apply with exact position and velocity preservation and no active interpolation.
A mismatched teleport ID invalidates the pending correction, including a later packet with its former matching ID.
This probe supplies state directly to the tracker; it does not establish negotiated wire delivery.

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

## Future movement effects, October 7, 2026

The shared core timeline now applies future effects immediately at their paired input frame.
Repeated snapshots retain their original expiration. This change needs no add-on source change.
The add-on passes 605 tests. All 1,250 core files match its nested bundle and the proxy bundle, excluding the manifest.
A fresh strict BDS join through ViaProxy records 36 exact float lift changes and 280 unchanged phases after source removal.
The retained effect subsequently expires. The observer supplies no client physics, input, or effect values.

Native queued replay can restore an expired effect through clamped history. Pending drain and full physics rewind remain incomplete.
The [coverage ledger](../../../docs/bedrock-coverage.md#future-commands-and-native-queued-effect-replay-october-7-2026) records the combined native fixture and remaining requirements.

### Native frame-capture boundaries

The new 344-case native fixture verifies capture clocks, guards, input fill, history eviction, unsigned wrap, and ring growth.
These results establish required history behavior. They do not verify complete world simulation or scheduler phase ordering.
Completed movement payloads and the shared effect timeline remain insufficient for full physics rewind.
The production path still requires ordered snapshots and captured input, queued command replay, and actual client simulation.
The [coverage ledger](../../../docs/bedrock-coverage.md#native-frame-capture-clocks-and-history-boundaries-october-7-2026) records the evidence and remaining implementation requirements.

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
The [coverage ledger](../../../docs/bedrock-coverage.md#native-movement-registration-and-countdown-timing-october-7-2026) records the full evidence scope.

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
