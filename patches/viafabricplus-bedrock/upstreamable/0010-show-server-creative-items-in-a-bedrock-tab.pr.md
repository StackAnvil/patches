# Bedrock creative catalog

Expose the server's creative items in a dedicated Java creative tab. Preserve the catalog entry marker so the existing inventory translator can resolve a selected item to its native descriptor. Keep unavailable Java items out of ordinary tabs.

The manual catalog-to-Minecraft conversion now also carries `viabedrock:item_identifier` from ViaBedrock's custom data. It also preserves the compiled `viabedrock:item_use_duration` tick value. Player animation queries can read the original native name after selection. This uses the same identifier contract as network-translated inventory and equipment items.

The replayed client and dependency builds pass. Targeted item-query tests cover renamed and custom items. A live ViaProxy comparison verifies the identifier on a network-translated banner. Interactive creative selection and complete equipment animation parity still need comparison.
