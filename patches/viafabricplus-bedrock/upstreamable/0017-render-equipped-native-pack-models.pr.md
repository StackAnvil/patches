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

Separate plain-shield controls vary world FOV through 60, 30, 110, and 60, with repeated idle and blocking samples. Empty-offhand references isolate the visible shield through the bottom of the screen. Across three image-difference thresholds, normalized bounds from median images differ from native by less than 1% of either viewport axis.

A declared protocol-2225 inventory fixture delivers a red shield with a white bottom stripe.
Official Bedrock 1.26.60.5 renders the patterned front while blocking and restores the wooden appearance when the tags disappear.
Core now projects the base color and ordered patterns. The add-on uses a pack-owned atlas with the authored geometry and animation.

Installed direct and ViaProxy controls preserve the plain, patterned, and plain sequence with the same tested add-on and core classes.
Both routes also prepare the native pattern inputs with Iris and Complementary Reimagined 5.9.3 active.
Read-only observations establish atlas upload, draw preparation, and the native red and white tints.
A separate mainhand control retains the pattern after a natural BDS Unbreaking I enchantment with Iris active.
Shader-pack lighting is separate from native lighting parity.

`BedrockShieldPatternsTest` covers native texture aliases, colors, source limits, snapshot replacement, and atlas edges.
`BedrockEquipmentResourcesTest` keeps atlas dependencies and server image overrides in pack order.
The shared material patch compares actual fragment pixels with 512 current native shader controls, including glint before fog.

These controls use different appearances and viewports. Exact pixels, lighting, glint phase, and poses remain unverified.

Java fallback held items retain the native arm's complete transform instead of its flattened humanoid fields.
`BedrockPlayerModelTest` covers reflected and sheared parents, collapsed positions, slim/wide anchors, the incoming render transform, and ordinary fallback after retirement.
The regression fails on the old adapter. These controls establish attachment consistency, not native pixels or singular surface normals.

The [owning patch](0017-render-equipped-native-pack-models.patch) retains implementation rationale and versioned evidence.
