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
