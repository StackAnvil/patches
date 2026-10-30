# feat(entities): bridge authoritative native picking hitboxes

## Purpose

Keep native picking boxes, Java interaction proxies and negotiated client snapshots above the shared metadata state. Preserve alias click coordinates, connection lifetimes and ordinary Java interaction fallback.

## Design constraints

Send negotiated actor bounds and atomic picks with exact actor lifetime and hit context. Keep ordinary Java attacks when the capability is unavailable. Preserve block occlusion and server authority. V2 separates physical reach from the padded hit surface and advertises attack support in empty worlds.

Prerequisites:

- viabedrock/0002-preserve-sparse-properties-and-composed-metadata.patch: Land retained metadata and actor bounds before native picking integration.

## Validation and remaining limits

Regression coverage includes `NativeActorAttackTest`, `NativeActorHitboxesTest`, `NativeActorPickingMessageTest`, `InteractionHitboxProxiesTest`, and `ClientPlayerInteractionRangeTest`.

Native 26.60 controls cover selected boat hull, replacement, occlusion, ray, and reach cases.
Current-pin direct and proxy runs match seven armor-stand attack controls, including the return to Survival.
Both routes match eight block controls across stone, fence, diagonal approach, Survival, and Creative.
Ten fresh reticle samples precede each accepted Java input. Server checks also verify block placement or unchanged air.
Survival placement transactions travel inside `PlayerAuthInput`; the journal comparison includes those transactions.
Eye precision, other actor shapes, and overlapping multipart targets remain open.
Successful native attacks emit two `Animate` packets, while these Java controls emit one. Animation packet counts and timing remain open.

The [owning patch](0099-bridge-native-actor-picking-hitboxes.patch) retains implementation rationale and versioned evidence.
