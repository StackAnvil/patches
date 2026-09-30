## Classic Dressing Room

Import PNG skins and local Classic Skin packs. Preserve selected custom geometry through account storage, previews, login claims, and live skin changes. Wrapped archives use one manifest root. The importer rejects unsafe paths, duplicate files, ambiguous roots, and oversized archives.

## Legacy geometry inheritance

Resolve `geometry.child:geometry.parent` definitions within the pack before conversion to modern geometry. Keep parent surfaces and append child cubes on matching bones. Child bones supply their pose and flags. Each texture dimension inherits separately, with a 64×64 default. Preserve visible bounds and cube mirror and inflation defaults. Polygon layers retain separate position, normal, and UV indices.

Explicit pack models named `geometry.humanoid.custom` or `geometry.humanoid.customSlim` take precedence over built-in Steve and Alex models. Resolve missing parents through an injected model source. Reject unresolved parents, ambiguous identifiers, inheritance cycles, and inheritance in formats 1.12 and later.

Private Bedrock 1.26.51.1 observations establish the inheritance version check, texture-size fallback, parent surface copy, and child cube append. The research binary and decompiler output remain private.

## Sources

- [Official legacy geometry properties](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/visualreference/geometry.v1.8.0?view=minecraft-bedrock-stable).
- [Pinned Mojang legacy model library](https://github.com/Mojang/bedrock-samples/blob/46ba6ea985fb5a92d79a9419198f10dda14c199d/resource_pack/models/mobs.json).
- [Matching zombie parent definition](https://github.com/Mojang/bedrock-samples/blob/46ba6ea985fb5a92d79a9419198f10dda14c199d/resource_pack/models/entity/zombie.v1.0.geo.json).

## Verification and remaining limits

Fifteen classic tests pass with the private model library enabled. Tests cover additive cubes, child flags, dimensions, polygon indices, invalid chains, and account store and wire round trips. The optional library test resolves all seven inheritance chains after combining the matching official files. The full add-on suite passes 96 tests with no skips. The exported stack and add-on build pass. Captured and downloaded assets remain outside the repository.

The account asset patch supplies the licensed base vanilla model library through the model-source interface. Pack definitions retain precedence across library chains. Tests cover external parents, modern library models, absent selections, cross-library cycles, and persistence. Versioned vanilla overrides, native parent-name behavior, classic animation metadata, and native visual comparisons remain pending.
