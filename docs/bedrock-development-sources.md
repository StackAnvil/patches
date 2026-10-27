# Bedrock Edition development sources

Use this reference when changing ViaBedrock, the ViaFabricPlus Bedrock add-on, or their data generators. The target protocol and GDK snapshot were updated on 2026-10-27. Recheck versions and source branches before using a numeric protocol value.

## Choose the protocol version first

The current StackAnvil ViaBedrock checkout targets Bedrock **1.26.60**, network protocol **2225**. The [first upstreamable patch](../patches/viabedrock/upstreamable/0001-update-bedrock-to-1-26-60.patch) contains the update. Check `BEDROCK_VERSION_NAME` and `BEDROCK_PROTOCOL_VERSION` in `.worktrees/viabedrock` after syncing the stack.

[Mojang's 1.26.60 release metadata](https://github.com/Mojang/bedrock-protocol-docs/releases/tag/v1.26.60) identifies protocol 2225. Its schema version label is `1.26.60-beta.0`. Use the network protocol number to match evidence. A preview for another protocol provides leads but requires wire checks.

For protocol and enum work:

1. Read the target protocol number from the checked-out ViaBedrock source.
2. Start with Mojang's metadata archive for the target protocol. Use explicit `x-enum-binary-value` values instead of enum declaration order.
3. Compare matching beta/preview schemas and implementation evidence when release metadata omits values or conflicts with captures. A newer preview can target another protocol.
4. Check the enum's wire type and encoding as well as its numeric value. Add a focused encode/decode test when a mapping affects packets we send or receive.
5. Record the game build and network protocol with any capture. Never copy values from another protocol into the target implementation without matching evidence.

The [preview `TextProcessingEventOrigin` page](https://mojang.github.io/bedrock-protocol-docs/1.26.60-preview.25/types/text-processing-event-origin/) shows a concrete enum renumbering in its **All builds** changelog. Use the changelog to locate a change, then check the schema for the target build.

Preview tables also need wire checks.
The earlier protocol 2193 actor-event table lists sequential values that contradict the matching BDS and native client.
BDS sends rocket explosion 25 and crossbow charge completion 74. The old table lists 24 and 54.
The protocol 2225 metadata now supplies the correct explicit values.
The [actor-event evidence](../patches/viabedrock/deferred/0001-translate-bedrock-actor-events-to-java-statuses.pr.md) records the discrepancy.
Keep verified sparse IDs even when a versioned table gives different values.

The 2225 archive resolves the old container-slot and text-origin enum corrections.
The generator no longer repairs protocol 2193 metadata.
It supplements `MinecraftPacketIds` from packet schemas because that enum still omits declared packets, including stonecutter and block-passenger packets.
Schema and enum protocol numbers must match. Conflicting IDs fail generation.

Enum values and Cereal variant indexes are separate wire fields.
`ResourcePackResponse` uses enum values 1 through 4 and variant indexes 0 through 3.
Item stack actions retain unused enum values 7 and 8, which the variant list omits.
Keep these translations in codecs, not generated enums.
`InventorySourceType.Non_Implemented_Feature_TODO` instead uses `Enum-as-Value`: its wire value is 99999, not declaration index 4.
Likewise, no-compression sentinels use all bits at their wire width: 65535 for NetworkSettings and 255 for frame headers.

## Protocol 2225 consumers

The packet audit also checks the [official 26.60 changelog](https://feedback.minecraft.net/hc/en-us/articles/49852828563853-Minecraft-Bedrock-Edition-26-60-Changelog).
A schema update establishes wire compatibility. Each existing feature must also use the new fields or notifications.

| Area | Current handling |
| --- | --- |
| Stonecutter selection | Send recipe buttons with packet 354. Apply packet 355 only to the local player's current matching container, without an echo. |
| Cursor split drags | Send packet 358 Start and Stop around transfers. Screen retirement, invalid phases, recovery, and failed sends end the drag. |
| Dimension clouds | Retain height and visibility with dimension bounds. Project them through Java environment attributes within the existing Overworld override boundary. |
| Animation and interaction hands | The updated codecs carry hand fields. Native offhand item restrictions still apply. |
| Skins and player lists | PlayFab identity comes from player-list entries and reaches Java profile properties. Serialized skin data no longer carries that field. |
| Sound updates | Decode the new tagged event union through the sound model. |
| Chunk biomes | Consume the new override flag. Java uses received biome data because it does not run Bedrock's client biome generator. |
| Block seating and signed audio | Spawn fields are decoded, but seating and signed content playback remain unsupported. |
| Matchmaking and environment layers | Queue-state UI integration and attribute-layer rendering remain feature gaps. |

The changelog's collision-box JSON arrays do not require a decoder change by themselves.
Our block renderer consumes the server's normalized `boxes` list, rather than block-authoring JSON.
Keep legacy authoring support separate from the network shape representation.

The new bitmap atlas layout metadata is a separate rendering gap.
The current UI font importer handles TrueType declarations, not bitmap atlas layout or extended character mapping.
Do not claim that the protocol migration implements the changelog's font or Character Creator rendering fixes.

## Establish the behavior to port

Confirm that the target Bedrock version has the feature before you implement it. Record what players observe and what the client or server sends. Use versioned protocol documentation, game assets, implementation code, or native captures as evidence. When these sources leave a behavior uncertain, test it in the native game.

Choose Java mechanisms by their final result, not their names. For a sound, compare the audio sample, pitch, volume, and closed caption. Two Java sound events can play the same sample but show different captions. Bedrock can also use one sound name for several actions. Preserve the Bedrock result even when a more specific Java event exists.

Document the evidence and any remaining uncertainty in the patch commit body or `.pr.md`. Treat an intentional departure from Bedrock behavior as a separate compatibility change, not a feature port.

## Mojang protocol reference

These links cover packet shape and protocol behavior. A versioned link is a snapshot. The release index can move as Mojang publishes builds.

| Source | Use |
| --- | --- |
| [Latest protocol portal](https://mojang.github.io/bedrock-protocol-docs/) | Find the newest preview and its network protocol number. |
| [1.26.60 metadata archive](https://github.com/Mojang/bedrock-protocol-docs/releases/download/v1.26.60/metadata.zip) | Read packet schemas and explicit enum values for protocol 2225. |
| [Protocol changelog](https://mojang.github.io/bedrock-protocol-docs/changelog/) | Compare stable and preview builds; inspect **All builds** for preview changes. |
| [Protocol schema releases](https://github.com/Mojang/bedrock-protocol-docs/releases) | Get versioned JSON schema archives and their protocol numbers. |
| [Protocol docs repository](https://github.com/Mojang/bedrock-protocol-docs) | Inspect schema generation and guide sources. Its site is assembled from releases, not only `main`. |
| [Player movement overview](https://mojang.github.io/bedrock-protocol-docs/guides/player-movement-overview/) | Understand input frames and movement authority. |
| [Server-authoritative block breaking](https://mojang.github.io/bedrock-protocol-docs/guides/block-breaking-overview/) | Trace block actions, predictions, and server corrections. |
| [Player UI container slots](https://mojang.github.io/bedrock-protocol-docs/guides/server-auth-inventory-player-ui-container/) | Map inventory slots and item stack requests. |
| [SubChunk request system](https://mojang.github.io/bedrock-protocol-docs/guides/sub-chunk-request-system-v1-18-10/) | Understand chunk requests and cache behavior. |
| [Client cache miss validation](https://mojang.github.io/bedrock-protocol-docs/guides/client-cache-miss-response-packet-validation/) | Check blob response rules and limits. |
| [NetherNet signaling guide](https://mojang.github.io/bedrock-protocol-docs/guides/nether-net-onboarding-guide/) | Understand the signaling transport. Check build support before applying it. |

## ViaBedrock and StackAnvil implementation

Read the local generated checkout before changing a patch. The links to `main` help locate upstream code, but the pinned base and applied patches determine this repository's behavior.

| Source | Use |
| --- | --- |
| [ViaBedrock repository](https://github.com/ViaVersionAddons/ViaBedrock) | Start with its supported features and links to other protocol projects. |
| [Protocol constants](https://github.com/ViaVersionAddons/ViaBedrock/blob/main/src/main/java/net/raphimc/viabedrock/protocol/data/ProtocolConstants.java) | Check the Bedrock game version, protocol number, and Java target. |
| [Clientbound packet IDs](https://github.com/ViaVersionAddons/ViaBedrock/blob/main/src/main/java/net/raphimc/viabedrock/protocol/ClientboundBedrockPackets.java) | Find packet IDs that ViaBedrock receives. |
| [Serverbound packet IDs](https://github.com/ViaVersionAddons/ViaBedrock/blob/main/src/main/java/net/raphimc/viabedrock/protocol/ServerboundBedrockPackets.java) | Find packet IDs that ViaBedrock sends. |
| [Bedrock type registry](https://github.com/ViaVersionAddons/ViaBedrock/blob/main/src/main/java/net/raphimc/viabedrock/protocol/types/BedrockTypes.java) | Locate codecs and their wire types. |
| [Data asset sources](https://github.com/ViaVersionAddons/ViaBedrock/blob/main/Data%20Asset%20Sources.md) | Trace each committed mapping, palette, and generated asset to its origin. |
| [Data generator guide](https://github.com/ViaVersionAddons/ViaBedrock/blob/main/generator/README.md) | Regenerate Bedrock and Java mapping inputs. |
| [ViaFabricPlus Bedrock add-on](https://github.com/ViaVersionAddons/viafabricplus-bedrock) | Check client integration, network hooks, rendering, and account UI. |
| [ViaVersion](https://github.com/ViaVersion/ViaVersion) | Check the translation API and Java protocol mappings. |
| [StackAnvil patch workflow](patch-workflow.md) | Edit the generated checkout and rebuild the patch series. |
| [Native cooking action reference](native-cooking-actions.md) | Check verified cooking dispatch, source, quantity, and item-return behavior and its remaining limits. |

For a specific feature, search the local `protocol/packet`, `protocol/types`, and `protocol/data` directories. For maps, skins, login, and resource packs, start with `MapPackets`, `SkinType`, `LoginPackets`, and `ResourcePackPackets`. Some of these files are StackAnvil patches and do not exist on upstream `main`.

## Versioned Windows GDK reference

The community [Windows GDK archive](https://github.com/bubbles-wow/mcbe-gdk-unpack-archive) publishes unpacked packages and standalone executables as release assets.
The [1.26.60.5 release](https://github.com/bubbles-wow/mcbe-gdk-unpack-archive/releases/tag/1.26.60.5) supplies the current client resource snapshot.
Its package SHA-256 is `a36945ad3b28d762d31d4533168a102294b55e8f88fe2c570485493fb3d15f08`.
Its `Minecraft.Windows.exe` SHA-256 is `988f6a61403b4381aa41e6c66d64cce441b14e561a9b10f647c2758ef3f2672a`.

The [1.26.51.1 release](https://github.com/bubbles-wow/mcbe-gdk-unpack-archive/releases/tag/1.26.51.1) remains the historical native reference for earlier comparisons.
Its `Minecraft.Windows.exe` has SHA-256 `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`.
The existing private executable matches that digest and the published file size.
This provides a reproducible source for the native instruction controls without another executable download.

Build files are release attachments. The Git tags themselves point to README commits.
Use the target release rather than the newest preview, and verify the executable digest before reusing recorded native addresses.
Keep downloaded packages, executables and extracted content in private local research storage.

## Independent protocol implementations

Use these to compare behavior and identify gaps. Match each project's supported protocol before borrowing a packet layout or enum value.

| Source | Use |
| --- | --- |
| [Cloudburst Protocol](https://github.com/CloudburstMC/Protocol) | Compare Java packet models, serializers, and codecs. |
| [Cloudburst Network](https://github.com/CloudburstMC/Network) | Compare RakNet and Bedrock network handling. |
| [Geyser](https://github.com/GeyserMC/Geyser) | Compare Bedrock-to-Java translation and data mappings. Its direction differs from ViaBedrock. |
| [gophertunnel](https://github.com/Sandertv/gophertunnel) | Compare Go packet models, login, and proxy behavior. |
| [PrismarineJS bedrock-protocol](https://github.com/PrismarineJS/bedrock-protocol) | Compare JavaScript codecs, authentication, and transport behavior. |
| [PrismarineJS minecraft-data](https://github.com/PrismarineJS/minecraft-data/blob/master/doc/bedrock.md) | Inspect versioned protocol schemas and Bedrock data provenance. |
| [PMMP BedrockProtocol](https://github.com/pmmp/BedrockProtocol) | Historical cross-check only; PMMP's organization is archived. |

## Assets, add-ons, and world data

These sources describe game content and conversion data. They do not establish network enum values.

| Source | Use |
| --- | --- |
| [Mojang Bedrock samples preview branch](https://github.com/Mojang/bedrock-samples/tree/preview) | Inspect current preview resource packs, behavior packs, entities, and schemas. |
| [Minecraft Creator reference, experimental view](https://learn.microsoft.com/en-us/minecraft/creator/?view=minecraft-bedrock-experimental) | Read creator-facing behavior and component documentation. |
| [bedrock.dev](https://bedrock.dev/) | Browse versioned add-on schemas and client content. |
| [Bedrock Wiki](https://wiki.bedrock.dev/) | Get community explanations for resource packs, entities, and server concepts. |
| [Cloudburst Data](https://github.com/CloudburstMC/Data) | Trace Bedrock palettes, biomes, and runtime item data used by other projects. |
| [PMMP BedrockData](https://github.com/pmmp/BedrockData) | Compare generated game data; check its age before use. |
| [Bedrock block upgrade schema](https://github.com/opencollab-incubator/BedrockBlockUpgradeSchema) | Handle old block states and world data. |
| [Bedrock item upgrade schema](https://github.com/opencollab-incubator/BedrockItemUpgradeSchema) | Handle old saved item data. |
| [CubeConverter](https://github.com/oryxel1/CubeConverter) | Check resource-pack geometry conversion used by the StackAnvil build. |

## Reproduce behavior

Use the [official Bedrock Dedicated Server](https://www.minecraft.net/en-us/download/server/bedrock) as a reference implementation. [Cloudburst ProxyPass](https://github.com/CloudburstMC/ProxyPass) can inspect Bedrock traffic. The [StackAnvil development guide](development.md) and [capture lab guide](capture-lab.md) describe local joins, captures, and private artifacts.

Keep credentials, raw flows, screenshots, and JVM dumps in ignored `.stackanvil/` paths. When two references disagree, record the game version, protocol number, packet bytes, and the code path that produced them. Resolve the disagreement with a focused test against a native client or server.
