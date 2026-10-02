## Persona surfaces and timing

Render separately bound face, 32x32 body, and 128x128 body animation surfaces. Normalize strip-sized geometry descriptions and preserve bottom-origin mesh UVs. Menu previews and world models share the geometry parser and texture lifecycle.

Bedrock 1.26.51.1, protocol 2193, provides the versioned evidence. Its licensed `persona.render_controllers.json` selects looping frames with `floor(query.life_time * 7)` modulo the frame count. Use seven frames per second. World surfaces receive actor render-state age. Preview lifetime uses elapsed monotonic time. Renderer lookup does not advance animations.

The matching blink controller starts with open eyes. Each open-state evaluation samples its 3-40 second threshold and 0-0.2 second return delay. Apply one state per update, retain outgoing-state variable values, and avoid duplicate samples at the same lifetime. Reset on a rewound lifetime. Only faces use the blink expression.

Targeted tests cover native strip geometry, UV orientation, frame boundaries, cyclic phase, controller transitions, resampling, repeated passes, and reset. The full replayed stack builds. All 116 fixture-enabled add-on tests pass with no skips.

A rebuilt Java client receives a private native skin fixture with separate arm and face bindings. Its world dispatcher selects all sixteen arm frames from render-state age. Every frame matches the texture pixels after upload. Blink uploads, duplicate-pass sampling, the monotonic preview clock, renderer lookup, and resource release also pass. These checks establish the Java runtime path. A native multiplayer video comparison remains pending.

Private package assets and research binaries remain outside the repository.

Sources: [Persona render controllers](https://github.com/Mojang/bedrock-samples/blob/main/resource_pack/render_controllers/persona.render_controllers.json) and [blink controller](https://github.com/Mojang/bedrock-samples/blob/main/resource_pack/animation_controllers/persona.animation_controllers.json).

Visible animated persona surfaces now use the shared native alpha-test shader. The target's `player_animated` material inherits `entity_alphatest` and adds `USE_UV_ANIM`. Existing CPU frame extraction already produces the selected surface texture, so this draw uses identity UVs. Each surface caches its two immutable dimension materials. Spectator and invisible surfaces retain their existing fallback.

The saved Hive scene includes five animated persona skins. Its skin resource patches supply geometry and animation bindings without material overrides. Numeric pipeline tests cover culling, depth, blending and dimension selection. Private geometry, animation and four-height cape fixtures remain unchanged.
