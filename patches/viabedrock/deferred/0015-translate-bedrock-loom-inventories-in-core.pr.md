# Bedrock loom inventories

This patch opens Java's standard loom screen and sends server-authoritative crafting requests from ViaBedrock core. Direct connections and ViaProxy share the implementation.

## Behavior

- Move banners, dyes, and pattern items into their corresponding inputs.
- Resolve Java pattern buttons from the advertised `no_item_required` tag order.
- Preserve existing banner layers, metadata, and other NBT in the preview and result.
- Translate banner layers into Java item components so the preview and inventory show their colors and patterns.
- Consume one banner and dye per craft. Keep the pattern item.
- Craft into the cursor or player inventory. Continue shift-click crafting after each accepted response supplies the next stack IDs.
- Restore rejected predictions through the existing request tracker.
- Return inputs and the cursor through the shared acknowledged close lifecycle.
- Validate the workstation against the loom block mapping.

## Versioned evidence

The native reference client and dedicated server were Bedrock **1.26.51.1**, build **51061372**, protocol **2193**. Captures remain private.

Native loom requests used physical input slots 9, 10, and 11, container names 41, 42, and 43, and output slot 50. Result requests used `CraftLoom`, `CraftResultsDeprecated`, two `Consume` actions, and a `Place` action from `CreatedOutput`. The output stack ID was the request ID. The pattern item was not consumed.

Java pattern buttons follow the `no_item_required` tag rather than banner registry ordinals. The implementation derives the mapping from the registries and tags advertised by ViaBedrock. See [Geyser's loom translator](https://github.com/GeyserMC/Geyser/blob/master/core/src/main/java/org/geysermc/geyser/translator/inventory/LoomInventoryTranslator.java) for an independent implementation of this order and these physical slots. The target protocol is recorded in [Mojang's 1.26.51 release](https://github.com/Mojang/bedrock-protocol-docs/releases/tag/v1.26.51).

## Verification

Targeted tests cover tag order, retained layers and metadata, color conversion, malformed inputs, the six-layer bound, request slots and stack IDs, and retained pattern items. The full core suite passed: 378 tests, no failures or skips. Checkstyle passed.

A live Java client through ViaProxy confirmed screen opening, colored previews, cursor crafting, special-pattern crafting, quick-moving an input, and six consecutive shift-click crafts. Bedrock accepted each craft and kept the pattern item. Adding a second layer preserved the first layer in the server-accepted output. Closing returned unused banners and dye, the pattern item, and the cursor result through accepted requests. Reopening showed empty inputs. Invalid placements were rejected by the server and restored correctly. The live comparison exposed a missing loom block tag and stale banner tag IDs. The loom mapping and generated constant are included. Banner tags are regenerated from Java 26.3 client tag definitions against the advertised registry order. The previous creeper chooser referenced Mojang, while the independently constructed result referenced creeper. A regression test checks every pattern-item tag against its crafting material and result mapping, and checks that regular choices cover the remaining registry entries exactly once. A final rebuilt-client comparison confirmed that the middle chooser shows creeper and agrees with the preview and server-accepted result. The first regular choice showed the bottom-left square and sent the matching `bl` craft request.

All four build targets passed before the loom mapping corrections. ViaBedrock and ViaProxy were rebuilt and tested after those corrections. Native comparison of the layer limit, legacy pattern-item variants, and ominous banner rendering remains pending. This patch does not complete the other workstation screens or broader inventory parity.

This change extends the inventory implementation covered by [ViaBedrock #276](https://github.com/ViaVersionAddons/ViaBedrock/pull/276).
