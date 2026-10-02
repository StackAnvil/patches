# Bedrock spatial updates

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
