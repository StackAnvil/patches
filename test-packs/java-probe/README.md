# Java and Geyser test probe

This fixture provides the Java counterpart of the [Bedrock behavior pack](../entity-probe/README.md). Use a disposable world.

The Paper plugin prepares and verifies gameplay cases. The Geyser extension replaces fixture husks with an animated Bedrock entity. It sends integer and float properties, scale changes, and variants. A Bedrock resource pack supplies the entity model, animation, block texture, and item texture. Geyser mappings expose Java note blocks and custom-model paper items as custom Bedrock content.

## Run the suite

The live `java-geyser` route is disabled. The pinned Geyser fixture does not provide NetherNet, so the integration runner rejects that route before it starts servers. See [Geyser fixtures](../../docs/bedrock-test-packs.md#geyser-fixtures). Use the `java-bedrock` route for live gameplay tests.

The fixture still builds and compiles. The build needs JDK 25, including `javac` and `jar`. See [Build and version pins](#build-and-version-pins).

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

The suite uses the official Geyser JAR without source changes. The plugin and extension provide test content and assertions. Protocol fixes belong in ViaBedrock.

The extension uses Geyser's [experimental entity API](https://geysermc.org/wiki/geyser/custom-entities/), introduced in API 2.11.0. Custom items use the [v2 mapping format](https://geysermc.org/wiki/geyser/custom-items/). Custom blocks use [Geyser block mappings](https://geysermc.org/wiki/geyser/custom-blocks/). Keep these dependencies pinned when updating the fixture.

## Reading results

Server assertions prove the result of client input on Paper. Extension logs establish that Geyser recognizes each fixture entity and submits the expected property updates. The stress case requires repeated phase updates for every custom entity. The runner checks the converted entity model and all three fixture textures. Java logs establish resource pack loading. Screenshots support visual review; they do not automatically establish animation or map pixel accuracy.

Boat verification requires forward movement, limited lateral drift, and an uninterrupted ride. Mainhand rocket verification averages horizontal movement over four server ticks before consumption and eight ticks afterward. It requires movement samples on both sides, plus a speed increase. Teleports and world changes reset those samples.

The offhand use cases follow native Bedrock 1.26.51.1 behavior. Captures used protocol 2193 and the pinned official Geyser on October 1, 2026. The native inventory contained two offhand dirt blocks or three offhand rockets. Right-click placed no dirt and consumed no offhand rocket during a valid glide. Mainhand controls placed one dirt block and consumed a rocket with a speed increase. The offhand cases require unchanged item counts, and the rocket case also requires glide and movement samples.

Negative controls change server state after a successful case and require verification to reject the result. Controls restore entity health, reset its phase, strip an item's custom model, undo block actions, remove a stress entity, or refill a chest. An error or timeout does not count as a successful control.

The custom cases run first. If a later action disconnects the client, the runner records the failure and marks the remaining cases as skipped. CI compiles the fixture without launching a game client.

Logs, screenshots, worlds, caches, and game results remain under the ignored `.stackanvil/` directory. Use native Bedrock server captures only when investigating packet differences.
