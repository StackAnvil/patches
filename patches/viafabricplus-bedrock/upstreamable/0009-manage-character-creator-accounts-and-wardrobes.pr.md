# feat(appearance): manage Character Creator accounts and wardrobes

## Purpose

Keep character slots, persona recipe assembly, owned catalogs, purchases and emote account selection above the shared native rendering runtime. Preserve signed appearance selection, classic skin changes and account-specific asset lifetimes.

## Design constraints

Keep account entitlement, downloaded assets, character recipes, previews, and in-world playback under distinct owners. Assemble persona geometry and tints without leaking mutable resources across characters.

Prerequisites:

- viafabricplus-bedrock/0008-share-native-actor-and-resource-runtime.patch: Land shared actor and resource playback before account appearance selection.

- viabedrock/0061-expose-native-player-emotes.patch: Publish negotiated emote actions, session identity routing and world chat policy before enabling direct and proxy wheel controls.

## Validation and remaining limits

Regression coverage includes `BedrockAccountAppearanceTest`, `BedrockAppearanceStoreTest`, `BedrockBuiltinAssetsTest`, `BedrockCharacterColorsTest`.

Controlled account and emote references cover specific operations. Purchases, missing receipt keys, unavailable emotes, profile/LOD behavior, armor masking, and native multiplayer timing remain open.

The [owning patch](0009-manage-character-creator-accounts-and-wardrobes.patch) retains implementation rationale and versioned evidence.
