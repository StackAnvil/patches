# Native air-use prediction

Preserve native legacy consumption envelopes for immediate pearl and wind-charge use. Queue flight rockets behind their establishing movement frame. Keep inventory prediction separate from held input ownership.

Core commits an immediate declared debit after sending the transaction and preserves the local stack identity. It also publishes the resulting Java slot quantity. Java can send a use request while its cooldown skips local item consumption. BDS can accept the declared prediction without another quantity update, so core must deliver that prediction to Java.

A complete protocol-2225 recording against BDS 1.26.60.6 captures a declared debit from three pearls to two. BDS accepts it and starts another cooldown. No quantity update follows during ten seconds of settlement, while the Java client retains three pearls.

`ThrowablePredictionPacketTest` reproduces the missing publication before the correction. It verifies the encoded Java hotbar quantity and final-stack removal. Existing transaction regressions retain descriptor identity, hotbar selection, repeated consumption, and send-before-debit ordering.

Rebuilt direct and ViaProxy clients each complete thirteen installed controls in a 300-second recording against BDS 1.26.60.6. The controls cover four cooldown-release durations, rejected retries, final pearl and wind-charge removal, hotbar switches, and food/block transitions. All selected held-item counts match BDS after settlement. Both routes also settle at the server position.

Both 650-millisecond release controls accept a second pearl and retain two pearls on Java and BDS. Complete packet journals contain no server quantity update during the following ten seconds. Installed artifact receipts identify the corrected add-on and full proxy build. All 1,690 core classes in the proxy match the tested core.

Read-only client observations retain cooldown state and item counts. Rejected retries briefly lower the Java count before authoritative restoration. Official-client rejection presentation and exact item-use timing remain unverified. The original persistent rollback report and complete native inventory parity remain open.
