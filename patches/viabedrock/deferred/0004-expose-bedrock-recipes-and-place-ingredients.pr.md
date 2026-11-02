# feat(crafting): expose Bedrock recipes and place ingredients

## Purpose

Display representable crafting-table recipes from Bedrock data with stable Java IDs and honor unlock events. Place ingredients through server-authoritative item stack requests, using tracked network IDs and recipe counts. Show a ghost recipe when ingredients are unavailable.

## Design constraints

Resolve native ingredient descriptors and connection-owned item definitions before matching. Keep search, unlocks, availability, placement, and output construction separate. The server owns the final craft.

## Validation and remaining limits

Regression coverage includes `NativeFurnaceOptionsTest`, `CookingRecipeAvailabilityTest`, `CookingRecipeInputsTest`, `CookingRecipeSourcesTest`, `CraftingCursorTest`, and `InventoryTransferBatchTest`.

Official Bedrock 1.26.60.5/BDS 1.26.60.6 captures establish manual output pickup and Shift-click behavior for planks, cake, and honey blocks.
Manual requests keep CraftResults times one, select primary output before returned containers, and use Take for cursor output.
Right-click crafts once. Shift-click fills inventory through linked stack-sized requests in one packet.
Capacity sums compatible inventory stacks. Returned containers merge before empty slots and drop from created output when they do not fit.
Player and workbench tests exercise the shared handler, predicted identities, returned-container placement, cursor preservation, and rollback.
The two-request Shift-click regression requires one full Java refresh while retaining linked native requests and per-request predictions.
Installed direct and ViaProxy checks match the native manual requests and authoritative quantities for the [documented controls](../../../docs/native-player-inventory.md).

Controlled native recipe and naming references cover their declared boundaries. Complete installed player/cooking controllers and arbitrary recipe admission remain unfinished.

The [owning patch](0004-expose-bedrock-recipes-and-place-ingredients.patch) retains implementation rationale and versioned evidence.

Creative descriptor parsing uses the same connection-owned Item construction as inventory descriptors.
The packet regression retains potion metadata and definition identity without inventing a Block association for wire runtime zero.
It also reads secondary search text and preserves packet alignment after empty group icons.
Associated Blocks at runtime zero retain their separate constructor regression.

Initialize the player inventory profile from the original 1.26.60.5 constructor.
Its fields start with Search, Crafting, filtering off, and automatic layouts.
Ghidra connects these fields to their named NBT keys, controller reads, and packet-307 producer.
Four original-instruction controls reproduce the writes and retain surrounding bytes.
Java filter edits preserve the native tabs and automatic layouts.
Later packets retain their explicit raw values.
