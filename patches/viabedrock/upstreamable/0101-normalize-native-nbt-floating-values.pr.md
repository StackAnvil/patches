# Preserve native NBT scalar values

Bedrock NBT strings retain raw bytes, including malformed UTF-8.
The previous decoder replaced malformed bytes and could collapse distinct keys or make distinct item names compare equal.
The codec now retains those bytes through an internal Java representation and restores them during output.
Valid Unicode, including surrogate pairs, keeps its normal representation.
Both little-endian and network-NBT strings use this codec. Their framing stays unchanged.
Ordinary packet text keeps its existing Unicode decoder.
Copies and a Java NBT envelope preserve the retained strings without extra tag fields.

Binary NBT also previously retained float NaNs and non-finite doubles.
Native Bedrock loads those values as positive zero before item-stack comparisons.
Binary reads and writes now apply the native numeric rules without changing source tags.
They preserve float infinities, signed zero, subnormal values, and finite values.
Generic little-endian and network-NBT numbers keep their existing behavior.

## Native evidence

The target is Bedrock 1.26.51.1, build 51061372, protocol 2193.
Its executable SHA-256 is `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`.
Fresh controls execute parsed ItemStack constructors `0x142484090` and `0x1424a3e70`, userdata loader `0x1424d06e0`, and NBT parser `0x142555580`.
Native comparator `0x14254a410` checks every loaded tree in both directions against supplied byte-exact tag trees.
All 340 inputs and 680 comparisons retain keys, nested `display/Name`, and string-list bytes.
Inputs include every single byte, malformed sequences, NUL, valid surrogate-pair encodings, and random byte strings.
The checked item references balance after destruction.

The fixtures supply typed registries, Item interfaces, restriction resolution, allocator, CRT, and runtime hosting.
A missing host lookup reference was regenerated through 15,048 original callback and lookup cases.
The old property-reference path now reads the current protocol-2193 property-values asset.
No native instruction, policy result, branch, or assertion changes for these host file mappings.
These controls do not establish outer packet decoding, complete client ownership, visible text, or live malformed-NBT inventory acceptance.
The Java network-NBT string framing checks remain separate from original binary userdata execution.

Earlier numeric controls execute the complete binary userdata loader and writer normalization at `0x14254b9f0..0x14254ba00` and `0x14254b2e0..0x14254b317`.
Both numeric paths agree on all 28 tested scalar patterns. Native stack copies preserve the loaded bits.
The writer probe stops before abstract output dispatch and does not establish complete native packet serialization.

## Validation

Three behavioral regressions fail before the string correction, including the retained native tag trees.
All six focused string tests pass after the correction and against the fresh native reference.
They cover distinct names and keys, nested lists, copies, Java NBT transit, and the ordinary packet-text decoder.
The codec also retains all 65,536 byte pairs, all Unicode scalars, and 1,024 mixed malformed inputs.
Five negative controls restore each old stream or break surrogate-pair handling. Each fails by behavioral assertion.

The existing numeric tests retain direct and nested wire checks, original tag bits, and generic little-endian numeric behavior.
Native name acquisition, search transport, physical text input, and complete inventory or GUI parity remain unfinished.

The full four-project build passes 2,640 tests, with 163 optional skips and no failures or errors.
The core and client stacks replay all 104 and 38 patches.
All 35 focused NBT scalar/string checks run without skips.
All 1,418 core classes match both packaged copies. All 1,139 production client classes match the add-on.
The packaged core passes the six string checks with verified class origins.
It rejects merging distinct raw names, accepts an identical raw copy, and retains malformed input for the search matcher.

The unmodified ordinary BDS 1.26.51.1 route passes furnace, smoker, blast furnace, and same-world reconnect.
Final item counts match all three cases. Installed add-on and running proxy JARs match the current build.
Normal cleanup stops the private display and leaves no managed-profile JVM or private observer.
This route does not inject malformed NBT or establish native authored-screen or pixel parity.
