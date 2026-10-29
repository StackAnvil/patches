# feat(entities): apply native fishing feedback

## Purpose

Apply ViaBedrock's bite message to the current fishing hook on the client thread. Require the active connection and the exact Java spawn UUID so queued messages cannot affect a replaced hook, another entity, or another connection. Preserve horizontal motion and delegate float vertical addition to the core calculation verified against the pinned native executable.

## Design constraints

Apply additive bite motion to the exact spawned hook on the client thread. Preserve native float arithmetic, event ordering, particle distance, and connection lifetime.

## Validation and remaining limits

Regression coverage includes `ParticleViewDistanceSettingTest`.

Native and recorded controls cover selected bite, approach, tease, and wake paths. Complete fishing visuals, sound, and broader gameplay parity remain unverified.

The [owning patch](0028-apply-native-fishing-bite-impulses.patch) retains implementation rationale and versioned evidence.
