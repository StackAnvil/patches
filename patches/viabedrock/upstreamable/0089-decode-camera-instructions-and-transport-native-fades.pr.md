# Decode camera instructions and resolve server camera effects

## Purpose

Implement server fades, shared FOV transitions, and camera shake in core. Keep the target instruction fields available to integrations that implement the remaining camera behavior.

## Target evidence

- Target: Bedrock 1.26.51.1, build 51061372, protocol 2193.
- The matching server emitted seven instructions: default fade, zero-duration fade, colored fade, FOV set, FOV clear, free-camera set, and camera clear. Both codecs consumed every byte. FOV easing uses a string on the wire.
- [Gophertunnel's camera codec](https://github.com/Sandertv/gophertunnel/blob/80c811b6186016b3860c358368cfa47e507f26e9/minecraft/protocol/camera.go) supplies an independent implementation for protocol 2193. The target schema also includes optional spline identifiers and JSON loading flags.
- Native fade application at `1466ee7d0`, timeline insertion at `146778300` and `1467780a0`, and the updater at `146707d00` establish defaults, overlapping fades, tolerance, and expiration. Private probes supply component storage, elapsed time, and memory operations. They execute the actual target timeline functions.
- [Microsoft's camera guide](https://learn.microsoft.com/en-us/minecraft/creator/documents/CameraSystem/CameraCommandIntroduction?view=minecraft-bedrock-stable) describes overlapping fades and their minimum duration. Target executable comparisons establish the behavior for our pinned build.

## Design

Decode each optional field independently. Preserve absent versus false booleans, signed actor IDs, and bounded spline lists.

Core combines fades into a color and opacity timeline. A versioned payload carries the timeline and elapsed time after joining and channel registration. Late registration does not restart the fade. Clients without the rendering channel remain connected.

Invalid fade values leave the active timeline unchanged. Malformed wire layouts and excessive counts still fail decoding.

FOV commands clamp targets to 30–110 degrees and store radians. The shared model preserves native easing overshoot and clear removal timing.
An immediate set retains an existing transition. An eased set retains an existing clear flag.
Ordinary camera clear removes the FOV override without clearing the fade timeline.
Native instruction application at `1466f1230` and a captured native clear flow establish this reset.

The `viabedrock:camera_fov` payload carries a sequenced command and an elapsed transition snapshot.
Live clients supply their current rendered projection and normal local projection to the shared rules.
Core retains an unresolved local projection when that context is unavailable. A late subscriber resolves it locally.
Snapshots preserve elapsed progress; they do not restart the transition.
Historical changes to the local projection during an unsubscribed interval remain unverified.

## Verification

Targeted tests cover state transport, expiration, overlapping colors, and invalid inputs. Optional private comparisons cover seven server packets, 42 independent fades, and 105 overlapping sequences with 735 samples.

Private FOV comparisons cover 640 native easing factors and 288 native updater sequences.
The factor comparison differs by less than 0.00000001. These tests exclude command setup and native local-projection lookup.

Full stack builds and rendered connection checks are recorded in the coverage ledger.

## Remaining work

Fade and FOV behavior are applied. Preset rendering, camera movement, target tracking, splines, attachments, and aim assistance remain incomplete.
Native local FOV modifiers, late context changes, pauses, transfers, and broader lifecycle behavior need further comparisons. Retaining a decoded instruction does not establish camera state or behavioral parity.

## Camera shake

The pinned server emitted eight packet-159 messages during an owned native capture.
Each contains little-endian intensity and duration floats, then type and action bytes.
The [matching Gophertunnel codec](https://github.com/Sandertv/gophertunnel/blob/80c811b6186016b3860c358368cfa47e507f26e9/minecraft/protocol/packet/camera_shake.go) provides an independent wire reference.
Stop clears both queues, regardless of its type byte.

Native handler `14131c3a0`, component initialization `14136a0d0`, and updater `144898310` establish separate queues and lifecycle rules.
Overlapping intensities sum with a cap of four.
When an event expires while another remains, intensity decreases toward the remaining sum at one unit per second.
Removing the last event removes the component immediately.

Native sampler `149743610` uses continuous two-dimensional simplex noise with three shuffled axes.
The application at `1466fcc70` adds position offsets in world space and changes pitch and yaw without adding roll.
Live arguments from `142415e20` establish the player camera defaults: frequency 10, amplitude five degrees in radians, and noise multiplier four.
The native schema names these fields at `14d342410`.

Core retains the queues and advances their time on its connection event loop.
The versioned `viabedrock:camera_shake` payload carries sequenced commands and resumable state.
Late subscribers receive the remaining lifetime and noise seed.
Invalid additions preserve active state; unknown actions do not create effects.

Seven targeted tests cover overlap, decay, caps, stop, expiry, transport, continuity, and invalid inputs.
Private fixtures compare eight authored noise samples and twelve native queue updates.
Native recordings, executable data, and assets remain private.
Rendered route checks and their limits are recorded in the coverage ledger.

## Received camera presets

Core now handles packet 198 and retains all protocol-2193 preset fields in the connection storage.
Instruction indexes refer to the received list, including unresolved entries.
The local six-preset table and CubeCraft's four-preset table assign different indexes to third-person cameras.
The implementation resolves names through the received table rather than a fixed built-in index map.

The [pinned Gophertunnel codec](https://github.com/Sandertv/gophertunnel/blob/80c811b6186016b3860c358368cfa47e507f26e9/minecraft/protocol/camera.go) supplies an independent wire reference.
Local, CubeCraft, and authored custom tables contain 337, 231, and 493 bytes respectively.
Both codecs consume every field and reproduce each payload exactly.
The custom capture contains eight presets and nine camera instructions.
Its child supplies only height, yaw, player-listener selection, and an explicit false player-effects value.

Native resolver `1409f28e0` inherits missing optional fields through the nearest ancestors.
An explicit false or zero remains an override.
An aim-assist object inherits as a whole, without merging its optional children.
Starting-rotation flags and values remain those of the child, outside ordinary optional inheritance.
These retained flags still need camera activation behavior.

The resolver supports forward references without recursion.
Cycles, missing ancestors, and unrecognized roots remain unresolved and produce a diagnostic.
Duplicate names reject the replacement atomically, preserving the previous table.
That duplicate policy protects the state; native duplicate-name behavior remains unverified.
Counts are bounded before allocation, and unresolved entries never shift instruction indexes.

Seven targeted tests pass, including all three private wire fixtures.
All four stack builds pass.
Complete direct and ViaProxy replays retain identical eight-preset tables and resolved child values.
Their scene hashes match the native capture, and transport and existing skin-rendering checks pass.
The replay audit regression test covers buffer ownership and detection of an unhandled table.
This change establishes decoding and inheritance state in core.
This preset-registry milestone did not implement activation or rendering. The movement section below records the subsequent production path.

## Native movement research

The private probe executes 4,608 samples through native blend updater `146786500` across all 32 easing modes.
Cases include moving targets, parent movement, yaw wraparound, near-vertical rotation, immediate durations, and endpoint completion.
Imported math functions and authored component storage form the probe boundary.
The probe executes the target blend arithmetic and native easing functions.

An independent private model compares position and FOV exactly and quaternion components within `0.0000000298023223876953125`.
That comparison uses the observed native easing factor to isolate pose arithmetic.
It does not establish Windows CRT bit identity or production Java movement behavior.
Nine additional native samples verify that other rendering fields remain unchanged during blending and copy from the target after completion.
Visible native captures confirm authored custom views and eased transitions, but translated rendering still needs implementation and comparisons.

## Free-camera commands and shared movement

Core resolves free-camera position, rotation, facing targets, inheritance, and persistent overrides for each received preset index.
A `default` command clears the position and rotation overrides.
Invalid commands preserve the active camera and its previous overrides.
The resolved payload also retains player-effects and audio-listener choices.
The client now applies audio-listener selection. Player-effects application remains incomplete.

The renderer supplies its interrupted frame to the shared `CameraPoseTimeline`.
Core owns quaternion conversion, the incremental blend, shortest yaw rotation, easing overshoot, and endpoint rendering fields.
The same updater accepts moving targets and parent displacement for subsequent follow-camera integration.
That arithmetic does not implement a follow-camera target resolver.

Seven targeted tests pass without skips using the private target-build fixtures.
They cover all 4,608 native blend samples, all nine recorded commands, and twelve native facing arithmetic cases.
The facing probe executes the instruction kernel with authored position and previous rotation.
It verifies cardinal directions, vertical targets, coincident targets, and the native `0.01` distance thresholds.
Full instruction lookup and optional-field selection remain outside that kernel probe.

The versioned position channel carries the same resolved commands through direct connections and ViaProxy.
The rendering client owns only frame inputs, camera application, and perspective integration.
Core cannot recover an unknown old rendering frame during late subscription.
A snapshot therefore restores the settled target instead of constructing a new blend.
Exact restoration during an existing blend remains incomplete.

The three built-in first/third-person commands activate their requested perspectives.
The add-on still uses Java collision and distance rules for those targets.
Their activation does not establish Bedrock pose parity.
Follow/orbit cameras, splines, attachments, tracking, aim assistance, custom controls, and pose/FOV coupling remain incomplete.

Complete direct and ViaProxy replays pass transport and existing skin-rendering checks.
Both reproduce all five free-camera targets, the short yaw arc, overshoot, perspective activation, and clear.
Their complete scene hashes match the native capture, and core preset reports match byte for byte.
Stationary screenshots still differ in projection, lighting, and foliage.
This verification establishes movement behavior, with visible parity still incomplete.
One ViaProxy attempt timed out before presets; the completed retry does not establish a fix for that intermittent handshake.

## Camera audio listeners

Absent listener fields select the camera, including built-in presets.
Only the resolved value `1` selects the player.
Native preset application at `1409eed30` adds `MinecraftCamera::PlayerAudioListenerComponent` only for that explicit value.
The target built-in preset assets contain no listener override.

Native query `1409f62f0` checks the active camera usage entity for that marker.
It does not inspect pose blend progress or copied rendering fields.
Native updater `1446d0800` selects both position and orientation.
Camera listeners copy the rendered view.
Player listeners use the interpolated actor position and its current pitch and yaw.
Shared core math reproduces the native float sine lookup and normalized forward/up vectors.

The private probe executes 72 target listener updates, including missing markers and invalid weak contexts.
Eighteen samples select the player.
The actual target query, updater, and actor interpolation helper execute with authored component storage.
Virtual client lookup, clock access, and security/CRT boundaries use probe inputs.
These tests exclude camera activation ordering and the provenance of actor position coordinates.

Five targeted tests pass with no skips using the private fixtures.
They cover native player orientation, inherited listener overrides, the camera default, and existing command/facing behavior.
The add-on applies the current command's listener choice independently of its visual blend.
Native activation timing, eye height, vehicles, death, and audible panning remain unverified.
Route checks are recorded in the coverage ledger.
