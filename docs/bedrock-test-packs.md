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

The default gameplay run includes movement, block actions, inventory, creative selection, chest transfer, equipment, item use, entity interaction, maps, commands, respawn, and dimension change. Each case uses a fresh arena so a client-predicted block from one case cannot interfere with the next.

## What each case checks

| Case | Java action | Bedrock result |
| --- | --- | --- |
| `movement-left`, `movement-right` | Hold A or D | The player moves at least 0.6 blocks in the requested local direction. |
| `block-break`, `block-place` | Break or place a block | The target block has the expected type and the placed item count changes. |
| `drop-item`, `inventory-script-slot` | Drop one emerald | The server inventory count decreases by one, including when the pack sets the slot through Script API. |
| `chest-transfer` | Move emeralds from a chest into the hotbar | The chest is empty and the player has four emeralds. |
| `lab-table-then-chest` | Use a lab table, then transfer emeralds from a nearby chest | The chest opens while the lab table remains in place, and the emeralds reach the player. |
| `chest-boat-transfer`, `chest-minecart-transfer` | Open vehicle storage and shift-click emeralds | The vehicle storage is empty and the player has four emeralds. |
| `creative-select` | Search for a nether star and place it in the hotbar | The server sees a nether star in the player inventory. |
| `creative-replace` | Replace an emerald in the first hotbar slot with a nether star | The server sees the nether star in that slot. |
| `equip-helmet`, `equip-offhand`, `eat-golden-apple` | Use or swap the held item | The equipment slot or effect state changes. |
| `offhand-block-place` | Right-click with dirt in the offhand and an empty main hand | Both dirt blocks remain in the offhand and no dirt block appears, matching native Bedrock. |
| `offhand-elytra-rocket` | Glide and right-click with offhand rockets | Glide and movement samples exist, and all three offhand rockets remain unused. |
| `mainhand-elytra-rocket` | Glide and use a mainhand rocket | A rocket is consumed during glide and horizontal speed increases. |
| `entity-attack`, `entity-name` | Hit or name a cow | The cow loses health or has the expected name. |
| `map-hold` | Use an empty map | The held item becomes a filled map. The runner saves a Java screenshot for visual review. |
| `command-time`, `command-completion`, `command-denied` | Submit `/time set day`, including Tab completion | Time changes for an allowed player and stays at night for a denied player. |
| `respawn`, `dimension-change` | The pack kills or moves the player | The server reports a respawn or a change to the Nether while Java remains connected. |

The runner saves before and after screenshots, logs, and `gameplay-results.json` under `.stackanvil/integration/runs/`. It records each failure and continues through the remaining cases while both game processes are alive. The screenshots for maps, equipment, naming, and creative selection support visual review. The block and inventory cases check server state after Java input. The entity sweeps still need packet or client state inspection to prove that a specific translated Java entity update arrived.

After the gameplay cases, the runner restarts the Java client and checks that it rejoins the same Bedrock world. It runs the modpack join even when a gameplay assertion fails, then exits with the recorded failures. The resource pack run also reconnects while it checks cache reuse.

## Complex gameplay

Run the BDS suite for ranged use, slowing terrain, water movement, and creative flight:

```bash
bun run test:integration -- --route java-bedrock --gameplay-complex
```

You can combine `--gameplay-complex` with `--gameplay-probe` or select individual IDs with `--gameplay-cases`.
The Java/Geyser probe does not implement these new fixtures; the runner rejects that route before starting servers.

| Case | Java action | Server assertion |
| --- | --- | --- |
| `bow-release` | Hold use, then release | Ordered start/release events, one moving owned arrow, and one consumed arrow. |
| `bow-cancel` | Change hotbar slot while drawing | Charging started, no arrow spawned, and ammunition remained unchanged. |
| `bow-no-ammo` | Attempt to draw without arrows | No projectile or ammunition change. Compare with `bow-release` to detect missing input handling. |
| `crossbow-load` | Charge without firing | Start/completion events, one consumed arrow, and no projectile. |
| `crossbow-fire` | Load, release, then use again | A completed load precedes one owned arrow, with one arrow consumed in total. |
| `crossbow-retain` | Load, switch away and back, then fire | Server slot samples witness the round trip between completion and the shot. |
| `splash-potion-throw`, `lingering-potion-throw` | Throw the default potion | A use event, one matching owned projectile, and one consumed potion. |
| `powder-snow-sink` | Remain on powder snow without boots | At least ten samples and descent into the snow. |
| `powder-snow-boots` | Remain on powder snow with leather boots | At least ten samples and no descent through the surface. |
| `water-forward` | Hold forward while submerged | At least ten water samples and 0.6 blocks of forward travel. |
| `creative-flight-ascend` | Toggle flight and hold jump | At least ten flight samples and ascent above one block. |

Ranged observations include event ticks, remaining use duration, ammunition counts, projectile IDs, and sampled projectile speed.
The Script API reports `useDuration` as remaining ticks, not elapsed charge time.
The movement cases retain up to 200 position, velocity, water, flight, and grounded frames.
These server observations support diagnosis and later native comparison.
They do not prove local trajectory accuracy, charge formulas, damage, potion effects, or correction replay.

All new live cases remain unverified until the lab can run them.
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

The game integration suite needs signed-in clients and a private Xvfb display. Hosted CI runs the TypeScript tests and build, but it does not run account-based game joins. Keep screenshots, packet traces, credentials, and raw traffic under the ignored `.stackanvil/` directory.

## Geyser on a Java server

The [Java probe](../test-packs/java-probe/README.md) runs the same gameplay contract on Paper through Geyser:

```text
Java client → ViaBedrock → Geyser → Paper
```

Run the portable gameplay cases, custom content cases, and negative controls:

```bash
bun run test:geyser
```

This route creates a fresh Paper world and starts Geyser and ViaProxy on local ports. It does not start a Bedrock server. The client uses the existing private display and zero-volume defaults.

Use `--plain-only` to omit the modpack join. If StackAnvil artifacts are already built, add `--reuse-build`. Select specific cases with the integration runner:

```bash
bun run test:integration -- --route java-geyser --gameplay-cases chest-transfer,custom-entity-interact,complex-world --negative-controls --plain-only
```

The Java plugin implements `vbprobe:prepare`, `vbprobe:start`, and `vbprobe:verify` under the `scriptevent` command. Both backends report the same JSON format and reuse the Java input driver. The Java backend excludes `lab-table-then-chest`, which requires a Bedrock-only block. Bedrock named-event sweeps and the BDS cache probe also remain specific to the Bedrock backend.

Negative controls corrupt a fixture after successful client input. Verification must report `fail`; a command error, timeout, or unexpected pass fails the control. The runner saves the control result with the gameplay results.

The runner checks server state, Geyser entity updates, converted textures and models, and Java resource pack loading. Screenshots support visual review of models, animation, textures, and passengers. These checks do not prove pixel accuracy or every translated packet.

The runner records a disconnect as a failure and marks the remaining cases as skipped. Geyser custom cases run before the portable gameplay sweep. This preserves their results if a later gameplay action closes the connection. CI compiles the Java plugin and extension, but account-based game joins remain local tests.
