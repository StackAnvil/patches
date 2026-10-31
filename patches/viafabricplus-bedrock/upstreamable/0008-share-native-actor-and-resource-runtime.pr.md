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

Regression coverage includes `BedrockActorAnimationTest`, `BedrockActorQueriesTest`, `BedrockActorRenderSelectionTest`, `BedrockActorScaleTest`, and `BedrockActorPickingStateTest`.

Native current/older/current cat and audio controls establish selected resource paths. Complete pose alignment, audio, particle, query, and visual parity remain unfinished.

Three native 26.60 non-cardinal picking controls establish the camera ray calculation.
Direct and proxy runs use matching vectors and preserve non-camera behavior.
Outgoing hit coordinates differ by at most 0.000031 blocks for those controls.

Current-pin direct and proxy runs match seven native armor-stand reach outcomes and eight block reach outcomes.
Block controls cover stone, fence, diagonal approach, Survival, and Creative, with fresh reticle samples before every accepted input.
Small differences in facing and eye height remain. These outcomes do not establish equal ray coordinates or complete picking parity.
Other actor shapes and multipart target ordering remain open.

A native Bedrock 1.26.60.5 control covers a plain offhand shield with an oak log in the main hand.
Crouching raises and tilts the shield. Releasing crouch restores the resting pose.
The installed add-on retains these transitions on local BDS 1.26.60.6 through NetherNet HTTP, using crouch and Use inputs.
Read-only controller snapshots show that blocking clears and the resting transform returns after either input.
Opening and closing the Survival inventory leaves the resting shield transform unchanged in early and later samples.
These controls do not reproduce the reported extreme shield pose.
Movement, hit reactions, patterned shields, and third-party mod combinations remain open.

Animation timelines retain the remaining animation when an individual Molang string has a syntax error.
The failed script keeps a zero-valued entry at its authored time. Structural validation and resource limits still reject invalid input.
A native Bedrock 1.26.60.5 local-world control places MegaSMP's captured invalid string between valid assignments.
The trial and control cubes reach the same raised position, including the later timeline update.
The installed executable's loaded PE sections match the pinned reference. Its headers and signing data differ.
The playback regression fails before the correction with the live actor's parser error and passes afterward.
The full four-project build and fresh patch replay pass.
An installed complete MegaSMP packet replay preserves all scene payloads, loads the pack, and acknowledges gameplay.
Both `mvmodels:holy_knight` and `mvmodels:mecha_oondasta` retain loaded graphs and non-empty poses.
The overall rendering check still fails on unresolved mappings, including the custom block gaps.
This control does not establish every malformed expression's recovery or complete public-server actor appearance.

The [owning patch](0008-share-native-actor-and-resource-runtime.patch) retains implementation rationale and versioned evidence.
