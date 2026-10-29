# Native fog commands in dry air

Consume the core's resolved `viabedrock:fog` snapshots through a connection-owned Fabric receiver.
Empty updates clear previous commands. Listener replacement and disconnect retire old generations, so queued callbacks cannot restore earlier resources.
The negotiated payload supplies definitions from the world-selected pack stack for both direct and ViaProxy connections.

Apply command air colors before the existing vision, void, and camera modifiers.
Apply fixed or render-relative distances through Java's existing atmospheric fog buffer.
Fluid, weather, and status-effect distances retain their current paths until matching native controls establish their rules.
A tracked living Ender Dragon uses start 0 and end `min(100, effective render distance)`, independent of command presence.
Boss-bar visibility does not define that actor lifetime.

Native Bedrock 1.26.60.5 against BDS 1.26.60.6 uses protocol 2225.
The native near-to-far journal retains each admitted dragon actor until death.
The fresh distant journal contains no dragon spawn and honors the short command distance.
Matching `RenderChunk` vertex bytecode establishes the distance calculation and the `FogAndDistanceControl` binding.
Owned native reads resolve the end fraction and render-distance scale to 100 blocks at effective distance 192.
A second native process requests 64 blocks, clamps to an effective 80, and uses an 80-block dragon distance.
Server-confirmed spawns establish the same 100-block override without commands and above red command fog.
Teleporting the admitted actor far away preserves 100 blocks. Death restores the 16-block command.
Three sealed journals each contain one dragon admission and its later removal.
The override does not establish a universal admission radius or an exact transition curve.

Focused tests cover connection-generation rejection, replacement, empty resets, and fluid/weather boundaries.
Core tests cover stack priority, ownership, distance units, and the shared payload.
The matching native `EndSky` fragment shader multiplies a grayscale texture by `SkyColor`.
Live white and red controls read approximately twice the fog RGB at that binding, with alpha 2.
Java instead uses a purple texture and a fixed dark vertex tint.
The native pipeline uses the licensed world-selected texture, with accepted server overrides taking priority.
Decoding runs off-thread. Client ticks upload the result before rendering starts.
Listener replacement, disconnect, and resource generation changes retire the texture.
Fabric can invoke disconnect on a Netty thread during client shutdown.
Schedule retirement on the client executor before releasing GPU resources.
Check listener ownership inside that task so an older disconnect cannot clear a replacement connection.

The live fixture rejects uploads inside an active GPU render pass.
The implementation uploads during client ticks instead.
Fresh direct and ViaProxy comparisons now exercise the command colors and distances, including End sky colors.
Empty state uses the existing environment. White controls use 16 and 128 blocks, and the red control uses 32 blocks.
A water-only top entry preserves the lower air setting. Removing entries restores the lower setting or clears the command override.
The shared fog buffer confirms these distances at the actual renderer return.
The sky changes from Java purple to grayscale white or red, then returns to Java's sky after command removal.
Both 180-second recordings finish normally, without texture upload errors.
The full add-on build passes 1,299 cases, including 145 optional skips, with no failures or errors.
No native sky pixel-equivalence claim follows from these controls.
Fresh direct and ViaProxy recordings each finish normally after ten dragon phases over 180 seconds.
Both routes report 100 blocks without commands and above white 16/128-block and red 32-block settings.
A distant teleport retains 100 blocks. Death restores 128 blocks, followed by a successful 16-block control and empty reset.
All twenty captures retain the matched camera position and rotation.
A steady white-fog marker control matches native within one RGB value per channel. Java End flash frames are excluded from that comparison.
Two policy regressions cover the observed 80/192-block cases, command precedence, restoration, and dimension scope.
Native transition timing, sky motion, pixel sampling, and vanilla biome distances remain open.
The no-command fallback outside the dragon override still uses Java's existing environment.
This patch does not establish full fog parity.

The qualified biome fixture exposed a shutdown failure on both connection routes.
Fabric invoked disconnect from Netty, and End sky texture deletion failed the render-thread assertion.
After client-thread retirement, fresh direct and ViaProxy recordings each finish normally after 60 seconds without that warning.
Both render the white 16-block command with the native sky texture.
Removal restores the red biome color and the existing 1,024-block base-distance fallback.
The proxy removal control runs in a separate reconnect.
Base fog distance and sky rendering remain incomplete.
