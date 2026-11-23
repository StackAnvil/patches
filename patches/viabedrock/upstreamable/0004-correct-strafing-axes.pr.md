## Evidence

Native Bedrock adds every held direction and then normalizes the move vector, so opposing keys cancel on each axis. The current `MathUtil` expression gives Left over Right and Up over Down precedence instead. This change replaces that precedence with cancellation and keeps the existing signs: Left is +X and Up is +Y.

The Bedrock 1.26.60.5 client (`Minecraft.Windows.exe`, SHA-256 `988f6a61403b4381aa41e6c66d64cce441b14e561a9b10f647c2758ef3f2672a`) shows both rules:

- The input calculator at `0x140493140` builds X as `bit15 - bit16` and Y as `bit13 - bit14` from the mask table at `0x14f07eb00`, then normalizes the sum.
- Its diagonal table adds `(+1, +1)` for UpLeft and `(-1, +1)` for UpRight.
- The auth-input fill helper at `0x147704a90` maps those MoveInput bits to wire flags 10 (Up), 11 (Down), 12 (Left) and 13 (Right).

Java's raw input uses the same signs, so the move vector and the raw move vector agree.

[ViaBedrock #429](https://github.com/ViaVersionAddons/ViaBedrock/pull/429) proposed inverting X, based on the 1.14.25 auth-input changelog. The 1.26.60.5 client does not invert it, so this PR keeps upstream's signs.

## Review focus

Check that opposing keys cancel on both axes before normalization and scaling. The signs and input flag IDs do not change.

## Testing

The patch applies alone to the pinned upstream base with `bun run pr check viabedrock --patch 0004-correct-strafing-axes.patch`.

The full-stack `MathUtilMovementTest` covers all sixteen direction combinations and six input scales. It lives in patch 0092, which introduces the float input-scale API.

No native packet capture contains a strafing frame yet, so the sign rests on the static evidence above.
