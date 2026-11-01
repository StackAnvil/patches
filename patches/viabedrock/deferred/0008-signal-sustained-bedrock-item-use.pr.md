# Sustained item use and food admission

This patch admits main-hand food use before it sends the transaction or sets `StartUsingItem`.
Java sends its air-use packet before its local food predicate, and BDS can accept an otherwise ineligible request.
Admission uses the installed native food and use-modifier components, plus current hunger limits.
Always-edible food, Creative use, and server-confirmed Peaceful difficulty ignore hunger.
An installed use-modifier handler on a component item can also start use when its food handler refuses full hunger.
Items without advertised food data retain their existing route.
Unsupported offhand use retains its container resynchronization.

Food definitions follow ordered component updates and connection registry identity.
The implementation uses the constructed native item receiver, rather than a Java carrier or an item-name list.
It projects nutrition, final saturation, and effective full-hunger eligibility into Java's food component.
Component foods also receive the advertised use animation and network duration through Java's consumable component.
This lets custom foods carried as paper enter local use, including zero-duration use.
Consume effects and canonical inventory counts remain server-owned.
Admitted food sets `StartUsingItem` even without an optional food tag.

`COMPLETED_USING_ITEM` supplies a signed item ID and a use method.
Matching held-item completions produce Java's `USE_ITEM_COMPLETE` event without changing canonical inventory counts.
Replaced items and methods outside zero through sixteen cannot complete the current use.
The patch body retains the original Bedrock 1.26.51.1 handler evidence and admission rationale.

## Native evidence

Official Bedrock 1.26.60.5 with BDS 1.26.60.6 uses protocol 2225.
Full-hunger bread remains at 16 on Normal, falls to 15 on Peaceful, and remains at 16 after returning to Normal.
Core retains initial difficulty and later server confirmations.
The client integration also admits its local consumable cycle on Peaceful, including connections through ViaProxy.

Controlled component foods distinguish food admission from another installed handler's result:

- Food without use modifiers refuses full hunger, but consumes while hungry and stops at twenty.
- Adding use modifiers permits full-hunger use with both `always` and `if_first`, including zero duration.
- A timed food consumes one item and raises hunger from ten to fourteen and saturation from zero to 2.4.
- Admitted custom foods send `StartUsingItem` even without the optional food tag.

Executable inspection found a food callback that leaves its result unchanged when hunger refuses use.
The traced DataDriven fixture does not call that inspected callback, so its complete dispatch path remains unverified.
The combined controls establish the admission outcomes that this patch transports.
The [food component reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_food?view=minecraft-bedrock-stable) describes the advertised `can_always_eat` flag.
The [26.30 update reference](https://github.com/MicrosoftDocs/minecraft-creator/blob/main/creator/Documents/Update1.26.30.md) describes use-handler ordering.
Native controls establish the combined behavior for these fixtures; they do not establish every competing handler combination.

## Validation

Seventeen focused tests cover installed component retention, constructor-specific admission, Java component wire properties, difficulty changes, food-use flags, offhand resynchronization, and completion boundaries.
Admission tests retain the held quantity and verify that rejected uses leave `StartUsingItem` clear.
The full four-project build passes 3,286 tests, with 325 skipped and no failures or errors.

Installed direct and ViaProxy controls cover eleven cases each.
Both routes match the selected native admission, hunger, timed consumption, and zero-duration outcomes.
Custom timed food enters local use, and settled client counts agree with the server.
Installed artifacts match the build checksums; core classes match both packaged copies.

## Remaining limits

The [client input patch](../../viafabricplus-bedrock/upstreamable/0038-predict-held-trapdoor-placement.pr.md) now replaces the food four-tick repeat path with the native strict 200 ms deadline.
Fresh calls share that gate, release retains the deadline, and held retries run from input frames.
Direct and ViaProxy controls cover the eleven food cases, retained interaction modes, release, and pause cancellation.
Food-started air holds do not place newly selected blocks; trapdoor-started placement holds do not eat newly selected food.
The installed JAR checksums match the build.

Native tracing establishes the deadline before air use and its check in the shared input function.
Native's 2.1-second instant-food control consumes nine items; the direct Java control consumes eleven at its different frame cadence.
Counts alone do not establish or refute the scheduling rule.
Other initial use families, timed and refused-food handoffs, and live entity transitions still need native comparisons.
Presence of `StartUsingItem` is verified; exact packet phase counts and complete cycle timing remain open.

Competing non-food use handlers, other consumable animations and effects, ability exceptions, and all inventory authority modes need further comparison.
Late completion for a new use of the same item also needs verification.
The original intermittent animation-without-feeding report remains open.

This patch remains deferred behind [ViaBedrock #276](https://github.com/ViaVersionAddons/ViaBedrock/pull/276).
It does not belong in an independent upstream PR branch.
