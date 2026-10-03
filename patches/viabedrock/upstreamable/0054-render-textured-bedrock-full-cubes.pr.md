Resolve Bedrock custom block states after StartGame, including ordered permutations, per-face materials, geometry, collision, selection and light values. Java loads a supplemental pack before entering the world so runtime state definitions and converted models agree.

Read lighting from the serialized runtime components: `minecraft:block_light_filter.lightLevel` and `minecraft:light_emission.emission`. The official Bedrock 1.26.51.1 Hive recording, protocol 2193, supplies filter 0 for 401 definitions and filter 8 for 11 definitions. The previous creator component lookup treated these as filter 15. The saved chunk columns contain 12,098 placements of these definitions, including ground details and foliage. Tests round-trip network NBT and verify transparent, partial and opaque filtering, emission, omitted defaults and permutation overlays. These counts establish the affected input; they do not prove complete lighting parity. The light engine still uses scalar opacity without directional face occlusion.

A private comparison uses the saved spawn chunk and all eight loaded neighbors. Changing only the custom filter inputs corrects 159 skylight cells and 75 block-light cells in the center chunk. Some ground decorations change from skylight 0 to 15. The player cell stays at skylight 15 and block light 4, matching the local replay observations. This isolates local dark patches from global sunset shading. The replay also passes its complete-scene transport and skin/model rendering checks.

Validation: all 276 CubeCraft states, all 1,795 Minehut states and all 199 Geyser states in the private Bedrock 1.26.51 recordings resolve. The full ViaBedrock suite passes, including permutation, geometry, light and pack acknowledgment tests. Buffered packets retain their Bedrock types, resume after the base protocols, and preserve cancellation and order. Exported block models bind a valid particle sprite as well as face textures. Private scenes stay outside Git.

The compiler uses 2,629 unused note-block and redstone-wire carrier states. Existing note-block assignments stay stable. Vanilla wire selectors remain intact for every unassigned state. Static parent-bone rotations compose around their own pivots, and cube inflation expands both sides. Unsupported geometry keeps its vanilla fallback. Current limits include nonuniform scale on rotated cubes and legacy texture-array variation selection. The state counts establish mapping coverage; they do not prove every appearance matches the official client.

The same protocol 2193 Hive capture contains 136 explicit disabled face-dimming material instances across 131 block definitions. Preserve their world light while removing directional face attenuation. Split mixed-face elements without changing their bounds, rotation, UVs, emission, or solid-block occlusion. Java 26.3 uses `shade_direction_override`; its old `shade` model flag has no effect. The add-on test decodes generated models through the actual Java cuboid loader and checks direction, face counts, and emission.

[Minecraft's material lighting guide](https://learn.microsoft.com/en-us/minecraft/creator/documents/customblockrenderlighting?view=minecraft-bedrock-stable) describes face dimming separately from ambient occlusion. This change preserves explicit runtime settings. The add-on also removes the Nether's residual dimming for these registered custom faces. It does not replace Java gamma or sunset curves.

The same target recording places red snapdragons at the left flowerbed. Their runtime material uses `alpha_test` with disabled face dimming and ambient occlusion. The geometry supplies two crossed planes with only WEST faces. One plane is almost edge-on to the matched camera; the other presents its missing back face. The target native terrain material disables culling. Emit opposite-winding faces for these zero-thickness cutout planes. Preserve texture coordinates at each physical corner, authored opposite faces, material bindings and lighting. Keep single-sided, opaque, blended, inflated and solid geometry unchanged. Semantic tests cover all six face directions, signed UVs, four UV rotations and mixed material partitions.

The matched local Hive replay now shows the missing red snapdragon silhouette. Its full transport and rendering checks pass with no runtime exceptions or unresolved actors. The final builds pass 339 core tests, 474 add-on tests and 16 converter tests, without skips. The rebuilt ViaProxy also passes three local joins, entity status and metadata probes, and resource-pack reuse and invalidation checks. These checks validate the reported defect; they do not establish full scene parity.

After rebasing onto the trusted classic cape change, all 152 world rendering classes and the fixed core classes remain byte-identical to the replayed build. The combined build passes 829 tests without skips.

## Legacy full-cube geometry

The pinned Bedrock 1.26.51.1 server serializes `minecraft:geometry.full_block_v1` for a full-cube block with format version 1.21.80.
The compiler previously treated that built-in identifier as an unavailable external model and skipped its custom visual.
Core now compiles both full-cube variants and rotates only the legacy bottom face by 180 degrees.
Collision, selection, material, and occlusion behavior remain consistent with the modern cube.

[Microsoft's geometry reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_geometry?view=minecraft-bedrock-stable) records the compatibility mapping and bottom-face difference introduced in 1.26.0.
A semantic test compares complete generated models after removing only the expected bottom rotation.
It covers namespaced and short identifiers, plus simple and structured geometry fields.
The private server fixture supplies its own procedural texture without a local game installation.

Live direct and ViaProxy joins now load the supplemental pack and show the custom cube with its procedural texture.
Private state inspection confirms one compiled custom visual and a completed pack gate.
The bottom-face orientation has numerical coverage, but a matched native image comparison remains unverified.
The final build passes 413 core tests, 521 add-on tests, and 16 converter tests without failures or errors.
The core has one optional fixture skip, and the add-on has 109 optional fixture skips.

## Physical properties through ViaProxy

The supplemental converted pack now includes protocol-bound collision, selection, occlusion, and lighting properties.
The add-on reads these properties from the accepted server pack on both connection routes.
The cache fingerprint includes physical properties, so a changed collision box cannot reuse a previous archive.
Local packs cannot override the server mapping.

A private Bedrock 1.26.51.1 fixture sends half-height collision, full-height selection, emission 12, and filtering 3.
Its StartGame definition uses `minecraft:light_dampening.lightLevel`, while the target Hive recording uses `minecraft:block_light_filter.lightLevel`.
Core now reads both observed wire forms and prefers the filter field when both exist.
Network NBT tests exercise transparent, partial, and opaque values for both forms.

The direct and ViaProxy clients both land at Y=120.5 on the fixture at Y=120.
Live block-state inspection confirms separate selection bounds and the native emission/filter values.
A ViaProxy resource reload preserves these values and the standing height.
Disconnect clears the client mapping.
The fixture uses a procedural texture and requires no local game installation.
These results require the client add-on for custom physics.
Directional light occlusion and other rendering limits remain incomplete.

## Native voxel registry

Core now handles packet 337, VoxelShapes, during configuration and play.
The decoder retains its shape grids, coordinate boundaries, name handles, and custom shape count atomically.
Truncated or invalid input cannot replace the previous registry.
A procedural four-box fixture establishes X/Y/Z ordering with Z varying fastest and low-bit-first occupancy.
The target server sends 288 shapes, 221 names, and one custom shape for this fixture.
ViaProxy retains this registry during configuration while the supplemental pack queues up to 233 world packets.
The direct connection retains the same registry through joining.

[Mojang's target packet reference](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/voxel-shapes-packet/) describes the registry structure.
[Microsoft's voxel shape guide](https://learn.microsoft.com/en-us/minecraft/creator/documents/voxelshapes?view=minecraft-bedrock-stable) describes its culling purpose.
Voxel grids do not replace physical collision or selection boxes.
Core now compiles authored culling rules and transformed face slices.
Native vanilla partial-block mapping and broader rendering parity remain incomplete.

The final full stack builds successfully.
Core reports 428 tests with one optional fixture skip.
The add-on reports 526 tests with 109 optional fixture skips.
The converter reports 16 tests without skips.
All suites have zero failures and errors, and core Checkstyle passes.

## Authored custom block culling

Core reads `block_culling/` definitions in resource-pack order.
It preserves source bone and cube indices, including invisible cubes.
Each converted face carries its native conditions and transformed neighbor direction.
The accepted server pack carries protocol-bound state identities, culling layers, face participation, and voxel slices.
Equivalent models share a carrier unless a conditional rule needs their distinct block identity or permutation.

Face slices use native grids independently of collision and selection boxes.
Quarter turns transform the grids and rule directions together.
Adjacent grid cells merge before transport and comparison, while holes remain empty.
Tests cover unequal grids, holes, outside-face bounds, dense grid compaction, invisible cubes, and rotated rules.

Private target-server fixtures use Bedrock 1.26.51.1 build 51061372, protocol 2193.
Their StartGame definitions retain the authored culling identifier, layer, and custom half-height grid.
Direct and ViaProxy client inspections confirm six marked faces on each test cube.
With invisible neighbors, block identity, matching layers, and voxel coverage hide three cubes.
The cube with a different neighbor permutation remains visible.
Removing those neighbors restores all four cubes through both flat and ambient-occlusion terrain paths.
ViaProxy reload preserves the descriptors, and disconnect clears them.

These client results require the add-on.
Ordinary Java clients retain the generated geometry, but cannot evaluate the native conditional rules.
Native local-world comparison confirms the tested conditions and neighbor-removal behavior.
Broader native visual parity remains incomplete.
The earlier Java comparison exposed dark faces on two fully transparent neighbor permutations.
Core now omits faces whose material has no visible pixels after alpha conversion.
Authored culling participation and physical properties remain intact.
Direct and ViaProxy comparisons remove those artifacts while retaining the native conditional result.
Vanilla partial-block slices, runtime registry replacement, and alternative terrain renderers remain incomplete.

Target-native content diagnostics reject an explicitly authored `default` condition.
The default condition requires an omitted field in this build.
The parser retains that distinction despite the generic documentation listing `default` as a value.
Conditional rules do not participate in voxel coverage.
A built-in full cube supplies a unit grid but has no authored bone graph.
Its implicit opaque-neighbor rules remain separate from authored voxel participation.
Native comparisons retain the yellow voxel fixture beside that transparent built-in cube.
An authored custom neighbor with a default opposite rule hides it.
Both sides need default participation before the client compares their slices.

## Invisible materials

Java 26.3 computes terrain transparency from each sprite and face UV range.
A zero-area range reports opaque even when the whole sprite is transparent.
The private target fixture exposed this behavior after geometry conversion clamped some UVs to the texture boundary.

Core omits fully invisible cutout and blended materials after compiling culling participation.
Opaque materials remain visible because their alpha conversion discards source transparency.
Mixed elements and copied back faces resolve their actual sprite before omission.
Unknown vanilla images remain conservative.
Tests preserve collision, selection, default voxel participation, partial alpha, and visible faces.
Direct and ViaProxy add-on comparisons match the tested native visibility without the earlier dark faces.
A ViaProxy client with the add-on disabled also omits the invisible neighbor geometry.
Its carrier states still occlude adjacent terrain and leave visible holes.
The add-on path corrects those physical occlusion properties.
This does not establish ordinary-Java physical parity, general UV sampling, or material parity.
