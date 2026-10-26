# Native world actor definitions

## Bundled villager graph admission, October 26, 2026

The standard 1.26.51.1 villager graph now resolves after its explicit default depth declaration passes material validation.
The [material notes](0002-native-entities-and-skins.pr.md#explicit-default-depth-declarations-october-26-2026) explain the declaration and reversed-depth pipeline.
No authored client-entity replacement supplies the villager graph in these controls.

The regression samples seven biome textures for both adult and baby geometry.
It retains four resolved surfaces and native script scales of 0.9375 and 2.
The level surface retains its adult geometry while the baby visibility rule hides it.
Supplied stationary movement inputs isolate graph admission and texture selection.
Masked profession layers still retain Java fallback; resetting that state recovers the same playback.


Fresh direct and ViaProxy sessions load the bundled villager client graph on BDS 1.26.51.1.
An additional ViaProxy session verifies the same transitions with Iris 1.11.7 and Complementary Reimagined r5.9.3.
Authored server component events change biome, age, and profession metadata; they do not replace the client graph.
Native packet journals confirm each typed biome, age, and profession transition.
Read-only observations verify four resolved surfaces, biome textures, adult/baby geometry, and native script scales.
Masked professions select Java fallback, and resetting the profession recovers the same actor playback and lifetime.
Removal retires the native snapshot on all three runs.
All 21 final screenshots receive visual review, and runtime artifacts match the build.

The white bar in these early shader captures is the configured RRLS reload indicator.
[Lifecycle controls](../../../docs/bedrock-coverage.md#shader-profile-reload-indicator-october-26-2026) show that it clears automatically after loading completes.
Complete Iris and native visual parity remain unverified.

These controls do not establish native graphical parity, natural aging, collision behavior, or complete villager interactions.

Ordinary mapped entities now resolve the bundled Bedrock 1.26.51.1 client entity definition beneath accepted server packs. Supported definitions supply native geometry, textures, animation, visibility and materials. The Java entity continues to handle gameplay.

The target library's end crystal uses `animation.ender_crystal.move` and `controller.render.ender_crystal`. Its authored rotation uses lifetime and a random phase. It does not face the camera. The native draw retains server animation commands and the original Java shadow radius.

Replace the Java appearance only when every selected surface resolves. Missing queries, equipment, sleeping, riding, unsupported materials and active crystal beams retain Java rendering. This fallback preserves features that the native world renderer cannot reproduce yet.

Targeted tests load the bundled crystal without server overrides. They cover camera independence, bottom visibility, texture resolution and unsupported override fallback. Full build and private runtime results are recorded in the release verification.

## Validation

The complete four-project build and modpack bundle pass. Core passes 1,045 tests with 30 optional skips. The add-on passes 700 tests with 120 optional skips. The cleaned patch stack replays to the same source tree. The north-star PR check also passes.

Additional crystal regressions sample the bundled animation at 20, 60 and 144 frames per second through three animation loops.
Each nested bone retains the authored rate of minus 60 degrees per second.
The bob uses the authored 230-degree-per-second sine input, and the random phase remains stable for the playback lifetime.
These tests pass without a speed adjustment and do not establish live native screenshot parity.

## Shulker attachment and lid variables

Pass the Java shulker attachment direction and interpolated lid opening into the native graph. The licensed Bedrock 1.26.51.1 shulker definition reads both values during pre-animation.

Production graph tests cover all six attachment directions and lid motion through the normal resource resolver. These tests verify authored transforms without claiming native attack or teleport parity.

The updated Java client joins BDS 1.26.51.1 through ViaProxy and renders a summoned shulker with visible lid motion. This scene does not verify attacks or teleport behavior.

## World actor animation effects

Supported world actors now deliver sound and particle cues from the shared animation runtime.
The renderer validates selected geometry, materials and textures before it starts effects.
Repeated frames do not repeat timeline events, and paused sampling consumes events without playback.

Locators use the sampled bone pose, body yaw, native actor scale and authored script scale.
Attached emitters receive current actor queries and bounds.
Their suppliers stop resolving after removal, world or resource changes, renderer fallback, or native actor replacement.
Particle definitions retain the complete shared resource library, including child effects and texture-only overrides.
Each actor keeps filtered geometry storage without copying every shared effect asset.

Targeted tests cover consumed and muted events, immutable frame cues and nonuniform locator scaling.
The resource regression checks that particle dependencies survive outside the filtered geometry storage.
Bound animation emitters start at their local origin because the attachment already supplies the world transform.
Unbound cues receive the sampled world position without a following supplier.
This matches the existing player path and prevents doubled world translation.
The full four-project build passes 2,127 tests, with 152 optional skips.
The full 38-patch add-on stack replays, and offline validation and patch health pass.

An owned BDS 1.26.51.1 fixture replaces the mapped crystal with an authored model and looping sound and particle events.
The baseline retains Java rendering and emits no effects.
The updated renderer accepts the authored model, calls 34 sound cues and 34 particle cues, and creates both parent and child emitters.
Actual particle output places both effects at the scaled locator height of 71.875 across the two observed actor positions.
The private screenshot shows the authored model and its green parent billboard.
The scene also removes and replaces the actor.
Both clients and the owned server exit normally, with no retained process identities or particle-load errors.

This fixture verifies the production bridge with authored assets.
It does not establish audible sound parity, complete motion interpolation, offscreen simulation, or matching native screenshots.
The CubeCraft lobby NPC comparison and mounted camera-eye bindings remain separate work.

## Camel pose inputs

World actor graphs now receive vertical speed and lava state.
Vertical speed uses the target's float velocity Y multiplied by `20F`.
The shared actor frame supplies sitting, saddle and dash-cooldown flags.
The bundled camel graph needs these inputs before it can select its authored pose.

Target registrations select vertical-speed callback `14220edc0` and lava callback `14220ef60`.
The former reads motion component `f96968b0` and applies the native multiplier.
The latter tests component `832a2768` with sparse generation checks.
A private 672-context probe executes these callbacks, the three flag callbacks, and the complete native flag reader.
It covers missing actor bindings, stale and recycled generations, motion signs, signed zero, and independent flag combinations.

The Java adapter supplies current client motion and lava state.
Comparisons cover the live actor contexts and exact scalar float bits.
They do not establish native motion or fluid production, mount-offset timing, or complete visible parity.
Equipment and unsupported-query fallback remain in place.

The bundled camel test now resolves distinct standing and sitting poses.
It uses the shared grouped-reference reader and the current licensed definition.
The full four-project build passes 2,132 tests, with 152 optional skips.
All 38 add-on patches replay. Offline tooling and patch metadata checks pass.

A private BDS scene compares the previous add-on with the rebuilt add-on.
The baseline selects the Java fallback and records no native camel submissions.
The rebuilt client records 3,551 accepted samples and at least 3,521 native model submissions.
The observer sees both sitting and standing flags, with one selected draw per accepted sample.
Sitting observations are brief, so this run does not establish complete sit-down or stand-up timing.
Both clients and BDS instances exit normally, and the original fixture script is restored.
Raw recordings, screenshots and native assets remain private.

## Refresh attached world-actor particle inputs

Bound world-actor particles sample current common actor inputs and native metadata independently of another body submission.
The existing resource and actor lifetime guards, locator pose, and unrelated graph inputs remain available.
See the [shared runtime evidence](0008-share-native-actor-and-resource-runtime.pr.md#fresh-common-particle-actor-inputs) for tested queries, native boundaries, and remaining limits.

## Recover native draws after input changes, October 26, 2026

A failed native draw can retry when its immutable actor snapshot changes.
The renderer retains its playback instance, variables, animation phase, and consumed effect cursors.
The shared runtime now records unsupported queries per frame instead of retaining an earlier frame's admission errors.
An unchanged unsupported snapshot remains cached.
This change does not implement every conditional or time-only recovery path.

The target-query transport provides a concrete recovery case.
Withdrawing the actual Fabric v4 receiver selects the older actor format and Java fallback.
Restoring the receiver republishes target metadata and permits native rendering again.
Before this change, a live guardian remained failed for 566 samples after metadata returned.
Tests restore a required query in the same world playback and verify the native crystal animation phase.

Fresh direct and ViaProxy sessions repeat the guardian control with the fix.
They verify native target changes, the authored model's width, and parent and child particle scopes and colors.
Receiver withdrawal selects Java fallback, and restoration resumes native draws with the same playback identity and increasing age.
Screenshots show the native model, Java fallback, restored model, and removal.
The observer only records production state; a separate declared control changes the actual Fabric receiver and restores its original handler.
The fixture supplies the guardian appearance, without a native graphical baseline or complete guardian parity claim.

The replayed four-project build passes 3,046 tests, skips 152 optional tests, and reports no failures.
Fifteen focused actor tests also pass against the distributable core JAR with eight production origins verified.
Mounted, sleeping, equipped, unsupported-material, and active crystal-beam fallbacks remain.
Other native queries and complete graphical and gameplay parity still require work.
