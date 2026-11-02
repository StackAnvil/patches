# Native held item use

Coordinate food retries and block placement through one client input owner.
Inventory consumption and completion remain server-owned.

Food and the first block-item air phase share a strict 200 ms monotonic deadline.
Fresh calls retain that deadline after release.
Frame repeats run after camera input.
Select food from its transported component, including custom items carried as paper.
A refused first food request retains block continuation while still recording the air deadline.
The first rejected block placement also performs one air use and acquires untimed block continuation.
Java normally stops before that air phase on `FAIL`.
The client permits that first fallback and prevents later air or offhand fallback.
Already admitted air use retains its route after hunger fills or the selected item changes.
Block continuation bypasses the air deadline and cannot fall through to eating.
Offhand fallback cannot take over an owned hold.
Release and screens retire the mode; the connection retains its air deadline until replacement.
Missing optional block-use channels do not clear the air-use hold or deadline.

Placement has a separate strict delay: 300 ms before a line is established and 200 ms afterward.
Successful local use restarts it; failed repeats do not.
The frame owner suppresses Java's parallel four-tick path.
A first successful placement records the air deadline when blocks remain.
Core already sends that air phase, so the client does not send another transaction.
Held placement success does not refresh the air deadline.
Last-block placement and block activation do not create an air deadline.

## Placement selection

Adjacent build attempts establish a retained direction and next cell.
For a block hit, test the visible ray segment against that cell before dispatching use.
If it intersects, use the retained support and face while keeping the original world hit location.
A failed placement keeps the pending cell; successful placement advances it.
Release, screens, and connection replacement clear this state.
The owning patch records the matching native implementation and float arithmetic.

Trapdoors also retain the first predicted facing, half, and world hit across material changes, temporary item-family changes, correction, and exhaustion.
Apply that orientation only to trapdoors and preserve independent water, power, open state, and material properties.
Returning to a trapdoor restores its snap.
Separate trapdoors and the original support remain valid targets.

Send physical use lifetime and sequence-owned prediction before the concluding Java packet.
Prediction format 2 carries the result and native cursor, including coordinates outside the selected support cube.
Use the active Bedrock connection for native outlines and occlusion, including ViaProxy sessions with a local Java protocol target.
The visible raycast remains unchanged.

## Evidence and validation

Official Bedrock 1.26.60.5 and BDS 1.26.60.6 establish the selected behavior on protocol 2225.
Runtime tracing distinguishes fresh input, admitted air holds, and initially refused food.
It also observes the retained next-cell ray test, advancement, rejection, and clock transition.
First-rejected Stone and trapdoor controls send failed block use, one air use, then immediate frame retries.
Unattached Stone selects the same block continuation.
Successful placement, last-block placement, and trapdoor activation establish the distinct air phases above.

Fresh and refused-food Stone controls place two blocks, then reject a new top hit outside the pending cell.
Re-aiming onto the floor crosses that cell and places a third block through the retained north face.
The cursor keeps its original world location, yielding a negative relative Z coordinate.
Player-collision failures retain the next cell.
Returning to the old aim stops those attempts; a fresh press after release can use the top face.

Ten input-state regressions cover ownership, hand/target routing, initial rejection, clocks, last-stack placement, release, connection reset, and rollover.
Eight path regressions cover native float points, rejection, advancement, all six axes, release, line delays, precision limits, and failed-attempt history.
Five trapdoor regressions cover orientation, materials, independent properties, targets, frozen hits, and ordinary blocks.
Unit cases for all axes do not establish live native parity in every direction.

Installed direct and ViaProxy controls cover the formerly failing Stone cases, re-aiming, rejected placement, and fresh use after release.
First-rejected Stone and trapdoor controls send one native air payload, then immediate simulation retries without consuming items.
Their air fields and fresh/simulation triggers match native, excluding player-coordinate equality.
Both routes also verify unattached block use, first-success air use, last-stack exclusion, and activation without air use.
Both routes also retain the six timed/refused-food controls, three earlier hold-mode controls, release/Pause, and eleven food-admission cases.
The [food-use validation](../../viabedrock/deferred/0008-signal-sustained-bedrock-item-use.pr.md) records admission and use-cycle limits.
The full four-project build passes 3,302 tests, with 325 skipped and no failures or errors.
Installed JAR checksums match the build.

Earlier trapdoor fixtures cover camera and material changes, cancellation, reconciliation, and specific rejection histories.
Fresh native and proxy sessions match repeated rejection followed by rotation without consumption.
After a preceding successful hold, both can instead place a neighbor and consume one item.

## Remaining limits

Live build-height limits, moving placement, and air/entity target dispatch need more native comparisons.
Other initial use families, mixed-use state, and complete input phases also remain open.
An unchanged stack does not prove repeat-timing parity.
Frame cadence changes retry and instant-food counts, so these controls do not establish equal coordinates or complete scheduling parity.
Short native rapid-click trials did not sample every physical edge and do not establish edge parity.
The original intermittent animation-without-feeding report remains open.
