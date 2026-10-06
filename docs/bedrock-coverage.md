# Bedrock coverage ledger

This reference tracks the full Bedrock coverage goal for contributors.
The target is Bedrock 1.26.51.1, build 51061372, network protocol 2193, and Java 26.3.
The baseline review date is October 3, 2026.

## Status and evidence

- **Implemented** means a production path exists. It does not establish native parity.
- **Verified** means evidence establishes the behavior and connection routes named in that row.
- **Incomplete** means required behavior is missing or partial.
- **Unverified** means an implementation lacks sufficient native or integration evidence.

No complete area currently has verified Bedrock parity.
Tests for a decoder, sampled graph, or submitted vertices establish only those boundaries.
Visible rendering, timing, audio, and account flows require their own comparisons.
An unreviewed requirement remains incomplete until evidence establishes its status.

## Architecture and connection routes

ViaBedrock owns packet decoding, authoritative state, inventory, asset processing, and standard Java translation.
The client add-on handles behavior that requires custom rendering, camera controls, or input integration.
ViaProxy must carry the state and resources that these integrations need.

Each feature must record results for direct connections and ViaProxy.
Ordinary Java clients use standard translations where those translations reproduce the required behavior.
A fallback does not establish native parity.

### Connection lifetime comparisons

The direct resource-pack prompt previously closed a healthy session after 30 seconds without application packets.
The [client timeout patch](../patches/viafabricplus-bedrock/upstreamable/0019-preserve-raknet-sessions-during-resource-pack-prompts.pr.md) leaves liveness detection to RakNet.
The [core disconnect patch](../patches/viabedrock/upstreamable/0079-finish-transport-initiated-raknet-disconnects.pr.md) prevents a second handshake after the transport starts closing.
A rebuilt direct client waits 75 seconds at the prompt, accepts the pack, and spawns.
Pausing the private server then produces a disconnect at the configured 30-second session timeout.
The ViaProxy route opens the native cartography screen and retains Java's TCP timeout handler.
Pausing its Bedrock backend also closes the connection after 30 seconds.
These comparisons establish the tested Linux routes; other transports and platforms remain unverified.

## Protocol inventory

The complete applied source defines 169 inbound packet types.
There are 113 explicit registrations, 16 explicit cancellations, and 40 automatic fallback cancellations.
These counts describe source registration, not feature completion.
The inventory excludes commented enum entries and includes transition registrations.
One declared packet, `STONECUTTER_SET_RECIPE` (355), is absent from the matching protocol 2193 schema.
Its serverbound counterpart (354) is also absent.
Mojang introduces both in [1.26.60-preview.21, protocol 2207](https://mojang.github.io/bedrock-protocol-docs/1.26.60-preview.21/packets/clientbound-stonecutter-set-recipe-packet/).
Their missing handlers are outside the pinned target's coverage requirements.
The matching schema contains 168 of the inbound declarations and 80 of the 81 outbound declarations.

| ID | Requirement | Status | Remaining evidence or work |
| --- | --- | --- | --- |
| P1 | Every inbound packet and field | Incomplete | Audit registered handlers for discarded fields and implement applicable missing behavior. |
| P2 | Every outbound packet and field | Incomplete | Audit request generation, flags, enum values, state transitions, and native client ordering. |
| P3 | Target packets absent from enums | Incomplete | Matching schema comparison identifies 20 packet IDs absent from both direction enums, listed below. Audit native applicability and direction before adding production paths. |
| P4 | Intentional exclusions | Incomplete | Record versioned evidence for each telemetry, Education, platform, or obsolete exclusion. |

A private capture of the rebuilt ViaProxy route records the target server's startup order on 2026-10-03.
Five equipment-slot updates arrive before StartGame, followed by a generic level event, the player list, clocks, jigsaw data, and voxel shapes.
After StartGame, the server repeats the same player-list payload and sends full inventory snapshots for windows 0, 120, 124, and 119.
The observed warnings therefore do not establish lost inventory or player-list state on this route.
Jigsaw data arrives only once, before StartGame, and still has no handler.
Audit its retained state and editor behavior, and compare startup ordering on other server implementations.
This capture does not justify buffering every packet before StartGame.

The [clock patch](../patches/viabedrock/upstreamable/0014-initialize-and-preserve-bedrock-clock-time.pr.md) now accepts explicit clock packets during configuration.
The pinned server sends a state sync before StartGame and its registry afterward.
Direct and ViaProxy joins retain the registry while a supplemental custom-block pack loads.
Java starts at the captured 72,046 ticks after that pack completes.
Tests preserve running and paused snapshots, independent clocks, legacy fallback, and explicit sync after legacy time updates.
The server advertises a running clock while its disabled daylight rule keeps queried daytime fixed.
Native handling of those conflicting signals and live paused-clock behavior remain unverified.

### Target packets absent from both direction enums

The [Mojang 1.26.51 metadata release](https://github.com/Mojang/bedrock-protocol-docs/releases/tag/v1.26.51) declares protocol 2193.
Its schema contains 231 packet IDs; 20 appear in neither direction enum.
Some have commented declarations, which provide no runtime handling.
This audit establishes missing declarations, not native applicability or complete field behavior.

| Area | Missing packet names |
| --- | --- |
| Controls and script drawing | `ClientboundControlSchemeSetPacket`, `PrimitiveShapesPacket` |
| Pack settings | `ServerboundPackSettingChangePacket`, `ResourcePacksReadyForValidationPacket` |
| Data stores | `ClientboundDataStorePacket`, `ServerboundDataStorePacket` |
| Script UI | `ClientboundDataDrivenUIShowScreenPacket`, `ClientboundDataDrivenUICloseScreenPacket`, `ClientboundDataDrivenUIReloadPacket`, `ServerboundDataDrivenScreenClosedPacket` |
| Presentation | `GraphicsOverrideParameterPacket`, `ClientboundTextureShiftPacket`, `CameraAimAssistActorPriorityPacket`, `LocatorBarPacket` |
| Environment | `ClientboundAttributeLayerSyncPacket`; the matching schema describes it as currently disabled |
| Store and presence | `ServerStoreInfoPacket`, `ServerPresenceInfoPacket` |
| Parties | `PartyChangedPacket`, `SendPartyDestinationCookiePacket`, `PartyDestinationCookieResponsePacket` |

The [source guide](bedrock-development-sources.md) defines the version and enum research process.

## Inventory and editors

| ID | Requirement | Status | Remaining evidence or work |
| --- | --- | --- | --- |
| I1 | Cartography creation, extension, cloning, locking, locator conversion, and naming | Incomplete | Core implements recipes, crafting, locking, naming, state transport, and metadata refresh. The add-on renders inline naming and previews through ViaProxy. Verify remaining operations and direct connections. |
| I2 | Structure and jigsaw editors | Incomplete | Jigsaw settings and edit requests work in core on tested direct and ViaProxy routes. Normal right-click opening works with server operator permission through both routes. Complete native container lifecycle, rejection flows, structure responses, generation, and jigsaw data. |
| I3 | Stonecutter operations | Incomplete | Verify recipe selection, result acquisition, close behavior, and inventory reconciliation. Dedicated recipe-selection packets belong to protocol 2207 and are excluded from target 2193. |
| I4 | Trading and loom | Implemented | Preserve their tested request and response paths. Complete remaining native and inventory edge comparisons. |
| I5 | Every container operation | Incomplete | Audit bulk transfer, acknowledgments, rejection recovery, closing, reconciliation, and legacy inventory paths. |

The [jigsaw edit patch](../patches/viabedrock/upstreamable/0084-translate-native-jigsaw-block-edits.pr.md) preserves both signed priorities and translates complete block-entity updates in core.
The native editor retains priorities `-7` and `13` after reopening.
A direct Java edit persists `-19` and `31` across a ViaProxy reconnect.
A ViaProxy edit persists `-23` and `37` in the dedicated server's saved block entity.
The probe opens the standard Java screen directly; normal interaction, container opening, and rejection flows remain unverified.
Jigsaw data and generation remain incomplete.

Native protocol 2193 captures establish cartography input slots 12 and 13, result slot 50, and `CraftRecipeOptional` requests.
Cloning produces two maps and consumes one item from each input.
Naming uses the request's filter strings and `CartographyText` origin.
These captures do not establish the Java implementation.

The decoder tests retain known and unknown recipe UUIDs and unsigned network IDs.
They also establish following-array alignment and truncated input rejection.
Core now retains map dimension, origin, lock state, scale, and the server's creation map IDs.
An omitted scale or creation list preserves previous state.
A native extension selects the next ID in the advertised map family.
Cloning preserves that ID; locking creates a separate map identity.

Core now refreshes crafted destinations after a successful acknowledgment.
It requests full inventory data and holds queued interactions until item IDs, counts, and all player snapshots agree.
This preserves server-generated tags that acknowledgments omit.
A timeout enters the existing inventory recovery path.

A native map-locking test confirms the refresh without closing cartography.
The refreshed item has a different UUID from its preview and includes the server's final map subtype.
The native client places that refreshed item successfully using its acknowledged network ID.
Five correlation tests and the complete core build pass.
Further Java behavior through direct connections and ViaProxy still needs integration verification.
The [map notes](../patches/viabedrock/upstreamable/0002-restore-map-rendering.pr.md) record the implementation boundary and native evidence.

The [cartography patch](../patches/viabedrock/deferred/0016-translate-bedrock-cartography-in-core.pr.md) now implements the main core container path.
It supports advertised paper recipes, rename-only requests, clone, extension, lock, and locator conversion.
The native client also accepts single-input creation and renaming in the lower slot.
A single Shift-click crafts one result; the core follows that captured behavior.
Java exposes naming through a text dialog.
A live ViaProxy comparison confirms opening, paper placement, saving a name, and returning to the same menu.
Java's cartography menu clears results when either input is empty.
The [client patch](../patches/viafabricplus-bedrock/upstreamable/0018-preserve-authoritative-bedrock-cartography-results.pr.md) prevents that local deletion for native item context.
The patched Java client displays paper-only output through ViaProxy, crafts one map, and places the refreshed result in its hotbar.
Naming cancellation preserves inputs and restores the result without a phantom item.
Saving and crafting retains the name in the server's final item, with no pending synchronization.
The add-on now renders a native cartography layout with inline naming and operation previews.
Core supplies presentation state before opening an empty table, including through ViaProxy.
Rapid edits and keyboard typing preserve the final name in the acknowledged crafted item.
The accepted server pack supplies native images without a local Bedrock installation.
Private captures verify creation, clone, and locator previews.
A direct connection verifies map initialization, the zoom preview, one accepted extension, and the lock preview.
These previews use matching licensed server images.
Missing-image acquisition and remaining operations still need comparisons.
Eleven focused cartography tests pass.
The complete core suite reports 409 tests with one optional fixture skip.
The add-on suite reports 521 tests with 109 optional fixture skips.

The [codec notes](../patches/viabedrock/deferred/0022-define-bedrock-request-and-recipe-codecs.pr.md#dynamic-recipes) record their evidence and build results.

## Cameras and UI

| ID | Requirement | Status | Remaining evidence or work |
| --- | --- | --- | --- |
| U1 | Presets, instructions, splines, shake, and aim assistance | Incomplete | Core retains received presets and resolves optional-field inheritance. It also resolves fades, FOV transitions, and default camera shake, which the add-on renders. Free-camera activation, pose transport, per-preset overrides, and native blend arithmetic now have production paths. Target tracking, splines, attachments, aim assistance, native follow cameras, built-in perspective pose parity, player-effects application, custom shake parameters, and broader lifecycle comparisons remain incomplete. |
| U2 | Fog and HUD visibility | Incomplete | Core retains all target HUD restrictions and transports them through direct connections and ViaProxy. The add-on applies individual Java HUD restrictions and preserves local settings on reset. Fog, missing native widgets, and remaining visual comparisons are incomplete. |
| U3 | Texture animations, toasts, credits, store requests, and inventory preferences | Incomplete | Implement target packet behavior and verify native presentation. |
| U4 | Dynamic JSON UI and widgets | Incomplete | Extend static sidebar support with expression evaluation and applicable widgets. |
| U5 | NPC conversations, portraits, links, and editing | Incomplete | Core Java conversations exist. Native portraits, editing, link captures, and UI comparisons remain. |

The [HUD core patch](../patches/viabedrock/upstreamable/0081-retain-server-hud-visibility.pr.md) handles packet 308 instead of discarding it.
Target BDS captures establish all thirteen IDs, signed enum encoding, and explicit all-element resets.
Core preserves unknown IDs and sends the current snapshot after joining or late channel registration.
The [client patch](../patches/viafabricplus-bedrock/upstreamable/0021-apply-server-element-visibility-restrictions.pr.md) suppresses individual Java HUD elements.
Native comparisons preserve selected-item text while the hotbar is hidden, and hide the XP level with its progress bar.
Live direct and ViaProxy comparisons verify health, hunger, hotbar, crosshair, progress, and independent selected-item text.
Both routes preserve F1 after a server reset.
Local exit and remote disconnect clear the restrictions.
The initial Java baseline lacked armor and status-effect icons.
The [effect correction](../patches/viabedrock/upstreamable/0082-preserve-status-icons-independently-of-particles.pr.md) restores icons through standard Java packets.
Direct and ViaProxy comparisons show icons with particles disabled, including ViaProxy with the add-on removed.
Direct and ViaProxy status-icon hiding and reset now have visible comparison evidence.
The [armor correction](../patches/viabedrock/upstreamable/0083-synchronize-native-armor-attributes.pr.md) derives native protection and toughness in core.
Direct and ViaProxy comparisons now verify armor-meter rendering, individual hiding, and reset.
A ViaProxy client without the add-on also displays the armor meter.
Air, horse health, contextual jump bars, and spectator behavior also need comparisons.
Paper doll, touch controls, and native control hints still lack renderers.
Ordinary Java has no standard packet for individual HUD restrictions.
These results do not complete U2.

The [camera instruction patch](../patches/viabedrock/upstreamable/0089-decode-camera-instructions-and-transport-native-fades.pr.md) decodes all instruction fields for protocol 2193.
Core applies fade behavior and shared FOV transition rules, with elapsed snapshots and sequenced live commands.
The [camera renderer](../patches/viafabricplus-bedrock/upstreamable/0023-render-core-resolved-server-fade-snapshots.pr.md) draws fades before the HUD and applies FOV before world projection and culling.
Native timelines and opaque overlays have comparison evidence below.
Other instruction fields remain decoded but unapplied. Local FOV modifiers and broader lifecycle behavior still need native comparisons.
These results do not complete U1.

## Gameplay and entities

| ID | Requirement | Status | Remaining evidence or work |
| --- | --- | --- | --- |
| G1 | Input locks | Incomplete | Core retains all eleven target permission categories and filters auth input. Raw movement and jump/sneak input survive movement locks. The add-on applies movement, directional, jump, sneak, camera, and passenger dismount restrictions through direct connections and ViaProxy. Manual mounting, broader native control comparisons, and vehicle tests remain incomplete. |
| G2 | Movement effects and prediction corrections | Incomplete | Implement missing packets and compare translated movement timing with the native client. |
| G3 | Voxel shapes | Incomplete | Core retains the registry and compiles custom face rules, transformed slices, and culling layers into accepted server packs. Direct and ViaProxy add-on terrain paths apply the conditions. Broader native comparisons, vanilla partial-block slices, registry replacement, and alternative terrain renderers remain incomplete. These grids do not define collision or selection. |
| G4 | Animation commands, entity overrides, mob properties, and equipment updates | Incomplete | Core retains lifetime-bound command state, and the add-on plays runtime controllers for supported actor and player graphs. Player command delivery and sampling pass direct and ViaProxy replays. Complete ordinary mob drawing, first-person costume and item selection, expression versions, emote composition, other entity overrides, and native visible comparisons. |
| G5 | Movement attributes and attack/use prediction | Incomplete | Apply ignored movement attributes and complete native input and cooldown behavior. |
| G6 | Interaction and entity metadata | Incomplete | Audit variant mappings, interactions, flags, properties, and unsupported metadata. Core now derives local armor and toughness from vanilla and custom wearable definitions. Both routes verify updates, dimension changes, and retained or cleared equipment after respawns. Remote equipment, custom equip interactions, and rejection recovery still need comparisons. Core now preserves effect icons independently of particles. |

The [input permission patch](../patches/viabedrock/upstreamable/0080-retain-and-transport-native-player-permissions.pr.md) decodes packet 196 from the target build.
Private BDS 1.26.51.1 captures establish eleven category masks, reset packets, and the absence of a position field.
Core preserves unknown bits and sends the latest snapshot after joining or late channel registration.
Java local prediction and camera control require the [client integration](../patches/viafabricplus-bedrock/upstreamable/0020-apply-server-movement-and-camera-permissions.pr.md).
Ordinary Java clients still predict their own movement despite filtered auth input.
Live direct and ViaProxy tests stop held W movement while locked and permit movement after reset.
Mouse-look samples preserve yaw while locked and rotate after reset.
Directional restrictions preserve a normalized diagonal, and jump restrictions also block Java auto-jump.
Local exit while locked clears the permissions before the next connection.
The full build passes with 872 tests passed and 110 skipped.
Native 1.26.51.1 comparisons preserve raw movement, jump, and sneak while movement is locked.
Keyboard diagonals remain normalized, with positive left and negative right raw X.
Core latches raw button edges independently of filtered controls and shield use.
The add-on sends physical samples before filtering through a negotiated raw-input channel.
Live direct and ViaProxy tests match the native diagonal values and preserve both raw buttons while position stays fixed.
Manual mounting remains incomplete because vehicle interactions also include feeding and inventory access.

The server equips a diamond chestplate, but Java reports zero armor points.
Target BDS registry captures carry empty components for vanilla armor.
Script API comparisons establish protection and toughness for all thirty vanilla armor and elytra entries.
Core still needs to derive equipment attributes from target item definitions, including custom wearables, and synchronize updates and removals.

## Resources, animation, particles, and audio

| ID | Requirement | Status | Remaining evidence or work |
| --- | --- | --- | --- |
| R1 | General actor controllers and scripts | Incomplete | Core-evaluated custom actor model selections now travel through the negotiated channel on both routes. Complete transitions, weighted entries, variables, events, queries, and native comparisons. |
| R2 | Server particle dispatch | Incomplete | Core transports complete requests, typed variables, actor identity, and Java fallback bodies to native clients. Direct and ViaProxy authored fixtures verify dispatch, typed size/tint records, and fallback decoding. Complete actor queries, remote actor transport, interpolation, lifecycle comparisons, and visible native parity remain open. |
| R3 | Particle runtime | Incomplete | Complete components, actor contexts, child effects, concurrency, and visible lifecycle comparisons. |
| R4 | Server audio | Incomplete | Native capture verifies PlaySound coordinates already use eighths of a block. Core transports signed loops, optional playback fields, handle controls, and ordered sound resources through direct connections and ViaProxy. Add-on playback controls pass captured-session OpenAL checks on both routes. Native request admission now matches the tested float range gate on both add-on routes. Server captions now have core state, transported translations, client controls, and a HUD on both add-on routes. Complete actor/local captions, localization/layout comparisons, stream policies, range behavior for other sources, audible comparisons, and broader lifecycle verification. |
| R5 | Custom block geometry and lighting | Incomplete | Converted packs carry physical properties through ViaProxy. Both routes verify distinct collision/selection bounds, standing height, and light values with the add-on. Complete ordinary-Java carrier occlusion, rotated nonuniform scale, legacy texture variation, bottom-face native comparisons, and directional light occlusion. |
| R6 | Equipped attachables | Incomplete | Accepted actor graphs now travel through ViaProxy. Both routes render the supported costume and owner-bound chest wings. Complete proxy properties, variants, explicit bone bindings, per-bone materials, material families, and broader native comparisons. |

The attachable matrix tests establish supported same-name affine bindings.
They do not establish explicit binding expressions or complete native equipment parity.

### Native server audio evidence

A native 1.26.51.1 session on protocol 2193 plays a sound at `(-4.125, 70.875, -2.25)`.
Its PlaySound packet sends `(-33, 567, -18)`, which already uses the Java packet's fixed-point units.
The corrected core handler preserves those integers.
The typed decoder also preserves signed loop counts, handle bits, and optional playback position.
The [owning patch notes](../patches/viabedrock/upstreamable/0015-scale-play-sound-coordinates.pr.md) contain the source comparisons and tests.

The same target's beta script API successfully sends volume, pitch, fade, seek, pause, resume, and stop controls.
Its UPDATE_SOUND_DATA payload carries a little-endian 64-bit handle, then seven tagged variants.
Each captured message repeats the same variant seven times.
Fade carries duration before target volume.
Core now decodes the complete message and uses the final variant as the effective command.
[Gophertunnel's implementation](https://github.com/Sandertv/gophertunnel/blob/80c811b6186016b3860c358368cfa47e507f26e9/minecraft/protocol/packet/clientbound_update_sound_data.go) documents this selection rule.
Mixed variants have not been compared with the pinned native client.

Core transports playback and controls in order, plus sound resources through the converted Java pack.
The add-on implements finite and infinite PCM loops, handle volume, pitch, fade, seek, pause, resume, and stop.
It uses server samples, already loaded licensed assets, or a mapped Java sample without starting Store authentication.
Ordinary Java clients retain standard sound translations; their protocol cannot express the handle controls.

The captured native session replays through both direct and ViaProxy routes and loads the converted resource pack.
Private instrumentation observes repeating playback, pitch 1.3, seek to 0.01 seconds, OpenAL pause and resume, and stop.
ViaProxy envelope samples reach 0.2 from 0.3 over two seconds.
The current full build passes 926 tests with 110 optional asset skips.
The current core audio patch's 24 tests and both Checkstyle tasks also pass alone on the upstream base.

These muted checks establish the tested controls, not audible parity.
The sample uses a mapped Java fallback without Store sign-in.
The custom sample transport and control checks below also pass without Store sign-in.
The server request range gate is implemented through the add-on, as described below.
Actor/local captions, broader caption localization and layout comparisons, other sound-source range paths, stream interruption policies, broader replacement races, finite-loop controls, and lifecycle comparisons remain required.
The direct replay still fails its separate skin rendering gate; the audio checks use transport-only verification.

### WAV sample processing

Core now transports server WAV files in the converted resource pack and decodes their sample data.
The add-on resolves each pack in native FSB, OGG, WAV order before trying a lower pack.
Custom events without a Java mapping still require the add-on; ordinary Java clients retain mapped playback.
The 1.26.51.1 executable declares these extensions in that order at `0x140275490`.
[Microsoft's sound guide](https://learn.microsoft.com/en-us/minecraft/creator/documents/introductiontosound?view=minecraft-bedrock-stable) documents the three supported formats.

The shared decoder supports mono and stereo integer PCM at 8, 16, 24, and 32 bits, IEEE floating-point PCM at 32 and 64 bits, and 4-bit IMA ADPCM.
Extensible PCM preserves left-aligned valid-bit precision.
Chunk bounds, even-byte padding, format identity, frame alignment, IMA predictors, and decoded allocation limits are checked before playback.
IMA output ends at the RIFF `fact` frame count instead of exposing encoder padding.

Seven core tests cover numeric conversions and malformed layouts.
Fourteen private comparisons against FFmpeg cover 252,000 scalar samples.
Integer PCM and IMA samples match exactly; floating-point PCM differs by at most one quantization step.
FFmpeg emits IMA block padding beyond `fact`; the comparison excludes that encoder padding.
These checks verify decoding, not the native client's mixer.

A pinned native session reaches spawn and loads a server pack containing PCM WAV, IMA WAV, and OGG samples.
It captures three custom PlaySound instances and each instance's seven controls.
The unchanged session passes complete transport checks on both direct and ViaProxy routes.
Both clients load the converted pack with no Store account and no mapped Java fallback.
Private OpenAL observations verify repeated playback, pitch 1.3, a fade from 0.3 to 0.2, seek to 0.25 seconds, and pause and resume for all three samples.
ViaProxy's stop controls remove all three tracked requests and handles.
The lab stays muted; these checks establish resource resolution and controls rather than audible output.
The separate skin rendering gates remain incomplete on both routes.

WAV loop metadata, multichannel output, additional WAVE codecs, native quantization comparisons, and audible playback parity remain required.

### Native caption behavior

The inspected 1.26.51.1 executable has SHA-256 `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`.
Private executable probes establish caption dispatch and storage behavior. The server-caption production path described below now uses these rules; actor/local sources remain incomplete.

The dispatch probe executes 587 cases in native function `144f040c0`.
It supplies settings, player pose, string copying, and the caption sink at explicit boundaries.
The native function rejects disabled captions, nonpositive supplied volume, absent caption metadata, and empty sound names.
The ambient filter suppresses caption keys beginning with `subtitles.ambient.` or `subtitles.weather.`.
It does not suppress an entity key merely because that key ends in `ambient`.

Directional cues use the supplied forward and up vectors and the player position.
The native function normalizes the source direction and uses a forward-dot threshold of 0.5.
An additional marker bypasses direction calculation and reaches caption storage unchanged.
Live callback captures now show that the server request path supplies an unmarked value.
UI-category and non-positional server samples remain unmarked, so neither property identifies an own sound.
The native path that supplies a marked value still needs tracing.
Missing player context uses a zero position in this function.
Coincident and vertical positions retain the native function's direction result; do not replace it with a guessed Java rule.

The storage probe executes 96 cases in native function `141559870`.
It supplies settings, translation, record construction, allocation, movement, and destruction at explicit boundaries.
The native function removes expired entries before insertion.
It compares localized caption text, then refreshes an existing entry's duration, direction, marker, and pending display state.
Caption duration is stored in milliseconds and divided by 1,000 for the entry's lifetime in seconds.
These checks cover insertion, expiry, and duplicate refresh with durations from zero through 10,000 milliseconds.

Executable inspection also finds top-right and bottom-right HUD anchors, each with a 50-unit vertical offset toward the screen interior.
The settings expose caption enablement, own-sound filtering, ambient filtering, position, and duration.
[Mojang's caption description](https://www.minecraft.net/en-us/article/closed-captions-for-bedrock-edition) confirms directional cues and configurable display duration, placement, and sound filtering.
The server-caption implementation now transports translations and provides these controls on both add-on connection routes.
The settings factory and duration-vector initializer establish the defaults and available durations.
The native model update and private probes establish the elapsed-time countdown.
Marked actor/local sources and broader localization/layout comparisons remain incomplete or unverified.
These executable checks do not establish audible or visible parity.

The sound-control change also passes the [complete main-branch CI build](https://github.com/StackAnvil/patches/actions/runs/37169088563).

## Skins, persona, and Dressing Room

| ID | Requirement | Status | Remaining evidence or work |
| --- | --- | --- | --- |
| S1 | Animated face composition and native tint blending | Unverified | Existing production paths need broader native face, channel, mask, and outfit comparisons. |
| S2 | Complete local persona assembly | Incomplete | Resolve unavailable free assets and remaining geometry, layering, and animation sources. |
| S3 | Classic geometry and animation formats | Incomplete | Complete inherited legacy sources, aliases, metadata, and inheritance comparisons. |
| S4 | Emotes and animation fidelity | Incomplete | Complete unavailable remote assets, events, effects, platform filters, timing, rotations, and scale comparisons. |
| S5 | Native first-person and held-item drawing | Incomplete | Classic and persona graphs submit their sampled hierarchy with authored scale, death roll, and raw-name transforms. Server costumes now select resolved hand-view surfaces in the sampled actor scope. Verify native costume placement, visible timing, and persona overlap, then complete other global transforms, held items, charging, equipment, and input timing. |
| S6 | Complete incoming skin records through ViaProxy | Implemented | Complete records and local-avatar ownership pass isolated direct and proxy playback. Broader remote-player, lifecycle, and native visual comparisons remain required. |
| D1 | Palettes, color channels, and limb editing | Unverified | Compare remaining palette options, asynchronous saves, and fresh native limb edits. |
| D2 | Classic packs and imported-skin synchronization | Incomplete | Complete imported images without downloadable pack references and remaining account/platform flows. |
| D3 | Catalog acquisition, purchases, redemption, and wallet | Incomplete | Complete acquisition and interactive Store behavior with native account comparisons. |
| D4 | Multiplayer synchronization | Unverified | Compare live changes, height, arm width, faces, capes, outfits, and remote emotes on additional clients. |

The [skin flow](skin-flow.md#missing-features) records detailed implementation evidence and outstanding comparisons.
Its verification section preserves the original skin and persona scope.

## Independent assets and platforms

| ID | Requirement | Status | Remaining evidence or work |
| --- | --- | --- | --- |
| A1 | Licensed acquisition, decryption, extraction, archives, and versioned caching | Implemented | Preserve successful Linux acquisition without a local installation. Complete unavailable account assets and remaining platform checks. |
| A2 | No production dependency on a local Bedrock installation | Unverified | Audit every asset path and integration, including defaults and fallback behavior. |
| A3 | Supported operating systems and connection routes | Unverified | Microsoft Store login must work on Linux, macOS, and Windows 11. Verify fresh authentication and the official Minecraft Launcher with Fabric, plus assets, rendering, and account flows. |

Credentials, licenses, keys, native assets, raw captures, and screenshots remain outside Git.

## Completion gate

Every applicable requirement needs production behavior and evidence that matches its scope.
Each exclusion needs evidence for the pinned version.
Direct and ViaProxy results must name any required client integration.
The goal remains active while any required row is incomplete or unverified.

## Latest validation

The complete stack build passes with the native server request range gate.
The earlier input permissions and HUD visibility changes remain applied.
The effect-icon correction also passes the complete core suite and applies independently to the pinned upstream base.
The core suite reports 466 tests with one optional fixture skip.
The add-on suite reports 547 tests with 109 optional fixture skips.
The converter suite reports 16 tests without skips.
All three suites have zero failures and errors.
Core Checkstyle passes.

Private direct and ViaProxy comparisons verify half-height custom collision, full-height selection, and native emission/filter values with the add-on.
Both clients land at Y=120.5 on the fixture at Y=120.
ViaProxy resource reload preserves these properties, and disconnect clears the client mapping.
Core reads both observed target wire forms for light filtering.
Its cache identity now changes with physical properties.
The [block converter notes](../patches/viabedrock/upstreamable/0054-render-textured-bedrock-full-cubes.pr.md) record the fixture and limits.

Core retains packet 337's 288 voxel grids, 221 names, and one custom shape from the target fixture.
ViaProxy retains these during configuration while its supplemental pack queues up to 233 world packets.
The direct route retains the same registry after joining.
An asymmetric native fixture and numerical tests establish cell ordering and coordinate bounds.
Full voxel culling remains incomplete.
These comparisons do not establish full protocol, rendering, or platform parity.

Private procedural culling fixtures verify the four conditional paths through the add-on on direct connections and ViaProxy.
Matching block identity, matching layers, and voxel coverage hide three cubes with invisible neighbors.
The different-permutation cube remains visible.
Neighbor removal restores all four cubes through flat and ambient-occlusion terrain rendering.
ViaProxy reload preserves culling descriptors, and disconnect clears them.
Native local-world comparison confirms these conditions and neighbor-removal behavior.
Broader native visual parity remains incomplete.
Core now omits faces whose cutout or blended material has no visible pixels.
Direct and ViaProxy comparisons remove the earlier transparent-neighbor artifacts while preserving voxel participation.
The same core fix omits invisible geometry with the add-on disabled.
That ordinary-Java comparison still shows holes in neighboring terrain from carrier-state occlusion.
The add-on path does not show those holes.
Numerical tests also preserve holes while compacting dense voxel slices.
These results do not complete G3.

## Reported regressions under investigation

Skin browsing previously allowed the official-package helper to open Microsoft Store authentication automatically.
Microsoft Store sign-in now defaults to **Ask**, with an in-game choice before interactive login.
Existing caches and Store credentials load first.
Declining, Escape, and unavailable optional downloads no longer reject the server resource-pack stack.
Private Linux probes verify refusal, Escape, and a simulated cancelled login through pack preparation and playable spawn.
These probes inject missing credentials, so fresh authentication and the reported passkey failure remain unverified.

Fresh Linux device enrollment also waited for Xodus's `pkexec` hardware probe before showing the login window.
The helper now reports unavailable hardware without elevation and starts sign-in before full package index inspection.
A fresh private Linux state enrolls the device and reaches Microsoft's sign-in page without elevation.
This verifies startup through the login page, not completed authentication or passkey support.
Closing the login window without tokens now stops before package index inspection.
Linux, macOS, Windows 11, and the official launcher with Fabric remain required runtime comparisons.
The selected account's MSA refresh token now requests the Microsoft licensing scope under its existing app identity.
A fresh Linux helper verifies the Xbox identity, obtains the pinned package license, and extracts 6,146 files without interactive sign-in.
A mismatched Xbox account fails before extraction.
The headless helper now runs inside Flatpak; its default permissions blocked the previous host-command invocation.
A fresh in-game test under default Prism Flatpak permissions loads the active persona and renders its Dressing Room preview without a Store window.
The [0.3.2 release workflow](https://github.com/StackAnvil/patches/actions/runs/37161239901) passes all four helper builds and tests, the full stack build, and both mod-platform uploads.
Its published add-on contains eight helpers with matching embedded checksums.
CI-built Linux and Windows helpers each extract 6,146 files, running inside Prism Flatpak and under Wine 11 respectively.
All extracted paths and bytes match. The Wine test verifies the Windows helper, not Windows 11 interactive authentication.
### Browser fallback after 0.3.2

The add-on now uses MinecraftAuth's device-code flow under the selected Bedrock application identity.
After in-game consent, it opens the system browser and displays the code, reopen, copy-link, and cancellation actions.
Authentication waits up to 15 minutes and retains the new account session only after successful licensing and Xbox identity verification.
Cancelling also suppresses further automatic prompts for that account during the game session.
The native WebView implementation and its platform UI dependencies are removed.
Builds now package one helper per platform and run it inside the launcher environment.
Existing licensed Store sessions remain usable.

A private Linux client renders the production screen with a synthetic code.
Clicking Cancel restores the previous screen, stops its worker, and leaves pack preparation uninterrupted.
Microsoft also issues a real device code and reaches the Minecraft sign-in page through the browser.
These checks do not verify completed fresh authentication, passkeys, native Windows 11, macOS, or the official launcher.
The replayed stack passes 896 Java tests with 110 optional skips, six native tests with two optional skips, and 92 tooling tests.
All four helper builds and tests pass in the [updated CI run](https://github.com/StackAnvil/patches/actions/runs/37164336981).
Downloaded artifacts contain one helper per platform, each with a matching checksum.
The new Linux helper licenses and extracts all 6,146 files from fresh state inside Prism Flatpak.
Every extracted path and byte matches the previous Windows extraction.
The browser code expires without a completed sign-in; fresh authentication remains unverified.

A lighting queue regression reproduces a dropped refresh when a server replaces a column during an older lighting job.
The core now retains that refresh while dispatching unrelated ready columns.
The pinned upstream scheduler also contains the faulty removal order.
The reported chunk-loading slowdown remains unverified until its server and timing can be compared.
Existing Hive captures and BDS measurements do not establish broader server compatibility or loading performance.

A 0.3.0 joining report shows a Java read timeout and an interrupted package helper during built-in image acquisition.
That release lacks the direct-session timeout fix.
The error sequence is consistent with the tested connection timeout; the affected user's exact environment remains unverified.
[Release 0.3.1](https://github.com/StackAnvil/patches/releases/tag/stack-v0.3.1) includes the timeout and transport-disconnect fixes.

A separate 0.3.1 report shows `StoreSignInRequiredException` disconnecting the client during optional built-in image loading.
The provider fallback and Ask consent fix address this path on main after that release.

A custom-block report fails in the pack-cache fingerprint with `Invalid custom block box`.
The matching server accepts enabled collision and selection boxes with a zero extent on each axis.
Core now omits these empty shapes while preserving rendered geometry, and metadata canonicalizes them without rejecting conversion.
The exact reported server values and its complete conversion remain unverified.

The new CubeCraft screenshots show pig placeholders and paper items after resource-pack acceptance.
A fresh CubeCraft capture loads both converted packs through ViaProxy and displays custom actors and hotbar icons.
A direct replay without a Store account passes complete-payload, pack-load, skin, model-resolution, and actual native draw checks.
The reported pig and paper fallback does not reproduce on current main; the affected user's failed pack response remains unknown.
Dressing Room now initializes an unselected account from its active cloud character.
Initialization preserves a local choice made during the download and keeps the existing preview if acquisition fails.
Imported images without downloadable account references and later cloud-selection changes remain incomplete. ExploitPreventer compatibility is outside this investigation at the user's request.

### Native caption layout and request eligibility

A private native-client capture loads six authored caption events from a server resource pack.
All six reach the production caption callback with their keys, source positions, supplied volume, listener vectors, and an unmarked value.
This includes a UI-category event, a non-positional sample, and a zero-volume request.
Callback arrival does not mean the zero-volume event passes the caption admission filter.
The captured HUD shows localized text and separate left arrows for the at-player and offset source events.
These observations verify the native fixture, not StackAnvil caption rendering.

The pinned native HUD resource defines a caption area at 30% of screen width and a maximum height of 30%.
Rows center their text and use separate left and right arrow controls.
The lifetime property is the configured duration minus one second, followed by a one-second quartic fade.
Executable function `144eb81a0` supplies that minus-one correction.
The private saved profile starts with captions disabled, duration 1,500 milliseconds, and top-right placement.
Loading a requested 6,000-millisecond duration writes back 4,000 milliseconds.
This is an observed saved-profile result; factory defaults and the full settings bounds remain unverified.

The live server request caller is `144719f20`.
Before engine dispatch or caption notification, it compares the squared source-to-listener distance with a radius of `16 × max(volume, 1)` blocks.
The native comparison rejects the boundary itself.
The request's bypass byte skips this gate.
An executable probe verifies 888 cases with different volumes, positions, listeners, bypass values, boundary distances, and non-finite inputs.
Float operations and summation order matter at the boundary.
The probe stops at the accept or reject branch; it does not establish audible playback or range behavior for every sound source.
StackAnvil now implements this admission gate for server requests through the add-on, as described below.

### Loose WAV asset acquisition

Licensed vanilla extraction now retains loose WAV sound files, alongside FSB and Ogg.
Cache format 9 invalidates the earlier extraction allowlist.
The server actor effect library also retains WAV files, so actor aliases and particle sound events can resolve them through pack overrides.
The existing layered effect test now decodes a lower-pack WAV sample after an upper configuration override.
The helper selector test verifies admitted sound paths and rejected unrelated extensions.
The full build passes with 915 passing Java tests and 110 optional asset tests skipped.
The separate Rust selector test passes.
This closes two file-selection omissions. Server captions now have the separate path described below; audible parity and actor/local captions remain incomplete.

### Server sound request range gate

Core now exposes the pinned native range comparison in `PlaySound`.
The comparison converts fixed-point coordinates to floats before subtracting the listener position.
It preserves native summation order, supplied-volume scaling, strict boundary rejection, unordered-distance rejection, and bypass behavior.
The Java result matches 1,188 native execution cases in the packet's coordinate domain.
These include large coordinates, non-finite values, fractional positions, different listener positions, and bypass values.
Four core tests cover the numerical regressions.

The add-on applies the core comparison against `SoundEngine.getListenerTransform().position()`.
It evaluates the request before registering handles or decoding its sample.
This keeps an out-of-range request from replacing an active handle.
The gate uses the supplied request volume and the actual audio listener, independent of sample positional flags and catalog attenuation.
Core retains the same request transport for direct connections and ViaProxy.

A private synthetic fixture changes sound requests over an existing native-client recording.
It tests near playback, requests at the horizontal unit and doubled radii, increased-volume eligibility, distant bypass, and a rejected replacement.
Both routes spawn, load the converted server pack, and finish the same modified scene.
The four eligible handles enter OpenAL playback; the two ineligible new handles do not register or start.
The rejected replacement preserves the four active handles, and subsequent stops leave zero requests and handles.
No Store account is configured in either client.
The lab remains muted.

The full build passes with 919 Java tests passing and 110 optional asset tests skipped.
The audio patch also builds alone on the pinned upstream base with eighteen passing tests and both Checkstyle tasks.
These checks establish the tested server request admission and handle behavior.
They do not establish audible parity, every camera context, range behavior for other sound sources, or exact bypass behavior in an ordinary Java client.
Actor/local captions, broader caption comparisons, and native stream policies remain incomplete.


### Server closed captions

**Implemented:** Core supplies caption admission, float direction calculations, localized duplicate refresh, elapsed-time state, and fade values.
The shared bounded native archive transports `texts/*.lang` in pack order through the converted resource pack.
Existing native audio archives retain their format.
An independent resource-format revision invalidates converted packs made before this additional archive existed.

The add-on snapshots player position and listener orientation after server sound range admission.
It resolves caption metadata independently of PCM decoding and audio channel allocation.
Caption lookup uses server packs and already licensed resources; it does not initiate Store authentication.
Disconnecting clears entries and prevents pending lookups from populating a later connection.

The native settings factory starts with captions, own filtering, and ambient filtering disabled, and top-right placement.
Its duration-vector initializer contains 1,000, 1,500, 2,000, 2,500, 3,000, 3,500, and 4,000 milliseconds.
The default is 1,500 milliseconds.
The add-on exposes these controls and draws directional arrows, centered text, a chat background, top/bottom-right placement, and a final one-second quartic fade.

**Verified within scope:** The core admission/direction implementation matches all 587 private native dispatch cases.
A further 105 executable cases verify wall-clock elapsed-time conversion and float countdown subtraction.
The native probe supplies the performance-counter frequency/value and stops after the countdown loops.
Targeted tests cover duplicate refresh, expiry/reinsertion order, marked filtering, fade values, archive separation, pack ordering, language overrides, and English fallback.
Language precedence tests establish the implementation's behavior, not complete native localization parity.

The captured six-event native scene reaches spawn and loads the Java resource pack through direct and ViaProxy routes without a Store account.
Both routes show the five positive-volume English captions in HUD state, omit the zero-volume cue, and expire the entries.
The scene payload hash matches on both routes.
The private lab enables captions explicitly and remains muted.
HUD screenshots confirm rendered text and arrows on both routes.
The proxy screenshot shows all five rows after the lab disables Java's movement tutorial; the direct screenshot has a tutorial toast over two rows.
These observations establish visible caption output, not complete native layout or audible parity.
Both replays use transport-only verification and retain their separate skin/actor rendering failures.

The initial server-caption build passed 924 Java tests, with 110 optional asset tests skipped.
The sound patch applies alone to the pinned upstream base and passes 23 tests and both Checkstyle tasks.
The licensed helper selector test retains language files and text archives, including invalid-path exclusions.
Cache format 10 requires the English catalog and refreshes older extractions.
Fresh licensed acquisition with this language selection remains unverified.

**Remaining:** Actor and locally generated sound captions, marked-source integration, update/refresh behavior under settings changes, full localization precedence, custom fonts, exact row/layout comparisons, and caption behavior when the audio device is unavailable.
The native local-emitter investigation establishes a separate marker argument and conditional actor-identity comparison; it does not yet establish a complete implemented actor-caption path.
[Mojang's caption overview](https://www.minecraft.net/en-us/article/closed-captions-for-bedrock-edition) describes the controls.
[Microsoft's language-file rules](https://github.com/MicrosoftDocs/minecraft-creator/blob/main/creator/Reference/Content/MCToolsValReference/langfiles.md) require English as the fallback language.


### Local particle sound captions

**Implemented:** Particle `sound_effect` actions resolve their individual level-sound configuration before opening a sample. Core supplies the shared native float listener gate. The client applies it to the original float source position, then dispatches unmarked caption metadata independently of PCM decoding. Server effect libraries retain language files in pack order.

The pinned native particle alias path calls local emitter `1446a9460` with marker zero. Its range calculation matches the server gate's float operation order, without packet coordinate quantization or a bypass flag. Java matches all 444 native local-emitter admission cases. A targeted test verifies sub-eighth coordinates around the strict radius boundary. A metadata test retains a configured caption when its sample is unavailable.

A separate native execution probe covers 800 actor-marker cases in `1447185c0`. It supplies the weak-reference result and prepared component pools, executes the actor availability/generation/removal branches and the actual unique-ID getter, and stops before local-emitter playback. Matching actor unique IDs produce the marker only while the local actor context is valid. These receipts establish the marker calculation, not implemented network actor caption transport.

**Verified within scope:** A synthetic resource pack supplies near, quiet, and distant local cues. Its near cue intentionally has no PCM sample. A private main-thread audit invokes the production `playLevel` entry point in direct and ViaProxy sessions. Both clients load server translations without Store credentials, admit the near caption, exclude the quiet and distant captions, and expire the rows. HUD screenshots show caption output; concurrent server rows clip part of the added caption within the height limit. The scene transports completely, while separate skin/actor rendering checks still fail. This does not verify incoming particle packets, actor/effect graph transport, complete native layout, or audible output.

The complete build passes 926 Java tests with 110 optional asset tests skipped. The audio patch applies alone to the pinned base and passes 24 tests plus both Checkstyle tasks. The targeted particle/resource-library run enables private native reference fixtures and passes 12 tests with two unrelated optional conditions skipped.

**Remaining:** Network level-sound actor identity and global-position handling, attached-animation caption behavior, local gameplay captions, complete localization/layout comparisons, and audible parity remain incomplete or unverified. Native global level-sound inspection places generic cues two blocks from the listener toward their source; this differs from bypassing the server PlaySound range gate. No production behavior depends on an installed native game.

### Server particle packet admission and actor offsets

The [core particle correction](../patches/viabedrock/upstreamable/0085-resolve-server-effects-relative-to-their-actor.pr.md) retains packet 118's unsigned dimension, signed actor ID, float position, effect name, and optional Molang JSON.
The standard Java fallback resolves actor-relative offsets from the actor's Java feet position.
It drops effects for unresolved actors and other dimensions.
This code runs in core on direct and ViaProxy connections, without new add-on integration.

The pinned native serializer still writes an optional flag before the JSON string, despite the versioned schema declaring a required map.
Its value serializers emit a typed array with recursive `member_array` values.
A flat map of numbers would lose vectors and colors.
The packet model preserves the original JSON; the Java fallback does not evaluate it.

**Verified within scope:** 100 native serialization cases and 1,600 native handler cases establish field order, optional-flag dispatch, dimension admission, actor lookup, and unchanged factory coordinates.
Their harness supplies primitive stream codecs, authored JSON, lookups, context copies, and factory sinks.
Three unit tests cover wire order, nested JSON retention, field boundaries, signed IDs, actor offsets, and float precision.
The complete core suite passes 474 tests with one optional skip, and both Checkstyle tasks pass.
The particle patch also builds alone on the pinned upstream base, with three passing tests and both Checkstyle tasks passing.

**Remaining:** Native resource and graph transport, typed variable evaluation, actor interpolation, lifetime binding, live player-origin comparisons, and visible particle parity on both routes.
Java particles retain an initial position; their protocol packet cannot represent a persistent actor attachment.

### Upstream refresh, 2026-10-04

All configured upstream branches were checked before this refresh. ViaBedrock, the Bedrock add-on, and ViaProxy now use their latest branch tips. CubeConverter's `vv-json` branch is unchanged. The Bedrock target remains 1.26.51 / protocol 2193, with Java 26.3.

Four complete patches match the merged upstream diffs and were removed from the series:

- Respawn game modes: [ViaBedrock #433](https://github.com/ViaVersionAddons/ViaBedrock/pull/433).
- Negative section heights: [ViaBedrock #434](https://github.com/ViaVersionAddons/ViaBedrock/pull/434).
- Goat jump sounds: [ViaBedrock #436](https://github.com/ViaVersionAddons/ViaBedrock/pull/436).
- Hanging mangrove growth: [ViaBedrock #438](https://github.com/ViaVersionAddons/ViaBedrock/pull/438).

The earlier coordinate-only sound change merged in [ViaBedrock #435](https://github.com/ViaVersionAddons/ViaBedrock/pull/435). The current audio patch retains its later native decoding correction, controls, resource transport, and captions. None of the deferred inventory, metadata, or actor-event work landed in this upstream update.

ViaFabricPlus now uses [successful Jenkins build 2261](https://ci.viaversion.com/job/ViaFabricPlus/2261/), version 5.1.2-SNAPSHOT. The pin selects Maven publication `5.1.2-20261002.121012-7`. The downloaded Maven client JAR matches the Jenkins JAR. The Maven API JAR matches the API JAR embedded in Jenkins. All four artifact checksums are pinned. The add-on resolves both VFP modules exclusively from the verified local repository.

All stacks replay and `bun run build all` passes. The Java suites pass 929 tests, with 110 optional asset tests skipped. The tooling passes 92 tests and its TypeScript check. The cache patch builds alone on the new upstream base, with all nine tests passing. The retained audio patch applies alone. The Prism bundle builds successfully.

This refresh preserves the existing runtime code in ViaBedrock. Its net source changes are upstream's LZ4 dependency and CI updates. The add-on patches now use upstream's convention plugins, version catalogs, and `jarInJar` configuration. Its social patch also applies in a fresh shallow upstream clone without setup patches. The branding block was relocated after CI exposed a setup-dependent context line. Existing incomplete and unverified parity requirements remain open.

An unchanged captured session passes transport checks through direct and ViaProxy connections with the refreshed builds. Both routes reach playable spawn, send the complete captured payloads, and load the converted resource pack. The isolated direct profile has no signed-in Bedrock or Store account. Missing licensed assets do not prevent its join. Direct skin checks report the same failures as the previous baseline. ViaProxy's missing native actor and player appearance transport remains an open requirement. These replay checks establish session compatibility, not complete rendering parity.

### Shared server effect resources

**Implemented:** Core exports particle dependencies in the shared bounded native archive with sounds, captions, and actor resources. It retains JSON particle definitions, render controllers, PNG/TGA images, and every source pack index. Texture-only overlays can override lower definitions, including already licensed built-in effects. Conversion does not require built-in assets to discover these images. The cache resource format invalidates conversions that lack these dependencies.

The add-on merges the accepted server archives by pack index. Direct actor effects use the same core selectors without a ZIP roundtrip. Shared snapshots follow world and resource reload lifecycles. They use already loaded licensed assets when available and do not start Store sign-in. Missing built-in assets remain absent.

**Automated checks:** The complete stack passes 933 Java tests, with 110 optional asset tests skipped. The effects patch builds alone with 26 tests and both Checkstyle tasks. The cache patch builds alone with nine tests. One hundred private comparisons confirm unchanged sound and caption archive bytes. Targeted tests cover empty indexes, texture-only overlays, protocol mismatches, escaping paths, domain collisions, and mismatched archive indexes.

**Verified within scope:** An authored pack contains three particle definitions and one texture. Private main-thread instrumentation reads all three definitions and the identical texture bytes from the accepted converted resource pack on direct and ViaProxy connections. Both full replays reach spawn, transport every recorded payload, and load the Java resource pack without Store sign-in. This verifies resource availability, not incoming particle dispatch or visible effects. The existing direct skin-update failures and missing ViaProxy actor/appearance state remain open.

**Remaining:** Transported definitions alone do not establish particle playback. Packet dispatch, typed Molang values, actor interpolation and lifetime binding, and native visible comparisons remain required. The following block mirror supplies authoritative identities on both routes.


### Native block identities for effect filters

**Implemented:** Core sends primary Bedrock state IDs and their original block names to clients that advertise the native block channel. Compact section snapshots preserve all coordinates and states. Dictionary fragments precede their references. Uniform sections require no cell array. Updates, unloads, dimension resets, and late registration use the same channel.

Core also owns the bounded codec and client mirror. The add-on binds that mirror to its current world and clears it on disconnect. Resource reloads preserve world state while releasing particle assets. Native emitter creation no longer requires a direct connection. Effects with block filters still require an initialized authoritative mirror.

**Automated checks:** The complete stack passes 940 Java tests, with 110 optional asset tests skipped. The effects patch applies alone to clean upstream and passes 32 tests and both Checkstyle tasks. New tests cover every section coordinate across palette widths, full palettes, negative coordinates, immutable arrays, unknown IDs, updates, empty sections, resets, and malformed data. A particle filter test verifies the mirror after a server update. The complete bundle builds.

**Live checks within scope:** An isolated server uses Bedrock 1.26.51.1, build 51061372. The direct client receives 2,712 section snapshots. All 11,108,352 cells match the core tracker before serialization. The decoded snapshot hashes match every producer snapshot. Every client lookup matches its decoded Bedrock ID and dictionary. Two updates also match.

ViaProxy receives 2,712 initial snapshots and six updates without a client mirror mismatch. Two updates follow explicit server block changes. These checks cover the initial Overworld mirror and update delivery. They do not establish incoming particle dispatch or visible filter behavior. Optional licensed assets remain unavailable in the isolated profiles.

**Remaining:** Native particle packet dispatch, typed Molang values, actor interpolation and lifetime binding, and visible native comparisons remain incomplete. Live dimension transitions, unloads, and disconnect cleanup still need their own observations.


### Native server particle playback

**Implemented:** Core transports packet 118 to clients that advertise the native particle channel.
The message retains the original request, resolved float origin, actor ID and UUID, and complete Java fallback body.
Ordinary clients keep their standard translation.
Core still rejects other dimensions and unresolved actors.

Core also parses typed scalar values and ordered member arrays.
The client applies packet names with native hashing and copies structs between assignments and emitters.
Normal script assignments retain case-insensitive names.
Repeated valid roots replace earlier values; nested lookup selects the first matching member.

The add-on starts effects from accepted server archives and already loaded licensed assets.
Loading the shared snapshot does not initiate Store sign-in.
Actor requests bind the current Java entity and sample its position, rotation, and bounds.
The binding rejects removal, entity replacement, and world changes.
An unsuccessful start uses Minecraft's codec and handler for the transported Java fallback.
Unknown effects without either representation retain the existing unsupported-effect limitation.

**Native evidence within scope:** Java matches 2,040 scalar conversion cases from target executable function `14e01de00`.
The parser skips two null inputs, as the inspected native deserializer does.
Two hundred native accessor cases verify first-match, case-sensitive member lookup with a supplied root lookup.
These probes do not verify the complete JSON parser or visible particles.

A later comparison matches 54 native JSON reader and array-admission cases.
Core accepts comments, leading integer zeros, raw string controls, and data after the first parsed array.
Private allocation and byte-copy operations support the probe; native parsing instructions execute unchanged.
An additional 1,008 constructor cases verify case-sensitive FNV-1 hashing, null termination, empty names, Unicode, and native surrogate bytes.
Four decoded native strings verify surrogate continuation and low-surrogate output.
The [Creator API](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/molangvariablemap?view=minecraft-bedrock-stable) confirms the public scalar and structured variable shapes.
The pinned executable establishes the wire format and conversion rules.

**Automated checks:** The complete build passes 949 Java tests with 110 optional asset tests skipped.
The particle patch builds alone on upstream with ten tests and both Checkstyle tasks passing.
Client tests cover struct isolation, nested assignments, script casing, immutable query values, and decoding core's fallback with Minecraft's codec.
The bundle builds successfully.

**Integration within scope:** An authored fixture adds six particle requests to a captured local session.
Both direct and ViaProxy sessions reach spawn and transport the complete fixture.
Each receiver observes four admitted requests on the main thread.
Two requests start native emitters, one missing built-in graph uses the Java fallback, and one unknown effect has no representation.
The missing-actor and other-dimension requests do not reach the client.
Both routes produce identical size, tint, position, and fallback records without Store sign-in.

**Remaining:** The sparse fixture lacks a stable camera and does not establish visible native parity.
Complete actor queries, remote actor state through ViaProxy, interpolation, entity removal, ID reuse, world transitions, and resource reload timing need comparisons.
Additional numeric grammar, wire UTF-8 decoding, packet-error propagation, and additional native variable forms remain unverified.
A private server script fixture crashed during script initialization before a player joined; it produced no native particle capture.
Existing skin and actor rendering gaps remain open.

### Shared Molang float arithmetic

The core and add-on use MochaFloats 6.1.0 parser, lexer, and interpreter modules from Maven Central. ViaBedrock and ViaProxy now require Java 25. The add-on already requires that version. ViaProxy no longer builds a Java 8 artifact.

Intermediate arithmetic, numeric constants, assignments, and numeric bindings use floats. This corrects conditions that previously compared double results before the final float conversion. Tests exercise the 16.7-million integer boundary, fractional equality, variable updates, property inputs, and controller UV values.

The [official property guide](https://learn.microsoft.com/en-us/minecraft/creator/documents/introductiontoentityproperties) documents float evaluation. The [published MochaFloats runtime](https://repo.maven.apache.org/maven2/org/redlance/mochafloats/runtime/6.1.0/runtime-6.1.0.pom) supplies the float runtime. Host extensions retain string equality, precedence, typed packet variables, easing functions, and execution limits.

This migration does not establish complete Molang, animation, particle, or visual parity. Native comparisons of additional operators, standard math functions, and rendered scenes remain required.

The full migration build passes 952 Java tests, with 109 optional tests skipped. The easing test compares 13,578 saved native cases. Both built core and proxy main classes use Java 25 bytecode. Bundle inspection finds only the fork runtime in ViaProxy and the fork's three interpreter modules in the add-on. The core, proxy, and nested add-on core retain the MIT notice.

Direct and ViaProxy playback checks reach spawn, transport the complete particle fixture, and load the converted Java resource pack. Each route admits four particle requests, starts two native emitters, and decodes one Java fallback. Both routes produce matching dimensions, tint, positions, and fallback records without Store sign-in. The replay self-tests pass.

These checks use a sparse fixture. They do not establish complete skin, actor, or visible particle parity.

### Shared native Molang math

**Implemented:** Core supplies native easing, angle reduction, directed rotation interpolation, and the regenerated sine lookup. The add-on uses these functions for animation and view bobbing. Protocol controller evaluation uses the same functions. The duplicate client math classes are removed.

`math.min_angle` reduces angles into `[-180, 180)` with the target's float addition before the remainder. Large finite values finish without repeated subtraction. `math.lerprotate` preserves the authored start and follows its shortest directed delta. Half-turn ties follow the negative direction. The client retains finite scalar values above 32,768. Non-finite checks and parser and execution limits remain.

The [official rotation reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/molangreference/examples/molangconcepts/mathfunctions/math_lerprotate) describes directed shortest interpolation. Target Bedrock 1.26.51.1, protocol 2193, supplies the numeric evidence. Constant dispatcher `140ae6140` and helper `140aeb870` match runtime operations `140b2c2b0` and `140b2d270` across 9,367 private cases. These include endpoint order, wrapping, half-turn ties, extrapolation, float boundaries, and overflow intermediates.

**Probe boundary:** The emulator supplies numeric nodes and runtime stacks. It mocks eligibility and cleanup calls. The host C library supplies the float remainder import. Native arithmetic instructions and runtime stack operations execute unchanged. These comparisons do not verify the complete parser, the Windows CRT implementation, or visible animation.

**Remaining:** Other standard math functions, randomness, complete query state, and visible native comparisons remain unverified. Missing ViaProxy actor and appearance transport remains open.

**Validation:** All four builds pass, with 958 Java tests passing and 109 optional tests skipped. Core and client tests compare all 9,367 native angle cases and 13,578 native easing cases. The bundle and both north-star patch application checks pass.

An authored particle graph uses angle reduction, directed rotation, and easing for its size. Direct and ViaProxy playback load the converted pack and reach spawn. Both downloaded archives contain the new expressions. Each route admits four requests, starts two emitters, and decodes one fallback. The emitters produce width `2.0`, height `0.125`, and matching tint and position records. These sparse replay checks do not establish complete visible parity. Existing skin-update failures and missing ViaProxy actor and appearance state remain open.


### Complete incoming skin records on both routes

**Implemented:** Core transports the complete protocol 2193 `SkinData` record on a negotiated Java channel.
The add-on uses the same codec and rendering path through direct connections and ViaProxy.
Animated images, persona pieces, tints, geometry, cape data, and profile flags retain their wire representation.
Fragments contain at most 256 KiB; the transport accepts records up to 64 MiB.
These are transport memory bounds, not native format limits.

Core retains every ordered update until Java join and channel registration complete.
It also copies early player-list and skin payloads until StartGame initializes their Java state.
The captured target session supplies a player list before StartGame.
Replayed packets use normal handlers without applying Java base protocols twice.
Each pending queue has separate limits of 128 MiB and 10,000 entries.
Negotiation overflow discards the oldest record with a warning; invalid pre-join queue growth is rejected.
Clients without the channel retain their previous utility path.

Core identifies local ownership from the login UUID or authoritative actor ID.
The add-on applies these updates under its actual local-avatar UUID.
This fixes ViaProxy sessions where the Java and Bedrock login UUIDs differ.
The receiver captures its source connection at play initialization.
Assembly and installation run on the Minecraft thread, reject replaced connections, and release partial transfers on cleanup.

**Automated checks:** All four builds pass with 967 Java tests passing and 109 optional tests skipped.
The saved native math fixtures remain enabled.
Tests compare complete classic and persona records larger than five MiB after codec round trips and fragment assembly.
They cover sequencing, replacement, cleanup, bounds, malformed counts, image overflow, early-packet ordering, queue limits, negotiation, failed sends, and local ownership with negative actor IDs.
The bundle, both north-star application checks, TypeScript check, and 14 replay tests pass.

**Integration boundary:** An authored fixture adds three skin changes to a recorded target session.
It includes classic and persona records, 1024-pixel body images, cape pixels, three animation images, geometry, persona pieces, tints, and profile fields.
Each added record travels in 21 fragments.
Both routes must install all five updates, including the original early player-list record and its later repetition.
The private renderer audit compares hashes of the complete records at installation.
The replay camera uses the actual Java avatar identity on ViaProxy; it does not overwrite that identity.

Final direct playback `2026-10-04T11-07-16.944Z-replay-scene` and ViaProxy playback `2026-10-04T11-05-20.391Z-replay-scene` pass transport and rendering checks.
Each installs five geometry records with no rejected skins and matching complete-record hashes.
The audit observes three local native avatar submissions directly and one through ViaProxy.
Final screenshots show the authored first-person hand in the same sparse nighttime scene.
These observations establish delivery, installation, and local renderer selection within this fixture.
They do not establish visible parity against the official client.

**Remaining:** This transport does not supply server actor graphs, equipment, attachable resources, or emote assets.
Outbound selection and account synchronization through ViaProxy remain incomplete.
These sparse playback checks do not establish native face, tint, animation, cape, first-person, or overall visible parity.
Remote-player changes, removal, ID reuse, world transitions, disconnect timing, and broader server scenes require further observations.

### Accepted native actor resources and equipped item bindings

**Implemented:** Core exports native actors and effects in one shared archive with cache resource format 5. It preserves resolved pack order and server provenance across definitions, geometry, controllers, animations, materials, images, translations, samples, and item bindings. The shared effect view preserves the former sound, caption, and particle resource sets. The frontend reconstructs the same core loaders from an accepted server resource pack. Resource reload and disconnect clear its cached snapshot.

This resource path works without a frontend Store session or local Bedrock installation. Player costumes and equipped models use it on direct and ViaProxy connections. Custom entity renderers now receive core-evaluated model selections through the negotiated actor channel on both routes.

Core applies converted model selectors after both vanilla and custom item mapping. It retains gameplay components and native item identity. Missing assets and rejected packs retain the normal Java representation. The equipment renderer uses native item identity to evaluate authored item bindings with owner queries, properties, and equipment context. A selected definition keeps its independent playback lifetime until it changes or disappears. Supported native surfaces replace their corresponding vanilla armor layer; unsupported surfaces retain the fallback.

**Native evidence:** The reference client and isolated server both run Bedrock 1.26.51.1, build 51061372, protocol 2193. A private authored pack supplies an orange player costume and green chest wings. The target's iron chestplate definitions distinguish the generic attachable from its player-specific item binding. Overriding only the generic definition leaves vanilla armor visible. Overriding the player definition renders the green wings without vanilla armor. Selection evaluates the binding expression; it does not hardcode the player suffix.

**Automated checks:** All four builds pass with 969 Java tests passing and 113 optional fixture tests skipped. Archive tests verify order, provenance, complete bytes, reconstruction, excluded paths, malformed headers, and indexes. Item and binding tests cover vanilla and custom models, unchanged gameplay data, accepted and rejected resources, explicit conditions, generic fallback, wearer changes, equipment context, and query isolation. Both north-star patch application checks pass. An isolated effects checkout, manually adapted for predecessor context without setup, passes 35 tests and both Checkstyle tasks. That result does not establish automatic isolated application of the effects patch.

**Remaining:** ViaProxy now receives evaluated custom actor models. Named actor and player properties now travel through the shared actor-input channel. Complete events, emote state, and outbound account synchronization remain incomplete. This archive has memory bounds of 32 MiB per file, 256 MiB decompressed content, and 4,096 layers. Larger real packs need verification. First-person equipment, explicit bone binding expressions, per-bone materials, non-default variants, additional material families, competing eligible item bindings, and unavailable licensed default assets remain incomplete or unverified. Resource availability and submitted surfaces do not establish complete visible parity. All earlier skin, persona, account, gameplay, editor, audio, particle, UI, and platform requirements remain active.

**Integration evidence:** The unchanged native scene payloads pass direct playback `2026-10-04T12-34-33.379Z-replay-scene` and ViaProxy playback `2026-10-04T12-31-09.735Z-replay-scene`. Both load the accepted pack without a frontend Store account. The reconstructed library contains 61 layers, one server pack, the player-specific iron attachable, and both authored geometries. Each route installs both recorded skins without rejection. Equipment selection changes from zero to one supported surface after the captured chest update. Both wing bones reach full scale.

Final screenshots on both routes show the costume and green wings without duplicate vanilla chest armor. The native screenshot establishes the same costume and equipment selection. This verifies visible selection within the authored fixture, not full scene parity. The Java avatar falls below the recorded terrain and the head appearance differs. The missing terrain needs a separate recording/replay or translation investigation; these observations do not identify its cause. Camera, lighting, animation timing, complete body-layer visibility, remote wearers, equipment removal, and world/reload/disconnect transitions need further comparisons.

### Target chunk request counts and costume face visibility

**Implemented:** Core treats protocol 2193's finite client subchunk request limit as a count. Clamp it to the dimension and retain unlimited mode. Request only sections missing from the inline payload. A replacement column keeps the new header's limit instead of requesting the whole dimension.

**Native evidence:** Two private captures use the official 1.26.51.1 client and matching build 51061372 server with blob caching disabled. The first supplies 113 columns with limit one and 113 section `-4` replies. The second places blocks at higher sections. Its limits 1, 2, 5, and 9 each produce exactly that many native requests per column. All-air gaps receive explicit replies. The older highest-index convention belongs to a different wire format.

Adding one to each finite limit left an extra section pending during native-capture playback. Every recorded reply arrived, but core withheld the incomplete Java column. The avatar fell through missing terrain. This investigation identifies that cause for the previous authored comparison; it does not establish that every missing-terrain report has the same cause.

The recorded persona has one animated face image and two geometry models. The server costume replaces its original body. The add-on now applies the server body visibility decision to persona surfaces, so the original face cannot draw over that replacement. Selected original bodies retain their persona surfaces. First-person behavior remains separate.

**Automated checks:** All four builds pass with 970 Java tests passing and 113 optional fixture skips. The new chunk test covers captured counts, zero, unlimited mode, dimension sizes, and a limit above the dimension height. Both north-star application checks pass. CI for the preceding actor-resource change also passes on all configured platforms.

**Remaining:** Complete chunk replacement, inline plus requested data, cache mode, dimension changes, unload timing, other server implementations, and additional persona visibility combinations still need native comparisons. This change does not complete all chunk, skin, camera, material, actor-state, or platform requirements.

**Integration evidence:** Final direct playback `2026-10-04T12-59-03.846Z-replay-scene` and ViaProxy playback `2026-10-04T12-56-11.137Z-replay-scene` preserve the unchanged second native capture. Each emits all 134 native section requests, with identical positions and multiplicity. Both avatars remain grounded at Y = -60 over a solid block. Final screenshots show the recorded terrain, the costume's uniform head without the original face, and green wings without duplicate vanilla chest armor. This resolves the earlier fixture's missing terrain and face overlay. Camera angle, lighting, timing, broader animation behavior, and additional lifecycle observations remain unverified. Missing optional built-in animation assets still produce an account warning; they do not prevent this supported scene from loading.


### Negotiated custom actor selections through ViaProxy

**Implemented:** Core sends the full evaluated model selection under the actual Java actor UUID.
The snapshot preserves model and material order, texture and geometry identity, scale, lighting, and UV expressions.
An empty selection hides the actor. Removal releases its state.
Late registration replaces existing display parts and republishes live actors.
Clients without the capability retain converted Java item displays.

The add-on uses the same receiver on direct connections and ViaProxy.
The previous direct-only custom entity mixin is removed.
State installation checks the captured Minecraft connection and cleanup generation on the client thread.
Accepted actor resources remain the source for geometry, textures, materials, and animation graphs.
This path requires no frontend Store account or local Bedrock installation.

**Automated checks:** All four builds pass with 977 Java tests passing and 113 optional fixture skips.
Six new codec tests cover complete immutable snapshots, signed zero, hidden selections, removal, malformed payloads, and memory limits.
The render-store tests cover scale updates, clearing, independent identities, removal, and replacement.
Both north-star application checks and the Prism bundle pass.
ViaBedrock and ViaProxy use Java 25, with class version 69 verified in the final artifacts.

**Remaining:** Complete animation timing, script variables, actor events, additional player inputs, interpolation, and broader lifecycle comparisons remain open.
The channel limits each payload to one MiB, with 128 models and 128 material bindings per model.
Larger real definitions require verification.
Existing tests cover malformed input and store cleanup, but live late registration and queued disconnect races still need integration observations.
This step does not establish complete visible native parity or complete Bedrock coverage.


**Recorded-scene verification:** The protocol 2193 CubeCraft recording passes direct playback `2026-10-04T13-33-22.116Z-replay-scene` and ViaProxy playback `2026-10-04T13-30-14.727Z-replay-scene`.
Both preserve the complete scene payload hash and load the accepted resource pack.
Each route receives 77 model updates for 31 actor identifiers and 43 geometry/texture combinations.
The identifier sets, selected combinations, and scale sets match exactly.
The banner scale remains 1.7 and the hanging logo scale remains 5.
Actual renderer submissions and final screenshots show the custom banners, NPC models, and hanging logo on both routes.
Neither run reports unresolved model errors or rejected skins.

These observations verify transport and supported rendering within this recorded scene.
They do not establish complete native visual parity, actor event support, or broader lifecycle behavior.
Raw packets, assets, account data, and screenshots remain private.

### Native actor inputs and property indices

**Implemented:** Core publishes immutable actor snapshots through the negotiated `viabedrock:actor_state_v2` channel.
Snapshots retain named scalar properties, flags, scale, variants, typed spell color, runtime identity, and an actor lifetime token.
Local-player snapshots resolve the actual Java profile identity on direct connections and ViaProxy.
Removal checks the lifetime token before releasing state.
The frontend rejects queued updates from a previous connection or world generation.
Dimension changes publish retained inputs after the Java respawn packet.
Costumes, equipped models, charging queries, and spell-color callbacks use this shared registry.
The direct-only player-state mixin is removed.

**Native evidence:** A matching official-client capture changes four synchronized player properties through server events.
The target sends int, bool, and enum values at indices 0, 1, and 2, and a float at index 3.
Both wire arrays refer to one ordered schema.
The previous split definition lists discarded that float.
Core now retains shared indices and rejects values whose wire type does not match the indexed definition.
The official screenshots show orange and blue costumes, green equipment, and the blue costume after a dimension round trip.
Raw packets, definitions, assets, and screenshots remain private.

**Automated checks:** All four builds pass with 984 Java tests passing and 113 optional fixture skips.
Eight core transport tests cover type preservation, immutable ownership, malformed data, sparse updates, identity mapping, ID reuse, and stale removal.
Interleaved schema tests exercise values on both wire channels and reject mismatched types.
Four client tests pass with the optional native charging and 1,504 spell-color fixtures enabled.

**Remaining:** Complete actor events, animation timing, script variables, interpolation, further actor inputs, and broader lifecycle comparisons remain incomplete or unverified.
The native fixture establishes supported property-driven costume changes, not full rendering parity.

**Recorded-scene verification:** Matching native capture `2026-10-04T14-17-15.690Z-record-local` supplies the property changes and dimension round trip.
Direct playback `2026-10-04T14-42-19.663Z-replay-scene` and ViaProxy playback `2026-10-04T14-38-50.359Z-replay-scene` preserve the complete scene payload hash.
Both load the accepted pack without a frontend Store account.
Each route receives 587 actor updates.
All message fields match after connection-specific UUIDs, lifetime tokens, and timestamps are excluded.
The local property sequence is orange, blue, orange, and blue.
The bool, int, enum string, and float retain their values and types.
Both routes remove and restore local inputs at each dimension change.
Final screenshots show the grounded blue costume and green equipment on both routes, consistent with the native selection.
Camera framing, lighting, full animation timing, and broader lifecycle behavior remain unverified.

### Server animation commands: native reference

**Incomplete:** `ANIMATE_ENTITY` still has no production handler.
Actor snapshots carry inputs for resource graphs, but they do not reproduce `/playanimation` commands.
Custom actors now share the general resource-defined graph with players and equipped models.
The render paths still need runtime command playback before this requirement can pass.

**Protocol evidence:** The [protocol 2193 schema](https://mojang.github.io/bedrock-protocol-docs/1.26.50/packets/animate-entity-packet/) identifies packet 158 and seven serialized fields.
The [command reference](https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/playanimation?view=minecraft-bedrock-experimental) documents the command arguments.
The [gophertunnel codec](https://github.com/Sandertv/gophertunnel/blob/master/minecraft/protocol/packet/animate_entity.go) provides an independent field-order comparison.
Its comments about state selection and unused blending are leads, not verified behavior for this target.

| Wire order | Field | Encoding confirmed in the capture |
| --- | --- | --- |
| 0 | Animation | Bedrock string |
| 1 | Next state | Bedrock string |
| 2 | Stop expression | Bedrock string |
| 3 | Stop expression version | Signed 32-bit integer, little endian |
| 4 | Controller | Bedrock string |
| 5 | Blend-out time | 32-bit float, little endian |
| 6 | Target runtime IDs | Unsigned variable-length count and 64-bit IDs |

**Native evidence:** Capture `2026-10-04T14-52-23.541Z-record-local` uses official Bedrock 1.26.51.1, build 51061372, protocol 2193.
Its complete scene payload hash is `8cb16a9a749e84ff3b257d6977c19756c23c64f65e484beb3129ad2821319bbb`.
Seven commands target the local player with an authored resource pack.
The pack defines two looping arm poses and one finite animation, without runtime controller resource files.
Every decoded command consumes its complete payload and sends stop-expression version 1.

The native screenshots establish these behaviors:

- A command creates a controller slot even when the pack defines no controller with that name.
- Another command using the same slot replaces the active animation.
- A `q.state_time > 2` stop expression with next state `default` returns the arm to its base pose.
- That transition does not resume the previous command automatically.
- A next state naming an earlier animation in the same slot returns to that earlier pose.

The command with omitted options sends controller `__runtime_controller`, next state `default`, stop expression `query.any_animation_finished`, and zero blend-out time.
That packet uses the declared alias `fixture_wave`; the other commands use full animation identifiers.
The screenshots do not establish alias resolution or finite-animation timing reliably.
One command sends blend-out time 1, but still images do not establish the blend curve or duration.

**Executable cross-check:** Read-only PistonDecompiler inspection uses the matching executable, SHA-256 `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`.
Packet reflection function `141087ea0` and command execution function `14857c450` provide schema and construction evidence.
They do not establish the client playback algorithm.
Raw packets, screenshots, executable bytes, and decompiled output remain private.

**Core implementation:** Patch 0086 now decodes all fields and resolves targets against authoritative actor identities and lifetimes.
It publishes current snapshots before sending commands over a versioned, negotiated Java payload channel.
The add-on does not advertise that channel yet.
Direct and ViaProxy command delivery remain unverified.
The add-on needs per-actor runtime controller slots, command-defined states, resource resolution, stop-expression evaluation, transitions, blending, and effect playback.
Playback must release state on actor removal, world changes, disconnect, and resource replacement.
Further native comparisons must cover alias resolution, clock resets, blending, independent slots, multiple targets, and missing resources.
Direct and ViaProxy playback of this command capture remain unverified.
The packet handler and codec tests establish the core path, without establishing complete animation parity.


### macOS Modrinth joining: NetherNet timeout

**Implemented:** Add-on patch 0019 now removes Minecraft's application read timeout from both direct native transports.
It preserves RakNet session deadlines and NetherNet handshake deadlines and native peer closure.
Java TCP connections retain their application timeout.
Core cannot change Minecraft's direct channel initialization, so this integration belongs in the add-on.

**Reported evidence:** The [macOS Modrinth log](https://mclo.gs/2gcbHoK) repeatedly shows a 30-second gap between completed resource downloads and `ReadTimeoutException`.
The interrupted built-in asset helper follows disconnect cancellation.
Most attempts use NetherNet, which the previous timeout patch did not cover.
The log identifies macOS 27.0 and Java 26.3, but no StackAnvil patch revision.
It does not establish a launcher failure or the cause of the friends-list slowdown.

**Transport verification:** A private loopback probe uses the exact pinned NetherNet and libdatachannel binaries on Linux.
The unchanged baseline reproduces the application timeout.
The updated pipeline survives a 45-second application pause and resumes payload exchange.
A suspended server then causes native connectivity loss and client closure after about 26 seconds.
Normal remote closure also reaches the client without an application timeout.
The add-on and its dependencies build, and the owning patch applies without setup patches.

**Unverified:** These probes do not establish Minecraft UI, Xbox signaling, or macOS runtime behavior.
The friends-list slowdown still needs a reproducible request trace or corresponding client errors.
CDN manifest warnings recover through protocol downloads in this log, but their original archives remain unavailable.
See [the timeout patch notes](../patches/viafabricplus-bedrock/upstreamable/0019-preserve-raknet-sessions-during-resource-pack-prompts.pr.md) for the retained RakNet comparisons.

#### Release regression comparison

The comparison reconstructs selected Java sources from each release's pinned upstream base and ordered patches.
It covers 0.2.3, 0.3.0, 0.3.1, and 0.3.2.
The add-on upstream base, ViaBedrock upstream base, and pinned VFP build remain identical across these releases.
`BedrockFriendsService`, `BedrockSocialService`, `BedrockAccount`, and `BedrockFriendsScreen` are identical between 0.2.3 and 0.3.0.
The social patch changes double-click activation during that interval, but does not change those requests or account refreshes.

| Release | Licensed vanilla images during joining | Missing Store assets | Direct application timeout |
| --- | --- | --- | --- |
| 0.2.3 | No provider | Not part of resource loading | Present on RakNet and NetherNet |
| 0.3.0 | Provider waits for acquisition | Acquisition errors reject resource loading | Present on both transports |
| 0.3.1 | Provider waits for acquisition | Acquisition errors reject resource loading | Removed on RakNet only |
| 0.3.2 | Provider waits for acquisition | Optional I/O failures return no images | Still present on NetherNet |
| Current working stack | Provider reads bundled resources | Store acquisition removed; damaged bundles report an installation error | Removed on both native transports |

[898df4a](https://github.com/StackAnvil/patches/commit/898df4a3cb247a3782e5daaa2e1aa27c7f5c477d) adds licensed vanilla images to resource loading before 0.3.0.
The resource tracker waits for both server packs and these images before completing the join.
This adds a wait that 0.2.3 did not have, and exposes the existing application timeout during acquisition.
The reported log repeatedly shows that timeout after server packs finish.
This sequence and the transport comparison support the joining regression diagnosis.
They do not prove the cause of the separate friends-list slowdown.

[d7d3eb1](https://github.com/StackAnvil/patches/commit/d7d3eb1c2daca19df2064e8756861c8b8b0296e1) removes the RakNet timeout before 0.3.1.
[e84bedd](https://github.com/StackAnvil/patches/commit/e84bedd8e09cd043688ad6f0d67076d97919b52f) makes Store assets optional before 0.3.2.
[ee660e6](https://github.com/StackAnvil/patches/commit/ee660e6ef69720c52bbf34c7425745cec82d1804) extends the timeout fix to NetherNet after 0.3.2.
Disabling interactive Store sign-in does not remove that older transport timeout or disable acquisition through existing credentials.
Before the bundled-resource change, cached assets and headless acquisition remained active in every consent mode.
The current working stack loads built-in images from its JAR and has no Store acquisition path.
The current consent and optional-provider suites pass all nine tests, including declining login and missing Store credentials.

Actual macOS joining still needs verification with a build that contains the NetherNet fix.
The unchanged friends source narrows the investigation; it does not exclude shared runtime, authentication, or network effects.


### Custom actors: shared animation graph

**Implemented:** Custom actors now use the general resource-defined graph for bones, variables, weighted entries, transitions, and supported animation effects.
Explicit legacy controller roots and modern script roots share that evaluator.
Playback belongs to an actor object and authoritative lifetime, with resource and world changes as reset boundaries.
Deferred draws receive immutable poses. Authored custom bone names retain their identity.
UV expressions share actor variables, and effect locators follow the model pose and actor scale.

**Automated evidence:** Targeted tests cover independent actor state, weighted poses, transitions, visibility, clocks, resource overrides, camera angles, pose reset, and scaled locators.
The obsolete restricted evaluator and its limitation tests are removed.
The full add-on build and its core and converter dependencies pass: 976 tests pass, with 113 optional tests skipped.
The replay audit now observes the current immutable model payload path and requires that injection to succeed.
Tooling type checks and all 14 replay tests pass.

**Runtime evidence:** The saved CubeCraft scene uses protocol 2193 and unchanged payload hash `129f13f25af8110800fc0993c9d7aedc6d86477b1835e029dad2d5700051f5a8`.
Complete direct and ViaProxy replays both pass transport and rendering checks with that same hash.
Each installs all 216 recorded skin updates unchanged and evaluates 43 model selections from 77 immutable model updates.
The direct route submits 69,770 resolved custom models across 66,542 actor render frames.
ViaProxy submits 68,750 resolved custom models across 65,567 actor render frames.
Both screenshots show custom NPCs and banners.
These counts establish model delivery and draw submission, without proving native animation timing or complete visual parity.

**Incomplete and unverified:** Native dynamic transition, weighted-pose, and effect-timing comparisons remain necessary for custom actors.
The captured opaque particle chain is addressed in [the particle carrier update](#invisible-particle-carriers-and-opaque-descendants).
Other material families, dynamic geometry selection, additional queries, and named actor events remain incomplete.
Server animation commands also remain part of the full coverage goal.
See [the owning patch notes](../patches/viafabricplus-bedrock/upstreamable/0014-animate-numeric-looping-bedrock-bones.pr.md) for target evidence and scope.


### Server animation commands: native alias and timing capture

**New native evidence:** A 300-second local capture uses Bedrock 1.26.51.1, build 51061372, protocol 2193.
Its scene hash is `8febed2837f1535b30badff75e520bf3498fb5b560515a3cbc5314f1748a26db`.
The production codec reproduces all 13 command packets unchanged.
It also reproduces all seven commands from the earlier capture unchanged.
Both recordings reach spawn and complete resource-pack reconstruction.

Native screenshots show declared animation aliases playing their arm poses.
A private 60-frame-per-second video records repeated finite animations, independent slots, and a two-second blend command.
The capture also transitions toward an animation alias never commanded in that slot.
Further timing and state-resolution analysis remains necessary before implementing those runtime details.

**Implemented:** Core decodes the complete packet and binds negotiated commands to current actor lifetimes.
Three targeted tests cover the packet and payload codecs.
The complete add-on build and its dependencies pass 979 tests, with 113 optional tests skipped.
They check unsigned runtime IDs, immutable targets, malformed counts, truncation, versions, and trailing bytes.

**Incomplete:** Client runtime controllers, ordinary mob integration, first-person drawing, and command effects remain missing.
Direct and ViaProxy delivery and visible native comparisons remain unverified.
See [the core patch notes](../patches/viabedrock/upstreamable/0086-transport-native-actor-animation-commands.pr.md) for the implemented boundary.


### Resource conversion: measured parallelism and disk streaming

**Implemented:** Core builds the four native resource archives as separate tasks in its existing conversion pool.
Disk-cache misses stream ZIP output and its hash into a temporary file, then publish the completed archive before its index.
Failed writes remove temporary files and allow retries.
Both changes serve direct connections and ViaProxy.

**Profile evidence:** The private input contains five captured CubeCraft packs, matching bundled definitions, and 42 licensed image layers.
It targets Bedrock 1.26.51.1, build 51061372, and protocol 2193.
Java 25 uses four available processors and a 2 GiB heap on Linux.
JFR records stage durations, thread CPU time, and allocations.

| Measured stage | Baseline | Optimized | Scope |
| --- | --- | --- | --- |
| Rewrite median | 1577 ms | 986 ms | Five fresh conversions after the first conversion |
| Rewrite plus ZIP | 3150 ms | 2612 ms | About 17 percent less time |
| ZIP packaging allocation | 346.6 MiB | 8.0 MiB | Seven iterations after two warm-ups |
| ZIP packaging median | 1633 ms | 1599 ms | Identical prepared content |

The output contains 15,823 entries and occupies about 86.7 MiB.
The streamed and memory ZIP writers produce identical bytes, hashes, sizes, and entry content.
The parallel native encoders also produce byte-identical archives.
Full conversion comparison normalizes existing identity-based model element names and JSON property order.
CubeConverter's object-hash names currently prevent stable complete ZIP hashes across fresh processes.

**Automated evidence:** Partial-write and retry tests pass, alongside memory/disk descriptor and metadata comparisons.
The complete build passes 982 Java tests with no failures or errors and 113 optional skips.
Both owning patches pass their targeted suites and Checkstyle tasks before the remaining stack applies.

**Remaining work:** Model generation still allocates substantial memory.
The standalone profile excludes runtime custom-block visuals, licensed acquisition, network downloads, and Java client reloads.
These phase improvements do not establish joining-time gains or prevent every possible timeout.
macOS, Windows, concurrent conversions, and larger pack stacks still need performance measurements.
See the [cache notes](../patches/viabedrock/upstreamable/0001-cache-converted-resource-packs.pr.md) and [native archive notes](../patches/viabedrock/upstreamable/0015-scale-play-sound-coordinates.pr.md).


The first cold ViaProxy replay exposed a metadata type mismatch during custom entity spawning.
The cache decoder now restores entity scales as finite floats, matching the converter and renderer.
The metadata suite covers that type across cache misses, shared hits, corruption recovery, and reopened disk caches.
It also rejects numeric overflow during encoding and decoding.


**Runtime evidence:** A repeated cold ViaProxy replay enables disk caching and passes full transport and rendering checks.
The scene hash remains `129f13f25af8110800fc0993c9d7aedc6d86477b1835e029dad2d5700051f5a8`.
It installs all 216 recorded skins unchanged and submits 83,786 resolved custom models across 79,861 actor frames.
Core reports 2253 ms for the first conversion and 2015 ms for the custom-block conversion.
The client's two reloads each take roughly two to three seconds at the log's one-second resolution.
JFR samples identify model JSON parsing and baking during those reloads.
The loopback run uses fresh conversion caches and excludes licensed acquisition.
It does not establish public-network joining improvements or native animation timing.


The direct add-on replay also passes full transport and rendering checks with a fresh disk cache.
Its complete scene hash matches the same original recording, and all 216 skin updates retain their recorded bytes.
Core reports 2159 ms for the first conversion and 1942 ms for the custom-block conversion.
These checks establish cache, loading, and rendering regressions on both routes, without establishing complete visual parity.


### Server animation commands: retained states and queued selection

**New native evidence:** Inspection uses the matching licensed Bedrock 1.26.51.1 executable.
Its SHA-256 is `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`.
The packet handler updates retained states in a controller named by the command, then queues selection for the next controller update.
States use animation names as their identities.
The next-state alias can bind an animation before that state receives any command.
Transitions remain in order, and duplicate target/expression pairs retain the earlier expression version.

Six private probes execute the native selection and controller-update routines with synthetic child callbacks.
Repeated selection resets the current state and its children.
The last selection before an update wins and takes priority over stop expressions in that update.
Blending uses the outgoing state's curve, including a repeated selection of that same state.
An incoming curve alone does not start a blend.
The repeated-state blend samples the same child twice in one update.

**Boundary:** These checks establish controller selection, clocks, and ordinary blend weights.
They do not establish rendered poses, shortest-path rotations, first-person playback, or effect timing.
The runtime command path remains incomplete and the add-on still does not advertise its animation channel.
Client playback must retain states and queued selections rather than replace each controller with a single animation.
See [the core patch notes](../patches/viabedrock/upstreamable/0086-transport-native-actor-animation-commands.pr.md) for function references and probe cases.


### Server animation commands: production playback

**Implemented:** Core now retains command definitions separately for each authoritative actor lifetime.
Replacement, runtime-ID reuse, removal, and connection cleanup release the retained state.
The add-on advertises the animation channel and rejects callbacks from replaced connections.
Its shared graph resolves command aliases, retains states, and queues the last valid selection before each frame.
It also binds an uncommanded next-state alias, preserves outgoing blend curves, and resets repeated selections.
Unavailable commands do not reserve a position in the runtime controller order.

Native custom actors and player body graphs consume these definitions.
Classic players can load the accepted built-in graph for a command without creating a server costume.
The same registry serves direct connections and ViaProxy.
Sound and particle callbacks use the existing graph effect paths.

**Automated evidence:** The complete add-on build and its dependencies pass 993 tests with no failures or errors.
It skips 113 optional tests.
Targeted tests cover retained definitions, lifetime cleanup, controller ordering, queued selection, clocks, blends, perspectives, and callbacks.
They also cover authored controller reuse and classic-player resource loading without server override provenance.
The matching executable probes establish the native state-query binding during child sampling.
The implementation preserves that binding, including its removal by nested controllers.

**Runtime evidence:** The direct replay delivers all 13 recorded commands and retains the complete original scene hash.
It passes transport and rendering checks and installs both recorded geometry skins unchanged.
A required private mixin observes the production graph after sampling.
It records repeated finite playback, independent slots, and a transition into an uncommanded animation alias.
Its final retained-state revision is 13, with `fixture.unseen_next` in `fixture_raise`.
The sampled right-arm rotation is `(-90, 0, 0)`.
The final screenshot shows the raised arm from the Java camera.
The native screenshot uses a different viewing angle, so these images do not establish pixel parity.

The repeated ViaProxy replay also passes full transport and rendering checks with the same scene hash.
It installs both recorded geometry skins unchanged and submits 10,588 native player frames.
Both routes reach retained-state revision 13 and the same final sampled pose.
The private graph audit checks finite-animation resets, simultaneous independent slots, and the uncommanded next state.

The first proxy report failed its skin gate with counters that did not update periodically.
The private recorder now flushes those counters each second.
Local skin installation also uses the play listener's Java profile, independent of player entity creation.
The repeated proxy run verifies two local transfers whose Bedrock UUID differs from that Java profile.
The failed report alone does not establish a packet-delivery defect.

**Incomplete and unverified:** Ordinary mob drawing and other stop-expression versions remain open.
First-person graph sampling now applies the pose to classic and persona hand-view hierarchies.
Server costume selection, global transforms, held-item placement, and native visible comparisons remain incomplete.
Active emote composition, complete effect timing, and dynamic visible comparisons still require work.
The current native command fixture covers player bodies and does not establish custom-actor command drawing through either route.
These results supersede the earlier statement that the client does not advertise the animation channel.
See the [core notes](../patches/viabedrock/upstreamable/0086-transport-native-actor-animation-commands.pr.md),
[graph notes](../patches/viafabricplus-bedrock/upstreamable/0014-animate-numeric-looping-bedrock-bones.pr.md),
and [player notes](../patches/viafabricplus-bedrock/upstreamable/0016-render-server-player-costumes.pr.md).


## First-person actor drawing boundary

The add-on submits supported classic and persona actor hierarchies before Java item transforms.
Separate models retain the sampled pose, parent bones, and authored surface visibility.
The root uses the target executable's camera-space axis basis, collision-height offset, and normal model scale.
The root matrix agrees with 324 private executable cases.
The portable hierarchy test preserves a visible arm beneath a hidden, animated parent.
The full build passes 996 tests with no failures or errors and skips 114 optional cases.

This establishes the matrix and hierarchy boundaries.
Final direct and ViaProxy tests use a matching isolated server and a privately supplied licensed classic-player graph.
Both actual Minecraft entry checks pass, and both final screenshots show the posed arm after the pivot correction.
The initial matching runs passed submission checks while the arm remained offscreen because camel-case bone pivots did not resolve.
The query snapshot now follows the native parser's ASCII name folding while query names remain literal.
These results verify client drawing on both routes, not account acquisition or native pixel parity.
Server costume selection, global actor transforms, native held-item placement, and visible native timing remain incomplete.
See the [first-person implementation notes](../patches/viafabricplus-bedrock/upstreamable/0009-show-saved-character-creator-slots.pr.md#native-first-person-actor-drawing).

## First-person authored actor scale

**Implemented:** The shared graph reads uniform and axis scale scripts.
First-person drawing evaluates them in the sampled actor scope before render-controller visibility.
Uniform scale takes precedence, including zero.
Separate axes evaluate in native Z, Y, X order and default to one when absent.
Signed results and expression side effects remain intact.
Body and hand perspectives retain independent scopes.

**Automated evidence:** All 354 native root matrices agree with the renderer's root calculation.
The added native cases verify absent axes, zero and negative values, uniform precedence, and request order.
Three portable graph tests cover scope changes, repeated access, independent perspectives, defaults, and time rewinds.
The full build passes 999 tests with 114 optional skips and no failures or errors.

**Runtime evidence:** Final direct and ViaProxy clients submit the licensed `0.9375` scale through the actual Minecraft entry.
A private controller fixture makes visibility depend on a variable set by the scale expression after pre-animation resets it.
Both routes show the scaled arm and restore their pose and appearance scopes.
This verifies draw-time ordering and classic drawing with supplied resources, not account acquisition or native pixel parity.

**Incomplete:** Other actor drawing paths still require script-scale integration.
Global actor transforms, selected costume hands, native held-item placement, persona overlap, and native visible timing remain open.
This section supersedes the missing first-person script-scale integration described above.

## First-person global actor transforms

**Implemented:** The hand root applies native death roll and exact upside-down names before axis conversion and script scale.
Core retains the raw `ActorDataIds.NAME` string in each actor snapshot.
The renderer does not remove formatting or change case.
Only `Dinnerbone` and `Grumm` trigger the name transform.

The new snapshot uses wire version two and the negotiated `viabedrock:actor_state_v2` channel.
This channel prevents an older add-on from reading the changed payload layout.
Missing or incorrectly typed names produce an empty raw name.
Ordinary Java translation remains independent of the channel.

**Native evidence:** Matching executable probes cover 415 global matrices and 354 root matrices.
The global cases combine death counters, frame fractions, collision heights, exact names, formatted names, and arbitrary input matrices.
The local first-person flag suppresses native gliding and riptide rotations.
Those movement flags leave the global matrix unchanged in the supplied first-person cases.
The add-on build passes 1,002 tests with 113 optional skips and no failures or errors, with both matrix fixtures enabled.

**Runtime evidence:** Final direct and ViaProxy clients receive authored `SET_ENTITY_DATA` packets through the normal core decoder.
A formatted `§aDinnerbone` name reaches the frontend unchanged, followed by the exact `Dinnerbone` name.
Both actual Minecraft hand entries submit the expected combined death and name matrix with the licensed `0.9375` scale.
Both restore the pose and appearance scopes and suppress duplicate Java hands.
The fixture then clears the name, and both final screenshots show the native arm.
These authored inputs verify delivery and draw-time composition, not native name initialization or death timing.

**Incomplete or unverified:** Native player-name initialization from gamertags and the native death-counter lifecycle remain unverified.
The current death counter uses the Java entity clock.
Other actor roots, selected costume hands, held-item placement, persona overlap, and native visible timing remain open.
These matrix cases do not establish complete visual or lifecycle parity.
This section supersedes the missing first-person global integration described above for death roll and explicit raw names.

## First-person server costume selection

**Implemented:** Server player overrides now select native hand-view geometry, textures, and visibility from the sampled actor scope.
The selection retains variables from animation, scale, and first-person query inputs without a second initialization or pre-animation pass.
Each selected controller retains an independent model hierarchy and ordered visibility rules.
Original skin selections retain their persona surfaces.
Replacement costume bodies omit those original surfaces.

Accepted resources and actor snapshots supply the same path on direct connections and ViaProxy.
Supported alpha-test materials retain culling, emissive flags, lighting inputs, and enabled native UV transforms.
The renderer uploads complete source images for those transforms.
Pack changes clear hand models and release textures.
Missing active geometry, textures, or material families produce bounded diagnostics.

**Automated evidence:** The shared-scope test covers animation-entry variables, scale mutations, multiple texture draws, UVs, lighting, repeated selection, and independent perspectives.
The dependency build passes 1,001 tests with 115 optional skips and no failures or errors.

**Runtime evidence:** An authored pack overrides `minecraft:player` with two conditional hand controllers, separate geometry, and separate textures.
Both direct and ViaProxy clients accept the pack, submit two distinct model hierarchies through the actual hand-render entry, and show both textured cubes.
The probe also checks the sampled scale, Java arm replacement, and scope restoration.
The matching native client accepts identical fixture resources and shows selected hand geometry.
Its visible placement differs from the Java capture, so this comparison does not establish coordinate parity.
All fixture assets, captures, and probe output remain private.

**Incomplete or unverified:** Per-bone materials, other material families, costume effects, equipped items, native timing, and complete visible parity remain open.
This section supersedes the missing hand-view costume selection described above for supported resolved resources.

## Live first-person geometry origin

**Corrected:** Use local eye height for the hand root and preserve the existing bone origin.
Both native geometry and the converted hierarchy already contain the 24-pixel Y bind origin.
The earlier extra Y translation counted it twice.
This correction applies to classic, persona, and resolved server costume hierarchies on both routes.

**Native evidence:** The matching standing hand pass reads render offset `1.6200100183486938` and model scale `1/16`.
Live posed bone matrices retain their native bind origin before the actor root runs.
The replacement portable test compares all cube corners after both captured bone and actor transforms.
The earlier corner test omitted the native bone transform and did not establish visible placement.
Yaw-zero supplied root cases and global death/name transforms pass with the corrected basis.

**Runtime evidence:** Direct and ViaProxy hand-entry probes select two independent surfaces and reproduce the captured layered poses.
The packets and selected pack layers are identical between routes.
These checks establish pose selection, actor scale, hand submission, and scope restoration.
They do not establish matching raster output.

**Verified for the standing fixture:** At matched 1280 by 694 viewports, native and both Java routes place both cube silhouettes within one pixel.
The earlier smaller Java viewport let the hotbar hide most of the cyan cube.

**Incomplete or unverified:** Lighting, movement, equipped items, and general visual parity still require matching native comparisons.
Native render-offset changes across poses and dimensions remain unverified.
Java eye height differs from the captured standing value by about `0.00001` blocks.
Held items, equipment, persona overlap, and native timing remain open.
This section supersedes the earlier extra-origin adjustment and half-height assumption.


### Resource conversion: shared model geometry

**Implemented:** Core reuses compiled geometry across entity texture variants and attachable aliases within each conversion.
Each variant retains independent texture bindings, display transforms, and output paths.
Concurrent tasks share read-only geometry, and the cache ends with the conversion.
Both direct connections and ViaProxy use this path.

**Measured:** The private CubeCraft fixture contains five packs and 42 licensed image layers for Bedrock 1.26.51.1, protocol 2193.
Java 25 uses four available processors and a 2 GiB heap on Linux.
Six measured conversions follow two warm-ups.
Entity model CPU decreases from 856 to 664 ms, about 22 percent.
Entity model allocations decrease from 2201 to 1136 MiB, about 48 percent.
Complete rewrite time remains roughly one second, and rewrite plus ZIP time remains roughly 2.6 seconds.
The result reduces CPU and allocation pressure without establishing faster joins.

All 15,823 output entries remain semantically equivalent after normalization of existing generated names, property order, and equivalent particle aliases.
Targeted tests cover concurrent variants, preserved geometry, scale metadata, and unchanged source models.
See the [model export notes](../patches/viabedrock/upstreamable/0066-export-empty-item-models.pr.md) for the comparison.

**Unverified:** macOS, Windows, simultaneous connections, end-to-end joining gains, licensed acquisition, and larger pack stacks still need measurements.


**Runtime verification:** Fresh-cache direct and ViaProxy replays preserve the complete scene hash and all 216 skin updates.
Both converted packs load, and rendering checks pass without unresolved model or block errors.
The full stack build passes 1004 Java tests with no failures or errors and 115 optional skips.
The shorter first ViaProxy run ended before the full scene and does not count as complete verification.
These runs establish regressions on both routes, without establishing full visual parity or faster joins.


## Resource conversion: parallel ZIP compression

**Implemented:** Core compresses large converted packs with up to four workers and temporary disk storage.
Small packs and single-processor hosts retain sequential packaging.
The writer preserves resources and metadata, waits for workers, and removes temporary storage after completion, cancellation, or failed output.
Both direct and ViaProxy connections use this core path.

**Measured:** The existing private CubeCraft stack targets Bedrock 1.26.51.1, build 51061372, and protocol 2193.
Java 25 uses four processors and a 2 GiB heap on Linux.
The production writer reduces median streamed packaging from 1540 ms to 752 ms across seven iterations after two warm-ups.
Every prepared entry remains byte-identical after extraction.
The archive has 15,823 entries and grows about 1 percent because ZIP metadata differs.
Main-thread packaging allocation rises from 8.0 MiB to 105.5 MiB, and temporary storage adds disk traffic.

Eight complete conversions discard the first two iterations.
Median rewrite plus ZIP packaging falls from 2557 ms to 1707 ms, about 33 percent.
These results exclude acquisition, downloads, prompts, and client reloads.
They do not prove joining-time gains or prevent every timeout.

**Automated evidence:** Worker-count determinism, content, timestamps, interruption, cleanup, retry, and output ownership tests pass.
The standalone cache patch applies to upstream, and the full stack replays and builds.
The projects report 1008 passing Java tests, no failures or errors, and 115 optional skips.
See the [parallel ZIP notes](../patches/viabedrock/upstreamable/0001-cache-converted-resource-packs.pr.md#compress-large-zips-in-parallel).

**Runtime evidence:** Fresh disk-cache replays pass complete transport and rendering checks on direct and ViaProxy connections.
Both routes load two newly converted archives with 15,601 and 15,959 entries through the parallel backend.
The complete scene hash stays unchanged, all 216 recorded skins retain their bytes, and no unresolved model or block errors occur.
These loading checks do not establish complete native visual parity.

**Remaining:** Measure concurrent conversions, larger stacks, macOS, Windows, and end-to-end joining behavior.
Transport liveness remains necessary while other phases wait.


## Native first-person controller diagnostics

**Investigated, still incomplete:** Live probes use the matching official Bedrock build and a private two-controller player fixture.
Both controllers reach drawing, and both named hand bones pass their visibility expressions.
The right-hand drawing matrix includes the native empty-hand animation transform.
The left-hand matrix includes a separate vertical offset.
The current add-on server graph does not reproduce these poses when the fixture omits animation roots.

Renaming the fixture entity file to the built-in player filename retains the same native transforms.
An explicit empty animation list instead produces the ordinary native player hand, including after changing the pack version.
These results narrow the gap but do not establish the complete entity-definition merge rules or the reason for that fallback.
No guessed merge rule enters production.
Native animation inheritance, pose application, and final visible placement still need implementation and comparison on both routes.
All original coverage requirements remain active.

## Client entity inheritance across pack layers

**Implemented:** ViaBedrock merges client entity description objects by identifier before converter parsing.
Animation aliases and script fields inherit individually; explicit lists and scalar values replace lower values.
The add-on samples the same effective description instead of replacing it with the last JSON document.
This resolves the captured missing lower animation graph on both connection routes.

**Native evidence:** Three isolated Bedrock 1.26.51.1 runs test a lower two-arm graph and a higher player overlay.
Omitted roots retain both authored poses while an upper scale of `0.875` replaces `0.9375`.
Overriding only the right alias changes its posed bone to `[8, 15, 10]`.
The untouched left alias retains `[1, 18, -1]`.
Both bones already contain the native 24-pixel bind origin.

**Runtime evidence:** Direct and ViaProxy replay the same 75-second packet prefix and accept the same packs.
Both hand-entry probes reproduce those bone translations, actor scale, two independent surfaces, and scope restoration.
Their selected scene hash is `0b88897357a050b6ac59888eedf79b4ca25adf873181c2914c885b6bd9443b13`.
The fixture intentionally has no third-person controller.
The generic avatar audit therefore reports no third-person draw; the hand probe and transport checks pass separately.
The prefix preserves selected payload bytes and times, not the full longer recording.

**Implemented:** The licensed appearance reader now shares the public core merger.
It preserves duplicate identifier checks and returns independent snapshots.
Matching licensed files retain four earlier aliases beyond the latest player file's 68 declarations.
Fixture-enabled checks verify those mappings and sample the real graph for 120 frames.
Other description fields, duplicate identifiers within a pack, and attachable inheritance need native checks.
The matched standing fixture now has raster evidence below. Other poses, empty-graph fallback, held items, and complete first-person parity remain open.
The complete build passes 1,010 tests with 115 optional skips and no failures or errors.
The new core patch also passes its two tests and Checkstyle on clean upstream with Java 17.
The original full-coverage goal remains active.

## Licensed inheritance and matched hand silhouettes

**Implemented:** Account appearance graphs use the same core description inheritance as server actor graphs.
The add-on retains per-pack duplicate identifier checks and independent result snapshots across its separate Gson types.
Nested lists and objects remain independent of caller data.

**Resource evidence:** The matching package's latest player file declares 68 aliases; the merged stack resolves 72.
The four retained aliases cover item attack rotation, crossbow hold, breathing bob, and fishing-rod animation.
The optional asset test verifies their mappings and samples the real licensed graph for 120 frames.
A synthetic layered graph verifies the upper right-arm pose, inherited left-arm pose, scale, and explicit empty-list replacement.

**Raster evidence:** The native, direct, and ViaProxy standing fixtures use 1280 by 694 viewports and a 70-degree hand camera.
The stable ViaProxy hand projection records near plane 0.025.
The native orange silhouette spans `(640,488)-(715,584)`; both Java routes span `(640,487)-(715,584)`.
The native cyan silhouette spans `(771,647)-(910,693)`; both Java routes span `(770,647)-(910,693)`.
These masks establish placement within one pixel for the tested standing cubes.
The earlier smaller Java viewport let its hotbar hide most of the cyan cube.
Raw screenshots, masks, licensed assets, and runtime probes remain private.

**Incomplete or unverified:** Lighting, scene timing, rotation, movement, equipment, persona overlap, and other dimensions need native comparisons.
The recovered aliases still need native item and movement checks in the complete licensed appearance path.
The full Bedrock coverage goal remains active.

**Validation:** The complete build passes 1,012 tests with 115 optional skips and no failures or errors.
The focused licensed graph suite passes all 26 tests with assets enabled.
The independent core patch passes three tests and Checkstyle on Java 17.


## First-person rendered item inputs

**Implemented:** First-person graphs read rendered names from Minecraft's retained hand stacks during item swaps.
The avatar render state continues to supply third-person rendered stacks.
Equipped names, charge state, and active-use durations keep their separate inventory inputs.
The hand input copies the actor frame and restores submission scope.

**Evidence:** Minecraft 26.3 retains previous stacks in `FirstPersonHandsAndItemsRenderState` during swap animation.
The official Molang item-name query distinguishes rendered items from equipped items.
The matching Bedrock callback's argument and raw-name behavior has separate executable fixtures.
A new bone-playback test checks distinct retained, replaced, and empty main-hand poses plus independent offhand selection.
It also checks equipped charge and duration bindings and the unchanged actor frame.

**Incomplete or unverified:** Native swap timing, held-item drawing transforms, first-person equipment, and full visual item parity still need native comparisons.
The original full-coverage goal remains active.

**Runtime verification:** Direct and ViaProxy replays reach spawn and load the same selected 75-second packet prefix.
The production hand-frame sampler passes 12 query checks on direct connections and 18 through ViaProxy.
The controlled states retain a bow, replace it with a crossbow, and clear it while equipped inventory remains unchanged.
The ViaProxy probe explicitly checks all three rendered names, including the empty name.
Both probes check independent offhand inputs and scope restoration.
The existing two-surface hand submission and layered pose checks still pass through Minecraft's hand entry.
The generic third-person audit reports no avatar draw because this fixture defines only first-person controllers.
These controlled runtime checks establish query binding, not native swap timing or final held-item pixels.

**Validation:** The dependency build and Java suites pass 1,013 tests with 115 optional skips and no failures or errors.
The focused hand input suite also passes with native height and arm-offset fixtures enabled.
The full coverage goal remains active.


## Native hand height and Java swap cooldown

**Implemented:** Loaded native appearance graphs now raise retained hands toward height one without the Java attack-delay multiplier.
Animated replacements continue to lower the hands toward zero.
The change applies only when the local skin texture matches the loaded graph.
Missing, pending, failed, and mismatched appearances retain ordinary Java behavior.
The later [native hand lifecycle](#native-hand-height-and-retained-item-lifecycle) also replaces the busy-hand branch and copy threshold.
Item classification still uses Java comparison rules.

**Native evidence:** The matching Bedrock 1.26.51.1 executable, build 51061372, updates both heights with a maximum step of 0.4.
Native function `1447af310` targets zero for its animated-replacement classification and one for its other classifications.
Execution of its arithmetic instructions covers 900 combinations of initial heights and independent hand classifications.
Minecraft 26.3 instead multiplies the retained main-hand target by the cube of `getItemSwapScale(1)`.
That method derives its scale from the item swap ticker and attack strength delay.
The add-on now selects the complete native height update for matching native appearances.
The fallback retains Java updates, and attack strength and inventory state remain unchanged.

**Incomplete or unverified:** Native item comparison rules, complete swap timing, and final held-item pixels need further comparisons.
The native instruction results establish height arithmetic, not complete item classification or visible parity.
Licensed executables, arithmetic inputs, and runtime probes remain private.
The original full Bedrock coverage goal remains active.


**Runtime verification:** Direct and ViaProxy clients each pass all 900 reference cases through Minecraft's actual hand tick with Java swap scale zero.
Their old hand heights retain the previous values for interpolation.
Both routes also pass four fallback cases: missing appearance, mismatched texture, pending graph, and failed graph.
The existing two-model submission, layered poses, rendered-item queries, and scope restoration still pass.
The controlled fixtures use matching stacks, equivalent copied stacks, and animated replacements.
They do not establish the classifier for every native item pair.
The generic third-person audit reports no avatar submission because the fixture defines only first-person controllers.
The hand-specific probes provide separate evidence.

**Validation:** The dependency build passes 1,013 Java tests with 115 optional skips and no failures or errors.
The full add-on stack replays all 23 patches.

Both clients reach playable spawn, load the converted packs, and complete the unchanged 75-second scene prefix.
These checks establish transport and hand behavior for this fixture, not complete visual parity.


### Native item classification research

**Verified research:** A private inventory probe uses Bedrock 1.26.51.1, build 51061372, and protocol 2193.
The probe records live item dispatch for 19 identifiers.
The native functions select three results: retain, update immediately, or animate replacement.

| Native item | Classifier | Relevant data comparison |
| --- | --- | --- |
| Shield | Separate shield classifier | Full item data and a player timer |
| Firework star | Base classifier | Selected fields in `FireworksItem` |
| Filled map | Base classifier | Long tag `map_uuid` |
| Other 16 sampled identifiers | Base classifier | Default comparison accepts the relevant data |

The other identifiers cover stone, bow, crossbow, fishing rod, firework rocket, banner, bed, and ink sac.
They also cover compass, bundle, apple, diamond sword, oak boat, spyglass, trident, and goat horn.
This sample does not establish dispatch for the entire native item catalog or custom items.
The filled-map override also shows that the earlier static vtable scan misses some item families.

The base classifier animates a replacement when the selected hotbar slot changes.
Otherwise, equal counts and full stack equality retain the previous stack.
The remaining cases compare item identity, auxiliary data, and the item's relevant data.
An equal comparison updates the retained stack immediately.
An unequal comparison animates its replacement.
Full equality also reads block identity, restriction hashes, blocking ticks, and a nested charged item.
Java component equality cannot reproduce these rules without the original Bedrock context.

The filled-map comparison uses `map_uuid` only when its tag type is Long.
Missing tags and other tag types compare as `-1`.
The firework-star comparison reads `FireworkType`, `FireworkTrail`, and `FireworkFlicker` as nonzero byte flags.
Thus, its relevant-data comparison accepts different nonzero values for `FireworkType`.
It also compares `FireworkColor` and `FireworkFade` by length and contents.
Missing and present outer or nested compounds have separate branches.
These are instruction findings, not live coverage of every NBT combination.

The shield classifier checks item identity, effective auxiliary data, full item data, and the selected slot.
Its timer branch animates replacement for elapsed values zero through three.
At elapsed values of four or more, changed blocking ticks request an immediate update.
Equal blocking ticks retain the stack.
The native code uses unsigned subtraction for elapsed time.
A private live watchpoint identifies the timer as `BlockedUsingShieldTimeStamp` at player offset `0xbb0`.
Two controlled attacks update it to the current level tick after successful shield blocking.
Crouching without an attack does not update it.
The matching player update function supplies its guard and rising-edge behavior.

The update requires `BLOCKING` (72) and rejects `TRANSITION_BLOCKING` (73).
A rising `BLOCKED_USING_SHIELD` (74) flag writes the timestamp.
A rising `BLOCKED_USING_DAMAGED_SHIELD` (75) flag writes a separate timestamp at `0xbb8`.
The update clears both timestamps when its guard fails.
It retains the previous values of flags 74 and 75 outside that guard.
The local-player update writes `StartedBlockingTimeStamp` at `0xba8` on a rising flag 73 while flag 72 remains set.
It clears that timestamp when flag 72 clears and retains the previous transition flag outside the guard.
A matching live watchpoint observes the timestamp write and reset.
The [shield timeline implementation](#native-shield-blocking-timeline) now retains these three clocks in core.

Native global names identify the color exception as `minecraft:glow_stick` and `minecraft:sparkler`.
The helper masks effective auxiliary data with `31` and maps values of `16` or more to `5`.
It copies the new stack and suppresses replacement when the resulting colors match.
Other items do not enter this exception through these two identifier checks.

**Instruction validation:** Unicorn executes 1,152 base-classifier cases and 1,024 shield-classifier cases without mismatches.
The fixtures cover count changes, auxiliary data, restriction hashes, blocking ticks, item identity, selected slots, and both hands.
They use valid synthetic stacks with absent user data and no charged item.
The shield fixtures supply a level-tick getter and timer values.
They do not emulate the timer's lifecycle.
The native comparison functions run directly, with a trampoline for indirect-call dispatch.
The private client reaches playable spawn and completes the inventory capture.
Owned lab processes stop normally, and the existing shared lab processes remain running.

**Incomplete:** Production still uses Java item comparison to select retain, update, or animate.
The original Bedrock comparison context, shield classifier integration, complete item dispatch, and final swap pixels need implementation and verification.
The selected-slot cache and complete native item comparisons still need lifecycle implementation and verification.
Executable exports, synthetic inputs, memory probes, and packet captures remain private.


### Native color exceptions, copies, and selected-slot state

**Verified research:** The matching Bedrock 1.26.51.1 executable, build 51061372, supplies the color predicate and its complete hand-tick caller.
Static initializers bind the two native identifiers to `minecraft:glow_stick` and `minecraft:sparkler`.
Both initializer constants match the identifiers' FNV-1 hashes.
The predicate checks the hash and name bytes, with a mutual-pointer cache fast path for the first identifier.
These identifiers cover the Education color exception, not banners or shields.

The caller skips color handling after a retain result or when both stack counts are zero.
For an update or animated replacement, the helper requires equal native item IDs and a recognized current item.
It uses the block-derived auxiliary value when a block exists, except for raw wildcard value `32767`.
Otherwise, it uses the raw auxiliary value.
The helper masks the value with `31` and replaces results of `16` or more with `5`.

Both equal and unequal normalized colors copy the current stack into the retained stack.
Equal colors force retention, including after a selected-slot change.
Unequal colors leave the original update or animation result in place.
The color copy does not update the cached selected slot.
Only the ordinary main-hand copy updates that cache, after an immediate update or the existing height threshold.
The offhand receives no selected-slot change argument and never updates the main-hand slot cache.

The owner constructor prefix initializes the cached slot and all four height fields to zero.
It calls both native empty-stack constructors and retains the supplied client bridge.
Six sentinel cases execute those constructors and verify empty stacks, valid flags, auxiliary values, counts, restrictions, and variant tags.
The probe supplies the later owner allocation and stops before the remaining constructor body.
This proves initialization for that prefix, not world changes, appearance transitions, or the owner's complete lifetime.

| Native instruction probe | Cases | Scope |
| --- | --- | --- |
| Identifier predicate | 120 | Name and hash checks, storage, missing pointers, and cache branches |
| Color postprocessor | 26,136 | Raw/block auxiliary values, wildcard values, normalization, and observed copy calls |
| Base copy construction and destruction | 30 | Actual field writes and balanced weak-reference counts |
| Color helper with native copies | 1,728 | Actual construction, destruction, assignment, and empty variants |
| Complete hand-tick caller with native copies | 64,800 | Both hands, supplied classifications, heights, selected slots, cache writes, and retained fields |
| Owner constructor prefix | 6 | Actual empty-stack constructors, initial slot, heights, and bridge |

The larger caller probe executes actual native copy and empty-variant instructions instead of skipping them.
It verifies retained auxiliary values and counts as well as height results and selected-slot state.
The fixtures use synthetic stacks without user data, restrictions, or a charged item.
Virtual classifications, inventory getters, global string allocations, and CRT boundaries remain supplied.
The predicate fixtures also exercise synthetic cache states that do not establish valid live object construction.
These checks do not establish every item's virtual dispatch or final rendered pixels.

The private PE loader now zero-fills virtual section tails instead of reading adjacent raw-file bytes for uninitialized globals.
The two identifier globals occupy that zero-filled region before their initializers run.
All 2,176 earlier base and shield classifier cases still pass with the corrected loader.
Executable bytes, exports, synthetic fixtures, and emulator programs remain private.

**Incomplete:** Production still uses Java item classification.
Complete native NBT comparison, resolved restriction hashes, charged-item construction, item dispatch, and renderer lifetime transitions require further verification and implementation.
The color and selected-slot rules above are verified instruction behavior, not a claim that their production integration is complete.


### Native NBT and full-stack comparison research

**Verified research:** Additional probes execute Bedrock 1.26.51.1, build 51061372, using the corrected PE loader.
The native NBT comparators pass 3,486 cases covering all eleven value types, strings, arrays, compounds, lists, and type mismatches.
The earlier 504 float and list cases also pass with zero-filled virtual section tails.

String equality compares lengths and bytes, including embedded zero bytes.
Small and heap-backed strings produce the same comparison result.
Byte and integer arrays compare their byte lengths and contents.
Compound equality compares key membership and typed child values, independently of tree shape or key storage.
A shared compound containing NaN still compares unequal to itself.
Signed zero compares equally, and empty lists retain their declared type distinction.

Another 784 cases execute native user-data comparison, full-stack comparison, and the default item classifier together.
For these valid ordinary stacks, absent user data and an empty compound compare equally.
Changed user data requests an immediate update when the default relevant-data comparison accepts the items.
Equal user data with equal counts retains the item unless the selected slot changes.
A selected-slot change requests animation.
These fixtures supply the default relevant-data callback and do not establish dispatch for every item.

The full-stack comparator passes another 11,833 cases: 11,664 parent-field combinations and 169 charged-stack combinations.
Raw auxiliary value `32767` acts as a wildcard on either side.
Block comparison is asymmetric: a present left block requires the same right block, while an absent left block imposes no block check.
The comparator requires equal restriction hashes and blocking ticks.
For present charged stacks, it compares count and recursively compares the nested stack.
Invalid or physically empty charged stacks follow the absent-stack branch.
These fixtures directly construct charged fields and supply restriction hashes.
They do not execute charged-item loading, resolve restrictions, or establish their wire-to-object construction.

| Native probe | Cases | Supplied boundaries |
| --- | --- | --- |
| NBT value comparison | 3,486 | Synthetic tag objects, string allocation, compound trees, and CRT byte comparison |
| Earlier float/list comparison | 504 | Synthetic values and list storage |
| User data through default classification | 784 | Valid ordinary stacks, inventory context, and default relevant-data callback |
| Remaining full-stack fields | 11,833 | Block identities, derived restriction hashes, and charged-stack fields |

All comparison, type-check, lookup, and recursive native instructions execute in these probes.
The CRT boundary supplies standard byte comparison; it does not replace tag equality or compound lookup.
Raw executables, memory layouts, generated inputs, and emulator programs remain private.

**Incomplete:** These results verify comparison rules, not production classifier integration or complete native object construction.
Restriction resolution, charged-item loading, item-specific dispatch, selected-slot lifetime, and final held-item pixels still require implementation and verification.


### Native restriction and charged-item construction research

**Verified research:** New probes execute the matching Bedrock 1.26.51.1 executable, build 51061372.
They retain the corrected PE loader and actual native tag comparison routines.
Together, 1,371 cases cover restriction processing, charged-item loading, and the selected default method after loading.

The restriction helper adds `minecraft:` only when the input contains no colon.
It preserves the supplied bytes otherwise.
Its hashed-string constructor retains the string length but hashes bytes only before the first zero byte.

The append helper deduplicates resolved block pointers.
An expansion stops at its first unresolved member and retains the earlier appended members.
The surrounding caller can continue with later restriction entries.
These probes supply registry membership, expansion, and block lookup answers.
They do not establish the registry's real tag, alias, or case rules.

The native sort orders block pointers by unsigned name hash, then name bytes and length.
It does not order them by pointer address.
The hash helper then combines hashes of the pointer bytes in that order.
It preserves duplicate inputs supplied directly to that helper.
The earlier append helper removes repeated resolved pointers before this stage.
Tests cover independent restriction vectors, permutations, equal hashes, duplicate inputs, and vectors of up to 512 entries.

The charged-item setter transfers the outer user-data compound and reads its `chargedItem` compound.
The saved-tag loader reads `Damage` as Short and `Count` as Byte.
Other tested numeric tag types produce the missing-field defaults.
Negative saved auxiliary values clamp to zero.
Count preserves all eight bits.

For the selected non-durable path, wildcard auxiliary value `32767` becomes zero after the item method runs.
An unresolved saved name produces an empty charged stack in these registry fixtures.
Native copies and destructors balance the tested item and registry reference counts.

The selected default item method reads maximum damage as a signed short.
For a positive result and an absent `Damage` key, it creates an Int tag from the signed effective auxiliary value.
It preserves other user-data keys and clears raw auxiliary data.
An existing `Damage` key prevents that migration, including each of the eleven tested value types.
The charged-stack probe also executes the migration, native compound copies, and destruction with the resulting user data.
These synthetic definitions do not establish maximum damage or method dispatch for the real item catalog.

| Native probe | Cases | Supplied boundaries |
| --- | --- | --- |
| Restriction sort and hash | 668 | Synthetic block names, pointers, and CRT byte operations |
| Restriction processing caller | 252 | Registry answers, allocations, and CRT operations |
| Charged saved-tag loader and copies | 144 | Item registry, maximum-damage field, allocations, TLS, and CRT operations |
| Default method after loading | 307 | Maximum-damage field, allocations, registry context, and CRT operations |

Native instruction execution includes normalization, pointer deduplication, expansion control, tag lookup, compound allocation, Int-tag insertion, copies, and tested destructor paths.
Registry answers and allocator behavior remain supplied rather than reconstructed from the native game catalog.
The probes retain raw executable bytes, object layouts, generated fixtures, and emulator programs privately.

**Incomplete:** Production still transports decoded wire snapshots and uses Java hand-item classification.
Real registry resolution, legacy saved IDs, full saved-tag construction, item-specific loading methods, dispatch, renderer lifetime, and final pixels remain incomplete or unverified.
The saved-tag findings do not establish normalization for every inbound network item.
These results narrow the production design.
They do not claim a completed native classifier.


### Native registry dispatch and Education-item loading research

**Verified research:** A live Bedrock 1.26.51.1 client reached the CubeCraft lobby with its resource packs loaded.
The selected registry contained 2,621 distinct item names, internal IDs, and item objects.
Of these definitions, 545 had server-defined namespaces.
The numeric and name tables each contained those 2,621 definitions.
The other two inspected name-lookup tables were empty in this snapshot.

The live numeric lookup, name lookup, registry wrapper, default classifier, and hand-tick code matched the inspected executable bytes.
This comparison covered five selected code ranges in build 51061372.
It did not compare the complete running image.
Raw registry data, component trees, screenshots, and executable bytes remain private.

| Captured virtual method | Definitions | Selected behavior |
| --- | --- | --- |
| Hand-swap classifier | 2,620 default, 1 shield | The shield uses its specialized classifier |
| Relevant-metadata predicate | 2,619 default, 1 filled map, 1 firework star | Map and firework-star predicates retain their existing specialized paths |
| Method after loading | 2,449 default, 172 specialized | Six specialized methods cover Education items, leaves, decorated pots, and banners |
| Maximum-damage getter | 2,097 field, 524 component | Component definitions resolve the `minecraft:durability` entry |

The specialized loading methods cover 119 element items and 46 other Education items.
Glow sticks and sparklers share another method.
Three leaf items, decorated pots, and banners account for the remaining five definitions.
These counts describe this initialized registry, including its server definitions.
They do not establish dispatch for every possible server or registry configuration.

**Verified numeric lookup:** The actual native lookup passed 65,546 inputs against a reconstructed table of the captured internal IDs.
The probe covered every 16-bit input and ten additional truncation boundaries.
Lookup interprets the low 16 bits as a signed ID and rejects zero and minus one.
Resolved weak references gained exactly one tested reference.
The hash table, weak cells, TLS, and empty fallback were initialized by the probe.
Bedrock network item IDs require a separate mapping.

**Verified maximum damage:** Both native getter methods passed for all 2,621 captured definitions.
The component cases used 524 captured object trees and executed the native component lookup.
The field cases used 2,097 captured maximum-damage fields.
Seventeen component definitions had nonzero maximum damage in this snapshot.
TLS initialization guards and CRT operations were supplied.
Complete registry construction and lifecycle verification remain open.

**Verified Education loading:** The native glow-stick and sparkler method passed 66,256 cases.
Tests covered every raw auxiliary bit pattern, block-derived auxiliary values, all eleven existing `Damage` types, and preservation of other user-data keys.
An existing `Damage` key skips the migration.
Otherwise, the method writes Int `Damage` from bits 6 through 12 of the effective auxiliary value.
It retains auxiliary bits selected by `0xe03f`, then clamps a nonpositive signed result to zero.
This method differs from the previously tested default durability migration.

The Education probe executed native lookup, compound allocation, Int-tag insertion, and comparison.
Allocator, CRT, and registry boundaries remained supplied.
The 134,423 new instruction-execution cases exclude the live dispatch inventory and selected code-range comparisons.

**Incomplete:** Production still uses Java hand-item classification and decoded wire snapshots.
Native name remapping, restriction registry resolution, complete specialized construction, complete saved-tag construction, and renderer lifetime remain incomplete or unverified.
These results establish broader dispatch evidence and additional construction rules.
They do not establish complete network-item normalization, visible timing, or first-person parity.


### Specialized native item-loading research

**Verified research:** Five additional probes executed specialized methods from Bedrock 1.26.51.1, build 51061372.
They passed 77,324 cases across banners, decorated pots, leaf states, the Education gate, and legacy element dispatch.
These probes cover the remaining specialized methods in the captured registry.
They do not complete native registry construction or network-item normalization.
Executable bytes, object data, emulation programs, and reference outputs remain private.

| Native method | Passing cases | Verified behavior |
| --- | --- | --- |
| Banner loading | 192 | Absent or empty user data becomes Int `Type:0`; nonempty user data remains unchanged |
| Decorated-pot loading | 1,682 | The first four `sherds` entries determine whether the key remains |
| Education gate | 256 | Disabled chemistry invalidates the stack and releases its item and user data |
| Leaf loading | 8,306 | Clear `update_bit`, then `persistent_bit`, with native state selection and fallback |
| Legacy element dispatch | 66,888 | Effective auxiliary bits select remapping or invalidation before the Education gate |

**Banners:** The method inserts Int `Type:0`, rather than a `Base` tag.
Any nonempty compound skips insertion, even when `Type` is missing or has another tag type.
The probe executed compound creation, Int insertion, ownership transfer, and typed comparison.
It covered absent and empty compounds, all eleven existing tag types, and auxiliary boundaries.

**Decorated pots:** A typed list supplies up to four string entries.
Missing entries and entries with another tag type act as empty strings.
If all four strings are empty or exactly `minecraft:brick`, native tree removal deletes the `sherds` key.
Later list entries do not affect this decision.
A non-list `sherds` value remains unchanged.
Other keys, the allocated compound, and auxiliary bits remain unchanged.

The pot probe executed the native list reader, predicate, tree removal, and child destruction.
A selected native initializer fragment supplied the `minecraft:brick` string.
Fixtures used valid small trees and covered list lengths, types, string boundaries, storage forms, and preservation of other data.

**Education gate:** The actual context acquisition, gate, invalidation, and release methods balanced the tested references.
Bit zero of the supplied chemistry flag controls admission.
Enabled chemistry preserves the complete stack in these cases.
Disabled chemistry clears the item reference, user data, count, and auxiliary value.
Context objects and mutex operations remained supplied.

**Leaves:** Native initializer fragments identify the first property as `update_bit` and the second as `persistent_bit`.
An enabled static property clears its mask from the block's auxiliary value before lookup in the state vector.
An absent or invalid vector entry retains the current block.
A missing static property can use a dynamic resolver, then the legacy default when its fallback flag permits it.
A disabled static property retains the current block without that fallback.
The second pass uses the block and legacy definition selected by the first.

The leaf probe covered both passes, their composition, masks, bounds, empty candidates, duplicate dynamic entries, and absent blocks.
Only the block pointer changed in the tested stack snapshots.
Property names and IDs came from native initializer fragments.
Registry definitions, state vectors, and dynamic resolver answers remained supplied.

**Elements:** The method selects block-derived auxiliary bits except for the raw wildcard value or an absent block.
For a matching legacy identity and nonzero effective value, the low byte must be below 119.
The low seven bits then select a nonempty element-table entry.
Valid entries dispatch the selected block and original count to the stack constructor; invalid entries invalidate the stack.
The Education gate follows either path.

The element probe covered all 65,536 raw auxiliary values and 1,352 additional block, identity, count, and chemistry combinations.
It executed dispatch, the chemistry gate, invalidation, context release, and item-reference cleanup.
Legacy identities, element definitions, and the block-construction callback remained supplied.
It did not execute complete block-to-item construction.

**Incomplete:** Production still uses Java hand-item classification and decoded wire snapshots.
Complete network construction, block-to-item construction, native name remapping, restriction registry resolution, and renderer lifetime remain incomplete or unverified.
Allocator, CRT, TLS, and registry boundaries remained supplied where the probes required them.
These results establish construction rules at specific boundaries, not complete first-person behavior or visible parity.


### Native block-to-item construction research

**Verified research:** The actual block constructor and replacement setter passed 108,432 cases in Bedrock 1.26.51.1, build 51061372.
The probe executed numeric lookup, registry wrappers, name lookup, empty alias-table paths, user-data copies, assignment, and destruction.
These cases execute the constructor itself.
The captured inventory supplied 2,621 canonical names and internal IDs, including 545 names from server-defined namespaces.
Registry objects, item objects, weak cells, and tables were reconstructed test inputs.

| Construction checks | Passing cases |
| --- | --- |
| Every legacy block-ID bit pattern, with count one | 65,536 |
| Captured internal IDs across sixteen count boundaries | 41,936 |
| Typed user data, auxiliary boundaries, empty and missing items | 624 |
| Replacement of an existing stack through the full setter | 336 |

**ID conversion:** A legacy block ID below 256 supplies the same internal item ID.
Otherwise, the constructor uses `255 - legacyId`, then interprets the low sixteen bits as a signed internal ID.
These IDs differ from Bedrock network item IDs.
An unresolved nonzero ID clears the count and raw auxiliary value.
ID zero follows a separate valid-empty path and can retain a nonzero count without an item reference.

**Counts:** The constructor clamps a nonpositive signed 32-bit count to zero, then stores the low byte.
A positive count of 256 therefore becomes zero.
A resulting zero count triggers native invalidation before the constructor copies optional user data.
The probes cover signed limits, byte boundaries, and larger positive counts.
They do not establish these rules for every network descriptor constructor.

**Data and ownership:** The block constructor initializes raw auxiliary bits to zero and retains the supplied block definition for a nonempty result.
Optional user data becomes a separate native compound, even when the resulting stack has zero count.
Tests cover all eleven tag types, empty compounds, absent compounds, and preservation of the original data.
The replacement setter constructs a temporary stack, replaces the existing stack, and destroys the temporary stack.
Tested item and context reference counts return to their starting values after destruction.

**Boundaries:** Numeric and canonical name tables use the captured inventory.
Alias tables remain empty test inputs; this does not verify the live alias registry or its construction.
The final admission check uses a supplied context with its feature gate disabled.
TLS initialization, allocation, CRT operations, and clock values remain supplied.
Fixtures do not contain nested charged items or fully initialized item-component objects.
Executable bytes, emulation programs, and reference outputs remain private.

**Incomplete:** Production still uses Java hand-item classification and decoded wire snapshots.
Complete network-descriptor construction, live alias and restriction resolution, component lifecycle, and renderer lifetime remain incomplete or unverified.
These constructor checks do not establish complete visible timing or first-person parity.


## Resource conversion: shared Java parent models

**Implemented:** Core exports each compiled entity or attachable geometry once as a content-addressed Java parent model.
Texture variants retain separate sprite bindings, model selectors, scale metadata, and display transforms.
The standard Java format serves direct connections and ViaProxy.

**Measured:** The existing five-pack CubeCraft fixture targets Bedrock 1.26.51.1, build 51061372, and protocol 2193.
Java 25 uses four processors and a 2 GiB heap on Linux.
All 15,823 original entries remain, with 786 shared parents.
Resolving the parents preserves all 12,789 changed model variants.
Model JSON falls from 87.5 MB to 15.9 MB, and the archive falls from 91.8 MB to 78.2 MB.

Eight conversions exclude two warm-ups.
Entity model CPU falls from 712 ms to 167 ms, and allocation falls from 1136 MiB to 350 MiB.
Median rewrite plus ZIP time falls from 1739 ms to 1632 ms, about 6 percent.
A separate Java 26.3 parsing benchmark falls from 1274 ms to 254 ms, with about 84 percent fewer allocated bytes.
It excludes model baking, texture stitching, full reloads, and joining times.

**Verified:** The actual Java 26.3 parser and resolver preserve geometry, textures, lighting, ambient occlusion, and display transforms for every changed child.
Core tests cover shared and distinct parents, concurrent variants, source immutability, selectors, scale metadata, and attachable transforms.
The full stack build passes 1014 Java tests, with no failures or errors and 115 optional skips.
See the [parent model notes](../patches/viabedrock/upstreamable/0066-export-empty-item-models.pr.md#export-shared-geometry-as-java-parents).

**Remaining:** macOS, Windows, concurrent conversions, larger stacks, full reload timing, and end-to-end joining gains remain unverified.
These improvements do not prevent every timeout. Transport liveness remains necessary while acquisition or other phases wait.


**Runtime evidence:** Fresh disk-cache replays pass complete transport and rendering checks through direct connections and ViaProxy.
Both routes preserve the complete recorded scene hash and all 216 skin updates.
Both converted archives load without unresolved model or block errors.
ViaProxy exports 16,383 and 16,741 entries, with 782 shared parents in each archive.
The direct route also loads both newly converted archives.
These checks establish conversion and loading regressions. They do not establish complete native visual parity or faster end-to-end joins.


## Native player blocking query

**Implemented:** Player animation graphs read `query.blocking` from the core actor `BLOCKING` flag (72).
A missing actor snapshot retains Java's existing blocking result.
Core already transports the complete flag set through direct connections and ViaProxy.
The add-on only binds that state to the rendering query.

**Native evidence:** The matching Bedrock 1.26.51.1 build 51061372 callback reads flag 72 directly.
It does not reject `TRANSITION_BLOCKING` or substitute the successful-block flags.
An instruction probe covers 64 combinations of actor presence and flags 72, 73, 74, 75, and 41.
The probe supplies the flag getter and compares the callback's canonical Boolean return values.
It does not emulate the complete actor component system.

**Verified:** Unit tests cover native-state precedence, actor replacement, stale removal, matching removal, and registry cleanup.
The private unit fixture matches all 64 instruction results.
The dependency build and complete add-on suite pass 1,016 Java tests, with 115 optional skips and no failures or errors.
All 23 add-on patches replay successfully.

**Runtime evidence:** Direct and ViaProxy clients match all 64 cases through the actual player animation query method.
The private probe supplies actor snapshots, including absent actors, while Java's blocking result remains false.
It restores the registry after the probe.
Both routes also pass the existing 900 native hand-height cases and four Java fallback cases.
Selected hand models, layered poses, retained item queries, and scope restoration retain their existing results.
Both clients reach playable spawn, load the converted packs, and preserve the complete recorded 75-second scene prefix.

The generic third-person audit reports no local avatar submission because the fixture defines only first-person controllers.
The direct CLI reports that audit failure.
The ViaProxy CLI retains the audit report with its transport-only option.
The separate hand probes establish the query binding and hand regressions, not final shield pixels or complete network flag lifecycle behavior.

**Remaining:** Item replacement rules, held-item transforms, complete network timing, and visible shield parity remain incomplete or unverified.
The following section records the implemented timers and shield bob query.


## Native shield blocking timeline

**Implemented:** Core retains blocking-start, successful-block, and damaged-block timestamps for each native player lifetime.
The local-player timer records a rising transition flag while blocking remains active.
The other timers require blocking without a transition and record rising successful-block or damaged-block flags.
All three updates preserve their previous flags outside their guards.
Actor replacement, removal, runtime identity reuse, and registry cleanup release the relevant timer state.

The add-on advances the core registry once per active Minecraft simulation tick.
Player animation graphs read `query.shield_blocking_bob` through the shared actor query method.
The existing native flag transport supplies inputs through direct connections and ViaProxy.
The production asset loader does not require a local Bedrock installation for this feature.

**Native evidence:** The matching Bedrock 1.26.51.1 executable, build 51061372, supplies both timestamp updates and the query callback.
The callback requires blocking and a positive blocking-start timestamp.
It computes elapsed time from the damaged-block timestamp, not the blocking-start timestamp.
It preserves unsigned subtraction, float conversion, frame interpolation, clamping, and NaN propagation.
The [official Molang reference](https://mojang.github.io/bedrock-samples/Molang.html) describes shield movement after a hit.

Native instruction execution supplies 120 blocking-start cases, 1,728 block/damage cases, and 2,700 shield bob cases.
These fixtures cover rising edges, rejected guards, retained flags, unsigned wrap, and exceptional float values.
The probes supply flag and level-tick getters rather than emulate the complete actor component system.
A private native capture confirms the local blocking-start write and reset.
Its wire trace also confirms that flags 72 and 73 reach the connection.

**Runtime evidence:** Direct and ViaProxy clients each match all 2,700 bob results through the actual player animation query method.
Each private probe supplies snapshots and timestamps, then restores the registry.
Both clients also observe exactly one registry increment for each of 20 active Minecraft ticks.
The existing 64 blocking-query cases, 900 hand-height cases, and four fallback cases still pass on each route.
Selected hand models, layered poses, retained item queries, and scope restoration retain their existing results.

Both routes reach playable spawn, load the converted packs, and preserve the complete recorded 75-second scene prefix.
The generic third-person audit still reports no avatar submission for this fixture's first-person-only controllers.
Both CLI runs retain that report through the transport-only option.
The clients log unavailable built-in assets without an account, but their accepted server graphs load and the probes complete.

**Validation:** The dependency build and final Java suites pass 1,019 tests, with 115 optional skips and no failures or errors.
The final core suite includes the complete native timestamp and bob fixture.
The final add-on suite includes the 64-case native blocking fixture.
The full stacks replay all 90 core patches and 23 add-on patches.

**Remaining:** Supplied snapshots and clocks do not establish complete network timing, client prediction, remote-player lifecycle, or pause behavior.
The shield item classifier still uses Java replacement rules.
Held-item transforms and final shield pixels need native comparisons.
This implementation closes the timer arithmetic and query binding gaps, not complete shield or first-person parity.
Executable exports, instruction fixtures, memory probes, captures, and runtime diagnostics remain private.


## Native hand height and retained-item lifecycle

**Implemented:** Core supplies the native equip-height update and retained-item copy decision for each hand.
The update targets zero for animated replacement and one for retain or immediate update.
It advances each height by at most 0.4 and preserves the previous height for interpolation.
Immediate updates copy regardless of height.
Other classifications copy at height 0.1 inclusively, with the native unordered-float behavior.

The add-on uses that update only when the local skin texture matches a loaded native appearance graph.
It copies retained stacks after the height update and keeps them independent from equipped stacks.
The native path omits Java's hands-busy branch and attack-delay multiplier.
Missing, pending, failed, and mismatched appearances retain the complete Java tick.
The obsolete cooldown-only mixin and scale helper are removed.

**Native evidence:** Bedrock 1.26.51.1 build 51061372 supplies the target hand-update instructions.
An instruction probe covers 2,304 combinations of heights and independent hand classifications.
Its values include signed zero, negative heights, out-of-range heights, NaN, and infinities.
Another 24 cases cover the exact copy threshold, adjacent float values, and immediate updates.
The probe observes and skips native stack-copy calls, rather than emulate their contents.
The target update contains no Java hands-busy or attack-delay branch.

**Verified:** Core tests cover update sequences, retained interpolation values, inclusive copy boundaries, and exceptional float inputs.
The private instruction fixture matches all 2,304 update cases and 24 threshold cases.
Direct and ViaProxy runtime checks each match 4,608 cases through Minecraft's actual hand tick, with busy hands enabled and disabled.
Those checks compare retained stack contents, copy decisions, and independence from equipped stacks.
They also preserve all four Java fallback modes while hands are busy.

Both routes retain the 900 height cases, 64 blocking cases, 2,700 shield bob cases, and existing hand rendering checks.
Both reach playable spawn, load the converted packs, and preserve the complete recorded 75-second scene prefix.
The generic third-person audit still reports no local avatar submission for the fixture's first-person-only controllers.
Both CLI runs retain that report through the transport-only option.
Unavailable built-in assets produce account warnings without preventing the accepted server graphs or hand checks from completing.

**Validation:** The dependency builds and final Java suites pass 1,022 tests, with 115 optional skips and no failures or errors.
The private native hand-update, shield timeline, and blocking fixtures are enabled in the final suites.
The full stacks replay all 90 core patches and 23 add-on patches.

**Remaining:** Item classification still uses Java comparison rules to select retain, update, or animate.
Item-specific classifiers, the selected-slot cache, and complete item-use timing need implementation and verification.
The following section records original Bedrock comparison data transport.
Matching height and copy decisions does not establish final held-item drawing or visible swap parity.
Reference inputs, executable exports, and runtime probes remain private.


## Original Bedrock item comparison data

**Implemented:** Core captures an immutable snapshot of each decoded item before Java mapping and NBT rewriting.
Standard Java custom data carries the snapshot in the `viabedrock:item_stack` compound with schema version two.
Its fields retain the native item ID, auxiliary value, block runtime ID, shield blocking ticks, restriction lists, and typed user data.
Restriction lists preserve order and duplicates.
Absent user data remains distinct from an empty compound.

Declared types for empty user-data lists travel as segmented paths and type IDs beside that compound.
Restoration validates literal compound keys, canonical list indices, target emptiness, registered type IDs, and duplicate paths.
It restores an independent copy without changing Java's NBT format or the transported input.

Count remains the current Java stack count.
Inventory network IDs remain in the authoritative inventory tracker.
The snapshot describes decoded values, including normalization from the existing Bedrock codec.
It does not preserve raw packet bytes or authorize inventory requests.
Unknown snapshot versions, incorrect scalar widths, and malformed lists return no comparison context.

The snapshot owns its lists and user data independently from source items, encoded compounds, and accessor results.
The existing inventory path carries the data through direct connections and ViaProxy.
The production implementation requires no local Bedrock installation.

The add-on excludes the snapshot from its temporary Java fallback comparison views.
It also normalizes empty custom data in those views while preserving every remaining field and component.
A context-only change refreshes the retained stack immediately without an additional swap animation.
The incoming and retained stacks keep their complete data.
Native identifiers, compiled animation fields, and unrelated custom data still affect fallback comparisons.

**Native evidence:** The matching 1.26.51.1 executable, build 51061372, reads these inputs in its retained-hand classifiers.
The [classifier research](#native-item-classification-research) records dispatch, comparison branches, restriction hashes, and remaining construction gaps.
This transport supplies the original decoded inputs for those classifiers.
It does not implement their native selection rules.

**Verified:** Six core tests cover typed NBT round trips, independent ownership, absent compounds, unsupported versions, wrong widths, and malformed restrictions.
They also cover empty list declarations at nested positions and malformed restoration metadata.

An independent byte fixture confirms type loss through ViaNBT serialization and the actual Minecraft 26.3 `NbtIo` codec.
Instruction probes execute 504 native NBT comparison cases in the matching target binary.
Lists compare their declared types even when empty.
Float and double equality equate signed zero and reject NaNs, including shared references.
Compound, string, and array instruction cases remain unverified in this probe.

Direct and ViaProxy clients each receive nine additional authored inventory packets through the production decoder and translator.
The resulting Minecraft stacks preserve nested compounds, every numeric NBT width, arrays, lists, counts, auxiliary data, and a valid block runtime ID.
The cases also preserve ordered duplicate restrictions, signed shield timestamp bits, and Long versus Int map identifiers.
Each client accepts the transported context through the core parser.
Each route restores four typed empty lists and preserves one untyped empty list.
These cases include nested compound keys and lists inside another list.

The private harness supplies these additional packets after the recorder and before production decoding.
It saves their bytes and independently authored expected fields separately from the recorded native scene.
Both routes preserve the complete recorded 75-second scene prefix.
That prefix check does not establish native origin or native behavior for the additional inputs.

Each route passes 32 metadata-refresh checks through Minecraft's actual hand tick.
These checks cover both hands, busy and available hands, two initial heights, absent or empty custom data, and existing metadata.
Four additional checks preserve Java's comparison behavior for changed identifiers and unrelated custom data.
Both routes retain the existing height, copy-boundary, blocking, shield bob, clock, and hand rendering results.

Both clients reach playable spawn and load the accepted server graphs.
The generic third-person audit still reports no avatar submission for this fixture's first-person-only controllers.
The transport-only option retains that report.
Unavailable built-in assets produce account warnings without preventing the server graphs or hand checks from completing.

**Validation:** Dependency builds and final Java suites pass 1,031 tests, with 115 optional skips and no failures or errors.
The final suites enable the private native hand-update, shield timeline, and blocking fixtures.
The full stacks replay all 90 core patches and 23 add-on patches.

**Remaining:** Native item-specific classification, restriction hashing, derived auxiliary data, nested charged items, and selected-slot timing remain incomplete or unverified.
Complete item-use timing and final held-item pixels still require native comparisons.
The extra snapshot's memory, bandwidth, and conversion costs remain unmeasured.
Private fixtures, packet bytes, and diagnostics remain outside the repository.


## Resource conversion: parallel embedded libraries

**Implemented:** Core reuses its bounded ZIP writer for large native sound, caption, particle, and actor libraries.
Library headers remain first, and layer order, empty layers, resource limits, and decoder formats remain compatible.
Shared language tables now parse atomically during simultaneous cold pack preparation.
The previous cache can throw `ConcurrentModificationException` when connections load definitions concurrently.

**Measured:** The five-pack CubeCraft fixture includes 42 licensed image layers from Bedrock 1.26.51.1.
Java 25 uses four available processors and a 2 GiB heap on Linux.
Eight conversions exclude two warm-ups.
Median rewrite plus memory ZIP packaging decreases from 1584 ms to 1177 ms, about 26 percent.
Two simultaneous conversions improve from 1924 ms to 1473 ms per pair, about 23 percent.

**Verified:** Decoded libraries preserve every resource and entry order.
The complete output retains 15,823 original entries and 786 shared parents with equivalent resolved Java models.
Targeted tests cover header placement, large archive decoding, empty layers, determinism, and concurrent language lookup.
All four projects build with 1,026 passing Java tests, no failures or errors, and 118 optional skips.
See the [library compression notes](../patches/viabedrock/upstreamable/0015-scale-play-sound-coordinates.pr.md#compress-entries-within-large-native-libraries).

**Remaining:** Larger stacks, macOS, Windows, full reloads, and complete joining-time measurements remain unverified.
Each large library uses at most four workers and temporary compressed storage.
These phase improvements do not prevent every timeout; transport liveness remains necessary during acquisition and other waits.


**Runtime evidence:** Fresh disk-cache replays pass complete transport and rendering checks through direct and ViaProxy connections.
Both routes load two newly converted packs and preserve the complete recorded scene hash and all 216 skin updates.
No unresolved model or block errors occur.
These checks establish loading regressions, not complete native visual parity or faster joining.

## Resource conversion: segmented buffers and actor archive streaming

**Implemented:** Core uses segmented Commons IO buffers for memory ZIP output and embedded native libraries.
Actor encoding writes its ZIP directly after the provenance header, without an intermediate complete archive.
Each encoder owns its buffer. Compression workers retain their separate backing stores.
Disk-cache output still streams directly to its temporary file.
The [Commons IO API](https://commons.apache.org/proper/commons-io/apidocs/org/apache/commons/io/output/UnsynchronizedByteArrayOutputStream.html) describes the buffer and independent result bytes.

The existing CubeCraft fixture contains five server packs and 42 licensed image layers from Bedrock 1.26.51.1.
Java 25 uses four available processors and a 2 GiB heap on Linux.
Eight conversions exclude two warm-ups in separate baseline and candidate processes.

| Measured stage | Baseline | Candidate |
| --- | --- | --- |
| Actor encoder allocation on its calling thread | 315.2 MiB | 209.7 MiB |
| Actor encoder CPU on its calling thread | 103.6 ms | 83.1 ms |
| Memory ZIP allocation on its calling thread | 449.8 MiB | 308.7 MiB |
| Rewrite plus memory ZIP median | 1145 ms | 1102 ms |

Actor allocation decreases by about 33 percent, and memory packaging allocation decreases by about 31 percent.
The measured conversion time decreases by about 4 percent. This small timing difference needs broader measurements.
Allocation totals exclude compression worker threads and do not measure peak heap usage.
The disk-cache writer already avoids the outer memory ZIP buffer, so its gains differ.

Eight trials with two simultaneous conversions exclude two warm-ups.
Median pair completion is 1436 ms for the baseline and 1413 ms for the candidate.
This small timing difference does not establish a general concurrent speedup.

All four embedded libraries remain byte-identical, including the actor header and provenance bytes.
All 15,823 original entries and 786 shared parents remain equivalent after the existing model and JSON normalization.
Both complete outputs occupy about 78.2 MB.
No decoder format or cache fingerprint changes.

Targeted tests cover memory versus streamed output across buffer growth and large actor archives with provenance and texture overrides.
Existing tests retain archive limits, deterministic output, interruption, worker cleanup, output errors, and cache retries.
Both owning patches pass their targeted suites and Checkstyle tasks before the remaining stack applies.
The cache patch applies independently to the pinned upstream base, and the full stack replays and builds.
The full suites report 1,033 passing Java tests, no failures or errors, and 115 optional skips.

These measurements exclude acquisition, downloads, prompts, client reloads, and complete joining times.
Larger concurrent stacks, macOS, and Windows remain unverified for this change.
Transport liveness remains necessary during acquisition and other waits.

Fresh disk-cache replays pass complete transport and rendering checks on direct and ViaProxy connections.
Both routes load two newly converted packs and preserve the complete recorded scene hash.
All 216 recorded skin updates remain unchanged, with no unresolved model or block errors.
These checks establish loading and rendering regressions, not complete native visual parity or faster joining.


## Resource conversion: one shared native archive

**Implemented:** Core emits one native archive for actors, sounds, captions, and particles.
The actor archive already contains every resource from the three former effect archives.
Removing those overlapping archives avoids duplicate compression, packaging, transfer, and resource decoding.
All ordinary Java models, textures, and converter metadata remain in the outer pack.

Core supplies the same bounded resource selection to local consumers without archive compression.
Its effect view preserves the previous resource admission rules and every resolved layer index, including empty layers.
PNG/TGA overlays still replace lower textures without requiring licensed definitions during conversion.
Actor-only definitions and JPEG textures remain outside that effect view.

The add-on shares decoded layers between actor and effect consumers for the current resource generation.
It reads only the highest accepted server archive and ignores local packs with the same identifier.
Reload and disconnect clear the shared cache.
A different resource manager replaces it automatically.
Derived effect libraries also refresh after actor-cache invalidation.
Decode errors remain cached until invalidation, then the loader retries.

The archive decoder, protocol, resource bounds, and provenance bytes retain their formats.
Cache resource format 5 rebuilds previous disk conversions.
New converted packs require the matching add-on because their separate effect archives no longer exist.
Reading accepted assets requires no Microsoft Store sign-in or direct Bedrock connection.

**Measured:** The private fixture contains five CubeCraft server packs and 42 licensed image layers from Bedrock 1.26.51.1.
Java 25 uses four processors and a 2 GiB heap on Linux.
Eight conversions exclude two warm-ups in separate baseline and candidate processes.
The complete converted pack decreases from 78.2 MB to 49.5 MB, about 37 percent.
The small conversion timing change does not establish a general CPU speedup.

| Measured stage | Baseline | Shared archive |
| --- | --- | --- |
| Rewrite plus memory ZIP median | 1116 ms | 1072 ms |
| Memory ZIP allocation on its calling thread | 308.0 MiB | 217.1 MiB |
| Two simultaneous conversions per pair | 1393 ms | 1283 ms |

The memory ZIP writer allocates about 30 percent fewer bytes on its calling thread.
The pair measurement uses eight trials and excludes two warm-ups, with about 8 percent lower median completion time.
Allocation totals exclude compression workers and do not measure peak heap usage.
Disk-cache output already streams to a file, so its allocation gains differ.


**Verified:** Every former sound, caption, and particle archive entry matches the shared archive at the same layer index.
Their headers retain the same layer counts and target protocol.
Tests cover effect admission, empty layers, texture overlays, locale fallback, shared decoding, reload, resource-manager replacement, and decode-error retry.
Existing archive tests retain malformed metadata, traversal, deterministic output, and defensive reconstruction.
Archive bounds and duplicate checks remain unchanged.
The complete stacks replay and all four projects build.
The final suites pass 1,033 Java tests, with 115 optional skips and no failures or errors.

**Remaining:** Complete joining times, larger stacks, macOS, and Windows require further measurements.
The stored-archive optimization below removes the repeated outer compression pass.
Transport liveness remains necessary during acquisition, prompts, downloads, and client reloads.
This change does not establish final native pixels or prevent every timeout.


Fresh disk-cache replays pass complete transport and rendering checks on direct and ViaProxy connections with the final artifacts.
Both routes load two newly converted packs and preserve the complete recorded scene and all 216 skin updates.
Neither route reports unresolved model, block, or accepted-archive decode errors.
The reload regression test also verifies refreshed effect bytes after actor-cache invalidation and resource-manager replacement.
These checks establish loading regressions, not complete native visual parity or faster joining.


## Store the embedded native archive without another deflation pass

**Implemented:** The native archive already contains compressed entries.
Core now stores its complete payload in the outer ZIP without another deflation pass.
Ordinary Java models, JSON, textures, and metadata retain their existing compression.
The native archive bytes, header, provenance, resource bounds, and decoder remain unchanged.
Older cached conversions remain valid.

Content preserves the stored-entry choice across merges and copied paths.
An ordinary replacement restores deflation, while a failed replacement retains the previous choice.
Content subclasses implement `putBytes` instead of overriding `put`, so one write path maintains this metadata.
Sequential output supplies the stored entry's size and CRC.
Parallel output uses the same ZIP method with the existing worker limits and cleanup.

**Measured:** The private fixture contains five CubeCraft packs and 42 licensed image layers from Bedrock 1.26.51.1.
Separate production JVMs use Java 25, four processors, and a 2 GiB heap on Linux.
Eight conversions exclude two warm-ups.

| Measured stage | Baseline | Stored native archive |
| --- | --- | --- |
| Rewrite plus memory ZIP median | 1099 ms | 595 ms |
| Outer ZIP median | 727 ms | 189 ms |
| Complete pack size | 49.5 MB | 53.7 MB |

Conversion and packaging take about 46 percent less time on this fixture.
The outer ZIP stage takes about 74 percent less time.
Output grows about 8.5 percent because outer deflation previously compressed some repeated bytes inside the native archive.
Memory output also allocates a slightly larger final buffer.
Calling-thread allocation increases from 231.7 MiB to 235.9 MiB and excludes compression workers.

This tradeoff can offset the conversion gain on slower network links.
These measurements exclude acquisition, prompts, downloads, client reloads, and complete joining times.
Larger stacks, concurrent conversions, macOS, and Windows remain unmeasured for this change.
Transport liveness remains necessary during those waits.

**Verified:** The production output preserves the native archive byte for byte.
All 15,820 retained entries and 786 shared model parents remain equivalent after existing model-identity and JSON-order normalization.
Tests cover stored and deflated entries, CRCs, sizes, worker-count determinism, merging, ordinary replacement, and failed replacement.
Existing cleanup, interruption, output ownership, and cache retry tests still pass.
The cache patch applies independently to its pinned upstream base and passes its tests and both Checkstyle tasks.
All four projects build, with 1,036 passing Java tests, 115 optional skips, and no failures or errors.


Fresh disk-cache replays pass complete transport and rendering checks on direct and ViaProxy connections.
Both routes load two new conversions with stored native archive entries.
The complete recorded scene hash remains unchanged, and all 216 skin updates retain their recorded bytes.
Neither route reports unresolved model, block, or accepted-archive decode errors.
These checks establish loading regressions, not complete native visual parity or faster joining.


### Invisible particle carriers and opaque descendants

**Evidence:** The October 5 CubeCraft capture uses Bedrock protocol 2193 and five accepted server packs.
Its zombie-hands graph includes an invisible opaque carrier, a dirt effect, and a visible opaque rubble effect.
The carrier declares a zero-size billboard, an unused texture path, block expiration, and a child event at 0.13 seconds.
The previous loader rejected its texture path before admitting the graph.
Fixing that admission exposed the visible rubble material as a separate failure in the same chain.

The matching licensed Bedrock 1.26.5101.0 package defines opaque particles without alpha testing or blending.
Opaque and alpha-test materials retain culling and depth writes, and disable alpha writes.
The target Particle AlphaTest fragment tests texture alpha against 0.5 before applying vertex color.
Its comparison and output instructions confirm that tint alpha does not change the cutoff.
The existing native billboard fixture confirms size clamping, including zero and negative dimensions.
Licensed assets, executable bytes, shader disassembly, captures, and probe outputs remain private.

**Implemented:** The add-on separates emitter simulation from optional GPU resources.
A constant nonpositive billboard dimension proves that its area remains zero after clamping.
Those particles retain scripts, motion, block expiration, counts, timelines, and child dispatch without decoding or allocating a texture.
Per-render scripts and other visual expressions still run.
Dynamic sizes still require render resources, even when their initial value is zero.
Path validation remains active for unused textures.

Visible opaque particles use a separate render pipeline with culling, depth writes, and RGB-only writes.
They do not apply Java's particle alpha cutoff.
Alpha-test particles use the target texture-only cutoff of 0.5.
Both pipelines preload with the client's required pipelines.
The core's existing shared archive transports these definitions and textures through direct connections and ViaProxy.
No server-specific identifiers or fallback textures enter production code.

**Verified tests:** Synthetic tests exercise the production texture-loading decision, per-render script effects, child-event boundaries, and block expiration.
They also cover dynamic-size admission and invalid paths.
The targeted suite passes all nine tests with the private native motion and billboard fixtures enabled.
Those fixtures contain 200 motion cases and 492 billboard cases.
All four projects build, with 1,040 passing Java tests, 118 optional skips, and no failures or errors.

A private GPU probe compiles the production fragment shader with the matching Java includes.
All 120 cases pass on the NVIDIA GPU.
Cases cover texture alpha around 0.5, independent tint and modulator alpha, winding, and destination-alpha preservation.
The probe supplies vertex inputs, fog values, and raster state.
It verifies shader output against the inspected alpha-test instructions and declared opaque material state, without establishing complete native image parity.

**Verified runtime:** Complete direct and ViaProxy replays preserve the captured scene hash `925a9e0873059dee3a1556f3ccf3e5bf4ac951a79a0d447171c51fd9b648e5b3`.
Both pass transport and rendering checks and retain all 154 recorded skin updates unchanged.
Both load all four zombie-hands definitions and admit the carrier without GPU resources.
Their emitter chains reach depth three and create six rubble particles.
Neither reports particle loading or initialization errors.
A private observer reads existing emitter and asset state without sampling visuals or advancing scripts.
ViaProxy's live opaque and alpha pipelines confirm culling, depth writes, disabled blending, and disabled alpha writes.
These checks establish graph loading and lifecycle behavior, without proving complete native draw timing or visible parity.

**Remaining:** Additive visible parity, other material families, missing textures on visible effects, complete fog, and lighting still need implementation or native comparisons.
Native opaque shader selection, complete effect timing, actor-event behavior, and visible parity remain unverified.
All other skin, account, inventory, gameplay, protocol, UI, and platform requirements remain active.


### Authored custom particle directions

**Evidence:** The next live CubeCraft capture exposed a witch arrow-trail definition with `direction.mode` set to `custom`.
The add-on rejected it before loading the texture or creating particles.
The target 1.26.51 schema lists `derive_from_velocity` and `custom` as the direction modes.
The matching 1.26.51.1 executable reader compares the six-character `custom` value before reading its `custom_direction` vector.
The vector field keeps its existing name.
The older [public billboard reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponents/minecraftparticle_appearance_billboard?view=minecraft-bedrock-stable) uses `custom_direction` for both names.
That reference does not describe the target reader accurately.

**Implemented:** The add-on decodes the target mode name and retains the existing component and render stages.
Custom vector expressions run in order on each visual sample.
The component retains their raw magnitude, and the render stage normalizes the transformed direction.
The core's existing archive and request channels carry this behavior through direct connections and ViaProxy.
Production contains no server-specific identifiers or alternate spelling shim.

**Verified tests:** A synthetic test covers repeated expressions, ordered variable writes, raw magnitude, and age-dependent direction changes during emitter playback.
An existing locator test now uses the target mode name.
The full build passes 1,041 Java tests with 118 optional skips and no failures or errors.
The targeted effect and facing suites pass all 16 tests with private native references enabled.
These include 200 motion, 492 billboard, 286 facing, 32 emitter-plane, 144 direction-normalization, and 440 spin cases.
The fixtures verify sampled calculations, without establishing complete native visible parity.


**Verified runtime:** Complete direct and ViaProxy replays preserve the fresh CubeCraft scene hash `ede0e43b2874418cbb6b62135898efe0553009307d33fecd0f258383643d5d83`.
Both pass transport and rendering checks and retain all 311 recorded skin updates unchanged.
Both load the witch burst and silhouette definitions with render resources.
The burst creates eight particles with both authored directions, and the steady silhouette reaches seven particles.
Neither reports particle loading or initialization errors.
A private observer reads raw direction and population fields without sampling visuals or advancing scripts.
These checks verify graph loading and simulation, without proving native visible orientation, timing, or blending.

**Remaining:** The direction reader behavior is verified below. Other component defaults, interpolation, and visible native comparisons remain open.
Additive visible comparisons, complete fog, lighting, and the other coverage requirements remain active.

The additive investigation identifies separate alpha-factor inheritance in the target material parser.
Omitted alpha factors inherit color factors only when the corresponding color factor is explicitly supplied.
Explicit alpha factors take precedence, while absent color factors preserve existing values.
A private executable probe passes 192 presence, override, inheritance, and write-mask cases.
Its factor reader supplies declared bytes and presence flags.
Native field selection, inheritance, and write-mask calculations execute unchanged.
Constructor defaults, factor-name decoding, material inheritance, and final GPU state remain outside that probe.
This evidence supports the material implementation below and does not establish additive rendering parity.


## Translucent and additive particle materials

**Evidence:** The matching licensed `particles.material` disables culling and depth writes for `particles_blend`.
The native material constructor initializes color factors to `SourceAlpha` and `OneMinusSrcAlpha`.
Its alpha factors are `One` and `OneMinusSrcAlpha`.
A private executable probe verifies those fields and the initializer's nine factor names and codes.
This probe supplies allocation and map insertion, while native field and string construction execute unchanged.
The earlier 192-case parser probe verifies explicit factor inheritance and overrides.

`particles_add` inherits the translucent state and explicitly selects `SourceAlpha` and `One` for color.
The parser copies those factors into omitted alpha factors.
The matching Particle Transparent SM60 fragment retains the texture/tint alpha product without an alpha cutoff.
It interpolates RGB fog twice with the same parameters.
Material inheritance, RenderDragon selection, and final native GPU output remain outside these executable probes.

**Implemented:** Visible additive effects now load through the existing particle asset path.
Both translucent materials use native forward blend factors, two-sided rendering, and disabled depth writes.
The fragment preserves low-alpha pixels and evaluates both fog interpolations before transparency accumulation.

Separate Java depth-bounds, transmittance, and accumulation pipelines retain the renderer's stage targets and bindings.
Additive particles contribute color without reducing transmittance or recording opaque depth bounds.
The depth-bounds stage preserves particles below Java's usual alpha cutoff.
Opaque and alpha-test particles retain their existing state and fragment behavior.

**Verified tests:** Two targeted tests verify forward blend factors, culling, depth writes, stage bindings, target states, and pipeline registration.
All four projects build with 1,043 passing Java tests, 118 optional skips, and no failures or errors.
A private NVIDIA GPU probe passes 1,440 pixel cases using the production fragment and matching Java includes.
Cases cover both materials, low alpha, independent tint and modulator alpha, both face directions, and fog interpolation.
They also exercise each transparency stage, including additive transmittance exclusion and non-occluding depth bounds.

The probe supplies raster state and zero scene absorption.
These checks verify isolated formulas and integration contracts, without establishing complete native image parity.


**Verified runtime:** Complete direct and ViaProxy replays preserve the CubeCraft scene hash `ede0e43b2874418cbb6b62135898efe0553009307d33fecd0f258383643d5d83`.
Both retain all 311 recorded skin updates and pass transport and rendering checks.
A private fixture loads two authored effects through the production resource library and playback path.
Both effects allocate render resources, create particles, and complete draw calls in forward rendering and all three improved-transparency stages.
The fixture switches renderer modes during each replay and retries after the initial world transition.
These checks establish packaged integration through both connection routes, without proving complete native pixel or timing parity.

**Remaining:** Native fog parameter mapping, cross-texture ordering, overlapping transparency, material selection, lighting, and other material families remain unverified or incomplete.
The other protocol, inventory, gameplay, UI, skin, account, and platform requirements remain active.


## Particle direction reader defaults and recovery

**Evidence:** A private probe executes the matching 1.26.51.1 JSON reader, billboard constructor, component reader, and billboard sampler.
The constructor stores a squared speed threshold of `0.01` directly.
An absent direction section preserves that field.
An explicit empty or null section selects derived direction with a zero threshold.
An explicit numeric threshold converts to float before squaring, including negative values and large values that overflow to infinity.

The component reader retains its component after direction errors.
A non-object section or missing custom vector stops the reader before UV parsing.
Unknown mode strings retain the constructor direction state and continue UV parsing.
Non-string modes use derived direction, while inactive custom-vector fields remain unread.

Malformed custom vectors select custom mode with a zero vector and continue UV parsing.
A malformed axis becomes zero independently, and valid neighboring axes survive.
Direction numeric readers accept booleans as zero or one.

The probe covers 38 declarations and 190 samples through the loaded native component.
Cases include absent and null sections, malformed vectors, ignored fields, mode selection, numeric conversion, float boundaries, and preserved UV defaults.
It supplies private allocation, exact CRT byte operations, decimal conversion, empty diagnostic scopes, and age/lifetime variable lookup.
Native JSON dispatch, field reads, float squaring, component control flow, and billboard calculations execute unchanged.
Native logging messages remain private.

**Implemented:** The production reader preserves these direction defaults and recovery paths.
It reads direction before UV settings and keeps valid effects loaded after the verified declaration errors.
It reports warnings once through the existing cached asset-loading path.
Custom expressions still run in order through the existing bounded Molang parser.
No alternative mode spelling or server-specific branch is added.

**Verified tests:** Three targeted tests cover speed boundaries, inactive fields, per-axis recovery, UV read order, and complete emitter initialization after errors.
A private-reference test compares all 38 native declarations and 190 loaded-component samples exactly.
The targeted effect and facing suites pass all 20 tests with private references enabled.
All four projects build with 1,046 passing Java tests, 119 optional skips, and no failures or errors.

**Verified runtime:** Complete direct and ViaProxy replays preserve the CubeCraft scene hash `ede0e43b2874418cbb6b62135898efe0553009307d33fecd0f258383643d5d83`.
Both retain all 311 skin updates and pass transport and rendering checks.
Six authored fixtures use the production resource library, asset loader, simulation, and visual extraction.
Both routes retain the expected thresholds, UV defaults, diagnostics, and sampled directions without loading or initialization errors.
The same runs complete forward rendering and all three improved-transparency stages for translucent and additive particles.
These checks establish packaged behavior and complete scene transport, without proving native image parity.

**Remaining:** The expression and numeric-axis behavior verified below closes part of this reader gap. Typed schema dispatch, other component errors, interpolation, and native visible comparisons remain unverified.
The other material, protocol, inventory, gameplay, UI, skin, account, and platform requirements remain active.


## Custom particle expression recovery

**Evidence:** The target 1.26.51.1 array reader independently processes each direction axis.
A rejected expression becomes zero, while valid neighboring axes and subsequent UV settings survive.
Numeric axes retain their converted float value, including overflow to infinity.

A private probe executes the native JSON reader, constructor, array reader, Molang parser, and billboard sampler.
Seven declarations produce 35 sampled results.
Numeric and addition controls evaluate to two and three.
Empty expressions produce zero.
Malformed controls include an unmatched parenthesis and a missing right operand.
Large numeric inputs cover finite values and float overflow.

The harness supplies allocation, exact CRT operations, decimal conversion, and successful single-thread lock operations.
Native thread-guard initialization executes unchanged.
The optional SDK observer is absent, while a non-mutating hook records diagnostic calls.
Frees and exit registrations remain supplied process boundaries.
Sampling supplies only particle age and lifetime lookup.

Return-expression evaluation is outside the completed probe.

**Implemented:** Custom direction axes now retain native numeric overflow.
A Molang syntax rejection replaces only its own axis with zero and reports a loading diagnostic.
Expression length, nesting, and node limits retain their existing rejection behavior.
The parser reports nesting limits separately from syntax errors so recovery cannot bypass those limits.
Other particle, actor, and animation fields retain their existing parsing behavior.

**Verified tests:** An emitter test verifies per-axis syntax recovery and normalized visual directions after loading.
A limit test verifies that long, deeply nested, and complex expressions still fail their existing gates.
A private-reference test matches all seven native declarations and 35 sampled directions and UV results.
The targeted suites pass 28 tests, with two unrelated private Molang references skipped.
All four projects build with 1,048 passing Java tests, 120 optional skips, and no failures or errors.

**Verified runtime:** Complete direct and ViaProxy replays preserve the CubeCraft scene hash `ede0e43b2874418cbb6b62135898efe0553009307d33fecd0f258383643d5d83`.
Both retain all 311 skin updates and pass transport and rendering checks.
Eight direction fixtures load through the production resource library, including both malformed-expression controls.
The malformed controls retain their UV settings, allocate rendering resources, create particles, and expose the expected recovered direction.
No particle loading, initialization, or observer errors occur.

Both runs also complete forward rendering and all three improved-transparency stages for translucent and additive particles.
These checks establish packaged behavior through both routes, without proving native visible image parity.

**Remaining:** Complete expression admission, lexer error recovery, SDK runtime context, typed schema dispatch, interpolation, and native visible comparisons remain unverified.
All other coverage requirements remain active.


## Molang statement admission and decimal fractions

**Evidence:** The matching 1.26.51.1 parser rejects expressions that start with a semicolon after whitespace.
Expressions containing assignment or statement-separator tokens must end with a semicolon.
Comparisons and punctuation inside single-quoted strings do not activate that requirement.
The native token table and parser branches identify assignment and separator tokens separately from comparisons.
The target also accepts decimal fractions such as `.5` and numeric suffixes such as `2F`.
The suffix case retains the existing normalization path; the new executable controls verify `.5`, `1.`, `2f`, and `2F`.

A private probe observes 41 native compilation results and 130 billboard samples for constant or rejected expressions.
It executes the native JSON reader, component reader, Molang compiler, parser, and applicable billboard calculations unchanged.
The harness supplies allocation, CRT operations, decimal conversion, single-thread locks, and an absent optional SDK observer.
PE virtual section tails contain zeros rather than unrelated file bytes.
A supplied service-availability marker satisfies the compiler's null assertion without replacing parsing or admission decisions.
Compiled statement evaluation and variable registration remain outside this completed probe.

**Implemented:** The shared client parser tracks tokens and enforces the verified statement boundaries before evaluation.
Unfinished assignments cannot alter runtime variables.
Leading decimal fractions now produce float expressions while property access retains its existing parsing path.
Custom particle direction axes use the existing syntax recovery path for rejected statement declarations.
Their neighboring axes, UV settings, and emitter resources survive.
Expression length, nesting, node, and execution limits remain enforced.

**Verified tests:** A targeted test verifies rejected statements, preserved variables, comparisons, quoted punctuation, and trailing whitespace.
Existing float tests now exercise leading fractions, negative fractions, and trailing decimal points.
The native-reference test matches all 41 compilation admission results.
Emitter tests retain valid particles after unfinished or leading-semicolon direction expressions.
All four projects build with 1,049 passing Java tests, 121 optional skips, and no failures or errors.
The selected Molang and effect suites pass 22 tests with four unrelated optional references skipped.

**Verified runtime:** Complete direct and ViaProxy replays preserve the CubeCraft scene hash `ede0e43b2874418cbb6b62135898efe0553009307d33fecd0f258383643d5d83`.
Both retain all 311 skin updates and pass transport and rendering checks.
Eleven authored direction fixtures use production resource loading, simulation, and visual extraction.
The new controls preserve malformed-statement recovery and expose the expected `.5` direction value.
Both routes also complete forward rendering and all three improved-transparency stages for translucent and additive particles.
No particle loading, initialization, or observer errors occur.
These checks verify packaged integration without establishing native image or timing parity.

**Remaining:** Complete lexical admission, complex-expression results, SDK runtime context, typed schema dispatch, interpolation, and native visible comparisons remain unverified or incomplete.
Core Molang processing still uses a separate parser and needs the same admission review.
All other coverage requirements remain active.


## Shared core Molang grammar and statement results

**Evidence:** The matching Bedrock 1.26.51.1 executable distinguishes simple expression values from complex statement results.
A trailing semicolon changes `2` from result `2` to result `0`.
Statement lists return zero unless execution reaches an explicit return.
The target admits `return 2` without a separator but produces zero, while `return 2;` produces two.
It rejects a direct return followed by another statement in the same scope.
Returns inside selected conditional blocks stop later statements.
Unselected blocks leave execution active.

A private probe executes 25 declarations and 125 billboard samples through the native JSON reader, compiler, VM, and component functions.
Its previous VM context points to a valid private arena through the target TLS field.
Allocation, CRT operations, decimal conversion, single-thread locks, diagnostics, and the compiler's service-availability marker remain supplied boundaries.
The optional SDK observer is absent.
Native parser decisions and VM instructions execute unchanged.
Variable symbol registration and complete live world context remain outside this probe.

**Implemented:** ViaBedrock core now owns the shared token parser and statement-result rules.
Core entity processing and add-on animation and particle programs use that parser.
The add-on also uses core evaluation for numeric and string consumers.
The duplicate client parser and core assignment text rewriting are removed.
Query bindings, actor variables, and execution limits remain with their consumers.
The false branch of a conditional preserves assignment boundaries instead of assigning through the whole conditional.

**Verified tests:** All four projects build with 1,052 passing Java tests, 122 optional skips, and no failures or errors.
Core Checkstyle also passes.
The selected core and add-on suites pass 30 tests, with five unrelated optional references skipped.
Core matches all 41 earlier admission cases and all 25 new constant-statement declarations.
The particle component test matches all 125 native direction and UV samples, including recovered rejected declarations.
Tests also preserve variable side effects, reader parsing, string returns, assignment boundaries, and client execution limits.


**Verified runtime:** Complete direct and ViaProxy replays preserve the CubeCraft scene hash `ede0e43b2874418cbb6b62135898efe0553009307d33fecd0f258383643d5d83`.
Both retain all 311 skin updates and pass transport and rendering checks.
Thirty-six authored direction fixtures load through production resource processing, simulation, and visual extraction on each route.
All reader diagnostics and sampled direction values match their expected states.
No particle loading, initialization, or observer errors occur.
Both routes submit forward draws for translucent and additive particles.
Improved transparency stages were not verified in this parser run.
Screenshot review confirms custom lobby models and hotbar icons.
Overlapping labels and the Java tutorial toast remain presentation gaps.
These checks verify packaged integration without establishing native image or timing parity.

**Remaining:** Complete lexical admission, variable registration, nested control flow, pack-version gates, and SDK world context need further native comparisons.
The authored runtime controls do not establish native images or animation timing.
Typed schema dispatch, interpolation, item classification, and all other coverage requirements remain active.


## Shared core Molang jumps and float loops

**Evidence:** Bedrock 1.26.51.1 returns through nested selected scopes and stops later statements.
`break` and `continue` target the nearest active loop.
Positive fractional loop counts run while their float remainder exceeds zero.
Counts `0.5`, `1.5`, and `1025` therefore execute once, twice, and 1,025 times.
The former client floor and 1,024 clamp did not match this target.
Empty scopes and malformed loop bodies fail compilation.

The [Mojang Molang reference](https://mojang.github.io/bedrock-samples/Molang.html#loop) currently identifies version 1.21.90.3 and describes a 1,024 loop limit.
The matching 1.26.51.1 VM probes differ, so these changes follow the pinned executable evidence.
A limit elsewhere in the full live engine remains unverified.

Private probes execute 57 declarations and 285 billboard samples through the target compiler, VM, and component functions.
Eight declarations use temporary variables to measure mutations and nested jumps.
For those cases, native registry constructors and registration instructions execute unchanged.
The previous VM context uses empty native variable vectors.
Supplied boundaries remain allocation, CRT operations, locks, diagnostics, TLS storage, and the compiler service marker.
Actor variables, complete world context, and native array iteration remain outside this comparison.
A private instruction cap interrupted a much larger loop; that interruption does not establish a native execution limit.

**Implemented:** Core compiles jumps and loop calls into private runtime functions before evaluation.
These functions unwind nested frames while retaining Mocha float arithmetic and property bindings.
The add-on uses this shared evaluator for numeric and string consumers.
Its duplicate equality helper, loop clamp, and execution guard are removed.
Core preserves the existing 16,384-iteration host budget across nested and successive loops, including array iteration.
This budget bounds untrusted work; it is a compatibility policy rather than verified native behavior.
Completed mutations remain visible when the budget ends evaluation with zero.

**Verified tests:** All four projects build with 1,061 passing Java tests, 120 optional skips, and no failures or errors.
Core Checkstyle passes.
Core evaluation and particle components match all 57 native declarations and 285 direction and UV samples.
Regression tests cover nested return mutation order, fractional counts, nearest-loop jumps, array bindings, and the shared host budget.
Both numeric and string client consumers use the same control flow.
Reader diagnostics are compared against compiler rejection, separately from later VM diagnostics.

Particle starts now release their pending slot before completing the public future.
Cached completions can invoke callbacks inline; those callbacks must see capacity from work that has already finished.
The previous ordering could reject chained starts against the 32-slot limit.
Two regressions exercise 128 nested cached starts with an almost-full queue, runtime failures, and rejected starts.
The existing pending-start, cached-graph, emitter, and image-memory limits remain in effect.

Early direct runs passed coarse scene checks while several authored starts were rejected.
A thread sample in an OpenGL draw did not establish a graphics fault.
The pending-slot completion order was corrected and receives separate regression coverage.
The private observer also kept scheduling an obsolete fixture queue after a resource reload canceled it.
That duplicate queue filled the bounded cache; the observer now stops scheduling when its playback generation changes.
Resource reload cancellation remains expected, and cache capacity is not raised for the test.

**Verified runtime:** Complete 240-second direct and ViaProxy replays preserve the CubeCraft scene hash `ede0e43b2874418cbb6b62135898efe0553009307d33fecd0f258383643d5d83`.
Both retain all 311 skin updates and pass transport and rendering checks.
Each route loads 68 authored direction definitions through production loading, simulation, and visual extraction.
Every reader diagnostic and sampled direction matches its expected state.
Translucent and additive controls also start, giving 70 distinct authored effects on each route.
No capacity rejection or observer error occurs in the successful runs.
The final ViaProxy observer records one expected start cancellation during a resource reload.
Both routes submit forward draws; improved-transparency stages remain unverified in this run.
Screenshots show the custom lobby models and hotbar icons, alongside overlapping labels and the Java tutorial toast.
These saved-scene checks do not establish a new live-server join, native image parity, or animation timing parity.

**Remaining:** Complete grammar admission, actor and world contexts, native array iteration, pack-version gates, and visible animation timing remain unverified or incomplete.
Runtime diagnostic text also needs comparison.
All other coverage requirements remain active.

## Shared temporary variables in billboard expressions

**Evidence:** The pinned Bedrock 1.26.51.1 billboard updater preserves temporary writes across scalar expression calls.
It evaluates size, ordinary UV coordinates and extents, then custom direction axes in that order.
Nine private declarations and 45 native samples cover aliases, overwrites, nested writes, and successive increments across those fields.
The native registry, compiler, VM, component updater, and temporary-store cleanup execute unchanged.
Each isolated sample starts after native store cleanup.
Host allocation, CRT operations, locks, diagnostics, and SDK service boundaries remain supplied.
This comparison does not establish reset boundaries across components or a complete particle frame.

**Implemented:** ViaBedrock core supplies an explicit evaluation group with shared temporary storage.
Separate groups and ordinary single-expression calls keep independent temporary values.
Persistent actor bindings remain shared.
Each expression retains its own control-flow frames, current value, and host execution budget.
The add-on uses one group for a billboard sample and releases it after completion or failure.
Nested groups use the active storage; copied actor environments do not inherit it.

**Verified tests:** All four projects build with 1,065 passing Java tests, 120 optional skips, and no failures or errors.
Core Checkstyle passes.
Particle component evaluation matches 66 native declarations and 330 samples, including the nine new sharing cases.
Core retains the previous 57 native expression comparisons.
New regressions cover sharing order, numeric and string values, early returns, changing current values, persistent actor bindings, repeated samples, nested groups, copied actors, and failure cleanup.

**Verified runtime:** Complete 240-second direct and ViaProxy replays retain the unchanged CubeCraft scene hash `ede0e43b2874418cbb6b62135898efe0553009307d33fecd0f258383643d5d83`.
Both preserve all 311 skin updates and pass transport and rendering checks.
Each route loads 77 authored direction definitions, including all nine temporary-sharing cases, plus translucent and additive controls.
All 79 effects start through production loading, simulation, and visual extraction.
Reader states and sampled directions match the expected results.
Neither route reports an active capacity rejection or observer error.
ViaProxy records one expected start cancellation during resource reload.
Both material controls submit forward draws; improved-transparency stages remain unverified in this run.
Screenshots show the custom lobby models and hotbar icons, alongside overlapping labels and the Java tutorial toast.
These are complete saved-scene replays, not a new live-server join or a native image/timing comparison.

**Remaining:** Native reset boundaries across animation and particle components and complete actor/world contexts need further comparisons.
The following sections correct missing-variable arithmetic and flipbook evaluation order.
All other coverage requirements remain active.

## Missing Molang values and fault propagation

**Evidence:** The pinned Bedrock 1.26.51.1 VM distinguishes missing variable members from valid numeric zero and empty strings.
A missing read stops the current program before later operations or statements.
Completed writes remain visible, but a failed assignment does not overwrite its target.
Inactive logical branches skip the read.
Null coalescing catches a missing value from its left operand, including arithmetic and function arguments.
It preserves valid zero and empty strings and does not catch `return`, `break`, or `continue`.
Division by zero returns valid numeric zero in the two tested programs.

Private probes cover 67 declarations and 335 billboard samples.
Twenty-seven cases use a supplied empty native variable map through the context's variable-store pointer.
The other cases cover temporaries, strings, arithmetic, branches, loops, and nested jumps.
Registry initialization, the compiler, VM instructions, component update, and store cleanup execute unchanged.
Host allocation, CRT operations, TLS, locks, diagnostic boundaries, and the compiler service marker remain supplied.
This supplied map does not establish complete actor or world context.

**Implemented:** Core lowers variable member reads and coalescing into private runtime functions.
Missing reads unwind the program with zero, while coalescing handles only the missing-value signal.
Assignment and array-loop targets retain their mutable bindings.
Query access remains at the consumer boundary.
Both client animation and particle consumers receive these semantics through the shared core evaluator.

The client validates source syntax before core compiles private runtime functions.
Source length, node, and depth limits remain unchanged.
Generated helper calls no longer consume a valid source script's node budget.
Existing long-script regressions cover this separation.
Counter and visibility fixtures now initialize their variables or explicitly coalesce before increments.

The parser also rejects unparenthesized assignment chains before any variable mutation.
The target compiler rejects all three tested chain forms and admits a parenthesized nested assignment.
The client recovers a rejected particle expression without discarding neighboring fields or the emitter.

**Verified tests:** All four projects build with 1,071 passing Java tests, 120 optional skips, and no failures or errors.
Core Checkstyle passes.
Core matches the 67 validity declarations and retains the earlier 57 control-flow comparisons.
Particle components match all 133 combined native declarations and 665 direction, size, and UV samples.
Regressions preserve mutation order, short-circuit branches, coalescing, nested jumps, source limits, and rejected-expression recovery.

**Verified runtime:** Complete 240-second direct and ViaProxy replays preserve the CubeCraft scene hash `ede0e43b2874418cbb6b62135898efe0553009307d33fecd0f258383643d5d83`.
Both retain all 311 skin updates and pass transport and rendering checks.
Each route loads 87 authored direction definitions, including all 67 validity cases and nine earlier sharing cases.
Two material controls also start, giving 89 effects through production resource loading, simulation, and visual extraction.
Every reader state and sampled direction matches the expected result.
Neither route reports an active capacity rejection or observer error.
Each observer records one expected start cancellation during resource reload.
Both material controls submit forward draws; improved-transparency stages remain unverified in this run.
Saved screenshots show custom lobby models, the hanging cube, and hotbar icons.
Overlapping labels and the Java tutorial toast remain visible.
These complete saved-scene replays do not establish a fresh live-server join or native image and timing parity.

**Remaining:** Embedded assignment results still need native accumulator lifecycle and compiler optimization behavior.
Native ordinary store instructions retain the current result pointer, while a fused constant-arithmetic instruction writes a separate result.
A controlled accumulator probe changes the returned result without changing the assigned value.
Current Java evaluation returns the assigned value, so broader assignment-result parity is incomplete.
The private contradictory assignment fixtures remain available for this work and are excluded from the verified validity comparison.
An unsupported diagnostic boundary interrupted a `sqrt(-1)` reader probe, so that interruption does not establish its native result.

Complete frame reset boundaries, actor/world contexts, arrays, runtime diagnostics, and native image and timing parity remain open.
The following section corrects the sampled flipbook reader and evaluation order.
All other coverage requirements remain active.

## Flipbook field types and evaluation order

**Evidence:** The pinned Bedrock 1.26.51.1 reader treats flipbook size and step as constant numeric vectors.
Base coordinates and frame count accept Molang.
The matching updater evaluates size first, then frame count, base V, base U, and custom direction.
An omitted frame rate means zero.
A present null flipbook section retains the enabled component with default values.
A present section of another invalid type disables flipbook playback and ignores ordinary UV expressions.

Texture dimensions require integral JSON values and clamp values below two to one.
Floating-point JSON values, including `2.0`, retain one and produce a reader diagnostic.
Constant vector fields recover each invalid component independently.
Flipbook numeric readers accept booleans as zero or one; flag readers require booleans.
Missing required fields and rejected Molang expressions retain their declared defaults.
Compiler rejection does not always produce an SDK log; the client reports the rejection explicitly.

The [Mojang particle reference](https://mojang.github.io/bedrock-samples/Particles.html) describes which flipbook fields accept Molang.
The matching build's exported schema and executable establish the defaults, typed recovery, and updater order.
Private native execution covers 104 declarations and 520 component samples.
The native JSON reader, expression compiler, VM, component reader, updater, registries, and variable-store cleanup execute unchanged.
The harness supplies allocation, CRT operations, locks, service markers, diagnostics, and SDK boundaries.
CRT `roundf` and `fmodf` run as supplied functions at their call boundaries.
Age and lifetime enter the native variable map as controlled numeric samples; no complete actor or world exists in this probe.

**Implemented:** The add-on stores flipbook size and step as floats, separate from expression programs.
It uses native defaults and recovery, preserves integer texture dimensions, and selects the flipbook branch by field presence.
Ignored fields cannot parse, execute, or mutate shared temporaries.
Frame count and base coordinates evaluate in native order within the existing core evaluation group.
Ordinary UV evaluation keeps its previous order.
Source expression limits remain unchanged.
This client change affects particle rendering; ViaProxy carries the same resource definitions through its existing transport.

**Verified tests:** All four projects build with 1,121 passing Java tests, 75 optional skips, and no failures or errors.
Core Checkstyle passes.
The new reference matches all 104 reader states and 520 direction, size, and UV samples.
The earlier 492 numeric frame comparisons also pass, including rounding, looping, lifetime stretching, and velocity thresholds.
The 133 earlier particle expression declarations and 665 samples remain enabled.
Targeted regressions cover shared order, successive samples, typed recovery, ignored expressions, and unchanged expression bounds.

Enabling the older scheduling references exposed three fixtures that assumed absent variables were zero.
Their native probes supplied expression callbacks rather than executing Molang.
The Java fixtures now explicitly initialize those supplied counters or coalesce the unavailable source value.
These changes preserve the scheduling and dispatch assertions without changing production missing-value semantics.


**Verified runtime:** Complete 240-second direct and ViaProxy replays preserve the CubeCraft scene hash `ede0e43b2874418cbb6b62135898efe0553009307d33fecd0f258383643d5d83`.
Both retain all 311 skin updates and pass transport and rendering checks.
Each route loads 95 flipbook definitions, 20 earlier direction and sharing definitions, and two material controls.
All 117 effects start through production resource loading, simulation, and visual extraction.
Reader metadata and 475 controlled samples from the loaded components match the native reference on each route.
Real playback also preserves the expected shared temporary value in each custom direction.
Neither final route reports an active capacity rejection or observer error.
Both material controls submit forward draws; improved-transparency stages remain unverified in these runs.

An initial larger ViaProxy fixture batch reached the unchanged 128-asset cache limit and rejected its final effect.
The final batch retains room for the real scene assets.
It omits three nonfinite-UV cases and six additional texture-dimension cases; all nine remain covered by the 104-case native test.
The production cache and pending-load limits remain unchanged.

Reviewed screenshots show custom lobby models, banners, the hanging cube, and hotbar icons on both routes.
Overlapping labels and the Java tutorial toast remain visible.
These are complete saved-scene replays, not fresh live-server joins or native image and timing comparisons.

**Remaining:** Other billboard fields and reader errors, complete frame reset boundaries, embedded assignment results, actor/world contexts, and visible particle parity need further work.
The full protocol, gameplay, editor, account, skin, persona, audio, UI, and platform requirements remain active.

## Server camera fades, October 5, 2026

**Implemented:** Core decodes the complete protocol 2193 camera instruction layout.
Optional fields preserve absent values, false booleans, and signed actor IDs.
This step applied fade instructions and retained other decoded fields.
The FOV implementation below extends the same handler.

Core resolves overlapping fades, active color retention, defaults, minimum duration, and point tolerance.
A versioned payload transports the timeline and elapsed time through direct connections and ViaProxy.
Late channel registration receives the current elapsed state without restarting the fade.
The add-on advances that timeline and draws an overlay before the HUD.
Rendering needs no Store session or local Bedrock installation.

**Target evidence:** The matching server emitted seven instructions for Bedrock 1.26.51.1, build 51061372.
Both codecs consumed every byte of default, zero-duration, colored, FOV set, FOV clear, free-camera, and clear instructions.
FOV easing uses a string on the wire.
The target schema also includes spline identifiers and JSON loading flags.
The [pinned Gophertunnel codec](https://github.com/Sandertv/gophertunnel/blob/80c811b6186016b3860c358368cfa47e507f26e9/minecraft/protocol/camera.go) supplies an independent implementation.

Private probes execute the actual target functions for fade application, point insertion, and timeline updates.
The comparisons cover 42 independent fades and 105 overlapping sequences, including 735 samples of merged timelines.
Core matches the reference points and opacity within a tolerance of 0.000001.
Invalid fade values leave the active timeline unchanged.
An owned local native-client session shows opaque red and blue overlays with the crosshair and hotbar visible.

**Build evidence:** All four projects pass the complete build with routed StackAnvil dependencies and verified VFP artifacts.
The run reports 1,079 passing tests, 124 optional skips, and no failures or errors.
The private camera comparisons run in this build.
Earlier particle probes remain covered by their previous verification runs.

**Verified runtime:** Complete 240-second CubeCraft replays pass transport and rendering checks through both routes.
The fixture preserves the original scene packets and adds five authored camera instructions.
Its augmented scene hash is `cb9b01d0178c957405e9af846952bb9bf75b70285f1b81a76ef3cd231a4f8d97`.
Direct session `2026-10-05T19-52-30.600Z-replay-scene` and ViaProxy session `2026-10-05T19-48-13.237Z-replay-scene` retain all 311 skin updates.
Each receives four nonempty fade snapshots and reports no camera errors.
The overlapping green instruction retains red and preserves current opacity.
Camera clear leaves the fade active, and every fade expires to transparent.
The zero-duration white instruction lasts the native minimum of half a second.

Reviewed screenshots show opaque red, blue, and white worlds beneath visible HUD elements on both routes.
The owned native session establishes the same opaque overlay order.
Final screenshots return to the lobby with custom models, banners, the hanging cube, and hotbar icons.
The runtime audit records 1,358 direct opacity samples and 1,342 ViaProxy samples.
These samples verify transported playback; the independent executable comparisons establish numeric native behavior.
The authored commands do not establish camera usage by CubeCraft itself.
These are saved-scene replays, not fresh live CubeCraft joins.

**Remaining:** Presets, transforms, target tracking, FOV, splines, attachments, shake, fog, and aim assistance remain incomplete.
Partial-opacity image comparisons, gamma and HDR behavior, exact frame timing, hidden HUD, pauses, late registration, and disconnect transitions remain unverified.
The full protocol, gameplay, editor, account, skin, persona, audio, UI, and platform requirements remain active.

## Camera preset and FOV research, October 5, 2026

**Verified wire evidence:** The matching local server sends six presets in 337 bytes.
The existing CubeCraft recording sends four presets in 231 bytes.
The pinned Gophertunnel codec consumes every byte and reproduces both payloads exactly.
The local list includes fixed-boom and follow-orbit presets that the CubeCraft list omits.
Third-person indexes differ between those lists.
Camera instructions must resolve indexes through the connection's received preset table.
A fixed built-in index table would select the wrong camera on one route.

**Verified numeric evidence:** The private probe executes 288 linear sequences through the target FOV updater at `1466ee500`.
The probe supplies component memory, frame deltas, and empty storage for override removal.
It executes the actual updater without replacing its interpolation branch.
Durations no greater than the float epsilon `0.00000011920928955078125` use the immediate branch.
A transition that reaches its endpoint sets its duration to zero.
A clear transition enters the override removal branch on the next update.
These findings describe component updates, not visible frame timing or the complete clear flow.

The target instruction application at `1466f1230` clamps FOV targets to 30–110 degrees and stores radians.
A new eased instruction records the current rendered FOV as its starting value.
The clear setup at `1466ef450` queries the native local FOV and creates a transition toward that value.
The renderer therefore needs the current client FOV and the correct units.
The remaining local FOV lookup and projection behavior still need runtime comparisons.

The private probe executes 1,920 samples through the actual 32 easing functions, across three endpoint pairs.
The native initializer at `142647070` builds the sine table used by applicable easing modes.
The probe supplies imported math functions, stack probing, and memory copying.
The target code selects table indexes, applies its arithmetic, and combines endpoints.
Host math results are rounded to floats; these samples do not establish bit-identical Windows CRT behavior.
Spring, back, and elastic samples overshoot their endpoints.
The implementation must preserve that behavior rather than clamp easing progress results to zero through one.

**Status at this research step:** FOV overrides and preset application had not been implemented.
The next implementation needs a received preset registry, current FOV state, native easing, client projection, and lifecycle handling.
Repeated set and clear commands, local settings, player effects, movement schemes, audio listeners, and both connection routes need visible comparisons.
No native binaries, lookup tables, or raw captures enter the production patch stack.
All original coverage requirements remain active.


## Server FOV transitions, October 5, 2026

**Implemented:** Core resolves FOV targets, timing, easing, interruption, and clear lifecycle through a shared transition model.
Targets clamp to 30–110 degrees and convert to radians.
The model preserves the native float-epsilon branch and easing overshoot.
An immediate set changes the target without replacing an existing transition.
An eased set retains an existing clear flag.
An eased clear removes the override on the update after its transition completes.
Ordinary camera clear also removes the FOV override while leaving fades active.

The versioned `viabedrock:camera_fov` channel carries sequenced live commands and elapsed snapshots through both routes.
Live clients supply their previous rendered projection and normal local projection to the shared core rules.
Core retains the unresolved local projection when client context is unavailable.
Snapshot restoration resolves that value locally and advances the elapsed transition.
It does not replay the transition from its beginning.
Historical changes to the local projection during an unsubscribed interval remain unverified.

The add-on applies the result before the world camera builds its projection and culling matrices.
It preserves the existing separate hand projection and clears pending state at disconnect.
Rendering does not require a Store session or a local game installation.

**Verified numeric evidence:** The shared easing implementation matches 640 native factor samples across all 32 target easing functions.
The maximum difference is below 0.00000001.
The shared frame updater also matches 288 native linear sequences, including epsilon durations, completion, and the removal branch.
These private comparisons execute the target functions from Bedrock 1.26.51.1, build 51061372.
They do not establish bit-identical Windows math-library behavior or complete native command setup.

**Native runtime evidence:** An owned local capture contains nine FOV commands with the target wire layout.
It covers eased set and clear, immediate set and clear, interrupted easing, and a set during an active clear.
Its scene hash is `0de006222ed875fb74b1a7b9a0000e49a416384581be4cc0987e3003fe0e3700`.
A second owned capture contains first-person preset selection, two FOV sets, and two ordinary camera clears.
Its scene hash is `d5e37208ada41438748b6ba2a80544396f655b5cfc202d51c7c82f4a942491ca`.
Reviewed native screenshots show a narrowed tree view followed by the wider local view after camera clear.
This also confirms the reset path found in the target instruction application at `1466f1230`.

**Build evidence:** All four projects pass the complete build with routed dependencies and verified VFP artifacts.
A follow-up full core test run supplies all four private camera fixtures.
The combined final results report 1,083 passing tests, 124 optional skips, and no failures or errors.
The private camera data, raw captures, executable, and licensed assets remain outside the patch stack.

**Verified CubeCraft replay:** Both complete 240-second replays pass transport and rendering checks and retain all 311 recorded skin updates.
The fixture preserves the original scene and adds the nine captured FOV commands at authored times.
Its scene hash is `cfc2ff19ff3d10645847516370eac7482c9f6b41ad17cb627196fd4f822d8e00`.
ViaProxy session `2026-10-05T20-20-16.241Z-replay-scene` records 1,550 FOV samples.
Direct session `2026-10-05T20-24-53.693Z-replay-scene` records 1,514 samples.
Both receive the initial snapshot and all nine commands without camera errors.

Reviewed screenshots show 30-degree and 110-degree views, immediate 45-degree views, and the restored local view on both routes.
Out-back easing reaches about 117.9 degrees before settling at 110.
An immediate target change retains the active six-second transition and finishes at 100 degrees.
A set during clear preserves the clear flag, overshoots below 44 degrees, and then returns to the local projection.
These checks verify the transported FOV path alongside the recorded scene.
They do not establish FOV usage by CubeCraft itself, exact native images, or fresh live-server behavior.

**Verified ordinary clear:** Supplemental 65-second replays preserve the second owned capture and pass complete scene transport on both routes.
ViaProxy session `2026-10-05T20-30-25.741Z-replay-scene` records 453 FOV samples.
Direct session `2026-10-05T20-32-47.234Z-replay-scene` records 442 samples.
Each receives both FOV sets and both camera clears without camera errors.
Reviewed screenshots show the narrowed views and restored local view.

The direct supplemental replay also passes its broader rendering checks.
The initial ViaProxy report records only one of two skin installations and no audited third-person scene.
A follow-up identifies stale audit publication and an omitted private avatar marker.
The missing asset cache does not explain that report.
The original failures remain recorded, with corrected replay evidence in the audit section below.
The complete CubeCraft fixture passes its rendering checks through both routes.
These observations retain the unavailable-asset and broader skin requirements.

**Remaining:** Presets, transforms, target tracking, splines, attachments, shake, fog, and aim assistance remain incomplete.
Native local FOV modifiers, first-person integration, pauses, transfers, late subscription, and broader lifecycle behavior need further comparisons.
The full protocol, gameplay, editor, account, skin, persona, audio, UI, and platform requirements remain active.

## Replay skin audit publication, October 5, 2026

**Corrected:** The appearance audit could retain an old report when two skin installations occurred within its 200 ms save interval.
Direct recordings refreshed that report through a local Bedrock recorder.
ViaProxy clients had no equivalent refresh when the scene stopped producing audited changes.
Client ticks now publish pending changes on both routes.
Unchanged reports do not trigger further disk writes.
Frame and renderer counters also mark their changes for publication.

The verifier now compares SHA-256 hashes and occurrence counts for each complete serialized skin record.
This covers geometry, animation metadata, persona fields, and flags alongside the existing image checks.
Repeated identical records retain their individual counts.
A replaced update cannot pass by preserving only the total installation count and distinct image hashes.
The audit stores hashes, not skin payloads or account identities.

The earlier private FOV replay also omitted its local-avatar marker on the proxy route.
Restoring that marker exercises the local Java avatar through the production native renderer.
The missing animation asset cache was a separate observation, not the cause of the stale installation report.

**Test evidence:** All 94 tooling tests pass, and `bun run check` passes.
The Java replay self-test distinguishes geometry changes with identical pixels and verifies repeated record counts.
A Java publication regression test covers pending updates without a direct recorder, explicit flush, and unchanged-report writes.

**Corrected runtime evidence:** Complete 65-second replays pass transport and rendering checks through both routes.
ViaProxy session `2026-10-05T20-44-10.416Z-replay-scene` records 850 local native-avatar submissions and 435 FOV samples.
Direct session `2026-10-05T20-45-35.916Z-replay-scene` records 830 submissions and 436 samples.
Both preserve the two complete skin records, their geometry, and the recorded image pixels without rejected skins.
Each receives the FOV snapshot and four commands, reaches both narrowed targets, and restores 70 degrees after each ordinary clear.
The scene hash remains `d5e37208ada41438748b6ba2a80544396f655b5cfc202d51c7c82f4a942491ca`.
Reviewed final screenshots show the local avatar on both routes.

**Remaining:** Complete-record delivery and renderer submission do not establish native animation or visual parity.
Both offline clients still report unavailable built-in animation assets.
Account-independent cached asset use, animation playback, remote players, lifecycle behavior, and the full coverage goal remain incomplete.


## Server camera shake, October 5, 2026

**Implemented:** Core decodes positional and rotational additions and global stop commands.
It owns the queues, clock, resumable snapshots, and shared noise model.
The versioned `viabedrock:camera_shake` channel carries the same state through direct connections and ViaProxy.
The add-on applies world-space translation and pitch/yaw changes before camera projection and culling.
It preserves player aim and adds no roll.
The local “Allow camera shake” setting defaults to enabled.

**Target evidence:** The owned native capture contains eight packet-159 commands from Bedrock 1.26.51.1, build 51061372.
Each carries two little-endian floats, then type and action bytes.
The native handler clears both queues for stop, regardless of its type byte.
Separate queues sum overlapping intensities with a cap of four.
After an overlapping event expires, intensity decreases toward the remaining sum at one unit per second.
Removing the final event removes the effect immediately.

The target sampler uses continuous two-dimensional simplex noise with three shuffled axes.
Live arguments establish default frequency 10, amplitude five degrees in radians, and noise multiplier four.
The multiplier scales the phase coordinate and output amplitude.
The frequency supplies the other noise coordinate.
Private numeric probes compare eight authored noise samples and twelve actual native queue updates.
Seven targeted tests pass with both private fixtures supplied.
All four projects pass the complete build.
No executable, raw recording, game assets, or local installation paths enter production.

**Verified runtime paths:** Reviewed native frames show overlapping translation, strong rotation, and the cleared view.
Complete 120-second direct and ViaProxy replays preserve the captured scene without payload changes.
Its scene hash is `176cb2fa3bd4406a4a9d230e21d13fdfb48914511ab90127f7e2e204571031fc`.
Both pass transport and broader rendering checks, including both complete skin records and native local-avatar rendering.
Direct session `2026-10-05T21-13-17.971Z-replay-scene` records 928 camera samples.
ViaProxy session `2026-10-05T21-15-33.220Z-replay-scene` records 924 samples.
Each receives the initial snapshot and all eight commands without camera audit errors.

Measured camera offsets follow the shared noise model on both routes.
The maximum position difference is below 0.00000015 blocks.
The maximum pitch/yaw difference is below 0.000008 degrees.
Player aim remains unchanged, and the final camera returns to its normal position and rotation.
Reviewed direct screenshots show overlap, strong rotation, and clearing.
These results verify the captured local-server path; they do not establish fresh CubeCraft behavior.

**Verified local preference:** Direct session `2026-10-05T21-18-46.264Z-replay-scene` changes the setting during the captured commands.
The complete replay passes transport and broader rendering checks with the same scene hash.
Disabled frames retain normal camera position and angles while existing event lifetimes advance.
An overlapping positional addition and a strong rotational addition received while disabled are ignored.
Re-enabling retains the earlier positional event and accepts the next rotational addition.
Global stop clears the retained state, and subsequent enabled additions work.
This checks the production client setting against the inspected native handler; native preference-toggle screenshots remain unverified.

**Remaining:** Custom preset shake parameters, native random initialization equivalence, pauses, transfers, late subscriptions, and broader lifecycle behavior need comparisons.
Camera presets, transforms, target tracking, splines, attachments, fog, and aim assistance remain incomplete.


## Received presets and camera movement research, October 5, 2026

**Implemented:** Core handles `CAMERA_PRESETS` (198) and retains every protocol-2193 field in the connection storage.
The registry preserves received instruction indexes and resolves optional fields through declared parents.
Forward references work without recursion, including the maximum supported depth.
Explicit false and zero values override ancestors.
An aim-assist object inherits as a whole rather than merging its children.
Starting-rotation flags and values remain those of the child, outside ordinary optional inheritance.
Activation behavior for those flags remains incomplete.

Unknown roots, missing parents, and cycles remain unresolved and produce a diagnostic.
The registry never substitutes a free camera for them or shifts valid indexes.
Duplicate names reject a replacement atomically and preserve the previous table.
That policy protects connection state; native duplicate-name behavior remains unverified.
Counts are bounded before allocation.

**Verified wire evidence:** Local, CubeCraft, and authored custom tables contain six, four, and eight presets respectively.
Their payload sizes are 337, 231, and 493 bytes.
The Java codec and [pinned Gophertunnel codec](https://github.com/Sandertv/gophertunnel/blob/80c811b6186016b3860c358368cfa47e507f26e9/minecraft/protocol/camera.go) consume every field and reproduce all three payloads exactly.
Seven targeted tests pass with all three private fixtures, without skipped tests.
These results establish decoding and registry behavior, not camera parity.

All four stack builds pass, along with `bun run check` and the replay audit regression test.
The audit copies preset bytes before decoder ownership ends and compares them with the retained table after processing.
It writes private core-state reports without changing the captured packets.
Direct session `2026-10-05T21-39-12.934Z-replay-scene` and ViaProxy session `2026-10-05T21-41-49.343Z-replay-scene` retain identical reports.
Both contain all eight presets, no unresolved parents, and the received payload hash `2659ced7bbb9d184225909a66426c3ff1466b7371158cf07a4b4e929e326eca4`.
The resolved child retains inherited position and pitch, overridden height and yaw, player-listener selection, and false player effects.

Both complete replays preserve the native scene hash and pass transport and existing skin-rendering checks.
They contain all nine camera instructions and produce no camera preset errors.
These checks establish preset handling through both routes, without claiming translated camera movement or views.

The custom capture uses the matching server and native client on an owned local connection.
Session `2026-10-05T21-31-07.997Z-record-local` reaches spawn and retains all nine camera instructions.
Its scene hash is `e259410a9b65876a63a4805e4a5ce3804c0f5fcb711dd2f5d2df500ebd9fba2e`.
The child preset overrides height, yaw, listener selection, and player effects while inheriting the other authored pose values.
Reviewed native frames show distinct custom views, an eased transition, and the built-in perspectives.
The authored fixture required `cameras/presets/` and the target schema's `listener` field.
An earlier fixture failed to load; it supplies no custom inheritance evidence.

Native resolver `1409f28e0` supplies the executable evidence for ordinary optional inheritance.
The native blend updater at `146786500` supplies 4,608 samples across all 32 easing modes.
Cases include moving targets, parent movement, yaw wraparound, near-vertical rotation, immediate durations, and endpoint completion.
The private probe authors component storage and supplies imported math functions.
It executes the actual blend arithmetic and native easing functions.

The updater interpolates Euler angles and reconstructs a quaternion.
Yaw follows the shortest arc.
After the first frame, position starts from the previous rendered pose plus the parent-position change.
The next interpolation factor accounts for the previously completed easing amount.
Overshoot remains intact, and endpoint completion copies the target pose and rendering fields.
During a blend, other rendering fields remain those of the previous output camera.
Nine additional native samples verify retention during a blend and target-field copying after immediate or completed transitions.

An independent private model reproduces position and FOV exactly in those samples.
Its largest quaternion-component difference is `0.0000000298023223876953125`.
The comparison uses observed native easing factors to isolate pose arithmetic.
It does not establish Windows CRT bit identity, command setup, frame scheduling, or production Java movement behavior.
The previous native easing comparisons remain separate evidence for easing functions.

**Remaining:** Preset activation, resolved pose transport, camera movement, controls, audio listeners, and player effects need production integration.
Both translated routes still need visible camera comparisons.
This change does not claim that the custom native views render in the add-on.
All original protocol, inventory, presentation, gameplay, rendering, skin, account, asset, and platform requirements remain active.
The native samples use authored permutations; they do not claim identical random trajectories across clients.
Complete-record delivery and local-avatar rendering do not establish native animation or skin visual parity.
The full protocol, gameplay, editor, account, skin, persona, audio, UI, asset, and platform requirements remain active.


## Core-resolved free-camera movement, October 6, 2026

U1 remains incomplete.
Core now resolves free-camera position, rotation, facing targets, inherited defaults, and persistent overrides per received preset index.
A `default` command clears the position and rotation overrides.
The versioned payload carries resolved commands through direct connections and ViaProxy.

The add-on supplies its interrupted frame to the shared native blend updater.
The updater preserves easing overshoot, shortest yaw rotation, incremental moving-target behavior, and endpoint perspective fields.
The renderer applies the camera pose before shake, projection, and culling.
Server perspectives do not write the saved user camera setting.
Clear and disconnect release the override.

Seven targeted tests pass without skips using private target-build evidence.
They compare 4,608 native blend samples, nine recorded camera instructions, and twelve native facing arithmetic cases.
All four stack builds, core style checks, the replay audit regression, and `bun run check` pass.

Complete direct and ViaProxy replays reach all five recorded free-camera targets with matching position and rotation.
Frame observations also show the short yaw path, overshoot, three perspective activations, and clear restoring first person.
Both complete scene hashes match the native capture.
Transport and existing skin-rendering checks pass.

A stationary screenshot comparison confirms the camera's direction and surrounding landmarks.
Projection, lighting, and foliage still differ visibly.
Numerical camera agreement does not establish identical frames.
The screenshots and videos remain private.

Late subscriptions restore settled targets because core lacks the original interrupted rendering frame.
Exact restoration during an existing blend remains incomplete.
The three built-in perspective commands currently use Java collision and distance rules.
Native third-person pose parity, player effects, audible listener parity, camera/FOV coupling, follow cameras, splines, targets, attachments, and aim assistance remain open.

The first ViaProxy attempt timed out during configuration, before receiving presets or camera commands.
Its journal contains login success and client cache status but no resource-pack info.
The next attempt completed the scene, passed transport and skin-rendering checks, and retained the same preset report as the direct route.
The intermittent replay handshake needs separate investigation.
This movement work does not establish a fix for that timeout.


## Camera audio listeners, October 6, 2026

U1 remains incomplete.

**Implemented:** Core selects the camera when the resolved listener field is absent or differs from `1`.
The target built-in preset assets have no player-listener override.
An explicit player listener inherits through custom presets, while explicit camera selection overrides it.
Clear restores ordinary camera audio.

Core computes player forward/up vectors with the target float sine lookup and normalization.
The add-on supplies local eye coordinates and current player angles.
Its sound-engine hook applies that result before Minecraft sends the listener to its sound executor.
Camera selection retains the rendered camera transform, including its current blend and shake.
The active command selects the listener independently of the visual blend.
Disconnect clears the server selection.

Bedrock PCM playback, admission checks, and caption positioning consume the same sound-engine listener.
The implementation introduces no second audio device or separate caption listener.
Both routes use the existing versioned camera position payload.

**Native evidence:** Bedrock 1.26.51.1, build 51061372, protocol 2193.
Preset application `1409eed30` adds the player-listener marker only for explicit player selection.
Query `1409f62f0` checks that marker on the active camera usage entity.
It does not read pose blend progress or copied rendering fields.
Updater `1446d0800` copies rendered camera coordinates and orientation for camera listeners.
For player listeners it uses interpolated actor coordinates and current player pitch/yaw.
Actor helper `141a244e0` performs the coordinate interpolation.

The private probe executes all three native functions across 72 samples.
Cases include valid/missing markers, invalid weak contexts, three interpolation fractions, and six player rotations.
Eighteen samples select the player.
The probe supplies authored component storage, virtual client lookup, clock access, and security/CRT boundaries.
These samples exclude camera activation ordering and actor coordinate provenance.

[Microsoft's camera guide](https://learn.microsoft.com/en-us/minecraft/creator/documents/CameraSystem/CameraCommandIntroduction?view=minecraft-bedrock-stable) describes camera position/orientation audio and the `listener` preset field.
The target executable establishes the marker and vector behavior for the pinned build.

**Automated checks:** Five targeted core tests pass with all supplied private fixtures and no skips.
They cover native player orientation, inherited listener choices, camera defaults, and existing command/facing behavior.
Core style checks, tooling checks, and the camera replay audit regression test pass.
All four stack builds pass.

**Route checks:** Complete direct and ViaProxy replays retain the recorded scene hash.
Both reach spawn, load their resource packs, and pass transport and existing skin-rendering checks.
Each route records 92 camera observations.
All five settled targets use the expected listener, including inherited player selection and camera overrides.
Player listener coordinates match interpolated Java feet plus eye height, with current player orientation.
Clear restores the ordinary camera listener.

During camera movement, the asynchronous Java sound update can lag the sampled rendering frame.
The largest observed position differences are 0.706 blocks direct and 0.122 blocks through ViaProxy.
Settled camera coordinates match.
These observations verify route delivery and listener integration, but exclude native audio-frame timing and audible panning.

**Remaining:** Native eye-height provenance, vehicles, death, listener activation timing, and audible panning remain unverified.
The Java eye position is a client integration input, not proof of native player-coordinate parity.
Native first/third-person poses, player effects, follow cameras, splines, fog, and aim assistance remain incomplete.

## Strict movement test fixtures, October 6, 2026

G1 remains incomplete. The goal now requires native movement comparisons on direct and ViaProxy routes.
Authoritative movement state, simulation, and correction handling belong in ViaBedrock core.
The add-on supplies additional local input and prediction when client integration requires it.

The Geyser fixture installer now downloads the checksum-pinned Boar `2.0.1-SNAPSHOT-949deba` extension.
It requires Boar's enabled message during server startup.
The local Paper/Geyser test server confirms that Boar loads with its default checks enabled.
No test player receives the exemption permission.
See [Boar's source and scope](https://github.com/opencollab-incubator/Boar).

Integration BDS copies now enable `server-authoritative-movement-strict=true`.
A separate local BDS 1.26.51.1 instance starts with that setting and NetherNet transport.
The first attempt retained an older RakNet configuration and reported that this build requires NetherNet.
Its configuration was corrected before further tests.
The external persistent BDS configuration also enables strict movement, pending its next restart.
The existing external process has not been restarted.

Official BDS and the pinned native client remain the primary movement references.
Boar is experimental. Investigate its flags before assigning a StackAnvil movement defect.
Track possible Boar bugs separately, and retain real-server interoperability tests.
This fixture does not establish that CubeCraft uses Boar.

Installation and startup checks do not establish movement parity.
Native baselines, both connection routes, prediction errors, anticheat violations, setbacks, and complete movement cases remain to verify.
Walking, sprinting, sneaking, jumps, falls, collision, steps, climbing, fluids, effects, attributes, knockback, vehicles, latency, and corrections remain in scope.

## Custom-block condition preparation, October 6, 2026

**Implemented and verified locally:** Core compiles each definition's permutation conditions once per connection.
State queries and returned component overlays remain independent between evaluations.
The thirteen targeted tests include all sixty-four boolean face combinations using one compiled definition.
Core Checkstyle and complete CubeConverter, ViaBedrock, and ViaProxy builds pass.

A private Geyser 2.11.3 fixture reproduced repeated ten-second transport timeouts before this change.
Thread dumps and a CPU profile show custom-block condition reparsing on the Netty client thread.
Log timestamps place this preparation interval at roughly fourteen seconds.
The converter's millisecond timing excludes this preceding block-state work.

The revised fixture reaches a visible world and retains the connection through the full 120-second capture.
It records local-player initialization, continuing input, and reciprocal network latency responses.
Walking and jumping remain visible while the server retains the player.
The preparation interval drops to roughly three seconds in this run.
These coarse timings describe one local fixture and do not establish a general speedup.

Boar debug output contains prediction offsets that need native comparison.
This run verifies joining and basic input; it does not establish movement parity or classify Boar offsets as client defects.
Official strict BDS, native baselines, direct connections, CubeCraft, larger stacks, Windows, and macOS remain to verify.

The recorder now defers its camera-preset audit until the custom-block pack gate drains.
Earlier observer exceptions came from comparing intentionally queued packets with undecoded core state.
Recordings also require gameplay acknowledgments and reject early exits or logged disconnections.
A spawn notification followed by a disconnected loading screen no longer passes the recording command.

## BDS HTTP signaling, October 6, 2026

**Implemented and verified through ViaProxy:** Core now owns HTTP NetherNet signaling.
The pinned BDS 1.26.51.1 returns successful capability status with no JSON body.
Its native client accepts that response and posts its SDP offer.
The newer transport rejected the endpoint before sending an offer.
Both connection integrations now use the shared core implementation.

Four real loopback tests cover TLS rejection, empty capabilities, SDP exchange, unsupported endpoints, invalid answers, and certificate rejection.
Certificate validation failures do not trigger plaintext fallback.
Core Checkstyle, the complete ViaProxy build, and the complete add-on build pass.
The core patch applies to its pinned upstream base without setup.

The rebuilt proxy reaches a visible strict BDS world and completes the configured 120-second recording.
Its journal includes local-player initialization and 1,955 continuing input packets.
The native baseline remains connected through walking and jumping.
A simultaneous connection using the same account returned `ServerIdConflict`; disconnecting the native client resolved it.

This establishes the tested authenticated HTTP joining route.
Direct add-on joining, offline HTTP identities, and full movement parity remain open.
The BDS scene also exposes unsupported falling-block variants and secondary block-layer warnings that need separate investigation.
Raw traffic, identities, logs, and screenshots remain private.

## Windows and macOS CubeCraft guests, October 6, 2026

**Verified guest joins:** Windows 11 build 26100 and macOS Sonoma 14.8.9 launch Java 26.3 with the add-on through Prism 11.1.1.
Both use Temurin 25.0.4.1+1 and a ViaProxy process inside the guest.
Both accept the converted CubeCraft pack and reach a visible lobby with custom NPCs, banners, item icons, and sidebar.
Windows retains server traffic for more than five minutes after its successful retry.
macOS screenshots show changing players, lobby state, and walking input.

Observed conversion intervals are 1,198 milliseconds on Windows and 1,278 milliseconds on macOS.
Those timings exclude custom-block preparation, approval, resource reload, and world loading.
The first Windows world-loading attempt disconnects. Its successful retry does not explain or close that failure.
The first macOS connection fails because the local proxy is absent; starting the proxy resolves that setup failure.

Windows needs an application-local Mesa llvmpipe deployment after its default graphics route aborts before the menu.
macOS uses OpenGL 4.1 through Apple Software Renderer.
These tests establish functional guest behavior without hardware performance claims.
Slow guest rendering can miss short input holds; the lab now supports validated hold times up to two seconds.

**Implemented:** Custom actor ticks now reuse compiled Molang syntax throughout scripts and render controller evaluation.
Windows network-thread samples exposed repeated parsing during controller ticks before this change.
The actor owns its cache. Every evaluation retains current query bindings, persistent actor variables, and fresh temporary state.
Targeted semantic tests, core Checkstyle, and complete ViaProxy and add-on builds pass.
The full patch stack replays after folding the change into the actor property patch.

Fresh Store authentication, passkeys, Modrinth, the official launcher with Fabric, direct guest connections, and full movement parity remain open.
CubeCraft also reports unmapped particle effects, player attributes, sub-client headers, and an unsupported dragon variant that need separate investigation.
Official BDS and the native client remain the primary movement references; experimental Boar flags need independent classification.
Raw logs, packet journals, identities, thread dumps, and screenshots remain private.

## macOS CubeCraft memory and radius diagnostics, October 6, 2026

The first macOS unload exhausts the test client's 2 GiB Java heap.
A retry with a confirmed 4 GiB heap reaches the lobby and unloads the pack successfully.
The live heap dump identifies 26 actor graphs retaining duplicate server animation definitions, totaling 1,340,555,464 bytes.
Most JSON objects disappear after unloading, so this capture establishes excessive live pack memory rather than a permanent leak.
The actor reader now shares parsed definitions and effects for each accepted pack lifetime.
Compiled actor state, variables, command slots, and clocks remain independent.
Targeted tests verify one parse across actors and new definitions after pack replacement.
The full add-on stack replays after folding the change into its actor animation patch.
The rebuilt add-on reaches the CubeCraft lobby and unloads its pack with a confirmed 2 GiB heap.
The live histogram shows one shared library for 27 actor graphs and about 155,000 Gson map nodes.
The lobby heap sample uses about 758 MiB before collection.
This verifies one load and unload on the guest, with longer runs and other packs still required.

A separate join stalls after conversion and resource reload with a requested radius of four.
The journal contains StartGame and continuing server traffic, but no chunks, radius acknowledgment, or spawn status.
Repeating radius four on the same connection produces no acknowledgment.
A diagnostic request for radius eight immediately receives chunks, radius acknowledgment, and spawn status.
The client reaches a visible lobby and sends initialization plus 3,177 input packets before the recording closes.
The recovered connection continues for more than two minutes after that request.
This reproduces a chunk negotiation gap independently of the converter and Java heap limit.
ViaBedrock core now retries unacknowledged requests and offers a bounded radius-eight recovery for smaller radii.
Acknowledgment, spawn, settings changes, and disconnect cancel or replace pending work.
The current macOS stack recovers automatically and reaches the visible lobby.
Its closed journal records requests at radius four, four, and eight, followed by an acknowledgment 54 ms after the fallback.
The recording includes spawn, one initialization packet, 2,856 input packets, and 172 chunks.
The recovered session continues for more than two minutes with the 2 GiB heap.
Comparison against the native client's radius negotiation remains open.
The diagnostic probe sends ordinary radius requests; it does not fabricate spawn or initialization packets.
Heap dumps, packet journals, diagnostic probes, accounts, and screenshots remain private.

The current core also passes an authenticated join against strict BDS 1.26.51.1 through ViaProxy.
The recording has one radius request and acknowledgment, spawn, one initialization packet, and 793 input frames.
An unauthenticated HTTP attempt fails before Bedrock traffic; offline HTTP identity compatibility remains separate work.
These joins do not establish full movement parity.

The rebuilt Windows stack also reaches the CubeCraft lobby on retry with a confirmed 2 GiB heap.
Live core diagnostics show an active PLAY connection, completed spawn, and advancing player ticks.
The session remains playable for more than four minutes and unloads the server pack back to the multiplayer menu without heap exhaustion.
Its first attempt still disconnects during resource reload; the retry does not explain that failure.
That Windows retry has no packet journal; recovery from smaller radii remains unverified.
A particle definition also reports ambiguous motion and needs separate investigation.

## Portable private packet recording, October 6, 2026

The Windows diagnostic recorder previously failed because it called POSIX permission APIs.
Java recorders now use POSIX owner permissions or a Windows user-only ACL before writing capture contents.
Journals, exported packs, keys, camera observations, and render observations share this implementation.
Unsupported filesystems stop recording, and existing journals cannot be overwritten.
The native filesystem tests pass on Linux, Windows 11, and macOS Sonoma.
The tests cover journal round trips, authentication exclusion, access permissions, append behavior, overwrite protection, and unsupported filesystems.
Linux also verifies rejection of capture symlinks.
The CI now repeats the permission tests on Ubuntu, Windows, and ARM macOS.

The revised recorder also passes an authenticated strict BDS join through ViaProxy.
The closed journal records spawn, one initialization packet, 2,032 input packets, and 595 chunks over about 110 seconds.
Walking and jumping input run during the session. This regression does not establish complete movement parity.

A fresh Windows client and proxy also complete a CubeCraft join with an empty converted-pack cache.
The private recorder saves five server packs and a closed 219-second packet journal.
It records spawn, one initialization packet, 3,747 input packets, and 594 chunks.
The client requests radius sixteen and receives radius fourteen, so this run does not exercise the smaller-radius recovery.
The client reaches the visible lobby, accepts walking and jumping input, and unloads back to the multiplayer menu with a confirmed 2 GiB heap.
The two conversion intervals are 1,715 milliseconds and 2,426 milliseconds; these exclude other join stages.
The warm-cache client restart also reaches spawn.
These successful repeats do not reproduce or explain the earlier first reload disconnect.
Fresh Store login, other launchers, direct connections, and complete movement parity remain open.

## Strict BDS sneak input timing, October 6, 2026

**Implemented and verified through ViaProxy:** The add-on predicts a permitted keyboard sneak press before Java selects its crouching state.
The core permission channel activates this behavior for the connection.
Core retains authoritative input state, packet construction, and permission filtering.
The client hook is necessary because core receives Java's position after local prediction.

The native 1.26.51 client provides a baseline on flat stone with strict BDS 1.26.51.1, protocol 2193.
Repeated four-second runs travel about 17.269 blocks walking, 22.449 sprinting, and 5.181 sneaking.
Periodic jump samples show about 1.249 blocks of rise; this sampling does not establish the exact apex.
These times include key sampling and do not guarantee equal simulated tick counts.

The first StackAnvil sneak step originally moved 0.098 blocks while BDS expected 0.0294 blocks.
Each of two repeats received three prediction corrections at sneak startup.
Java 26.3 computes crouching before `KeyboardInput.tick` refreshes the key sample.
The add-on now reads the current permitted press during that check.
It retains Java's pose eligibility, speed attributes, and the existing behavior of other input implementations.

A walking press/release sequence also established BDS's expected final slow step on `StopSneaking`.
Immediate full-speed release produced two corrections.
The hook retains the previous pressed sample for that release frame.

The final journal contains six movement segments and no prediction corrections during those segments.
They cover two sneak starts, a walking press/release sequence, disabled sneak, walking, and sprinting.
Both sneak starts predict 0.0294 blocks on their first frame.
Disabled sneak preserves a 0.098-block walking step and sends no simulated sneak flags.
One stationary zero-velocity correction follows a fixture teleport, outside these segments.
This separate correction remains recorded rather than counted as a clean complete session.

The native mixed sequence travels about 19.708 blocks; the translated sequence travels about 19.337 blocks.
The translated run contains 119 forward ticks, including 41 sneak ticks.
Native packet tick counts remain unavailable for this HTTP route, so these timed runs do not establish exact trajectory equality.
The earlier sprint difference is explained by 81 translated input ticks in one repeat versus 80 in another.

The complete dependency build passes: 624 core tests and 600 add-on tests, with 19 and 116 skipped respectively.
Both suites report zero failures and errors. TypeScript checks pass.
The fix stays in the owning input patch; the full add-on stack replays successfully.
Raw journals, account data, server logs, and screenshots remain private.

**Remaining:** Verify other input implementations and the full movement matrix.
The following direct-connection run covers basic keyboard movement and sneak transitions.
Compare native packet timing, prediction history, release behavior, and server corrections across the full movement matrix.
Fluids, collision, steps, climbing, effects, knockback, vehicles, latency, and real-server behavior remain open.
Official BDS remains the primary movement reference. Experimental Boar flags require separate investigation.

## Direct NetherNet launch entry points, October 6, 2026

**Implemented:** Supported NetherNet URI parsing now runs in the shared `ServerAddress.parseString` entry point.
Java 26.3 Quick Play skips the multiplayer screen wrapper that previously attached the custom socket address.
The private direct test initially failed with “Unknown host” before any Bedrock packets arrived.
The redundant screen parser is removed; ordinary address and default-port handling remain intact.

Prism also appends a Java port to its launcher server value, producing an invalid URI with two ports.
The private recorder supplies URI targets through an instance component's exact Quick Play argument.
It now supports direct live add-on recordings and keeps account selection separate from proxy state.
A private readiness marker requires local-player initialization followed by gameplay input.
The requested scene timer starts after that marker, with a separate 20-minute setup bound.
This test allowance does not change production timeouts or weaken strict BDS movement.

The rebuilt direct route reaches BDS HTTP signaling and receives login success on protocol 2193.
An uncached optional licensed asset acquisition then holds resource-pack negotiation.
A private thread dump identifies `BedrockPackageHelper.exchange`, waiting for the helper process.
Increasing output file counts establish active package downloading during the observed wait.
Older private caches have obsolete formats and are correctly rejected; copying them does not complete setup.

The final direct recording completes normally with 676 chunks and 3,619 gameplay inputs.
It records eight forward-input segments without prediction corrections during those segments.
They include two sneak starts, continuous walking with a sneak press/release, denied sneak, and ordinary walking.
Walking and sprinting stop against the wall at Z=9.7; the half-block step raises predicted eye height by 0.5 blocks.
Two stationary corrections follow fixture teleports, outside the movement segments.
Held jumps also produce no additional corrections in this session.
These observations verify direct behavior against BDS; native wall and step trajectory comparisons remain open.

The mixed direct sequence contains 119 forward ticks, including 41 sneak ticks.
Its final BDS position shows about 19.337 blocks of travel, matching the previous proxy sequence within sampled precision.
Native tick counts remain unavailable for this route, so this does not establish exact native trajectory parity.

The optional asset attempt does not publish a current-format cache; joining continues through the existing fallback.
The failure cause remains unresolved. This successful join does not verify licensed built-in image loading.
Improve visible progress and cancellation for cold optional asset acquisition during a join.
Keep this separate from server-pack conversion stalls.

The full dependency build passes with no failures or errors in 624 core tests and 600 add-on tests.
Eighteen focused recorder tests pass after fixing two compile commands that omitted their private-file dependency.
The updated readiness recorder also compiles against the built protocol API.
The previous sneak-fix CI completes successfully across the configured Ubuntu, Windows, and macOS jobs.
Official BDS remains the primary movement reference; experimental Boar flags require separate investigation.

## Licensed archive overlaps and native collision baseline, October 6, 2026

**Implemented:** Built-in asset extraction merges byte-identical files before applying logical byte and file limits.
Different contents still fail explicitly. Raw input limits, archive validation, and atomic cache publication remain intact.

An independent licensed acquisition reproduces the previous join fallback with Bedrock 1.26.51.1/build 51061372.
The helper obtains the license and downloads 6,184 files without a local game installation.
Two language lists occur both loose and archived in `vanilla` and `vanilla_base`.
Both overlaps are byte-identical. The previous loader rejects the first overlap before publishing its cache.
The package expands to 22,251 distinct files and 244,022,807 logical bytes, within the existing limits.

Synthetic regressions cover identical loose/archive and archive/archive overlaps, conflicting contents, and exact logical byte and file limits.
The fix stays in the owning Character Creator patch.
Licensed fixture tests use a 2 GiB heap because cache reuse retains two complete asset libraries.
The initial licensed run exhausts Gradle's default 512 MiB heap. Ordinary tests retain that default.
This test setting does not change client memory limits.

**Verified licensed pipeline:** All 24 asset tests pass with both private licensed fixtures enabled and no skips.
The bundled helper downloads the package, publishes a checksummed cache, and reuses it without another acquisition.
Readback retains all 57 resource layers, the resolved 72 player animation aliases, sound definitions, and sampled built-in emotes.
The alias assertion now matches the earlier native layer-inheritance evidence instead of the latest file's 68 declarations.

**Verified cold production join:** A private Flatpak Prism instance runs the rebuilt client with a 2 GiB heap.
It replaces the obsolete format-7 cache with format 10 and 22,251 checksummed files, then reaches visible gameplay on strict BDS.
The protocol-2193 recording completes normally with 554 chunks and 411 gameplay inputs.
The full dependency build passes 16 converter tests, 624 core tests, and 603 add-on tests without failures or errors.
Core and add-on suites skip 19 and 116 optional cases respectively. Licensed checks run separately as recorded above.

The second production join reuses the cache without changing its size or modification time.
Both recordings complete with visible gameplay and no client errors, exceptions, or disconnects.
This pair reaches the gameplay marker about 179 seconds after cold startup and 22 seconds after warm startup.
These timings include client startup and describe one local pair, not a conversion benchmark.
Visible acquisition progress, cancellation, fresh platform sign-in, and the broader server-pack conversion checks remain separate requirements.

**Verified native endpoints:** The pinned native client joins the owned strict BDS fixture through HTTP NetherNet.
Four-second walking and sprinting inputs stop against the same wall at Z=9.7.
Native walking differs from the prior direct endpoint by less than one millionth of a block.
The sampled native sprint endpoint matches the prior direct Z coordinate.
A two-second step sequence raises native eye height by 0.5 blocks, matching the translated step height.

These samples establish endpoint and step-height agreement for this fixture.
Different input tick counts and small post-input drift prevent a claim of exact trajectory equality.
Native packet timing, other collision shapes, and the remaining movement matrix still require comparison.
The native session ends through Save & Quit before the owned capture processes stop.
Raw assets, licenses, journals, account data, and screenshots remain private.

## Strict BDS jump, fall, and water comparison, October 6, 2026

**Verified sampled endpoints:** A read-only Script API observer records player position, velocity, and ground state on official BDS 1.26.51.1.
It samples 120 server ticks per case with strict movement enabled.
The pinned native client, direct add-on, and ViaProxy each complete single jumps, held jumps, elevated falls, water idling, and held water rises.
The observer does not change movement or server checks.

Held jumps reach Y=102.252197265625 from the Y=101 floor on all three routes.
Five-block falls return to Y=101. The sampled minimum vertical velocity is approximately -0.781136 blocks per tick.
Water-idle cases settle from Y=102 to Y=101.
These server samples can repeat or skip client frames. They do not establish identical trajectories or input timing.

**Found and fixed:** The original ViaProxy water-rise journal contains ten moving prediction corrections during and after the held input.
The direct journal contains no water corrections for the same fixture.
Sampled endpoints alone conceal this difference.
The add-on's existing fluid hooks check the direct protocol selection, which remains Java 26.3 through ViaProxy.
They now also recognize the connection-scoped permission snapshot from ViaBedrock core.
This activates the existing fluid bounds, current handling, water gravity, and player swimming hooks for remote core sessions.
The snapshot clears on disconnect and world exit. Direct activation remains available before the first snapshot.

Two rebuilt ViaProxy water-rise repeats contain no prediction corrections during those cases.
The first repeat matches the direct sampled peak and maximum rise velocity exactly.
The second peak differs from the native sample by less than 0.000008 blocks.
Held input duration and server sampling differ, so this does not prove complete fluid parity.
The fixed single jump and elevated fall retain the sampled native endpoint and fall-speed agreement.

**Still unresolved:** The direct baseline and fixed ViaProxy run each receive two moving corrections around the elevated teleport and fall.
Native raw input and correction comparison is required before changing teleport or velocity handling.
Swimming auth-input transitions through ViaProxy, currents, shallow water, lava, effects, vehicles, and the remaining movement matrix need separate verification.
Experimental Boar results remain diagnostic; official BDS and the pinned native client remain the primary references.

The rebuilt dependency suites contain 16 converter, 624 core, and 603 add-on tests with no failures or errors.
Core and add-on suites skip 19 and 116 optional tests respectively.
The previous asset-fix CI passes every configured Ubuntu, Windows, and macOS job.
Licensed assets, raw journals, observer samples, account data, and screenshots remain private.

### Native packet baseline over NetherNet

**Implemented and verified:** The native recorder now connects to the owned HTTP NetherNet endpoint while retaining its loopback RakNet frontend.
It uses the authenticated account's fresh session key for signaling and game login, preserving native gameplay packet bytes.
NetherNet uses DTLS. Only RakNet enables the Bedrock AES stream after the game handshake, matching the existing core transport policy.
The initial recorder attempts incorrectly enabled AES for NetherNet and never reached gameplay. They remain failed references.

The corrected recording completes normally with visible gameplay, local-player initialization, gameplay input, and completed pack observation.
It captures native single-jump, elevated-fall, water-idle, and water-rise cases, with 120 observer samples each.
No native water-rise correction occurs in this run.
Two zero-velocity corrections follow fixture teleports, including the elevated teleport and the water-idle teleport.
The elevated native case therefore demonstrates that fixture teleports can produce corrections.
It does not explain the additional moving correction in the translated fall cases. That comparison remains open.

**New field-level gap:** Native water-idle packets carry a vertical delta near -0.0223 at sampled eye height 103.4816.
The direct route reports nearly the same position but carries a delta near -0.0996.
Core reconstructs velocity with its air-gravity formula during fluid movement.
The sampled water endpoints and absence of water-rise corrections do not verify this field's parity.
Transport or derive the correct predicted motion in core, with client integration where the native prediction state is required.

The recorder self-test checks unchanged packet bytes across compressed batches, RakNet encryption counters, and unencrypted NetherNet game batches.
All recorder self-tests pass. The four selected journal and native-profile suites pass 38 tests.
`bun run check` also passes. Raw packet journals and screenshots remain private.

### Completed client prediction frames, October 6, 2026

**Implemented:** Core accepts versioned, negotiated local prediction frames on direct connections and through ViaProxy.
Each frame carries feet position, completed motion, and local swimming state.
Core matches the sample against standard Java movement and consumes it once at the next tick-end packet.
Unmatched positions, non-finite values, unknown flags, extra fields, and incompatible revisions are rejected or discarded.
Vehicle prediction and server corrections keep their existing paths.
Ordinary Java clients retain the previous motion approximation.

The add-on samples `LocalPlayer.sendChanges` after normal movement and before Java's tick-end packet.
It sends stationary frames too.
The former Entity-wide swimming hook is removed, so remote entity pose changes cannot produce local swimming input.
Core emits swimming edges from the completed local sample.

**Verified motion:** Native 1.26.51.1 protocol 2193 reports water-idle motion of about -0.022315647 at eye Y 103.4815826.
Both new direct and ViaProxy captures report -0.022315646 at the matching eye Y 103.4815903.
The previous core reported about -0.0996117 because it applied air gravity.
New stationary water-floor frames report -0.005, matching native.
The extended native trace also confirms -0.0784 during dry-floor gameplay; zero-motion dry-floor frames occur during startup.
The implementation forwards completed motion without another gravity approximation.

Both routes reach visible gameplay on strict BDS and complete jump, fall, water-idle, and held water-rise cases.
The observer samples 120 server ticks per case.
Jump peaks are 102.2521973. The sampled fall reaches 101 with minimum vertical velocity about -0.78113556.
Both water-rise peaks are 104.8655014, within about 0.000008 of the native packet baseline's sampled peak.
Neither controlled water case receives prediction corrections.
Different input and observation timing prevents a claim of identical trajectories.

The direct journal includes eight corrections during initial joining at the previous elevated water position.
It also includes two corrections around the elevated fixture teleport.
The ViaProxy journal includes two corrections around that teleport.
The initial joining behavior and teleport timing remain open gaps.
A final reset places the player on the dry floor before each following join.

A ViaProxy sprint-swim test emits one start event (29) and one stop event (30), with no additional correction.
The following section records native and revised direct swimming comparisons.
Swimming poses, currents, shallow water, lava, effects, vehicles, latency, and the remaining movement matrix still need comparisons.

**Tests:** The full local build passes with 16 converter tests, 628 core tests, and 603 add-on tests.
Core and add-on suites have 135 skips in total, with no failures or errors.
Four new tests cover payload validation, protocol revisions, frame consumption, teleport staleness, and swimming edges.
Both complete stacks replay and pass Checkstyle; `bun run check` passes.

### Native swimming start comparison, October 6, 2026

The raw native recorder completes another strict-BDS reference with 1,513 auth-input frames and visible gameplay.
A sprint-swim case in the fixture emits start event 29 and stop event 30.
The native start frame also contains sprint-start event 25 and forward motion 0.01764 blocks per tick.
Native and ViaProxy forward positions and motion follow the same acceleration sequence within float rounding.
The initial Java implementation emits its swimming start one frame later, at motion 0.033516.

**Implemented:** The add-on refreshes local swimming state after sprint changes in `aiStep`, before fluid travel.
Java normally updates swimming before that sprint decision.
The revised direct start frame matches the native start flags and motion, including zero vertical motion.
The complete direct recording has no prediction corrections.
The previous Entity-wide hook remains removed; core still validates samples and constructs auth input.
The repeated ViaProxy recording also matches the native start flags and first forward motion.
Both revised route recordings have no prediction corrections.

**Remaining:** Sprint-stop ordering and collision flags differ on release against the fixture wall.
Native emits swimming-stop event 30 on release, then sprint-stop event 26 on the following frame.
Java emits both events together and retains horizontal collision on the first release frame.
The next native frame and Java frame share water-floor vertical motion of -0.005.
The native reference has one zero-velocity correction from the fixture teleport, outside the swimming case.
Do not treat the matching start frame, acceleration sequence, or a correction-free case as full swimming parity.

### Native swimming release comparison, October 6, 2026

**Reference:** Native 1.26.51.1 protocol 2193 repeats swimming-stop cases at a wall and in open water against strict BDS.
Four stop cases share the same ordering: swimming-stop event 30, then sprint-stop event 26 on the next frame.
The release frame clears horizontal collision and has vertical motion -0.005.
The following frame has vertical collision.
Open-water motion uses sprint drag 0.9 on release and walking drag 0.8 on the following frame.

Releasing sprint while holding forward keeps swimming active.
Releasing forward while holding sprint retains the same event and drag ordering.

The reference journal contains 3,393 auth-input frames and visible gameplay.
Its seven zero-velocity corrections coincide with fixture teleports outside the controlled input cases.
The additional long pool has stone bounds at x -10 through -4 and z 12 through 30.
Its y bounds are 101 through 105.
The existing short wall pool remains intact.

**Implemented:** The add-on updates local swimming after sprint decisions and before fluid travel.
Sprint decisions use the previous completed swimming state.
Forward release therefore changes the swimming pose while retaining sprint drag for that frame.
Other sprint restrictions remain active.
The implementation changes actual physics and does not postpone protocol events independently.

Prediction wire revision 2 adds completed horizontal and vertical collision axes.
Core consumes these axes only with a matching unmounted frame outside dimension changes.
Stationary Java frames therefore cannot retain the previous movement packet's horizontal collision.
Grounded state and collision remain separate.
Ordinary Java clients retain their existing translation.

**Direct verification:** The revised direct connection matches all four swimming-stop cases, including held sprint during forward release.
The wall release flags are [30, 48], then [26, 48, 50], matching native.
The open-water release uses drag 0.9, then 0.8, with the same vertical motion and flags.
Different held-input frame counts prevent an identical absolute-position claim.

Releasing sprint while holding forward preserves swimming until forward release.
One zero-velocity correction coincides with a fixture teleport; controlled release cases have no corrections.

**ViaProxy verification:** The repeated proxy recording matches all four swimming-stop cases and preserves swimming when only the sprint key releases.
Its open-water release uses drag 0.9, then 0.8.
Both routes clear horizontal collision on release and add vertical collision on the following frame.
The direct journal has one zero-velocity correction at a fixture teleport.
The ViaProxy journal has two, both at fixture teleports; none occurs during a controlled release case.
Each observer case records 120 server ticks with floor height 101 and no airborne samples.
Dry-floor sprint and jump inputs also produce movement on both routes.
The final proxy fixture reset interrupts its jump and receives the second zero-velocity correction.

These results verify the tested release behavior.
The full fluid movement matrix remains incomplete.

**Automated verification:** The dependency builds pass with 16 converter tests, 629 core tests, and 603 add-on tests.
There are no failures or errors; 135 tests skip environment-dependent fixtures.
The new codec test covers all eight combinations of swimming and collision axes in stationary frames.
`bun run check` passes.
Swimming surfaces, currents, shallow water, lava, effects, vehicles, latency, and correction reconciliation remain separate requirements.

### Teleport and correction authority, October 6, 2026

**Implemented:** Core tracks the signed Java teleport ID and the latest server teleport independently.
Stale, duplicate, zero, and opposite-sign acknowledgments cannot clear prediction waits or emit `HandledTeleport`.
A later local correction retains the required server acknowledgment without allowing it to unlock the newer local wait.
Every new position sync clears an unused movement exception from an earlier confirmed teleport.
Four tests cover these replacement and acknowledgment cases.

Core now translates corrected player motion as absolute Java velocity in both gliding and other poses.
Zero-velocity corrections reset motion too.
Corrections outside the former tick window apply immediately instead of disappearing.
The general velocity handler replaces the gliding-only implementation from the deferred rocket patch.
Four packet test cases exercise zero, past, current, and future ticks across both gliding states and both velocity cases.

The target is native 1.26.51.1, protocol 2193.
Native strict-BDS recordings establish the correction layout and zero-velocity resets around fixture teleports.
The [nearby packet reference](https://mojang.github.io/bedrock-protocol-docs/1.26.50-preview.26/packets/correct-player-move-prediction-packet/) describes the layout for protocol 2192.
The [movement guide](https://mojang.github.io/bedrock-protocol-docs/guides/player-movement-overview/) describes immediate fallback when usable history is unavailable.
The latest guide targets a newer preview; numeric values come from target captures and generated enums.

**Incomplete:** Corrections inside movement history still need rewind and input resimulation.
Vehicle motion, angular motion, and movement-related metadata, attributes, and effects need corresponding reconciliation.
Immediate correction application does not establish native reconciliation parity.

### Swimming surfaces and capture shutdown, October 6, 2026

**Reference:** The private native 1.26.51.1 journal contains 3,962 auth-input frames and visible strict-BDS gameplay.
It includes upward swimming at about 30, 35, and 45 degrees.
The first two native pitches are -29.998169 and -34.996948 degrees after teleport quantization.
Java comparisons use those recorded angles.
The seven native zero-velocity corrections occur at fixture teleports.

The reference CLI fails its final pack-completion check during shutdown.
Its raw movement journal remains usable, but the capture is not a complete replay reference.
The recorder shutdown hook now closes active channels and waits for their event-loop cleanup and pack export.
The launcher allows 45 seconds after termination, covering the existing 35-second download limit.
A targeted asynchronous shutdown test passes, along with the other replay self-tests.
A new official-client run is blocked by the launcher's GPU safety check until the host reboots.
The safety check remains active; live native shutdown verification remains open.

**Implemented:** Keep the fluid inset symmetric when the swimming box is shorter than twice the inset.
The old negative inset reverses the box, and Java's AABB constructor swaps its bounds.
That delays the first water-surface exit by one frame.
The box test covers six heights, including zero and the short swimming box, while preserving horizontal bounds.

Ignore the old visual crawling classification on a frame that leaves swimming.
Java updates the visual pose after travel, which otherwise reduces input to 30% on that frame.
Allow sprinting in shallow water under the existing movement, food, item, and vehicle restrictions.
Native retains sprinting during the return into water while forward and sprint remain held.

**Direct verification:** The revised direct journal completes with 2,421 auth-input frames and visible gameplay.
All three cases match native flags and motion before re-entry.
Maximum vertical position differences are about 0.000031 blocks, within float rounding.
The 30-degree cap clears vertical motion on the first stationary capped frame, matching native.

**ViaProxy verification:** The repeated proxy route matches native exit flags and motion before re-entry at the same three angles.
Its maximum vertical position difference is also about 0.000031 blocks.
Both routes receive the same five corrections during the steeper re-entry cases.
The proxy route transports completed physics through its negotiated channel and applies standard Java position and velocity corrections.

**Incomplete:** Re-entry starts two frames early at 35 degrees and one frame early at 45 degrees.
Both route runs receive five corrections during those steeper cases.
The result verifies the tested surface exits, not full swimming or correction parity.
Other fluid levels, currents, lava, effects, vehicles, latency, and history replay remain open requirements.

**Automated verification:** The dependency builds pass with 16 converter tests, 636 core tests, and 604 add-on tests.
There are no failures or errors; 135 tests skip environment-dependent fixtures.
All 107 tooling tests, the three replay self-test suites, and `bun run check` pass.
The previous main CI run completes successfully, including Linux, Windows, and macOS jobs.

### Swimming re-entry observations, October 6, 2026

**Implemented:** The private Fabric recorder samples local movement before `aiStep`, before input processing, and after physics.
It records position, motion, pose, fluid state, eye height, and completed collision axes.
It does not change input or physics.
The observer stops after 18,000 samples and writes to the private recording directory.

**Verified:** A direct strict-BDS recording completes with 6,030 samples across the three phases.
At 35 degrees, Java detects submerged eyes one frame before its cached underwater state changes.
The swimming update then uses that cached state and starts two frames before the saved native reference.
At 45 degrees, the same cache sequence starts swimming one frame early.
These observations identify the Java trigger; they do not establish the correct native trigger.

A separate direct recording completes join and spawn with 1,816 auth-input frames.
Its BDS script observer records 120 server frames without changing movement.
The server reports a head offset of about 1.52 blocks while standing and 0.30 blocks while swimming.
The [Script API](https://github.com/MicrosoftDocs/minecraft-creator/blob/main/creator/ScriptAPI/minecraft/server/Entity.md) defines `getHeadLocation()` as the entity head position.
This server measurement does not establish the native client's head position or swimming start condition.
Matching-build executable inspection distinguishes the head-in-water component from the swimming flag.

**Incomplete:** The exact native swimming start condition and tick order still need verification.
Do not infer a replacement eye height or add a fixed delay from these two trajectories.
The native capture launcher currently requires a host reboot after an earlier GPU shutdown did not complete.
Saved native captures, direct and ViaProxy tests, and executable research remain available.
The existing surface-exit results and remaining correction gaps still apply.

**Automated verification:** All 107 tooling tests, the three replay self-test suites, and `bun run check` pass.
Live observer output has file mode `0600`.

### Native swimming trigger and repeated surface exits, October 6, 2026

**Reference:** Inspection of the matching Windows 1.26.51.1 executable identifies the native swimming trigger and bounding-box input systems.
For upward look-direction Y at or above 0.15, swimming starts only when two material probes are non-air.
The first probe uses the breathing point supplied by the head-position query.
The second uses the block above the collision-box center, calculated in single precision.
Head-in-water and sprint intent remain prerequisites.
The [input component declaration](https://github.com/LiteLDev/LeviLamina/blob/main/src/mc/entity/components/PlayerInputRequestComponent.h) corroborates the breathing fields.
The matching executable establishes their use for this build.

The native trigger also checks the breathing block when leaving swimming.
At an unobstructed surface, it stops upward swimming when `acos(direction.x² + direction.z²)` exceeds 45 degrees.
That calculation differs from the pitch angle.
It retains swimming for shallower upward directions or downward directions.

**Implemented:** Add the native material probes before entering local swimming.
Apply the breathing-block and angle checks before travel when leaving swimming, with a standing-space check.
Keep the previous completed swimming state for sprint decisions.
Core continues to build auth-input events and apply server corrections on both connection routes.
The add-on supplies the local physics and completed prediction frame.
These changes are folded into the existing local-prediction patch.

**Verified:** A first direct run removes the premature re-entry but exposes a second surface exit that still uses Java's body-water condition.
That run receives two nonzero corrections at 35 degrees.
The revised run includes the native breathing-block exit check.
Its direct and ViaProxy comparisons each cover 64 movement frames at the recorded 30-, 35-, and 45-degree angles.
All swimming and sprint events match the saved native reference, including repeated exits and re-entry.
Neither route receives a correction during these controlled cases.
Maximum vertical position differences are about 0.000031 blocks; horizontal differences are about 0.000008 blocks.
Maximum motion-component differences are below 0.000000060 blocks per tick.
The direct recording completes join and spawn with 1,518 auth-input frames and one zero-velocity fixture correction.
The ViaProxy recording completes join and spawn with 2,108 auth-input frames and one zero-velocity fixture correction.

**Automated verification:** Dependency builds pass with 16 converter tests, 636 core tests, and 607 add-on tests.
There are no failures or errors; 135 tests skip environment-dependent fixtures.
New tests cover both entry material gates, the look threshold, the body-center boundary, negative coordinates, and the exit angle calculation.

**Incomplete:** These comparisons resolve the recorded early re-entry and repeated-exit corrections.
They do not establish parity for all movement directions, blocked standing space, other fluid levels, currents, lava, effects, vehicles, or latency.
Native input permissions, movement history replay, and the rest of the movement matrix remain requirements.
Fresh native capture and shutdown verification still require the host GPU safety condition to be resolved by a reboot.
Windows and macOS game joins and real-server verification remain separate requirements.

### Swimming beneath blocked standing space, October 6, 2026

**Reference:** Matching-build executable inspection separates the swimming trigger from the swimming-motion calculation.
For ordinary non-jumping, non-flying swimming, every upward direction clears vertical motion when the breathing block is outside liquid.
The trigger can emit a swimming stop only when its standing-space probe is clear.
These checks replace the fitted look-Y cutoff and prevent Java from repeatedly dropping the swimming pose under a ceiling.

**Implemented:** Apply the breathing-material cap during local travel.
Preserve swimming before Java refreshes its pose when standing space is blocked.
Core still owns completed-frame validation, auth-input construction, and server corrections.
Both changes are folded into the existing local-prediction patch.

**Verified:** The strict-BDS fixture adds a ceiling at Y=106 over the existing water pool.
The original 45-degree case receives 22 nonzero corrections and repeatedly changes pose.
The revised direct case receives two initial corrections, then settles at the server's capped surface with zero vertical motion.
ViaProxy receives three initial corrections and then also settles.
The ceiling is removed after each recording.
Both routes complete join and spawn.

Separate 64-frame open-water cases remain consistent with the saved native 30-, 35-, and 45-degree references.
Swimming and sprint events match, with no correction during those controlled cases.
Maximum position differences remain below 0.000031 blocks vertically and 0.000008 blocks horizontally.
Motion-component differences remain below 0.000000060 blocks per tick.

**Automated verification:** The dependency build passes 16 converter, 636 core, and 608 add-on tests.
There are no failures or errors; 135 environment-dependent tests skip.
The cap test covers upward, level, and downward directions with both breathing-material states.
CI for the preceding main commit passes tooling, builds, permissions checks on Linux, Windows, and macOS, and all four native helper targets.
Those runner checks do not establish Windows or macOS game-join parity.

**Incomplete:** The blocked-surface transition still receives initial corrections on both routes.
Sprint cancellation, fluid-state changes, and correction timing need further native comparison.
The ceiling result is a strict-BDS comparison; a fresh native ceiling capture is still required.
The host GPU safety condition still prevents fresh native capture until a reboot resolves it.
Prediction history replay, other movement cases, real-server verification, and Windows and macOS game joins remain requirements.

### Ground-jump events during water rises, October 6, 2026

**Reference:** Saved native 1.26.51.1 protocol 2193 packets distinguish ground jumps from held liquid-rise input.
The pool-floor reference holds `Jumping`, `JumpDown`, and `WantUp` for 29 frames without `StartJumping`.
The two-frame dry jump emits `StartJumping` only on its first frame.
The previous translated water rise already matches native motion, but adds a false ground-jump event on its first frame.

**Implemented:** The add-on observes actual local `jumpFromGround` calls in the completed physics frame.
It resets the observation before local travel and transports it with position, motion, pose, and collision state.
Core validates and consumes the frame, then constructs the Bedrock event.
Revision 3 uses a separate negotiated channel so older payload layouts cannot be mistaken for the new format.
Connections without a completed sample keep the existing Java approximation.
The changes are folded into the existing core and add-on prediction patches.

**Verified:** Both direct and matching ViaProxy routes complete join and spawn against strict BDS.
The direct comparison covers 29 water-rise frames; ViaProxy covers the first 28 native reference frames.
All flags match, including the absence of a ground-jump event in water.
Both routes also match the native two-frame dry jump and retain its first-frame ground-jump event.
Water-rise position differences remain below 0.000008 blocks and motion differences below 0.000000045 blocks per tick.
Neither route receives a correction during these cases.

Separate 64-frame 35-degree swimming cases preserve native swimming, sprint, surface-exit, and re-entry events on both routes.
These cases receive no corrections.
Position differences remain below 0.000031 blocks vertically and 0.000008 blocks horizontally.
Motion differences remain below 0.000000045 blocks per tick.
The initial proxy attempt used an older embedded core and is excluded from candidate verification.
The matching repeat uses the rebuilt ViaProxy JAR with revision-three support.

**Automated verification:** Dependency builds pass with 16 converter, 636 core, and 608 add-on tests.
There are no failures or errors; 135 environment-dependent tests skip.
ViaProxy also builds successfully with the updated core.
The codec covers all sixteen independent pose, collision, and jump combinations, including stationary frames.
Tests reject unsupported wire revisions and mismatched Bedrock protocols, and discard stale or unmatched frames.

**Incomplete:** Automatic and obstructed jumps need native comparisons.
Ordinary Java clients still approximate jump events.
Swimming with jump or flying input, other fluid conditions, blocked-surface transitions, and history resimulation remain requirements.
The real-server and Windows/macOS game-join requirements remain open.

### Jumping while the swimming blend changes, October 6, 2026

**Reference:** Matching Windows 1.26.51.1 executable inspection identifies `CurrentSwimAmountSystem` and `MobJumpSystem`.
The native swimming blend changes by 0.1 toward zero or one, using single-precision arithmetic.
The [component declaration](https://github.com/LiteLDev/LeviLamina/blob/main/src/mc/entity/components/SwimAmountComponent.h) corroborates its current and previous fields.
The matching executable establishes the numeric step for this build; Java 26.3 uses 0.09.
The native jump system suppresses water rises while the blend lies strictly between zero and one.
Its fluid gate uses `WasInWaterFlagComponent`; jumping is already a required component of the system view.

**Implemented:** Replace the separate ten-tick counter with the existing swimming blend.
Preserve its decay after swimming stops, and use the native step on Bedrock connections.
Retain the water and jumping gates.
The former counter resets on release and incorrectly permits immediate rising during the exit transition.
The observer records the blend before input and after physics, without changing movement.
The change is folded into the existing add-on prediction patch; core continues to own validation and auth-input construction.

**Verified:** The original strict-BDS release-and-jump case receives five nonzero corrections during rising and settling.
The revised direct and ViaProxy recordings receive no nonzero corrections.
They suppress rising until the exit blend reaches zero.
Entering swimming with jump held also suppresses motion during the fractional blend and resumes at one, without nonzero corrections.
Both routes complete join and spawn, with 1,718 direct and 2,116 proxy auth-input frames.
Each recording has three zero-velocity fixture corrections.

Separate 35-degree surface comparisons cover 63 frames directly and 64 through ViaProxy.
Swimming and sprint events match the saved native reference, without corrections during those cases.
Maximum position differences remain below 0.000031 blocks vertically and 0.000008 blocks horizontally.
Motion differences remain below 0.000000045 blocks per tick.

**Automated verification:** Dependency builds pass with 16 converter, 636 core, and 608 add-on tests.
There are no failures or errors; 135 environment-dependent tests skip.
`bun run check` passes.
CI for the preceding main commit passes builds, tooling, permissions on Linux, Windows, and macOS, and all four native helper targets.
Runner checks do not establish game-join parity on those platforms.

**Incomplete:** No fresh native combined swimming-and-jump capture establishes the complete input sequence yet.
The following section implements the head-in-water branch and records its narrower verification scope.
Exact native phases, dry jumps with residual blend, flying, other fluid conditions, and crawling need separate comparisons.
Initial blocked-surface corrections and prediction history replay remain unresolved.
Real-server behavior and Windows/macOS game joins remain requirements.

### Swimming jumps at the head-water boundary, October 6, 2026

**Reference:** Matching Windows 1.26.51.1 executable inspection identifies the head-water condition in `MobJumpSystem`.
Water rises stop when swimming is active and the head-water flag is absent.
The fractional-blend condition remains independently active.
The flag update queries the breathing point at interpolation zero and compares its height strictly with the water surface.

The native water-depth calculation uses single-precision operations.
Source and falling water reach the block top.
Flowing depths one through seven subtract their depth divided by nine, with the native division and offset order.
Java's source-water height would stop rising before the native boundary.

**Implemented:** The add-on applies both head and blend conditions within the water and jumping gates.
It uses the native surface calculation and the existing unmounted breathing-point integration.
Core continues to validate completed frames and construct auth input on direct connections and ViaProxy.
The changes belong to the existing add-on prediction patch.

**Direct verification:** The previous short strict-BDS case receives three nonzero corrections in 47 held-jump swimming frames before reaching the wall.
The revised case receives none in 48 frames and holds the accepted surface height.
A separate 150-frame repeat reaches the pool wall without corrections during the held input.
The release-and-jump case retains suppression while the blend decays and resumes rising at zero.
The completed recording joins and spawns, with 3,016 auth-input frames, one zero-velocity fixture correction, and no nonzero corrections.

Separate regressions match 64 saved native surface frames, 29 ordinary water-rise frames, and two initial dry-jump frames, without corrections.
The surface comparison retains native swimming and sprint events.
Maximum surface differences remain below 0.000031 blocks vertically, 0.000008 blocks horizontally, and 0.000000045 blocks per tick in motion.

**ViaProxy verification:** Both the 48-frame surface case and 150-frame wall repeat receive no corrections during the held input.
All short-case positions, motion values, and input flags match the direct route exactly.
The release-and-jump blend gate also remains active.
The same 64 native surface frames, 29 ordinary water-rise frames, and two initial dry-jump frames match without corrections.
The completed recording joins and spawns, with 2,599 auth-input frames, four zero-velocity fixture corrections, and no nonzero corrections.

**Automated verification:** The dependency build passes 16 converter, 636 core, and 610 add-on tests.
There are no failures or errors; 135 environment-dependent tests skip.
Two focused tests cover head and blend combinations and water-depth arithmetic at positive and negative world heights.
`bun run check` passes.
The full add-on patch stack replays successfully.
The preceding main CI run passes the build, tooling, platform permissions, and native helpers on Linux, Windows, and both macOS architectures.
Those runner checks do not establish game-join parity on Windows or macOS.

**Incomplete:** A fresh native combined swimming-and-jump capture remains required.
Player-specific breathing offsets, mounted geometry, exact system phases, and wall-climbing behavior need native comparison.
Flowing and falling water, currents, waterlogged blocks, flying, and residual-blend dry jumps need live verification.
The separate initial ceiling corrections and prediction history remain unresolved.
Real-server interoperability and actual Windows/macOS game joins remain requirements.

### Preserve swimming momentum outside body water, October 6, 2026

**Reference:** Matching Windows 1.26.51.1 executable inspection identifies `WasInWaterFlagComponent` as a required component of the `SwimControlSystem` view.
An airborne swimming pose skips that controller, including its head-out vertical cap.

**Implemented:** The add-on checks body water before running the swimming vertical controller.
The exit frame retains its motion for ordinary air gravity.
Core continues to validate completed samples and construct auth input for direct connections and ViaProxy.
The change belongs to the existing add-on prediction patch.

**Verified:** The previous 45-degree strict-BDS ceiling case discards upward momentum and reports -0.0784000 vertical motion.
The server instead reports +0.0556102.
Both revised routes retain +0.0556104 and receive no correction for that first body-water exit frame.
Both routes still receive two corrections per angle during re-entry, at 35 and 45 degrees.

Separate direct open-water cases match 192 saved native frames across 30, 35, and 45 degrees, including swimming and sprint events.
They receive no corrections during those cases.
Maximum differences remain below 0.000031 blocks vertically, 0.000008 blocks horizontally, and 0.000000060 blocks per tick in motion.
ViaProxy matches 64 saved native frames at 45 degrees without corrections.
Its 48-frame held swimming-jump regression also receives no corrections.
Both recordings join and spawn with protocol 2193.

The dependency build reports 16 converter, 636 core, and 610 add-on test cases.
There are 135 skips and no failures or errors.
The full add-on stack replays successfully.

**Incomplete:** Packet and local-frame evidence shows server actor metadata clearing the local swimming state before ceiling re-entry.
Matching executable inspection identifies a native metadata queue carrying the server tick; core currently discards that tick.
The queue's application, predicted flags, correction history, and resimulation require further research and implementation.
The first air-frame fix does not establish complete ceiling parity.
Fresh native ceiling captures remain required, alongside the broader movement, real-server, and Windows/macOS game-join requirements.

### Retain crawling after swimming ends, October 6, 2026

**Reference:** Strict BDS 1.26.51.1 clears `SWIMMING` and sets `CRAWLING`, bit 114, at the ceiling exit.
The sparse update retains the 0.6-block body height.
Matching executable inspection also confirms that native flag reconciliation uses the historical frame at the server tick.
It treats swimming and crawling as independent predicted flags.

**Implemented:** Core translates crawling into the short Java player pose without setting the swimming shared flag.
It composes pose metadata after retaining all fields in a sparse update.
Ending crawling restores the remaining player pose.
The change belongs to the existing deferred metadata patch, whose upstream owner remains [ViaBedrock PR 327](https://github.com/ViaVersionAddons/ViaBedrock/pull/327).

Java 26.3 remote players retain server pose metadata; the local player recalculates its pose each tick.
The existing add-on prediction patch retains core's short crawling pose through the native actor state channel.
It preserves sleeping, gliding, and spin attack poses and supports direct connections and ViaProxy.

**Direct verification:** Both 35-degree and 45-degree strict-BDS ceiling cases retain a 0.6-block body while swimming is off.
Each receives one nonzero correction during re-entry, compared with two per angle before the change.
The completed recording joins and spawns with protocol 2193 and contains 3,017 auth-input frames.
It receives two nonzero ceiling corrections and one zero-velocity fixture correction.

Open-water regressions match all 192 saved native frames across 30, 35, and 45 degrees, including swimming and sprint events.
They receive no corrections during those cases.
Maximum differences remain below 0.000031 blocks vertically, 0.000008 blocks horizontally, and 0.000000060 blocks per tick in motion.
The 48-frame held swimming-jump regression matches the preceding accepted reference exactly in position, motion, and input flags.

**ViaProxy verification:** Both ceiling cases retain the short body while swimming is off.
They still receive two nonzero corrections per angle.
The proxy case retains swimming for one extra completed frame before the server crawling update takes effect.
This timing difference reinforces the need for local native transitions and server-tick reconciliation.

The 64-frame 45-degree open-water regression matches the saved native reference without corrections.
Its 47-frame held swimming-jump regression matches the direct route exactly in position, motion, and input flags.
The completed recording joins and spawns with protocol 2193 and contains 2,722 auth-input frames.
Its four corrections occur in the two ceiling cases.

**Automated verification:** All four project builds pass.
There are 16 converter, 639 core, and 610 add-on test cases, with 135 skips and no failures or errors.
Three new core tests cover sparse flag retention, word order, independent swimming state, and pose restoration.
The full core and add-on stacks replay successfully, and `bun run check` passes.
The preceding main CI run passes builds, tooling, platform permissions, and all four native helper targets.
Runner checks do not establish Windows or macOS game-join parity.

**Incomplete:** Ceiling re-entry still receives a correction on each tested angle.
Predicted crawling input transitions, native local state transitions, server-tick history, and resimulation remain requirements.
The native flag merge preserves newer local predicted state only when the historical server frame agrees.
Ignoring authoritative swimming changes would not reproduce that behavior.
Fresh native ceiling captures remain required, alongside the broader movement, real-server, and Windows/macOS game-join requirements.

### Predict native local posture, October 6, 2026

**Reference:** Matching 1.26.51.1 executable inspection establishes the local posture rules and the request flags that control them.
Native posture uses independent swimming, crawling, and sneaking flags.
Block-space probes use heights of 1.8, 1.49, and 0.6 blocks, with a 0.01-block inset and float arithmetic.
Flight suppresses requested sneaking.
Gliding, passengers, spectators, and spin attacks bypass forced crouching or crawling.
The swimming movement boundary uses float bits `0x3effffff`.
Raw executable data and decompilation remain private.

**Implemented:** Core exposes the posture decision as `PlayerPosture.next`.
The add-on supplies local block collisions and input before travel.
Its desired crawling pose follows local prediction instead of waiting for server metadata.
Core retains swimming and crawling edge tracking and auth-input construction for direct connections and ViaProxy.
Forced sneaking remains separate from physical sneak input.
The completed revision-4 payload carries all three posture flags, motion, collision axes, and ground-jump events.
The changes belong to the existing core and add-on prediction patches.

**Verified:** Both strict-BDS routes emit crawling start and stop events and retain the short body during the 35-degree and 45-degree ceiling cases.
Direct receives one nonzero correction per angle.
ViaProxy receives two at 45 degrees and one at 35 degrees in this run.
The remaining first re-entry frame differs in input scale, sprint state, and water drag.
The additional proxy correction follows the first correction's delivery delay.

Direct open-water regressions match 191 saved native frames across 30, 35, and 45 degrees without corrections.
ViaProxy matches another 192 frames across the same angles without corrections.
Maximum differences remain below 0.000031 blocks vertically, 0.000008 blocks horizontally, and 0.000000060 blocks per tick in motion.
The direct 48-frame held swimming-jump case matches the preceding accepted reference exactly.
ViaProxy receives no corrections during its 49-frame held case; the first 48 frames match the direct reference exactly.
All three recordings reach join and spawn with protocol 2193.
The second direct recording ends through an intentional stop after its two regression cases.

All four builds pass, and `bun run check` passes.
There are 16 converter, 648 core, and 612 add-on test cases, with 135 skips and no failures or errors.
New tests cover native posture transitions, independent physical sneak input, probe geometry, and all 64 payload flag combinations.
The full core and add-on stacks replay successfully.
The preceding main CI run passes builds, tooling, platform permissions, and all four native helper targets.

**Incomplete:** Native input and sprint phase ordering, server-tick flag history, authoritative reconciliation, and resimulation still require implementation or verification.
Local posture prediction does not establish full ceiling parity.
Fresh native ceiling and combined swimming-jump captures remain required.
The broader movement, real-server, and Windows/macOS game-join requirements remain open.

## Bundled native resources, October 6, 2026

The add-on now ships Bedrock 1.26.51.1 built-in resources instead of acquiring the game package during joining.
Five archives contain 22,264 files and 244,022,807 expanded bytes.
The supplied PistonDecompiler checkout contains only the executable, so extraction uses the matching installed resource package.
Every file from the previous licensed cache matches the installed bytes.

The runtime checks versions, archive checksums, paths, counts, and size limits before sharing one indexed library.
The provider runs on ViaBedrock's resource executor and requires no account, Store sign-in, writable cache, or network fetch.
Server resource packs retain precedence.
Owned Marketplace content continues to use receipt-authorized downloads.

This removes the acquisition wait introduced in 0.3.0.
The reported `RakClientOfflineHandler.onTimeout` occurs during the offline handshake, before ordinary pack preparation.
Removing acquisition does not by itself establish the cause or resolution of that specific timeout.

**Verification:** The replayed add-on and its dependencies build successfully.
The add-on suite passes 470 tests; 114 private-fixture tests are skipped.
All 15 bundled-loader, image-provider, and tint-mask cases pass without skips.
These include real resource loading, default emote sampling, and native image resolution without account state.
The tooling suite passes 110 tests, and the first upstream patch still applies to the pinned base.
A new live server join with the bundled build remains unverified.

### Native water input and the third actor flag word, October 6, 2026

**Reference:** Matching 1.26.51.1 executable inspection identifies the native input calculator at `0x1404495e0`.
It bypasses posture slowdown during flight, previous swimming, or water contact before input.
Caller adapter `0x14669d7d0` identifies the water argument as `WasInWaterFlagComponent`.
The request writer at `0x148b58fe0` copies the processed movement coordinates.

**Implemented:** Core holds the shared input decision in `PlayerPosture.slowsMovementInput`.
The add-on samples water contact before input and uses the same decision for local physics.
Revision 5 carries the sample through direct connections and ViaProxy.
Core applies the water bypass before the crawl-to-swim posture transition.
Codec tests cover all 128 flag combinations and reject incompatible revisions and unknown bits.

**Actor flags:** Native registration function `0x142a3f010` assigns one flag handler to metadata IDs 0, 92, and 139.
Core now retains all three unsigned words, with independent sparse updates and clearing.
The third word contains uniform air drag, nameplate depth, and inside-pickability flags.
Their physics, rendering, and interaction behavior remain separate requirements.

**Direct verification:** The 35-degree and 45-degree strict-BDS ceiling cases each complete 64 forward frames without corrections.
Both re-entry frames use full forward input, restart sprinting, start swimming, and stop crawling in the same frame.
The 64-frame swimming case with held sneak also receives no corrections.
The open-water case matches 64 saved native frames without event mismatches or corrections.
Its maximum position difference is less than `0.000008` blocks.
The 48-frame held swimming-jump case matches the preceding accepted reference exactly in position, motion, and input flags.
The recording contains one zero-velocity fixture correction outside those cases.

**ViaProxy verification:** The 45-degree ceiling case completes 64 forward frames, and the 35-degree case completes 63, without corrections.
The swimming case with held sneak completes another 63 frames without corrections.
The open-water case matches 64 saved native frames with the same small float differences as the direct route.
The 48-frame held swimming-jump case matches the direct reference exactly.
All 302 comparable frames across the five cases match the direct route exactly in position, motion, and input flags.
The recording contains two zero-velocity fixture corrections outside those cases.

**Build verification:** All four projects build, and both patch stacks replay successfully.
The build passes 16 converter, 651 core, and 584 add-on test cases, with 133 skips and no failures or errors.
`bun run check` passes.

**Incomplete:** Swift Sneak scalars, item-use slowdown, native history replay, and fresh native ceiling comparisons remain requirements.
The current-boot native GPU guard still prevents a fresh native launch.
Passing strict BDS does not establish full native movement parity.
Broader movement, real-server, and Windows/macOS game-join requirements remain open.

### Swift Sneak and normalized input, October 6, 2026

**Reference:** Matching 1.26.51.1 executable inspection identifies `SneakingSystem` at `0x14b192c50` and its callback at `0x14b193600`.
They compute `min(1F, 0.3F + level * 0.15F)` with separate float operations.
The bonus requires the prior sneaking or crawling flag.
Registration `0x14681da00` places input before the scalar producer and applies sneak actions later.
**Implemented:** Core retains that scalar in `SneakingInputState`, consumes it, then produces its successor before applying the new posture.
This preserves the startup phase without a tick counter.
The add-on uses the same state for local physics.

Equipment update `0x1432760e0` reads enchantment 37 from leg slot 2.
It creates the enchantment component only when absent and removes it for nonpositive levels.
Positive replacements retain the original level until removal.
Core and the add-on share that lifecycle, including idle updates.
Parser `0x14519b430` reads the low byte of a short ID and defaults incorrectly typed fields to zero.
Lookup `0x1432602c0` returns the first matching entry.
Valid Java enchantment translation uses the same lookup, so duplicate entries cannot give the add-on a different Swift Sneak level.

The native input calculator normalizes directions before applying the scalar.
The add-on now retains that normalization instead of Java's square-speed expansion.
This also corrects ordinary diagonal walking and unenchanted diagonal sneaking.
Connections to Java servers retain their existing local input behavior.

Four additional test methods cover scalar boundaries, equipment lifecycle, typed enchantment lookup, and duplicate entries.
Another test covers the retained scalar across startup, release, removal, re-equipping, and crawling.
All four project builds pass, with 16 converter, 656 core, and 584 add-on test cases.
There are 133 environment-dependent skips and no failures or errors.
Both complete patch stacks replay, and `bun run check` passes.

**Live verification:** Strict-BDS direct and ViaProxy runs each complete ten controlled cases without movement corrections.
They cover base sneaking, level 1, retained positive replacements, removal, fresh levels 2 and 3, and diagonal movement.
The direct cases contain 399 forward frames; ViaProxy contains 402.
All 397 comparable frames match exactly in position, motion, movement vectors, and input flags.
Fixture teleports produce zero-velocity corrections outside these cases.
Both recordings complete join and spawn with protocol 2193.

**Incomplete:** Fresh native Swift Sneak captures remain required because the current-boot native GPU guard prevents another native launch.
Boar comparisons, ordinary Java clients without the add-on, item-use slowdown, and correction history need separate verification.
Opposing physical directions still need native cancellation in core's direction helper.
These cases do not establish complete movement parity or Windows/macOS game-join compatibility.

### Opposing physical directions, October 6, 2026

Matching Bedrock 1.26.51.1 input calculator `0x1404495e0` adds opposing physical directions before normalization and slowdown.
**Implemented:** Core now cancels those directions on each axis while retaining the physical input flags.
This broadens the existing direction helper in patch 0004.
The full-stack test in this patch covers all sixteen key combinations with six input scales.
It also retains unrelated sneak and sprint flags.

All four project builds pass, with 16 converter, 657 core, and 584 add-on test cases.
There are 133 environment-dependent skips and no failures or errors.
The full core stack replays, the standalone direction patch applies to the pinned base, and `bun run check` passes.

**Live verification:** Strict-BDS direct and ViaProxy runs each complete eight controlled cases without movement corrections.
They cover opposing longitudinal input, opposing lateral input with forward movement, both axes, sneak combinations, and a forward control.
The direct route contains 322 controlled frames; ViaProxy contains 320.
Every captured movement vector matches the native calculation.
Both held directions remain present in the physical flags.
All 318 comparable frames match exactly in position, motion, movement vectors, and input flags.
ViaProxy receives one zero-velocity fixture correction outside these cases.
Both recordings reach join and spawn with protocol 2193.

The preceding build sent incorrect vectors in seven cases, but strict BDS accepted them without controlled corrections.
A clean strict-BDS result alone therefore does not establish input parity.
**Incomplete:** Fresh native captures remain required because the current-boot native GPU guard prevents another native launch.
Item-use slowdown, correction history, broader movement, real-server interoperability, and Windows/macOS game joins remain requirements.

### Native item-use slowdown and completion, October 6, 2026

Matching 1.26.51.1 executable inspection identifies the native item-use reader at `0x143fd7e10`.
An absent `minecraft:use_modifiers` component returns `0.35F`.
A present component without `movement_modifier` returns `1F`.
Producer `0x14c5f5e00` creates slowdown only outside the float epsilon boundary around one.
Consumer `0x14c60f9a0` squares the modifier before multiplying each posture-scaled input coordinate.
The native default therefore produces `0.122499995F`, rather than Java's default `0.2F`.
The phase-9 reset at `0x14c610370` removes the component after the frame.

The [official component reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_use_modifiers?view=minecraft-bedrock-stable) describes movement modifiers and vibrations.
The matching executable establishes the default, float arithmetic, and application order for this build.
Core translates network and resource-pack definitions into Java `USE_EFFECTS`.
Shield blocking retains its separate posture path.
Ordinary Java clients receive the component and use server item-use state for the auth-input fallback.
That fallback still needs live verification without the add-on.

The add-on suppresses Java's earlier item-use multiplier on Bedrock connections and applies the translated multiplier after posture input.
Revision 6 carries the scale actually used by completed local physics through direct connections and ViaProxy.
Core constructs the packet vector from that sample instead of reconstructing it after consumption or slot changes.
Codec tests cover all 128 flags with four scales and reject invalid scales and incompatible revisions.
Three modifier tests cover component defaults, vibration behavior, the native float boundary, and exact coordinate products.

The [matching completion schema](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/completed-using-item-packet/) describes protocol-2193 `COMPLETED_USING_ITEM`.
Strict-BDS captures confirm its signed little-endian item ID and use-method fields.
Core now translates matching selected-item completion into Java's `USE_ITEM_COMPLETE` event.
It preserves authoritative inventory counts and cancels completion for a replaced selected item.
Seven parameterized packet cases cover use methods, signed IDs, replacement protection, field consumption, and unchanged counts.

All four projects build, and both complete patch stacks replay successfully.
The build passes 16 converter, 667 core, and 584 add-on test cases, with 133 skips and no failures or errors.
`bun run check` passes.

Live strict-BDS direct and ViaProxy recordings both reach join and spawn with protocol 2193.
Each route covers bow charging, diagonals, sneaking, bow and trident release, repeated eating, and a forward control.
They contain 402 controlled frames each.
The charging vectors retain the native squared modifier and normalized diagonals.
Release restores full input on both routes.
All 240 comparable frames across five cases match exactly in position, motion, movement vectors, and input flags.
The timed trident release differs by one input frame between routes, so its complete trajectories are not counted as exact matches.

The direct repeated-eating case receives one nonzero correction, compared with four before completion translation.
ViaProxy receives no corrections during the seven controlled cases.
Its two zero-velocity corrections occur at fixture teleports outside those cases.
An additional 101-frame ViaProxy case consumes the last food item, restores full input, and receives no correction.
The visible hotbar is empty after consumption.

**Incomplete:** Repeated eating still needs native prediction and completion timing research because the direct correction remains.
Fresh native captures remain required; the current-boot native GPU guard prevents another native launch.
Custom modifier integration, ordinary Java clients, Boar comparisons, correction history, broader movement, and actual Windows/macOS joins remain requirements.
These results establish the named calculations and comparisons, not complete native movement parity.

### Inventory snapshots during item use, October 6, 2026

**Implemented:** Core installs complete inventory snapshots before it notifies slot observers.
Full item equality suppresses unchanged notifications and preserves count and stack network ID changes.
This change belongs to the existing server-authoritative inventory patch 0003.
Single-slot predictions retain their notifications because existing predictions can mutate stored items before the update.
Two tests cover repeated snapshots, count and ID changes, coherent callback contents, and snapshot array ownership.

All four project builds pass, and the complete core and add-on stacks replay.
The build contains 16 converter, 669 core, and 584 add-on test cases.
There are 133 environment-dependent skips and no failures or errors.
`bun run check` passes.
The preceding commit's CI also passes its Ubuntu, Windows, and macOS tooling gates.
Those gates do not establish actual platform game joins.

**Live verification:** Direct and ViaProxy strict-BDS recordings each reach join and spawn with protocol 2193.
Each route covers seven controlled cases with 399 movement frames, followed by repeated eating and last-item consumption.
The additional cases contain 260 direct frames and 262 ViaProxy frames.
All 157 comparable frames across bow charging, diagonals, sneaking, and a forward control match exactly.
Bow release differs by one input frame between routes, so its complete trajectories are not counted as exact matches.

Each route contains ten food completions.
Every completion sends one equipment update, compared with three in the preceding recordings.
The real count and network ID update remains present.
Both routes consume the last item and restore full movement input.

**Incomplete:** Eating corrections remain.
Direct receives one correction during controlled eating and one during additional repeated eating.
ViaProxy receives two during controlled eating, three during additional repeated eating, and two after last-item consumption.
Fixture teleports produce three separate zero-velocity corrections on direct and one on ViaProxy.
The snapshot change removes duplicate equipment updates but does not establish native completion parity.

Matching executable inspection identifies duration callback `0x14c6109b0`, used by both named item-use duration systems.
It decrements positive remaining ticks and stops at zero.
Removal callback `0x14c5f5cb0` instead checks the actor's `USINGITEM` flag before it removes active-use components.
Zero remaining duration alone therefore does not establish the correct local completion transition.
Full query membership, local completion, acknowledgments, and correction history still require research.
Fresh native captures, custom modifiers, ordinary Java clients, Boar comparisons, broader movement, and actual Windows/macOS joins remain requirements.

### Native item-use acknowledgment validation, October 6, 2026

**Implemented:** Core rejects `COMPLETED_USING_ITEM` use methods outside 0–16 before it sends Java completion.
This change belongs to the sustained item-use patch 0008.
Ten parameterized packet cases cover valid methods, both range boundaries, negative values, integer extremes, replaced items, and unchanged inventory counts.

Matching executable inspection confirms packet ID 142 and its `CompletedUsingItemPacket` name through vtable `0x14e8974b0`.
Factory `0x1416bbec0` installs dispatcher `0x15185b618`.
Dispatch function `0x141734170` selects handler slot `0x4b8`, which resolves to native handler `0x141306470`.
The handler resolves the short item ID and accepts only unsigned use methods below 17.
It dispatches an event through `0x142fea260` and marks the packet handled.
A native diagnostic string identifies that event path as `ActorEventCoordinator::sendActorUseItem`, carrying actor, item, and use method.
This handler does not directly call the actor's local completion function.
Its downstream listeners still require inspection.

The native actor tick function separately checks active and held item identity, selected slot, and container.
Its zero-duration branch calls completion function `0x1401eb190`, then clears active use.
That completion function emits an event before a world-side gate and can construct an inventory transaction and completion packet.
The side gate and event subscribers remain unverified.
Current SDK vtable offsets differ from the matching executable, so they cannot establish these mappings alone.

**Verification:** All four projects build, including complete core and add-on stack replay.
The build passes 16 converter, 672 core, and 584 add-on test cases, with 133 skips and no failures or errors.
`bun run check` passes.
The preceding inventory snapshot change also passes GitHub CI, including Ubuntu, Windows, and macOS tooling gates.
Actual platform game joins remain separate requirements.

The private movement observer now records item-use state, remaining and elapsed ticks, item identity, and active and held counts.
Direct and updated ViaProxy strict-BDS recordings reach join and spawn with protocol 2193.
Both show Java's counter reaching zero and sometimes −1 before the acknowledgment resets use or clears the last stack.
The matching native duration callback instead stops decrementing at zero.
Direct repeated eating contains 160 moving frames and five nonzero corrections around the observed completion period.
Its last-item case contains 101 moving frames and no correction.
ViaProxy repeated eating contains 158 moving frames and two corrections.
Its last-item capture shows completion, an empty held stack, and restored full movement input without a correction.
That capture ends after 23 moving frames, before the full planned five-second hold, so it is a partial movement case.

**Incomplete:** Local completion prediction and late acknowledgment correlation for repeated same-item use remain unresolved.
These observations locate a timing difference but do not establish the cause of every correction.
Fresh native captures, custom modifiers, ordinary Java clients, Boar comparisons, broader movement, and actual Windows/macOS joins remain requirements.

### Native completion side gate and bounded duration, October 6, 2026

**Native evidence:** Matching executable inspection resolves the previously unknown completion side gate.
All three inspected Level vtables map slot `0x9e8` to getter `0x14117c450`, which reads `Level+0x238`.
Base constructor `0x14114e0c0` copies that byte from `LevelArguments+0x120`.
Client factory `0x14086eef0` sets the argument to one before calling ClientLevel constructor `0x1412efe30`.
The client therefore skips completion's inventory transaction and packet-sender branch.
This proof uses the matching executable's constructors and named Level assertions, rather than current SDK offsets.

Completion function `0x1401eb190` first dispatches item event 7, then clears active use.
The item coordinator getter uses Level slot `0x628` and manager field `0x28`.
The packet acknowledgment instead dispatches actor event 19 through slot `0x618` and manager field `0x8`.
The item dispatcher invokes a gameplay handler synchronously before processing additional listeners.
Those consumers and their inventory effects remain untraced.
The side gate alone does not establish whether every local event preserves inventory.

**Implemented:** The add-on keeps the local Bedrock player's remaining item-use duration at zero after it expires.
Native callback `0x14c6109b0` decrements positive duration only and clamps at zero.
Java 26.3 otherwise continues into negative duration while awaiting acknowledgment.
The change belongs to prediction patch 0025 and preserves the existing server completion and inventory paths.
Other players and Java connections retain their existing counters.

**Verification:** All four projects build, and the complete core and add-on patch stacks replay.
The build contains 16 converter, 672 core, and 584 add-on test cases, with 133 skips and no failures or errors.
`bun run check` passes.
Both strict-BDS recordings reach join and spawn with protocol 2193.
Direct repeated eating contains 160 moving frames; its last-item case contains 100.
ViaProxy contains 161 repeated-eating frames and 101 last-item frames.
Each route records 232 completed active-use frames with no negative duration.
Direct records 11 active-use frames at zero; ViaProxy records 10.
Each route receives seven server completions, with one equipment update per completion, and finishes with an empty held stack.
Direct repeated eating still receives three nonzero corrections; ViaProxy receives none in this recording.
Neither last-item case receives a correction.
The bounded counter does not establish local completion or correction parity.

**Experiment:** A separate local-completion prototype reaches join and spawn through direct connections and ViaProxy with protocol 2193.
Direct repeated eating contains 159 moving frames; ViaProxy contains 160.
Each route receives two nonzero corrections during repeated eating.
Both last-item cases contain 100 moving frames and no correction.
The observer also records delayed updates clearing a newly started use cycle.
These results do not establish synchronized native completion, so the production change retains only bounded duration.

**Incomplete:** Trace item and actor event consumers, local completion order, and repeated-use inventory and metadata synchronization.
Compare fresh native captures when the current-boot GPU guard permits them.
Custom items, ordinary Java clients, Boar, correction history, broader movement, and actual Windows/macOS joins remain requirements.

### Native completion handlers and historical actor flags, October 6, 2026

**Reference:** Further inspection uses the matching 1.26.51.1 executable through PistonDecompiler and Ghidra.
The native executable, decompiled functions, and emulation fixtures remain private.

Base Level constructor `0x14114e0c0` selects client coordinator constructor `0x142d94f80` when LevelArguments byte `0x120` is true.
That constructor retains the base actor and item coordinators from `0x141133690`.
Their owner fields are manager offsets `0x8` and `0x28`.
Their coordinator pointers occupy `0x10` and `0x30`.
Each coordinator stores its gameplay handler at offset `0x60`.

The constructor-installed item handler dispatches local event 7 through `0x1411842f0` and `0x1411843b0` to handler slot `0x28`.
Its target, `0x141183e60`, returns the continuation result without accessing inventory.
The constructor-installed actor handler dispatches acknowledgment event 19 through `0x141183c80` to slot `0xa8`.
Its target, `0x1400e19a0`, also returns continuation without accessing inventory.
Additional listeners and later handler replacement remain untraced.
These results establish the default handlers, not every possible event consumer.

Native food function `0x1401eae60` checks the same client-side getter before its player event 8 dispatch.
The client branch skips that dispatch but still reaches the nutrition and saturation update at `0x14020a000`.
This narrows the local completion investigation without assuming that Java's consumable implementation matches Bedrock.

**Historical flags:** Packet dispatcher `0x1417332d0` selects handler slot `0x670`.
The specialized client receiver at vtable `0x14e7af110` supplies handler `0x141341480`.
The base receiver's empty slot does not establish that native ignores actor metadata.
The specialized handler queues metadata with the packet's nonzero server tick through `0x142a1e830`.
Assignment callback `0x1490464b0` applies the historical flag command and invokes `0x14326d6a0` when the using-item bit changes.
That client callback removes component `0x6b006dfe` when the bit clears, or refreshes it from the item definition when set.
The matching executable's component-name string identifies that component as `DealKineticDamageComponent`.
This callback does not establish ordinary food completion behavior.

Native kernels `0x142dea7a0` and `0x142dea8a0` compare server flags with historical flags before merging into replayed state.
The first two predicted masks are `0x030010811000011a` and `0x00041018100000e0`.
The first mask includes using-item bit 4.
Metadata IDs 0, 92, and 139 update their selected word independently.
The third word assigns its three defined flags without prediction masking.

**Verified within scope:** Emulation executes the matching native bytes for 3,194 cases with no mismatches.
The cases cover all three metadata IDs, random historical and current words, every single-bit server value, and returned changes.
An unchanged historical using-item bit preserves a newer local start.
A server change from historical use to stopped use still clears the bit and requires later-frame replay.
Ignoring every server clear would therefore discard authoritative changes.
This verifies the flag kernels, not complete movement replay or visible item-use timing.

The [official movement overview](https://mojang.github.io/bedrock-protocol-docs/guides/player-movement-overview/) describes historical actor updates and replay before the next input simulation.
Its current portal targets a newer protocol.
The executable inspection establishes the target-build implementation described here.

**Incomplete:** Core still discards the actor-data tick and applies translated metadata immediately.
The production fix requires historical movement state, ordered corrections, and replay of later inputs, including item-use transitions.
It must retain immediate handling when usable history is absent and preserve ordinary Java clients and both connection routes.
Local completion remains incomplete until delayed metadata, acknowledgments, inventory counts, custom items, and repeated-use timing agree.
The latest CI passes Ubuntu, Windows, and macOS build/tooling checks.
Actual Windows and macOS game joins remain unverified.
All eight coverage groups and the broader movement requirements remain active.

### Native correction snapshots and replay policy, October 6, 2026

**Reference:** Matching-build inspection now traces the correction command, snapshot selection, queue, and local-player replay policy.
The executable and emulation fixtures remain private.
These results define the behavior needed for core prediction history.

Command dispatcher `0x142890390` first checks for the corrected frame at server tick T.
When that frame exists, it compares the command with captured state from T+1.
Snapshot accessor `0x143297c50` reads actor flags at snapshot offset `0x160` only when presence bit 46 is set.
The matching component-name string identifies the capture as `MovementDataExtractionUtility::MovementSnapshotComponent`.
Function `0x1433dd810` indexes its storage with stride `0x600`, or 1,536 bytes.
Missing target frames skip historical comparison and use live flags.
An available frame without a snapshot component also uses live flags for comparison.
If a captured component lacks its flags presence bit, the command cannot compare those historical flags and applies through its live-state fallback.

The dispatcher always applies the command to live state.
When the command changes predicted historical flags, it adds the command to the following frame through queue function `0x142bbcd70`.
If that following frame is absent, it retains the command in the future-correction queue.
When the target frame is absent, it instead retains the command at the current frame, if available.
Each flag command retains its computed mask for later replay.

Wrapper `0x142890810` bounds an old server tick to the earliest stored tick.
For an available historical frame before the current tick, it asks the installed policy whether replay is needed.
If the policy requests replay, the wrapper marks the following frame as a correction frame, when present.
This schedules replay; the wrapper does not simulate later inputs itself.

Installer `0x1467eb5c0` selects constructor `0x142890a10` for an actor with `LocalPlayerComponent` in its client branch.
It bounds configured history capacity to 1 through 1,000 frames before creating ActorHistory at `0x142bbbfc0`.
The installed policy vtable is `0x14e83a270`.
Decision function `0x142898240` requests replay for a nonzero command result.
The separate server branch installs another policy through `0x142890a80`; its replay decision returns false.
The [SDK enum declaration](https://github.com/LiteLDev/LeviLamina/blob/e0c75244af2f7576058976ab6d75a17e10de3f92/src/mc/entity/utilities/AdvanceFrameResult.h) supplies result names as a research lead.
The target executable establishes the decisions described here.

**Verified within scope:** Exact native command and queue emulation passes 2,420 cases.
The outer wrapper and local-player replay decision pass another 3,370 cases.
Cases include all three metadata words, random flags, wrapped ring buffers, expired ticks, missing frames, absent captures, and future corrections.
Each invocation reaches its return sentinel; selected flags, queue entries, wrapper results, and correction marks match the expected behavior.
The fixtures use synthetic ECS containers and preallocated queues.
They exclude allocation ownership, full input and physics replay, and visible native-client behavior.

**Incomplete:** Map snapshot extraction and restoration, captured inputs, and the phase that replays later frames.
Core must also correlate server ticks with completed client frames before using this policy.
The existing prediction payload has no frame identifier or complete item-use state.
Production still applies actor metadata immediately, and local completion remains excluded.
The latest CI completes its build, tooling, and Ubuntu/Windows/macOS permission jobs successfully.
Actual Windows/macOS game joins, ViaProxy replay, and all eight coverage groups remain requirements.
