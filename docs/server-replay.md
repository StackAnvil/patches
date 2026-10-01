# Record and replay a Bedrock server scene

The replay lab records one authenticated connection through ViaBedrock or an official Bedrock client. Local runs replay the captured world without another public server connection.

The recorder saves decrypted packets before ViaBedrock translates them. It excludes login tokens and encryption handshakes. It also saves the decrypted, selected server packs.

Raw recordings still contain player names, chat, skins, and licensed server assets. They stay under the ignored `.stackanvil/replay/` directory with private permissions.

## Record a scene

Build ViaProxy and the client add-on, then prepare the integration Prism instance:

```bash
bun run build viaproxy
bun run build viafabricplus-bedrock
bun run test:integration -- --route java-java --reuse-build
bun run server-replay record cubecraft --seconds 120
```

Other targets are `minehut` and `geyser`. The Hive uses `geo.hivebedrock.cloud`, but ViaBedrock blacklists its network because translated clients can be banned. Use the official client to record Hive. The tool preserves the translated-client guard. A translated diagnostic join requires the explicit `--allow-hive` option.

The default login comes from the separate `StackAnvil Desktop 26.3` profile. Use `--account /absolute/path/bedrock.json` for another saved MinecraftAuth Bedrock account. The tool copies that account into its private proxy directory. It does not change the source account file.

The Java client uses a private copy of the integration instance. Its runtime libraries stay shared, while settings, mods, logs, and account files stay isolated. The client runs on the lab's private virtual display with silent audio. A recording lasts between 20 and 300 seconds. It allows one connection and blocks automatic reconnects. The tool accepts the Java pack prompt, saves a screenshot, and stops its processes.

For a local fixture, use:

```bash
bun run server-replay record local --target 127.0.0.1:19132 --seconds 120
```

Local fixtures use offline authentication. Recording a public server always requires the saved Bedrock account.

### Record with the official client

Prepare BedrockOnLinux through the capture lab, then use a Bedrock 1.26.51 installation:

```bash
bun run capture prepare-launcher
bun run server-replay record hive --client native --seconds 120
```

Use `--native-home /absolute/path/to/installation` to select another prepared installation. Its game and Proton directories must be inside that installation. The tool makes a separate private copy and runs it on the lab display. It does not operate the user's running client.

The native client and saved MinecraftAuth account must belong to the same Xbox account. The relay verifies multiplayer tokens against the official issuer's published signing keys and binds native client properties to the authenticated client key. It preserves those properties and authenticates the upstream connection with a fresh session key. It records decrypted packets without translating gameplay. Pack reconstruction checks hashes and decrypts selected assets for replay. Missing bytes from a cached pack fail the capture. Pack parsing errors preserve the raw recording for offline repair. Success requires pack export to finish before shutdown.

The launcher must pass its normal graphics safety checks. A failed native launch does not authorize changing those checks or joining Hive through ViaBedrock.

## Replay locally

Use the private directory printed by the recording command:

```bash
bun run server-replay inspect .stackanvil/replay/<recording>
bun run server-replay replay .stackanvil/replay/<recording> --seconds 150
bun run server-replay selftest
```

Allow enough time for Java startup, pack conversion, and the full recorded scene. The scene clock starts at the recorded resource-pack stack. Earlier scene packets keep their order and arrive immediately after local pack negotiation. This skips the captured download delay and preserves world timing. Subchunk replies wait for matching requests from the local client, which can load packs more slowly than the captured client. The scene clock pauses during that wait; a missing request fails after 15 seconds. Packet bytes and order stay unchanged.

The replay server binds only to loopback. It creates a fresh offline handshake and serves packs through a loopback HTTP endpoint. It preserves the captured entity IDs, skins, world data, and packet order. Server transfers and recorded disconnects do not run.

Replay connects the Fabric add-on directly to the local Bedrock replay server. This exercises its native skin and entity renderer. A separate recorder mod exists only in the private test instance.

Skins can reference built-in Bedrock animations. For those scenes, pass `--account /absolute/path/to/bedrock.json` to select your saved Bedrock account. The client obtains its licensed, versioned assets once and reuses `.stackanvil/replay/client-assets/`. This cache stays private and separate from the packet recording. The replay server still connects only over loopback; initial asset acquisition can contact the official account and asset services.

Transport checks require playable spawn, a Java pack reload, and delivery of the complete scene. A SHA-256 comparison checks scene payloads against the recording. Pack negotiation, session status, and latency probes are excluded because replay creates them again.

Rendering checks compare installed skin dimensions and pixel hashes against packet-derived expectations. They also check supplied skin geometry, native player renderer selection, and custom actor model evaluation. Scenes with custom actors also require native model resolution and an actual custom actor draw submission. These checks do not require every off-camera actor to appear in a frame. Scenes with remote-player geometry require an actual native player draw submission. When the recording supplies local-player geometry, replay uses that identity and requires a third-person avatar submission. A server can omit the local skin; this does not waive remote-player rendering checks. Recorded scene packets stay unchanged. Model parsing failures, unresolved block mappings, missing textures, client crashes, and unexpected exits fail the replay. Actors absent from the post-spawn server registry are reported separately and follow the protocol's existing unknown-type handling. Registered actors still require valid models and textures. Private `render-audit.json` and `verification.json` files explain the result.

These assertions cover asset installation and model resolution. They cannot prove every animation frame, shader effect, or camera view matches the official client. Inspect the saved screenshot and add a focused regression for those behaviors.

Private `camera-audit.jsonl` observations include frame time, world clocks, player light levels, gamma, and the effective skylight brightness factor. They also cover scenes that omit the local-player skin. Match world time and camera position when comparing lighting. A running world clock continues into night after the recorded scene ends.

Use `--client proxy --transport-only` to check the separate Java → ViaProxy route. The proxy route does not exercise the add-on's native appearance renderer. `--transport-only` preserves rendering failures in the report while allowing a transport check to finish.

## Validation scope

The native recording screenshot shows the official Bedrock client. The local replay screenshot shows ViaFabricPlus with the Bedrock add-on.

Private regression recordings cover CubeCraft, Hive, the public Geyser test server, and Minehut. CubeCraft exercises 240 skin updates, 37 advertised custom actor types, and actual native actor and player submissions. The Geyser scene exercises supplied player geometry and custom block packs.

Minehut reaches its age-selection form. This does not verify admission beyond that form. An official-client Hive recording reaches playable lobby spawn and includes all 24 advertised resource packs, 49 supplied geometry skin updates, and 36 registered custom actor types. Hive omits the local-player skin. Local replay passes complete-payload transport checks and the skin and model rendering checks. All 49 geometry skins retain their recorded pixels. Actual remote-player and custom actor draws are verified. The 36 registered custom actor types resolve, and all 11 referenced vanilla item images load from the private licensed cache.

Custom block mapping and model checks cover the captured definitions. They do not prove every state or animation matches the official client. Legacy plain texture-array variation selection, nonuniform scaling of rotated cubes, and double-sided alpha-test back faces remain limitations. Custom blocks using carriers without fluid support also lose a second water layer. The Hive recording includes wet and dry `hive:cat_tail` plants, so a future fluid fix must preserve water by position.

Custom light filters use the runtime network components. The Hive recording exposed 12,098 placements whose transparent or partial filters previously became fully opaque. This input error is fixed. The converter also preserves explicit `face_dimming: false` material settings. The Hive capture contains 136 such material instances across 131 custom block definitions.

Native Bedrock 1.26.51.1 server measurements distinguish slab states. Single slabs reduce skylight, while double slabs block it. Stairs transmit skylight regardless of their upper or lower orientation. The light engine uses these native results rather than Java face-occlusion rules. The saved Hive world contains 17,078 half slabs and 11,795 double slabs.

Lighting still uses Java brightness and sunset curves. The native gamma shader uses a different transform, but its slider mapping remains unverified. These fixes do not establish pixel-identical exposure, ambient occlusion, or custom world lighting.

## Limits

This server replays a recorded scene. It does not simulate new gameplay decisions, collisions, inventory changes, commands, or unexplored chunks. New actions receive no authoritative response beyond the recording.

Blob caching is disabled during capture, so chunk payloads do not depend on an older client cache. Replays require the same pinned Bedrock protocol and all advertised packs. Incomplete or incompatible recordings fail.

The tool never runs live captures as part of `bun test`. Public recordings require the explicit `record` command. Regular regression runs use `replay` and private fixtures.
