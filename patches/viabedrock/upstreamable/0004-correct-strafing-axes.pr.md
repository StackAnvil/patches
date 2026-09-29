## Evidence

Mojang's [Player Auth Input changelog](https://mojang.github.io/bedrock-protocol-docs/changelog/legacy/entries/changelog-776-1-14-25/) defines local left as negative X and right as positive X. The existing `MathUtil` expression sends the opposite signs while setting the matching direction flags. This change makes the vector agree with those flags.

This was previously discussed in [ViaBedrock #429](https://github.com/ViaVersionAddons/ViaBedrock/pull/429). That PR's testing did not show that the sign change reduces server movement corrections, so this PR makes no such claim. It is a protocol consistency correction.

## Review focus

Check the local X sign against Mojang's documented input vector convention. The change does not alter input flag IDs or the forward/backward axis.

## Testing

The patch applies alone to the pinned upstream base with `bun run pr check viabedrock --patch 0004-correct-strafing-axes.patch`.

The isolated checkout passed `./gradlew --no-daemon test checkstyleMain checkstyleTest`. Gradle reported `test NO-SOURCE`; this standalone patch adds no runnable test source.
