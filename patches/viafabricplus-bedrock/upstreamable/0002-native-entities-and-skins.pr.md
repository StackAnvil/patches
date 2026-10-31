# feat(bedrock): render custom entities and player skins

## Purpose

Import native Bedrock entity and skin rendering from viafabricplus-bedrock PR #9 as an independently reviewable feature patch.

## Design constraints

Keep per-player appearance and animation state separate from server costumes and equipment. Preserve native geometry, UVs, materials, animated surfaces, and connection-owned resources.

Prerequisites:

- viabedrock/0064-evaluate-named-actor-properties.patch: Publish the versioned custom-actor sampler snapshot and immutable evaluated texture bindings.

- cubeconverter/0003-preserve-authored-face-uv-rotations.patch: Preserve authored per-face rotations in parsed geometry and Java item export.

## Validation and remaining limits

Regression coverage includes `MixinIrisJavaAlphaTest`, `BedrockAcceptedResourcesTest`, `BedrockActorDepthGpuTest`, `BedrockActorGlintFramesTest`.

Native controls establish selected appearances, classic armor masks, and one owned outerwear/chest case. One update after disabling the trusted-skins filter replaces the body and face atlases at five camera blocks. Those bindings remain at 120 camera blocks. Both players stay five blocks apart, so this does not establish distance-driven LOD.

A fresh Java login control delivers every field of the captured owned persona, apart from named tint ordering, but native displays Alex. The trusted-skins filter is off. A later classic update with fresh skin IDs also leaves Alex visible. The native observer stays connected across both Java logins. These controls do not isolate native caching, establish profile parity, or justify a renderer change.

Rapid replacements under each trust policy, distinct LOD selection, other wardrobe categories, broader remote skins, first-person composition, and complete rendering parity remain open.

The [owning patch](0002-native-entities-and-skins.patch) retains implementation rationale and versioned evidence.
