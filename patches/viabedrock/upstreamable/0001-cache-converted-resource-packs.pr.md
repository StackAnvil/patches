## Review focus

Please check that a changed source pack cannot reuse an older conversion, and that reconnecting with unchanged packs avoids another conversion.

## Testing

- [x] Run `./gradlew test checkstyleMain checkstyleTest` on the feature-only checkout.
- [x] Join Bedrock Dedicated Server 1.26.51.1 with a resource pack, reconnect, and confirm the converted pack is reused.
- [x] Change the pack texture and version, then confirm a new conversion contains the changed bytes and the Java client loads it.
- [x] Join the same server with Fabulously Optimized after the cache checks.

The live joins used the full StackAnvil patch stack and a local ViaProxy build compatible with the current ViaBedrock API.

Cache hit regressions also compare typed converter metadata across disk and shared memory hits. Model scale, attachable readiness and unresolved-asset diagnostics remain available when conversion is skipped. The full 252-test core suite passes.


## Shared resource formats

A separate resource-format revision participates in every cache fingerprint, including conversion profiles selected by later features. It invalidates older conversions when emitted resource files or formats change. The caption translation archive requires this refresh; unchanged input files must not preserve a conversion that lacks the archive.

## Native effect archive format

Converted-pack format 3 invalidates cached output that predates the particle archive. Keep this output identity separate from protocol and converter versions. The cache patch still builds alone on the pinned upstream base, with nine passing tests and both Checkstyle tasks.

Converted-resource format 4 invalidates outputs created before the actor archive existed. Otherwise a cache hit could omit the resources needed for player costumes and equipped attachables through ViaProxy. Existing archive formats are unchanged.

## Conversion memory and damaged cache entries

Fresh conversions retain their typed metadata instead of expanding the new ZIP to recover it.
Disk writes retain the calculated descriptor; persisted cache hits still verify the ZIP hash and read metadata.
A truncated ZIP or invalid metadata triggers conversion from source and atomic replacement.
The regression test compares the repaired archive, advertised identity, and restored connection metadata with the original.

A private synthetic benchmark contains 64 MiB across 64 entries.
After two warm-up iterations, seven measured iterations compare the unchanged baseline with the optimized path.
Both produce the same archive hash.
Median allocated bytes fall from 445 MiB to 316 MiB.
Median elapsed time falls from 1041 ms to 996 ms on the test host.
These results cover ZIP packaging and descriptor creation, with synthetic content already prepared.
They do not measure model conversion, licensed downloads, client reloads, or macOS runtime behavior.
Transport liveness remains necessary while downloads or player prompts pause game packets.

The complete stack builds for core, ViaProxy, and the add-on after folding this change into the cache patch.
The suites report 980 passing tests, no failures or errors, and 113 optional skips.
The cache patch also passes its tests and both Checkstyle tasks before the remaining patches apply.


## Stream disk-cache output

Disk-cache misses now write directly into a temporary ZIP and calculate SHA-1 during the write.
The cache publishes the complete ZIP before its fingerprint index.
Failed writes remove their temporary files and allow another conversion attempt.
Memory and disabled cache modes retain their existing byte-array output.

The private benchmark uses five captured CubeCraft packs, matching bundled definitions, and 42 licensed image layers from Bedrock 1.26.51.1.
Its output contains 15,823 entries and occupies about 86.7 MiB.
The process uses Java 25, four available processors, and a 2 GiB heap on Linux.
JFR records stage durations, thread CPU time, and allocated bytes.
Raw packs, licensed images, recordings, and profiles remain private.

Seven measured ZIP iterations follow two warm-up iterations and use identical prepared content.
Median packaging allocation decreases from 346.6 MiB to 8.0 MiB, about 98 percent.
Median packaging time decreases from 1633 ms to 1599 ms.
Both paths produce identical ZIP bytes, SHA-1, size, and entry content.
An alternative that stores compressed images without deflation saves another 69 ms but changes the archive.
This change retains the existing compression behavior.

Two regression tests cover identical memory/disk output, metadata and descriptors, partial-write cleanup, and successful retry.
The complete stack builds with 982 passing Java tests, no failures or errors, and 113 optional skips.
The owning cache patch also passes its tests and both Checkstyle tasks before the remaining stack applies.

These measurements cover packaging, not licensed acquisition, network downloads, client reloads, or joining time.


## Preserve the entity scale type

The first cold disk-cache replay exposed a restored-scale mismatch during custom entity spawning.
The renderer expects a float, while the metadata decoder returned a double.
The decoder now restores finite floats and rejects values outside the float domain.
Existing numeric manifests remain readable without a format change.
The cache regression uses the producer's float values across fresh conversions, shared hits, repaired archives, and reopened disk caches.
An overflow regression covers both encoding and decoding.


A repeated cold ViaProxy replay passes full transport and rendering checks with disk caching enabled.
It installs all 216 recorded skins unchanged and submits resolved custom actor models.
Both converted packs load before the complete scene finishes.
The scene payload hash matches the original recording.
JFR records both conversion and client reload activity.
The first conversion takes 2253 ms and the custom-block conversion takes 2015 ms in this run.
The client's two reloads each take roughly two to three seconds at the log's one-second resolution.
Model JSON parsing and baking remain visible costs in that profile.
These are current-run observations, not a comparison of joining times.


The direct add-on replay also passes full transport and rendering checks with a fresh disk cache.
Its complete scene hash matches the same original recording, and all 216 skin updates retain their recorded bytes.
Core reports 2159 ms for the first conversion and 1942 ms for the custom-block conversion.
These checks establish cache, loading, and rendering regressions on both routes, without establishing complete visual parity.


## Compress large ZIPs in parallel

Core now uses Apache Commons Compress scatter/gather compression for archives with at least 8 MiB of source content and multiple entries.
It limits each archive to four workers and the available processor count.
Small archives and single-processor hosts keep the existing sequential writer.
The cache already limits concurrent conversions to two per cache instance.
The [Apache API](https://commons.apache.org/proper/commons-compress/apidocs/org/apache/commons/compress/archivers/zip/ParallelScatterZipCreator.html) documents entry ordering and executor ownership.

Workers write compressed bytes into an owned temporary directory.
The writer waits for every worker before closing backing stores and removing that directory.
This order also applies after cancellation and output failures.
Interrupted callers retain their interrupt status, and failed conversions use the existing cache retry path.

The parallel backend preserves sorted entries, UTF-8 names, timestamps, decompressed bytes, and deterministic output across worker counts.
Memory and disk output use the same backend selection.
Previously cached archives remain valid because their resources and converter metadata retain the same meanings.

The production-writer profile uses the same private CubeCraft input described above, Java 25, four processors, and a 2 GiB heap.
Nine packaging iterations discard the first two iterations.
Median streamed packaging falls from 1540 ms to 752 ms, about 51 percent.
Main-thread packaging allocation rises from 8.0 MiB to 105.5 MiB.
The archive grows from 90,896,162 bytes to 91,782,250 bytes, about 1 percent, because ZIP metadata differs.
All 15,823 prepared entry contents remain byte-identical.

Eight complete conversions discard the first two iterations.
Median rewrite plus memory ZIP packaging falls from 2557 ms to 1707 ms, about 33 percent.
Rewriting remains roughly one second.
This profile measures conversion and packaging, not downloads, licensed acquisition, prompts, client reloads, or joining time.
Temporary compressed data adds disk traffic and uses roughly one archive's compressed size before publication.
macOS, Windows, concurrent conversions, and larger stacks still need performance measurements.

Four regression tests cover content, ordering, timestamps, worker-count determinism, interruption, failed output, cleanup, retry, and output ownership.
The cache tests and both Checkstyle tasks pass before the rest of the stack applies.
The standalone patch applies to its pinned upstream base.
All four projects build with 1008 passing Java tests, no failures or errors, and 115 optional skips.


Cold disk-cache replays pass complete transport and rendering checks through both direct and ViaProxy connections.
Both routes convert and load two packs with the parallel ZIP backend.
The complete scene hash remains unchanged, all 216 recorded skins retain their bytes, and no unresolved model or block errors occur.
The generated archives contain 15,601 and 15,959 entries.
These checks establish packaging and loading regressions, not complete native visual parity or faster joining.


## Ordered libraries and concurrent language tables

The bounded writer also accepts entries in caller order for embedded native libraries.
A regression verifies that library headers precede indexed resource entries.
Ordinary converted packs retain sorted paths.
Both paths use the same compression, output ownership, and failure cleanup rules.

Shared source content now caches language tables with atomic concurrent lookup.
Two simultaneous cold definition loads previously reproduce a `ConcurrentModificationException` in the shared `HashMap`.
Eight concurrent consumers now receive the same immutable table after one parse.
Unrelated language paths can parse independently.

The owning patch applies alone to its pinned upstream base and passes 18 tests and both Checkstyle tasks.
See the [native library benchmark](0015-scale-play-sound-coordinates.pr.md#compress-entries-within-large-native-libraries) for measured conversion gains.
