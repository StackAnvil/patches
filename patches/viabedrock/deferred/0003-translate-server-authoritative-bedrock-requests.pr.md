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

Scoped manual crafting batches reuse ordered prediction and response reconciliation. Native-shaped regressions cover reordered responses, rejection of a later craft, whole-batch rejection, and refusal of unrelated operations. Complete native response-manager behavior, live transactions, and every container remain unfinished.

Installed direct and ViaProxy checks accept bundle insertion, extraction, and reinsertion requests and retain the contents after reopening.
See the [inventory reference](../../../docs/native-player-inventory.md) for the control path and remaining native comparison limit.

Sparse bundles retain every nonempty entry in newest-first Java display order.
Selection and requests map back to occupied physical slots. Extraction skips holes; insertion reclaims them when the last slot is occupied.
Bedrock 1.26.60.5 layout and cell-lookup controls establish filtering and source order.
Regressions cover translation, selection, extraction, full-span insertion, and merging across gaps.
Transfers reject missing network IDs before changing predicted items or selection, including IDs needed by later swaps and compaction moves.
The new sparse request sequences still need installed server controls and a matching native capture.

The [owning patch](0003-translate-server-authoritative-bedrock-requests.patch) retains implementation rationale and versioned evidence.
