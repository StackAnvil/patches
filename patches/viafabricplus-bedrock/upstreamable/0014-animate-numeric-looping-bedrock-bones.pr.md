Evaluate looping bone rotation and position channels from immutable render-frame context. Numeric keyframes retain interpolation and looping. Parsed MoLang expressions can use the verified camera and timing queries: `query.rotation_to_camera`, `query.body_y_rotation`, `query.life_time`, and `query.anim_time`, including the `q` alias.

A saved CubeCraft protocol 2193 banner rotates its `full_banner` bone with `query.rotation_to_camera(1) - query.body_y_rotation`. The earlier numeric-only parser discarded its whole animation. A neighboring channel that needs unsupported variables now stays omitted while supported rotation remains available. This does not implement script variables, controller playback, or camera-driven render controller selection.

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
