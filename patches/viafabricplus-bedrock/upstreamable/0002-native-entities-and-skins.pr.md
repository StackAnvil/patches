## Sampled masked materials, October 26, 2026

Support the target's nonemissive alpha-test `MASKED_MULTITEXTURE` family with two GPU images in one geometry draw. Preserve independent image dimensions and normalized UV sampling. Keep the mask separate from Minecraft's overlay sampler. Missing bindings retain the legacy custom-actor fallback, including older version-one snapshots.

Preserve authored per-face texture rotation in actor and skin models.
The [target-compatible geometry reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/visualreference/geometry.v1.26.40?view=minecraft-bedrock-stable)
specifies clockwise quarter turns before applying each UV rectangle.
CubeConverter preserves these angles in the shared geometry model.
The renderer rotates UV corners before cube mirroring and preserves vertices, normals and absent faces.
Java head icons receive the same rotation when projecting a custom skin atlas.
Ordinary faces avoid the extra corner rotation.

Two regressions fail against the previous consumers and pass with the change.
They cover all six faces, all four angles, mirrored cubes, signed UV rectangles and exact projected head pixels.
Existing head atlas tests also pass.
These are coordinate and image checks, without a new matched native graphical session.

The production shader passes all 512 original sampled masked fragment controls and the existing 672 ordinary controls at tolerance 1e-6. These compare color, discard, and depth with supplied sampling and buffer boundaries. A deliberate floor substitution fails; restoring native upward rounding passes. Native material selection, other constant/shared-input variants, sampler filtering, and graphical parity remain outside these controls.

The Iris bridge composes normalized primary-image reads before pack shading and tests native coverage at the original UV. It forwards sampler identity through helper parameters, prototypes, and overloads, while preserving unrelated images. A separate reserved texture unit retains overlay and lightmap bindings. A configuration plugin gates Iris hooks by the installed mod while keeping strict injection checks for that integration. GPU regressions cover ordinary, LOD, and gradient reads, mask overwrite/keep/discard, and reuse of shared native/Java programs. Geometry/tessellation transport and other sampling operations remain incomplete or unverified.

The full replayed four-project build passes 3,080 tests with 152 optional skips and no failures or errors. Packaged classes, shader assets, and embedded dependencies match the compiled inputs.

Fresh direct and Iris-enabled ViaProxy sessions change only the secondary image. Both show blue overwrite, red base retention, restoration and removal with one model and a stable native actor lifetime. The 16 × 16 primary and 13 × 9 / 7 × 11 secondary images keep independent dimensions. Native component events, received bindings, refreshed draw caches and eight reviewed screenshots support the checks. Runtime artifact hashes match the final build. These authored controls do not establish native graphical parity or fresh player-costume visual coverage.

The owning equipment, costume, hand, world, and portrait patches consume the ordered bindings. The bundled villager profession now resolves its masked pair. These changes do not establish complete pack, skin, or emote parity. Raw native assets, shader IR, controls, and screenshots remain private.

Install supplied player skin geometry even when its identifier uses the standard humanoid alias. Queue skin updates for their exact source connection while Java is still configuring, then install them in arrival order when the play listener becomes available. Disconnected sources cannot leak updates into another connection.

## Explicit default depth declarations, October 26, 2026

The target villager material declares `depthFunc: LessEqual`.
Material validation previously rejected this field even though the actor pipeline already implements that comparison.
The Java projection uses reversed depth, and the existing actor pipelines select `GREATER_THAN_OR_EQUAL` with depth writes enabled.
[Microsoft documents the depth comparison operators](https://learn.microsoft.com/en-us/windows/win32/api/d3d12/ne-d3d12-d3d12_comparison_func).

The resolver now retains the inherited depth function and validates its effective value.
An explicit or inherited `LessEqual` selects the existing material pipeline.
Other comparisons retain fallback, and a child can restore the supported comparison without losing inherited shader settings.
String fields reject numeric, boolean, null, object, and array coercion.
This change does not add a new depth mode or change shader arithmetic.

The bundled target `entity.material` has SHA-256 `a3966c3ad0e0f2f134bbc1b2145df652fe96030b890a9725e10ef671a482f7b4`.
It contains explicit `LessEqual` declarations for villager, zombie villager, and iron golem families.
This hash identifies the bundled normalized source; raw licensed assets remain private.

All 27 focused material, pipeline, and world graph tests pass without skips.
The bundled villager regression samples adult and baby geometry across all seven biomes with supplied stationary movement.
It resolves four surfaces and their native script scales, then checks masked profession fallback and supported-state recovery.
The full four-project build passes 3,067 tests, skips 152 optional tests, and reports no failures.


Fresh direct and ViaProxy sessions load the bundled villager client graph on BDS 1.26.51.1.
An additional ViaProxy session verifies the same transitions with Iris 1.11.7 and Complementary Reimagined r5.9.3.
Authored server component events change biome, age, and profession metadata; they do not replace the client graph.
Native packet journals confirm each typed biome, age, and profession transition.
Read-only observations verify four resolved surfaces, biome textures, adult/baby geometry, and native script scales.
Masked professions select Java fallback, and resetting the profession recovers the same actor playback and lifetime.
Removal retires the native snapshot on all three runs.
All 21 final screenshots receive visual review, and runtime artifacts match the build.

The white bar in these early shader captures is the configured RRLS reload indicator.
[Lifecycle controls](../../../docs/bedrock-coverage.md#shader-profile-reload-indicator-october-26-2026) show that it clears automatically after loading completes.
Complete Iris and native visual parity remain unverified.

Masked multitexture professions and other depth comparisons remain unsupported.
These checks do not establish full native appearance, aging, collision, or interaction parity.

Native actor rendering reports active missing geometry and textures. Inactive server variants do not produce rendering failures. Visibility uses the distance between the actor and the camera. Minecraft 26.3 supplies absolute camera coordinates, so the previous check hid nearby custom actors in lobbies far from the world origin.

Validation: queue identity, order and closed-connection regressions pass; the full addon suite has no failures. Recorded Geyser and CubeCraft scenes exercise the extended configuration phase created by custom block packs. The private CubeCraft replay checks all 240 skin updates and 37 advertised actor types, then requires native model resolution and actual player and custom actor submissions. Its terrain and packet payloads remain unchanged. No server assets are included.

Custom actor submissions use the outline color from the entity render state. In Java 26.3, the final argument of the seven-argument `submitModel` overload selects the outline color. The overload supplies the white tint separately. The previous `-1` argument therefore forced white outlines on every custom actor. The mapped 26.3 bytecode confirms that a nonzero outline color adds an outline pass. A saved official Bedrock 1.26.51.1 Hive scene has no such outlines, while the translated scene shows them. This change preserves outlines that the Java entity render state requests.

Select actor materials per bone using ordered wildcard overrides. Each draw keeps the full bone hierarchy and includes only its selected cubes. This preserves parent transforms and animation across mixed materials.

For `entity_alphatest` and `entity_alphatest_one_sided`, use the native alpha cutoff and culling rule. Only texture alpha strictly above 0.5 survives. An unlit controller bypasses block and sky light but keeps native directional shading in world space. Send its floating light multiplier through `DynamicTransforms`, so values above one remain valid. Bound the render type cache for changing Molang values.

The licensed Bedrock 1.26.51.1 Windows executable, CPU function `141eb6120`, and installed ENTITY DXIL establish these rules. The executable SHA-256 is `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`; target protocol is 2193. Native unlit light RGBA starts at white. Default overlay alpha is zero. The vertex shade is `0.45 - 0.1 * nx² + 0.1 * nz² + 0.275 * (ny + 1)`. Evidence and native assets remain private.

Validation: focused tests cover mixed material overrides and retained ancestor pivots and rotation. The actual vertex and fragment shaders pass 192 Mesa EGL numerical scenarios. These cover cardinal and rotated normals, alpha at the cutoff, fractional and above-one multipliers, and lightmap bypass. The owning feature build passes.

Scope: unsupported materials retain the existing fallback. This change does not claim full actor shader parity or render controller support through ViaProxy.

Resolve effective actor material inheritance before selecting the verified alpha-test shader. Higher packs replace complete definitions, including their parent. Apply define and state replacement, addition, and removal. Missing and cyclic parents use the existing fallback.

CubeCraft's saved banner uses `cc_lobby_banner:entity` with `ALPHA_TEST` and a controller that sets `ignore_lighting`. This selects the same one-sided alpha-test family as the target's built-in material. A private probe of the actual saved material documents resolves the banner with culling enabled. The renderer therefore keeps its native lightmap bypass and alpha cutoff.

The installed Bedrock 1.26.51.1 `entity.material` SHA-256 is `fb971460c91e30fa2071f703db699934671e92b5b62617056b68a57eb7cf3eef`. The saved server material SHA-256 is `bfdabff5a1aaae7d314966fa9ba71a244f4d6d9947300777ec1d4e3cbdcf7b61`. Assets and raw probes stay private.

Five focused tests cover inheritance, culling, whole-definition pack replacement, define removal, unsupported shader fields, invalid definitions, parent cycles, and independent pack caches. Together with the existing material tests, all seven cases pass. Unknown flags, states, shader overrides, and sampler changes retain the fallback. Unverified additive and mask effects retain the fallback.

Retain server actor scale in immutable render snapshots and scale the mesh around its native origin. The saved protocol 2193 CubeCraft scene sends FLOAT metadata index 38 as 1.7 for eleven lobby banners and 5 for its hanging cube. The target Bedrock 1.26.51.1 reference renders those larger meshes. Core controller evaluation binds the documented `query.model_scale` and reports scale-only changes, so both initial values and sparse updates reach this renderer. Client `scripts.scale` evaluation remains separate.

Numeric pose tests check origin stability and transformed vertices for 1, 1.7, 5, zero and negative scale. Snapshot tests check independent updates and copied model lists. Custom actor visibility already bypasses frustum geometry bounds. Converted display entities retain their zero width and height defaults. This change does not alter either route's distance policy.

A material document with a non-object `materials` field now leaves valid neighboring documents available. A semantic test covers null, array, boolean and string fields beside an inherited alpha-test material. Nine focused renderer and material tests pass. Raw captures and native assets remain private.

The target's `entity_emissive_alpha` family now uses its native inverse-alpha light blend. This restores colored, alpha-zero texels in CubeCraft's hanging cube. Only an entirely empty RGBA texel is discarded. Overlay applies before the blend, and controller multipliers affect only the lit contribution. Material inheritance selects both culling variants without accepting unrelated effects.

Bedrock 1.26.51.1 `Entity.material.bin` SHA-256 is `403efcc7777c9712176f6715f861c873e31d8e45d0b73b8e320bd29754789058`. Unmodified Lazurite 0.11 parses the exact `AlphaTestEmissive` pass at byte 1368400. Its sampled SM65 fragment SHA-256 is `3cd762aa42a07cb9d8557e0a4e890c3b2cdf72109673668914ce20a0795ddbdf`. DXIL establishes the discard, overlay, inverse-alpha blend, alpha output, and fog order. The vertex shader is identical to ordinary `AlphaTest`.

Validation: material tests cover inherited emission, culling, removal, replacement, and rejection of unrelated emissive effects. The actual shaders pass 672 Mesa EGL numerical scenarios at tolerance 1e-6. These include alpha-zero colored pixels, empty texels, fractional alpha, overlay, normals, and light multipliers. CubeCraft's galaxy material family remains unverified. Raw assets and shader exports remain private.

Explicit east and west UV faces now use the same model-space conversion as box UVs. The saved Bedrock 1.26.51.1 CubeCraft banner declares a west-only plane and uses a 90-degree bone rotation plus its camera expression. Its source and Java carrier yaw are both zero. The previous explicit-face path produced winding and normals with a camera dot product near -0.992 at three saved actor positions. The corrected path produces +0.992 with unchanged rotations and culling. This addresses the missing plane without changing its one-sided material.

Three semantic tests cover equivalent box and explicit lateral vertices and UVs, asymmetric east and west surface positions, and transformed one-sided winding across eight camera directions and four actor yaws. All 13 focused owner renderer and material tests pass. Actual banner pixels still require a new offline capture. Client script variables and the galaxy material family remain separate.

Controller UV transforms use the target Bedrock 1.26.51.1 ENTITY vertex
formula, UV times scale plus offset, with immutable per-draw matrices.
The native UVAnimation default is (0, 0, 1, 1). USE_UV_ANIM is supported
for the verified ordinary and emissive alpha-test families; unknown
shader combinations still use the existing material fallback.

Both ordinary and emissive actors now use the target's world-normal shade:
`0.45 - 0.1*nx² + 0.1*nz² + 0.35*OverlayColor.w + 0.275*(ny*TileLightColor.w + 1)`.
Java overlay alpha is the inverse of native overlay alpha. Native dimension
constructors and actor producer `141eb6120` establish vertical factor -1
in Nether, +1 in Overworld/End, and +1 whenever lighting is ignored.
Dimension identity comes from the native `ChunkTracker`, or the canonical
Java Nether key through ViaProxy. Shader variants retain this state per draw.

Ordinary overlay now applies before all RGB lighting, and output alpha
remains the source texture alpha. The sampled native AlphaTest fragment
SHA-256 is `4fc97f0d5c15c6d404fe895e473440b9f0de32b5cb16a78dee677489d3222172`;
shared vertex SHA-256 is `6d38198816c62b18d1ed4649968cab5269e5d49af503f1d01c5278a54c56de55`.

Validation: 8,064 private actual-GLSL cases pass at tolerance 1e-6 for
ordinary/emissive families, dimension signs, lighting bypass, normals,
overlay, inverse-alpha emission and alpha independent of Java tint and
lightmap alpha. The existing 192 ordinary, 672 emissive and 60 texture UV
cases also pass. Native assets and exports remain private.

Visible supplied player bodies now use the same native alpha-test shader as actors. Bedrock 1.26.51.1 selects `entity_alphatest` for both visible player controllers. That material inherits `entity_nocull`, and its shader keeps only texels with alpha above 0.5. The saved Hive scene supplies 49 skin updates without material overrides or a server player definition.

The renderer retains the server body visibility guard and the existing spectator, translucent and hidden outline routes. Each appearance caches its two immutable dimension materials. Semantic tests exercise visibility selection and actual pipeline culling, depth, blend and dimension states. Standard skins without supplied geometry, first-person hands and menu previews retain their existing renderer paths.

Explicit line breaks in actor names now produce separately centered rows. Component styles, translated arguments, Unicode characters and blank row spacing survive the split. The last row keeps the original baseline, light and depth behavior. Single-line components pass through unchanged. Four semantic layout tests pass both in the owning patch and the full stack; the fresh in-game comparison remains pending. Saved target Bedrock 1.26.51.1 Hive and CubeCraft NAME metadata supplies the versioned evidence.

Materials with `USE_MASK` or `Blending` in their defines now keep the verified alpha-test path. The target Bedrock 1.26.51.1 legacy bridge ignores these exact names. `USE_COLOR_MASK` selects a different effect, and a `Blending` render state still requires the fallback. Inheritance retains culling, emission and controller UV animation. This fixes the saved CubeCraft galaxy material falling back to a Java translucent shader and losing its UV transform and native lighting settings. No server or material name selects the change.

Native bridge `148ca7690` has a closed 22-entry define map. Caller `144b0d890` selects the baseline Actor shader for the galaxy's effective flags. Its `Change_Color` and `MaskedMultitexture` features remain Off. The installed `Actor.material.bin` SHA-256 is `8720b71a8e7b6c4d5e9c12b6a8293734919030559d1e3ca0ad452f532f3ae9e6`. Unmodified Lazurite 0.11 resolves `AlphaTest` at byte 2394534. The Fancy On SM65 fragment SHA-256 is `cb8cdc8e1f30077c97148ef36dad8b00c8491fbafb7b9d91c48b9a5b4da7e88d`. This shader samples one base texture, without masked overwrite. Its vertex shader applies the controller UV scale and offset. The saved galaxy texture is fully opaque, so its result does not depend on half-alpha equality. Native exports and assets remain private.

Validation: semantic material tests cover inherited no-op defines, UV removal, culling, emission, the distinct color-mask effect, unknown effects and blending states. Fresh visual comparison remains pending.

Explicit upper and lower UV faces now use the same model Y reflection as
box UV faces. Exact Bedrock 1.26.51.1/protocol 2193 parser addresses and
native normal tables are recorded in the commit body. Tests cover all six
surface positions and normals, asymmetric vertical bounds, and one-sided
zero-height planes beneath rotated, scaled roots. UV corner orientation
remains unchanged.

Apply native rider anchors before Java positions mounted actors. Bedrock 1.26.51.1 protocol 2193 source packets place two mounted player eyes at vehicle position plus vector metadata 56 rotated by negative vehicle yaw, within 1e-7 world units. The adapter converts the native vehicle/passenger origins and accounts for Java's passenger attachment once. Immutable actor UUID bindings preserve delayed link resolution and sparse metadata; missing or invalid vectors use the Java fallback. Dismount and removal clear the published anchor.

Three rider tests pass in the owning patch and full stack. The full-stack focused run also passes the unchanged native cape oracle at all four atlas heights, all five face cases, renderer origin tests and multiline nametags: 17 tests, zero failures, errors or skips. This corrects the add-on's native connection path. Ordinary Java clients behind ViaProxy retain Java attachment placement when native metadata is not exposed to the client. Matched local Hive and CubeCraft replays now exercise this path with the same packets and assets as the official reference.

Nametag placement uses retained scaled native AABB height plus .7 blocks. Unknown heights preserve Java attachment. ViaProxy can recover known non-default Interaction heights from translated metadata. Explicit zero-size native armor stands translate to Java marker state, which recovers the native .005 clamp. Other proxy actor types and default Interaction height 1 retain Java placement. Multiline text and ordinary unlit names require direct Bedrock or accepted converted server metadata. The native producer uses 10-pixel line advance, but the foreground origin is not yet traced. Keep the existing Java line spacing until both are established. Focused tests cover sparse scaled bounds, identity replacement, context gating, fallback attachment, multiline style, and name lighting.

Ordinary native names now keep opaque foreground glyphs in Java's see-through pass. Java 26.3 normally applies roughly half alpha to that pass. An actor covering the opaque pass therefore made names dark even with full-bright light. The scoped hook preserves RGB, background alpha, packed light, and depth-tested passes. Other connections retain Java behavior.

Versioned evidence: the official Bedrock 1.26.51.1/protocol 2193 Hive replay contains 462 full-green pixels and 561 full-white pixels in two name rows over a dark avatar. The native ordinary-name material is unlit. This establishes default opaque glyphs without a fitted color multiplier. The base actor and default player foreground getters return opaque white. Conditional player modes and arbitrary actor fades remain outside the verified behavior.

Validation: the final add-on build passes 447 tests with no failures, errors or skips. Focused semantic tests preserve foreground RGB and other display modes and connections. Runtime replay validation uses the same recorded packets and resource packs as the official reference.

Proxy marker recovery uses the same native .005+.7 world anchor as direct snapshots. It requires accepted native rendering metadata and a Java marker armor stand. Ordinary Java connections remain unchanged. Native scale zero alone does not imply marker state. Six focused anchor tests pass with no failures or skips. Java marker collision is zero rather than native .005 and disables picking; arbitrary proxy armor-stand sizes still need a native metadata bridge.

The native name producer also sets foreground alpha to 0.125 for sneaking actors and selects the depth-tested material. Java 26.3 instead uses at least 0.5 alpha for discrete names. The scoped hook captures the enclosing `seeThrough` argument and uses alpha byte 32 for the native discrete NORMAL pass, preserving RGB, background, light and ordinary opaque passes. The target producer is `141d55a60` with constant `14e61e13c` in Bedrock 1.26.51.1/protocol 2193. Twelve focused name and anchor tests pass. Internal native flag 129, special player modes and foreground billboard transforms remain unverified.

Final validation: the checked stack passes 789 tests with zero failures, errors or skips (11 converter, 331 protocol, 447 add-on). The Prism bundle passes. Local recorded Hive and CubeCraft direct replays pass native appearance validation with 49 and 240 installed skins respectively and no rejected skins. The final CubeCraft replay exercises the crouched-opacity hook with no Mixin errors. ViaProxy transport and corrected marker anchors pass, but its native appearance validation remains unsupported without a skin and actor bridge. Exact native foreground baselines and billboard transforms remain unresolved.

The earlier complete non-Geyser runtime run passes 45 gameplay cases, 15 entity actions, three resource-pack checks, both cache checks, and plain/Fabulously Optimized joins on both Java routes. After the bounded marker and opacity changes, final artifacts also pass all 15 entity actions, three gameplay guards and same-world reconnect. Artifact hashes stay fixed during each run, and owned displays and services are cleaned up. Recorded scenes, credentials and licensed native assets remain private.

## Complete skin delivery through ViaProxy

The renderer now receives full skin records through the core `viabedrock:player_skin` channel.
Direct translation and ViaProxy use the same receiver and existing rendering path.
Core retains configuration updates, so the previous direct-only skin queue and tick hook are removed.

The receiver captures its Minecraft connection during Fabric's play initialization event.
This avoids relying on `Context.player()`, which reads the current client player in the installed Fabric API.
Assembly and installation run on the Minecraft thread.
Disconnected or replaced connections cannot install queued updates into a new session.
The existing appearance cleanup also releases incomplete transfers.
Core marks updates for the local Bedrock actor.
The receiver installs these records under the actual Java avatar UUID, including ViaProxy sessions with different login identities.

Local live skin requests keep their optimistic preview and native acknowledgment behavior.
Received authoritative updates use the shared transport.
Server actor graphs, attachables, emote resources, and outbound account selection through ViaProxy remain separate requirements.

The final authored playback fixture passes direct and ViaProxy transport and rendering checks.
Each route installs all five geometry updates without rejection and matches hashes of the complete skin records.
The audit observes three local native avatar submissions directly and one through ViaProxy.
The fixture includes classic and persona records larger than five MiB, with cape and animation images and complete metadata.
These observations verify incoming delivery and local-avatar ownership within the fixture.
They do not establish visible native parity, remote-player lifecycle behavior, or the remaining actor and appearance resource paths.

## Accepted actor resource snapshots

Native renderers now read the core actor archive from an accepted server resource pack. They reconstruct ordered core definitions with server provenance and cache the result for the current resource lifetime. Resource reload and disconnect clear the snapshot. No synthetic connection or frontend Store login is required.

Player costumes and equipment can use this snapshot through ViaProxy. Custom entity rendering now receives core-evaluated model state through the negotiated actor channel. Missing proxy actor properties, events, emote state, and account synchronization remain separate gaps.


## Shared custom actor receiver

The native renderer now receives complete model selections through `viabedrock:custom_entity`.
Direct connections and ViaProxy use the same receiver and accepted actor resources.
The direct-only custom entity mixin is removed.
Core retains the ordinary Java fallback when the client does not advertise support.

The receiver captures its Minecraft connection during play initialization.
Installation runs on the Minecraft thread and checks both connection identity and the cleanup generation.
Replaced connections and cleared lifetimes cannot install queued updates into the next session.
Empty selections, removal, independent actors, replacement, and immutable scale updates have semantic tests.
Player properties, actor events, emote state, and outbound account synchronization remain incomplete.


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


## Local skin identity before player creation

Transported local skins now use the current play listener's Java profile UUID.
That profile exists before the local player entity.
A ViaProxy connection can use a Java UUID different from the original Bedrock account UUID.
The previous entity-based fallback installed early fragments under the Bedrock UUID.
Connection checks still reject updates from a different or disconnected source.
The runtime replay results are recorded in the coverage ledger.


## Share accepted native archive decoding

Actor and effect consumers use one decoded archive for each resource generation.
The cache selects the highest accepted server resource and ignores local files with the same identifier.
It replaces cached layers when the resource manager changes.
Explicit reload and disconnect cleanup also invalidate it.
Decode errors remain cached until invalidation, then the loader retries.

Four targeted tests cover shared consumers, provenance, empty layers, accepted-source selection, resource-manager replacement, invalidation, and retry after reload.
The complete add-on suite passes with the matching core and converter dependencies.
No Store sign-in or direct Bedrock connection is necessary to read accepted assets.
New converted packs require this matching add-on.

The macOS 26.3 report uses Iris 1.11.7 and Complementary Reimagined r5.9.3.
The pinned shader replay reproduces missing Bedrock pipeline overrides and corrupt actor geometry.
Iris extends entity buffers from 36 to 56 bytes per vertex.
Without an override, the original GPU pipeline still reads the 36-byte layout.

Native actor pipelines now advertise their corresponding entity shader family through an optional Iris mixin.
Iris selects its world, hand, and shadow programs and creates a GPU pipeline with the extended format.
Fullbright materials use the eyes shader family.
The registry preserves each native pipeline and its render state when shaders are disabled or Iris is absent.
Particle and cloud patches register their corresponding shader families through the same registry.

Shader regression validation on Minecraft 26.3 with Iris 1.11.7, Sodium 0.9.2,
and Complementary Reimagined r5.9.3 passes on the private Linux/NVIDIA lab.
Before the change, the complete CubeCraft replay reports missing pipeline
overrides and large corrupt triangles obscure the scene.
After the change, transport and rendering verification both pass with no
missing Bedrock overrides. All 216 geometry skins install unchanged,
and the renderer submits the local player, remote players, and 31 custom actor types.
The first-person arm is visible. Images and scene data stay private.
This validates the shared failure path; a macOS/Apple GPU retest remains outstanding.

The full dependency build passes. The add-on executes 478 tests successfully
and skips 114 private-fixture cases; all nine pipeline mapping and state tests execute.
Core executes 664 tests successfully with 19 private-fixture skips; CubeConverter passes all 16 tests.
The reproduction tooling also passes its 19 focused tests and TypeScript checking.

The matching replay without Iris installed also passes transport and rendering verification.
It preserves all 216 recorded geometry skins, local and remote native submissions, and all 31 custom actor types.
Its screenshot retains the ordinary first-person arm and drawable actor geometry.

## Native name row advance

Multiline names now advance ten pixels per row, independently of Java's nine-pixel font line height.
The final row anchor, component styles, blank rows, and Unicode codepoints stay intact.
Single-line labels keep their original component and offset.

The original name-record routine in Bedrock 1.26.51.1, build 51061372, stores ten pixels plus authored extra spacing.
Executable controls cover extra spacing of zero, minus two, one half, and three pixels.
The ordinary and sneaking name producer supplies zero extra spacing and unit scale.
Twelve name-layout and anchor tests pass.
Absolute foreground glyph origin and direct native visible comparisons remain unverified.
The bridge still requires an accepted Bedrock context; ordinary Java labels retain their existing path.

## Native name foreground layout

The target foreground consumer establishes a pixel scale of `recordScale * 1.6F * 0.016666668F` in native float order.
It centers each row at the negative integer half-width, starts at the foreground origin, and advances ten pixels per retained row.
Multiline names lift the world origin by `(rows - 1) * 0.125`.
The original LF splitter drops zero-length segments while retaining whitespace-only rows.
The add-on reproduces this layout and preserves translated segment styles.
This replaces the earlier final-row anchor inferred from the name-record builder alone.
Ordinary Java connections retain their original name renderer.

Original Bedrock 1.26.51.1, protocol 2193 instructions pass twelve supplied transform cases, 210 row/width cases, eight splitter cases, and the empty foreground exit.
Fourteen targeted tests cover names and anchors.
Pinned Java 26.3 has one scale call with `(+,-,+)` signs and returns before any submission when attachment is null.
The hook keeps that Java basis and changes its magnitude.
Native uses a different position-facing or quaternion basis before its `(-,-,+)` scale.
Complete handedness equivalence, font raster origin and metrics, backgrounds, stripped formatting-only rows, and native GPU comparisons remain unverified.

Final artifacts pass nine real name-submission controls and twenty captured submissions on each direct and ViaProxy route, with plain graphics and Iris. Full native camera, font raster, and GPU comparisons remain required.\nThe [combined runtime record](../../../docs/bedrock-coverage.md#final-combined-runtime-verification) retains the complete scene gates and remaining requirements.\n

## Authored polygons with Sodium

Native cubes now compile their current polygons through a dedicated subclass.
Sodium 0.9.2 caches constructor geometry and box UVs before native code replaces the polygons.
That cache loses per-face UVs and reduces Character Creator mesh placeholders to zero-sized cuboids.
The regression checks emitted positions, UVs, normals, light, overlay and color under reflected transforms.

Ordinary unlit actors use the Iris entity cutout family with full-bright packed light.
They no longer select Complementary's glowing-eyes program.
Culling and the original native pipelines stay intact.
Native inverse-alpha emissive masks still lack full shader-pack parity.
The reported Apple GPU needs a fresh visual comparison.

Licensed material documents now provide the native inheritance graph.
The renderer removes built-in GPU layout, sampler and skinning metadata that Java replaces with its own buffers and CPU poses.
Server material validation remains strict.

## Follow-up: player heads and shader emission

Installed native skin textures now come from `PlayerInfo.getSkin`, which also supplies tab and Chat Heads consumers. Offline Bedrock connections display tab heads when native skins exist. Connection authentication remains unchanged.

With Iris active, native emissive masks use an opaque lit pass and additive emitted radiance. The target 1.26.51.1 shader weights lighting by source alpha and emission by inverse alpha. Preserve per-pixel weights, UV transforms, culling and texture upload lifetimes. The exhaustive mask regression checks all alpha/channel pairs and several lighting levels.

The private CubeCraft replay reaches playable spawn with Complementary Reimagined r5.9.3 and passes the rendering audit. Native skins install unchanged and active models resolve. This does not establish parity for every shader pack, Chat Heads configuration or reported glowing entity.

## Inline player sprites

Native appearances now participate in `PlayerSkinRenderCache` lookups. Retained glyph suppliers see later Bedrock skin updates, while unknown identities keep the Java fallback. Weak profile keys bound the additional cache. This also covers the direct cache lookup used by skull rendering.

[Chat Heads 1.3.2-26.3](https://github.com/dzwdz/chat_heads/blob/1.3.2-26.3/common/src/main/java/dzwdz/chat_heads/ComponentProcessor.java) constructs resolved `PlayerSprite` text objects. Java 26.3 renders those glyphs through this cache instead of the player-info skin hook. The bridge uses that vanilla API and does not alter Java UUIDs or depend on the third-party mod. Custom geometry still uses Java's flat head sprite UV convention in chat.


## Legacy skin heads

Java 26.3 player glyphs sample face and hat UVs against a square atlas.
A native 64×32 skin therefore samples the wrong rows when supplied directly.
The head cache now uses a separate square texture for legacy skins.
The original image remains intact for native body geometry.
Skin replacement and disconnect release the additional texture with the appearance.

Pixel checks cover face and hat regions at three resolutions, transparent padding, and unchanged square or custom atlas images.
A private client fixture installs a synthetic 64×32 skin through the native appearance path.
All 49 retained glyph lookups match their current head texture, including the synthetic skin.
The fixture reaches playable spawn and loads its pack.
Its general world-rendering audit does not apply because it injects an extra skin and omits world chunks.
The reported skin still needs a visual comparison with stock Chat Heads.
The add-on build passes 681 tests, with 120 skipped.

## Resolved actor draws

A 1,024-entry LRU reuses resolved draws for unchanged immutable actor snapshots.
The cache also checks accepted resource identity and Nether lighting.
Resource changes, world replacement and missing actors invalidate retained state.
Animation poses, UV expressions, scale and yaw retain their frame evaluation.
Tests cover repeated frames, snapshot replacement, resource changes, failed resolver retries and eviction.
These tests establish operation reuse. They do not establish live frame-time improvement.

## Combined stack validation

The full dependency build passes for CubeConverter, ViaBedrock, the Bedrock add-on and ViaProxy.
Core passes 1,159 tests and the add-on passes 786 tests.
JUnit skips 30 core tests and 120 add-on tests.
CubeConverter passes 18 tests and ViaProxy passes four tests.
The standalone cache patch passes 45 tests and both Checkstyle tasks.
TypeScript checking and patch whitespace checks also pass.
These results establish stack replay and test behavior. Live server frame-time profiling remains separate.

## JSON null skin geometry

The Bedrock 1.26.51.1 Enchanted capture contains 273 skin records. Three standard 64×64
skins supply `null` followed by a newline as their geometry data; the other 270 supply objects.
Check the parsed JSON value before requesting an object. A JSON null value retains the
existing standard-skin path without a parse warning. Supplied model selection remains unchanged.

The replay inspector also excludes JSON null with ordinary JSON whitespace from its supplied
geometry count. Malformed or non-null payloads still require geometry installation, so they
continue to fail verification when installation fails. Eight additional self-test inputs cover
that distinction through actual skin-packet encoding and decoding.

All 38 add-on patches replay. The dependency build passes 18 converter tests, 1,300 core tests,
and 825 add-on tests, with 152 optional skips and no failures. Replay self-tests and all 263
tooling tests pass. The fresh 130-second client replay installs all 273 skins and 270 supplied
geometry records, with no geometry-parse warnings. Transport verification passes, and all
seven owned Java/display processes stop normally. Rendering verification still fails on
unresolved mappings. These checks do not establish native visual parity.


## Native alpha references with Iris

Ordinary native actors and supplied player bodies now retain their 0.5 alpha reference when Iris replaces the shader.
The target Bedrock 1.26.51.1/protocol 2193 Actor AlphaTest shader keeps texture alpha strictly above 0.5.
The native shader evidence is recorded above.
Iris 1.11.7 for Minecraft 26.3 uses 0.1 for its entity cutout family.

Keep the reference on the compiled GPU pipeline, since Iris shares programs between native and Java draws.
A binding scope supplies the reference during Iris shader setup and restores its previous value even after failure.
The generated fallback shader also restores its original uniform on each Java bind.
Native emissive passes retain their existing material behavior.

Validation:

- All 38 add-on patches replay successfully.
- Converter, core, and add-on builds pass 2,352 tests, with 152 optional tests skipped and no failures or errors.
- Scope tests cover nested native and Java binds, exceptions, and separate threads.
- A complete 40-second replay without Iris passes transport checks and has no mixin failures.
- A Galaxite replay with Iris 1.11.7 and Complementary Reimagined r5.9.3 reaches gameplay without mixin failures.
- GL uniform readbacks verify native 0.5 and Java 0.1 within two shared ExtendedShader programs.
- A private shader pack that omits entity programs exercises Iris fallback shaders.
- GL readbacks verify native 0.5 and Java 0.1 within one shared FallbackShader program.

Those Iris validation runs report unresolved marker geometry and a missing camera item texture.
The CubeConverter patch addresses the marker declaration with omitted fields.
Those Iris runs also reject the font atlas in `galaxite:gem_bag_particle`; the owning particle patch addresses that separate loader failure.
The fallback diagnostic also intentionally differs from the locked shader pack and fails that profile check.
This change carries the alpha reference through Iris.
It does not establish parity for shader-pack comparison overrides, post-shader alpha, source-texture sampling, or native image output.
Raw recordings, the diagnostic shader pack, observer code, and uniform logs remain private.

## Iris source alpha coverage

Ordinary native materials now test their original texture alpha before the shader pack changes color or texture coordinates.
The native branch keeps alpha strictly above 0.5 and skips Iris's generated output-alpha comparison.
Java draws retain that comparison, including the pack's chosen function.
Shader-pack authored discard statements remain intact.

The vertex transform retains the original UV attribute in a separate varying.
A separate external sampler reads texture unit zero, even when the pack replaces `gtexture`.
Each program caches its uniform locations.
Each bind selects native or Java behavior after Iris updates its own uniforms and samplers.
The synthesized fallback shaders use the same coverage contract.
Iris and its GLSL parser remain optional compile-only dependencies and are absent from the packaged add-on and published POM.

Validation:

- All 38 add-on patches replay. All four builds pass 2,499 tests, with 212 optional skips and no failures or errors.
- A Mesa EGL test checks 1,600 rendered pixels across ordinary and fallback transforms, all eight comparison functions, and shared-program binds.
- Source alpha includes exact 0.5 and values on either side. Output alpha varies independently of coverage.
- A different texture on the shader-pack sampler and altered pack UVs cannot change native coverage.
- Four private negative controls restore the pack comparison, sample the pack texture, use altered UVs, or retain native mode on Java draws.
  Each control fails the pixel regression. The unchanged implementation passes.
- A fresh CubeCraft recording completes gameplay with Iris 1.11.7 and Complementary Reimagined r5.9.3.
- Actual ExtendedShader GL readbacks verify native selection, reference 0.5, and source unit zero.
  Four programs also serve Java draws, where native selection resets correctly.
- A private final-pass-only shader pack exercises FallbackShader programs.
  GL readbacks verify the same native state and Java reset in shared fallback programs.
  This diagnostic intentionally differs from the locked production shader profile.
- A complete plain-client replay without Iris passes transport checks with no class-loading or mixin failures.
- All seven client sessions stop normally. Birth-identity checks find no remaining owned Java or display processes.
- Offline validation passes all 271 tooling tests, static checks, and patch metadata checks.

The fresh Galaxite join disconnects with End of stream before its capture completes.
The CubeCraft replay passes transport checks but still reports unresolved mappings.
These results do not establish complete native image parity.
Geometry and tessellation programs retain the earlier reference bridge until their UV transport is implemented and verified.
Emissive material integration and arbitrary shader-pack output behavior remain separate work.
Raw recordings, shader diagnostics, observer code, and pixel-control logs remain private.


## Opaque actor materials

Native actor materials now retain their opaque or alpha-tested coverage through every supported appearance consumer.
The same material value reaches custom actors, skins, persona layers, server costumes, equipped items, and native portraits.
Opaque world draws write color and depth even when a source texel has zero alpha.
Ordinary cutouts keep their strict alpha cutoff, while emissive cutouts discard only empty RGBA texels.
Iris receives a solid lit pass for opaque emissive materials and a cutout lit pass for alpha-tested emissive materials.
Unknown shader effects and unsupported material states keep the existing fallback.

The pinned Bedrock 1.26.51.1 container contains `BaseColor`, `AlphaTest`, `Emissive`, and `AlphaTestEmissive` passes.
Its SHA-256 is `403efcc7777c9712176f6715f861c873e31d8e45d0b73b8e320bd29754789058`.
Unmodified Lazurite 0.10 reads the complete version-26 container through its closing magic and end of file.
All four sampled vertex shaders are byte-identical.
The opaque fragments retain the same lighting, overlay, inverse-alpha emission, and fog arithmetic without either discard operation.

A private control executes the original fragment IR with supplied texture, interpolation, constant-buffer, and output boundaries.
The actual production fragment shader matches all 672 controls through Mesa EGL at tolerance `1e-6`.
The comparison includes RGBA output, discard behavior, and retained depth for zero-alpha opaque texels.
It does not establish native vertex production, pass selection, GPU state, or complete rasterization parity.

The full build passes 3,056 tests with 152 optional skips and no failures or errors.
All 19 focused material, pipeline, bundled-definition, and GPU tests pass without skips.
The distributable add-on matches all 1,207 compiled client classes.
Both consumers retain matching core and converter classes and assets.

Fresh BDS 1.26.51.1 controls exercise six material selections on both routes, with and without Iris.
Both views retain the selected native graphs, textures, coverage flags, depth writes, and derived Iris passes.
Real server removal retires the six observed UUID snapshots in each session.
All eight final screenshots receive visual review and show the expected material surfaces and cutout holes.
The plain and shader scenes use different actor carriers to isolate material behavior from entity-specific pack effects.
Installed add-on and proxy hashes match the final build.
These checks do not establish complete renderer-cache cleanup or native graphical parity.

Complete Iris emissive overlay order and framebuffer alpha remain unverified.
An initial chicken-carrier control appeared black on both routes with Iris 1.11.7 and Complementary Reimagined r5.9.3.
Generated shader output retains a chicken depth offset in the body program and omits it from the eye program.
The paired-stage change below addresses this captured case.
Other shader-pack transforms and complete emission parity remain separate requirements.
Native graphical comparison remains unavailable because the installed native launcher cannot decode its licensing response.
The original inventory, locator, intermittent item-use, emote, skin, interaction, and other gameplay requirements remain open.


### Shared geometry stages for Iris emission

Native emission now uses the complete geometry-producing stages of its depth-writing body.
The selected Iris body supplies vertex, geometry, tessellation-control, and tessellation-evaluation sources and attribute decisions.
The selected emission program supplies the fragment source and framebuffer directives.
Both selections remain part of the cache key, including Iris context variants.
Body lightmap and overlay bindings remain available to the paired program.

Previously, the two passes selected separate entity and eye vertex programs.
Complementary Reimagined r5.9.3 offsets chicken clip depth only in its entity program.
The lit surface therefore covered its own additive emission.
Generated Iris 1.11.7 programs retain that difference.
With paired geometry stages, the same native chicken control emits in both captured views.
Prototype exports are byte-identical. Final exports can differ in formatting and unused helper functions.
GPU controls compare their resulting clip positions with explicit supplied inputs.

Compilation context restores the previous pipeline after nested lookups and exceptions.
Each Iris world pipeline owns its paired program cache and registers those programs with its normal shader lifetime.
Missing program sources retain the existing eye path.
Incompatible stage interfaces produce one diagnostic per selection and retain that path.
No shader-pack name, entity identifier, fixed depth offset, or forced depth comparison selects this behavior.

The twelve native body/emission mappings and nested compilation recovery have targeted tests.
Ordinary program lookups, GUI portraits, and shadow selection keep their existing paths.
Complete hand behavior, stage interfaces in other packs, emissive overlay order, and framebuffer alpha remain unverified.
Native graphical comparison still depends on the unavailable launcher licensing response.


**Verification:** Current reports cover 3,210 tests, with 3,058 passes, 152 optional skips, and no failures or errors.
All 21 focused material, pipeline, bundled-definition, and fragment GPU tests pass without skips.
The full prototype build passes for all four projects. The final cache refinement also passes a direct prepared-source Gradle build.
All 1,212 compiled client classes match the distributable add-on.
Core and converter classes and assets match both embedded consumers.
All 38 add-on patches replay, with all 988 source and resource file hashes unchanged after the final export cleanup.

Fresh direct and ViaProxy BDS sessions render the original chicken material correctly in both views and after a real Iris reload.
Actual Iris overrides retain the paired GL program objects and their exact native body-pipeline associations.
Each reload deletes two owned GL programs before the new world pipeline rebuilds its cache.
Server removal retires the six observed actor UUID snapshots on each route.
A separate ViaProxy session without the Iris mod preserves all six material controls and retires their snapshots.
All eight final screenshots receive visual review, and installed artifacts match the final build.

Mesa transform feedback executes 108 controls from actual generated shaders and links the paired vertex and fragment stages.
Twelve baseline controls include six expected chicken depth mismatches of `0.000075` in clip Z.
The other 96 controls match body and emission clip positions at tolerance `1e-7` across both routes and reload phases.
Inputs supply matrices, vertex attributes, entity identifiers, color alpha, and the overlay texture.
These controls establish the tested geometry correction, not complete native rasterization or arbitrary shader-pack parity.


## Complete custom-actor sampler snapshots, October 26, 2026

The client accepts ordered texture bindings on the negotiated version-two custom-actor channel.
Its existing receiver still accepts version-one snapshots from older core versions.
Connection ownership and disconnect cleanup continue to use the shared render store.
Secondary-only texture changes replace the received snapshot and its next rendered cache entry.
Ordinary materials use slot zero in one geometry draw.

The [shared runtime notes](0008-share-native-actor-and-resource-runtime.pr.md#complete-controller-sampler-transport-october-26-2026) record codec tests, both live routes, build identity, and remaining limits.
Masked material blending remains a separate renderer integration.


## Opaque input for shader-pack hand branches, October 26, 2026

Native opaque materials now supply coverage alpha one to primary texture reads before shader-pack shading.
The per-bind uniform resets for cutout and ordinary Java draws, including shared programs.
The transform follows supported sampler helpers while unrelated images retain their original alpha.
Raw primary sampling and composed material alpha remain available for native coverage tests.
Emission preprocessing retains its original source-alpha weighting.

The initial Complementary Reimagined r5.9.3 capture shows an invisible first-person item with correct models and bindings.
Its hand program checks sampled alpha independently of the engine alpha test.
This fix uses the native opaque material, without shader-pack names or program-specific source replacement.
A real-driver regression reproduces the previous failure through a forwarded sampler and an authored alpha branch.
Both transformed and fallback programs pass after the fix, across opaque, cutout, and Java binds.

Fresh installed results and build totals appear in the [coverage record](../../../docs/bedrock-coverage.md#per-bone-material-rendering-october-26-2026).
Other shader-pack branches, native graphical parity, and inventory avatars remain separate verification work.

## Actor material depth state, October 26, 2026

Actor materials now retain inherited depth comparison, test, and write controls.
The previous reader rejected every comparison except `LessEqual` and rejected both depth-control states.
That rejection could retire the complete native actor presentation and restore a vanilla model.

Ordered comparisons reverse for Java's reversed depth buffer.
Equality, inequality, and always-pass comparisons retain their meaning.
An always-passing test can write depth; disabled testing cannot.
Removing an inherited disable state restores the declared comparison and write behavior.
Material identity retains these values across bone grouping, caches, world draws, and GUI consumers.
Uncommon fixed-state variants compile on demand; the ordinary preload set stays small.

The Iris emission pass now inherits the body's comparison and keeps depth writes disabled.
A depth-writing body with a strict comparison cannot repeat that predicate after changing the buffer.
That pairing remains unsupported until emission can retain the original depth outcome.
Read-only strict emission and repeatable comparisons retain a valid paired state.
This limit remains part of the full rendering integration work.

The pinned 1.26.51.1 resource library contains 95 depth-related material declarations.
Entity materials declare `Equal` and `LessEqual`; other renderer materials declare `Always` and depth-disable controls.
Their source hashes and inheritance remain recorded privately.
These are versioned declarations, not executed native backend state creation.
The [creator material reference](https://learn.microsoft.com/en-us/minecraft/creator/documents/material-files?view=minecraft-bedrock-stable) describes renderer states and material inheritance.

A surfaceless GPU control uses the production fragment shader and selected pipeline through Java's actual OpenGL comparison mapper.
Its 168 cases cover near, equal, and far fragments, discarded and covered texels, and independent test/write settings.
Existing native fragment comparisons and GUI coverage controls still pass.
Wrong reversed comparison, ignored write state, ignored test state, and a default emission comparison each fail assertions.
The restored focused suites pass without errors.

Fresh plain and Iris/EntityCulling live controls pass with the final packaged artifact.
The world actor owner adds the selective occlusion integration that these predicates require.
The [coverage record](../../../docs/bedrock-coverage.md#actor-material-depth-and-occlusion-october-26-2026) records the causal isolation, final build totals, and remaining limits.

## Native player layer lifetime, October 26, 2026

Native appearances now reuse ordinary avatar layer roots within one renderer resource generation.
Their native body models, poses, and persona surfaces remain separate.
The original Minecraft model set keeps its ordinary behavior.
Resource reload creates a fresh native context and both layer caches.

The full modpack exposed repeated armor, cape, ear, and effect baking through native player construction.
A production JFR capture includes `AvatarRenderer` and `ArmorModelSet.bake` in those constructor stacks.
These samples establish the allocation path, without an exact allocation rate.
EMF 3.3.8 counts those root transformations and eventually declines its custom model substitution.
Its shoulder-parrot hook also creates a separate root outside Minecraft's model set.
The first cache prototype retained 18 ordinary roots, but its shoulder counter still increased.

The optional EMF integration now retains those transformed roots during native renderer construction.
A separate map avoids recursive cache updates from hooks inside `bakeLayer`.
The [Java 25 scoped-value API](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ScopedValue.html)
restores nested bindings and exception paths automatically.
Calls outside native construction retain EMF's normal behavior.
EMF remains optional and is not bundled.

Four lifecycle tests cover 128 avatar constructors, both arm widths, ordinary baking, replacement generations, nested construction, and exception restoration.
Removing ordinary root reuse fails the original two tests.
Removing external root reuse fails the two new scoped-cache tests.
Both restored suites pass.

The complete build passes 2,961 tests and skips 315 optional tests, with no failures or errors.
Both core Checkstyle tasks pass.
Packaged client classes, embedded dependencies, shader resources, and all four source snapshots match the tested outputs.
The tested development add-on has SHA-256 `37b5823147da4232fc62219524af5e8b37593155930ddba1cd17eabb9a6f1f8c`.

A direct WildMC control uses Minecraft 26.3, EMF 3.3.8, EntityCulling, Iris 1.11.7, and Complementary Reimagined r5.9.3.
The previous control records 14 model-limit diagnostics; the corrected full-modpack run records none.
All 19 EMF counters remain one per generation, including the separate shoulder root.
The retained native renderer count increases from 26 to 30 before reload, then from 44 to 54 afterward.
Every observed appearance retains a distinct body root.
All 18 ordinary roots and 19 transformed roots change on reload and remain stable during the following observation window.

The read-only probe initially used an obsolete screen API.
A corrected probe continued in the same client process, without a restart.
All six final screenshots received visual review.
Nearby actors obscure the front-facing local player, so these images do not establish skin composition or native graphical parity.
This change fixes layer lifetime and EMF admission, without a claim about all skin allocation costs or arbitrary EMF versions.
Packs, interactions, skins, emotes, and the original five-area goal remain unfinished.

The same artifact also passes startup and resource replacement in the plain client without EMF or Iris.
That absence control retains 18 ordinary roots and distinct native bodies as its renderer count increases from 23 to 34.
Its actual window is 854 by 480; the full modpack control uses 1920 by 1013.
The plain control uses model readiness because its profile lacks the modpack's reload-log marker.
All six plain screenshots received visual review, including the reload overlay and the final unobscured world.
Both final clients close normally, retire their owned processes, and restore the prepared profiles.
