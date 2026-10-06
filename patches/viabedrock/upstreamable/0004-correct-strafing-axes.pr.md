## Evidence

Mojang's [Player Auth Input changelog](https://mojang.github.io/bedrock-protocol-docs/changelog/legacy/entries/changelog-776-1-14-25/) defines local left as negative X and right as positive X. The existing `MathUtil` expression sends the opposite signs while setting the matching direction flags. This change makes the vector agree with those flags.

This was previously discussed in [ViaBedrock #429](https://github.com/ViaVersionAddons/ViaBedrock/pull/429). That PR's testing did not show that the sign change reduces server movement corrections, so this PR makes no such claim. It is a protocol consistency correction.

Matching Bedrock 1.26.51.1 executable inspection identifies the native input calculator at `0x1404495e0`.
It adds each physical direction independently, then normalizes the result before applying input slowdown.
Opposing directions cancel on each axis.
Core now follows that calculation instead of giving one direction precedence.
The input flags retain both held keys.

## Review focus

Check the local X sign against Mojang's documented input vector convention.
Check cancellation on both axes before normalization and scaling.
The change does not alter input flag IDs.

## Testing

The patch applies alone to the pinned upstream base with `bun run pr check viabedrock --patch 0004-correct-strafing-axes.patch`.

The isolated checkout passed `./gradlew --no-daemon test checkstyleMain checkstyleTest`. Gradle reported `test NO-SOURCE`; this standalone patch adds no runnable test source.

The full-stack `MathUtilMovementTest` covers all sixteen physical direction combinations and six input scales.
The test resides in patch 0092 because that patch introduces the float input-scale API.
Live direct and ViaProxy captures verify eight combinations against the matching native calculation.
All 318 comparable frames match exactly across both routes.
Both recordings reach join and spawn with protocol 2193.
The complete build passes 16 converter, 657 core, and 584 add-on test cases, with 133 skips and no failures or errors.
Strict BDS also accepted the preceding incorrect vectors, so server acceptance alone does not prove this behavior.
