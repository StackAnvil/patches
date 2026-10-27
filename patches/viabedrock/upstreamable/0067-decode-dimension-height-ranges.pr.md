Decode `DIMENSION_DATA` as minimum Y followed by height range. A minimum of 0 and range of 256 now produce Java `min_y=0` and `height=256`.

The [protocol 2192 preview metadata](https://github.com/Mojang/bedrock-protocol-docs/releases/download/v1.26.50-preview.26/metadata.zip) assigns ordinal 0 to Minimum Y and ordinal 1 to Height Range. The [protocol 2193 metadata](https://github.com/Mojang/bedrock-protocol-docs/releases/download/v1.26.51/metadata.zip) retains those fields. The [Cloudburst 2193 codec](https://github.com/CloudburstMC/Protocol/blob/3.0/bedrock-codec/src/main/java/org/cloudburstmc/protocol/bedrock/codec/v2193/serializer/DimensionDataSerializer_v2193.java) adds the range to the minimum to obtain the exclusive maximum.

An official Bedrock 1.26.51.1 capture from The Hive supplies minimum 0 and range 256 before `StartGame`. The native client spawns successfully. The old decoder exports height -256 and prevents the ViaBedrock chunk tracker from starting. The capture remains private.

Four synthetic tests cover negative and positive minima, remaining packet fields, signed bounds, nonpositive ranges, and overflow. The full core suite passes 265 tests across 75 suites, with no failures or skips. Main and test Checkstyle pass on Java 17.

## Protocol 2225 cloud settings

Keep the new cloud height and visibility with dimension bounds in one model.
Project the height through Java 26.3's `minecraft:visual/cloud_height` attribute.
Use transparent cloud color when the server disables clouds. Java's day timeline multiplies this color and preserves zero alpha.
Other dimension attributes stay intact. The existing Overworld override boundary remains.

[Mojang's 26.60 schema](https://github.com/Mojang/bedrock-protocol-docs/releases/tag/v1.26.60) defines both cloud fields.
Its `us_1665751` note describes height synchronization.
The [26.60 changelog](https://feedback.minecraft.net/hc/en-us/articles/49852828563853-Minecraft-Bedrock-Edition-26-60-Changelog) permits cloud heights across the custom dimension band.
The matching Java 26.3 client reads these environment attributes and suppresses clouds with zero color alpha.

Six focused tests cover complete dimension records, following-field boundaries, signed bounds, overflow, attribute preservation, and disabled clouds.
