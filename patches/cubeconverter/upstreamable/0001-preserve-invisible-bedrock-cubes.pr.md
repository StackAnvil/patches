Bedrock cubes with no UV faces are invisible. Java 26.3 requires at least one face per model element, so the exporter omits these elements. A wholly invisible model has an empty elements array. This also avoids invented faces with unresolved texture references.

Source bones and cubes remain available to the native renderer. Exported group children reference the remaining elements. UV normalization uses copies, so repeated export preserves cached geometry.

Validation: three generated geometry tests pass on Java 17. They cover mixed and wholly invisible models, valid texture bindings, source preservation and repeatable export. Private CubeCraft turret, watermelon and gravestone models contain affected cubes. No server assets are included.
