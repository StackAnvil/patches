# Held trapdoor placement

The Java baseline opened a trapdoor during held placement where Bedrock added a closed neighbor.
Send the physical use lifetime and each local prediction result to the core.
Match results to the concluding Java sequence number before sending that packet.
Enable the feature only when the server advertises both channels.

After successful trapdoor placement, suppress ordinary block activation.
Keep the first facing and half across hit faces, camera changes, and selected materials.
Retain each new block's water, power, open state, and material properties.
Continue through other trapdoors or retry the original support; ignore unrelated block targets until release.
Release and screen cancellation clear the placement state.

## Evidence and validation

Matching native 1.26.60.5 captures against BDS 1.26.60.6 establish the held behavior.
Separate trapdoors remain valid continuation targets, including differently oriented ones.
Unrelated floor targets remain inactive during the hold.
The first failed height-limit attempt emits no start action until a valid placement occurs.
Controlled relay probes establish separate roles for the held action lifetime and the first block-item use phase.

All four project builds and the modpack bundle pass.
The add-on suite passes 1,278 tests with 142 optional skips and no failures/errors.
Four block-state tests cover orientation, materials, independent placement properties, target eligibility, release, and ordinary blocks.

The corrected Java Creative fixture retains native facing, half, and closed state after a 90-degree camera change.
Changing oak to birch during the hold and clicking after release match the native fixtures.
Survival consumes two blocks correctly, but its authoritative facing still follows the changed camera direction.
Survival facing, cancellation, rejected-placement correction, and proxy comparisons remain open acceptance gates.
The native references use owned server teleports for camera changes; physical mouse comparisons remain separate.
