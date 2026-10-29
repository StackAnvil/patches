# fix(world): render neighbor-dependent block shapes

## Purpose

Bedrock omits the Java connection states for fences and stair corners. Resolve these shapes through a shared chunk update path, including multi-block packets and chunk borders.

## Design constraints

Reconstruct omitted fence and stair geometry through shared chunk updates. Preserve server-authored redstone, chorus, and fire properties in 26.60. Use native float ordering for collision and outline bounds.

## Validation and remaining limits

Regression coverage includes `BedrockFenceGeometryTest`, `ConnectedBlockShapeCandidatesTest`, `ConnectedBlockShapesTest`.

Native partial-block references and neighbor-state regressions cover the implemented paths. Broader live terrain and custom-block comparisons remain open.

The [owning patch](0010-render-neighbor-dependent-block-shapes.patch) retains implementation rationale and versioned evidence.
