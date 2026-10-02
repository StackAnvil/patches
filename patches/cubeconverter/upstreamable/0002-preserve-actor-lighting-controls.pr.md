Preserve `ignore_lighting` and the Molang `light_color_multiplier` expression from Bedrock render controllers. Retain material override order with an ordered map. Actor renderers need these values to select bone materials and reproduce controller lighting.

The [render controller reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/visualreference/render_controller.v1.8.0?view=minecraft-bedrock-stable) defines both fields. A saved Bedrock 1.26.51.1 Hive controller uses them on its lobby logo. Target protocol is 2193. The parser keeps values without applying renderer policy.

Validation: targeted parser tests cover explicit values, default values, controllers with arrays, and material override order. The complete CubeConverter test suite and build pass.
