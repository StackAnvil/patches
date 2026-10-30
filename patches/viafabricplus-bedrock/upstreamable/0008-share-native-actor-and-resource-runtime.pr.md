# feat(runtime): share native actor animation and resource playback

## Purpose

Provide the shared float Molang, actor graph, geometry, accepted resource, sound and particle runtime before account appearance management. Keep native event timing, resource limits and connection lifetimes together so server actors and equipped models can consume the same implementation without Character Creator account access.

## Design constraints

Share actor-local graph, Molang, material, particle, and audio runtimes. Resolve all vanilla resources from one world-version context before server overrides. Retire cached and mutable state on its owning lifetime.

Prerequisites:

- viabedrock/0064-share-native-float-molang-runtime.patch: Publish the shared native float parser, math and control-flow API.

- viabedrock/0064-evaluate-named-actor-properties.patch: Publish versioned actor state and verified integer-query bindings.

- viabedrock/0015-transport-native-resources-and-sound-commands.patch: Publish native resource, sound and block snapshot contracts.

- viabedrock/0099-bridge-native-actor-picking-hitboxes.patch: Publish the negotiated picking message used by the actor adapter.

- cubeconverter/0002-preserve-actor-lighting-controls.patch: Publish ordered render-controller material and visibility declarations.

- viabedrock/0085-resolve-server-effects-relative-to-their-actor.patch: Publish native animation-controller command snapshots consumed by the shared graph runtime.

## Validation and remaining limits

Regression coverage includes `BedrockActorAnimationTest`, `BedrockActorQueriesTest`, `BedrockActorRenderSelectionTest`, `BedrockActorScaleTest`.

Native current/older/current cat and audio controls establish selected resource paths. Complete pose alignment, audio, particle, query, and visual parity remain unfinished.

Three native 26.60 non-cardinal picking controls establish the camera ray calculation. Direct and proxy runs use matching vectors and preserve non-camera behavior. Outgoing hit coordinates differ by at most 0.000031 blocks. Eye precision, hull geometry, and broader reach rules still need comparison.

The [owning patch](0008-share-native-actor-and-resource-runtime.patch) retains implementation rationale and versioned evidence.
