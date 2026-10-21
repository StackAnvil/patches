# Live lobby survey

These checks used the patched Java client with Bedrock 1.26.51, protocol 2193, on 21 October 2026.
The client ran on the private display with software rendering and silent audio.
Raw packets, account data, downloaded packs, and screenshots remain private.
Each recording contains one connection. Enchanted's destination was tested through a fresh direct connection to its supplied transfer address.
Continuous transfer verification remains open.

## Observed results

| Server | Reached | Result |
| --- | --- | --- |
| CubeCraft | Main lobby, SkyWars, MinerWare, Parkour | The game selector opened and changed lobbies. Custom selector images and inventory items rendered. Loading the player animation graph failed on a duplicate resource identifier. |
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

NPC clicks in the CubeCraft pass did not produce a confirmed response.
The precise ray target was not recorded there, so this is not yet an interaction failure reproduction.
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
