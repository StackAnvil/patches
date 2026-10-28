Update the supported Bedrock release from 1.26.51, protocol 2193, to 1.26.60, protocol 2225. Java remains on 26.3.

The patch updates wire layouts, runtime IDs, generated resources, and mappings together. Native redstone connection states map directly to Java connections. A legacy upgrade preserves explicit connection values because Mojang kept the same block-state version.

Sources: [Mojang protocol 2225](https://github.com/Mojang/bedrock-protocol-docs/releases/tag/v1.26.60), [matching GDK package](https://github.com/bubbles-wow/mcbe-gdk-unpack-archive/releases/tag/1.26.60.5), and the pinned Geyser data linked in `Data Asset Sources.md`.

Experimental content uses documented Java fallbacks. Block seating and signed audio content remain unsupported. This update does not claim complete parity for those features.

Validation:

- The standalone patch applies and builds on pinned upstream without StackAnvil setup. Style checks, mapping validation, and 21 targeted tests pass.
- All 104 core patches and 39 add-on patches replay. Core, add-on, CubeConverter, and ViaProxy builds pass. Relay self-tests pass.
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

## Actor interaction hand field

Protocol 2225 puts the actor transaction's hand before its held item descriptor.
The shared codec included this field, but the direct attack and interaction writers omitted it.
Both writers now include the main-hand byte.
A live BDS session rejected the previous interaction packet as an invalid enum and terminated the connection.
Native 1.26.60.5 boat interaction and attack captures confirm the field order with both empty and nonempty hands.
The matching schemas define the same order in `ItemUseOnActorInventoryTransaction`.

The explicit attack helper also omitted the trailing hand from `Animate`.
BDS accepted the repaired interaction, then rejected the old attack swing as an invalid numeric value.
Ordinary punches and explicit attacks now share `ActorSwingPacketFactory` with held-use swings.
Two wire regressions compare the native attack payload and retain packet boundaries across sources and hands.

Fresh direct and ViaProxy recordings complete normally after boat interaction and attack.
BDS confirms boarding through its actor link and confirms damage through the boat's hurt countdown from nine to zero.
The native fixture produces the same hurt countdown.
The full stack passes 2,052 core tests, 1,281 add-on tests, 21 CubeConverter tests, and four ViaProxy tests.
No suite reports failures or errors. Core skips 176 optional tests and the add-on skips 142.

## Player UI inventory capacity

BDS 1.26.60.6 sends 57 entries for player UI container 124.
The sealed native protocol-2225 capture and the direct Java join agree.
The earlier protocol-2193 fixture contains 54 entries.
The old capacity rejected the complete update, including cursor and crafting state.
The version patch now accepts all 57 entries and retains the existing slot projections.
The regression covers complete-array retention and later updates to the appended slots.
It fails before the capacity change and passes afterward.

Armor container 120 already sent five entries in the older fixture.
Its subcontainer reader retains the first four armor entries, so no armor resize belongs in this fix.
This capacity change does not implement new UI controls or establish new slot meanings.

Fresh validation passes after the capacity correction:

- The standalone patch applies without setup and passes all 22 tests and checkstyle.
- The complete core stack reports 2,057 tests, 176 optional skips, and no failures or errors.
- CubeConverter passes all 21 tests. The modpack bundle rebuilds successfully.
