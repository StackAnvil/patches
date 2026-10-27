Render supported worn and held Bedrock attachables through the native player model path.
Both direct ViaFabricPlus and ViaProxy connections use the accepted actor archive.
Native item identity and authored item bindings select each equipped definition.

The target is Bedrock 1.26.51.1, protocol 2193.
A recorded Hive session identifies chest item 10173 as `hivebackbling:angel_wings_pink` and head item 10209 as `hivehats:axe`.
The wings retain six authored planes, south-face UVs, and inherited `DisableCulling`.
Their spawn animation reaches full scale at 0.64 seconds and holds that frame.

## Equipment scope and lifetime

Each player, slot, selected item, and perspective retains its own playback scope.
Animation, render-controller selection, and bone bindings share that sampled scope.
Bindings run in authored bone order after item initialization and animation updates.
Compiled geometry definitions contain no mutable evaluator.
Replacement, rewind, resource reload, and disconnect release the corresponding state.

Parent setup uses the existing owner scope when that scope becomes available or changes.
Classic owners without a native graph or server controller have no parent variable scope.
Their independent equipped animation and visibility still work.
Supported native surfaces suppress the corresponding vanilla equipment layer.
Unsupported queries, variants, or material families retain the existing fallback.

## Owner bone transforms

Implicit same-name bindings apply the complete owner deformation matrix.
Explicit bindings replace the selected bone's bind transform with the complete owner matrix.
The current item's sampled animation follows that copied transform.
Entity-relative rotation retains the owner origin and clears its inherited basis.
Independently bound children work beneath singular parents without parent inversion.
Locators and Java drawing retain the same complete matrices, including shear and reflected scale.

Declarations remain separate from typed expression results.
A missing owner name or non-string result leaves that bone in its local hierarchy.
An explicit declaration suppresses implicit same-name deformation even when its target does not resolve.
Other valid child bindings still work.
Empty and whitespace strings remain string values for ordinary owner lookup.
Numeric values do not become empty names or numeric-looking strings.

Held and first-person admission use declared geometry ancestry instead of requiring every target name to exist.
The guards for disconnected geometry, cycles, unbound mob equipment, and unavailable owner drawing remain active.
Dedicated item paths retain their existing fallback rules.

## Native evidence and validation

The pinned executable has SHA-256 `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`.
Original binding setup supplies the child context to scripts, animation, and expressions, and the parent context to parent setup.
The typed gate at `0x141c3a5cc` accepts string kind 1 and skips other result kinds.
An unresolved string advances to the next bone without a matrix copy or local-channel reset.

The transform comparison uses these unchanged native routines:

- Complete bone constructor `0x141c1b620` and rest setup `0x141c32b7a..0x141c32c0b`.
- Owner hash search, matrix copy, and local-channel reset through `0x141c3a8fe`.
- Recursive hierarchy `0x141c22010` and matrix composition `0x141bc3d20`.

The existing 96 controls cover successful nested bindings, reflected and singular owners, animation, and entity-relative rotation.
Another 96 fresh-frame controls cover valid, missing, empty, whitespace, numeric, and unknown results with a colliding same-name owner.
Java bone and locator matrices match both sets.
The regression comparison fails when declaration-based suppression alone is removed.
Scope tests cover ordered writes, owner and perspective isolation, replacement, rewind, standalone selection, and unsupported-query fallback.
Other tests cover actual emitted Java vertices, normals, repeated binding, and binding removal.

Parsed definitions, typed expression values, animation samples, owner matrices, and weak-reference backing are supplied inputs.
Diagnostic formatting and logging are explicit return boundaries.
Native JSON and Molang admission, component cleanup, and valid-to-missing lifecycle transitions do not run in these controls.
Name normalization, native cube assembly, and complete visible parity remain unverified.
The original executable, raw native fixtures, and diagnostic variants remain private.

Earlier live Hive checks restore the supported wing and head geometry with stable playback and no duplicate vanilla head item.
Earlier CubeCraft checks reach playable spawn but retain the unresolved overall rendering gate.
These checks do not establish native first-person equipment placement or a live comparison of unresolved binding targets.
Per-bone materials, additional variants and material families, and broader pack comparisons remain incomplete.

The full four-project build passes 3,049 tests with 152 optional skips and no failures or errors.
All 21 focused binding and owner tests pass without skips, including both native matrix fixtures and the existing native slot callback fixture.
All 38 add-on patches replay.
All 1,205 compiled client classes match the distributable add-on.
All 1,557 core classes, 199 assets, and 39 converter classes match both embedded consumers.
The rebuilt core and ViaProxy JARs remain byte-identical to the preceding milestone.
The earlier unresolved-target increment used numerical controls. The live costume checks follow here.


## Bind equipment to the rendered costume

Third-person equipment now uses the primary resolved server costume as its owner, matching the existing first-person owner order.
Previously, equipment always used the base skin skeleton even when the server costume supplied the visible body.
The equipment layer prepares the selected costume with the current immutable render state before reading its matrices.
This preparation does not evaluate scripts or advance animation playback.
If no costume resolves, equipment retains the skin owner.

A real BDS 1.26.51.1 pack exposes the previous mismatch.
Its visible costume has a body matrix at Y=24, while the base skin has Y=0.
The valid body-bound child therefore appeared above the costume in third person.
The regression covers this origin difference, current head animation, primary selection, replacement, and return to the skin.

The live scene also exercises unresolved names, empty strings, whitespace, numeric results, and a valid body target.
Real hotbar changes select the five items.
Sneaking switches one binding between missing and valid targets while retaining the same item playback.
A separate child keeps its valid binding throughout.
The observer only reads production scopes and models after normal drawing setup.

Native component lifetime, multi-geometry owner semantics, native poses, and complete image parity remain unverified.
The scene uses an authored test costume and does not supply a native graphical baseline.

Fresh direct and ViaProxy sessions each verify 16 equipment states with the same rebuilt add-on.
Both views use the costume body matrix at Y=24 while the base skin remains at Y=0.
The colliding owner head stays at X=32, while the unresolved item bone retains its local position.
Sneak transitions preserve playback identity and start time as its clock advances.
Clearing equipment retires both perspective caches after each view updates.
All 28 final screenshots receive visual review, and installed runtime JAR hashes match the build.

The fixture also exposed blank ViaProxy hotbar icons while the direct route displayed vanilla icons.
Core patch 0068 now supplies shared native image layers and atlases, which addresses that separate conversion difference.
The equipment-owner correction retains its own validation boundaries.


## Prepare the selected controller owner, October 26, 2026

Equipment prepares the primary costume's typed draw before reading its underlying native model matrices.
This retains the selected controller visibility without changing the shared avatar state or advancing graph playback.
The existing equipment-owner regression uses the real costume wrapper and passes alongside the new deferred-draw regressions.
The [player costume controls](0016-render-server-player-costumes.pr.md#independent-player-controller-draws-october-26-2026) verify the installed wrapper on both routes.
This adaptation does not add new live equipment-placement coverage.


## Per-bone equipped materials, October 26, 2026

Equipped models now admit supported per-bone materials instead of rejecting every non-wildcard declaration.
Each material draws only its selected surfaces while retaining all owner and explicit binding targets.
An unresolved parent binding still preserves local geometry, and an independently bound child retains its valid target.
Materialized sprite geometry has a separate cache from the filtered draw models.
Current draw subsets replace historical subsets without restarting the equipment entry.
Missing active materials or required images retain the existing whole-slot fallback.

The authored live stick retains a local head matrix at `(4, 4, 12)` and a body-bound child at `(0, 24, 0)`.
Physical sneaking changes the child material between cutout and opaque while the parent remains opaque.
Direct and Iris-enabled ViaProxy captures show the green child appear and disappear beside the retained red parent.
Both first-person and third-person views retain their selected model groups and complete binding matrices.
These controls do not establish native placement or component-lifetime equality.

The [current coverage record](../../../docs/bedrock-coverage.md#per-bone-material-rendering-october-26-2026) records the final build, both live routes, and remaining limits.


## Enchanted shield path remains incomplete, October 27, 2026

A passive WildFFA trace confirms that an enchanted shield retains its converted static item model while the native equipped renderer skips it.
The item has an empty banner-pattern list and no base color; component presence alone does not establish a patterned shield.
The native body submits one surface, the shield submits no native surface, and Java draws an ordinary model layer with glint.
Its draw matrix and display transform remain unchanged across actual idle and offhand-use states.
The [coverage record](../../../docs/bedrock-coverage.md#enchanted-shield-draw-attribution-october-27-2026)
records the resumed same-client observation, failed initial controls, and verification limits.

The target material library defines glint with a second repeated texture sampler.
This material family and complete animated enchanted equipment remain unsupported.
The issue requires native material and animation work; the static fallback does not establish shield parity.

## Plain shield banner-data routing, October 27, 2026

Held-item admission now checks visible banner data instead of component presence.
An empty pattern list without a base color no longer prevents native equipped rendering.
A nonempty list or a base color still reserves the Java banner atlas path.
Both perspectives use this shared check.

A regression test covers missing, empty, colored, and patterned components, then replacement with empty layers.
The focused equipment tests pass at the owning prefix.
The complete stack replays, and its add-on suite reports 1,108 passed, 139 optional skipped, and no failures.
The isolated upstream check still requires earlier StackAnvil actor-animation changes; its temporary apply was aborted.
The reported WildFFA shield also has enchantment glint, which still keeps its existing fallback.
This change does not resolve that separate shader and animation gap or establish visible shield parity.


## Enchanted held materials and current animation, October 27, 2026

Supported enchanted hand items now use native materials, secondary textures, and a fresh extraction frame.
The nested target shield controller receives an explicit unpatterned flag.
Visible banner data retains its existing atlas fallback.
The current item's sampled animation follows the copied owner matrix.
The later rest-pose correction below also retains the authored local origin and rotation.

The controller regression switches one item between plain and enchanted states and checks material selection and texture order.
Earlier supplied-order comparisons execute original native binding kernels, but omit rest restoration after binding.
Those primitive comparisons do not establish the final rendered frame.

A real enchanted off-hand shield now submits one native surface and no observed Java shield draw.
Blocking changes its visible pose with shaders enabled and disabled.
All eight captures receive visual review.
The shield remains large, and exact native size, placement, main-hand behavior, and banner composition remain unverified.
The [coverage record](../../../docs/bedrock-coverage.md#equipped-native-glint-and-current-item-channels-october-27-2026) includes build counts, artifact identity, client evidence, and the failed attempts.


## Complete local poses after explicit binding, October 27, 2026

Explicit binding now reparents the complete current local pose to the selected owner bone.
It retains the authored rest translation and rotation before sampled animation channels.
The draw uses the shared local composition and no longer accepts a second animation map.
Implicit deformation, missing-target fallback and independent child binding retain their existing paths.

Official Bedrock 1.26.51.1, build 51061372, protocol 2193 supplies the pose reference.
The vanilla shield retains rest position `(1, -8.5, 3)` before its animation channels.
Its idle matrix has translation `(-6.5, 23.3, 8.1)`; blocking produces `(-6, 20.1, 9.6)`.
Release restores the exact idle matrix.
An owned server pack changes only authored rotation to `(15, 25, 35)`.
Native idle retains rotation `(16, 201, 32.5)`, and blocking retains `(16, 201, 42.5)`.
This control establishes that rest rotation remains after binding too.

A mandatory regression compares all observed matrix elements for both geometries through idle, blocking and release.
It fails on the earlier implementation at the missing translation.
Hierarchy controls retain reflection, shear, singular owners, entity-relative descendants, locators, vertices and normals.
The full add-on build passes 1,257 tests, including 133 optional skips, with no failures or errors.
All 38 patches replay, and offline tooling, regression and metadata checks pass.

The rebuilt artifact completes live idle, use, release and third-person controls with Iris enabled and disabled.
The paired first-person shield placement agrees visually with the owned native reference.
Third-person placement returns beside the body.
The Java and native clients use different avatars, so these captures do not establish complete third-person avatar parity.
This new live control uses an unenchanted shield. Earlier glint controls retain their separate scope.
General attachables, main-hand variants, banners and the original server-authored inventory report remain separate verification work.
Raw captures and process observations remain private.
