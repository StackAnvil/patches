# Held trapdoor placement

The Java baseline opened a trapdoor during held placement where Bedrock added a closed neighbor.
Send the physical use lifetime and each local prediction to the core before its concluding Java packet.
Prediction format 2 carries the result and native cursor. Core and add-on consumers require the matching contract.
Enable the feature only when the server advertises both channels.

After successful trapdoor placement, suppress ordinary block activation.
Keep the first predicted facing, half, and world hit across camera changes and selected materials.
Express that world hit relative to each later target, including coordinates outside its unit cube.
Keep the ordinary Java hit packet unchanged for other consumers.
Retain each new block's water, power, open state, and material properties.
Continue through other trapdoors or retry the original support. Ignore unrelated targets until release.
Release and screen cancellation clear the placement state.

Fresh clicks use Java's existing 3/16 trapdoor outline, matching native Bedrock.
The previous custom outline used an approximate thickness of 0.1825.

## Evidence and validation

Matching native 1.26.60.5 captures against BDS 1.26.60.6 establish the held behavior.
Seven native continuation placements preserve the initial world hit.
Separate trapdoors remain valid continuation targets, including differently oriented ones.
Unrelated floor targets remain inactive during the hold.
The first failed height-limit attempt emits no start action until placement becomes valid.

Creative camera changes, material changes, and fresh-click release match their native fixtures.
Native Survival accepts a changed authoritative facing when BDS receives the new yaw before placement.
Direct Java and ViaProxy match that controlled fixture, including closed upper-half state and consumption from 64 to 62.
Earlier teleport fixtures placed before the native camera update and cannot establish a server direction lock.

Native and ViaProxy replace a server-removed trapdoor during the hold and consume the replacement authoritatively.
Direct Java and ViaProxy pause cancellation stop active sessions before physical release.
Fresh Java and proxy clicks hit the bottom at 0.8125, matching native geometry.

All four project builds and the modpack bundle pass.
The add-on suite passes 1,279 tests with 142 optional skips and no failures/errors.
Five block-state tests cover orientation, materials, independent properties, target eligibility, frozen world hits, release, and ordinary blocks.

Physical mouse rotation and rejection of the first predicted placement remain open acceptance gates.
