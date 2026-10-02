# Bedrock request codecs

Keep inventory request, response, and recipe codecs together before the container implementation.

## Filter origin correction

Native Bedrock 1.26.51.1, build 51061372, protocol 2193, sent filter origin `-1` in accepted merchant requests. The release metadata lists enum names without their numeric starting value. Preserve the upstream mapping with `unknown=-1` and prevent the enum generator from replacing it with zero for protocol 2193.

Wire tests cover the unknown sentinel and the existing anvil origin mapping. The tool source compiles. The full core suite and Checkstyle pass after replay.

This codec foundation belongs to the inventory work in [ViaBedrock #276](https://github.com/ViaVersionAddons/ViaBedrock/pull/276).

## Loom requests

The action codec now writes `CraftLoom`: union index 15, stable action byte 17, a pattern string, and an unsigned craft count. Bedrock 1.26.51.1 build 51061372, protocol 2193, native captures verify `hh` and `cre` requests followed by result, consume, and place actions. A byte-level test also covers count 255. Captures stay private.
