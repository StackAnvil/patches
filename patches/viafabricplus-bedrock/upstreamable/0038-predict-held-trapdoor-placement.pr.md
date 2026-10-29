# Held trapdoor placement

The Java baseline opened a trapdoor during held placement where Bedrock added a closed neighbor.
Send the physical use lifetime and each local prediction to the core before its concluding Java packet.
Prediction format 2 carries the result and native cursor. Core and add-on consumers require the matching contract.
Enable the feature only when the server advertises both channels.

Keep the first predicted facing, half, and world hit until physical release or cancellation.
Retain this state across trapdoor materials, temporary item-family changes, server correction, and stack exhaustion.
Apply the snap only while the player holds a trapdoor.
Other block items use fresh hits and suppress repeated activation. Empty hands restore ordinary interaction.
Returning to a trapdoor restores the original snap.

Express the retained world hit relative to each later target, including coordinates outside its unit cube.
Keep the ordinary Java hit packet unchanged for other consumers.
Retain each new block's water, power, open state, and material properties.
Separate trapdoors and the original support remain valid targets.

Match the native 300 ms delay after the first attempt and each successful local use.
Failed repeats do not restart that delay.
Poll subsequent attempts after input movement, before the next network tick publishes rotation.
Suppress Java's parallel four-tick repeat path for the active hold.
Release, screens, and connection replacement clear the timer and placement state.

## Evidence and validation

Native 1.26.60.5 fixtures against BDS 1.26.60.6 establish the held behavior.
Physical camera changes retain facing, upper-half state, and closed state through direct Java and ViaProxy.
Both routes consume two items, leaving 62 from 64.
Material changes and fresh activation after release match their native fixtures.
The original native outline remains correct: native bottom-face hits use approximately 0.8175.
The earlier 0.8125 attribution came from the Java fixture.
The outline and occlusion checks now use the active Bedrock connection, including ViaProxy sessions with a local Java protocol target.
A fresh proxy fixture confirms the 0.8175 hit, placement-only air phase, fresh Stone coordinates, and restored trapdoor snap.

Native and direct Java retry one rejected first placement within the same held session.
Native item-family fixtures retain the snap through Stone selection and restore it on return to a trapdoor.
The empty-hand fixture uses fresh coordinates and activates existing trapdoors after stack exhaustion.
Direct Java and ViaProxy pause cancellation stop the active session before physical release.
Fresh native and ViaProxy sessions match repeated rejection followed by rotation without block consumption.
After a preceding successful hold, both native and ViaProxy instead place a neighbor and consume one item.
Matching session history explains the earlier apparent correction mismatch.
The translator preserves both authoritative outcomes.

All four project builds and the modpack bundle pass.
The add-on suite passes 1,281 tests with 142 optional skips and no failures/errors.
Five block-state tests cover retained orientation, materials, independent properties, targets, frozen hits, release, and ordinary blocks.
Two timer tests cover successful repeats, failed repeats, cancellation, and clock rollover.
