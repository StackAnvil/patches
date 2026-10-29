# Native world actor definitions

## Bundled villager graph admission, October 26, 2026

The standard 1.26.51.1 villager graph now resolves after its explicit default depth declaration passes material validation.
The [material notes](0002-native-entities-and-skins.pr.md#explicit-default-depth-declarations-october-26-2026) explain the declaration and reversed-depth pipeline.
No authored client-entity replacement supplies the villager graph in these controls.

The regression samples seven biome textures for both adult and baby geometry.
It retains three controller draws and native script scales of 0.9375 and 2.
The [shared selector correction](0008-share-native-actor-and-resource-runtime.pr.md#controller-texture-slots-october-26-2026) removes a duplicate draw from the biome controller’s second sampler slot.
The level surface retains its adult geometry while the baby visibility rule hides it.
Supplied stationary movement inputs isolate graph admission and texture selection.
Masked profession layers still retain Java fallback; resetting that state recovers the same playback.


Fresh direct and ViaProxy sessions load the bundled villager client graph on BDS 1.26.51.1.
An additional ViaProxy session verifies the same transitions with Iris 1.11.7 and Complementary Reimagined r5.9.3.
Authored server component events change biome, age, and profession metadata; they do not replace the client graph.
Native packet journals confirm each typed biome, age, and profession transition.
Those earlier read-only observations report four surfaces, including the duplicate sampler draw corrected by the shared selector.
They also verify biome textures, adult/baby geometry, and native script scales.
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


## Controller draw correction, October 26, 2026

The shared selector now binds texture entries as sampler slots within one draw.
Fresh direct and Iris-enabled ViaProxy controls each resolve three villager draws through biome and age changes.
Masked profession fallback, recovery, and removal preserve their existing lifetime rules.
The [shared runtime evidence](0008-share-native-actor-and-resource-runtime.pr.md#controller-texture-slots-october-26-2026) records native fragment controls, regressions, builds, and limits.


## Per-bone world materials, October 26, 2026

Supported world actor graphs now select separate material groups from the complete controller map.
The renderer intersects each group's bone set with controller visibility before model lookup.
All active groups and required images must resolve before native rendering replaces Java.
An unavailable group retains fallback for the whole actor.
Effect and locator models retain their complete skeleton independently of material partitions.

The new world regression splits two rendered bones across opaque and cutout materials, then merges them through a later rule.
It retains the parent pose, excludes an empty anchor from material demand, rejects an unsupported active group, and recovers afterward.
Restoring the earlier non-wildcard admission rejection fails this regression.

A declared native crystal uses two zero-alpha color surfaces and a material expression based on its actual actor lifetime.
Direct and Iris-enabled ViaProxy captures show the green surface disappear and reappear while the red surface remains visible.
The controller retains one native actor lifetime across those changes.
This authored scene does not provide a native expression or graphical baseline.

The [current coverage record](../../../docs/bedrock-coverage.md#per-bone-material-rendering-october-26-2026) records the final build, both live routes, and remaining limits.


## Material depth and EntityCulling, October 26, 2026

An ordinary occlusion test can discard an actor whose material intentionally draws behind an opaque wall.
The resolved actor definition now retains this requirement across all supported declared material alternatives.
It resolves before the first draw and does not sample animations or emit effects.
Unknown materials retain their existing fallback policy.

The optional EntityCulling integration uses its public dynamic whitelist API.
The client tick publishes an immutable set of entity instances for its worker.
The integration clears stale culled state after a definition finishes loading.
Resource replacement and disconnect clear the snapshot, while removed entity instances leave it on the next tick.
Ordinary material comparisons retain the normal culling policy.
The dependency is compile-only, and the bridge loads only with EntityCulling installed.

Tests cover each depth comparison, independent depth writes, inherited alternatives, unsupported materials, and resource generations before any draw.
A fresh Iris scene hides all three authored parts behind stone before the hook.
Removing only EntityCulling restores the Always and disabled-depth parts.
The [public implementation](https://github.com/tr7zw/EntityCulling/blob/main/src/main/java/dev/tr7zw/entityculling/EntityCullingModBase.java) defines the dynamic whitelist API.
The installed 1.11.1 Fabric artifact matches the pinned Modrinth version and its SHA-512.

This correction does not establish native backend state creation or complete graphical parity.

The final artifact passes the same scene with EntityCulling enabled, Iris 1.11.7, and Complementary Reimagined r5.9.3.
Normal depth disappears behind stone; Always and disabled testing remain visible.
The plain profile also passes with EntityCulling absent.
All six final screenshots received visual review, and both temporary server installations were restored.
The [coverage record](../../../docs/bedrock-coverage.md#actor-material-depth-and-occlusion-october-26-2026) records final test totals and remaining limits.


## Shared equipment and vehicle queries, October 27, 2026

Actor animation frames now receive the shared head-slot and native vehicle-type bindings.
Unknown equipment or native vehicle metadata remains unavailable instead of receiving invented defaults.
The [shared runtime notes](0008-share-native-actor-and-resource-runtime.pr.md#head-equipment-and-native-vehicle-queries-october-27-2026)
record the semantics, regression controls, and verification limits.
Living world actors also derive `query.is_riding` from their current passenger state.


## Versioned cat geometry and palette draws, October 28, 2026

World playback now receives native actor-state v6 palette inputs.
Each draw retains its sampled tint. Material cache keys include that tint,
so metadata changes cannot reuse a previous color. Changed snapshots also
invalidate frame reuse at the same animation clock. Unavailable legacy
context clears the tint and restores fallback.

The bundled-cat regression samples current, 1.20.0, and current resource
views through the production graph. It checks baby geometry selection,
script scale, palette replacement, earlier draw immutability, retirement,
unsupported indices, and recovery. The real-resource test passes without skips.
Native palette controls and current/older/current reference captures are private.
A live direct client reconnects through current, 1.20.0, and current worlds.
All three graphs select native draws without missing queries or material failure.
Script scales change from 2.5 to 1 to 2.5. Primary palette indices change
from 0 to 14 to 0, matching each world’s native BYTE metadata.
The older world’s tamed state does not carry into the return connection.
Resource selection is verified; complete pose alignment remains open.
The Java capture shows a head-roll difference from the native reference.

## Native cat animation variables, October 28, 2026

The world adapter now supplies the cat's engine variables before evaluating
its resource graph. Missing `variable.state` kept both resource views in the
initial lying state. The current baby clip adds a fixed head roll there.
Native state priority is sneaking, sprinting, sitting, then resting, with
ordinary movement as state three.

Body and tail rest values advance on entity ticks, including offscreen
actors. Render sampling interpolates retained previous/current values.
Changing the native lifetime clears those values. Nearby-player lookup uses
scaled physical dimensions, float rounding, and two-unit expansion, rather
than interactive picking boxes. Missing or retired dimensions retain fallback.

The matching 26.60.5 executable identifies producer `142c18730` and tick leaf
`146965fd0`. Original instruction controls cover 16 flag combinations,
72 bounded updates, a 39-tick rest history, and 156 interpolation samples.
State selection supplies a flag-reader boundary; tick and interpolation
arithmetic execute unchanged. Licensed binaries and controls remain private.

Loopback metadata controls drive actual native and Java clients through
standing, sneaking, sprinting, sitting, resting, and return in both current
and 1.20.0 worlds. The journals confirm every state with the baby flag.
All 12 direct observations retain native draws without missing queries.
The persistent head roll clears, and rest interpolation reaches one then
returns to zero. These are controlled rendering inputs, not natural AI tests.

The final artifact also passes a fresh ViaProxy standing/resting/standing
run. Read-only observations confirm physical dimensions, native draw
admission, and body/tail values of zero, one, and zero. The recorder exits
normally; the owned relay closes with its journal preserved.
The full build passes 1,293 add-on tests with 134 optional skips and no
failures or errors. Core remains at 2,056 tests with 176 optional skips.
All new cat regressions run, including the original native arithmetic controls.

Exact head-target timing, shadows, natural resting positions, and sleeping
player lookup still need dedicated comparisons. The forced current baby
rest clips below this fixture's floor in both clients. The native cached
font pack does not re-export in one reference session; its wire cutoff and
vanilla cat inputs remain recorded. Resource audio acceptance stays open.
