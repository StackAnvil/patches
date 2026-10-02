Preserve `ignore_lighting` and the Molang `light_color_multiplier` expression from Bedrock render controllers. Retain material override order with an ordered map. Actor renderers need these values to select bone materials and reproduce controller lighting.

The [render controller reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/visualreference/render_controller.v1.8.0?view=minecraft-bedrock-stable) defines both fields. A saved Bedrock 1.26.51.1 Hive controller uses them on its lobby logo. Target protocol is 2193. The parser keeps values without applying renderer policy.

Validation: targeted parser tests cover explicit values, default values, controllers with arrays, and material override order. The complete CubeConverter test suite and build pass.

Retain controller UV offset and scale expressions with native identity defaults. Invalid components leave valid neighboring components available. Client code evaluates camera-dependent expressions when it submits the draw.

Bedrock 1.26.51.1 parser `141cabf60` initializes UV offset to zero and scale to one. Installed ENTITY vertex DXIL applies `UV * scale + offset`. The licensed executable SHA-256 is `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`; target protocol is 2193. Native assets remain private.

Targeted tests cover signed and fractional numeric components, invalid neighboring fields, malformed pairs, and identity defaults. This metadata does not add material mask effects or infer blending states.


Legacy `description.animation_controllers` declarations retain their alias,
identifier, and order for client entities and attachables. Absent fields
default to an empty list. Existing constructor callers remain compatible.
The parser keeps this metadata independently of modern `scripts.animate`;
client code chooses supported playback semantics.

The active native Bedrock 1.26.51.1 Hive entity uses format 1.8.0 and declares
a controller without modern animation scripts. The only active saved
entity entry has SHA-256
`58cf3b66a2ebe76751415ae7f5f9ad81b44464e5ec987f4f22d6e49639cc1f80`.
Tests verify ordered immutable declarations, independent modern scripts,
malformed neighbors, and defaults without implicit controllers.

Equipped native models also require ordered `part_visibility` declarations and `scripts.parent_setup`. Preserve repeated and wildcard bone rules without collapsing them into a map. Keep setup expressions in their owner scope, separate from initialization and animation scripts. The declarations are immutable; existing constructor forms remain available.

The recorded Bedrock 1.26.51.1 Hive angel wings use a wildcard visibility expression that excludes first-person and invisible rendering. Their attachable also supplies owner setup. Parser tests cover scalar and array setup, rule ordering, duplicate patterns, missing fields and defensive ownership. All 16 converter tests pass with no failures or skips. The renderer evaluates these declarations; the parser does not choose a binding or rendering policy.
