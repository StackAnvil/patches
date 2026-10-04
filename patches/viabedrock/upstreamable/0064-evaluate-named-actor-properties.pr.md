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

### Molang float runtime

Pin `org.redlance.mochafloats:runtime:6.0.2` and use its parser, lexer, and interpreter modules. The core requires Java 25. Keep the existing string equality, assignment precedence, and property bindings.

Mocha 3.0.1 calculates intermediate values as doubles. A final float cast cannot preserve Bedrock comparisons or repeated assignments. The [official property guide](https://learn.microsoft.com/en-us/minecraft/creator/documents/introductiontoentityproperties) documents float evaluation and the 16.7-million integer boundary. The [fork source](https://github.com/PlayerAnimationLibrary/mochafloats/tree/1a5dc0fc18bb7f8e7237c0de9cb66299362048ab) defines float values and arithmetic.

Targeted tests cover rounding before comparison, assignments, property inputs, and UV expressions. Full scene comparisons remain required for animation and rendering parity.

Validation: the complete ViaBedrock suite passes 490 tests with one optional test skipped. Checkstyle retains named unused parameters for Java 17 upstream PR patches while checking the Java 25 source. The built core retains the fork's MIT notice.

### Shared native math

Core now supplies the easing functions and regenerated sine lookup that previously existed only in the add-on. Both protocol controller evaluation and client animation use the same library.

Angle reduction preserves the target's float addition before the remainder and maps half-turns to `-180`. Directed rotation retains the start angle and allows extrapolation. This corrects endpoint sorting and repeated subtraction in the dependency.

Target Bedrock 1.26.51.1, protocol 2193, supplies 9,367 native comparisons. Constant dispatcher `140ae6140` and helper `140aeb870` match runtime operations `140b2c2b0` and `140b2d270`. The emulator supplies numeric nodes, runtime stacks, eligibility, cleanup, and a host C float remainder import. Native arithmetic and runtime stack operations execute unchanged. Raw data stays private. These probes do not establish complete parser or visible animation parity.

Validation: the full build passes 958 Java tests, including both native math fixtures. The bundle builds. Direct and ViaProxy particle graphs exercise all three shared functions and produce matching dimensions. Their downloaded archives retain the authored expressions. Visible parity and the existing actor and appearance gaps remain open.
