Update the supported Bedrock release from 1.26.51, protocol 2193, to 1.26.60, protocol 2225. Java remains on 26.3.

The patch updates wire layouts, runtime IDs, generated resources, and mappings together. Native redstone connection states map directly to Java connections. A legacy upgrade preserves explicit connection values because Mojang kept the same block-state version.

Sources: [Mojang protocol 2225](https://github.com/Mojang/bedrock-protocol-docs/releases/tag/v1.26.60), [matching GDK package](https://github.com/bubbles-wow/mcbe-gdk-unpack-archive/releases/tag/1.26.60.5), and the pinned Geyser data linked in `Data Asset Sources.md`.

Experimental content uses documented Java fallbacks. Block seating and signed audio content remain unsupported. This update does not claim complete parity for those features.

Validation:

- Standalone build, style checks, five targeted binary-layout and connection-upgrade tests, and mapping validation pass on pinned upstream without StackAnvil setup.
- An isolated official BDS 1.26.60.6 NetherNet bootstrap reaches StartGame and captures the stable actor registry with the unchanged production login helper.
- All 105 core patches and 38 add-on patches replay. Core, add-on, CubeConverter, and ViaProxy builds pass. The relay self-tests pass. A Java 26.3 client with Iris shaders reaches StartGame and spawns on official BDS 1.26.60.6. No uncompressed frames are dropped.
