Bedrock cubes with no UV faces are invisible. Java 26.3 requires at least one face per model element, so the exporter omits these elements. A wholly invisible model has an empty elements array. This also avoids invented faces with unresolved texture references.

Source bones and cubes remain available to the native renderer. Exported group children reference the remaining elements. UV normalization uses copies, so repeated export preserves cached geometry.

Locator-only geometry has no cube bounds. Keep its fitting scale at 1 so inverse scale metadata stays finite. The official Bedrock 1.26.51.1 Hive capture includes this geometry and reaches playable spawn.

Validation: six generated geometry tests pass on Java 17. They cover mixed and wholly invisible models, valid texture bindings, source preservation and repeatable export. They also cover empty bone lists, locator-only hierarchy preservation, finite metadata, and unchanged fitting for populated geometry. Private CubeCraft turret, watermelon and gravestone models contain affected cubes. No server assets are included.
