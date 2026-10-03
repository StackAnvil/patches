# Bedrock request codecs

Keep inventory request, response, and recipe codecs together before the container implementation.

## Filter origin correction

Native Bedrock 1.26.51.1, build 51061372, protocol 2193, sent filter origin `-1` in accepted merchant requests. The release metadata lists enum names without their numeric starting value. Preserve the upstream mapping with `unknown=-1` and prevent the enum generator from replacing it with zero for protocol 2193.

Wire tests cover the unknown sentinel and the existing anvil origin mapping. The tool source compiles. The full core suite and Checkstyle pass after replay.

This codec foundation belongs to the inventory work in [ViaBedrock #276](https://github.com/ViaVersionAddons/ViaBedrock/pull/276).

## Loom requests

The action codec now writes `CraftLoom`: union index 15, stable action byte 17, a pattern string, and an unsigned craft count. Bedrock 1.26.51.1 build 51061372, protocol 2193, native captures verify `hh` and `cre` requests followed by result, consume, and place actions. A byte-level test also covers count 255. Captures stay private.

## Dynamic recipes

Retain the multi-recipe array instead of discarding its UUIDs and network IDs.
Each entry represents a server-enabled recipe whose result depends on item data.
Keep unknown UUIDs and unsigned network IDs intact.
The recipe-book patch preserves these entries when it adds unlock metadata.

Native Bedrock 1.26.51.1, build 51061372, protocol 2193, captures identify three cartography switches:

| Operation | Recipe UUID |
| --- | --- |
| Clone | `442d85ed-8272-4543-a6f1-418f90ded05d` |
| Extend | `8b36268c-1829-483c-a0f1-993b7156a8f2` |
| Lock | `602234e4-cac1-4353-8bb7-b1ebff70024b` |

The native client sends their server-assigned IDs through `CraftRecipeOptional`.
Its requests also include consume and place actions, filter strings, and the `CartographyText` origin.
These captures establish the decoder prerequisite, not a complete Java cartography implementation.

Two focused wire tests pass.
They cover the three switches, an unknown UUID, an unsigned network ID, following-array alignment, and truncated input rejection.
The complete 84-patch core stack replays successfully.
`bun run build all` passes for all four targets, including Checkstyle.
Core reports 387 tests with no failures or errors and one optional fixture skip.
The add-on reports 519 tests with no failures or errors and 109 optional fixture skips.
Cartography screens, authoritative result metadata, and full native crafting comparisons remain incomplete.
