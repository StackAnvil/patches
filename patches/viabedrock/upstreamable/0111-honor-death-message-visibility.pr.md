# fix(hud): honor death message visibility

Hide the death reason when `showDeathMessages` is disabled while preserving the death screen and cached text. Apply the rule to either DeathInfo/actor-death arrival order and refresh a dead player when the rule changes.

Bedrock 1.26.60.5 on protocol 2225 applies this rule in its active OreUI `PlayerDeathInfoQuery`. Eight original-executable controls select an empty reason unless the world, player, and enabled rule are present. The executable digest and rationale are in the patch body.

`DeathMessagePacketsTest` covers both packet orders, alive-player admission, retained text, live visibility changes, and unchanged rules. Both tests fail on the previous projection and pass with this change. Main and test Checkstyle pass. The standalone production patch applies and builds on pinned upstream without setup or local tests. The full four-project build passes 3,524 tests with 328 skipped and no failures.

This changes reason projection. The native OreUI layout, animation stages, menu routing, and respawn lifecycle remain unfinished.
