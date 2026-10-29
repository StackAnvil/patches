# World-resolved native fog transport

## Purpose

Publish commands, biome settings, and pack-defined defaults through `viabedrock:fog` payload version 2.
Empty commands retain world resources. World changes replace the entire snapshot.

## Design constraints

Commands take priority over biome settings, then data defaults, separately for each medium.
Resolve inherited legacy bindings before transport. Clearing legacy bindings exposes modern biome fog again.
Preserve fixed and render-relative distances. Partial color-only definitions retain their registry role.
Publication requires join completion and channel registration, including late registration.
Core, proxy, and client distributions must share the version-2 payload contract.

## Validation and remaining limits

Native 1.26.60.5 and BDS 1.26.60.6 controls establish command precedence and red 32-block End fog.
Native Fancy controls also establish legacy air inheritance, replacement through a custom default, and modern fallback after clearing.
Prior direct and ViaProxy controls cover commands, removal, empty commands, and dragon state changes.
`FogStorageTest` exercises pack-to-snapshot composition and replacement. Codec tests protect malformed payload boundaries.

The new legacy bindings still need direct and ViaProxy renderer comparisons.
Biome blending, combined vision effects, other render modes, fluids, and weather remain open.
The [owning patch](0104-transport-resolved-native-fog-stacks.patch) retains the rationale and versioned evidence.
