## Purpose

Reuse converted resource packs when their source content and conversion identity match.
Keep the cache patch independent of later native rendering features.
The pinned upstream base already includes the pack-list wire correction from [PR #457](https://github.com/ViaVersionAddons/ViaBedrock/pull/457).
The active cache proposal is [PR #430](https://github.com/ViaVersionAddons/ViaBedrock/pull/430).

## Review focus

Fingerprints include source bytes, pack order, conversion profiles and the resource format revision.
Later native archives and UI conversion extend that identity in their owning patches.
A changed source or output format must prevent reuse of obsolete conversions.

Disk writes publish a complete ZIP before its fingerprint index.
Temporary files disappear after failed writes, and a later request can retry.
Deterministic entry order preserves the advertised hash and ID for identical output.
Disk-cache misses stream into the temporary ZIP while calculating SHA-1.
Memory and disabled modes retain their byte-array output.

Typed converter metadata survives fresh conversions, shared hits and reopened disk caches.
Finite model scales retain their float type.
Malformed metadata or truncated archives trigger conversion and atomic replacement.
The fallback renderer accepts numeric scale metadata through `Number.floatValue()`.

Completed downloads verify hashes and decode ZIPs on bounded workers.
Definition preparation, decryption and source persistence also use bounded workers.
The event loop publishes results only for the current transfer and session.
Queue rejection, decoder errors and shutdown use the existing negotiation error path.

The completed cache retains at most four entries and 64 MiB.
Eviction completes before callers receive the conversion future.
This ordering prevents oversized results from remaining reusable through the pending map.

## Validation

The standalone patch builds and passes its tests and both Checkstyle tasks on the pinned upstream base.
Tests cover concurrent reuse, eviction ordering, source changes, metadata restoration, damaged archives, partial writes, transfer order, stale publication and shutdown.
The first patch still uses Java 17; the full stack adopts Java 25 separately.

Historical full-stack joins against BDS 1.26.51.1 verified reconnect reuse and refreshed output after texture and version changes.
Those joins used compatible StackAnvil ViaProxy artifacts and included a Fabulously Optimized client.
They establish those observed flows, not a fresh live comparison of this cleanup.

## Performance evidence

A private synthetic benchmark contains 64 MiB across 64 prepared entries.
After two warm-up iterations, seven measured iterations produced the same archive hash.
Median allocation decreased from 445 MiB to 316 MiB.
Median elapsed time decreased from 1041 ms to 996 ms on the test host.

A separate packaging benchmark uses five captured CubeCraft packs and 42 licensed image layers from Bedrock 1.26.51.1.
The output contains 15,823 entries and occupies about 86.7 MiB.
Java 25 uses four processors and a 2 GiB heap on Linux.
Seven measured iterations follow two warm-up iterations with identical prepared content.
Streaming ZIP output reduced median packaging allocation from 346.6 MiB to 8.0 MiB.
Median packaging time decreased from 1633 ms to 1599 ms.
Both paths produced identical ZIP bytes, SHA-1, size and entry content.
The implementation retains existing compression behavior.

A historical cold ViaProxy replay installed 216 recorded skins unchanged and submitted resolved custom actor models.
Both converted packs loaded, and the scene payload hash matched the recording.
Conversions took 2253 ms and 2015 ms in that run.
Client reloads each took roughly two to three seconds at the log's one-second resolution.
Model parsing and baking remained visible costs.

These measurements cover prepared packaging and the recorded replay.
They do not establish current network latency, licensed acquisition speed, native rendering parity or live server frame time.
Raw packs, licensed images, recordings and profiles remain private.

## Stored compressed media

The ZIP writer stores PNG, JPEG and OGG entries instead of compressing them again. Raw TGA, JSON and language files still use deflate, and explicit entry hints still apply. A separate ZIP format revision in the conversion fingerprint replaces cached packs with the old layout. On the prepared 21,508-entry Galaxite pack, packaging fell from 383 ms to 163 ms and the archive grew by 0.69%. Every payload read back equal. Proxy users pay that small bandwidth increase.

## Item atlas output invalidation

Advance the resource fingerprint when item conversion stops exporting unresolved sprite models.
The existing metadata schema retains missing-icon reasons through memory and disk cache hits and reopened caches.
Resolved variants retain their native selector indices.

Validation: the replayed four-project build passes 3,072 tests with 152 optional skips and no failures or errors.
Both new icon tests and all 19 cache tests pass without skips; Checkstyle and tooling checks pass.
The same controlled classic-player scene passes full transport and rendering gates on direct and ViaProxy connections.
Each route samples four bundled emotes and installs all three expected complete skin records.
The direct observer retains the unresolved camera-icon reason while ordinary rendering passes.
These plain software controls do not establish complete native camera, emote, skin or shader parity.

## Complete-stack replacement

Each Java conversion contains the full accepted Bedrock stack and custom-block supplements. Remove previous Java server packs before pushing its replacement. Retired UUID replies and discard acknowledgements cannot finish the destination's resource negotiation.

A live Mineville-to-Zeqa transfer loads its custom items and HUD glyphs after this change. The previous route retained both server conversions, overflowed the item atlas and rolled back the reload; the destination packs match a working direct join. Packet regressions verify replacement order and reply ownership. Complete resource parity across other transfers remains unverified.

Ordered archives use the same compressed-media storage policy as converted Content ZIPs. This avoids deflating PNG, JPEG and Ogg files again inside the native archive. Raw TGA and definitions still compress. The ZIP identity advances so old conversions refresh. A private 19,335-entry Galaxite archive benchmark uses two warmup and five alternating measured rounds. Median writing falls from 315 ms to 117 ms, while size rises from 65.08 MB to 66.99 MB. Every entry payload matches. The mixed-media regression covers both entry points and both writer backends. This isolated benchmark does not establish total join latency.
