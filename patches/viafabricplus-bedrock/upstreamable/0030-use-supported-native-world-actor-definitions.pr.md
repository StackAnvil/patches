# Native world actor definitions

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
