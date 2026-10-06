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
- `PlayerPredictionStorage` retains one pending sample. It does not provide coherent tick-indexed world history and correction replay.
- Bundle containers and rewriting exist. End-to-end capacity, cursor, transfer, and rollback parity remain to verify.
- Fluid physics, player posture, shield timing, boat movement, and rocket paths exist. The complete matrix above remains unverified.

Keep authoritative state, packet construction, item requests, and corrections in ViaBedrock core.
Use the add-on where native input, local physics, or presentation requires client integration.
Retain ordinary Java and ViaProxy coverage where standard translation suffices.

## Runnable first suite

Run the twelve new BDS cases:

```bash
bun run test:integration -- --route java-bedrock --gameplay-complex
```

The [probe guide](bedrock-test-packs.md#complex-gameplay) describes their assertions and limits.
They check ranged use, powder snow, water movement, and creative ascent.
They are the first executable subset of this matrix.
The existing portable gameplay sweep remains separate.
The Java/Geyser fixture does not implement the new cases yet.

### Verification status, October 6, 2026

**Implemented:** Twelve fixture IDs, Java input actions, ranged event checks, owner filtering, deferred callback isolation, and bounded movement sampling.
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
