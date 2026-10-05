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
There are 108 explicit registrations, 19 explicit cancellations, and 42 automatic fallback cancellations.
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
| U1 | Presets, instructions, splines, shake, and aim assistance | Incomplete | Implement packet state, client behavior, lifecycle, and ViaProxy transport. |
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
A separate bounded archive transports `texts/*.lang` in pack order through the converted resource pack.
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

**Implemented:** Core exports a separate, bounded particle archive alongside sound and caption archives. It retains JSON particle definitions, render controllers, PNG/TGA images, and every source pack index. Texture-only overlays can override lower definitions, including already licensed built-in effects. Conversion does not require built-in assets to discover these images. Converted-pack format 3 invalidates caches that lack this archive.

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

The core and add-on use MochaFloats 6.0.2 parser, lexer, and interpreter modules. ViaBedrock and ViaProxy now require Java 25. The add-on already requires that version. ViaProxy no longer builds a Java 8 artifact.

Intermediate arithmetic, numeric constants, assignments, and numeric bindings use floats. This corrects conditions that previously compared double results before the final float conversion. Tests exercise the 16.7-million integer boundary, fractional equality, variable updates, property inputs, and controller UV values.

The [official property guide](https://learn.microsoft.com/en-us/minecraft/creator/documents/introductiontoentityproperties) documents float evaluation. The [pinned fork source](https://github.com/PlayerAnimationLibrary/mochafloats/tree/1a5dc0fc18bb7f8e7237c0de9cb66299362048ab) supplies the float runtime. Host extensions retain string equality, precedence, typed packet variables, easing functions, and execution limits.

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

**Implemented:** Core exports a separate native actor archive in converted-resource format 4. It preserves resolved pack order and server provenance across definitions, geometry, controllers, animations, materials, images, translations, samples, and item bindings. Existing sound, caption, and particle archive formats remain compatible. The frontend reconstructs the same core loaders from an accepted server resource pack. Resource reload and disconnect clear its cached snapshot.

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
| Current main | Provider waits for acquisition | Optional I/O failures return no images | Removed on both native transports |

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
The current source retains cached assets and headless acquisition in every consent mode.
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
The CubeCraft scene exposes an unsupported opaque particle effect with texture `_`.
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
The existing item classifier, busy-hand branch, and replacement threshold remain unchanged.

**Native evidence:** The matching Bedrock 1.26.51.1 executable, build 51061372, updates both heights with a maximum step of 0.4.
Native function `1447af310` targets zero for its animated-replacement classification and one for its other classifications.
Execution of its arithmetic instructions covers 900 combinations of initial heights and independent hand classifications.
Minecraft 26.3 instead multiplies the retained main-hand target by the cube of `getItemSwapScale(1)`.
That method derives its scale from the item swap ticker and attack strength delay.
The add-on changes that return value inside the hand tick only for matching native appearances.
It retains the original call and does not change attack strength or inventory state.

**Incomplete or unverified:** Native item comparison rules, busy-hand behavior, replacement thresholds, complete swap timing, and final held-item pixels need further comparisons.
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
