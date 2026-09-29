## Evidence

ViaVersion's [26.3 game mode rewrite](https://github.com/ViaVersion/ViaVersion/blob/e813796d9a991eafeb50f0a88495e01e5cbaf249/common/src/main/java/com/viaversion/viaversion/protocols/v26_2to26_3/rewriter/EntityPacketRewriter26_3.java#L174-L180) converts the old game mode byte to `VAR_INT` and the previous game mode byte to `OPTIONAL_VAR_INT`. Its [26.3 respawn handler](https://github.com/ViaVersion/ViaVersion/blob/e813796d9a991eafeb50f0a88495e01e5cbaf249/common/src/main/java/com/viaversion/viaversion/rewriter/EntityRewriter.java#L435-L451) reads the game mode as `VAR_INT`.

The [reported ViaProxy log](https://mclo.gs/XscrWaE) fails at precisely this field: `Unable to read type VarInt, found ... ByteType` while translating ViaBedrock's `RESPAWN` to a Java 26.2 client. The patch corrects both the Bedrock respawn and dimension-change paths that emit the Java 26.3 packet.

## Review focus

Check the two packet writers against ViaVersion's 26.3 field types. This corrects the reported type mismatch; the log does not establish that every later login step succeeds.

## Testing

The patch applies alone to the pinned upstream base with `bun run pr check viabedrock --patch 0006-encode-26-3-game-modes-correctly.patch`.

The isolated checkout passed `./gradlew --no-daemon test checkstyleMain checkstyleTest`. Gradle reported `test NO-SOURCE`; this standalone patch adds no runnable test source.
