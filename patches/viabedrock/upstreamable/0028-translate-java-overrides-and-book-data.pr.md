# Translate item components and stored crossbow ammunition

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

## Target evidence

Isolated official BDS **1.26.51.1**, build **51061372**, protocol **2193** supplied the following wire data:

- A loaded crossbow stores one arrow in `chargedItem`, with byte `Count` and short `Damage`.
- Loading a tipped arrow retains auxiliary value 15 in that nested stack.
- A rocket in the offhand loads with its nested `Fireworks` compound and flight value 1.
- A rocket elsewhere in the inventory does not load in this controlled probe.

The rocket probe reuses an arrow-only assertion, which fails because that assertion expects arrow consumption.
Its held-item wire inspection establishes the loaded rocket data; it does not establish the rocket's firing behavior.
Raw packets and server logs remain private.

[Geyser's crossbow translation](https://github.com/GeyserMC/Geyser/blob/master/core/src/main/java/org/geysermc/geyser/item/type/CrossbowItem.java) independently maps Java loaded projectiles to `chargedItem`.
[Mojang's crossbow article](https://www.minecraft.net/en-us/article/taking-inventory--crossbow) describes retaining a loaded shot after changing items.
These are behavior leads; the target BDS provides the wire evidence above.

## Verification and limits

Tests cover complete nested-stack forwarding, preservation of converted components, unloaded transitions, invalid charges, and recursive contents.
The shared stored-item decoder also has auxiliary-data tests in the inventory patch.
Full Java charge and firing timing, slot changes, direct and ViaProxy comparisons remain unverified.
Multishot, Quick Charge, Piercing, detailed damage, and complete firework data translation remain requirements in the gameplay matrix.

The complete 95-patch core stack replays successfully.
The core build and Checkstyle pass with 675 tests passing and 19 optional skips.
