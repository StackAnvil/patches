# feat(blocks): apply native custom block shapes and lighting

## Purpose

Read per-connection custom block metadata from ViaBedrock for reserved carrier states. Apply separate collision and selection shapes, occlusion, support, suffocation, brightness and light values on the client. Preserve ordinary block behavior when no custom definition owns a state.

## Design constraints

Apply authoritative custom collision, selection, lighting, and culling to owned carrier states. Preserve ordinary Java behavior outside those states. Collision and selection queries use native world-float bounds even when random offsets are disabled. Camera queries combine local bounds before world translation.

## Validation and remaining limits

Regression coverage includes `BedrockBlockModelBoundsTest`, `BedrockCustomBlockLightingTest`, `BedrockCustomBlockResourcesTest`, `BedrockCustomBlocksTest`.

Semantic geometry tests and selected live model controls cover supported cases. Installed software-rendered 1.26.60 BDS controls cover a required custom resource pack, flat collision planes, enabled empty box lists, state changes, resource reload, and dimension return on direct and ViaProxy routes. Far-position shape-hook controls verify float rounding and the distinct camera envelope; they do not establish loaded far-world gameplay parity. Additional materials, carrier limits, and native lighting/visual parity remain open.

The [owning patch](0017-apply-custom-block-shapes.patch) retains implementation rationale and versioned evidence.
