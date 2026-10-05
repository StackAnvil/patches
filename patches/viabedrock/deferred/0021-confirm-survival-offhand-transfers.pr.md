
## Recovery refresh

Legacy offhand and cursor transfers now request full inventory snapshots when their response timeout starts recovery.
They use the shared `InventoryMismatch` transaction after reopening the inventory.
The recovery barrier still requires fresh cursor and equipment state before it clears the pending transfer.
The complete core build passes with 557 passing tests and five optional skips, including the legacy transfer and recovery tests.
