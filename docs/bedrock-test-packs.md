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

The default gameplay run includes movement, block actions, inventory, creative selection, chest transfer, equipment, item use, entity interaction, maps, commands, respawn, and dimension change. Each case uses a fresh arena so a client-predicted block from one case cannot interfere with the next. The current ViaBedrock handler cancels the Java creative slot packet, so that case currently exposes a known failure.

## What each case checks

| Case | Java action | Bedrock result |
| --- | --- | --- |
| `movement-left`, `movement-right` | Hold A or D | The player moves at least 0.6 blocks in the requested local direction. |
| `block-break`, `block-place` | Break or place a block | The target block has the expected type and the placed item count changes. |
| `drop-item`, `inventory-script-slot` | Drop one emerald | The server inventory count decreases by one, including when the pack sets the slot through Script API. |
| `chest-transfer` | Move emeralds from a chest into the hotbar | The chest is empty and the player has four emeralds. |
| `creative-select` | Search for a nether star and place it in the hotbar | The server sees a nether star in the player inventory. |
| `equip-helmet`, `equip-offhand`, `eat-golden-apple` | Use or swap the held item | The equipment slot or effect state changes. |
| `entity-attack`, `entity-name` | Hit or name a cow | The cow loses health or has the expected name. |
| `map-hold` | Use an empty map | The held item becomes a filled map. The runner saves a Java screenshot for visual review. |
| `command-time`, `command-completion`, `command-denied` | Submit `/time set day`, including Tab completion | Time changes for an allowed player and stays at night for a denied player. |
| `respawn`, `dimension-change` | The pack kills or moves the player | The server reports a respawn or a change to the Nether while Java remains connected. |

The runner saves before and after screenshots, logs, and `gameplay-results.json` under `.stackanvil/integration/runs/`. It records each failure and continues through the remaining cases while both game processes are alive. The screenshots for maps, equipment, naming, and creative selection support visual review. The block and inventory cases check server state after Java input. The entity sweeps still need packet or client state inspection to prove that a specific translated Java entity update arrived.

After the gameplay cases, the runner restarts the Java client and checks that it rejoins the same Bedrock world. It runs the modpack join even when a gameplay assertion fails, then exits with the recorded failures. The resource pack run also reconnects while it checks cache reuse.

## Resource pack conversion

The [resource probe](../test-packs/resource-probe/resource_pack/manifest.json) replaces the diamond texture with a visible test pattern. Run the cache and rendering test with:

```bash
bun run test:bedrock:resources
```

The runner joins with texture A twice. It then restarts ViaProxy against texture B while keeping the same cache directory. It checks that A converts once, the repeat reuses the conversion, and B converts again. It also gives the player a diamond and compares Java inventory screenshots before and after the item appears. The two textures have distinct colors, so each run checks the texture shown by Java.

The test writes a unique token into the pack for each run. This prevents a result from an earlier local run from hiding a conversion failure. The runner uses a private server and never edits the source Bedrock installation.

## Limits

The pack can change world state and read server state. It cannot manufacture an arbitrary Bedrock packet, read the Java renderer state, or prove map pixel accuracy by itself. The named entity catalog remains a diagnostic sweep. Use `/scriptevent vbprobe:all auto` in a disposable world to run it. The full sweep takes about 30 minutes and can alter terrain.

The game integration suite needs signed-in clients and a private Xvfb display. Hosted CI runs the TypeScript tests and build, but it does not run account-based game joins. Keep screenshots, packet traces, credentials, and raw traffic under the ignored `.stackanvil/` directory.
