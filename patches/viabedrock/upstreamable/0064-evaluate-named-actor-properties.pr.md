# feat(entities): evaluate named actor properties and pre-animation

## Purpose

Build actor property binding and native state transport on the preceding shared float Molang runtime.

## Design constraints

Bind typed named properties before pre-animation and controller selection. Retain sparse actor state and complete sampler inputs through negotiated snapshots. Reevaluate time-dependent selections without leaking actor-local variables.

Prerequisites:

- viabedrock/0064-share-native-float-molang-runtime.patch: Land the bounded float runtime before actor property evaluation.


## Validation and remaining limits

Regression coverage includes `NativeActorBoundsMessageTest`, `NativeActorEntityTest`, `NativeActorIntegerQueriesTest`, `NativeActorMessageTest`.

Physical dimension projection retains finite negative scale and clamps the scaled result to 0.005 blocks before checking the upper bound.
Metadata projection and negotiated consumers share this calculation. Raw scale and base dimensions remain available in snapshots.

Original 1.26.60.5 controls execute typed float metadata construction, Scale (38) admission, component storage, size updates and boat offset initialization.
They include negative multiplication overflow, zero scale, ordinary positive scale and the initialization guard.
The compiled bridge matches 24 active controls across 216 dimension, bounds and origin fields, with exact bounds-codec round trips.
The metadata-to-bounds regression fails before the fix. Complete native world construction, initialization dispatch and mounted trajectories remain unverified.

Targeted graph and transport tests cover known inputs. Unavailable queries, unsupported controller behavior, and complete native visuals remain explicit gaps.

The [owning patch](0064-evaluate-named-actor-properties.patch) retains implementation rationale and versioned evidence.
