# Translate Bedrock actor metadata and properties

This deferred patch retains the metadata work covered by [ViaBedrock PR 327](https://github.com/ViaVersionAddons/ViaBedrock/pull/327).
Its commit body records the other property, scale, pose, and name changes.

## Firework actor item data

Core translates rocket compound metadata field **16** into standard Java `FIREWORKS_ITEM` metadata.
The native compound contains item user data, rather than a complete saved stack.
Core supplies the rocket identity and count, copies the complete compound, and uses the ordinary item converter.
This retains translated flight, explosion shapes, colors, fades, trail, and flicker.
An empty compound creates an unadorned rocket and clears earlier components.
Integer minecart display data remains on its existing path.
These standard packets also work through ViaProxy and require no add-on payload.

## Target evidence

Isolated BDS **1.26.51.1**, build **51061372**, protocol **2193** supplies a crossbow-fired rocket with `Fireworks` in compound field 16.
A summoned rocket supplies an empty compound in that field.
Both actors emit raw explosion event 25 and then disappear.
The matching native function `0x143346100` reads field 16 and emits event 25.
The [Geyser firework actor](https://github.com/GeyserMC/Geyser/blob/master/core/src/main/java/org/geysermc/geyser/entity/type/FireworkEntity.java) independently uses the overloaded display field for firework user data.
Its direction of translation differs from ViaBedrock.
Raw evidence remains private.

## Verification and limits

Semantic tests retain complete rocket user data, source immutability, empty updates, and type separation for the overloaded field.
Existing item tests verify component conversion and Java network serialization.
The wire probe also supplies direction in field 17 and shooter/attachment identity in field 18.
Complete translation of those fields, rocket flight simulation, boost timing, and visible explosion/audio comparisons remain requirements.
The controlled BDS probe does not establish full Java or ViaProxy gameplay parity.

The complete 95-patch core stack replays and builds successfully.
Checkstyle passes, with 683 tests passing, 19 optional skips, and no failures.
