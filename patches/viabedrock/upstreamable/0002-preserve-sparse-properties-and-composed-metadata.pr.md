# fix(metadata): preserve sparse properties and composed actor state

## Purpose

Retain the residual metadata corrections after upstream PR #456. PR #327 is closed; this change is no longer deferred to that proposal. Preserve ordinary Java metadata and spawn properties, and keep native picking transport in the following integration.

## Design constraints

Retain transmitted property indices and immutable actor snapshots. Compose partial flags without clearing unrelated state, and preserve native scale and hitbox ownership.

Prerequisites:

- viabedrock/0064-evaluate-named-actor-properties.patch: Land retained native actor state and property evaluation before the metadata residuals.

## Validation and remaining limits

Regression coverage includes `EntityPropertyRenderTest`, `PlayerCrawlingPoseTest`, `EntityPropertyListTest`, `ActorFlagsMappingTest`.

Remote player updates emit their resolved Java pose even without an earlier crawling transition. Name-only updates do not synthesize posture before native flags arrive. The local player retains prediction outside the existing crawling correction. Regressions cover sneak/stand, sparse flag words, other established posture mappings, and local ownership.

A synthetic colored classic-skin peer uses Bedrock 1.26.60.5/BDS 1.26.60.6 on protocol 2225. Native crouches when its sneaking flag changes; the pre-fix direct Java client remains standing. Slim/wide/slim skin replacements isolate posture from texture changes. These controls do not establish movement simulation, complete body rotation, or the original local custom-skin report.

Rebuilt direct and ViaProxy controls restore crouching and the native foot anchor with identical skin and posture inputs. The combined four-project build passes 3,333 tests with 325 skipped and no failures or errors. Full stack replay, bundle, artifact checksums, and embedded core-class comparisons pass.

Property, pose, scale, and metadata regressions cover selected actors. Full native appearance and interaction parity require separate comparisons.

The [owning patch](0002-preserve-sparse-properties-and-composed-metadata.patch) retains implementation rationale and versioned evidence.
