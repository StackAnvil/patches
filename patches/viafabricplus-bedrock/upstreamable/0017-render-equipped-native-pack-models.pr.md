# feat(attachables): render equipped native pack models

## Purpose

Bedrock 1.26.51.1 (protocol 2193) sends Hive angel wings as chest attachables, separate from player skins. Resolve canonical converted item identities and submit their native geometry through a player equipment layer instead of expecting the skin renderer to contain worn meshes.

## Design constraints

Select attachables using the rendered owner, slot, item binding, world-version context, and graph lifetime. Preserve parent transforms, per-bone materials, and resource replacement.

## Validation and remaining limits

Regression coverage includes `BedrockAttachableBindingsTest`, `BedrockAttachableScopeTest`, `BedrockAttachableSelectionTest`, `BedrockEquipmentResourcesTest`.

Native authored wings and equipment controls cover selected binding paths. Enchanted shield rendering, broader equipment lifecycles, and complete native appearance remain incomplete.

The [owning patch](0017-render-equipped-native-pack-models.patch) retains implementation rationale and versioned evidence.
