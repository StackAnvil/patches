# feat(entities): evaluate custom actors with shared animation graphs

## Purpose

Use the resource-defined actor graph for custom entity bone poses rather than a separate evaluator restricted to repeating channels and static single-state controllers. Preserve initialize and pre-animation variables, weighted references, controller transitions, finite and held animation clocks, and animation sound and particle events. Retain explicit legacy animation_controllers roots before modern script roots.

## Design constraints

Use the shared resource-defined graph for actor poses and events. Preserve actor-local variables, weighted roots, transitions, finite clocks, locator transforms, and immutable draw snapshots.

Prerequisites:

- viafabricplus-bedrock/0008-share-native-actor-and-resource-runtime.patch: Land the shared graph runtime before adapting server custom actors.

## Validation and remaining limits

Regression coverage includes `BedrockServerEntityAnimationTest`, `BedrockActorUvAnimationTest`, `BedrockCustomActorModelTest`, `BedrockModelLocatorIndexTest`.

Layered and recorded graph controls cover known actors. Unsupported queries, missing resources, timing, and full native audiovisual parity remain limits.

The [owning patch](0014-evaluate-custom-actors-with-shared-animation-graphs.patch) retains implementation rationale and versioned evidence.
