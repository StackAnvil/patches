# Route server particles through native playback

## Behavior

Core decodes packet 118 into a reusable model that retains all fields.
The dimension is an unsigned byte, and the actor unique ID is a signed variable-length integer.
The model preserves the optional Molang JSON string without flattening nested values.

An actor ID of `-1` selects a world-space position.
Other IDs select an actor-relative offset.
The standard Java fallback adds that offset to the tracked actor's Java feet position with float arithmetic.
It drops requests for missing actors and other dimensions.
This translation runs in core for both direct connections and ViaProxy.
Java particles retain the initial position only; the Java packet has no actor attachment.

## Target evidence

The reference is Bedrock **1.26.51.1**, build **51061372**, protocol **2193**.
The inspected executable's SHA-256 is `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`.
Private executable inspection is development evidence. Production does not access a local game installation.

Native serializer `143aa8310` writes a boolean before the Molang JSON string.
This differs from the required-field declaration in the target schema and the closest [preview packet reference](https://mojang.github.io/bedrock-protocol-docs/1.26.50-preview.26/packets/spawn-particle-effect-packet/).
Use the target executable's encoding for this build.

Native handler `14133fb50` rejects a different dimension and ignores an unresolved attached actor.
It calls world factory `142130e20` for ID `-1`.
For another resolved ID, it calls bound factory `142166990` with the unchanged offset and an empty locator.
The bound factory creates an emitter at zero, then installs the actor and offset binding.

Native serializers `1421f9380`, `1421f9470`, and `1421f9f70` emit a JSON array of named values.
A scalar uses `type: float` and a numeric `value`.
A nested object uses `type: member_array` and an array of named typed members.
The parser retains float scalars and ordered member arrays for native playback.
It skips unsupported typed entries and bounds JSON size and nesting before constructing a tree.
The [Creator API](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/molangvariablemap?view=minecraft-bedrock-stable) describes float, vector, color, and speed/direction structures.
That API reference does not establish their packet encoding.

Native JSON conversion `14e01de00` converts signed integers, unsigned integers, doubles, and booleans to float32.
Strings, arrays, and objects return zero when used as scalar values.
Inspection of root setter `1421fcd60` shows non-finite scalar sanitization; nested members retain their original scalar bits.
Native member accessor `140af2690` selects the first matching member hash, with case-sensitive names.
Root map assignments replace earlier valid entries with the same hash.

## Native client channel

Clients advertise `viabedrock:particle_playback` to receive the original effect request, resolved origin, Java actor ID and UUID, and Java fallback body.
Core retains dimension and missing-actor admission before choosing either route.
Ordinary clients retain the standard Java translation.
A native client can decode the fallback with Minecraft's particle codec when its graph or assets are unavailable.
The fallback retains particle data, coordinates, offsets, speed, count, visibility flags, and randomization type.
Resource and graph processing uses the separate shared resource transport.

## Verification

- **100 native serializer cases:** dimension IDs, signed actor ID limits, float coordinates, and absent or present variables. The harness supplies established primitive stream writes and an authored JSON string. It verifies native field order and optional-flag dispatch, not the native stream implementation or JSON value serialization.
- **1,600 native handler cases:** current and missing dimensions, world and attached IDs, missing actors, variable presence, and client availability. The harness supplies lookups, context copying, name copying, and factory sinks. It captures unchanged coordinates and actor selection before emitter creation.
- **Three targeted unit tests:** native wire order, nested JSON retention, optional-field boundaries, signed IDs, missing actors, world-space coordinates, actor offsets, and float rounding.
- **Full core suite:** 487 passing tests and one optional skip. Main and test Checkstyle pass after the complete stack replay.
- **Native scalar comparison:** Java matches 2,040 supplied JsonValue conversion cases from the target executable. Two null inputs are correctly skipped by the parser. This comparison covers scalar conversion, not the full native JSON parser.
- **Native member comparison:** 200 accessor cases select the first case-sensitive hash match in supplied nested structures. The harness supplies the root lookup.
- **Five additional core tests:** typed values, duplicate ordering, non-finite handling, precision, immutable structures, limits, actor binding, and fallback transport boundaries.
- **Standalone patch:** applies and builds on the pinned upstream base without setup. All eight tests and both Checkstyle tasks pass.
- **Client codec check:** Minecraft decodes core's complete particle body after native transport. The test checks coordinates, offsets, speeds, count, flags, and trailing data rejection.
- **Direct and ViaProxy integration:** an authored six-case fixture passes both transport replays. Each route receives four admitted requests, starts two emitters, and decodes one Java fallback. Missing actors and other dimensions do not reach the receiver. Both routes produce identical typed size, tint, and position records without Store sign-in.

## Remaining work

Visible native comparisons, complete actor queries, remote actor transport, and interpolation still need verification.
Actor removal, world replacement, resource reloads, and ID reuse need live lifecycle comparisons.
Malformed JSON compatibility and every native variable type remain outside the verified parser scope.
The ordinary Java fallback cannot evaluate Molang values or maintain actor attachment.
The authored fixture verifies production dispatch and runtime records, not native visible parity.
Its sparse world does not provide a stable camera for a rendering comparison.
