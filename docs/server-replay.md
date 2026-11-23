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

The other named targets are `hive`, `lifeboat`, `galaxite`, `minehut`, and `geyser`. Each live target must provide NetherNet. The `geyser` target is the public Geyser test server. The [pinned Geyser release](bedrock-test-packs.md#geyser-fixtures) has no NetherNet endpoint, so expect that recording to fail unless the server adds one. CubeCraft uses `mco.cubecraft.net`, because its signaling certificate does not name `play.cubecraft.net`. The Hive uses `nethernet.playhive.com`, but ViaBedrock blacklists its network because translated clients can be banned. Use the official client to record Hive. The tool preserves the translated-client guard. A translated diagnostic join requires the explicit `--allow-hive` option.

For another public server, use its current address from the in-game catalog or the server operator:

```bash
bun run server-replay record public --target play.example.org:19132 --client addon --seconds 240
```

All socket targets use HTTP NetherNet. Both `host:port` and `nethernet://host:port` select that transport.
Hosted Xbox JSON-RPC experiences use `nethernet-xbox-json-rpc://network-id` with `--client addon` or `--client proxy`.
Resolve a fresh network ID through the catalog before connecting. These IDs have no port.
The private manifest records the selected endpoint.
Catalog experiences can use temporary endpoints, so resolve the address again before a later run.
Named targets retain their configured address. Local targets still require loopback.
The Hive guard also applies to its hostnames supplied through `record public`.

The default login comes from the separate `StackAnvil Desktop 26.3` profile. Use `--account /absolute/path/bedrock.json` for another saved MinecraftAuth Bedrock account. The tool copies that account into its private client or proxy directory. It does not change the source account file.

The Java client uses a private copy of the integration instance. Its runtime libraries stay shared, while settings, mods, logs, and account files stay isolated. The client runs on the lab's private virtual display with silent audio. A recording lasts between 20 and 3600 seconds. A replay session allows 20 to 300 seconds. It allows one connection and blocks automatic reconnects. The tool accepts the Java pack prompt, saves a screenshot, and stops its processes.

For a local fixture, use:

```bash
bun run server-replay record local --target 127.0.0.1:19132 --seconds 120
```

Local fixtures use offline authentication unless you supply `--account`. Recording a public server always requires the saved Bedrock account.

### Record a direct add-on connection

Use `--client addon` to record a direct connection without ViaProxy:

```bash
bun run server-replay record cubecraft --client addon --seconds 120
bun run server-replay record local --target 127.0.0.1:19132 --client addon --seconds 120
```

Direct, proxy, and native recordings accept local HTTP signaling endpoints such as `nethernet://127.0.0.1:19182`.
Supply `--account` when the endpoint needs a signed operator identity.
The private Fabric recorder captures packets before protocol translation and checks initialization and gameplay acknowledgments.
Add-on recordings allow up to 20 minutes for setup, matching the licensed asset helper's existing download limit.
The requested scene duration starts after local-player initialization and the first gameplay input.
This setup allowance does not change production networking or server movement checks.

### Record with the official client

Prepare BedrockOnLinux through the capture lab, then use a Bedrock 1.26.60 installation:

```bash
bun run capture prepare-launcher
bun run server-replay record hive --client native --seconds 120
bun run server-replay record local --target nethernet://127.0.0.1:19182 --client native --seconds 120
```

Use `--native-home /absolute/path/to/installation` to select another prepared installation. Its game and Proton directories must be inside that installation. The tool makes a separate private copy and runs it on the lab display. It does not operate the user's running client.

The native client and saved MinecraftAuth account must belong to the same Xbox account. The relay verifies multiplayer tokens against the official issuer's published signing keys and binds native client properties to the authenticated client key. It preserves those properties and authenticates the upstream connection with a fresh session key. It records decrypted packets without translating gameplay. Pack reconstruction checks hashes and decrypts selected assets for replay. Missing bytes from a cached pack fail the capture. Pack parsing errors preserve the raw recording for offline repair. Success requires pack export to finish before shutdown.

The shutdown hook closes active connections and waits for their event-loop cleanup.
Handler removal also finishes export when a WebRTC disconnect omits the inactive callback.
The launcher allows 45 seconds after termination for native cleanup, including the 35-second pack download limit.
An unfinished pack export still fails the capture and preserves its raw journal.

The relay connects to the HTTP signaling endpoint with the same authenticated session key.
The native client connects to the relay over loopback NetherNet with a temporary server identity.
The first connection can show a local trust prompt. Gameplay packet bytes remain untranslated.
Cancelled trust prompts and failed transport handshakes do not consume the recording.
On the tested BedrockOnLinux 26.60 build, a loopback-only WebRTC candidate fails before gameplay.
For live recordings, `--native-ice-address <local-ip>` binds WebRTC to a specific address on this host.
This option exposes an ephemeral UDP port on that interface. HTTP signaling stays on loopback.
Wildcard, multicast, and nonlocal addresses are rejected. Offline replay does not accept this option.
Native replay remains unverified on this build.
NetherNet protects data channels with DTLS. The relay does not add the legacy Bedrock AES stream.
Transport tests verify compressed batches and reconnect admission through NetherNet.

The launcher must pass its normal graphics safety checks. A failed native launch does not authorize changing those checks or joining Hive through ViaBedrock.

## Replay locally

Use the private directory printed by the recording command:

```bash
bun run server-replay inspect .stackanvil/replay/<recording>
bun run server-replay replay .stackanvil/replay/<recording> --seconds 150
bun run server-replay selftest
```

Allow enough time for client startup, pack conversion, and the full recorded scene. The scene clock starts at the recorded resource-pack stack. Earlier scene packets keep their order and arrive immediately after local pack negotiation. This skips the captured download delay and preserves world timing. A recorded subchunk reply batch waits until at least one entry matches a local request. Clients can group or omit requests differently, so the replay does not require every recorded batch entry to be requested. It sends the whole batch unchanged. This also lets slower clients finish loading packs before replies arrive. The scene clock pauses during that wait; a batch with no matching request fails after 45 seconds. Packet bytes and order stay unchanged.

The replay server binds only to loopback. Native and Java replay both use NetherNet.
It creates a fresh offline handshake and serves packs through a loopback HTTP endpoint. It preserves the captured entity IDs, skins, world data, and packet order. Server transfers and recorded disconnects do not run.

The default replay connects the Fabric add-on directly to the local Bedrock replay server. This exercises its native skin and entity renderer. A separate recorder mod exists only in the private test instance.

### Replay with graphics mods and shaders

Use a recording with custom actors or geometry skins to test the shader compatibility path:

```bash
bun run server-replay replay .stackanvil/replay/<recording> --modpack --seconds 150
bun run server-replay replay .stackanvil/replay/<recording> --shaders --seconds 150
```

`--modpack` installs the full pinned Fabulously Optimized pack in the private replay instance with shaders disabled.
`--shaders` installs that pack with the pinned Iris 1.11.7 and Complementary Reimagined r5.9.3 profile.
It enables shadows, bloom, light shafts, water reflections, and LambDynamicLights features before launch.
The profile approximates the look of Vibrant Visuals on Java.
The host GPU and driver still determine the graphics backend.

The replay installer downloads and verifies the mods; changing `STACKANVIL_REPLAY_INSTANCE` alone does not install its mods.
These options also work with Java recordings and `--client proxy`.
They require a Java client and cannot configure the official Bedrock client.

Each Java session saves `graphics-profile.json` alongside its private logs and screenshot.
The shader replay requires an Iris activation message for the pinned pack.
Missing Bedrock pipeline overrides and shader compilation errors fail rendering verification, even after a complete scene replay.
The standard transport checks still apply.

For an official-client reference, run the complete CLI inside a Linux network
namespace with only loopback routes and cleared capabilities:

```bash
bun run server-replay replay .stackanvil/replay/<recording> --client native --native-manual-connect --seconds 240
```

Native replay refuses an ordinary host network before launching. Keep the relay,
launcher and game in the same namespace. Use a fresh private Wine prefix so it
cannot reuse a wineserver from the host. Verify the actual game and wineserver
namespace before Join. Native replay always stops at the main menu for manual
connection; inspect the local address and port before connecting.
Native runs allow five minutes for connection. The requested scene duration
starts when the recorder creates its packet journal.

The bundled launcher fetches a package license at each start. A restricted TLS
bridge can provide its verified Microsoft licensing endpoints while game traffic
stays isolated. The bridge must reject arbitrary CONNECT targets and preserve
TLS encryption. The private lab keeps its broker and licensing data outside Git.
A native menu that cannot expose local server entry is a failed reference run.

The native route uses the same isolated installation and graphics safety checks as native recording. It connects through the recording relay to the loopback replay server. It requires the complete scene payload SHA-256, completed pack reconstruction, local-player initialization, gameplay input, and a saved reference screenshot. Its report uses `rendering: reference-captured`. It does not substitute for the add-on's rendering assertions.

Skins can reference built-in Bedrock animations. For those scenes, pass `--account /absolute/path/to/bedrock.json` to select your saved Bedrock account. The client obtains its licensed, versioned assets once and reuses `.stackanvil/replay/client-assets/`. This cache stays private and separate from the packet recording. The replay server still connects only over loopback; initial asset acquisition can contact the official account and asset services.

Transport checks require playable spawn, a Java pack reload, and delivery of the complete scene. A SHA-256 comparison checks scene payloads against the recording. Pack negotiation, session status, and latency probes are excluded because replay creates them again.

Rendering checks compare installed skin dimensions and pixel hashes against packet-derived expectations. They also check supplied skin geometry, native player renderer selection, and custom actor model evaluation. Scenes with custom actors also require native model resolution and an actual custom actor draw submission. These checks do not require every off-camera actor to appear in a frame. Scenes with remote-player geometry require an actual native player draw submission. When the recording supplies local-player geometry, replay uses that identity and requires a third-person avatar submission. A server can omit the local skin; this does not waive remote-player rendering checks. Recorded scene packets stay unchanged. Model parsing failures, unresolved block mappings, missing textures, client crashes, and unexpected exits fail the replay. Actors absent from the post-spawn server registry are reported separately and follow the protocol's existing unknown-type handling. Registered actors still require valid models and textures. Private `render-audit.json` and `verification.json` files explain the result.

After the supplied local avatar has an actual native third-person submission, the recorder restores the first-person view for the reference screenshot. It retains that submission in the rendering audit. Compare the final camera position and rotation before aligning images.

These assertions cover asset installation and model resolution. They cannot prove every animation frame, shader effect, or camera view matches the official client. Inspect the saved screenshot and add a focused regression for those behaviors.

Private `camera-audit.jsonl` observations include frame time, world clocks, player light levels, gamma, and Java’s skylight factor. They also record sky, fog, cloud, and sunrise environment colors. When the native lightmap is active, the audit records its actual render-state sky factor, gamma, darkness pulse, night vision, and sunrise color. They also cover scenes that omit the local-player skin. Match world time and camera position when comparing lighting. A running world clock continues after the recorded scene ends. A later `doDayLightCycle` change pauses or resumes the legacy day clock at its current time. Explicit `SyncWorldClocks` updates retain their own rates.

Private `held-item-light-audit.jsonl` observations record actual first-person submissions. They include packed light, quad normals, tint layers, material emission, and the selected pipeline. Observations do not change the item or camera. Compare them with the screenshot timestamp; startup light values can change while chunks load.

Private `native-form-audit.json` observations distinguish authored forms, shared scenes, add-on fallback forms, and standard Java dialogs.
For authored forms, the observer reads identity from the form controller and geometry from the shared screen.
The `presentation` field identifies the path. `nativeForm` is true only for an authored form.
Shared scenes can belong to another domain. A Java dialog classification does not prove that Bedrock supplied it.
The bounded geometry report excludes authored labels, URLs, and input text.
Player and workbench screens also report the request sequence, pending command flags, opening, generation, and revision when those fields are available.
The bundle report includes pointer coordinates, tooltip mode, and separate hovered and displayed source slots.
It exports only known source categories and slot indices. Unknown authored collection names become `other`.
Compare these fields across source updates to detect tooltip restoration without pointer input.
Match sequence changes to input markers and Bedrock request responses to distinguish native presentation commands from ordinary Java clicks. The inventory report excludes query text and item data.

Private `native-sound-audit.json` observations separate native level-event requests from decoded PCM channel starts.
They retain up to 128 observations with timestamps, positions, selected samples, caption keys, pitch, volume, and PCM hashes.
Match these rows to input markers when checking sound dispatch. A level request alone does not prove that a sample reached playback.
The observer does not change playback or export PCM data. Silent lab audio does not establish what a listener would hear.

Private `movement-audit.jsonl` observations record position, velocity, item use, held item, and selected hotbar slot at each observed movement phase.
The `epochMillis` timestamp aligns those observations with external input markers.
Use the item and slot fields to distinguish a changed selection from a missing movement impulse.
Check the packet journal for the actual teleport, correction, and motion commands before judging a combined-mechanics trial.

Use `--client proxy --transport-only` to check the separate Java → ViaProxy route. An accepted converted server pack carries versioned Bedrock rendering metadata. The add-on uses this metadata to activate the native lightmap and disable Java's low-light vignette on the proxy route. Local packs and unsupported metadata cannot activate this context. Resource reload and disconnect clear it. Stale reload completion cannot restore it.

The proxy route still does not support native actor and player geometry. It therefore requires `--transport-only`. This flag preserves rendering failures in the report while allowing a transport check to finish.

## Validation scope

The [public-server guide](lobby-survey.md) lists retained reproduction targets and how to reduce a public result to a local fixture.

Native recording and `--client native` replay screenshots show the official Bedrock client. Default replay screenshots show ViaFabricPlus with the Bedrock add-on.

Current behavior and known gaps are in the [coverage reference](bedrock-coverage.md).

Check graphics mode before comparing colors. The isolated official client can
select Vibrant Visuals, which uses a different lighting path from this classic
lightmap port. Use an explicit Fancy-mode reference for classic shader checks.
Record brightness, field of view, weather and world clocks with each pair. Keep
clock-controlled derived recordings separate from the unchanged source recording.

Private terrain observations raycast from the actual camera and record nearby
block states and raw light values. They also recompute the current Java model's
quad colors and corner lights. These values help isolate propagation from
shading; they do not inspect the chunk's cached GPU vertices.

For image comparisons, align static building features and validate each measured region's edges. Use the same pixels before and after a change. Full difference maps also include moving actors, nameplates, HUD, and texture filtering. Those pixels cannot support an overall renderer parity percentage.

## Limits

This server replays a recorded scene. It does not simulate new gameplay decisions, collisions, inventory changes, commands, or unexplored chunks. New actions receive no authoritative response beyond the recording.

Blob caching is disabled during capture, so chunk payloads do not depend on an older client cache. Replays require the same pinned Bedrock protocol and all advertised packs. Incomplete or incompatible recordings fail.

The tool never runs live captures as part of `bun test`. Public recordings require the explicit `record` command. Regular regression runs use `replay` and private fixtures.
