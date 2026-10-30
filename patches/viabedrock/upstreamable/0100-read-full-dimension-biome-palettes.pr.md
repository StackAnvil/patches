Preserve regression coverage for the full-height biome reader now supplied by upstream [#466](https://github.com/ViaVersionAddons/ViaBedrock/pull/466).
Modern `LevelChunk` payloads contain one biome palette per dimension section, even when their block-section count is smaller.
The old reader used the block count and parsed the remaining biome bytes as block-entity NBT.

Six packet cases cover cached and uncached columns with zero, one, and nine block sections.
They check each biome palette, independent copies of repeated palettes, and the trailing chest block entity.
The fixture reproduces chunk NBT errors from BDS 1.26.51.1, protocol 2193.
[Dragonfly v0.11.5](https://github.com/df-mc/dragonfly/blob/v0.11.5/server/world/chunk/decode.go) also reads biomes across the dimension range.

The patch retains the tests and an explanatory comment after the upstream fix.
These tests do not establish native inventory or rendering parity.

All six packet cases pass in the rebased full core build.
