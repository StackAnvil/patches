# fix(skins): encode current Bedrock skin packets

## Purpose

PlayerSkinPacket uses varint list lengths, numeric persona enums, UUID pack IDs, and fixed-width colors. Preserve the trailing trust fields so decoded skins can be sent back without discarding them. This enables connected skin changes and prevents malformed packets.

## Design constraints

Reuse the target skin codec for complete fragmented appearance transport. Preserve immutable configuration snapshots and retire stale uploads. Confirm local changes only after a matching server appearance.

## Validation and remaining limits

Regression coverage includes `NativeSkinChangeTest`, `NativeSkinTransportTest`, `SkinProviderTest`, `NativeSkinStorageTest`.

Direct and proxy controls preserve complete skin records. Actor graphs, equipment, emote assets, and full native appearance require their separate rendering paths.

The [owning patch](0047-encode-current-bedrock-skin-packets.patch) retains implementation rationale and versioned evidence.
