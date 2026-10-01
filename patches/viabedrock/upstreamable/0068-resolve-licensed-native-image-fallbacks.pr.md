Server packs can refer to vanilla item images without sending those images. Hive does this for bread, buckets, potion bottles, and other item atlas entries. The official 1.26.51.1 client resolves them from its built-in packs. The bundled ViaBedrock metadata archives contain no images.

Add a platform provider for licensed native images. Run acquisition on the existing resource pack executor, then wait for images and server downloads before conversion. Keep each native image layer below bundled metadata and server packs, with its original path casing and overlay order. The converted cache includes the image bytes. The provider does not change server pack advertisements or counts.

The default provider returns no additional packs. Platforms must supply licensed image layers containing only a manifest and texture images. Server metadata keeps its existing priority.

Validation: all 270 ViaBedrock tests pass. Focused tests check vanilla atlas aliases, server overrides, and higher TGA layers that replace lower PNG images. Other tests check metadata rejection and cache invalidation after image bytes change. The Hive evidence comes from a saved official-client capture at network protocol 2193; no further public join was needed.
