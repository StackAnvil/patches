# Complex Bedrock gameplay coverage

This matrix extends the [full coverage ledger](bedrock-coverage.md).
It keeps movement, combat, item use, mounts, and inventory recovery in the same parity goal.
The target is Bedrock **1.26.51.1**, build **51061372**, protocol **2193**.

## Evidence and version rules

Mojang's [movement guide](https://mojang.github.io/bedrock-protocol-docs/guides/player-movement-overview/) describes input ticks, prediction, correction, and replay.
It also describes pairing inventory transactions with input and using vehicle positions for predicted horses and boats.
Use the target implementation and captures to establish numeric fields, frame order, and other mounts' authority.

The [v1.26.50.4 samples](https://github.com/Mojang/bedrock-samples/tree/46ba6ea985fb5a92d79a9419198f10dda14c199d) provide a fixed, adjacent content baseline.
They are older than our target build.
Check their values against the licensed target assets and executable before adding production constants.
Current Creator documentation can describe APIs newer than the target.
The probe uses the published `@minecraft/server` **2.9.0** types, matching its pack manifest.

The tables below specify required comparisons.
An entry does not claim that production behavior or a live comparison passes.

## Edge-case completion requirement

The goal includes every applicable gameplay action and edge case in the pinned build.
Movement, combat, item use, block interaction, breaking, placement, and inventories share this requirement.
The tables and current fixtures are starting points.
Native comparisons, protocol research, target assets, existing implementations, and bug reports must extend this matrix.
Passing the current suite does not close the requirement.

Each mechanic needs positive controls, negative controls, boundary values, and stateful action sequences.
Shared mechanics need systematic combinations across terrain, equipment, effects, mounts, game modes, and network conditions.
Bounded packet, enum, and state domains need focused exhaustive checks.
Mixed cases must compare item use and combat during movement, state changes, and corrections.

| Edge-case family | Required boundaries and interactions |
| --- | --- |
| Input and timing | Startup, stopping, reversals, diagonal and analog input, yaw/pitch limits, input loss, partial ticks, and unusual frame pacing. |
| Contact and posture | Corners, ledges, overlapping shapes, step heights, ceilings, moving blocks, entity collisions, crawling, swimming, climbing, and grounded transitions. |
| State transitions | Game modes, abilities, permissions, input locks, teleports, dimensions, death, respawn, mounting, dismounting, and replaced vehicles. |
| Combat eligibility | Reach boundaries, occlusion, moving targets, relative velocity, critical hits, invulnerability, armor, enchantments, shield facing, and hand selection. |
| Interrupted use | Slot or hand changes, replaced or exhausted stacks, containers, mounts, ability loss, damage, corrections, disconnects, and dimension changes during charging. |
| Projectiles and damage | Ownership, flight, deflection, dodging, piercing, multishot, pickup, return, explosions, potion/cloud radius, fire, freezing, fall damage, and supported weapon abilities. |
| Effects and resources | Added, replaced, stacked, expired, or removed effects and attributes; hunger, durability, ammunition, equipment, and cooldown changes at action boundaries. |
| Prediction and ordering | Rejected actions, conflicting updates, duplicate or stale updates, missing or evicted frames, tick boundaries, replay, and overlapping impulses or corrections. |
| Network and execution | Latency, jitter, loss, permitted reordering, reconnects, burst delivery, low/high render rates, server tick stalls, and supported server policies. |
| Item use | Eating, drinking, charging, throwing, fishing, buckets, bottles, tools, ignition, shearing, fertilizing, equipping, repeated use, cooldowns, and offhand eligibility. |
| Interaction and placement | Target selection, reach, occlusion, hit faces, coordinates, hand/sneak priority, replacement, fluids, waterlogging, orientation, multi-block structures, support, collisions, and custom blocks. |
| Breaking | Start/continue/abort/finish order, changed targets/faces/tools, speed, hardness, enchantments, effects, underwater/airborne penalties, restrictions, drops, durability, and rejected predictions. |
| Interactive content | Doors, gates, controls, beds, signs, books, containers, workstations, redstone, mounts, feeding, trading, NPCs, and supported editors. |
| Transactions | Cursor/slot identity, bulk transfers, dragging, splitting, hand swaps, dropping, crafting, stack consumption, dynamic containers, acknowledgments, rollback, screen transitions, and duplication/loss prevention. |
| World boundaries | Permissions, spawn protection, adventure restrictions, changing or unloaded chunks, height limits, borders, dimensions, respawns, concurrent players, and scheduled block updates. |
| Feedback and lifecycle | Authoritative reconciliation of blocks, items, entities, effects, and inventories; cancellation, retries, audiovisual feedback, pending inputs, and cleanup. |

Keep failures and unresolved boundaries in this ledger until implementation and native comparisons establish their behavior on both routes.
Record test-driver limits and possible Boar defects separately from production mismatches.
The underlying parity requirements remain open in either case.
Apply this method to additional target-build gameplay mechanics as research identifies them.

## Ground movement and terrain

| Area | Required comparisons |
| --- | --- |
| Walking and sprinting | Acceleration, braking, diagonal input, yaw changes, sprint start/stop, hunger, and movement attributes. Compare keyboard and controller input. |
| Sneaking and jumping | Edge stopping, jump timing, auto-jump, head obstruction, low ceilings, steps, slabs, stairs, ladders, vines, scaffolding, and crawling transitions. |
| Powder snow | Entry, sinking, leather boots, jumping, sneaking through the surface, freezing, landing, and exiting into ordinary terrain. |
| Other slowing terrain | Cobwebs, honey, soul sand, berry bushes, custom block friction, collision boxes, and movement components. Include effects that change those interactions. |
| Surface impulses | Ice, slime bounce, honey slides, piston displacement, overlapping entities, one-way collisions, and collision-list order. |
| Water | Still and flowing water, current direction, immersion depth, surface crossing, swimming, sprint-swimming, diving, exit steps, and collision near fluid boundaries. |
| Other fluids | Lava entry/exit, buoyancy, damage, fire resistance, bubble columns, underwater breathing, and Depth Strider or Dolphin's Grace interactions. |

Leather boots walking on powder snow are an established Bedrock mechanic.
The [official introduction](https://www.minecraft.net/pl-pl/article/goats-and-powder-snow-now-bedrock-beta) provides the behavior lead.
It does not establish current collision, freezing, or acceleration constants.
Here, “quicksnow” means powder snow; custom slowing terrain remains a separate requirement.

## Flight and mounts

| Area | Required comparisons |
| --- | --- |
| Creative flight | Double-tap toggle, ascend/descend, horizontal acceleration, sprint flight, collisions, ability updates, and transitions to survival or spectator. |
| Spectator | Collision bypass, flight, inability to interact, visibility, inventory preservation, and transitions into enclosed spaces. Verify Bedrock camera behavior independently. |
| Elytra | Launch eligibility, pitch changes, stall, dive, climb, landing, wall impact, water transitions, wing durability, and server corrections. |
| Rockets | Mainhand use, native offhand eligibility, flight duration, repeated boosts, explosive rockets, consumption, rejected use, and boost termination. |
| Boats | Rowing, turns, water/land/ice transitions, two passengers, seat positions, dismount clearance, chest boats, and corrected vehicle motion. |
| Minecarts | Powered and ordinary rails, slopes, collisions, passenger motion, dismounts, chest and hopper storage, and vehicle destruction. |
| Horses, donkeys, and mules | Taming, saddling, jumping, feeding versus mounting, swimming, steering, inventory opening, chest attachment, and dismounts. |
| Pigs and striders | Saddle use, controlling item eligibility, boost timing, durability, rider steering, terrain transitions, and loss of the controlling item. |
| Camels and aquatic mounts | Seats, dash eligibility and cooldown, nautilus and zombie nautilus steering, oxygen effects, swimming, and mount-specific prediction authority. |

The [1.21.130 Bedrock release](https://www.minecraft.net/en-us/article/minecraft-1-21-130-bedrock-changelog) establishes spears and aquatic mounts before our target.
The adjacent [pig definition](https://github.com/Mojang/bedrock-samples/blob/46ba6ea985fb5a92d79a9419198f10dda14c199d/behavior_pack/entities/pig.json) distinguishes saddle, steering-item, and boost behavior.
The [mule definition](https://github.com/Mojang/bedrock-samples/blob/46ba6ea985fb5a92d79a9419198f10dda14c199d/behavior_pack/entities/mule.json) distinguishes chest attachment, saddling, riding, and inventory interactions.
These definitions guide fixture construction; they do not prove client simulation parity.

## Combat and ranged use

| Area | Required comparisons |
| --- | --- |
| PvP and reach | Standing, sneaking, swimming, flying, and mounted targets; eye position; bounding boxes; line of sight; range boundaries; moving targets; and server-specific policy. |
| Swords and axes | Attack actions, item cooldowns, damage attributes, armor, enchantments, invulnerability windows, knockback, sprint state, and rejected attacks. Establish Bedrock rules before borrowing Java behavior. |
| Shields | Mainhand/offhand eligibility, raise timing, facing, projectile and melee blocking, durability, movement slowdown, knockback, item swaps, and shield use while moving. |
| Spears | Material-specific jab timing, minimum/maximum reach, charge stages, relative speed, view direction, damage/knockback/dismount conditions, Lunge, hunger, and durability. |
| Tridents | Charge, cancellation, throwing, pickup, Loyalty return, Impaling, Channeling, Riptide in water/rain, dry-use rejection, and interaction with flight. |
| Maces and wind charges | Falling hit/miss, smash eligibility, fall-damage reset, Density, Breach, Wind Burst, repeated bounces, nearby knockback, and corrections during ascent. |
| Bows | Short/full charge, cancellation, empty quiver, ammo selection, enchanted arrows, Infinity, Power, Punch, Flame, shot velocity, and target damage. |
| Crossbows | Load versus fire, retained ammunition after swaps, reload cancellation, empty ammo, Quick Charge, Multishot, Piercing, arrows/rockets, and accepted hands. |
| Splash potions | Throw, impact, consumption, effect identity, distance-dependent application, duration/amplifier, moving targets, resistance, and resulting movement changes. |
| Lingering potions | Impact cloud, radius/lifetime, repeated application, entry/exit, expiry, and effect removal while prediction frames remain pending. |
| Fireballs | Large-fireball deflection, small-fireball differences, lateral/vertical dodging, projectile collision, shield interaction, explosion knockback, ownership changes, and mounted or flying targets. |

The [spear release description](https://www.minecraft.net/en-us/article/minecraft-1-21-130-bedrock-changelog) identifies minimum reach and speed-dependent charge stages.
The adjacent [stone spear definition](https://github.com/Mojang/bedrock-samples/blob/46ba6ea985fb5a92d79a9419198f10dda14c199d/behavior_pack/items/stone_spear.json) separates reach, timing, and kinetic conditions.
Those fields need separate verification; an animation timeline does not establish attack eligibility.

Mojang's [crossbow article](https://www.minecraft.net/en-us/article/taking-inventory--crossbow) describes retaining a loaded shot after putting the weapon away.
Its [trident article](https://www.minecraft.net/en-us/article/taking-inventory--trident) identifies Loyalty, Riptide, and Channeling flows.
The [1.21 Bedrock release](https://www.minecraft.net/en-us/article/minecraft-1-21-bedrock-changelog) establishes mace smash attacks, wind charges, and mace enchantments.
Confirm current numbers in the target build.

The adjacent [large fireball definition](https://github.com/Mojang/bedrock-samples/blob/46ba6ea985fb5a92d79a9419198f10dda14c199d/behavior_pack/entities/fireball.json) explicitly enables reflection on hurt.
The [lingering potion definition](https://github.com/Mojang/bedrock-samples/blob/46ba6ea985fb5a92d79a9419198f10dda14c199d/behavior_pack/entities/lingering_potion.json) specifies a distinct projectile and an impact cloud.
Projectile creation alone does not prove reflection, cloud effects, or visible trajectories.

## Inventories, actions, and prediction

| Area | Required comparisons |
| --- | --- |
| Mule chest storage | Attach chest, saddle, mount, open mounted/unmounted, transfer each storage slot, shift-click, reject requests, reopen, disconnect, and destroy the mount without duplication. |
| Bundles | Capacity weighting, non-stackable items, nested bundles, selected extraction, dynamic container identity, cursor state, rapid transfers, rejection rollback, and dropped contents. |
| Block and item actions | Break start/continue/stop, completion, placement, interaction versus use, eating, hand selection, cooldowns, swaps, and rejected predictions. |
| Frame identity | Pair input, position, motion, attributes, pose, item state, and world state with the same native frame. Preserve identity through direct and ViaProxy routes. |
| Corrections | Rewind and replay retained frames after player/vehicle corrections, impulses, teleports, dimension changes, respawns, and mounting or dismounting. |
| Network conditions | Repeat at controlled latency, jitter, loss, and frame pacing. Record action ordering, inventory acknowledgments, correction count, replay error, and disconnects. |
| Mixed cases | Shield plus movement, bow use in water, potion effects during flight, knockback while charging, rockets during corrections, and mount inventory changes while steering. |

The [1.21.40 Bedrock release](https://feedback.minecraft.net/hc/en-us/articles/31222183227149-Minecraft-Bedrock-Edition-1-21-40-Bundles-of-Bravery) establishes bundles before the target.
Their inventory behavior must be tested with native item stack requests and rejection recovery.

## Current source findings

The October 6 audit found these limits:

- `ClientPlayerPackets.predictedVehicle` selects Java boat and abstract horse types. Other controlled mounts need an authority audit.
- Core now handles `UPDATE_EQUIP` and ordinary horse, donkey, and mule menus. Cargo mapping and request identity have unit coverage. Live transfers, mounted opening, rejection recovery, and destruction remain unverified.
- `ItemAnimationData` carries kinetic timing for animation. It does not model spear reach or relative-speed attack conditions.
- `PlayerPredictionStorage` pairs completed physics and retains input-to-client frame IDs. It lacks tick-indexed world history and correction replay.
- Core forwards authoritative correction position and motion. The add-on now also applies paired grounded state. Full correction replay remains incomplete.
- Bundle containers and rewriting exist. End-to-end capacity, cursor, transfer, and rollback parity remain to verify.
- Fluid physics, player posture, shield timing, boat movement, and rocket paths exist. The complete matrix above remains unverified.

Keep authoritative state, packet construction, item requests, and corrections in ViaBedrock core.
Use the add-on where native input, local physics, or presentation requires client integration.
Retain ordinary Java and ViaProxy coverage where standard translation suffices.

## Runnable suite

Run the 44 BDS cases:

```bash
bun run test:integration -- --route java-bedrock --gameplay-complex
```

The [probe guide](bedrock-test-packs.md#complex-gameplay) describes their assertions and limits.
They check ranged use and hits, potion effects, fireball interactions, powder snow, fluid movement, and creative ascent.
They are an executable subset of this matrix.
The existing portable gameplay sweep remains separate.
The Java/Geyser fixture does not implement the new cases yet.

### Initial suite verification, October 6, 2026

**Implemented initially:** Twelve fixture IDs, Java input actions, ranged event checks, owner filtering, deferred callback isolation, and bounded movement sampling.
The probe is checked against Script API 2.9.0.

**Verified:** Targeted assertion and lifecycle tests pass, the TypeScript check passes, and the behavior pack bundles successfully.

**Unverified:** Live BDS execution stopped at the occupied private-display check.
The existing lab session was preserved.
The current-boot GPU guard also prevents fresh native client comparisons.
No new native baseline, direct join, ViaProxy gameplay result, or anticheat result is claimed.

The remaining matrix needs fixtures, native baselines, production changes, and route verification.
Use strict official BDS as the primary reference.
Treat Boar flags as diagnostic evidence and keep CubeCraft interoperability as a separate test.
All eight original coverage groups and actual platform joins remain required.

### Mount inventory implementation, October 6, 2026

ViaBedrock core now opens horse, donkey, and mule menus through standard Java mount packets.
Chested donkeys and mules expose five cargo columns.
Native cargo slots 1 through 15 map to Java cells 2 through 16, and player cells follow at 17.
An unchested mount hides cargo and the unused armor cell from requests.
Equipment predictions use server item and auxiliary-value restrictions.

An isolated headless official BDS probe confirmed tamed mule capacity 16 before chest attachment and the later `CHESTED` flag.
Server Script API also confirmed items at cargo indices 1 and 15.
Eight new tests cover mappings, snapshots, equipment rules, complete packet decoding, player content placement, and either opening packet order.
The 95-patch stack replays, and the complete core build passes with 672 tests and 19 optional skips.
The [inventory patch notes](../patches/viabedrock/deferred/0003-translate-server-authoritative-bedrock-requests.pr.md#horse-donkey-and-mule-menus) retain source links and verification limits.

The headless screen-opening attempt timed out.
Native screen behavior and live Java or ViaProxy transfers remain unverified.
The full mount and movement matrix above remains required.

### Ranged combat and fluid fixtures, October 6, 2026

**Implemented:** Seventeen additional cases bring the opt-in suite to 29.
They cover short bow draws, submerged bow use, bow and crossbow target damage, crossbow cancellation and empty ammunition.
They also cover splash speed, lingering slowness, large and small fireball hit and dodge controls, large-fireball reflection, currents, lava, and both bubble-column directions.

Potion checks pair the owned projectile and impact with its effect.
Lingering checks also require a nearby cloud.
Target damage must identify the same arrow that hit the target.
Fireball checks require an incoming shot on a collision course using the server's actual collision bounds.
An idle player, unrelated damage, a missed shot, or an unrelated attack cannot satisfy the respective positive assertions.
Fixtures close their observers after verification, replacement, or reset.
Preparation clears prior fire damage, and asynchronous start actions cannot attach to a different fixture.

**Target evidence:** Isolated headless BDS 1.26.51.1 confirms the potion effect and delivery registries.
All 29 fixture preparations pass on the target server.
It rejects direct Script API spawning of vanilla fireballs, so the fixtures use natural ghast and blaze shots.
Both hit controls pass with owned trajectories, player contact, and matching damage.
Native packet probes pass the splash-speed and lingering-slowness assertions, including consumption, impacts, effects, and the lingering cloud.
They also pass bow and crossbow target hits and large-fireball reflection.
Reflection records the player attack, the new projectile owner, and outgoing motion.
The TypeScript check, pack build, and all 135 tooling tests pass.

The synthetic probe needed the loading-screen completion and interaction initialization packets before normal gameplay worked.
ViaBedrock already sends those packets during joining.
An inventory resynchronization supplied the probe's current held item before item use.
These probe corrections do not establish a new production joining fix.

**Unverified:** The synthetic protocol client does not exercise Java translation, local physics, rendering, or input timing.
Full Java, native client, direct, and ViaProxy comparisons remain required.
Detailed charge, damage, potion radius and duration, small-fireball reflection, enchantments, correction replay, and mixed movement cases remain open.
The current-boot GPU guard and occupied private display remain in place.

### Stored crossbow ammunition, October 6, 2026

**Implemented:** Core translates `chargedItem` into Java's loaded-projectile component and clears unloaded charges.
The shared item decoder retains auxiliary data, preserving tipped-arrow subtype mappings.
This uses standard Java item components, including through ViaProxy.

**Target evidence:** Headless BDS wire data confirms one loaded arrow, a tipped arrow with auxiliary value 15, and an offhand rocket.
The rocket retains its nested `Fireworks` tag and flight value 1.
An inventory rocket does not load in this controlled probe.
The [item patch notes](../patches/viabedrock/upstreamable/0028-translate-java-overrides-and-book-data.pr.md) describe the checks and limits.

**Unverified:** Full Java input and firing timing, native visuals, slot changes, and both connection routes remain required.
Enchantment-specific behavior and complete firework playback remain open.
The synthetic protocol probe does not establish translated gameplay parity.

The complete 95-patch core stack replays successfully.
The core build and Checkstyle pass with 675 tests passing and 19 optional skips.

### Firework item components, October 6, 2026

**Implemented:** Core exports rocket flight and star/explosion data through standard Java components.
It preserves supported shapes, ordered colors and fades, trail, and flicker.
Loaded crossbow rockets use this same converter.
Flight retains unsigned byte values, including zero and 255.
Missing or incorrectly typed fields use the target native defaults.
Invalid shapes become small balls; invalid or empty colors use purple.

**Verified within scope:** The target BDS supplies all 16 creative star colors and the typed rocket/explosion layout.
Focused inspection of the matching client confirms its palette and defaults.
A bounded Unicorn fixture passes 512 native spark cases across all color indices, with and without fades.
Particle allocation and random selection are supplied boundaries; native instructions perform color conversion and write flags.
Java tests cover multiple explosions, field types, source immutability, unsigned values, and network serialization.
The [item patch notes](../patches/viabedrock/upstreamable/0028-translate-java-overrides-and-book-data.pr.md) retain evidence and limits.

**Unverified:** Component translation does not establish projectile simulation, damage, boost timing, sound, or visible particle parity.
Live Java/native firing and both connection routes remain requirements.
The current-boot GPU guard and occupied private display remain in place.

The complete 95-patch core stack replays and builds successfully.
Checkstyle passes, with 679 tests passing, 19 optional skips, and no failures.

### Rocket actor data and actor-event wire IDs, October 6, 2026

**Implemented:** Rocket compound metadata field 16 now passes through the ordinary item converter into Java entity metadata.
It retains firework components and clears them on an empty update.
Integer minecart display data uses its existing path.
The actor-event patch now preserves the upstream sparse wire IDs.
It removes the earlier sequential renumbering, which misread rocket explosions and many other events.

**Target evidence:** Controlled BDS crossbow firing produces a rocket with `Fireworks` in field 16.
A summoned rocket has an empty compound there.
Both emit explosion event 25 and then disappear; crossbow charging emits event 74.
Matching native rocket code reads field 16 and emits 25.
The target protocol page’s sequential values contradict these observations.
The [event notes](../patches/viabedrock/deferred/0001-translate-bedrock-actor-events-to-java-statuses.pr.md) record that conflict.
The [metadata notes](../patches/viabedrock/deferred/0002-translate-bedrock-metadata-and-properties.pr.md) describe conversion and limits.

**Unverified:** Direction field 17, attachment field 18, complete rocket flight and boost behavior, and visible particle/audio comparisons remain required.
Live translated direct and ViaProxy comparisons remain open.
The synthetic packet probe establishes target wire behavior and does not establish client parity.

The complete 95-patch core stack replays and builds successfully.
Checkstyle passes, with 683 tests passing, 19 optional skips, and no failures.

### Native glide travel, October 6, 2026

**Implemented:** Core supplies `GlideMovement` for unboosted local glide travel.
The add-on invokes it during Bedrock flight on direct and ViaProxy sessions.
It replaces Java's double calculation with the target's float operation order and angle lookup.
Slow Falling selects native gravity during ascent as well as descent.
The local hook preserves the native fall-distance reset before travel.

**Verified within scope:** Matching build 1.26.51.1, protocol 2193 registers `GlideMoveSystem` in `14681da00`.
Its callback `146667b10` supplies the velocity calculation and fall-distance condition.
The Java calculator matches all 4,366 bounded native execution cases exactly.
They cover vertical views, angle seams, ascent, descent, Slow Falling, and randomized motion and rotations.
The probes supply CRT remainder, a regenerated sine table, status slots, and an absent rocket boost.
Native instructions perform angle reconstruction, arithmetic, status-slot admission, drag, and fall-distance stores.
Compact Java tests retain numeric velocity regressions, including the required multiplication order.

**Incomplete:** `MOVEMENT_EFFECT` still reaches automatic cancellation.
The [nearby protocol preview](https://mojang.github.io/bedrock-protocol-docs/1.26.50-preview.26/packets/movement-effect-packet/) identifies this packet as the source of confirmed boost duration.
That preview uses protocol 2192; target packet semantics still need verification.
Native `MovementEffectsTick` callback `1490daf80` decrements finite durations and clears expired entries.
Its full packet application, prediction history, rocket timing, and correction replay remain open.

**Unverified:** The local mixin's runtime scheduling, collisions, input phases, trajectories, rocket boosts, and both live connection routes need native comparisons.
The isolated strict-BDS synthetic probe did not enter gliding and does not verify flight.
The current-boot GPU guard and occupied private display remain in place.
All original coverage groups, the complete gameplay matrix, CubeCraft interoperability, and actual platform joins remain required.

The complete core and add-on stacks replay and build successfully against the pinned ViaFabricPlus artifact.
Core checks pass with 684 tests passing and 19 optional skips.
Add-on checks pass with 478 tests passing and 114 optional skips.
These checks verify compilation and the named tests; live flight remains unverified.


### Confirmed rocket boost and frame identity (October 6, 2026)

**Implemented:** Core decodes `MOVEMENT_EFFECT` and retains each known effect on its target actor.
The handler preserves the effect ID, signed duration, and unsigned server tick bits.
It transports these fields through direct and ViaProxy connections to registered add-on clients.
Late channel registration receives the retained confirmations with their original timing.

Prediction transport revision 7 includes a completed client frame identity.
Core binds accepted frames to the exact ticks sent in `PLAYER_AUTH_INPUT` and retains 512 bindings.
The add-on applies confirmed glide boosts against that binding, including elapsed frames before receipt.
Missing bindings never create a new countdown at receipt time.
The October 7 command ordering update below replaces the earlier rejection of older actor confirmations.
Actor removal and disconnect clear the add-on state.

The shared `GlideMovement` calculator now includes the native rocket impulse before drag.
The native function sums the complete impulse before it adds entering motion.
The add-on suppresses Java's separate local rocket impulse to prevent duplicate acceleration and random lifespan timing.

**Verified within scope:** Target protocol 2193 metadata orders runtime ID, effect ID, duration, and tick.
Its tick description identifies the last processed input tick for players and controlled vehicles.
The matching executable's packet vtable `14e862850` resolves packet ID 318 and fields at offsets `30`, `38`, `3c`, and `40`.
The production Java calculator matches all 8,732 native boosted and unboosted execution cases exactly.
Fixtures supply CRT remainder, the regenerated sine table, status slots, and valid or absent boost components.
Native instructions perform boost admission, angle reconstruction, velocity arithmetic, damping, and fall-distance stores.

Native helper `142fe8990` and countdown callback `1490daf80` pass 216 controlled duration cases.
These cases establish native effect generation and countdown with no prediction history or outbound packet target.
They do not establish the full incoming confirmation or correction path.
Java tests cover numeric boost regressions, packet translation, codec boundaries, frame eviction, late expiry, unsigned tick ordering, and connection cleanup.

**Incomplete:** Dolphin and geyser effects have retained core state and transport, but their native physics still need implementation.
Ordinary Java clients retain the confirmations in core and do not receive the add-on physics.
Speculative rocket admission, missing or evicted frame bindings, prediction history, and correction replay remain open.
Late confirmation changes subsequent velocity but does not replay the earlier trajectory.

**Unverified:** Native phase scheduling, deadline boundaries during actual flight, collisions, item rejection, and repeated rocket use need trajectory comparisons.
Live native, direct, ViaProxy, strict-BDS, Boar, CubeCraft, and platform comparisons remain required.
The GPU guard and occupied private display remain in place.
All original coverage groups and the complete complex gameplay matrix remain part of the goal.

The complete core and add-on stacks replay and build against the pinned ViaFabricPlus artifact.
Core checks pass with 691 tests passing and 19 optional skips.
Add-on checks pass with 478 tests passing and 114 optional skips.
Checkstyle passes for both stacks.
These checks verify compilation and the named tests; live flight and correction replay remain unverified.

### Confirmed dolphin boost (October 6, 2026)

**Implemented:** Core transports the authoritative underwater-speed attribute after spawn and channel registration.
It preserves server clamping and zero without inventing missing values.
The add-on applies shared native acceleration and damping when the local player swims with a confirmed dolphin effect and a known attribute.
Both direct and ViaProxy use the same payload and confirmation clock.

**Verified within scope:** Production speed and damping match all 6,992 controlled native execution cases exactly.
Native admission passes another 2,048 cases.
The target keeps full Depth Strider efficiency during boosted airborne frames and bypasses normal drag interpolation.
An isolated strict-BDS synthetic probe confirms the initial player underwater attribute `0.02`.
It receives corrections and no dolphin confirmation, so it does not establish boosted trajectory parity.
The [coverage ledger](bedrock-coverage.md#confirmed-dolphin-boost-and-underwater-attributes-october-6-2026) records addresses, fixtures, transport tests, and limits.

**Incomplete or unverified:** Live dolphin admission and trajectories, custom drag traits, unknown attribute defaults, native phase timing, correction replay, geysers, ordinary fluid travel, currents, and bubble columns remain required.
All ranged weapons, potions, fireball cases, powder snow, combat, inventory, route, and platform requirements stay in the matrix.

The complete core and add-on stacks replay and build against the pinned ViaFabricPlus artifact.
Core checks pass with 695 tests passing and 19 optional skips.
Add-on checks pass with 478 tests passing and 114 optional skips.
CubeConverter passes all 16 tests, and Checkstyle passes for both Java stacks.
ViaProxy also builds and embeds the updated movement classes.
The rebuilt production calculator still matches all 6,992 native speed/damping cases exactly.
These checks establish the named calculations and transport tests; live boosted trajectories remain unverified.

### Ordinary water and respawn state (October 6, 2026)

**Implemented:** Core shares native ordinary-water acceleration and float damping with confirmed dolphin boosts through `WaterMovement`.
The add-on supplies equipment, speed, ground, sprint, and water observations.
It preserves local movement attributes and effects across temporary removal from the entity index during death and respawn.
Disconnect and missing remote actors still clear state.

**Verified within scope:** Production Java matches 19,456 bounded native speed/damping executions with zero bit mismatches.
Fresh direct and ViaProxy clients reach strict-BDS spawn and complete plain-water and grounded Depth Strider 3 cases without nonzero movement corrections.
A runtime observation identifies local underwater-speed loss during death/respawn.
The rebuilt direct client retains that state and completes its controlled post-respawn water case without corrections.
The rebuilt ViaProxy client also retains that state and completes its post-respawn enchanted case without corrections during controlled input or release.
Separate corrections during respawn relocation and fixture setup remain prediction gaps.
Invalid drowning, unavailable-arena, and expired-recording attempts do not count as movement evidence.
The [coverage ledger](bedrock-coverage.md#ordinary-water-travel-and-local-state-across-respawn-october-6-2026) records addresses, test boundaries, route checks, and lifecycle evidence.

**Incomplete or unverified:** This increment does not establish full native water travel.
Broader phases, custom traits, rotation, collision, gravity, currents, boosts, lava, bubbles, geysers, latency, and history replay remain required.
Boar, real-server joins, platform gameplay, and the complete movement/combat/inventory matrix remain part of the goal.

### Liquid current arithmetic, October 6, 2026

**Implemented:** Core shares native float current accumulation, normalization, and motion updates through `FluidCurrent`.
The add-on supplies observed flows and selects water strength `0.014F` or lava strength `0.0035F` on either connection route.

**Verified within scope:** The complete pinned native callback passes 1,962 controlled executions with supplied world/contact observations and per-cell flow vectors.
The production Java calculator matches all 654 admitted cases exactly.
The [coverage ledger](bedrock-coverage.md#liquid-current-accumulation-and-strengths-october-6-2026) records live route checks and remaining gaps.

**Incomplete or unverified:** Per-cell flow generation, native contact gates, cell enumeration, mixed-fluid selection, loading, gravity, and complete native trajectories remain required.
Respawn corrections, lava travel, bubble columns, geysers, latency, Boar, CubeCraft, and actual platform joins remain separate requirements.
The complete matrix above remains required.


### Rounded-teleport collision contacts, October 6, 2026

**Implemented:** Core shares native separated-axis contact clipping through `CollisionContact`.
The add-on applies it to each actual voxel-shape box on Bedrock sessions.
The target's float32 contact threshold prevents a slightly rounded teleport from disabling wall clipping.
Gaps between separate boxes remain open.

**Verified within scope:** Production Java matches 8,270 original native contact executions with zero float-bit mismatches.
The strict-BDS direct reproduction changes from 152 corrections to zero after the same rounded teleport.
The rebuilt case also includes 22 backward-input and 22 forward-input frames without corrections.
The [coverage ledger](bedrock-coverage.md#native-collision-contacts-after-rounded-teleports-october-6-2026) records the runtime probe and route evidence.

**Incomplete or unverified:** Native axis and obstacle order, overlap recovery, state producers, native box finalization, and steps remain required.
Complete terrain, fluid, latency, correction replay, Boar, real-server, and platform comparisons remain required.
The full combat, ranged-use, mount, inventory, and movement matrix above remains in scope.

The rebuilt ViaProxy comparison also reaches strict-BDS spawn and sends 1,618 input frames with zero corrections.
It includes the same rounded teleport, 22 backward-input frames, 22 forward-input frames, and later idle current contact.
Both routes verify this regression; complete native collision and the full gameplay matrix remain required.

### Ranged enchantment fixtures, October 6, 2026

**Implemented:** Six cases extend the runnable suite to 35.
They cover Infinity with and without ammunition, Multishot arrows, and all three Quick Charge levels.
The assertions check consumption, distinct projectile identities, ownership, charging order, volley timing, and bounded completion intervals.
Infinity still requires ammunition in the positive fixture.
A shot with an ordinary reload duration cannot satisfy a Quick Charge case.

**Verified within scope:** All six prepare and pass on strict BDS 1.26.51.1, protocol 2193, through an isolated synthetic protocol client.
Infinity preserves four arrows after its shot and produces no shot without ammunition.
Multishot produces three owned arrows during one server tick and consumes one arrow.
Quick Charge reports remaining durations of 20, 15, and 10 ticks, with measured completion intervals of 19, 14, and 9 ticks.
The TypeScript check, pack build, and all 138 tooling tests pass.

**Incomplete or unverified:** Java input, visual charging, native client comparisons, and direct or ViaProxy gameplay remain required.
The rocket probe produces one actor, or three with Multishot, and consumes one offhand rocket.
The generic Script API observer cannot establish their ownership, and their initial upward motion does not establish correct crossbow flight.
Rocket launch, ownership, damage, and client prediction remain open.
The [coverage ledger](bedrock-coverage.md#ranged-enchantment-fixtures-october-6-2026) records the probe limits.
All movement, combat, terrain, fluid, inventory, route, and platform requirements remain in scope.

### Crossbow Piercing fixtures, October 6, 2026

**Implemented:** Three cases extend the runnable suite to 38.
An ordinary crossbow, Piercing I, and Piercing IV fire through stationary target chains.
The assertions require one consumed arrow and one owned projectile after a completed load.
That same projectile must contact and damage one, two, or five distinct targets in order.
The next target must retain its health with no contact or damage event.
The observer keeps separate damage attribution and health for each target.
Negative tests reject wrong arrows, extra shots, duplicate contacts, reversed contact ticks, missing targets, and damage beyond the chain.

**Version evidence:** The [Creator projectile reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_projectile?view=minecraft-bedrock-stable#multiple_targets) connects Piercing to multiple-target behavior.
The target BDS supplies the hit counts and damage observations used here.
All three controls pass three attempts through an isolated synthetic protocol client on strict BDS 1.26.51.1, protocol 2193.
The TypeScript check, pack build, and all 140 tooling tests pass.

**Overlap finding:** Initial spacing lets one wide target receive two contacts and two damage events from the same arrow on consecutive ticks.
Piercing I then damages only that target; Piercing IV damages it twice and three later targets once each.
The final fixture separates targets and places the first beyond the initial launch step.
This preserves the owned projectile observation and tests distinct targets without repeated overlap contacts.
Repeated contacts remain a separate parity requirement, as do shields, wall stops, moving targets, and projectile rendering.

The [coverage ledger](bedrock-coverage.md#crossbow-piercing-fixtures-october-6-2026) records route verification.
The full movement, combat, fluid, terrain, inventory, native comparison, and platform matrix remains required.

### Native player step height (October 6, 2026)

Native player initialization sets the maximum step height to `0.5625F`.
Core now sends that limit through Java's step-height attribute at join, respawn, and dimension changes.
The original native setter and getter pass 1,024 execution cases with supplied ECS storage.
The constructor call chain is verified from instructions.

This corrects the player limit while Java still selects and solves step candidates.
Variable creature heights, native obstacle order, overlap recovery, and complete movement history remain required.
The [coverage ledger](bedrock-coverage.md#native-player-step-height-october-6-2026) records runtime checks and verification boundaries.

### Grounded player corrections, October 6, 2026

The ranged recordings expose a first-frame knockback mismatch.
An airborne server correction updates Java position and motion but leaves the earlier grounded state active.
The next frame applies ground drag of 0.546 instead of air drag of 0.91.

Core now transports the missing grounded state through a versioned correction channel.
The add-on applies it after the exact matching player-position packet.
The player ID and teleport ID prevent another update from consuming stale state.
Core retains the native correction tick, but full history replay remains incomplete.

A live Java 26.3 probe rules out ordinary entity teleports as an alternative.
Even a zero-relative teleport starts two-step interpolation on the local player.
The injected handler instead preserves exact position and velocity and leaves interpolation inactive.

Both strict-BDS routes finish normally and pass all three Piercing controls.
Each route observes two airborne corrections with next-frame horizontal drag near 0.91.
A later grounded correction on each route retains drag near 0.546.
Runtime snapshots verify grounded state before physics at the matching correction positions and velocities.
The direct route records four corrections across 819 inputs; ViaProxy records six across 821 inputs.
Startup and fixture corrections differ between runs, so their totals do not measure the fix in isolation.

The [core correction notes](../patches/viabedrock/upstreamable/0092-retain-completed-client-prediction-frames.pr.md#authoritative-grounded-state) describe the codec and pairing tests.
Ordinary Java grounded-state limitations, rewind, resimulation, vehicle reconciliation, and the full matrix remain requirements.
Fresh native execution remains blocked by the current-boot GPU guard.

### Knockback during ranged use, October 6, 2026

Four new cases bring the complex suite to 42.
They cover bow release, crossbow loading and firing, and either weapon's cancellation after knockback during charging.
Each fixture applies one scripted impulse four server ticks after accepted use starts.
It requires upward and horizontal airborne displacement before charging ends.
Positive cases also require one owned arrow and one consumed arrow.
Cancellation requires a witnessed slot change, no projectile, and unchanged ammunition.

All four cases pass actual mouse and keyboard input against strict BDS through direct connections and ViaProxy.
The runner now recognizes the drawn hotbar selection in any cell and selects cell zero before input.
This corrects a false HUD timeout after a preceding cancellation leaves another cell selected.
All 144 tooling tests, the TypeScript check, and the behavior-pack build pass.

The direct trace receives each of its four impulses after input T+1 was already sent.
Each receives a correction for T+1.
ViaProxy receives each impulse after T but before T+1, with no correction near those impulses.
This comparison identifies a timing case; it does not establish that either route always has that ordering.
Core currently discards the tick in `SET_ENTITY_MOTION`.
The [target packet schema](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/set-actor-motion-packet/) supplies that tick to adjust in-flight predictions.
Historical impulse application and later-frame replay remain production requirements.

These results verify the item outcomes and the fixture's movement response, including cases with corrections.
They do not verify exact native trajectories, PvP damage, controlled latency, or anticheat parity.
Fresh native comparisons remain unavailable under the GPU guard.
The complete gameplay matrix and all eight original coverage groups remain required.

### Server hotbar selection during charging, October 6, 2026

Two new cases bring the runnable complex suite to 44.
The server selects snowballs four ticks after accepted bow or crossbow charging starts.
The client releases its use button, then clicks again without a local slot-selection command.
The fixture requires cancellation, unchanged arrows, a witnessed server selection, one consumed snowball, and one owned snowball projectile.
Callback guards prevent a delayed selection from affecting another or completed fixture.

Core previously sent Java's held-slot update without changing its tracked selected item.
It now updates that state before forwarding the packet.
Subsequent use, drop, interaction, and equipment translations therefore read the server-selected stack.
Java slot values also undergo bounds checks before byte narrowing.
The [inventory patch notes](../patches/viabedrock/deferred/0003-translate-server-authoritative-bedrock-requests.pr.md#server-hotbar-selection) record the packet contract and tests.
The target [PlayerHotbar schema](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/player-hotbar-packet/) carries the slot, container, and selection flag.

Both new cases and the four preceding knockback cases pass actual mouse and keyboard input through direct connections and ViaProxy.
Both Java clients have the add-on installed; the hotbar fix uses standard Java packets in core.
Strict official BDS remains enabled.
This run verifies six cases on each route, not the complete 44-case suite.
Both recordings exit successfully, and the owned server stops.

All 146 tooling tests pass.
The complete builds pass with 16 converter, 724 core, and 480 add-on tests, plus 133 optional skips and no failures.
ViaProxy builds successfully.
Eighteen new core tests cover server selection, held-stack identity, ignored notifications, and invalid slot encodings.

These checks verify cancellation and subsequent item use against BDS.
They do not establish complete native action timing or movement parity.
Fresh native comparisons remain blocked by the current-boot GPU guard.
Historical impulses, correction replay, the complete complex matrix, and all eight original coverage groups remain required.

### Fluid and projectile regression sweep, October 6, 2026

A 15-case sweep uses actual input against strict official BDS through direct and ViaProxy connections.
Both clients have the add-on installed.
Each route passes submerged bow release, splash speed, lingering slowness, powder-snow sinking, and leather-boot surface support.
Each also passes forward water and lava movement, idle water currents, and both bubble-column directions.
These ten controls pass on each route.
The direct route also passes large-fireball contact, reflection, and small-fireball contact.

The direct route fails both dodge cases after projectile contact and damage.
A separate instrumented large-fireball case first records player movement nine server ticks after launch.
It records more than one block of lateral clearance only on the projectile-contact tick.
This result exposes a reaction-timing boundary; it does not isolate native physics from test-driver and delivery latency.
The dodge observer now records player positions and velocities after launch.
Its assertion rejects movement that occurs only after the shot passes, along with stale, unordered, or non-finite samples.

An isolated five-case rerun passes large-fireball contact/reflection and small-fireball contact on both routes.
Large-fireball dodging still receives contact and damage on each route.
The direct small-fireball dodge receives no threatening shot within its twenty-second startup bound.
The proxy recording ends during that case's startup.
Those small-fireball dodge attempts remain unverified.
These isolated results do not close the earlier death/respawn recovery gap.

The ViaProxy sweep reaches a magma death after the downward bubble-column case.
It cannot recover through the next case's preparation and the runner's respawn input.
The five following fireball cases therefore do not verify their gameplay assertions.
The private journal records a client-ready respawn request without a subsequent ready-to-spawn reply.
Recovery after hazardous terrain and the fixture's preparation lifecycle need separate investigation.
This run does not establish which component causes that recovery failure.

All 147 tooling tests pass, as do the TypeScript check and behavior-pack build.
The owned sweep server stops and both recorders finish successfully despite failed gameplay assertions.
Failed dodge and recovery cases remain open.
Detailed trajectories, native baselines, controlled network conditions, Boar, CubeCraft, actual Windows/macOS joins, and the full gameplay matrix remain required.
The current-boot GPU guard remains in force, and all eight original coverage groups remain required.

### Dead-player arena preparation, October 6, 2026

**Resolved fixture defect:** The earlier ViaProxy recovery failure followed preparation of a dead player.
The journal records health falling to zero, then rising to twenty before the client requests respawn.
Its request uses the correct player runtime ID.
There is no subsequent ready-to-spawn reply.

A controlled protocol client reproduces this on strict BDS 1.26.51.1, build 51061372, protocol 2193.
An ordinary death completes the client-ready, server-ready, and player-action sequence.
Preparing the dead player resets health through the Script API, after which neither client-ready nor a respawn action completes the handshake.
This establishes a fixture defect; it does not establish a missing ViaBedrock respawn packet.
The [target protocol reference](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/respawn-packet/) retains the three respawn states and runtime-ID field.

Arena preparation now requires a living player before mutation, after tick waits, and before resetting health.
The controlled BDS regression rejects preparation while dead and subsequently completes the ordinary respawn handshake.
The unit regression also covers death during the first asynchronous tick and invalid health values.
It checks that preparation preserves zero health and cannot heal the corpse.

**Verified within scope:** Actual Java clients with the add-on reject deliberate dead-player preparation through direct and ViaProxy connections.
Each then completes an in-game respawn and passes movement right, the downward bubble column, large-fireball contact, and movement left.
All eight follow-up gameplay checks pass against strict BDS.
Both journals contain the client-ready request and the subsequent server-ready reply.
All 148 tooling tests, the TypeScript check, and the behavior-pack build pass.

**Remaining:** This fix does not establish complete death/respawn parity, native comparisons, or every hazardous-terrain transition.
Dodge timing, full prediction replay, the complete gameplay matrix, and all eight original coverage groups remain required.

### Projectile input latency and fixture weather, October 7, 2026

**Implemented:** The integration runner now calls the capture UI API directly.
The CLI uses the same implementation, and each command still checks the selected window on the bound display.
Desktop input still requires explicit permission.
This removes a separate Bun process and redundant private-window focus process from each input command.
The [capture reference](capture-lab.md#integration-input-timing) describes the shared path.

A private benchmark uses twelve samples per path and a key hold of one millisecond.
The CLI averages 220 ms per command, and the shared API averages 9 ms on this host.
These numbers describe driver overhead, not network latency or native gameplay parity.
The dodge assertion retains the same firing distance, collision-course selection, timely clearance, and absence of attributed damage.

**Verified within scope:** Actual Java input passes all five projectile controls directly against strict BDS 1.26.51.1, build 51061372, protocol 2193.
These controls cover large-fireball contact, dodge, and reflection, plus small-fireball contact and dodge.
The accepted dodge shots record initial lateral movement two or three server ticks after launch.
The player clears the firing lane eight ticks after launch, before projectile contact.
The earlier slow-driver capture records initial movement nine ticks after launch and clearance on the contact tick.

Reflection now uses repeated real clicks during the projectile approach.
A held attack emits its first swing outside reach and does not provide a later attack in that capture.
The repeated-click controls retain reversed motion, changed ownership, and absence of player damage as their requirements.
Both direct and ViaProxy routes pass large-fireball reflection with this input.

The first ViaProxy confirmation passes four controls, but small-fireball dodge fails during startup.
Its journal contains a blaze spawn, repeated hurt events, death, and removal, without a small-fireball spawn.
Rain is active before the shooter appears.
The [matching blaze definition](https://github.com/Mojang/bedrock-samples/blob/46ba6ea985fb5a92d79a9419198f10dda14c199d/behavior_pack/entities/blaze.json) specifies water-contact damage and a natural ranged attack.
Projectile fixtures now request clear weather before spawning the shooter.
The duration uses ticks, as described in the [official command reference](https://learn.microsoft.com/en-us/minecraft/creator/documents/commandspopularcommands?view=minecraft-bedrock-stable#weather).
The first weather regression used 120 ticks, so rain returned after six seconds and killed another shooter before it fired.
The fixture now uses 2,400 ticks and waits eighty ticks for the native rain level to fade before spawning the shooter.
Cleanup checks entity validity so a dead shooter cannot hide the original timeout error.
Weather-dependent combat remains a separate required comparison.

A further direct dodge trial records timely movement and no damage, but its descending shot disappears before passing the original player position.
The recorded bounds and velocity place floor contact before contact with the stationary player.
The initial course check considered only the player bounds.
It now compares the first contact with known fixture obstructions and records the stone floor in the observation.
The unit regression covers that captured trajectory, an unobstructed shot, an intervening wall, and a wall behind the player.
Earlier passing captures retain their result when reevaluated with the known floor bounds.
The pass assertion still requires a genuine shot that passes the original position after timely clearance.

The first obstruction-aware rerun passes both direct small-fireball controls and ViaProxy contact.
Its ViaProxy dodge records timely movement and no damage, but a descending shot reaches the floor before the required pass plane.
This course reaches the player bounds first, so an obstruction check limited to initial contact cannot reject it.
Dodge selection now requires clear flight through the same pass plane that its assertion uses.
The captured trajectory forms another regression control.
This calculation covers linear flight and the fixture's known floor, not arbitrary terrain or curved trajectories.

The final clearance-aware run passes direct small-fireball contact and dodge, plus ViaProxy dodge.
ViaProxy contact fails during startup, before a qualifying shot arrives, so that assertion remains unverified in this run.
Both recorders finish successfully, and the owned strict-BDS server stops.
All 153 tooling tests, the TypeScript check, and the behavior-pack build pass.

A dry ViaProxy hit trial also receives no shot from a living blaze within the twenty-second startup bound.
Its journal records clear weather and no shooter hurt events.
That startup problem remains separate from rain damage and remains unresolved.

**Remaining:** An earlier ViaProxy attempt disconnects before spawn with an invalid-NBT decode error after entering Java configuration.
A subsequent attempt joins successfully, so the intermittent join failure still needs investigation.
Native trajectory comparisons, controlled network conditions, correction replay, Boar, CubeCraft, actual Windows/macOS joins, and the full gameplay matrix remain required.
Fresh native launches remain blocked by the current-boot GPU guard.
All eight original coverage groups remain required.

### Early resource packs and duplicate login success, October 7, 2026

**Resolved core ordering defect:** The failed ViaProxy journal contains one Bedrock login-success packet.
Its proxy log records two translated successes, with `Skipping LOGIN state` between them.
The Java 26.3 client then rejects a configuration disconnect while reading NBT.
The proxy's later cleanup exception follows that client failure.
Java login success and configuration disconnect both use packet ID 2, so the second login body reaches the wrong decoder after the state change.

ViaVersion leaves modern connections in `LOGIN` until the Java acknowledgment arrives.
Early Bedrock resource-pack traffic can therefore trigger the omitted-login fallback after success has already been sent.
ViaBedrock now advances its server state to `CONFIGURATION` after the first success.
Its client state stays pending the Java acknowledgment.
The genuinely omitted-login fallback and the older-client `PLAY` transition remain supported.
This change belongs in core and applies to direct and ViaProxy connections.

The sequence regression fails before the fix and passes afterward.
It covers early pack traffic, repeated success status, omitted success, and clients without configuration.
The full core build passes with 746 tests, zero failures, and 19 skips.
The add-on build passes with 594 tests, zero failures, and 114 skips; ViaProxy also builds successfully.
The independent patch applies to pinned upstream without setup.
Its three sequence tests pass there with an external init script supplying the test classpath that our full stack already provides.
See the [login patch evidence](../patches/viabedrock/upstreamable/0093-complete-login-before-resource-pack-negotiation.pr.md).

**Verified within scope:** The rebuilt clients pass one direct join and two ViaProxy joins against strict BDS.
All three reach initialization and spawn, then pass a real movement control.
Each journal contains one Bedrock login success.
Both proxy logs record one translated success and no omitted-login fallback.
All three recorders exit successfully, and the owned test server stops.

**Remaining:** This resolves the duplicate-success ordering path, not every join or configuration failure.
The living-blaze startup gap, native comparisons, prediction replay, controlled network conditions, Boar, CubeCraft, actual Windows/macOS joins, and the full gameplay matrix remain required.
The current-boot native GPU guard remains in force.
All eight original coverage groups remain active.

### Projectile startup evidence, October 7, 2026

**Resolved evidence gap:** An empty packet journal does not establish that the native shooter never fired.
The fixture removes unsuitable shots before they can reach the client.
It now records each launch's owner, bounds, velocity, tick, and selection decision.
Startup errors retain those launches, the player bounds, known obstructions, and the required pass plane.
The runner preserves the complete failed server event in its error cause and results file.

An instrumented ViaProxy hit/dodge/hit sequence passes all three controls against strict BDS.
The server observes eight genuine launches and rejects five unsuitable shots.
The packet journal contains only the three accepted shots.
This establishes the journal's visibility limit in this run.
The earlier timeout's exact cause remains unresolved because its fixture did not record rejected launches.

The fixtures retain the twenty-second startup bound, genuine projectile ownership, collision-course selection, attributed damage, and timely dodge requirements.
No shooter behavior, player bounds, movement policy, or success assertion changes.
The regression verifies that error, failed, and unexpected startup statuses retain structured evidence through serialization.

The final diagnostic format passes contact and dodge through both direct and ViaProxy connections, four controls in total.
The server records ten genuine launches.
Course selection rejects five misses and one trajectory that reaches the known floor before the player.
Both accepted contact shots produce attributed damage; both dodge controls pass without damage.
Both recorders exit successfully, and the owned strict-BDS server stops.
All 154 tooling tests, the TypeScript check, and the behavior-pack build pass.
The diagnostic pack replacement preserves all 201 unrelated pack and configuration files, with rollback copies outside the server directory.

**Remaining:** Native comparisons, complete prediction replay, controlled network conditions, Boar, CubeCraft, platform joins, and the full gameplay matrix remain required.
The current-boot GPU guard still prevents fresh native launches.
All eight original coverage groups remain active.

### Authoritative entity reference clearing, October 7, 2026

**Resolved core defect:** Explicit empty owner and target updates previously left stale Java metadata.
ViaBedrock now clears tameable owner UUIDs, guardian and elder guardian attack targets, and each wither head target.
The change requires no add-on implementation.

Official BDS 1.26.51.1, build 51061372 and protocol 2193, supplies the reference values.
Its guardian changes from target zero to a large negative actor ID, then back to zero.
Its first wither head changes from minus one to another large negative actor ID, then back to minus one.
The elder guardian defaults to target zero, all wither heads default to minus one, and an untamed wolf defaults to owner minus one.
The translator preserves valid negative actor IDs and checks each field's exact empty value.

Three sequence regressions fail before the fix and pass afterward.
Each assertion also passes through the Java 26.3 metadata wire codec.
Coverage includes elder guardians, independent wither heads, owner reassignment, and restoration after clearing.
The full core build passes with 749 tests, zero failures, and 19 skips.
The patch applies independently to pinned upstream without setup.
Its three tests pass with an external init script that supplies the test classpath already present in the full stack.
See the [entity reference evidence](../patches/viabedrock/upstreamable/0094-clear-authoritative-entity-references.pr.md).

The rebuilt add-on and ViaProxy pass actual initialization, spawn, and movement controls against strict BDS, one run through each route.
Both recorders exit successfully, and the owned server stops.
The add-on build reports 594 tests with zero failures and 114 skips; ViaProxy also builds successfully.
Artifact replacement preserves all 26 unrelated distribution and Maven files, with rollback copies outside those directories.
These controls verify integration and do not establish live reference-clearing visuals.

**Remaining:** The BDS capture does not establish active elder guardian cycles, active cycles for the other wither heads, or live owner removal.
Unknown references, late actor arrival, target despawn, projectile ownership transport, and visible native comparisons remain required.
The native GPU guard remains in force.
All eight coverage groups and the complete movement, combat, item-use, block-action, and inventory matrix remain active.

### Entity reference lifecycle, October 7, 2026

**Implemented core behavior:** Unavailable owners and attack targets now clear stale Java metadata while retaining their native IDs.
ViaBedrock indexes dependencies by target ID and restores references after the target's Java spawn packet.
Target removal clears dependent fields without erasing authoritative native state.
A returning target resolves to its new Java ID or UUID.
Explicit clearing, superseded references, source removal, and respawn preparation discard obsolete bindings.
Updates for multiple wither heads on one source share one metadata packet.
This covers tameable owners, guardians, elder guardians, and all three wither heads through both connection routes.

The production packet regression verifies that target spawning precedes dependent metadata.
Lifecycle regressions cover late arrival, repeated spawn notification, target unload and return, owner UUID changes, reference replacement, source replacement, and respawn cleanup.
Assertions serialize and decode Java 26.3 metadata.
All nine regressions pass independently on pinned upstream with an external test-classpath init script.
The full core build passes with 755 tests, zero failures, and 19 skips.
Checkstyle also passes.
The [entity reference record](../patches/viabedrock/upstreamable/0094-clear-authoritative-entity-references.pr.md) retains target evidence and verification limits.

The rebuilt add-on and ViaProxy each pass a real strict-BDS join and movement control.
Both recorders exit successfully, and the owned server stops.
The add-on build reports 594 tests with zero failures and 114 skips; ViaProxy also builds successfully.
All 1,232 original core files match the add-on bundle, and all changed core classes match ViaProxy.
The reviewed artifact replacements preserve 26 unrelated distribution and Maven files, with rollback copies outside those directories.
These controls verify integration and do not establish visible native reference behavior.

**Confirmed separate gap:** Existing strict-BDS traffic contains small fireballs whose owner IDs resolve to their blaze shooters.
Java 26.3 projectile reconstruction reads ownership from spawn data, but ViaBedrock currently writes zero.
Tameable owner metadata does not supply projectile ownership.
Known-owner spawning, delayed owner arrival, owner changes, and client lifecycle handling remain required.
Raw traffic and client bytecode inspection remain private.

**Remaining:** Native visible reference behavior, active elder guardian and additional wither-head cycles, live tameable owner removal, and projectile ownership transport still need verification or implementation.
The current-boot native GPU guard remains in force.
All eight original groups and the complete movement, combat, item-use, block-action, inventory, network, and world-boundary matrix remain active.
Strict BDS remains the primary server reference; Boar diagnostics, native comparisons, CubeCraft, and actual Windows/macOS joins remain required.

### Projectile owner transport, October 7, 2026

**Implemented:** ViaBedrock now writes known projectile owners into Java 26.3 spawn data.
This includes fireballs, which ViaVersion groups outside its ordinary projectile metadata family.
The existing strict-BDS capture contains full-width negative owner IDs for small fireballs and their blaze shooters.
Those IDs now resolve without truncation.

Java has no standard packet for later projectile owner changes.
Core retains the authoritative native reference and publishes resolved changes on the independently advertised `viabedrock:projectile_owner_v1` channel.
The core also supplies the bounded wire codec and frontend dependency index.
The add-on uses Java's normal owner setter after checking source and target identities.
Both frontend arrival orders, owner unload and return, replacement, explicit clearing, disconnects, and world replacement have handling.
Client tracking callbacks include chunk unloading.
Local-player references require the actual current client player.

Java fishing bobbers normally discard themselves when they cannot resolve their owner.
On Bedrock connections, pending bobbers now remain available for authoritative server removal.
Reassignment clears the previous player's fishing pointer before assigning the new owner.
Ordinary Java connections retain their existing discard behavior.

**Automated verification:** Seventeen targeted tests pass on the full stack and on clean pinned upstream.
Eight new regressions cover real spawning across seven projectile families, late channel registration, both frontend arrival orders, removal, replacement, and malformed payloads.
The full core build reports 763 tests, zero failures, and 19 skips; Checkstyle passes.
The add-on reports 594 tests, zero failures, and 114 skips; ViaProxy builds successfully.
All 1,320 original core files match the add-on bundle, with only Loom's added Fabric metadata.
All 1,051 core classes match ViaProxy.

**Live verification:** Direct and ViaProxy clients reach initialization and spawn against strict BDS 1.26.51.1, build 51061372, protocol 2193.
Movement, incoming small-fireball contact, and fireball reflection pass on each route.
A read-only observer on each Java client's main thread records the fireball owner changing to the actual local player.
The corresponding native OWNER update changes from the ghast's ID to the player's ID.
The fixture removes its shooters after accepting launches, and the client observes unavailable owners afterward.
Both recorders exit successfully, and the owned server stops.
These six controls verify the sampled update and integration through both routes.
They do not establish native visible parity or an ordinary Java client without the add-on.
Nine reviewed artifact replacements preserve 26 unrelated distribution and Maven files, with rollback copies outside those directories.

The [core reference record](../patches/viabedrock/upstreamable/0094-clear-authoritative-entity-references.pr.md) and [client owner record](../patches/viafabricplus-bedrock/upstreamable/0027-apply-authoritative-projectile-owner-changes.pr.md) retain architecture and evidence.
Raw traffic, client observations, and bytecode inspection remain private.

**Remaining:** Native visible ownership and fishing comparisons, pickup, return, and complete projectile action behavior remain required.
The host has rebooted since the recorded native launch.
Its GPU safety marker now refers to that previous boot, and the supported read-only doctor still blocks launching.
The guard remains enabled while graphics recovery is unverified.
All eight original coverage groups and the complete gameplay matrix remain active.
Strict BDS stays the primary server reference.
Boar diagnostics, native comparisons, CubeCraft, and actual Windows/macOS joins remain required.

### Fishing targets and hook lifetime, October 7, 2026

**Implemented:** ViaBedrock now translates fishing-hook TARGET through standard Java `HOOKED_ENTITY` metadata.
Bedrock uses zero for no target and signed actor IDs for hooked targets.
Java uses zero for no target and Java entity ID plus one for a target.
The core dependency index resolves late targets after spawning and clears the attachment when a target disappears.
Explicit clearing, target replacement, and hook removal detach obsolete bindings.
This translation uses no new client channel or add-on code.

**Evidence:** Genuine rod input against strict BDS 1.26.51.1, build 51061372, protocol 2193 hooks a cow.
BDS sends the cow's large negative actor ID in TARGET.
The original direct client retains `HOOKED_ENTITY=0`, which leaves its fishing hook detached.
The original ViaProxy cast misses the cow, so that case does not verify target translation.
The rebuilt direct and ViaProxy clients attach to the actual cow with the correct Java offset.
After BDS removes the cow, Java clears the attachment and preserves the hook's player owner.
Read-only observers verify both water and entity cast/reel sequences on each route.
Reeling removes each hook and clears the actual local player's fishing pointer.
Both live clients use the add-on; the target translation itself uses standard Java metadata.

**Tests:** Two additional sequence regressions cover offset encoding, late arrival, unload, return, clearing, replacement, and source removal.
They serialize translated metadata through the Java codec.
All nineteen focused tests pass on the full stack and independently on pinned upstream.
The full core build reports 765 tests, zero failures, and 19 skips.
The add-on reports 594 tests, zero failures, and 114 skips; ViaProxy also builds successfully.
Bundled core files match both downstream artifacts.

**Remaining:** Complete native fishing visuals, bite events, fishing rewards, retrieval with a live target, enchantments, repeated use, and interrupted use remain required.
Water casts and reeling do not establish those behaviors.
The water baseline also contains actor events 12, 13, and 14 while Java's observed biting field remains false.
Their target-build behavior needs native verification before translation.
Ordinary Java live coverage, the complete projectile matrix, all eight coverage groups, native baselines, CubeCraft, and platform joins remain required.

### Fishing retrieval controls, October 7, 2026

**Verified server behavior:** Both routes complete three genuine rod sequences against the same strict BDS build.
Early water retrieval gives no reward and consumes no durability.
Retrieval immediately after native actor event 13 gives one cod and consumes one durability point.
Retrieval of a live hooked cow pulls it toward the player and consumes three durability points.
The server inventory, target motion, hook removal, and actual Java attachment establish these sampled outcomes.
These checks do not establish the client's displayed reward inventory or complete fishing visuals.

**Reusable controls:** `fishing-early-reel` and `fishing-entity-reel` use real mouse input in the complex gameplay suite.
Their server observations require one cast, one reel, the same hook's removal, no surviving hook, and the expected durability.
The entity control also requires an undamaged, live target with motion toward the player after retrieval.
It rejects an already moving target, missing observations, stale frames, extra rewards, and incorrect durability.
The fixture requires one player and an empty arena before creating its target.
It collects target frames after casting, so waiting for the HUD cannot exhaust the observation window.

The first reusable water control hooks a cow left by the earlier private fixture and fails with three durability points.
Its native TARGET identifies that surviving cow.
This is fixture contamination; the failed evidence remains private and the control retains its zero-durability requirement.
The isolation check also detects retained test actors after restarting BDS.
Arena preparation now removes tagged test actors from the fixture world before creating the first arena.
It preserves untagged actors and rejects an occupied fishing arena.
The regression check requires cleanup on that first preparation and preserves the existing refusal to mutate dead players.
The rebuilt fixture passes both retrieval controls directly and through ViaProxy.
Native packet observations identify the fixture's exact cow; Java observers verify its attachment and hook cleanup.
All 23 focused tooling tests pass, and the complete tooling run reports 157 passing tests with no failures.

**Client gap:** BDS sends approach, bite, and tease events 12, 13, and 14 for the water hook.
Java's actual biting field remains false, including during the successful catch.
Core still discards these events.
Native effect timing, expiry, particles, sound, and visible comparisons remain necessary before implementing faithful feedback.
The catch driver reacts to the recorded native bite event; it does not prove that a player can recognize the bite visually.

**Remaining:** Native visible parity, displayed rewards, ordinary Java live coverage, enchantments, repeated casts, interruptions, and the complete fishing matrix remain required.
All eight coverage groups, strict BDS, Boar diagnostics, both routes, CubeCraft, and actual Windows/macOS joins remain active.

### Native fishing feedback, October 7, 2026

**Verified executable behavior:** The matching Windows client handles events 12, 13, and 14 in its fishing-hook event function.
Type information and a virtual table in the matching Linux BDS identified the corresponding server function.
Shared particle hashes then identified the Windows function.
A Ghidra session decompiled that function without changing the saved program.
The executable hashes and all proprietary instructions remain in private research artifacts.

The event 13 handler produces these results:

| Result | Native behavior |
| --- | --- |
| Hook motion | Add `-0.5F` to the existing vertical velocity, with float arithmetic. Horizontal velocity stays unchanged. |
| Sound | Call the native sound helper with event argument 26 and the actor position. Audio resolution remains unverified. |
| Effect position | Use the actor's X/Z and `floor(boxMinY) + 1F`. Negative fractional heights use floor. |
| Direction variable | Construct `variable.direction` from `(20F * boxWidth + 1F, 0F, boxWidth)`. |
| Effect order | Emit `minecraft:fish_hook_particle`, then legacy particle event 27, then `minecraft:water_wake_particle`. |
| Legacy effect | Event 27 uses that position and direction. Its particle factory still needs verification. |

**Native execution:** 108 cases execute the event dispatch, float impulse, shared reference operations, and sound arguments.
Another 90 cases execute the entire bite handler across six heights, five widths, and three starting velocities.
These cases verify the ordered effect calls, positions, width arithmetic, and arguments for direction construction.
The supplied provider records the calls.
Molang storage, string construction, particle simulation, and sound resolution use explicit fixture boundaries.
The fixtures do not establish the displayed result, subsequent hook physics, or resource availability.

**Implementation decision:** This handler does not start a fixed bite timer.
A Java biting flag with an assumed duration does not reproduce this handler.
The existing false Java flag alone does not establish which native state needs translation.
Core must translate the actual events, metadata, effect positions, variables, and sound behavior.
The existing native particle transport can carry the effects through ViaProxy.
An additive impulse requires the client's current hook velocity and must preserve native float rounding.
Subsequent physics and any state outside this handler still need verification.

**Scope of these fixtures:** Native execution alone does not establish production translation or visible native parity.
Events 11, 12, and 14, audio resolution, particle playback, hook physics, catch inventory display, and both client routes remain open.
The complete fishing matrix, ordinary Java coverage, all eight coverage groups, Boar diagnostics, CubeCraft, and actual Windows/macOS joins remain required.

### Fishing bite impulses, October 7, 2026

**Implemented:** ViaBedrock now decodes native bite event 13 and checks that its actor is a fishing hook.
It sends the resolved Java entity ID and spawn UUID through `viabedrock:fishing_event_v1` when the client advertises that capability.
The codec validates its version, protocol, size, identity, and trailing data.
The add-on uses the hook's current motion on the client thread.
It applies the native float impulse and preserves both horizontal components.

A standard Java packet cannot express an additive impulse without replacing the client's local velocity.
The callback therefore supplies the client operation, while core owns decoding, actor resolution, capability routing, and float arithmetic.
The callback requires the active connection, a live fishing hook, and the matching spawn UUID.
It retains no timer or pending state.
Java's unrelated biting timer remains unchanged.

**Native comparison:** The production helper matches all 108 bounded native impulse cases bit for bit.
The full core build reports 767 tests, zero failures, and 19 optional skips.
The add-on build reports 594 tests, zero failures, and 114 optional skips.
ViaProxy builds against the same core artifact.
The exported 97-patch core stack replays successfully.
The metadata patch changes only replay context, and the standalone entity reference patch remains byte-identical.

**Live verification:** Genuine casts produce native event 13 against strict BDS 1.26.51.1, build 51061372, protocol 2193.
A private observer records the original hook setter on the render thread.
It preserves the original arguments and does not supply gameplay values.
On the direct route, vertical motion changes from `-0.011957276348685734` to `-0.5119572877883911`.
Through ViaProxy, it changes from `-0.02294432376807235` to `-0.5229443311691284`.
Both results match native float arithmetic, and horizontal motion stays unchanged.
Each route rejects messages with another spawn UUID, another entity type, and another connection without changing hook motion.
Early reeling gives no reward or durability damage on either route.
Bite-triggered reeling gives one cod and one durability point.
Reeling a live cow pulls the target and uses three durability points.
All six casts remove their hooks and clear the actual local player's fishing pointer.
Both recorders exit successfully, and the owned BDS stops.
These server reward observations do not establish the client's displayed reward inventory.

The first test observer failed because Fabric could not load its callback class.
That attempt supplies no positive motion evidence.
The corrected observer resolves its callback through the system class loader, and the fresh runs supply the results above.

**Remaining:** Events 11, 12, and 14, bite particles, audio resolution, later hook physics, and native visible comparisons remain required.
Displayed rewards, ordinary Java feedback, enchantments, repeated casts, interrupted use, and the complete fishing matrix remain open.
All eight coverage groups, strict BDS, Boar diagnostics, CubeCraft, and actual Windows/macOS joins remain required.

### Fishing splash and actor sound arguments, October 7, 2026

**Implemented:** Native bite event 13 now sends splash feedback through the standard core sound path.
The sound follows the optional motion message and does not require that capability.
The shared actor sound method suppresses silent actors and preserves baby flags, actor definitions, and full signed unique IDs.
It supplies data `-1`, which prevents absent block data from selecting block palette index zero.
Existing hurt and death callers use the same corrected method.

**Native verification:** Another 72 cases execute the matching sound helper, flag lookup, and actor identifier constructor.
They cover six flag combinations, four signed identities, and three positions.
Silent bit 17 suppresses sound. Neighboring bits 16 and 18 do not suppress it.
Baby bit 11, actor positions, actor identities, event 26, data `-1`, and the non-global argument match.
Actor definition and identity getters use explicit provider boundaries.
These cases do not execute audio selection, sample playback, captions, or particle simulation.

The adjacent fixed headers identify [Splash as 26](https://github.com/LiteLDev/LeviLamina/blob/455c4181b5f83d04689957e8aad17790581c0fc0/src/mc/deps/shared_types/legacy/LevelSoundEvent.h).
The [actor identifier layout](https://github.com/LiteLDev/LeviLamina/blob/455c4181b5f83d04689957e8aad17790581c0fc0/src/mc/world/actor/ActorSoundIdentifier.h) supplies a research lead.
The matching executable establishes the behavior for build 51061372 and protocol 2193.
All proprietary instructions and captures remain private.

**Build verification:** The full core build passes 768 tests, with zero failures and 19 optional skips.
The add-on reports 594 tests, with zero failures and 114 optional skips.
ViaProxy builds against the same core, and all 1,240 non-manifest core entries match in both clients.
The 97-patch core stack replays successfully.
The metadata patch changes only context, and the standalone entity reference patch remains byte-identical.

**Live verification:** Real casts against strict BDS produce native bite event 13 on all three routes.
The routes use the add-on directly, the add-on through ViaProxy, and stock Java through ViaProxy.
The stock profile contains Minecraft and LWJGL, with no Fabric, VFP, add-on, or recorder mod.
It joins after acceptance of the normal resource-pack prompt.

Each route receives one bite splash at volume `0.25`, with pitch inside the configured range.
The sound engine receives the packet's exact position, volume, pitch, and player category on the render thread.
Playback is non-relative, non-looping, and has no delay.
The resolved Java samples are `minecraft:liquid/splash` or `minecraft:liquid/splash2`.
Master volume remains zero, so these checks do not establish audible output or native sample and caption parity.
Standard packets quantize position to eighths of a block. Native local hook position remains a separate comparison requirement.

All three routes pass real early-reel, bite-reel, and live-cow retrieval controls.
Early reeling gives no reward or durability loss. Bite reeling gives one reward and uses one durability point.
Cow retrieval pulls the target and uses three durability points.
Actual Java hook metadata attaches to the cow on each route.
All nine hooks disappear, and the actual local fishing pointers clear.
Server reward observations do not establish the client's displayed inventory.
The recorders exit successfully, and the owned BDS stops.
The private fixture returns to its original checksum. Existing BDS and ViaProxy processes remain unchanged.

The first observer queried volume before the sound engine resolved its sample.
Its packet records are valid, but that observer supplies no positive engine evidence.
Fresh runs use a corrected observer after the original engine method returns, without changing gameplay arguments.

**Remaining:** Events 11, 12, and 14, all three native particle calls, later hook physics, and native visual comparisons remain required.
Native audio samples, captions, displayed rewards, enchantments, repeated casts, interruptions, and the full fishing matrix remain open.
Ordinary Java splash and these hook controls are verified. Complete ordinary Java fishing feedback remains required.
All eight coverage groups, the full gameplay matrix, Boar diagnostics, CubeCraft, and actual Windows/macOS joins remain required.

## Fishing particle forwarding, October 7, 2026

Native bite event 13 emits one hook effect and two wake effects.
Legacy particle 27 forwards to `minecraft:water_wake_particle`; deduplicating it would remove one emission.
The matching client tables and fifteen bounded native forwarding cases establish this route.
The [actor-event patch notes](../patches/viabedrock/deferred/0001-translate-bedrock-actor-events-to-java-statuses.pr.md#fishing-particle-dispatch) retain the fixture boundaries.

Core owns the effect list, native float calculations, and standard Java wake translation.
The add-on samples the current hook box for the surface origin and unnormalized direction vector.
Each native emitter receives separate Molang state and a fixed world origin.
Missing licensed wake resources use Java fishing particles; unavailable hook resources have no Java mapping.
World changes prevent delayed fallback creation.
Cold resource and Molang preparation runs off the render thread, with at most 32 pending requests.
Completion checks both the world and resource generation.
The earlier synchronous path delayed the observed render callback by about 850 ms and disrupted rod input.

Core reports 769 tests, with zero failures and 19 optional skips.
The add-on reports 594 tests, with zero failures and 114 optional skips.
ViaProxy builds against the same core; 1,240 core entries match both client bundles, excluding bundle metadata.
All 97 core patches replay, and the reference patch still applies alone upstream.
Thirty production surface/width combinations cover negative fractional heights and the native float vector.
The fifteen native branch cases exclude whole emitter entry, TLS, resource lookup, simulation, and visible output.

Another 240 native boundary cases establish the legacy distance calculation with supplied provider getters.
Its native settings defaults and client mapping remain unverified.
Fresh strict BDS runs on Linux verify direct/add-on, ViaProxy/add-on, and ViaProxy/ordinary Java controls.
Each add-on starts one hook emitter and two independent wake emitters with direction `(6, 0, 0.25)`.
Ordinary Java receives two standard fishing wake packets at the same integral surface.
The stock profile has no Fabric, VFP, add-on, or recorder mod.
Each route completes early reeling, a native bite with one server inventory reward, and cow retrieval.
Rod durability changes are 0, 1, and 3 respectively; all nine hooks disappear and clear the local fishing pointer.
Actual cow attachment metadata and the existing splash sound path remain verified.
Packet-to-render splash delays are about 15 ms direct and 28 ms through ViaProxy in these fresh runs.
Emitter startup does not establish visible native particle parity or displayed reward parity.

Production distance gates, particle simulation, audio/particle timing, local-position comparisons, and complete visible parity remain required.
Ordinary Java's null hook mapping and particle limits remain fallback limitations.
The full fishing action matrix and all other gameplay requirements remain in scope.

## Fishing particle distance, October 7, 2026

Core now supplies native legacy distance calculations and continuous option semantics.
The add-on samples the rendered camera and exposes a persisted particle render-distance slider.
The native default is zero; the range is zero to one, with a change tolerance of `0.001F`.
The raw chunk setting and this particle setting remain independent.
Only the legacy wake uses the gate; the hook effect and final named wake retain their own paths.

Fifty-two bounded native option cases verify initialization, clamping, change tolerance, infinities, and NaN.
Another 480 cases execute the complete legacy gate and the actual camera and setting getters.
Production Java matches every distance decision and threshold bit pattern.
The [core patch notes](../patches/viabedrock/deferred/0001-translate-bedrock-actor-events-to-java-statuses.pr.md#native-legacy-particle-range) record fixture boundaries and target addresses.
Camera setup, graph lookup, simulation, and visible output remain outside those execution fixtures.

Twelve additional native getter cases cover mixed axes, fractional camera offsets, and large coordinates.
Production tests preserve their float bits, including axis-dependent addition rounding.

Core reports 772 tests with zero failures and 19 optional skips.
The add-on reports 596 tests with zero failures and 114 optional skips.
Persistence tests preserve continuous values, reject invalid stored types, and clamp admitted numeric values.
Both stacks replay, and all 1,241 core entries match the add-on and ViaProxy bundles, excluding bundle metadata.

Fresh strict BDS runs on Linux verify near/default, far/default, and far/full controls through direct and ViaProxy routes.
The direct recording contains 32 native bite events; ViaProxy contains nine.
Each event has the expected distance decision and two or three independent native emitter starts.
Both use raw render distance 12. A 50-block rendered-camera offset rejects the default legacy wake and admits it at full distance.
Settings search, mouse, keyboard, and reset controls work in the actual client.
After clearing the camera, real reeling gives one server inventory reward, one durability point, and no remaining hook on each route.
The private fixture returns to its original checksum, and both user-owned servers remain unchanged.

Visible native comparisons, named-emitter range behavior, Java fallback limits, and complete fishing parity remain required.
All eight coverage groups, the full gameplay matrix, strict BDS, Boar diagnostics, real servers, and platform joins remain in scope.

## Fishing particle frame scheduling, October 7, 2026

The shared renderer now applies the pinned PC particle engine's two-frame scheduling to fishing effects.
Dynamics updates consume accumulated time after each incoming frame applies its native elapsed cap.
Render output interpolates motion and appearance through separate counters.
It preserves newborn initialization, current UVs, float tint precision, and native startup visibility.
Short-lived particles retain the extra forced appearance preparation.

Native execution covers 240 scheduling frames, 72 appearance cases, and 180 position cases.
The [owning patch notes](../patches/viafabricplus-bedrock/upstreamable/0009-show-saved-character-creator-slots.pr.md#native-particle-frame-scheduling-october-7-2026) record target addresses, supplied boundaries, and runtime sequences.
The full add-on build passes 601 tests, with zero failures or errors and 69 optional skips.

Fresh Linux strict BDS runs exercise actual rod input through direct and ViaProxy connections.
The observer records 667 particle render frames directly and 942 through ViaProxy.
Their update cadence, startup visibility, and independent interpolation factors match the native counter schedules.
Another 733 halfway-position triplets match production world-space output within the documented float rounding allowance.
Both casts remove their hooks. The ViaProxy cast also records one durability point.
These observations cover renderer extraction, not final GPU pixels or native image parity.
The direct run ends after its controls through the recorder's cancellation path.
The ViaProxy run ends through the reviewed private completion marker.
Both preserve spawn and gameplay evidence. The cancellation exit is not a connection failure.
The final artifact passes a fresh direct BDS join after removal of the unused partial-tick argument.
It verifies another 222 render frames and 100 halfway-position triplets.
The fixture returns to its original checksum, and both user-owned servers retain their process identities.

Complete fishing physics, particle behavior, audio timing, captions, displayed rewards, and native visual comparisons remain required.
Ordinary Java fallback limits, mixed actions, account and platform checks, and every other goal requirement remain in scope.

## Fishing approach and tease feedback, October 7, 2026

**Implemented:** Core now handles approach event 12 and tease event 14 alongside bite event 13.
The generalized fishing capability carries the hook's Java spawn identity and retained float fish metadata through direct and ViaProxy routes.
Core owns event decoding, native surface and direction calculations, probability, ordering, and ordinary Java translations.
The add-on samples the current local hook box and primary water block for native playback.
Each approach wake receives a separate Molang direction. Named fish-position emissions bypass the legacy range gate.
Tease emits its named splash only when the sampled primary block is water.

**Verified:** The pinned Windows handler executes 720 approach and tease cases.
Production products match their float positions, directions, counts, and call order.
The cases cover negative heights, wrapped angles, absent or incorrectly typed metadata, the exact probability threshold, water, and dry blocks.
Five event-11 cases execute the real fishing and base Actor dispatch without effect calls.
The native fixture supplies provider virtuals, random samples, the float sine table, CRT floor, and opaque Molang storage.
It does not execute GPU drawing or later hook simulation.

Fresh strict BDS casts verify direct/add-on and ViaProxy/add-on production paths on Linux.
Bounded observers verify 185 direct events and 341 proxy events against their original returned emission products.
These include 281 changing approach offsets and both water and dry tease decisions.
The observers retain 13,699 nonempty wake frames and 968 nonempty fish-position frames across both routes.
Both actual reels remove the hook, and both recorders finish successfully with spawn and movement acknowledgments.
The direct frame cap also limits its event observation; these counts describe observed prefixes.
The final proxy build contains the same 1,243 core content files as the final add-on bundle.

**Incomplete:** Tease splash requests reach the renderer but produce no visible vertices in these runs.
Their native visual comparison and graph lifetime behavior remain open.
Full pixels, further block-material classifications, extreme finite angle casts, rewards, captions, later physics, and the complete fishing matrix remain required.
These results do not establish full fishing parity or replace any other gameplay requirements.

The ordinary Java 26.3 profile has no Fabric loader, VFP, add-on, or recorder mod.
After accepting the normal resource-pack prompt, it receives 256 directional wakes for 128 approach events, six wakes for three bites, and four tease splashes.
The observer confirms opposing approach pairs, integral splash origins, count zero, and unit speed on all three axes.
Its recorder finishes with spawn and movement acknowledgments.
A later reel command arrives after the recorder stops its display, so this run does not verify stock retrieval.
The hook disappears on disconnect. Stock fish-position graphs and complete visible parity remain unavailable or unverified.

## Native trigonometry boundaries, October 7, 2026

Core now preserves the native float-to-integer conversion used by the shared sine lookup.
NaN and overflowing products select entry zero instead of Java's saturated positive index.
The cosine shift occurs before its own conversion check.
The table constructor now divides each integer index by `10430.378F` before sine evaluation.
Multiplication by the rounded reciprocal disagreed with 8,554 entries in the captured target table.

The pinned fishing lookup executes 3,200 inputs covering every float exponent, conversion boundaries, signed zero, subnormals, infinities, and NaNs.
Production matches the executed indices and the initializer with its supplied sine boundary exactly.
The complete native initializer executes all 65,536 float divisions and stores.
Stack probing, byte copying, and the imported sine function remain supplied.
The initial supplied function rounds double sine to float; 86 entries differ from the captured Wine runtime table.
Initial tests check the supplied initializer exactly and the captured values within one float ULP.
The Windows follow-up below replaces that supplied sine boundary. No captured table enters production.

The corrected table also matches 8,732 executed glide cases with and without rocket boosts.
These cover turns, ascent, descent, angle seams, slow falling, and differing previous rotations.
Their native kernel retains supplied status slots, boost components, CRT remainder, and the corrected table.
One portable glide expectation changes by one float bit after correcting its reference table.
The 720 fishing approach and tease cases also pass with the corrected initializer.
These arithmetic checks do not establish complete movement, fishing, or visible parity.

## Fishing tease splash expiration, October 7, 2026

The licensed target splash graph expires particles outside `minecraft:air`.
Its point shape places a new particle half a block above the integral tease origin.
Water at that sampled cell therefore expires the particle; air retains it.
This follows the [documented block-expiration predicate](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponents/minecraftparticle_expire_if_not_in_blocks?view=minecraft-bedrock-stable).
The target asset and executed native predicate establish the version-specific result.

Twenty native controls use recorded tease origins, negative heights, water, and air.
They execute the real predicate, origin getter, cache flag, and hash membership.
Prepared block identities, the resolved air set, and CRT floor remain supplied.
The production test loads the licensed graph privately and verifies its birth offset, block query, survivor count, expiration, and available visuals.
A zero-time update isolates birth and expiration; it does not reproduce the full native frame scheduler or collision sequence.

This explains the empty simulation output at water cells without removing the native asset's expiration rule.
Full native scheduling, collision, final pixels, audio, later fishing physics, and the complete gameplay matrix remain required.
No new live-server, CubeCraft, Boar, Windows, or macOS join is claimed by these component checks.

Validation: core passes 779 tests with 19 optional skips, and the add-on passes 602 tests with 69 optional skips.
Both counts include the new private reference checks, with no failures or errors.
Core, add-on, and ViaProxy builds pass. Both standalone reference PR checks pass.
The final add-on and ViaProxy bundles retain all 1,243 core content files byte-for-byte, excluding bundle metadata.
Reviewed artifact replacements preserve 32 unrelated files and keep private rollback copies. No service restarts occur.

## Windows sine-table verification, October 7, 2026

The captured Linux native-client table uses Wine's `sinf`, not Microsoft's Windows runtime.
Executing Wine's complete function reproduces all 65,536 captured entries exactly.
The installed Windows guest supplies official UCRT `10.0.26100.9444` through a read-only disk extraction.
Its complete SSE function differs from Wine at one entry and from rounded double sine at 85 entries.
Independent hardware executions of the Windows SSE and FMA paths produce identical tables.

The pinned game's complete initializer now executes with the official Windows sine import in one emulated address space.
Only stack probing and the final byte copy remain supplied.
A portable producer matches every resulting float bit through bounded range reduction and polynomials.
Its arithmetic derives from [AMD's BSD-licensed AOCL-LibM implementation](https://github.com/amd/aocl-libm-ose/blob/29fd054f383e6c5e2dec2fce781d5220059f1836/src/isa/avx/masm/sinf.asm).
The source and packaged resources retain the license notice.
Production ships no runtime DLL, captured table, or dependency on a Bedrock installation.

Nine portable controls distinguish Windows rounding from rounded double sine and Wine.
The private all-entry test verifies the complete production table against the linked native initializer.
Reexecuting 8,732 glide cases and 720 fishing approach and tease cases uses the Windows table.
The glide comparison matches every production motion bit, including boosted cases.
These probes still supply status slots, boost components, random samples, world getters, and other documented boundaries.
Windows process initialization, other runtime versions, Android and console math, live movement, and complete visible parity remain separate requirements.

Validation: core passes 781 tests with 19 optional skips. The add-on passes 602 tests with 69 optional skips.
Both suites report no failures or errors. Core, ViaProxy, and add-on builds pass.
Both standalone reference PR checks pass, and the complete 97-patch core stack replays from its pinned base.
Both downstream bundles retain all 1,246 core files byte-for-byte, excluding the JAR manifest, including the AMD license.

Reviewed artifact replacements preserve 32 unrelated files per project and retain private rollback copies under `.stackanvil/research/fishing-feedback/crt/build-rollback/`.
No service restarts or new live-server joins occur in this verification.

## Confirmed geyser movement and local Java lift, October 7, 2026

**Implemented:** Core owns the geyser calculation and confirmed effect timeline.
The add-on supplies local block, fluid, and collision observations at the start of player travel.
It excludes the local Bedrock player from Java's geyser launch ticker, including its fall-distance reset.
The existing movement-effect channel carries confirmations through direct and ViaProxy connections.

The pinned 1.26.51.1 callback `146655f00` checks the Flying ability and scans the body-center block column.
It queries 24 downward cells and then considers the following cell as a final candidate.
Only erupting or continuous potent sulfur qualifies.
One to four contiguous source-water cells select speed limits `0.4F`, `0.5F`, `0.6F`, and `0.7F`.
Extra-layer water counts only when the main collision box is empty.
A colliding cap or source liquid above the column rejects the boost.
This source-liquid check includes lava.
Below the selected height limit, motion below its speed limit gains `0.2F`.
The check precedes addition, so the resulting motion can exceed that speed limit.

**Native verified:** The original callback and helpers `149951440`, `1499514e0`, `1499518f0`, and `1430167b0` execute unchanged.
All 6,780 controlled cases match the production Java result bit for bit.
Fixtures supply block lookup, collision AABBs, dispatch, floor rounding, component storage, and packed block properties.
Native property lookup, Flying admission, profile selection, cap checks, and the motion update execute inside the original instructions.
Cases include inactive effects, all sulfur states, both water layers, source and flowing liquids, obstructions, negative coordinates, and speed limits.
Portable tests retain scan, height, overshoot, effect-lifecycle, and fluid-adapter controls.

**Incomplete or unverified:** These checks do not establish complete native world trajectories or client phase ordering.
Speculative local geyser admission, server confirmation timing, native fall-distance behavior, correction replay, and live boosted route comparisons remain required.
Stock Java motion, mixed fluids, vehicles, Boar, CubeCraft, platform joins, and the full gameplay matrix also remain in scope.
Private executable, Ghidra, and fixture evidence stays under `.stackanvil/research/geyser-boost/`.

**Regression checks:** The full core suite reports 787 tests with no failures or errors; 19 optional fixture tests skip.
The add-on reports 605 tests with no failures or errors; 117 optional fixture tests skip.
All three new client fluid-adapter tests execute.
Core and add-on patch replay and standalone PR checks pass.
ViaProxy builds against the updated core.
All 1,249 embedded core files match in both client and proxy bundles, excluding their bundle-specific manifest.

The current client spawns through ViaProxy on strict BDS 1.26.51.1 and remains connected for 20 seconds.
An ordinary Java 26.3 connection also completes the same stability check.
Runtime inspection confirms that both the sulfur ticker wrapper and the player travel injection transform their intended classes.
These connection checks do not exercise an active geyser or establish ordinary Java geyser motion.

## Local geyser admission investigation, October 7, 2026

**Observed failure:** The strict BDS fixture sends geyser effects with tick `0` and duration `100`.
Before this change, all ten observed confirmations had no client-frame binding.
None of the 173 observed travel calls had an active local geyser effect.
Upward server corrections did not prove local geyser physics worked.

**Implemented:** Core now reproduces local sulfur admission and the 100-frame effect refresh.
The add-on supplies actor bounds from the sulfur block ticker before Java checks its launch range.
Admission uses strict overlap with a one-block-wide column, from the sulfur base to `baseY + 6 * waterDepth`.
This range differs from the subsequent body-center lift check and its upper limit.
Refresh preserves longer and infinite active effects.
The local Bedrock actor still skips Java's launch impulse and fall-distance reset.

**Native evidence:** The original `144ae5140` producer and water-column helpers produced all 32 expected admission AABBs.
Cases cover both active sulfur states, all four profiles, negative coordinates, and large coordinates.
The fixture supplies block getters, collision boxes, dispatch, and client-level access.
Execution stops at the actor query. It does not execute native actor selection, scheduling, or complete world motion.
The existing 6,780 native lift cases still match the refactored core rule.

The native incoming handler `14133f140` applies effects directly to actors without replay state.
With replay state, `143281540` adjusts durations and `142890810` dispatches history commands.
Tick zero does not select a universal receipt-time deadline in this path.
The production timeline still needs complete confirmation-command replay and native phase verification.
Local admission fixes a separate missing production step.

**Regression checks:** The core build passes 790 tests, with 22 optional skips and no failures or errors.
The complete add-on build passes 605 tests, with 117 optional skips and no failures or errors.
The core native geyser reference test executes.
Both patch stacks replay, ViaProxy builds, and all 1,249 embedded core files match both bundles.
Artifact dry runs review nine exact replacement paths. Every replacement preserves the other 32 inventory entries.
Private rollback copies remain under `.stackanvil/research/geyser-live/artifacts/build-rollback/`.
Private client rollback copies remain under `.stackanvil/research/geyser-live/java-client-rollback-5/`.

**Live verification:** The current client joined strict BDS 1.26.51.1 through ViaProxy and stayed connected for 20 seconds.
The observer recorded 375 paired travel phases, including 89 active geyser phases and 36 velocity changes.
Every changed velocity matches the native float addition of `0.2F` bit for bit.
After the server removed the source, all 276 control phases left vertical velocity unchanged.
The retained effect was active for the first 20 control phases and inactive from completed frame 118 onward.
The observer supplied no client effect, input, or velocity values.
These observations verify this local lift path. They do not establish complete native trajectories or correction replay.

The fixture starts with an inactive source and waits for the client frame clock before activating the geyser.
An earlier driver activated the source before loading finished. BDS lifted the actor outside the admission range before observation began.
The final inventory contains the same 11 files. Only the launcher launch-time field and game log changed.
The private display and owned processes stopped. Both existing user servers retain their original process identities.

**Still required:** Complete native trajectories, actor selection, phase ordering, fall distance, history replay, and delayed confirmations.
Direct route comparisons, stock Java movement, mixed terrain, vehicles, Boar, CubeCraft, and actual platform joins remain required.
The full gameplay matrix and all other goal requirements remain open.
Private evidence remains under `.stackanvil/research/geyser-live/`.

## Native movement-effect command ordering, October 7, 2026

**Observed failure:** The native removal, activation, and infinite-effect sequence produced three different results from the old production timeline.
Core rejected each older confirmation because it retained the latest packet tick as an ordering timestamp.
A bounded comparison also found 720 differences across 1,944 synthetic command states.
This comparison covers component state. It does not count reachable gameplay failures or establish full movement parity.

**Native evidence:** The pinned 1.26.51.1 binary passes 16,038 constructor and application cases.
The original functions are `143281540`, `143298740`, and `143298970`.
They clamp durations below `-1` to zero and preserve infinite duration `-1`.
Finite adjustment uses unsigned tick comparison and signed 32-bit subtraction.
A change between active and inactive state forces application despite an older ordering timestamp.
Application clears that timestamp. Local prediction can set it again.

The original `142890810` dispatcher passes 3,521 cases with missing, partial, and complete fixture history.
It clamps selection to the oldest retained tick, distinguishes history and fallback paths, and marks the next retained frame dirty.
The original packet tick remains in the command after this selection.
A combined fixture passes 6,144 cases through the constructor, dispatcher, live application, and `142bbcd70` ring insertion.
It preserves each command's virtual table and records insertion into retained frames or the pending command vector.
A tick-zero command with duration 100 and clock 53 retains duration 47 in this fixture.
Tick zero therefore does not imply either permanent inactivity or a fresh receipt-time duration of 100.

The fixtures supply allocation, component storage, dispatch, preallocated frame arrays, and a replay-controller result.
They do not execute complete rewind, later queued callbacks, native actor creation, scheduling, or world trajectories.
Private evidence remains under `.stackanvil/research/movement-confirmation/`.

**Implemented:** Core now separates a local prediction frame from the confirmation's wire tick.
Mapped confirmations can force a state transition and clear local ordering state after admission.
Older confirmations no longer fail a blanket latest-packet-tick check.
Core snapshots retain packet arrival order.
Infinite effects remain active without a frame binding because they require no expiration deadline.
A finite effect with an unknown frame still requires an explicit input-clock reference for native duration adjustment.
The existing add-on consumes the shared core timeline.

**Verification:** The same stateful native countdown sequence now matches all four production observations.
Tests cover older removal, older activation, infinite duration, local prediction protection, forced transitions, and packet arrival order.
The owning core patch contains the fix. The full stack replays all 97 patches.

**Still required:** Transport the explicit native input-clock reference and retain commands for full history application.
Reproduce missing-frame, evicted-frame, future-tick, wraparound, and replay-controller behavior.
Verify correction replay, phase ordering, complete native trajectories, direct connections, and ViaProxy under latency.
Keep stock Java, vehicles, mixed terrain, Boar, CubeCraft, actual platform joins, and the full gameplay matrix in scope.

**Build and live regression:** Core passes 791 tests, with 22 optional skips and no failures or errors.
The add-on passes 605 tests, with 117 optional skips and no failures or errors. ViaProxy also builds.
Both upstream PR checks pass. All 1,250 core files match the client and proxy bundles, excluding each bundle's manifest.
A fresh strict BDS join through ViaProxy stays connected for 20 seconds.
The observer records 375 paired travel phases, 89 active geyser phases, and 36 bit-exact native float lift changes.
All 278 phases after source removal leave vertical velocity unchanged. The retained effect subsequently expires.
This check verifies the existing lift path after the ordering change. It does not verify complete native replay.

Dry runs review nine exact artifact replacements and the managed client fixture.
Each artifact replacement preserves the other 32 inventory entries.
The final client inventory contains the same 11 files. Both managed add-on copies match the reviewed artifact.
The launcher changes only its launch-time field and game log. Seven other inventory files remain unchanged.
Rollback copies remain under `.stackanvil/research/movement-confirmation/artifacts/build-rollback/` and `.stackanvil/research/movement-confirmation/java-client-rollback-1/`.
The private display and owned processes stop. Both existing user servers retain their original process identities.


## Past movement effects without a retained frame, October 7, 2026

**Implemented, with remaining replay gaps:** Core retains the latest emitted input tick and its matching completed client frame.
An input without a matching prediction invalidates the frame binding. Canceled inputs do not create clock references.
The negotiated `viabedrock:movement_effect_v2` payload carries this pair for the local player, plus the original effect and exact history binding.
The existing add-on reads the shared core codec and timeline. This state also travels through ViaProxy.

For past confirmations, core uses unsigned tick ordering and the native signed 32-bit duration calculation.
It then ages the remaining duration from the paired frame. It does not invent an evicted frame identity or a receipt-time deadline.
Tick-zero startup effects can remain active, and long effects can survive eviction of their original frame.
Repeated snapshots do not renew duration. Local geyser admission preserves a longer adjusted remainder.
An expired confirmation can force removal of a locally predicted effect.

**Native evidence:** The pinned 1.26.51.1 executable again passes all 16,038 constructor and application probes.
The production duration calculator matches every constructor result, including signed duration overflow and unsigned 64-bit tick boundaries.
The native reference test executes locally. These probes do not execute complete world movement or history rewind.
Private evidence remains under `.stackanvil/research/movement-clock/`.

**Regression checks:** Core passes 795 tests, with 22 optional skips and no failures or errors.
The add-on passes 605 tests, with 117 optional skips and no failures or errors. ViaProxy also builds.
The full core stack replays 97 patches. Both upstream PR checks pass.
All 1,250 core files match the add-on and proxy bundles, excluding the manifest.
The fix stays in the owning core patch; no add-on source change or later repair patch is necessary.

**Still required:** Unbound future commands, invalidated clock bindings, queued command application, replay-controller scheduling, and complete physics rewind.
Confirm actor replay-component creation and native simulation phase ordering.
Verify delayed confirmations, gaps during client/server tick stalls, and complete native trajectories through direct connections and ViaProxy.
Keep stock Java, vehicles, mixed terrain, Boar, CubeCraft, actual platform joins, and the full gameplay matrix in scope.


**Live transport regression:** A fresh strict BDS 1.26.51.1 join through ViaProxy stays connected for 20 seconds.
The observer records all seven effect fields in 12 confirmations. Every confirmation includes a paired input clock.
The input tick is 33 ahead of the paired client frame. Receipt observes zero or one additional completed frame.
These observations verify transport of distinct clock identities. They do not verify complete delayed-command replay.
The run records 368 paired travel phases, 90 active geyser phases, and 36 bit-exact native float lift changes.
All 269 phases after source removal leave vertical velocity unchanged. The retained effect subsequently expires.
The observer supplies no client effect, input, or velocity values.

Artifact dry runs review nine exact replacements. Each replacement preserves the other 32 inventory entries.
The client dry run reviews 2,689 fixture/helper source files and 11 existing client inventory files.
The final client inventory still contains 11 files. Both managed add-on copies match the reviewed artifact.
Only those copies, the launcher launch-time field, and the game log change. The seven other files remain unchanged.
Rollback copies remain under `.stackanvil/research/movement-clock/artifacts/build-rollback/` and `.stackanvil/research/movement-clock/java-client-rollback-1/`.
The private display and owned processes stop. Both existing user servers retain their original process identities.

## Future movement effects and queued replay, October 7, 2026

Future effects now apply their full duration at the paired input frame. Repeated snapshots do not renew expiration.
The fix removes 24 activity mismatches in 210 sampled native live applications.
Core passes 796 tests. The add-on passes 605 tests, and ViaProxy builds successfully.
The strict BDS regression through ViaProxy records 36 exact float lift changes and 280 unchanged phases after source removal.

The combined native fixture executes 420 cases, including 300 replays, 489 queued callbacks, and 1,131 countdowns.
It exposes original-duration restoration after clamped history replay.
It also retains 21 pending-command cases whose final native behavior requires a subsequent frame and command drain.
The fixture supplies snapshot and input boundaries. It does not execute complete native world movement.

Full rewind, pending drain, clock synchronization, mixed actions, both routes, and the complete gameplay matrix remain required.
The [coverage ledger](bedrock-coverage.md#future-commands-and-native-queued-effect-replay-october-7-2026) records evidence, rollout checks, and remaining limits.

## Native history boundaries, October 7, 2026

A further 344 native cases verify capture guards, input fill, clock continuity, history eviction, unsigned wrap, and physical ring growth.
Nonconsecutive captures discard older history. MAX-to-zero remains contiguous.
Pending active effects retain their original duration after eviction and clock resets, before the original countdown.
These results determine the history rules needed for production replay.

Core tick/frame associations and the add-on effect timeline do not retain complete world snapshots, captured inputs, and queued commands.
Actual physics rewind and reconciliation of mixed actions remain incomplete.
Both connection routes, terrain changes, attributes, combat, item use, inventory actions, and the complete matrix remain required.
The [coverage ledger](bedrock-coverage.md#native-frame-capture-clocks-and-history-boundaries-october-7-2026) records the native functions, fixture boundaries, and verification limits.

## Native replay dispatch and identity snapshots, October 7, 2026

A further 2,396 native cases verify replay dispatch, callback hooks, and immutable identity capture.
The original manager uses the selected category's ordered system indices. Repeated indices execute repeatedly.
The callback surrounds each system with optional hooks and passes the retained registry to its replay method.
The immutable snapshot preserves actor identity and classification. Mutable physics state uses a separate snapshot path.

The fixture supplies category membership, system implementations, ECS storage, and ownership boundaries.
Actual registered phase order, profiling mode, full physics rewind, and live correction behavior remain unverified.
Production still requires complete mutable snapshots, external state, captured inputs, and queued command replay.
Both routes and all movement, combat, item, block, inventory, and lifecycle cases remain required.
The [coverage ledger](bedrock-coverage.md#native-replay-dispatch-and-identity-snapshots-october-7-2026) records the functions, case domains, and remaining limits.
