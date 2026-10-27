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

After explicit approval, ownership checks preceded the forced stop of the hung control client.
Its launcher exited, and its owned display and audio helpers stopped normally.
The control recording remains incomplete.

## Spline programs and native wire fields

Core resolves named and inline splines into shared programs for each free-camera instance.
Spline commands do not select a perspective or restart its blend. Inactive free cameras also advance.
Clear, preset replacement, and disconnect release playback state.
Explicit position revisions let repeated coordinates and default resets replace a retained spline pose.
The separate `viabedrock:camera_tracking_v2` channel carries those revisions.

Packet 338 replaces the complete named-definition table without changing a running compiled program.
Identifiers use the first exact, case-sensitive match, including duplicates.
Named instructions use the definition's duration, curve, and channels instead of their inline fields.
Curve types accept ASCII case variants of `linear` and `catmullrom`.
Omitted easing inherits the preceding easing within its channel, starting with linear.
Progress and rotation retain separate easing state.

The pinned server supplied a 149-byte definition packet and named playback instructions.
Instructions carry a mandatory type byte, identifier string, and load flag.
The previous optional-field decoder misread the identifier length and disconnected.
The [target instruction schema](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/camera-instruction-packet/)
and [definition schema](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/camera-spline-packet/) agree with the captured bytes.
The pinned Gophertunnel codec differs here and is not the authority for these fields.
Captured named, inline, and empty-channel packets consume and reproduce every wire byte.

The target executable supplies chord-weighted segment timing and endpoint tangents.
Its factories require four Catmull-Rom points or three linear points, despite their lower-count error messages.
Interpolation uses the earlier frame's easing and preserves authored frame order.
Rotation channels interpolate radians directly before quaternion conversion.
An update beyond the duration retains the preceding pose without an endpoint snap.
Arithmetic overflow stops playback before an invalid pose reaches rendering.

## Spline replacement and retirement

A command received during playback replaces the curve and duration, appends its keyframes, and restarts time.
It retains earlier frames without sorting them, including when new frame times restart at zero.
Named and inline commands share this behavior.
An empty replacement channel retains the running channel's frames.

The negotiated `viabedrock:camera_spline_v2` channel distinguishes live commands from complete snapshots.
Live commands compose against each instance's playback state; snapshots install retained channels without appending them again.
Duplicate sequences cannot restart playback or append frames twice.
The runtime releases applied command payloads and retired instance programs.
Core releases expired snapshot history on its connection tick, using its own clock.
A deterministic clock test covers exact duration equality, strict expiry, and the next fresh request.

The implementation bounds cumulative keyframe counts before allocation and rejects a composition before changing any instance.
Fresh empty channels reach invalid reads in the target updater.
Java rejects these requests safely; it does not reproduce those invalid reads.
That protection differs from the target's unsafe behavior for these inputs.
Unsupported definitions and invalid compositions preserve accepted playback.

Private probes execute 64 mixed replacement cases with 352 chained camera samples and 12 retirement cases with 22 updates.
They execute the native compilers, initialization, time updates, curve evaluation, curve ownership release, and pose application.
Host callbacks record component removal; authored storage supplies component presence.
Allocation, free, CFG dispatch, memory copying, and CRT trigonometry remain explicit boundaries.
These probes do not establish full ECS query scheduling, activation selection, or official-client visible parity.
Core/client pause and queue timing remain unverified.
Late subscriptions after completion still cannot recover the prior rendered frame.

## Spline verification

Earlier probes compare 26 factory cases, 220 curve evaluations, 84 inline playback samples, and 56 named playback samples.
Named lookup and compilation cover 36 cases; whole-table replacement covers four transitions.
An earlier completed live recording checks named playback, repeat, both inline curve types, clears, and repeated position commands.
Its 21 sampled poses match independent geometry within 0.000006 blocks.

The completed previous-client control accepts all new server stages and completes normal cleanup.
Its replacement poses fail the independent retained-channel verifier.
The server also emits empty replacement and fresh-empty requests without a script error.
Native numeric comparisons remain distinct from live Java execution and official-client visible parity.


A fresh candidate recording passes inline replacement, named-to-inline replacement with empty channels, and inline-to-named replacement.
All 13 sampled replacement poses match independent geometry within 0.000006 blocks.
Clear and repeated position selections pass. A fresh empty request preserves the current view.
Both candidate and control recordings complete normal cleanup, and all their owned processes are gone.
The candidate screenshot confirms the restored local view.

All four projects build successfully after replaying 102 core patches and 38 add-on patches.
Core has 1,236 passing tests and 32 optional skips.
The add-on has 816 passing tests and 120 optional skips.
All 18 converter tests and four proxy tests pass.
Checkstyle, offline regressions, and patch metadata checks pass.

## Aim-assist state and geometry

Core now handles protocol-2193 packets 316, 320, 327, and 339 instead of discarding them.
It retains command settings, category and preset definitions, and actor-priority updates on each connection.
Shared ranking and entity geometry execute independently of the renderer.
Client target execution, world queries, the reticle, and interaction rotation remain incomplete.

### Packet and request handling

Definitions use separate category and preset arrays, followed by an operation byte.
Operation zero replaces both tables; operation one replaces named entries and keeps omitted entries.
Unknown operations do nothing.
Duplicate names use the last received definition.
Empty category names are ignored.
Actor-priority updates replace individual signed-ID triples and retain omitted entries.
Registry-array positions never supply those IDs.

Packet 316 queues the latest accepted request until the connection update phase.
Clear bypasses preset lookup and removes active settings.
Other action values set settings, including unknown values.
Unknown named presets leave an earlier pending request untouched; empty names bypass lookup.
Invalid bounds consume a pending request but preserve active settings.
Registry replacement leaves active settings and actor priorities intact.

The native handler and updater are `14131ac70` and `145df81e0` in Bedrock 1.26.51.1.
Registry operation handlers call `1425f98f0` and `142600ac0`.
Priority handler `14131c180` calls the upsert routine `1425f3ae0`.
The target-server capture supplies ten packets across all three packet types.
Tests decode them through the registered handlers and reproduce every captured byte.
They also compare 432 finite native request updates, including rejected bounds and retained fields.
Connection scheduling and camera-preset activation are not established by these tests.

Java rejects non-finite settings instead of reproducing the target's NaN acceptance.
The target's unordered comparisons accept some NaN inputs.
This is an intentional protection, separate from finite-input parity.
Lists, strings, aggregate definitions, and retained unions have allocation limits.
Oversized updates preserve both accepted tables without partial mutation.

### Candidate geometry

The shared frustum uses the existing native float trigonometry runtime.
It does not distribute a copied native sine table or proprietary assets.
Wire angle X controls the vertical extent; angle Y controls the horizontal extent.
The four side planes and far plane use strict positive point tests.
Vertical and zero directions retain the target's degenerate geometry.

Entity eligibility first clamps the eye position to the picking box.
The closest point must pass the strict distance and frustum tests.
Ranking then uses the box center, which can lie outside the frustum.
Nonempty native sub-hitboxes replace generic picking boxes.
Nonempty generic boxes replace the fallback box, even when no supplied box qualifies.
The native 101-candidate threshold is checked once per actor.
An actor with several boxes can therefore append several candidates when the current count is 100.

Private probes execute `1429d13b0`, `1426426c0`, and the geometric branch of `145d86670`.
They use the independently verified target Windows sine table from earlier trigonometry research.
Java matches 48 native frustums, 2,016 point predicates, and 432 entity-candidate cases.
The comparison checks nonzero basis and plane values at float precision; zero signs are ignored.
Fixtures cover large coordinates, box precedence, strict boundaries, and the per-actor count check.
Actor enumeration, exclusion resolution, actual eye/facing producers, world obstruction, and visible parity remain unverified.

### Ranking

Wire mode zero ranks the view angle; every nonzero mode ranks distance.
The angle score uses a cubic approximation, rather than `acos`.
Distance scoring squares each scaled coordinate before summing.
Both paths preserve native float operation order.
Equal scores retain the first candidate and the first visible face point.
Callers must supply native candidate order, with blocks before entities.

Priority conversion clamps `1.1 - priority * 0.01` between 0.1 and 1.1.
The selector excludes scales within 0.00001 of 1.1.
This makes zero and negative priorities ineligible during ranking.
A priority of 100 produces 0.100000024 at float precision; larger priorities clamp at 0.1.
The shared implementation matches 384 native block/entity scores, 44 priority conversions, and 32 selector results at float precision.
The tests read private fixtures through `STACKANVIL_NATIVE_CAMERA_AIM_ASSIST`.
Ordinary tests cover selection, ties, box precedence, bounds, clear handling, and atomic rejection without private fixtures.

A separate 176-case native probe establishes actor-priority lookup and update boundaries.
Preset ID 136 and category ID 137 come from the local player's metadata.
Actor ID 138 comes from the candidate actor.
The probe also covers obstruction rejection and odd-tick gating.
Java tests compare only the 44 conversion cases from that probe.
They do not establish the obstruction or tick pipeline.
The transport below binds the three metadata IDs to actor lifetimes.

### Control scheme and client state

Packet 327 retains the raw unsigned control-scheme byte, including unknown values.
Malformed bodies reject the update before mutation.
The native handler at `141319120` stores that byte without enum validation.
The [protocol-2193 schema](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/clientbound-control-scheme-set-packet/) and [preview schema](https://mojang.github.io/bedrock-protocol-docs/1.26.50-preview.26/packets/clientbound-control-scheme-set-packet/) confirm its encoding.
No received byte remains distinct from an explicit zero.
This retention does not implement the scheme's movement mappings or pitch changes.

Native interaction at `141baef80` checks `ControlSchemeComponent` and the current camera identifier through `1429d4550`.
The shared policy matches 2,048 native results across eight identifiers and every unsigned byte.
Free and fixed-boom identifiers permit schemes zero through four.
Follow-orbit permits only schemes one and three.
Other tested identifiers and unknown schemes reject interaction.
The probe executes the actual lookup and its initial map construction, including native built-in names.
Host boundaries provide TLS guards, allocation, memory operations, and exit registration.
Current-camera identifier production, result generation, and input override remain outside this probe.
The policy does not assume that a custom preset uses its resolved root identifier.

The negotiated `viabedrock:camera_aim_assist_v2` channel carries complete accepted state and independent actor binding changes.
Catalog changes carry definitions, active settings, actor priorities, the optional control byte, and the selected camera context.
The camera context preserves resolved preset fields, its base, epoch, instruction sequence, and index.
It does not invent activation defaults for optional aim fields.
Unchanged catalogs are reused rather than sorted on each connection tick.

Catalogs use contiguous 256-KiB fragments with a 64-MiB transport guard.
The client allocates only received bytes and replaces the view only after complete decoding.
A malformed or interrupted transfer preserves the accepted view and bindings.
An oversized core snapshot withdraws client state without changing accepted core definitions.
An unchanged rejected view does not trigger repeated serialization or warnings on each tick.
Late channel registration sends a complete snapshot and all current bindings.
A complete registration snapshot resets old bindings atomically.

Bindings carry Java identity, native lifetime, unique actor ID, and metadata IDs 136–138.
Only native integer metadata supplies an ID. Missing or differently typed values produce zero, as the native metadata query does.
A metadata change sends one binding instead of the full catalog.
Despawn sends a removal for that lifetime.
Bindings can arrive before actor snapshots, but client lookup requires the actor's current native lifetime.
A late removal cannot erase a replacement actor with the same Java identity.
Transfer sequences reject stale messages and interrupted fragments.
The add-on checks the captured connection and generation on its client thread, and clears state on disconnect.
Binding transport does not establish native candidate enumeration order.

### Remaining aim-assist work

Camera-preset aim activation uses the server request path below.
Actual client target execution remains incomplete.
Native actor enumeration, block candidates, world obstruction, and debug alternatives remain open.
The reticle and interaction rotation must consume the selected native target.
Passing geometry, packet, and ranking tests does not establish those behaviors.

### Verification after replay

All 102 core patches replay successfully.
All four projects build, with 1,264 core tests passing and 32 optional skips.
The add-on has 816 passing tests and 120 optional skips.
All 18 converter tests and four proxy tests pass.
Checkstyle, tooling checks, 261 offline regressions, and patch metadata validation pass.

A fresh Java connection to the pinned target server records 11 production state observations.
They retain four categories, two presets, and thirteen actor priorities.
The observations confirm default settings, custom distance-mode settings, clears, and custom settings with defaults.
The journal contains five command packets, three definition packets, and two priority packets.
The recorder observes state on the connection event loop after the real decoder runs.
It does not alter the packets or production state.
The recording reaches spawn, closes normally, and releases all owned Java and display processes.
The private server stops and its fixture is restored.
This verifies the packet and retained-state path; selected hits, reticles, and interactions remain unverified.

A further isolated recording verifies the negotiated state in the actual add-on.
It contains 39 client-thread observations, including 32 accepted views.
Those views retain four categories, two presets, and thirteen priorities.
They reproduce six active-setting transitions and every control-scheme byte from zero through four.
The journal contains all five packet-327 updates.
Selected free-camera context arrives and clears with the camera instruction.
Two armor-stand identities from native packet 13 correlate with the received actor bindings.
The observations show target removal, an empty interval, and a replacement with a different identity and lifetime.
The screenshot shows the playable test scene.
Source artifact and manifest checksums match; all recorded Java, display, and server identities are gone after normal cleanup.
The fixture and private observer source are restored.
These observations verify delivery and lifetime checks, without establishing aim activation, selected hits, reticles, or interaction rotation.

### Aim preset wire framing

An aim-enabled camera table from BDS 1.26.51.1 exposed an incorrect target-mode width in core.
The optional mode uses one unsigned byte, rather than a four-byte integer.
The extra read desynchronized the remaining fields and disconnected the client during packet 198.
Core now reads and writes that byte, preserving unknown values from zero through 255.
The following control scheme and starting-rotation fields retain their positions.

The [protocol-2193 camera schema](https://mojang.github.io/bedrock-protocol-docs/1.26.51/types/camera-presets/) and [preview schema](https://mojang.github.io/bedrock-protocol-docs/1.26.50-preview.26/types/camera-presets/) identify the mode as `uint8`.
The pinned Gophertunnel codec uses `Int32` for this nested field and disagrees with the captured target server.
It remains useful for other camera fields, but it does not establish this field's encoding.
A 743-byte captured table with complete, empty, and partial aim objects now round-trips every byte.
A separate wire test covers every mode byte and checks the following fields and preset boundary.
The partial aim object replaces the inherited object as a whole.

The aim transport now negotiates version two because its camera context embeds the corrected preset codec.
Peers that advertise only the earlier format do not receive the changed layout.
The add-on derives its channel and codec from the shared core contract.

### Client activation requests

The [target packet-321 schema](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/client-camera-aim-assist-packet/) defines client activation by camera preset name.
The server then returns packet 316 with resolved settings.
Native callback `145d81cb0` and helpers `1429d3560`, `1429d4320`, and `1429d4440` establish this request path.
The server handler at `1416ed830` resolves camera aim settings and restores stored command settings when appropriate.
Retaining packet 198 alone does not activate its aim object.

Core now accepts a negotiated client control that names its complete aim snapshot sequence and reports perspective eligibility.
It rejects stale snapshots and camera contexts before sending packet 321.
The sender checks the referenced aim preset before requesting camera activation.
A missing reference leaves accepted server state intact.
Absent preset references use the native default aim preset identifier.
Camera switches, preset-table replacement, and perspective changes can create a new request.
Command-setting replies and ordinary position updates within the same preset do not create repeated activation requests.
This prevents a feedback loop that can overwrite later server settings.
Full native event scheduling remains unverified.

A native camera without a perspective-option component permits aim activation.
A present option permits activation when its integer value is nonzero.
The add-on supplies the local camera option when no server preset is active.
Forced first-person, third-person, free, and follow cameras use their rendered perspective semantics.
Perspective eligibility remains separate from the interaction control-scheme policy.

The native packet factory limits the camera identifier to its first 64 UTF-8 bytes.
The shared writer preserves that byte limit, including a split multibyte sequence.
Private probes compare eighteen actual native payload-factory results and ten valid-camera perspective cases.
The probes supply weak-camera resolution, sparse component data, memory operations, allocation, and warning callbacks.
They do not establish camera-component construction, registry loading, or complete event scheduling.
Storage tests cover stale controls, camera changes, command replies, and duplicate suppression.

The corrected-codec baseline reaches gameplay with all eleven presets and retains complete, empty, and partial aim objects.
Its 43 client-thread observations show the camera changes, but the journal contains zero activation requests.
That baseline isolates the missing packet-321 path from the fixed joining failure.

Two further actual add-on recordings verify the activation path against the same target server.
They contain 39 and 38 client-thread observations, with eight and nine packet-321 requests respectively.
Their complete request sequences match the camera and perspective transitions without extra activation requests.
The corresponding thirteen and fourteen packet-316 replies match every expected setting and clear.
Full aim objects activate their authored angle, distance, and mode.
Empty objects activate native defaults of 50°/50° and 8.5 blocks.
A partial child object activates 30°/40°, 8.5 blocks, and angle mode instead of retaining its parent's other fields.
A real `/aimassist` command, issued while aim is allowed, supplies the stored settings for the restoration control.
Switching from the overriding camera to a camera without an aim object restores those command settings through BDS.
A first-person clear removes active settings.
The Script API fixture does not populate the same stored command state, so its non-override clear remains a separate control.

Both recordings reach gameplay, retain all eleven presets, and reproduce the captured table hash.
Artifact and manifest checksums match.
All owned Java, display, and server identities are gone after normal cleanup.
The fixture and private observer source are restored.
These results verify camera aim activation and command restoration on the actual Java route.
They do not establish native candidate gathering, reticles, interaction rotation, local F5 transitions, or complete event scheduling.
All four projects build, including 1,264 passing core tests and 32 optional skips.
The add-on has 816 passing tests and 120 optional skips.
Checkstyle, tooling checks, 261 offline regressions, and metadata validation pass.

## Native aim block queries

The shared block-query runtime now captures the two native ray-grid slices and builds visible face targets.
Odd slices clear the old targets; even slices append the lower half.
Repeated positions retain their first geometry, priority and flags until the next clear.
The native cache's bucket order remains observable when scores tie.
Its constructor starts with eight buckets and a load factor of one.
Clearing retains the allocation; removing the component resets it.

Discovery intersects whole cells, while obstruction uses native selection envelopes.
The starting cell uses the primary layer and skips a box that encloses the eye.
Later cells prefer accepted extra-layer blocks when liquid targeting is enabled.
Excluded blocks stop a ray and carry an exclusion flag.
Visible face rays start 0.001 blocks inside their face and preserve Bedrock face order.
World-space float intersections remain separate from camera collision math.

Private executable probes cover 864 grids, 76,608 discovery rays, 948 traces, 2,304 face-generation prefixes and 203 cache operations.
The cache fixture now runs the actual native constructor before insertion, growth and clear.
Liquid-depth cases exercise the packed property lookup as well as absent-property controls.
All comparisons pass, including nonzero float bits, layer-query order, flags, face points and cache order.
A separate 304-case probe verifies intersection point coordinates and tie faces directly against the native surface kernel.
Mandatory tests exercise capture, refresh, obstruction and ranking without private fixtures.

The runtime requires actual selection geometry and resolved priority policies from its world provider.
It is not connected to the live-world adapter yet.
Native geometry and tags, eye-offset producers, entity filtering, final hits, interaction rotation and reticles remain unfinished.
These stage comparisons do not establish complete native aim parity.

All four projects build.
The final core suite has 1,274 passing tests and 32 optional skips; the add-on has 816 passes and 120 optional skips.
Both Checkstyle suites, offline validation and stack health pass.
The additional surface test changes no production classes in the built artifact.

## Fixed-boom execution

Fixed-boom presets now execute through the shared attached-camera runtime.
The position controller accepts the native base and retains independent defaults, rotation overrides, view offsets, entity offsets, and attachment generations.
The shared `BOOM` rendering mode keeps its existing wire ordinal.
The changed follow payload negotiates `viabedrock:camera_follow_v2` and version two before core sends an attached position command.
A peer with only the earlier follow channel does not receive the changed format.

Fixed-boom orientation stays independent of actor yaw and orbit input.
Pitch clamps at the native boundaries of ±89.9°.
The upper boundary uses the native stored polar constant, while the lower boundary retains its separate float calculation.
Entity offsets rotate in fixed-camera space.
Avoidance receives measured boom distance instead of an orbit target radius.
The pinned fixed-boom and follow-orbit definitions share a zero relaxation spring and minimum distance of 0.25 blocks.

The reference uses Bedrock 1.26.51.1/build51061372, protocol 2193.
Its binary SHA-256 is `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`.
All 192 controls execute default/starting callbacks `0x1466f7e90`/`0x1466f7f30`, default/explicit attachment `0x14677ec00`/`0x14677ecb0`, and matrix `0x14677e5a0`.
They also execute fixed transform `0x14677eed0`, offset composition `0x1466f73f0`, and look-at `0x14677b300`.
Parsed components, actor origin, radius, offsets, starting rotation, and attachment points are supplied inputs.
Empty ECS registration, optional point-provider results, and float CRT math remain supplied boundaries.
These controls exclude actual pivot producers, constructor and packet flow, complete ECS scheduling, avoidance/world lookup, and GPU rendering.

Mandatory tests cover command defaults and overrides, camera replacement, actor movement and rotation, input rejection, payload negotiation, and attachment lifetime retention.
The production runtime matches all 192 fixed frames and the existing 256 follow frames and 768 follow collision frames.
Three deliberate variants fail: actor-yaw attachment space, missing pitch boundaries, and rejection of fixed-boom commands.
Actual native player pivots, complete control-scheme mappings, native geometry providers, and visible parity remain open.

The final combined four-project build passes 2,600 tests, with 167 optional skips and no failures or errors.
Native fixed-boom, follow-frame, follow-collision, and avoidance comparisons run without skips.
Retained particle, attachable, and Iris GPU comparisons also run without skips.
All 1,412 core classes match the add-on and proxy copies, and all 1,139 production client classes match the add-on.
The 104-patch core stack and 38-patch add-on stack replay successfully.
This build includes the newer native interpolation packet metadata.

A fresh BDS 1.26.51.1 session exercises the exact installed artifact over direct NetherNet.
Read-only observations verify 48 camera samples across eleven stages.
The default fixed view keeps its position while the player turns without moving.
Explicit rotation and player translation preserve the expected offsets.
An armor-stand attachment keeps fixed orientation through actor rotation, follows actor translation, and detaches to the player.
The run also verifies view/entity offsets, the orbit switch, and clear.
Installed artifact checksums match, and all owned client, display, and server processes stop normally.
This run verifies the stated Java route, while native pivot height, control schemes, full lifecycle coverage, and native pixels remain unverified.


## Fixed attachment retirement

Fixed-boom now retires an attachment after its observed native actor lifetime disappears or changes.
It resumes the default player attachment, including later player movement.
A normal camera snapshot or preset reselection cannot restore the retired attachment.
A new attachment command permits a new actor lifetime.
Orbit retains its separate component behavior.

The add-on keeps native identity available while the Java entity or physical bounds remain pending.
These pending samples retain the previous frame without false retirement.
If the local player is unavailable after retirement, the runtime waits without reacquiring the old attachment.

The pinned binary and version match the fixed-boom reference above.
Thirty-two native controls cover fixed and orbit callbacks, both attachment point enums, and eight actor lookup states.
They execute callbacks `0x14677e970`/`0x14677ecb0`, point provider `0x14672dbf0`, weak lookup `0x14672dd10`, center `0x1419f8180`, and matrix `0x14677e5a0`.
The controls cover valid actors, removed actors, stale generations, missing sparse/type/data storage, expired worlds, and absent client levels.
Failed fixed lookup clears the weak handle, releases its reference, and requests attachment component erasure.
Orbit retains its handle in the same controls.
The original default attachment, fixed transform, offset, and look-at functions then use a supplied player origin.
The default fixed view excludes the attachment component, and the attachment system orders its default pass after the explicit pass.

Typed registries, actor positions, bounds, generations, weak controls, and parsed components remain supplied inputs.
Client-level and weak-world resolution, attachment pool lookup and erasure, and float CRT calls remain supplied boundaries.
These controls do not execute the full ECS scheduler or actual player pivot producers.
Retained orbit controls supply an unchanged origin; they do not prove native post-loss orbit origin lookup or complete frozen-pose behavior.

Mandatory tests cover retirement, identity reuse, ordinary snapshots, new attachment commands, mixed presets, and pending samples.
Four deliberate variants fail: missing fixed retirement, orbit retirement, retirement reset on ordinary snapshots, and pending samples treated as removal.
The production runtime matches all 32 native frames and retains the earlier fixed, follow, collision, and avoidance comparisons.

A fresh BDS 1.26.51.1 session over direct NetherNet verifies 42 actual camera observations across nine stages.
The exact installed build covers attachment, actor removal, player movement, preset reselection, replacement presence, explicit reattachment, detach, and clear.
The live replacement has a new actor ID; native and unit controls cover reused identity.
Installed artifact checksums match, and all nine owned client, display, and server process identities are gone after normal shutdown.

Initial command-time identity ownership before the first observed lifetime remains open.
Native player pivots, complete ECS scheduling, post-loss orbit origin lookup, and native pixels also remain unverified.

The combined four-project build passes 2,604 tests, with 167 optional skips and no failures or errors.
Native camera, particle, attachable, and Iris GPU comparisons run without skips.
All 1,413 core classes match both packaged copies, and all 1,139 production client classes match the add-on.
The core and add-on stacks replay successfully.

## Native actor targeting requirements, October 26, 2026

Fresh Bedrock 1.26.51.1 execution controls establish the entity filter required by live aim selection.
They execute the original exclusion kernel and following candidate geometry across 1,536 component, cache, reset, and priority combinations.
Another 400 controls cover signed priority keys and absent or incorrectly typed actor-ID metadata.
Thirty-two controls verify that exclusion updates still execute after candidate capacity prevents another geometry entry.

The collector requires a native mob, boat, or minecart component before the player-specific test.
Its enclosing ECS view excludes removed actors and the local player.
The exclusion kernel retains an existing cached decision unless its caller requests a recheck.
Exclusion lookup uses the signed triple `(local preset ID, 0, target actor ID)`.
Only the value `-2` marks an exclusion in this lookup.
Missing or incorrectly typed actor-ID metadata supplies zero.
The separate ranking priority remains a different lookup.

Another 990 controls execute the complete player predicate and its native game-type component lookup.
Native Spectator state rejects a player.
Native Default inherits the level's Spectator state, while Undefined does not.
An optional editor service can also reject the player when its mode value is one.
The executable's registered type hash identifies `Editor::Services::ModeServiceProvider`.
This condition does not mean that creative players are excluded.

The controls supply typed sparse storage, valid cache slots, ordered priority-map nodes, and a previously captured native frustum.
They also supply the editor-service resolution and mode, level game type, and typed metadata virtual results.
Initial cache allocation, component production, ECS ordering, world obstruction, final hits, and visible behavior remain outside these controls.
No target-selection implementation or live parity result follows from these kernel comparisons alone.

The current bridge retains actor priority IDs and lifetimes but omits native actor-class and game-type inputs.
Remote player spawn decoding also discards its raw game type after Java conversion.
Live wiring must retain those inputs before applying the verified filter.
The existing native block mirror preserves both layers and properties, but a complete native selection-shape provider remains unfinished.
The current camera adapter's Java collision envelopes do not establish native aim obstruction geometry.
Live target execution, reticles, and interaction rotation remain unfinished.
