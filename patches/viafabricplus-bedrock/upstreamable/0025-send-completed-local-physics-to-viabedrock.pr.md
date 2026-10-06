# Send local player prediction to core

## Purpose

Send completed local physics through the negotiated ViaBedrock prediction channel.
Sample only the local player after standard Java movement and before the tick-end packet.
Send stationary frames too, so motion and swimming state do not depend on sparse position updates.

The payload carries position, motion, and swimming state.
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
The full build passes, including 628 core tests and 603 add-on tests, with no failures or errors.
Live direct and ViaProxy strict-BDS comparisons match the native water-idle motion field within about 2e-9.
Both routes complete jump, fall, and water cases without corrections in the controlled water cases.
Startup and elevated-teleport corrections remain.
A ViaProxy sprint-swim case emits one start and one stop event without an additional correction.
Native and direct swimming comparisons remain to verify.
Fluid currents, lava, effects, vehicle physics, and the remaining movement matrix still need native comparisons.
