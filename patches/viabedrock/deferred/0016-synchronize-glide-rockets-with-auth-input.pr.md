# Native air-use prediction

Preserve native legacy consumption envelopes for immediate pearl and wind-charge use. Queue flight rockets behind their establishing movement frame. Keep inventory prediction separate from held input ownership.

Core commits an immediate declared debit after sending the transaction and preserves the local stack identity. It also publishes the resulting Java slot quantity. Java can send a use request while its cooldown skips local item consumption. BDS can accept the declared prediction without another quantity update, so core must deliver that prediction to Java.

A complete protocol-2225 recording against BDS 1.26.60.6 captures a declared debit from three pearls to two. BDS accepts it and starts another cooldown. No quantity update follows during ten seconds of settlement, while the Java client retains three pearls.

`ThrowablePredictionPacketTest` reproduces the missing publication before the correction. It verifies the encoded Java hotbar quantity and final-stack removal. Existing transaction regressions retain descriptor identity, hotbar selection, repeated consumption, and send-before-debit ordering.

Matching installed direct and ViaProxy retests of the quantity publication remain pending. The original persistent rollback report, exact cooldown/release timing, and complete native inventory parity remain open.
