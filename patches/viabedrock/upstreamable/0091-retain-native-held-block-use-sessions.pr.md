# Native held block-use sessions

Bedrock 26.60 retains one start action across a physical use hold.
The previous Java translation sent a start and stop for every use-on-block packet.
It opened a trapdoor where native Bedrock placed a closed neighbor.

Transport the control lifetime and match each local prediction result to its Java sequence number.
Use `Player_Input` for the first attempt and `Simulation_Tick` for repeats.
Start the native session when prediction succeeds; stop on release, cancellation, or capability withdrawal.
A failed first prediction does not start a session or submit an inventory delta.
Clients without the channels keep independent block uses.

Native input follows its first successful block use-on with a use-in-air phase.
It carries the original held snapshot, an unknown trigger, and a failed placement result.
Match that phase instead of skipping it after Java reports successful placement.
Use empty inventory-action lists, matching both Creative and Survival captures.
The server consumes placed blocks authoritatively.

## Evidence and validation

Matching native 1.26.60.5 and BDS 1.26.60.6 captures use protocol 2225.
Native sessions cover camera changes, separate trapdoor targets, material changes, release, height limits, and pause cancellation.
Controlled relay probes remove start/stop actions or the use-in-air phase separately.
Both probes lose the original facing while simulation repeats still suppress ordinary activation.
The unmodified Survival reference consumes two blocks and retains the first facing.
Raw journals, screenshots, and proprietary resources remain private.

All four project builds and the modpack bundle pass.
Core: 2,044 tests, zero failures/errors, 176 optional skips.
Add-on: 1,278 tests, zero failures/errors, 142 optional skips.
CubeConverter: 21 tests; ViaProxy: four tests; no failures/errors.
Five focused core tests cover held state, ordinary clients, sequence ownership, failed attempts, release, and the native use phase.

The corrected Java Creative fixture retains facing, half, and closed state across a 90-degree camera change.
Switching to birch during the hold retains that orientation.
A fresh click after release opens the original trapdoor normally.
Survival consumes the correct two blocks, but its authoritative facing still follows the changed camera direction.
Survival facing, cancellation, server rejection/correction, and proxy comparisons remain open acceptance gates.
