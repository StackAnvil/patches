# Live lobby survey

These checks used the patched Java client with Bedrock 1.26.51, protocol 2193, on 21 October 2026.
The client ran on the private display with software rendering and silent audio.
Raw packets, account data, downloaded packs, and screenshots remain private.
Each recording contains one connection. Enchanted's destination was tested through a fresh direct connection to its supplied transfer address.
Continuous transfer verification remains open.

The 22 October follow-up below verifies a continuous Mineville-to-Zeqa transfer with separate connection journals.

## Observed results

| Server | Reached | Result |
| --- | --- | --- |
| CubeCraft | Main lobby, SkyWars, MinerWare, Parkour | The authored selector changed live lobbies, and a verified NPC click opened the cosmetics shop. Custom selector images and inventory items rendered. The animation follow-up restores the player graph in replay and a fresh live connection. |
| Lifeboat | Navigator, minigame selector, SkyWars description, Solo action | Forms responded through generic Java dialogs. The Solo action was followed by a biome palette exception and disconnect. The world stayed black before that action; its cause remains unresolved. |
| Galaxite | World loading | Disconnected with `End of stream` before a playable scene. No rendering verdict. |
| SoulSteel | Fresh catalog admission, pack negotiation, StartGame | Pack loading reported missing manifests. StartGame decoding exhausted the packet while reading a trailing string. No playable scene. |
| Mob Maze | Fresh catalog admission, StartGame | Hit the same trailing-string decoding failure. No playable scene. |
| Enchanted | Pack negotiation, authored hub UI, Box PvP destination | The archive fix opens the hub UI. Its title and button labels are garbled, but a button sends a transfer. A separate destination capture loads the world and shop NPCs, then hits a moving-piston rendering crash. |
| Geyser test server | Quick Play attempt | Connection failed before a scene loaded. No rendering verdict. |

CubeCraft's recorded cosmetic previews use the account's own skin, as supplied by the server.
That appearance alone does not indicate a skin-cache error.
This survey does not establish native parity for their body direction.

## Reproductions to retain

- **CubeCraft player animations:** two files define different versions of `animation.cubecraft.logo.idle` in one pack. The shared registry throws `Ambiguous resource identifier`, preventing the player graph from loading even though the conflict concerns a logo.
- **Lifeboat SkyWars:** open the navigator, choose the minigame selector, choose SkyWars, then Solo. `ChunkTracker.remapChunk` reads biome palette index 2 from a palette containing two entries and disconnects the client.
- **Hosted experiences:** resolve SoulSteel or Mob Maze through the current catalog and connect with the same refreshed account context. The saved StartGame packet reaches a `StringType` read in `JoinPackets` after its bytes are consumed. Packet layout and target-version compatibility need further inspection.
- **Lifeboat forms:** the navigator and game selectors use generic dialogs with titles such as `form52_Navigator`. Their authored presentation still needs support. Working response buttons do not establish visual parity.
- **Enchanted hub UI:** the authored screen shows `custom.hub_menu_init`, internal button labels, and repeated glyphs. A response button still initiates a transfer. Separate the presentation failure from the working action.
- **Enchanted Box PvP:** one capture crashes while approaching the trader. Chunk compilation fails in `PistonMovingBlockEntity.getMovementDirection` because its direction is null. The captured stack reaches this through collision-shape queries during ambient-occlusion lighting.

NPC clicks in the initial CubeCraft pass did not produce a confirmed response.
The precise ray target was not recorded there. The live follow-up below confirms a shop NPC response.
A separate Enchanted retry verifies the ray hitting the trader, then right-clicks it and opens the kits menu.
That response works, while the menu still shows its internal title and malformed text.

The menu trace identifies three presentation defects: its descendant factory override was
stored but never applied, texture validation rejected filenames containing `~`, and locally
counted factories required a server controller to supply their rows.
The path, texture, count, and binding changes now resolve all three captured forms through their
authored layouts. The advertisement keeps visible responses 0 and 1; the kits menus keep
responses 0 through 5. A referenced progress template is still missing.
These checks establish resolution and response identity. Native visual parity remains open.

A fresh local Java replay draws the advertisement's frame, remote image, text, and button.
Escape closes it. The kits form draws six cards in four columns with readable labels and images.
Clicking the third card sends form ID 2 with response index 2 in the recorded Bedrock packet.
This verifies client dispatch through the authored scene, not public-server acceptance of that response.
The replay's transport check passes. Its initial rendering check fails on skin geometry,
model processing, and unresolved-resource checks. The geometry follow-up below resolves
the first two categories; unresolved mappings remain open.

## Changes verified from this survey

The recorder now discards observations of camera presets that core intentionally ignores before StartGame.
It waits for resource loading and Java play-listener initialization, then compares decoded preset bytes during play.

The lab accepts explicit public endpoints through `server-replay record public --target host:port`.
This supports current catalog endpoints while retaining the Hive guard and loopback restrictions for local fixtures.

The archive reader now uses the ZIP central directory through an in-memory seekable channel.
The Enchanted download contains 73 entries, including 58 stored files with data descriptors, and passes CRC validation.
The original reader fails on that archive; the corrected reader retains all 58 files and resolves the advertised manifest.
Regressions cover embedded ZIP signatures and corrupt payload bytes alongside the existing archive-layout cases.

With the UI corrections, all four projects build successfully: 2,147 tests pass and 152 optional cases skip.
All 102 core patches replay cleanly. Offline validation passes all 263 tooling tests and patch metadata checks.

Three Enchanted skin records contain JSON null followed by a newline, rather than supplied geometry.
The renderer now treats those values as absent geometry, and the replay inspector counts them correctly.
Malformed non-null values still require successful installation. A fresh 130-second replay installs
all 273 skins and 270 supplied geometry records with no geometry-parse warnings.
Transport passes; rendering verification still fails on unresolved mappings.

## Startup particle delivery

The Enchanted destination sends custom particle packets before Fabric registers its play channels.
Translation discarded ten packets as unknown particles, although their definitions were in the downloaded pack.
Core now keeps world packets in order until Java acknowledges its initialized play listener.
The same buffer covers supplemental resource-pack loading and joins without custom blocks.

A fresh 130-second replay records 2,196 native particle render frames, with up to 99 particles in 68 emitters.
The font and sparkle effects reach the native world particle render pass.
Child highlight effects also create emitters and particles. The ten startup warnings fall to zero,
with no particle loading or initialization errors. The authored advertisement and kits menu still open;
Escape closes the advertisement and the third kit card dispatches its response.
These observations verify delivery and execution. They do not establish native visual parity.
The scene retains overlapping labels and repeated HIT icons that were present before this change.

All four projects build: 2,149 tests pass and 152 optional cases skip.
All 102 core patches replay cleanly. Offline validation passes all 263 tooling tests and metadata checks.
The four replay self-test groups also pass.
Transport passes, and all 273 skins and 270 supplied geometry records install.
Rendering verification still fails on unresolved mappings. All seven owned test processes close normally.


## CubeCraft animation registration

CubeCraft's pack declares two different versions of `animation.cubecraft.logo.idle` in separate files.
The shared animation library rejected the catalog, which stopped the unrelated player graph from loading.
The renderer could not use the animation graph, including valid player definitions.

An executable probe of Bedrock 1.26.51.1 confirms that animation registration replaces an existing definition as a whole.
Nine registrations cover six replacements and retention of unrelated identifiers.
The probe covers registration, native lookup, reference accounting, and replacement destruction.
It supplies manager metadata and runtime seams; default Molang compilation and native file enumeration are outside its scope.

The shared library now applies that replacement rule in accepted file order.
It preserves file admission order when grouping bundled assets.
Pose tests cover both orders, higher-pack overrides, discarded old bones, and retained unrelated animations.
The name-handling follow-up below verifies definition conversion and reference lookup. Native file-enumeration order remains open.
This change does not establish native parity for NPC body direction.


A fresh 300-second replay resolves 200 player animations and 12 controllers.
The observer sees changing bone poses, with no player-graph or skin-alias loading errors.
The replay reaches SkyWars EU1, MinerWare EU2, and Parkour EU1.
All 320 skins and supplied geometry records install, with 26,716 remote-player render frames observed.
Transport passes; rendering verification still fails on unresolved mappings.
The replay's final Parkour terrain is incomplete, while the original live screenshot shows the full lobby.
That difference needs a separate replay investigation and prevents a terrain-parity claim.
The seven owned test processes close normally.

All four projects build with 2,150 passing tests and 152 optional skips.
All 38 client patches replay cleanly. Offline validation passes 263 tooling tests and metadata checks.
All four replay self-test groups pass.

## Animation names and live CubeCraft actions

Bedrock 1.26.51.1 folds ASCII uppercase bytes when it registers animation definition names.
Its public lookup keeps each reference's exact spelling.
An executable probe confirms 514 conversion cases and four lookup controls through the original native helpers.
The fixture supplies manager metadata and runtime seams, including default Molang compilation.
Whole-file admission, native file enumeration, and visual parity remain outside this probe.

The client now applies that conversion before replacement in shared libraries, the legacy server factory, and direct JSON graphs.
It preserves non-ASCII characters and reference spelling.
Pose tests cover bundled and accepted libraries and direct JSON graphs, including complete replacements and retained unrelated animations.

A fresh 180-second live connection verifies all three selector actions with the rebuilt client.
Button responses 2, 6, and 7 reach SkyWars EU1, MinerWare EU2, and Parkour EU2, respectively.
Each destination shows its terrain and scoreboard. This confirms live acceptance beyond the earlier timed replay transitions.
The selector uses the protocol's 36 button elements; it is an authored form.

After the Parkour switch, the observer records the ray hitting the cosmetics shop's interaction entity.
Right-click opens its authored shop menu with images and labels.
This verifies that NPC interaction independently of the selector actions.
The live graph resolves 200 animations and 12 controllers, with changing sampled poses and no graph-loading errors.
All 191 skins and supplied geometry records install, with no rejected skins.
The audit counts 4,993 remote-player render frames and 107,666 custom-actor render frames.
These observations confirm graph execution and renderer use. Cosmetic-preview body direction still needs a native comparison.

All four projects build with 2,151 passing tests and 152 optional skips.
All 38 client patches replay cleanly. Offline validation passes 263 tooling tests and metadata checks.
All four replay self-test groups pass. The six owned live-test processes close normally.

## Mineville and Zeqa follow-up

On 22 October, a fresh catalog admission reached Mineville's hub with the last validated add-on build.
Its game selector opened, but showed `@mineville/gamemodes_menu` in the title, clipped labels, and repeated glyphs.
The observed ray hit a lobby NPC's interaction entity before the click.
Right-click produced no confirmed response. Left-click moved the player to Earth SMP within the same connection.
The `/lobby` command returned to the hub.

Earth SMP loaded its terrain after the player moved clear of the spawn obstruction.
Its tutorial showed `%obj/Tutorial` as a raw title. Its city menu showed `@mineville/other_main_menu`, malformed text, and empty buttons.
The survey did not create a city or buy an advertised bundle.

The hub's PvP selector then transferred the same running client to Zeqa.
The second connection reached StartGame, spawn, local-player initialization, and movement input.
Its terrain and lobby models loaded. Menu labels and HUD text contained square glyphs and repeated microphone icons.
The Free For All menu responded, and its first button opened the CrystalPvP spawn selector.
The run ended before a destination in that selector was tested.

Mineville's logs repeatedly report `Expected IDENTIFIER, found FLOAT` during render-controller evaluation.
The accepted pack contains resource references such as `Texture.num.0` and `Geometry.digit.1`.
The shared parser rejected their numeric suffixes. The resource-alias correction below addresses that failure; target-client visual comparison remains open.
Floating pig models and default player appearances also need a native comparison before classification as rendering defects.

The original recorder rejected the second connection. Transfer-enabled live recordings now keep separate journals and exported packs for each connection.
The runner accepts the exact normal transfer notice and still rejects other disconnects or packet errors.
Offline replays retain the single-connection guard.
The completed 240-second run passes gameplay checks for both connections. All six owned processes close normally.
The tooling suite passes 264 tests. Replay self-tests cover journal separation, overwrite protection, and the existing replay guard.

A fresh Dimension Clash admission fails before a playable scene.
Its packet decoder exhausts a 1,584,889-byte packet while reading a string. No rendering verdict is possible.
All six owned test processes close normally.

OneBlockOnline also fails before a playable scene, while reading a string at the end of a 4,234,154-byte packet.
No entity, block, item, or GUI rendering verdict is possible. All six owned test processes close normally.

## Mineville resource-alias correction

Texture, geometry and material aliases now retain their complete name after the namespace.
The old parser treated dots inside those names as nested object access.
It rejected numeric segments and could silently lose word-only aliases such as `Texture.duels.background`.
The correction preserves leading zeroes and numeric-looking suffixes without changing variable members, quoted values or decimal arithmetic.

The semantic regression fails before the fix and passes afterward.
A private target 1.26.51.1 expression-reader/compiler fixture verifies 26 admission cases.
Allocation, CRT operations, diagnostics and service availability remain supplied boundaries.
The fixture does not establish resource resolution, world context or visible parity.

The actual accepted hologram pack resolves all six controllers across ten sample values.
All 120 selected geometry and texture values refer to the entity's declared resources; material selections resolve too.
All four projects build with 2,206 passing Java tests and 152 optional skips.
Offline validation passes the 264 tooling tests and patch metadata checks.

A 210-second software-rendered replay sends the complete scene and passes transport verification.
It records 65,524 custom-actor render frames, 570 resolved models and no empty model updates.
The installed parser matches the tested artifact. No render-controller or numeric-member parser errors occur.
All seven owned process identities close, and the private display stops.

Overall rendering verification still fails.
`modelengine:adboard_discord` never reaches native model evaluation, and unresolved block, entity and texture mappings remain.
The original live run and the replay both report missing block states after lobby transitions.
Native images, material output and CubeCraft cosmetic-preview body direction still need comparison.

The first replay window ended before the complete scene arrived.
The host's out-of-memory killer stopped a longer attempt.
The completed replay uses a private 3 GB heap, render distance 4 and disabled mipmaps.
