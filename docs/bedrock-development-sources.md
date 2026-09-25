# Bedrock Edition development sources

Use this reference when changing ViaBedrock, the ViaFabricPlus Bedrock add-on, or their data generators. The links were checked on 2026-09-25. Recheck versions and source branches before using a numeric protocol value.

## Choose the protocol version first

The current StackAnvil ViaBedrock checkout targets Bedrock **1.26.51**, network protocol **2193**. Its source of truth is `BEDROCK_VERSION_NAME` and `BEDROCK_PROTOCOL_VERSION` in [ViaBedrock's `ProtocolConstants.java`](https://github.com/ViaVersionAddons/ViaBedrock/blob/main/src/main/java/net/raphimc/viabedrock/protocol/data/ProtocolConstants.java). Check the same file in `.worktrees/viabedrock` after syncing the stack. A later checkout can target another version.

Mojang's latest protocol preview at the time of this review is **1.26.60-beta.28**, protocol **2216**. The [1.26.50-beta.26 preview](https://mojang.github.io/bedrock-protocol-docs/1.26.50-preview.26/) uses protocol **2192**. These are useful for finding changes, but neither describes protocol 2193 exactly.

For protocol and enum work:

1. Read the target protocol number from the checked-out ViaBedrock source.
2. Use Mojang's **beta/preview** packet and type pages to investigate field order, conditions, and enum values. The stable protocol pages have shown incorrect enum mappings; do not use them as the sole authority for numeric values.
3. Select a preview with the same protocol number when one exists. If none exists, treat the closest preview as a lead, then compare the release changelog, current codecs, and a native client or server trace.
4. Check the enum's wire type and encoding as well as its numeric value. Add a focused encode/decode test when a mapping affects packets we send or receive.
5. Record the game build and network protocol with any capture. Never copy values from protocol 2216 into a protocol 2193 implementation without evidence.

The [preview `TextProcessingEventOrigin` page](https://mojang.github.io/bedrock-protocol-docs/1.26.60-preview.25/types/text-processing-event-origin/) shows a concrete enum renumbering in its **All builds** changelog. Use the changelog to locate a change, then check the schema for the target build.

## Mojang protocol reference

These links cover packet shape and protocol behavior. A versioned link is a snapshot. The release index can move as Mojang publishes builds.

| Source | Use |
| --- | --- |
| [Latest protocol portal](https://mojang.github.io/bedrock-protocol-docs/) | Find the newest preview and its network protocol number. |
| [1.26.60-beta.28 packet index](https://mojang.github.io/bedrock-protocol-docs/1.26.60-preview.28/) | Inspect packets in the latest checked preview, protocol 2216. |
| [1.26.60-beta.28 type index](https://mojang.github.io/bedrock-protocol-docs/1.26.60-preview.28/types/) | Find supporting objects, unions, and enums for that preview. |
| [1.26.50-beta.26 packet index](https://mojang.github.io/bedrock-protocol-docs/1.26.50-preview.26/) | Compare a preview near the current ViaBedrock target. |
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

For a specific feature, search the local `protocol/packet`, `protocol/types`, and `protocol/data` directories. For maps, skins, login, and resource packs, start with `MapPackets`, `SkinType`, `LoginPackets`, and `ResourcePackPackets`. Some of these files are StackAnvil patches and do not exist on upstream `main`.

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
