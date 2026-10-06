# Send local player prediction to core

## Purpose

Send completed local physics through the negotiated ViaBedrock prediction channel.
Sample only the local player after standard Java movement and before the tick-end packet.
Send stationary frames too, so motion and swimming state do not depend on sparse position updates.

The payload carries position, motion, swimming state, and completed collision axes.
Core validates the sample and builds Bedrock auth input on direct connections and through ViaProxy.
The add-on keeps its existing fluid physics and server correction behavior.

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
