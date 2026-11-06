# feat(bedrock): render custom entities and player skins

## Purpose

Import native Bedrock entity and skin rendering from viafabricplus-bedrock PR #9 as an independently reviewable feature patch.

## Design constraints

Keep per-player appearance and animation state separate from server costumes and equipment. Preserve native geometry, UVs, materials, animated surfaces, and connection-owned resources.

Native player entities resolve the current connection's profile after list replacements. Java 26.3 otherwise retains the old `PlayerInfo` object, leaving entity predicates in an earlier mode while the movement controller has changed. Ordinary Java connections retain their existing profile cache.

World player surfaces use separate cached materials for native near-camera fading. Shared hands, unrelated actors, and GUI portraits retain their own materials.
The native and Iris programs use the same ordered coverage function. Surviving pixels retain the material depth policy.

Pattern and pattern-glint materials retain ordered colors and atlas transforms for each prepared draw.
Their native shader adds glint before fog. Ordinary entity glint keeps its separate order.
Iris composes pattern layers before shader-pack shading and clears their inputs for ordinary Java draws.

Prerequisites:

- viabedrock/0064-evaluate-named-actor-properties.patch: Publish the versioned custom-actor sampler snapshot and immutable evaluated texture bindings.


## Validation and remaining limits

Regression coverage includes `BedrockAcceptedResourcesTest`, `BedrockActorDepthGpuTest`, `BedrockActorGlintFramesTest`, `BedrockShaderAlphaTest`, and `BedrockPlayerFadeGpuTest`.

`BedrockActorPatternGpuTest` compares 512 actual fragment outputs with current original 1.26.60.5 shader controls.
Iris GPU tests cover ordered atlas layers through sampler helpers, texture overrides, and return to ordinary Java draws.
[Installed shield controls](0017-render-equipped-native-pack-models.pr.md) exercise the shared material on both connection routes.

A controlled protocol-2225 replay uses captured official 1.26.60.5 skin/profile bytes with declared Creative, Spectator, Survival, and return transitions plus a repeated profile list. The previous client keeps an old Creative profile after the current profile and controller enter Spectator. Read-only installed-client observations verify agreement after the fix on direct and proxy routes. The [core mode patch](../../viabedrock/upstreamable/0007-forward-local-game-mode-updates.pr.md) separately preserves the local mode when recreating the profile. These controls verify state ownership, without establishing complete native trajectories or visual parity.

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
