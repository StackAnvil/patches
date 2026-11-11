Read the counted border-block columns in modern `LevelChunk` payloads before block entity NBT.
The tail after the biome palettes is one unsigned column count, one packed X/Z byte per column, then block entities.
The old reader skipped only the count byte and parsed the column bytes as NBT.
Lifeboat Skyblock (Bedrock 1.26.60, protocol 2225) sends counts of 1 and 16 while a saved island loads. Each load logged 16 "Error reading chunk data" warnings. Another 19 columns stopped reading silently at an out-of-bounds error.
[PowerNukkitX](https://github.com/PowerNukkitX/PowerNukkitX/blob/93b06b1d7e3df0ea639f2164ec16205668d8faf8/src/main/java/org/powernukkitx/level/format/leveldb/LevelDBProvider.java) writes the same framing and caps the count at 255.

The patch also preserves regression coverage for the full-height biome reader now supplied by upstream [#466](https://github.com/ViaVersionAddons/ViaBedrock/pull/466).
Modern `LevelChunk` payloads contain one biome palette per dimension section, even when their block-section count is smaller.
The old reader used the block count and parsed the remaining biome bytes as block-entity NBT.
The biome fixture reproduces chunk NBT errors from BDS 1.26.51.1, protocol 2193.
[Dragonfly v0.11.5](https://github.com/df-mc/dragonfly/blob/v0.11.5/server/world/chunk/decode.go) also reads biomes across the dimension range.

## Validation

`LevelChunkBiomePacketTest` runs ten packet cases through the registered handler.
Six cases cover cached and uncached columns with zero, one and nine block sections and no border columns.
Four cases cover border counts 1, 16 and 200 before a valid chest block entity, a coordinate byte equal to the compound tag ID, and a truncated border list.
All four border cases fail with the old reader.
Private replays of two captured Lifeboat sessions (1,070 and 1,028 uncached packets) through the same handler change from 16 warnings each to none. Every chunk is still sent, and both sessions keep 2,815 block entities.
An official Bedrock 1.26.60 client loaded the same saved island and opened its inventory. Its recording contains byte-identical copies of all 35 chunk payloads that exposed the old reader failure. This supports the captured framing, without comparing border behavior.
The production-only patch applies and builds against the pinned upstream base. The local full stack passes the packet regression tests.
A rebuilt add-on run loaded the saved island and opened its inventory with no chunk-read warnings. All 35 previously failing payloads arrived byte-for-byte in that run.

## Limits

The patch only consumes the border columns. It does not implement border block collision or rendering, and native border behavior was not compared.
