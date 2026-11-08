# Native air-use prediction

Preserve native legacy consumption envelopes for immediate pearl and wind-charge use. Queue flight rockets behind their establishing movement frame. Keep inventory prediction separate from held input ownership.

The add-on reports actual local stack consumption before the concluding Java use packet. Core pairs that report with the Java sequence and declares a debit only when local prediction consumed the item. A cooldown-refused request still sends air use, with omitted descriptor network IDs, but carries no inventory action or legacy slot declaration. A mismatched report cannot affect a later use.

Original Bedrock 1.26.60.5 client controls establish this distinction across eleven GameMode calls. Successful pearl callbacks record four-to-three and three-to-two actions. Cooldown-refused callbacks dispatch without inventory actions. These controls use an owned local world and do not establish current native network or trajectory parity.

Java 26.3 still sends a use packet when its local cooldown skips consumption. A declared debit can be accepted by BDS without a quantity response, leaving Java with a stale count. Core publishes each immediate declared debit to Java and preserves the local stack identity. Clients without the optional consumption report retain this fallback. Rejected retries on that fallback can briefly lower the Java count before authority restores it.

A complete protocol-2225 baseline reproduces two pearls on BDS and three on Java after a declared 450 ms incoming delay. With the consumption report, the second request carries no predicted debit. BDS accepts that use and supplies an authoritative count of two. The delay changes delivery timing only; complete peer and client journals retain packet bytes and order.

Rebuilt direct and ViaProxy clients each complete nine controls in a 210-second recording against BDS 1.26.60.6. The controls cover delayed acceptance, rejected retries, held and fresh hotbar transitions, final pearl and wind-charge removal, and food/block transitions. All selected held-item counts match BDS after settlement, and both routes settle at the server position. Installed receipts identify the diagnostic add-on and full proxy build. The diagnostic retains unrelated private presentation work. All 39 item-input classes match the separately rebuilt exported add-on, and all 1,692 embedded core classes match the tested core.

Full local builds pass 2,157 core tests, 1,416 exported add-on tests, and four proxy tests, with 176 core and 154 add-on skips. The add-on run includes five software font GPU checks. Both complete patch stacks replay to the tested source trees. The refused-prediction regression verifies an empty action envelope, no Java quantity publication, and an unchanged legacy counter before the next successful debit. `ThrowablePredictionPacketTest` retains encoded Java quantities and final-stack removal for the fallback.

Exact physical input timing, current native networking, broader item families, and complete inventory parity remain unverified. The original persistent rollback report remains open.
