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
Use the current permitted keyboard press during crouch selection, before Java refreshes its input sample.
Keep the previous pressed sample for the final slow release step expected by BDS.
Retain Java's pose eligibility and speed attributes.
The core channel activates this behavior through direct connections and ViaProxy.
Other input implementations retain their existing behavior.

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

### Strict BDS sneak transitions

The native 1.26.51 client and strict BDS 1.26.51.1 provide the baseline on flat stone.
The first Java sneak step originally moved 0.098 blocks while BDS expected 0.0294 blocks.
Two recorded repeats each received three prediction corrections.
Java 26.3 computes crouching before `KeyboardInput.tick` updates the current key sample.
The press hook removes this stale input delay while preserving the server permission check.

Immediate release also produced corrections while the player continued walking.
BDS expected a final slow step on the `StopSneaking` frame.
The hook retains the previous pressed sample for this release frame.
The final ViaProxy journal contains no prediction corrections during six movement segments.
These include two sneak starts, a walking press/release sequence, disabled sneak, walking, and sprinting.
Disabled sneak retains an ordinary walking step and sends no simulated sneak flags.
One stationary zero-velocity correction follows a fixture teleport, outside those segments.
Core tests pass: 624 total, 19 skipped, no failures.
Add-on tests pass: 600 total, 116 skipped, no failures.
Native packet comparisons, other controls, and the complete movement matrix remain open.

### Fluid prediction through ViaProxy

The same permission snapshot now activates existing Bedrock fluid hooks through ViaProxy.
Direct protocol selection still activates them before the first snapshot.
The Java-facing proxy protocol previously left these hooks disabled.
Strict BDS 1.26.51.1 records ten moving prediction corrections in the original held water-rise case, while direct has none.
Two rebuilt proxy repeats record no water corrections.
The first sampled peak and maximum rise velocity match the direct case exactly.
The second sampled peak differs from the native baseline by less than 0.000008 blocks.
These results verify this fixture, not the complete fluid movement matrix.

A read-only BDS observer samples 120 server ticks per case without changing movement or checks.
The native, direct, and proxy held-jump cases reach Y=102.252197265625 from Y=101.
The fixed proxy retains native sampled jump and five-block fall endpoints.
Two moving corrections around elevated teleports remain unresolved on direct and rebuilt proxy routes.
Auth-input swimming transitions still require the local core and need remote transport in separate work.
Currents, shallow water, lava, effects, vehicles, and broader native trajectories remain open.

The full build contains 16 converter, 624 core, and 603 add-on tests with no failures or errors.
Core and add-on suites skip 19 and 116 optional cases respectively.

## Raw-input resampling

Permission snapshots and observed transport loss clear the existing raw-input dedup sample.
The next eligible capture sends the current physical input once, then resumes normal dedup.
Private actual callback and joined packet fixtures cover unchanged held input, withdrawal, reconnect and unrelated HUD snapshots.
The original callback fails the resampling control; the candidate passes seven callback controls, sixteen joined packet observations and three history sequences.
Existing permission tests remain unchanged.
Those complex transport fixtures stay private because Mockito belongs to a later test owner.
