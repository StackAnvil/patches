Server packs can refer to vanilla item images without sending those images. Hive does this for bread, buckets, potion bottles, and other item atlas entries. The official 1.26.51.1 client resolves them from its built-in packs. The bundled ViaBedrock metadata archives contain no images.

Add a platform provider for licensed native images. Run acquisition on the existing resource pack executor, then wait for images and server downloads before conversion. Keep each native image layer below bundled metadata and server packs, with its original path casing and overlay order. The converted cache includes the image bytes. The provider does not change server pack advertisements or counts.

The default provider loads optional version-matched image layers from the core classpath.
Without that bundle, it returns no additional packs.
Platforms can still supply their own image layers and supported actor dependencies.
Server metadata keeps its existing priority.

Validation: all 270 ViaBedrock tests pass. Focused tests check vanilla atlas aliases, server overrides, and higher TGA layers that replace lower PNG images. Other tests check metadata rejection and cache invalidation after image bytes change. The Hive evidence comes from a saved official-client capture at network protocol 2193; no further public join was needed.

## Native actor dependencies

The provider whitelist also accepts native equipment definitions, models, animations, controllers and material documents.
These dependencies retain their lower priority and built-in provenance.
Server packs can replace them.
Unrelated entity, block and atlas definitions remain excluded.
The shield regression covers dependencies, precedence and provenance.

## Native icon atlases

Permit the exact `textures/item_texture.json` and `textures/terrain_texture.json` paths beside licensed images.
These definitions select native bed and pane icons when servers do not replace them.
Other unrelated definitions remain excluded, and accepted server packs retain precedence.

## Share native images with the proxy

The StackAnvil build derives `builtin_images.zip` from the checksum-verified native archives already used by the add-on.
The bundle retains 11,398 images and atlas entries across 48 native layers.
It includes `vanilla_base`, preserves path casing, and orders versioned overlays numerically.
Its 51.1 MiB of source data compresses to about 25 MiB.
The core, shaded proxy, and nested client core contain the exact verified image bundle.
The existing built-in UI bundle retains the native copyright notice in each distribution.

Previously, the direct frontend supplied these images, while the proxy default provider supplied none.
An attachable without its own inventory image therefore used held geometry in the proxy hotbar.
The authored test geometry lay outside the icon view, so its slots appeared blank.
Supplying native images lets the existing converter select inventory icons while retaining held geometry and accepted server overrides.
No item identity or gameplay component changes.

The runtime loader checks the target version, indexed file hashes, path boundaries, resource types, sizes, and layer order.
A malformed present bundle fails explicitly.
The immutable loaded layers remain below metadata and accepted server packs.
Image bytes already participate in the converted-pack fingerprint.

Four targeted tests cover genuine default icon conversion, retained held selectors, overlay ordering, server priority, and malformed bundles.
Three tooling tests cover original bytes, deterministic packaging, and exact core and consumer resources.
Earlier PNG/TGA precedence, atlas alias, and cache-invalidation checks remain active.
Native visual parity and other actor behavior remain separate requirements.

The full build passes 3,053 tests with 152 optional skips and no failures or errors.
Four additional checks execute against the distributable core JAR and verify five production class origins.
All 1,558 core classes and 200 assets match both embedded consumers.
The build also verifies all 39 converter classes and 1,205 compiled client classes.

Fresh BDS 1.26.51.1 sessions verify both routes with the same final distributables.
Five real hotbar items retain their GUI icon selectors and held-model selectors.
Four icons use the native image fallback; the bone uses an accepted server atlas override with an orange and cyan checkerboard.
Screenshot review shows all five icons in the hotbar and the creative inventory opened with E.
Each route also passes 16 equipped-state checks, including real sneak transitions and equipment removal.
All 30 screenshots receive visual review, and installed runtime hashes match the build.
These creative-screen controls do not reproduce the reported survival inventory or establish complete native visual parity.

## Select vanilla resources by world version

Core now reads the base-game version in `ResourcePackStack`. The resource
preparation worker selects cumulative vanilla metadata and licensed layers
using that cutoff. Server packs keep their priority independently of it.
Raw verified bundles remain shared and immutable.

Official BDS 1.26.60.6 on protocol 2225 advertises `*` for an ordinary world.
A separate copied world with `baseGameVersion` set to `1.20.0` and template
flags advertises `1.20.0`. These are private packet captures from an owned
loopback server. They establish the input, not the native client's graphics.
Microsoft's [base-game version guide](https://learn.microsoft.com/en-us/minecraft/creator/documents/basegameversioning)
establishes cumulative vanilla overlay selection and independent server packs.

`ResourcePackStorage` retains the canonical world cutoff. Native resource
archive format 2 carries it through ViaProxy alongside immutable pack layers.
The conversion cache includes the context even when resource bytes match.
Malformed archive context fails decoding instead of selecting current assets.

Targeted tests cover numeric ordering, newer/older/newer selection, retained
server priority, archive/storage context, and identical-byte cache separation.
The full core build and tests pass with the repository's packaged UI and images.
Native and direct Java comparisons now establish resource-dependent cat draws and current/1.20.0/current sound selection.
Two conflicting server WAV packs retain native priority above vanilla FSB resources on direct and ViaProxy connections.
The [add-on evidence](../../viafabricplus-bedrock/upstreamable/0013-resolve-licensed-native-vanilla-images.pr.md#world-version-resource-selection) records PCM comparisons, override retirement, and remaining visual/audio limits.
The full resource-version acceptance area remains incomplete.

All 55 versioned vanilla manifests in the matching client snapshot and
generated core metadata have minimum engine versions equal to their numeric
overlay versions. This validates the metadata cutoff used for this target.
Archive corruption tests locate count and provenance fields after the variable
version field, preserving malformed-role and truncated-header coverage.
