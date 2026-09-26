# ViaBedrock test probe

This behavior pack runs entity and gameplay cases from Bedrock script events. Use it in a disposable test world.

The pack contains names from Mojang's vanilla behavior definitions at `v1.26.40.05`: 127 entity types, 850 named events, and 19 client-synced property definitions. The sweep skips types that the definitions mark as not summonable. This leaves 794 event cases and 70 property-value cases. Each case starts with a new entity.

The pack cannot send an arbitrary `ActorEvent` number or `ActorDataIDs` field. Bedrock's script API exposes entity events and properties, not raw network packets. A successful script action does not prove that the server sent a distinct packet. Use a packet trace or the PR's debug logging to measure packet coverage. A protocol-level test server is necessary for exhaustive numeric packet coverage.

## Install and run

1. Open the probe `.mcpack` with Minecraft Bedrock 1.26.40 or newer.
2. Create a disposable world and turn on cheats.
3. Activate **ViaBedrock Test Probe** in the world's Behavior Packs.
4. Join through the ViaBedrock build that you want to test.
5. Run `/scriptevent vbprobe:help` in Bedrock chat.

StackAnvil can install the pack in an isolated Bedrock Dedicated Server. The runner can run the entity sweeps and gameplay cases through a Java client:

```bash
bun run test:integration -- --route java-bedrock --entity-probe
bun run test:integration -- --route java-bedrock --gameplay-probe
```

The runner needs the same Bedrock server, ViaProxy, PrismLauncher, and private display as the regular integration suite. Entity sweeps check script actions and selected server values. Gameplay cases also drive Java input and check the resulting Bedrock server state. The pack cannot tell which Bedrock packets the server sent.

The probe spawns one entity about 11 blocks from the command source. The next case removes the prior probe entity. Some vanilla events can damage terrain or transform an entity. Use a disposable world for the full sweep.

## Commands

| Command | Result |
| --- | --- |
| `/scriptevent vbprobe:status` | Start the curated status scenarios. |
| `/scriptevent vbprobe:metadata` | Start the curated metadata scenarios. |
| `/scriptevent vbprobe:next` | Run the next queued case. |
| `/scriptevent vbprobe:status auto` | Run status cases every 40 ticks. |
| `/scriptevent vbprobe:events wolf auto` | Run all named wolf events from the catalog. |
| `/scriptevent vbprobe:properties copper_golem auto` | Run each client-synced copper golem property value. |
| `/scriptevent vbprobe:event wolf minecraft:on_tame` | Run one named event. |
| `/scriptevent vbprobe:property wolf minecraft:sound_variant grumpy` | Set one listed property value. |
| `/scriptevent vbprobe:all auto` | Run all scenarios, summonable events, and property values. |
| `/scriptevent vbprobe:stop` | Stop automatic execution and keep the queue. |
| `/scriptevent vbprobe:clear` | Stop and remove probe entities. |
| `/scriptevent vbprobe:cases` | List the gameplay case IDs. |
| `/scriptevent vbprobe:prepare chest-transfer myrun` | Build one gameplay fixture and report that it is ready. |
| `/scriptevent vbprobe:verify chest-transfer myrun` | Check the server result for that fixture. |

Use `all` instead of an entity type with `events` or `properties` to queue every summonable type. The full automatic sweep takes about 30 minutes at 20 ticks per second. The pack prints every case to the Bedrock content log and reports progress in chat. A sweep ends with attempted, passed, and failed action counts.

The curated status cases try hurt, death, taming, sheep eating, creeper priming, zombie conversion, and ravager roaring. The metadata cases change a name, fire state, effects, sheared state, and selected synced properties. Bedrock decides which packets these actions emit.

## Gameplay cases

The [test guide](../../docs/bedrock-test-packs.md) lists the cases and their Java actions. The pack reports each case as one JSON record in the server log:

```text
[ViaBedrock Gameplay Probe] {"id":"block-break","run":"myrun","phase":"verify","status":"pass","tick":1234,"observed":{"typeId":"minecraft:air"},"expected":"minecraft:air"}
```

Use a different run ID for each attempt. The runner matches the case ID, run ID, and phase. It fails on an error, failed result, stopped process, or timeout. It saves `gameplay-results.json` and Java screenshots under the private integration run directory.

The default gameplay run includes the creative case. It currently fails because the Java creative slot packet is canceled by the bridge. The map case checks that an empty map becomes filled. Review the saved screenshot to check the map image.

## Update the catalog

The generated catalog is in `behavior_pack/scripts/catalog.js`. The source is the `behavior_pack/entities` directory from [Mojang's Bedrock samples](https://github.com/Mojang/bedrock-samples/tree/v1.26.40.05/behavior_pack/entities).

1. Check out the desired Bedrock samples tag.
2. From the StackAnvil repository, run `bun run integration:entity-probe:generate -- /path/to/bedrock-samples/behavior_pack/entities v1.26.40.05`. Use the tag you checked out as the final argument.
3. Run `bun test test/integration-entity-probe-catalog.test.ts` and review the generated catalog diff.
4. If you need a standalone pack, zip the contents of `behavior_pack` with `manifest.json` at the archive root and rename the zip file to `.mcpack`.
