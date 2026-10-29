# fix(metadata): preserve sparse properties and composed actor state

## Purpose

Retain the residual metadata corrections after upstream PR #456. PR #327 is closed; this change is no longer deferred to that proposal. Preserve ordinary Java metadata and spawn properties, and keep native picking transport in the following integration.

## Design constraints

Retain transmitted property indices and immutable actor snapshots. Compose partial flags without clearing unrelated state, and preserve native scale and hitbox ownership.

Prerequisites:

- viabedrock/0064-evaluate-named-actor-properties.patch: Land retained native actor state and property evaluation before the metadata residuals.

## Validation and remaining limits

Regression coverage includes `EntityPropertyRenderTest`, `PlayerCrawlingPoseTest`, `EntityPropertyListTest`, `ActorFlagsMappingTest`.

Property, pose, scale, and metadata regressions cover selected actors. Full native appearance and interaction parity require separate comparisons.

The [owning patch](0002-preserve-sparse-properties-and-composed-metadata.patch) retains implementation rationale and versioned evidence.
