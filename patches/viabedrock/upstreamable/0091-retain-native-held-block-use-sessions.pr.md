# Native held block-use sessions

Bedrock 26.60 retains one start action across a physical use hold.
The previous Java translation sent a start and stop for every use-on-block packet.
It opened a trapdoor where native Bedrock placed a closed neighbor.

Transport the control lifetime and match each local prediction to its concluding Java sequence number.
Prediction format 2 distinguishes placement, interaction, and failure and carries the native cursor relative to the target.
Native held placement reuses its first world hit, including coordinates outside later target cubes.
The core preserves those coordinates and rejects non-finite values or stale sequence ownership.
The Java raycast packet remains unchanged for other consumers.

Use `Player_Input` for the first attempt and `Simulation_Tick` for repeats.
Start the native session when prediction succeeds. Release, cancellation, and capability withdrawal stop it.
A failed first prediction does not start a session or submit an inventory delta.
Clients without the channels keep independent block uses.

Native input follows its first successful block use-on with a use-in-air phase and the original held snapshot.
Empty inventory-action lists match Creative and Survival captures. The server consumes placed blocks authoritatively.
Successful uses send native build or interaction swings.
Java 26.3 right-click swings stay local, so they cannot reserve the next attack packet for cancellation.

## Evidence and validation

Matching native 1.26.60.5 and BDS 1.26.60.6 captures use protocol 2225.
Native sessions cover camera changes, separate targets, material changes, release, height limits, and pause cancellation.
Seven continuation placements preserve the initial world hit.
Raw journals, screenshots, and proprietary resources remain private.

Earlier native teleport fixtures placed before the camera update reached BDS.
Their retained authoritative facing did not establish a server direction lock.
A controlled Survival fixture sends the new yaw before the next placement.
Native, direct Java, and ViaProxy then receive the same changed facing from BDS.
All three retain the closed upper-half state and consume two items, leaving 62 from 64.
The implementation accepts authoritative correction instead of forcing an orientation.

Native relay probes omit start/stop actions, the first use phase, or build swings.
The first two lose retained facing, but camera ordering prevents a causal conclusion.
The build-swing control retains facing.

Native and ViaProxy replace a server-removed trapdoor during the hold and consume the replacement authoritatively.
Direct Java and ViaProxy pause cancellation stop active sessions before the held mouse button releases.
The proxy pause fixture stops after 1.145 seconds of a 5.5-second physical hold.
Fresh clicks use the native 0.8125 bottom hit height and activate the trapdoor normally.

All four project builds and the modpack bundle pass.
Core: 2,048 tests, zero failures/errors, 176 optional skips.
Add-on: 1,279 tests, zero failures/errors, 142 optional skips.
CubeConverter: 21 tests. ViaProxy: four tests. Neither reports failures or errors.
Nine focused core tests cover held state, sequence/result/cursor ownership, failed attempts, release, codec validation, and the native use phase.

Physical mouse rotation and rejection of the first predicted placement remain open acceptance gates.
