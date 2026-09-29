## Evidence

Mojang's [protocol 2193 PlaySound packet](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/play-sound-packet/) carries its position as a `BlockPos`. ViaBedrock reads its X, Y, and Z as block coordinates without scaling.

Mojang's [Java 26.3 client JAR](https://piston-data.mojang.com/v1/objects/e877b6a07acd633fb3bb475002175cec036e7b87/client.jar) provides the direct check for the destination packet. In `ClientboundSoundPacket`, the constructor multiplies each world coordinate by eight before writing three `int` fields. Its `getX()`, `getY()`, and `getZ()` methods divide those fields by eight. The JAR SHA-1 is `e877b6a07acd633fb3bb475002175cec036e7b87`; inspect the class with `javap -classpath client.jar -c -p net.minecraft.network.protocol.game.ClientboundSoundPacket`.

ViaBedrock's PlaySound handler currently forwards the Bedrock block coordinates unchanged, so Java reads a sound at block X=80 as X=10. ViaBedrock already scales its separate LevelSoundEvent position by eight before writing the same Java packet.

The patch applies that factor to X, Y, and Z. It leaves volume, pitch, and sound selection alone.

## Review focus

Check the coordinate units on both sides of the translation. This patch preserves ViaBedrock's original block position without adding a block-center offset.

## Testing

The patch applies alone to the pinned upstream base with `bun run pr check viabedrock --patch 0015-scale-play-sound-coordinates.patch`.

The isolated checkout passed `./gradlew --no-daemon test checkstyleMain checkstyleTest`. Gradle reported `test NO-SOURCE`; this standalone patch adds no runnable test source.
