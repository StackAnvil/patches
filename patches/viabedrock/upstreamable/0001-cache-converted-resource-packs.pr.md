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
