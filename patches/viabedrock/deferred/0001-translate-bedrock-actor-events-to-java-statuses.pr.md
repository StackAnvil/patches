# Translate actor events with target wire IDs

## Behavior

Core forwards supported actor feedback through standard Java status packets.
It preserves the upstream sparse Bedrock enum values.
The previous patch replaced those values with sequential protocol-documentation values, which sent the wrong Java effect or discarded valid events.
This revision removes that enum rewrite and updates the raw-ID tests.

## Evidence

The isolated official BDS is **1.26.51.1**, build **51061372**, protocol **2193**.
A controlled crossbow load emits charge-complete event **74**.
A fired rocket and a summoned rocket both emit explosion event **25**, followed by removal.
The matching native Windows rocket function `0x143346100` also emits `0x19`.
Its executable SHA-256 is `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`.
Raw packets, logs, and proprietary instructions remain private.

[Mojang’s target packet page](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/actor-event-packet/) lists different, sequential enum values.
Those values contradict the target wire probe and native code.
[Gophertunnel’s actor-event constants](https://github.com/Sandertv/gophertunnel/blob/master/minecraft/protocol/packet/actor_event.go) independently retain the sparse values.
This comparison supports the restored upstream table; the target observations establish the sampled events.

## Verification and limits

Raw-ID tests cover rocket explosion, witch magic, feeding, totem activation, charging, grass eating, death, and vibration.
These checks prevent a name-based switch test from concealing incorrect numeric decoding.
Not every actor event has a Java translation.
Complete event data, position overrides, unsupported effects, and live visual comparisons remain requirements.

The complete 95-patch core stack replays and builds successfully.
Checkstyle passes, with 683 tests passing, 19 optional skips, and no failures.
