Preserve `ignore_lighting` and the Molang `light_color_multiplier` expression from Bedrock render controllers. Retain material override order with an ordered map. Actor renderers need these values to select bone materials and reproduce controller lighting.

The [render controller reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/visualreference/render_controller.v1.8.0?view=minecraft-bedrock-stable) defines both fields. A saved Bedrock 1.26.51.1 Hive controller uses them on its lobby logo. Target protocol is 2193. The parser keeps values without applying renderer policy.

Validation: targeted parser tests cover explicit values, default values, controllers with arrays, and material override order. The complete CubeConverter test suite and build pass.

Retain controller UV offset and scale expressions with native identity defaults. Invalid components leave valid neighboring components available. Client code evaluates camera-dependent expressions when it submits the draw.

Bedrock 1.26.51.1 parser `141cabf60` initializes UV offset to zero and scale to one. Installed ENTITY vertex DXIL applies `UV * scale + offset`. The licensed executable SHA-256 is `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`; target protocol is 2193. Native assets remain private.

Targeted tests cover signed and fractional numeric components, invalid neighboring fields, malformed pairs, and identity defaults. This metadata does not add material mask effects or infer blending states.
