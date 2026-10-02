Install supplied player skin geometry even when its identifier uses the standard humanoid alias. Queue skin updates for their exact source connection while Java is still configuring, then install them in arrival order when the play listener becomes available. Disconnected sources cannot leak updates into another connection.

Native actor rendering reports active missing geometry and textures. Inactive server variants do not produce rendering failures. Visibility uses the distance between the actor and the camera. Minecraft 26.3 supplies absolute camera coordinates, so the previous check hid nearby custom actors in lobbies far from the world origin.

Validation: queue identity, order and closed-connection regressions pass; the full addon suite has no failures. Recorded Geyser and CubeCraft scenes exercise the extended configuration phase created by custom block packs. The private CubeCraft replay checks all 240 skin updates and 37 advertised actor types, then requires native model resolution and actual player and custom actor submissions. Its terrain and packet payloads remain unchanged. No server assets are included.

Custom actor submissions use the outline color from the entity render state. In Java 26.3, the final argument of the seven-argument `submitModel` overload selects the outline color. The overload supplies the white tint separately. The previous `-1` argument therefore forced white outlines on every custom actor. The mapped 26.3 bytecode confirms that a nonzero outline color adds an outline pass. A saved official Bedrock 1.26.51.1 Hive scene has no such outlines, while the translated scene shows them. This change preserves outlines that the Java entity render state requests.

Select actor materials per bone using ordered wildcard overrides. Each draw keeps the full bone hierarchy and includes only its selected cubes. This preserves parent transforms and animation across mixed materials.

For `entity_alphatest` and `entity_alphatest_one_sided`, use the native alpha cutoff and culling rule. Only texture alpha strictly above 0.5 survives. An unlit controller bypasses block and sky light but keeps native directional shading in world space. Send its floating light multiplier through `DynamicTransforms`, so values above one remain valid. Bound the render type cache for changing Molang values.

The licensed Bedrock 1.26.51.1 Windows executable, CPU function `141eb6120`, and installed ENTITY DXIL establish these rules. The executable SHA-256 is `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`; target protocol is 2193. Native unlit light RGBA starts at white. Default overlay alpha is zero. The vertex shade is `0.45 - 0.1 * nx² + 0.1 * nz² + 0.275 * (ny + 1)`. Evidence and native assets remain private.

Validation: focused tests cover mixed material overrides and retained ancestor pivots and rotation. The actual vertex and fragment shaders pass 192 Mesa EGL numerical scenarios. These cover cardinal and rotated normals, alpha at the cutoff, fractional and above-one multipliers, and lightmap bypass. The owning feature build passes.

Scope: unsupported materials retain the existing fallback. Ordinary lit directional shading retains the Java path while the native light alpha sign remains unverified. This change does not claim full actor shader parity or render controller support through ViaProxy.

Resolve effective actor material inheritance before selecting the verified alpha-test shader. Higher packs replace complete definitions, including their parent. Apply define and state replacement, addition, and removal. Missing and cyclic parents use the existing fallback.

CubeCraft's saved banner uses `cc_lobby_banner:entity` with `ALPHA_TEST` and a controller that sets `ignore_lighting`. This selects the same one-sided alpha-test family as the target's built-in material. A private probe of the actual saved material documents resolves the banner with culling enabled. The renderer therefore keeps its native lightmap bypass and alpha cutoff.

The installed Bedrock 1.26.51.1 `entity.material` SHA-256 is `fb971460c91e30fa2071f703db699934671e92b5b62617056b68a57eb7cf3eef`. The saved server material SHA-256 is `bfdabff5a1aaae7d314966fa9ba71a244f4d6d9947300777ec1d4e3cbdcf7b61`. Assets and raw probes stay private.

Five focused tests cover inheritance, culling, whole-definition pack replacement, define removal, unsupported shader fields, invalid definitions, parent cycles, and independent pack caches. Together with the existing material tests, all seven cases pass. Unknown flags, states, shader overrides, and sampler changes retain the fallback. Additive effects and actor UV animation retain the fallback.

Retain server actor scale in immutable render snapshots and scale the mesh around its native origin. The saved protocol 2193 CubeCraft scene sends FLOAT metadata index 38 as 1.7 for eleven lobby banners and 5 for its hanging cube. The target Bedrock 1.26.51.1 reference renders those larger meshes. Core controller evaluation binds the documented `query.model_scale` and reports scale-only changes, so both initial values and sparse updates reach this renderer. Client `scripts.scale` evaluation remains separate.

Numeric pose tests check origin stability and transformed vertices for 1, 1.7, 5, zero and negative scale. Snapshot tests check independent updates and copied model lists. Custom actor visibility already bypasses frustum geometry bounds. Converted display entities retain their zero width and height defaults. This change does not alter either route's distance policy.

A material document with a non-object `materials` field now leaves valid neighboring documents available. A semantic test covers null, array, boolean and string fields beside an inherited alpha-test material. Nine focused renderer and material tests pass. Raw captures and native assets remain private.

The target's `entity_emissive_alpha` family now uses its native inverse-alpha light blend. This restores colored, alpha-zero texels in CubeCraft's hanging cube. Only an entirely empty RGBA texel is discarded. Overlay applies before the blend, and controller multipliers affect only the lit contribution. Material inheritance selects both culling variants without accepting unrelated effects.

Bedrock 1.26.51.1 `Entity.material.bin` SHA-256 is `403efcc7777c9712176f6715f861c873e31d8e45d0b73b8e320bd29754789058`. Unmodified Lazurite 0.11 parses the exact `AlphaTestEmissive` pass at byte 1368400. Its sampled SM65 fragment SHA-256 is `3cd762aa42a07cb9d8557e0a4e890c3b2cdf72109673668914ce20a0795ddbdf`. DXIL establishes the discard, overlay, inverse-alpha blend, alpha output, and fog order. The vertex shader is identical to ordinary `AlphaTest`.

Validation: material tests cover inherited emission, culling, removal, replacement, and rejection of unrelated emissive effects. The actual shaders pass 672 Mesa EGL numerical scenarios at tolerance 1e-6. These include alpha-zero colored pixels, empty texels, fractional alpha, overlay, normals, and light multipliers. Ordinary lit diffuse keeps the existing Java calculation. CubeCraft's galaxy UV animation and mask remain outside this shader change. Raw assets and shader exports remain private.
