# Server-authoritative inventory requests

This patch follows the inventory work owned by [ViaBedrock #276](https://github.com/ViaVersionAddons/ViaBedrock/pull/276).
It remains deferred until that prerequisite lands.

## Crafted item metadata

A successful stack response supplies counts, names, and stack network IDs.
It omits complete item tags and the item's final subtype.
A crafted map can therefore retain a preview UUID after the response assigns its new stack ID.

Core identifies transfers from `CreatedOutputContainer` and correlates their destinations with the response.
An `InventoryMismatch` transaction requests full inventory data while the workstation remains open.
Queued interactions wait for matching destination IDs and counts and complete player, cursor, armor, and offhand snapshots.
Later snapshots can invalidate an earlier matching update.
This barrier prevents queued predictions from running between snapshots of the same refresh.
The existing inventory recovery handles a refresh timeout.

The [target inventory transaction schema](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/inventory-transaction-packet/) documents the transaction union.
The [map-copy schema](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/map-create-locked-copy-packet/) documents the preview map identity request.
Numeric values and response behavior come from the matching native build.

## Verification

- Native Bedrock 1.26.51.1, build 51061372, protocol 2193, with a matching dedicated server.
- An injected mismatch after an accepted map-locking craft returns full player, armor, HUD, offhand, and workstation contents.
- Cartography stays open. HUD slot zero contains the final map UUID and subtype; its UUID differs from the preview.
- A subsequent native placement succeeds using the refreshed item's acknowledged network ID.
- Five correlation tests cover final map metadata, stale IDs and amounts, wrong slots, multiple destinations, inventory aliases, and superseding snapshots.
- The complete ViaBedrock build and tests pass after replaying the 84-patch stack.

Raw captures and account data remain private.
This native comparison establishes the refresh mechanism.
Java UI integration, other server implementations, and direct and ViaProxy crafting comparisons remain unverified.
Cartography's Java screen and request generation remain incomplete.

## Recovery refresh

A request timeout now sends `InventoryMismatch` after reopening the player inventory.
The old recovery path reopened the inventory without requesting the cursor and equipment snapshots that its barrier requires.
It now shares the refresh transaction used for crafted metadata.
The native comparison above establishes that this transaction returns all required containers on Bedrock 1.26.51.1.
The barrier and disconnect timeout remain active if the server cannot supply fresh state.
The report lacks the original server and request log.
This change fixes a recovery defect, but the original timeout trigger remains unknown.
The complete core build passes with 557 passing tests and five optional skips, including the inventory recovery and crafted-item synchronization tests.

## Complete inventory snapshots

Core installs every slot from a full snapshot before it notifies slot observers.
Recipe observers therefore see the complete replacement, rather than a mixture of old and new contents.
Full item equality suppresses unchanged snapshot notifications and preserves count, tag, subtype, and stack network ID changes.
Single-slot predictions retain their existing notification behavior because some predictions mutate the stored item before the update.

Strict BDS sends a release transaction and then full player and offhand snapshots after food consumption.
The previous callback loop sent duplicate mainhand equipment and unchanged offhand equipment after that transaction.
The [matching equipment schema](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/mob-equipment-packet/) requires updates for held slot or content changes.
Actual changes still produce an equipment update.

Two tests cover repeated snapshots, count and network ID changes, complete contents during callbacks, and ownership of the snapshot array.
All four projects build, and both complete patch stacks replay.
There are 16 converter, 669 core, and 584 add-on test cases, with 133 skips and no failures or errors.

Direct and ViaProxy strict-BDS recordings both reach join and spawn with protocol 2193.
Each route contains ten food completions across controlled eating, additional repeated eating, and last-item consumption.
Every completion now sends one equipment update, compared with three in the preceding recordings.
Both routes consume the last item and restore full movement input.

Eating corrections remain in these recordings.
The direct route receives one during controlled eating and one during additional repeated eating.
ViaProxy receives two during controlled eating, three during additional repeated eating, and two after last-item consumption.
This change verifies snapshot consistency and removal of duplicate equipment updates.
Native completion prediction, correction history, and the cause of those corrections remain incomplete.

## Horse, donkey, and mule menus

Core handles `UPDATE_EQUIP` and `CONTAINER_OPEN` through one mount-opening flow.
Receiving both packets preserves the same container and contents.
Supported mounts use Java's ordinary mount screen, including five cargo columns for chested donkeys and mules.
The menu uses standard Java packets and needs no add-on-specific screen in ViaProxy.
Live route comparisons remain pending.

Bedrock capacity, content indices, request slots, and Java menu slots have separate meanings.
Java reserves two equipment cells; Bedrock donkeys and mules use one.
Native cargo indices 1 through 15 therefore map to Java cells 2 through 16.
Player contents begin at Java cell 17.
An unchested mule can retain native capacity 16 while displaying only two Java cells.
The hidden armor cell and inaccessible cargo cannot create item requests.
Compact unchested snapshots and complete native snapshots both retain correct identity.

The [target equipment packet schema](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/update-equip-packet/) establishes the packet fields.
[Geyser's fixed mount opener](https://github.com/GeyserMC/Geyser/blob/f66329d9d21b3c836edc014fbb9d8312fbe34285/core/src/main/java/org/geysermc/geyser/translator/protocol/java/inventory/JavaMountScreenOpenTranslator.java) sends a zero size and server equipment rules.
Its [chested mount translator](https://github.com/GeyserMC/Geyser/blob/f66329d9d21b3c836edc014fbb9d8312fbe34285/core/src/main/java/org/geysermc/geyser/translator/inventory/horse/ChestedHorseInventoryTranslator.java) corroborates equipment and cargo mappings.
Supported actor metadata and chest state determine our menu layout.
Equipment predictions honor server item names, auxiliary values, and empty accepted-item lists.

A headless client joined official BDS 1.26.51.1, build 51061372, protocol 2193, in an isolated loopback network namespace.
The server reported a tamed mule capacity of 16 before chest attachment and set `CHESTED` after attachment.
Script API observed four emeralds at cargo index 1 and two diamonds at index 15.
These checks establish target capacity, chest state, and cargo indices.
They do not establish native screen-opening packet order or live translated inventory requests.
The headless screen-opening probe timed out; its processes stopped cleanly.
The existing lab display and current-boot native GPU guard remain intact.

Eight added tests cover native and Java slot separation, all cargo and player cells, hidden slots, both opening packet orders, complete payload consumption, equipment restrictions, compact snapshots, and rollback identity.
Native UI, saddle transfers, shift-clicks, rejection recovery, reopening, destruction, direct connections, and ViaProxy comparisons remain required.
Other mount types and their storage layouts remain unsupported.

The full 95-patch stack replays successfully.
CubeConverter and the complete ViaBedrock build pass, including Checkstyle and 672 passing core tests with 19 optional skips.
