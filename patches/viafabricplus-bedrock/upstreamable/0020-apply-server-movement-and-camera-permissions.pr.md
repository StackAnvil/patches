# Server player input permissions

## Purpose

Apply the core permission snapshot before Java gameplay prediction.
Filter the keyboard sample and recalculate its normalized movement vector.
Discard locked mouse look and clear smoothing history. Menu input remains available.
Apply jump permissions to Java auto-jump as well as the keyboard sample.
The payload channel works through direct connections and ViaProxy.
Send physical samples before filtering only when the core advertises the raw-input channel.
Send changed samples and the first sample of each connection.
Reset raw sample history with connection permissions.
Remote disconnect and local world exit clear the connection's permissions before another server can receive input.

## Target evidence

The [core patch](../../viabedrock/upstreamable/0080-retain-and-transport-native-player-permissions.pr.md) records target packet evidence from BDS 1.26.51.1, protocol 2193.
Core owns the mask, category hierarchy, and auth input filtering.
Java has no standard packet that expresses these local input restrictions.
This patch applies the shared policy to Java 26.3 gameplay controls.

## Testing and limits

Live BDS 1.26.51.1 tests through direct connections and ViaProxy preserve raw diagonal movement, jump, and sneak while the permission mask remains 4.
The native client and Java connection report the same diagonal components, about (-0.70710677, 0.70710677), for forward and right.
The server position stays fixed, and release returns the raw vector and buttons to their idle state.
The full build passes with 872 tests passed and 110 skipped.
Tests cover normalized diagonals, opposing controls, directional filtering, held controls, reset, and connection cleanup.
Live direct and ViaProxy joins receive the target server's permission replacements and resets.
Locked W input leaves the player's position unchanged. Reset permits movement again.
The live keyboard sample keeps only allowed directions and retains a unit diagonal vector.
The actual mouse-look hook preserves yaw while locked and rotates after reset.
The actual auto-jump method respects jump and movement locks.
A local exit while camera input is locked clears the permissions to zero.
Manual vehicle mounting and broader native input comparisons remain incomplete.
Mount permissions survive transport, but this patch does not block manual mounting interactions.
