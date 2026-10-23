# Bedrock spatial updates

## Complete received packet metadata, October 23, 2026

The received cache now retains the native movement flags and every unsigned 64-bit interpolation tick.
Sparse packets retain ground, teleport, forced-local, and force-completion bits with the native reserved high bits.
Absolute packets replace these flags and reset the duration to zero, as the native absolute constructor does.
Spawn bootstrap keeps the constructor flags and duration.
Live actor changes remain independent from this received state.

The original sparse handler and full cache publisher pass another 192 controls.
They cover force completion, ground state, removed actors, and durations through `UINT64_MAX`.
Ready-level and actor lookup callbacks plus native local-control storage remain supplied boundaries.
Registered Java handlers match the native flags, duration bits, position, and angles.
All seven packet-cache tests pass without skips.
Truncated durations and dropped force completion each fail the mandatory regression and native comparison.
The restored implementation passes both comparisons and Checkstyle.

This change preserves the complete source for later interpolation target construction.
The existing Java interpolation path still needs replacement with retained native components and their real phases.
These controls do not establish teleport or forced-local admission, complete actor lifetimes, live trajectories, or full interpolation parity.

## Independent received movement state, October 23, 2026

Sparse actor movement now fills omitted coordinates and rotations from the last received movement packet.
Live prediction and other actor writes no longer replace that source.
Both absolute and sparse packets update the retained stream before the local-player admission check.
An ignored local transform therefore still supplies the next sparse packet.
Unknown and removed actors receive no update, and each actor instance owns its retained state.
Initial actor placement supplies the bootstrap before movement packets arrive.
Spawn angles use the native wrap and byte conversion before they enter the received cache.
The live spawn rotation keeps its original float values.

The pinned 1.26.51.1 executable routes delta packets through dispatcher `141732ef0`, callback slot `710`, and derived client handler `14133ef30`.
That handler merges omitted fields from the proxy packet cache.
The original publisher `14103f580` writes the complete received payload before checking whether to ignore the local transform.
The base callback table contains empty handlers, so its entries alone do not establish the derived client behavior.

There are 512 fresh original-handler controls over all six omission bits, ground states, two distinct live positions, and removed actors.
The actual native cache publisher runs and records 256 updates before ignored local transforms.
The fixture supplies ready-level and actor-lookup callbacks plus valid synthetic actor-tag storage.
Later interpolation, complete actor construction, full component lifetimes, and live trajectories remain outside these controls.

Registered Java packet tests match received coordinates and rotations in all 512 native cases.
Mandatory regressions also check ignored local updates and the encoded remote position and rotation after unrelated live writes.
Two private production variants merge live state or discard ignored cache updates.
Both variants fail all three relevant regressions; the restored implementation passes the focused suite and Checkstyle.

The combined four-project build passes 2,533 tests, with 214 optional skips and no failures or errors.
All 1,411 core classes match both packaged copies byte for byte.
The native cache comparison runs without skips.
Offline tooling, static, and patch metadata checks pass.
These results do not claim a fresh live trajectory or a complete interpolation port.

The native spawn path calls `14103ff60` after proxy construction.
That function stores the runtime ID and position, then wraps and packs the three angles into bytes.
It divides by 360 before multiplication by 256.
The previous bootstrap retained full spawn angles, so the first sparse packet used different omitted angles.
For example, the native cache stores pitch 170.15625 for spawn pitch 170.25.

A further 1,024 controls execute two original inline initializers, the complete spawn bootstrap, and the original sparse handler and cache publisher.
They cover all six omission bits, distinct live positions, wrap boundaries, and large finite angles.
The fixture supplies allocation, native frame data, ready-level and actor lookup callbacks, local-control storage, and the CRT remainder operation.
Surrounding spawn-handler flow, complete actor construction, and live packet delivery remain outside this comparison.

The current combined build passes 2,540 tests, with 215 optional skips and no failures or errors.
All five packet-cache tests run without skips, including both native references.
All 1,411 core classes match the add-on and proxy packages byte for byte.
Both deliberate spawn regressions fail the mandatory and native-reference tests.
The restored implementation passes both comparisons and Checkstyle.
The full 104-patch core stack replays successfully.

This fixes the packet-source prerequisite for native interpolation and collider refresh.
Retained interpolation components, force-completion routing, complete input phases, and native trajectory parity remain unfinished.

Partial movement packets preserve every omitted coordinate. This applies to remote actors and forced local-player corrections.

## Spatial optimization hints

The [Mojang 1.26.51 metadata archive](https://github.com/Mojang/bedrock-protocol-docs/releases/tag/v1.26.51) defines protocol 2193 `MotionPredictionHintsPacketPayload`.
It carries an unsigned runtime ID, three float motion components, and a ground-state boolean.
Unlike `SetActorMotion`, this packet has no tick field. Servers use it when spatial optimizations omit ordinary velocity updates.

Both packets share the Java velocity writer. Prediction hints also update the tracked ground state without changing actor position.
Unknown or removed actors produce no Java update. Their packets are still consumed completely.

## Verification

Registered-handler tests decode the resulting Java velocity packet and verify signed motion, runtime IDs above 32 bits, ground transitions, and removed actors.
The existing tests verify omitted position coordinates. These checks establish translation behavior, not native movement parity across every entity.

The replayed ViaBedrock build passes 341 tests without failures or skips, plus Checkstyle.
