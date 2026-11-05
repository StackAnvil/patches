# feat(attachables): render equipped native pack models

## Purpose

Bedrock 1.26.51.1 (protocol 2193) sends Hive angel wings as chest attachables, separate from player skins. Resolve canonical converted item identities and submit their native geometry through a player equipment layer instead of expecting the skin renderer to contain worn meshes.

## Design constraints

Select attachables using the rendered owner, slot, item binding, world-version context, and graph lifetime. Preserve parent transforms, per-bone materials, and resource replacement.

## Validation and remaining limits

Regression coverage includes `BedrockAttachableBindingsTest`, `BedrockAttachableScopeTest`, `BedrockAttachableSelectionTest`, `BedrockEquipmentResourcesTest`.

Native authored wings and equipment controls cover selected binding paths. Broader equipment lifecycles and complete native appearance remain incomplete.

Bedrock 1.26.60.5 and BDS 1.26.60.6 controls on protocol 2225 cover plain and Unbreaking I offhand shields. Native, direct Java, and ViaProxy each receive the same enchantment NBT, record two blocking cycles, and return to a plain shield. Both Java routes use verified add-on JARs; the running proxy also matches its built JAR.

Glint changes over time on idle and blocking shields. Returning to a plain shield removes it.

Separate plain-shield controls vary world FOV through 60, 30, 110, and 60, with repeated idle and blocking samples. Empty-offhand references isolate the visible shield through the bottom of the screen. Across three image-difference thresholds, normalized bounds from median images differ from native by less than 1% of either viewport axis. These controls do not reproduce the reported oversized shield.

The native and Java appearances were not matched. Outer bounds do not establish pixel parity. Exact lighting, glint phase, and the reported oversized shield and distorted custom-skin pose remain unverified. No renderer change follows from these controls.

The [owning patch](0017-render-equipped-native-pack-models.patch) retains implementation rationale and versioned evidence.
