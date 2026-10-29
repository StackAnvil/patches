# Native fog command transport

Retain complete `PLAYER_FOG` command stacks and publish resolved distance settings through `viabedrock:fog` payload version 1.
Each publication uses the current connection's selected resources. Empty snapshots clear previous commands, including after late channel registration.

The native protocol 2225 captures use Bedrock 1.26.60.5 and BDS 1.26.60.6.
They establish unsigned-count string-array payloads, topmost matching-medium priority, and lower air fallback beneath a water-only entry.
The private journals and assets remain outside this repository.

Distance settings retain fixed or render-relative units and immutable colors.
The existing biome color fallback remains intact. Complete settings require valid finite distances; partial color-only definitions retain their existing registry role.
`FogDefinition` now takes a distance map in addition to its color map.

Eleven focused fog tests pass, including the existing registry regressions. Both core Checkstyle tasks pass.
Coverage includes medium precedence, immutable ownership, resource replacement, payload limits, trailing fields, negotiated publication, and empty resets.
The full core build passes 2,066 cases, including 176 optional skips, with no failures or errors.
Fresh direct and ViaProxy command controls reach the actual client fog buffer.
They cover fixed distances, colors, water-only fallback, removal, and empty resets.
The add-on applies the separately verified native dragon distance cap. Exact transition behavior remains open.
This patch supplies transport and resource interpretation; it does not establish complete native fog rendering parity.
