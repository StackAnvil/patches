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

## Native actor picking boxes

Metadata 118 carries picking boxes independently from physical width and height in fields 53 and 54. Core retains its typed `Hitboxes` list, sorts endpoints, and derives each part around actor position plus pivot. Sparse metadata and position updates refresh owned targets; actor removal and replacement remove their aliases.

Stock Java clients receive separate nonphysical Interaction entities. Their equal X/Z requirement uses an enclosing width. Clients that advertise both native actor and picking channels receive exact rectangular part dimensions and owner identity. Clicks resolve to the authoritative native owner while retaining the selected part's click position. Physical collision dimensions remain unchanged.

Evidence targets Bedrock 1.26.51.1, build 51061372, protocol 2193. Eight private executions establish the original typed parser and translation arithmetic. The native picker consumes the part list and uses physical fallback only for empty or missing parts. Missing or wrongly typed FloatTag components default to zero; finite zero-volume parts remain valid. CPU fixture allocations and the Windows comparison seam remain boundaries.

Fifteen core tests and three add-on state tests pass. They cover decoding, bounded serialization, part lifetime, alias routing, sparse updates, and actual capability gates. The observed Wumpus/Discord failure motivates the change, but post-fix live clicks are not verified. Native radius production, inside tests, target ordering, scheduler behavior, and complete reach parity remain requirements. No guessed box inflation or server-specific whitelist is added.
## Paired native picking build

The complete 98-patch core stack replays cleanly. A fresh build passes 915 tests with 30 optional skips and no failures or errors. Main, test, and tool Checkstyle pass. The private candidate retains the exact reviewed picking sources. Installed artifacts remain unchanged; joined NPC click acceptance and native radius behavior remain unverified.
