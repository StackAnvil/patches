# feat(movement): send completed local physics to ViaBedrock

## Purpose

Send the local player's position, predicted motion and swimming state after sendChanges and before Java CLIENT_TICK_END. Use the negotiated, versioned core channel on direct connections and ViaProxy. A stationary player still sends a fresh sample, so fluid gravity and pose transitions do not depend on Java's sparse position updates.

## Design constraints

Publish completed local physics once per client frame with matching context. Keep correction replay, item state, motion commands, teleport filtering, and actor ownership aligned with core.

Prerequisites:

- viabedrock/0092-retain-completed-client-prediction-frames.patch: Publish completed prediction, movement-effect history context and component replay before client frame integration.

- viabedrock/0103-honor-native-ability-layer-priority.patch: Apply native game-type transitions to historical Base and Spectator layers while preserving higher ability owners.

- viafabricplus-bedrock/0008-share-native-actor-and-resource-runtime.patch: Share cached native item definition identity for local use cycles.

## Validation and remaining limits

Regression coverage includes `BedrockPhysicalMotionLifecycleTest`, `BedrockPlayerModesTest`, `BedrockVehiclePredictionsTest`, `VehiclePredictionPayloadTest`.

Water physics and player FOV share the native swim multiplier from the retained movement-effect timeline. Original 1.26.60.5 Dolphin Boost kernel controls include a zero-duration marker, which a duration-only query omits. Existing replay scope selects historical values without a second timer. Dynamic world comparisons at boost expiry remain open.

Historical mode queries use the local player's recorded mode on both the movement controller and the entity. Java 26.3 entity predicates otherwise keep reading the live profile during correction replay. Remote players retain their own profile modes, and closing the replay scope restores live queries.

A controlled protocol-2225 replay uses the existing official 1.26.60.5-derived bootstrap with declared mode transitions. A bounded installed probe queries all four historical Java modes across five live phases on direct and proxy routes. The previous client disagrees in 15 of 20 cases. The corrected client keeps local mode, Creative/Spectator predicates, and pickability aligned with the historical mode, while remote predicates and live queries after each scope remain unchanged. `BedrockPlayerModesTest` checks local ownership, remote fallback, and scope lifetime separately. These controls establish query ownership, without proving native trajectories or correction timing.

Native and live controls establish selected movement, correction, and flight behavior. Uncommon mounts, network conditions, and mixed mechanics remain open.

Fresh Bedrock 1.26.60.5 and BDS 1.26.60.6 controls cover walking and falling through Survival, Spectator, and return transitions. Native keeps larger downward motion on Spectator entry and applies flight drag; the small grounded residue clears. Java 26.3's local player-list callback instead zeros vertical motion, producing a pause on both Java routes before correction. Suppress that callback's motion write for Bedrock and keep the native boundary in `BedrockPlayerModes`. Installed direct and proxy controls check retained fall motion, the grounded boundary, and eventual landing. Both native and Java receive corrections in these controls. Packet delivery, input, camera angle, and tick phases differ, so exact trajectories and transition timing remain unverified.

Bedrock 1.26.60.5 and BDS 1.26.60.6 controls cover pearl-only, wind-only, and two pearl/wind angles.
Both current Java routes produce the expected projectiles and settle after landing.
Selected native, direct, and ViaProxy combinations also settle with 300 ms of incoming delivery delay, including combinations with held movement input.
Native packets contain movement corrections after wind impulses, so correction counts alone do not identify the reported rollback loop.
The selected moving controls place four server ticks between native uses, two on direct Java, and three through ViaProxy.
Short native input attempts do not consistently produce both throws. These controls do not establish equal trajectories or timing for individual presses.
The original persistent rollback report remains open.
The permanent `pearl-wind-charge-moving` case requires walking before either projectile moves the player.
It also requires both uses and impacts, consumption, a wind launch, and a quiet landing.
Its pearl landing must match the impact position, so walking away from the initial position cannot substitute for the teleport result.

Bedrock 1.26.60.5 and BDS 1.26.60.6 establish four stationary ten-block drops. Native, direct, and ViaProxy lose seven health on dry ground and at both partial overlaps with a solid/water boundary. A fully wet landing loses none. These controls cover fall damage with full blocks and source water. Other fluid movement and correction behavior remain separate.

The [owning patch](0025-send-completed-local-physics-to-viabedrock.patch) retains implementation rationale and versioned evidence.

Native 1.26.60.5 cancels a timed custom food cycle when the selected definition changes to an instant food.
Both definitions use the same Java paper carrier. Local use now checks the native definition before retaining or releasing the active stack.
Count and unrelated component updates preserve the use cycle for the same definition.
`BedrockUsedItemTest` covers these identity boundaries and Java fallback.

A controlled protocol-2225 comparison duplicates the latest matching inventory content immediately before item-use completion on Bedrock 1.26.60.5 and BDS 1.26.60.6.
Native completes consumption with that refresh. The previous Java client releases the cycle without consumption effects because the held stack is a different object.
Completion now uses the same native definition check as active use.
Installed direct and ViaProxy controls observe consumption effects with distinct active and held stack objects, including the final item, and settle with authoritative hunger, an empty hand, and inactive use.
The Java observer adds logging without gameplay writes. The duplicated packets are declared fixture inputs.
The [food lifecycle controls](../../viabedrock/deferred/0008-signal-sustained-bedrock-item-use.pr.md) record remaining stalls when an inventory refresh suppresses completion or acknowledgments are omitted. Native local completion, late acknowledgment across a new cycle, and the original intermittent no-feeding report remain open.
