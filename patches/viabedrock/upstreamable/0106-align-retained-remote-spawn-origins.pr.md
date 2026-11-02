# Align retained remote player spawn origins

AddPlayer supplies feet. MovePlayer supplies an eye position. Java already spawns the visible player at the supplied feet, but the retained transform treated that value as an eye origin. Physical picking proxies therefore started one eye offset below the visible player until its first movement packet.

The handler converts spawn feet through `setJavaPosition` before it retains the player state. The Java spawn coordinates stay at feet. Picking, relative clicks, and the initial spatial receive cache share the existing eye-origin convention.

## Validation and remaining limits

Official Bedrock 1.26.60.5/BDS 1.26.60.6 controls on protocol 2225 cover two fresh peers and their stationary movement updates. Native admits all four upper-body attacks. Pre-fix direct Java misses both initial attacks, then admits the same aim after each update. Read-only bounds audits show misplaced proxies while the visible player remains stationary.

Rebuilt direct and ViaProxy routes admit all four attacks with verified JARs. In-world samples confirm that each initial proxy aligns with its visible owner, including the normal 0.1-block picking padding. Strict journal decoders verify complete framing, matching skin bytes, and identical peer spawn and movement payloads across all four recordings.

The registered-handler regression fails before the correction. It decodes Java spawn and movement output and checks visible feet, the retained eye origin, and the initial spatial receive cache. The full four-project build passes 3,336 tests with 325 skipped and no failures or errors. All 155 patches replay. Bundle generation, ten artifact and manifest checksums, and the 1,647 embedded core-class comparisons pass.

All 33 recorded process identities are gone. Cleanup restored the native world, profile options, trust setting, external server lists, and owned server configuration exactly.

The fixture uses synthetic floating standing peers. It establishes selected client picking and outgoing attack admission. Server damage, other spawn poses, arbitrary actors, mounts, and complete skin or interaction parity remain unverified.
