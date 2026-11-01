# Retain server-confirmed difficulty

Forward valid Java difficulty requests to Bedrock and retain the server's current difficulty in connection state.
Initial `StartGame` data and later `SET_DIFFICULTY` packets update that state.
A Java menu request leaves the retained value unchanged until the server confirms it.

Food admission needs current difficulty because native Bedrock permits ordinary food at full hunger on Peaceful.
Official Bedrock 1.26.60.5/BDS 1.26.60.6 controls on protocol 2225 establish this boundary with bread.
Normal refuses use, a live switch to Peaceful permits one consumption, and a switch back to Normal restores refusal.

The packet regression covers server confirmations, forwarded Java fields, valid requests awaiting confirmation, and invalid Java input.
The [food-use context](../deferred/0008-signal-sustained-bedrock-item-use.pr.md) describes the consumer and its remaining limits.
