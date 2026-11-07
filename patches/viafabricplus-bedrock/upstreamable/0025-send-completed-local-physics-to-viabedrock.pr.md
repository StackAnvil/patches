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

Later corrections compare with the latest retained state before physics, after earlier authoritative commands.
The original rewind baseline remains separate, so repeating a replay does not accumulate command effects.
The regression fails before this change when a later correction matches the original prediction and verifies restoration afterward.
Installed-client controls send two declared protocol-2225 correction packets for the same input tick through core translation, Java payload/position pairing, and physical replay.
On both direct and ViaProxy routes, the previous artifact leaves a four-block error; the fixed artifact restores the original position exactly.
A read-only client observer checks the shared target frame and the second correction's match with the original prediction.
Both routes also queue opposite corrections before one physics step, then receive a delayed correction for the preceding frame.
Retained states show that the earlier correction applies and the later pair restores the original position. The final forty completed frames stay settled.
The wire controls use synthetic server corrections; native BDS admission and native trajectories remain unverified.
This retained-state fix does not establish the cause of the reported pearl/wind rollback loop.

Owned BDS 1.26.60.6 water-boat controls cover forward movement, a server impulse, an authoritative vehicle teleport, dismount, and remount on both routes.
SDK water probes admit the fixture before mounted input.
Real vehicle corrections replace historical positions before physics while separate rewind baselines remain available.
Completed vehicle frame IDs advance, and the same vehicle returns under a fresh context epoch after dismount.
Horizontal client and server endpoints settle within 0.0001 blocks in the recorded quiet windows.
These controls use server mounting. Trajectories from the native client, horses, other seats, and adverse networks remain unverified.

Original 1.26.60.5 constructors zero paddle strength and timing state. The input callbacks retain strength and release decay.
The [versioned boat definition](https://github.com/Mojang/bedrock-samples/blob/v1.26.60.5/behavior_pack/entities/boat.json) uses buoyancy 1.0 and wave movement.
Selected native callbacks differ from Java 26.3's boat control method under supplied inputs.

Original scheduler controls place passenger input before vehicle paddle updates, then boat friction and control before buoyancy.
Rewind-kernel controls resolve the Level getter and dispatch vehicle paddle updates, boat friction, control and movement, then buoyancy gravity and float through the native replay phase.
That phase omits passenger input gathering and buoyancy timer/request construction.
The controls supply the Level's root instance and stop at system iterators. Live provider construction, entity filtering and trajectories remain unverified.

The controlled boat receives this frame's filtered input before its movement tick.
Java 26.3 normally refreshes that input during the later passenger tick.
The physical step retains one poll and lets the passenger reuse it. Replay restores the recorded value without reading live keys.
Admission requires the local controlling passenger, the same level, local vehicle authority and ownership in the current physical step.
Regression tests cover fresh boat control, passenger reuse, repeated replay and cleanup when the passenger tick is absent.
Installed BDS water-boat controls show the old client using stale input on a press and release.
The updated direct and ViaProxy clients poll before control and match the fresh filtered input in every observed complete step.
Direct correction replay restores recorded input without another keyboard poll. Both recordings finish normally on a software GPU.
These first-person controls do not verify local-avatar rendering or native boat trajectories.
Native water requests use the actor's cell and the cell above. The concrete block reader selects the secondary layer first and falls back to primary only for air.
Coupled request and layer-reader controls cover secondary water over solid blocks and secondary non-water blocks masking primary water.
The existing surface-height helper matches the original calculation for supplied depth states.

Dry-friction material reads use the merged block view, while shape and coefficient reads use primary blocks.
The on-ground component admits block friction. If the primary collision shape has a zero or reversed extent on any axis, the probe selects the primary block below.
The original block cache selects a per-state friction component, then the shared block component, then the legacy default.
Legacy component application stores `1.0F - configured friction`. The cache copies that value without another conversion.
Original NBT-to-cache controls accept a Float tag named `value`. A missing key or another tag type decodes to zero.
These controls supply component storage and unrelated properties. Live block-definition dispatch, property transport and world binding remain unverified.

The inspected client registration path places generic movement before buoyancy.
Original collision-free movement controls apply the saved movement request to the bounds even after the actor's velocity changes.
The request and the later velocity must remain separate.

Native flag setters and metadata producers preserve the three flag words in metadata order.
`LEASHED` (30) selects saved dry friction and the positive-motion branch when its version predicate permits it. The original initializer and comparison enable that branch from `1.21.90`.
`OUT_OF_CONTROL` (96) prevents the surface counter from resetting. `GLIDING` (32) does neither.

The current native world-version parser retains wildcard and `beta`, normalizes accepted suffixes, and clears invalid versions before comparison.
Under supplied registry storage, a typed world-version component takes precedence over the default. Missing, null and wrongly typed entries use the default.
Parser controls supply regex matches, allocation and memory copying. Complete native regex and wire-decoder execution remain unverified.

Two original boat initialization paths write saved leash friction of `0.91F` from `1.21.90`, otherwise `1.0F`, after native version selection.
Reinitialization replaces this value. The dry callback uses it while leashed, and water overrides it without changing the saved value.
Initialization selects between two level versions before applying its initialized wildcard fallback.
Missing buoyancy context uses an initialized invalid version instead. The private port keeps these defaults and the explicit sentinel flag separate.
Original StartGame and settings-copy fragments preserve the packet's version and generator through the native settings factory.
Constructor fragments copy the settings version into the first slot. Generator zero sets the second slot to `1.17.40`; other generators use wildcard.
The world-setup fragment publishes the selected version through the concrete Level getter into the typed buoyancy component.
The compiled private port matches these fragments and composed native motion across 378 controls. Focused tests retain the generator limit and preserve the coefficient across rewind.
Whole native world and actor lifecycles and normal tick integration remain outside these controls.

The version-6 native world reset carries the original `StartGame` version text and signed generator ID through the level-bound block mirror.
Movement consumers can read both fields from `worldSettings()` without using resource cutoffs or client protocol versions.
The [core transport controls](../../viabedrock/upstreamable/0092-retain-completed-client-prediction-frames.pr.md) cover installed version-6 metadata and dictionary replacement across dimensions.

Native frames own a concrete snapshot. Buoyancy capture retains configuration, the double-valued phase and independent copies of liquid selectors. Restore also recovers recorded float-request flags. A separate visitor saves and restores the vehicle input component.
General component history separately retains boat movement, paddle and buoyancy state. Original frame-producer and callback-list controls exercise this capture path with supplied ECS views.
Refreshing that history clears saved presence bits before recapture. Restore preserves live components absent from the saved state.
Under supplied ECS storage, the native lending kernel moves the player's replay ownership to a connected vehicle when the rider reference resolves in the same registry generation, clearing the old history. An unresolved reference creates fresh vehicle history.
Rewind controls start at the first marked frame, run it and later retained frames, then clear replay markers. Active rider selection, populated-history lifetime and correction-packet admission remain unverified.

Original Level construction publishes one random generator through a root component. Actor reference components resolve that shared generator within the registry generation.
Coupled controls execute the original publication, reference producers, component storage, timer initialization, view membership, reference resolution and random draws.
Two actors and an intervening consumer advance one continuous stream in both provider configurations across five supplied seeds.
Ninety timer calls cover shared consumption, bobbing, mismatched generations, missing source components and missing movement markers.
These controls supply registry allocation, context fields, motion inputs and the thread-local seed draw. Full world construction and live seed initialization remain unverified.

Eight original position-request controls construct actor bounds with float arithmetic after subtracting the vertical offset from the position.
Reset and state/motion requests produce equal bounds while retaining their separate motion behavior.
Original boat initialization writes a 0.375 vertical offset and rebuilds bounds after scaled size updates.
Coupled metadata and size controls support the [shared physical dimension calculation](../../viabedrock/upstreamable/0064-evaluate-named-actor-properties.pr.md#validation-and-remaining-limits).
Full Level and actor construction, initialization dispatch, request production and tick integration remain unverified.

The add-on retains Java boat motion. Native motion phases, complete block-friction inputs, live random consumers, full scheduling and matching trajectories remain open.

Native and live controls establish selected movement, correction, and flight behavior. Uncommon mounts, network conditions, and mixed mechanics remain open.

Fresh Bedrock 1.26.60.5 and BDS 1.26.60.6 controls cover walking and falling through Survival, Spectator, and return transitions. Native keeps larger downward motion on Spectator entry and applies flight drag; the small grounded residue clears. Java 26.3's local player-list callback instead zeros vertical motion, producing a pause on both Java routes before correction. Suppress that callback's motion write for Bedrock and keep the native boundary in `BedrockPlayerModes`. Installed direct and proxy controls check retained fall motion, the grounded boundary, and eventual landing. Both native and Java receive corrections in these controls. Packet delivery, input, camera angle, and tick phases differ, so exact trajectories and transition timing remain unverified.

Bedrock 1.26.60.5 and BDS 1.26.60.6 controls cover pearl-only, wind-only, and two pearl/wind angles.
Both current Java routes produce the expected projectiles and settle after landing.
Selected native, direct, and ViaProxy combinations also settle with 300 ms of incoming delivery delay, including combinations with held movement input.
Native packets contain movement corrections after wind impulses, so correction counts alone do not identify the reported rollback loop.
The selected moving controls place four server ticks between native uses, two on direct Java, and three through ViaProxy.
Short native input attempts do not consistently produce both throws.
Native local-world and callback controls establish the admission and continuation rules for a [local projectile input correction](0038-predict-held-trapdoor-placement.pr.md#evidence-and-validation). Installed direct and proxy controls cover its selected hold routes. A cooldown-release inventory discrepancy remains open in that owner.
These controls do not establish equal trajectories or complete timing for individual presses.
Read-only server controls identify wind-charge projectiles as targets in selected pearl entity impacts.
An ordered outgoing packet burst admits both uses in the same server tick while both projectiles hit blocks and settle; matching server tick spacing does not establish the earlier origin-height collision path.
Direct and ViaProxy controls also settle after ordered pauses of 600 ms, 2 s, and 4 s in incoming packets.
Qualifying cases include held walking input, a pearl teleport, and a wind launch. Cases without a launch are excluded.
Queued packets, including corrections, retain their bytes and order in the independent client recordings.
These controls do not establish native timing or trajectory parity.
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

Local automatic use now completes when its countdown reaches zero.
Bedrock 1.26.60.5 traces show local completion before server authority, plus a separate tick system that reconciles the using-item flag.
The client applies both paths and keeps inventory counts and replacement items server-owned.
Native predicts hunger during the local cycle. Server attributes later reconcile that prediction.
Translated completion acknowledgments do not end the local cycle, so a late acknowledgment cannot finish a newer same-item use.
Matching inventory refreshes retain the existing native definition check.

Installed direct and ViaProxy controls consume two breads with an empty inventory refresh or suppressed completion acknowledgments.
Both routes also consume two breads when acknowledgments arrive one second late, during the next use cycle.
Early release consumes nothing. The final bread leaves an empty hand, and zero-duration custom food retains server-owned counts.
A four-second pause of all server updates also preserves local hunger prediction and repeated use attempts before the inventory update arrives.
Both routes settle at the server count and hunger after the flush.
The observer records unchanged item counts across local completion. Completed physics samples contain no active zero-counter use.
These controls use declared relay mutations and an observer that adds logging without gameplay writes.

Correction replay reads recorded food eligibility for movement and preserves the live hunger value, including meals predicted after a recorded frame.
The focused regression repeats historical sprint checks after two later meals.
Matched native, direct, and ViaProxy controls cover walking, moving consumption, the final item, and an ordered 300 ms delay of server updates.
Native also receives corrections at use transitions, so correction counts alone do not establish a client defect.
The installed Java controls preserve hunger, saturation, use state, countdown, and item counts across actual resimulation without repeating consumption callbacks.
Correction counts and endpoint distances still differ between routes. These controls establish hunger ownership, not complete trajectory parity.

Native 1.26.60.5 traces place the countdown decrement and completion after the frame's slowed movement.
Retain the early item-identity check and tick the active stack after movement.
The recorded moving-food controls check the final slowed frame, local completion, and correction replay.
Native also completes active use through a server inventory `Use` transaction.
Selective omissions distinguish that callback from packet 142.
A separate negotiated notification now stops the current use cycle without local consumption effects.
Native predicts hunger through feedback before local completion. The server callback skips that feedback.
An attribute-omission control leaves five hunger and seven bread after local completion and a server callback during the next cycle.

Release packaging remains unverified because the other five native shaping libraries are unavailable locally.
The broader animation, movement timing, consumable effects, and original intermittent no-feeding report remain open.
See the [food admission evidence](../../viabedrock/deferred/0008-signal-sustained-bedrock-item-use.pr.md) for core behavior and its limits.
