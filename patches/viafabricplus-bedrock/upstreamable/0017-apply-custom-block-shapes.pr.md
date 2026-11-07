# feat(blocks): apply native custom block shapes and lighting

## Purpose

Read physical camera geometry from native world snapshots and visual properties from per-connection metadata. Apply separate collision and selection shapes, occlusion, support, suffocation, brightness and light values on the client. Use the accepted native geometry for camera queries even when no custom visual owns the Java state. Preserve ordinary block behavior when physical data is unknown.

## Design constraints

Apply authoritative custom collision, selection, lighting, and culling to owned carrier states. Preserve ordinary Java behavior outside those states. Collision and selection queries use native world-float bounds even when random offsets are disabled. Camera queries combine local bounds before world translation. The level-owned physical mirror supplies this geometry independently of visual carriers. Known empty collision suppresses the camera shape. Unknown classes retain their existing fallback.

## Validation and remaining limits

Regression coverage includes `BedrockBlockModelBoundsTest`, `BedrockCustomBlockLightingTest`, `BedrockCustomBlockResourcesTest`, `BedrockCustomBlocksTest`.

Semantic geometry tests and selected live model controls cover supported cases. Installed software-rendered 1.26.60 BDS controls cover a required custom resource pack, flat collision planes, enabled empty box lists, state changes, resource reload, and dimension return on direct and ViaProxy routes. Far-position shape-hook controls verify float rounding and the distinct camera envelope; they do not establish loaded far-world gameplay parity. Physical camera regressions cover missing carriers, negative coordinates, disjoint planes, and float collapse. Additional materials, carrier limits, and native lighting/visual parity remain open.

Installed direct and ViaProxy recordings match 17,883 camera-hook samples without visual definitions.
The captured definitions match the original native component controls. State swaps, resource reload, and dimension return retain the geometry.
Both recorders exit successfully, and the full builds and fresh replays pass. Movement collision, selection without carriers, and full camera trajectories remain open.

The [owning patch](0017-apply-custom-block-shapes.patch) retains implementation rationale and versioned evidence.
