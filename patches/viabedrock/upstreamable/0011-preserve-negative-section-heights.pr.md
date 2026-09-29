## Evidence

ViaVersion's [section block update writer](https://github.com/ViaVersion/ViaVersion/blob/e813796d9a991eafeb50f0a88495e01e5cbaf249/common/src/main/java/com/viaversion/viaversion/protocols/v1_16_4to1_17/rewriter/WorldPacketRewriter1_17.java#L124-L135) packs the section Y coordinate into the low 20 bits of the section position long. ViaBedrock currently masks Y to 12 bits. For a negative section such as `-4`, that discards the upper sign bits and changes the decoded position.

The patch changes only this mask. For section Y `-4`, the old `0xFFF` mask writes `4092` to the low bits; the 20-bit mask keeps the sign bits needed to decode `-4`.

## Review focus

Check the bit layout against ViaVersion's writer and the signed example above.

## Testing

The patch applies alone to the pinned upstream base with `bun run pr check viabedrock --patch 0011-preserve-negative-section-heights.patch`.

The isolated checkout passed `./gradlew --no-daemon test checkstyleMain checkstyleTest`. Gradle reported `test NO-SOURCE`; this standalone patch adds no runnable test source.
