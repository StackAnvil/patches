# fix(models): export complete asset pairs and empty item fallbacks

## Purpose

Java rejects a select model with no cases. Emit minecraft:empty when no geometry was converted and preserve selectors for actual alternatives. Only export complete geometry/texture pairs and bind their particle sprite so Java does not bake dangling texture references.

## Design constraints

Export geometry/texture pairs only when their active resources resolve. Preserve vanilla fallbacks and owner-specific attachable bindings. Share immutable compiled geometry while keeping variant bindings and connection lifetimes separate.

## Validation and remaining limits

Regression coverage includes `CustomItemTextureResourceRewriterTest`, `ItemModelResourceRewriterTest`, `ModelResourceAssetsTest`.

Semantic conversion and recorded equipment controls cover supported variants. Additional binding forms, equipment lifecycles, and complete appearance remain unverified.

The [owning patch](0066-preserve-complete-native-appearance-assets.patch) retains implementation rationale and versioned evidence.
