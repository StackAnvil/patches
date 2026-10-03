# Server player input permissions

## Purpose

Apply the core permission snapshot before Java gameplay prediction.
Filter the keyboard sample and recalculate its normalized movement vector.
Discard locked mouse look and clear smoothing history. Menu input remains available.
Apply jump permissions to Java auto-jump as well as the keyboard sample.
The payload channel works through direct connections and ViaProxy.
Remote disconnect and local world exit clear the connection's permissions before another server can receive input.

## Target evidence

The [core patch](../../viabedrock/upstreamable/0080-retain-and-transport-native-player-permissions.pr.md) records target packet evidence from BDS 1.26.51.1, protocol 2193.
Core owns the mask, category hierarchy, and auth input filtering.
Java has no standard packet that expresses these local input restrictions.
This patch applies the shared policy to Java 26.3 gameplay controls.

## Testing and limits

The full build passes with 867 tests passed and 110 skipped.
Tests cover normalized diagonals, opposing controls, directional filtering, held controls, reset, and connection cleanup.
Live direct and ViaProxy joins receive the target server's permission replacements and resets.
Locked W input leaves the player's position unchanged. Reset permits movement again.
The live keyboard sample keeps only allowed directions and retains a unit diagonal vector.
The actual mouse-look hook preserves yaw while locked and rotates after reset.
The actual auto-jump method respects jump and movement locks.
A local exit while camera input is locked clears the permissions to zero.
Manual vehicle mounting and broader native input comparisons remain incomplete.
Mount permissions survive transport, but this patch does not block manual mounting interactions.
