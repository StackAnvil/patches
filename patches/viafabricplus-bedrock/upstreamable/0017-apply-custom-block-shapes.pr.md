Apply collision, selection, occlusion, support and lighting from ViaBedrock custom block metadata to reserved Java carrier states. Ordinary blocks retain their existing behavior.

Validation: semantic shape tests and full addon tests pass. The recorded Geyser and CubeCraft scenes exercise runtime mixin initialization and custom block models.

Custom redstone-wire carriers use white block and particle tint and suppress ambient redstone particles. Ordinary wire states retain their native behavior.

Decode ViaBedrock's generated mixed-face model through Java 26.3's cuboid loader. Verify that disabled face dimming uses upward cardinal brightness, keeps six faces, and does not add emission. This covers the actual model schema rather than source text.

Both flat and ambient-occlusion rendering honor disabled face dimming on registered custom carriers. Their upward model override uses multiplier 1 even with Nether cardinal lighting. Ordinary blocks retain their dimension-specific shading.

## Accepted server-pack properties

ViaProxy supplies physical block properties through the accepted converted resource pack.
Direct connections retain the existing core state path.
Both routes use the same shape, support, lighting, and carrier integration.
Metadata declares its format and exact Bedrock and Java protocols.
The loader rejects incompatible versions, invalid boxes, duplicate states, and oversized metadata.
It reads server packs only and selects the highest-priority server definition.

Reload preparation retains current physics until the new definitions apply.
A generation token prevents stale preparation from restoring an earlier reload or disconnected session.
Resource removal and disconnect clear the mapping.
Tests cover these lifecycle transitions, precedence, collision bounds, and filter values.

A private target-server fixture has half-height collision, full-height selection, emission 12, and filtering 3.
Direct and ViaProxy clients both land at Y=120.5 on the block at Y=120.
Live block-state inspection confirms the separate selection bounds and lighting values on both routes.
A ViaProxy resource reload preserves the values and standing height.
Disconnect clears the client mapping.
The fixture texture is procedural, and production requires no local Bedrock installation.

VoxelShapes describes native rendering culling.
Core now compiles custom culling rules from that registry.
Vanilla partial-block mapping and broader native comparisons remain incomplete.
This transport carries physical properties independently.
The full stack passes 428 core tests, 526 add-on tests, and 16 converter tests.
Core has one optional fixture skip, and the add-on has 109 optional fixture skips.
All suites have zero failures and errors, and core Checkstyle passes.

## Conditional terrain culling

The server-pack loader retains culling descriptors with physical properties during resource reload.
It reads accepted server packs and clears both mappings after disconnect.
Java model parsing and baking preserve the authored face rules on distinct quads.
This prevents shared quad identities from losing different rules.
The terrain renderer evaluates these rules against the actual neighboring state.
Inventory previews retain all geometry.

Tests cover block identity, permutations, layers, opaque-neighbor opt-out, face participation, and coverage gaps.
A private target-server fixture verifies that direct and ViaProxy models retain six marked faces per cube.
Both terrain rendering paths hide the matching block, matching layer, and covered voxel fixtures.
A different permutation remains visible, and neighbor removal restores all four cubes.
The ViaProxy client visibly displays that different-permutation cube with the neighbors present.
Reload preserves the descriptors, and disconnect clears them.

Native local-world comparison confirms the tested conditions and neighbor-removal behavior.
Broader native rendering parity remains incomplete.
Core now omits faces whose cutout or blended material has no visible pixels.
Direct and ViaProxy comparisons remove the earlier transparent-neighbor artifacts while preserving voxel participation.
Native vanilla partial-block slices and alternative terrain renderers remain incomplete.
These results do not establish full voxel-culling parity.

## Position offsets and collision query boundaries

Reserved carriers now expose the core sampler through Java's terrain offset method.
Outlines use continuous offsets, and camera collision uses the continuous component envelope.
World movement collision uses the native floored offsets.
Culling retains the authored position-independent descriptors.
Both direct core state and accepted ViaProxy metadata use these consumers.

The first live landing fixture exposed Java's edge and corner pruning.
Java skips these boundary cells except for its special moving-piston path.
A negative native offset can move custom collision boxes into those cells on several axes simultaneously.
The add-on now visits extended custom shapes at these boundaries.
Other states retain their original boundary classification.
Session snapshots cache whether any custom definition has extended collision.
Reload and disconnect replace that snapshot with the existing resource lifecycle.

Core and add-on tests cover the native sampler, unsigned steps, metadata round trips, world float order, and distinct continuous and floored shapes.
The [coverage ledger](../../../docs/bedrock-coverage.md#production-custom-block-offsets-october-6-2026) records live route results and remaining native comparisons.

Local leave now clears metadata after Minecraft's central disconnect finishes.
It preserves intentionally retained server packs and avoids the `clearClientLevel` hook used by server reconfiguration.
Direct and ViaProxy probes verify empty metadata and no extended collision immediately and two seconds after disconnect.
Prepared reload results cannot restore a cleared session.
The lifecycle recordings deliberately disconnect; earlier uninterrupted recordings establish the tested landing and reload behavior.
The final dependency build passes 677 core, 585 add-on, and 16 converter tests with zero failures or errors.
There are 19 optional core skips and 114 optional add-on skips.

## Native material ambient strength

The model parser and face bakery retain core lighting annotations alongside the existing culling rules.
Each baked face keeps its own exponent and face-dimming flag.
The terrain hook applies the exponent after corner averaging and directional attenuation, before Java quantizes the vertex color.
It avoids a second directional multiplier. The flat path uses the same material arithmetic without corner occlusion.
Only registered custom carriers use these settings.

Private probes evaluate the actual injected flat and ambient methods using accepted CubeCraft models on both routes.
Each route loads 276 definitions and evaluates 24 baked faces at a supplied world position.
Zero strength removes vertex attenuation. Strength two matches squared strength-one colors within two byte-quantization levels.
Neither change alters lightmap coordinates.
These probes use loaded models but do not place each sampled block or compare native screenshots.
Java still supplies the corner neighborhood, interpolation, and light coordinates.
Alternative terrain renderers, other dimensions, and enhanced lighting require separate verification.
The [coverage ledger](../../../docs/bedrock-coverage.md#native-material-ambient-occlusion-october-7-2026) records the evidence boundaries.

## Corner light sampling

Registered custom terrain now uses the core helper at Java's corner-light blend boundary.
Each channel retains its brightest sample independently, before the existing partial-face interpolation.
Faces without native lighting metadata and ordinary Java block states retain Java's original blend.
The hook uses the same accepted-model path through direct connections and ViaProxy.

A private game probe evaluates six accepted full-unit faces against three controlled world-light profiles.
The original native routine supplies 72 reference vertex values.
The probe invokes the actual injected terrain method and compares ordinary-stone and annotation-removal controls.
It restores face annotations after each case. It does not place the blocks or compare visible native images.
Java's neighborhood selection, partial interpolation, flat-path selection, and alternative terrain renderers remain separate verification requirements.
The [coverage ledger](../../../docs/bedrock-coverage.md#native-corner-light-maxima-october-7-2026) records route results.


## Zero-strength corner lighting

Both target native terrain routines retain four corner light values at zero ambient strength.
A private executable fixture compares their cached and uncached paths across 1,920 pairs, or 7,680 corners.
Cases vary face direction, sampling plane, source and neighbor flags, heterogeneous light and occlusion, and five material strengths.
The fixture supplies world lookup values, material lookup, TLS storage, and the imported float power function.
It verifies the terrain calculations rather than the native world implementation or visible scene.

Java selects flat rendering for models that disable ambient occlusion.
Annotated zero-strength custom faces now enter corner preparation from that flat path.
Their zero exponent removes ambient and directional attenuation while preserving native light maxima.
Ordinary states and unannotated faces retain flat rendering and caller-provided light coordinates.
The core model fallback stays unchanged for ordinary Java clients.

Private client probes verify caller-provided and uncached light, actual model dispatch, and ordinary-state controls against 72 native reference vertices per route.
The probes temporarily set accepted face annotations to zero and wrap accepted model parts with ambient occlusion disabled.
They restore the face annotations after each case. They do not install a separate zero-strength pack or compare native images.
The [coverage ledger](../../../docs/bedrock-coverage.md#zero-strength-terrain-lighting-october-7-2026) records route completion and remaining requirements.

## Material shading before partial-face interpolation

The terrain hook now shades each corner average before Java applies the partial-face interpolation weights.
Both Java corner-preparation branches use the core material calculation.
Each float-local hook requires exactly two matching stores in the pinned renderer.
The final color-packing hook is removed, and ordinary states retain their original corner averages.
The existing zero-strength sampling and light maxima remain intact.

The target native interpolation and packing instructions distinguish the ordering in 8,393 of 18,816 controlled samples.
Private direct and ViaProxy probes each evaluate 1,728 cases, or 6,912 vertices, through the actual injected renderer.
They cover accepted CubeCraft faces cloned into partial geometry, three uneven neighbor profiles, six strengths, and four directional multipliers.
Each route matches 6,903 native reference colors exactly and retains 6,912 ordinary-state color controls.
Nine reference colors differ by one level at strength one. Exact float arithmetic remains open.
The comparison supplies corner averages resolved from unannotated Java output against the controlled air/stone palette.
It does not verify native world lookup, original caller orientation, block placement, or visible native images.
Full recorded scene replays complete and pass transport, resource loading, and model verification on both routes.
The [coverage ledger](../../../docs/bedrock-coverage.md#corner-shading-before-face-interpolation-october-7-2026) records the results and remaining scope.

## Native face interpolation arithmetic

The terrain hook maps Java's four shaded corner averages to the native face axes and uses the core nested interpolation helper.
Horizontal faces interpolate X before Z. North and south faces interpolate X before Y.
West and east faces interpolate Z before Y.
Authored vertex coordinates also cover expanded faces and tiny insets that Java does not classify as partial faces.
Clamping follows interpolation. Full unit faces retain their corner colors, and ordinary states retain Java's original color packing.

The previous private reference generalized one native face routine across all directions.
Executing all six original face emission functions reduces that baseline discrepancy from nine colors to three.
The corrected client matches all 12,096 supplied native colors per route, with 12,096 ordinary-state controls.
Cases include six directions, seven bounds, three uneven neighbor profiles, six strengths, and four directional multipliers.
The probes clone accepted CubeCraft faces and restore their annotations.
Native functions consume supplied corner colors and report submitted vertex positions and colors.
Native world lookup, neighbor-to-color assignment, the mesh writer, the GPU, and visible comparisons remain unverified.
The [coverage ledger](../../../docs/bedrock-coverage.md#native-face-interpolation-arithmetic-october-7-2026) records full route results and remaining requirements.


## Preserve corner light on inset faces

Java blends corner light across partial-face bounds. The target native cuboid emitters keep each physical corner's light unchanged.
All six original face emission functions retain supplied light coordinates across seven bounds, or 168 submitted vertices.
The terrain hook now selects each computed corner value at the four partial-face light blend sites.
Each injection requires exactly one matching invocation in the pinned renderer.
Registered custom faces require accepted lighting annotations. Ordinary states and unannotated faces retain their original blending.
Ambient color interpolation remains unchanged.

The native fixture supplies corner light, cuboid bounds, and a texture component with variant flags disabled.
It intercepts mesh submission and substitutes the float floor import.
Separate fixtures verify supplied neighbor-to-color binding through the original corner routine and six face emitters.
Original cached and uncached lookup paths agree across 288 supplied-cache cases, or 1,152 corners.
Backing-world lookup, native runtime block flag identity, emissive states, and visible lighting remain open.
The [coverage ledger](../../../docs/bedrock-coverage.md#native-inset-face-light-coordinates-october-7-2026) records the client checks and remaining scope.


Direct and ViaProxy clients each pass 1,512 corner-light checks across 378 cloned accepted faces.
Cases cover six directions, seven bounds, three uneven light profiles, and three strengths.
Each route passes 1,512 ordinary-state controls against unannotated custom faces.
Bounds change the Java controls in 864 vertices while the annotated faces retain their full-face corner light.
The probes use supplied air neighbors, select zero-emission source states, record their IDs, and restore original annotations.
Client full-face output supplies baseline corner light; the native fixture independently verifies bounds invariance.
These checks isolate interpolation. They do not establish native neighbor selection or visible parity.
The complete add-on stack and build pass with the normal bundled-asset input.
Both complete recorded CubeCraft scene replays pass transport, resource loading, and rendering checks.

## Native face neighborhood selection

Registered annotated ambient faces now use the shared ViaBedrock sampler.
This replaces the Java local-index repair hooks and corrects source, side-plane, and diagonal selection.
World reads apply authored emission only to block light.
Physical corner light remains unweighted while ambient color uses the native nested interpolation.
Ordinary blocks and unannotated faces retain their original calculations.
The flat path uses native corners for every accepted material strength, independently of Java model AO selection.

Direct and ViaProxy clients each match 4,032 original native light coordinates and colors across 1,008 face cases.
Seven bounds cover full, inset, expanded, shifted, and sampling-threshold cases.
Ordinary annotated/unannotated controls preserve color and light across all cases.
Both clients load 276 accepted CubeCraft block definitions.
The selected route faces have zero authored emission; emitting custom source states remain unverified on these routes.
All 30 patches replay; the 605-test suite passes with 117 optional skips and no failures or errors.

The [coverage ledger](../../../docs/bedrock-coverage.md#native-terrain-neighborhood-sampling-october-7-2026) records supplied flags and channel values.
These checks do not establish native propagation, runtime block identity, or visible parity.
Cached solidity, per-type ambient overrides, rotated geometry, alternative renderers, enhanced lighting, remain open.

## Sodium and Iris terrain lighting

Sodium bypasses vanilla `BlockModelLighter` on the tested Java 26.3 client.
Optional typed bridges retain native lighting annotations through baked-quad import and copies.
Raw loads and resets clear annotations before quad reuse.
Both terrain renderers call the same adapter and the core native corner sampler.

The Sodium bridge writes the four light and shade outputs for accepted custom faces.
Its later emissive, tint, normal, geometry, and buffer processing stays active, including Iris encoder hooks.
Unannotated faces and ordinary Java states delegate to Sodium's existing calculation.
The add-on has no compile-time Sodium dependency.

Two adapter tests cover 432 face, plane, and vertex-order combinations, plus inset emission and authored shade direction.
Compatibility targets Sodium 0.9.2, Iris 1.11.7, and Complementary Reimagined r5.9.3 on Java 26.3.
Native propagation, runtime block identities, enhanced-lighting equivalence, and visible native GPU comparisons remain separate requirements.

The final built artifact passes actual Sodium `shadeQuad` dispatch checks with a copied client `LevelSlice`.
Ordinary output matches the unwrapped pipeline; accepted native output matches the shared sampler.
Baked import, base and mutable loads, reset, and copy preserve the expected annotation lifecycle.
Normals and cull state remain unchanged, and later emissive processing still produces full brightness.
These checks pass with Complementary active, after saved-config shader disable and enable, and after resource reload.
The probe loads no replacement production classes or mixins.
Software Mesa rendering establishes compatibility, not visible native GPU parity.

The final plain-client replay also passes transport and rendering checks with neither Sodium nor Iris installed.
Actual vanilla ambient and zero-strength flat callbacks match all four light and color outputs.
An annotation on an ordinary Java state retains vanilla results.
Both direct replays install all 216 recorded geometry skins with no rejected skins.
These recordings verify the translated scene and integration; they are not new live CubeCraft joins.

The final ViaProxy shader replay passes the same actual quad, lifecycle, shader-toggle, and resource-reload controls.
It installs all 216 geometry skins without rejection and evaluates 41 drawable model keys.
The replay observer sees all 31 expected controller identities in the proxy JVM.
Two transient actors despawn before Java world readiness, so their original controller returns require server-side observation.
Strict skin, drawing, unresolved-model, and combined client/proxy error checks remain active.
The observer is test tooling and changes no production packet timing or actor selection.
The original client-only audit failure remains preserved privately.
These results establish recorded-scene compatibility on software Mesa; live joins and native visible lighting parity remain required.

## Native material sampling in flat model lighting

Accepted native faces now use the shared corner sampler when Java chooses flat model lighting.
Authored ambient strength still affects corner colors and light selection. Java model AO selection does not replace those inputs.
The obsolete directional-expression hook is removed. Ordinary states and unannotated faces retain Java behavior.
Three targeted adapter tests cover heterogeneous strengths, independent sky and block maxima, opaque diagonal fallback, and authored shade direction.

The original cached and uncached corner routines agree in 1,920 supplied cases, covering 7,680 corners across five strengths and six directions.
A preserved old-artifact runtime control fails on the nonzero-strength flat path while the complete recorded scene still passes its independent audit.
Final route verification is recorded in the coverage ledger.
Native global graphics-setting dispatch, actual world classification, propagation, enhanced lighting, and native visible comparisons remain required.

Final direct and ViaProxy plain runs each pass 1,200 exact corner checks and 120 actual flat dispatches. Both Iris routes pass actual enable, disable, re-enable, and resource reload controls, preserving ordinary rendering and later emissive processing. Software Mesa compatibility does not establish native visible lighting parity.\nThe [combined runtime record](../../../docs/bedrock-coverage.md#final-combined-runtime-verification) retains the complete scene gates and remaining requirements.\n