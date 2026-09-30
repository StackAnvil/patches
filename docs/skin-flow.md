# Bedrock skins and Character Creator

This note describes skin support in the VFP VB Addon and the remaining gaps against Bedrock 1.26.51, protocol 2193.

## Skin data in a world

Bedrock sends an assembled skin in its login JWT. The skin contains image data, geometry, animations, persona pieces, tints, and a profile hash. Mojang documents these fields in the [SerializedSkin reference](https://mojang.github.io/bedrock-protocol-docs/1.26.51/types/serialized-skin/).

ViaBedrock reads skins from `PlayerListPacket` and `PlayerSkinPacket`. Its `SkinType` codec writes the full structure. The add-on renders persona body geometry, polygon meshes, and separate animated face and body surfaces. It resolves `animated_face`, `animated_32x32`, and `animated_128x128` through the skin resource patch.

Native captures exposed two details that affect rendering. Geometry descriptions can use the full animation strip dimensions. Bedrock polygon UVs also use a bottom origin. The renderer adjusts the frame dimensions and UVs before it uploads each frame. It checks strip sizes, frame counts, and model bindings, then releases all animation textures when the skin changes.

The add-on sends a [PlayerSkinPacket](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/player-skin-packet/) for classic and account character changes in a connected world. A matching packet from the server confirms the returned skin ID. A private protocol-2193 relay accepted an assembled character update with one animation, ten pieces, and three tint groups, then returned its matching acknowledgement. The run also exposed a PlayerList actor-ID decoding error. ViaBedrock now reads signed actor IDs consistently with StartGame and the native schema. A native second client displayed the assembled HelliArm character. A controlled color probe did not establish which animation frames it used. Acknowledgement and visual presence therefore do not establish native timing or complete format parity.

## Classic skins

The Dressing Room selects Steve, Alex, an imported PNG, or a skin from a local `.mcpack`. It reads `manifest.json`, `skins.json`, and PNGs from [standard Classic Skin packs](https://learn.microsoft.com/en-us/minecraft/creator/documents/packagingaskinpack?view=minecraft-bedrock-stable). The player can preview each supported skin and select one. Pack import supports wide and slim models, plus selected custom geometry from `geometry.json`. It reads modern geometry arrays and resolves legacy geometry inheritance within the pack. Explicit pack geometry takes precedence over built-in Steve and Alex models. It resolves nested textures relative to a single pack root, including wrapped archive exports. It rejects ambiguous roots, unsafe paths, duplicate entries, and oversized expanded archives.

`BedrockAppearanceStore` keeps the choice per account. `ViaFabricPlusSkinProvider` sends the selected skin in the next login JWT. The store keeps an imported cape and custom geometry separately. Custom model textures retain their dimensions and UV layout. Model selection, save/load, login claims, and live packets use the same selected geometry.

Legacy 64×32 skins expand to 64×64 by mirroring limb faces. The importer preserves transparent hat details and clears unused opaque hat backgrounds. Custom geometry textures retain their original rectangular dimensions.

Custom geometry import checks bone hierarchy, coordinate bounds, texture dimensions, and model size before replacing a saved skin. Legacy inheritance keeps parent surfaces and appends child cubes on matching bones. Child bones supply their pose and flags. Each texture dimension inherits separately, with a 64×64 default. The importer preserves cube mirror and inflation defaults, polygon indices, and visible bounds. It rejects unresolved parents, ambiguous names, inheritance cycles, and inheritance in format versions 1.12 and later.

Missing legacy parents resolve from the licensed package's base vanilla model library. Pack definitions take precedence, including across library chains. Imports run in the background and request the package only when the pack lacks a selected model or parent. Self-contained packs need no Store sign-in. The importer checks the account and open screen before showing the result.

Licensed tests resolve all seven inherited entries from the base skin-model library, including parents supplied by entity model files. Equal duplicate definitions share one library entry. Conflicting definitions remain errors. Versioned vanilla overlays and native visual comparisons remain pending. A broader library check found an unresolved `rightarm` parent in the native legacy vex model. The importer rejects this model until native parent-name behavior is established. Classic skin animation aliases and render flags now survive import and transport. Local playback, render-flag behavior, and geometry-provided alias precedence remain incomplete.

## Classic skin declarations

The importer preserves `skins.json` animation aliases in `SkinResourcePatch`, with `enable_attachables`, `held_item_ignores_lighting`, and `hide_armor`. Explicit false flags differ from absent flags. Empty animation aliases remain empty. These declarations do not populate `SkinAnimationData`.

The account store keeps these options with the classic appearance, including skins that use the standard Steve or Alex model. Preset selection suspends the options. Selecting the saved custom skin restores them. A plain PNG import clears the previous pack options. Model-width and cape edits preserve them.

Private Bedrock 1.26.51.1 loader and serialization observations establish the resource-patch fields. Tests cover metadata parsing, persistence, preset selection, width changes, and live protocol round trips. Preview skin data carries the same declarations. Java does not yet use these aliases for local playback or apply the render flags.

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
| Owned left or right limb | Pack UUID plus `/l` or `/r` |
| Built-in emote | Piece UUID plus `/de` |
| Other emote | Pack UUID plus `/e` |
| Classic cape | Pack UUID plus its skin index |

The editor preserves existing colors when it replaces a category. It inserts new categories before the four emote positions. Saved recipes and starter recipes still supply their complete entries when available.

The Emotes category edits four wheel positions. An empty position uses `{"id":"/e"}`. Equip moves an existing emote rather than adding a duplicate. Catalog emotes can use the native recipe suffix without an earlier saved copy. The account wheel supports equip and removal. Owned emotes also have a local preview with Replay and Stop controls. A rebindable in-world wheel plays available entitled animations and sends native emote packets.

The Capes category equips, replaces, or removes free and owned capes. Persona capes use their catalog pack UUID. The account model service includes the selected cape in its assembled model. Classic imported capes remain separate skin fields.

The Size screen provides four native heights and two arm widths. Arm edits change `arm` and preserve `cs_arm`. Height edits replace the recognized pair of height entries. The wardrobe provides Both, Left, and Right controls for owned arms and legs. Native arm captures saved separate `/l` and `/r` entries even when both sides used the same piece. An edit keeps the opposite limb, its colors, and the emote wheel. Packet handles use the corresponding left or right limb type. The leg flow uses the same recipe structure and has targeted tests; it still needs a native write capture. Side controls stay disabled for unresolved free limb recipes. At small GUI sizes, Minecraft's category selector replaces the full category list, and limb and emote controls remain above the footer.

The color editor uses swatches captured from Bedrock 1.26.51. Skin tone edits change `skcol`. Hair and iris edits change channel zero in `col`; eyebrow and sclera edits change channels one and two. It preserves the remaining channels. Other piece palettes and channel controls remain incomplete.

## Account character assembly

The active character has an authenticated avatar at `GET /api/v1.0/profile/image/avatar`. The add-on assembles its body locally when all equipped assets and bindings are available. Recipes with unresolved free packs, capes, or animated shared body textures still use the GLTF model from `/api/v1.0/profile/image/ModelBinary`.

**Use in worlds** saves the locally assembled character, or converts the service model into a Bedrock atlas and geometry. It saves the appearance per account and sends it at login or through a live skin update. Slot selection and edits refresh an active character already selected for use in worlds.

Native ModelBinary and login captures use different Z conventions. Conversion reflects positions, node translations, and normals across Z, then reverses triangle winding. Skin geometry retains the native face direction.

The add-on resolves persona handles from the complete recipe and current catalog. Built-in handles use the native default pack UUID. Ordinary catalog handles use the pack UUID for both `PieceId` and `PackId`, plus the Store product UUID. An owned Office Shirt capture confirmed that its encrypted metadata's internal piece UUID differs from the transmitted handle.

Piece claims use native names such as `persona_hair`. Packet fields use ViaBedrock's enum names such as `Hair`. The add-on converts between these names and sends the recipe's four-channel tint groups. The packet codec normalizes `#0` to `#00000000` without changing the color value.

For owned assets, the add-on requests `GET /api/v1.0/player/inventory?includeReceipt=true` with the current Minecraft authorization. It decodes content keys only from that account's receipt. It resolves product downloads through PlayFab `Catalog/GetPublishedItem` and uses the native `libhttpclient/1.0.0.0` CDN user agent.

The runtime downloads owned assets from the official Xbox and PlayFab content hosts. It obtains receipt keys and decrypts owned packs in memory. Built-in assets use the separate Microsoft Store package flow below.

The asset reader checks archive limits, manifest UUID, and encrypted content ID. It decodes the AES CFB8 index and indexed files in memory. Native archives can contain two `contents.json` entries; the final entry supplies the encrypted index. Directory entries in the index do not require file data.

Local face assembly combines equipped skin, mouth, eyes, facial hair, and hair textures in native piece order. Static layers repeat across animated frames. Extracted head and hat meshes replace the service model's corresponding surfaces and bind to the new face strip. Two-frame faces retain the native blink expression.

Tint blending uses four weighted mask channels and the native HSL, LCh, and luminance color transfer. The alpha mask uses the character's skin tone, including eyelids. Recipe colors bind the other channels. Source alpha controls composition, and output bytes use native truncation. A private Bedrock 1.26.51.1 face capture matches all 2,048 RGBA pixels; isolated native compositor evaluations match 512 deterministic tint cases. These checks establish the captured composition and tint math. Other face sizes and equipped combinations still need native comparisons.

Local body assembly selects the equipped skeleton and body sources for the character's height and arm width. Empty `arm_size` fields select shared sources. The skeleton supplies pose bones and item locators. Equipped geometry sources replace their declared body or clothing zones while retaining those pose bones. Static piece surfaces share an atlas with a duplicated one-pixel border. Polygon layers on the same bone retain separate vertex, normal, and UV indices.

Shared skin and clothing textures use native piece order and the same tint compositor as faces. Compressed BGRA clothing maps encode red and green offsets around 128. A layer clears the mapped underlying texel when its source has no coverage there. The compositor then blends the layer's visible texel. A private Steve/HelliArm capture matches all 16,384 body pixels and body mesh UVs. Extracted assets assemble all nine starters across four heights and two arm widths. Other overlapping outfits and texture resolutions still need native comparison.

For animated owned geometry, assembly selects the character's body and arm variants. It replaces matching static preview surfaces and packs looping texture frames into a separate animation atlas. Save/load, login claims, and live packets retain those frames. Independent limb recipes filter animated bones by their limb ancestry and retain separate tint colors and atlas tiles. The opposite side keeps its static geometry. Unresolved free assets continue to use the service's static model. Built-in UUIDs resolve from the official package even when a catalog selection uses `/f` rather than `/d`.

A private HelliArm capture contains ten animated arm cubes, a 16-frame 32×512 strip, and a separate blinking face. Targeted checks decode the entitled arm pack, assemble its variants, preserve every frame through save/load, and render the native face and arm bindings together. These checks use local private fixtures through `STACKANVIL_PERSONA_ASSETS` and `STACKANVIL_PERSONA_CAPTURE`; the repository contains no captured assets or receipts.

## Built-in persona assets

The add-on bundles an Xodus-based package helper. First use opens Microsoft Store sign-in when no Store session exists. Sign in with the selected Bedrock account. The helper checks the Xbox user ID before requesting the package license.

The current pin selects Bedrock 1.26.51.1, package version 1.26.5101.0, for ViaBedrock protocol 2193. The package URL identifies the matching official Xbox CDN build. Its pinned header checksum anchors the package hash tree. The helper verifies metadata and encrypted file pages before decryption because this CDN serves the package over HTTP.

The helper obtains a device-bound license from Microsoft and unwraps its content key. It reads the segment index or the NTFS persona directory. The NTFS reader handles resident files and ordinary streams with multiple data runs. It downloads persona files, base vanilla model archives, and the metadata needed to locate them.

Java unpacks version 1 BR archives beneath their original piece directories. Shared content offsets are valid. Empty archive entries preserve separately supplied loose files. Path, file count, size, and duplicate checks apply before publishing the cache.

The cache lives under the add-on's `bedrock-assets/persona/<account>/<version>.zip` directory. Each file has a checksum, and the cache records the package identity. Cache format 2 includes the model library. Older persona-only caches refresh before use. A failed refresh keeps the previous cache. Store credentials remain in a separate private directory, and the helper reuses its device identity.

The source loader indexes piece metadata, PNG face strips, BGRA TGA tint masks, and geometry by native piece UUID. Equipped built-in pieces enter the same asset loader as owned pieces. Wave, Clap, Over There, and Follow Me use their extracted animation sources for previews and world playback. Built-in emotes retain their piece UUID as the wire identity.

A live test obtained the official license and extracted 229 files, including both base vanilla model archives. Java tests used the bundled helper, unpacked the archives, sampled all four emotes, decoded face masks, and reused the versioned cache. No downloaded content or credentials enter the repository. Fresh interactive Store sign-in and the Windows and macOS helper builds still need runtime verification.

Local add-on builds require Rust 1.98.1, Protobuf, and the platform's WebView build libraries. Linux sign-in requires WebKitGTK 4.1. Release and full-stack CI assemble helper resources for Linux x64, Windows x64, and both macOS architectures. Native installations serve only as private research fixtures.

Sources: [Xodus package extraction](https://github.com/xodus-gaming/xodus/blob/a3afa0569332e32ce2677c0edc643ef85477ee3e/crates/xodus-cli/src/commands/streaming.rs), [Xodus licensing](https://github.com/xodus-gaming/xodus/blob/a3afa0569332e32ce2677c0edc643ef85477ee3e/crates/xodus-cli/src/license.rs), and [BR archive format](https://github.com/bedrock-crustaceans/brarchive/blob/main/FORMAT.md).

## Dressing Room previews

The main Dressing Room and Classic Skin pack screen share the player skin renderer. Custom models use their saved geometry. Account characters include separate animated surfaces in the preview. Each preview owns and releases its textures when the screen changes or closes.

A running Java client displayed the HelliArm character with its body, face, and animated arms assembled locally from the private licensed fixtures. A private recording shows the open and closed face frames alongside changing arm frames. This checks production rendering; it does not establish native timing. Native geometry exports can contain null optional transforms. The asset loader omits those fields before assembly so the geometry parser applies its defaults. The account character preview stays visible without a world connection. Unsupported geometry reports an error through the existing import or selection flow.

## Owned emote previews

The add-on downloads emote packs through the current account's entitlement receipt. It reads the named animation source and uses the pack UUID as the wire identity. Native captures show that the metadata piece UUID differs. Receipts and content keys remain in memory. Preview uses the active account character and does not change its saved recipe.

Menu models retain the native root, waist, and body hierarchy. Bone poses also apply to animated clothing surfaces. The sampler supports position, rotation, scale, pre/post keyframes, linear and Catmull-Rom interpolation, and Molang frame queries. Each playback has its own variable state. Expressions have size and execution limits. Effects, delays, multiple animation sources, and entity-relative rotations remain unsupported.

Private Bedrock 1.26.51 Battle Cry and Kadoosh assets resolve to 6.5 and 4.75 seconds. Asset tests sample every frame at 60 Hz. A Java GUI recording verifies Battle Cry movement, attached clothing, readable controls at the default GUI scale, and pose reset after completion. The recording uses private native assets and a local appearance fixture. It does not verify a live Java account download.

Sources: [Microsoft animation reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/visualreference/actor_animation.v1.8.0?view=minecraft-bedrock-stable), [Molang syntax](https://learn.microsoft.com/en-us/minecraft/creator/documents/molang/syntax-guide?view=minecraft-bedrock-stable), [Mocha](https://github.com/unnamed/mocha), and [Blockbench animation interpolation](https://github.com/JannisX11/blockbench/blob/master/js/animations/timeline_animators.js).

## In-world emotes

The B key opens four native wheel positions. Mouse clicks and keys 1 through 4 play loaded animations. The key can be rebound in Controls. Missing account assets stay disabled and show an explanation.

The ViaBedrock provider forwards `EMOTE` and `EMOTE_LIST` with tracked player UUIDs. The add-on advertises available wheel assets and sends the selected pack UUID and duration. It animates body and clothing through one sampled pose per frame. Movement, completion, account changes, and disconnects clear playback.

Native Bedrock 1.26.51 Battle Cry captures send 130 ticks and flags zero. Its `PlayerAuthInput` Emoting flag clears after 130 ticks, or immediately when walking. A private Java relay test reproduces the packet identity, duration, completion flag transition, and movement cancellation. The native client's emote visibly animates its remote player in Java and returns to the ordinary pose. These tests use entitled local fixtures. The package loader now supplies the four default emotes. Other remote emotes without an available account asset remain unsupported.

Sources: [Bedrock 1.26.51 Emote payload](https://github.com/Mojang/bedrock-protocol-docs/blob/v1.26.51/json/EmotePacketPayload.json) and [Emote List payload](https://github.com/Mojang/bedrock-protocol-docs/blob/v1.26.51/json/EmoteListPacketPayload.json).

## Work still needed

- Resolve remaining free assets, cape bindings, and animated shared body textures. These recipes still depend on the service model. Compare more overlapping clothing combinations against native results.
- Compare more face sizes, tint channels, and equipped combinations against native results.
- Verify native blinking and strip timing. Implement emote effects, timelines, delays, multiple sources, relative rotations, chat announcements, and unavailable remote assets.
- Add other piece palettes, verify native leg edits, and resolve free limb side recipes. Add paid purchase/redemption flows and account classic-pack downloads.
- Verify versioned vanilla model overrides and native parent-name behavior. Implement local classic alias playback, render flags, and geometry-provided alias precedence. Compare inherited skins with native rendering.
- Verify login and live changes on a second client, including height, arm width, capes, and several animated outfits. The native relay displays the Java HelliArm skin. A white quad above the player moved independently with the sky clouds; it was not an extra face surface.

Keep login JWTs, receipts, content keys, raw flows, screenshots, player textures, and account data private under `.stackanvil/`.
