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

Active Bedrock worlds now process queued client packets after the whole client-tick group and before render extraction. A version-matched native receive/task control follows 319 packet handoffs and three supplied corrections: each command reaches its typed handler after the outgoing group in the same task invocation. The add-on baseline pumps before catch-up physics and applies each command between two ticks of that group. The frame integration moves the existing drain within the same requested frame. Login and Java sessions keep the original call. It adds no fixed tick delay or per-physics pump.

Three catch-up controls verify one packet drain after completed local physics in every observed group. All nine supplied corrections apply in the following group, with zero motion at application and 956 exact completed-prediction packet joins. All eleven observed method identities match the shipped artifacts, and the observers restore their breakpoints with no read faults or cleanup errors. The full stack builds with its tests and Checkstyle.

A separate installed control verifies the empty-loop boundary: 1,559 groups contain no local physical step and 312 contain one. Every complete group still drains exactly once after its last local physical completion. Six guarded methods and the journal clock restore with no read faults or cleanup errors. One final limiter entry has no observed return and is excluded from complete-group claims. The requested 120-FPS cap is observed at the actual limiter call; the timer-pulse median is 8.333151 ms. This uses breakpoints and Flight Recorder, so uninstrumented throughput and native high-FPS parity remain unverified.

All three selected corrections arrive during empty groups at the current input clock. Each waits through capture of the following physical frame, then applies before the next frame completes. Re-hashed native 1.26.60.5 equality evidence has the same capture-then-rewind order. This is eligibility agreement, not a universal packet or render-frame delay. The earlier catch-up controls do not distinguish those individual physical steps.

The experimental kiosk shell repeatedly forces fullscreen while the Java 26.3 client requests windowed mode. Flight Recorder samples its main thread in repeated SDL window resizing; a desktop-shell repeat preserves windowed mode and permits the fast-frame control. No production movement code changes for this lab condition. Packet offsets still depend on arrival phase; native receive-budget parity, Java/login runtime fallback, input producer/consumer lifetimes and external-server mining remain open.

Regression coverage includes `BedrockAirMovementTest`, `BedrockPhysicalMotionLifecycleTest`, `BedrockPlayerModesTest`, `BedrockVehiclePredictionsTest`, `VehiclePredictionPayloadTest`.

Ordinary local ground and air movement defers Java's early motion cutoff, then applies the shared native per-axis cutoff after collision and before friction. Small horizontal impulses survive below Java's 0.003 threshold, and nonzero collision-resolved displacement survives Java's separate squared-length gate. Vertical motion stays separate. Original 1.26.60.5 friction instructions and captured wind-charge drift establish the boundary. Camera, connection and passenger gates remain explicit, and flight retains its separate finish stage. Liquids and gliding remain outside this ordinary-air binding. Installed direct and ViaProxy controls retain the small motion and actual horizontal steps through the cutoff, then settle with matching server positions and inventory counts. These controls do not establish sub-cutoff displacement or complete collision and trajectory parity.

Ground, air and water acceleration share `BedrockMoveRelative`. The original 1.26.60.5 ground/air helper at `0x1484c0920` and water helper at `0x14ce65600` use float squares in `z*z + (x*x + y*y)` order, a `1e-4` cutoff that admits equality, normalization only above length one, and float scaling before rotation and motion addition. Ground/air admission keeps its existing controlled-player gate. The water-speed branch uses the same arithmetic after selecting native acceleration; its damping and fallback remain unchanged. Java sessions retain their existing calls.

A typed local-player write probe identifies all 284 changed position/motion stores in the shallow-water control, including 35 water-acceleration stores. Every observed store maps to matching original and installed instructions. An independent repository-owned original-instruction control reproduces those 35 forward writes from supplied input `(0,0,0.98)`, speed `0.02`, entering forward motion and captured CRT return floats. At the same entering motion, Java's double product/add path differs on 15 cases before damping. The water regression retains one observed forward rounding boundary through the damping operation. `BedrockMoveRelativeTest` retains the cutoff, normalization, rotation and float-addition cases; `BedrockAirMovementTest` covers the collision cutoff separately.

The instruction control supplies normal-rounding MXCSR and captured CRT return floats. It does not execute Windows CRT, input production or the scheduler, so arbitrary-angle CRT bit parity remains unverified. The installed shallow-water fix matches native forward and vertical motion on all 80 selected input frames; the previous artifact differs on 32 of the 79 common forward frames. Both clients detect water after movement at entry offset 10 and use wet physics from offset 11. These controls do not establish current, effect or mount behavior.

Matched Bedrock 1.26.60.5 and BDS 1.26.60.6 controls now also cover two-block-deep walking, sprint-to-swim and swim-to-walk, including an upward-looking entry. The previous add-on enters swimming one input frame late and loses prior ground state during zero-vertical-motion floor swimming. It receives a prediction correction in each sprint control. Current-position head-water and breathing probes remove the entry delay. The original FinalizeMove ground rule now also applies during liquid travel, preserving its controlled-player, camera and passenger gates.

The installed fixed build matches native swim start at moving offset 10 and stop at 28 in both sprint controls, with no prediction corrections during the four matched moving-input windows or their first 16 following stationary packets. Vertical motion matches on all 318 common input frames. Forward motion matches throughout water travel and exit; five initial dry sprint frames still differ by one float ULP. Native yaw and the upward pitch are slightly quantized, and absolute collision bounds and position bits remain separate limits. All native snapshots join to their actual packet position and motion; baseline agreement after correction receipt is excluded from unassisted parity claims. Four eight-second native observers have zero read faults and verified restoration/detachment. Original client options and profiles remain unchanged.

The full build passes: core 2,595 tests and add-on 1,754 tests, with no failures; required core Checkstyle also passes. All 13 focused fluid, flight and ground regressions pass. Three complete 180-second installed recordings finish normally. Their full sessions contain 5 native, 5 baseline add-on and 3 fixed add-on correction packets; the remaining packets are outside the matched moving windows, and their causes are not established here. These are owned loopback source-water fixtures, not public-server, flow, effect, jump, mount or full swimming-parity controls. Standalone PR applicability still requires the recorded production prerequisites.

Lava sensing uses the native float-contracted body, independently of the water probe. The original 1.26.60.5 helper contracts X/Z by 0.1 and Y by 0.4, collapses inverted axes at the float midpoint, and checks floored inclusive cells. Eight original-instruction cases and the compiled Java helper agree on those boxes. The material query uses supplied floor/block retrieval in that control; its exact world receiver on the live travel path remains unobserved. Two boundary regressions cover entry/exit, water exclusion, short bodies and negative cells. Restoring the wider query makes the entry regression fail.

Climbing captures the original request at the call to Java's clamp, then retains requested X/Z and the existing native Y stages. Java rewrites its argument slot before returning, so a return hook cannot recover that request. Java still runs for fall bookkeeping. Installed ladder approach now preserves the native horizontal impulse, and releasing forward/jump reaches the native falling limit instead of retaining Java's smaller descent clamp.

Matched loopback source-lava, ladder-wall and clear-start ladder-jump controls use equal settled positions, velocity and recorded block states. The final installed build matches every compared moving Y value in these four ordinary cases. Lava forward motion retains four one-ULP differences per case; ladder horizontal motion agrees numerically but retains native positive-zero versus Java negative-zero differences. Four release Y values also differ by one or two ULPs. Neither client receives MovePlayer or prediction-correction packets during any final moving window or its first sixteen stationary packets. A separate initial-overlap jump retains its first-frame Y mismatch and is excluded from ordinary climbing claims. Native yaw, position accumulation and collision-bound arithmetic remain limits.

Five native observer windows retain 807 fault-free packet-builder snapshots with verified restoration and detachment. Early add-on recordings called the stateful `onClimbable` getter, so they are not fully passive controls. Final installed recordings replace it with a direct current-block tag observation. The full build passes with core 2,595 tests and add-on 1,757 tests, with no failures; skipped cases remain recorded. The compiled geometry helper matches the installed JAR. These controls do not establish currents, thin flowing lava, other climbable blocks, effects beyond fire resistance, mounted travel or complete fluid/position parity.

Water physics and player FOV share the native swim multiplier from the retained movement-effect timeline. Original 1.26.60.5 Dolphin Boost kernel controls include a zero-duration marker, which a duration-only query omits. Existing replay scope selects historical values without a second timer. Dynamic world comparisons at boost expiry remain open.

Historical mode queries use the local player's recorded mode on both the movement controller and the entity. Java 26.3 entity predicates otherwise keep reading the live profile during correction replay. Remote players retain their own profile modes, and closing the replay scope restores live queries.

A controlled protocol-2225 replay uses the existing official 1.26.60.5-derived bootstrap with declared mode transitions. A bounded installed probe queries all four historical Java modes across five live phases on direct and proxy routes. The previous client disagrees in 15 of 20 cases. The corrected client keeps local mode, Creative/Spectator predicates, and pickability aligned with the historical mode, while remote predicates and live queries after each scope remain unchanged. `BedrockPlayerModesTest` checks local ownership, remote fallback, and scope lifetime separately. These controls establish query ownership, without proving native trajectories or correction timing.

Clean-history corrections compare with the latest retained state before physics, after earlier authoritative commands.
The original rewind baseline remains separate, so repeating a replay does not accumulate command effects.
The regression fails before this change when a later correction matches the original prediction and verifies restoration afterward.
Installed-client controls send two declared protocol-2225 correction packets for the same input tick through core translation, Java payload/position pairing, and physical replay.
On both direct and ViaProxy routes, the previous artifact leaves a four-block error; the fixed artifact restores the original position exactly.
A read-only client observer checks the shared target frame and the second correction's match with the original prediction.
Both routes also queue opposite corrections before one physics step, then receive a delayed correction for the preceding frame.
Retained states show that the earlier correction applies and the later pair restores the original position. The final forty completed frames stay settled.
The wire controls use synthetic server corrections; native BDS admission and native trajectories remain unverified.
This retained-state fix does not establish the cause of the reported pearl/wind rollback loop.

Original 1.26.60.5 receiver and queue controls establish ordinary correction admission for both typed and cached state. Clean history discards matching historical and current-clock corrections. Historical command masks bypass later comparisons, while future commands remain queued without requesting replay. Pending current-clock commands acquire their mask when captured into history. Original frame capture and replay controls establish that a successful rewind clears the mask. Retained commands remain available for later rewinds, and normal frame completion does not set the cleared mask again. Scheduler regressions check these distinctions, later command application, and history reset. An installed direct control repeats a correction that matches retained state after a rewind. The corrected client keeps the intended position without replaying physics again. The control uses two declared protocol-2225 packets over an unchanged official-derived bootstrap; it does not establish native trajectories or the reported projectile loop. These bounded controls supply the history and controller boundary; they do not execute live controller construction or world physics.

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

Bedrock 1.26.60.5 and BDS 1.26.60.6 controls cover separate throws and pearl/wind combinations, including held movement and delayed delivery. Current native, direct and ViaProxy controls identify pearl-to-wind collisions by the server's projectile and target IDs and settle afterward. Actor creation packets resolve IDs when a spawn callback runs after movement or removal. Original packet bytes and per-direction order survive the delayed controls.

Native and Java movement-input modes and teleport acknowledgments agree in the inspected controls. Actual air-use spacing, server admission ticks, random projectile spread and contact geometry differ, so these results do not establish equal trajectories. Native packets can also contain movement corrections after wind impulses; correction counts alone do not identify the reported loop.

The [local projectile input correction](0038-predict-held-trapdoor-placement.pr.md#evidence-and-validation) retains native admission and continuation. The [cooldown inventory owner](../../viabedrock/deferred/0016-synchronize-glide-rockets-with-auth-input.pr.md) records its consumption and reconciliation controls. The original persistent rollback report remains unmatched.

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

## Sneak support, collision order, ground and near teleports

For the admitted local player: the native sneak support probe runs on the request's gathered colliders before collision; collision resolves Y, X, then Z; an exactly zero vertical request without vertical contact keeps the previous ground state; a paired near teleport keeps replay history and applies position and zero motion at its queued frame. Unit regressions use original-instruction results: eleven sneak-callback cases including the captured frame-11 edge, and the eight FinalizeMove cases. The collision order has no unit test because the selector is a mixin; its evidence is the original solver controls and the paired corner captures. A repeated installed add-on run of the research fixture (BDS 1.26.60.6, protocol 2225) has identical motion on all 29 shared moving frames and position error at most 1.2e-7 against the unchanged native sneak-edge recording, with no prediction corrections, and both signed tight corners take the native slide on the first moving frame within 5.5e-6 (native yaw quantization), also without corrections. The source-water swimming controls above also exercise ground retention; near-teleport sequences were not repeated live.

Ordinary local-player shallow overlaps now use the core native recovery path, including stationary requests and step candidates. Fresh original 1.26.60.5 controls and a live component trace establish the 0.01 per-axis policy; the existing ground/air admission gate remains. Larger overlaps and ordinary precise contacts keep their prior path. The rebuilt add-on publishes the native recovered position in the small-overlap packet comparison. The separate large-overlap push-out mechanism remains outside this change.

## Snapshot readiness during correction replay

Commands assigned to the currently open input wait until that input's ordinary physical step completes. Older corrections still replay immediately. An older suffix can refresh the open baseline without executing or discarding its deferred commands. Their comparison groups become retained at completion and clear after eligible replay.

A guarded 1.26.60.5 / protocol-2225 capture follows an actual equal-bound correction through queue return 2, an empty rewind, ownership transfer into the next snapshot, that snapshot's dirty/gate writes, accepted state and shape copies, and 321 recorded packet handoffs. The intervening input is published before application. Three installed add-on equality cases now follow that readiness order and publish the accepted result in T+2. Their motion bytes agree with native, and forward position differs by at most one float ULP. This is a logical-input boundary, with no fixed packet or render-frame delay.

`PhysicalReplayHistoryTest`, `PhysicalCorrectionSchedulingTest` and `PhysicalMotionReplayTest` cover deferral, older/open command interaction, comparison-mask lifetime, matching-correction filtering and authority replacement. The old source fails the native-order control; the changed source passes. Current full-stack validation is summarized above.

The installed controls use supplied corrections. Breakpoint/frame-pop instrumentation changes pacing. A separate run without an observer has two matching cases and one later-arrival case that retains the old trajectory at T+2, then converges at T+3. Its client-thread handling phase is unobserved, so ordinary timing parity remains open. This repair does not establish the cause of external-server mining retries or complete correction/teleport parity. Standalone PR validation still requires the recorded production prerequisites.
