Evaluate named actor properties before render controller selection. Saved CubeCraft controllers require string enum comparison and correct assignment and unary precedence. The shared Molang evaluator also supplies Geyser custom block permutations.

Validation: semantic parser/property regressions and the full 246-test ViaBedrock suite pass. Typed wire decoding stays in the existing metadata patch.

Carry resolved materials, `ignore_lighting`, and the evaluated floating light multiplier in each selected actor model. Material arrays resolve in the controller scope. Preserve wildcard and bone override order for the client renderer. A saved Bedrock 1.26.51.1 Hive logo requires the unlit controller input; CubeConverter supplies the source fields. Target protocol is 2193.

Validation: material selection tests cover named bindings, array choices, override order, immutable snapshots, and lighting state changes. The complete ViaBedrock build passes, including Checkstyle.


Native actor scale now remains available in `Entity.scale()` and
`query.model_scale`. Scale-only updates refresh models even when controller
selection stays equal. Converted item-display models multiply their fit
and origin offset by this scale. The saved protocol 2193 CubeCraft scene
supplies FLOAT metadata 38 values of 1.7 for banners and 5 for its hanging
cube, and the target 1.26.51.1 client renders the larger geometry. Its
`query.model_scale` getter at `14221ac00` reads the native float context.
The [Molang reference](https://mojang.github.io/bedrock-samples/Molang.html)
uses this query name.

Three semantic tests cover wire decoding, sparse updates, unchanged-model
refreshes, and controller conditions. Zero and negative scale values stay
intact. This change does not add client `scripts.scale` or camera animation
queries. Raw captures and executable probes remain private.

Evaluated actor models now retain immutable UV offset and scale expressions. UV-only changes refresh the model snapshot. Camera-dependent expressions reach the native renderer without protocol-side evaluation.

The target Bedrock 1.26.51.1 controller parser and ENTITY vertex shader establish identity defaults and `UV * scale + offset`. Target protocol is 2193. The licensed executable SHA-256 is `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`. Saved pack assets and native exports stay private. A semantic snapshot test evaluates retained lifetime expressions after replacement and checks UV-only model updates.
