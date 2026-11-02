# feat(appearance): manage Character Creator accounts and wardrobes

## Purpose

Keep character slots, persona recipe assembly, owned catalogs, purchases and emote account selection above the shared native rendering runtime. Preserve signed appearance selection, classic skin changes and account-specific asset lifetimes.

## Design constraints

Keep account entitlement, downloaded assets, character recipes, previews, and in-world playback under distinct owners. Assemble persona geometry and tints without leaking mutable resources across characters.

World-player `target_y_rotation` applies the native float wrap and the -85/+85-degree limits. Unordered wrapped values select the lower bound. Server player controller selection uses the same helper. Existing GUI camera overrides retain their previous values.

Prerequisites:

- viafabricplus-bedrock/0008-share-native-actor-and-resource-runtime.patch: Land shared actor and resource playback before account appearance selection.

- viabedrock/0061-expose-native-player-emotes.patch: Publish negotiated emote actions, session identity routing and world chat policy before enabling direct and proxy wheel controls.

## Validation and remaining limits

Regression coverage includes `BedrockAccountAppearanceTest`, `BedrockAppearanceStoreTest`, `BedrockBuiltinAssetsTest`, `BedrockCharacterColorsTest`.

Current Bedrock 1.26.60.5/protocol 2225 registration identifies target-y callback `0x140684fd0` and helper `0x142c896e0`. The observed remote-player vtable resolves its head and body getters to the matching native components. Original instructions execute 60 controls. Actor type, interpolated virtual getters, and CRT remainder are explicit fixture boundaries. The original wrapper, angle arithmetic, limit, and result publication execute. The player query-map regression covers limits, tiny angles, signed zero, and non-finite input.

Fourteen-phase installed direct and ViaProxy controls use matching peer skin, spawn, and movement bytes against the native fixture. A private scheduling pause aligns the intermediate normal-then-teleport state and the first three body ticks after teleport. All four sampled angles match the twelve traced native phases. The [movement comparison](0041-interpolate-native-remote-player-movement.pr.md) describes the state controls and their limits.

Three settled images per phase compare six colored markers. Median centroids differ by at most 0.26% of a viewport axis, and boundaries differ by at most 0.42%. The previously mismatched teleport head centroid now differs by less than 0.10% of either axis. All marker visibility checks agree. Solid-color heads do not establish every face orientation. Complete pose, skin, and frame-timing parity remain unverified.

Controlled account and emote references cover specific operations. Purchases, missing receipt keys, unavailable emotes, profile/LOD behavior, armor masking, and native multiplayer timing remain open.

The [owning patch](0009-manage-character-creator-accounts-and-wardrobes.patch) retains implementation rationale and versioned evidence.
