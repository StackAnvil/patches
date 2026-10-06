# Native fence shape hooks

The add-on consumes core `BedrockFenceGeometry` through the block-state collision, selection, support, and camera hooks.
It preserves native world float rounding before conversion to block-local doubles.
Physical arms retain their diagonal gap. Outline and camera use their distinct rectangular envelopes and heights.

Direct connections use the selected Bedrock protocol.
ViaProxy connections use supported metadata from the accepted converted server pack.
The hooks require an active client connection and a real `FenceBlock`.
Ordinary Java sessions retain their existing shapes.

The evidence targets official Bedrock 1.26.51.1, build 51061372, protocol 2193.
The core patch records the executable hash and recovered functions.
Its production comparison matches 4,096 native cases and 85,164 raw float bounds without mismatches.
Three add-on tests cover all sixteen connection states, the diagonal collision gap, and world float rounding during rebasing.
The full dependency build passes.

Java still merges the physical arms into a voxel shape and uses its movement solver.
Native connectivity production, ordered collision resolution, and the rendered vanilla fence mesh remain incomplete.
The shape integration does not establish complete movement or visual parity.

Completed direct and ViaProxy recordings join the matching strict BDS fixture and load the converted pack.
Live probes inspect all sixteen state variants through the injected block methods.
They verify the diagonal physical gap, distinct envelope heights, and standing height Y=101.5.
Resource reloads retain the accepted marker and restore the same hooks.
A ViaProxy probe disables the marker and compares the state shape with the original Java block method.
The next reload restores the native hooks.

Separate local-leave probes verify cleared metadata on both routes after spawn.
Those replays intentionally end before the complete scene. They establish cleanup, not successful complete replay or native visual parity.
The completed BDS recordings establish the uninterrupted tested connections.
Native connectivity production, extreme-coordinate collision iteration, and full movement remain separate gaps.
