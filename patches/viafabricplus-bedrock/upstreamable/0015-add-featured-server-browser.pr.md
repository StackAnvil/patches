# Featured and creator server browser

Show the live Gatherings catalog with server details, artwork, status, and hosted experience resolution.
Use the existing Bedrock connection path for the advertised transport.

Hosted Xbox JSON-RPC joins read `netherNetId` instead of requiring an IP address and port.
Keep the network ID unchanged when selecting Xbox JSON-RPC signaling.
HTTP NetherNet joins use the signaling host and port. Socket joins retain their advertised port.
Every catalog selection resolves its current destination through Gatherings, including entries with static display addresses.
The captured current Dimension Clash response passes this parser. Regression cases cover both destination types and missing network IDs.
A fresh browser join reaches SoulSteel pack negotiation over Xbox JSON-RPC. The transport then disconnects before StartGame.
This verifies catalog resolution and initial admission. SoulSteel gameplay remains unverified.
The current Mineville response selects HTTP NetherNet. Its RakNet endpoint times out before any game packet.
A live add-on recording through that HTTP destination reaches a visible lobby and completes its scene.
The browser transport choice has targeted parser coverage. Full native appearance remains unverified.

Keep raw service responses, server endpoints, account data, and captures private.
