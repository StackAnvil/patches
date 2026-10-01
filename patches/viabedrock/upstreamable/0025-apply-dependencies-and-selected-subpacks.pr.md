Apply resource pack dependencies and the server-selected subpack before conversion. Cache converted packs by their effective content so subpack variants cannot share stale output.

Missing textures must return no image before lookup reaches the subpack view. CubeCraft exposes this case when an upper pack omits a texture supplied by another pack. Without the fallback, pack conversion throws before world join.

Validation: dependency ordering, cycle rejection, subpack overrides, cache identity, and missing-image fallback tests pass. CubeCraft reaches playable spawn after the fallback fix.
