# Preserve the Java sprint modifier

When a client mod repeats `setSprinting(true)`, translated Bedrock sprint speed can increase from 0.13 to 0.169.
ViaBedrock sends the effective sprint speed as the Java base value with no modifiers.
Java then adds its sprint modifier to that boosted base.
Normal vanilla sprint transitions usually avoid this repeated call.

The local player now receives an unboosted base and the standard `minecraft:sprinting` modifier.
Java replaces that modifier by its identifier when the client repeats a sprint call.
The modifier uses Java's float-promoted amount and `add_multiplied_total` operation.

The translation normalizes the clamped effective Bedrock value.
This preserves server speed updates, zero speed, other native modifiers, and native limits in the Java output.
Bedrock attribute calculations and other entities keep their existing behavior.

## Evidence and validation

The report identifies ViaBedrock 0.0.29-SNAPSHOT, ViaFabricPlus 4.6.0, and Java 26.2 on CubeCraft.
The pinned ViaBedrock source retains the same relevant translation.
A local probe against Minecraft 26.3 reproduces the attribute increase before the fix.

After the fix, a probe feeds production attribute packets into Minecraft 26.3's attribute implementation.
One hundred repeated Java sprint applications retain speed 0.130000.
A server override retains speed 0.260000 after another sprint application.
Stopping sprint restores speed 0.100000 and removes the modifier.

Three packet regression tests cover sprint transitions, repeated calls, server updates, other native modifiers, and both native limits.
The full stack replay and ViaBedrock build pass, including main, tool, and test Checkstyle checks.
The full test run reports 565 tests, five skipped, and no failures or errors.

The patch also applies alone to the pinned upstream base without setup or deferred patches.
Its three regression tests and main/test Checkstyle checks pass in that checkout.
The isolated test run uses a local Gradle init script to supply the stack's existing JUnit configuration.
No build configuration change forms part of this patch.

CubeCraft gameplay speed and a live custom-client session remain unmeasured.
The probes establish the attribute behavior, not a measured blocks-per-second result.
