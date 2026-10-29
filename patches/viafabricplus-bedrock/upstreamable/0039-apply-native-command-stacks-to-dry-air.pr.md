# Native fog commands in dry air

Consume the core's resolved `viabedrock:fog` snapshots through a connection-owned Fabric receiver.
Empty updates clear previous commands. Listener replacement and disconnect retire old generations, so queued callbacks cannot restore earlier resources.
The negotiated payload supplies definitions from the world-selected pack stack for both direct and ViaProxy connections.

Apply command air colors before the existing vision, void, and camera modifiers.
Apply fixed or render-relative distances through Java's existing atmospheric fog buffer.
Fluid, weather, and status-effect distances retain their current paths until matching native controls establish their rules.
A tracked living Ender Dragon retains the existing dragon environment distance instead of using boss-bar visibility as its lifetime.

Native Bedrock 1.26.60.5 against BDS 1.26.60.6 uses protocol 2225.
The native near-to-far journal retains each admitted dragon actor until death.
The fresh distant journal contains no dragon spawn and honors the short command distance.
These observations support actor lifetime as the guard. They do not establish an exact dragon fog curve or a universal distance threshold.

Focused tests cover connection-generation rejection, replacement, empty resets, and fluid/weather boundaries.
Core tests cover stack priority, ownership, distance units, and the shared payload.
The matching native `EndSky` fragment shader multiplies a grayscale texture by `SkyColor`.
Live white and red controls read approximately twice the fog RGB at that binding, with alpha 2.
Java instead uses a purple texture and a fixed dark vertex tint.
The native pipeline uses the licensed world-selected texture, with accepted server overrides taking priority.
Decoding runs off-thread. Client ticks upload the result before rendering starts.
Listener replacement, disconnect, and resource generation changes retire the texture.

The live fixture rejects uploads inside an active GPU render pass.
The implementation uploads during client ticks instead.
Fresh direct and ViaProxy comparisons now exercise the command colors and distances, including End sky colors.
Empty state uses the existing environment. White controls use 16 and 128 blocks, and the red control uses 32 blocks.
A water-only top entry preserves the lower air setting. Removing entries restores the lower setting or clears the command override.
The shared fog buffer confirms these distances at the actual renderer return.
The sky changes from Java purple to grayscale white or red, then returns to Java's sky after command removal.
Both 180-second recordings finish normally, without texture upload errors.
The full add-on build passes 1,297 cases, including 145 optional skips, with no failures or errors.
No native sky pixel-equivalence claim follows from these controls.
Native transition timing, sky motion, vanilla biome distances, and numeric dragon distances also remain open.
The tracked-dragon guard currently preserves Java's 1,024-block environment distance, which differs from the native reference.
This patch does not establish full fog parity.
