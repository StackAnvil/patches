# Bedrock skins and Character Creator

This note describes skin support in the VFP VB Addon and the remaining gaps against Bedrock 1.26.51, protocol 2193.

## Skin data in a world

Bedrock sends an assembled skin in its login JWT. The skin contains image data, geometry, animations, persona pieces, tints, and a profile hash. Mojang documents these fields in the [SerializedSkin reference](https://mojang.github.io/bedrock-protocol-docs/1.26.51/types/serialized-skin/).

ViaBedrock reads skins from `PlayerListPacket` and `PlayerSkinPacket`. Its `SkinType` codec writes the full structure. The add-on renders persona body geometry, polygon meshes, and separate animated face and body surfaces. It resolves `animated_face`, `animated_32x32`, and `animated_128x128` through the skin resource patch.

Native captures exposed two details that affect rendering. Geometry descriptions can use the full animation strip dimensions. Bedrock polygon UVs also use a bottom origin. The renderer adjusts the frame dimensions and UVs before it uploads each frame. It checks strip sizes, frame counts, and model bindings, then releases all animation textures when the skin changes.

The add-on sends a [PlayerSkinPacket](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/player-skin-packet/) for classic and account character changes in a connected world. A matching packet from the server confirms the returned skin ID. A private protocol-2193 relay accepted an assembled character update with one animation, ten pieces, and three tint groups, then returned its matching acknowledgement. The run also exposed a PlayerList actor-ID decoding error. ViaBedrock now reads signed actor IDs consistently with StartGame and the native schema. A native second client displayed the assembled HelliArm character. A controlled color probe did not establish which animation frames it used. Acknowledgement and visual presence therefore do not establish native timing or complete format parity.

## Classic skins

The Dressing Room selects Steve, Alex, an imported PNG, or a skin from a local `.mcpack`. It reads `manifest.json`, `skins.json`, and PNGs from [standard Classic Skin packs](https://learn.microsoft.com/en-us/minecraft/creator/documents/packagingaskinpack?view=minecraft-bedrock-stable). The player can preview each supported skin and select one. Pack import supports wide and slim models, plus selected custom geometry from `geometry.json`. It reads modern geometry arrays and direct legacy geometry definitions. It resolves nested textures relative to a single pack root, including wrapped archive exports. It rejects ambiguous roots, unsafe paths, duplicate entries, and oversized expanded archives.

`BedrockAppearanceStore` keeps the choice per account. `ViaFabricPlusSkinProvider` sends the selected skin in the next login JWT. The store keeps an imported cape and custom geometry separately. Custom model textures retain their dimensions and UV layout. Model selection, save/load, login claims, and live packets use the same selected geometry.

Legacy 64×32 skins expand to 64×64 by mirroring limb faces. The importer preserves transparent hat details and clears unused opaque hat backgrounds. Custom geometry textures retain their original rectangular dimensions.

Custom geometry import checks bone hierarchy, coordinate bounds, texture dimensions, and model size before replacing a saved skin. Inherited legacy geometry and classic animation metadata remain incomplete.

## Account recipes and editing

The account screen reads five character slots and the settings profile from `GET /api/v1.0/appearance/retrieve`. It retains each complete recipe, including colors, version, and profile hash. The wardrobe reads the native `DressingRoom_*` Store layout pages and shows free and owned pieces.

Slot selection sends the settings profile and selected recipe together in `PUT /api/v1.0/appearance`. It changes `lastUsedPersonaSlot`, then reads the profiles again. Each edit checks the target profile hash before the write and checks the recipe afterward.

An empty slot can receive any of the nine native starter characters or a copy of the active recipe. The new character becomes active. Deletion keeps the base entry and removes equipped pieces. Another saved character becomes active when necessary. The add-on keeps the last saved character.

Catalog pieces no longer require a recipe copied from another slot. Native equip captures established these recipe suffixes:

| Piece | Recipe ID |
| --- | --- |
| Built-in piece | Piece UUID plus `/d` |
| Free catalog piece | Pack UUID plus `/f` |
| Owned catalog piece | Pack UUID |
| Built-in emote | Piece UUID plus `/de` |
| Other emote | Pack UUID plus `/e` |
| Classic cape | Pack UUID plus its skin index |

The editor preserves existing colors when it replaces a category. It inserts new categories before the four emote positions. Saved recipes and starter recipes still supply their complete entries when available.

The Emotes category edits four wheel positions. An empty position uses `{"id":"/e"}`. Equip moves an existing emote rather than adding a duplicate. Catalog emotes can use the native recipe suffix without an earlier saved copy. This edits the account wheel; emote playback remains incomplete.

The Capes category equips, replaces, or removes free and owned capes. Persona capes use their catalog pack UUID. The account model service includes the selected cape in its assembled model. Classic imported capes remain separate skin fields.

The Size screen provides four native heights and two arm widths. Arm edits change `arm` and preserve `cs_arm`. Height edits replace the recognized pair of height entries. Independent left and right limb controls still need a verified saved recipe flow.

The color editor uses swatches captured from Bedrock 1.26.51. Skin tone edits change `skcol`. Hair and iris edits change channel zero in `col`; eyebrow and sclera edits change channels one and two. It preserves the remaining channels. Other piece palettes and channel controls remain incomplete.

## Account character assembly

The active character has an authenticated avatar at `GET /api/v1.0/profile/image/avatar`. The same service returns an assembled GLTF model at `/api/v1.0/profile/image/ModelBinary`.

**Use in worlds** converts that model's textures and triangle meshes into a Bedrock atlas and geometry. It saves the appearance per account and sends it at login or through a live skin update. Slot selection and edits refresh an active character already selected for use in worlds.

Native ModelBinary and login captures use different Z conventions. Conversion reflects positions, node translations, and normals across Z, then reverses triangle winding. Skin geometry retains the native face direction.

The add-on resolves persona handles from the complete recipe and current catalog. Built-in handles use the native default pack UUID. Ordinary catalog handles use the pack UUID for both `PieceId` and `PackId`, plus the Store product UUID. An owned Office Shirt capture confirmed that its encrypted metadata's internal piece UUID differs from the transmitted handle.

Piece claims use native names such as `persona_hair`. Packet fields use ViaBedrock's enum names such as `Hair`. The add-on converts between these names and sends the recipe's four-channel tint groups. The packet codec normalizes `#0` to `#00000000` without changing the color value.

For owned assets, the add-on requests `GET /api/v1.0/player/inventory?includeReceipt=true` with the current Minecraft authorization. It decodes content keys only from that account's receipt. It resolves product downloads through PlayFab `Catalog/GetPublishedItem` and uses the native `libhttpclient/1.0.0.0` CDN user agent.

The asset reader checks archive limits, manifest UUID, and encrypted content ID. It decodes the AES CFB8 index and indexed files in memory. Native archives can contain two `contents.json` entries; the final entry supplies the encrypted index. Directory entries in the index do not require file data.

For animated owned geometry, assembly selects the character's body and arm variants. It replaces matching static preview surfaces and packs looping texture frames into a separate animation atlas. Save/load, login claims, and live packets retain those frames. Unresolved free assets continue to use the service's static model.

A private HelliArm capture contains ten animated arm cubes, a 16-frame 32×512 strip, and a separate blinking face. Targeted checks decode the entitled arm pack, assemble its variants, preserve every frame through save/load, and render the native face and arm bindings together. These checks use local private fixtures through `STACKANVIL_PERSONA_ASSETS` and `STACKANVIL_PERSONA_CAPTURE`; the repository contains no captured assets or receipts.

## Dressing Room previews

The main Dressing Room and Classic Skin pack screen share the player skin renderer. Custom models use their saved geometry. Account characters include separate animated surfaces in the preview. Each preview owns and releases its textures when the screen changes or closes.

A running Java client displayed the assembled HelliArm body and animated arm surfaces. The account character preview stays visible without a world connection. Unsupported geometry reports an error through the existing import or selection flow.

## Work still needed

- Assemble default animated faces and resolve free piece assets beyond the static model service.
- Apply and verify tint maps for animated pieces.
- Verify native animation timing and emote playback.
- Add other piece palettes and independent limb controls after native write captures establish their behavior.
- Support inherited legacy geometry and classic pack animation metadata.
- Verify login and live changes on a second client, including height, arm width, capes, and several animated outfits.

Keep login JWTs, receipts, content keys, raw flows, screenshots, player textures, and account data private under `.stackanvil/`.
