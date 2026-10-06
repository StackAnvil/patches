# Translate item components, crossbow ammunition, and fireworks

## Behavior

Core applies mapped potion, instrument, and block-state overrides to Java components.
It preserves writable and signed book pages, generation, author, and title.
An empty enchantment list retains its glint.

Crossbows translate the server's `chargedItem` stack into Java's loaded-projectile component.
Nested ammunition uses the ordinary item converter, including subtype mappings and supported components.
An absent, empty, invalid, or unmapped charge produces an empty component.
Only vanilla arrows and rockets reach nested conversion, preventing recursive crossbow contents.
This behavior uses ordinary Java item data through direct connections and ViaProxy.
It requires no add-on payload.

Rockets export `Fireworks` as a standard Java firework component, including unsigned flight duration.
Stars export `FireworksItem` as the explosion component.
Both paths retain all supported shapes, ordered colors and fades, trail, and flicker.
Nested crossbow rockets use the same translation.
Missing flight defaults to zero; incorrectly typed fields retain native defaults.
Invalid shapes use the small ball, and invalid or empty colors use the native purple fallback.

## Target evidence

Isolated official BDS **1.26.51.1**, build **51061372**, protocol **2193** supplied the following wire data:

- A loaded crossbow stores one arrow in `chargedItem`, with byte `Count` and short `Damage`.
- Loading a tipped arrow retains auxiliary value 15 in that nested stack.
- A rocket in the offhand loads with its nested `Fireworks` compound and flight value 1.
- A rocket elsewhere in the inventory does not load in this controlled probe.

The rocket probe reuses an arrow-only assertion, which fails because that assertion expects arrow consumption.
Its held-item wire inspection establishes the loaded rocket data; it does not establish the rocket's firing behavior.
Raw packets and server logs remain private.

The same BDS build supplies 17 creative rockets and all 16 colored stars.
Their typed NBT confirms the rocket and star compound layouts.
Every star RGB value matches the matching Windows client's particle palette.
The executable SHA-256 is `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`.

Focused native inspection establishes the field types, unsigned flight, and shape defaults.
The particle reader at `0x14211c620` supplies an invalid index when base colors are empty.
The spark routine at `0x14211e460` maps that index and all other invalid indices to purple.
A bounded Unicorn fixture executes that routine for 512 color/fade cases.
It supplies particle allocation and selects the first array entry at the RNG boundary.
Native instructions perform palette lookup, flag writes, and RGB conversion.
All 256 indices pass, with and without a fade.
These checks establish component data; they do not establish complete visible firework playback.

[Geyser's firework translator](https://github.com/GeyserMC/Geyser/blob/master/core/src/main/java/org/geysermc/geyser/item/type/FireworkRocketItem.java) provides an independent schema comparison.
Its reverse translation currently retains colors only.
Its palette and fallback differ from this target build, so this patch uses target evidence.
Proprietary instructions and raw fixture output remain private.

[Geyser's crossbow translation](https://github.com/GeyserMC/Geyser/blob/master/core/src/main/java/org/geysermc/geyser/item/type/CrossbowItem.java) independently maps Java loaded projectiles to `chargedItem`.
[Mojang's crossbow article](https://www.minecraft.net/en-us/article/taking-inventory--crossbow) describes retaining a loaded shot after changing items.
These are behavior leads; the target BDS provides the wire evidence above.

## Verification and limits

Tests cover complete nested-stack forwarding, preservation of converted components, unloaded transitions, invalid charges, and recursive contents.
The shared stored-item decoder also has auxiliary-data tests in the inventory patch.
Full Java charge and firing timing, slot changes, direct and ViaProxy comparisons remain unverified.
Tests also cover ordered multiple explosions, typed defaults, source immutability, all 256 flight and shape values, and palette boundaries.
Multishot, Quick Charge, Piercing, detailed damage, firework entity motion, particles, sound, and native visuals remain requirements in the gameplay matrix.

The complete 95-patch core stack replays successfully.
The core build and Checkstyle pass with 679 tests passing and 19 optional skips.
The Java fireworks network round trip retains every translated field.
