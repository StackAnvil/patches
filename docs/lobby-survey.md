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
| GenWars | Fresh catalog admission, pack negotiation, StartGame | Disconnected before a playable scene while decoding the trailing owner-ID string. No rendering verdict. |
| Mineville and Zeqa | Hub, Earth SMP, cross-server transfer, Zeqa lobby, SkyWars FFA | Selector actions, the transfer, a free FFA spawn, kit delivery and return to the lobby work. Menu titles and labels remain malformed. The fresh transfer also reports a texture-atlas failure and invalid font data. |

CubeCraft's recorded cosmetic previews use the account's own skin, as supplied by the server.
That appearance alone does not indicate a skin-cache error.
This survey does not establish native parity for their body direction.

## Reproductions to retain

- **CubeCraft player animations:** two files define different versions of `animation.cubecraft.logo.idle` in one pack. The shared registry throws `Ambiguous resource identifier`, preventing the player graph from loading even though the conflict concerns a logo.
- **Lifeboat SkyWars:** open the navigator, choose the minigame selector, choose SkyWars, then Solo. `ChunkTracker.remapChunk` reads biome palette index 2 from a palette containing two entries and disconnects the client.
- **Hosted experiences:** resolve SoulSteel or Mob Maze through the current catalog and connect with the same refreshed account context. The saved StartGame packet reaches a `StringType` read in `JoinPackets` after its bytes are consumed. Packet layout and target-version compatibility need further inspection.
- **Lifeboat forms:** the navigator and game selectors use generic dialogs with titles such as `form52_Navigator`. Their authored presentation still needs support. Working response buttons do not establish visual parity.
- **Enchanted hub UI:** the authored screen shows `custom.hub_menu_init`, internal button labels, and repeated glyphs. A response button still initiates a transfer. Separate the presentation failure from the working action.
- **Enchanted Box PvP:** one capture crashes while approaching the trader. Chunk compilation fails in `PistonMovingBlockEntity.getMovementDirection` because its direction is null. The captured stack reaches this through collision-shape queries during ambient-occlusion lighting. The add-on creates the moving block entity with Java's empty constructor before translated Bedrock data initializes its direction. The pending lifecycle and carried-state codec corrections are verified below.

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

## Fresh GenWars admission

On 22 October, GenWars passed catalog admission and began its join with the rebuilt client.
The decoder consumed the 912,421-byte StartGame packet, then failed at the trailing owner-ID string read in `JoinPackets`.
This matches the failure location seen on other hosted experiences; the packet-layout cause still needs verification.
No playable observer state appeared, so this run cannot assess entity, block, GUI or item rendering.
The client and private display closed normally. Its installed add-on checksum matches the fresh build.

## Fresh Mineville-to-Zeqa route

A fresh 300-second run uses the rebuilt client with a 3 GB heap, render distance 4 and no mipmaps.
The accepted add-on checksum matches the build.
The Mineville game selector opens with its internal title and clipped labels.
Its PvP action transfers the same client to Zeqa, with a separate connection journal.
The earlier numeric resource-alias parser error does not occur.

During that transfer, Java cannot stitch the converted shop texture `viabedrock:item/entities/entity/sign_shops/shops`, which measures 4000 by 1280 pixels.
Resource reload also rejects font data with ascent 5 and height 1.
The client remains playable, but its HUD, entity labels and FFA buttons show missing glyphs and repeated microphone icons.
These errors prevent a clean rendering verdict. Their connection to individual visible glyph failures still needs isolation.

The first FFA action opens the SkyWars spawn selector.
Selecting Tower opens a rank requirement dialog; the free Random option loads a playable map and supplies the ordinary kit.
The terrain and kit items render in the retained screenshots.
The `/lobby` command confirms the return, and the lobby terrain loads again.
Plain pig models appear at fixed lobby positions, including positions suspended above the scene.
Their intended native appearance remains unverified.

The survey approaches fixed lobby actors, but does not confirm another NPC response before the run ends.
An advertising dialog interrupts the later movement attempt.
The earlier CubeCraft shop interaction remains the confirmed live NPC control.
The completed recording fails verification; the successful actions above do not establish a clean client run.
All six owned process identities close normally, and the private display stops.
Raw journals, screenshots, the short selector video and logs remain private.

## Enchanted pending-piston correction

The new native moving-block entity initializes direction from the translated block state and starts with empty carried geometry.
Its ticker waits for the separate block-entity data.
This prevents null-direction collision queries and premature replacement with air.
After loading, it resumes Java's ordinary animation. Ordinary Java piston entities keep their ticker.

A decoder regression also exposes an older carried-state format.
Java 26.3 expects `id` and lowercase `properties`; the translator previously sends `Name` and `Properties`.
The real decoder rejects that compound and substitutes air.
The producer now uses the current codec.
An integration test writes its actual NBT through the network codec and loads it with Minecraft's piston entity.
All 24 direction, motion and carried-state combinations pass, including stairs with non-default properties.

Both regressions fail before their corrections.
The transformed-client probe verifies six production factory directions, 600 pending ticks, six loaded updates and an ordinary Java ticker control.
The replay reaches the previous trader-approach location without the null-direction failure.
The scene still has other rendering defects. These checks do not establish native visual parity.

All four projects build with 2,264 passing tests and 152 optional skips.
All 102 core and 38 client patches replay cleanly, and offline tooling and metadata validation pass.

The complete 120-second replay passes transport verification.
Overall rendering verification still fails on unresolved block, entity and texture mappings.
No null-direction piston failure occurs. All seven owned process identities close, and the private display stops.

## Treasure Hunt and MegaSMP follow-up

On 22 October, fresh catalog admissions tested both servers with the rebuilt add-on.
Treasure Hunt fails before a playable scene.
Its StartGame decoder consumes all 495,146 bytes, then attempts to read the trailing owner-ID string.
This matches the field that fails on several earlier creator-server admissions.
The failed join provides no rendering verdict.

MegaSMP reaches a playable spawn with terrain, held items, villagers, and custom models.
A verified ray hit on the Sell Shop villager precedes a successful right-click interaction.
The resulting generic dialog exposes `@mineville/long_form` in its title and clips the sell button's text.
The survey closes the dialog without selling items.

The ninth hotbar item opens the team menu.
Its title exposes `@mineville/other_main_menu`, its text contains replacement glyphs, and several buttons appear blank.
The survey does not create a team or accept an invitation.
The ordinary HUD contains large overlapping tutorial, action, and sidebar text.
A screenshot with the HUD hidden confirms that the spawn terrain and some custom models render beneath it.
Native comparisons remain necessary to classify each layout difference.

The client also fails to load `mvmodels:holy_knight` and `mvmodels:mecha_oondasta` actor graphs.
Both failures report `Expected SEMICOLON, found COLON` during MoLang parsing.
Their retained animation timelines contain namespaced event strings such as `mm:Pet_Step_SFX;`, which the current graph loader treats as MoLang.
These are confirmed graph-loading failures; the survey does not establish their exact native appearance.
The `/lobby` command returns to the same spawn. The server rejects `/hub` as an unknown command.
No additional game-mode destination is verified in this MegaSMP run.

The complete 240-second MegaSMP recording passes gameplay verification and exits normally.
Its audit records 43,744 remote-player frames and 105,848 custom-actor frames, with 117 resolved custom models.
Those totals do not erase the graph-loading and GUI defects above.
Both fresh survey clients embed all 1,360 rebuilt core classes and the matching block-item resources.
All seven Treasure Hunt process identities and all six MegaSMP identities close normally.
Raw packets, accepted packs, screenshots, logs, and observer data remain private.
