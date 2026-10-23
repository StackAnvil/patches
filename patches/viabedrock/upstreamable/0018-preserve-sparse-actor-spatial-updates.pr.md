# Bedrock spatial updates

## Independent received movement state, October 23, 2026

Sparse actor movement now fills omitted coordinates and rotations from the last received movement packet.
Live prediction and other actor writes no longer replace that source.
Both absolute and sparse packets update the retained stream before the local-player admission check.
An ignored local transform therefore still supplies the next sparse packet.
Unknown and removed actors receive no update, and each actor instance owns its retained state.
Initial actor placement supplies the bootstrap before movement packets arrive.
Exact native constructor defaults remain unverified.

The pinned 1.26.51.1 executable routes delta packets through dispatcher `141732ef0`, callback slot `710`, and derived client handler `14133ef30`.
That handler merges omitted fields from the proxy packet cache.
The original publisher `14103f580` writes the complete received payload before checking whether to ignore the local transform.
The base callback table contains empty handlers, so its entries alone do not establish the derived client behavior.

There are 512 fresh original-handler controls over all six omission bits, ground states, two distinct live positions, and removed actors.
The actual native cache publisher runs and records 256 updates before ignored local transforms.
The fixture supplies ready-level and actor-lookup callbacks plus valid synthetic actor-tag storage.
Later interpolation, native constructor defaults, full component lifetimes, and live trajectories remain outside these controls.

Registered Java packet tests match received coordinates and rotations in all 512 native cases.
Mandatory regressions also check ignored local updates and the encoded remote position and rotation after unrelated live writes.
Two private production variants merge live state or discard ignored cache updates.
Both variants fail all three relevant regressions; the restored implementation passes the focused suite and Checkstyle.

The combined four-project build passes 2,533 tests, with 214 optional skips and no failures or errors.
All 1,411 core classes match both packaged copies byte for byte.
The native cache comparison runs without skips.
Offline tooling, static, and patch metadata checks pass.
These results do not claim a fresh live trajectory or a complete interpolation port.

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
