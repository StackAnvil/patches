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
They do not establish complete vanilla connectivity, vector growth, rendered fence meshes, or complete movement parity.
The add-on consumes these bounds on direct and ViaProxy sessions through its separate fence integration patch.
Ordinary Java clients still consume translated Java block states.

## Native partial-block connection rules

Core connects both wooden and nether-brick fences to double slabs and eight-layer snow.
Single slabs and thinner snow remain disconnected.
These states have zero mapped Java opacity, so the ordinary full-block check cannot reproduce their native rules.
Existing gate handling matches the native axis rule, including open gates.
State transition tests cover slab merges, slab splits, snow accumulation, and snow removal.

The same executable identifies the concrete classes through their constructor-installed vtables and virtual slot `0x390`.
The slot invokes `FenceGateBlock` at `0x147ac3b70`, `SlabBlock` at `0x14a8af490`, and `TopSnowBlock` at `0x1495d8c80`.
The versioned [slab declaration](https://github.com/LiteLDev/LeviLamina/blob/e0c75244af2f7576058976ab6d75a17e10de3f92/src/mc/world/level/block/SlabBlock.h),
[snow declaration](https://github.com/LiteLDev/LeviLamina/blob/e0c75244af2f7576058976ab6d75a17e10de3f92/src/mc/world/level/block/TopSnowBlock.h),
and [gate declaration](https://github.com/LiteLDev/LeviLamina/blob/e0c75244af2f7576058976ab6d75a17e10de3f92/src/mc/world/level/block/FenceGateBlock.h) support this identification.
Actual executable instructions establish the behavior.

A private fixture executes those hooks, writable component lookup, and the native connection predicate.
It covers 1,365 slab cases, 1,366 snow cases, and 1,365 gate cases.
Packed state positions and unrelated bits vary across cases.
Production Java matches all 4,096 cases and 6,034 connected directions, without mismatches.

Writable connection components default to category mask 15 and face mask 63.
Single slabs clear the category mask. Double slabs retain the default.
Snow enables the default only when its height plus one equals its variation count, eight for the target palette.
Gates accept category mask 7 and expose two opposite faces selected by facing, independently of open state.
A separate fixture verifies 512 explicit vanilla connection-description registration slices without mismatches.
It verifies their numeric masks and faces. Complete per-block name bindings remain unresolved.

These fixtures supply initialized component IDs, component stores, state maps, immutable permutations, and region lookup.
They do not execute full block construction, world initialization, or live movement.
Other neighbor classes still need verified defaults and state hooks.

The full 95-patch core stack replays and builds successfully with Checkstyle.
Core tests report 663 passes, 19 skips, and no failures or errors.
CubeConverter adds 16 passing tests. All seven neighbor-shape tests pass.
Live joins and platform tests were not repeated for this core correction.

## Native stair connection face

Core now connects fences to the full horizontal face of stairs.
The direction rule applies to both fence families and both stair halves.
Rotation tests replace every neighboring stair and verify that obsolete connections disappear.
Java opacity previously rejected every stair, including the native connecting face.

The native oak-stair factory `0x14c963d20` calls constructor `0x1495c3990`.
The constructor installs vtable `0x14ea60ee0` and stores the base block plus two flags.
These fields match the [versioned StairBlock declaration](https://github.com/LiteLDev/LeviLamina/blob/e0c75244af2f7576058976ab6d75a17e10de3f92/src/mc/world/level/block/StairBlock.h).
Vtable slot `0x390` selects the component hook `0x1495c6c50`.
Its component-update prefix ends at `0x1495c6fd4`, before native callback registration.
The connecting face is bit `5 - weirdo_direction` for the four valid directions.
The upside-down flag affects another component but does not change this face.

A private fixture starts without a connection component.
Native lookup allocates its default, inserts it into the sorted store, and applies the stair face.
The fixture then invokes the unchanged connection predicate and actual fence source classifier.
It executes 4,096 cases with varying direction, half, and unrelated packed bits.
All 4,096 component allocations and connecting directions match without failures.
Production Java rejects the first case before this correction and matches every case afterward.

The fixture supplies initialized TLS and component IDs, state maps, storage capacity, allocator, and region lookup.
It stops before callback registration and does not execute full block construction or native world initialization.
Two verified function names and comments were saved through MCP and confirmed by a fresh program query.
Live joins, native stair meshes, ordered movement resolution, and complete vanilla connectivity remain outside this verification.

**Verification:** The full 95-patch core stack replays and builds successfully with Checkstyle.
Core reports 664 passing tests and 19 skips; CubeConverter reports 16 passing tests.
All eight neighbor-shape tests pass, with no failures or errors.
Fresh Java comparisons match the 4,096 stair cases and the earlier 4,096 gate, slab, and snow cases.
Live joins and complete movement parity were not verified in this run.
