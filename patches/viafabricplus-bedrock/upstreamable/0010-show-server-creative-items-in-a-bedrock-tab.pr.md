# Bedrock creative catalog

Expose the server's creative items in a dedicated Java creative tab. Preserve the catalog entry marker so the existing inventory translator can resolve a selected item to its native descriptor. Keep unavailable Java items out of ordinary tabs.

The catalog-to-Minecraft conversion now preserves complete custom NBT through the standard named NBT codecs. It retains creative entry identity, original item identity, native use clocks, tags, kinetic timings, and unrelated nested values. Future rendering fields can travel through this path without another marker whitelist.

A probe invokes the production conversion in the rebuilt client with native spear metadata and an additional signed long array. The converted custom data equals the original tree. The graph and query checks pass through ViaProxy. This conversion uses Java's 2 MiB NBT accounting limit.

The replayed client and dependency builds pass. Targeted item-query tests cover renamed and custom items. A live ViaProxy comparison verifies the identifier on a network-translated banner. Interactive creative selection and complete equipment animation parity still need comparison.
