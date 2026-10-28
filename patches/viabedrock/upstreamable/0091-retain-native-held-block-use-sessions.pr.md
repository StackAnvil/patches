# Native held block-use sessions

Bedrock 26.60 retains one start action across a physical use hold.
The previous Java translation sent a start and stop for every use-on-block packet.
It opened a trapdoor where native Bedrock placed a closed neighbor.

Transport the control lifetime and match each local prediction to its concluding Java sequence number.
Prediction format 2 distinguishes placement, interaction, and failure and carries the native cursor relative to the target.
Native held placement reuses its first world hit, including coordinates outside later target cubes.
The core preserves those coordinates and rejects non-finite values or stale sequence ownership.

Use `Player_Input` for the first attempt and `Simulation_Tick` for repeats.
Start the native session when prediction succeeds. Release, cancellation, and capability withdrawal stop it.
A failed local prediction does not start a session or submit a placement delta.
Clients without the channels keep independent block uses.

Native Survival predicts one consumed block for successful local placement.
The first placement also sends a use-in-air phase with the remaining stack.
The last block uses request ID zero and omits the empty use-in-air phase.
Creative placements and ordinary interactions carry no placement delta.
The inventory owns one even legacy ID sequence for placements and other legacy transactions, independently of odd stack requests.
Authoritative responses correct predicted counts without duplicate equipment echoes.

## Evidence and validation

Native 1.26.60.5 and BDS 1.26.60.6 fixtures use protocol 2225.
Fresh Survival fixtures force the native game mode and verify its HUD and inventory predictions.
Earlier captures combined a Creative client default with server Survival consumption and did not establish the Survival inventory format.
Raw journals, screenshots, and proprietary resources remain private.

Physical mouse rotation now retains the initial facing, upper-half state, and closed state in native, direct Java, and ViaProxy fixtures.
Both Java routes consume two items, leaving 62 from 64.
The add-on polls held repeats after input movement, before the next network tick publishes rotation.
Earlier teleport fixtures demonstrate that camera packet order affects authoritative facing.
The implementation accepts server correction instead of forcing an orientation.

Native and direct Java retry a rejected first placement without restarting the held session.
Native and ViaProxy also replace a server-removed trapdoor during the hold.
Direct Java and ViaProxy pause cancellation stop active sessions before physical release.
Exhausting the held stack restores empty-hand interaction with fresh hit coordinates.
Fresh activation uses the existing native outline and does not synthesize the placement-only air phase.

Fresh native and ViaProxy sessions also match repeated rejection followed by rotation.
They activate the existing trapdoor and retain 64 items after each inventory correction.
After a preceding successful hold, both native and ViaProxy instead place a neighbor and consume one item.
Matching session history explains the earlier apparent correction mismatch.
The translator preserves both authoritative outcomes.

All four project builds and the modpack bundle pass.
Core: 2,050 tests, zero failures/errors, 176 optional skips.
Add-on: 1,281 tests, zero failures/errors, 142 optional skips.
CubeConverter: 21 tests. ViaProxy: four tests. Neither reports failures or errors.
Focused tests cover held state, sequence ownership, cursor validation, use phases, inventory prediction, and independent request IDs.
