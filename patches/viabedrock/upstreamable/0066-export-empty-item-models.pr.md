Export complete geometry and texture pairs, and use `minecraft:empty` when no item geometry was converted. Java rejects empty select cases and fails to bake dangling sprite references.

Saved CubeCraft assets contain unused model variants with missing images. Saved Geyser assets override vanilla entities without supplying every declared image. Skip incomplete exported variants, preserve native vanilla fallbacks, and retain diagnostics for variants selected by a render controller.

Validation: model asset and empty-model tests pass. The saved Geyser pack exports one complete custom model, and CubeCraft exports 12,597 complete variants. Both exports contain no dangling sprite or particle texture references. The full ViaBedrock suite passes.
