# fix(hud): honor death message visibility

Hide the death reason when `showDeathMessages` is disabled while preserving the death screen and cached text. Apply the rule to either DeathInfo/actor-death arrival order and refresh a dead player when the rule changes. Open the death screen once when the spawned local player reaches zero health, even without DeathInfo. Keep the last reason across respawns until the next DeathInfo replaces it.

Bedrock 1.26.60.5 on protocol 2225 applies this rule in its active OreUI `PlayerDeathInfoQuery`. Eight original-executable controls select an empty reason unless the world, player, and enabled rule are present. The native local player dies from its tick when health reaches zero, and its stored reason changes only on DeathInfo. The executable digest, addresses, and rationale are in the patch body.

`DeathMessagePacketsTest` covers both packet orders, alive-player admission, retained text, live visibility changes, unchanged rules, a death without DeathInfo, and a second death after respawn. The visibility tests fail on the previous projection. The death-without-DeathInfo and respawn tests fail when the screen requires DeathInfo and respawn clears the reason. All pass with this change, along with main and test Checkstyle on the full local stack. The standalone production build and the full four-project build were last run before the death-trigger change.

This changes reason projection. The [add-on](../../viafabricplus-bedrock/upstreamable/0042-retain-bedrock-death-screen-lifetimes.pr.md) owns on-screen update admission and lifetime. The native OreUI layout, animation stages, menu routing, and respawn lifecycle remain unfinished.
