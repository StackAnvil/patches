
## Recovery refresh

Legacy offhand and cursor transfers now request full inventory snapshots when their response timeout starts recovery.
They use the shared `InventoryMismatch` transaction after reopening the inventory.
The recovery barrier still requires fresh cursor and equipment state before it clears the pending transfer.
The complete core build passes with 557 passing tests and five optional skips, including the legacy transfer and recovery tests.


Native authored menu actions also respect pending legacy offhand and cursor ownership.
The control channel rejects activation during recovery and permits deactivation at all times.
The packet test checks rejected activation status and prevents a transfer from reaching the menu backend while an offhand transfer is pending.

## Shared native provider admission

Validate incoming offhand permission and source removal before reserving legacy pending ownership or sending a transaction.
Refuse unsupported items, empty-slot overcapacity and typed slot-locked removal through the shared container policies.
Resynchronize Java contents and consume refused clicks without ordinary prediction fallthrough.
Incoming slot locks remain permitted; inventory locks still permit removal.
Admitted actions retain the existing server-content confirmation barrier.

Three adapter tests use real definition metadata and container policies with transport mocks.
They verify unchanged source/cursor state, refusal before pending ownership and admitted transaction contents.
They do not establish live client-authoritative server acceptance or delayed recovery.
