# Match native binary-NBT floating values

Binary NBT previously retained float NaNs and non-finite doubles.
Native Bedrock loads those values as positive zero before item-stack comparisons.
The codec now applies the native scalar rules during reads and writes.
It preserves float infinities, signed zero, subnormal values, and finite values.
Writing does not mutate the source tag tree.
Generic little-endian IO and network NBT keep their existing behavior.

## Evidence

The native probe targets Bedrock 1.26.51.1, protocol 2193.
Its executable SHA-256 is `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`.
The complete binary userdata loader at `0x1424d06e0` supplies the read results.
Writer normalization runs at `0x14254b9f0..0x14254ba00` and `0x14254b2e0..0x14254b317`.
Both paths agree on all 28 tested scalar patterns.
Native stack copies preserve the loaded bits.

The writer probe stops before abstract output dispatch.
It does not verify full native packet serialization or live inventory acceptance.
Private probe scripts and results remain outside the repository.

## Validation

All 29 targeted tests and both Checkstyle tasks pass.
Each scalar case checks direct tags and nested compound/list payloads.
Tests inspect exact wire bits, decoded values, complete consumption, and unchanged source tags.
The remaining test protects generic little-endian IO from NBT-specific normalization.

The full 104-patch core stack replays, and the complete four-project build passes.
This run passes 2,342 tests, skips 212 optional cases, and reports no failures or errors.
It enables the private NBT equality, populated-userdata, and cooking-admission fixtures; other optional fixture controls remain skipped.
Offline tooling, regression tests, and patch metadata validation also pass.
