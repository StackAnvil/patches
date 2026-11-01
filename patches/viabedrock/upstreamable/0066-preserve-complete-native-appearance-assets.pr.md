# fix(models): export complete asset pairs and empty item fallbacks

## Purpose

Java rejects a select model with no cases. Emit minecraft:empty when no geometry was converted and preserve selectors for actual alternatives. Only export complete geometry/texture pairs and bind their particle sprite so Java does not bake dangling texture references.

## Design constraints

Export geometry/texture pairs only when their active resources resolve. Preserve vanilla fallbacks and owner-specific attachable bindings. Share immutable compiled geometry while keeping variant bindings and connection lifetimes separate.

## Validation and remaining limits

Regression coverage includes `CustomItemTextureResourceRewriterTest`, `ItemModelResourceRewriterTest`, `ModelResourceAssetsTest`.

Semantic conversion and recorded equipment controls cover supported variants. Additional binding forms, equipment lifecycles, and complete appearance remain unverified.

The [owning patch](0066-preserve-complete-native-appearance-assets.patch) retains implementation rationale and versioned evidence.

Actor conversion retains pairs reachable through declared render controllers.
Equal stable query reads over equally sized arrays select corresponding geometry and texture entries.
Independent and random selectors retain independent combinations. Unknown controllers and unsupported expressions retain the conservative fallback.
The four captured OneBlockOnline furniture-preview actors each retain 720 pairs instead of 518,400.
Reduced tests cover paired properties, independent queries, random expressions, and unresolved controllers.
A private conversion fixture processes all 867 captured actors within a 2 GiB heap.
It emits 4,068 model selections. Each preview emits 719 models and reports one unresolved source pair from the captured packs.
The rebuilt live retry loses NetherNet transport before conversion. Live admission and complete native actor appearance remain unverified.
