# feat(render): use supported native world actor definitions

## Purpose

Ordinary mapped Java entities previously skipped the bundled Bedrock client entity definitions. Resolve the target 1.26.51.1 definition beneath accepted packs and retain independent native animation lifetimes, materials, bone visibility and authoritative actor state. The bundled end crystal uses its authored rotation instead of a camera-facing approximation.

## Design constraints

Replace mapped Java appearance only when the selected native definition and active surfaces resolve. Preserve ordinary equipment and fallback behavior and keep actor graphs tied to their resource generation.

Prerequisites:

- viafabricplus-bedrock/0002-native-entities-and-skins.patch: Resolve inherited material depth predicates before selecting native actor occlusion policy.

- viafabricplus-bedrock/0008-share-native-actor-and-resource-runtime.patch: Use shared accepted resource and native actor lifetimes when publishing the culling snapshot.

- viafabricplus-bedrock/0016-render-server-player-costumes.patch: Resolve actor-local native definitions and complete material dependencies before caching occlusion requirements.

## Validation and remaining limits

Regression coverage includes `BedrockCatAnimationTest`, `BedrockEntityResourcesTest`, `BedrockWorldActorAppearanceTest`, `BedrockActorOcclusionTest`.

Current/older/current cat controls verify selected resources. Exact head timing, shadows, natural resting poses, sleeping lookup, and complete native animal appearance remain open.

The [owning patch](0030-use-supported-native-world-actor-definitions.patch) retains implementation rationale and versioned evidence.
