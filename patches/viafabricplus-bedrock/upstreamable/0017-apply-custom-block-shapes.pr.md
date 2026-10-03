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
Core retains that registry, but culling rules remain incomplete.
This transport carries physical properties independently.
The full stack passes 419 core tests, 524 add-on tests, and 16 converter tests.
Core has one optional fixture skip, and the add-on has 109 optional fixture skips.
All suites have zero failures and errors, and core Checkstyle passes.
