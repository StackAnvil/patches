# Bedrock skins and Character Creator

This note explains how the VFP VB Addon handles Bedrock skins. It also records the work needed to equip an account character in a world.

## Skin data in a world

The client sends an assembled skin in the login JWT. The skin includes image data, geometry, animations, persona pieces, tints, and a profile hash. See Mojang's [SerializedSkin reference](https://mojang.github.io/bedrock-protocol-docs/1.26.51/types/serialized-skin/) for protocol 2193.

ViaBedrock reads skins from `PlayerListPacket` and `PlayerSkinPacket`. Its `SkinType` codec writes the full skin structure. The add-on renders supported persona body geometry and a separate animated face. If a packet contains body animation data, the renderer shows the static body texture. It does not animate that texture yet.

The add-on sends a [PlayerSkinPacket](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/player-skin-packet/) when the player changes a classic skin in a connected world. It also waits for a matching skin packet from the server. A matching packet confirms that the server sent the new skin back to this client. A second client is still needed to confirm how other players see it.

## Classic skins

The Dressing Room selects Steve, Alex, an imported PNG, or a skin from a local `.mcpack`. It reads `manifest.json`, `skins.json`, and the PNGs in a [standard Classic Skin pack](https://learn.microsoft.com/en-us/minecraft/creator/documents/packagingaskinpack?view=minecraft-bedrock-stable). The player can preview each supported skin and select one. This format uses the standard wide and slim models.

`BedrockAppearanceStore` keeps the choice per account. `ViaFabricPlusSkinProvider` puts the selected skin in the next login JWT. The store keeps an imported cape separately.

## Saved Character Creator slots

The account screen reads five character slots and the account settings profile from `GET /api/v1.0/appearance/retrieve`. It keeps each complete recipe, including base fields, piece colors, version, and profile hash. The wardrobe reads the same `DressingRoom_*` Store layout pages that the native client uses. Each layout gives piece names, thumbnails, categories, prices, and pack UUIDs. The pack UUID matches the first 36 characters of a saved recipe piece ID.

The player can choose an active slot. The add-on sends the settings profile and selected recipe together in `PUT /api/v1.0/appearance`. It changes only `lastUsedPersonaSlot` in the settings profile. After the write, it reads the profiles again to check the active slot.

The account screen can also replace or remove a piece already represented in a saved character. It copies the complete piece entry, including its ID and colors, from another slot. For a replacement, it changes the matching category entry in the target slot. For removal, it deletes that entry. The add-on checks the target profile hash before writing and reads the profile again afterward. Pieces that appear only in the catalog cannot be equipped yet because the layout gives their pack UUID but not the full piece ID stored in the recipe.

The color editor uses the native Dressing Room swatches captured with Bedrock 1.26.51. A skin tone edit changes only `skcol` in the base entry. A hair color edit changes the first value in the equipped hair piece's four-value `col` array. Both edits keep the other values and account settings intact. The add-on checks the profile hash before each write, then reads the slot back to verify the saved recipe.

The active character has a full body image from authenticated `GET /api/v1.0/profile/image/avatar`. The same service returns a GLTF binary model at `/api/v1.0/profile/image/ModelBinary`. A native hair edit changed this model from 12 meshes and two PNG textures to 13 meshes and three textures. The model can support a preview, but its texture layout is not the Bedrock login skin format.

The account response contains recipes, not the assembled skin used in a world. In the captured native flow, the client downloads persona packs from the Marketplace CDN. The outer ZIP contains a second ZIP with encrypted asset files. The Store layout and PlayFab catalog do not expose the full recipe piece ID. The profile GLTF endpoint returns an assembled preview model, but it does not return the full login packet data.

A local Bedrock server captured the native client login for one default Character Creator slot. Its client data contained a 256×256 RGBA atlas, Bedrock geometry with 10 body poly meshes and a separate animated face geometry, nine persona pieces, three tint groups, and an animated image. VFP still sends the selected classic skin at login. A conversion from the service model or a supported source for the original persona assets must produce all of those fields before an account character can replace it.

## Work still needed

1. Derive the full piece ID and asset metadata for catalog pieces that do not appear in a saved recipe.
2. Convert the profile GLTF model into a Bedrock skin atlas and geometry, or find a supported source for the original persona assets. Compare the result with several native login captures.
3. Send the assembled character in the login JWT and live skin packet. Verify it with a second Bedrock client.
4. Capture and validate the write flows for other piece colors, arm width, size, and emotes, then add their controls.
5. Render body texture animations and test face and body animation together.

Keep login JWTs, raw proxy flows, player textures, and account data under `.stackanvil/`. Do not commit them.
