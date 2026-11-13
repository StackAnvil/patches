# feat(blocks): apply native custom block shapes and lighting

## Purpose

Read physical camera geometry from native world snapshots and visual properties from per-connection metadata. Apply separate collision and selection shapes, occlusion, support, suffocation, brightness and light values on the client. Use the accepted native geometry for camera queries even when no custom visual owns the Java state. Preserve ordinary block behavior when physical data is unknown.

## Design constraints

Apply authoritative custom collision, selection, lighting, and culling to owned carrier states. Preserve ordinary Java behavior outside those states. Collision and selection queries use native world-float bounds even when random offsets are disabled. Camera queries combine local bounds before world translation. The level-owned physical mirror supplies this geometry independently of visual carriers. It also accepts the [hardcoded primary providers](../../viabedrock/upstreamable/0054-render-native-block-state-geometry-and-materials.pr.md). Known empty collision suppresses the camera shape. Unknown classes retain their existing fallback.

## Validation and remaining limits

Regression coverage includes `BedrockBlockModelBoundsTest`, `BedrockCustomBlockLightingTest`, `BedrockCustomBlockResourcesTest`, `BedrockCustomBlocksTest`.

Semantic geometry tests and selected live model controls cover supported cases. Installed software-rendered 1.26.60 BDS controls cover a required custom resource pack, flat collision planes, enabled empty box lists, state changes, resource reload, and dimension return on direct and ViaProxy routes. Far-position shape-hook controls verify float rounding and the distinct camera envelope; they do not establish loaded far-world gameplay parity. Physical camera regressions cover missing carriers, negative coordinates, disjoint planes, and float collapse. Additional materials, carrier limits, and native lighting/visual parity remain open.

Installed direct and ViaProxy recordings match 17,883 camera-hook samples without visual definitions.
The captured definitions match the original native component controls. State swaps, resource reload, and dimension return retain the geometry.
Both recorders exit successfully, and the full builds and fresh replays pass. Movement collision, selection without carriers, and full camera trajectories remain open.

The [owning patch](0017-apply-custom-block-shapes.patch) retains implementation rationale and versioned evidence.

## Continuous normals and inset vertices

The adapter derives each face's unit normal from its rendered positions, oriented to the authored direction, and passes it to the core dimming rule with the level's cardinal coefficients. Inset faces use the core per-vertex sampler; source cells retain their block-state opacity, ambient brightness and light. The captured transparent source keeps AO 1; a separate adapter regression checks an opaque source. Outer-plane faces keep the corner path.

`BedrockTerrainLightingTest` drives the live-captured native neighborhood through real Java stone, glowstone and air states and reproduces the native AO and block light on all four vertices. A 30-degree tilted north face shades at 0.8544004. These are CPU checks with captured inputs; a registered installed-client comparison has not been repeated.

The adapter now admits outer-plane faces to the existing native per-vertex sampler. Original 1.26.60.5 Fancy-renderer observations capture a partial north quad at z=0, its cache and arrays, and all four AO/light results. Moving blockers into the outward neighborhood exposes up to 0.0598 AO and two block-light levels of error in the old corner branch. The fixed compiled adapter matches the captured values, and supplied full-unit vertices agree with original instruction execution on the same cache. The existing material/diagonal admission checks and fallback path remain. The adapter regression fails before the selection fix and passes after it. A former test that assumed four corner values for every full face is replaced by the captured partial and supplied unit-face cases; native exponent/dimming regressions remain in core. This is CPU/cache equality, not installed-client image parity or proof for every slab, stair, or chunk boundary.
