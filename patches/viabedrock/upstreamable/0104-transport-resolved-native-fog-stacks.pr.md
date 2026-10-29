# World-resolved native fog transport

Retain complete `PLAYER_FOG` command stacks and publish world-selected settings through `viabedrock:fog` payload version 2.
Each immutable snapshot includes command layers, biome bindings, and the existing `minecraft:fog_default` registry fallback.
Commands take priority over the selected biome, then that fallback, independently for each medium.
Empty commands retain base resources; connection replacement retires the entire snapshot.
Publications remain gated by join state and channel negotiation, including late registration.

The [documented native stack](https://learn.microsoft.com/en-us/minecraft/creator/documents/foginresourcepacks?view=minecraft-bedrock-stable) places command settings above biome settings and data defaults.
This implementation preserves the existing registry fallback policy.
Legacy pack-defined default bindings and spatial biome blending still need matching native controls.

The native protocol 2225 captures use Bedrock 1.26.60.5 and BDS 1.26.60.6.
They establish unsigned-count string-array payloads, matching-medium priority, and lower air fallback beneath a water-only entry.
A qualified End-biome fixture binds a unique red fog identifier without commands or living dragons.
Actual native shader uniforms establish red fog from 0 to 32 blocks at effective render distance 192.
The test pack still matches every file hash from that reference.

Distance settings retain fixed or render-relative units and immutable colors.
Complete settings require finite valid distances; partial color-only definitions retain their existing registry role.
`FogDefinition` takes a distance map in addition to its color map.
`FogState` now requires biome and default settings, and version 2 replaces the earlier payload contract.
Core, proxy, and client distributions must use the matching contract.
Malformed counts, duplicate biome aliases, unsupported versions, and trailing fields fail decoding.

Regressions cover medium precedence, immutable world ownership, resource replacement, codec bounds, negotiated publication, and empty commands.
The full core build passes 2,071 cases, including 176 optional skips, with no failures or errors.
Both Checkstyle tasks pass.
Fresh direct and ViaProxy renderer controls each verify seven phases:
red 32-block base fog, water-only inheritance, white 16-block commands, removal, empty commands, living-dragon override, and death.
The cap remains 100 blocks while preserving red base color; death restores 32 blocks.
Both 180-second recordings finish normally, without logged errors or GPU cleanup failures.
Native sky sampling, exact transitions, engine-specific vanilla rules, fluids, and weather remain outside this bounded control.
The private journals and licensed assets remain outside Git.
This transport does not establish complete native fog parity.
