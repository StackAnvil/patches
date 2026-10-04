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


## Negotiated custom actor state

Core publishes complete evaluated controller snapshots through `viabedrock:custom_entity`.
The payload uses the actual Java actor UUID and retains ordered models and material bindings.
It includes scale, lighting, and all four UV expressions.
An empty selection hides the actor. Removal releases its state.
Late registration removes existing display parts and republishes live actors.
Clients without the capability keep converted Java item displays.

The codec rejects mismatched versions, duplicate material bindings, invalid counts, and trailing data.
Limits are one MiB per payload, 128 models, 128 bindings per model, and 4,096 characters per string.
Six semantic tests cover complete round trips, immutable ownership, signed zero, removal, truncation, and these limits.
The add-on receives this state through both direct connections and ViaProxy.
Player properties, actor events, and complete animation behavior remain separate requirements.


**Recorded-scene verification:** The protocol 2193 CubeCraft recording passes direct playback `2026-10-04T13-33-22.116Z-replay-scene` and ViaProxy playback `2026-10-04T13-30-14.727Z-replay-scene`.
Both preserve the complete scene payload hash and load the accepted resource pack.
Each route receives 77 model updates for 31 actor identifiers and 43 geometry/texture combinations.
The identifier sets, selected combinations, and scale sets match exactly.
The banner scale remains 1.7 and the hanging logo scale remains 5.
Actual renderer submissions and final screenshots show the custom banners, NPC models, and hanging logo on both routes.
Neither run reports unresolved model errors or rejected skins.

These observations verify transport and supported rendering within this recorded scene.
They do not establish complete native visual parity, actor event support, or broader lifecycle behavior.
Raw packets, assets, account data, and screenshots remain private.

## Native actor inputs through ViaProxy

Core publishes immutable actor inputs through `viabedrock:actor_state_v2` after capability registration and Java world initialization.
Snapshots retain native flags, named properties, scale, variants, typed spell color, runtime identity, and an actor lifetime token.
The local-player flag lets the frontend resolve its actual Java profile identity on either route.
Removal checks the lifetime token before releasing state.
Dimension changes publish retained inputs after the Java respawn packet.

The codec preserves scalar types and rejects duplicate names, invalid kinds, unsupported versions, trailing bytes, and excessive counts.
Limits are one MiB per payload, 4,096 properties, and 4,096 characters per string.
Eight core tests cover immutable round trips, signed zero, malformed data, sparse updates, local identity, runtime ID reuse, and stale removal.

This channel supplies controller queries and effect inputs.
Complete actor events, interpolation, script variables, and native animation timing remain separate requirements.

**Recorded-scene verification:** Matching native capture `2026-10-04T14-17-15.690Z-record-local` supplies the property changes and dimension round trip.
Direct playback `2026-10-04T14-42-19.663Z-replay-scene` and ViaProxy playback `2026-10-04T14-38-50.359Z-replay-scene` preserve the complete scene payload hash.
Both load the accepted pack without a frontend Store account.
Each route receives 587 actor updates.
All message fields match after connection-specific UUIDs, lifetime tokens, and timestamps are excluded.
The local property sequence is orange, blue, orange, and blue.
The bool, int, enum string, and float retain their values and types.
Both routes remove and restore local inputs at each dimension change.
Final screenshots show the grounded blue costume and green equipment on both routes, consistent with the native selection.
Camera framing, lighting, full animation timing, and broader lifecycle behavior remain unverified.

### Raw names for native global transforms

Actor snapshots now include the raw typed `ActorDataIds.NAME` value.
Sparse updates retain the prior name, and explicit empty strings clear it.
Missing or incorrectly typed metadata produces an empty string.
The codec preserves formatting and case within its existing string and payload bounds.
Entity and codec tests cover these semantics.

The payload uses wire version two and the negotiated `viabedrock:actor_state_v2` channel.
An older add-on therefore cannot negotiate the previous name and receive the changed layout.
Ordinary Java translation does not require this native channel.
The frontend uses explicit raw names for target first-person global transforms.
Native player-name initialization from gamertags remains unverified.

Final direct and ViaProxy checks inject private authored `SET_ENTITY_DATA` packets before the production decoder.
Each frontend receives the unchanged formatted name `§aDinnerbone`, followed by the exact `Dinnerbone` name.
Both actual Minecraft hand entries submit the expected matrix for combined death and name transforms with the licensed `0.9375` scale.
They suppress duplicate Java hands and restore the pose and appearance scopes.
The fixture then clears the name, and both final screenshots show the native arm.
These supplied packet and graph inputs verify transport and draw-time composition, not native lifecycle or pixel parity.
