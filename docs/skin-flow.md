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

Licensed tests resolve all seven inherited entries from the base skin-model library, including parents supplied by entity model files. Equal duplicate definitions share one library entry. Conflicting definitions remain errors. The library now resolves versioned vanilla overlays. Native visual comparisons remain pending. A broader library check found an unresolved `rightarm` parent in the native legacy vex model. The importer rejects this model until native parent-name behavior is established. Classic skin animation aliases and render flags survive import and transport. Local alias playback uses the licensed player graph. Geometry-provided alias precedence remains incomplete.

## Account-owned classic packs

The Dressing Room has an Owned packs action. It reads the authenticated `MultiItemPage_PersonaSkinSelector` Store page and lists owned skin packs. Open pack downloads the selected pack and opens the shared classic preview. Refresh updates the account list. Returning from preview retains the selected pack and clears download status.

The loader uses the selected account's current inventory receipt and PlayFab catalog. It requires a receipt key for the selected pack UUID. It checks the published product, pack UUID, type, and Store version before downloading `skinbinary` from an official HTTPS CDN. It decrypts the content index and files in memory. Local imports and account downloads use the same pack reader, geometry loader, and appearance store. Production requires no native installation or copied content keys.

The native Store request uses empty entitlements and version fields. The service resolves ownership from authentication. Inventory product IDs can identify shell products without downloadable content. The loader therefore uses the product IDs from the Store page. Store catalog versions and manifest versions can differ. The loader compares versions between Store and PlayFab metadata, then checks the downloaded manifest UUID separately.

Private Bedrock 1.26.51.1 captures establish the request and content type. Fresh authenticated requests downloaded Birdie Wings and Earth Skin through production code. Their archives use different ZIP wrapper names. Both custom models load, including Earth Skin's null root-parent fields.

The replayed full stack passes 163 fixture-enabled tests with no skips. A running Java client passes 32 checks for real downloads, list selection, readable controls, custom-model preview, and Back navigation. These checks do not change account profiles. Marketplace purchases, redemption, and remote classic selection synchronization remain incomplete.

## Classic skin declarations

The importer preserves `skins.json` animation aliases in `SkinResourcePatch`, with `enable_attachables`, `held_item_ignores_lighting`, and `hide_armor`. Explicit false flags differ from absent flags. Empty animation aliases remain empty. These declarations do not populate `SkinAnimationData`.

The account store keeps these options with the classic appearance, including skins that use the standard Steve or Alex model. Preset selection suspends the options. Selecting the saved custom skin restores them. A plain PNG import clears the previous pack options. Model-width and cape edits preserve them.

Private Bedrock 1.26.51.1 loader and serialization observations establish the resource-patch fields. Tests cover metadata parsing, persistence, preset selection, width changes, and live protocol round trips. Preview skin data carries the same declarations. Java uses these aliases for local preview and world model playback.

Player equipment layers now use the installed skin's render flags. `enable_attachables=false` hides armor, wings, held items, and equipped head items. `hide_armor=true` hides armor and wings while preserving held items. `held_item_ignores_lighting=true` gives only held-item layers full brightness. Clothing, face, and cape layers keep their ordinary behavior. Missing flags retain the vanilla player defaults. Skin replacement, release, and disconnect clear the previous options.

The target native reader applies only present flags. The matching player definition enables attachables. Microsoft documents the [equipment flags and armor precedence](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction?view=minecraft-bedrock-stable#enable_attachables). A private running-client probe passed 208 checks across standard and custom models, flag combinations, layer submissions, lighting, replacement, and release. These checks establish Java layer behavior. Native visual and first-person comparisons remain pending.

## Classic animation playback

The package loader also extracts the base vanilla player definition, animations, and animation controllers. Classic aliases override the player defaults. Empty aliases disable their referenced animation. Imports compile the reachable graph before accepting an animated skin pack.

Each actor has separate variables and playback clocks. Initialization runs once. Per-frame scripts run before the ordered animation references. Nested controllers use ordered transitions, entry and exit scripts, and temporary variables with linear remap curves. Controller re-entry starts a new animation clock. Item queries retain string values. Native numeric float suffixes remain distinct from quoted text.

Previews use the player graph's paperdoll state. World models receive posture, motion, item, and rotation bindings. Body and clothing use one sampled pose. Entity-relative rotation cancels animated parent rotation through the authored bone hierarchy.

Licensed package tests establish the zombie-arm alias override and additive riding pose. The full add-on suite passes 106 tests with no skips. A running Java client passes eight checks for the animation bridge, preview pose, and player model pose. The preview shows the alias pose with a synthetic texture and privately downloaded actor assets. This fixture does not establish native motion equivalence or a live account import.

Effects and complete item-action bindings remain incomplete. Geometry-provided alias precedence and first-person playback remain pending. Native comparisons must also establish blended rotation spaces and nontrivial scale composition.

Controller transitions now read `all_animations_finished`, `any_animation_finished`, and `state_time` from the native state context. Conditions run before the current animation update. Empty states satisfy all-completion and fail any-completion. Zero-weight tracks retain their clock and completion flag. Nested controllers report their current state's completion and clear the query binding after their update.

Outgoing states supply `blend_transition` and `blend_via_shortest_path`. Crossfades update both states with the target's weights. Ordinary blending composes weighted tracks in order. Shortest-path blending interpolates each Euler axis, position, and scale before composition with the existing pose. A 180-degree tie uses the negative direction. State re-entry resets child clocks; nested controllers retain their selected state. Self-transitions reset playback without repeating entry or exit scripts.

The loader retains each controller file's format version. Formats before 1.18.10 can transition during their first update. Newer formats enter the initial state first. This distinction preserves the matching package's older player graph. Duplicate render passes reuse the pose, and a rewound lifetime starts a fresh actor graph.

Independent Bedrock 1.26.51.1 execution verifies completion handlers, state clocks, crossfade weights, delay boundaries, and shortest-path composition. Native fixtures also verify the 1.18.10 version boundary. These checks isolate controller behavior. Constant-only animation length defaults, visible native motion, and mixed rotation spaces still need verification.

The replayed full stack builds, and all 138 fixture-enabled add-on tests pass with no skips. A running Java client passes 46 checks for preview geometry, world model geometry, completion-triggered crossfades, repeated frames, and rewind. These checks use synthetic controller data. They do not establish visible native motion equivalence.

Sources: [Animation controller variables and transitions](https://learn.microsoft.com/en-us/minecraft/creator/documents/animations/animationcontroller?view=minecraft-bedrock-stable) and [animation rotation spaces](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/visualreference/actor_animation.v1.8.0?view=minecraft-bedrock-stable).

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
| Free left or right limb | Pack UUID plus `/fl` or `/fr` |
| Built-in left or right limb | Piece UUID plus `/dl` or `/dr` |
| Built-in emote | Piece UUID plus `/de` |
| Other emote | Pack UUID plus `/e` |
| Classic cape | Pack UUID plus its skin index |

The editor preserves existing colors when it replaces a category. It inserts new categories before the four emote positions. Saved recipes and starter recipes still supply their complete entries when available.

The Emotes category edits four wheel positions. An empty position uses `{"id":"/e"}`. Equip moves an existing emote rather than adding a duplicate. Catalog emotes can use the native recipe suffix without an earlier saved copy. The account wheel supports equip and removal. Owned emotes also have a local preview with Replay and Stop controls. A rebindable in-world wheel plays available entitled animations and sends native emote packets.

The Capes category equips, replaces, or removes free and owned capes. Persona capes use their catalog pack UUID. The account model service includes the selected cape in its assembled model. Classic imported capes remain separate skin fields.

The Size screen provides four native heights and two arm widths. Arm edits change `arm` and preserve `cs_arm`. Height edits replace the recognized pair of height entries. The wardrobe provides Both, Left, and Right controls for owned and free arms and legs. Native arm captures saved separate `/l` and `/r` entries even when both sides used the same piece. An edit keeps the opposite limb, its colors, and the emote wheel. Packet handles use the corresponding left or right limb type. At small GUI sizes, Minecraft's category selector replaces the full category list, and limb and emote controls remain above the footer.

Independent execution of the Bedrock 1.26.51.1 recipe encoder establishes free `/fl` and `/fr` flags and built-in `/dl` and `/dr` flags. Side changes preserve `/f` or `/d` when both limbs use the piece. Tests compare all 18 native combinations of source, limb, and side. Mixed owned and free replacements retain separate colors, packet types, and animated geometry bindings. Unknown flags remain errors. A fresh native leg write capture remains pending.

The replayed full stack builds, and all 158 fixture-enabled add-on tests pass with no skips. A running Java client passes 40 checks for free arm and leg controls, recipe splitting, colors, wheel positions, and packet types. The probe uses local recipes and makes no account writes. Native multiplayer comparisons remain pending.

The color editor uses swatches captured from Bedrock 1.26.51. Skin tone edits change `skcol`. Hair, facial hair, and iris edits change channel zero in `col`. Eyebrow edits change channel one. Sclera and mouth edits change channel two. Mouths use their own 29-color palette; facial hair uses the hair palette. Every edit preserves the remaining channels. Independent execution of the target client verifies the swatches and channel order. Premium piece palettes and channel controls remain incomplete.

The full stack builds, and all 148 fixture-enabled add-on tests pass with no skips. A running Java client passes 33 checks for color controls, saved swatch selection, Apply availability, eye channel cycling, and returning to the wardrobe. The runtime probe uses a local recipe fixture and writes no account changes. A fresh native mouth or facial hair write capture remains pending.

## Account character assembly

The active character has an authenticated avatar at `GET /api/v1.0/profile/image/avatar`. The add-on assembles its body locally when all equipped assets and bindings are available. Recipes with unavailable receipt keys still use the GLTF model from `/api/v1.0/profile/image/ModelBinary`.

**Use in worlds** saves the locally assembled character, or converts the service model into a Bedrock atlas and geometry. It saves the appearance per account and sends it at login or through a live skin update. Slot selection and edits refresh an active character already selected for use in worlds.

Native ModelBinary and login captures use different Z conventions. Conversion reflects positions, node translations, and normals across Z, then reverses triangle winding. Skin geometry retains the native face direction.

The add-on resolves persona handles from the complete recipe and current catalog. Built-in handles use the native default pack UUID. Ordinary catalog handles use the pack UUID for both `PieceId` and `PackId`, plus the Store product UUID. An owned Office Shirt capture confirmed that its encrypted metadata's internal piece UUID differs from the transmitted handle.

Piece claims use native names such as `persona_hair`. Packet fields use ViaBedrock's enum names such as `Hair`. The add-on converts between these names and sends the recipe's four-channel tint groups. The packet codec normalizes `#0` to `#00000000` without changing the color value.

For owned assets, the add-on requests `GET /api/v1.0/player/inventory?includeReceipt=true` with the current Minecraft authorization. It decodes content keys only from that account's receipt. It resolves product downloads through PlayFab `Catalog/GetPublishedItem` and uses the native `libhttpclient/1.0.0.0` CDN user agent.

The runtime downloads owned and freely available assets from the official Xbox and PlayFab content hosts. It decrypts packs in memory with account receipt keys. Built-in assets use the separate Microsoft Store package flow below.

A free pack can share a receipt key with another pack. The loader tries each unique account key when no matching pack entitlement exists. This requires a free catalog selection without a redemption requirement. The published product must also match the requested UUID, zero price, persona content type, and pack UUID. Paid or redemption-required pieces require their own entitlement. Accounts with no receipt content keys still need a supported key source.

Private tests decrypt and assemble unowned Asymmetric Button Up clothing and A-Line hair. Their body image matches all 16,384 model-service pixels. Independent execution of the target game compositor matches all 2,048 face pixels, including translucent hair edges. The service static face differs at twelve edge pixels. The compositor test preserves game behavior; that service discrepancy remains documented. Fixtures use `STACKANVIL_FREE_PERSONA_ASSETS` and `STACKANVIL_OFFICIAL_PERSONA`. Assets, account receipts, and execution harnesses stay private.

A running Java client downloaded both free packs through the production account loader. It assembled them with private licensed starter fixtures and displayed the outfit locally. The body and face pixel comparisons passed in that client. World renderer creation also passed. This test changed no account recipes; a native multiplayer outfit comparison remains pending.

The asset reader checks archive limits, manifest UUID, and encrypted content ID. It decodes the AES CFB8 index and indexed files in memory. Native archives can contain two `contents.json` entries; the final entry supplies the encrypted index. Directory entries in the index do not require file data.

Local face assembly combines equipped skin, mouth, eyes, facial hair, and hair textures in native piece order. Static layers repeat across animated frames. Extracted head and hat meshes replace the service model's corresponding surfaces and bind to the new face strip. Two-frame faces retain the native blink expression.

Tint blending uses four weighted mask channels and the native HSL, LCh, and luminance color transfer. The alpha mask uses the equipped skin's selected red tint, including eyelids. Recipe colors bind the other channels when the piece allows overrides. Source alpha controls composition, and output bytes use native truncation. A private Bedrock 1.26.51.1 face capture matches all 2,048 RGBA pixels; isolated native compositor evaluations match 512 deterministic tint cases. These checks establish the captured composition and tint math. Other face sizes and equipped combinations still need native comparisons.

Local body assembly selects the equipped skeleton and body sources for the character's height and arm width. Empty `arm_size` fields select shared sources. The skeleton supplies pose bones and item locators. Equipped geometry sources replace their declared body or clothing zones while retaining those pose bones. Static piece surfaces share an atlas with a duplicated one-pixel border. Polygon layers on the same bone retain separate vertex, normal, and UV indices.

Shared skin and clothing textures use native piece order and the same tint compositor as faces. Compressed BGRA clothing maps encode red and green offsets around 128. A layer clears the mapped underlying texel when its source has no coverage there. The compositor then blends the layer's visible texel. A private Steve/HelliArm capture matches all 16,384 body pixels and body mesh UVs. Extracted assets assemble all nine starters across four heights and two arm widths. Other overlapping outfits and texture resolutions still need native comparison.

Persona cape packs supply their texture through the same entitlement download and tint pipeline. Local assembly binds the texture to `geometry.cape` from the licensed vanilla library. It translates the cape surface to the equipped body pivot and retains the height skeleton. Explicit face UVs preserve the native bottom-face orientation and support larger textures without resampling.

An authenticated Copper Cape comparison matches rendered rest vertices, normals, and UVs at all four heights. Tests preserve every cape texel through atlas assembly, save/load, and the skin codec. Mirrored mappings and larger texture resolutions have targeted tests. The account recipes were restored after research. These checks establish static bindings. A running Java client passes nine checks for local assembly, preview attachment, and the world renderer. The rear preview shows the entitled cape. This run uses private licensed fixtures. Native cape motion and multiplayer comparison remain pending.

For animated geometry, assembly selects the character's body and arm variants. It replaces matching static preview surfaces and packs looping texture frames into a separate animation atlas. Save/load, login claims, and live packets retain those frames. Independent limb recipes filter animated bones by their limb ancestry and retain separate tint colors and atlas tiles. The opposite side keeps its static geometry. Free assets with unavailable receipt keys continue to use the service's static model. Built-in UUIDs resolve from the official package even when a catalog selection uses `/f` rather than `/d`.

A private HelliArm capture contains ten animated arm cubes, a 16-frame 32×512 strip, and a separate blinking face. Targeted checks decode the entitled arm pack, assemble its variants, preserve every frame through save/load, and render the native face and arm bindings together. These checks use local private fixtures through `STACKANVIL_PERSONA_ASSETS` and `STACKANVIL_PERSONA_CAPTURE`; the repository contains no captured assets or receipts.

Shared body textures also assemble locally. Static skin and clothing layers repeat beneath animated layers in native piece order. Tint masks follow each source frame. Clothing maps repeat vertically, and their offsets can clear texels across a frame boundary. Static geometry and capes retain their separate atlas.

Animated collections use separate 32-pixel and 128-pixel groups. Each source has square frames and a power-of-two frame count. Columns share the longest strip in their group. Shorter strips repeat to fill that length. Body layers and geometry collections share the 128-pixel group when both use it. Polygon UVs retain separate width and height scales in rectangular atlases.

Independent Bedrock 1.26.51.1 execution establishes source validation, column dimensions, and strip repetition. Native compositor output matches all 32,768 pixels of a synthetic two-frame body fixture. The fixture includes changing tint masks, translucent pixels, and a clothing-map offset across the frame boundary. These checks establish the tested composition rules. Native equipped-outfit and multiplayer comparisons remain pending.

The replayed full stack builds, and all 144 fixture-enabled add-on tests pass with no skips. A running Java client passes 58 checks for local assembly, texture groups, preview uploads, world uploads, frame phases, and release. The runtime probe combines licensed starter assets with synthetic animated clothing and geometry. It changes no account recipes. These checks do not establish native visible outfit parity.

## Persona tint selection

Palette selection honors `allow_tint_override`. Fixed-color pieces retain their metadata tint instead of recipe colors. A missing selected tint falls back to the authored base colors. Skin pieces use the slot tone on all four channels when overrides are allowed. Capes bypass selected tint.

Other pieces use the equipped skin's selected red tint for their alpha mask. A fixed skin supplies its metadata tint. Missing skin assets preserve each piece's existing alpha tint. Face layers, shared body layers, static surfaces, and animated surfaces use these rules.

Independent execution of Bedrock 1.26.51.1's palette-selection branches verifies 448 combinations. The probe supplies decoded colors at metadata accessor boundaries. Native code selects palettes, checks override flags, reads recipe groups, and resolves skin alpha. These checks establish palette selection. They do not establish premium palette availability or native visible outfit parity.

The replayed stack builds and passes 166 fixture-enabled tests with no skips. A running Java client passes 506 checks. These cover the native palette cases, animated preview and world texture uploads, frame phases, and release. The probe changes no account profiles.

## Texture animation timing

The matching package's persona render controllers select looping frames with `floor(query.life_time * 7)`, modulo the strip frame count. Face and body strips run at seven frames per second. World surfaces use actor render-state age. Preview surfaces use elapsed monotonic time from appearance creation. Renderer lookup does not advance the clock.

Blinking faces use the package's `default`, `open`, and `blink` states. Eyes start open. Each open-state evaluation samples the native 3-40 second threshold and 0-0.2 second return delay. State transitions retain the outgoing state's variable value for that frame. Repeated passes at the same lifetime do not resample. A rewound entity lifetime resets the controller. Body strips ignore face blink expressions.

Targeted tests cover frame boundaries, lifetime phase, cyclic wrapping, random threshold resampling, delayed return, repeated passes, and reset. Official package extraction establishes the controller inputs. The full stack builds, and all 116 fixture-enabled add-on tests pass with no skips.

A rebuilt Java client uses a private native skin fixture with separate arm and face bindings. All sixteen arm frames follow world render-state age and match the uploaded texture pixels. Blink uploads, duplicate-pass sampling, preview time, renderer lookup, and resource release pass. These checks establish the Java runtime path. Native multiplayer video comparison remains pending.

Sources: [Persona render controllers](https://github.com/Mojang/bedrock-samples/blob/main/resource_pack/render_controllers/persona.render_controllers.json) and [blink controller](https://github.com/Mojang/bedrock-samples/blob/main/resource_pack/animation_controllers/persona.animation_controllers.json).

## Built-in persona assets

The add-on bundles an Xodus-based package helper. First use opens Microsoft Store sign-in when no Store session exists. Sign in with the selected Bedrock account. The helper checks the Xbox user ID before requesting the package license.

The current pin selects Bedrock 1.26.51.1, package version 1.26.5101.0, for ViaBedrock protocol 2193. The package URL identifies the matching official Xbox CDN build. Its pinned header checksum anchors the package hash tree. The helper verifies metadata and encrypted file pages before decryption because this CDN serves the package over HTTP.

The helper obtains a device-bound license from Microsoft and unwraps its content key. It reads the segment index or the NTFS persona directory. The NTFS reader handles resident files and ordinary streams with multiple data runs. It downloads persona files and all stable vanilla layers for models, animations, controllers, client entities, sounds, and particles. Particle textures and the shared texture archive supply the referenced atlases.

Java unpacks version 1 BR archives beneath their original piece directories. Shared content offsets are valid. Empty archive entries preserve separately supplied loose files. Path, file count, size, and duplicate checks apply before publishing the cache.

The cache lives under the add-on's `bedrock-assets/persona/<account>/<version>.zip` directory. Each file has a checksum, and the cache records the package identity. Cache format 5 includes the layered model, actor, and effect libraries and their pack manifests. Older caches refresh before use. A failed refresh keeps the previous cache. Store credentials remain in a separate private directory, and the helper reuses its device identity.

The source loader indexes piece metadata, PNG face strips, BGRA TGA tint masks, and geometry by native piece UUID. Equipped built-in pieces enter the same asset loader as owned pieces. Wave, Clap, Over There, and Follow Me use their extracted animation sources for previews and world playback. Built-in emotes retain their piece UUID as the wire identity.

A live Java test used the bundled helper to obtain the official license and acquire the expanded libraries. It unpacked the archives and reused the versioned cache. Earlier fixture tests sample all four emotes and decode face masks. No downloaded content or credentials enter the repository. Fresh interactive Store sign-in and the Windows and macOS helper builds still need runtime verification.

The matching base library contains 4,761 FSB5 sound banks: 4,691 use FADPCM, and 70 use PCM16. Its particle archive contains 114 compiled MCB definitions and one text definition. Cache storage preserves these bytes. The asset loader decodes sound banks and particle definitions on demand. Animation effect dispatch remains incomplete.

Sound decoding preserves stereo interleaving, sample rates, sample counts, and inclusive loop boundaries. It trims final FADPCM frames to the declared sample count. Input, metadata, and output limits apply before allocation. Private comparisons match all licensed banks and 96 generated banks against the [vgmstream decoder](https://github.com/vgmstream/vgmstream/blob/7dc938fa2f210943b37c7b6511852b516ef432ab/src/coding/fadpcm_decoder.c). These comparisons establish PCM output. Applying sound parameters during playback, captions, and attachment behavior still need implementation and verification.

The versioned library now parses sound catalogs into immutable event and sample parameters. It selects samples by integer weight and resolves selected FSB or OGG files through the same library. Native defaults preserve category case, sequential `is3D` values, streaming flags, volume, pitch, subtitles, and distance settings. Numeric strings and ranges become zero. Nonempty strings and containers are true for sound flags. Invalid weight totals and non-finite parameters fail before asset resolution.

Private tests compare 1,187 native catalog, scalar, selection, category-routing, and attenuation cases. An integration test resolves licensed samples and compares their PCM with the independent decoder. These checks establish resource selection and requested parameters. Animation dispatch, locator transforms, audible mixing, and captions remain incomplete. Some references in the acquired library still lack sample files, including music assets.

Sound files resolve within each pack before falling back to lower packs. This lets a higher OGG file replace a lower FSB bank, as [Microsoft documents](https://learn.microsoft.com/en-us/minecraft/creator/documents/addcustomsounds?view=minecraft-bedrock-stable). The target executable declares FSB, OGG, then WAV extensions. The current decoder supports FSB and OGG. OGG decoding uses Minecraft's JOrbis reader with page, channel, sample-rate, and output limits. The three licensed OGG files and six generated streams match libvorbis within one PCM quantization step across 109,603 scalar samples. These checks establish decoding and channel order. They do not establish FMOD decoding equivalence or audible playback. Vorbis loop comments and WAV decoding remain incomplete.

Particle decoding supports MCB formats 1.26.10 and 1.26.30 and text JSON. Java declarations describe their 70 reachable binary layouts. The reader preserves optional fields, tagged values, component identities, and source order. It rejects unsupported versions, malformed data, and excessive complexity. Private comparisons match 115 base definitions and 108 overlay definitions against the [reference decoder](https://github.com/LPaicen/brarchive-extractor/blob/503a8ce7ad94030241a3590c926ac36f72169c71/src/mcb-decoder.ts). Production decoding needs neither exported schemas nor an external decoder. The package helper now acquires the overlays. Particle simulation and rendering remain incomplete.

Local add-on builds require Rust 1.98.1, Protobuf, and the platform's WebView build libraries. Linux sign-in requires WebKitGTK 4.1. Release and full-stack CI assemble helper resources for Linux x64, Windows x64, and both macOS architectures. Native installations serve only as private research fixtures.

Sources: [Xodus package extraction](https://github.com/xodus-gaming/xodus/blob/a3afa0569332e32ce2677c0edc643ef85477ee3e/crates/xodus-cli/src/commands/streaming.rs), [Xodus licensing](https://github.com/xodus-gaming/xodus/blob/a3afa0569332e32ce2677c0edc643ef85477ee3e/crates/xodus-cli/src/license.rs), and [BR archive format](https://github.com/bedrock-crustaceans/brarchive/blob/main/FORMAT.md).

## Versioned vanilla resources

The official package supplies 57 stable vanilla layers through `vanilla_1.26.51`. The helper selects `vanilla`, `vanilla_base`, and numeric version directories. Older names such as `vanilla_1.14` imply patch version zero. The cache validates pack identities and overlay versions before publication.

The loader applies layers in numeric version order after `vanilla` and `vanilla_base`. Model, animation, controller, and client-entity definitions override earlier definitions by identifier. Each controller retains its own format version. Conflicting identifiers within one pack remain errors. Sound catalogs combine entries across both older and newer catalog formats. Sound banks, particle files, and atlases resolve by pack order.

The matching player definition comes from `vanilla_1.21.130` and declares 68 aliases. The root controller still references removed first-person aliases. Those undeclared references contribute no track. Declared aliases with unavailable resources retain incomplete tracks. The loader compiles script arrays as one bounded Molang program, so blocks can span JSON strings and retain early returns.

A fresh bundled-helper run acquired all 57 layers, compiled the player graph, and reused the checksummed cache. Fixture tests sample the graph for 120 frames. These checks establish acquisition and graph loading. They do not establish first-person, item-pose, or native motion parity.

A rebuilt Java client passes 722 checks with the licensed overlays and a synthetic skin texture. The probe verifies layer selection, the player definition, preview geometry, world-model geometry, and repeated-frame handling. It changes no account recipes. Native visible motion comparison remains pending.

Sources: [Microsoft resource overrides](https://learn.microsoft.com/en-us/minecraft/creator/documents/overwritingassets?view=minecraft-bedrock-stable), [client-entity selection](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction?view=minecraft-bedrock-stable), and [version-history layer configuration](https://github.com/tryashtar/minecraft-version-history/blob/master/personal_config.yaml).

## Dressing Room previews

The main Dressing Room and Classic Skin pack screen share the player skin renderer. Custom models use their saved geometry. Account characters include separate animated surfaces in the preview. Each preview owns and releases its textures when the screen changes or closes.

A running Java client displayed the HelliArm character with its body, face, and animated arms assembled locally from the private licensed fixtures. A private recording shows the open and closed face frames alongside changing arm frames. This checks production rendering; it does not establish native timing. Native geometry exports can contain null optional transforms. The asset loader omits those fields before assembly so the geometry parser applies its defaults. The account character preview stays visible without a world connection. Unsupported geometry reports an error through the existing import or selection flow.

## Owned emote previews

The add-on downloads emote packs through the current account's entitlement receipt. It reads the named animation source and uses the pack UUID as the wire identity. Native captures show that the metadata piece UUID differs. Receipts and content keys remain in memory. Preview uses the active account character and does not change its saved recipe.

Menu models retain the native root, waist, and body hierarchy. Bone poses also apply to animated clothing surfaces. The sampler supports position, rotation, scale, pre/post keyframes, linear and Catmull-Rom interpolation, and Molang frame queries. Each playback has its own variable state. Expressions have size and execution limits. Entity-relative rotations use the authored hierarchy.

The target native loader selects the first declared emote animation source. The add-on preserves that order and accepts additional declarations. An unavailable first source remains an error. Sounds, particles, and named actor events remain unsupported.

Native effect research verifies separate particle and sound paths. Earlier notes incorrectly identified the particle callback as a sound callback. Playback still needs resource bindings, model locator transforms, audio output, particle simulation and rendering, and effect lifecycle management. The extracted player definitions have no sound or particle bindings. The two captured owned emotes contain neither effect type, so those fixtures cannot establish audible or particle parity.

The native particle callback resolves aliases, chooses locator or actor positions, and optionally attaches an emitter to the actor. Its initialization descriptor contains a tagged Molang program. Independent execution verifies 256 dispatch cases, 16 initialization cases, and 64 cases through the actual initialization setter. These checks establish particle requests at mocked engine boundaries. They do not establish audio parameters or particle appearance.

Timeline sound declarations contain an effect name and an optional locator. The native parser adds their timestamp to a 104-byte record. Fourteen constructor cases and 24 ordering cases verify defaults, float conversion, and a stable timestamp sort. The animation player queues resolved sounds after particle dispatch and before timeline scripts.

Nineteen native queue cases verify alias availability, missing actor context, event boundaries, loops, and suppression without later catch-up. The harness supplies component lookup and memory-copy boundaries. These cases establish queue contents.

The sound consumer passes a position callback to the sound engine. Native callback execution verifies 256 actor availability, moving locator, position fallback, property preservation, and reference cases. Constructor references and a read-only lookup in the running target client identify the engine and backend methods.

Another 512 native cases execute the engine method, backend method, and actual position callback together. A missing catalog event produces no request. The inspected backend invokes the callback once, then requests ordinary playback with volume `2`, pitch `1`, and no server sound handle. It does not retain the callback for later movement. The harness supplies catalog lookup and captures the playback request without audio output.

Another 328 native cases verify weighted sample selection, zero weights, sample volume and pitch multipliers, positional overrides, and handle allocation. The harness supplies the random draw and stops before sample loading.

Catalog setup and sample construction pass 141 native cases. They establish category defaults, scalar volume and pitch conversion, sample flags, and the `is3D` default carried between entries. Another 400 cases establish native minimum and maximum distance requests, inverse and linear rolloff requests, default restoration, and subsound propagation. FMOD calls are supplied boundaries. These checks do not establish audible attenuation. Category volume, captions, audible output, and production effect playback remain incomplete.

Another native probe verifies 64 binding availability and lifetime cases. The binder assigns separate particle and sound tables through two weak resources. Absent or expired resources leave existing bindings unchanged. This verifies native table assignment, not production resource loading or named actor events. The native emote loader adds its first declared source to the shared actor-animation library.

The sampler evaluates `start_delay` once before playback. Delays consume frame time before `anim_time_update` advances the clock. Previews stop from playback state. Incoming world emotes retain the packet duration as their deadline, including durations longer than the declared animation length.

Independent execution of the Bedrock 1.26.51.1 animation player establishes two boundary behaviors. Exact delay expiry retains the full frame delta. An overshoot uses only its remaining time. Loops retain the last frame at an exact boundary and wrap after crossing it.

The completion flag persists after the first cycle. The native player reevaluates `loop_delay` on every subsequent active update, including updates within later cycles. Java preserves these target behaviors. Repeated samples at the same elapsed time reuse the pose without another expression evaluation.

Private native clock fixtures cover initial delays, loop delays, custom time updates, ordinary completion, and held final frames. These fixtures isolate the clock from geometry and effects. They do not establish timeline execution or visible native motion equivalence. A running Java client passes 15 checks for delayed preview poses, geometry transforms, packet deadlines, replay, and completion reset. The replayed stack builds, and all 123 fixture-enabled add-on tests pass with no skips.

Molang timelines accept a script or an array of scripts at each timestamp. A stable sort preserves script order at equal timestamps. Timeline timestamps also contribute to an inferred animation length. Tracks without bones can update actor variables.

The player samples bones before timeline scripts. Scripts use the current animation clock and effective frame delta, including delay overshoot. The event interval excludes the previous cursor and includes the current clock. A backward custom clock changes the cursor without replaying events immediately. After a loop wraps, the cursor resets and scripts run only in the new segment. Outgoing tails and skipped complete cycles do not replay.

Independent execution of the target game's timeline normalizer and player verifies ordering, equal timestamps, delays, loops, held frames, and custom clocks. Java tests also cover repeated render passes, replay, and variable sharing across actor tracks. Named actor events still report unsupported data. The replayed stack builds, and all 128 fixture-enabled add-on tests pass with no skips.

A running Java client passes 37 checks for timeline poses, preview geometry, world playback, delays, replay, and completion reset. These checks use synthetic animation data. They do not establish visible native motion equivalence.

Private Bedrock 1.26.51 Battle Cry and Kadoosh assets resolve to 6.5 and 4.75 seconds. Asset tests sample every frame at 60 Hz. A Java GUI recording verifies Battle Cry movement, attached clothing, readable controls at the default GUI scale, and pose reset after completion. The recording uses private native assets and a local appearance fixture. It does not verify a live Java account download.

Sources: [Microsoft animation reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/visualreference/actor_animation.v1.8.0?view=minecraft-bedrock-stable), [Molang syntax](https://learn.microsoft.com/en-us/minecraft/creator/documents/molang/syntax-guide?view=minecraft-bedrock-stable), [Mocha](https://github.com/unnamed/mocha), and [Blockbench animation interpolation](https://github.com/JannisX11/blockbench/blob/master/js/animations/timeline_animators.js).

## In-world emotes

The B key opens four native wheel positions. Mouse clicks and keys 1 through 4 play loaded animations. The key can be rebound in Controls. Missing account assets stay disabled and show an explanation.

The ViaBedrock provider forwards `EMOTE` and `EMOTE_LIST` with tracked player UUIDs. The add-on advertises available wheel assets and sends the selected pack UUID and duration. It animates body and clothing through one sampled pose per frame. Movement, completion, account changes, and disconnects clear playback.

Native Bedrock 1.26.51 Battle Cry captures send 130 ticks and flags zero. Its `PlayerAuthInput` Emoting flag clears after 130 ticks, or immediately when walking. A private Java relay test reproduces the packet identity, duration, completion flag transition, and movement cancellation. The native client's emote visibly animates its remote player in Java and returns to the ordinary pose. These tests use entitled local fixtures. The package loader now supplies the four default emotes. Other remote emotes without an available account asset remain unsupported.

Sources: [Bedrock 1.26.51 Emote payload](https://github.com/Mojang/bedrock-protocol-docs/blob/v1.26.51/json/EmotePacketPayload.json) and [Emote List payload](https://github.com/Mojang/bedrock-protocol-docs/blob/v1.26.51/json/EmoteListPacketPayload.json).

## Work still needed

### Missing features

- Resolve free assets for accounts without usable receipt keys. These recipes still depend on the service model. Resolve unavailable remote emote assets.
- Finish piece-specific color availability and establish additional palette callers. The inspected native picker accepts only loaded skin, facial hair, mouth, eye, and hair pieces with an enabled override flag. All 224 native eligibility cases pass. Metadata-to-runtime flag construction and other UI paths remain unresolved.
- Add paid purchase and redemption flows. Synchronize classic skin selection with the native account.
- Implement animation sounds, particles, and named actor events. Resolve effect resources and model locators, and preserve native event suppression. Emote chat announcements exist, but native platform communication filters remain incomplete.
- Complete native item poses, first-person playback, and equipment behavior. Remaining bindings include local charging prediction, post-use trident behavior, item-name mappings, and exact native use durations.
- Resolve additional geometry animation alias sources and native parent-name behavior. Modern and library geometry flags derive aliases through persistence and transport. The legacy vex model still has an unresolved `rightarm` parent.

The loader now uses the matching 68-alias player definition. Its added tracks include crawling, spyglass, goat horn, brush, and spear poses. These tracks still need complete query bindings and native motion comparisons. Inverse interpolation and all 30 easing functions now use target curve behavior. Conditional assignments and modern nested conditionals preserve their selected values. Licensed spear scripts produce changing bone rotations with supplied queries; live spear query bindings and first-person playback remain incomplete.

### Verification still needed

- Compare more face sizes, tint channels, overlapping outfits, and cape motion against the native client.
- Compare blink timing, strip timing, emote motion, mixed rotation spaces, and nontrivial scale composition against native playback.
- Capture fresh native leg edits and compare their account writes. Free limb side controls already exist.
- Verify login and live changes on a second client, including height, arm width, capes, and several animated outfits. The native relay displays the Java HelliArm skin. This establishes visual presence, not complete timing or format parity.
- Verify fresh interactive Store sign-in and helper runtime behavior on Windows and macOS. Linux acquisition, license decryption, extraction, and cache reuse already pass.

The replayed full stack builds, and all 240 fixture-enabled add-on tests pass with no skips. The rebuilt client also passes 13,578 native curve comparisons and a conditional-assignment check. Earlier Java runtime probes passed 1,324 checks across previously implemented paths. The new overlay probe passes 722 checks for the updated graph and renderer paths. These counts cover specific implemented paths and do not establish full skin or Dressing Room parity. Research details and verification limits are in the [Classic Skin patch notes](../patches/viafabricplus-bedrock/upstreamable/0003-classic-dressing-room.pr.md) and [Character Creator patch notes](../patches/viafabricplus-bedrock/upstreamable/0009-show-saved-character-creator-slots.pr.md).

Keep login JWTs, receipts, content keys, raw flows, screenshots, player textures, and account data private under `.stackanvil/`.
