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
| Vanilla resources | Apply the advertised world cutoff to metadata and native libraries. Archive format 2 carries it through ViaProxy. Native and direct Java current/older/current cat controls verify resource selection. Tint materials render through v6 actor state. Native cat engine variables now select the expected pose states. Captured audio matches sample selection and the tested server WAV priority paths. Complete pose alignment and broader resource comparisons remain pending. |
| Chunk biomes | Consume the new override flag. Java uses received biome data because it does not run Bedrock's client biome generator. |
| Block seating and signed audio | Spawn fields are decoded, but seating and signed content playback remain unsupported. |
| Matchmaking and environment layers | Queue-state UI integration and attribute-layer rendering remain feature gaps. |

The changelog's collision-box JSON arrays do not require a decoder change by themselves.
Our block renderer consumes the server's normalized `boxes` list, rather than block-authoring JSON.
Keep legacy authoring support separate from the network shape representation.

Bitmap atlas conversion now reads layout metadata and the extended character map.
Each atlas retains metadata from its own pack, including legacy behavior without metadata.
Matching native captures establish whole-label Unicode fallback, fractional glyph metrics, and ten-unit bitmap line advances.
Ordinary Unicode cells use eight UI units. Private-use cells retain their source-pixel size.
The legacy-pack comparison confirms that replacing the first atlas also retires inactive vanilla extension pages.
Text spacing and colored icons now match; a one-pixel vertical title-origin difference remains.
The protocol migration alone does not establish font or Character Creator rendering parity.

## 26.60 behavior audit

This audit compares the official 26.60 changes with our protocol 2225 stack.
Packet decoding alone does not establish behavior parity.
The source checks below identify confirmed handling and remaining gaps.
They do not replace a native gameplay comparison.

### Confirmed correction

The neighbor-shape patch reconstructed redstone connections after the version
patch mapped the server's explicit states. This discarded command-authored
shapes, custom-block connections, and opposite up/down steps.
`ConnectedBlockShapes` now reconstructs only fences and stairs.
All 1,296 wire connection/power combinations retain their supplied properties
without neighbor or conductor queries.
The regression fails before the correction and passes afterward.
The [owning patch notes](../patches/viabedrock/upstreamable/0010-render-neighbor-dependent-block-shapes.pr.md#authoritative-redstone-states-in-2660)
record the evidence and verification limits.
Chorus and fire connections already use the server's explicit properties.
No later neighbor reconstruction overrides those properties.

### Existing paths checked

| Change | What the current code establishes | Remaining limit |
| --- | --- | --- |
| Resumed weaker effects | `LivingEntity.updateEffect` replaces the active effect, including a lower amplifier, and sends duration and HUD flags. | No new native stronger/shorter versus weaker/longer capture. The server owns the effect stack. |
| Sneaking at water contact | `PlayerPosture.next` retains requested sneaking in water when the pose fits. | Full movement and collision parity still require native traces. |
| Sound volume and fade | `BedrockSoundPlayback` multiplies the envelope by sample gain. `BedrockSoundEnvelope` retargets from its current value. Pending controls apply when playback starts. | Native timing for queued fades, pause, and synchronized broadcast remains unverified. |
| Custom collision arrays | `CustomBlockModel.boxes` reads the server's normalized list of min/max boxes. | Authoring JSON arrays do not prove a different network representation. |
| Custom dimension clouds | Dimension definitions retain height and visibility and project them through the existing Java environment override. | This does not implement every environment attribute layer. |
| World clock commands | `WorldClockTracker` applies named clock updates and paused state. | Command validation and rollover belong to BDS. Java can only project registered clocks. |
| Drowned helmets | Equipped living actors retain Java equipment rendering instead of entering our native body renderer. | The native equipment/model combination still needs a visual comparison. |
| Strider dismount | The server's new `ExitVehicleLookDirectionSystem` chooses the destination. | Do not duplicate that server system in Java input code. |
| Fireball ignition, Wind Burst targets, arrows, piston push eligibility, loot functions, and stricter behavior schemas | These changes belong to authoritative server simulation or content loading. | Shared client prediction and visuals can still need native checks. No client rule was added from the changelog alone. |

The bundled resource comparison covers 5,164 old and 5,175 new JSON documents.
Thirteen new or changed documents include cat and sheep graphs, zombie-villager
animation bindings, and the drowned model. They introduce no new Molang query names.
The sheep controller now exits grazing through `any_animation_finished`, with
separate adult and baby tracks. Our runtime supports that query and persistent
loop-completion flags. A private probe runs the bundled controller for both
ages, verifies the adult and baby grazing offsets, and returns both to walking.
This checks our runtime with actual assets, not native graphical parity.
The refreshed assets carry these changes; they do not require a second
hardcoded animal animation.
The drowned geometry change is in the new `vanilla_1.26.60` overlay.
Comparing only the old overlay paths would miss it.
Player and persona controller assets do not establish the engine's new armor masking behavior.

### Work still needed

1. **Verify vanilla resource transitions against the native client.**
   The audit found that `ResourcePackPackets` discarded the base-game version
   and native loaders selected every vanilla overlay.
   The implementation now retains that version and selects metadata, textures,
   actor graphs, and audio together before applying server overrides.
   Native archive format 2 carries the context through ViaProxy.
   The conversion cache includes it even when the selected file bytes match.
   Microsoft's [base-game version guide](https://learn.microsoft.com/en-us/minecraft/creator/documents/basegameversioning)
   specifies cumulative vanilla overlay selection and independent server packs.
   BDS 1.26.60.6 captures confirm `*` for an ordinary world and `1.20.0`
   for an isolated template-marked world with that version.
   Unit tests cover newer/older/newer selection and resource-manager reuse.
   Native and direct Java controls now select matching cat resources across current/1.20.0/current connections.
   Captured PCM confirms splash/explosion/splash sample selection through those transitions.
   Native and direct controls retain server WAV priority above vanilla FSB resources in both versions.
   ViaProxy accepts the older context and selects the same server WAV.
   Native and direct reconnects without the sound packs restore the vanilla sample.
   The [resource notes](../patches/viafabricplus-bedrock/upstreamable/0013-resolve-licensed-native-vanilla-images.pr.md#world-version-resource-selection)
   retain the evidence scope. Complete pose alignment and broader audio comparisons remain open.
2. **Held trapdoor placement comparisons.**
   The core retains physical use lifetime and matches local predictions to Java sequence numbers.
   Prediction format 2 carries the result and target-relative cursor.
   The add-on retains the first trapdoor facing, half, and world hit until release or cancellation.
   Temporary item-family changes preserve that state but apply the snap only to held trapdoors.
   Empty hands restore ordinary interaction with fresh hits.
   The existing native outline remains correct. Native bottom-face hits use approximately 0.8175.
   Physical mouse rotation matches native facing, upper-half state, and closed state through direct Java and ViaProxy.
   Held repeats use a 300 ms delay after the first attempt and each successful local use.
   Failed repeats do not restart the delay.
   Frame polling after camera movement preserves placement order before the next network tick.
   Fresh forced-Survival native fixtures predict inventory decrements and send the remaining stack in the first placement's air phase.
   The last block uses request ID zero and omits the empty air phase.
   Earlier captures combined Creative client state with server Survival consumption and did not establish the Survival inventory format.
   Native and direct Java retry one rejected first placement within the same session.
   Direct Java and ViaProxy pause cancellation stop active sessions before physical release.
   Fresh native and ViaProxy sessions also match repeated rejection followed by rotation without consumption.
   After a preceding successful hold, both native and ViaProxy instead place a neighbor and consume one item.
   Matching session history explains the earlier apparent correction mismatch.
   Native outline and occlusion checks now recognize remote Bedrock connections through ViaProxy.
3. **Verify bitmap font layout against native Bedrock.**
   The importer now converts bitmap atlases, layout metadata, and Unicode fallback pages.
   The licensed provider retains atlas images and layout files.
   The new vanilla `default8.json` requests extended mapping, height 12, and offset -3.
   The matching executable selects 449 extended entries or 256 legacy entries.
   Custom atlases without their own metadata retain legacy layout.
   Tests cover metadata ownership, glyph pages, texture scale, offsets, and server overrides.
   Native 1.26.60.5 title captures establish whole-label fallback for Japanese text and U+1F00.
   Ordinary Unicode pages use eight logical UI units, independent of texture resolution.
   Private-use pages E0 through F8 retain their source-pixel size.
   Mixed-language and legacy-pack renders now match glyph shapes, sizes, and spacing.
   Native multiline and colored private-use captures verify their distinct metrics.
   A one-pixel vertical title-origin difference remains at the tested scale.
   Fixed anchor controls also expose fractional sampling differences: normal labels sit one pixel high, while extra-large fixed-height labels sit one pixel low.
   Fractional X positions add an extra Java ink column. These native controls reject a universal origin adjustment.
4. **Verify skin masking and profile changes.**
   Persona assembly combines piece geometry into shared surfaces.
   The renderer does not explicitly preserve every clothing category for equipment masking.
   A native Dressing Room persona now supplies a visible reference and captured body/face inputs.
   Its offline capture retains the native player UUID, so profile changes reach the in-world appearance.
   Direct and ViaProxy Java comparisons now match visible armor coverage and restoration using the captured native persona inputs.
   Both routes also replace Alex with Steve and restore Alex at 40 blocks.
   Hidden-layer masking and native LOD texture binding checks remain open.
   Updated assets alone do not prove these engine fixes work here.
5. **Verify movement and rendering boundaries.**
   Native and direct Java Survival captures now cover falls onto solid ground, both sides of a water boundary, and fully inside water.
   Both take landing damage while the body overlaps the solid block, including when the center is over water.
   The water control takes no landing damage. These cases do not establish complete movement parity.
   Native recordings show the sky fading back during blindness's final second while night vision remains active.
   Java normalized already dimmed RGB and jumped to bright fog on the first nonzero frame.
   The add-on now applies that dimming after night-vision normalization for Overworld air fog.
   Fresh direct Java and ViaProxy day/night controls fade gradually and preserve immediate restoration after forced cancellation.
   Native night fog brightness and the precise fade curve still differ.
   Dragon-dependent fog distances now have native controls, described below. Changed block picking still needs focused native checks.
   Core now retains `PLAYER_FOG` snapshots and resolves complete distance settings against the selected resources.
   The add-on consumes dry-air commands through a connection-owned receiver.
   The native dragon distance cap now has matching native and Java controls.
   The authored base-biome distance control now matches. Native engine-specific rules and transition timing remain open.
   Existing lightmap and collision code cannot establish those fixes by itself.
   A live actor-picking fixture exposed missing hand fields in actor-use transactions and the explicit attack swing.
   The protocol patch now supplies both fields and shares outgoing swings through one factory.
   Native boat interaction and attack captures establish field order.
   Fresh direct and ViaProxy recordings confirm boarding and the native hurt countdown, without malformed-packet disconnects.
   Boat and player clicks now use the displayed Java base before conversion to Bedrock world coordinates.
   The native boat comparison identified a 0.375 hull-origin error in the old conversion.
   The physical fallback now uses the retained native dimensions with 0.1 blocks of picking padding on each face.
   Native boat top/front/side and armor-stand front/side controls establish the tested planes.
   Direct and ViaProxy reproduce all five planes within 0.0001 blocks using nonphysical aliases.
   Authored hitboxes retain priority, physical collision remains separate, and both routes preserve block occlusion.
   Native attacks also carry the picked world position, which Java's attack packet omits.
   A negotiated atomic attack message now preserves the actual client pick and current actor lifetime.
   Direct and matching ViaProxy controls cover actor replacement, block occlusion, exact hit transport, and native hurt countdowns.
   Ordinary Java attacks remain available without that capability.
   The fallback correction closes the tested hull-surface difference. Exact view-ray arithmetic and broader block-outline comparisons remain open.
   Fresh direct and ViaProxy recordings confirm the corrected world hit and receive the boarding acknowledgment.
6. **Complete remaining content features.**
   Item-component custom swing, use-start, and durability sounds have no matching
   component consumer in the current item path.
   Boolean geometry bone visibility also needs a verified network representation and consumer.
   Block seating, signed audio, matchmaking UI, and environment layers remain separate gaps.
   Experimental freezing, Frostbite, and ice features require feature-specific
   evidence; generated IDs or Java fallbacks do not establish parity.

### Native fog controls in 26.60

Fog payload version 2 carries command layers, selected biome bindings, and the existing registry-default policy through the negotiated `viabedrock:fog` channel.
Settings retain fixed or render-relative distances and colors. Empty commands reveal the selected biome settings.
A water-only top layer preserves the lower air setting.
Listener replacement and disconnect retire previous commands.
Fluid and weather distances retain their existing paths.

The native End sky uses a grayscale texture instead of Java's purple texture.
Matching 26.60.5 shader bytecode multiplies this texture by `SkyColor`.
Live white and red controls read approximately twice the fog RGB at that binding, with alpha 2.
The add-on selects the licensed texture through the world resource library, below server pack overrides.
It decodes off-thread and uploads during client ticks, before any GPU render pass.
Disconnect retirement also runs on the client thread, with listener ownership checked before GPU cleanup.
Fresh direct and ViaProxy recordings confirm white/red sky colors, fixed distances, water-only fallback, removal, and empty resets.
Both 180-second recordings finish normally.
Native sky motion, pixel sampling, transition timing, biome-boundary blending, legacy default bindings, and engine-specific vanilla fog rules remain unverified.

The dragon override uses start 0 and end `min(100, effective render distance)`.
Matching `RenderChunk` vertex bytecode establishes the distance formula and the native `FogAndDistanceControl` binding.
Owned native uniform reads measure 100 blocks at effective render distance 192 and 80 blocks at effective distance 80.
Native controls also establish 100 blocks without commands and above red command fog.
Teleporting the admitted actor far away preserves the override. Death restores the short command distance.
Fresh direct and ViaProxy recordings each finish normally after ten corresponding phases.
Their actual renderer buffers report 100 blocks during the override and restore the 128-block or 16-block command after death.
These controls replace Java's previous 1,024-block dragon fallback.


Native 1.26.60.5 and BDS 1.26.60.6 use protocol 2225 for these controls.
The client uses Fancy graphics, a 1280 × 720 window, and GUI scale 2.
The private journal contains 32 complete `PLAYER_FOG` snapshots.
Each payload contains an unsigned variable-length count followed by UTF-8 strings with unsigned variable-length lengths.
Removing the final command entry sends an empty stack.

In dry Overworld air, a white 16-block fog overrides a lower 128-block fog.
A water-only entry above that air entry preserves the air result.
A red air entry above both changes the visible air fog.
Removing it restores the lower air entry.
These controls establish stack priority and fallback between media. They do not establish inheritance between individual fields.
Captures after roughly two seconds still contain transitions; the steady controls wait at least twelve seconds.

The End fixture places black distance markers on a quartz floor at player foot height 65.
With no living dragon, the 16-block fog hides the nearest marker. The 128-block control leaves it visible.
A living dragon roughly 24 blocks away overrides the 16-block distance while the white fog color remains visible.
Killing the dragon restores the command distance in the same view.
The [26.60 changelog](https://feedback.minecraft.net/hc/en-us/articles/49852828563853-Minecraft-Bedrock-Edition-26-60-Changelog)
describes this nearby-dragon override and the dead or distant cases.

After a fresh connection, a living dragon roughly 345 blocks away does not override the 16-block command distance.
Moving a previously nearby dragon 512 blocks away removes its boss bar but retains the distance override in the earlier session.
The journals retain admitted actors until death. A fresh distant connection contains no dragon admission.
These results distinguish actor lifetime from boss-bar visibility. They do not establish a universal admission radius.
Raised-platform captures, unsettled transitions, and frames with the inactivity overlay are excluded from the distance comparison.
The separate resource-pack override of the vanilla End fog identifier remains unverified.

A second fixture uses an explicit `minecraft:the_end` client-biome definition that binds a unique red fog identifier.
Without commands or living dragons, native uniforms measure red fog from 0 to 32 blocks at effective render distance 192.
Renaming the earlier vanilla fog override to its canonical filename did not change the native result.
The explicit biome binding therefore supplies the base-fog control.

This fixture also exposed stale biome metadata in core.
Older vanilla definitions use `the_end`; the current `vanilla_1.21.120` definition uses `minecraft:the_end`.
Core now normalizes insertion and lookup so higher vanilla and server layers replace the same biome entry.
Custom namespaces remain distinct.
Two regressions cover both override directions, colors, fog binding, and namespace isolation.
The version-2 fog snapshot now carries these selected biome settings to both Java routes.
Each fresh route verifies seven phases with actual renderer buffers and the received `minecraft:the_end` camera biome.
Base red fog uses 32 blocks; a white command uses 16, and removal or empty commands restore 32.
A living dragon retains red color and overrides distance to 100 blocks; death restores 32.
The native grayscale End sky now applies to this base control too.
Floor lighting still differs, so these controls do not establish native pixel parity.

The Java implementation now consumes complete command snapshots, selected biome settings, and the existing registry-default fallback.
The add-on selects the dragon override from living admitted actors, independently of Java boss-bar flags.
The native cap and command restoration have matching direct and ViaProxy controls.
Exact transitions, spatial biome blending, legacy default bindings, vanilla engine-specific rules, and broader sky/lighting parity remain open.

## Current implementation goal

The next general compatibility PR covers these five areas.
A checked item requires the behavior evidence listed below, implemented
corrections where needed, and fresh validation of the affected stack.
The 26.60 audit above supplies the starting evidence, not completion evidence.

- [ ] **World resource versions:** select vanilla metadata, textures, actors, and
  audio from one immutable world-version context. Preserve server pack priority.
  Compare a newer-world to older-template transition against native Bedrock.
  Check that cached definitions and sounds from the previous world do not leak.
- [x] **Held trapdoor placement:** establish how native Bedrock selects and holds
  the placement direction. Suppress ordinary block interaction during the held
  placement. Verify release, item changes, cancellation, and server correction.
- [ ] **Bitmap fonts:** support atlas layout metadata and extended character
  mapping. Resolve metadata from the atlas's own pack. Compare mixed-language
  vanilla text and a legacy custom atlas with no layout metadata.
  Sixteen legacy-atlas labels now match native glyph positions and pixel masks
  across four font sizes and quarter-unit offsets at GUI scale 2.
  Current extended-font labels also match at scale 2. Two half-size Unicode
  labels still differ. Scale-1 controls retain small-label and normal-size
  Unicode sampling differences, so the font area remains open.
- [ ] **Skins:** compare clothing beneath equipped armor and texture changes
  after profile selection. Cover each affected armor slot, unequip, profile
  replacement, and native LOD selection with matching visual fixtures.
  Native and direct Java captures now show matching visible armor coverage
  and restoration across seven phases for one classic custom geometry.
  Eleven classic clothing-bone markers now match all 77 armor visibility conditions.
  Default Alex/Steve replacement also matches at 5, 20, and 40 blocks.
  A real native Dressing Room persona now matches visible armor coverage and restoration across seven phases on both Java routes.
  Captured Alex renders at 20 and 40 blocks; Alex/Steve/Alex replacement matches at 40 blocks.
  Complete incoming skin records match the installed renderer records on both routes, with no rejected skins.
  Body yaw, lighting, shadows, and idle phases differ. Hidden-layer masking and native LOD texture selection remain open.
  Native GPU captures now identify the actual body and face bindings through seven armor phases and 20/40-block distance controls.
  Alex/Steve/Alex replacement at 40 blocks selects each matching atlas, with no stale profile binding.
  These default personas show no LOD texture switch. Distinct LOD resources and wardrobe-specific masking remain open.
  A real owned outerwear pendant now hides beneath a chestplate and restores after removal on native and direct Java.
  Native GPU vertices collapse while hidden. Thirty settled Java samples verify the actual cube visibility across the three phases.
  The canonical incoming persona record matches the installed renderer record. Other wardrobe categories and distinct LOD resources remain open.
  The synthetic custom persona markers remain excluded.
- [ ] **Movement and rendering:** compare falls at water/solid boundaries,
  dragon-dependent fog, combined blindness/night vision, and block/entity
  picking. Trace the responsible client or server path before changing it.
  Retain a separate evidence result for each boundary.

Fold corrections into their owning patches. Keep independently reviewable
features separate, preserve historical native provenance, and replay the
affected stacks. Local probes verify their declared contracts only.
Record unresolved native differences explicitly instead of marking the
whole area complete from packet decoding or Java fallbacks.
The upstream version-update draft remains separate from this general PR.

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
