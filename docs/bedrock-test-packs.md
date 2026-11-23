# Bedrock probe tests

The [probe behavior pack](../test-packs/entity-probe/README.md) prepares a disposable world and reports server results. The integration runner drives the Java client on a private display. Each gameplay case has a run ID, a `prepare` result, and a `verify` result in the Bedrock server log.

Run the entity sweeps and gameplay cases together:

```bash
bun run test:bedrock:gameplay
```

Run only the entity sweeps or gameplay cases with the integration runner:

```bash
bun run test:integration -- --route java-bedrock --entity-probe
bun run test:integration -- --route java-bedrock --gameplay-probe
```

Use `--gameplay-cases` to select cases. This command runs a short movement and block check:

```bash
bun run test:integration -- --route java-bedrock --gameplay-cases movement-left,movement-right,block-break
```

The default gameplay run includes movement, block actions, inventory, creative selection, container transfers, cooking, brewing, enchanting, crafting, equipment, shields, vehicles, item use, entity interaction, maps, commands, respawn, and dimension change. Each case uses a fresh arena so a client-predicted block from one case cannot interfere with the next.

Arena preparation requires a living player, including after asynchronous tick boundaries.
It rejects a dead player before changing their position or resetting health.
The runner must complete an actual respawn before it prepares the next arena.
Resetting a dead player's health through the Script API can prevent BDS from completing the respawn handshake.

## What each case checks

The table lists every case in the default gameplay run. To print every case ID that the runner accepts, pass an unknown ID. The runner stops before it starts any server:

```bash
bun run test:integration -- --route java-bedrock --gameplay-cases list
```

That list also contains the [complex gameplay](#complex-gameplay) cases and the `offhand-block-place`, `custom-*`, and `complex-world` cases of the disabled [Geyser route](#geyser-fixtures). In a probe world, `/scriptevent vbprobe:cases` lists the cases that the behavior pack defines.

| Case | Java action | Bedrock result |
| --- | --- | --- |
| `movement-left`, `movement-right` | Hold A or D | The player moves at least 0.6 blocks in the requested local direction. |
| `block-break`, `creative-block-break` | Break a dirt block in Survival or Creative | The block becomes air. |
| `block-place` | Place a dirt block against stone | Exactly one dirt block appears next to the stone and one dirt item remains. |
| `tnt-explosion` | Light TNT with flint and steel in Creative | The TNT is gone and at least one nearby floor block is removed. |
| `water-flow` | Empty a water bucket against stone | Water spreads into more than one block. |
| `drop-item`, `inventory-script-slot` | Drop one emerald | The server inventory count decreases by one, including when the pack sets the slot through Script API. |
| `creative-select` | Search for a nether star and place it in the hotbar | The server sees a nether star in the player inventory. |
| `creative-replace` | Replace an emerald in the first hotbar slot with a nether star | The server sees the nether star in that slot. |
| `creative-replace-main` | Replace an emerald in the first main inventory slot with a nether star | The server sees the nether star in that slot. |
| `creative-replace-twice` | Replace an emerald in the first hotbar slot with a nether star, then with ender pearls | The slot holds ender pearls, and no emerald or nether star remains. |
| `equip-helmet`, `equip-offhand`, `eat-golden-apple` | Use or swap the held item | The equipment slot or effect state changes. |
| `offhand-remove` | Open the inventory and move the offhand shield into a slot | The offhand is empty and the inventory holds the shield. |
| `entity-attack`, `entity-name` | Hit or name a cow | The cow loses health or has the expected name. |
| `map-hold` | Use an empty map | The held item becomes a filled map. The runner saves a Java screenshot for visual review. |
| `command-time`, `command-completion`, `command-denied` | Submit `/time set day`, including Tab completion | Time changes for an allowed player and stays at night for a denied player. |
| `respawn`, `dimension-change` | The pack kills or moves the player | The server reports a respawn or a change to the Nether while Java remains connected. |
| `chest-transfer` | Move emeralds from a chest into the hotbar | The chest is empty and the player has four emeralds. |
| `chest-authored-one-empty`, `chest-authored-one-merge` | Place and open the named probe chest, click an omitted slot, then activate its authored count-one slot. | Three source emeralds and both hidden diamonds remain. Exactly one emerald reaches the empty hotbar cell or merges into slot 15. |
| `chest-rapid-transfer` | Shift-click emeralds and diamonds from two chest slots in quick succession | The chest is empty and the player has four emeralds and three diamonds. |
| `chest-pickup-all` | Double-click one of three emerald stacks in a chest, then place the cursor stack | The chest is empty and the player has all nine emeralds. |
| `lab-table-then-chest` | Use a lab table, then transfer emeralds from a nearby chest | The chest opens while the lab table remains in place, and the emeralds reach the player. |
| `chest-boat-transfer`, `chest-minecart-transfer` | Open vehicle storage and shift-click emeralds | The vehicle storage is empty and the player has four emeralds. |
| `furnace-quick-move-log` | Shift-click eight oak logs into a furnace whose input holds 63 logs | The input slot holds 64 logs, the fuel slot stays empty, and the player keeps seven logs. |
| `furnace-quick-move-coal` | Shift-click eight coal into an empty furnace | All eight coal reach the fuel slot. |
| `brewing-stand` | Add nether wart to a stand with three water bottles and blaze powder, then take the potions | The player has three identical brewed potions, and the stand holds no bottles or ingredient. |
| `furnace-book-cook`, `smoker-book-cook`, `blast-furnace-book-cook` | Choose the recipe from the recipe book, then take the result | The player has one cooked beef, or one netherite scrap from the blast furnace. The input and output slots are empty. |
| `enchant-basic` | Add an iron sword and lapis to an enchanting table and choose an enchantment | The sword is enchanted, two lapis remain, and the player's level drops below 30. |
| `offhand-ineligible-block` | Press F to swap dirt from the main hand to the offhand | Bedrock rejects offhand dirt. The offhand stays empty, the main hand keeps both dirt blocks, and no dirt is placed. |
| `offhand-shield-use` | Hold use with a shield in the offhand | Bedrock sees the sneak input that raises the shield. |
| `offhand-elytra-rocket` | Glide and right-click with offhand rockets | Glide and movement samples exist, and all three offhand rockets remain unused. |
| `mainhand-elytra-rocket` | Glide and use a mainhand rocket | A rocket is consumed during glide and horizontal speed increases. |
| `boat-forward` | Hold W in a boat on water | The ridden boat stays on the water, moves at least 0.8 blocks, and never moves two blocks in one tick. |
| `minecart-dismount` | Ride a minecart along powered rails, then press Shift | The player dismounts after the minecart travels more than two blocks and stays within three blocks of the dismount point. |
| `shield-projectile-baseline` | Stand without a shield in front of a skeleton | An arrow hits the player and causes damage. |
| `shield-projectile-block` | Hold the offhand shield up in front of a skeleton | An arrow hits while the shield is raised and causes no damage. |
| `crafting-manual-sticks` | Place two planks in a crafting table grid and take the output | The player has four sticks and no planks. |
| `crafting-book-sticks` | Choose the stick recipe from the recipe book and take the output | The player has four sticks and no planks. |
| `crafting-bulk-sticks` | Fill two grid cells with four planks each and shift-click the output | The player has sixteen sticks and no planks. |

The runner saves before and after screenshots, logs, and `gameplay-results.json` under `.stackanvil/integration/runs/`. It records each failure and continues through the remaining cases while both game processes are alive. The screenshots for maps, equipment, naming, and creative selection support visual review. The block and inventory cases check server state after Java input. The entity sweeps still need packet or client state inspection to prove that a specific translated Java entity update arrived.

After the gameplay cases, the runner restarts the Java client and checks that it rejoins the same Bedrock world. It runs the modpack join even when a gameplay assertion fails, then exits with the recorded failures. The resource pack run also reconnects while it checks cache reuse.

## Complex gameplay

Run the BDS cases for ranged use, projectile combat, slowing terrain, fluids, creative flight, moving item use, and fishing:

```bash
bun run test:integration -- --route java-bedrock --gameplay-complex
```

You can combine `--gameplay-complex` with `--gameplay-probe` or select individual IDs with `--gameplay-cases`.
The Java/Geyser probe does not implement these fixtures; the runner rejects that route before starting servers.

| Case                                                                            | Java action                                                                  | Server assertion                                                                                                               |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `bow-release`                                                                   | Hold use, then release                                                       | Ordered start/release events, one moving owned arrow, and one consumed arrow.                                                  |
| `bow-cancel`                                                                    | Change hotbar slot while drawing                                             | Charging started, no arrow spawned, and ammunition remained unchanged.                                                         |
| `bow-no-ammo`                                                                   | Attempt to draw without arrows                                               | No projectile or ammunition change. Compare with `bow-release` to detect missing input handling.                               |
| `crossbow-load`                                                                 | Charge without firing                                                        | Start/completion events, one consumed arrow, and no projectile.                                                                |
| `crossbow-fire`                                                                 | Load, release, then use again                                                | A completed load precedes one owned arrow, with one arrow consumed in total.                                                   |
| `crossbow-retain`                                                               | Load, switch away and back, then fire                                        | Server slot samples witness the round trip between completion and the shot.                                                    |
| `splash-potion-throw`, `lingering-potion-throw`                                 | Throw the default potion                                                     | A use event, one matching owned projectile, and one consumed potion.                                                           |
| `powder-snow-sink`                                                              | Remain on powder snow without boots                                          | At least ten samples and descent into the snow.                                                                                |
| `powder-snow-boots`                                                             | Remain on powder snow with leather boots                                     | At least ten samples and no descent through the surface.                                                                       |
| `water-forward`                                                                 | Hold forward while submerged                                                 | At least ten water samples and 0.6 blocks of forward travel.                                                                   |
| `creative-flight-ascend`                                                        | Toggle flight and hold jump                                                  | At least ten flight samples and ascent above one block.                                                                        |
| `bow-short-release`                                                             | Release after a short draw                                                   | One consumed arrow and an owned projectile after a draw of at most twelve server ticks.                                        |
| `bow-water-release`                                                             | Draw and release while submerged                                             | A valid shot and at least ten water samples during use.                                                                        |
| `bow-hit`, `crossbow-hit`                                                       | Fire at a stationary cow                                                     | The owned arrow hits the fixture target, causes damage, and lowers its health.                                                 |
| `crossbow-cancel`                                                               | Change slot during loading                                                   | A witnessed slot change, no completed load, no projectile, and unchanged ammunition.                                           |
| `crossbow-no-ammo`                                                              | Attempt to load without arrows                                               | No projectile or ammunition change. Compare with the positive loading case.                                                    |
| `bow-infinity`                                                                  | Draw and release an Infinity bow with arrows                                 | One owned arrow, ordered charging events, and no ammunition consumption.                                                       |
| `bow-infinity-no-ammo`                                                          | Attempt to draw an Infinity bow without arrows                               | No projectile or ammunition change.                                                                                            |
| `crossbow-multishot`                                                            | Load and fire a Multishot crossbow                                           | Three distinct owned arrows in one volley, after completion, with one arrow consumed.                                          |
| `crossbow-quick-charge-1`, `crossbow-quick-charge-2`, `crossbow-quick-charge-3` | Load and fire each Quick Charge level                                        | One consumed arrow and one owned shot, with completion inside the target BDS timing window.                                    |
| `crossbow-piercing-0`, `crossbow-piercing-1`, `crossbow-piercing-4`             | Fire one crossbow arrow through a stationary target chain                    | The same arrow damages one, two, or five targets in order. The next target remains untouched.                                  |
| `bow-knockback-release`, `crossbow-knockback-fire`                              | Charge through a scripted knockback, then release or fire                    | Airborne displacement occurs during charging, followed by one owned shot and one consumed arrow.                               |
| `bow-knockback-cancel`, `crossbow-knockback-cancel`                             | Change slot after knockback during charging                                  | Airborne displacement precedes cancellation, with no projectile and unchanged ammunition.                                      |
| `bow-server-slot-use`, `crossbow-server-slot-use`                               | Let the server select snowballs during charging, then use the selected stack | Charging cancels without spending an arrow; the new stack loses one snowball and launches one owned projectile.                |
| `splash-potion-speed`                                                           | Throw a swiftness potion downward                                            | One consumed potion, its owned impact, and a later speed effect with positive duration.                                        |
| `lingering-potion-slowness`                                                     | Throw a lingering slowness potion downward                                   | The matching impact, a nearby cloud, and a later slowness effect.                                                              |
| `fireball-hit`, `small-fireball-hit`                                            | Remain in the firing lane                                                    | A natural ghast or blaze shot hits the player and causes health loss.                                                          |
| `fireball-dodge`, `small-fireball-dodge`                                        | Move aside after launch                                                      | Player samples show sideways movement before the shot passes the original position, without contact or damage.                 |
| `fireball-reflect`                                                              | Attack after launch                                                          | The player's attack changes projectile ownership and reverses its motion without player damage.                                |
| `water-current`                                                                 | Remain idle in flowing water                                                 | At least ten flowing-water samples and downstream displacement.                                                                |
| `lava-forward`                                                                  | Hold forward with fire resistance                                            | At least ten lava samples and forward displacement.                                                                            |
| `bubble-column-up`, `bubble-column-down`                                        | Remain idle above soul sand or magma                                         | At least ten bubble-column samples and displacement in the column's direction.                                                 |
| `pearl-wind-charge`, `pearl-wind-charge-moving`                                 | Throw an ender pearl, then a wind charge, standing still or while walking    | A pearl teleport, a wind-charge launch, and a settled landing. The moving case also requires walking before the throw.         |
| `eat-moving-repeat`, `eat-moving-last`                                          | Hold use on golden apples while walking                                      | Eating completes while moving, grants absorption, and stops when the last apple is consumed.                                   |
| `fishing-early-reel`, `fishing-entity-reel`                                     | Cast a fishing rod, then reel in early or after hooking a cow                | One cast and one reel remove the hook without a reward. The cow case also requires a live pull and three points of rod damage. |

Ranged observations include event ticks, remaining use duration, ammunition counts, projectile IDs, and sampled projectile speed.
Incoming-shot observations also retain player positions and velocities after launch.
The dodge assertion rejects movement that occurs only after the projectile passes.
It rejects absent, stale, unordered, or non-finite player samples.
The Script API reports `useDuration` as remaining ticks, not elapsed charge time.
The movement cases retain up to 200 position, velocity, fluid, flight, and grounded frames.
Knockback cases apply one Script API impulse four server ticks after the weapon's accepted start event.
They retain its requested force, position, and velocity before and after the call.
Their assertions require upward and horizontal displacement during charging.
A successful shot without that displacement cannot pass.
Callbacks stop when use ends, the fixture closes, or another fixture replaces it.
These cases exercise movement and item use together; they do not prove correct impulse timing or historical replay.
Fluid samples include the block type and liquid depth where available.
Projectile combat retains bounded trajectories, native collision bounds, ownership, attacks, impacts, and damage.
The start event waits for a natural shot before the Java driver begins its response.
It allows twenty seconds for a shot on a collision course.
Off-course shots are removed, and the shooter stops after the selected shot.
This isolates one incoming projectile from the blaze's random burst spread.
This collision-course check belongs to the test fixture; it does not replace production movement physics.
These server observations support diagnosis and later native comparison.
They do not prove local trajectory accuracy, complete charge or damage formulas, potion duration scaling, or correction replay.

The runner detects the drawn selection in any hotbar cell, then selects cell zero before input.
Cancellation can leave another cell selected.

Quick Charge levels 1, 2, and 3 must complete 19–21, 14–16, and 9–11 ticks after the start event.
These windows reject both an ordinary reload and an immediate completion.
Piercing targets are spaced so that one wide actor cannot take repeated contact across consecutive ticks.
Repeated contact against overlapping actors remains a separate client parity requirement.

Headless BDS controls, some through a synthetic protocol client, cover the fireball, reflection, target damage, enchantment, and potion effect assertions.
The Piercing cases also pass with Java mouse input through direct and ViaProxy connections.
For the other cases, Java input, client rendering, native comparisons, and direct or ViaProxy gameplay remain unverified.
Crossbow rockets have no fixture. The generic projectile observer cannot establish rocket ownership, and the initial actor motion does not establish a crossbow trajectory.
The [complex gameplay matrix](bedrock-complex-gameplay.md) retains the remaining combat, flight, mount, inventory, fluid, and network requirements.

## Resource pack conversion

The [resource probe](../test-packs/resource-probe/resource_pack/manifest.json) replaces the diamond texture and defines a textured custom block. Run the cache and rendering test with:

```bash
bun run test:bedrock:resources
```

The runner joins with texture A twice. It then restarts ViaProxy against texture B while keeping the same cache directory. It checks that A converts once, the repeat reuses the conversion, and B converts again. It also gives the player a diamond and compares Java inventory screenshots before and after the item appears. The two textures have distinct colors, so each run checks the texture shown by Java.

The runner places the custom block in a loaded Bedrock chunk. It checks the converted Java block model and texture. It also rejects a fallback block-state mapping for that block.

The test writes a unique token into the pack for each run. This prevents a result from an earlier local run from hiding a conversion failure. The runner uses a private server and never edits the source Bedrock installation.

## Limits

The pack can change world state and read server state. It cannot manufacture an arbitrary Bedrock packet, read the Java renderer state, or prove map pixel accuracy by itself. The named entity catalog remains a diagnostic sweep. Use `/scriptevent vbprobe:all auto` in a disposable world to run it. The full sweep takes about 30 minutes and can alter terrain.

The game integration suite needs signed-in clients and a private Wayland display. Hosted CI runs the TypeScript tests and build, but it does not run account-based game joins. Keep screenshots, packet traces, credentials, and raw traffic under the ignored `.stackanvil/` directory.

## Geyser fixtures

The pinned Geyser fixture does not provide NetherNet. The integration runner rejects the `java-geyser` route before starting servers.
Use the `java-bedrock` route for live gameplay tests. StackAnvil does not restore legacy transport support for fixtures.

The [Java probe](../test-packs/java-probe/README.md) remains available for compilation and offline fixture checks.
