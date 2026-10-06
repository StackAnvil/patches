# Completed player prediction frames

## Purpose

Use completed local physics for Bedrock auth-input motion when a client provides the negotiated prediction channel.
Keep frame validation, event state, auth-input construction, and correction handling in ViaBedrock.
Support direct connections and ViaProxy with the same payload.

A frame carries feet position, motion, swimming state, and completed collision axes.
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

Four targeted tests cover transport, version rejection, finite values, flag validation, frame consumption, teleport staleness, and swimming edges.
The full build passes with 16 converter tests, 629 core tests, and 603 add-on tests.
There are 135 skips across core and add-on tests, with no failures or errors.
Live direct and ViaProxy strict-BDS comparisons match the native water-idle motion field within about 2e-9.
Both routes complete jump, fall, and water cases without corrections in the controlled water cases.
Startup and elevated-teleport corrections remain.
A ViaProxy sprint-swim case emits one start and one stop event without an additional correction.
A native sprint-swim capture confirms start event 29 and stop event 30.
The add-on aligns its start timing with native; release event ordering remains incomplete.
Remaining movement cases need separate native comparisons.

## Completed collision state

Native wall and open-water captures clear horizontal collision on the swimming-release frame.
Sparse Java position packets can omit that stationary frame and leave core with the previous horizontal collision.
Wire revision 2 carries both completed collision axes independently from grounded state.
Core uses these axes only for a matching unmounted frame outside dimension changes.
Ordinary Java clients retain the existing collision translation.
The codec test covers all eight pose and collision combinations, including stationary motion.

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
