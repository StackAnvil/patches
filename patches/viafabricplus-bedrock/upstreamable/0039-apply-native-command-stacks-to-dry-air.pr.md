# Native biome and command fog in dry air

## Purpose

Apply world-resolved air colors and distances through the matching version-2 core fog payload.
Commands take priority over the camera biome and pack-defined data defaults. Empty commands retain base resources.
Like native, the biome layer averages 27 samples around the camera by weight, and air fog moves 1% toward its target each frame.

## Design constraints

Keep snapshots and End sky textures with their connection. Reject callbacks from retired generations.
Apply Overworld clock modulation before the existing vision, void, and camera modifiers.
Retain the current fluid, weather, and status-effect distance paths.

An admitted living Ender Dragon caps distance at 100 blocks or the effective render distance.
Death restores ordinary settings. Boss bars do not own this lifetime.
Use the licensed world-selected End sky texture beneath server overrides. Retire GPU resources on the client executor.

## Validation and remaining limits

Native 1.26.60.5 / BDS 1.26.60.6 controls establish base fog, command priority, dragon lifetime, and sky color multiplication.
Prior direct and ViaProxy controls cover these paths and shutdown.
Native Fancy controls also expose missing night modulation for custom fog colors.
`BedrockFogTest` checks day, midnight, and twilight vectors, dimension boundaries, dragon policy, and the per-frame blend.
`FogStackTest` checks weighted biome samples, the zeroed fill without a data default, command precedence, and mixed distance units.
Focused tests and the complete four-project build pass.
Fresh direct and ViaProxy renderer samples match native day, midnight, night-vision, and fixed twilight RGBA within 0.00001.
Both recordings exit normally.

Directional sunrise tint, timed command transitions, other status effects, End sky sampling, fluids, and weather remain open.
The [owning patch](0039-apply-native-command-stacks-to-dry-air.patch) retains implementation rationale and native evidence.
