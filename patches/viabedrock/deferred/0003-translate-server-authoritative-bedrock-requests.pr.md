# feat(inventory): translate server-authoritative Bedrock requests

## Purpose

Port inventory actions and crafting data onto the existing container tracker instead of the parallel PR 276 container hierarchy. Track predicted changes by request ID, apply server responses to the owning container, and restore snapshots after rejected requests. Include focused response and routing tests.

## Design constraints

Own predictions and responses by request, container object, and opening lifetime. Preserve native stack IDs, cursor state, transfer quantities, offhand permissions, and authoritative rollback.

## Validation and remaining limits

Regression coverage includes `ContainerTest`, `HorseContainerTest`, `NativeArmorPermissionsTest`, `NativeContainerActionSessionTest`, and `InventoryTransferBatchTest`.

Late replies and replacement menus have targeted regressions.
Client-initiated close acknowledgments retire native state without closing another Java screen.
Genuine server-initiated closes retain their ordinary or correlated close path.
An opening received while a previous close awaits acknowledgment is rejected by its own token.
It needs fresh input after acknowledgment, rather than opening automatically when the wait ends.

Official Bedrock 1.26.60.5/BDS 1.26.60.6 controls establish this admission behavior on protocol 2225.
A raw relay delays the close acknowledgment by four seconds for both player and workbench closures.
Early E input sends no open interaction and leaves the screen closed after acknowledgment.
The workbench control also captures a fresh E input opening normally after acknowledgment.
Packet and tracker regressions cover acknowledgment consumption, server closes, early rejection, and fresh input.
The optional acknowledgment-bound request channel keeps the player screen hidden until its own native acknowledgment.
Legacy clients retain their original request channel.
Repeated E reissues the native interaction under the same opening token.
Cancellation and late replies retain their original ownership.
Tracker regressions cover readiness, cancellation, repeated input, and legacy requests.

The same native builds also delay the initial player and workbench open acknowledgments by four seconds.
Both keep the world visible during the wait.
Movement continues, and Escape or chat cancels the pending player inventory.
Native closes the abandoned container after its late acknowledgment without replacing the other screen.
These controls establish visible admission, not internal constructor or frame-level population timing.
Rebuilt direct and ViaProxy controls cover initial Survival, Creative, and workbench openings through the delayed relay.
Their complete journals retain two open interactions for repeated E and one native close after each cancellation.

Rebuilt direct and ViaProxy clients use the same delayed-acknowledgment relay for player and workbench close controls.
Both routes remain closed after early input without queuing an open interaction.
Fresh-input controls reopen normally, with the 32-log stack unchanged.

Scoped manual crafting batches reuse ordered prediction and response reconciliation. Native-shaped regressions cover reordered responses, rejection of a later craft, whole-batch rejection, and refusal of unrelated operations. Native manual-crafting transactions, complete response-manager behavior, and every container remain unfinished.

Failed batch replies retain their status without reading optional container data.
BDS 1.26.60.6 sends status 49 without a container list on protocol 2225.
Wire-decoded rejection fixtures cover rollback, accepted predecessors, crafting, and newer authoritative contents.
Successful replies still filter slot updates against the retained container revision.
Installed direct and ViaProxy fault controls reject native bundle insertion and extraction, then accept both retries without disconnecting or losing items.
The [inventory reference](../../../docs/native-player-inventory.md) records the control scope and remaining native comparison limits.

Installed direct and ViaProxy checks accept bundle insertion, extraction, and reinsertion requests and retain the contents after reopening.
See the [inventory reference](../../../docs/native-player-inventory.md) for the control path and remaining native comparison limit.

Sparse bundles retain every nonempty entry in newest-first Java display order.
Selection and requests map back to occupied physical slots. Extraction skips holes; insertion reclaims them when the last slot is occupied.
Bedrock 1.26.60.5 layout and cell-lookup controls establish filtering and source order.
Regressions cover translation, selection, extraction, full-span insertion, and merging across gaps.
Transfers reject missing network IDs before changing predicted items or selection, including IDs needed by later swaps and compaction moves.
The new sparse request sequences still need installed server controls and a matching native capture.

The [owning patch](0003-translate-server-authoritative-bedrock-requests.patch) retains implementation rationale and versioned evidence.

Held quantity selection uses ordinary Place and explicit-count Take requests with the existing prediction and response owner.
Transfers validate source permissions, cursor contents, capacity, and network stack IDs before prediction.
Packet/state regressions cover renewed IDs and rejected partial pickup without item loss.

Negotiated ordinary-stack drags retain destinations and an original budget independently of the live cursor.
Each visit uses the existing transfer prediction and response owner. Later transfers use renewed stack IDs.
A close retains earlier inputs until their replies settle and rejects subsequent input or a new player opening.
Rejection closes with reconciled items. An old close cannot affect a replacement menu, including one with the same Java ID.
Regressions cover queued pickup, delayed and reordered responses, rejection, capacity, bundle compatibility, and opening replacement.
A 36-destination regression covers chest slots and player slots appended to a furnace.
Queued revisits preserve first-visit order. Release and a new press keep consecutive gestures separate.
Installed direct and ViaProxy controls retain three-slot and full-inventory distributions through Escape while held and delayed replies.
The full-inventory control reconciles every destination before closing and conserves all 64 items after reopening.
Native multiplayer grouping and delayed or rejected native behavior remain unverified.
See the [cooking reference](../../../docs/native-cooking-actions.md#recipe-input) for the versioned visible control and host limits.

Retained drag snapshots use item identity independently of stacking admission.
Armor rejects occupied-slot merging even against its own copy; using that predicate as a snapshot check cancelled the first visit before sending any request.
An installed Enchanted protocol-2225 trace isolates that guard. Regressions cover an unstackable cursor transfer and cancellation when its item data changes.
Network-ID renewal and the pickup marker do not replace the retained item; destination policy and merge rules remain unchanged.

The rebuilt add-on equips leggings on live Enchanted. Both pickup and placement receive successful ItemStackResponses, and the armor slot retains the leggings after closing and reopening inventory. The final check runs without the diagnostic agent and uses the hash-verified built artifact.

Identity-less slot updates: Lifeboat answers a 2x2 bone meal craft with the leftover bone at network ID 12, then sends an `InventorySlot` for the same bone without an ID (decoded from a private journal). Picking up the bone then unboxed a null ID and disconnected. A unit test covers retained, changed, renewed and predicted identities. The live Lifeboat flow has not been rerun after this change.

Workbench grid routing: CubeCraft Skyblock names every player UI `InventorySlot` with the zero container name and no dynamic ID. A private journal shows container 124 slots 32 to 40 with that name right after the workbench opens and again after its close request. Those slots reached Java menu 0 as raw slots 32 to 40 and cleared hotbar slots 0 to 4 until the next full update. The zero name now counts as unnamed, an open table takes the grid slot and resends its contents with a recomputed output, and a closed grid sends no Java packet. `WorkbenchGridSlotPacketTest` feeds the captured wire form and fails without the change. An installed protocol-2225 add-on check retains all five existing stacks through opening and closing the table. Manual log-to-plank, stick and shovel crafts retain the expected leftovers, and the server advances the shovel quest from 50% to 75%. This is a translated-client gameplay check; the earlier native control crafted a pickaxe. A player UI `InventoryContent` carrying grid stacks while a table is open still updates only the player UI copy; no capture shows one.

Variable-size containers: a generic actor container with positive `CONTAINER_SIZE` up to 1024 keeps every slot. Standard 27/54-slot sizes retain their existing families. Other sizes use enough Java chest rows for the visible prefix, capped at 54 slots, so a client without the native presentation keeps ordinary controls for those slots. A partial final row is padded with empty items, and its extra cells have no native slot. Updates above the visible prefix change only the logical items. Count-one actions keep the full source slot. The official 1.26.60.5 Set Favourite click on EggWars shop slot 487 sent `ItemStackRequest` -3, Place 1 from `LevelEntityContainer` slot byte 231 with stack ID 2 to `CombinedHotbarAndInventoryContainer` slot 0, and received Success. `LogicalContainerActionTest` plans that click from a nine-wide grid cell at [1,54] while slot 231 holds another stack with ID 2: the prediction changes slot 487 only, and the encoded request equals the captured bytes. A response byte shared by several logical slots resolves only to the slot that the request changed. `NativeContainerOpeningPacketTest` opens a 549-slot actor container and checks the 9x6 Java menu, the empty reset, all 549 changed slots, and a later slot-487 delta. The captured response reported only the cursor, so a server echo of a high source slot is unobserved. Paid purchases and the live 126-slot quest menu have not been exercised with this client.

Actor-owned menu replacement: the official 1.26.60.5 Skyblock Quest transition removes the Home menu's actor before its close acknowledgement and the new Quest open. The client now closes only the current menu owned by that actor, preserving pending item-action settlement and the existing close acknowledgement. Regressions cover unrelated actors, unsigned window ID 200, late acknowledgements and a replacement menu. A private diagnostic build replays the exact captured sequence: the stale Home rejection disappears and the new Quest title opens. That diagnostic still uses the old 27-slot contents path; combined logical-inventory and live validation remain separate.

REA-backed protocol-2225 response controls: a successful durability correction updates the item's IntTag Damage, treating an absent tag as zero and leaving equal values untouched. An unchanged stack network ID still accepts the correction; newer authoritative item metadata keeps its durability. Response-boundary regressions cover both cases. Named chest minecarts now use their actor name, while unnamed carts retain `container.minecart`. These changes have fixture and packet tests, with no new installed-client inventory run.

Requested/actual response slots now have separate roles: the requested slot selects the retained prototype and the actual slot selects the destination. An installed 1.26.60.5 loopback receiver control changes only the actual-slot byte of a real success response, and native equipment confirms the requested pickaxe at the remapped destination. A redirected optimistic prediction retires unless another row reports that slot. Boundary tests cover duplicate network IDs, exchanged slots, newer authoritative target metadata and an earlier opening with the same window ID. The final built add-on repeats that receiver control and reports the same pickaxe as native from the actual destination. Natural BDS remapping is unobserved; this is a supplied receiver control.

A fresh protocol-2225 CubeCraft Profile capture advertises 36 slots on its armor-stand owner and sends 36 items. The previous 55-slot lower bound left a 27-slot model and rejected those contents, producing an empty generic chest. Packet-to-presentation regressions now retain the metadata size, select a four-row Java menu and preserve the last native item; a partial-row case rejects padded cells. The same compiled opening regression rejects the saved baseline core and passes against the corrected classes. The full stack builds. The new native public-server attempts fail before joining, so this evidence does not establish current native visual parity or resolve the separate inventory-lag report.
