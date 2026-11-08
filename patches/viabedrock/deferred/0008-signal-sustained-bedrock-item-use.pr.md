# Sustained item use and food admission

This patch uses native food admission to set `StartUsingItem`.
A refused main-hand food request still sends its air-use transaction, matching native packet behavior.
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
Core forwards matching held-item notifications as Java's `USE_ITEM_COMPLETE` event without changing canonical inventory counts.
It rejects replaced items and methods outside zero through sixteen.
The integrated Bedrock client completes its local cycle independently and ignores that translated notification.
The [client lifecycle evidence](../../viafabricplus-bedrock/upstreamable/0025-send-completed-local-physics-to-viabedrock.pr.md) covers inventory refreshes, suppressed and late acknowledgments, release, and zero-duration food.
The patch body retains the versioned handler evidence and admission rationale.

Native 1.26.60.5 consumes food without packet 142 and continues local use attempts while server authority is delayed.
Its packet handler resolves the item registry and emits an actor-use notification independently of the selected inventory slot.
These declared controls establish acknowledgment independence. They do not establish the cause of the original live report or ordinary transport loss.

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
Admission tests retain the held quantity and verify refused-use payloads with `StartUsingItem` clear.

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
Initial food refusal retains block mode, whose frame continuation bypasses this air deadline.
Already accepted air mode remains active when later food attempts reach full hunger.
Native's 2.1-second instant-food control consumes nine items; the direct Java control consumes eleven at its different frame cadence.
Counts alone do not establish or refute the scheduling rule.
Other initial use families and live entity transitions still need native comparisons.
Presence of `StartUsingItem` is verified; exact packet phase counts and complete cycle timing remain open.

Competing non-food use handlers, other consumable animations and effects, ability exceptions, and all inventory authority modes need further comparison.
The selected one-second late acknowledgment control passes on both integrated Java routes. The [client input evidence](../../viafabricplus-bedrock/upstreamable/0038-predict-held-trapdoor-placement.pr.md) also covers short release/repress controls and the correction for a release missed between game ticks. Broader consumable timing still needs comparison.
The original intermittent animation-without-feeding report remains open.

This patch remains deferred behind [ViaBedrock #276](https://github.com/ViaVersionAddons/ViaBedrock/pull/276).
It does not belong in an independent upstream PR branch.

The current timed-to-instant custom-food switch cancels the old definition instead of retaining its Java paper use cycle.
Early switches consume none of the old food; late switches retain one completion.
The long-hold control retains three completions and reaches full hunger.
The client input sidecar records the remaining placement timing and dispatch gaps.

Server inventory `Use` completion is separate from packet 142.
Native 1.26.60.5 applies that callback to a new active cycle, but skips the local countdown's hunger feedback.
Send a negotiated stop notification after authoritative inventory actions. Preserve the existing path for clients without the channel.
The packet regression covers negotiation, Release versus Use, legacy rejection, counts, and notification ordering.
Native attribute-omission controls retain five hunger and seven bread after one local completion and a server callback with 31 ticks remaining.
The client movement sidecar records installed verification and remaining timing limits.
