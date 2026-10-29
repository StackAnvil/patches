# feat(entities): bridge authoritative native picking hitboxes

## Purpose

Keep native picking boxes, Java interaction proxies and negotiated client snapshots above the shared metadata state. Preserve alias click coordinates, connection lifetimes and ordinary Java interaction fallback.

## Design constraints

Send negotiated actor bounds and atomic picks with exact actor lifetime and hit context. Keep ordinary Java attacks when the capability is unavailable. Preserve block occlusion and server authority.

Prerequisites:

- viabedrock/0002-preserve-sparse-properties-and-composed-metadata.patch: Land retained metadata and actor bounds before native picking integration.

## Validation and remaining limits

Regression coverage includes `NativeActorAttackTest`, `NativeActorHitboxesTest`, `NativeActorPickingMessageTest`, `InteractionHitboxProxiesTest`.

Direct and proxy controls cover selected boat hull, replacement, occlusion, and hurt-countdown cases. Exact native ray arithmetic and broader block/entity picking remain open.

The [owning patch](0099-bridge-native-actor-picking-hitboxes.patch) retains implementation rationale and versioned evidence.
