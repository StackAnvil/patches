# feat(resource-packs): select native resources by world version

## Purpose

Bedrock 1.26.51.1 protocol 2193 accepts Hive item atlas aliases to vanilla images which the server does not resend. The bundled metadata archives intentionally contain no images, leaving these aliases unresolved during Java conversion.

## Design constraints

Resolve licensed images beneath server assets from the selected native resource context. Keep acquisition, version validation, cache identity, and fallback ownership explicit.

Legacy fog bindings stay separate from modern biome metadata. Vanilla legacy files stop at base version 1.21.40. Server legacy files still load.

Prerequisites:

- viabedrock/0015-transport-native-resources-and-sound-commands.patch: Carry the selected world version through the existing native resource archive and converted-pack transport.

- viabedrock/0025-apply-dependencies-and-selected-subpacks.patch: Select world-versioned vanilla resources while retaining the negotiated server dependency/subpack stack.

## Validation and remaining limits

Regression coverage includes `BaseGameVersionTest`, `BuiltinActorResourcesTest`, `NativeActorLibraryTest`, `SoundTranslationsTest`, and `BiomeDefinitionsTest`.

Native 1.26.60.5 Fancy controls cover legacy fog inheritance, replacement, and clearing over modern definitions.
Remote legacy-name cutoffs, missing licensed resources, and broader rendering comparisons remain limits.

The [owning patch](0068-resolve-licensed-native-image-fallbacks.patch) retains implementation rationale and versioned evidence.
