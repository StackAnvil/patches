# Sustained item use and food admission

This patch admits main-hand food use before it sends the transaction or sets `StartUsingItem`.
Java sends its air-use packet before its local food predicate, and BDS can accept an otherwise ineligible request.
Admission uses the advertised native food component and current hunger limits.
Always-edible food, Creative use, and server-confirmed Peaceful difficulty ignore hunger.
Items without advertised food data retain their existing route.
Unsupported offhand use retains its container resynchronization.

Food definitions follow ordered component updates and connection registry identity.
The implementation does not infer food behavior from the Java item or a fixed whitelist.
The [food component reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_food?view=minecraft-bedrock-stable) describes `can_always_eat`.
Native captures establish the behavior of the tested builds.

`COMPLETED_USING_ITEM` supplies a signed item ID and a use method.
Matching held-item completions produce Java's `USE_ITEM_COMPLETE` event without changing canonical inventory counts.
Replaced items and methods outside zero through sixteen cannot complete the current use.
The patch body retains the original Bedrock 1.26.51.1 handler evidence and admission rationale.

## Current native boundary

Official Bedrock 1.26.60.5 with BDS 1.26.60.6 uses protocol 2225.
At full hunger, bread remains at 16 on Normal and decreases to 15 after a switch to Peaceful.
A switch back to Normal restores refusal and retains 16 bread.
The previous installed add-on retains all 16 bread and never enters use on Peaceful.
Core retains initial difficulty and later server confirmations.
The client integration also admits its local consumable cycle on Peaceful, including connections through ViaProxy.
Inventory consumption remains server-owned.

Registered packet tests cover main-hand rejection, offhand resynchronization, and Normal → Peaceful → Normal admission without inventory prediction.
Model tests cover registry replacement, hunger maxima, Creative use, and always-edible food.
Completion tests cover signed IDs, method boundaries, and replaced items.

Installed direct and ViaProxy controls each pass those three full-hunger cases and a hungry Normal control.
Allowed cases each receive one server completion, consume one bread, and settle at the server count of 15.
Refused cases never enter local use and retain 16 bread.
The full four-project build passes 3,281 tests, with 325 skipped and no failures or errors.
All 1,645 core classes match both packaged copies, and installed artifacts match the build checksums.

## Remaining limits

The same native build consumes a DataDriven apple at full hunger on Normal despite its advertised `can_always_eat=false` component.
Controlled DataDriven foods also consume one item with that flag false and `minecraft:use_modifiers` present.
Both explicit `start_using` modes, `always` and `if_first`, produce that result.
The new-format fixture that omits the field receives `if_first` from BDS and also consumes one item.
Bread remains at 16 under the same full-hunger Normal control.

The [26.30 update reference](https://github.com/MicrosoftDocs/minecraft-creator/blob/main/creator/Documents/Update1.26.30.md) describes use-handler ordering for these modes.
The current native controls disprove an `always`-only explanation, but do not establish the complete dispatch predicate.
They do not cover food without use modifiers or competing non-food use handlers.
The current core registry rejects the false-flag DataDriven controls, so this admission discrepancy remains open.
The original intermittent animation-without-feeding report also remains open.
The bread controls do not establish all custom-food constructors, ability exceptions, cycle timing, or inventory authority modes.
Late completion for a new use of the same item also needs verification.

This patch remains deferred behind [ViaBedrock #276](https://github.com/ViaVersionAddons/ViaBedrock/pull/276).
It does not belong in an independent upstream PR branch.
