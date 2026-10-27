Update the supported Bedrock release from 1.26.51, protocol 2193, to 1.26.60, protocol 2225. Java remains on 26.3.

The patch updates wire layouts, runtime IDs, generated resources, and mappings together. Native redstone connection states map directly to Java connections. A legacy upgrade preserves explicit connection values because Mojang kept the same block-state version.

Sources: [Mojang protocol 2225](https://github.com/Mojang/bedrock-protocol-docs/releases/tag/v1.26.60), [matching GDK package](https://github.com/bubbles-wow/mcbe-gdk-unpack-archive/releases/tag/1.26.60.5), and the pinned Geyser data linked in `Data Asset Sources.md`.

Experimental content uses documented Java fallbacks. Block seating and signed audio content remain unsupported. This update does not claim complete parity for those features.

Validation:

- The standalone patch applies and builds on pinned upstream without StackAnvil setup. Style checks, mapping validation, and 19 targeted tests pass.
- All 103 core patches and 38 add-on patches replay. Core, add-on, CubeConverter, and ViaProxy builds pass. Relay self-tests pass.
- Enum regeneration from the 2225 archive leaves no diff in the standalone and complete core checkouts.

Earlier migration validation used official BDS 1.26.60.6.
An isolated NetherNet bootstrap reached StartGame and captured the stable actor registry with the unchanged production login helper.
A fully patched Java 26.3 client with Iris shaders also spawned, with no dropped uncompressed frames.
That downstream join does not establish a standalone-patch join test.

## Metadata cleanup

Use the explicit protocol-2225 enum values without the old protocol-2193 container and text-origin corrections.
The former container correction patch is removed. Its wire test belongs to this version update.

Keep response variant indexes in the packet codec and remove the synthetic unknown entity-data enum member.
Malformed entity metadata still fails before the payload is read.
The resource-pack response codec and its wire tests move here from the later cache patch.

The packet-ID enum still omits declared packets.
Supplement its entries from same-protocol packet schemas and reject conflicts or mixed protocols.
This replaces manual packet additions in the locator and sound patches and the camera patch's literal control-scheme ID.
The remaining Cereal action indexes and width-specific compression sentinels describe actual wire fields.

The full stack also removes the inventory-source override; this enum field serializes value 99999 directly.

## Dimension settings on upstream

The version update retains and applies the new cloud fields in upstream's existing dimension path.
It includes the dimension model, complete packet decoder, Java environment-attribute projection, and six dimension regressions.
The former dimension-height patch is folded here and removed from the later stack.
These changes require no deferred inventory implementation.

Read the bounds as minimum Y plus height range. Reject nonpositive ranges and upper-bound overflow.
An earlier native Bedrock 1.26.51.1 Hive capture establishes the bounds semantics.
[Mojang's 2225 schema and developer notes](https://github.com/Mojang/bedrock-protocol-docs/releases/tag/v1.26.60) establish cloud synchronization.
The matching Java 26.3 client uses environment attributes for cloud height and suppresses clouds with zero color alpha.
Its day timeline multiplies cloud color and preserves that zero alpha. Other authored attributes stay intact.

The separate stonecutter and cursor-drag integrations depend on the deferred inventory implementation and remain outside this standalone patch.
