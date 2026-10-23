The shared runtime owns actor graphs, float evaluation, accepted resource decoding, sound and particles. Account selection and purchases remain in the following [appearance patch](0009-manage-character-creator-accounts-and-wardrobes.pr.md). The following research supports these APIs; historical suite counts do not replace a fresh build.

## Classic actor graph

Compile reachable player animations and nested controllers from the matching licensed package. Apply classic aliases over the player defaults, including empty overrides. Preserve ordered weighted references, initialization, per-frame scripts, entry and exit scripts, state transitions, temporary remapped variables, and independent playback clocks.

Typed queries preserve item strings. Normalize native numeric float suffixes outside quoted text. Apply the graph to preview and world models through the same authored hierarchy as emotes. Entity-relative rotation cancels parent animation rotation before attachment flattening.

Private matching package tests establish the zombie-arm alias and additive riding pose. Targeted tests cover controller cycles, re-entry, nested variable restoration, typed queries, and simultaneous parent rotations. A running Java client passes eight checks for the injected bridge, preview alias, and player model pose. Its visible preview uses a synthetic texture and private licensed actor files.

Effects, full item-action bindings, and first-person playback remain incomplete. The classic importer supplies selected legacy geometry aliases in native conversion order. Native motion, mixed rotation spaces, and nontrivial scale composition still need comparison. The runtime probe does not establish live account import behavior.

Sources: [Controller semantics](https://learn.microsoft.com/en-us/minecraft/creator/documents/animations/animationcontroller?view=minecraft-bedrock-stable) and [animation rotation spaces](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/visualreference/actor_animation.v1.8.0?view=minecraft-bedrock-stable).

## Unresolved classic animation resources

Retain aliases whose declared animation or controller resource is absent. Their tracks contribute no pose and remain incomplete. Other tracks continue playback. Explicit empty aliases still remove tracks from completion checks. Undeclared aliases contribute no track. Malformed present resources, cycles, and invalid controller state targets remain errors.

Independent execution of Bedrock 1.26.51.1 `FUN_141e68a20` and `FUN_141e6d180` verifies 16 missing-resource updates. Cases cover absent handles and handles with absent definitions. Player state, pose, and context remain unchanged. Native completion getters return false. Missing animation players skip their weight expression. Missing controller players evaluate their weight expression before returning.

This behavior permits the stale inverted-crouch resource emitted by the native legacy converter. Tests verify controller all-completion and any-completion, weight side effects, ordinary track playback, empty overrides, rewind, and all nine legacy flags against licensed player resources. Native binaries, fixtures, and probes stay private.

The replayed full stack builds, and all 174 fixture-enabled add-on tests pass with no skips. A running Java client passes 1,059 checks. These cover the 1,024 native flag and merge cases, pack import, persistence, skin claims, and all nine licensed legacy graphs. The imported zombie-arm alias reaches both preview and world model geometry. The probe changes no account profiles. Native visible motion comparison remains pending.

## Native animation effect research

Earlier notes incorrectly identified `FUN_1401a0f40` as a sound callback. The target schema, record sizes, emitter methods, and actual sound queue establish separate particle and sound paths.

Independent execution of Bedrock 1.26.51.1 `FUN_1401a0f40` verifies 256 particle callback cases. Native instructions select events, resolve aliases, choose positions, attach emitters, and pass an initialization descriptor. The harness supplies actor accessors, locator results, particle engine allocation, and emitter methods. It captures the native requests at these boundaries without particle simulation.

Particle events use `previous < event <= current`. Missing aliases and unavailable particle engines produce no emitter request. An unbound emitter uses the resolved locator position. A missing locator falls back to the actor position.

A bound emitter retains the actor identity and authored locator. Native code passes the initialization descriptor after attachment. Authored particle defaults still need verification.

The descriptor at offset `0x60` contains a 16-byte Molang expression variant. The emitter vtable selects `FUN_1421603e0`, its initialization setter. This setter evaluates a complex program with the emitter's render context at offset `0xd8`. Constant variants, missing programs, and failed emitter preparation do not call the complex evaluator.

Independent execution verifies 16 initialization cases and 64 particle callback cases through the actual setter. The harness supplies emitter preparation and the complex-expression evaluation boundary. Native instructions select the program and its render context after locator attachment. Earlier raw byte captures establish descriptor transport only. These particle probes do not establish sound volume, pitch, captions, or audible output.

Another probe executes `FUN_141e68a20` across 38 clock frames, 16 render-context flag combinations, and suppression followed by re-enabling. Particle dispatch follows bone sampling and precedes sound queuing and Molang timeline scripts. It receives the current clock and previous event cursor. The clock cases cover initial delays, loop delays, held frames, zero weight, custom clocks, equal timestamps, and loop wrapping.

A suppressed native render context skips particle dispatch, sound queuing, and timeline scripts but still advances the event cursor. A later enabled pass does not replay that skipped interval. The probes verify raw context flags. Their mapping to Java preview and world render contexts remains unresolved.

The native timeline sound schema in `FUN_141bcfd40` declares an effect name and an optional locator. Its object and array callbacks, `FUN_141c008f0` and `FUN_141c009b0`, append 104-byte records. Each record contains two 48-byte hashed strings and a float timestamp. Fourteen native constructor cases verify empty strings, float conversion, and both declaration forms. Twenty-four native executions of `FUN_141e88370` verify stable ordering, including equal timestamps.

The sound path executes inside `FUN_141e68a20`. It resolves aliases through the table at player offset `0xc0`. It appends 80-byte requests with the resolved sound name and authored locator to an actor component. Nineteen native cases verify missing aliases, missing bindings, unavailable actor context, event boundaries, exact loop boundaries, wrapping, and suppression without catch-up. The harness supplies component lookup and memory-copy boundaries. The sound path follows particle dispatch and precedes timeline scripts.

These queue checks establish queue contents. The consumer and backend checks below establish position requests and some parameters. Audible output, captions, and production playback remain incomplete.

Independent execution of `FUN_1401c3340` verifies 64 resource availability and lifetime cases. The binder acquires the actor resource and animation definition through two weak references. It assigns the particle table through `FUN_141e69a40` and the sound table through `FUN_141e69a50`. The tables come from definition offsets `0x220` and `0x2b8`. The client-entity parser writes sound aliases to the latter table through `FUN_141d637a0`.

Absent or expired resources leave existing bindings unchanged. Both resource reference counts return to their initial values. This probe verifies native table assignment, not named actor events or production resource loading.

Inspection of `FUN_1414ba900` confirms the first declared emote source. The loader reads its file and adds the selected animation to the shared actor-animation library. The source loader alone does not resolve effect resources. Sound dispatch also requires the actor sound table above.

The extracted base vanilla player definition declares no sound or particle aliases. The two captured owned emotes contain neither effect type. These assets verify existing playback but cannot establish sound or particle behavior. Generic actor schemas establish effect declarations, not the resource bindings used by every persona emote.

Production sound, particle, and named actor event playback remain incomplete. The next implementation needs effect resource bindings, model locator transforms, audio loading, and effect lifecycle management. The renderer does not yet consume model locators. Native instruction probes do not establish audible results, captions, particle appearance, or multiplayer behavior. Executables, probes, fixtures, and exports remain private.

Sources: [Microsoft animation effects reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/visualreference/actor_animation.v1.8.0?view=minecraft-bedrock-stable), [Mojang particle integration reference](https://mojang.github.io/bedrock-samples/Particles.html), [sound event declaration](https://github.com/LiteLDev/LeviLamina/blob/32fcaa02baa38371b705358801c7d185c284233e/src/mc/world/actor/animation/ActorSoundEffectEvent.h), and [particle emitter methods](https://github.com/LiteLDev/LeviLamina/blob/32fcaa02baa38371b705358801c7d185c284233e/src-client/mc/client/particlesystem/particle/ParticleEmitterActual.h). Generated declarations supplied leads. The target executable and independent execution establish the behavior and record layouts above.

## Licensed animation effect libraries

Extend the package helper's existing licensed acquisition to vanilla sounds, particles, and their texture atlases. The matching Bedrock 1.26.51.1 package stores sound definitions and particles in BR archives, with loose FSB5 sound banks. The root texture archive supplies the flame atlas. The particle texture archive supplies particle and campfire-smoke atlases. Shared directory selection keeps NTFS traversal and segment-index filtering consistent.

Cache format 4 retains all acquired resources and their checksums. Model-only and actor-only caches refresh before use. An incomplete library or failed refresh leaves the previous cache intact and removes staging files. Tests cover both older formats, binary byte preservation, missing effect resources, checksum reuse, and rollback.

The bundled production helper obtains the official license in a fresh Java test. The cache contains sound definitions, FSB banks, particle definitions, and all three referenced atlases. It resolves inherited models and built-in emotes after cache readback, then reuses the saved cache without another acquisition. The replayed full stack builds, and all 193 fixture-enabled add-on tests pass with no skips. Three native helper unit tests also pass; two live acquisition tests require private fixtures.

Private inspection identifies 4,691 FADPCM and 70 PCM16 banks. The particle archive contains 114 MCB definitions and one text definition. A private reference-decoder run restores all 114 MCB definitions using 72 schemas and references exported by the matching official server. This cache change preserves the original binary data. The following sections describe the production decoders. The effect runtime remains incomplete. The reference decoder, server, exported schemas, downloaded assets, and credentials remain private. Production requires no installed game or external extractor.

Sources: [MCB reference decoder](https://github.com/LPaicen/brarchive-extractor) and [server schema export workflow](https://github.com/SmokeyStack/brarchaeology/blob/main/tools/Dump-BdsSchema.ps1). These references guide format research; the live licensed package supplies the target-version data.

## Decode licensed sound banks

Decode the matching package's single-stream FSB5 version 1 banks through the asset loader. Preserve signed PCM16 samples and decode FADPCM prediction, shifts, clipping, frame histories, and stereo interleaving. Custom sample-rate chunks override the header rate. Loop metadata retains its inclusive end as an exclusive sample boundary. Padded final frames stop at the declared sample count.

Validate bank layout, chunk lengths, channel counts, rates, loops, and encoded frame availability. Reject unknown codecs and unsupported flags. Limit decoded PCM to 64 MiB before allocation. The loader resolves banks only beneath the vanilla sound directory and retains the original versioned cache data. The packaged ISC notice preserves vgmstream's copyright and license.

A private harness compiles the unmodified vgmstream FADPCM decoder with file-access adapters. Its PCM checksums match all 4,761 licensed banks through the production asset loader. Another 96 generated banks vary histories, predictors, shifts, clipping, channels, offsets, loop markers, and final-frame lengths. The same checks verify sample rates, channel counts, sample counts, and loop boundaries. Unit tests cover malformed dimensions, truncated metadata and frames, signed PCM, prediction, clipping, and stereo output. Private banks, harnesses, and reference results remain outside the repository.

Sound event parsing, alias bindings, locators, audio output, captions, and effect lifecycle remain incomplete. This change establishes decoding and makes no claim about audible emote playback.

The replayed full stack builds, and all 198 fixture-enabled add-on tests pass with no skips. This includes fresh licensed acquisition through the bundled helper and the complete sound-bank reference comparison.

Sources: [FSB5 layout](https://github.com/vgmstream/vgmstream/blob/7dc938fa2f210943b37c7b6511852b516ef432ab/src/meta/fsb5.c) and [FADPCM decoder](https://github.com/vgmstream/vgmstream/blob/7dc938fa2f210943b37c7b6511852b516ef432ab/src/coding/fadpcm_decoder.c).

## Decode compiled particle definitions

Read particle definitions through the licensed asset loader. The matching 1.26.51.1 base archive contains 114 MCB definitions with format version 1.26.10 and one text definition. The game version and compiled format version differ.

Declare the 70 reachable binary layouts in Java. Preserve ordered fields, optional presence, tagged variants, hashed component identities, maps, and collection order. Production decoding requires no native installation, exported schema files, or external decoder. Preserve the MIT reference decoder's license notice in the add-on resources.

Reject unsupported format versions, unknown or duplicate components, invalid tags, malformed UTF-8, truncated values, and trailing bytes. Bound input size, string length, collection counts, recursion depth, and total decoded nodes. Preserve raw float32 values instead of rounding to the reference exporter's seven significant digits.

Compare all 115 licensed definitions through the production loader against independent reference output. Targeted tests also cover truncation at every byte boundary and invalid counts, tags, booleans, versions, strings, and non-finite values. Acquired assets, schema exports, and reference tooling remain private.

Support MCB 1.26.30 after private licensed overlay acquisition identifies five definitions with that format. The same layouts decode all 108 overlay definitions against the independent reference. Comparisons cover 223 definitions across the base and overlay libraries. The overlay comparisons call the decoder directly. Production acquisition now selects all stable vanilla layers. Other compiled versions remain unsupported.

Definition decoding does not implement particle simulation or rendering. Animation effect parsing, resource bindings, locators, event dispatch, and effect lifecycle remain incomplete.

The full stack build passes with MCB 1.26.10 support. After the overlay format extension, the replayed add-on builds, and all 204 fixture-enabled tests pass with no skips. This includes fresh licensed acquisition and complete base sound and base and overlay particle reference comparisons.

Sources: [MCB reference decoder](https://github.com/LPaicen/brarchive-extractor/blob/503a8ce7ad94030241a3590c926ac36f72169c71/src/mcb-decoder.ts) and [server schema export workflow](https://github.com/SmokeyStack/brarchaeology/blob/main/tools/Dump-BdsSchema.ps1). Matching package bytes establish the compiled format version and reference comparisons.

## Versioned resource acquisition gap

A directory probe against the pinned official client package finds 58 `vanilla_*` entries, including `vanilla_base`. Versioned overlays reach `vanilla_1.26.51`. The probe reads the package index and stops before license acquisition or content extraction. It makes no account changes and requires no installed game.

The production helper currently traverses only `persona` and `vanilla`. The matching base sound archive contains 584 event definitions. These base resources do not establish the final library after versioned overlays apply. Acquisition and resource resolution still need the matching overlay stack, including its precedence and merge behavior. This affects model, animation, sound, and particle coverage. Package indexes, exports, and research helpers remain private.

A private helper then obtains the official license and extracts 303 overlay metadata files and archives. Unpacking yields 835 library files, including 108 particle definitions and 43 sound tables with 1,848 distinct event names. Its compiled particles include 92 files with format 1.26.10 and five with format 1.26.30. Eleven particle definitions use text JSON.

The newest overlay player definition has 68 animation aliases; the extracted base definition has 52. New aliases include crawling, brush, spyglass, goat horn, shield, and first-person and third-person spear tracks. Three base aliases disappear. None of the extracted player definitions declare sound or particle aliases. The production player graph still needs the overlay stack. This evidence broadens the resource and pose gap beyond effect dispatch. All acquired content remains private.

## Versioned vanilla library

Acquire `vanilla`, `vanilla_base`, and numeric vanilla directories from the pinned official package. The matching build supplies 57 layers. Older names such as `vanilla_1.14` imply patch version zero. Keep their paths and manifests separate. Cache format 5 refreshes base-only caches and validates pack UUIDs and overlay versions. Missing layers or mismatched manifests preserve the old cache.

Resolve models, animations, and controllers by identifier in pack order. Merge client-entity description objects by key; higher lists and scalar values replace lower values. Animation definitions replace earlier registrations within their pack. Conflicting models and other catalogs retain their ambiguity checks. Preserve each controller's format version so a higher pack cannot change another controller's first-frame behavior. Merge sound catalog entries across both catalog formats. Resolve sound banks, particle files, and textures by pack order. Namespaced block models no longer prevent library loading.

The matching player file declares 68 aliases and comes from `vanilla_1.21.130`. The effective description retains four aliases from lower layers. Only references absent from the merged dictionary are undeclared during compilation and playback allocation. Declared resources that cannot resolve still contribute incomplete tracks. Compile script arrays as one bounded program. The matching 8,141-character pre-animation script spans conditional blocks across JSON strings. Preserve temporary scope and early returns. Bone expressions retain their smaller limits.

A fresh production-helper acquisition loads all 57 layers and reuses the checksummed cache. Licensed fixtures compile the full player graph and sample 120 frames. Tests cover numeric ordering, overrides across filenames, controller format behavior, both sound catalogs, opaque files, archive roots, split scripts, and rollback. Rust tests and Clippy pass. Item query bindings, newer easing functions, first-person rendering, and effects remain incomplete. These tests do not establish native visible motion parity.

Sources: [Resource overrides](https://learn.microsoft.com/en-us/minecraft/creator/documents/overwritingassets?view=minecraft-bedrock-stable), [client-entity selection](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction?view=minecraft-bedrock-stable), and [vanilla layer configuration](https://github.com/tryashtar/minecraft-version-history/blob/master/personal_config.yaml).

The replayed full stack builds and the Prism bundle assembles successfully. A rebuilt Java client passes 722 checks with licensed overlays and a synthetic skin texture. The probe verifies layer selection, the player definition, preview geometry, world-model geometry, and repeated-frame handling. It changes no account recipes. Native visible motion comparison remains pending.

The replayed add-on suite passes all 214 fixture-enabled tests with no skips, including fresh acquisition through the bundled helper.

## Native sound consumer and backend

Bedrock 1.26.51.1's sound queue consumer `FUN_146686950` calls `SoundEngine::playAttached`. Constructor and destructor references identify the engine vtable. A read-only lookup in the running target client identifies the backend method.

The position callback `FUN_14668ffd0` checks the actor's weak reference, registry, entity generation, component, and removal state. A valid locator supplies its current position. A missing locator uses actor position. An unavailable actor leaves the supplied properties unchanged. Independent execution verifies 256 availability, movement, property preservation, and reference cases. External boundaries supply locator resources and the locator lookup.

The engine method `FUN_1441c2ff0` resolves the catalog event before it invokes the backend. A missing event returns the invalid handle without invoking the position callback. The inspected backend method `FUN_14b3b53a0` initializes properties to zero and invokes the callback once. It passes the resulting position to ordinary playback with volume `2`, pitch `1`, and no server sound handle. It does not retain this callback for later movement.

Independent execution verifies 512 cases through the engine method, backend method, and actual position callback. The harness supplies catalog lookup and captures the final playback request. Native code executes the availability checks, position resolution, defaults, and reference cleanup. These cases do not produce audible output.

The backend's ordinary playback method selects a sample by its integer weight. Zero-weight samples receive no selection interval. An event with no total weight returns the invalid handle. Selected sample volume and pitch multiply the incoming values. A nonpositional override clears the selected sample's positional flag. Another 328 native cases verify selection boundaries, zero weights, multipliers, positional overrides, and handle allocation. The harness supplies the random draw and stops before sample loading.

These results establish requests and parameters for the inspected target backend. They do not establish attenuation, category volume, captions, audible output, or native multiplayer results. Production still needs effect resource bindings, locator transforms, dispatch, audio output, and cleanup. Private executables, memory leads, probes, and licensed assets remain outside the patch.

## Modern Molang curves and conditional assignments

Extend the standard math object with inverse interpolation and all 30 easing functions present in Bedrock 1.26.51.1. Preserve float operands, reversed ranges, overshoot, and extrapolation. Exponential curves retain the target's small endpoint offsets. Elastic curves retain explicit endpoint checks and the target's 0.3 period, including the in-out variant.

Independent execution of the target's constant-fold handlers verifies 13,578 cases across all 31 functions. The dispatcher and descriptor table establish their names and argument order. The harness supplies constant eligibility, argument cleanup, and imported exponential and square-root calls. Native instructions perform the curve calculations and sine-table indexing. The initialized target sine table is a private oracle input. Production generates its own table and requires no executable, installation, copied table, or external extractor. Tests allow small float rounding differences from Wine's sine implementation in the Linux native-client capture.

The licensed player script also exposes assignment precedence errors in Mocha's parser. A conditional assignment retained its boolean condition instead of the selected numeric value. Parse expressions with assignment below conditionals, right-associated nested conditionals, and unary operators around complete function calls. Retain Mocha's lexer, expression types, and evaluator. Bound parser recursion before building the expression tree, then apply the existing expression and execution limits.

Tests cover conditional assignments, explicit parentheses, nested branches, argument side effects, standard math functions, and excessive nesting. A private licensed fixture executes the unchanged player scripts through the actor and bone sampler. Its synthetic bone observes five spear attachment rotations across the raise interval. This proves script evaluation with supplied query values. It does not establish live spear query bindings, first-person rendering, or native visible motion parity. Native executables, oracle data, and licensed player scripts remain private.

Sources: [Microsoft math functions](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/molangreference/examples/molangconcepts/mathfunctions?view=minecraft-bedrock-stable) and [Molang conditionals and versioned nesting behavior](https://learn.microsoft.com/en-us/minecraft/creator/documents/molang/syntax-guide?view=minecraft-bedrock-stable).

After integration with the server costume and custom block patches, the full 14-patch stack builds and the Prism bundle assembles. The rebuilt Java client's packaged evaluator passes all 13,578 native curve comparisons and a conditional-assignment check. The maximum absolute difference across these samples is approximately 0.0000763. The comparison permits eight float ULPs plus 0.00001, including cancellation near zero. These results do not prove bit-for-bit equality or native visible motion. The probe changes no account recipes.

The replayed add-on suite passes all 231 fixture-enabled tests with no skips, including fresh licensed acquisition through the bundled helper.

## Native sound catalog defaults and attenuation requests

Bedrock 1.26.51.1's catalog reader uses scalar float conversion for sample volume and pitch. Both default to one; weight defaults to one. The inspected converter returns zero for array and object values. This target behavior differs from the newer published schema's range forms. Preserve the matching reader's behavior until a versioned replacement path has evidence.

Category matching for `music` and `ui` ignores ASCII case. Both categories default to nonpositional samples. Other categories and an absent category default to positional samples. An explicit `is3D` value updates the default used by later samples in the same event. String samples default to no streaming, no interruption, and no concurrent streaming. Object samples default to no streaming, enabled interruption, and enabled concurrent streaming. Native setup and constructor execution verify 141 cases. The harness supplies JSON property lookup, string conversion, and memory copying. Native code performs category comparisons, scalar conversion, flag updates, and sample construction.

The distance setup passes FMOD minimum and maximum distances and chooses rolloff modes. Negative distances log a diagnostic and restore defaults. Default distances are one and 10,000. A positive minimum preserves the current rolloff mode and uses the supplied positive maximum, or 10,000. With only a positive maximum, setup requests linear rolloff from zero to that maximum. The legacy maximum-only path updates the parent sound directly. The ordinary helper also updates each available subsound. Default setup restores inverse rolloff when the loaded sound currently uses linear rolloff.

Independent execution of the setup function, helper, and actual closures verifies 400 cases. These cover minimum and maximum combinations, legacy mode, initial rolloff modes, subsounds, and failed subsound lookups. FMOD methods and diagnostics are supplied boundaries. The checks establish requests, including reversed distance ranges. They do not establish FMOD acceptance of every request, listener output, audible attenuation, category volume, or captions. Production effect playback remains incomplete. Executables, native exports, probes, fixtures, and licensed assets remain private.

The inspected mixer initializer creates effects, music, and text-to-speech groups under the master group. It creates seven named category groups under effects: ambient, block, hostile, neutral, player, record, and weather. The animation playback path searches these category keys with case-sensitive comparisons. A missing category uses the effects group. This also covers music and UI event categories, which have no entry in this map. Their nonpositional sample defaults do not select the separate music group.

Another 80 native cases execute weighted dispatch and the actual category map search up to stream construction. They verify category lookup, case differences, missing groups, fallback, and null group values. The harness supplies the random draw, allocation, and imported memory comparison. The initializer hierarchy is inspected evidence; these cases do not execute its creation or verify volume sliders and audible mixing.

Sources: [Mojang sound schema](https://github.com/Mojang/bedrock-schemas/blob/main/schemas/rp/sounds/index.schema.json), [FMOD mode flags](https://www.fmod.com/docs/2.03/api/core-api-common.html#fmod_mode), and [FMOD sound distance behavior](https://www.fmod.com/docs/2.03/api/core-api-sound.html#sound_set3dminmaxdistance). The target executable establishes the version-specific reader and setup behavior.

### Resolve authored sound samples

Parse the effective vanilla catalog into immutable sound events after versioned overrides. Preserve authored sample order, integer weights, scalar volume and pitch, streaming flags, subtitle keys, raw distances, and the legacy distance flag. Keep category defaults separate from the case-sensitive playback group lookup. An explicit `is3D` value remains the default for later samples. Selected FSB and OGG samples resolve through the same versioned library and bounded decoders.

Another 238 executable cases verify scalar conversions across null, boolean, integer, fractional, string, array, and object values. Null retains each field's default. Numeric strings, arrays, and objects convert to zero for numeric parameters. Nonempty strings and containers are true for boolean flags, including the string `false`. Java fixture comparisons now cover 1,187 native catalog, scalar, weighted-selection, category-routing, and attenuation cases.

An integration test traverses the matching licensed catalog, selects its positive-weight samples, and resolves available FSB banks. It compares decoded PCM, dimensions, and loop boundaries with the independent reference. Tests also check selection limits and cache rollback after a malformed catalog. Licensed assets, native executables, and oracle fixtures remain private.

This change establishes sound resource selection and requested parameters. It does not implement animation effect dispatch, locator transforms, audio channels, captions, or audible mixing. The acquired library contains unresolved sample references, including music assets. Their presence does not establish that the official package lacks those files.

The replayed full stack passes all 240 fixture-enabled add-on tests with no skips, including fresh licensed package acquisition and cache reuse. These checks do not establish audible effect playback.

### Resolve OGG replacements

Resolve formats within a pack before trying lower packs. A higher OGG sample can replace a lower FSB bank. The target executable's extension-list initializer `FUN_140275490` declares FSB, OGG, then WAV. The implemented formats retain that order. [Microsoft's replacement guide](https://learn.microsoft.com/en-us/minecraft/creator/documents/addcustomsounds?view=minecraft-bedrock-stable) establishes replacement across formats. WAV decoding remains incomplete.

Use Minecraft's JOrbis reader after checking page bounds, stream identity, sequence, end-of-stream, Vorbis channel and rate dimensions, and the final sample count. Bound decoded PCM to 64 MiB before allocation. Missing, truncated, oversized, or inconsistent streams fail through the existing asset-loading error path. Convert floats into interleaved little-endian PCM16. This path needs neither a Bedrock installation nor an external decoder.

Private tests compare three licensed samples and six generated mono/stereo streams at 8,000 through 48,000 Hz with libvorbisfile. All 109,603 scalar samples differ by at most one PCM quantization step. Dimensions, exact frame counts, channel order, extensionless catalog selection, truncation, excessive granules, path safety, and format overrides pass. Vorbis loop comments, FMOD output equivalence, and audible playback remain unverified or incomplete. Independent reference files and licensed content stay private.


### Play timeline sound requests

Timeline sounds resolve through the actor's declared aliases. Missing bindings produce no request. Stable timestamps, suppression cursor advancement, repeat frames, and loop boundaries match 19 target executable queue fixtures. Sound events also contribute to inferred animation length, as [Mojang's schema](https://mojang.github.io/bedrock-samples/Schemas.html) specifies.

Static model locators follow the final sampled bone pose. Missing locators use actor position. The attached backend snapshots this position once with gain two and pitch one. Unit tests cover bone inheritance and scale suppression. Scaled world positions and dynamic locators still need native comparisons.

Decode selected FSB and OGG samples off the render thread. Bound pending decodes and active PCM. Use Minecraft's shared audio device, listener, source pools, and category sliders. Preserve authored pitch, source-relative playback, and distance requests. Release static buffers after channels, and invalidate pending requests on reload or disconnect.

Streaming uses the stream pool after full PCM decoding. Gain above one requires `AL_SOFT_gain_clamp_ex`. Native audible mixing, captions, stream concurrency, particles, dynamic emote resource assignment, and exact render suppression conditions remain incomplete.

All 246 fixture-enabled add-on tests pass with no failures or skips. The dependency build and bundle pass. Licensed content, executables, native exports, and runtime probes remain private.


A muted Java runtime test verifies static and streamed PCM channels, licensed FSB and OGG playback, server pack catalog overrides, and snapshot positions. It also verifies authored pitch and attenuation, pause exceptions, natural completion, restart after stopping all sounds, and cancellation of pending decodes. Source gain remains zero throughout. These checks do not establish native audible mixing or locator placement against a native scene.


### Play controller state sounds

Accept state `sound_effects` arrays and resolve their aliases through the actor's effective sound library. [Microsoft's controller example](https://learn.microsoft.com/en-us/minecraft/creator/documents/animationsandcontrollers?view=minecraft-bedrock-stable) establishes this resource shape. The target Bedrock 1.26.51.1 controller queues these sounds after child animation updates.

The controller effect gate also suppresses entry and exit scripts. State transitions still consume their entry, so later frames do not replay suppressed effects. Self transitions reset child players without repeating state effects. Initial-state handling retains the format boundary at 1.18.10. Source arrays retain their declared order.

Independent execution of the target controller update verifies 106 queue and script callback cases. They cover initial transitions, source order, suppression, unavailable bindings and actors, zero weights, reentry, self transitions, and crossfades. Child update and script evaluation functions are supplied boundaries. The checks inspect actual native sound queue writes. Java tests compare every queue and script callback count with these fixtures.

A muted Java client test loads a controller through the production server player factory. It verifies alias resolution to actual PCM channels, suppression of entry scripts without later playback, reentry, and duplicate frames. Source gain stays at zero. All 249 fixture-enabled add-on tests pass with no failures or skips. The dependency build and bundle pass.

Particles, complete native render-context gate bindings, audible mixing, captions, and dynamic emote resource assignment remain incomplete. Native exports, licensed assets, executable fixtures, and runtime probes remain private.


### Establish particle runtime calculations

Independent execution of Bedrock 1.26.51.1 now covers dynamic motion, billboard properties, and emitter component configuration. These checks extend the earlier particle dispatch probes. Production still rejects animation particle effects before playback.

The dynamic motion function, `1461c9ce0`, passes 200 cases with constant component fields. It converts nanoseconds to float seconds. Linear drag uses an exponential velocity update. Drag magnitudes at or below float epsilon use acceleration directly. Position uses the updated velocity. Rotation uses a separate acceleration and drag update. An exponential result at or above the largest finite float clears linear velocity.

The billboard update, `1462b1d70`, passes 492 cases. Sizes clamp to zero. Flipbooks use the imported `roundf`, so frames change at the half-frame boundary. Lifetime stretching computes its rate from the particle lifetime and frame count. Non-looping frames clamp to the last frame; looping frames use `fmodf`. Authored UV steps can be negative. Custom directions retain their magnitude. Derived directions retain the previous direction at or below the squared speed threshold. The definition reader squares the authored threshold.

Private Java implementations match all 6,022 finite scalar results from the motion and billboard cases exactly after float conversion. The native harness supplies the imported `expf`, `roundf`, and `fmodf` results. Billboard variable lookup supplies particle age and lifetime. These boundaries leave native math-library differences and complete Molang integration unverified.

Another 289 native cases cover instant, steady, and manual rates, plus once and looping lifetime configuration. These calls execute the target emitter's actual getter and setter methods. Instant requests stop after the emitted counter becomes nonzero and cap at 1,000. Manual capacity caps at 2,000. Steady emission keeps a float time remainder, uses `floorf` for the batch count, and applies a changed rate after the next batch emits. The probe also checks capacity initialization and conversion of active and sleep times to nanoseconds.

These component checks do not execute particle allocation, lifetime scheduling, collision, materials, or world rendering. The private Java calculations remain research code until the production runtime consumes them. Native exports, executable fixtures, and licensed assets remain private.

Sources: [Microsoft dynamic motion reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponents/minecraftparticle_motion_dynamic?view=minecraft-bedrock-stable), [instant emission reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponents/minecraftemitter_rate_instant?view=minecraft-bedrock-stable), and [Mojang particle integration reference](https://mojang.github.io/bedrock-samples/Particles.html). The documentation describes the component model. The matching executable establishes the calculations and limits above.

## Initial particle runtime

Connect timeline and controller particle declarations to actor aliases and the world particle pass. Preserve source order, suppression cursors, repeat frames, and replay. Capture the bone player's own Molang state before later timelines run. Controller particles follow sampled child effects and precede state sounds.

Support instant and steady emission, a single emitter lifetime, point and custom offsets, initial velocity and spin, and dynamic or parametric motion. Support gradient tinting, flipbooks, rectangular billboards, world lighting, and `rotate_xyz` or `lookat_xyz` facing. Other components fail explicitly. Particle definitions and PNG or TGA textures use the effective library's pack order.

The motion and billboard kernels consume the target executable fixtures documented above. Production tests compare 200 motion cases and 492 billboard cases, including angular updates and raw direction thresholds. A changing-rate test preserves the native cached rate until an emission. The fixture's direction threshold is already squared. JSON supplies the threshold before squaring.

Decode resources off the render thread. Bound emitters, particles, pending requests, cached definitions, and image memory. Invalidate asynchronous work across world and account changes. Release completed textures and handle failed asset futures during cleanup.

The native component fixtures do not establish the complete emitter scheduler or visible particle parity. Attachment rotation, local-space transforms, native tint quantization, collision, curves, other shapes and facing modes, and nested effect events remain separate work. The production path needs no native executable or external particle decoder.

Particle atlas decoding uses the bounded PNG reader and the existing true-color TGA decoder. A test compares their decoded RGBA pixels and rejects truncated input. A muted Java runtime probe displays a 4:1 TGA billboard and verifies server aliases, world extraction, failed asset cleanup, and texture release. It also verifies explicit rejection of collision effects. Screenshots and fixture assets remain private. This probe does not establish native visible particle parity.

The replayed 14-patch stack builds and produces the Prism bundle. All 261 fixture-enabled add-on tests pass with no failures or skips. This count covers implemented paths and does not establish complete skin, effect, or Dressing Room parity.

## Apply particle collision response

Apply collision after particle motion. Target functions `1461c7460` and `1461c80a0` establish the swept bounds and axis response. Checked motion retains only its last block. Terrain cells use ascending X and Z, with descending Y. The first pass collects boxes; subsequent passes reuse them.

Preserve strict broadphase overlap, parallel slab handling, Z/Y/X entry tie priority, and the target contact bias. Use up to three response passes. Reflect the contacted velocity axis through restitution and reduce speed along the surface through collision drag. Contact expiration removes the particle. The native reader clamps radius to zero through half a block. Its runtime constructor initializes radius, drag, and restitution to zero. Missing `enabled` selects true.

Private independent execution of Bedrock 1.26.51.1 supplies 364 cases. Production matches position, velocity, and ordered terrain queries exactly as float32. Cases include both directions, all axes, corners, radius boundaries, long motion, drag, restitution, disabled collision, translated origins, and expiration. Emitter tests verify contact removal and subsequent bounce motion through production updates.

The harness supplies world collision boxes, emitter accessors, and the imported floor operation. Native collection, sweep, response, drag, and expiration code execute. World playback queries block collision shapes and uses existing native custom-block overrides. A bounded cell cache lasts one extraction frame. Native shape ordering and visible collision parity remain unverified. Collision events still require the nested event runtime. Executables, licensed assets, and native reference fixtures stay private.

The replayed full stack passes all 264 fixture-enabled add-on tests with no failures or skips, including fresh package acquisition and cache reuse.

A muted Java runtime probe uses the rebuilt bundle and a temporary client-side stone platform. It verifies world terrain collision, rebound velocity, contact expiration, and texture release. This probe establishes Java integration and does not compare native visible effects.

## Complete emitter shapes

Add box, sphere, disc, and entity-bounds shapes through one sampler. Generalize point and custom sampling to preserve their interleaved expression order. Box and entity surfaces select faces by area. Rounded shapes use paired random values, disc projection, and the target volume radius calculation. Preserve rounded custom direction magnitudes at the shape boundary. Initial speed then normalizes directions before applying scalar speed. Its scalar expression evaluates separately for each axis. Vector speed overrides the sampled direction.

Target Bedrock 1.26.51.1 functions `1462a6be0`, `1462ad0e0`, `1462aa600`, `1462ab2c0`, and `1462a81f0` establish these behaviors. Constructors select outward direction by default for volume and entity shapes. Independent native execution supplies 646 cases. Production matches every position, direction, and ordered random call exactly as float32. The harness supplies random and entity-bounds accessors; actual native sampling, normalization, projection, and face selection execute.

Timeline and controller particle requests retain an actor attachment accessor. World extraction passes current actor bounds to attached emissions. Unbound emitters retain their fixed origin without actor bounds. Tests verify changing dimensions between births, expression order, and scalar versus vector speed. Licensed assets, executables, and native fixtures stay private. Local-space transforms and native visible parity remain separate work.

Sources: Microsoft's [box reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponents/minecraftemitter_shape_box?view=minecraft-bedrock-stable), [sphere reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponents/minecraftemitter_shape_sphere?view=minecraft-bedrock-stable), [disc reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponents/minecraftemitter_disc?view=minecraft-bedrock-stable), and [entity-bounds reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponents/minecraftemitter_shape_entity-aabb?view=minecraft-bedrock-stable). The matching executable establishes the target calculations.

The replayed full stack passes all 269 fixture-enabled add-on tests with no failures or skips. This includes fresh standalone package acquisition, license decryption, extraction, and cache reuse.

Native initial-speed function `1461c2690` supplies 128 additional reference cases. Production matches every velocity exactly as float32, including tiny directions and signed zeros. Tests also verify scalar expression side effects across all three axis evaluations.

The full stack build and bundle pass. A muted Java runtime probe verifies all four new shapes through server aliases and world extraction. It checks 64 sampled particles, live actor bounds, and texture release. A private screenshot confirms visible world rendering. Native visible parity remains unverified.

## Emitter lifetime scheduling

Generalize the emitter clock to once, looping, and expression lifetimes. Preserve nanosecond ages and the target float conversion for active and sleep durations. Expression emitters retain the constructor's 1,000,000-second active duration. Missing `active_time` defaults to zero in once and looping components, as the target schema and readers specify. An inactive expression suppresses emission; expiration permanently stops new births. Existing particles continue until their own expiration.

Target Bedrock 1.26.51.1 `142158a40` evaluates activation before per-update expressions. It then checks cycle reset and expression expiration. The initial update can emit even when it expires during that update. Later expired updates cannot emit. A cycle reset reevaluates durations, resets capacity and the emitted counter, refreshes emitter random variables, and runs creation expressions. It preserves existing particles and the steady rate remainder. It discards age overshoot and resets at most once per update. Molang retains the age and lifetime sampled before reset until the next update. Repeating cycles require an actor context. Expression lifetimes can accompany either duration component, as the official reverse portal definition demonstrates. Native repeat permissions combine across lifetime components, so an expression component can permit a once duration to reset repeatedly.

The native constructor `14216c59b` supplies the default duration. Duration setters, lifetime components, cycle reset `142157210`, and the emission gate establish these rules. The target retains deltas below 101 milliseconds; larger deltas become 100 milliseconds. Production uses the same elapsed interval for its emitter and particle updates. An instant rate retries when capacity prevented every requested birth, because the native counter tracks actual births.

Private independent execution supplies 52 schedules and 416 updates. Production matches birth counts, creation counts, Molang ages, and expiration state. The schedules cover both automatic rates, all three lifetimes, actor presence, zero duration, exact boundaries, sleep, expiration on the initial update, combined expression and duration lifetimes, and large frame deltas. Focused tests also cover expression evaluation order, changed loop times, retained pre-reset context, actor removal, and particle drainage.

The harness executes actual native scheduling, activation, expiration, duration setters, rate components, capacity setters, and cycle reset. It supplies weak resource and actor handles, actor-query refresh, expression callbacks, and birth allocation. It skips random generation and variable registration inside reset. It stops before physics, acknowledges the initial-update flag, and clears the particle population between updates. These checks do not prove native particle aging order, visible timing, local-space transforms, or nested event playback. Licensed assets, executables, exports, and fixtures remain private.

Sources: Microsoft's [expression lifetime reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponents/minecraftemitter_lifetime_expression?view=minecraft-bedrock-stable) and [Mojang particle reference](https://mojang.github.io/bedrock-samples/Particles.html). The matching executable establishes the target scheduling behavior.

### Lifetime verification

All 274 fixture-enabled add-on tests pass with no failures or skips. The full dependency build and bundle pass. A muted Java 26.3 probe resolves both emitter types through server player aliases and world extraction. It verifies repeated loop creation, expression deactivation and reactivation, expiration drainage, and resource release.

The existing local server advertises protocol 2169. The runtime probe uses its Java 1.21.11 proxy route. This verifies Java world integration; it does not verify a direct protocol 2193 join or native visible parity. The independent lifetime fixtures use target Bedrock 1.26.51.1.

### Particle birth and aging order

Bedrock 1.26.51.1 emits before updating its particle population. Newborns receive motion in the same frame. Capacity freed during removal becomes available on the next update. Update expressions and motion read the previous particle age. Render expressions read the advanced age, clamped to the lifetime. Lifetime expiration checks the previous age after motion. A particle therefore survives the update that reaches its lifetime.

Use integer nanosecond clocks and the target float-to-nanosecond conversion. Keep `per_update_expression` separate from `per_render_expression`. Remove expired particles by swapping the final particle into their slot, then process that particle before advancing the index. This preserves native population order and avoids delaying a swapped particle until the next frame.

Independent execution of `142158a40` with the actual dynamic motion kernel `1461c9ce0` supplies 40 schedules and 360 updates. Cases cover instant and steady emission, capacity limits, zero and short lifetimes, exact boundaries, overshoot, zero deltas, and expression expiration. Production matches births, callback order, population order, positions, and post-update ages. The probe supplies resource and actor accessors, query refresh, birth allocation, initial position and velocity, and callback bodies. Reset random registration, collision, and render interpolation remain outside these fixtures. Binaries and execution harnesses stay private.

Another 40 native context cases verify lifetime and age variables, including negative values and overshoot. The target query-refresh routine executes with supplied variable lookup and write boundaries. These cases establish the age clamp used by update and render expressions.

Source: [Microsoft particle lifetime reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponents/minecraftparticle_lifetime_expression?view=minecraft-bedrock-stable). The target execution establishes update ordering beyond that reference.

All 276 fixture-enabled add-on tests pass with no failures or skips. The full dependency build and bundle pass. A muted Java 26.3 world probe verifies update and render callbacks, nanosecond clocks, motion, loop creation, activation, expiration drainage, and resource release. It uses the existing older-protocol server through the Java proxy route. Direct protocol 2193 joins and native visible comparisons remain unverified.

## Attached particle transforms

Replace live position-only origins with actor and locator matrices. Attached emitters start at zero. Unbound emitters retain the original world position without actor bounds. Parse `minecraft:emitter_local_space` and preserve its position, rotation, and velocity flags.

Bedrock 1.26.51.1 `14215b3c0` retains the full locator matrix when position lookup succeeds. Its fallback uses `1419f7910` for actor translation and yaw. Disabled yaw retains the native 180-degree baseline. A found locator retains rotation and scale even when the rotation flag is false.

Birth function `14215a440` transforms position, velocity, and facing before particle initialization. It adds cached emitter velocity afterward. Main update `142158a40` calculates the next cached velocity after births. The first displacement is zero. Actor loss clears local-position particles while world-space particles drain. Render function `14215cc90` multiplies the attachment and original emitter matrices before transforming particle positions.

Independent native execution supplies 192 actor matrix cases, 60 birth cases, 192 emitter updates, and 180 render position cases. Production matches the captured float32 results and initialization observations. The probes execute the target instructions with supplied actor accessors, locator matrices, callback bodies, and imported float math. The render probe supplies interpolation factors and current/previous particle fields.

World playback samples interpolated actor position and body yaw. Posed bone matrices supply locator rotation and scale; translations convert from pixels. Each attachment owns its matrix snapshot. Geometry tests verify rotated bone axes, inherited scale, scale discard, and world translation.

Native authored rotation decoding, registry-only actor lookup, world locator construction, GPU billboard orientation, and visible native scale remain unverified. Production still needs native render interpolation comparisons. These checks do not establish complete particle or skin parity. Executables, probes, assets, screenshots, and fixtures remain private.

### Attachment verification

All 281 fixture-enabled add-on tests pass with no failures or skips. Fresh standalone package acquisition, license decryption, extraction, and cache reuse pass. The full dependency build and bundle pass.

A muted Java 26.3 world probe verifies the actor adapter and immutable matrix snapshots. World-space births stay fixed while local-position particles follow a moving locator. Unbound particles retain their original position. Actor loss clears local-position particles; world-space particles drain through their lifetime. Update and render callbacks execute, and cleanup releases textures.

The same probe compares 49 matrix products against independent execution of native function `140544f00`. Every float32 output matches exactly. These products use supplied matrices. They do not establish native locator construction or visible scale parity.

The world probe uses the existing protocol 2169 server through its Java proxy route. Direct protocol 2193 joins and native visible comparisons remain unverified.

### Complete native texture projection

The saved official Bedrock 1.26.51.1 Hive stack references built-in bread, bucket and potion images. Extend the licensed package projection from appearance and particle images to every native texture image and texture archive. Preserve path case and all versioned overlays. Cache schema 6 rejects the previous projection and requires a native item image library before atomic publication.

The native helper has four passing unit tests. Its two licensed package probes remain private and were not run for this change. Cache tests cover previous schemas and incomplete image refreshes. The matching package must be acquired again before the Java renderer can use the added images.

The complete matching texture projection measures 4,044 raw files and 149,413,613 bytes, expanding to 18,173 logical files and 211,829,122 bytes. Keep separate 256 MiB limits for raw input and logical output. Archive bytes must not be counted twice. Retain the 8,192-file input limit and bound expanded content at 32,768 files, including the cache readback path. The 32 MiB per-file limit remains in place.

Targeted Java validation passes: 20 tests pass with no failures or errors; two private licensed acquisition probes are skipped. Small synthetic archives exercise both byte budgets, shared offsets, cache roundtrip above the raw file limit, and the 32,768-file boundary. Main and test compilation pass. This add-on does not configure a Checkstyle task.

## Locator rotation and scale suppression

Modern geometry locators now retain authored rotation and compose it after the animated bone transform. Legacy document locators retain their existing offset behavior. Both forms preserve the scaled attachment position when `ignore_inherited_scale` is enabled. The renderer previously removed bone scale before translation, which moved the attachment point incorrectly.

Bedrock 1.26.51.1 locator update `141c362e0` composes translation and locator rotation before calling final matrix setter `142088320`. That setter normalizes the final direction axes when scale suppression is enabled. It preserves the matrix translation. Rotation uses stored radians and a Z-Y-X quaternion composition.

Independent execution supplies 144 cases with axis rotations, combined rotations, reflected and nonuniform scale, shear, and several offsets. Production matches the final matrix within 0.000005. The probe supplies resolved bone matrices, preprocessed locator offsets, stored radians, actor translation, and unit conversion. Actual composition, quaternion math, matrix multiplication, and final scale suppression execute. Imported float sine and cosine are supplied.

Tests also check modern rotation decoding, legacy behavior, and posed model integration. Native geometry parsing, bone hierarchy, actor transforms, and visible comparisons remain outside these fixtures. Licensed assets, executables, and execution fixtures stay private.

Sources: [Microsoft geometry reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/visualreference/geometry.v1.21.0?view=minecraft-bedrock-stable) and [Blockbench locator import and export](https://github.com/JannisX11/blockbench/blob/master/js/formats/bedrock/bedrock.js). The matching executable establishes transform order and scale suppression.

After integrating current main, all 289 fixture-enabled add-on tests pass with no failures or skips. This includes fresh standalone package acquisition, license decryption, extraction, and cache reuse with the expanded texture projection. The full dependency build and bundle pass after replaying all 15 add-on patches. The locator tests exercise the production posed model and metadata reader. They do not establish native visible parity.

## Particle render curves

Support all four documented curve types: linear, Bezier, Catmull-Rom, and Bezier chains. [Microsoft's curve reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecurves) describes their definitions and render variables. The Bedrock 1.26.51.1 parser and evaluators establish the target behavior.

Evaluate curves before each particle's render expressions. Preserve independent variables, dynamic nodes, curve dependencies, and native node evaluation order. Empty chains leave registered values unchanged. Clamp horizontal ranges to float epsilon. Chain control offsets divide slopes by three without scaling by segment duration. Preserve the native grouping of float multiplications and additions near boundaries.

Independent execution supplies 196 evaluator cases and 90 range and variable publication cases. Production matches every result exactly. The harness supplies constant Molang nodes, parsed chain segments, imported floor, and variable lookup/write boundaries. Parsing, variable registration, render scheduling, and visible comparisons remain outside these fixtures.

Four additional executions record native Molang node access. Linear reads the right node before the left. Bezier reads all four from last to first, including a clamped input. Catmull-Rom reads its four segment nodes in order. The Java evaluator preserves these orders for expressions with side effects.

Five targeted tests cover native comparisons, particle state isolation, render callback order, dynamic ranges, expression dependencies, and malformed definitions. These tests exercise the emitter's visual output, but do not establish native visible parity. Raw binaries, decompilation, fixtures, and probes remain private.

All 321 fixture-enabled add-on tests pass with no failures, errors, or skips after replaying all 16 patches. Fresh licensed-package extraction and cache reuse also pass. The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts.

## Manual particles and nested particle events

Support manual emission and particle creation, expiration, and timeline events. Resolve named event trees with ordered sequences and weighted random branches. Child effects support `particle`, `particle_with_velocity`, `emitter`, and `emitter_bound`. The [Creator event reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particleeffectevents) describes these forms. The [particle lifetime reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponents/minecraftparticle_lifetime_events) defines their triggers.

The Bedrock 1.26.51.1 particle component registration points to creation callback `FUN_1461c4e40`, expiration callback `FUN_1461c4f20`, and timeline callback `FUN_1461c5000`. Emitter events use separate callbacks, described below. Timeline intervals include the previous age and exclude the new age. Event times retain the native float conversion to nanoseconds.

Native graph dispatcher `FUN_142164cb0` chooses its random branch before it executes the sequence. It executes that branch after the sequence. Both inspected constructors omit leaf actions when a node contains `sequence` or `randomize`. Preserve those rules for JSON assets and decoded compiled assets.

Manual emission creates one particle immediately. Capacity getter `FUN_1462a4d10` evaluates the maximum on each request and caps it at 2,000. Preserve its unsigned conversion before the cap. Birth routine `FUN_14215a440` adds the supplied position and velocity to the shape sample before birth transforms and initialization.

Playback reuses manual child emitters by effect within each parent. Ordinary child emitters start at the event position. Bound child emitters inherit the parent's actor and locator supplier. When the actor is already absent, they start at the event position. Child effects own fresh Molang variables. Their initialization script runs after emitter creation. Particle events retain a copy of the source position and the requested velocity through asynchronous asset loading.

Dispatch children after the active emitter iterator closes. Apply existing world and account generation checks to pending loads. Limit active emitters to 512 and total particles to 16,384. Limit each emitter to 1,024 event nodes per update and child nesting to 16 levels. Bound pending loads, event requests, and diagnostic logs.

Private native execution covers 30 timeline cases, 16 event trees, and 15 manual capacity conversions. Native callbacks supply position, velocity, random draws, and expression execution. These probes do not execute asset lookup, JSON construction, or complete simulation scheduling. All private binaries and probes remain outside the patch.

Tests also cover immediate births, changing capacity, velocity inheritance, lifetime triggers, recursive limits, and the extracted lava-to-smoke flow. The target lava effect now emits manual smoke particles through its timed `particle_with_velocity` events.

Level sound events remain explicit unsupported cases. Native comparisons still need to establish bound child queries, event expression context, asynchronous timing, and visible particle results. This change does not establish complete particle parity.

All 328 fixture-enabled add-on tests pass with no failures, errors, or skips after replaying all 16 patches. Fresh licensed-package extraction and cache reuse also pass.

The final actor-fallback change passes all 45 particle tests. The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts.

After integrating concurrent actor-material and lighting changes, all 334 fixture-enabled add-on tests pass with no failures, errors, or skips. The combined stack replays all 16 patches. The full dependency build and Prism bundle also pass.

## Dispatch collision events and filter splash particles by blocks

The extracted water-drip definition declares three collision events that spawn manual rain-splash particles. Its splash definition requires `minecraft:particle_expire_if_not_in_blocks`. Support that component and `minecraft:particle_expire_if_in_blocks` so both definitions enter production playback.

Native collision routine `FUN_1461c7460` dispatches once after its response passes. Thresholds use the incoming velocity projected onto the final contact normal. Contacts require a positive particle lifetime. Dispatch precedes contact expiration. Parser `FUN_1461c6e00` accepts a single trigger or an array and clamps `min_speed` to the native minimum of two.

Preserve the native contact frame without normalizing its tangent vectors. Native getter `FUN_142167190` supplies event coordinates from particle and emitter fields. Those coordinates can differ from render positions. Retain the frame through asynchronous child requests and fixed child construction.

Native block predicate `FUN_1461c3580` disables empty lists. It floors float32 particle coordinates plus the emitter origin. It compares membership with the component's inclusion flag. The emitter shares the first initialized block set between its expiration predicates. Getter `FUN_1421633b0` returns the base origin. Membership routine `FUN_142163290` compares block identities from the block source.

Production obtains original block identifiers from ViaBedrock's tracked primary palette and block-state rewriter. It does not infer identifiers from translated Java blocks. Effects with nonempty filters require explicit world access. Unknown identifiers count as nonmatches. Predicate evaluation follows motion and lifetime events, as inspected in `FUN_142158a40`.

Private native execution supplies 74 collision event cases, 16 coordinate cases, and 64 block expiration cases. The collision probe supplies an identity event-frame template, terrain, and source callbacks. It does not execute global startup initialization or child playback. The block probe executes the predicate, origin getter, cache flag, and membership lookup. It supplies a prepared block set and block-source identities. Native name resolution and complete scheduling remain outside those cases.

A production test loads the extracted water-drip and rain-splash definitions. It follows the authored hanging period, emits three impact requests, and advances their splash particles to expiration. Additional tests cover thresholds, dispatch order, event frames, block boundaries, empty filters, and expiration events. These checks do not establish native visible particle parity. Native assets, binaries, and research fixtures remain private.

After replaying all 16 patches, all 343 fixture-enabled add-on tests pass with no failures, errors, or skips.

The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts. The final block-filter tests also pass against the updated native fixtures.

## Play emitter lifecycle and travel events

Support the five fields in the [emitter lifetime events reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponents/minecraftemitter_lifetime_events?view=minecraft-bedrock-stable). Dispatch their named events through the existing bounded event graph and child asset loader.

Bedrock 1.26.51.1 uses `FUN_1462a3690` for creation, `FUN_1462a3710` for expiration, `FUN_1462a3790` for timelines, and `FUN_1462a3870` for travel. The emitter update calls creation once on its first update, after births and origin sampling. Lifetime loop resets do not repeat that event. Expiration runs once before the next origin sample; existing particles can continue draining. Actor loss dispatches expiration before activation and update expressions. Cycle expiration precedes its creation expression.

Timeline events run only during active updates of a live emitter. Their interval includes the previous age and excludes the current age after any loop reset. Event requests retain the emitter's cached world position and velocity. Those caches begin at zero, as inspected in constructor `FUN_14216ba90`.

Travel accumulates float32 displacement after the first update. Loop resets preserve that distance. Direct thresholds use the same half-open interval as timelines. Each repeating declaration fires once per update when its floor quotient changes, even when movement crosses several intervals. Preserve native integer conversion for zero, negative, and very small intervals.

Parser `FUN_1462a15d0` retains JSON member enumeration order for timeline and direct distance maps. Enumerator `FUN_14e01ece0` walks the native tree in order. Production uses lexical key order, consistent with [JsonCpp's key comparator and member enumerator](https://github.com/open-source-parsers/jsoncpp/blob/master/src/lib_json/json_value.cpp). This ordering follows source and decompilation inspection; the schedule probes supply prepared vectors rather than execute JSON parsing. Array declarations preserve authored order. Limit each map or array to 256 entries and reject nonfinite or excessive distances.

Independent execution supplies 52 schedules, 364 native updates, and 288 distance predicate cases. The schedule probe executes the native update, event callbacks, cached origin and velocity, expiry, and reset. It supplies actor, resource, and query accessors, translation matrices, expression callbacks, and named-event receipts. Automatic births are disabled, and reset random registration is skipped. These cases do not establish child scheduling, complete Molang context, asset lookup, or visible parity. Binaries, assets, probes, and fixtures remain private.

Production tests compare event order, source coordinates, inherited velocity, and expiration state against those native results. Additional checks cover malformed definitions, map order, expiration before loop initialization, and particle drainage.

All 347 fixture-enabled add-on tests pass after replaying the 16 patches, with no failures, errors, or skips. This includes 58 particle tests, fresh licensed-package extraction, and cache reuse.

The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts.

## Play particle level sound events

Resolve `sound_effect.event_name` as a level sound event, as the [Creator reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particleeffectevents?view=minecraft-bedrock-stable) specifies. Particle events pass no block or entity selector. Use `individual_event_sounds` from root `sounds.json`, then resolve the configured catalog sample. Acquire this root file with the official package assets and refresh caches through format seven.

Native dispatcher `FUN_142164cb0` dispatches particles, sound, expression, and log in that order. Unknown event value 614 suppresses only sound. Sound requests retain the event matrix translation, data -1, an empty actor identifier, and baby false. Independent execution supplies 56 prepared leaf cases. Level and Dimension accessors, expression and log boundaries, and sound receipts are supplied. These cases do not execute enum name lookup or audio output.

Native name resolver `FUN_143454f70` uses ASCII lowercase conversion from `FUN_1403201d0`. Production gets accepted names from ViaBedrock's pinned protocol 2193 mappings, including null Java mappings. This establishes the target data source, not independent native verification of every name or numeric value.

Read group defaults and per-event ranges through the inspected generic configuration path. `FUN_1441d0e40` initializes both group ranges to -1. `FUN_1441c9ac0` retains those ranges for string configurations and overrides them for object configurations. `FUN_140acfee0` accepts numbers, booleans, arrays, min/max objects, and numeric strings. Arrays use their first two values, sorting reversed endpoints. Objects clamp max to min. Unsupported scalar conversions produce zero; null fields retain their incoming defaults. Protect production with finite parameter, string, and catalog limits.

Independent execution of the full range reader supplies 34 numeric, boolean, object, and array cases. JSON member/index lookup and string-copy boundaries are supplied. Stringstream parsing follows inspected code and remains outside these execution fixtures. Production rejects malformed range strings rather than reproducing arbitrary failed stream state.

Native scalar samplers `FUN_1441b2ed0` and `FUN_1441b2f80` use two unsigned random draws for varying ranges. Their triangular float32 calculation preserves draw order and skips constant or reversed ranges. The level dispatcher samples pitch before volume. Independent execution supplies 70 sampling cases with supplied random integers. Another nine cases execute the command volume clamp and playback gate in `FUN_1441bf810`. Clamp volume to one before catalog sample multiplication. Suppress requests whose command volume is zero, including absent inherited volume.

Use the existing bounded decoder and shared PCM player for resolved samples. Fresh licensed extraction supplies 6,117 files, including all root sound configurations. An integration test resolves water dripstone, lava dripstone, and honey drip sounds through the official overlays and decodes their PCM. Server root configuration retention belongs to the server effect library patch.

These checks do not establish seeded random generation, native audible mixing, captions, native server comparisons, or a complete level-event context resolver. Executables, licensed assets, probes, and fixtures remain private.

All 365 fixture-enabled add-on tests pass with no failures, errors, or skips across 72 suites. The final particle sound and server override checks also pass after folding server configuration retention into its owning patch. All 16 patches replay. Fresh license acquisition, package extraction, and cache reuse pass with the bundled helper.

The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts.

## Render every particle facing mode

Support all eleven modes in the [billboard reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_appearance_billboard?view=minecraft-bedrock-stable). Use explicit columns for camera, direction, and emitter planes. A quaternion cannot preserve the target's reflected or sheared axes.

The owned Bedrock 1.26.51.1 name table in `FUN_142160da0` maps the modes to values 1 through 11. Its CPU quad builder in `FUN_142167710` consumes prepared particle records. The package shaders receive finished vertices. The native renderer independently normalizes emitter columns before the XZ and YZ quarter turns. World directions retain the full matrix product before normalization. Zero-length emitter columns produce nonfinite axes; production suppresses those quads before Java vertex submission.

Independent native instruction execution supplies 286 facing cases, 32 emitter basis cases, and 144 world direction cases. The facing probes execute all eleven branches and `FUN_14216add0`, the camera look-at helper. They cover vertical direction boundaries, coincident cameras, zero directions, scaled locators, shear, and reflection.

Another 440 cases execute the native spin matrix multiplication after each facing branch. Imported float32 `cosf` and `sinf` results are supplied at the math boundaries. Production applies spin to the explicit axes and computes frustum bounds from their corner extents. Tests also verify frame snapshots and sheared corner bounds.

These prepared probes supply inverse-view columns, particle state, normalized directions, emitter axes, and the runtime identity constant. They exclude camera selection, complete frame interpolation, vertex submission, and native visible output. Licensed package shaders, executables, licenses, account data, and native fixtures remain private. Production requires no external game installation or native research tool.

All 371 tests pass across 73 suites with no failures, errors, or skips. This includes fresh package license acquisition, extraction, and cache reuse. All 16 patches replay. The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts.

## Preserve the native child emitter frame

The [particle event reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particleeffectevents?view=minecraft-bedrock-stable) distinguishes ordinary emitters, actor-bound emitters, and manual particles. Native factory `FUN_1421667d0` preserves the ordinary event matrix. Actor-bound factory `FUN_142166990` constructs an emitter at identity through `FUN_142130e20`, then binds the actor and locator through `FUN_142160260` and `FUN_14215ffc0`.

The setter stores the supplied offset in binding metadata. It does not replace the constructor's base origin or matrix. The actor-bound child therefore uses its sampled actor/locator frame without an additional collision rotation. Production previously retained the collision axes after removing translation. Use identity for bound children and manual emitters. Preserve the complete event frame for ordinary emitters and unbound fallbacks.

Independent native execution supplies 24 factory cases with ordinary and bound effects, different event matrices, valid and invalid handles, and present or absent weak actor references. The probe records constructor matrices and binding writes. Resource lookup, allocation/constructor, initialized identity and zero constants, binding liveness, string copying, and context cleanup are supplied. These cases do not execute event branch selection, actor query evaluation, asynchronous child scheduling, or native visible output.

Production tests compare the constructor transforms and resulting particle placement. A regression also checks a bound child on a scaled locator, the unbound contact-frame fallback, and manual emission coordinates. Native binding metadata and complete child expression context still need runtime comparisons. Executables, assets, probes, and fixtures remain private.

Another 12 cases execute the full native leaf dispatcher for ordinary requests and bound requests without an actor. Both retain the event matrix. Valid child handles run the child initialization callback before the source expression; invalid handles skip child initialization and retain the source expression. The probe supplies binding liveness and expression callbacks. Actor-present branch selection, actual Molang evaluation, and scheduling remain outside these receipts.

All 373 fixture-enabled tests pass across 73 suites with no failures, errors, or skips. Fresh package license acquisition, extraction, and cache reuse pass. All 16 patches replay. The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts.

## Refresh particle actor queries

Attached effects now use the player's sampled actor query bindings. Sample those bindings before the emote pose branch, so emotes retain water and motion queries. Water and motion callbacks read the current entity. Each emitter and particle retains its own Molang variables. Query refresh does not copy the parent's variables or animation clocks.

Refresh queries before child initialization, before each update, and before render expressions. Existing particles receive the same refreshed map. Camera distance uses the cached previous emitter position. Generic particle `anim_time`, `delta_time`, `frame_alpha`, and `life_time` retain the target context's zero defaults. Emitter and particle ages remain separate lifetime variables.

Native initialization gate `FUN_1421603e0` refreshes context through `FUN_142159bd0` before the child script callback. The actor pointer supplies actor queries. Native `ground_speed` callback `FUN_14220ecd0` scales all three motion components by 20, including vertical motion. Its assembly sums `z*z + (y*y + x*x)` before the float32 square root. Preserve that order to avoid a one-bit rounding difference from the decompiler's grouping.

Independent native execution supplies 54 prepared context cases. These cover absent actors, resolved actors, unresolved bindings, water membership, camera positions, and lifetime values. Seven scalar query callbacks execute against those contexts. Actor resolution, level access, variable access, expression callbacks, and motion component lookup are supplied boundaries. Native velocity scaling and length execute after the supplied component lookup.

Production tests compare all seven query values exactly as float32. Additional tests refresh existing particles, retain their local variables, and preserve parameterized actor queries. They also verify immutable binding maps and context removal. These cases exclude live actor updates, full query coverage, asynchronous scheduling, and native visible output. Spell-color structures, effect-count queries, and complete offscreen actor context remain incomplete. Executables, assets, probes, and fixtures remain private.

All 376 fixture-enabled tests pass across 74 suites with no failures, errors, or skips. This includes all 73 particle tests. Fresh license acquisition, extraction, and cache reuse pass. All 16 patches replay.

The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts.

## Preserve child binding offsets

The actor-present branch in native leaf dispatcher `FUN_142164cb0` passes the parent's base origin to `FUN_142166990`. The bound factory constructs at identity and writes that origin as binding metadata. The actor fallback branch in `FUN_14215b3c0` adds this offset to translation. A resolved locator supplies its complete matrix and ignores the offset.

Production now retains the offset separately from the actor and locator matrices. Each child replaces the offset with its parent's base origin. Nested children therefore do not accumulate ancestor offsets. The copied attachment retains the same bounds and query bindings. Root attachment matrices keep their existing behavior.

Independent execution supplies 48 combined native cases. The full leaf dispatcher, factory wrappers, binding setter, initialization gate, and context refresh execute. Resolved actors reach the initialization callback with the child actor context before the source expression. Ordinary requests and requests without bindings use the event frame. Invalid handles retain the source expression without child initialization.

Removed actors and missing actor components follow a separate registry path. They use the parent's base origin for construction, retain its previous binding metadata, and suppress child initialization. The adapter described below now covers this registry path. Native live lifecycle comparisons remain outstanding.

The probe supplies resource lookup, constructor allocation and fields, binding getters, weak registry resolution, level access, variable access, expression callbacks, and string copying. Actor component lookup executes against prepared ECS tables. Actual Molang evaluation, asynchronous loading, complete emitter updates, and visible native playback remain outside these cases.

The 192 native matrix comparisons now exercise the production binding offset adapter directly. Earlier tests added the offset before constructing the attachment. A new child/grandchild regression verifies offset replacement, actor fallback placement, rotation-only matrices, and scaled locator behavior. Native executables, assets, probes, and fixtures remain private.

All 377 fixture-enabled tests pass across 74 suites with no failures, errors, or skips. This includes all 74 particle tests. Fresh license acquisition, extraction, and cache reuse pass. All 16 patches replay.

The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts.

## Retain particle registry components after actor loss

Separate registry binding presence from actor query validity. Native transform helper `FUN_14215b3c0` resolves locators and position/yaw components without an actor object. Its fallback interpolates float32 positions and wrapped yaw, with a different rotation convention from the actor-object helper. It ignores the binding offset. A resolved locator supplies its complete matrix.

Java now samples retained render components when its avatar disappears but the original network actor remains tracked. The network owner identity invalidates removed or replaced actors. The same attachment supplier continues to provide matrices without actor queries or actor bounds. World changes still invalidate the supplier and pending asset work.

Registry-only bound children construct at the parent's base origin and retain its previous binding offset and locator. A missing actor context suppresses child initialization. The source event expression still runs. The combined 48 native dispatcher/context cases now compare these child frames and initialization gates through production code. Invalid asset handles remain outside the Java emitter comparison.

Native emitter update `FUN_142158a40` expires an invalid context before activation and update expressions. Its first-update flag still permits births. Local-position particles remain hidden through render gate `FUN_14215cc90`. Later invalid updates clear their population. World-space particles drain normally. Context recovery does not revive an expired emitter, but it can reveal retained local particles before the next invalid update.

Independent execution supplies 384 complete registry matrix cases. It executes registry handle validation, component lookup, locator caching and matrix copying, yaw wrapping, and position interpolation. Imported float32 sine, cosine, remainder, and byte comparison are supplied. Binding getters and weak registry resolution are supplied. Prepared component tables and initial identity outputs limit these checks.

Another 12 schedules supply 36 native updates. They cover initially missing contexts, actor loss after an update, and context recovery. The native update, expiry flag, first births, age advancement, and population removal execute. Resource/binding getters, query validity, identity transforms, particle allocation and initial values, and creation/update expression receipts are supplied. Motion components are disabled. Eight render-entry cases execute the enabled/context/local-position gate, then stop before resource and frame work.

Production tests compare all 384 matrices exactly as float32. They also compare schedule populations, enabled render gates, initialization suppression, and retained child offsets. The existing query-retention regression now uses world-space particles, because native local-position rendering stops after actor loss. Network state tests cover owner removal and replacement identities.

Live retained-component lifetime, registry locator construction, missing position components, unavailable actor bounds, complete query coverage, asynchronous child dispatch, and native visible output still need comparisons. These checks do not establish complete particle or skin parity. Executables, assets, probes, and fixtures remain private.

All 380 fixture-enabled tests pass across 75 suites with no failures, errors, or skips. This includes all 77 particle tests and network owner replacement checks. Fresh license acquisition, extraction, and cache reuse pass. All 16 patches replay.

The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts.

## Dispatch child events before source expressions

The [particle event reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particleeffectevents?view=minecraft-bedrock-stable) places each pre-effect script in the child emitter's separate Molang context. The existing 48 native dispatcher/context cases establish initialization before the source expression. Invalid handles and invalid actor contexts skip initialization while the source expression still runs.

Preload reachable child definitions and textures before root playback. Discovery covers every parsed sequence and random branch, including zero-weight branches. Shared definitions load once per graph. Visited identifiers terminate cycles. Missing child handles settle discovery without suppressing the source expression. Existing resource, image, emitter, and recursion limits remain active.

Replace the emitter's deferred event queue with a direct dispatcher. Child construction, query refresh, initialization, and manual emission finish before the event leaf evaluates its source expression. Manual children reuse their existing emitter. Population checks refresh during births so inline children cannot exhaust the shared budget unnoticed.

Update a snapshot of existing emitters, then collect visuals from the current population. This avoids mutation during iteration and includes newly emitted manual children in the same render extraction. Newly constructed emitters receive their first update on the next frame. The prepared manager checks described below now cover update batch membership. Live frame timing remains unverified.

Production tests compare initialization/source order across all 48 native cases, including invalid handles and registry contexts. They evaluate the child Molang script and verify variable isolation. Additional tests cover pending/shared/cyclic dependencies, missing handles, discovery limits, parsed branches, and population contention during manual child births. Existing event tests now observe direct callbacks.

These tests use the previously recorded native receipts. They do not execute native asynchronous asset loading or establish cold-load start timing, new-emitter frame order, or visible native playback. The loaded Java graph removes asynchronous dispatch between the event leaf and its child initialization. Full particle and skin parity remains incomplete.


All 385 fixture-enabled tests pass across 77 suites with no failures, errors, or skips. This includes all 82 particle tests. Fresh package licensing, extraction, and cache reuse pass. All 16 patches replay. The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts.

## Preserve native emitter batch membership

Native manager `FUN_14216d250` removes dead emitters before building a temporary update batch. Each removal replaces the dead entry with the last registered entry. Its update loop captures the batch end before any emitter callback runs. Child emitters appended by those callbacks wait for a later batch.

Production previously removed emitters immediately after their update and preserved the remaining list order. Move removal before batch capture and use the native replacement order. Emitters that die during an update remain registered until the next batch. The render pass still includes newly emitted manual particles.

Independent instruction execution supplies 16 manager schedules with 80 frames. The complete manager function executes against prepared primary and temporary arrays. Native expiry getter `FUN_142158a20` checks the expiry flag and empty population. Native population getter `FUN_14215cc70` computes the count from the particle range. Native removal, batch construction, loop bounds, clock conversion, skip gate, and callback order execute.

The probe supplies platform counter/frequency, ambient grid samples, metrics access and cleanup, and emitter identity/update/destructor callbacks. The update callback appends prepared child records or changes the parent expiry flag and population range. It does not execute real emitter updates, factory construction, resource loading, Molang, or visible playback.

Production tests compare callback order, registered membership, population sizes, and update counts across all 80 frames. The fixture selects initialization and skip frames. The Java batch comparison does not establish the client mapping for those native gates or platform clocks. A real emitter regression verifies that an emitter that dies during its update remains registered until the next batch.

Cold-load start timing, live frame timing, retained component lifetime, complete query context, and native visible playback remain incomplete. Executables, assets, native probes, and fixtures remain private.


All 387 fixture-enabled tests pass across 78 suites with no failures, errors, or skips. This includes all 84 particle tests. Fresh package licensing, extraction, and cache reuse pass. All 16 patches replay. The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts.

## Publish particle counts at native batch boundaries

The [Molang query reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/molangreference/examples/molangconcepts/queryfunctions?view=minecraft-bedrock-stable) describes effect counts by particle type and total counts across the world. Native Bedrock 1.26.51.1 supplies the publication timing used here.

The registered callbacks are `14065a9e0`, `14065aa60`, `14065aae0`, and `14065ab60`. They dispatch through emitter slots `0x88`, `0x90`, `0x98`, and `0xa0`. The effect emitter reader uses the manager's live identifier map. The total emitter reader uses its registered vector size. The particle readers use the effect map and total published after the last completed update batch.

Register new emitters before child initialization. Remove dead emitters during pruning before the batch. Keep particle counts unchanged throughout updates. Sample each emitter's population immediately after its update, then publish all samples together. New children enter particle counts when they receive their own update. A later callback can add particles to an earlier emitter without changing that earlier sample.

The constructor initializes the query context's emitter owner to zero before the first restart. Initial creation expressions therefore see zero counts. A refreshed owner supplies live counts during later loop restarts. Preserve these bindings through query refreshes and particle copies. Matching definition identifiers share effect counts across resource libraries. Stop clears registration and published counts.

Independent execution supplies 84 prepared scalar cases and 672 callback calls. Cases cover missing contexts, matching and missing effect identifiers, inline and heap names, repeated reads after count changes, and unsigned 64-bit conversion to float32. Native callback dispatch, key lookup, cache reads, and conversion execute. Byte comparison is supplied.

Another probe executes four manager frames with 36 count receipts around updates, child initialization, manual births, removal, and publication. Native expiry/population getters, count readers, pruning, captured update batches, accumulation, and publication execute. Platform clocks, ambient grid access, map allocation/access helpers, cleanup, and emitter identity/update/destructor callbacks are supplied. Registration increments and prepared population changes come from supplied callbacks. These checks exclude real factory construction, emitter updates, Molang, and visible output.

Two prepared restart cases execute native component dispatch and read all four native count callbacks from the creation expression's context. Resource and actor access and the expression callback are supplied. Random variable registration is skipped; lifetime and rate vectors are empty. Prepared owner states follow the inspected constructor and refresh writes. These cases exclude full constructor execution and real expression evaluation.

Production tests compare native publication receipts through the shared batch implementation and real Molang bindings. Additional emitter tests cover zero counts on initial creation, bound loop restarts, child initialization, particle copies, refreshed queries, missing effect keys, and clearing counters.

Client frame gates, platform clocks, complete expression context, other world particle sources, and visible playback remain unverified. Full particle and skin parity remains incomplete. Executables, licenses, assets, probes, and fixtures stay private.


All 391 fixture-enabled tests pass across 79 suites with no failures, errors, or skips. This includes all 88 particle tests. Fresh package licensing, extraction, and cache reuse pass. All 16 patches replay.

The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts.

## Bind native spell-color structures

The [Mojang Molang reference](https://mojang.github.io/bedrock-samples/Molang.html) describes `query.spellcolor` as an RGBA structure. Its fields return zero when the query has no actor.

Native Bedrock 1.26.51.1 registers functor `14e7ff500`, whose callback is `14220f9d0`. It reads actor metadata slot 77 only when the entry has type Int (2). Those numbers match `DATA_SPELL_CASTING_COLOR` and `DataItemType.Int` in ViaBedrock's target protocol 2193. Channels come from packed ARGB bytes, converted through float32 division by 255. Missing actors, short metadata arrays, missing entries, and other entry types produce four zero channels.

Publish immutable colors after accepted network metadata updates. The query captures the original network actor identity and reads its current snapshot. Existing particles receive metadata changes without waiting for another actor render. Removal or replacement produces zero. Initial emitter creation also sees zero, because its context has no actor. Refreshed child contexts consume the live color.

Represent the result as a Molang object with `r`, `g`, `b`, and `a` fields. Nested query access, explicit calls, and variable copies preserve its channels. Particle tint expressions consume the same structure.

Independent execution supplies 1,504 scalar cases. These cover missing actors, array spans, missing entries, six metadata types, boundary colors, and every byte value in each channel. Native gates, byte selection, float32 division, and result type publication execute. The probe supplies metadata type getters, color structure construction receipts, and temporary value cleanup.

Another 60 cases execute the native initialization gate and full context refresh before reading the spell-color callback. They cover actor, unbound, and unresolved registry bindings. Prepared weak references, component tables, camera, and metadata arrays supply native input. Actor resolution, level/resource access, variable/expression callbacks, metadata type getters, and structure construction/cleanup are supplied boundaries.

Production tests compare all channel receipts through real Molang structure access and network snapshots. Further checks cover refreshed particle tint, first creation, child initialization, actor removal/replacement, and snapshot isolation.

These checks exclude native object property lookup, real native expressions, live network captures, tint quantization, and visible playback. Complete offscreen actor context and full skin/Dressing Room parity remain unverified. Executables, probes, fixtures, and account data stay private.


All 396 fixture-enabled tests pass across 80 suites with no failures, errors, or skips. This includes all 88 particle tests and the spell-color structure and network snapshot checks. Fresh package licensing, extraction, and cache reuse pass. All 16 patches replay.

The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts.


### Flatpak helper startup

A private native/Java comparison loaded the same account and identified its active Alex recipe in slot five. Native HTTPS and Java service responses have the same profile hash and persona collection. Preparing that recipe failed before extraction: Prism's Flatpak runtime lacks WebKitGTK, so the helper closes stdin during startup. The service avatar loaded, but that image does not verify local model rendering.

Flatpak now runs the bundled helper on the host through `flatpak-spawn --host --watch-bus`, with the client display preserved. The launcher must permit `org.freedesktop.Flatpak`; the host must provide WebKitGTK. Runtime checks reproduce denied access and confirm that permitted host execution reaches the helper protocol. Neither path reads an installed Bedrock game.

The process exchange drains output while delivering the request and parses bounded receipt lines throughout the stream. Startup failures receive a separate error. Raw helper output stays out of logs and UI. Five real child-process cases cover large diagnostics, simultaneous pipe traffic, missing receipts, failure receipts, and success before request delivery. A separate client JVM exit also stops its helper. Full visible parity and fresh interactive Store sign-in remain open.

The final run passes all 402 fixture-enabled tests across 81 suites, with zero failures, errors, or skips. It includes fresh license acquisition, official package extraction, and cache reuse. All 16 patches replay.

The rebuilt private Flatpak client acquires the official package through the host bridge. It uses its previous helper Store session. Extraction creates the versioned cache and assembles the active model. A second live failure exposed an eight-digit-only skin-color check: native Alex uses six-digit RGB. Accept both native RGB and ARGB strings and preserve them in model storage and `SkinData`. The expanded roundtrip test covers both formats, animations, atlas storage, and return to classic selection.

Reloading the compiled color fix in the private JVM lets the production retry save and render the matched nine-piece slim Alex. The preview's saved profile hash matches the native HTTPS profile. Its geometry identifier proves that this recipe still uses Microsoft's GLTF body fallback. The non-default Skin catalog piece is unresolved; the extracted face is assembled locally. Idle videos and screenshots remain private. Cameras, poses, lighting, and animation phases differ, so this verifies the working acquisition/assembly/render path without proving visible parity. Native current skin-color wire formatting and fresh interactive Store sign-in remain open.


### Zero-price assets that require redemption

The native 1.26.51.1 Bases layout lists Brawny at zero price with `requiresRedeem`. The equipped recipe references its pack, but the account has no pack-specific receipt key. Published metadata confirms the product, persona content type, zero price, and pack identity. The production decoder reads its body and face tint maps with the account's existing receipt keys.

Separate zero-price asset eligibility from permission to equip an unclaimed offer. Keep published metadata checks and the account receipt requirement. Preparing a saved recipe submits no purchase or redemption transaction. A parameterized guard test covers both redemption states and retains the equipment restriction. Paid and mismatched published items remain excluded from shared-key loading.

The full run passes 403 tests across 81 suites without failures, errors, or skips. All 16 patches replay. The dependency build and Prism bundle pass. A restarted isolated Flatpak client prepares the same nine-piece slim Alex profile with local body and face geometry. The saved identifiers are `geometry.persona.body` and `geometry.persona.face`. Its 128 by 128 body texture matches all 16,384 texels in the previous service model, after accounting for atlas padding. The production preview renders the locally assembled body and animated face.

This verifies local assembly for that recipe. It does not establish visible parity across camera, pose, lighting, or animation phase. Accounts without receipt keys, unavailable remote assets, and the remaining Dressing Room and classic-format checks stay open. Captures, decoded assets, receipts, and probes stay private.


### Owned arm strip runtime comparison

The current catalog identifies the previously captured animated arm pack as The Chill Arm. The authenticated account owns it and has its specific receipt key. The live production loader decodes its 16-frame texture and 16 geometry variants. A private unsaved recipe combines both slim, medium arms with the active Alex's body and face. It assembles locally with ten arm cubes, a two-frame blinking face, and a separate 16-frame arm binding. The account's saved recipe remains unchanged.

A read-only render-thread probe observes all 16 frames and 140 sequential steps at about 7.01 steps per second. Native and Java videos recorded at 120 fps show the corresponding drip columns. Three initial native 20-second windows match seven fps. Later native windows measure about 6.8 to 7.0 fps, while Java stays near seven. The cause remains unresolved. Independent clocks, changing native preview conditions, and capture timing still need investigation. This verifies the tested local assembly and Java frame sequence, without claiming exact native timing or complete animated-outfit parity. Assets, measurements, and probes stay private.

### Native preview clock and controlled recording

The native 1.26.51.1 `query.life_time` callback reads a float from its animation context. A temporary debugger watchpoint identifies the preview clock update. For a preview without a world actor, it adds the render frame delta to the stored life time. A separate actor path derives time from ticks and frame interpolation.

Independent execution covers 53 clock update cases, including zero delta, actor time reversal, interpolation, and float32 precision at large ages. The preview getter and update branch execute native instructions. The probe supplies the indirect-call dispatch. It excludes the frame gate, render delta producer, actor updates, and expression evaluation. Large accumulated ages can change effective increments through float32 rounding. The earlier recording's age is unknown, so these cases do not explain its slowdown.

After a fresh native launch, an uninterrupted 40-second editor sample tracks real time closely. During a 125-second arm recording, 12,264 direct context samples advance at 0.99994 times real time without rewinds. Six video windows measure about 7.00 to 7.02 arm frames per second. Their drip-pixel rates agree with the sampled clock. Debugger pauses occur before these measurements. Temporary breakpoints are removed, the recording is stopped, and the unsaved arm preview is canceled.

These results support the current seven-fps strip rate for this preview. The earlier slowdown remains unresolved. Long-running previews, native frame gates, other outfits, and world rendering still need verification. Full skin and Dressing Room parity remains incomplete. Account data, native instructions, recordings, and probes stay private.

### Live skin palette and input verification

The active nine-piece Alex recipe uses the zero-price Brawny base. Its native catalog entry requires redemption, while its metadata permits tint overrides. The native 1.26.51.1 client exposes its skin palette. Java previously hid that control because the color loader treated immediate equipment eligibility as asset availability. Use the shared catalog reference factory, as model assembly already does. Loading color metadata does not redeem or purchase an item.

A private production probe returns no skin target before the fix and `SKIN` afterward. The saved recipe remains unchanged. The restarted client also resolves `SKIN` from the corrected loader.

Real mouse input found another gap. Minecraft 26.3 defines the left mouse button as 1, while the manual wardrobe and palette handlers compared it with zero. Wardrobe tiles now use the named constant. Palette swatches use native button widgets with keyboard navigation, focus, tooltips, and narration. Their rows adapt to the GUI height and reserve space for color status above the footer. Remove the outdated hint that excludes animated details from saved characters.

Live Java tests select a swatch with the mouse, move focus right, and select the next swatch with Enter. The selected index and focused widget both become 1. A right click leaves that selection unchanged. The last skin swatch selects index 32 and enables Apply without saving. At a 640 by 480 window, all 33 swatches fit in the 320 by 240 GUI. Their bounds and status space remain above the footer. Screenshots also verify the 1280 by 694 layout.

Applying the first swatch through the real screen saves its ARGB color. An independent HTTPS readback verifies that only the active recipe's skin color changes; the other five profiles remain unchanged. A guarded restore rereads the profile hashes before writing, then verifies all six original recipes. The restored active recipe keeps its original RGB color. The locally saved appearance is also restored.

The fixture suite passes 403 tests across 81 suites with no failures, errors, or skips. All 16 patches replay, and the dependency build and Prism bundle pass. Widget placement uses the Minecraft rectangle API's size-before-position order, verified through live bounds. This verifies the tested skin palette flow; other palettes, outfits, world rendering, and complete Dressing Room parity still need broader verification. Credentials, account recipes, captures, assets, and probes remain private.
Cape box UV expansion retains native east and west face labels. The shared model consumer now converts both box and explicit layouts consistently, so the old producer swap would convert lateral faces twice. Top and bottom orientation rules remain separate. The unchanged licensed native cape oracle passes all four persona heights, checking mesh positions, normals, texture coordinates, and atlas pixels. All six focused cape and face-layout tests pass with no skipped cases.

Cape atlas expansion preserves all six native face labels. The general
renderer handles the model coordinate reflection for both box and explicit
UVs. Preserve upper-face reversal of both UV axes and lower-face reversal
of V. The unchanged captured native oracle passes for all four persona
heights, including positions, normals, texture coordinates and atlas pixels.

### Native free redemption and right-leg account save

Native 1.26.51.1 lists Coin Stacks and Prosthetic Leg as immediately available free pieces. Other zero-price legs require redemption. The native Coin Stacks right-leg recipe contains exactly one `id` field with the `/fr` suffix. This observation comes from the native client's local recipe data. That data marks the edit with `offlineUpdate`; no native appearance PUT is observed. It verifies the stored recipe format, without proving native cloud synchronization.

The Java screen selects Coin Stacks, chooses Right, and saves through its production account flow. Independent HTTPS readback verifies the exact native right-leg entry, with the active recipe's existing fields and the other five profiles preserved. A guarded restore verifies all six original cloud recipes. Local geometry masking and rendering for this leg remain unverified.

A separate native Brawny Get operation uses `/transaction/virtual` with Minecoin `Amount` set to the string `0`, followed by `/transaction/redeem/xbox`. Both requests return 200. The UI then permits Equip. This verifies an actual zero-price redemption flow; it does not test a paid purchase. The free entitlement is retained.

Native Equip changes the local base entry's free-source flag and sets `offlineUpdate`. Cleanup stops only the owned native process, restores its original active recipe from an earlier private snapshot, and preserves its other five local profiles. The current slot matches only those known changes before restoration. A private relaunch verifies that the original native recipe survives restart. Cloud recipes also remain restored. Native local format version and offline synchronization differ from the account service format and still need separate investigation.

Raw local data, transaction bodies, credentials, and screenshots remain private. These observations add coverage for a free right-leg account edit and native zero-price redemption; they do not establish complete Dressing Room or rendering parity.

### Free leg assembly and direct Default controls

The production assembler loads Coin Stacks with the native `/fr` recipe from licensed assets. It builds the persona body and animated face locally. The right leg has five cubes, with one right legging cube and two right boot cubes. The original left leg and pants retain their polygon surfaces. Both the earlier bundle and the refreshed renderer show the right leg in the Java Dressing Room. A fresh account read confirms that this unsaved assembly leaves the active recipe unchanged. This verifies one outfit and side selection, without establishing complete texture, lighting, pose, or world rendering parity.

Native Bedrock 1.26.51.1 equips Coin Stacks for both legs with a `/f` entry. Selecting Right and Default removes the right piece visually. The left piece remains visible after returning to the Dressing Room. The local recipe file still records `/f`, including after stopping the game. Treat this as visible behavior only; native persistence and cloud synchronization remain unresolved. Cleanup checks the known equip change before restoring the original active local recipe. It preserves the other five local profiles. An independent HTTPS read verifies all six original cloud recipes.

Java now exposes Default for arms and legs, with Both, Left, and Right selectors. The action clears the chosen sides through the existing profile hash guard and account readback. It preserves the opposite side, source flags, tint channels, other pieces, and emote order. Replacement and Default share the same masking routine. Users can reset an equipped limb while browsing another offer, including a locked offer. Unknown recipe flags disable the reset. The normal account save also refreshes the locally selected persona.

Targeted tests cover arms and legs, free and owned source flags, tint preservation, splitting a piece across sides, and restoring both sides. They also reject non-limb categories and unknown flags. Captures, native files, licensed assets, and account data remain private.

Live UI validation saves Coin Stacks for Both, resets Right while a locked offer is selected, then resets Both at 640 by 480. Independent HTTPS reads verify `/f`, then `/fl`, then the exact original recipe. Every step preserves the other five profiles. Default disables itself after the selected side is clear. Its widget fits inside the 320 by 240 GUI. The original locally saved appearance is restored after the test.

The full fixture run reports 451 tests across 90 suites, with no failures or errors and three skipped capture comparisons. Those three comparisons pass in a separate targeted run with their fixtures supplied. All 17 patches replay. The dependency build, pinned ViaFabricPlus verification, Prism bundle, and north-star patch check pass. This verifies the new limb controls and one free outfit; full skin and Dressing Room parity remains incomplete.

### Catalog emote previews and remote UUID lookup

Native Bedrock 1.26.51.1 previews locked Sneaking and unowned Robot Dance from the Emotes catalog. Robot Dance requests `Catalog/GetPublishedItem`, then downloads `personabinary` from an official CDN. The current account receipt decodes its 7.5-second animation. These actions send no purchase, redemption, or appearance write. Independent reads confirm that all six cloud recipes and six native local recipes remain unchanged.

Java now enables previews for catalog emotes, including locked and paid offers. Equipping retains its separate ownership checks. Received emotes can use the full current catalog. If a received UUID is absent, the loader searches the official PlayFab catalog by its pack UUID tag.

The UUID search requires the account manager's master-player token. Native-session requests and automated add-on account requests resolve Robot Dance with that token. The title-player token returns empty search results for the same product. The loader validates the product, persona type, pack UUID, and archive identity. It rejects ambiguous products and refreshes published metadata before downloading. Pending downloads and cached assets have fixed limits.

All 14 focused tests pass with native asset fixtures enabled and no skipped cases. The tests cover search identity, duplicate and ambiguous results, invalid metadata, shared receipt keys, and existing free and owned asset assembly. The full stack and bundle build. Assets, receipts, account data, and captures remain private.

The rebuilt production client also exercises the missing-catalog-entry route with Robot Dance. It resolves the product, downloads the archive, and samples 450 frames. The item remains unowned and cannot equip. All saved slot profiles match their prior values. Real UI input selects the paid offer and opens its active-character preview. A recording verifies changing poses, completion reset, Replay, and Stop. A fresh HTTPS read confirms all six original cloud recipes afterward.

This change does not establish complete emote parity. Assets absent from the official catalog or incompatible with available receipt keys remain unavailable. Dynamic actor queries, effect aliases, communication filters, and native world timing still need verification.

### Emote selection and responsive controls

The emote detail panel now shows Not owned for offers that cannot equip. Locked and paid offers retain their preview action and separate acquisition checks. Resizing recalculates the catalog page from the selected item. The wheel uses a diamond when all three rows fit, and a single row otherwise. Narrow windows reduce the button width to fit all four positions.

Live production checks select unowned Robot Dance at 1280 by 694, resize to 640 by 480, and return to the original size. The selected index stays 20. The small layout shows page 21 of 32, with Robot Dance in its single tile. All four buttons remain inside the 320 by 240 GUI and above the footer. At GUI scale 1, the taller layout retains the diamond and the same selected offer. The original scale is restored. Independent HTTPS reads confirm all six original cloud recipes. A fresh production profile load confirms the original active recipe. The dependency build and Prism bundle pass. Captures and account data remain private.

A read-only account loader inspection decodes all 32 current catalog emotes. None declares sound effects, particle effects, or timeline events. Hover uses actor lifetime expressions. These observations guide the next timing comparison; they do not establish complete effect or emote parity.

### Actor queries during world emotes

Hover's official seven-second animation uses actor lifetime for its root motion and limb oscillation. World emotes previously sampled with an empty query map, causing `query.life_time` to use elapsed emote time. Pass the player animation graph's actor context to the world emote sampler. Animation elapsed time remains a separate clock. Remove the unused sampling overloads.

The inspected Bedrock 1.26.51.1 actor-bound clock reads `(actor age ticks + frame alpha) / 20` and preserves monotonic lifetime. An independent instruction probe reruns 53 actor and preview clock cases. A [reported discrepancy in the Molang documentation](https://github.com/MicrosoftDocs/minecraft-creator/issues/772) is a research lead; the target build supplies the clock evidence.

All six emote tests pass with both licensed fixture directories supplied, without failures or skips. Hover's test varies lifetime independently of animation elapsed time and checks steady root position and rotation at 60 samples per second. The existing owned-animation test also handles subdirectories in the collected packs.

The rebuilt production client exercises its public world sampler on the Minecraft thread with Hover's licensed asset. Four supplied actor lifetimes match the authored root motion while emote elapsed time stays near two seconds. Moving the probe actor cancels playback. A fresh production account load confirms the original active recipe. This probe sends no account write. The dependency build, Prism bundle, and north-star patch check pass.

### Initial character selection and matching world check

Opening Change emotes in a world created a fresh screen with slot 1 selected, even when the account's active character was slot 5. On the first successful wardrobe load, select the valid active slot. Refresh keeps an existing selection. An account without a valid active slot keeps the initial selection.

The rebuilt JAR passes a clean client restart. The real screen initially selects active slot 5. Mouse input selects slot 2, and Refresh preserves slot 2 after the account load completes. Opening another fresh screen selects slot 5 again. An independent production account load verifies that the active recipe remains unchanged. These checks perform no appearance writes.

Java also joins a separate native Bedrock 1.26.51.1 server through NetherNet HTTP, using protocol 2193. The server reports PlayerSpawned. The production world renderer installs the saved persona geometry and one animated face surface. A closer pixel check resolves an apparent missing-eye discrepancy in the displayed screenshot: both green iris pixels are visible. All 64 front-face texels match the uploaded open-eye frame within one channel value after fitting the face's lighting factors. The stored and installed strips match exactly. This verifies the tested Java face frame, without establishing native world lighting, pose, or phase parity.

All 18 patches replay. The dependency build, Prism bundle, and north-star patch check pass. Client probes, licensed assets, screenshots, account data, and local server files remain private.

### Remaining scope after these checks

- **Faces and tints:** Production assembly consumes animated faces and tint masks. Native execution and fixture checks cover the implemented blend paths. The tested Java world face renders both irises correctly. Separate native and Java world recordings verify visible blinks for the saved default face. Native lighting and broader visible checks across facial combinations remain open.
- **Persona assembly:** Licensed package acquisition, extraction, versioned caching, and local assembly work for the tested default and free-leg recipes. Exhaustive free-piece coverage, additional layering combinations, accounts without usable receipt keys, and unavailable remote products remain open.
- **Animation:** Strip timing, blinking, multiple sources, timelines, delays, actor queries, rotations, and effect machinery have implementation and targeted checks. Native and Java world clocks and default-face closures now have separate live observations. Multiplayer phase and remote receive comparisons remain open. The matching vanilla player declares no emote effect aliases. Effect-only server player overrides retain their aliases when optional animations or scripts are absent. Effects from other products still need native world comparisons.
- **Dressing Room:** Saved characters, tested palettes, limb side/default edits, catalog previews, zero-price acquisition, and owned classic-pack browsing/downloads have checks. Remaining palette combinations, paid purchase/redemption behavior, native cloud synchronization, and broader interaction checks remain open. No paid transaction was tested here.
- **Classic formats:** Geometry inheritance and animation flag conversion have targeted tests and native execution evidence. Trusted account-pack capes now reach preview, storage, and skin transport. Native cape precedence and visible comparisons remain open. Native inheritance edges, first-person behavior, equipment interaction, and visible motion comparisons remain open.

This is progress on the six-part parity goal. It is not a full-parity result.

These checks verify query forwarding and authored motion evaluation. They do not compare native multiplayer phase or the full entity renderer. Native preview clock, visible effect comparisons, offscreen actor context, and broader visual parity remain open. Assets, executable instructions, account data, and runtime probes stay private.

### Interactive owned classic-pack downloads

The production Owned packs screen synchronizes Store purchases and lists Earth Skin and Birdie Wings for the selected account. Real mouse input opens each pack through the normal asynchronous download path. Both previews render their resolved custom geometry. At 640 by 480, the preview, navigation, and Use this skin action fit inside the 320 by 240 GUI. Next wraps correctly for these single-skin packs. Refresh preserves the pack rows during synchronization and returns the same owned entries.

Native Bedrock 1.26.51.1 also lists both owned packs. Selecting Birdie Wings opens its preview with an explicit Equip action. The Java and native views show the same character and its wings. This is a qualitative geometry and texture check, without a pixel, lighting, pose, or animation-phase comparison. Neither owned pack declares classic animation aliases, so the interaction does not verify animated classic packs.

No Equip or Use this skin action is selected. Independent HTTPS reads confirm all six original cloud recipes. A fresh production profile load confirms the original active appearance. Native browsing changes only the current local profile's `offlineUpdate` bookkeeping flag. Cleanup closes the owned native client, checks that exact difference, removes the flag, and verifies all six original local profiles before relaunch. The recipes survive relaunch. Raw traffic, licensed assets, and captures remain private.

### Native wallet and acquisition checks

Native Bedrock 1.26.51.1 shows the Minecoin count and a plus button in the top right of the Dressing Room. Its captured request uses `POST /api/v1.0/currencies/virtual/balances` on `entitlements.mktpl.minecraft-services.net`, with an empty body and Minecraft session authorization. The response separates Minecoins from PlayStation Tokens.

The Dressing Room, Character Creator, owned-pack browser, and classic-pack preview use that endpoint for the selected account. The balance loads independently from catalog rows and character previews. Refreshes follow account changes, game focus, item acquisition, and Store synchronization. A periodic refresh preserves a known balance while its request runs. A failed request shows unavailable, rather than a zero balance. Compact windows retain the full balance description in tooltips and narration.

The plus button opens the [official Minecoin shop](https://www.minecraft.net/en-us/marketplace/buy-minecoins) through Java's link confirmation screen. Minecraft documents this purchase route for Microsoft accounts. Fabric cannot invoke the native client's platform purchase UI. This implementation needs no external Bedrock installation and does not handle payment credentials.

The real Java catalog acquires the zero-price Prosthetic Foot offer through Get. An independent production read confirms its entitlement and receipt key. The asset loader downloads and decrypts all eight files. All five saved character recipes and the settings profile remain unchanged. Selecting Hacker Legs opens the 400-Minecoin confirmation; choosing No returns to the unowned offer. No paid transaction runs.

### Optional client entity sections and effect aliases

The matching licensed vanilla assets contain client entities without animations or scripts. The inspected vanilla player declares no sound or particle effect aliases. A generic persona fallback graph therefore has no supported aliases to supply from that file.

The actual loader failure affects server player overrides that declare effects without those optional sections. The constructor now treats absent sections as empty collections. Targeted tests retain sound and particle aliases, locator names, attachment flags, and caller animation overrides. Supplied malformed sections still fail validation. This follows the [client entity schema](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction?view=minecraft-bedrock-stable).

The clean production client shows the same zero balance as the native capture. Independent backend reads match all four wallet screens. Mouse input refreshes the compact counter and opens the official shop link confirmation. Cancel returns to the Dressing Room. GUI widths 320, 427, and 640 keep the wallet clear of the centered header; compact tooltips retain the currency name. No payment runs.

The focused run reports 28 tests: 27 pass and one optional redemption capture comparison skips because its fixture is absent. The balance parser and optional actor section tests run without skips. The production server-player entry point now loads a minimal effect-only override and resolves both aliases, preserving the sound locator. All 18 patches replay. The dependency build, pinned ViaFabricPlus verification, Prism bundle, and north-star patch check pass. Traffic, account snapshots, downloaded assets, and client probes stay private.


### Trusted bundled classic capes

A live Bedrock 1.26.51.1 startup trace records the actual trust callbacks for Package origin 2 and PremiumCache origin 8. Both return true. The classic loader then enters its cape lookup. Package trust uses callback `1419b8a10`; PremiumCache uses `1400848a0`. Independent instruction decoding confirms their observed results.

Account downloads preserve trusted provenance after receipt, published identity, and decrypted pack checks. Local skin-pack imports remain untrusted. The reader accepts cape paths shorter than 1024 UTF-8 bytes. It resolves the final component after either slash, matching the target loader. Bounded PNG decoding checks dimensions before appearance files change.

The preview includes the pack cape. Storage keeps its pixels and stable identity in a separate account file. Standard presets hide that bundled cape. Returning to the imported skin restores it. Skin transport carries the same pixels and identity. A new skin import replaces or clears the bundled cape.

Manual PNG capes retain their existing priority as a local extension. This behavior does not establish native account, persona, and bundled cape precedence. A visible native comparison with an entitled cape pack remains open.

Three cape tests cover trust, path resolution, decoded pixels, persistence, preset selection, wire round trips, replacement, and invalid input. Native executables, traces, synthetic format fixtures, and account files remain private.

Wallet requests now complete while the purchase confirmation covers their screen. Account and request identity still reject stale results. Returning to the Dressing Room can therefore retain the completed balance instead of leaving the request pending.


The focused run reports 31 tests: 30 pass and one optional redemption capture comparison skips because its fixture is absent. All three cape tests pass. The final full build reports 466 tests, with 370 passing and 96 optional fixture tests skipped. It has no failures or errors. All 18 patches replay. Pinned ViaFabricPlus verification, the dependency build, Prism bundle, and north-star patch check pass.

The clean production client starts a real balance request, then opens the shop confirmation before that request finishes. Its completed wallet reports zero Minecoins while the confirmation remains open. Cancelling returns to the same completed counter. An independent backend read matches it. These checks perform no payment or appearance write. The cape format tests use synthetic fixtures; they do not establish visible native cape parity.

After the concurrent equipment patches reached main, all 19 patches replay. The integrated dependency build also passes.

## Server closed captions

The client snapshots player/listener pose after native sound range admission and resolves caption metadata independently of sample decoding and channel allocation. Core owns admission, direction, duplicate refresh, time, and fade state. The client supplies persisted controls and HUD drawing. Server translations arrive through the shared core native archive on direct and ViaProxy routes. Already licensed catalogs remain available without initiating Store sign-in.

The pinned native factory and duration-vector initializer establish disabled caption/filter defaults, top-right placement, a 1,500 millisecond default, and half-second duration steps from 1,000 to 4,000 milliseconds. The HUD uses the native 30% area, 50-unit inset, arrows, centered text, chat background, and final one-second quartic fade.

Private direct and proxy sessions reach spawn, load the recorded server translations without a Store account, show all five positive-volume cues in HUD state, exclude the zero-volume cue, and expire entries. HUD screenshots confirm visible text and arrows on both routes. The proxy image shows all five rows with Java's tutorial disabled in the lab; the direct image has a tutorial toast over two rows. The transport-only replays retain separate skin/actor rendering failures. Complete native layout parity, actor/local caption sources, marked-source integration, settings-change timing, localization precedence, custom fonts, and audio-device-unavailable behavior remain incomplete or unverified.

The independent licensed helper now retains `texts/*.lang` and text archives. Cache format 10 requires the English catalog, which refreshes older incomplete extractions. Targeted Rust selector tests and Java cache tests pass. Fresh licensed acquisition with this language selection remains unverified. [Microsoft documents English fallback](https://github.com/MicrosoftDocs/minecraft-creator/blob/main/creator/Reference/Content/MCToolsValReference/langfiles.md).

## Local particle sound caption admission

Share the native float listener gate with local particle sound emitters. Preserve their original float positions; PlaySound still converts its fixed-point coordinates before calling the same calculation. The Java helper matches 444 native local-emitter admission cases. Particle configuration and caption metadata resolve before PCM loading, so unavailable samples do not suppress captions. This path uses marker zero in the pinned native alias caller. Network actor-marker integration and attached-animation caption behavior remain unfinished.


Validation: the complete build passes 926 Java tests with 110 optional asset skips. The core audio patch builds alone with 24 tests and both Checkstyle tasks. The targeted particle/resource-library run passes 12 tests with private native references enabled and two unrelated optional conditions skipped. Synthetic direct and ViaProxy sessions invoke the production local-emitter entry point, retain a caption for a missing PCM sample, exclude quiet/distant cues, and expire rows. Screenshots show caption output with concurrent-row clipping. These checks do not cover incoming particle packets, proxy actor/effect graph transport, complete layout, or audible parity.

## Shared server resource snapshots

Use one library snapshot for server audio, captions, particle graphs, controllers, and textures. Merge accepted archives by source pack index, including empty layers. Reject conflicting paths, mismatched indexes, and aggregate limits. Rebuild snapshots after world/resource lifecycle changes or a change to already loaded licensed assets. Loading this snapshot does not initiate Store sign-in.

Direct server actors share core selection APIs with converted resource packs. Tests verify archive merging, immutable maps, mismatched layers, and domain collisions. The complete stack passes 933 Java tests, with 110 optional asset tests skipped. Incoming particle packets, actor binding, typed Molang evaluation, and visible effect parity remain incomplete.

**Resource availability check:** An authored pack contains three particle definitions and one texture. Private main-thread instrumentation reads all three definitions and the identical texture bytes from the accepted converted resource pack on direct and ViaProxy connections. Both full replays reach spawn, transport every recorded payload, and load the Java resource pack without Store sign-in. This verifies resource availability, not incoming particle dispatch or visible effects. The existing direct skin-update failures and missing ViaProxy actor/appearance state remain open.

## Shared native block mirror

Receive the core's authoritative block identity channel and bind its mirror to the current client world. Preserve the mirror during resource reloads and clear it on disconnect. Native particles use this shared mirror instead of reading a direct-only ChunkTracker. Filtered effects require initialized world data. Unfiltered effects can start through ViaProxy.

The full build passes 940 Java tests with 110 optional asset skips. A targeted filter test verifies the core mirror after an update at negative coordinates. Live direct and ViaProxy sessions each receive 2,712 initial section snapshots. Every client lookup matches the transported state and dictionary. Direct producer hashes also match the decoded snapshots. Updates match on both routes. These checks do not establish incoming particle dispatch, visible effect parity, or live dimension/unload/disconnect behavior.

## Native server particle receiver

Register the native particle channel and receive complete requests through direct connections and ViaProxy.
Use shared server resources and already loaded licensed assets without starting Store sign-in.
Apply core's typed Molang values with native member hashing and duplicate rules.
Copy structs across emitters, assignments, and query-value assignment.
Normal script assignment names remain case insensitive.

Bind actor requests to Java entity ID, UUID, object identity, and world lifetime.
Sample position, yaw, bounds, and supported physical queries from that entity.
Return start success from the particle runtime and decode the complete Java fallback when an effect cannot start.
Discard fallback work for replaced worlds or removed actors.

The full stack passes 947 Java tests with 110 optional asset skips.
Two client tests cover struct isolation, nested assignment, query copies, script casing, and Minecraft decoding of core's fallback body.
The standalone core particle patch passes eight tests and both Checkstyle tasks.

An authored fixture verifies production packet dispatch on direct and ViaProxy connections.
Both routes admit four requests, start two emitters, and decode one fallback on the main thread.
Their typed size, tint, position, and fallback records match exactly.
Missing actors and other dimensions do not reach the receiver.
These profiles have no Store session.

Visible native parity, complete actor queries, remote actor transport, interpolation, removal, ID reuse, world transitions, and reload timing remain unverified.
The fixture has a sparse world and an unstable camera; runtime records do not prove visible parity.
Malformed JSON compatibility and further native variable forms remain open.

### Shared float interpreter

Use MochaFloats 6.1.0 from Maven Central with the same parser, lexer, and interpreter modules as ViaBedrock. Replace double AST constants with float constants. Retain typed packet variables, native easing functions, query bindings, precedence, and loop limits. The bytecode compiler is unused and is not bundled.

Numeric regressions cover rounding before comparisons, persistent assignments, and query inputs. Broader native animation and particle comparisons remain required.

Validation: the add-on suite passes 446 tests with 108 optional tests skipped, including 13,578 saved native easing cases. The add-on bundles the fork's lexer, parser, and runtime modules. Its nested ViaBedrock JAR retains the MIT notice.

### Core math integration

Animation and view bobbing now use core's native easing, angle functions, and regenerated sine lookup. The duplicate client math classes are removed. Finite scalar results above 32,768 remain intact. Non-finite checks and parser and execution limits remain.

Bedrock 1.26.51.1 constant and runtime paths match across 9,367 angle cases. The probes cover directed endpoints, half-turn ties, extrapolation, large finite inputs, and overflow intermediates. Their prepared numeric contexts and host C remainder import do not establish visible animation parity.

Validation: the full build passes 958 Java tests, including both native math fixtures. The bundle builds. Direct and ViaProxy particle graphs exercise all three shared functions and produce matching dimensions. Their downloaded archives retain the authored expressions. Visible parity and the existing actor and appearance gaps remain open.

## Reuse the accepted archive for effects

Sound, caption, and particle loaders use the core actor archive's shared effect view.
The view preserves previous file admission, layer order, empty layers, texture overlays, and caption locales.
Accepted resources share their decoded bytes with actor loaders.
Already licensed built-in assets retain their existing fallback order.
Reload and disconnect invalidate the shared archive cache.

The separate effect archives and their merge helper no longer serve production paths, so remove them.
The existing resource-library tests retain sound, caption, particle, and overlay behavior.
The matching core emits one archive, and new converted packs require this matching add-on.

The derived effect library also keys its snapshot by the shared decoded layers.
Actor-cache invalidation and resource-manager replacement therefore refresh effects without a separate sound reset.
A targeted regression test covers retained data before invalidation and refreshed texture bytes after both transitions.


### Native color exceptions, copies, and selected-slot state

**Verified research:** The matching Bedrock 1.26.51.1 executable, build 51061372, supplies the color predicate and its complete hand-tick caller.
Static initializers bind the two native identifiers to `minecraft:glow_stick` and `minecraft:sparkler`.
Both initializer constants match the identifiers' FNV-1 hashes.
The predicate checks the hash and name bytes, with a mutual-pointer cache fast path for the first identifier.
These identifiers cover the Education color exception, not banners or shields.

The caller skips color handling after a retain result or when both stack counts are zero.
For an update or animated replacement, the helper requires equal native item IDs and a recognized current item.
It uses the block-derived auxiliary value when a block exists, except for raw wildcard value `32767`.
Otherwise, it uses the raw auxiliary value.
The helper masks the value with `31` and replaces results of `16` or more with `5`.

Both equal and unequal normalized colors copy the current stack into the retained stack.
Equal colors force retention, including after a selected-slot change.
Unequal colors leave the original update or animation result in place.
The color copy does not update the cached selected slot.
Only the ordinary main-hand copy updates that cache, after an immediate update or the existing height threshold.
The offhand receives no selected-slot change argument and never updates the main-hand slot cache.

The owner constructor prefix initializes the cached slot and all four height fields to zero.
It calls both native empty-stack constructors and retains the supplied client bridge.
Six sentinel cases execute those constructors and verify empty stacks, valid flags, auxiliary values, counts, restrictions, and variant tags.
The probe supplies the later owner allocation and stops before the remaining constructor body.
This proves initialization for that prefix, not world changes, appearance transitions, or the owner's complete lifetime.

| Native instruction probe | Cases | Scope |
| --- | --- | --- |
| Identifier predicate | 120 | Name and hash checks, storage, missing pointers, and cache branches |
| Color postprocessor | 26,136 | Raw/block auxiliary values, wildcard values, normalization, and observed copy calls |
| Base copy construction and destruction | 30 | Actual field writes and balanced weak-reference counts |
| Color helper with native copies | 1,728 | Actual construction, destruction, assignment, and empty variants |
| Complete hand-tick caller with native copies | 64,800 | Both hands, supplied classifications, heights, selected slots, cache writes, and retained fields |
| Owner constructor prefix | 6 | Actual empty-stack constructors, initial slot, heights, and bridge |

The larger caller probe executes actual native copy and empty-variant instructions instead of skipping them.
It verifies retained auxiliary values and counts as well as height results and selected-slot state.
The fixtures use synthetic stacks without user data, restrictions, or a charged item.
Virtual classifications, inventory getters, global string allocations, and CRT boundaries remain supplied.
The predicate fixtures also exercise synthetic cache states that do not establish valid live object construction.
These checks do not establish every item's virtual dispatch or final rendered pixels.

The private PE loader now zero-fills virtual section tails instead of reading adjacent raw-file bytes for uninitialized globals.
The two identifier globals occupy that zero-filled region before their initializers run.
All 2,176 earlier base and shield classifier cases still pass with the corrected loader.
Executable bytes, exports, synthetic fixtures, and emulator programs remain private.

**Incomplete:** Production still uses Java item classification.
Complete native NBT comparison, resolved restriction hashes, charged-item construction, item dispatch, and renderer lifetime transitions require further verification and implementation.
The color and selected-slot rules above are verified instruction behavior, not a claim that their production integration is complete.


### Native NBT and full-stack comparison research

**Verified research:** Additional probes execute Bedrock 1.26.51.1, build 51061372, using the corrected PE loader.
The native NBT comparators pass 3,486 cases covering all eleven value types, strings, arrays, compounds, lists, and type mismatches.
The earlier 504 float and list cases also pass with zero-filled virtual section tails.

String equality compares lengths and bytes, including embedded zero bytes.
Small and heap-backed strings produce the same comparison result.
Byte and integer arrays compare their byte lengths and contents.
Compound equality compares key membership and typed child values, independently of tree shape or key storage.
A shared compound containing NaN still compares unequal to itself.
Signed zero compares equally, and empty lists retain their declared type distinction.

Another 784 cases execute native user-data comparison, full-stack comparison, and the default item classifier together.
For these valid ordinary stacks, absent user data and an empty compound compare equally.
Changed user data requests an immediate update when the default relevant-data comparison accepts the items.
Equal user data with equal counts retains the item unless the selected slot changes.
A selected-slot change requests animation.
These fixtures supply the default relevant-data callback and do not establish dispatch for every item.

The full-stack comparator passes another 11,833 cases: 11,664 parent-field combinations and 169 charged-stack combinations.
Raw auxiliary value `32767` acts as a wildcard on either side.
Block comparison is asymmetric: a present left block requires the same right block, while an absent left block imposes no block check.
The comparator requires equal restriction hashes and blocking ticks.
For present charged stacks, it compares count and recursively compares the nested stack.
Invalid or physically empty charged stacks follow the absent-stack branch.
These fixtures directly construct charged fields and supply restriction hashes.
They do not execute charged-item loading, resolve restrictions, or establish their wire-to-object construction.

| Native probe | Cases | Supplied boundaries |
| --- | --- | --- |
| NBT value comparison | 3,486 | Synthetic tag objects, string allocation, compound trees, and CRT byte comparison |
| Earlier float/list comparison | 504 | Synthetic values and list storage |
| User data through default classification | 784 | Valid ordinary stacks, inventory context, and default relevant-data callback |
| Remaining full-stack fields | 11,833 | Block identities, derived restriction hashes, and charged-stack fields |

All comparison, type-check, lookup, and recursive native instructions execute in these probes.
The CRT boundary supplies standard byte comparison; it does not replace tag equality or compound lookup.
Raw executables, memory layouts, generated inputs, and emulator programs remain private.

**Incomplete:** These results verify comparison rules, not production classifier integration or complete native object construction.
Restriction resolution, charged-item loading, item-specific dispatch, selected-slot lifetime, and final held-item pixels still require implementation and verification.


### Native restriction and charged-item construction research

**Verified research:** New probes execute the matching Bedrock 1.26.51.1 executable, build 51061372.
They retain the corrected PE loader and actual native tag comparison routines.
Together, 1,371 cases cover restriction processing, charged-item loading, and the selected default method after loading.

The restriction helper adds `minecraft:` only when the input contains no colon.
It preserves the supplied bytes otherwise.
Its hashed-string constructor retains the string length but hashes bytes only before the first zero byte.

The append helper deduplicates resolved block pointers.
An expansion stops at its first unresolved member and retains the earlier appended members.
The surrounding caller can continue with later restriction entries.
These probes supply registry membership, expansion, and block lookup answers.
They do not establish the registry's real tag, alias, or case rules.

The native sort orders block pointers by unsigned name hash, then name bytes and length.
It does not order them by pointer address.
The hash helper then combines hashes of the pointer bytes in that order.
It preserves duplicate inputs supplied directly to that helper.
The earlier append helper removes repeated resolved pointers before this stage.
Tests cover independent restriction vectors, permutations, equal hashes, duplicate inputs, and vectors of up to 512 entries.

The charged-item setter transfers the outer user-data compound and reads its `chargedItem` compound.
The saved-tag loader reads `Damage` as Short and `Count` as Byte.
Other tested numeric tag types produce the missing-field defaults.
Negative saved auxiliary values clamp to zero.
Count preserves all eight bits.

For the selected non-durable path, wildcard auxiliary value `32767` becomes zero after the item method runs.
An unresolved saved name produces an empty charged stack in these registry fixtures.
Native copies and destructors balance the tested item and registry reference counts.

The selected default item method reads maximum damage as a signed short.
For a positive result and an absent `Damage` key, it creates an Int tag from the signed effective auxiliary value.
It preserves other user-data keys and clears raw auxiliary data.
An existing `Damage` key prevents that migration, including each of the eleven tested value types.
The charged-stack probe also executes the migration, native compound copies, and destruction with the resulting user data.
These synthetic definitions do not establish maximum damage or method dispatch for the real item catalog.

| Native probe | Cases | Supplied boundaries |
| --- | --- | --- |
| Restriction sort and hash | 668 | Synthetic block names, pointers, and CRT byte operations |
| Restriction processing caller | 252 | Registry answers, allocations, and CRT operations |
| Charged saved-tag loader and copies | 144 | Item registry, maximum-damage field, allocations, TLS, and CRT operations |
| Default method after loading | 307 | Maximum-damage field, allocations, registry context, and CRT operations |

Native instruction execution includes normalization, pointer deduplication, expansion control, tag lookup, compound allocation, Int-tag insertion, copies, and tested destructor paths.
Registry answers and allocator behavior remain supplied rather than reconstructed from the native game catalog.
The probes retain raw executable bytes, object layouts, generated fixtures, and emulator programs privately.

**Incomplete:** Production still transports decoded wire snapshots and uses Java hand-item classification.
Real registry resolution, legacy saved IDs, full saved-tag construction, item-specific loading methods, dispatch, renderer lifetime, and final pixels remain incomplete or unverified.
The saved-tag findings do not establish normalization for every inbound network item.
These results narrow the production design.
They do not claim a completed native classifier.

### Native registry dispatch and Education-item loading research

**Verified research:** A live Bedrock 1.26.51.1 client reached the CubeCraft lobby with its resource packs loaded.
The selected registry contained 2,621 distinct item names, internal IDs, and item objects.
Of these definitions, 545 had server-defined namespaces.
The numeric and name tables each contained those 2,621 definitions.
The other two inspected name-lookup tables were empty in this snapshot.

The live numeric lookup, name lookup, registry wrapper, default classifier, and hand-tick code matched the inspected executable bytes.
This comparison covered five selected code ranges in build 51061372.
It did not compare the complete running image.
Raw registry data, component trees, screenshots, and executable bytes remain private.

| Captured virtual method | Definitions | Selected behavior |
| --- | --- | --- |
| Hand-swap classifier | 2,620 default, 1 shield | The shield uses its specialized classifier |
| Relevant-metadata predicate | 2,619 default, 1 filled map, 1 firework star | Map and firework-star predicates retain their existing specialized paths |
| Method after loading | 2,449 default, 172 specialized | Six specialized methods cover Education items, leaves, decorated pots, and banners |
| Maximum-damage getter | 2,097 field, 524 component | Component definitions resolve the `minecraft:durability` entry |

The specialized loading methods cover 119 element items and 46 other Education items.
Glow sticks and sparklers share another method.
Three leaf items, decorated pots, and banners account for the remaining five definitions.
These counts describe this initialized registry, including its server definitions.
They do not establish dispatch for every possible server or registry configuration.

**Verified numeric lookup:** The actual native lookup passed 65,546 inputs against a reconstructed table of the captured internal IDs.
The probe covered every 16-bit input and ten additional truncation boundaries.
Lookup interprets the low 16 bits as a signed ID and rejects zero and minus one.
Resolved weak references gained exactly one tested reference.
The hash table, weak cells, TLS, and empty fallback were initialized by the probe.
Bedrock network item IDs require a separate mapping.

**Verified maximum damage:** Both native getter methods passed for all 2,621 captured definitions.
The component cases used 524 captured object trees and executed the native component lookup.
The field cases used 2,097 captured maximum-damage fields.
Seventeen component definitions had nonzero maximum damage in this snapshot.
TLS initialization guards and CRT operations were supplied.
Complete registry construction and lifecycle verification remain open.

**Verified Education loading:** The native glow-stick and sparkler method passed 66,256 cases.
Tests covered every raw auxiliary bit pattern, block-derived auxiliary values, all eleven existing `Damage` types, and preservation of other user-data keys.
An existing `Damage` key skips the migration.
Otherwise, the method writes Int `Damage` from bits 6 through 12 of the effective auxiliary value.
It retains auxiliary bits selected by `0xe03f`, then clamps a nonpositive signed result to zero.
This method differs from the previously tested default durability migration.

The Education probe executed native lookup, compound allocation, Int-tag insertion, and comparison.
Allocator, CRT, and registry boundaries remained supplied.
The 134,423 new instruction-execution cases exclude the live dispatch inventory and selected code-range comparisons.

**Incomplete:** Production still uses Java hand-item classification and decoded wire snapshots.
Native name remapping, restriction registry resolution, complete specialized construction, complete saved-tag construction, and renderer lifetime remain incomplete or unverified.
These results establish broader dispatch evidence and additional construction rules.
They do not establish complete network-item normalization, visible timing, or first-person parity.


### Specialized native item-loading research

**Verified research:** Five additional probes executed specialized methods from Bedrock 1.26.51.1, build 51061372.
They passed 77,324 cases across banners, decorated pots, leaf states, the Education gate, and legacy element dispatch.
These probes cover the remaining specialized methods in the captured registry.
They do not complete native registry construction or network-item normalization.
Executable bytes, object data, emulation programs, and reference outputs remain private.

| Native method | Passing cases | Verified behavior |
| --- | --- | --- |
| Banner loading | 192 | Absent or empty user data becomes Int `Type:0`; nonempty user data remains unchanged |
| Decorated-pot loading | 1,682 | The first four `sherds` entries determine whether the key remains |
| Education gate | 256 | Disabled chemistry invalidates the stack and releases its item and user data |
| Leaf loading | 8,306 | Clear `update_bit`, then `persistent_bit`, with native state selection and fallback |
| Legacy element dispatch | 66,888 | Effective auxiliary bits select remapping or invalidation before the Education gate |

**Banners:** The method inserts Int `Type:0`, rather than a `Base` tag.
Any nonempty compound skips insertion, even when `Type` is missing or has another tag type.
The probe executed compound creation, Int insertion, ownership transfer, and typed comparison.
It covered absent and empty compounds, all eleven existing tag types, and auxiliary boundaries.

**Decorated pots:** A typed list supplies up to four string entries.
Missing entries and entries with another tag type act as empty strings.
If all four strings are empty or exactly `minecraft:brick`, native tree removal deletes the `sherds` key.
Later list entries do not affect this decision.
A non-list `sherds` value remains unchanged.
Other keys, the allocated compound, and auxiliary bits remain unchanged.

The pot probe executed the native list reader, predicate, tree removal, and child destruction.
A selected native initializer fragment supplied the `minecraft:brick` string.
Fixtures used valid small trees and covered list lengths, types, string boundaries, storage forms, and preservation of other data.

**Education gate:** The actual context acquisition, gate, invalidation, and release methods balanced the tested references.
Bit zero of the supplied chemistry flag controls admission.
Enabled chemistry preserves the complete stack in these cases.
Disabled chemistry clears the item reference, user data, count, and auxiliary value.
Context objects and mutex operations remained supplied.

**Leaves:** Native initializer fragments identify the first property as `update_bit` and the second as `persistent_bit`.
An enabled static property clears its mask from the block's auxiliary value before lookup in the state vector.
An absent or invalid vector entry retains the current block.
A missing static property can use a dynamic resolver, then the legacy default when its fallback flag permits it.
A disabled static property retains the current block without that fallback.
The second pass uses the block and legacy definition selected by the first.

The leaf probe covered both passes, their composition, masks, bounds, empty candidates, duplicate dynamic entries, and absent blocks.
Only the block pointer changed in the tested stack snapshots.
Property names and IDs came from native initializer fragments.
Registry definitions, state vectors, and dynamic resolver answers remained supplied.

**Elements:** The method selects block-derived auxiliary bits except for the raw wildcard value or an absent block.
For a matching legacy identity and nonzero effective value, the low byte must be below 119.
The low seven bits then select a nonempty element-table entry.
Valid entries dispatch the selected block and original count to the stack constructor; invalid entries invalidate the stack.
The Education gate follows either path.

The element probe covered all 65,536 raw auxiliary values and 1,352 additional block, identity, count, and chemistry combinations.
It executed dispatch, the chemistry gate, invalidation, context release, and item-reference cleanup.
Legacy identities, element definitions, and the block-construction callback remained supplied.
It did not execute complete block-to-item construction.

**Incomplete:** Production still uses Java hand-item classification and decoded wire snapshots.
Complete network construction, block-to-item construction, native name remapping, restriction registry resolution, and renderer lifetime remain incomplete or unverified.
Allocator, CRT, TLS, and registry boundaries remained supplied where the probes required them.
These results establish construction rules at specific boundaries, not complete first-person behavior or visible parity.


### Native block-to-item construction research

**Verified research:** The actual block constructor and replacement setter passed 108,432 cases in Bedrock 1.26.51.1, build 51061372.
The probe executed numeric lookup, registry wrappers, name lookup, empty alias-table paths, user-data copies, assignment, and destruction.
These cases execute the constructor itself.
The captured inventory supplied 2,621 canonical names and internal IDs, including 545 names from server-defined namespaces.
Registry objects, item objects, weak cells, and tables were reconstructed test inputs.

| Construction checks | Passing cases |
| --- | --- |
| Every legacy block-ID bit pattern, with count one | 65,536 |
| Captured internal IDs across sixteen count boundaries | 41,936 |
| Typed user data, auxiliary boundaries, empty and missing items | 624 |
| Replacement of an existing stack through the full setter | 336 |

**ID conversion:** A legacy block ID below 256 supplies the same internal item ID.
Otherwise, the constructor uses `255 - legacyId`, then interprets the low sixteen bits as a signed internal ID.
These IDs differ from Bedrock network item IDs.
An unresolved nonzero ID clears the count and raw auxiliary value.
ID zero follows a separate valid-empty path and can retain a nonzero count without an item reference.

**Counts:** The constructor clamps a nonpositive signed 32-bit count to zero, then stores the low byte.
A positive count of 256 therefore becomes zero.
A resulting zero count triggers native invalidation before the constructor copies optional user data.
The probes cover signed limits, byte boundaries, and larger positive counts.
They do not establish these rules for every network descriptor constructor.

**Data and ownership:** The block constructor initializes raw auxiliary bits to zero and retains the supplied block definition for a nonempty result.
Optional user data becomes a separate native compound, even when the resulting stack has zero count.
Tests cover all eleven tag types, empty compounds, absent compounds, and preservation of the original data.
The replacement setter constructs a temporary stack, replaces the existing stack, and destroys the temporary stack.
Tested item and context reference counts return to their starting values after destruction.

**Boundaries:** Numeric and canonical name tables use the captured inventory.
Alias tables remain empty test inputs; this does not verify the live alias registry or its construction.
The final admission check uses a supplied context with its feature gate disabled.
TLS initialization, allocation, CRT operations, and clock values remain supplied.
Fixtures do not contain nested charged items or fully initialized item-component objects.
Executable bytes, emulation programs, and reference outputs remain private.

**Incomplete:** Production still uses Java hand-item classification and decoded wire snapshots.
Complete network-descriptor construction, live alias and restriction resolution, component lifecycle, and renderer lifetime remain incomplete or unverified.
These constructor checks do not establish complete visible timing or first-person parity.

## Invisible particle carriers and opaque descendants

**Evidence:** The October 5 CubeCraft capture uses Bedrock protocol 2193 and five accepted server packs.
Its zombie-hands graph includes an invisible opaque carrier, a dirt effect, and a visible opaque rubble effect.
The carrier declares a zero-size billboard, an unused texture path, block expiration, and a child event at 0.13 seconds.
The previous loader rejected its texture path before admitting the graph.
Fixing that admission exposed the visible rubble material as a separate failure in the same chain.

The matching licensed Bedrock 1.26.5101.0 package defines opaque particles without alpha testing or blending.
Opaque and alpha-test materials retain culling and depth writes, and disable alpha writes.
The target Particle AlphaTest fragment tests texture alpha against 0.5 before applying vertex color.
Its comparison and output instructions confirm that tint alpha does not change the cutoff.
The existing native billboard fixture confirms size clamping, including zero and negative dimensions.
Licensed assets, executable bytes, shader disassembly, captures, and probe outputs remain private.

**Implemented:** The add-on separates emitter simulation from optional GPU resources.
A constant nonpositive billboard dimension proves that its area remains zero after clamping.
Those particles retain scripts, motion, block expiration, counts, timelines, and child dispatch without decoding or allocating a texture.
Per-render scripts and other visual expressions still run.
Dynamic sizes still require render resources, even when their initial value is zero.
Path validation remains active for unused textures.

Visible opaque particles use a separate render pipeline with culling, depth writes, and RGB-only writes.
They do not apply Java's particle alpha cutoff.
Alpha-test particles use the target texture-only cutoff of 0.5.
Both pipelines preload with the client's required pipelines.
The core's existing shared archive transports these definitions and textures through direct connections and ViaProxy.
No server-specific identifiers or fallback textures enter production code.

**Verified tests:** Synthetic tests exercise the production texture-loading decision, per-render script effects, child-event boundaries, and block expiration.
They also cover dynamic-size admission and invalid paths.
The targeted suite passes all nine tests with the private native motion and billboard fixtures enabled.
Those fixtures contain 200 motion cases and 492 billboard cases.
All four projects build, with 1,040 passing Java tests, 118 optional skips, and no failures or errors.

A private GPU probe compiles the production fragment shader with the matching Java includes.
All 120 cases pass on the NVIDIA GPU.
Cases cover texture alpha around 0.5, independent tint and modulator alpha, winding, and destination-alpha preservation.
The probe supplies vertex inputs, fog values, and raster state.
It verifies shader output against the inspected alpha-test instructions and declared opaque material state, without establishing complete native image parity.

**Verified runtime:** Complete direct and ViaProxy replays preserve the captured scene hash `925a9e0873059dee3a1556f3ccf3e5bf4ac951a79a0d447171c51fd9b648e5b3`.
Both pass transport and rendering checks and retain all 154 recorded skin updates unchanged.
Both load all four zombie-hands definitions and admit the carrier without GPU resources.
Their emitter chains reach depth three and create six rubble particles.
Neither reports particle loading or initialization errors.
A private observer reads existing emitter and asset state without sampling visuals or advancing scripts.
ViaProxy's live opaque and alpha pipelines confirm culling, depth writes, disabled blending, and disabled alpha writes.
These checks establish graph loading and lifecycle behavior, without proving complete native draw timing or visible parity.

**Remaining:** Additive visible parity, other material families, missing textures on visible effects, complete fog, and lighting still need implementation or native comparisons.
Native opaque shader selection, complete effect timing, actor-event behavior, and visible parity remain unverified.
All other skin, account, inventory, gameplay, protocol, UI, and platform requirements remain active.

## Authored custom particle directions

**Evidence:** The next live CubeCraft capture exposed a witch arrow-trail definition with `direction.mode` set to `custom`.
The add-on rejected it before loading the texture or creating particles.
The target 1.26.51 schema lists `derive_from_velocity` and `custom` as the direction modes.
The matching 1.26.51.1 executable reader compares the six-character `custom` value before reading its `custom_direction` vector.
The vector field keeps its existing name.
The older [public billboard reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponents/minecraftparticle_appearance_billboard?view=minecraft-bedrock-stable) uses `custom_direction` for both names.
That reference does not describe the target reader accurately.

**Implemented:** The add-on decodes the target mode name and retains the existing component and render stages.
Custom vector expressions run in order on each visual sample.
The component retains their raw magnitude, and the render stage normalizes the transformed direction.
The core's existing archive and request channels carry this behavior through direct connections and ViaProxy.
Production contains no server-specific identifiers or alternate spelling shim.

**Verified tests:** A synthetic test covers repeated expressions, ordered variable writes, raw magnitude, and age-dependent direction changes during emitter playback.
An existing locator test now uses the target mode name.
The full build passes 1,041 Java tests with 118 optional skips and no failures or errors.
The targeted effect and facing suites pass all 16 tests with private native references enabled.
These include 200 motion, 492 billboard, 286 facing, 32 emitter-plane, 144 direction-normalization, and 440 spin cases.
The fixtures verify sampled calculations, without establishing complete native visible parity.


**Verified runtime:** Complete direct and ViaProxy replays preserve the fresh CubeCraft scene hash `ede0e43b2874418cbb6b62135898efe0553009307d33fecd0f258383643d5d83`.
Both pass transport and rendering checks and retain all 311 recorded skin updates unchanged.
Both load the witch burst and silhouette definitions with render resources.
The burst creates eight particles with both authored directions, and the steady silhouette reaches seven particles.
Neither reports particle loading or initialization errors.
A private observer reads raw direction and population fields without sampling visuals or advancing scripts.
These checks verify graph loading and simulation, without proving native visible orientation, timing, or blending.

**Remaining:** The direction reader behavior is verified below. Other component defaults, interpolation, and visible native comparisons remain open.
Additive visible comparisons, complete fog, lighting, and the other coverage requirements remain active.

The additive investigation identifies separate alpha-factor inheritance in the target material parser.
Omitted alpha factors inherit color factors only when the corresponding color factor is explicitly supplied.
Explicit alpha factors take precedence, while absent color factors preserve existing values.
A private executable probe passes 192 presence, override, inheritance, and write-mask cases.
Its factor reader supplies declared bytes and presence flags.
Native field selection, inheritance, and write-mask calculations execute unchanged.
Constructor defaults, factor-name decoding, material inheritance, and final GPU state remain outside that probe.
This evidence supports the material implementation below and does not establish additive rendering parity.

## Translucent and additive particle materials

**Evidence:** The matching licensed `particles.material` disables culling and depth writes for `particles_blend`.
The native material constructor initializes color factors to `SourceAlpha` and `OneMinusSrcAlpha`.
Its alpha factors are `One` and `OneMinusSrcAlpha`.
A private executable probe verifies those fields and the initializer's nine factor names and codes.
This probe supplies allocation and map insertion, while native field and string construction execute unchanged.
The earlier 192-case parser probe verifies explicit factor inheritance and overrides.

`particles_add` inherits the translucent state and explicitly selects `SourceAlpha` and `One` for color.
The parser copies those factors into omitted alpha factors.
The matching Particle Transparent SM60 fragment retains the texture/tint alpha product without an alpha cutoff.
It interpolates RGB fog twice with the same parameters.
Material inheritance, RenderDragon selection, and final native GPU output remain outside these executable probes.

**Implemented:** Visible additive effects now load through the existing particle asset path.
Both translucent materials use native forward blend factors, two-sided rendering, and disabled depth writes.
The fragment preserves low-alpha pixels and evaluates both fog interpolations before transparency accumulation.

Separate Java depth-bounds, transmittance, and accumulation pipelines retain the renderer's stage targets and bindings.
Additive particles contribute color without reducing transmittance or recording opaque depth bounds.
The depth-bounds stage preserves particles below Java's usual alpha cutoff.
Opaque and alpha-test particles retain their existing state and fragment behavior.

**Verified tests:** Two targeted tests verify forward blend factors, culling, depth writes, stage bindings, target states, and pipeline registration.
All four projects build with 1,043 passing Java tests, 118 optional skips, and no failures or errors.
A private NVIDIA GPU probe passes 1,440 pixel cases using the production fragment and matching Java includes.
Cases cover both materials, low alpha, independent tint and modulator alpha, both face directions, and fog interpolation.
They also exercise each transparency stage, including additive transmittance exclusion and non-occluding depth bounds.

The probe supplies raster state and zero scene absorption.
These checks verify isolated formulas and integration contracts, without establishing complete native image parity.


**Verified runtime:** Complete direct and ViaProxy replays preserve the CubeCraft scene hash `ede0e43b2874418cbb6b62135898efe0553009307d33fecd0f258383643d5d83`.
Both retain all 311 recorded skin updates and pass transport and rendering checks.
A private fixture loads two authored effects through the production resource library and playback path.
Both effects allocate render resources, create particles, and complete draw calls in forward rendering and all three improved-transparency stages.
The fixture switches renderer modes during each replay and retries after the initial world transition.
These checks establish packaged integration through both connection routes, without proving complete native pixel or timing parity.

**Remaining:** Native fog parameter mapping, cross-texture ordering, overlapping transparency, material selection, lighting, and other material families remain unverified or incomplete.
The other protocol, inventory, gameplay, UI, skin, account, and platform requirements remain active.

## Particle direction reader defaults and recovery

**Evidence:** A private probe executes the matching 1.26.51.1 JSON reader, billboard constructor, component reader, and billboard sampler.
The constructor stores a squared speed threshold of `0.01` directly.
An absent direction section preserves that field.
An explicit empty or null section selects derived direction with a zero threshold.
An explicit numeric threshold converts to float before squaring, including negative values and large values that overflow to infinity.

The component reader retains its component after direction errors.
A non-object section or missing custom vector stops the reader before UV parsing.
Unknown mode strings retain the constructor direction state and continue UV parsing.
Non-string modes use derived direction, while inactive custom-vector fields remain unread.

Malformed custom vectors select custom mode with a zero vector and continue UV parsing.
A malformed axis becomes zero independently, and valid neighboring axes survive.
Direction numeric readers accept booleans as zero or one.

The probe covers 38 declarations and 190 samples through the loaded native component.
Cases include absent and null sections, malformed vectors, ignored fields, mode selection, numeric conversion, float boundaries, and preserved UV defaults.
It supplies private allocation, exact CRT byte operations, decimal conversion, empty diagnostic scopes, and age/lifetime variable lookup.
Native JSON dispatch, field reads, float squaring, component control flow, and billboard calculations execute unchanged.
Native logging messages remain private.

**Implemented:** The production reader preserves these direction defaults and recovery paths.
It reads direction before UV settings and keeps valid effects loaded after the verified declaration errors.
It reports warnings once through the existing cached asset-loading path.
Custom expressions still run in order through the existing bounded Molang parser.
No alternative mode spelling or server-specific branch is added.

**Verified tests:** Three targeted tests cover speed boundaries, inactive fields, per-axis recovery, UV read order, and complete emitter initialization after errors.
A private-reference test compares all 38 native declarations and 190 loaded-component samples exactly.
The targeted effect and facing suites pass all 20 tests with private references enabled.
All four projects build with 1,046 passing Java tests, 119 optional skips, and no failures or errors.

**Verified runtime:** Complete direct and ViaProxy replays preserve the CubeCraft scene hash `ede0e43b2874418cbb6b62135898efe0553009307d33fecd0f258383643d5d83`.
Both retain all 311 skin updates and pass transport and rendering checks.
Six authored fixtures use the production resource library, asset loader, simulation, and visual extraction.
Both routes retain the expected thresholds, UV defaults, diagnostics, and sampled directions without loading or initialization errors.
The same runs complete forward rendering and all three improved-transparency stages for translucent and additive particles.
These checks establish packaged behavior and complete scene transport, without proving native image parity.

**Remaining:** The expression and numeric-axis behavior verified below closes part of this reader gap. Typed schema dispatch, other component errors, interpolation, and native visible comparisons remain unverified.
The other material, protocol, inventory, gameplay, UI, skin, account, and platform requirements remain active.

## Custom particle expression recovery

**Evidence:** The target 1.26.51.1 array reader independently processes each direction axis.
A rejected expression becomes zero, while valid neighboring axes and subsequent UV settings survive.
Numeric axes retain their converted float value, including overflow to infinity.

A private probe executes the native JSON reader, constructor, array reader, Molang parser, and billboard sampler.
Seven declarations produce 35 sampled results.
Numeric and addition controls evaluate to two and three.
Empty expressions produce zero.
Malformed controls include an unmatched parenthesis and a missing right operand.
Large numeric inputs cover finite values and float overflow.

The harness supplies allocation, exact CRT operations, decimal conversion, and successful single-thread lock operations.
Native thread-guard initialization executes unchanged.
The optional SDK observer is absent, while a non-mutating hook records diagnostic calls.
Frees and exit registrations remain supplied process boundaries.
Sampling supplies only particle age and lifetime lookup.

Return-expression evaluation is outside the completed probe.

**Implemented:** Custom direction axes now retain native numeric overflow.
A Molang syntax rejection replaces only its own axis with zero and reports a loading diagnostic.
Expression length, nesting, and node limits retain their existing rejection behavior.
The parser reports nesting limits separately from syntax errors so recovery cannot bypass those limits.
Other particle, actor, and animation fields retain their existing parsing behavior.

**Verified tests:** An emitter test verifies per-axis syntax recovery and normalized visual directions after loading.
A limit test verifies that long, deeply nested, and complex expressions still fail their existing gates.
A private-reference test matches all seven native declarations and 35 sampled directions and UV results.
The targeted suites pass 28 tests, with two unrelated private Molang references skipped.
All four projects build with 1,048 passing Java tests, 120 optional skips, and no failures or errors.

**Verified runtime:** Complete direct and ViaProxy replays preserve the CubeCraft scene hash `ede0e43b2874418cbb6b62135898efe0553009307d33fecd0f258383643d5d83`.
Both retain all 311 skin updates and pass transport and rendering checks.
Eight direction fixtures load through the production resource library, including both malformed-expression controls.
The malformed controls retain their UV settings, allocate rendering resources, create particles, and expose the expected recovered direction.
No particle loading, initialization, or observer errors occur.

Both runs also complete forward rendering and all three improved-transparency stages for translucent and additive particles.
These checks establish packaged behavior through both routes, without proving native visible image parity.

**Remaining:** Complete expression admission, lexer error recovery, SDK runtime context, typed schema dispatch, interpolation, and native visible comparisons remain unverified.
All other coverage requirements remain active.

## Molang statement admission and decimal fractions

**Evidence:** The matching 1.26.51.1 parser rejects expressions that start with a semicolon after whitespace.
Expressions containing assignment or statement-separator tokens must end with a semicolon.
Comparisons and punctuation inside single-quoted strings do not activate that requirement.
The native token table and parser branches identify assignment and separator tokens separately from comparisons.
The target also accepts decimal fractions such as `.5` and numeric suffixes such as `2F`.
The suffix case retains the existing normalization path; the new executable controls verify `.5`, `1.`, `2f`, and `2F`.

A private probe observes 41 native compilation results and 130 billboard samples for constant or rejected expressions.
It executes the native JSON reader, component reader, Molang compiler, parser, and applicable billboard calculations unchanged.
The harness supplies allocation, CRT operations, decimal conversion, single-thread locks, and an absent optional SDK observer.
PE virtual section tails contain zeros rather than unrelated file bytes.
A supplied service-availability marker satisfies the compiler's null assertion without replacing parsing or admission decisions.
Compiled statement evaluation and variable registration remain outside this completed probe.

**Implemented:** The shared client parser tracks tokens and enforces the verified statement boundaries before evaluation.
Unfinished assignments cannot alter runtime variables.
Leading decimal fractions now produce float expressions while property access retains its existing parsing path.
Custom particle direction axes use the existing syntax recovery path for rejected statement declarations.
Their neighboring axes, UV settings, and emitter resources survive.
Expression length, nesting, node, and execution limits remain enforced.

**Verified tests:** A targeted test verifies rejected statements, preserved variables, comparisons, quoted punctuation, and trailing whitespace.
Existing float tests now exercise leading fractions, negative fractions, and trailing decimal points.
The native-reference test matches all 41 compilation admission results.
Emitter tests retain valid particles after unfinished or leading-semicolon direction expressions.
All four projects build with 1,049 passing Java tests, 121 optional skips, and no failures or errors.
The selected Molang and effect suites pass 22 tests with four unrelated optional references skipped.

**Verified runtime:** Complete direct and ViaProxy replays preserve the CubeCraft scene hash `ede0e43b2874418cbb6b62135898efe0553009307d33fecd0f258383643d5d83`.
Both retain all 311 skin updates and pass transport and rendering checks.
Eleven authored direction fixtures use production resource loading, simulation, and visual extraction.
The new controls preserve malformed-statement recovery and expose the expected `.5` direction value.
Both routes also complete forward rendering and all three improved-transparency stages for translucent and additive particles.
No particle loading, initialization, or observer errors occur.
These checks verify packaged integration without establishing native image or timing parity.

**Remaining:** Complete lexical admission, complex-expression results, SDK runtime context, typed schema dispatch, interpolation, and native visible comparisons remain unverified or incomplete.
Core Molang processing still uses a separate parser and needs the same admission review.
All other coverage requirements remain active.

## Consume core Molang parsing and statement results

Animation and particle programs now use ViaBedrock core parsing and evaluation.
This removes the duplicate client parser and numeric-suffix normalizer.
Actor queries, variables, and execution limits remain in the client.
Native constant statement evaluation verifies zero default results, explicit returns, and selected conditional returns.
The [coverage ledger](../../../docs/bedrock-coverage.md#shared-core-molang-grammar-and-statement-results) records the native boundaries, route tests, and remaining gaps.


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

## Shared core jumps and native float loop counts

Animation and particle programs now use core control flow and its shared execution budget.
Nested returns preserve numeric and string results and stop later mutations.
The pinned native VM executes positive fractional counts and does not clamp a count of 1,025 to 1,024.
The duplicate client equality helper, loop clamp, and iteration guard are removed.
AST size and depth limits remain at the client boundary.
The [coverage ledger](../../../docs/bedrock-coverage.md#shared-core-molang-jumps-and-float-loops) records native evidence, supplied boundaries, and remaining gaps.

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

## Shared billboard temporaries

Billboard size, ordinary UV fields, and custom direction expressions now share a core evaluation group.
Nested evaluation uses the active group, and completion or failure releases it.
Copied actor environments retain persistent variables without inheriting temporary storage.
Tests cover native field order, repeated samples, nested groups, current values, copied actors, and failure cleanup.
Particle component tests match 66 native declarations and 330 samples.
The [coverage ledger](../../../docs/bedrock-coverage.md#shared-temporary-variables-in-billboard-expressions) records the native boundaries and remaining scope, flipbook, and missing-value gaps.
All four projects build with 1,065 passing Java tests and 120 optional skips.
Complete 240-second CubeCraft replays pass through direct and ViaProxy routes.
Each preserves 311 skin updates and verifies 77 authored direction cases plus two material controls.
No active capacity rejection or observer error occurs; native image and timing parity remain unverified.

## Shared missing-value semantics

Client numeric, string, animation, and particle programs now receive missing-member fault behavior from ViaBedrock core.
Null coalescing retains zero and empty strings, and failed reads preserve earlier writes.
Rejected assignment chains recover through the existing particle expression boundary.
The regression verifies that neighboring fields and the emitter remain available after recovery.

The [coverage ledger](../../../docs/bedrock-coverage.md#missing-molang-values-and-fault-propagation) records target-build comparisons and the remaining embedded-assignment gap.

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

## Native flipbook reader and component order

The client stores flipbook size and step as constant floats, separate from base-coordinate and frame-count Molang programs.
Frame count evaluates before base V and base U within the shared core group.
The reader uses zero FPS by default, recovers typed fields independently, and preserves native integral texture dimensions.
A present invalid flipbook section ignores ordinary UV expressions; null retains the enabled component with defaults.
Rejected expressions recover, while source length, node, and depth limits still fail explicitly.

The [coverage ledger](../../../docs/bedrock-coverage.md#flipbook-field-types-and-evaluation-order) records the matching build, reader behavior, and execution boundaries.
The matching native reader/compiler/VM/updater passes 104 declarations and 520 samples.
The 492 earlier numeric frame samples and 133 expression declarations also pass.
All four builds pass with 1,121 Java tests, 75 optional skips, and no failures or errors.
Core Checkstyle passes.
Older scheduling fixtures now initialize their supplied counters or coalesce an unavailable source field explicitly.
Their native expression callbacks do not establish Molang evaluation behavior.


Complete 240-second direct and ViaProxy CubeCraft replays preserve the unchanged scene payload and all 311 skin updates.
Each starts 95 flipbook definitions, 20 earlier direction and sharing definitions, and two material controls through production loading and playback.
Reader states and 475 controlled samples from the loaded components match the native reference on each route.
Both final runs report no active capacity rejection or observer error.
The runtime batch excludes three nonfinite-UV cases and six additional dimension cases; the full native unit comparison retains them.
An initial oversized fixture batch reached the unchanged asset-cache limit; reducing the test batch leaves room for real scene assets.
Both material controls submit forward draws.
Improved transparency, complete actor/world contexts, native images, and timing remain unverified.
Reviewed screenshots retain custom lobby models, banners, the hanging cube, hotbar icons, overlapping labels, and the Java tutorial toast.

Forward native particle materials now register opaque or translucent shader families for Iris.
The pinned shader replay reports missing particle overrides before this integration.
The mapping preserves native blending and depth state; shader packs use the forward path.
Semantic tests cover all four material families and their vertex bindings.

The full add-on build and all nine pipeline mapping/state tests pass.
The pinned CubeCraft shader replay passes transport and rendering checks with no missing Bedrock pipeline overrides.
The shader screenshot shows drawable custom actors and supplied player geometry without the corrupt triangles.
Validation uses the private Linux/NVIDIA lab; macOS/Apple GPU confirmation remains outstanding.

The matching replay without Iris installed also passes transport and rendering verification.
It preserves all 216 recorded geometry skins, local and remote native submissions, and all 31 custom actor types.
Its screenshot retains the ordinary first-person arm and drawable actor geometry.

## Native particle frame scheduling, October 7, 2026

The pinned PC client uses two frames between particle dynamics and appearance updates.
The platform getter `0x140159bb0` returns two through virtual slot `0x6d8`.
Caller `0x1447e9561` passes that value into `ParticleSystemEngine`.
The engine stores it at offset `0x10f0`, and emitter creation copies it to offset `0xd0`.
The target remains Bedrock `1.26.51.1`, protocol `2193`.

The add-on now drives particles from a monotonic render clock.
Each emitter keeps separate dynamics and appearance counters.
Each incoming delta retains values below 101 ms and caps larger values at 100 ms.
Skipped dynamics frames accumulate those capped deltas.
A scheduled dynamics update consumes their sum without another cap.
These changes apply to the shared renderer for server, actor, animation, and fishing effects.

The runtime stores previous position, direction, and rotation before scheduled dynamics updates.
Newborn particles initialize that history after their first motion update.
Appearance preparation stores previous size and float RGBA channels.
Newborn appearance history initializes after preparation.
The dynamics counter controls position, direction, and rotation interpolation.
The appearance counter controls size and color interpolation.
UVs retain the current prepared values.
Color channels retain float precision until the renderer packs the final interpolated color.

Native render startup suppresses output while appearance or dynamics history is insufficient.
A nonzero particle duration below `150_000_001` ns allows early output and forces a second appearance preparation.
New manual particles receive appearance preparation even during skipped refresh frames.
Their first appearance sample cannot interpolate from an empty size or tint.

Independent native execution covers 240 scheduling frames across 40 schedules.
It executes the elapsed cap, accumulation, counters, motion snapshots, and render startup gate.
The probe supplies resource pointers, context validity, and prepared particle durations.
Appearance preparation records its native force argument without executing component callbacks.
The probe stops before full simulation and final render construction.

Another 72 cases execute the native rotation, size, scale, and float RGBA interpolation instructions.
They supply snapshots and independent interpolation factors.
All results match the production float helper exactly.
The existing 180 native position cases now use the same interpolation helper as production rendering.
These fixtures exclude complete component dispatch, GPU output, and native visible comparisons.

Portable runtime sequences cover separate motion and appearance histories, current UVs, float tint precision, and newborn initialization.
They also cover short-particle startup, manual births, skipped updates, and elapsed accumulation above 100 ms.
The full add-on build reports 601 tests, zero failures or errors, and 69 optional skips with the private native fixtures enabled.
The owning patch retains these changes, and all 30 add-on patches replay.
Binaries, licensed assets, native fixtures, and observers remain private.

Fresh Linux strict BDS runs exercise actual rod input through direct and ViaProxy connections.
The observer records 667 particle render frames directly and 942 through ViaProxy.
Their update cadence, startup visibility, and independent interpolation factors match the native counter schedules.
Another 733 halfway-position triplets match production world-space output within the documented float rounding allowance.
Both casts remove their hooks. The ViaProxy cast also records one durability point.
These observations cover renderer extraction, not final GPU pixels or native image parity.
The direct run ends after its controls through the recorder's cancellation path.
The ViaProxy run ends through the reviewed private completion marker.
Both preserve spawn and gameplay evidence. The cancellation exit is not a connection failure.
The final artifact passes a fresh direct BDS join after removal of the unused partial-tick argument.
It verifies another 222 render frames and 100 halfway-position triplets.
The fixture returns to its original checksum, and both user-owned servers retain their process identities.

## Fishing tease splash expiration, October 7, 2026

The licensed target splash graph expires particles outside `minecraft:air`.
Its point shape places a new particle half a block above the integral tease origin.
Water at that sampled cell therefore expires the particle; air retains it.
This follows the [documented block-expiration predicate](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponents/minecraftparticle_expire_if_not_in_blocks?view=minecraft-bedrock-stable).
The target asset and executed native predicate establish the version-specific result.

Twenty native controls use recorded tease origins, negative heights, water, and air.
They execute the real predicate, origin getter, cache flag, and hash membership.
Prepared block identities, the resolved air set, and CRT floor remain supplied.
The production test loads the licensed graph privately and verifies its birth offset, block query, survivor count, expiration, and available visuals.
A zero-time update isolates birth and expiration; it does not reproduce the full native frame scheduler or collision sequence.

This explains the empty simulation output at water cells without removing the native asset's expiration rule.
Full native scheduling, collision, final pixels, audio, later fishing physics, and the complete gameplay matrix remain required.
No new live-server, CubeCraft, Boar, Windows, or macOS join is claimed by these component checks.

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

## Native actor picking

The addon accepts `viabedrock:actor_picking` separately from `actor_state_v2`.
ViaBedrock supplies one nonphysical Interaction target per native picking box.
The addon applies exact X/Y/Z bounds to those owned targets.
The original actor retains its physical dimensions and position.

Private Bedrock 1.26.51.1 (build 51061372, protocol 2193) execution binds metadata 118 to the native `HitboxComponent`.
The decoder reads FloatTag `Min`, `Max`, and `Pivot` components from the `Hitboxes` list.
Missing or differently typed components become zero.
The position producer sorts endpoints and recenters extents around actor position plus pivot.
Finite zero extents remain valid entries.
The captured Discord actor supplies a separate 1×2×1 picking box despite zero physical width and height.

Existing Java 26.3 predicates determine owner eligibility.
Proxy targets inherit root-vehicle and inside-pick behavior from their owners.
The original actor stops participating only while current negotiated picking parts exist.
Empty metadata restores the ordinary actor target.
Connection identity, generation, and actor lifetime reject stale updates.
Local player targets and conflicting proxy identities are rejected.

Eighteen targeted core and addon tests pass in private compilation.
They cover typed decoding, sparse updates, multipart movement, alias hit coordinates, empty restoration, removal, codec bounds, and lifecycle rejection.
Exact rectangular clipping tests retain multipart gaps and rays shortened by blocks or reach.
These tests do not establish native radius callbacks or exact boundary behavior.
The addon retains Java clipping without guessed margins.
Full stack builds and live joined NPC click acceptance remain pending for this candidate.

## Native actor unique ID channel

Advertise `actor_state_v3` alongside the unchanged v2 payload. Both receivers use
the same connection and generation guard. The registry resolves signed native
unique IDs to actual Java UUIDs, including the local player. V2 never fabricates
a unique ID from its runtime ID.

The target Bedrock 1.26.51.1 portrait consumer resolves `#entity_id` through the
Level unique ID lookup. Its exact class admission and GPU output remain separate.
Seven actor state tests run: four pass and three optional native-reference cases skip.
The added behavior test covers the local alias, stale removal, codec downgrade,
upgrade and disconnect clearing. The full 31-patch stack replays with normal hooks.
The combined portrait candidate passes 706 tests: 588 passed and 118 optional fixtures skipped.
The full 31-patch replay, Gradle check, build, POM and access-widener gates pass.
All 1,304 embedded core entries match the private actor-UID candidate.
Legacy-channel downgrade clears UID capability without inferring a runtime-ID alias.
The candidate is private; actual client drawing and Iris compatibility remain pending.

## Mixed particle motion

The CubeCraft lightning trail combines dynamic and parametric motion.
The parser now accepts both components and applies parametric overrides after dynamic motion.
Position, velocity direction and rotation are independent optional fields.
Omitted fields keep their previous state.
Parametric position replaces the position without adding the emitter shape origin.

Bedrock 1.26.51.1 registers and executes both callbacks in this order.
Its original parametric update at `1461ca960` supplies the versioned evidence.
The executable identity and native float thresholds are recorded in the patch body.
The targeted emitter regression passes.
All 48 executed native constant cases match the Java implementation.
Native code and probe results remain private.

## Native entity selection and external variables

Select the highest compatible `min_engine_version` for each client entity in a pack. Cap compatibility at the pack engine and target Bedrock version. Preserve entity inheritance across pack layers. Reject conflicting definitions only at the selected version.

[Microsoft documents this version selection](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction?view=minecraft-bedrock-stable). Tests cover all six candidate orders and preserve rejection of conflicting selected definitions.

Build mutable member structures for dotted external Molang variables. The target shulker graph reads `variable.Shulker.PeekAmount` and `variable.Shulker.FacingDirection`. Tests cover those reads and authored writes to sibling members.

## Upstream prerequisites

- [viabedrock patch](../../viabedrock/upstreamable/0064-share-native-float-molang-runtime.pr.md): Publish the shared native float parser, math and control-flow API.
- [viabedrock patch](../../viabedrock/upstreamable/0015-transport-native-resources-and-sound-commands.pr.md): Publish native resource, sound and block snapshot contracts.
- [viabedrock patch](../../viabedrock/upstreamable/0099-bridge-native-actor-picking-hitboxes.pr.md): Publish the negotiated picking message used by the actor adapter.
- [cubeconverter patch](../../cubeconverter/upstreamable/0002-preserve-actor-lighting-controls.pr.md): Publish ordered render-controller visibility declarations.

Shared controller commands also require the [core animation command contract](../../viabedrock/upstreamable/0085-resolve-server-effects-relative-to-their-actor.pr.md).

## Shared visibility declarations

Use CubeConverter's public declaration parser after the client validates rule counts, pattern lengths and value types. Normalize null and boolean values to numeric expressions before parsing. This preserves the existing client fallback semantics while CubeConverter retains its original expression representation. Ordered wildcard rules and repeated declarations remain intact.


## Shared physical bounds transport

The shared actor bridge now owns the existing native-bounds payload, receiver, and lifetime-aware accessors.
These declarations previously lived in the later UI patch.
Camera targeting and UI actor views consume the same bounds state and register the channel once.
This move preserves the payload format and does not change native dimension calculations.

## Native world inputs

The block mirror now consumes the core's negotiated `block_identifiers_v3` channel.
It retains both native layers, runtime IDs and state properties for client world queries.
Particle expiration continues to read only the primary layer.
Its integration test verifies that changing the extra layer cannot change a primary-layer filter result.

The receiver captures its connection and rejects queued work after disconnect or connection replacement.
Dimension changes clear the mirrored data before new snapshots apply.
These changes prepare the world source for aim assistance; target selection and reticle rendering remain unfinished.

The live BDS 2193 control recorded 39 samples, including 30 with a local player.
It exercised dry and wet stairs, rotation, removal and restoration.
Observed runtime IDs match incoming block updates in order for each tested position and layer.
The run completed normal cleanup, and its private observer and server script were restored.


## Native scale for player actors

A fresh CubeCraft recording exposed player-skin actors with scale updates that the Java renderer ignored.
The server supplied the same skin pixels for four lobby actors and the local player.
Each lobby actor started at scale `0.0001`.
Later updates selected scale `1` for visible previews and scale `0` for a hidden actor.
Java kept render scale `1` for the hidden actor despite its native scale `0`.

The shared living renderer now reads the retained native scale during render-state extraction.
This applies before the body, equipment layers and shadow extraction.
It preserves zero and small values without the Java attribute clamp.
Actors without a native snapshot retain their Java scale.
The change does not alter actor yaw or replace the skin that the server supplied.

A private replay compared the original artifact with the rebuilt artifact against the same protocol-2193 recording.
Both runs used a private display, zero volume and a controlled camera view.
The same hidden actor retained native scale `0` and Java attribute scale `1` in both runs.
Its actual render state used scale `1` before the fix and scale `0` after the fix.
Ordinary actors retained render scale `1`.
The replay slices verify this render-state change, not complete native orientation or scene parity.
The recording, skin pixels, observer, screenshots and actor identities remain private.

All four projects build with 2,122 passing tests and 152 optional skips.
Offline validation passes all 261 tooling tests and patch metadata checks.
All four stack health reports contain no errors.


## Native body rotation for remote players

Use the target player's body control for remote player actors, including server NPCs.
The generic mob body control has different rules and does not apply here.
The player control keeps its movement threshold, turn smoothing, soft turn limit and passenger branch.
It wraps angles with native float operations before Java extracts the render state.
The adapter uses float positions and the existing translated swing state.

Bedrock 1.26.51.1 supplies the versioned evidence.
The player constructor selects its body control through virtual slot `0x558`.
Its control callback is `14387a200`; the body-control system invokes it through `144893380`.
The executable identity appears in the patch body.
All 2,268 direct and 320 chained native system callbacks match the Java calculation bit for bit.
The native fixtures use the original player control, system normalization and official UCRT math.
They cover movement thresholds, standing half turns, swings and passengers.
Native code and fixtures remain private.

This change does not establish complete native movement interpolation or swing timing.

A private lobby replay compared the previous scale-fixed artifact with the body-control artifact.
The same player NPC retained its server yaw, head yaw and scale in both runs.
Its body angle changed in both the entity and the extracted render state.
The observer reported no errors, and every owned process completed normal cleanup.
These short replay slices verify client integration; they do not prove complete scene parity or resolve the reported visible facing issue.

All four projects build with 2,125 passing tests and 152 optional skips.
Offline validation passes all 261 tooling tests and patch metadata checks.
All four stack health reports contain no errors.

## Grouped animation references

The licensed 1.26.51.1 camel controller groups adult and baby animation aliases in one object.
The previous reader rejects that valid object and prevents the whole graph from loading.
Read every weighted alias in controller states and root animation entries.
Keep declaration order and the existing total reference limit.

The regression samples grouped root and controller references with conditional adult and baby weights.
The bundled camel test uses the actual licensed controller through the ordinary world appearance resolver.
These tests do not establish native evaluation order for object members with side effects.

The grouped-reference regression and bundled camel standing/sitting tests pass.
The complete dependency build passes 2,132 tests, with 152 optional skips.
A private client comparison confirms native camel model submissions after the parser and query bindings are corrected together.
The world actor patch records that runtime check and its limits.


## Repeated animation identifiers in lobby packs

CubeCraft's target-protocol recording contains two different definitions of `animation.cubecraft.logo.idle` in one pack.
The shared library rejected the complete animation catalog, preventing the player graph from loading.
The older server-animation path allowed replacements, so the two production paths disagreed.

An executable fixture runs the original animation-definition registration helper in Bedrock 1.26.51.1 build 51061372.
It covers nine registrations, including six replacements, with independent identifiers between replacements.
Every replacement installs a new complete definition and destroys the old data without removing other identifiers.
The fixture executes registration, native hash lookup and insertion, allocation, reference accounting, and replacement destruction.
It supplies an initialized manager, non-owner metadata, uncontended mutex calls, allocator/free, CFG, and finite CRT helpers.
Default Molang compilation is a fixture boundary. Whole-file decoding and native file enumeration are outside this probe.

The shared library now replaces repeated animation identifiers in accepted file order.
It preserves that order when grouping bundled files and retains each winning definition's format version.
This gives the shared player-animation path the replacement behavior already used by the older server-animation factory.
The existing controller-loading paths remain unchanged because their native conflict rules need separate verification.
Tests sample bone poses after replacements and pack overrides, including discarded old bones and retained unrelated animations.
Other resource catalogs keep their existing conflict policy; this fixture does not establish their native replacement rules.

The probe also observes lowercase name construction in native animation registration.
The definition-name follow-up below establishes the separate native rules for definition registration and reference lookup.
The captured duplicate uses the same lowercase identifier in both files.


The rebuilt client completes a 300-second CubeCraft replay through SkyWars EU1, MinerWare EU2, and Parkour EU1.
Its player graph resolves 200 animations and 12 controllers; observed renderer playbacks produce changing bone poses.
There are no player-graph or skin-alias loading errors. All 320 skins and geometry records install.
The audit counts 26,716 remote-player render frames. Transport passes; rendering still fails on unresolved mappings.
The final replay terrain is incomplete, unlike the original live Parkour screenshot. Replay terrain delivery needs further investigation.
These checks establish restored graph loading and execution, not native visual parity.

All four projects build with 2,150 passing tests and 152 optional skips.
All 38 client patches replay. Offline validation passes 263 tooling tests and metadata checks.
The four replay self-test groups pass. The seven owned test processes close normally.


## Native animation definition names

The Bedrock 1.26.51.1 definition converter folds ASCII uppercase bytes before animation registration.
The original public group lookup keeps the reference spelling supplied by the caller.
A private executable probe covers all 256 byte values in short and heap-sized strings, plus long ASCII and mixed Unicode input.
All 514 conversion cases match ASCII folding. Four original group-lookup controls find the lowercase registration and leave differently cased references unresolved.
The original registration, hash construction, lookup, reference accounting, and replacement logic execute.
The fixture supplies manager metadata, allocation/free, uncontended mutexes, CFG, finite CRT helpers, and the default Molang compilation seam.
File-schema admission, native file enumeration, and rendering parity remain outside this fixture.

Animation registration now uses the verified conversion in shared libraries, the legacy server factory, and direct JSON graph input.
Apply it before identifier replacement, so case-colliding definitions keep the last complete value.
Preserve Unicode characters and reference spelling.
Pose tests cover bundled and accepted libraries and direct JSON graphs, including replacement bones, retained unrelated animations, and unresolved differently cased references.

All four projects build with 2,151 passing tests and 152 optional skips.
All 38 client patches replay cleanly. Offline validation passes 263 tooling tests and metadata checks; all four replay self-test groups pass.

A fresh 180-second live CubeCraft connection sends selector responses 2, 6, and 7 and reaches SkyWars EU1, MinerWare EU2, and Parkour EU2.
Terrain and scoreboards appear in each destination. A verified ray hit on the cosmetics shop's interaction entity precedes an authored shop menu opening.
The player graph resolves 200 animations and 12 controllers and produces changing sampled poses without graph-loading errors.
All 191 skins and supplied geometry records install, with 4,993 remote-player render frames and 107,666 custom-actor render frames.
The six owned processes close normally. Native visual parity, including cosmetic-preview facing direction, remains open.


## Particle atlas paths outside the textures folder

Particle definitions now accept validated paths relative to the resource pack root.
They no longer require the `textures/` prefix in either the emitter parser or the image lookup.
This fixes Galaxite's `galaxite:gem_bag_particle`, which selects the existing `font/glyph_E1.png` atlas.
The shared native actor archive already retains PNG and TGA images outside the textures folder.
Existing archive path validation and image limits remain in place.

Native evidence comes from Bedrock 1.26.51.1, protocol 2193, executable SHA-256 `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`.
Function `142152f40` reads the texture field and copies its string without adding or checking a folder prefix.
A private probe executes instructions `142153906..142153a4b` with the original native JSON and string helpers.
Nine string cases retain their values, including font, custom-folder, root-level, long, and Unicode paths.
Three non-string cases fail the native type check.
The probe enters after material dispatch and excludes complete schema loading, later resource lookup, and rendering.
CRT byte/string operations, allocation, frees, and diagnostic backends use declared host boundaries.
Field admission alone does not prove that a later native resource lookup succeeds.

Validation:

- All 38 add-on patches replay successfully.
- Converter, core, and add-on builds pass 2,353 tests, with 152 optional skips and no failures or errors.
- A targeted test carries generated PNGs through the native actor archive, pack reconstruction, image decoding, and emitter output.
- That test covers font, custom-folder, and root-level paths, retained alpha, and rejected traversal paths.
- A content-hash audit checks 1,516 particle documents across 82 exported pack archives from 29 recorded connections.
- Outside the textures folder, it finds the Galaxite atlas and five invisible underscore placeholders.
- The complete plain Galaxite replay passes transport checks and extracts 4,112 gem-bag particle quads across 384 native particle frames.
- The matching Iris replay passes transport checks and extracts 1,614 gem-bag quads across 73 native particle frames.
- Both routes have no particle-load or observer errors.

Those particle validation runs also report unresolved marker geometry and the camera item texture.
The CubeConverter patch now retains the marker declaration when optional fields are absent.
A missing waterlogged block-state warning also remains in the client log.
This change does not establish native pixel parity or complete particle material behavior under arbitrary shader packs.
Raw packs, native exports, observer code, and recordings remain private.


## Authoritative fluid queries

Client-world and direct chunk queries now select fluid from the native block mirror.
Vanilla render regions and the optional Sodium 0.9.2 `LevelSlice` getter use the same source.
The adapter preserves all mapped water and lava levels, including falling states.
It retains vanilla queries for ordinary Java worlds, unknown native definitions and unavailable native world data.
It also rejects nonliquid Java states in fluid dictionary entries.

The target-native layer selector passed 180 pinned-binary cases, as recorded in the core transport sidecar.
The client decoder tests every Java water and lava block state.
The earlier query-only validation passed 2,360 tests, with 152 optional skips and no failures.

The mesh integration below now replaces direct block-state fluid reads in both supported mesh builders.
Native fluid face occlusion, vertex-height parity, complete current simulation and native visual parity remain open.


Two fresh 40-second Galaxite replays validate the getters against recorded native fluid layers.
Each run retains 7,174 secondary-fluid cells and samples 256 of them.
The plain client reports zero mismatches through the client world and vanilla render-region getters.
The Iris client also checks Sodium 0.9.2's `LevelSlice`, with zero mismatches across all three query surfaces.
The region and Sodium getter probes construct query objects for the current client level; they do not test generated fluid meshes.
Transport verification passes; the broader rendering check still fails on unresolved mappings, including the camera texture.


## Secondary fluids in chunk meshes

The core represents fluid over native air as a Java fluid block so section-level empty checks retain it.
Both vanilla and Sodium 0.9.2 chunk compilers retain the native fluid beside each primary block.
A cell is skipped only when its primary block is air and its selected fluid is empty.
The fluid renderer receives the selected fluid while the primary block still supplies geometry and occlusion shapes.
This includes secondary fluids whose Java carrier has no waterlogged state, and fluids with an air primary block.

Neighbor fluid reads now use the corresponding native positions for face selection and height sampling.
Sodium's hidden-fluid exposure walk also reads the native current and upper cells.
The lookup uses primitive coordinates in the mesh loop and neighbor paths to avoid extra position allocations.
Unknown native definitions and ordinary Java worlds retain the original Java fluid result.
A known dry native cell can override a fluid-bearing Java carrier.

Current project test results total 2,364 passing tests, 152 optional skips and no failures.
Targeted tests distinguish known dry states from unavailable native data and keep adjacent fluid selections independent.
The native selector evidence remains the 180-case pinned-binary probe in the core transport sidecar.
This change does not replace the existing face-occlusion or vertex-height algorithms with a proven native equivalent.


Native fluid updates now invalidate their affected render sections even when the Java carrier state stays unchanged.
The invalidation range covers two horizontal blocks and one vertical block, including Sodium 0.9.2's five-by-five hidden-fluid exposure walk.
Equivalent fluid selections do not schedule another rebuild.
Section replacements and chunk removal also invalidate their dependent regions.
The update tracker follows dimension resets and connection/level clears; dirty coordinates stay within the integer block-coordinate section range.
Targeted tests cover wet/dry changes, equivalent runtime aliases, near-boundary samples, resets, ignored dimensions, chunk removal and integer limits.


Two final 40-second Galaxite replays pass transport verification without mixin or observer failures.
The plain renderer emits 80 vertices for fluids whose native primary layer is air; Sodium emits 72.
These counters include repeated chunk builds and do not measure distinct blocks or pixel equivalence.
Java now represents those cells as fluid blocks, so whole sections also survive empty-section checks.
The plain renderer also emits 4604 vertices for fluids absent from the primary Java block state.
Sodium culls the sampled solid-bedrock fluids with its existing occlusion rules; that difference does not establish native parity.

Each replay includes a synthetic client-side control on the recorded wet bedrock state.
It removes and restores the native secondary liquid without changing Java block state 88.
The world fluid query transitions wet, dry and wet, and each run records two rebuild invalidations attributed to those exact control messages.
The original layer is restored before the test ends.
This verifies the update bridge, not native server inventory actions or native fluid simulation.
The broader rendering audit still fails on existing unresolved mappings, including the camera texture and unregistered `galaxite:loading_fx` actor.


## Share the native basis reset

The actor transform helper exposes its existing basis reset for equipped bone bindings.
Ordinary composition retains its translation, rotation, and scale order.
The reset preserves the translated origin and clears the inherited basis.
Native composition `0x141bc3d20` uses this operation after a binding supplies its copied owner matrix.
The equipment patch records the native binding controls and their boundaries.

All four builds pass 2,522 tests, with 212 optional skips and no failures or errors.
The native binding fixture, native slot fixture, and Iris GPU regression run without skips.
All 1,410 core classes match both packaged copies. All 1,134 production client classes match the add-on.

## Particle creation query context

A new emitter now starts with an unbound query context before lifetime configuration and its first creation expression.
Animation pre-effect variables survive. Captured actor queries and animation clocks do not.
Previously, animation roots retained actor queries until their first context refresh, while event children started with fresh queries.
Missing-query tracking now belongs to the new emitter, so unbound creation cannot invalidate its animation owner's query coverage.
Later context refreshes, child initialization, loop restarts, and reused emitters keep their existing query and variable behavior.

The pinned Bedrock 1.26.51.1 executable initializes the actor and count-owner pointers to zero before first creation.
The probe runs original factory `0x14216ba90` through first creation dispatch in `0x142157210`, starting with an allocation filled with `0xa5`.
The supplied transform has translation `(3, 4, 12)`, and the manager camera is `(-1, 8, 10)`.
Eleven original scalar and count callbacks return zero against that captured context.
They cover actor speed and water state, generic animation clocks, camera distance, and all four particle counts.
The binary SHA-256 is `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`.
Allocation, bounded CRT copies, mutex operations, resource lookup, and the component callback are supplied boundaries.
Random-variable registration is explicitly skipped.
This verifies the constructor query boundary. It does not execute native JSON/Molang evaluation, actor admission, or visible rendering.

Two regressions cover unbound construction, lifetime expressions, pre-effect variables, owner query coverage, refreshed initialization, and loop restarts.
Existing schedule controls install their synthetic tracing queries after construction.
Their callbacks observe scheduling and dispatch rather than testing actor-query inheritance.
Private licensed asset comparisons use files from the checksum-verified versioned archive, with unchanged decoded particle expectations and native receipts.

Both new regressions fail against the previous implementation and pass after the correction.
Two deliberate variants retain shared missing-query tracking or reset refreshed queries on every loop restart.
Each fails its corresponding regression. The restored implementation passes.

The combined four-project build passes 2,574 tests, with 167 optional skips and no failures or errors.
The retained native particle fixtures, native attachable comparisons, and Iris GPU regression run without skips.
Licensed asset comparisons cover 115 base particle definitions, 108 versioned overlays, and real drip sound resolution and decoding.
All 1,411 core classes match both packaged copies, and all 1,134 production client classes match the add-on.
This checkpoint verifies CPU context boundaries and existing Java integration tests.
Fresh live particle rendering, actor admission and query producers, complete child lifetimes, and native visible parity remain open.

## Fresh common particle actor inputs

Particle attachment sampling now refreshes common actor inputs from the current Java actor and transported native snapshot.
The refreshed queries are `is_alive`, `is_on_ground`, `is_in_water`, `ground_speed`, `variant`, `mark_variant`, `property`, `has_property`, and `spellcolor`.
Packet-driven particles receive native metadata that their previous eight-query map omitted.
Player, custom-actor, and world-actor animation attachments use the same sampler.
They preserve unrelated graph inputs and the existing locator pose without advancing the actor animation again.
Each returned map retains its own immutable values, including typed native properties.
An absent native snapshot clears retained properties, variants, and spell color.
Server bindings reject changes to a captured native lifetime.
Player bindings also reject a changed lifetime before actor removal, while preserving their existing retained-registry path.

Eight controls execute the pinned native initialization gate `0x1421603e0` and context refresh `0x142159bd0` once.
They then change motion and water components in place on the same bound actor.
Original callbacks `0x14220ecd0` and `0x14220f040` read every changed value without another context refresh, actor animation, or render pass.
The target and binary checksum are the same as the constructor controls above.
Actor resolution, level and physical-component getters, variable access, and expression dispatch are supplied boundaries.
Native property evaluation, live server behavior, and GPU drawing do not run in these controls.

Eight query tests pass, including the new native comparison and two producer regressions.
Existing particles change size and tint after new actor samples without another actor render in the Java fixture.
The tests retain particle variables, graph inputs, earlier snapshots, immutable maps, and typed properties.
They also remove stale metadata when no current native snapshot exists.

Remaining render-derived queries still use their existing inputs.
This change does not establish fresh locator animation, every native query producer, complete actor or child lifetimes, or native visible parity.

Three private variants keep stale actor inputs, retain missing metadata, or discard unrelated graph inputs.
Each fails its corresponding particle regression. The corrected sampler passes.
All four builds pass 2,577 tests, with 167 optional skips and no failures or errors.
The new native live-query comparison, retained particle fixtures, attachable comparisons, and Iris GPU regression run without skips.
All 1,411 core classes match both packaged copies, and all 1,134 production client classes match the add-on.

## Manual child ownership and retirement

Manual child handles now belong to their parent emitter until that parent retires.
A registered child still receives initialization after its emission lifetime ends.
A retired child leaves an initialized handle, so later requests cannot create a replacement or adopt another emitter in its registry slot.
Failed initial creation remains retryable.
Weak references keep those cached handles from retaining retired child runtimes.

Parent retirement expires its valid manual children and preserves their existing particles until natural death.
Grandchildren expire when their own parent retires, rather than when an ancestor first expires.
Registry removal and count updates precede retirement callbacks.
The manager retains its single traversal, so an earlier child that expires during later retirement can remain until the next batch.
Expiry callbacks retain the native ordering before emission closes.
Full-manager shutdown keeps its separate clear path and does not dispatch these retirement events.

Child construction also accepts automatic rate targets.
Their native manual-capacity slot returns zero, while the emitter remains available for ordinary updates.
The previous admission check rejected those targets before construction.

Forty-six controls use the pinned Bedrock 1.26.51.1 executable and checksum recorded above.
They cover two manual request kinds, repeated requests, initial factory failure, registered expiry, stale generations, invalid slots, absent arrays, null children, and shutdown.
Original leaf dispatcher `0x142164cb0`, weak resource lookup `0x142158740`, force expiry `0x14215cc60`/`0x142158940`, and manual emission `0x142160c20` execute.
The controls also execute original capacity getters `0x1462a4d10` with literal four and `0x140076c20` with zero.
Native instant and steady rate tables use the zero manual-capacity getter.

Parent destructor `0x142170320` executes through its child retirement loop, stopping before cache/resource cleanup at `0x1421703c2`.
Cache entries, generational handles, components, and emitter memory are supplied inputs.
Factory returns, initialization callbacks, context refresh, birth allocation, and source expressions are supplied boundaries.
The controlled expiry callback observes the native flag and tail-calls original manual emission.
The existing manager instructions decrement the effect count and retire the slot before invoking destruction.
These controls do not execute the native JSON/Molang VM, actual particle allocation, complete destruction, live server behavior, or pixels.

Nineteen focused tests pass, including the retained manager/count/dispatch schedules and all 46 new native comparisons.
The production ownership and emitter tests cover stale handles, independent owners, failed creation, rollback identity, automatic targets, particle draining, and grandchild retirement.
Four private variants recreate stale handles, omit child expiry, close emission before callbacks, or update counts after callbacks.
Each fails the relevant regressions. The restored implementation passes.

Complete native registry producers, actor removal lifetimes, graph/resource limits, and live particle rendering remain open.
The broader five-area production goal remains active.

All four builds pass 2,583 tests, with 167 optional skips and no failures or errors.
The child lifetime comparisons, retained particle fixtures, attachable comparisons, and Iris GPU regression run without skips.
All 1,411 core classes match both packaged copies, and all 1,136 production client classes match the add-on.
Reentrant emitter allocation during native destruction remains unverified.
