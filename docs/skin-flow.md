# Skins and Character Creator

Use this reference to find the owner of an appearance change and its verification boundary.
The stack targets Bedrock 1.26.60 / protocol 2225.
Earlier native references remain valid only for the behavior and build they establish.

## Connected appearance

ViaBedrock decodes complete skin data and transports it to capable Java clients.
The add-on owns geometry, animated surfaces, persona assembly, costumes, and attachables.
Player-list entries supply PlayFab identity in protocol 2225.
Do not restore the removed identity field to serialized skin data.

A connected skin change uses the same negotiated request on direct and ViaProxy routes.
Core selects the spawned native local actor and waits for a matching server appearance.
Compare all appearance fields and pixels, excluding the server-owned trust flag.
Compare geometry as JSON values because the server can change numeric formatting.
An immediate local preview is not confirmation of synchronization.
Replacement, timeout, disconnect, or capability withdrawal retires a pending request.

## Resource and animation ownership

Select vanilla resources for the world's base-game version before applying server overrides.
Retain same-pack geometry, texture, animation, controller, and material bindings.
Keep mutable playback state per actor and appearance lifetime.
Release textures and graph state when the appearance, world, or resource stack changes.

Classic skins, persona pieces, server costumes, equipment, and emotes have separate graph inputs.
Resolve each against its owner instead of substituting another player's cached resources.
Preserve animated strip dimensions, UV orientation, frame timing, tint channels, and profile identity.
A complete wire record does not prove correct frame timing or armor visibility.

## Account flows

The Dressing Room supports classic selection and account-owned character resources.
Marketplace acquisition, entitlement synchronization, account editing, and platform purchases have independent failure paths.
Do not treat a cached preview or a successful login as evidence that an account mutation reached the native service.
Keep account tokens, profile data, downloaded packs, and captures private.

## Validation

Use controlled appearances with distinct pixels, geometry, animation, and tint metadata.
Check the server echo and the rendered result independently.
Include a second actor when the change concerns remote skins or ownership.
Use the [capture lab](capture-lab.md) and [server replay](server-replay.md) for bounded visual comparisons.

The owning patch notes describe their specific validation and limits:

- [Complete skin transport](../patches/viabedrock/upstreamable/0047-encode-current-bedrock-skin-packets.pr.md).
- [Native player rendering](../patches/viafabricplus-bedrock/upstreamable/0002-native-entities-and-skins.pr.md).
- [Account and wardrobe state](../patches/viafabricplus-bedrock/upstreamable/0009-manage-character-creator-accounts-and-wardrobes.pr.md).
- [Server costumes](../patches/viafabricplus-bedrock/upstreamable/0016-render-server-player-costumes.pr.md).
- [Equipped models](../patches/viafabricplus-bedrock/upstreamable/0017-render-equipped-native-pack-models.pr.md).

## Remaining limits

Native armor masking and profile/LOD texture changes still need matching fixtures.
Enchanted shields, complete first-person appearance, live mounts, remote skins, and motion timing remain partial or unverified.
Platform purchases, complete account synchronization, and broader emote parity remain open.
Keep current status in the [compatibility page](bedrock-coverage.md), not a chronological skin journal.
