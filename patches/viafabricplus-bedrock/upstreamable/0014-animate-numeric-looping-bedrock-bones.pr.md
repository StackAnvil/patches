Evaluate looping bone rotation and position channels from immutable render-frame context. Numeric keyframes retain interpolation and looping. Parsed MoLang expressions can use the verified camera and timing queries: `query.rotation_to_camera`, `query.body_y_rotation`, `query.life_time`, and `query.anim_time`, including the `q` alias.

A saved CubeCraft protocol 2193 banner rotates its `full_banner` bone with `query.rotation_to_camera(1) - query.body_y_rotation`. The earlier numeric-only parser discarded its whole animation. A neighboring channel that needs unsupported variables now stays omitted while supported rotation remains available. Script variables, state transitions, weighted controller entries, and camera-driven render controller selection remain unsupported.

Target evidence is the licensed Bedrock 1.26.51.1 Windows executable, SHA-256 `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`. Function `14065a850` accepts axis zero or one and normalizes the camera-minus-actor vector. Yaw is `atan2(z, x)` in degrees minus 90. Pitch is negative `atan2(y, horizontal)` in degrees. The native yaw range stays unwrapped. Registration `1421e652f` binds body yaw; getter `14220f630` calls the actor body-yaw virtual function.

The query meanings agree with Microsoft's [rotation-to-camera reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/molangreference/examples/molangconcepts/queryfunctions/query_rotation_to_camera) and [body-yaw reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/molangreference/examples/molangconcepts/queryfunctions/query_body_y_rotation). The exact target callback establishes the angle conventions used here. Raw native code, packs, and screenshots remain private.

Semantic tests cover numeric interpolation, looping, alias selection, camera quadrants and pitch, zero distance, native unwrapped yaw, body-yaw subtraction, unsupported neighboring channels, and animation time versus lifetime. Rendering verification must still check the actual image. Accepted model submissions alone do not establish visible front faces or full actor parity.

Held animations clamp at the last frame, including static poses with no
animation length. Bone scales multiply into the base pose. A real native
bone named `root` uses the converter's name map rather than Java's reserved
synthetic root lookup. Target Bedrock 1.26.51.1 native state blend
`141e6fe70` confirms multiplicative base scale, and the saved protocol 2193
Hive logo requires a held position and uniform scale 2.

Controller UV expressions now use the actual draw camera and actor lifetime.
Supported components retain native offset-zero and scale-one defaults
independently. Immutable render type snapshots preserve queued draw state;
a bounded cache prevents per-frame UV values accumulating indefinitely.
This applies to verified USE_UV_ANIM alpha-test families. The saved CubeCraft
experience_orb combination still uses the material fallback because its
other shader effects have not been verified.

Validation includes held endpoints versus repeat wrapping, static and
animated scale, and numerical controller parser-to-snapshot-to-draw UV
checks. Sixty private GPU cases sample an actual checker texture through
the production shaders for ordinary/emissive and lit/unlit variants.


Legacy client entity declarations now select explicitly referenced
single-state animation controllers. Modern animation aliases and nested
controller aliases preserve declaration order. Controllers with multiple
states, transitions, or state side effects are rejected. Weighted entries
remain omitted; valid unconditional neighbors still play. Depth and
reference limits reject an entire malformed branch without removing
unrelated direct animations.

The active saved Hive pack targets native Bedrock 1.26.51.1, protocol 2193.
Its format 1.8.0 hologram declares `description.animation_controllers`
without `scripts.animate`. The single default state selects a supported
camera rotation and an unsupported variable-based position animation.
Keeping those independent restores camera-facing geometry labels. The
saved stack contains exactly one entity definition, SHA-256
`58cf3b66a2ebe76751415ae7f5f9ad81b44464e5ec987f4f22d6e49639cc1f80`,
in pack SHA-256
`13facb13e8f0aa5ac233253e5deeca0e8c294512ca5f02bb7c38a8fd5da5d028`.

Generic tests cover legacy parser-to-selection-to-camera pose, modern and
nested alias ordering, unreferenced controllers, unsupported neighbors,
invalid states, cycles, expansion limits, and immutable selections.
