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

## Changes verified from this survey

The recorder now discards observations of camera presets that core intentionally ignores before StartGame.
It still waits for the custom-block resource gate and compares decoded preset bytes during play.

The lab accepts explicit public endpoints through `server-replay record public --target host:port`.
This supports current catalog endpoints while retaining the Hive guard and loopback restrictions for local fixtures.

The archive reader now uses the ZIP central directory through an in-memory seekable channel.
The Enchanted download contains 73 entries, including 58 stored files with data descriptors, and passes CRC validation.
The original reader fails on that archive; the corrected reader retains all 58 files and resolves the advertised manifest.
Regressions cover embedded ZIP signatures and corrupt payload bytes alongside the existing archive-layout cases.
All four projects build successfully: 2,133 tests pass and 152 optional cases skip.
The offline checks also pass, including 263 tooling tests and patch metadata validation.
