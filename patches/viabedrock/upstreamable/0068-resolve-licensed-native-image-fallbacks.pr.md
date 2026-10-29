# feat(resource-packs): select native resources by world version

## Purpose

Bedrock 1.26.51.1 protocol 2193 accepts Hive item atlas aliases to vanilla images which the server does not resend. The bundled metadata archives intentionally contain no images, leaving these aliases unresolved during Java conversion.

## Design constraints

Resolve licensed images beneath server assets from the selected native resource context. Keep acquisition, version validation, cache identity, and fallback ownership explicit.

Prerequisites:

- viabedrock/0015-transport-native-resources-and-sound-commands.patch: Carry the selected world version through the existing native resource archive and converted-pack transport.

- viabedrock/0025-apply-dependencies-and-selected-subpacks.patch: Select world-versioned vanilla resources while retaining the negotiated server dependency/subpack stack.

## Validation and remaining limits

Regression coverage includes `BaseGameVersionTest`, `BuiltinActorResourcesTest`, `NativeActorLibraryTest`, `SoundTranslationsTest`.

Resource-selection and fallback tests protect known cases. Missing licensed resources and broader native rendering comparisons remain limits.

The [owning patch](0068-resolve-licensed-native-image-fallbacks.patch) retains implementation rationale and versioned evidence.
