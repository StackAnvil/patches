# Align retained remote player spawn origins

AddPlayer supplies feet. MovePlayer supplies an eye position. Convert spawn feet through `setJavaPosition` so the live transform, picking proxies, and relative clicks use the eye origin. Keep Java spawn coordinates at the supplied feet.

The absolute/delta actor movement cache has a separate lifetime. AddPlayer leaves its coordinates and packed angles at constructor zeros. Normal MovePlayer updates do not populate it. An actor absolute or sparse update does. Preserve constructor movement flags and duration when initializing this player-specific cache. Other actor spawn bootstraps retain their existing behavior.

## Validation

Official Bedrock 1.26.60.5/BDS 1.26.60.6 controls on protocol 2225 distinguish live player movement from the actor receive cache. A fresh player disappears from the original view after a Z-only sparse update; pre-fix Java incorrectly keeps its spawn height. Normal player movement does not change the source for the next sparse update. Actor absolute movement does, including across normal and head-only player updates. Replacement players start with independent caches.

Corrected direct and proxy routes match all three Z-only disappearance phases in the longer sequence. Their journals carry the same peer payloads as native. Read-only game audits verify the Java movement and cache-derived output through all twelve phases. The complete rendered pose still differs in later phases, as recorded below.

A second control supplies Y/Z while omitting X and angles, then supplies X alone. Native first renders the player at the zero-X projection and returns it to center only after explicit X. Two fresh identities repeat this result. Rebuilt direct and ViaProxy clients match all ten phases. Strict decoders verify complete journals and identical accepted peer spawn, skin, normal, absolute, and sparse packet bytes. Three settled frames per phase place median marker centroids within 0.20% of each viewport axis and boundaries within 0.49%. Read-only game audits verify the resulting Java positions and angles with native state present.

The verified 1.26.60.5 executable contains the matching cache initializer instructions. Six controls execute both original initializer ranges on differently prefilled storage. They verify zero coordinates and angle bytes, flags 255, and zero duration. Ghidra decompilation separately confirms the stores and the distinct spawn bootstrap. These instruction controls exclude allocation and surrounding actor construction; the live controls establish the player-specific behavior.

Earlier upper-body attack controls establish the live spawn-origin correction. Native admits four attacks before and after two stationary updates. Pre-fix direct Java misses both initial attacks because its physical proxies sit 1.62001 blocks too low. Rebuilt direct and proxy routes admit all four. Those synthetic peers establish client picking and outgoing attack admission, without server damage claims.

The registered-handler regression decodes Java spawn, stationary movement, and sparse movement after a conflicting normal move. It checks visible feet, the retained eye origin, and omitted coordinates and angles. It fails before the cache correction. Its empty held-item fixture also compiles without deferred inventory APIs. The full build passes 3,336 tests with 325 skipped and no failures. All 155 patches replay from fresh upstream clones. Bundle generation, ten artifact/manifest hashes, and all 1,647 embedded core-class comparisons pass.

## Remaining limits

The longer Z-only sequence also exercises interpolation after a large vertical excursion. The [remote movement integration](../../viafabricplus-bedrock/upstreamable/0041-interpolate-native-remote-player-movement.pr.md) covers that correction and its current limits. The cache correction alone does not establish pose or trajectory parity. Full readiness, timing, other spawn poses, mounts, server damage, and complete skin or interaction parity remain unverified.

One extended proxy join timed out during resource-pack negotiation before gameplay. It is excluded from validation. The fresh-server retry passes; reconnect robustness remains unverified.
