# feat(runtime): share native actor animation and resource playback

## Purpose

Provide the shared float Molang, actor graph, geometry, accepted resource, sound and particle runtime before account appearance management. Keep native event timing, resource limits and connection lifetimes together so server actors and equipped models can consume the same implementation without Character Creator account access.

## Design constraints

Share actor-local graph, Molang, material, particle, and audio runtimes. Resolve all vanilla resources from one world-version context before server overrides. Retire cached and mutable state on its owning lifetime.

Prerequisites:

- viabedrock/0064-share-native-float-molang-runtime.patch: Publish the shared native float parser, math and control-flow API.

- viabedrock/0064-evaluate-named-actor-properties.patch: Publish versioned actor state and verified integer-query bindings.

- viabedrock/0015-transport-native-resources-and-sound-commands.patch: Publish native resource, sound and block snapshot contracts.

- viabedrock/0099-bridge-native-actor-picking-hitboxes.patch: Publish the negotiated picking message used by the actor adapter.


- viabedrock/0085-resolve-server-effects-relative-to-their-actor.patch: Publish native animation-controller command snapshots consumed by the shared graph runtime.

- viabedrock/0078-preserve-native-identifiers-in-java-item-data.patch: Provide the optional native air-continuation and shooter-release item fields consumed by the shared metadata cache.

The immutable item cache retains the optional native air-use predicate. Missing metadata selects the older-core fallback; explicit false selects the current native policy. Replacing custom data changes the predicate without mutating cached snapshots. `BedrockItemMetadataTest` covers this boundary.

Bundled assets build their resource library once. Validation uses the same library that the loader publishes, and every version, manifest, required-resource and persona check still runs before publication. The removed second build took 348 ms in a cold Galaxite trace.

## Validation and remaining limits

Regression coverage includes `BedrockActorAnimationTest`, `BedrockActorQueriesTest`, `BedrockActorRenderSelectionTest`, `BedrockActorScaleTest`, and `BedrockActorPickingStateTest`.

Native player hierarchies retain their authored crouch anchor instead of receiving Java's additional two-pixel render offset. Animated and visibility-only native trees share this rule. Passenger offsets, scale, and the Java fallback remain intact.

A colored slim/wide/slim remote-peer fixture uses Bedrock 1.26.60.5/BDS 1.26.60.6 on protocol 2225. After core restores explicit remote posture metadata, the pre-fix Java renderer crouches but drops its foot anchor. The real-renderer regression fails at that extra offset and passes after compensation. The fixture isolates metadata and rendering. Broader body rotation and the original local custom-skin report remain open.

Fresh spawn controls use the same slim skin with six new player identities at yaw 0, 180, 90, -90, -180, and 0. Official Bedrock 1.26.60.5/BDS 1.26.60.6 retains an angled body at nonzero yaw. The pre-fix Java client instead aligns body and head, despite native state present at ticks zero or one. A zero initial body seed restores the observed result on rebuilt direct and ViaProxy routes. Established Java rotation remains intact if native state arrives late.

Strict protocol-2225 decoders verify matching skin bytes, spawn transforms, dimensions, fresh identities, removal order, and FOV60. Six marker projections per phase use three frames each. Both fixed routes have median marker centroids within 0.17% of each viewport axis and bounding coordinates within 0.42% of native. These stationary, floating peers establish selected spawn posture. Movement interpolation, idle-animation phase, lighting, and complete pose parity remain unverified. Two regressions cover signed spawn angles through settling and late native state. All 33 recorded process identities are gone. Cleanup restored the native profile, trust setting, external server lists, and owned server configuration exactly.

Same-identity controls extend the fixture through a full yaw cycle, a pitch-only update, and east/west/center movement. Native and current direct/proxy routes retain the turn history and restore the center position. The camera and skin stay constant.

Strict protocol-2225 decoders verify one spawn and identical 71 MovePlayer payloads per route. Three settled frames per phase compare six markers. Across 11 phases, both routes have median marker centroids within 0.30% of each viewport axis and bounding coordinates within 0.42% of native. The accepted Java fixtures disable their onboarding tutorial through its public API before observations. An earlier obstructed westward frame does not support pose comparison. All 33 recorded process identities are gone, and cleanup restored the native profile and server configuration exactly.

The [remote movement integration](0041-interpolate-native-remote-player-movement.pr.md) covers interpolation after a large vertical excursion. It retains native movement modes and float steps while preserving host fallback and actor lifetimes. Rebuilt direct and proxy controls restore the selected settled marker projections, including leg visibility. Its evidence describes the observed current native steps, installed comparisons, and remaining limits.

These controls establish selected settled poses and position steps. Full readiness and region admission, exact timing, mounted head updates, ground state, and locomotion animation remain open. The original custom-skin report also remains unresolved. The [pitch-only packet control](../../viabedrock/upstreamable/0075-encode-head-rotation-in-java-26-3-field-order.pr.md) describes the retained head rotation semantics.

Rebuilt direct and ViaProxy controls restore crouching and the native foot anchor with identical skin and posture inputs. The combined four-project build passes 3,335 tests with 325 skipped and no failures or errors. Full stack replay, bundle, artifact checksums, and embedded core-class comparisons pass.

Native current/older/current cat and audio controls establish selected resource paths. Complete pose alignment, audio, particle, query, and visual parity remain unfinished.

Three native 26.60 non-cardinal picking controls establish the camera ray calculation.
Direct and proxy runs use matching vectors and preserve non-camera behavior.
Outgoing hit coordinates differ by at most 0.000031 blocks for those controls.

Current-pin direct and proxy runs match seven native armor-stand reach outcomes and eight block reach outcomes.
Block controls cover stone, fence, diagonal approach, Survival, and Creative, with fresh reticle samples before every accepted input.
Small differences in facing and eye height remain. These outcomes do not establish equal ray coordinates or complete picking parity.
Other actor shapes and multipart target ordering remain open.

A native Bedrock 1.26.60.5 control covers a plain offhand shield with an oak log in the main hand.
Crouching raises and tilts the shield. Releasing crouch restores the resting pose.
The installed add-on retains these transitions on local BDS 1.26.60.6 through NetherNet HTTP, using crouch and Use inputs.
Read-only controller snapshots show that blocking clears and the resting transform returns after either input.
Opening and closing the Survival inventory leaves the resting shield transform unchanged in early and later samples.
Installed direct controls also cover forward movement, strafing, and skeleton projectile blocks.
The packet journal contains blocked-shield and damaged-shield flags, while the projectile samples retain full health.
Releasing the controls restores the resting shield transform.
These controls do not reproduce the reported extreme shield pose.
Exact native movement and hit-animation timing, patterned shields, and third-party mod combinations remain open.

Native Bedrock 1.26.60.5 clears current and previous actor angles before evaluating the hand graph.
Fifteen original instruction controls establish that `query.head_x_rotation(0)` returns zero in that scope.
The hand frame now clears inherited head pitch while preserving the camera-pitch variable and the world frame.
The authored-arm regression fails before the correction with 37 degrees instead of zero.
Installed direct and ViaProxy controls each retain the corrected query and camera variable across five view angles from -64 to 80 degrees.
The full add-on build passes with 1,416 tests and 154 optional skips. A fresh saved-stack replay reproduces the tested tree.
These controls cover the head-pitch binding. Other rotation queries, complete hand pixels, and the original shield/custom-skin reports remain open.

Animation timelines retain the remaining animation when an individual Molang string has a syntax error.
The failed script keeps a zero-valued entry at its authored time. Structural validation and resource limits still reject invalid input.
A native Bedrock 1.26.60.5 local-world control places MegaSMP's captured invalid string between valid assignments.
The trial and control cubes reach the same raised position, including the later timeline update.
The installed executable's loaded PE sections match the pinned reference. Its headers and signing data differ.
The playback regression fails before the correction with the live actor's parser error and passes afterward.
The full four-project build and fresh patch replay pass.
An installed complete MegaSMP packet replay preserves all scene payloads, loads the pack, and acknowledges gameplay.
Both `mvmodels:holy_knight` and `mvmodels:mecha_oondasta` retain loaded graphs and non-empty poses.
The overall rendering check still fails on unresolved mappings, including the custom block gaps.
This control does not establish every malformed expression's recovery or complete public-server actor appearance.

Official Bedrock 1.26.60.5 controls equip an owned Black Hat, add a diamond helmet, and remove it at a fixed camera position.
The helmet collapses exactly four brim vertices. Removal restores those four positions exactly.
An installed controlled replay preserves the full native persona, including its animated face, and observes the same visible, hidden, and visible sequence.
The helmet and return GPU frames use the captured body texture and face-frame bytes. Body draws change from 360 to 366 indices, while the face retains 72 indices.
`BedrockPlayerHeadwearTest` covers the same surface lifetime through equipment queries, the sampled controller, and vertex emission.
These controls cover one headwear item. Observer FOV effects and idle-pose differences prevent a pixel-parity claim.
Full skin geometry, lighting, and account parity remain open.
The full add-on suite passes: 1,464 tests, 153 optional skips, and no failures. A fresh full-stack replay reproduces the tested source tree.

Physical geometry queries use the accepted level owner and the authoritative native block mirror.
They do not require a Java carrier or compiled visual. Unknown geometry keeps the existing camera fallback.
A regression rejects another level owner and clears geometry with the world mirror.

Complete installed direct and ViaProxy controls receive physical geometry while both visual-definition maps remain empty.
They preserve the accepted level lifetime through resource reload and an Overworld, Nether, and return sequence.
The full add-on build and fresh stack replay pass. Broader native world and actor lifecycles remain open.

The [owning patch](0008-share-native-actor-and-resource-runtime.patch) retains implementation rationale and versioned evidence.

Sound sample iteration follows the original Bedrock 1.26.60.5 JSON iterator: arrays contribute elements, objects contribute values in byte-sorted key order, and scalars contribute none. String entries and object sample descriptors remain supported; invalid entries are skipped. A bounded failure in one event no longer discards the remaining actor, equipment and UI sound libraries. Native-backed iterator controls and regression tests cover these shapes. The full asset-aware build passes, and a live SoulSteel join no longer logs the original sound-library exception. Full audible comparison remains unverified.

Ogg Vorbis length and codebook compatibility: a synthetic 8 kHz fixture checks that a final granule above the decoded length keeps the decoded frames without padding, and that a lower granule trims output. Private Galaxite Piercer clips (final granule 7071) decode 7040 stereo frames. Private Lifeboat Prison wheel clips with zero-entry codebooks fail in unmodified JOrbis 0.0.17; with the same codebook rewrite they decode 132300 and 140148 mono frames, against 132300 and 140020 from FFmpeg. The mixin itself is checked only at runtime, because unit tests do not apply mixins. Native audible parity is not measured.

Static Bedrock voices now delete their OpenAL buffer only after vanilla releases the source. Vanilla's `ChannelHandle.release()` sets the stopped flag before the sound executor destroys the source, so the render-thread tick could delete a buffer that was still attached. OpenAL rejects that with `AL_INVALID_OPERATION`, logs `Deleting stream buffers: Invalid operation.`, and leaks the buffer. A Galaxite recording (Bedrock 1.26.60, protocol 2225) logged it five times, each a few seconds after a pair of server StopSound-all packets. Deletion now runs through the existing release hook on the single-threaded sound executor. `BedrockSoundPlaybackTest` checks that the buffer survives until that release runs. The silent lab cannot establish an audible effect, and no live recheck has confirmed the log is gone.
