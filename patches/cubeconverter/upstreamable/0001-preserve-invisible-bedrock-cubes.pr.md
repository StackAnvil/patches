Bedrock cubes with no UV faces are invisible. Java 26.3 requires at least one face per model element, so the exporter omits these elements. A wholly invisible model has an empty elements array. This also avoids invented faces with unresolved texture references.

Source bones and cubes remain available to the native renderer. Exported group children reference the remaining elements. UV normalization uses copies, so repeated export preserves cached geometry.

Locator-only geometry has no cube bounds. Keep its fitting scale at 1 so inverse scale metadata stays finite. The official Bedrock 1.26.51.1 Hive capture includes this geometry and reaches playable spawn.

Validation: six generated geometry tests pass on Java 17. They cover mixed and wholly invisible models, valid texture bindings, source preservation and repeatable export. They also cover empty bone lists, locator-only hierarchy preservation, finite metadata, and unchanged fitting for populated geometry. Private CubeCraft turret, watermelon and gravestone models contain affected cubes. No server assets are included.

## Missing UV data

The matching native package contains several cube models without UV data.
The parser now retains their cubes with an empty face map instead of rejecting the entire model.
A mixed model retains valid neighboring texture faces during Java export.
No invented texture face replaces the omitted data.

Native projectile planes also omit `uv_size`.
The parser uses the declared cube face dimensions and preserves explicitly signed sizes.
The matching 1.26.51.1 package supplies the affected models.
The [official geometry schema](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/schemasreference/schemas/minecraftschema_geometry_1.21.0?view=minecraft-bedrock-experimental) specifies this default.
Numeric regressions cover all six asymmetric faces and a negative authored size.


## Geometry with optional fields

Keep valid geometry declarations when texture dimensions or the bones array are omitted.
Dimensions default to 64 by 64, and absent bones produce an empty model.
Recognize legacy declarations by their geometry key, since texture dimensions are optional there too.
Preserve explicit dimensions and source JSON.

The matching Bedrock 1.26.51.1/protocol 2193 compiler caller `141c11ba0` supplies width and height 64 to `141c13a30`.
A private instruction probe executes the compiler's texture-dimension reader at `141c13bfd..141c13c6b`.
It verifies 12 cases covering absent/null dimensions and independent numeric overrides with two caller defaults.
The probe uses the original native JSON lookup and integer conversion helpers.
Its host boundaries provide exact CRT byte/string operations, allocation, frees, and a diagnostic backend.
It excludes schema dispatch, cached/inherited model dimensions, bone loading, registration, and rendering.
The target executable SHA-256 is `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`.
Mojang's [geometry schemas](https://github.com/Mojang/bedrock-samples/blob/main/documentation/Schemas.html) mark texture dimensions and bones optional in formats 1.8.0 and 1.12.0.

Validation:

- The north-star patch applies alone to the pinned upstream base without setup.
- The CubeConverter stack replays successfully.
- All four project builds pass: 2,358 tests passed, 152 optional skips, no failures or errors.
- Parser/export tests cover modern and legacy declarations, absent and empty bones, defaults, independent dimension overrides, source preservation, and finite export through every rotation mode.
- A 29-connection audit checks 16,043 model declarations across 82 content-hashed pack archives.
- Five captured declarations use these optional fields; all five now parse and export with finite values through every rotation mode.
- These include Galaxite's empty marker, GenWars text helpers, another empty helper, and two Dimension Clash models with bones.
- A complete 40-second Galaxite replay passes transport checks with no unresolved marker geometry, model-parser, particle-load, or mixin errors.

The replay still reports the camera item texture and a missing waterlogged block state.
The matching bundled atlas references a camera image that is absent from the inspected packs; its native fallback behavior remains unverified.
Full model inheritance, cache behavior, and native image parity remain outside this validation.
All captured geometry, native exports, and recordings remain private.
