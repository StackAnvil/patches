Install supplied player skin geometry even when its identifier uses the standard humanoid alias. Queue skin updates for their exact source connection while Java is still configuring, then install them in arrival order when the play listener becomes available. Disconnected sources cannot leak updates into another connection.

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

Player costumes and equipment can use this snapshot through ViaProxy. Custom entity rendering can read its resources, but its actor state still requires a direct connection. Missing proxy actor properties, events, emote state, and account synchronization remain separate gaps.
