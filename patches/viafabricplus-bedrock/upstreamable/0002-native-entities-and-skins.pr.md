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

Native and replay controls establish selected appearances, classic armor masks, and one owned outerwear/chest case. A free-camera fixture keeps players five blocks apart while native draws retain the original persona body and face atlases through 120 camera blocks.

A native 26.60 observer journal confirms delivery of the requested profile images. With the trusted-skins filter enabled, draws retain the previous persona after a delivered Steve update. A later request after disabling the filter replaces the body and face atlases at five camera blocks, and those bindings remain at 120 blocks. The players stay five blocks apart. This sequence does not isolate trust validation from native caching or establish a separate LOD texture.

Rapid replacements under each trust policy, distinct LOD selection, other wardrobe categories, broader remote skins, first-person composition, and complete rendering parity remain open.

The [owning patch](0002-native-entities-and-skins.patch) retains implementation rationale and versioned evidence.
