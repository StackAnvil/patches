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
