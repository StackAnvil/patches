Export complete geometry and texture pairs, and use `minecraft:empty` when no item geometry was converted. Java rejects empty select cases and fails to bake dangling sprite references.

Saved CubeCraft assets contain unused model variants with missing images. Saved Geyser assets override vanilla entities without supplying every declared image. Skip incomplete exported variants, preserve native vanilla fallbacks, and retain diagnostics for variants selected by a render controller.

Validation: model asset and empty-model tests pass. The saved Geyser pack exports one complete custom model, and CubeCraft exports 12,597 complete variants. Both exports contain no dangling sprite or particle texture references. The full ViaBedrock suite passes.

Attachable selectors now use the authored variant name within the item's namespace. Previously the exporter repeated the item identifier in the variant, while equipment selected `default`. This also produced a converter readiness key that the item rewriter never looked up. The item path already contains the identifier, so repeating it is unnecessary.

A recorded Bedrock 1.26.51.1 Hive armor-equipment packet puts `hivebackbling:angel_wings_pink` in the seated player's chest slot. Its native attachable requires a worn model layer in the add-on. Correct variant selection makes its authoritative Java item model available to that layer. The semantic conversion regression fails before the correction and passes afterward. Both default and folded variants select existing geometry and matching readiness. All 334 core tests and both Checkstyle tasks pass after replaying the full stack.
