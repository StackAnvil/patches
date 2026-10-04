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
