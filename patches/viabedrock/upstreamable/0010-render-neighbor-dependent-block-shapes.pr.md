# Neighbor shapes and native fence geometry

Bedrock omits Java connection states for redstone wire, fences, and stair corners.
The shared chunk update path resolves these states across chunk borders and multi-block updates.

Core also supplies `BedrockFenceGeometry` for clients that can consume native physical bounds.
The model preserves separate north/south and east/west collision arms, in that order.
Outline and camera use rectangular envelopes.
Collision and camera height is 1.5 blocks. Outline height is one block.
World positions convert to floats before addition. Collapsed collision boxes disappear.

The evidence uses the official Windows Bedrock 1.26.51.1 executable, build 51061372, protocol 2193.
Its SHA-256 is `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`.
FenceBlock vtable `0x14e9fd2d0` returns true for `isFence` and false for `isThinFence`.
The geometry follows collision append `0x147ac0fa0`, collision envelope `0x147ac0db0`, and world outline `0x147ac0eb0`.
The generic camera wrapper `0x143182db0` invokes the collision envelope through vtable slot `0x20`.
It copies the six float bounds and rejects a box unless every minimum is less than its maximum.
The [versioned SDK declaration](https://github.com/LiteLDev/LeviLamina/blob/e0c75244af2f7576058976ab6d75a17e10de3f92/src/mc/world/level/block/FenceBlock.h) supports subtype identification.
Executable results establish the geometry.

Production Java matches 4,096 native cases and 85,164 raw float bounds without mismatches.
These cases include all connection combinations, large world coordinates, and float collapse.
Targeted tests cover append order, diagonal gaps, envelope heights, and collapsed boxes.
The full dependency build passes with Checkstyle.

A separate native fixture executes the camera wrapper through the actual FenceBlock vtable for 4,096 supplied states and positions.
It preserves every expected bound and rejects 257 collapsed boxes, with zero mismatches.
The fixture supplies the indirect-call guard and security-cookie boundaries.

The native fixtures supply initialized state maps and sufficient vector capacity.
They do not establish native connectivity production, vector growth, rendered fence meshes, or complete movement parity.
The add-on consumes these bounds on direct and ViaProxy sessions through its separate fence integration patch.
Ordinary Java clients still consume translated Java block states.
