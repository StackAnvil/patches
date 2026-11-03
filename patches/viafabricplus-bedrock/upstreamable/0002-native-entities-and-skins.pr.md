# feat(bedrock): render custom entities and player skins

## Purpose

Import native Bedrock entity and skin rendering from viafabricplus-bedrock PR #9 as an independently reviewable feature patch.

## Design constraints

Keep per-player appearance and animation state separate from server costumes and equipment. Preserve native geometry, UVs, materials, animated surfaces, and connection-owned resources.

World player surfaces use separate cached materials for native near-camera fading. Shared hands, unrelated actors, and GUI portraits retain their own materials.
The native and Iris programs use the same ordered coverage function. Surviving pixels retain the material depth policy.

Prerequisites:

- viabedrock/0064-evaluate-named-actor-properties.patch: Publish the versioned custom-actor sampler snapshot and immutable evaluated texture bindings.

- cubeconverter/0003-preserve-authored-face-uv-rotations.patch: Preserve authored per-face rotations in parsed geometry and Java item export.

## Validation and remaining limits

Regression coverage includes `MixinIrisJavaAlphaTest`, `BedrockAcceptedResourcesTest`, `BedrockActorDepthGpuTest`, and `BedrockActorGlintFramesTest`.

Official Bedrock 1.26.60.5 (protocol 2225) GPU draws establish the player fade across zero to one block of signed view depth.
The native near-player draws remain two-sided. A matching Java replay initially obscures the lobby with an opaque player head.
`BedrockPlayerFadeGpuTest` checks fixed 8×8 coverage patterns and color/depth preservation through actor, Iris, and fallback shaders.
The shared Iris program also restores full coverage for ordinary draws. These controls preserve the existing material alpha cutoff.

A complete 150-second add-on replay preserves the official scene hash and installs the captured skins unchanged.
The lobby remains visible through nearby players, and the first-person compass remains visible.
This selected scene does not establish complete visual parity or a fresh public-server result.

Native controls establish selected appearances, classic armor masks, and one owned outerwear/chest case. One update after disabling the trusted-skins filter replaces the body and face atlases at five camera blocks. Those bindings remain at 120 camera blocks. Both players stay five blocks apart, so this does not establish distance-driven LOD.

A fresh Java login control delivers every field of the captured owned persona, apart from named tint ordering, but native displays Alex. The trusted-skins filter is off. A later classic update with fresh skin IDs also leaves Alex visible. The native observer stays connected across both Java logins. These controls do not isolate native caching, establish profile parity, or justify a renderer change.

Rapid replacements under each trust policy, distinct LOD selection, other wardrobe categories, broader remote skins, first-person composition, and complete rendering parity remain open.

The [owning patch](0002-native-entities-and-skins.patch) retains implementation rationale and versioned evidence.
