# feat(appearance): manage Character Creator accounts and wardrobes

## Purpose

Keep character slots, persona recipe assembly, owned catalogs, purchases and emote account selection above the shared native rendering runtime. Preserve signed appearance selection, classic skin changes and account-specific asset lifetimes.

## Design constraints

Keep account entitlement, downloaded assets, character recipes, previews, and in-world playback under distinct owners. Assemble persona geometry and tints without leaking mutable resources across characters.

World-player `target_y_rotation` applies the native float wrap and the -85/+85-degree limits. Unordered wrapped values select the lower bound. Server player controller selection uses the same helper. Existing GUI camera overrides retain their previous values.

World-player pitch samples the shortest angular delta before animation and controller evaluation. The final sample remains unwrapped. Actors without a native snapshot retain Java sampling. GUI camera extraction takes precedence over the world sample.

Prerequisites:

- viafabricplus-bedrock/0008-share-native-actor-and-resource-runtime.patch: Land shared actor and resource playback before account appearance selection.

- viabedrock/0061-expose-native-player-emotes.patch: Publish negotiated emote actions, session identity routing and world chat policy before enabling direct and proxy wheel controls.

## Validation and remaining limits

Regression coverage includes `BedrockAccountAppearanceTest`, `BedrockAppearanceStoreTest`, `BedrockBuiltinAssetsTest`, `BedrockCharacterColorsTest`.

Current Bedrock 1.26.60.5/protocol 2225 registration identifies target-y callback `0x140684fd0` and helper `0x142c896e0`. The observed remote-player vtable resolves its head and body getters to the matching native components. Original instructions execute 60 controls. Actor type, interpolated virtual getters, and CRT remainder are explicit fixture boundaries. The original wrapper, angle arithmetic, limit, and result publication execute. The player query-map regression covers limits, tiny angles, signed zero, and non-finite input.

Original target-x callback `0x140684ec0` and head-x callback `0x142cb53a0` agree on 15 pitch controls. Head-x uses numeric index zero. Synthetic rotation storage and CRT remainder are explicit boundaries. The query-map regression covers both wrap directions, ordinary pitch, alpha one, and the Java fallback. Previous 179/current -179 yields 180 at half a tick and 181 at alpha one.

Read-only observers retain 66 direct and 63 ViaProxy query samples from the rebuilt clients. Both original callbacks reproduce every sampled result bit for bit. Two direct head-only frames differ from Java's linear formula. One returns 180.52 degrees where linear sampling would return -93.08 degrees. These comparisons supply the recorded Java frame inputs. Native rotation-history, scheduler, and complete frame parity remain unverified.

Fourteen-phase installed direct and ViaProxy controls use matching peer skin, spawn, and movement bytes against the native fixture. A private scheduling pause aligns the intermediate normal-then-teleport state and the first three body ticks after teleport. All four sampled angles match the twelve traced native phases. The [movement comparison](0041-interpolate-native-remote-player-movement.pr.md) describes the state controls and their limits.

Three settled images per phase compare six colored markers. Median centroids differ by at most 0.26% of a viewport axis, and boundaries differ by at most 0.42%. The previously mismatched teleport head centroid now differs by less than 0.10% of either axis. All marker visibility checks agree. Solid-color heads do not establish every face orientation. Complete pose, skin, and frame-timing parity remain unverified.

Controlled account and emote references cover specific operations. Purchases, missing receipt keys, unavailable emotes, profile/LOD behavior, armor masking, and native multiplayer timing remain open.

The [owning patch](0009-manage-character-creator-accounts-and-wardrobes.patch) retains implementation rationale and versioned evidence.
