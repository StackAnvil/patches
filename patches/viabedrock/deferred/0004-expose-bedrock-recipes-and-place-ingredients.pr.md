# feat(crafting): expose Bedrock recipes and place ingredients

## Purpose

Display representable crafting-table recipes from Bedrock data with stable Java IDs and honor unlock events. Place ingredients through server-authoritative item stack requests, using tracked network IDs and recipe counts. Show a ghost recipe when ingredients are unavailable.

## Design constraints

Resolve native ingredient descriptors and connection-owned item definitions before matching. Keep search, unlocks, availability, placement, and output construction separate. The server owns the final craft.

## Validation and remaining limits

Regression coverage includes `NativeFurnaceOptionsTest`, `CookingRecipeAvailabilityTest`, `CookingRecipeInputsTest`, `CookingRecipeSourcesTest`.

Controlled native recipe and naming references cover their declared boundaries. Complete installed player/cooking controllers and arbitrary recipe admission remain unfinished.

The [owning patch](0004-expose-bedrock-recipes-and-place-ingredients.patch) retains implementation rationale and versioned evidence.

Creative descriptor parsing uses the same connection-owned Item construction as inventory descriptors.
The packet regression retains potion metadata and definition identity without inventing a Block association for wire runtime zero.
It also reads secondary search text and preserves packet alignment after empty group icons.
Associated Blocks at runtime zero retain their separate constructor regression.
