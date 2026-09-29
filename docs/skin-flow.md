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

The account response contains recipes, not the assembled skin used in a world. In the captured native flow, the client downloads persona packs from the Marketplace CDN. The outer ZIP contains a second ZIP with encrypted asset files. The Store layout and PlayFab catalog do not expose the full recipe piece ID.

The **Use in worlds** action downloads the active character's assembled GLTF model. The add-on packs its PNG textures into a Bedrock skin atlas and converts its triangle meshes into static Bedrock geometry. It saves the result per account and sends it in the next login JWT. If the player is already in a Bedrock world, it also requests a live `PlayerSkinPacket` update. Selecting another saved slot or editing the active character refreshes the stored model. Choosing Steve, Alex, or an imported classic skin in the Dressing Room selects that skin instead.

This conversion preserves the model's visible static shape and textures. The profile model does not include the native client's animated face image, body animation, persona piece handles, or tint metadata. The add-on sends empty piece and tint lists for the converted model. Local tests confirmed that the renderer accepts converted models from the captured default and hair-edited characters, and that the skin packet codec round-trips the converted skin. A second client still needs to confirm how servers relay and display it.

A local Bedrock server captured the native client login for one default Character Creator slot. Its client data contained a 256×256 RGBA atlas, Bedrock geometry with 10 body poly meshes and a separate animated face geometry, nine persona pieces, three tint groups, and an animated image. The converted model is a static approximation of this packet.

## Work still needed

1. Derive the full piece ID and asset metadata for catalog pieces that do not appear in a saved recipe.
2. Verify the converted login skin and live update with a second Bedrock client on a local server. Compare several Character Creator outfits against native login captures.
3. Find a supported source for animated face and body data, persona piece handles, and tint metadata so account characters can match the native packet.
4. Capture and validate the write flows for other piece colors, arm width, size, and emotes, then add their controls.
5. Render body texture animations and test face and body animation together.

Keep login JWTs, raw proxy flows, player textures, and account data under `.stackanvil/`. Do not commit them.
