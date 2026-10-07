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

The complete 97-patch core stack replays and builds successfully.
Checkstyle passes, with 768 tests, 19 optional skips, and no failures.

## Fishing bite motion

For fishing hooks, native event 13 now sends `viabedrock:fishing_bite_v1` to clients that advertise this capability.
Core decodes the event, checks the actor type, and supplies the resolved Java entity ID and spawn UUID.
The bounded codec rejects unsupported versions, the wrong protocol, invalid IDs, oversized messages, and trailing data.
The client applies the impulse to its current hook motion.
A standard Java packet cannot express that additive operation without replacing an unknown local velocity.

The matching Windows client function `0x14205a350` adds `-0.5F` to vertical motion and preserves horizontal motion.
The production helper matches all 108 native impulse cases bit for bit.
Targeted tests cover the codec and float rounding.
This handler does not start an assumed Java biting timer.
Audio, particles, later hook physics, ordinary Java feedback, and complete visible parity remain requirements.

Genuine strict BDS casts verify this capability on direct and ViaProxy connections.
The client observer records the exact float update and unchanged horizontal motion for the same hook lifetime.
Three invalid-message controls per route leave motion unchanged.

## Fishing splash and shared sound arguments

Bite event 13 also sends splash feedback through standard Java sound packets.
This path works without the motion capability.
It follows the motion message when that capability is present.
The existing shared actor sound method now suppresses silent actors and preserves the full actor identity and baby flag.
Its data argument is `-1`, so missing block data cannot select palette index zero.
Existing hurt and death callers retain the same method.

Seventy-two cases execute the native sound helper and actor identifier constructor for build 51061372, protocol 2193.
The native flag lookup and baby accessor execute unchanged.
Provider boundaries supply actor definition and unique identity getters and record the final sound call.
The cases cover silent bit 17, neighboring bits, baby bit 11, four signed identities, and three actor positions.
The production test uses the same combinations and verifies packet arguments and suppression.

The adjacent fixed [sound enum](https://github.com/LiteLDev/LeviLamina/blob/455c4181b5f83d04689957e8aad17790581c0fc0/src/mc/deps/shared_types/legacy/LevelSoundEvent.h) identifies Splash as 26.
The native executable verifies that argument.
ViaBedrock retains its existing `random.splash` mapping, with volume `0.25` and pitch from `0.6` to `1.4` for fishing hooks.
Native sample selection, audible output, captions, later hook physics, and complete particle behavior remain requirements.

Fresh strict BDS runs verify the splash packet and resolved sound-engine request with direct and ViaProxy add-on clients.
A stock Java client through ViaProxy verifies the same path, with no Fabric, VFP, add-on, or recorder mod.
The normal resource-pack prompt is accepted before that client joins.
One bite splash per route uses volume `0.25`, matching packet and engine positions and pitch, player category, and no looping or delay.
The engine resolves Java liquid splash samples. Master volume remains zero, so native audible and caption parity remain unverified.
Packet position quantization and native local hook position also remain comparison requirements.

Real early-reel, bite-reel, and cow retrieval controls pass on all three routes.
Actual hook metadata attaches to the cow. All nine hooks disappear and clear the local fishing pointers.
All recorders exit successfully, and the owned BDS stops.
The first engine observer queried an unresolved sound instance and supplies no positive engine evidence.
The corrected observer records after the original method returns, without changing gameplay arguments.
