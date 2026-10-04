# Evaluate custom actors with the shared animation graph

## Implementation

Custom actors now use the same resource-defined graph as players and attachables.
The renderer retains playback for each actor object and authoritative lifetime.
Resource changes, world changes, and actor removal release that playback.
Immutable sampled poses feed deferred model draws, so shared models do not retain another actor's pose.

The shared graph supports script variables, weighted entries, state transitions, finite animations, held animations, and repeating animations.
Explicit legacy `description.animation_controllers` declarations precede modern `scripts.animate` roots.
Legacy roots reference controller resources directly and do not occupy the authored alias namespace.
The obsolete restricted bone evaluator and single-state controller selector are removed.

Controller UV expressions use the variables left by the sampled graph.
Missing queries evaluate to zero. Bad Molang arithmetic also becomes zero.
Invalid expressions retain their component default: zero for offset and one for scale.
The bounded cache of immutable render types preserves each deferred draw's UV values.
Material families still require verified shader support.

Custom model lookup preserves authored bone names, including distinct names that humanoid aliases would combine.
Bone scales multiply into the base pose.
Entity-relative rotations retain the existing full-matrix drawing path.
Animation effects use the existing sound and particle runtimes.
Locators follow the selected model's pose and actor scale.
Particle attachment callbacks reject removed actors, changed resources, and stale lifetimes.
Unsupported effect materials remain a separate runtime gap.

Player and attachable factories now use the shared server resource reader.
Their independent animation requirements remain part of the wider coverage goal.

## Target evidence

The reference is Bedrock 1.26.51.1, build 51061372, protocol 2193, with Java 26.3.
Microsoft's [animation controller reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/animationsreference/examples/animationcontroller) describes weighted entries, variables, ordered transitions, and state blending.
The implementation reuses the general evaluator's existing native comparisons rather than adding another state machine.

The licensed Windows executable has SHA-256 `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`.
Target function `14065a850` normalizes camera minus actor.
Yaw is `atan2(z, x)` in degrees minus 90. Pitch is negative `atan2(y, horizontal)` in degrees.
The native yaw range stays unwrapped.
Body-yaw registration `1421e652f` has getter `14220f630`, which calls the actor body-yaw function.
Native state blend `141e6fe70` confirms multiplicative base scale.
The production shader's existing private GPU comparisons remain relevant to numeric UV transforms.

Saved CubeCraft banners require camera rotation minus body yaw.
The saved Hive logo requires held root position and uniform scale 2.
Its format 1.8.0 hologram uses legacy controller declarations without `scripts.animate`.
These packs and the executable inspection remain private.

## Verification and limits

Targeted tests cover independent actor variables, weighted poses, transitions, visibility, held and repeating clocks, resource overrides, and legacy roots.
They also cover camera quadrants, unwrapped angles, distinct authored bone names, pose reset, and scaled world locators.
The full add-on build and its core and converter dependencies pass.

The saved CubeCraft recording uses protocol 2193 and scene SHA-256 `129f13f25af8110800fc0993c9d7aedc6d86477b1835e029dad2d5700051f5a8`.
Direct and ViaProxy replays both deliver the complete unchanged scene and load the Java resource pack.
Both pass transport and rendering checks, install all 216 skin updates unchanged, and evaluate 43 custom model selections.
Their screenshots show custom NPCs and banners. Resolved custom models reach draw submission.
The initial audit incorrectly reports no evaluated models because its store hook targets the removed `update` API.
The corrected audit observes immutable model snapshots after `apply` and requires that injection to succeed.
The coverage ledger records the final direct and ViaProxy audit counts.
The complete build runs 976 passing tests and skips 113 optional tests. All 14 replay tooling tests also pass.

The recording also exposes `particles_opaque` with texture `_`, which the current particle runtime rejects.
This patch does not claim support for that material.
Native comparisons of dynamic custom-actor transitions, weighted poses, and effect timing remain necessary.
The replay and numerical tests do not establish complete visual parity.

`ANIMATE_ENTITY` still needs core decoding, negotiated delivery, and runtime controller playback for every supported actor type.
This patch supplies the shared custom-actor graph required by that work.
