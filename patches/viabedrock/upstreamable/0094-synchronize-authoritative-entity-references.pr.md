# fix(entities): synchronize authoritative entity references

## Purpose

Translate explicit native reference clearing into Java metadata instead of leaving the previous owner or attack target active. Include elder guardians and preserve full-width negative actor IDs.

## Design constraints

Synchronize runtime/unique identities and actor lifetimes for references shared by prediction, ownership, riding, and rendering. Reject stale or replaced actors.

## Validation and remaining limits

Regression coverage includes `NativeProjectileOwnersTest`, `EntityReferenceMetadataTest`.

Reference and replacement regressions cover the represented boundaries. Native admission, uncommon mount relationships, and complete actor behavior remain separate work.

The [owning patch](0094-synchronize-authoritative-entity-references.patch) retains implementation rationale and versioned evidence.
