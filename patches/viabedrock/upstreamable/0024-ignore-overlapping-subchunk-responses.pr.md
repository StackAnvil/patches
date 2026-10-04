Keep serialized sections, requested sections, and known-air sections distinct. Ignore duplicate replies after completing a section, release queued and in-flight work on unload, and reject delayed data for replaced columns.

## Request limit in protocol 2193

The target is Bedrock 1.26.51.1, build 51061372, protocol 2193. Its LevelChunk packet carries an optional client request limit. Use that limit as a section count, bounded by the dimension. Keep unlimited mode and request only sections absent from the inline payload. A replacement column uses its new header's limit.

The [protocol 2193 metadata release](https://github.com/Mojang/bedrock-protocol-docs/releases/tag/v1.26.51) supplies the target schema. Its beta metadata describes an optional limit with `-1` for unlimited mode. The [older terrain guide](https://github.com/Mojang/bedrock-protocol-docs/blob/main/additional_docs/SubChunk%20Request%20System%20v1.18.10.md) describes an inclusive highest index for a different wire format. That older interpretation must not determine the target calculation.

Two private captures use the matching official client and dedicated server with blob caching disabled. The first contains 113 columns with limit one. The native client requests only section `-4` for each column. A second scene places blocks at three higher sections. Limits 1, 2, 5, and 9 each produce exactly that many native requests per column, including explicit all-air replies between populated sections.

Previously core added one to every finite limit. Native-capture playback supplied every recorded reply, but Java kept one extra section pending and withheld the column. The local avatar then fell through missing terrain. Replacing a previous skeleton also requested the whole dimension, ignoring the new finite limit.

A targeted test covers the captured counts, zero, unlimited mode, dimension sizes, and a limit above the dimension height. Existing tests retain pending updates and reject repeated section merges. Native playback and live-server comparisons define the verification scope; passing the arithmetic test alone does not establish complete chunk parity.

Final validation: all four builds pass with 970 Java tests passing and 113 optional fixture skips. Both north-star application checks and the bundle pass. Direct and ViaProxy playback preserve all native scene payloads and load the accepted pack. Each emits exactly the native reference's 134 section requests, with identical positions and multiplicity. Both avatars remain grounded at Y = -60, and final screenshots contain the recorded terrain. This verifies the finite-count behavior in the authored target-build scene. Complete inline/cache modes, replacement timing, other dimensions, and other server implementations remain separate comparisons.
