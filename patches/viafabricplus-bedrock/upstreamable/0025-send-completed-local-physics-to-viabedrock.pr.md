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

Native and live controls establish selected movement, correction, and flight behavior. Uncommon mounts, network conditions, and mixed mechanics remain open.

Bedrock 1.26.60.5 and BDS 1.26.60.6 controls cover pearl-only, wind-only, and two pearl/wind angles.
Both current Java routes produce the expected projectiles and settle after landing.
Two ViaProxy combinations also settle with 300 ms of inbound Java-channel delay.
Native packets contain movement corrections after wind impulses, so correction counts alone do not identify the reported rollback loop.
These controls use physical 150 ms presses. The proxy combinations place five or six server ticks between uses.
They do not establish identical trajectories, faster combinations, movement during throws, or resolution of the original persistent rollback report.

Bedrock 1.26.60.5 and BDS 1.26.60.6 establish four stationary ten-block drops. Native, direct, and ViaProxy lose seven health on dry ground and at both partial overlaps with a solid/water boundary. A fully wet landing loses none. These controls cover fall damage with full blocks and source water. Other fluid movement and correction behavior remain separate.

The [owning patch](0025-send-completed-local-physics-to-viabedrock.patch) retains implementation rationale and versioned evidence.

Native 1.26.60.5 cancels a timed custom food cycle when the selected definition changes to an instant food.
Both definitions use the same Java paper carrier. Local use now checks the native definition before retaining or releasing the active stack.
Count and unrelated component updates preserve the use cycle for the same definition.
`BedrockUsedItemTest` covers these identity boundaries and Java fallback.
