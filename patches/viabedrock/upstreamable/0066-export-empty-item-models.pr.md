Export complete geometry and texture pairs, and use `minecraft:empty` when no item geometry was converted. Java rejects empty select cases and fails to bake dangling sprite references.

Saved CubeCraft assets contain unused model variants with missing images. Saved Geyser assets override vanilla entities without supplying every declared image. Skip incomplete exported variants, preserve native vanilla fallbacks, and retain diagnostics for variants selected by a render controller.

Validation: model asset and empty-model tests pass. The saved Geyser pack exports one complete custom model, and CubeCraft exports 12,597 complete variants. Both exports contain no dangling sprite or particle texture references. The full ViaBedrock suite passes.

Attachable selectors now use the authored variant name within the item's namespace. Previously the exporter repeated the item identifier in the variant, while equipment selected `default`. This also produced a converter readiness key that the item rewriter never looked up. The item path already contains the identifier, so repeating it is unnecessary.

A recorded Bedrock 1.26.51.1 Hive armor-equipment packet puts `hivebackbling:angel_wings_pink` in the seated player's chest slot. Its native attachable requires a worn model layer in the add-on. Correct variant selection makes its authoritative Java item model available to that layer. The semantic conversion regression fails before the correction and passes afterward. Both default and folded variants select existing geometry and matching readiness. All 334 core tests and both Checkstyle tasks pass after replaying the full stack.

## Vanilla overrides and owner-specific item bindings

Apply converted attachable selectors after both vanilla and custom item mapping. Preserve gameplay components and native item identity. Assign a selector only after pack acceptance and successful default asset conversion. Rejected packs and missing assets retain their normal Java representation.

Core also retains each attachable's item binding expressions. The renderer evaluates those expressions with the wearer's queries and equipment context. A matching explicit binding takes precedence over legacy identifier lookup. Competing eligible bindings currently follow definition order; that case needs a native comparison.

The pinned Bedrock 1.26.51.1 definitions distinguish `minecraft:iron_chestplate` from `minecraft:iron_chestplate.player`. The player definition binds the iron chestplate item using `query.owner_identifier`. A private native recording confirms that overriding the generic definition leaves vanilla player armor visible. Overriding the player definition renders the authored green wings over the orange costume.

Tests cover vanilla and custom selectors, retained gameplay data, accepted and rejected resources, explicit bindings, generic fallback, false conditions, and archive reconstruction. Native appearance comparisons remain scoped to this authored pack. Built-in definitions unavailable without licensed assets and additional item binding forms remain open requirements.

Final direct and ViaProxy playback preserve the unchanged native scene payloads, load the pack, and select the player-specific iron attachable after the recorded chest update. Both screenshots show the green wings without duplicate vanilla chest armor. These checks verify supported visible item selection, not full scene parity. Missing replay terrain, head appearance, other wearers, equipment removal, and additional lifecycle behavior remain unverified.


## Reuse compiled geometry across model variants

Each conversion compiles a resolved geometry once for entities and once for attachables.
Concurrent tasks share the compiled coordinates, faces, and groups.
Each variant owns its texture bindings and model root.
Attachables also retain separate display transforms.
The conversion releases its geometry cache after the tasks finish.
It does not retain proprietary models across connections.

The comparison uses the same five captured CubeCraft packs and 42 licensed image layers as the earlier conversion profile.
The target is Bedrock 1.26.51.1, build 51061372, protocol 2193.
Java 25 uses four available processors and a 2 GiB heap on Linux.
Each process completes eight fresh conversions, with the first two excluded from the medians.
JFR measures CPU time and allocations inside each model task.

| Measured work | Baseline | Shared geometry |
| --- | --- | --- |
| Entity model CPU per conversion | 856 ms | 664 ms |
| Entity model allocations per conversion | 2201 MiB | 1136 MiB |
| Complete rewrite elapsed time | 993 ms | 997 ms |
| Rewrite plus ZIP elapsed time | 2603 ms | 2557 ms |

Entity model CPU decreases by about 22 percent, and allocations decrease by about 48 percent.
The complete rewrite shows no elapsed-time improvement in this fixture.
Native archive encoding and ZIP output remain separate costs.
These measurements establish lower CPU and allocation costs, without establishing faster joins or immunity to timeouts.

All 15,823 output entries remain semantically equivalent.
The comparison normalizes existing object-hash element names, JSON property order, and particle aliases that resolve to the same sprite.
All other resource bytes match.

Tests cover concurrent texture bindings, immutable shared templates, model coordinates and groups, scale metadata, repeated conversion, and unchanged source geometry.
Existing missing-asset and attachable tests also pass.


The complete stack build passes 1004 Java tests with no failures or errors and 115 optional skips.
A fresh-cache ViaProxy replay preserves the complete recorded scene hash and all 216 skin updates.
Both converted packs load, and the renderer reports no unresolved model or block errors.
The shorter first replay reached spawn but ended before the full scene, so it does not count as complete verification.


The fresh-cache direct add-on replay also preserves the complete scene hash and all 216 skin updates.
Both converted packs load, and the same rendering checks pass without unresolved model or block errors.
These checks establish conversion, loading, and rendering regressions on both routes, without establishing full visual parity or joining-time gains.
