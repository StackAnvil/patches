# Bedrock skins and Character Creator

This note describes the skin paths in the VFP VB Addon. It also explains why saved Character Creator slots cannot yet become the player's skin in a world.

## Skin data in a world

The Bedrock client sends its skin in the client-data JWT during login. The skin includes pixels, geometry, animations, persona pieces, and colors. A connected client can change its skin with `PlayerSkinPacket`.

A native Bedrock 1.26.51 capture shows that a Character Creator skin can use separate body and animated face models. The face uses a separate image. Bedrock players can have other geometry layouts, so the renderer checks each layout before it installs a custom model.

ViaBedrock reads skins from `PlayerListPacket` and `PlayerSkinPacket`. Its current `SkinType.write` now writes the full skin structure and has a round-trip test. The add-on renders supported persona body meshes and a separate animated face. An unsupported geometry layout keeps the normal Java player visible.

## Dressing Room and account data

The add-on's Dressing Room selects Steve, Alex, or an imported classic PNG. `BedrockAppearanceStore` keeps this choice per account. `ViaFabricPlusSkinProvider` places it in the next login JWT. The add-on does not send a live `PlayerSkinPacket` when the player changes this choice.

The Dressing Room also has a Character Creator account screen. It reads five saved slots from `GET /api/v1.0/appearance/retrieve`. It reads Marketplace entitlements from `GET /api/v1.0/player/inventory`. It resolves owned persona pieces through PlayFab's `Catalog/GetPublishedItem` API. The screen shows slot details, piece names, and thumbnails. It does not equip a slot or piece.

Each saved slot is a recipe with a base, piece IDs, and colors. The account response does not contain the rendered skin pixels or geometry. The native client downloads persona packs and assembles the skin locally. Captured Marketplace persona packs contain encrypted files. The add-on does not have an asset decoder or a compositor for those packs.

Selecting a saved slot in the native Dressing Room can send `PUT /api/v1.0/appearance`. That request updates account data. It does not return an assembled skin. The add-on does not write account slots.

## Work still needed

1. Resolve the licensed wardrobe assets for the signed-in account and decode their piece data.
2. Assemble body and face textures, geometry, animation, and piece claims from a slot recipe.
3. Preview the assembled character in the Dressing Room and place it in the login JWT.
4. Send `PlayerSkinPacket` for live changes, then check the result with a second Bedrock client.
5. Compare rendered characters with the native client for several piece combinations.

Keep login JWTs, raw proxy flows, player textures, and account data under `.stackanvil/`. Do not commit them.
