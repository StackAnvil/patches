## Evidence

Mojang's [protocol 2193 PlaySound packet](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/play-sound-packet/) carries its position as a `BlockPos`. ViaVersion's [Java sound packet writer](https://github.com/ViaVersion/ViaVersion/blob/e813796d9a991eafeb50f0a88495e01e5cbaf249/common/src/main/java/com/viaversion/viaversion/protocols/v1_19_1to1_19_3/Protocol1_19_1To1_19_3.java#L128-L141) scales block positions by eight before writing Java sound coordinates. ViaBedrock's PlaySound handler currently forwards the three block coordinates unchanged.

The patch applies that factor to X, Y, and Z. It leaves volume, pitch, and sound selection alone.

## Review focus

Check the coordinate units on both sides of the translation. The ViaVersion example adds four to play at the block center; this patch preserves ViaBedrock's original position instead of introducing an additional offset.

## Testing

The patch applies alone to the pinned upstream base with `bun run pr check viabedrock --patch 0015-scale-play-sound-coordinates.patch`.

The isolated checkout passed `./gradlew --no-daemon test checkstyleMain checkstyleTest`. Gradle reported `test NO-SOURCE`; this standalone patch adds no runnable test source.
