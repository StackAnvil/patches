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
Explicit bindings replace the selected bone transform with the complete owner matrix.
They discard local position, rotation, and scale from that bound result.
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

The fixture also exposes an open route difference: ViaProxy hotbar icons are blank, while the direct route displays vanilla icons.
That difference also occurs in the before-fix proxy recording and remains outside the verified equipment-owner correction.
