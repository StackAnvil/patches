
## Recovery refresh

Legacy offhand and cursor transfers now request full inventory snapshots when their response timeout starts recovery.
They use the shared `InventoryMismatch` transaction after reopening the inventory.
The recovery barrier still requires fresh cursor and equipment state before it clears the pending transfer.
The complete core build passes with 557 passing tests and five optional skips, including the legacy transfer and recovery tests.


Native authored menu actions also respect pending legacy offhand and cursor ownership.
The control channel rejects activation during recovery and permits deactivation at all times.
The packet test checks rejected activation status and prevents a transfer from reaching the menu backend while an offhand transfer is pending.
