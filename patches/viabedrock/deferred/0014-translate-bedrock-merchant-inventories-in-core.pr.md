# Bedrock merchant inventories

This patch implements `UPDATE_TRADE` and Java trade selection in ViaBedrock core. Direct connections and ViaProxy share the same merchant screen and inventory requests.

## Behavior

- Open a Java merchant screen from native trade offers.
- Preserve ingredient damage rules, required NBT, block states, and result NBT.
- Show resolved prices, base prices, tier locks, stock, and experience.
- Return previous ingredients and fill a selected offer from player inventory.
- Wait for server responses before transfers that require new stack IDs.
- Craft into the cursor or inventory. Continue shift-click transfers after each accepted response.
- Restore rejected predictions and prevent duplicate stock updates.
- Return ingredients and the cursor through acknowledged requests before closing. Drop only the overflow when the inventory is full.
- Close the screen when its actor disappears or moves out of reach.

## Versioned evidence

The reference client and dedicated server were Bedrock **1.26.51.1**, build **51061372**, protocol **2193**. Native traffic and screenshots were recorded on a muted virtual display. Captures remain private.

`UPDATE_TRADE` opened the native screen without `CONTAINER_OPEN`. The packet used `Size=0` and trading-player ID `-1`. Ingredient container names were 47 and 48, with physical slots 4 and 5. Result requests used `CreatedOutput`, slot 50, and the request ID as the output stack ID.

A native Hero of the Village comparison showed `buyA.Count=16` and `buyCountA=24`. These fields contain the resolved and base prices respectively. The Java first-cost modifier preserves that relationship.

Native selection filled the input with all 64 paper for a 24-paper price. The placement planner preserves this capacity and also transfers stacks smaller than the required price.

The dedicated server accepted a two-craft request with `CraftRecipe`, `CraftResultsDeprecated`, `Consume`, and `Place`. It consumed 48 of 64 paper and returned two emeralds with a new stack ID. The result descriptor contained one emerald, with the craft count stored separately.

References: [Mojang protocol 2193 release metadata](https://github.com/Mojang/bedrock-protocol-docs/releases/tag/v1.26.51) and [an independent native trade implementation](https://github.com/Ieckseyr/HologramLib/blob/main/src/trade/TradeOfferNbt.h).

## Verification and remaining checks

The full core suite passed: 371 tests, no failures or skips. Checkstyle passed. Targeted cases cover offer parsing, prices, required NBT, shared ingredients, stack splitting, slot mappings, packet encoding, rejection, duplicate acknowledgements, and offer replacement.

Native captures cover economy trades with the current UI. Legacy trade UI mappings still need a native comparison. A live Java screen comparison through ViaProxy confirmed screen opening, offer selection, cursor crafting, shift-click crafting, and experience updates. The same comparison exposed a shared pickup-slot bug; its fix is folded into the existing inventory patch. The final build accepted cursor placement into the first inventory cell. A bulk shift-click consumed 48 of 64 input paper, left 16, and increased the existing emerald stack by two.

Closing and reopening returned all 64 unused paper. After one cursor trade, closing returned the remaining 40 paper and merged the cursor emerald into inventory. With all 36 inventory cells full, closing dropped the remaining paper. The server confirmed a paper item entity, and reopening showed empty inputs. These runs produced no rejected inventory requests. Native comparison of the full-inventory close behavior remains pending.

All four build targets passed. The add-on suite reported 477 tests, including 97 skips, with no failures. This patch does not complete the other inventory screens or broader protocol and appearance parity work.

This change extends the inventory work covered by [ViaBedrock #276](https://github.com/ViaVersionAddons/ViaBedrock/pull/276).
