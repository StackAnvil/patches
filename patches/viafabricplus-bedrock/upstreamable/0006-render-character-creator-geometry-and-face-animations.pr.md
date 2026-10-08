## Persona surfaces and timing

Render separately bound face, 32x32 body, and 128x128 body animation surfaces. Normalize strip-sized geometry descriptions and preserve bottom-origin mesh UVs. Menu previews and world models share the geometry parser and texture lifecycle.

Bedrock 1.26.51.1, protocol 2193, provides the versioned evidence. Its licensed `persona.render_controllers.json` selects looping frames with `floor(query.life_time * 7)` modulo the frame count. Use seven frames per second. World surfaces receive actor render-state age. Preview lifetime uses elapsed monotonic time. Renderer lookup does not advance animations.

The matching blink controller starts with open eyes. Each open-state evaluation samples its 3-40 second threshold and 0-0.2 second return delay. Apply one state per update, retain outgoing-state variable values, and avoid duplicate samples at the same lifetime. Reset on a rewound lifetime. Only faces use the blink expression.

Targeted tests cover native strip geometry, UV orientation, frame boundaries, cyclic phase, controller transitions, resampling, repeated passes, and reset. The full replayed stack builds. All 116 fixture-enabled add-on tests pass with no skips.

A rebuilt Java client receives a private native skin fixture with separate arm and face bindings. Its world dispatcher selects all sixteen arm frames from render-state age. Every frame matches the texture pixels after upload. Blink uploads, duplicate-pass sampling, the monotonic preview clock, renderer lookup, and resource release also pass. These checks establish the Java runtime path. The world blink comparison below covers the saved default face. Remote receive and multiplayer phase comparisons remain pending.

Private package assets and research binaries remain outside the repository.

Sources: [Persona render controllers](https://github.com/Mojang/bedrock-samples/blob/main/resource_pack/render_controllers/persona.render_controllers.json) and [blink controller](https://github.com/Mojang/bedrock-samples/blob/main/resource_pack/animation_controllers/persona.animation_controllers.json).

Visible animated persona surfaces now use the shared native alpha-test shader. The target's `player_animated` material inherits `entity_alphatest` and adds `USE_UV_ANIM`. Existing CPU frame extraction already produces the selected surface texture, so this draw uses identity UVs. Each surface caches its two immutable dimension materials. Spectator and invisible surfaces retain their existing fallback.

## Saved persona face in a protocol 2193 world

A clean production Java client joins a separate native Bedrock 1.26.51.1 server through NetherNet HTTP. Its saved persona installs local geometry and one animated face surface. The open-eye frame contains both green iris pixels, and its full strip matches the locally saved strip exactly.

An initial screenshot inspection suggested that the eyes were missing. Pixel measurements correct that observation. At the 64 front-face texel centers, rendered RGB matches the uploaded frame within one channel value after fitting three lighting factors. Both iris texels render as RGB 29, 81, 37 from source RGB 35, 99, 45. The fitting checks texture content and placement; it does not validate native lighting.

Temporary private probes replace the layer's material and texture, then restore both. A solid texture verifies the face layer's draw. Four front-face quadrants verify its UV orientation. The generic material leaves the original appearance unchanged. These probes modify only runtime rendering and perform no account appearance writes. Native world lighting, pose, animation phase, and additional facial combinations still need comparison. Probes, images, account data, and server files remain private.

The saved Hive scene includes five animated persona skins. Its skin resource patches supply geometry and animation bindings without material overrides. Numeric pipeline tests cover culling, depth, blending and dimension selection. Private geometry, animation and four-height cape fixtures remain unchanged.

## Native and Java world blink comparison

Both clients join the private Bedrock 1.26.51.1 world through NetherNet. The server reports each player spawned. The clients join separately with the same account. Their front views use the saved default persona face.

A 77-second native recording contains 18 complete eye closures. Their measured durations range from approximately 17 to 217 milliseconds. A separate 35-second observation reads the native world actor context after debugger detachment. Its lifetime advances at 1.00027 seconds per second, without rewinds.

The production Java renderer provides 1,247 observations across 45 seconds with the world visible throughout. Its actor lifetime advances at 1.00005 seconds per second. A temporary frame limit of 35 produces a median actual rate of 28 frames per second. The probe restores the original limit of 120 afterward.

All ten Java eye closures match transitions in the renderer trace. Video and trace durations differ by less than 11 milliseconds. The visible closures range from approximately 25 to 183 milliseconds. Analysis uses recorded frame timestamps and decodes frames without duplication. Iris classification uses channel ratios because world lighting changes during the recording.

These observations support the tested world clock and visible blink behavior. They do not establish identical random sequences, multiplayer phase, native lighting, remote receive behavior, or other facial combinations. Recordings, actor addresses, account files, and probes remain private.

## First-person animated skin surfaces

The matching licensed Bedrock 1.26.51.1 package supplies first-person controllers for all three animated surface types.
The final player and persona definitions select their bound geometry and texture, with arm and sleeve visibility.
Animated surfaces use `Material.animated`, which inherits the native alpha-test material.

Java 26.3's hand renderer calls `AvatarRenderer.renderRightHand` or `renderLeftHand` directly.
These methods do not submit world render layers.
The Bedrock renderer now submits each surface's corresponding arm after the body arm, using its existing frame texture.
Body and surface hands share the native alpha-test material family.
Each surface keeps its authored bind pivot and resets its arm pose before submission.
Sleeve visibility follows the hand call.

A targeted test covers independent bind pivots, rotation and scale reset, both hands, nested cube geometry, and sleeve visibility.
Native first-person graph playback, camera and item transforms, walking bob, and charged left-arm visibility remain incomplete.
The Java hand call still determines which arms are submitted.
Private package assets, probes, and screenshots remain outside the repository.

The full build passes all four targets. The final add-on build passes 485 tests with no failures and 96 optional fixture skips.
The new hand regression runs without a private fixture and passes.
The north-star PR check and bundle generation also pass.

A rebuilt Java 26.3 client joins Bedrock 1.26.51.1 through ViaProxy on the private display.
A temporary probe installs a transparent body with a separate two-frame red/green arm strip.

Both production hand methods submit body and surface geometry into their ordered opaque phases.
Repeated draws keep the world layer list stable and preserve authored arm pivots.
Eight captured frames per hand show both uploaded strip frames on the visible arm.
The left-hand check sets the private actor's main arm directly; preferred-hand synchronization remains unverified.

An opaque blue base texture does not obscure the overlapping animated surface in six additional captures.
The probe restores the arm preference, and the test client stops afterward.
These checks establish the tested surface draw path, not native first-person motion or complete skin parity.

## Preserve mesh polygons with Sodium

Character Creator meshes use the shared native polygon compiler.
Sodium's cached constructor cuboid does not contain the later mesh positions or UVs.
The owning renderer regression verifies actual vertex submission through reflected transforms.
This preserves authored mesh data without reversing its winding or changing skin bytes.
