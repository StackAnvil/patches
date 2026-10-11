# Retain native creative entries

## Creative-menu drops

Java 26.3 emits `SET_CREATIVE_MODE_SLOT` with slot `-1` for creative-menu drops. The previous handler rejects this slot. Translate it into native creative craft, results, and drop actions from created-output slot 50. Preserve unrelated held items.

[Geyser implements the same native flow](https://github.com/GeyserMC/Geyser/blob/master/core/src/main/java/org/geysermc/geyser/translator/inventory/PlayerInventoryTranslator.java). Tests decode actual Java drop packets for stone and polished blackstone pressure plates. They cover single items, full stacks, pending-close queues, and invalid stack limits.

Live server-given plate drops already work in creative and survival mode. The native BDS catalog also preserves the plate runtime identity. This change targets the separate creative-menu packet path.

The updated ViaProxy build passes a category-menu Q control for a stone pressure plate. BDS also accepts a polished blackstone pressure plate dropped outside the creative catalog. Both controls use the repaired slot `-1` path.
