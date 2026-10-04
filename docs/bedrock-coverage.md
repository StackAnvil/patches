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
| G4 | Animation commands, entity overrides, mob properties, and equipment updates | Incomplete | Connect server updates to authoritative state and runtime playback. |
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
| R1 | General actor controllers and scripts | Incomplete | Complete transitions, weighted entries, variables, events, queries, and render-controller selection. |
| R2 | Server particle dispatch | Incomplete | Retain actor identity and Molang variables, then route effects into native playback through both connection routes. |
| R3 | Particle runtime | Incomplete | Complete components, actor contexts, child effects, concurrency, and visible lifecycle comparisons. |
| R4 | Server audio | Incomplete | Native capture verifies PlaySound coordinates already use eighths of a block. Core transports signed loops, optional playback fields, handle controls, and ordered sound resources through direct connections and ViaProxy. Add-on playback controls pass captured-session OpenAL checks on both routes. Complete listener-range eligibility, captions, stream policies, audible comparisons, and broader lifecycle verification. |
| R5 | Custom block geometry and lighting | Incomplete | Converted packs carry physical properties through ViaProxy. Both routes verify distinct collision/selection bounds, standing height, and light values with the add-on. Complete ordinary-Java carrier occlusion, rotated nonuniform scale, legacy texture variation, bottom-face native comparisons, and directional light occlusion. |
| R6 | Equipped attachables | Incomplete | Transport graphs through ViaProxy. Complete variants, explicit bindings, per-bone materials, and material families. |

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
The full build passes 907 tests with 110 optional asset skips.
The core patch's seven targeted tests and both Checkstyle tasks also pass alone on the upstream base.

These muted checks establish the tested controls, not audible parity.
The sample uses a mapped Java fallback without Store sign-in.
Live custom samples, listener-range eligibility, captions, stream interruption policies, replacement races, finite-loop controls, and broader lifecycle comparisons remain required.
The direct replay still fails its separate skin rendering gate; the audio checks use transport-only verification.

### Native caption behavior

The inspected 1.26.51.1 executable has SHA-256 `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`.
Private executable probes establish caption dispatch and storage behavior; production caption rendering remains missing.

The dispatch probe executes 587 cases in native function `144f040c0`.
It supplies settings, player pose, string copying, and the caption sink at explicit boundaries.
The native function rejects disabled captions, nonpositive supplied volume, absent caption metadata, and empty sound names.
The ambient filter suppresses caption keys beginning with `subtitles.ambient.` or `subtitles.weather.`.
It does not suppress an entity key merely because that key ends in `ambient`.

Directional cues use the supplied forward and up vectors and the player position.
The native function normalizes the source direction and uses a forward-dot threshold of 0.5.
An additional marker bypasses direction calculation and reaches caption storage unchanged.
The caller's interpretation of that marker still needs tracing.
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
The production implementation must transport caption translations and reproduce these controls on both connection routes.
The marker's source, default settings, update clock, range eligibility, and visible layout still need native comparisons.
These executable checks do not establish audible or visible parity.

The sound-control change also passes the [complete main-branch CI build](https://github.com/StackAnvil/patches/actions/runs/37169088563).

## Skins, persona, and Dressing Room

| ID | Requirement | Status | Remaining evidence or work |
| --- | --- | --- | --- |
| S1 | Animated face composition and native tint blending | Unverified | Existing production paths need broader native face, channel, mask, and outfit comparisons. |
| S2 | Complete local persona assembly | Incomplete | Resolve unavailable free assets and remaining geometry, layering, and animation sources. |
| S3 | Classic geometry and animation formats | Incomplete | Complete inherited legacy sources, aliases, metadata, and inheritance comparisons. |
| S4 | Emotes and animation fidelity | Incomplete | Complete unavailable remote assets, events, effects, platform filters, timing, rotations, and scale comparisons. |
| S5 | Native first-person and held-item drawing | Incomplete | Submit sampled native geometry and complete charging, equip, swing, equipment, and input timing. |
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

The complete stack build passes with the input permissions and HUD visibility changes.
The effect-icon correction also passes the complete core suite and applies independently to the pinned upstream base.
The core suite reports 445 tests with one optional fixture skip.
The add-on suite reports 530 tests with 109 optional fixture skips.
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
