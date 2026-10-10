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

## Server animation commands

The client advertises the core animation channel and binds received commands to the current connection and actor lifetime.
The shared graph consumes core's retained controller definitions separately for each actor and perspective.
It resolves declared aliases and global resources outside `scripts.animate` when a command needs them.
Unresolved animation commands leave the current selection unchanged.
They also cannot reserve a controller position before a later command resolves.
Runtime slots follow the order of their first resolvable commands.
Named next states can bind their animation before receiving a command.

Runtime states retain ordered stop conditions and reuse their child players.
The last valid selection before a frame wins, takes priority over conditions, and resets even the current state.
An outgoing state supplies its blend curve.
Selecting that same state during a blend samples its shared child twice, matching the native controller.
The runtime also selects authored controller states without sampling the controller twice.
Sound and particle callbacks use the existing effect runtimes.
First-person graph sampling has independent clocks and suppresses duplicate effects through its existing event policy.
The current hand renderer consumes visibility and camera state but does not apply those sampled bone poses.

Native query binding remains attached to the state selected before the update during child sampling.
Nested controllers clear that binding.
The full suite rejected an attempted parent-binding restoration, and the production path now follows the executable callback results.

Targeted numerical tests cover repeated selection, pending-selection priority, uncommanded next states, completion timing, outgoing blends, shared-state sampling, independent slots, perspectives, and effects.
They also check authored controller reuse, shared variables after unavailable commands, and cleanup after command state changes.
The core patch notes identify the native builder, selection, transition, and update routines.

Ordinary mob drawing, other stop-expression versions, emote composition, and complete first-person and visible effect timing remain open.
This implementation does not establish animation parity for every actor type.


The native command recording now passes transport and rendering checks through direct connections and ViaProxy.
Both routes deliver all 13 commands with the complete original scene hash.
Required private instrumentation observes the production graph after sampling.
It checks finite-animation resets, simultaneous slots, and the uncommanded next-state alias.
Both routes finish in `fixture_raise` with right-arm rotation `(-90, 0, 0)`.
The complete build passes 993 tests and skips 113 optional tests.
These checks cover player bodies; custom-actor command scenes and complete visible timing comparisons still require work.

## Resolve the same entity description as core

The server graph reads the core effective description after layer inheritance.
It retains independent animation and controller definitions from the ordered packs.
A higher right-arm alias overrides that pose while the lower left alias and root list survive.
The licensed appearance reader and attachable reader still need separate inheritance checks.
Direct and ViaProxy hand-entry probes reproduce the target native scale and both bone translations.
The core resolver is independently reviewable in `0087-inherit-client-entity-descriptions-across-layers.patch`.

The actor visibility fixture now initializes its offset before comparing it with zero.
The shared core evaluator distinguishes missing members from zero, so this regression supplies its intended initial state explicitly.
The complete build passes with the updated fixture.

## Share server resource definitions across actors

A macOS CubeCraft heap dump identifies 26 actor graphs retaining separate copies of the same animation definitions.
These copies retain 1,340,555,464 bytes, leaving too little room for resource reloads in a 2 GiB client heap.
The graph reader now parses animation definitions, controller definitions, and effect resources once per accepted pack storage.
Weak storage keys preserve the pack lifetime without keeping disconnected storage alive.
Cached values contain resources and cannot retain their storage key.
Each graph and playback keeps its own compiled channels, controller state, variables, command slots, and clocks.
Replacement storage receives new definitions.
A targeted regression checks parsing across two actors, independent variables, and replacement resources.

The rebuilt client reaches the CubeCraft lobby and unloads its pack with a confirmed 2 GiB heap on the macOS guest.
A live histogram shows one shared resource library across 27 actor graphs and about 155,000 Gson map nodes.
The lobby heap sample uses about 758 MiB before collection. This verifies one load and unload, with longer sessions still required.

## Inherit native resources for the first-person hand

Server animation graphs start with the checksum-verified asset library for the target Bedrock version. Accepted packs then override animations, controllers and effects in their original order. Duplicate resource identifiers inside one accepted pack retain the existing last-definition behavior. The effective server player description remains authoritative.

An accepted CubeCraft pack references native player root controllers and the empty-hand animation without supplying those resources. The shared reader previously omitted them. The Java hand frame also supplies `is_using_vr = 0`, which the native empty-hand expressions require for this non-VR renderer. These changes use the resource-defined pose rather than a fixed arm transform.

A private production-graph fixture resolves the original pack references and samples right-arm position `(13.5, -10, 12)` and rotation `(95, -45, 115)`. The accepted server visibility script reveals the empty hand and hides it with a compass equipped. Targeted tests cover baseline inheritance, effect lookup, accepted-pack overrides, duplicate controller formats and non-VR hand binding.

The complete add-on build passes: 532 tests passed, 117 optional tests skipped, no failures. Access-widener validation passes. The reviewed candidate was installed in the desktop client, which joined CubeCraft successfully. The user confirms the arm is visible. This verifies the reported empty-hand regression; VR, all costumes and complete native visual parity remain separate checks.

## Effect locator index

The first locator request builds an index for the accepted resource generation.
Each model document parses once. Animated effect models remain lazy until a locator resolves.
The index preserves pack override order, duplicate definitions, empty overrides and malformed-file behavior.
Resource replacement clears the index.
Differential tests compare the new index with the previous per-geometry resolver.
Repeated requests also verify that the index reuses the parsed document.

## Combined stack validation

The full dependency build passes for CubeConverter, ViaBedrock, the Bedrock add-on and ViaProxy.
Core passes 1,159 tests and the add-on passes 786 tests.
JUnit skips 30 core tests and 120 add-on tests.
CubeConverter passes 18 tests and ViaProxy passes four tests.
The standalone cache patch passes 45 tests and both Checkstyle tasks.
TypeScript checking and patch whitespace checks also pass.
These results establish stack replay and test behavior. Live server frame-time profiling remains separate.
