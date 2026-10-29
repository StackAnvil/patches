# Reproduce public-server regressions

Public lobbies provide varied resource packs and interaction paths.
Use them to find a defect, then reduce it to a controlled local fixture where possible.
A successful join does not establish native rendering or gameplay parity.

## Capture one useful result

1. Record the client build, server address, connection route, and selected resource packs privately.
2. Capture the failing action and its visible result with the [replay tools](server-replay.md).
3. Compare the same action in the matching native client.
4. Identify the owning patch and retain a minimal regression.
5. Record the current limit in that patch's notes.

Keep account data, raw packets, downloaded packs, screenshots, and repeated runs private.
Use Git and release notes for historical fixes instead of appending lobby visits here.

## Retained reproduction targets

These targets come from earlier survey results. They require a fresh build-specific check before any pass or failure claim.

| Target | Path worth retaining |
| --- | --- |
| CubeCraft | Lobby transfers, selectors, NPC cosmetics, server player graphs, and attachables. |
| Lifeboat | SkyWars form actions and the previously black world or biome failure. |
| Galaxite | Converted custom-block geometry, carriers, model acceptance, and secondary fluids. |
| Enchanted | Authored hub UI, transfer continuity, labels, and moving pistons. |
| Mineville and Zeqa | Continuous transfer, resource replacement, menu text, kit delivery, and return to lobby. |
| SoulSteel and GenWars | Startup packet alignment and resource negotiation. |
| Mob Maze | Large declared block palettes and carrier-capacity limits. |
| WildFFA | E-key inventory presentation, food use, pearl/wind-charge rollback, and locator groups. |

Earlier protocol-2193 captures do not establish the current result on protocol 2225.
Known remaining categories include missing pack assets, unsupported material methods, capacity limits, and interaction differences.
The [compatibility page](bedrock-coverage.md) holds current cross-feature status.
