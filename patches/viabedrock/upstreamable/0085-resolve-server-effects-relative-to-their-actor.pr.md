# Resolve server particles relative to their actor

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
Preserving the original JSON retains vectors, colors, nested values, and ordering for later native playback integration.

## Verification

- **100 native serializer cases:** dimension IDs, signed actor ID limits, float coordinates, and absent or present variables. The harness supplies established primitive stream writes and an authored JSON string. It verifies native field order and optional-flag dispatch, not the native stream implementation or JSON value serialization.
- **1,600 native handler cases:** current and missing dimensions, world and attached IDs, missing actors, variable presence, and client availability. The harness supplies lookups, context copying, name copying, and factory sinks. It captures unchanged coordinates and actor selection before emitter creation.
- **Three targeted unit tests:** native wire order, nested JSON retention, optional-field boundaries, signed IDs, missing actors, world-space coordinates, actor offsets, and float rounding.
- **Full core suite:** 474 passing tests and one optional skip. Main and test Checkstyle pass after the complete patch stack is replayed.
- **Standalone patch:** applies and builds on the pinned upstream base without setup. All three tests and both Checkstyle tasks pass. The patch configures JUnit and the API test classpath for standalone testing.

## Remaining work

Native particle graphs, typed variable evaluation, actor interpolation, lifetime binding, and resource transport through ViaProxy remain incomplete.
The packet model retains variables, but the ordinary Java fallback cannot evaluate them.
Live native comparisons of player origin conversion and visible translated particles remain unverified.
These tests establish packet admission and codec behavior, not complete visible particle parity.
