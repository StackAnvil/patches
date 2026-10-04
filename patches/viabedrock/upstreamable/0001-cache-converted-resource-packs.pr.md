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
