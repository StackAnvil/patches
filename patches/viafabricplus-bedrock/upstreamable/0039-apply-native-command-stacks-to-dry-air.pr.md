# Native biome and command fog in dry air

Consume the core's world-resolved `viabedrock:fog` version-2 snapshots through a connection-owned Fabric receiver.
Use the received biome key at the camera to select settings below command layers and above the existing registry fallback.
Empty command updates reveal base resources.
Listener replacement and disconnect retire the full snapshot, and earlier generations cannot restore it.
Core, proxy, and client distributions require the matching payload contract.

Apply resolved air colors before the existing vision, void, and camera modifiers.
Apply fixed or render-relative distances through the atmospheric fog buffer.
Fluid, weather, and status-effect distances retain their current paths until matching native controls establish their rules.
The current lookup selects the camera biome; native spatial blending and legacy data-default bindings remain open.

A living admitted Ender Dragon uses start 0 and end `min(100, effective render distance)`, with or without commands.
Boss-bar visibility does not own that lifetime.
Matching native 1.26.60.5 `RenderChunk` instructions and live uniform reads establish 100 blocks at effective distance 192 and 80 at distance 80.
Native captures retain the override after an admitted actor moves far away; death restores ordinary fog.
A fresh distant connection without admission honors the ordinary distance.
These controls do not establish a universal admission radius or exact transition curve.

The matching native `EndSky` fragment shader multiplies a grayscale texture by `SkyColor`.
Live white/red controls read approximately twice the fog RGB at that binding, with alpha 2.
Use the licensed world-selected texture below accepted server overrides for both command and base fog.
Decode off-thread and upload during client ticks before GPU render passes.
Retire GPU resources on the client executor and check listener ownership inside the scheduled task.
This fixes the Netty-thread deletion assertion observed on both routes during shutdown.

Native 1.26.60.5 and BDS 1.26.60.6 use protocol 2225 for these controls.
A qualified `minecraft:the_end` definition binds a unique red fog identifier in the private fixture.
Without commands or living dragons, native uniforms measure red fog from 0 to 32 blocks.
The test pack matches every hashed file from that reference.
The old Java result was red registry metadata with 1,024-block distance and a purple sky.

Fresh direct and ViaProxy recordings each verify seven corresponding phases with actual renderer buffers.
Base fog uses 32 blocks and red RGB; a water-only command preserves it.
A white command uses 16 blocks, and removal restores the red base.
An empty command stack retains that base.
A living dragon uses 100 blocks without changing red; death restores 32 blocks.
All fourteen captures retain the same camera position, rotation, and `minecraft:the_end` biome key.
The End sky is red without a fog command.
Both 180-second recordings finish normally, without logged errors or GPU cleanup failures.
Floor lighting still differs, and the captures do not establish native pixel parity.

The full add-on build passes 1,300 cases, including 145 optional skips, with no failures or errors.
Focused tests cover generation rejection, resource replacement, command removal, fluid/weather boundaries, and the measured dragon policy.
Native biome-boundary blending, legacy default bindings, vanilla engine-specific fog rules, exact transitions, sky motion/sampling, and broader End lighting remain open.
This patch does not establish full fog parity.
