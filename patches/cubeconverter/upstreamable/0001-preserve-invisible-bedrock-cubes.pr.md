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
