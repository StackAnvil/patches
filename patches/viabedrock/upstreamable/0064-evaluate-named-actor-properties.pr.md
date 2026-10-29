# feat(entities): evaluate named actor properties and pre-animation

## Purpose

Build actor property binding and native state transport on the preceding shared float Molang runtime.

## Design constraints

Bind typed named properties before pre-animation and controller selection. Retain sparse actor state and complete sampler inputs through negotiated snapshots. Reevaluate time-dependent selections without leaking actor-local variables.

Prerequisites:

- viabedrock/0064-share-native-float-molang-runtime.patch: Land the bounded float runtime before actor property evaluation.

- cubeconverter/0002-preserve-actor-lighting-controls.patch: Publish ordered material assignments, including repeated patterns, before evaluating actor materials.

## Validation and remaining limits

Regression coverage includes `NativeActorBoundsMessageTest`, `NativeActorEntityTest`, `NativeActorIntegerQueriesTest`, `NativeActorMessageTest`.

Targeted graph and transport tests cover known inputs. Unavailable queries, unsupported controller behavior, and complete native visuals remain explicit gaps.

The [owning patch](0064-evaluate-named-actor-properties.patch) retains implementation rationale and versioned evidence.
