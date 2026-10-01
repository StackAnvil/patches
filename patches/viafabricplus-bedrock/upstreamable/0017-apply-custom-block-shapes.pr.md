Apply collision, selection, occlusion, support and lighting from ViaBedrock custom block metadata to reserved Java carrier states. Ordinary blocks retain their existing behavior.

Validation: semantic shape tests and full addon tests pass. The recorded Geyser and CubeCraft scenes exercise runtime mixin initialization and custom block models.

Custom redstone-wire carriers use white block and particle tint and suppress ambient redstone particles. Ordinary wire states retain their native behavior.

Decode ViaBedrock's generated mixed-face model through Java 26.3's cuboid loader. Verify that disabled face dimming uses upward cardinal brightness, keeps six faces, and does not add emission. This covers the actual model schema rather than source text.

Both flat and ambient-occlusion rendering honor disabled face dimming on registered custom carriers. Their upward model override uses multiplier 1 even with Nether cardinal lighting. Ordinary blocks retain their dimension-specific shading.
