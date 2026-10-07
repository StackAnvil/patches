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

## Fishing particle dispatch

Core retains the native surface floor, width vector, and ordered effect list.
Clients without the bite capability receive both existing Java wake mappings through standard particle packets.
The null hook-particle mapping remains unsupported on ordinary Java clients.
The add-on samples its current hook box because core cannot know intervening client motion.
It uses the shared calculations and emits one hook effect and two separate wake effects.

Native legacy particle 27 forwards to the named water-wake effect with `variable.direction`.
The matching client-level and particle-provider tables establish this route.
Fifteen bounded cases execute that forwarding branch and retain its position and vector arguments.
Molang storage, vector construction, hashed-string construction, and dispatch are supplied recording boundaries.
The whole emitter entry, TLS setup, asset lookup, and particle simulation are outside this fixture.
Thirty production surface/width combinations cover negative fractional heights and the unnormalized float vector.
The existing ninety native bite-handler cases establish the same arithmetic.

The adjacent fixed [particle enum](https://github.com/LiteLDev/LeviLamina/blob/455c4181b5f83d04689957e8aad17790581c0fc0/src/mc/comprehensive/ParticleType.h) names value 27 WaterWake.
The pinned executable establishes the actual numeric dispatch and forwarding behavior.
A further 240 native boundary cases execute the legacy distance gate with supplied provider getters.
They cover chunk counts, quality values, global range, and the adjacent float values at each squared-distance threshold.
Native settings defaults and their client mapping remain unverified; production does not yet reproduce this configured gate.
Later simulation, audio/particle timing, and full visible comparisons remain required.
Core fallback positions use retained server coordinates and Java particle limits.
They do not establish native local-position or appearance parity.

The first private particle observer failed bytecode verification before rod input.
A later observer recorded requests but could not read the package-private emitter origin.
Corrected observers supply the fresh startup evidence; the failed probes provide no positive startup proof.

## Live particle verification

Fresh strict BDS runs on Linux verify direct/add-on, ViaProxy/add-on, and ViaProxy/ordinary Java.
Both add-ons start one hook effect and two wake effects on the render thread.
Each uses the sampled integral surface and direction `(6, 0, 0.25)`.
The stock Java profile has no mods and receives two standard fishing wake packets.
Each route verifies early reeling, a native bite reward in server inventory, cow retrieval, and durability changes 0, 1, and 3.
All nine hooks disappear and clear the local fishing pointer; actual cow attachment metadata remains verified.
The existing splash packet and resolved engine requests also pass.
Direct and ViaProxy splash callbacks now reach the render thread in about 15 and 28 ms in these runs.
Native visible particles, displayed rewards, configured distance settings, and complete fishing behavior remain required.
The private fixture is restored, the owned BDS instances stop, and both user-owned servers remain unchanged.
