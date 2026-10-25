The shared float runtime owns parser semantics, bounded control flow and native math. Actor property binding and transport remain in the [following feature](0064-evaluate-named-actor-properties.pr.md). Existing native evidence and its limits follow.

## Dotted resource aliases

Mineville's protocol 2193 pack uses flat aliases such as `Texture.num.0`, `Texture.duels.background` and `Geometry.digit.1`.
The parser previously treated each dot as another object member.
Numeric segments caused errors; word-only segments could silently lose the selected model.
Retain the complete contiguous alias after the texture, geometry or material namespace.
Preserve its spelling, including leading zeroes and numeric-looking suffixes.
Variable members, quoted values and decimal arithmetic keep their existing grammar.

A private Bedrock 1.26.51.1 expression-reader/compiler fixture verifies 26 admission cases.
Native symbol registries execute unchanged.
Allocation, CRT operations, diagnostics and service availability remain supplied boundaries.
The fixture does not establish resource resolution, actor world context or visible parity.
The semantic regression failed before the fix and passes afterward.

The actual accepted hologram pack resolves all six controllers across ten samples.
The old parser loses the first dotted geometry selection; the fixed parser resolves all 120 geometry and texture selections and their materials.
All four projects build with 2,206 passing Java tests and 152 optional skips.
Offline validation passes 264 tooling tests and patch metadata checks.

A complete 210-second replay passes transport verification and records no controller or numeric-member parser errors.
It records 65,524 custom-actor render frames, 570 resolved models and no empty model updates.
The private software-rendered client uses a 3 GB heap and render distance 4; all seven owned processes close.
Overall rendering verification still fails because an actor never reaches model evaluation and unresolved block, entity and texture mappings remain.
This result verifies the alias correction without establishing complete scene or native visual parity.

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

Pin `org.redlance.mochafloats:runtime:6.1.0` from Maven Central and use its parser, lexer, and interpreter modules. The core requires Java 25. Keep the existing string equality, assignment precedence, and property bindings.

Mocha 3.0.1 calculates intermediate values as doubles. A final float cast cannot preserve Bedrock comparisons or repeated assignments. The [official property guide](https://learn.microsoft.com/en-us/minecraft/creator/documents/introductiontoentityproperties) documents float evaluation and the 16.7-million integer boundary. The [MochaFloats project](https://github.com/PlayerAnimationLibrary/mochafloats) defines float values and arithmetic. The [published runtime](https://repo.maven.apache.org/maven2/org/redlance/mochafloats/runtime/6.1.0/runtime-6.1.0.pom) depends on parser and lexer 6.1.0.

Targeted tests cover rounding before comparison, assignments, property inputs, and UV expressions. Full scene comparisons remain required for animation and rendering parity.

Validation: the complete ViaBedrock suite passes 490 tests with one optional test skipped. Checkstyle retains named unused parameters for Java 17 upstream PR patches while checking the Java 25 source. The built core retains the fork's MIT notice.

### Shared native math

Core now supplies the easing functions and regenerated sine lookup that previously existed only in the add-on. Both protocol controller evaluation and client animation use the same library.

Angle reduction preserves the target's float addition before the remainder and maps half-turns to `-180`. Directed rotation retains the start angle and allows extrapolation. This corrects endpoint sorting and repeated subtraction in the dependency.

Target Bedrock 1.26.51.1, protocol 2193, supplies 9,367 native comparisons. Constant dispatcher `140ae6140` and helper `140aeb870` match runtime operations `140b2c2b0` and `140b2d270`. The emulator supplies numeric nodes, runtime stacks, eligibility, cleanup, and a host C float remainder import. Native arithmetic and runtime stack operations execute unchanged. Raw data stays private. These probes do not establish complete parser or visible animation parity.

Validation: the full build passes 958 Java tests, including both native math fixtures. The bundle builds. Direct and ViaProxy particle graphs exercise all three shared functions and produce matching dimensions. Their downloaded archives retain the authored expressions. Visible parity and the existing actor and appearance gaps remain open.

## Shared core Molang grammar and statement results

**Evidence:** The matching Bedrock 1.26.51.1 executable distinguishes simple expression values from complex statement results.
A trailing semicolon changes `2` from result `2` to result `0`.
Statement lists return zero unless execution reaches an explicit return.
The target admits `return 2` without a separator but produces zero, while `return 2;` produces two.
It rejects a direct return followed by another statement in the same scope.
Returns inside selected conditional blocks stop later statements.
Unselected blocks leave execution active.

A private probe executes 25 declarations and 125 billboard samples through the native JSON reader, compiler, VM, and component functions.
Its previous VM context points to a valid private arena through the target TLS field.
Allocation, CRT operations, decimal conversion, single-thread locks, diagnostics, and the compiler's service-availability marker remain supplied boundaries.
The optional SDK observer is absent.
Native parser decisions and VM instructions execute unchanged.
Variable symbol registration and complete live world context remain outside this probe.

**Implemented:** ViaBedrock core now owns the shared token parser and statement-result rules.
Core entity processing and add-on animation and particle programs use that parser.
The add-on also uses core evaluation for numeric and string consumers.
The duplicate client parser and core assignment text rewriting are removed.
Query bindings, actor variables, and execution limits remain with their consumers.
The false branch of a conditional preserves assignment boundaries instead of assigning through the whole conditional.

**Verified tests:** All four projects build with 1,052 passing Java tests, 122 optional skips, and no failures or errors.
Core Checkstyle also passes.
The selected core and add-on suites pass 30 tests, with five unrelated optional references skipped.
Core matches all 41 earlier admission cases and all 25 new constant-statement declarations.
The particle component test matches all 125 native direction and UV samples, including recovered rejected declarations.
Tests also preserve variable side effects, reader parsing, string returns, assignment boundaries, and client execution limits.


**Verified runtime:** Complete direct and ViaProxy replays preserve the CubeCraft scene hash `ede0e43b2874418cbb6b62135898efe0553009307d33fecd0f258383643d5d83`.
Both retain all 311 skin updates and pass transport and rendering checks.
Thirty-six authored direction fixtures load through production resource processing, simulation, and visual extraction on each route.
All reader diagnostics and sampled direction values match their expected states.
No particle loading, initialization, or observer errors occur.
Both routes submit forward draws for translucent and additive particles.
Improved transparency stages were not verified in this parser run.
Screenshot review confirms custom lobby models and hotbar icons.
Overlapping labels and the Java tutorial toast remain presentation gaps.
These checks verify packaged integration without establishing native image or timing parity.

**Remaining:** Complete lexical admission, variable registration, nested control flow, pack-version gates, and SDK world context need further native comparisons.
The authored runtime controls do not establish native images or animation timing.
Typed schema dispatch, interpolation, item classification, and all other coverage requirements remain active.

## Shared core Molang jumps and float loops

**Evidence:** Bedrock 1.26.51.1 returns through nested selected scopes and stops later statements.
`break` and `continue` target the nearest active loop.
Positive fractional loop counts run while their float remainder exceeds zero.
Counts `0.5`, `1.5`, and `1025` therefore execute once, twice, and 1,025 times.
The former client floor and 1,024 clamp did not match this target.
Empty scopes and malformed loop bodies fail compilation.

The [Mojang Molang reference](https://mojang.github.io/bedrock-samples/Molang.html#loop) currently identifies version 1.21.90.3 and describes a 1,024 loop limit.
The matching 1.26.51.1 VM probes differ, so these changes follow the pinned executable evidence.
A limit elsewhere in the full live engine remains unverified.

Private probes execute 57 declarations and 285 billboard samples through the target compiler, VM, and component functions.
Eight declarations use temporary variables to measure mutations and nested jumps.
For those cases, native registry constructors and registration instructions execute unchanged.
The previous VM context uses empty native variable vectors.
Supplied boundaries remain allocation, CRT operations, locks, diagnostics, TLS storage, and the compiler service marker.
Actor variables, complete world context, and native array iteration remain outside this comparison.
A private instruction cap interrupted a much larger loop; that interruption does not establish a native execution limit.

**Implemented:** Core compiles jumps and loop calls into private runtime functions before evaluation.
These functions unwind nested frames while retaining Mocha float arithmetic and property bindings.
The add-on uses this shared evaluator for numeric and string consumers.
Its duplicate equality helper, loop clamp, and execution guard are removed.
Core preserves the existing 16,384-iteration host budget across nested and successive loops, including array iteration.
This budget bounds untrusted work; it is a compatibility policy rather than verified native behavior.
Completed mutations remain visible when the budget ends evaluation with zero.

**Verified tests:** All four projects build with 1,061 passing Java tests, 120 optional skips, and no failures or errors.
Core Checkstyle passes.
Core evaluation and particle components match all 57 native declarations and 285 direction and UV samples.
Regression tests cover nested return mutation order, fractional counts, nearest-loop jumps, array bindings, and the shared host budget.
Both numeric and string client consumers use the same control flow.
Reader diagnostics are compared against compiler rejection, separately from later VM diagnostics.

Particle starts now release their pending slot before completing the public future.
Cached completions can invoke callbacks inline; those callbacks must see capacity from work that has already finished.
The previous ordering could reject chained starts against the 32-slot limit.
Two regressions exercise 128 nested cached starts with an almost-full queue, runtime failures, and rejected starts.
The existing pending-start, cached-graph, emitter, and image-memory limits remain in effect.

Early direct runs passed coarse scene checks while several authored starts were rejected.
A thread sample in an OpenGL draw did not establish a graphics fault.
The pending-slot completion order was corrected and receives separate regression coverage.
The private observer also kept scheduling an obsolete fixture queue after a resource reload canceled it.
That duplicate queue filled the bounded cache; the observer now stops scheduling when its playback generation changes.
Resource reload cancellation remains expected, and cache capacity is not raised for the test.

**Verified runtime:** Complete 240-second direct and ViaProxy replays preserve the CubeCraft scene hash `ede0e43b2874418cbb6b62135898efe0553009307d33fecd0f258383643d5d83`.
Both retain all 311 skin updates and pass transport and rendering checks.
Each route loads 68 authored direction definitions through production loading, simulation, and visual extraction.
Every reader diagnostic and sampled direction matches its expected state.
Translucent and additive controls also start, giving 70 distinct authored effects on each route.
No capacity rejection or observer error occurs in the successful runs.
The final ViaProxy observer records one expected start cancellation during a resource reload.
Both routes submit forward draws; improved-transparency stages remain unverified in this run.
Screenshots show the custom lobby models and hotbar icons, alongside overlapping labels and the Java tutorial toast.
These saved-scene checks do not establish a new live-server join, native image parity, or animation timing parity.

**Remaining:** Complete grammar admission, actor and world contexts, native array iteration, pack-version gates, and visible animation timing remain unverified or incomplete.
Runtime diagnostic text also needs comparison.
All other coverage requirements remain active.

## Explicit temporary evaluation groups

Core supplies caller-owned groups for related expressions that share temporary values.
Single-expression calls retain fresh storage, and persistent actor bindings remain shared.
Expression frames and current values stay independent.
The add-on uses this API for billboard sampling.
The [coverage ledger](../../../docs/bedrock-coverage.md#shared-temporary-variables-in-billboard-expressions) records 45 new native samples, supplied boundaries, regression coverage, and remaining scope and missing-value gaps.
All four projects build with 1,065 passing Java tests and 120 optional skips.
Core Checkstyle passes.
Complete 240-second CubeCraft replays pass through direct and ViaProxy routes.
Each preserves 311 skin updates and verifies 77 authored direction cases plus two material controls.
No active capacity rejection or observer error occurs; native image and timing parity remain unverified.

## Missing Molang members and null coalescing

Core now distinguishes a missing variable member from a valid zero or empty string.
A missing read stops later operations while preserving earlier writes.
Null coalescing catches that fault in its left operand without intercepting control-flow jumps.
Assignment and array-loop targets keep their mutable bindings, and query access stays with its consumer.

The pinned Bedrock 1.26.51.1 compiler, VM, and billboard functions supply 67 declarations and 335 samples.
Twenty-seven cases use a supplied empty native variable map.
The remaining cases cover temporaries, strings, branches, loops, arithmetic, and nested jumps.
Native registry initialization and store cleanup execute unchanged.
Host allocation, CRT operations, TLS, locks, and diagnostic boundaries remain supplied.

The parser rejects unparenthesized assignment chains before evaluation, matching all three tested native rejections.
Parenthesized nested assignments remain admitted.
Embedded assignment results remain incomplete because native store instructions retain accumulator state and some arithmetic instructions fuse constant results.
The [coverage ledger](../../../docs/bedrock-coverage.md#missing-molang-values-and-fault-propagation) records this separate gap and the full verification boundary.

Source syntax and compiled runtime expressions now have separate boundaries.
The client validates source length, node count, and depth before core generates helper calls.
Generated instructions therefore cannot consume a valid script's source budget.
The existing aggregate-script regressions cover this boundary without increasing any limit.
Counter fixtures now initialize their variables or use explicit null coalescing before increments.

Validation: all four builds pass with 1,071 Java tests, 120 optional skips, and no failures or errors.
Core Checkstyle passes.
Core matches 67 validity declarations and the previous 57 control-flow cases.
Particle components match 133 combined native declarations and 665 samples.

Complete 240-second direct and ViaProxy CubeCraft replays pass with the unchanged scene payload and all 311 skin updates.
Each verifies 87 authored direction fixtures plus two material controls through production loading, simulation, and visual extraction.
All reader states and sampled directions match, with no active capacity rejection or observer error.
Each route records one expected start cancellation during resource reload.
Both controls submit forward draws; improved transparency remains unverified in this run.
Screenshots retain custom lobby models, the hanging cube, hotbar icons, overlapping labels, and the Java tutorial toast.
These saved-scene checks do not establish a fresh live-server join or native image and timing parity.

## Native trigonometry boundaries, October 7, 2026

Core now preserves the native float-to-integer conversion used by the shared sine lookup.
NaN and overflowing products select entry zero instead of Java's saturated positive index.
The cosine shift occurs before its own conversion check.
The table constructor now divides each integer index by `10430.378F` before sine evaluation.
Multiplication by the rounded reciprocal disagreed with 8,554 entries in the captured target table.

The pinned fishing lookup executes 3,200 inputs covering every float exponent, conversion boundaries, signed zero, subnormals, infinities, and NaNs.
Production matches the executed indices and the initializer with its supplied sine boundary exactly.
The complete native initializer executes all 65,536 float divisions and stores.
Stack probing, byte copying, and the imported sine function remain supplied.
The initial supplied function rounds double sine to float; 86 entries differ from the captured Wine runtime table.
Initial tests check the supplied initializer exactly and the captured values within one float ULP.
The Windows follow-up below replaces that supplied sine boundary. No captured table enters production.

The corrected table also matches 8,732 executed glide cases with and without rocket boosts.
These cover turns, ascent, descent, angle seams, slow falling, and differing previous rotations.
Their native kernel retains supplied status slots, boost components, CRT remainder, and the corrected table.
One portable glide expectation changes by one float bit after correcting its reference table.
The 720 fishing approach and tease cases also pass with the corrected initializer.
These arithmetic checks do not establish complete movement, fishing, or visible parity.

Validation: core passes 779 tests with 19 optional skips, and the add-on passes 602 tests with 69 optional skips.
Both counts include the new private reference checks, with no failures or errors.
Core, add-on, and ViaProxy builds pass. Both standalone reference PR checks pass.
The final add-on and ViaProxy bundles retain all 1,243 core content files byte-for-byte, excluding bundle metadata.
Reviewed artifact replacements preserve 32 unrelated files and keep private rollback copies. No service restarts occur.

## Windows sine-table verification, October 7, 2026

The captured Linux native-client table uses Wine's `sinf`, not Microsoft's Windows runtime.
Executing Wine's complete function reproduces all 65,536 captured entries exactly.
The installed Windows guest supplies official UCRT `10.0.26100.9444` through a read-only disk extraction.
Its complete SSE function differs from Wine at one entry and from rounded double sine at 85 entries.
Independent hardware executions of the Windows SSE and FMA paths produce identical tables.

The pinned game's complete initializer now executes with the official Windows sine import in one emulated address space.
Only stack probing and the final byte copy remain supplied.
A portable producer matches every resulting float bit through bounded range reduction and polynomials.
Its arithmetic derives from [AMD's BSD-licensed AOCL-LibM implementation](https://github.com/amd/aocl-libm-ose/blob/29fd054f383e6c5e2dec2fce781d5220059f1836/src/isa/avx/masm/sinf.asm).
The source and packaged resources retain the license notice.
Production ships no runtime DLL, captured table, or dependency on a Bedrock installation.

Nine portable controls distinguish Windows rounding from rounded double sine and Wine.
The private all-entry test verifies the complete production table against the linked native initializer.
Reexecuting 8,732 glide cases and 720 fishing approach and tease cases uses the Windows table.
The glide comparison matches every production motion bit, including boosted cases.
These probes still supply status slots, boost components, random samples, world getters, and other documented boundaries.
Windows process initialization, other runtime versions, Android and console math, live movement, and complete visible parity remain separate requirements.

Validation: core passes 781 tests with 19 optional skips. The add-on passes 602 tests with 69 optional skips.
Both suites report no failures or errors. Core, ViaProxy, and add-on builds pass.
Both standalone reference PR checks pass, and the complete 97-patch core stack replays from its pinned base.
Both downstream bundles retain all 1,246 core files byte-for-byte, excluding the JAR manifest, including the AMD license.

Reviewed artifact replacements preserve 32 unrelated files per project and retain private rollback copies under `.stackanvil/research/fishing-feedback/crt/build-rollback/`.
No service restarts or new live-server joins occur in this verification.

## Explicit compound-expression grouping

Expose immutable parser syntax metadata alongside the existing expression list.
Recipe admission distinguishes grouped assignment values beside commas and inside conditional arguments.
Keep that consumer policy separate from the shared rendering evaluator.
Identity-based membership distinguishes structurally equal compound nodes at different source positions.
Literal and identifier nodes do not retain grouping metadata.
The existing parse API returns the same evaluation tree.
A focused regression checks both grouping identity and tree equality.
The [recipe coverage reference](../../../docs/bedrock-coverage.md#native-recipe-molang-context-october-25-2026) records the native admission comparisons and complete build checks.

## Upstream prerequisites

- [viabedrock patch](../../viabedrock/upstreamable/0000-adopt-java-25-language-baseline.pr.md): Adopt Java 25 before the float interpreter runtime.
