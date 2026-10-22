# Read biome palettes across the dimension

Modern `LevelChunk` payloads contain one biome palette per dimension section.
The block-section count can be smaller, including zero for requested columns.
The reader used that count for both block sections and biomes.
It then parsed the remaining biome bytes as block-entity NBT.

Read biome palettes across the full chunk section array.
Keep the block-section count and legacy 2D biome path unchanged.

## Evidence

The official Bedrock Dedicated Server 1.26.51.1 uses protocol 2193.
An isolated Java-to-Bedrock run logged repeated chunk NBT errors before its chest interaction.
The run reached spawn and reconnected. Its chest probe reported a missing screen.
Later screenshot inspection confirms that the screen opened at native desktop scale.
The probe assumed Java GUI scale two and sampled outside the panel.
Private logs remain outside the repository.

[Dragonfly v0.11.5's network decoder](https://github.com/df-mc/dragonfly/blob/v0.11.5/server/world/chunk/decode.go)
reads block sections up to the packet count and biomes across the dimension range.
Its [biome encoder](https://github.com/df-mc/dragonfly/blob/v0.11.5/server/world/chunk/encode.go)
likewise writes every biome storage, with markers for repeated palettes.

## Validation

Six packet regressions cover cached and uncached columns with zero, one, and nine block sections.
They check every biome palette, independent copies of repeated palettes, and the trailing chest block entity.
All six fail with the old reader and pass with the corrected reader.

This fix does not establish native inventory-action or server-menu parity.


The full 102-patch stack replays and the complete four-project build passes.
Core runs 1,211 cases: 1,181 pass and 30 optional cases skip.
The converter passes 18 cases, the add-on passes 816 with 120 optional skips, and ViaProxy passes four.
No build, test, or Checkstyle task fails. Offline tooling and metadata validation also pass.

A fresh isolated target-server run uses the corrected chest probe and matching built artifacts.
Join, stability, chest transfer, reconnect, and reconnect stability pass through ViaProxy.
The server observes zero chest items and four player items after the transfer.
The earlier run logs 1,058 chunk decoding errors; the rebuilt run logs zero.
This validates the Java-to-Bedrock chest path, with native graphical parity still unverified.
