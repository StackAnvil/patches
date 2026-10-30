# feat(resource-packs): select native resources by world version

## Purpose

Select vanilla metadata, licensed images, actor dependencies, and audio by the world's advertised base-game version.
Apply server assets above those selected resources, including image aliases that servers do not resend.

## Design constraints

Resolve licensed images beneath server assets from the selected native resource context. Keep acquisition, version validation, cache identity, and fallback ownership explicit.

Legacy fog bindings stay separate from modern biome metadata. Vanilla legacy files stop at base version 1.21.40. Server legacy files still load.

Prerequisites:

- viabedrock/0015-transport-native-resources-and-sound-commands.patch: Carry the selected world version through the existing native resource archive and converted-pack transport.

- viabedrock/0025-apply-dependencies-and-selected-subpacks.patch: Select world-versioned vanilla resources while retaining the negotiated server dependency/subpack stack.

## Validation and remaining limits

Regression coverage includes `BaseGameVersionTest`, `BuiltinActorResourcesTest`, `NativeActorLibraryTest`, `SoundTranslationsTest`, and `BiomeDefinitionsTest`.

Native 1.26.60.5 Fancy controls cover legacy fog inheritance, replacement, and clearing over modern definitions.
Remote current/1.20.0/current controls also admit unqualified server legacy biome keys. All fog identifiers in these controls remain qualified.
Homogeneous neighboring bindings separate name admission from spatial blending.
Four direct and ViaProxy recordings confirm the advertised current and older contexts and match the settled blue 48-block binding.
Color differences stay below 0.00001 RGBA and distance differences below 0.001 blocks. All recordings exit normally.
Missing licensed resources and broader rendering comparisons remain limits.

The [owning patch](0068-resolve-licensed-native-image-fallbacks.patch) retains implementation rationale and versioned evidence.
