# Render server camera effects

## Purpose

Draw ViaBedrock's resolved fades and apply its shared FOV transitions through direct and ViaProxy connections. Core owns packet decoding and fade combination.

## Design

The client subscribes to `viabedrock:camera_fade`. Each snapshot includes color, opacity points, and elapsed time. Rendering advances from that elapsed state and clears it at disconnect.

The overlay uses ordinary GUI extraction before the HUD. It also runs when the normal HUD is hidden. Rendering does not require a Microsoft Store account or game installation.

The client also subscribes to `viabedrock:camera_fov`.
Live commands use the previous rendered FOV and the unmodified local projection.
Snapshots resolve the local projection and advance by their elapsed time.
The shared core rules control easing, overshoot, interruption, and clear removal.
The world camera receives the result before projection and culling. The separate hand projection keeps its existing behavior.
Disconnect clears queued commands and transition state.

## Verification

The core compares numeric timelines with the matching Bedrock 1.26.51.1 executable. Rendered direct and ViaProxy checks and native screenshots are recorded in the coverage ledger.

## Remaining work

Splines, fog, and aim assistance remain incomplete. Later sections describe free-camera movement and entity tracking. Native opaque screenshots verify the overlay below the HUD. Partial opacity, exact frame timing, hidden-HUD behavior, and broader lifecycle comparisons remain unverified.

FOV snapshots retain elapsed progress. Historical local projection changes during an unsubscribed interval remain unverified.
Native local modifiers, first-person integration, pauses, transfers, and broader lifecycle comparisons remain incomplete.

Supplemental ordinary-clear playback restores local FOV on both routes.
The earlier ViaProxy report had stale skin audit data and an omitted private avatar marker.
Corrected ordinary-clear replays pass transport and rendering on both routes.
Unavailable built-in animation assets remain a separate gap, as recorded in the coverage ledger.

## Camera shake

Subscribe to `viabedrock:camera_shake` through direct connections and ViaProxy.
Use the shared queue and sampler after ordinary camera alignment, before projection and culling.
Apply position offsets in world space and rotation offsets to pitch and yaw.
Entity aim and outbound movement stay independent of the rendered camera.

The native Allow Camera Shake preference defaults to enabled.
Disabling it hides existing shake and ignores new additions.
Stop still clears the retained state.
Disconnect and level teardown release the queues.

Core owns packet decoding, queue rules, seed transport, and noise.
The add-on supplies its clock, local preference, and camera transforms.
Camera rendering requires neither a Store session nor a local game installation.

The default player-camera path has native codec and numeric evidence.
A complete direct replay changes the local preference during overlapping and strong shake commands.
It verifies hidden rendering, ignored additions, retained event lifetimes, re-enable, and stop.
Native preference-toggle screenshots, custom preset parameters, late registration, pauses, transfers, and first-person item integration need additional native comparisons.

## Core-resolved camera movement

The add-on subscribes to `viabedrock:camera_position` on direct and ViaProxy connections.
It supplies the previous rendered frame to the shared core blend updater.
Free-camera position and rotation apply before camera shake, projection, and culling.
The camera changes without moving the player or changing outbound aim.

Server perspectives override the effective camera type without changing the saved user setting.
Clear and disconnect release the override.
Perspective fields retain their source values during blends and switch at the endpoint.
Snapshots restore settled targets because the original interrupted frame is unavailable.
Exact mid-blend restoration remains incomplete.

Built-in first/third-person activation currently uses Java camera alignment.
Native third-person distance and collision still need implementation and comparison.
Player-effects application, native follow-camera parity, splines, and aim assistance remain incomplete. The follow integration below executes attachment poses.
The listener section below records audio application.

Complete direct and ViaProxy replays pass transport and existing skin-rendering checks.
Both reproduce all five free-camera targets, the short yaw arc, overshoot, perspective activation, and clear.
Their complete scene hashes match the native capture, and core preset reports match byte for byte.
Stationary screenshots still differ in projection, lighting, and foliage.
This verification establishes movement behavior, with visible parity still incomplete.
One ViaProxy attempt timed out before presets; the completed retry does not establish a fix for that intermittent handshake.

## Camera audio listeners

The sound-engine listener follows the current preset's resolved listener choice.
Camera selection keeps Minecraft's rendered camera transform.
Player selection supplies the local interpolated eye position and current player angles to core's listener math.
The visual camera blend does not delay listener selection.
Clear and disconnect restore the ordinary camera listener.

The hook updates Minecraft's shared listener before its sound executor receives the transform.
Bedrock PCM playback, admission checks, and caption positioning already consume that listener.
They need no separate device or listener state.
Clients without an active server camera retain the normal sound transform.

Core tests compare player orientation against the target executable.
Private replay diagnostics read the actual sound-engine listener position, forward vector, and up vector.
Complete route checks and limits are recorded in the coverage ledger.
Native eye-height, vehicle/death behavior, listener activation timing, and audible panning remain unverified.


## Entity target frame integration

The add-on subscribes to `viabedrock:camera_tracking` and advances every free-camera tracker before the active blend.
Targets resolve through native actor unique IDs and lifetimes.
The adapter interpolates actor position and yaw, then uses native physical height and scale for the bounding-box center.
It waits for matching native bounds instead of using Java proxy dimensions.
The shared actor patch owns the bounds payload and registration; UI rendering reuses that bridge.
Disconnect clears every tracker.

Core owns tracking arithmetic, limits, generations, and target removal.
The add-on supplies frame time and actor samples without changing player aim or outbound movement.
The native kernel comparisons do not prove live delivery, native actor interpolation, or visible camera parity.
The direct target-server run below verifies live execution. Official-client visual comparisons and fresh ViaProxy tracking runs remain required.


## Tracking prerequisites

- [Core camera runtime](../../viabedrock/upstreamable/0089-resolve-and-transport-native-camera-instructions.pr.md): Publish the tracking state and frame solver.
- [Shared actor runtime](0008-share-native-actor-and-resource-runtime.pr.md): Publish native identity, lifetime, and physical bounds access.


The complete candidate build replays all 102 core patches and 38 add-on patches in the private lab.
All four projects build successfully with the pinned ViaFabricPlus artifacts and bundled Bedrock resources.
Core runs 1,224 tests: 1,194 pass and 30 optional cases skip.
The add-on runs 936 tests: 816 pass and 120 optional cases skip.
All 18 converter tests and four ViaProxy tests pass. Checkstyle reports no failures.
The offline tooling, 261 regression tests, and patch metadata checks also pass.


A fresh BDS 1.26.51.1 world now verifies the complete live target sequence over direct NetherNet.
Rendered camera audits follow the entity from -45 to +45 degrees and apply a two-block center offset.
Switching to the inactive preset preserves its settled rotation.
The configured 20-degrees-per-second camera measures 19.99 degrees per second during the return movement.
Target removal retains the desired angles. Explicit default restores zero pitch and yaw, and clear restores the player's view.
The server completes every command without a script error, and the fixture contains only the player and one target.
These measurements verify this live sequence, not official-client pixel parity or every tracking option.


The previous add-on supplies a negative control in a separate fresh world.
It reaches gameplay and receives the complete command sequence, but retains its initial camera rotation and fails the orientation assertions.
The candidate passes the same assertions. The candidate artifact and manifest are restored after the control.
Both owned servers, Java clients, and the isolated display stop cleanly.


## Follow-orbit execution

The add-on registers `viabedrock:camera_follow` and advances the shared runtime before the active position blend.
Local player sampling uses the translated position and the protocol origin offset supplied by core.
Explicit attachments use native actor lifetimes, physical heights, and scale. Missing actor state retains the previous pose until that state arrives.
The resulting detached camera applies before shake, culling, and audio listener selection. Disconnect releases the runtime.

Accepted Java mouse-turn deltas update the active orbit instance. The existing camera-input permission check controls that collection point.
This adapter does not establish native sensitivity, player-body coupling, or activation rotation semantics.
The world adapter now supplies follow collision queries. Complete native player-pivot lookup and official-client visual comparisons remain open.

The [camera command reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/commandsreference/examples/commands/camera) describes attachment, detachment, and offset commands.
The live fixture uses the exact target BDS version to check command execution independently of that reference.


The live fixture uses an owned Bedrock 1.26.51.1 server and a fresh world on each run.
Direct and ViaProxy camera audits match nine stages: follow, attach, target movement, rotated offsets, preset switching, restore, detach, default, and clear.
Each active stage checks rendered position and orientation within 0.03 blocks and degrees, using at least two observations.
Clear restores the ordinary attached camera.
These runs verify this integration against server commands. They do not compare the official client's rendered view.

The direct recording completes its transport and cleanup checks.
The extended ViaProxy run passes every pose assertion, then stalls in JVM shutdown after the recorder closes.
Its cleanup reports `Owned Java processes did not stop normally; forced cleanup refused.`
Those pose observations are not a complete passing proxy lifecycle. A fresh older-client live control remains pending.


## Follow-camera world avoidance

The add-on supplies base and extra-layer blocks to core's native camera tracer.
Converted custom blocks supply collision envelopes for eligibility and selection bounds for final ray hits.
Other block states use the client's existing collision geometry, including installed Bedrock geometry hooks.
Liquid layers retain stable material identities. Their auxiliary surfaces do not stop the camera by themselves.

The solid-origin adapter uses converted custom-block occlusion metadata and Java solid-render state for ordinary blocks.
That mapping still requires per-type native comparisons.
It does not establish parity for every transparent block, fluid, context-sensitive shape, or transformed custom geometry.

Core applies eight corner casts, the pinned follow minimum, and native near-plane clearance before the active blend.
The native cache includes attachment and view offsets in the avoidance pivot.
The solid-state sample uses the subject origin. Collapse retains the pre-avoidance camera orientation.
Core compares 768 composed native frames and 810 world rays separately from the client binding.

All four projects build successfully after the full patch replay.
Core has 1,219 passing tests and 32 optional skips.
The add-on has 816 passing tests and 120 optional skips. Converter and proxy tests and Checkstyle pass.


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

## Spline programs and replacement commands

The add-on negotiates `viabedrock:camera_spline_v2` and supplies accepted programs to the shared free-camera runtime.
Named and inline commands use the same path before blending, shake, culling, and listener extraction.
Active and inactive instances advance independently of camera selection. Disconnect releases all spline state.
The separate tracking channel carries explicit position revisions for repeated position commands and default resets.

Live spline commands retain running keyframes, replace the curve and duration, and restart time.
Empty replacement channels retain earlier frames.
Complete snapshots replace channel state without appending it again.
Retirement releases instance programs, and applied payloads do not retain old channel history.
Fresh empty requests are safely rejected because the target updater reaches invalid reads for those inputs.

Core probes compare 64 mixed named/inline replacements, including both curve types and empty replacement channels.
Twelve native retirement cases establish strict duration expiry and preceding-pose retention.
Earlier probes cover spline geometry, interpolation, named lookup, and definition-table replacement.
These comparisons use authored component storage and explicit host boundaries.
They do not establish full native system ordering, pause/queue clock parity, or official-client visible parity.
Snapshots after completion still cannot recover the previous rendered frame.

An earlier completed recording checks named playback, repeat, both inline curve types, clears, and repeated position commands.
Its 21 sampled poses match independent geometry within 0.000006 blocks.
The new previous-client control completes normal cleanup but fails the retained-channel replacement verifier.
The target server emits all authored stages, including empty replacement and fresh-empty requests.


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

## Aim-assist state reception

The add-on registers the negotiated `viabedrock:camera_aim_assist_v2` payload on each connection.
It retains complete accepted catalogs, command settings, actor priorities, control-scheme bytes, and selected camera context.
Catalog transfer assembles bounded fragments before replacing the accepted view.
Independent actor bindings preserve native identity, lifetime, and metadata IDs 136–138.
Client lookup checks each binding against the actor runtime's current lifetime.

Queued work checks both its captured connection and disconnect generation before mutation.
Disconnect clears accepted and pending state.
Stale transfers and late removals cannot replace newer state or remove a replacement lifetime.
Late registration supplies a complete view and all current bindings.
The shared tests cover fragmented catalogs, more than 4,096 priorities, interrupted transfers, malformed bodies, reconnects, and reused actor identities.

This reception supplies state for native aim execution.
World queries, selected hits, reticles, and interaction rotation remain incomplete.
The activation request section below records the camera-preset settings path.
The shared control policy matches 2,048 native lookup results, but current-camera identifier production remains unverified.
The fixed-boom section below records its frame integration. Full control-scheme movement mappings remain unfinished.

An isolated connection to BDS 1.26.51.1 records 39 client-thread observations, including 32 accepted aim views.
It verifies six setting transitions, all five control bytes, free-camera context and clear, and lifetime-validated actor bindings.
Native packet-13 identities correlate the original armor stand and its replacement with their client bindings.
The recording reaches gameplay and closes normally.
All owned Java, display, and server identities are gone after cleanup.
The source artifact and manifest checksums match, and the private observer source is restored.
All four projects build. The add-on has 816 passing tests and 120 optional skips.
Core has 1,264 passing tests and 32 optional skips, including the native control-policy comparison.
Checkstyle, tooling checks, 261 offline regressions, and patch metadata validation pass.
These checks establish state delivery and binding lifetime behavior, without establishing native aim execution or visible parity.

## Camera aim activation requests

The add-on now reports the accepted aim snapshot sequence and current perspective through a separate client control payload.
Core validates the snapshot and camera context before it sends native packet 321.
The server resolves the camera preset and returns packet 316 with the accepted aim settings.
The add-on does not synthesize those settings from the optional aim object.

A forced first-person camera disallows aim activation.
Third-person, free, and follow cameras permit it.
The normal local camera follows the user's first-person or third-person option.
Disconnect clears the request state with the accepted view.
Server setting replies can update that view without repeatedly reactivating the same camera.
Native target selection, world queries, reticles, and interaction rotation remain unfinished.

Two actual add-on recordings verify complete, empty, and partial camera aim objects, perspective clears, and stored command restoration.
Their eight and nine packet-321 requests and thirteen and fourteen packet-316 replies match the expected sequences exactly.
The client retains the authoritative settings after each request.
A non-override camera restores settings from a real `/aimassist` command.
The runs contain 39 and 38 client-thread observations, reach gameplay, and close normally.
All owned Java, display, and server identities are gone; artifact checksums match and private fixture changes are restored.
Local F5 transitions, native target selection, reticles, interaction rotation, and full event scheduling remain unverified.

## Fixed-boom frame integration

The add-on now consumes the version-two attached-camera payload and shared `BOOM` mode.
Fixed-boom and orbit instances run before the camera blend, shake, projection, culling, and sound-listener extraction.
The active preset selects the fixed or orbit path.
Fixed presets ignore orbit deltas and retain their orientation while their actor moves or turns.
The native actor identity, lifetime, physical bounds, and player-origin inputs remain shared with follow-orbit.
Clear and disconnect use the existing lifecycle.

Core compares 192 original native fixed-boom frame controls and retains its existing follow-frame and collision comparisons.
Those controls supply actor pivots and component inputs.
They do not establish complete native pivot production, input mappings, world geometry, ECS scheduling, or pixels.
The [core camera notes](../../viabedrock/upstreamable/0089-resolve-and-transport-native-camera-instructions.pr.md#fixed-boom-execution) record the functions and boundaries.

The exact installed combined build completes a fresh BDS 1.26.51.1 run over direct NetherNet.
All eleven stages pass across 48 read-only observations of the actual Minecraft camera.
The stages cover fixed defaults, isolated player turning, explicit rotation, player movement, entity attachment, actor turning and movement, detachment, orbit switching, and clear.
View and entity offsets retain their expected axes.
Installed checksums match, and all owned client, display, and server processes stop normally.
The final four-project build passes 2,600 tests, with 167 optional skips and no failures or errors.
Both packaged core copies match all 1,412 source classes, and the add-on matches all 1,139 production client classes.
These results retain the native pivot, input, geometry, and visible-parity limits above.
