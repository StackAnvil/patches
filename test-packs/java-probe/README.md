# Java and Geyser test probe

This fixture provides the Java counterpart of the [Bedrock behavior pack](../entity-probe/README.md). Use a disposable world.

The Paper plugin prepares and verifies gameplay cases. The Geyser extension replaces fixture husks with an animated Bedrock entity. It sends integer and float properties, scale changes, and variants. A Bedrock resource pack supplies the entity model, animation, block texture, and item texture. Geyser mappings expose Java note blocks and custom-model paper items as custom Bedrock content.

## Run the suite

Install the repository dependencies with `bun install --frozen-lockfile`. The fixture build needs JDK 25, including `javac` and `jar`. The game runner also needs PrismLauncher and the private display tools from the [capture lab](../../docs/capture-lab.md).

```bash
bun run test:geyser
```

The route is Java client → ViaBedrock → Geyser → Paper. It starts no native Bedrock client or server. Each run creates a fresh server under `.stackanvil/integration/runs/`. TCP and UDP listeners bind to `127.0.0.1`. Authentication is disabled only in this disposable local fixture.

The runner first uses the plain Java client. After the gameplay cases, it restarts that client and checks reconnect. It also runs a Fabulously Optimized join. Use `--plain-only` to omit the modpack join. Use `--reuse-build` to reuse existing StackAnvil artifacts.

If another lab uses the default display, select a free display with `STACKANVIL_LAB_DISPLAY`, such as `:100`.

To run only the custom content cases and their negative controls, use:

```bash
bun run test:integration -- --route java-geyser --geyser-probe --negative-controls --plain-only --reuse-build
```

This also checks chest transfer and reconnect. Omit `--reuse-build` when the StackAnvil artifacts need a fresh build.

## Fixtures and commands

The plugin supports the portable cases in the [gameplay guide](../../docs/bedrock-test-packs.md). It excludes `lab-table-then-chest`. Java has no equivalent lab table. Bedrock named events and property catalog sweeps are also unavailable on Java.

These additional cases exercise Geyser custom content:

| Case | Client action | Server assertion |
| --- | --- | --- |
| `custom-entity-attack` | Hit the animated entity | The Java entity loses health. Geyser updates its health property. |
| `custom-entity-interact` | Use the animated entity | Its phase changes after the interaction. Geyser updates the phase, variant, and scale. |
| `custom-item-transfer` | Transfer tokens from a chest | Four items retain their custom item model in the player inventory. |
| `custom-block-break` | Break a custom block | The corresponding Java block becomes air. |
| `custom-block-place` | Place a custom block | One block appears and the inventory count decreases by one. |
| `complex-world` | Walk through the test course | The player crosses chunk boundaries while 24 custom entities and blocks receive repeated updates. |

The complex fixture also contains passengers, named entities, equipment, stairs, slabs, glass, light sources, and containers with custom items. It builds the course from fixed coordinates and values. Each case uses a separate arena.

Both backends accept the same command shape:

```text
scriptevent vbprobe:prepare chest-transfer myrun
scriptevent vbprobe:verify chest-transfer myrun
```

Use `vbprobe:start` for the elytra flight cases. Use `vbprobe:cases` to list cases, and `vbprobe:clear` to remove the active fixture. Run IDs must contain 1–40 lowercase letters, digits, or hyphens. The plugin matches the case, run, and player before verification.

The integration runner supplies real Java input between preparation and verification. Each result uses the existing `[ViaBedrock Gameplay Probe]` JSON format.

## Build and version pins

```bash
bun run test-pack:java:build
```

This command builds the plugin and extension. It installs them, the mappings, and the resource pack under `dist/test-packs/java-probe/plugins/`. An optional positional argument selects another destination. The integration runner builds and installs the same files automatically.

[The fixture manifest](../../integration/geyser.json) pins Paper 26.2 build 129, Geyser 2.11.3 build 1247, and ViaVersion 5.12.0. Downloads require matching SHA-256 checksums. Paperclip resolves the pinned server's runtime dependencies, which also supply the plugin compilation classpath. ViaVersion accepts the Java 26.3 client on the Paper 26.2 server. Geyser exposes Bedrock 1.26.51, matching the current ViaBedrock target.

The extension uses Geyser's [experimental entity API](https://geysermc.org/wiki/geyser/custom-entities/), introduced in API 2.11.0. Custom items use the [v2 mapping format](https://geysermc.org/wiki/geyser/custom-items/). Custom blocks use [Geyser block mappings](https://geysermc.org/wiki/geyser/custom-blocks/). Keep these dependencies pinned when updating the fixture.

## Reading results

Server assertions prove the result of client input on Paper. Extension logs establish that Geyser recognizes each fixture entity and submits the expected property updates. The stress case requires repeated phase updates for every custom entity. The runner checks the converted entity model and all three fixture textures. Java logs establish resource pack loading. Screenshots support visual review; they do not automatically establish animation or map pixel accuracy.

Negative controls change server state after a successful case and require verification to reject the result. Controls restore entity health, reset its phase, strip an item's custom model, undo block actions, remove a stress entity, or refill a chest. An error or timeout does not count as a successful control.

The custom cases run first. If a later action disconnects the client, the runner records the failure and marks the remaining cases as skipped. CI compiles the fixture without launching a game client.

Logs, screenshots, worlds, caches, and game results remain under the ignored `.stackanvil/` directory. Use native Bedrock server captures only when investigating packet differences.
