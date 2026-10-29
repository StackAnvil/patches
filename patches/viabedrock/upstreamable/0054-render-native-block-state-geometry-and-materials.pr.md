# feat(blocks): render Bedrock state geometry and materials

## Purpose

Resolve custom block properties and ordered permutations after StartGame, including per-face textures, geometry, transforms, shapes and lighting. Reserve free note-block and redstone-wire states deterministically and deduplicate identical visual and physical definitions. Preserve the original vanilla mapping when a definition or a required custom texture cannot be represented.

## Design constraints

Resolve ordered permutations and preserve original native block identities. Assign deterministic Java carriers only for representable states. Keep physical properties, culling, lighting, and supplemental-pack admission with their authoritative owner.

## Validation and remaining limits

Regression coverage includes `BlockItemDescriptorsTest`, `BlockItemStatesTest`, `BlockRegistryNamesTest`, `RuntimeBlockPaletteTest`.

Shape, state, culling, and conversion tests cover supported definitions. Carrier capacity, unsupported materials, and complete native appearance remain limits.

The [owning patch](0054-render-native-block-state-geometry-and-materials.patch) retains implementation rationale and versioned evidence.
