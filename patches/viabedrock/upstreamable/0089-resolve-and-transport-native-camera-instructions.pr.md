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

Fade, FOV, shake, free-camera movement, entity tracking, and follow-orbit frames now execute. Follow-camera parity, splines, and aim assistance remain incomplete.
The sections below record the verification scope and remaining pose differences.
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
Follow/orbit cameras, splines, attachments, aim assistance, custom controls, and pose/FOV coupling remain incomplete.
Entity tracking now has a shared frame runtime, with comparison limits recorded below.

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


## Entity target tracking

Core now transports free-camera preset identities and target generations on `viabedrock:camera_tracking`.
Target commands do not advance the position-blend sequence.
The shared runtime updates inactive cameras and preserves their rotations across camera switches.
Explicit rotation and default commands have separate revisions, so position changes retain a stopped target's rotation.
Clear removes targeting. Target removal retains the last desired angles.
An acquired target cannot resume through a replacement actor lifetime.

The frame solver applies angular speed, first-frame snapping, horizontal and vertical limits, tracking radius, and the 1024-block removal limit.
It uses the native sine table for actor-relative center offsets.
Target 1.26.51.1 functions `1466f7fd0`, `1466fe8c0`, `1466fe310`, `14677b940`, and `14677b300` supply execution evidence.
The private comparisons cover 960 angular-step samples and 160 chained samples across 32 tracking sequences.
The chained samples exercise initialization, moving targets, limits, radius exit, return, and snap rearming.
They use authored component storage and entity centers, with host boundaries for CRT math and ECS marker operations.

A combined comparison exposed float rounding at a half-turn: the target normalizes yaw before subtracting the initial horizontal center.
The solver now preserves that operation order.
The comparison fixtures remain private and optional. Ordinary regression tests cover lifecycle, switching, transport, and explicit resets.
The comparisons do not cover the complete ECS scheduler, preset construction, the zero-speed inline path, actor-relative offsets, or visible rendering.
Late subscription also lacks the previous rendered tracking history, so it does not establish continuous native pose restoration.


The complete candidate build replays all 102 core patches and 38 add-on patches in the private lab.
All four projects build successfully with the pinned ViaFabricPlus artifacts and bundled Bedrock resources.
Core runs 1,224 tests: 1,194 pass and 30 optional cases skip.
The add-on runs 936 tests: 816 pass and 120 optional cases skip.
All 18 converter tests and four ViaProxy tests pass. Checkstyle reports no failures.
The offline tooling, 261 regression tests, and patch metadata checks also pass.


A direct NetherNet run against BDS 1.26.51.1 verifies live target movement, center offset, inactive-preset continuity, angular speed, removal, default, and clear.
The rendered audit measures 19.99 degrees per second for the configured 20-degree camera.
The server completes the full sequence in a fresh world with one target.
A fresh ViaProxy run passes the same sequence and measures 19.96 degrees per second.
Both routes verify delivery and add-on execution. Official-client visual parity remains open.


The previous add-on supplies a negative control in a separate fresh world.
It reaches gameplay and receives the complete command sequence, but retains its initial camera rotation and fails the orientation assertions.
The candidate passes the same assertions. The candidate artifact and manifest are restored after the control.
Both owned servers, Java clients, and the isolated display stop cleanly.


## Combined camera actions

Position and FOV handling share the native rule that selects one camera action before clear.
Target and target removal now take precedence over clear, preserving the active preset and position blend.
Attachment, detachment, and spline instructions also prevent lower-priority actions from running.
Those actions still require their own rendering implementations.
FOV runs only when its action wins, and clear resets FOV only when clear wins.
Optional false flags do not select an action.

A private comparison executes 864 action selections from the pinned native client.
It covers set, attach, detach, target removal, target, FOV, spline, and clear.
Boolean flags cover absent, false, and true values.
The probe executes every dispatch instruction and stops at the selected action body.
It establishes action selection, not ECS construction or action execution.
Ordinary regression tests cover target and removal with clear, FOV and spline selection, false flags, and unsupported-action fallthrough.
A storage regression also checks emitted FOV sequences and reset commands when actions compete.


The final action-selection build replays all 102 core patches and builds all four projects.
Core runs 1,228 tests: 1,196 pass and 32 optional cases skip.
The 864 native selections pass within that suite.
The add-on runs 936 tests: 816 pass and 120 optional cases skip.
All 18 converter tests and four ViaProxy tests pass. Checkstyle and patch metadata checks pass.


## Orbit component model

`CameraOrbit` now supplies the shared frame math needed by follow cameras.
It retains separate radius, yaw, and polar velocities, wraps angular errors, and applies native input limits and inversion flags.
Radius smoothing measures the previous camera against the current pivot.
A supplied collision radius overrides the target radius directly, including a previous result above a newly reduced target.
The zero-spring path does not inspect the previous camera position.

The pinned client package's `follow_orbit` definition overrides all three spring rates to zero.
It uses a 10-block radius and polar limits of 0.1 and 179.9 degrees.
These values differ from the component constructor defaults.
The package and extracted definitions remain private.

Private comparisons execute 270 chained native orbit frames and 120 native input updates.
They cover moving pivots, zero and positive springs, angle wrapping, inversion, limits, and collision-radius replacement.
The probes use authored component state and host CRT math boundaries.
They exclude actor binding, collision queries, input collection, complete ECS scheduling, and visible rendering.

The follow-camera integration below uses this solver. Collision queries and complete native frame scheduling remain incomplete.


The orbit-model build replays all 102 core patches and builds the converter and core with matching resources.
Core runs 1,233 tests: 1,201 pass and 32 optional cases skip.
The 864 action selections, 270 orbit frames, and 120 input updates pass within that suite.
All 18 converter tests, Checkstyle, and patch metadata checks pass.


## Follow-orbit frames and attachment transport

Core publishes follow presets, rotation revisions, and attachment generations on `viabedrock:camera_follow`.
The channel uses a bounded, versioned codec and preserves signed actor IDs.
Core sends the new position mode only when the rendering client also registers this channel.
View and entity offsets persist per preset. Attach and detach update their own generation without restarting position blends.

`CameraFollowRuntime` advances each preset instance before the active camera blend.
It uses the pinned follow profile, native attachment rotation, view-offset transform, and look-at orientation.
Explicit attachments use native actor identities and physical centers. Actor identity reuse cannot silently acquire an old attachment.
The local adapter receives the protocol player-origin offset from core instead of using Java eye height.

Private instruction probes compare 256 composed native frames, including attachment rotation, view offsets, and quaternion orientation.
The probes execute the pinned input limiter, orbit updater, attachment matrix, boom matrix, view transform, and look-at helper.
They use authored actor origins and local attachment points.
They do not establish native actor-pivot lookup, activation rules, collision avoidance, full scheduling, or visible parity.

The add-on integration is described in its [camera patch](../../viafabricplus-bedrock/upstreamable/0023-render-core-resolved-camera-movement.pr.md).

The matching four-project build replays 102 core patches and 38 add-on patches.
Core runs 1,239 tests: 1,207 pass and 32 optional tests skip.
All 256 composed frames, 270 orbit frames, 120 orbit inputs, and 864 action selections pass.
The add-on has 816 passing tests and 120 optional skips. Converter and proxy tests also pass.
Checkstyle, tooling checks, 261 offline regressions, and patch metadata checks pass.


## Shared avoidance updater

`CameraAvoidance` supplies the avoidance math used by follow-camera frames.
It casts eight offset corner rays, then applies ordered horizontal and vertical feelers on both sides.
Weights apply only when a feeler improves the previous closest distance.
The solver preserves immediate corner contraction, spring recovery, seat spring overrides, and the actor-state collapse branch.
The native minimum can expand a requested radius below that minimum, even when all rays miss.

The caller supplies the camera pose, resolved pivot, projection clearance, actor-state flag, and world ray results.
A missing orbit radius uses measured camera distance, as native fixed-boom cache preparation does.
Angular feelers require a nonzero direction.

Private probes execute 2,400 chained native frames and compare 14,400 queries, including their origins and endpoints.
They execute both native cache preparation paths, the complete updater, and optional seat override lookup.
Host boundaries supply world ray results and CRT math.
Separate native constructor and assignment probes establish empty default feelers and the pinned follow profile's zero spring and 0.25-block minimum.

The follow runtime calls this solver after attachment and view offsets.
Actual per-type world geometry, solid-state mapping, seat overrides, and complete frame scheduling still require native validation.
These component comparisons do not establish rendered collision parity.

The converter and replayed 102-patch core stack build successfully with matching resources.
Core runs 1,243 tests: 1,211 pass and 32 optional tests skip. All four new avoidance tests pass.
Converter tests and Checkstyle pass.

## Camera ray intersections

`CameraRaycast` supplies float traversal and box surface intersections for the avoidance integration.
It visits the starting cell and at most 200 subsequent cells.
Equal traversal fractions choose Z, then Y, then X.
Box intersections preserve the native squared-direction threshold, inclusive edges, and face priority.
A ray that starts inside a box can hit its exit surface.
A segment wholly inside the box has no surface hit.

The caller supplies base and extra-layer blocks, material identities, pick policies, and world-space bounds.
The tracer preserves native layer changes and material transitions.
Fluid surfaces remain auxiliary results and do not stop the camera by themselves.
Custom blocks require a nonempty collision envelope, then intersect their selection box.
A disabled selection box produces no camera hit, even with collision enabled.

Private probes execute 1,800 native box intersections and 810 native world rays.
The comparisons cover every base and extra-layer lookup, hit position, and hit face.
They include 300 material-transition cases and four cases with distinct collision and selection bounds.
They include negative coordinates, large coordinates, thin boxes, shared edges, denied blocks, and the 200-step limit.
The probes execute native overlay lookup, air fallback, default filter dispatch, the common camera-bound wrapper, and custom block intersections.
Host boundaries supply authored block lookup, collision envelopes, absent random offsets, world height checks, and the CRT security-cookie check.
These comparisons exclude actual registry geometry, block-specific overrides, native actor lookup, and rendered collision parity.

A separate probe executes 108 native point-state cases.
It establishes floored block lookup and the exact material-byte, type-flag, and cached-block-byte conditions.
Native cache preparation identifies the cached byte as solid rendering.
The predicate also requires a motion-blocking material and the cube-shaped property.
The add-on uses converted custom-block occlusion metadata and Java solid-render state as its current world mapping.
Actual per-type parity of that mapping remains unverified.

## Follow avoidance integration

Follow instances apply avoidance around the pivot that includes attachment and view offsets.
The native camera definition's near plane supplies 0.025-block clearance.
The subject origin supplies the solid-state sample.
Avoidance changes position after the look-at calculation and retains that orientation.
Preset instances retain independent avoidance state and continue before the active blend.

Private comparisons execute 768 composed native follow frames in authored empty, wall, and inside-block worlds.
They compare the final pose and every corner-ray origin and endpoint.
The probe executes native attachment, view offsets, cache preparation, solid-state lookup, world tracing, and avoidance.
Host boundaries supply authored actors, block geometry, cache-pool lookup, and CRT math.
The native definition constructor supplies the near plane.
These comparisons do not establish real actor-pivot lookup, actual registry geometry, complete ECS ordering, or official-client visible parity.

The complete build replays all 102 core patches and 38 add-on patches.
Core runs 1,251 tests: 1,219 pass and 32 optional tests skip.
All six raycast tests, six follow-runtime tests, 18 converter tests, and four proxy tests pass.
The add-on has 816 passing tests and 120 optional skips. Checkstyle passes.


The target executable supplies behavior and numeric conditions.
The [Material fields](https://github.com/LiteLDev/LeviLamina/blob/4ca13569fc0d1cdeb873cf6e7c48ddcc7a74e59c/src/mc/world/level/material/Material.h),
[block property names](https://github.com/LiteLDev/LeviLamina/blob/4ca13569fc0d1cdeb873cf6e7c48ddcc7a74e59c/src/mc/world/level/block/BlockProperty.h),
and [direct component fields](https://github.com/LiteLDev/LeviLamina/blob/4ca13569fc0d1cdeb873cf6e7c48ddcc7a74e59c/src/mc/world/level/block/components/BlockComponentDirectData.h)
provide independent names for matching layouts.
These headers do not replace target-build execution or establish per-type registry values.


A fresh direct NetherNet recording verifies six live geometry stages against the target Bedrock server.
The wall moves the rendered camera from X = 5.00 to X = 2.85.
Removing the wall restores X = 5.00.
The recording also verifies view-offset clipping, collapse at a solid subject origin, and clear.
The candidate completes recording and normal cleanup.

The previous follow-capable add-on supplies three wall observations at X = 5.00 after the same server sequence.
Its normal Java shutdown fails with the recorder file still open.
Those observations confirm the expected missing collision behavior, but the control recording has an incomplete lifecycle.
They do not establish a complete passing negative control or official-client visual parity.
