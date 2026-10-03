# Map rendering and authoritative state

This patch restores held and framed map rendering from [ViaBedrock #425](https://github.com/ViaVersionAddons/ViaBedrock/pull/425).
It also retains the current JUnit configuration.

## Partial updates

Core retains each map's dimension, origin, lock state, optional scale, and creation map IDs.
An omitted scale or creation list preserves the previous value.
An explicit zero scale or empty list replaces it.
Java map packets require a scale, so a partial first update uses zero until Bedrock supplies the scale.
The stored state keeps that distinction.

This fixes partial updates that previously reset Java map zoom to zero.
It also preserves server data needed by cartography.
The map state remains in core for direct connections and ViaProxy.

## Native evidence

The private comparison uses Bedrock 1.26.51.1, build 51061372, protocol 2193.
The native client crafts a map from paper, initializes it, extends it, clones it, and locks a named copy.
The server accepts each crafting request.

The initial map packet advertises five map IDs in scale order.
The extended map uses the next ID in that family.
Cloning preserves the extended ID and produces two items.
Locking produces a separate ID and preserves the supplied name.
A full inventory update establishes the result's map tags.
The native client sends `MAP_CREATE_LOCKED_COPY` when the lock preview becomes available, before crafting.
A preview ID alone does not establish the final crafted item's metadata.
The remaining container work must reconcile the server's authoritative result.

A fresh table sends recipe ID zero for rename-only crafting.
A previous lock selection can persist in the same open table.
Locator conversion uses UUID `98c84b38-1085-46bd-b1ce-dd38c159e6cc` with its server-assigned recipe ID.
It preserves the map ID and adds `map_display_players`.

Raw packets, account data, and screenshots remain private.

These observations establish metadata and request behavior.
They do not establish complete Java cartography support.
The [cartography patch](../deferred/0016-translate-bedrock-cartography-in-core.pr.md) implements the main screen and request path.
Native UI and full inventory comparisons remain incomplete.

## Testing

Four focused tests cover partial updates, explicit replacement, immutable creation lists, independent map state, and sparse family lookup.
Family lookup follows advertised IDs without inventing metadata for other family members.
Checkstyle passes.
The complete 84-patch core stack replays successfully.
`bun run build all` passes for all four targets.
ViaBedrock reports 390 tests with no failures or errors and one optional fixture skip.
The add-on reports 519 tests with no failures or errors and 109 optional fixture skips.

The latest complete core stack contains 85 patches.
Its 403 tests pass with one optional fixture skip.
All four targets build successfully.
